"""
Partner admin service for managing organization admin users and their authentication.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.features.authentication.models.user import User
from app.features.authentication.services.auth_service import auth_service
from app.features.organizations.models import Organization, OrganizationMembership
from app.features.common.models.enums import UserRole, OrganizationStatus, MembershipType, ProfileType
from app.features.common.services.base_service import BaseService


class PartnerAdminService(BaseService[User]):
    """Service for managing partner organization admin users."""
    
    def __init__(self, db: Session):
        super().__init__(db, User)
    
    def create_partner_admin(
        self,
        organization_id: str,
        admin_data: Dict[str, Any],
        programs: List[str],
        created_by: Optional[str] = None
    ) -> User:
        """
        Create a new partner admin user for an organization.
        
        Args:
            organization_id: The organization this admin will manage
            admin_data: Admin user data (username, email, password, full_name, etc.)
            programs: List of program IDs this admin can manage
            created_by: ID of user creating this admin
        
        Returns:
            Created User object with partner admin role
        """
        
        # Validate organization exists and is active
        organization = self.db.query(Organization)\
            .filter(
                and_(
                    Organization.id == organization_id,
                    Organization.status == OrganizationStatus.ACTIVE
                )
            ).first()
        
        if not organization:
            raise ValueError("Organization not found or inactive")
        
        # Validate admin data
        if not admin_data.get("username"):
            raise ValueError("Username is required")
        if not admin_data.get("email"):
            raise ValueError("Email is required") 
        if not admin_data.get("password"):
            raise ValueError("Password is required")
        if not admin_data.get("full_name"):
            raise ValueError("Full name is required")
        
        # Check if username/email already exists
        existing_user = self.db.query(User)\
            .filter(
                or_(
                    User.username == admin_data["username"],
                    User.email == admin_data["email"]
                )
            ).first()
        
        if existing_user:
            raise ValueError("Username or email already exists")
        
        # Hash password
        password_hash = auth_service.get_password_hash(admin_data["password"])
        
        # Create partner admin user
        user_data = {
            "username": admin_data["username"],
            "email": admin_data["email"], 
            "password_hash": password_hash,
            "full_name": admin_data["full_name"],
            "phone": admin_data.get("phone"),
            "date_of_birth": admin_data.get("date_of_birth"),
            "profile_photo_url": admin_data.get("profile_photo_url"),
            "roles": [UserRole.PROGRAM_ADMIN.value],  # Give them program admin role for their org
            "primary_role": UserRole.PROGRAM_ADMIN.value,
            "profile_type": ProfileType.FULL_USER,
            "is_active": True,
            "created_by": created_by,
            "updated_by": created_by
        }
        
        user = User(**user_data)
        self.db.add(user)
        self.db.flush()  # Get the user ID
        
        # Create organization memberships for each program
        for program_id in programs:
            membership = OrganizationMembership(
                user_id=user.id,
                organization_id=organization_id,
                program_id=program_id,
                membership_type=MembershipType.PARTNER,
                is_sponsored=False,  # Admin is not sponsored
                start_date=date.today(),
                is_active=True,
                created_by=created_by,
                updated_by=created_by
            )
            self.db.add(membership)
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def authenticate_partner_admin(
        self,
        username: str,
        password: str
    ) -> Optional[Dict[str, Any]]:
        """
        Authenticate a partner admin and return user with organization context.
        
        Args:
            username: Username or email
            password: Password
            
        Returns:
            Dict with user info and organization context, or None if auth fails
        """
        
        # Authenticate user
        user = auth_service.authenticate_user(self.db, username, password)
        if not user:
            return None
        
        # Verify user is a partner admin
        if not user.is_program_admin():
            return None
        
        # Get user's organization memberships
        org_memberships = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.user_id == user.id,
                    OrganizationMembership.membership_type == MembershipType.PARTNER,
                    OrganizationMembership.is_active == True
                )
            ).all()
        
        if not org_memberships:
            return None  # Not a partner admin
        
        # Get organization details
        organizations = []
        for membership in org_memberships:
            org = self.db.query(Organization)\
                .filter(Organization.id == membership.organization_id)\
                .first()
            
            if org and org.status == OrganizationStatus.ACTIVE:
                organizations.append({
                    "organization_id": org.id,
                    "organization_name": org.name,
                    "program_id": membership.program_id,
                    "membership_id": membership.id
                })
        
        if not organizations:
            return None  # No active organizations
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        return {
            "user": user,
            "organizations": organizations,
            "is_partner_admin": True
        }
    
    def get_partner_admin_permissions(
        self,
        user_id: str,
        organization_id: str,
        program_id: str
    ) -> Dict[str, Any]:
        """
        Get permissions for a partner admin in a specific organization/program.
        
        Args:
            user_id: Partner admin user ID
            organization_id: Organization ID
            program_id: Program ID
            
        Returns:
            Dict with permissions and access details
        """
        
        # Get organization membership
        membership = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.user_id == user_id,
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id,
                    OrganizationMembership.membership_type == MembershipType.PARTNER,
                    OrganizationMembership.is_active == True
                )
            ).first()
        
        if not membership:
            return {"has_access": False}
        
        # Get organization
        organization = self.db.query(Organization)\
            .filter(Organization.id == organization_id)\
            .first()
        
        if not organization or organization.status != OrganizationStatus.ACTIVE:
            return {"has_access": False}
        
        # Define partner admin permissions
        permissions = {
            "has_access": True,
            "organization_id": organization_id,
            "organization_name": organization.name,
            "program_id": program_id,
            "can_view_students": True,
            "can_manage_students": True,
            "can_view_enrollments": True,
            "can_manage_enrollments": True,
            "can_view_payments": True,
            "can_manage_payments": False,  # Usually handled by academy admin
            "can_view_reports": True,
            "can_export_data": True,
            "can_manage_organization_settings": False,  # Usually handled by super admin
            "custom_permissions": membership.override_permissions or {}
        }
        
        # Apply any custom permission overrides
        if membership.override_permissions:
            permissions.update(membership.override_permissions)
        
        return permissions
    
    def get_partner_students(
        self,
        user_id: str,
        organization_id: str,
        program_id: str,
        include_inactive: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get all students sponsored by the partner organization.
        
        Args:
            user_id: Partner admin user ID
            organization_id: Organization ID
            program_id: Program ID
            include_inactive: Whether to include inactive memberships
            
        Returns:
            List of student data with membership info
        """
        
        # Verify admin has access
        permissions = self.get_partner_admin_permissions(user_id, organization_id, program_id)
        if not permissions.get("has_access") or not permissions.get("can_view_students"):
            return []
        
        # Query for students sponsored by this organization
        query = self.db.query(OrganizationMembership, User)\
            .join(User, OrganizationMembership.user_id == User.id)\
            .filter(
                and_(
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id,
                    OrganizationMembership.is_sponsored == True
                )
            )
        
        if not include_inactive:
            query = query.filter(OrganizationMembership.is_active == True)
        
        results = query.all()
        
        students = []
        for membership, user in results:
            student_data = {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "profile_type": user.profile_type.value,
                "roles": user.roles,
                "is_active": user.is_active,
                "membership": {
                    "id": membership.id,
                    "membership_type": membership.membership_type.value,
                    "is_sponsored": membership.is_sponsored,
                    "start_date": membership.start_date.isoformat(),
                    "end_date": membership.end_date.isoformat() if membership.end_date else None,
                    "is_active": membership.is_active,
                    "custom_pricing": membership.custom_pricing,
                    "notes": membership.notes
                }
            }
            students.append(student_data)
        
        return students
    
    def get_partner_organization_stats(
        self,
        user_id: str,
        organization_id: str,
        program_id: str
    ) -> Dict[str, Any]:
        """
        Get statistics for a partner organization in a specific program.
        
        Args:
            user_id: Partner admin user ID
            organization_id: Organization ID
            program_id: Program ID
            
        Returns:
            Dict with organization statistics
        """
        
        # Verify admin has access
        permissions = self.get_partner_admin_permissions(user_id, organization_id, program_id)
        if not permissions.get("has_access"):
            return {}
        
        # Get organization
        organization = self.db.query(Organization)\
            .filter(Organization.id == organization_id)\
            .first()
        
        if not organization:
            return {}
        
        # Get membership statistics
        total_members = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id
                )
            ).count()
        
        active_members = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id,
                    OrganizationMembership.is_active == True
                )
            ).count()
        
        sponsored_members = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id,
                    OrganizationMembership.is_sponsored == True,
                    OrganizationMembership.is_active == True
                )
            ).count()
        
        # Get recent enrollments (last 30 days)
        thirty_days_ago = date.today() - datetime.timedelta(days=30)
        recent_enrollments = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.organization_id == organization_id,
                    OrganizationMembership.program_id == program_id,
                    OrganizationMembership.start_date >= thirty_days_ago
                )
            ).count()
        
        return {
            "organization": {
                "id": organization.id,
                "name": organization.name,
                "status": organization.status.value,
                "contact_name": organization.contact_name,
                "contact_email": organization.contact_email
            },
            "program_id": program_id,
            "statistics": {
                "total_members": total_members,
                "active_members": active_members,
                "sponsored_members": sponsored_members,
                "recent_enrollments": recent_enrollments,
                "sponsorship_rate": (sponsored_members / active_members * 100) if active_members > 0 else 0
            }
        }
    
    def update_partner_admin(
        self,
        user_id: str,
        update_data: Dict[str, Any],
        updated_by: Optional[str] = None
    ) -> Optional[User]:
        """
        Update partner admin user information.
        
        Args:
            user_id: Partner admin user ID
            update_data: Data to update
            updated_by: ID of user making the update
            
        Returns:
            Updated User object or None if not found
        """
        
        user = self.get_by_id(user_id)
        if not user or not user.is_program_admin():
            return None
        
        # Update allowed fields
        allowed_fields = [
            "full_name", "phone", "email", "profile_photo_url", "is_active"
        ]
        
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(user, field):
                setattr(user, field, value)
        
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def deactivate_partner_admin(
        self,
        user_id: str,
        updated_by: Optional[str] = None
    ) -> bool:
        """
        Deactivate a partner admin and their organization memberships.
        
        Args:
            user_id: Partner admin user ID
            updated_by: ID of user making the update
            
        Returns:
            True if deactivated successfully
        """
        
        user = self.get_by_id(user_id)
        if not user or not user.is_program_admin():
            return False
        
        # Deactivate user
        user.is_active = False
        user.updated_by = updated_by
        
        # Deactivate all organization memberships
        memberships = self.db.query(OrganizationMembership)\
            .filter(
                and_(
                    OrganizationMembership.user_id == user_id,
                    OrganizationMembership.membership_type == MembershipType.PARTNER
                )
            ).all()
        
        for membership in memberships:
            membership.is_active = False
            membership.end_date = date.today()
            membership.updated_by = updated_by
        
        self.db.commit()
        return True
    
    def get_all_partner_admins(
        self,
        organization_id: Optional[str] = None,
        program_id: Optional[str] = None,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get all partner admin users with their organization context.
        
        Args:
            organization_id: Filter by organization ID
            program_id: Filter by program ID
            active_only: Only return active admins
            
        Returns:
            List of partner admin data with organization info
        """
        
        # Query partner admin memberships
        query = self.db.query(OrganizationMembership, User, Organization)\
            .join(User, OrganizationMembership.user_id == User.id)\
            .join(Organization, OrganizationMembership.organization_id == Organization.id)\
            .filter(OrganizationMembership.membership_type == MembershipType.PARTNER)
        
        if organization_id:
            query = query.filter(OrganizationMembership.organization_id == organization_id)
        
        if program_id:
            query = query.filter(OrganizationMembership.program_id == program_id)
        
        if active_only:
            query = query.filter(
                and_(
                    User.is_active == True,
                    OrganizationMembership.is_active == True,
                    Organization.status == OrganizationStatus.ACTIVE
                )
            )
        
        results = query.all()
        
        admins = []
        for membership, user, organization in results:
            admin_data = {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.full_name,
                    "phone": user.phone,
                    "is_active": user.is_active,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "created_at": user.created_at.isoformat()
                },
                "organization": {
                    "id": organization.id,
                    "name": organization.name,
                    "status": organization.status.value
                },
                "membership": {
                    "program_id": membership.program_id,
                    "start_date": membership.start_date.isoformat(),
                    "is_active": membership.is_active
                }
            }
            admins.append(admin_data)
        
        return admins