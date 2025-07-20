"""
Parent-specific API routes for managing parents and family relationships.
"""

from typing import Annotated, List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.middleware import create_program_filter_dependency
from app.features.authentication.services.user_service import user_service
from app.features.authentication.models.user import User
from app.features.authentication.schemas.user_enhanced import (
    UserResponse,
    UserCreate,
    UserUpdate,
    UserListResponse,
    UserSearchParams,
    ParentStatsResponse,
    FamilyStructureResponse
)
from app.features.common.models.enums import UserRole


router = APIRouter()

# Create program filter dependency with authentication integration
get_program_filter = create_program_filter_dependency(get_current_active_user)


@router.get("/", response_model=UserListResponse)
async def list_parents(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: str = Depends(get_program_filter),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    has_children: Optional[bool] = Query(None, description="Filter parents with/without children"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """
    List parents with optional search and pagination.
    
    Returns users with parent role, with family relationship counts.
    """
    try:
        # Build search parameters for parents
        search_params = {
            "roles": [UserRole.PARENT.value],
            "search": search,
            "is_active": is_active,
        }
        
        # Remove None values
        search_params = {k: v for k, v in search_params.items() if v is not None}
        
        parents, total_count = user_service.search_users(
            db=db,
            search_params=search_params,
            program_context=program_context,
            page=page,
            per_page=per_page
        )
        
        # Enhance parent data with children count
        enhanced_parents = []
        for parent in parents:
            parent_dict = {
                "id": str(parent.id),
                "username": parent.username,
                "email": parent.email,
                "full_name": parent.full_name,
                "roles": parent.roles,
                "primary_role": parent.primary_role,
                "is_active": parent.is_active,
                "phone": parent.phone,
                "date_of_birth": parent.date_of_birth.isoformat() if parent.date_of_birth else None,
                "profile_photo_url": parent.profile_photo_url,
                "last_login": parent.last_login.isoformat() if parent.last_login else None,
                "created_at": parent.created_at.isoformat(),
                "updated_at": parent.updated_at.isoformat(),
            }
            
            # Get children count
            family_structure = user_service.get_family_structure(db, parent.id, program_context)
            parent_dict["children_count"] = len(family_structure["children"])
            parent_dict["has_children"] = len(family_structure["children"]) > 0
            
            enhanced_parents.append(parent_dict)
        
        # Apply has_children filter if specified
        if has_children is not None:
            enhanced_parents = [
                p for p in enhanced_parents 
                if p["has_children"] == has_children
            ]
            total_count = len(enhanced_parents)
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return UserListResponse(
            items=enhanced_parents,
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
            detail=f"Error listing parents: {str(e)}"
        )


@router.get("/stats", response_model=ParentStatsResponse)
async def get_parent_stats(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: str = Depends(get_program_filter)
):
    """
    Get parent statistics.
    
    Returns counts, family relationships, and other statistical information.
    """
    try:
        # Get all parents in program context
        parents = user_service.get_users_by_role(
            db=db,
            role=UserRole.PARENT.value,
            program_context=program_context,
            include_family=True
        )
        
        total_parents = len(parents)
        active_parents = len([p for p in parents if p.is_active])
        inactive_parents = total_parents - active_parents
        
        # Calculate family statistics
        parents_with_children = 0
        total_children = 0
        parents_with_multiple_children = 0
        
        for parent in parents:
            family_structure = user_service.get_family_structure(db, parent.id, program_context)
            children_count = len(family_structure["children"])
            
            if children_count > 0:
                parents_with_children += 1
                total_children += children_count
                
            if children_count > 1:
                parents_with_multiple_children += 1
        
        # Average children per parent
        avg_children_per_parent = total_children / parents_with_children if parents_with_children > 0 else 0
        
        return ParentStatsResponse(
            total_parents=total_parents,
            active_parents=active_parents,
            inactive_parents=inactive_parents,
            parents_with_children=parents_with_children,
            parents_without_children=total_parents - parents_with_children,
            total_children_connections=total_children,
            parents_with_multiple_children=parents_with_multiple_children,
            average_children_per_parent=round(avg_children_per_parent, 2)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting parent stats: {str(e)}"
        )


@router.get("/{parent_id}", response_model=UserResponse)
async def get_parent(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Get a specific parent by ID with full profile information.
    """
    try:
        parent = db.query(User).filter(User.id == parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        # Verify user has parent role
        if UserRole.PARENT.value not in parent.roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a parent"
            )
        
        return UserResponse(
            id=str(parent.id),
            username=parent.username,
            email=parent.email,
            full_name=parent.full_name,
            roles=parent.roles,
            primary_role=parent.primary_role,
            is_active=parent.is_active,
            phone=parent.phone,
            date_of_birth=parent.date_of_birth.isoformat() if parent.date_of_birth else None,
            profile_photo_url=parent.profile_photo_url,
            last_login=parent.last_login.isoformat() if parent.last_login else None,
            created_at=parent.created_at.isoformat(),
            updated_at=parent.updated_at.isoformat(),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting parent: {str(e)}"
        )


@router.get("/{parent_id}/family", response_model=FamilyStructureResponse)
async def get_parent_family_structure(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: str = Depends(get_program_filter)
):
    """
    Get complete family structure for a parent.
    
    Returns children, relationships, and family connections.
    """
    try:
        family_structure = user_service.get_family_structure(
            db=db,
            user_id=parent_id,
            program_context=program_context
        )
        
        return FamilyStructureResponse(
            user=UserResponse(
                id=str(family_structure["user"].id),
                username=family_structure["user"].username,
                email=family_structure["user"].email,
                full_name=family_structure["user"].full_name,
                roles=family_structure["user"].roles,
                primary_role=family_structure["user"].primary_role,
                is_active=family_structure["user"].is_active,
                phone=family_structure["user"].phone,
                date_of_birth=family_structure["user"].date_of_birth.isoformat() if family_structure["user"].date_of_birth else None,
                profile_photo_url=family_structure["user"].profile_photo_url,
                last_login=family_structure["user"].last_login.isoformat() if family_structure["user"].last_login else None,
                created_at=family_structure["user"].created_at.isoformat(),
                updated_at=family_structure["user"].updated_at.isoformat(),
            ),
            children=family_structure["children"],
            parents=family_structure["parents"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting family structure: {str(e)}"
        )


@router.put("/{parent_id}", response_model=UserResponse)
async def update_parent(
    parent_id: str,
    user_data: UserUpdate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Update parent information.
    
    Allows updating parent profile and contact information.
    """
    try:
        parent = db.query(User).filter(User.id == parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        # Verify user has parent role
        if UserRole.PARENT.value not in parent.roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a parent"
            )
        
        # Update user fields
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(parent, field):
                setattr(parent, field, value)
        
        parent.updated_by = current_user["id"]
        db.commit()
        db.refresh(parent)
        
        return UserResponse(
            id=str(parent.id),
            username=parent.username,
            email=parent.email,
            full_name=parent.full_name,
            roles=parent.roles,
            primary_role=parent.primary_role,
            is_active=parent.is_active,
            phone=parent.phone,
            date_of_birth=parent.date_of_birth.isoformat() if parent.date_of_birth else None,
            profile_photo_url=parent.profile_photo_url,
            last_login=parent.last_login.isoformat() if parent.last_login else None,
            created_at=parent.created_at.isoformat(),
            updated_at=parent.updated_at.isoformat(),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating parent: {str(e)}"
        )


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(
    user_data: UserCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Create a new parent user.
    
    Creates a user with parent role and appropriate permissions.
    """
    try:
        # Check if username or email already exists
        existing_user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )
        
        # Create user with parent role
        user_dict = user_data.model_dump()
        password = user_dict.pop("password")
        
        # Hash password
        from app.features.authentication.services.auth_service import AuthService
        auth_service = AuthService()
        user_dict["password_hash"] = auth_service.get_password_hash(password)
        
        # Create user with parent role
        parent = user_service.create_user_with_roles(
            db=db,
            user_data=user_dict,
            roles=[UserRole.PARENT.value],
            created_by=current_user["id"]
        )
        
        return UserResponse(
            id=str(parent.id),
            username=parent.username,
            email=parent.email,
            full_name=parent.full_name,
            roles=parent.roles,
            primary_role=parent.primary_role,
            is_active=parent.is_active,
            phone=parent.phone,
            date_of_birth=parent.date_of_birth.isoformat() if parent.date_of_birth else None,
            profile_photo_url=parent.profile_photo_url,
            last_login=parent.last_login.isoformat() if parent.last_login else None,
            created_at=parent.created_at.isoformat(),
            updated_at=parent.updated_at.isoformat(),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating parent: {str(e)}"
        )