"""
Parent model for comprehensive parent profile management.
"""

from datetime import date
from typing import List, Optional
from uuid import UUID

from sqlalchemy import (
    Column,
    Date,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import Gender


class Parent(BaseModel):
    """
    Parent model for managing parent profiles and information.
    
    Represents a parent/guardian with comprehensive profile information including:
    - Personal information (name, email, phone, DOB, gender)
    - Address information (stored as JSON for flexibility)
    - Emergency contact information
    - Academy-specific information (enrollment, status)
    - Payment responsibility information
    - Audit trail for all changes
    
    Relationships:
    - One-to-one with User (for authentication and core user data)
    - Many-to-many with students through UserRelationship
    - One-to-many with organization memberships
    - One-to-many with payment records
    """
    
    __tablename__ = "parents"
    
    # Personal Information
    salutation: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
        comment="Mr., Mrs., Ms., Dr., etc.",
    )
    
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Parent's first name",
    )
    
    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Parent's last name",
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        comment="Parent's email address (unique)",
    )
    
    phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Parent's phone number",
    )
    
    date_of_birth: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Parent's date of birth (optional)",
    )
    
    gender: Mapped[Optional[Gender]] = mapped_column(
        nullable=True,
        comment="Parent's gender",
    )
    
    # Address Information (stored as JSON for flexibility)
    address: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="Address information as JSON",
    )
    
    # Academy Information - program membership is now managed via ProgramAssignment model
    
    # Authentication Link (Required for parents as they need login access)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        comment="Reference to user account for authentication",
    )
    
    referral_source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="How the parent heard about the academy",
    )
    
    enrollment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        comment="Date when parent was first enrolled/registered",
    )
    
    # Emergency Contact Information (for the parent themselves)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Emergency contact full name for the parent",
    )
    
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Emergency contact phone number",
    )
    
    emergency_contact_relationship: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Relationship to parent",
    )
    
    # Additional Information
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes about the parent",
    )
    
    # Occupation and other details (optional)
    occupation: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Parent's occupation",
    )
    
    employer: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Parent's employer",
    )
    
    # Payment responsibility indicators
    is_primary_payer: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent is responsible for payments",
    )
    
    # Relationships
    user = relationship("User")
    child_relationships = relationship("ParentChildRelationship", back_populates="parent")
    # Program assignments are accessed via user.program_assignments
    
    # Children relationships through UserRelationship are also available via user.parent_relationships
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_parents_email", "email"),
        Index("idx_parents_last_name", "last_name"),
        Index("idx_parents_full_name", "first_name", "last_name"),
        Index("idx_parents_user_id", "user_id"),
        Index("idx_parents_enrollment_date", "enrollment_date"),
        Index("idx_parents_primary_payer", "is_primary_payer"),
        # Program membership is now tracked via ProgramAssignment and children's CourseEnrollments
    )
    
    @property
    def full_name(self) -> str:
        """Get parent's full name."""
        if self.salutation:
            return f"{self.salutation} {self.first_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def display_name(self) -> str:
        """Get parent's display name (first name + last initial)."""
        return f"{self.first_name} {self.last_name[0]}." if self.last_name else self.first_name
    
    @property
    def age(self) -> Optional[int]:
        """Calculate parent's current age."""
        if not self.date_of_birth:
            return None
        
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def address_string(self) -> str:
        """Get formatted address string."""
        if not self.address:
            return ""
        
        parts = []
        if self.address.get("line1"):
            parts.append(self.address["line1"])
        if self.address.get("line2"):
            parts.append(self.address["line2"])
        if self.address.get("city"):
            parts.append(self.address["city"])
        if self.address.get("state"):
            parts.append(self.address["state"])
        if self.address.get("postal_code"):
            parts.append(self.address["postal_code"])
        if self.address.get("country"):
            parts.append(self.address["country"])
        
        return ", ".join(parts)
    
    @property
    def children(self):
        """Get all children of this parent through parent-child relationships."""
        return [rel.student for rel in self.child_relationships if rel.is_active]
    
    @property
    def active_children_count(self) -> int:
        """Get count of active children."""
        return len([rel for rel in self.child_relationships if rel.is_active])
    
    @property
    def primary_children(self):
        """Get children where this parent is the primary contact."""
        return [rel.student for rel in self.child_relationships 
                if rel.is_active and rel.is_primary_contact]
    
    @property
    def assigned_programs(self) -> List[str]:
        """Get list of program IDs this parent is assigned to."""
        if not self.user or not self.user.program_assignments:
            return []
        return [
            pa.program_id for pa in self.user.program_assignments 
            if pa.is_active and pa.is_parent_role
        ]
    
    @property
    def programs_via_children(self) -> List[str]:
        """Get programs where children are enrolled."""
        child_programs = set()
        for child in self.children:
            if hasattr(child, 'programs_via_enrollments'):
                child_programs.update(child.programs_via_enrollments)
        return list(child_programs)
    
    def is_visible_in_program(self, program_id: str) -> bool:
        """Check if parent is visible in a program (either as parent or via children)."""
        return (program_id in self.programs_via_children or 
                program_id in self.assigned_programs)
    
    def is_assigned_to_program(self, program_id: str) -> bool:
        """Check if parent is assigned to a specific program."""
        return program_id in self.assigned_programs
    
    def __repr__(self) -> str:
        """String representation of the parent."""
        return f"<Parent(id={self.id}, name='{self.full_name}', email='{self.email}')>"