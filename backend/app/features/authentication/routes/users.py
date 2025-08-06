"""
Enhanced user management API routes with family relationships and multi-role support.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.authentication.models.user import User
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
    UserStatsResponse,
)
from app.features.authentication.services.user_service import user_service
from app.features.common.models.database import get_db
from app.middleware.program_context import get_program_context


router = APIRouter()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)]
):
    """
    Create a new user with specified roles.
    
    Permissions:
    - Super Admin: Can create users with any role
    - Program Admin: Can create student/parent users within their assigned programs
    - Program Coordinator: Can create student/parent users within their assigned programs
    """
    # Check if user is active (already handled by get_current_active_user dependency)
    
    # Get current user roles
    current_user_roles = current_user.roles
    is_super_admin = current_user.has_role("super_admin")
    is_program_admin = current_user.has_role("program_admin")
    is_program_coordinator = "program_coordinator" in current_user_roles
    
    # Check basic permission to create users
    if not (is_super_admin or is_program_admin or is_program_coordinator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create users"
        )
    
    # Validate role restrictions based on current user's permissions
    requested_roles = user_data.roles
    admin_level_roles = {"super_admin", "program_admin", "program_coordinator", "tutor"}
    user_level_roles = {"student", "parent"}
    
    # Super admins can create any user
    if is_super_admin:
        # No restrictions for super admin
        pass
    elif is_program_admin or is_program_coordinator:
        # Program admins and coordinators can only create student/parent users
        if any(role in admin_level_roles for role in requested_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Program admins cannot create admin-level users (super_admin, program_admin, program_coordinator, tutor)"
            )
        
        # Ensure only student/parent roles are requested
        if not all(role in user_level_roles for role in requested_roles):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program admins can only create users with student or parent roles"
            )
        
        # Require program context for non-super admin users
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required for creating users"
            )
    
    try:
        # Create the user
        user = user_service.create_user_with_roles(
            db=db,
            user_data=user_data.model_dump(exclude={"roles"}),
            roles=user_data.roles,
            created_by=str(current_user.id)
        )
        
        # Auto-assign program for non-super admin creators
        if not is_super_admin and program_context:
            from app.features.authentication.models.user_program_assignment import UserProgramAssignment
            
            # Create program assignment
            assignment = UserProgramAssignment(
                user_id=user.id,
                program_id=program_context,
                is_default=True,
                assigned_by=str(current_user.id)
            )
            db.add(assignment)
            db.commit()
            db.refresh(assignment)
        
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
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)]
):
    """
    Create a parent profile with associated child (student).
    
    This creates both parent and child user accounts and links them.
    Optionally enrolls the child in a course.
    
    Permissions:
    - Super Admin: Can create in any program
    - Program Admin: Can create within their assigned programs
    - Program Coordinator: Can create within their assigned programs
    """
    # Check permissions
    current_user_roles = current_user.roles
    is_super_admin = current_user.has_role("super_admin")
    is_program_admin = current_user.has_role("program_admin")
    is_program_coordinator = current_user.has_role("program_coordinator")
    
    if not (is_super_admin or is_program_admin or is_program_coordinator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create student-parent profiles"
        )
    
    # Require program context for non-super admin users
    if not is_super_admin and not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for creating student-parent profiles"
        )
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
            created_by=str(current_user.id)
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
            created_by=str(current_user.id)
        )
        
        # Auto-assign program for non-super admin creators
        effective_program_id = program_context or profile_data.program_id
        if not is_super_admin and effective_program_id:
            from app.features.authentication.models.user_program_assignment import UserProgramAssignment
            
            # Create program assignments for both parent and child
            parent_assignment = UserProgramAssignment(
                user_id=parent_user.id,
                program_id=effective_program_id,
                is_default=True,
                assigned_by=str(current_user.id)
            )
            child_assignment = UserProgramAssignment(
                user_id=child_user.id,
                program_id=effective_program_id,
                is_default=True,
                assigned_by=str(current_user.id)
            )
            db.add(parent_assignment)
            db.add(child_assignment)
            
        # Create parent-child relationship
        relationship = user_service.create_parent_child_relationship(
            db=db,
            parent_user_id=parent_user.id,
            child_user_id=child_user.id,
            relationship_type=profile_data.relationship_type,
            program_id=effective_program_id,
            is_primary=True,
            created_by=str(current_user.id)
        )
        
        # Enroll child in course if specified
        if profile_data.course_id:
            enrollment = user_service.enroll_user_in_course(
                db=db,
                user_id=child_user.id,
                course_id=profile_data.course_id,
                program_id=profile_data.program_id,
                created_by=str(current_user.id)
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


@router.get("", response_model=UserListResponse)
async def list_users(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    roles: Optional[List[str]] = Query(None, description="Filter by roles"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    bypass_program_filter: Optional[bool] = Query(None, description="Bypass program filtering (super admin only)")
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
        # Super admin can bypass program filtering when bypass_program_filter=true
        if bypass_program_filter and current_user.has_role("super_admin"):
            context_filter = None  # No filtering for super admin bypass
        elif not current_user.is_super_admin() and program_context:
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


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)],
    bypass_program_filter: Optional[bool] = Query(None, description="Bypass program filtering (super admin only)")
):
    """
    Get user statistics.
    
    Returns counts, role distribution, and other statistical information.
    Respects program context for non-super-admin users.
    """
    try:
        # Apply program context filtering for non-super-admin users  
        context_filter = None
        # Super admin can bypass program filtering when bypass_program_filter=true
        if bypass_program_filter and current_user.has_role("super_admin"):
            context_filter = None  # No filtering for super admin bypass
        elif not current_user.is_super_admin() and program_context:
            context_filter = program_context
            
        stats = user_service.get_user_stats(db, context_filter)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user statistics: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Get a specific user by ID with family relationships.
    
    Returns detailed user information including family structure.
    """
    user = user_service.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/{user_id}/family", response_model=FamilyStructureResponse)
