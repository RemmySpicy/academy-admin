"""
API routes for organization management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_user
from app.features.authentication.models.user import User
from app.features.organizations.services import OrganizationService
from app.features.organizations.schemas import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationDetailResponse,
    OrganizationListResponse,
    OrganizationMembershipCreate,
    OrganizationMembershipUpdate,
    OrganizationMembershipResponse,
    OrganizationSearchResult,
    OrganizationStats,
    UserSearchResult,
    OrganizationApiResponse,
    OrganizationListApiResponse,
    OrganizationMembershipApiResponse,
    ApiResponse
)
from app.features.common.models.enums import OrganizationStatus, UserRole


router = APIRouter(prefix="/organizations", tags=["organizations"])


def get_organization_service(db: Session = Depends(get_db)) -> OrganizationService:
    """Get organization service instance."""
    return OrganizationService(db)


def require_admin_access(current_user: User = Depends(get_current_user)):
    """Require admin access for organization management."""
    if not (current_user.is_super_admin() or current_user.is_program_admin()):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Admin access required."
        )
    return current_user


@router.get("/", response_model=OrganizationListApiResponse)
async def get_organizations(
    status: Optional[OrganizationStatus] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Get list of organizations with optional filtering."""
    
    try:
        offset = (page - 1) * per_page
        organizations = service.get_organizations(
            status=status,
            search=search,
            limit=per_page,
            offset=offset
        )
        
        total = service.count()
        
        # Convert to response models
        org_responses = [OrganizationResponse.model_validate(org) for org in organizations]
        
        list_response = OrganizationListResponse(
            items=org_responses,
            total=total,
            page=page,
            per_page=per_page,
            has_next=offset + per_page < total,
            has_prev=page > 1
        )
        
        return OrganizationListApiResponse(
            success=True,
            data=list_response
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=OrganizationApiResponse)
async def create_organization(
    organization_data: OrganizationCreate,
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Create a new organization."""
    
    try:
        organization = service.create_organization(
            name=organization_data.name,
            description=organization_data.description,
            contact_name=organization_data.contact_name,
            contact_email=organization_data.contact_email,
            contact_phone=organization_data.contact_phone,
            address_data=organization_data.address_data.model_dump() if organization_data.address_data else None,
            website=organization_data.website,
            logo_url=organization_data.logo_url,
            payment_overrides=organization_data.payment_overrides,
            program_permissions=organization_data.program_permissions,
            notes=organization_data.notes,
            created_by=current_user.id
        )
        
        return OrganizationApiResponse(
            success=True,
            data=OrganizationResponse.model_validate(organization),
            message="Organization created successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{organization_id}", response_model=OrganizationApiResponse)
async def get_organization(
    organization_id: str,
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Get organization by ID."""
    
    organization = service.get_by_id(organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return OrganizationApiResponse(
        success=True,
        data=OrganizationResponse.model_validate(organization)
    )


@router.get("/{organization_id}/details", response_model=ApiResponse)
async def get_organization_details(
    organization_id: str,
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Get detailed organization information with members and stats."""
    
    organization = service.get_organization_with_members(organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Get organization stats
    stats = service.get_organization_stats(organization_id)
    
    # Convert memberships
    memberships = [
        OrganizationMembershipResponse.model_validate(membership)
        for membership in organization.get_active_memberships()
    ]
    
    detail_response = OrganizationDetailResponse(
        **OrganizationResponse.model_validate(organization).model_dump(),
        memberships=memberships,
        stats=OrganizationStats.model_validate(stats)
    )
    
    return ApiResponse(
        success=True,
        data=detail_response
    )


@router.put("/{organization_id}", response_model=OrganizationApiResponse)
async def update_organization(
    organization_id: str,
    update_data: OrganizationUpdate,
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Update an organization."""
    
    # Prepare update data
    update_fields = update_data.model_dump(exclude_unset=True)
    if "address_data" in update_fields and update_fields["address_data"]:
        update_fields["address_data"] = update_fields["address_data"]
    
    update_fields["updated_by"] = current_user.id
    
    organization = service.update_organization(organization_id, **update_fields)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return OrganizationApiResponse(
        success=True,
        data=OrganizationResponse.model_validate(organization),
        message="Organization updated successfully"
    )


@router.delete("/{organization_id}", response_model=ApiResponse)
async def deactivate_organization(
    organization_id: str,
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Deactivate an organization and all its memberships."""
    
    organization = service.deactivate_organization(
        organization_id,
        updated_by=current_user.id
    )
    
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return ApiResponse(
        success=True,
        message="Organization deactivated successfully"
    )


# Organization membership endpoints
@router.post("/{organization_id}/members", response_model=OrganizationMembershipApiResponse)
async def add_organization_member(
    organization_id: str,
    membership_data: OrganizationMembershipCreate,
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Add a member to an organization."""
    
    try:
        membership = service.add_member(
            organization_id=organization_id,
            user_id=membership_data.user_id,
            program_id=membership_data.program_id,
            membership_type=membership_data.membership_type,
            is_sponsored=membership_data.is_sponsored,
            custom_pricing=membership_data.custom_pricing,
            override_permissions=membership_data.override_permissions,
            notes=membership_data.notes,
            created_by=current_user.id
        )
        
        return OrganizationMembershipApiResponse(
            success=True,
            data=OrganizationMembershipResponse.model_validate(membership),
            message="Member added to organization successfully"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{organization_id}/members", response_model=ApiResponse)
async def get_organization_members(
    organization_id: str,
    program_id: Optional[str] = Query(None),
    active_only: bool = Query(True),
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Get members of an organization."""
    
    memberships = service.get_organization_members(
        organization_id=organization_id,
        program_id=program_id,
        active_only=active_only
    )
    
    membership_responses = [
        OrganizationMembershipResponse.model_validate(membership)
        for membership in memberships
    ]
    
    return ApiResponse(
        success=True,
        data=membership_responses
    )


@router.delete("/{organization_id}/members/{user_id}", response_model=ApiResponse)
async def remove_organization_member(
    organization_id: str,
    user_id: str,
    program_id: str = Query(...),
    current_user: User = Depends(require_admin_access),
    service: OrganizationService = Depends(get_organization_service)
):
    """Remove a member from an organization."""
    
    success = service.remove_member(
        organization_id=organization_id,
        user_id=user_id,
        program_id=program_id,
        updated_by=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    return ApiResponse(
        success=True,
        message="Member removed from organization successfully"
    )


# Search endpoints
@router.get("/search/organizations", response_model=ApiResponse)
async def search_organizations(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service)
):
    """Search organizations for selection components."""
    
    results = service.search_organizations(query=q, limit=limit)
    search_results = [OrganizationSearchResult.model_validate(result) for result in results]
    
    return ApiResponse(
        success=True,
        data=search_results
    )


@router.get("/users/search", response_model=ApiResponse)
async def search_users(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search users for organization membership assignment."""
    
    from sqlalchemy import or_
    from app.features.authentication.models import User as UserModel
    
    search_term = f"%{q}%"
    users = db.query(UserModel)\
        .filter(
            or_(
                UserModel.full_name.ilike(search_term),
                UserModel.email.ilike(search_term),
                UserModel.username.ilike(search_term)
            )
        )\
        .limit(limit)\
        .all()
    
    user_results = [
        UserSearchResult(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            profile_type=user.profile_type,
            roles=user.roles
        )
        for user in users
    ]
    
    return ApiResponse(
        success=True,
        data=user_results
    )