"""
Organization membership model for managing user-organization relationships.
"""

from datetime import datetime, date
from typing import Optional, Dict, Any

from sqlalchemy import String, Boolean, Date, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import MembershipType


class OrganizationMembership(BaseModel):
    """
    Organization membership model for managing relationships between users and organizations.
    
    This model enables:
    - Multiple organization memberships per user (different programs)
    - Sponsored vs. affiliate membership types
    - Custom pricing per member
    - Permission overrides per membership
    - Program-specific organization relationships
    
    Examples:
    - Student sponsored by school for swimming program
    - Employee child with corporate discount for multiple programs
    - Community member with special pricing arrangement
    """
    
    __tablename__ = "organization_memberships"
    
    # Core Relationship
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the user who is a member",
    )
    
    organization_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the organization",
    )
    
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        comment="Program ID this membership applies to",
    )
    
    # Membership Details
    membership_type: Mapped[MembershipType] = mapped_column(
        nullable=False,
        default=MembershipType.SPONSORED,
        comment="Type of membership relationship",
    )
    
    is_sponsored: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this membership is sponsored (payment handled by organization)",
    )
    
    # Configuration and Overrides
    custom_pricing: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Custom pricing overrides for this member",
    )
    
    override_permissions: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Permission overrides specific to this membership",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Notes about this membership",
    )
    
    # Membership Period
    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        comment="Start date of the membership",
    )
    
    end_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="End date of the membership (null for ongoing)",
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this membership is currently active",
    )
    
    # Relationships
    user = relationship("User", back_populates="organization_memberships")
    organization = relationship("Organization", back_populates="memberships")
    program = relationship("Program")
    
    # Constraints and indexes
    __table_args__ = (
        # Ensure no duplicate memberships for same user-organization-program
        UniqueConstraint(
            "user_id", 
            "organization_id", 
            "program_id",
            name="uq_organization_membership_unique"
        ),
        # Indexes for efficient querying
        Index("idx_organization_memberships_user", "user_id"),
        Index("idx_organization_memberships_organization", "organization_id"),
        Index("idx_organization_memberships_program", "program_id"),
        Index("idx_organization_memberships_active", "is_active"),
        Index("idx_organization_memberships_sponsored", "is_sponsored"),
        Index("idx_organization_memberships_type", "membership_type"),
        Index("idx_organization_memberships_dates", "start_date", "end_date"),
        # Compound indexes for common queries
        Index("idx_organization_memberships_user_program", "user_id", "program_id"),
        Index("idx_organization_memberships_org_program", "organization_id", "program_id"),
        Index("idx_organization_memberships_active_sponsored", "is_active", "is_sponsored"),
        {"extend_existing": True}
    )
    
    def is_current(self) -> bool:
        """Check if the membership is currently active based on dates."""
        if not self.is_active:
            return False
            
        today = date.today()
        
        # Check if we're past the start date
        if today < self.start_date:
            return False
            
        # Check if we're past the end date (if set)
        if self.end_date and today > self.end_date:
            return False
            
        return True
    
    def get_custom_price(self, course_id: Optional[str] = None) -> Optional[float]:
        """Get custom pricing for this membership."""
        if not self.custom_pricing:
            return None
            
        # Check for course-specific pricing
        if course_id and course_id in self.custom_pricing:
            return self.custom_pricing[course_id].get("price")
            
        # Check for program-level pricing
        if "program" in self.custom_pricing:
            return self.custom_pricing["program"].get("price")
            
        # Check for global pricing
        if "global" in self.custom_pricing:
            return self.custom_pricing["global"].get("price")
            
        return None
    
    def has_payment_bypass(self, course_id: Optional[str] = None) -> bool:
        """Check if this membership has payment bypass."""
        if not self.is_sponsored:
            return False
            
        # Check organization-level bypass first
        if self.organization.has_payment_bypass(self.program_id, course_id):
            return True
            
        # Check membership-level override
        if self.override_permissions:
            if course_id:
                course_perms = self.override_permissions.get(course_id, {})
                if "bypass_payment" in course_perms:
                    return course_perms["bypass_payment"]
            
            program_perms = self.override_permissions.get("program", {})
            if "bypass_payment" in program_perms:
                return program_perms["bypass_payment"]
                
            global_perms = self.override_permissions.get("global", {})
            if "bypass_payment" in global_perms:
                return global_perms["bypass_payment"]
        
        return False
    
    def can_access_course(self, course_id: str) -> bool:
        """Check if this membership allows access to a specific course."""
        # Check organization permissions
        if not self.organization.can_access_program(self.program_id):
            return False
            
        # Check membership-specific overrides
        if self.override_permissions:
            course_perms = self.override_permissions.get(course_id, {})
            if "access_denied" in course_perms:
                return not course_perms["access_denied"]
                
            program_perms = self.override_permissions.get("program", {})
            if "access_denied" in program_perms:
                return not program_perms["access_denied"]
        
        return True
    
    def get_effective_pricing(self, course_id: Optional[str] = None) -> Dict[str, Any]:
        """Get the effective pricing configuration for this membership."""
        result = {
            "has_custom_price": False,
            "custom_price": None,
            "has_payment_bypass": False,
            "is_sponsored": self.is_sponsored,
            "membership_type": self.membership_type.value
        }
        
        # Check for custom pricing
        custom_price = self.get_custom_price(course_id)
        if custom_price is not None:
            result["has_custom_price"] = True
            result["custom_price"] = custom_price
        
        # Check for payment bypass
        result["has_payment_bypass"] = self.has_payment_bypass(course_id)
        
        return result
    
    def extend_membership(self, new_end_date: Optional[date] = None) -> None:
        """Extend the membership end date."""
        self.end_date = new_end_date
        if new_end_date is None or new_end_date > date.today():
            self.is_active = True
    
    def suspend_membership(self) -> None:
        """Suspend the membership."""
        self.is_active = False
    
    def reactivate_membership(self) -> None:
        """Reactivate the membership if within valid date range."""
        if self.end_date is None or self.end_date >= date.today():
            self.is_active = True
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name for the membership."""
        return f"{self.organization.name} - {self.membership_type.value.title()}"
    
    @property
    def status_display(self) -> str:
        """Get human-readable status."""
        if not self.is_active:
            return "Suspended"
        elif not self.is_current():
            return "Expired"
        else:
            return "Active"
    
    def __repr__(self) -> str:
        """String representation of the membership."""
        return (f"<OrganizationMembership("
                f"user_id='{self.user_id}', "
                f"org='{self.organization.name}', "
                f"program_id='{self.program_id}', "
                f"type='{self.membership_type.value}')>")