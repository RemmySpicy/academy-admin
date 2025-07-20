"""
Enhanced user management API routes with family relationships and multi-role support.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.authentication.schemas.user_enhanced import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    UserSearchParams,
    UserRelationshipCreate,
    UserRelationshipResponse,
    CourseEnrollmentCreate,
    CourseEnrollmentResponse,
    StudentParentCreate,
    FamilyStructureResponse,
)
from app.features.authentication.services.user_service import user_service
from app.features.common.models.database import get_db
from app.middleware.program_context import get_program_context


router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Create a new user with specified roles.
    
    Requires authentication and appropriate permissions.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        user = user_service.create_user_with_roles(
            db=db,
            user_data=user_data.model_dump(exclude={"roles"}),
            roles=user_data.roles,
            created_by=current_user["id"]
        )
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@router.post("/student-parent", response_model=FamilyStructureResponse)
async def create_student_parent_profile(
    profile_data: StudentParentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Create a parent profile with associated child (student).
    
    This creates both parent and child user accounts and links them.
    Optionally enrolls the child in a course.
    """
    try:
        # Create parent user
        parent_user = user_service.create_user_with_roles(
            db=db,
            user_data={
                "username": profile_data.parent_username,
                "email": profile_data.parent_email,
                "password": profile_data.parent_password,
                "full_name": profile_data.parent_full_name,
                "phone": profile_data.parent_phone,
                "date_of_birth": profile_data.parent_date_of_birth,
            },
            roles=["parent"],
            created_by=current_user["id"]
        )
        
        # Create child user
        child_user = user_service.create_user_with_roles(
            db=db,
            user_data={
                "username": profile_data.child_username,
                "email": profile_data.child_email,
                "password": profile_data.child_password,
                "full_name": profile_data.child_full_name,
                "phone": profile_data.child_phone,
                "date_of_birth": profile_data.child_date_of_birth,
            },
            roles=["student"],
            created_by=current_user["id"]
        )
        
        # Create parent-child relationship
        relationship = user_service.create_parent_child_relationship(
            db=db,
            parent_user_id=parent_user.id,
            child_user_id=child_user.id,
            relationship_type=profile_data.relationship_type,
            is_primary=True,
            created_by=current_user["id"]
        )
        
        # Enroll child in course if specified
        if profile_data.course_id:
            enrollment = user_service.enroll_user_in_course(
                db=db,
                user_id=child_user.id,
                course_id=profile_data.course_id,
                program_id=profile_data.program_id,
                created_by=current_user["id"]
            )
        
        # Return family structure
        family_structure = user_service.get_family_structure(db, parent_user.id)
        return family_structure
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating student-parent profile: {str(e)}"
        )


@router.get("/", response_model=UserListResponse)
async def list_users(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    roles: Optional[List[str]] = Query(None, description="Filter by roles"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """
    List users with optional search and pagination.
    
    Supports filtering by various criteria and sorting.
    Respects program context for non-super-admin users.
    """
    try:
        # Build search parameters
        search_params = {}
        if search:
            search_params["search"] = search
        if roles:
            search_params["roles"] = roles
        if is_active is not None:
            search_params["is_active"] = is_active
        if sort_by:
            search_params["sort_by"] = sort_by
            search_params["sort_order"] = sort_order
        
        # Apply program context filtering for non-super-admin users
        context_filter = None
        if not current_user.get("is_super_admin") and program_context:
            context_filter = program_context
        
        users, total_count = user_service.search_users(
            db=db,
            search_params=search_params,
            program_context=context_filter,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return UserListResponse(
            items=users,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing users: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Get a specific user by ID with family relationships.
    
    Returns detailed user information including family structure.
    """
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/{user_id}/family", response_model=FamilyStructureResponse)
async def get_user_family_structure(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Get complete family structure for a user.
    
    Returns user with all parent-child relationships.
    """
    try:
        family_structure = user_service.get_family_structure(db, user_id)
        return family_structure
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving family structure: {str(e)}"
        )


@router.post("/{user_id}/roles/{role}")
async def add_role_to_user(
    user_id: str,
    role: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Add a role to an existing user.
    
    Requires admin permissions.
    """
    # Check admin permissions
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can modify user roles"
        )
    
    try:
        user = user_service.add_role_to_user(
            db=db,
            user_id=user_id,
            role=role,
            updated_by=current_user["id"]
        )
        return {"message": f"Role '{role}' added to user", "user": user}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{user_id}/roles/{role}")
async def remove_role_from_user(
    user_id: str,
    role: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Remove a role from an existing user.
    
    Requires admin permissions.
    """
    # Check admin permissions
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can modify user roles"
        )
    
    try:
        user = user_service.remove_role_from_user(
            db=db,
            user_id=user_id,
            role=role,
            updated_by=current_user["id"]
        )
        return {"message": f"Role '{role}' removed from user", "user": user}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/relationships", response_model=UserRelationshipResponse)
async def create_user_relationship(
    relationship_data: UserRelationshipCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Create a parent-child relationship between users.
    
    Links two existing users with a family relationship.
    """
    try:
        relationship = user_service.create_parent_child_relationship(
            db=db,
            parent_user_id=relationship_data.parent_user_id,
            child_user_id=relationship_data.child_user_id,
            relationship_type=relationship_data.relationship_type,
            is_primary=relationship_data.is_primary,
            is_emergency_contact=relationship_data.emergency_contact,
            created_by=current_user["id"]
        )
        return relationship
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating relationship: {str(e)}"
        )


@router.post("/enrollments", response_model=CourseEnrollmentResponse)
async def enroll_user_in_course(
    enrollment_data: CourseEnrollmentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Enroll a user in a course.
    
    Creates student profile if needed and enrolls in specified course.
    """
    try:
        enrollment = user_service.enroll_user_in_course(
            db=db,
            user_id=enrollment_data.user_id,
            course_id=enrollment_data.course_id,
            program_id=enrollment_data.program_id,
            enrollment_data=enrollment_data.model_dump(exclude={"user_id", "course_id", "program_id"}),
            created_by=current_user["id"]
        )
        return enrollment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enrolling user in course: {str(e)}"
        )


@router.get("/roles/{role}", response_model=List[UserResponse])
async def get_users_by_role(
    role: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)],
    include_family: bool = Query(False, description="Include family relationships")
):
    """
    Get all users with a specific role.
    
    Optionally includes family relationship data.
    Respects program context filtering.
    """
    try:
        # Apply program context filtering for non-super-admin users
        context_filter = None
        if not current_user.get("is_super_admin") and program_context:
            context_filter = program_context
            
        users = user_service.get_users_by_role(
            db=db,
            role=role,
            program_context=context_filter,
            include_family=include_family
        )
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving users by role: {str(e)}"
        )