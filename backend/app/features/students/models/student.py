"""
Student model for comprehensive student profile management.
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
from app.features.common.models.enums import StudentStatus, Gender


class Student(BaseModel):
    """
    Student model for managing student profiles and information.
    
    Represents a student with comprehensive profile information including:
    - Personal information (name, email, phone, DOB, gender)
    - Address information (stored as JSON for flexibility)
    - Emergency contact information
    - Medical information and conditions
    - Academy-specific information (student ID, enrollment, status)
    - Audit trail for all changes
    
    Relationships:
    - Many-to-many with parents through StudentParentRelationship
    - One-to-many with enrollments
    - One-to-many with progress records
    - One-to-many with attendance records
    """
    
    __tablename__ = "students"
    
    # Auto-generated student ID (format: STU-YYYY-NNNN)
    student_id: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        comment="Auto-generated student ID (STU-YYYY-NNNN)",
    )
    
    # Personal Information
    salutation: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
        comment="Mr., Ms., Dr., etc.",
    )
    
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Student's first name",
    )
    
    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Student's last name",
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        comment="Student's email address (unique)",
    )
    
    phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Student's phone number",
    )
    
    date_of_birth: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        comment="Student's date of birth",
    )
    
    gender: Mapped[Optional[Gender]] = mapped_column(
        nullable=True,
        comment="Student's gender",
    )
    
    # Address Information (stored as JSON for flexibility)
    address: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="Address information as JSON",
    )
    
    # Academy Information
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        comment="Reference to the program this student belongs to",
    )
    
    referral_source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="How the student heard about the academy",
    )
    
    enrollment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        comment="Date when student was first enrolled",
    )
    
    status: Mapped[StudentStatus] = mapped_column(
        default=StudentStatus.ACTIVE,
        nullable=False,
        comment="Current student status",
    )
    
    # Emergency Contact Information
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Emergency contact full name",
    )
    
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Emergency contact phone number",
    )
    
    emergency_contact_relationship: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Relationship to student",
    )
    
    # Medical Information
    medical_conditions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Any medical conditions or health issues",
    )
    
    medications: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Current medications",
    )
    
    allergies: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Known allergies",
    )
    
    # Additional Information
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes about the student",
    )
    
    # Relationships
    # Note: These will be defined when the related models are created
    # parent_relationships = relationship("StudentParentRelationship", back_populates="student")
    # enrollments = relationship("StudentEnrollment", back_populates="student")
    # progress_records = relationship("StudentProgress", back_populates="student")
    # attendance_records = relationship("StudentAttendance", back_populates="student")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_students_email", "email"),
        Index("idx_students_student_id", "student_id"),
        Index("idx_students_last_name", "last_name"),
        Index("idx_students_status", "status"),
        Index("idx_students_enrollment_date", "enrollment_date"),
        Index("idx_students_full_name", "first_name", "last_name"),
        Index("idx_students_program_id", "program_id"),
        Index("idx_students_program_status", "program_id", "status"),
    )
    
    @property
    def full_name(self) -> str:
        """Get student's full name."""
        if self.salutation:
            return f"{self.salutation} {self.first_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def display_name(self) -> str:
        """Get student's display name (first name + last initial)."""
        return f"{self.first_name} {self.last_name[0]}." if self.last_name else self.first_name
    
    @property
    def age(self) -> Optional[int]:
        """Calculate student's current age."""
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
    
    def __repr__(self) -> str:
        """String representation of the student."""
        return f"<Student(id={self.id}, student_id='{self.student_id}', name='{self.full_name}')>"