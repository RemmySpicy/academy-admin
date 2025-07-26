"""
Organization model for partner management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import String, Text, Boolean, Date, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import OrganizationStatus


class Organization(BaseModel):
    """
    Organization model for managing partner organizations.
    
    This model represents partner organizations that can:
    - Sponsor student enrollments
    - Have custom pricing arrangements
    - Override payment requirements for their members
    - Manage multiple students across different programs
    
    Examples:
    - Schools partnering for bulk enrollment
    - Corporate sponsors for employee children
    - Community organizations with special arrangements
    """
    
    __tablename__ = "organizations"
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="Organization name",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed description of the organization",
    )
    
    # Contact Information
    contact_name: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Primary contact person name",
    )
    
    contact_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Primary contact email address",
    )
    
    contact_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Primary contact phone number",
    )
    
    # Address Information
    address_line1: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Address line 1",
    )
    
    address_line2: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Address line 2",
    )
    
    city: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="City",
    )
    
    state: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="State/Province",
    )
    
    postal_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Postal/ZIP code",
    )
    
    country: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Country",
    )
    
    # Additional Information
    website: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Organization website URL",
    )
    
    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to organization logo",
    )
    
    # Status and Configuration
    status: Mapped[OrganizationStatus] = mapped_column(
        nullable=False,
        default=OrganizationStatus.ACTIVE,
        comment="Organization status",
    )
    
    # JSON Configuration Fields
    payment_overrides: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Payment override configurations per program/course",
    )
    
    program_permissions: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Program-specific permissions and access configurations",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal notes about the organization",
    )
    
    # Relationships
    memberships = relationship(
        "OrganizationMembership",
        back_populates="organization",
        cascade="all, delete-orphan"
    )
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_organizations_name", "name"),
        Index("idx_organizations_status", "status"),
        Index("idx_organizations_contact_email", "contact_email"),
        {"extend_existing": True}
    )
    
    def get_active_memberships(self) -> List['OrganizationMembership']:
        """Get all active memberships for this organization."""
        return [membership for membership in self.memberships if membership.is_active]
    
    def get_members_in_program(self, program_id: str) -> List['OrganizationMembership']:
        """Get all members in a specific program."""
        return [membership for membership in self.memberships 
                if membership.program_id == program_id and membership.is_active]
    
    def get_payment_override(self, program_id: str, course_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get payment override configuration for a program/course."""
        if not self.payment_overrides:
            return None
            
        # Check for course-specific override first
        if course_id:
            course_key = f"{program_id}:{course_id}"
            if course_key in self.payment_overrides:
                return self.payment_overrides[course_key]
        
        # Check for program-level override
        if program_id in self.payment_overrides:
            return self.payment_overrides[program_id]
            
        # Check for global override
        if "global" in self.payment_overrides:
            return self.payment_overrides["global"]
            
        return None
    
    def has_payment_bypass(self, program_id: str, course_id: Optional[str] = None) -> bool:
        """Check if organization has payment bypass for a program/course."""
        override = self.get_payment_override(program_id, course_id)
        return override and override.get("bypass_payment", False)
    
    def get_custom_pricing(self, program_id: str, course_id: Optional[str] = None) -> Optional[float]:
        """Get custom pricing for a program/course."""
        override = self.get_payment_override(program_id, course_id)
        return override and override.get("custom_price")
    
    def can_access_program(self, program_id: str) -> bool:
        """Check if organization has access to a specific program."""
        if not self.program_permissions:
            return True  # Default to allowing access
            
        program_perms = self.program_permissions.get(program_id, {})
        return program_perms.get("access_allowed", True)
    
    def get_member_count(self) -> int:
        """Get total number of active members."""
        return len(self.get_active_memberships())
    
    def get_programs_list(self) -> List[str]:
        """Get list of program IDs where this organization has members."""
        programs = set()
        for membership in self.get_active_memberships():
            programs.add(membership.program_id)
        return list(programs)
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        return self.name
    
    @property
    def full_address(self) -> str:
        """Get formatted full address."""
        address_parts = []
        
        if self.address_line1:
            address_parts.append(self.address_line1)
        if self.address_line2:
            address_parts.append(self.address_line2)
        if self.city:
            city_part = self.city
            if self.state:
                city_part += f", {self.state}"
            if self.postal_code:
                city_part += f" {self.postal_code}"
            address_parts.append(city_part)
        if self.country:
            address_parts.append(self.country)
            
        return "\n".join(address_parts)
    
    def __repr__(self) -> str:
        """String representation of the organization."""
        return f"<Organization(id='{self.id}', name='{self.name}', status='{self.status.value}')>"


# Import OrganizationMembership from separate module to avoid duplication
from .organization_membership import OrganizationMembership