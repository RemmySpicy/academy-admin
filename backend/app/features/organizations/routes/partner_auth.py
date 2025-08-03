"""
API routes for partner admin authentication and management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_user
from app.features.authentication.models.user import User
from app.features.organizations.services.partner_admin_service import PartnerAdminService
from app.features.organizations.schemas.partner_admin_schemas import (
    PartnerAdminCreate,
    PartnerAdminResponse,
    PartnerAdminLogin,
    PartnerAdminLoginResponse,
    PartnerPermissionsResponse,
    PartnerStudentsResponse,
    PartnerStatsResponse,
    PartnerAdminUpdate,
    PartnerAdminListResponse,
    ApiResponse
)
from app.features.common.models.enums import UserRole


router = APIRouter(prefix="/partner-auth", tags=["partner-authentication"])
security = HTTPBearer()


def get_partner_admin_service(db: Session = Depends(get_db)) -> PartnerAdminService:
    """Get partner admin service instance."""
    return PartnerAdminService(db)


def require_super_admin(current_user: User = Depends(get_current_user)):
    """Require super admin access for partner admin management."""
    if not current_user.is_super_admin():
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Super admin access required."
        )
    return current_user


def get_partner_admin_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get partner admin user from JWT token."""
    token = credentials.credentials
    current_user = auth_service.get_current_user(db, token)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not current_user.is_program_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a partner admin user"
        )
    
    return current_user


@router.post("/login", response_model=PartnerAdminLoginResponse)
async def partner_admin_login(
    login_data: PartnerAdminLogin,
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Authenticate a partner admin user."""
    
    try:
        auth_result = service.authenticate_partner_admin(
            username=login_data.username,
            password=login_data.password
        )
        
        if not auth_result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or not a partner admin",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create JWT token
        access_token = auth_service.create_access_token(
            data={"sub": auth_result["user"].username}
        )
        
        response_data = PartnerAdminLoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=PartnerAdminResponse.model_validate(auth_result["user"]),
            organizations=auth_result["organizations"]
        )
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=ApiResponse)
async def create_partner_admin(
    admin_data: PartnerAdminCreate,
    current_user: User = Depends(require_super_admin),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Create a new partner admin user (Super admin only)."""
    
    try:
        partner_admin = service.create_partner_admin(
            organization_id=admin_data.organization_id,
            admin_data=admin_data.model_dump(exclude={"organization_id", "programs"}),
            programs=admin_data.programs,
            created_by=current_user.id
        )
        
        return ApiResponse(
            success=True,
            data=PartnerAdminResponse.model_validate(partner_admin),
            message="Partner admin created successfully"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/permissions", response_model=ApiResponse)
async def get_partner_permissions(
    organization_id: str,
    program_id: str,
    current_user: User = Depends(get_partner_admin_from_token),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Get permissions for current partner admin in specific organization/program."""
    
    permissions = service.get_partner_admin_permissions(
        user_id=current_user.id,
        organization_id=organization_id,
        program_id=program_id
    )
    
    if not permissions.get("has_access"):
        raise HTTPException(
            status_code=403,
            detail="No access to this organization/program"
        )
    
    return ApiResponse(
        success=True,
        data=PartnerPermissionsResponse.model_validate(permissions)
    )


@router.get("/students", response_model=ApiResponse)
async def get_partner_students(
    organization_id: str,
    program_id: str,
    include_inactive: bool = False,
    current_user: User = Depends(get_partner_admin_from_token),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Get all students sponsored by the partner organization."""
    
    students = service.get_partner_students(
        user_id=current_user.id,
        organization_id=organization_id,
        program_id=program_id,
        include_inactive=include_inactive
    )
    
    return ApiResponse(
        success=True,
        data=students
    )


@router.get("/stats", response_model=ApiResponse)
async def get_partner_stats(
    organization_id: str,
    program_id: str,
    current_user: User = Depends(get_partner_admin_from_token),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Get statistics for partner organization."""
    
    stats = service.get_partner_organization_stats(
        user_id=current_user.id,
        organization_id=organization_id,
        program_id=program_id
    )
    
    if not stats:
        raise HTTPException(
            status_code=403,
            detail="No access to this organization/program"
        )
    
    return ApiResponse(
        success=True,
        data=PartnerStatsResponse.model_validate(stats)
    )


@router.get("/profile", response_model=ApiResponse)
async def get_partner_admin_profile(
    current_user: User = Depends(get_partner_admin_from_token)
):
    """Get current partner admin profile."""
    
    return ApiResponse(
        success=True,
        data=PartnerAdminResponse.model_validate(current_user)
    )


@router.put("/profile", response_model=ApiResponse)
async def update_partner_admin_profile(
    update_data: PartnerAdminUpdate,
    current_user: User = Depends(get_partner_admin_from_token),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Update current partner admin profile."""
    
    try:
        updated_user = service.update_partner_admin(
            user_id=current_user.id,
            update_data=update_data.model_dump(exclude_unset=True),
            updated_by=current_user.id
        )
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="Partner admin not found")
        
        return ApiResponse(
            success=True,
            data=PartnerAdminResponse.model_validate(updated_user),
            message="Profile updated successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Super admin routes for managing partner admins
@router.get("/all", response_model=ApiResponse)
async def get_all_partner_admins(
    organization_id: Optional[str] = None,
    program_id: Optional[str] = None,
    active_only: bool = True,
    current_user: User = Depends(require_super_admin),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Get all partner admins (Super admin only)."""
    
    admins = service.get_all_partner_admins(
        organization_id=organization_id,
        program_id=program_id,
        active_only=active_only
    )
    
    return ApiResponse(
        success=True,
        data=admins
    )


@router.put("/{admin_id}", response_model=ApiResponse)
async def update_partner_admin(
    admin_id: str,
    update_data: PartnerAdminUpdate,
    current_user: User = Depends(require_super_admin),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Update a partner admin (Super admin only)."""
    
    try:
        updated_user = service.update_partner_admin(
            user_id=admin_id,
            update_data=update_data.model_dump(exclude_unset=True),
            updated_by=current_user.id
        )
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="Partner admin not found")
        
        return ApiResponse(
            success=True,
            data=PartnerAdminResponse.model_validate(updated_user),
            message="Partner admin updated successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{admin_id}", response_model=ApiResponse)
async def deactivate_partner_admin(
    admin_id: str,
    current_user: User = Depends(require_super_admin),
    service: PartnerAdminService = Depends(get_partner_admin_service)
):
    """Deactivate a partner admin (Super admin only)."""
    
    success = service.deactivate_partner_admin(
        user_id=admin_id,
        updated_by=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Partner admin not found")
    
    return ApiResponse(
        success=True,
        message="Partner admin deactivated successfully"
    )