async def get_user_family_structure(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_context)]
):
    """
    Get complete family structure for a user.
    
    Returns user with all parent-child relationships.
    """
    try:
        family_structure = user_service.get_family_structure(db, user_id, program_context)
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
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Add a role to an existing user.
    
    Permissions:
    - Super Admin: Can add any role
    - Program Admin: Can add student/parent roles only
    """
    # Get current user roles
    current_user_roles = current_user.roles
    is_super_admin = current_user.has_role("super_admin")
    is_program_admin = current_user.has_role("program_admin")
    
    # Check admin permissions
    if not (is_super_admin or is_program_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can modify user roles"
        )
    
    # Validate role restrictions for program admins
    if not is_super_admin:
        admin_level_roles = {"super_admin", "program_admin", "program_coordinator", "tutor"}
        if role in admin_level_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Program admins cannot add admin-level roles"
            )
    
    try:
        user = user_service.add_role_to_user(
            db=db,
            user_id=user_id,
            role=role,
            updated_by=str(current_user.id)
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
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Remove a role from an existing user.
    
    Permissions:
    - Super Admin: Can remove any role
    - Program Admin: Can remove student/parent roles only
    """
    # Get current user roles
    current_user_roles = current_user.roles
    is_super_admin = current_user.has_role("super_admin")
    is_program_admin = current_user.has_role("program_admin")
    
    # Check admin permissions
    if not (is_super_admin or is_program_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can modify user roles"
        )
    
    # Validate role restrictions for program admins
    if not is_super_admin:
        admin_level_roles = {"super_admin", "program_admin", "program_coordinator", "tutor"}
        if role in admin_level_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Program admins cannot remove admin-level roles"
            )
    
    try:
        user = user_service.remove_role_from_user(
            db=db,
            user_id=user_id,
            role=role,
            updated_by=str(current_user.id)
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
    current_user: Annotated[User, Depends(get_current_active_user)],
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
            created_by=str(current_user.id)
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
    current_user: Annotated[User, Depends(get_current_active_user)],
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
            created_by=str(current_user.id)
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
    current_user: Annotated[User, Depends(get_current_active_user)],
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