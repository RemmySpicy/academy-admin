"""
Organization service layer for partner management.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.features.organizations.models import Organization, OrganizationMembership
from app.features.organizations.schemas.organization_schemas import OrganizationCreate, OrganizationUpdate
from app.features.authentication.models import User
from app.features.common.models.enums import OrganizationStatus, MembershipType
from app.features.common.services.base_service import BaseService


class OrganizationService(BaseService[Organization, OrganizationCreate, OrganizationUpdate]):
    """Service for managing organizations and their memberships."""
    
    def __init__(self, db: Session):
        super().__init__(db, Organization)
    
    def create_organization(
        self,
        name: str,
        description: Optional[str] = None,
        contact_name: Optional[str] = None,
        contact_email: Optional[str] = None,
        contact_phone: Optional[str] = None,
        address_data: Optional[Dict[str, str]] = None,
        website: Optional[str] = None,
        logo_url: Optional[str] = None,
        payment_overrides: Optional[Dict[str, Any]] = None,
        program_permissions: Optional[Dict[str, Any]] = None,
        notes: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> Organization:
        """Create a new organization."""
        
        organization_data = {
            "name": name,
            "description": description,
            "contact_name": contact_name,
            "contact_email": contact_email,
            "contact_phone": contact_phone,
            "website": website,
            "logo_url": logo_url,
            "status": OrganizationStatus.ACTIVE,
            "payment_overrides": payment_overrides,
            "program_permissions": program_permissions,
            "notes": notes,
            "created_by": created_by
        }
        
        # Add address fields if provided
        if address_data:
            organization_data.update({
                "address_line1": address_data.get("line1"),
                "address_line2": address_data.get("line2"),
                "city": address_data.get("city"),
                "state": address_data.get("state"),
                "postal_code": address_data.get("postal_code"),
                "country": address_data.get("country", "NG")
            })
        
        return self.create(**organization_data)
    
    def update_organization(
        self,
        organization_id: str,
        **update_data
    ) -> Optional[Organization]:
        """Update an organization."""
        
        # Handle address data specially
        if "address_data" in update_data:
            address_data = update_data.pop("address_data")
            if address_data:
                update_data.update({
                    "address_line1": address_data.get("line1"),
                    "address_line2": address_data.get("line2"),
                    "city": address_data.get("city"),
                    "state": address_data.get("state"),
                    "postal_code": address_data.get("postal_code"),
                    "country": address_data.get("country")
                })
        
        return self.update(organization_id, **update_data)
    
    def get_organizations(
        self,
        status: Optional[OrganizationStatus] = None,
        search: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Organization]:
        """Get organizations with optional filtering."""
        
        query = self.db.query(Organization)
        
        # Apply status filter
        if status:
            query = query.filter(Organization.status == status)
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Organization.name.ilike(search_term),
                    Organization.contact_name.ilike(search_term),
                    Organization.contact_email.ilike(search_term)
                )
            )
        
        # Apply ordering
        query = query.order_by(Organization.name)
        
        # Apply pagination
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def get_organization_with_members(self, organization_id: str) -> Optional[Organization]:
        """Get organization with its active members loaded."""
        return self.db.query(Organization)\
            .filter(Organization.id == organization_id)\
            .first()
    
    def add_member(
        self,
        organization_id: str,
        user_id: str,
        program_id: str,
        membership_type: MembershipType = MembershipType.SPONSORED,
        is_sponsored: bool = True,
        custom_pricing: Optional[Dict[str, Any]] = None,
        override_permissions: Optional[Dict[str, Any]] = None,
        notes: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> OrganizationMembership:
        """Add a member to an organization."""
        
        # Check if membership already exists
        existing = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.user_id == user_id,
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id
                )
            ).first()
        
        if existing:
            if existing.is_active:
                raise ValueError("User is already a member of this organization in this program")
            else:
                # Reactivate existing membership
                existing.is_active = True
                existing.membership_type = membership_type
                existing.is_sponsored = is_sponsored
                existing.custom_pricing = custom_pricing
                existing.override_permissions = override_permissions
                existing.notes = notes
                existing.updated_by = created_by
                self.db.commit()
                return existing
        
        # Create new membership
        membership = OrganizationMembership(
            user_id=user_id,
            organization_id=organization_id,
            program_id=program_id,
            membership_type=membership_type,
            is_sponsored=is_sponsored,
            custom_pricing=custom_pricing,
            override_permissions=override_permissions,
            notes=notes,
            start_date=self.get_current_date(),
            created_by=created_by
        )
        
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        
        return membership
    
    def remove_member(
        self,
        organization_id: str,
        user_id: str,
        program_id: str,
        updated_by: Optional[str] = None
    ) -> bool:
        """Remove a member from an organization."""
        
        membership = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.user_id == user_id,
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id
                )
            ).first()
        
        if membership:
            membership.is_active = False
            membership.end_date = self.get_current_date()
            membership.updated_by = updated_by
            self.db.commit()
            return True
        
        return False
    
    def get_organization_members(
        self,
        organization_id: str,
        program_id: Optional[str] = None,
        active_only: bool = True
    ) -> List[OrganizationMembership]:
        """Get members of an organization."""
        
        query = self.db.query(OrganizationMembership)\
            .filter(OrganizationMembership.organization_id == organization_id)
        
        if program_id:
            query = query.filter(OrganizationMembership.program_id == program_id)
        
        if active_only:
            query = query.filter(OrganizationMembership.is_active == True)
        
        return query.all()
    
    def get_user_memberships(
        self,
        user_id: str,
        program_id: Optional[str] = None,
        active_only: bool = True
    ) -> List[OrganizationMembership]:
        """Get organization memberships for a user."""
        
        query = self.db.query(OrganizationMembership)\
            .filter(OrganizationMembership.user_id == user_id)
        
        if program_id:
            query = query.filter(OrganizationMembership.program_id == program_id)
        
        if active_only:
            query = query.filter(OrganizationMembership.is_active == True)
        
        return query.all()
    
    def update_membership(
        self,
        membership_id: str,
        **update_data
    ) -> Optional[OrganizationMembership]:
        """Update an organization membership."""
        
        membership = self.db.query(OrganizationMembership)\
            .filter(OrganizationMembership.id == membership_id)\
            .first()
        
        if membership:
            for key, value in update_data.items():
                if hasattr(membership, key):
                    setattr(membership, key, value)
            
            self.db.commit()
            self.db.refresh(membership)
        
        return membership
    
    def search_organizations(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search organizations for selection components."""
        
        search_term = f"%{query}%"
        organizations = self.db.query(Organization)\
            .filter(
                and_(
                    Organization.status == OrganizationStatus.ACTIVE,
                    or_(
                        Organization.name.ilike(search_term),
                        Organization.contact_name.ilike(search_term),
                        Organization.contact_email.ilike(search_term)
                    )
                )
            )\
            .order_by(Organization.name)\
            .limit(limit)\
            .all()
        
        return [
            {
                "id": org.id,
                "name": org.name,
                "contact_name": org.contact_name,
                "contact_email": org.contact_email,
                "member_count": len(org.get_active_memberships())
            }
            for org in organizations
        ]
    
    def get_organization_stats(self, organization_id: str) -> Dict[str, Any]:
        """Get statistics for an organization."""
        
        organization = self.get_by_id(organization_id)
        if not organization:
            return {}
        
        active_memberships = organization.get_active_memberships()
        programs = organization.get_programs_list()
        
        return {
            "total_members": len(active_memberships),
            "sponsored_members": len([m for m in active_memberships if m.is_sponsored]),
            "programs_count": len(programs),
            "programs": programs,
            "membership_types": {
                membership_type.value: len([
                    m for m in active_memberships 
                    if m.membership_type == membership_type
                ])
                for membership_type in MembershipType
            }
        }
    
    def deactivate_organization(
        self,
        organization_id: str,
        updated_by: Optional[str] = None
    ) -> Optional[Organization]:
        """Deactivate an organization and all its memberships."""
        
        organization = self.get_by_id(organization_id)
        if not organization:
            return None
        
        # Deactivate organization
        organization.status = OrganizationStatus.INACTIVE
        organization.updated_by = updated_by
        
        # Deactivate all active memberships
        active_memberships = organization.get_active_memberships()
        for membership in active_memberships:
            membership.is_active = False
            membership.end_date = self.get_current_date()
            membership.updated_by = updated_by
        
        self.db.commit()
        return organization