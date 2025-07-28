"""
Course enrollment model for managing student enrollments across multiple programs.
"""

from datetime import date, datetime
from typing import Optional
from decimal import Decimal

from sqlalchemy import ForeignKey, String, Date, Numeric, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import EnrollmentStatus, AssignmentType


class CourseEnrollment(BaseModel):
    """
    Model for managing student enrollments in courses across multiple programs.
    
    This model enables:
    - Students to enroll in courses across multiple programs
    - Tracking of enrollment status and progress
    - Payment and financial tracking per enrollment
    - Audit trail for enrollment changes
    
    Key features:
    - Links users to specific courses and programs
    - Supports multiple simultaneous enrollments
    - Tracks enrollment lifecycle (active, paused, completed, etc.)
    - Integrates with financial and scheduling systems
    """
    
    __tablename__ = "course_enrollments"
    
    # Core enrollment relationships
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the enrolled user",
    )
    
    student_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID of the student profile (created upon first enrollment)",
    )
    
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.id"),
        nullable=False,
        comment="ID of the course being enrolled in",
    )
    
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        comment="ID of the program this course belongs to",
    )
    
    # Enrollment details
    enrollment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
        comment="Date when enrollment was created",
    )
    
    start_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Actual start date of the course for this student",
    )
    
    completion_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Date when the course was completed",
    )
    
    # Assignment metadata (new fields)
    assignment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
        comment="Date when the user was assigned to this course",
    )
    
    assignment_type: Mapped[AssignmentType] = mapped_column(
        default=AssignmentType.DIRECT,
        nullable=False,
        comment="Type of assignment (direct, parent_assigned, bulk_assigned)",
    )
    
    credits_awarded: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        default=0,
        comment="Credits awarded for this course enrollment",
    )
    
    assignment_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes about this course assignment",
    )
    
    assigned_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="ID of the user who made this assignment",
    )
    
    # Status and progress
    status: Mapped[EnrollmentStatus] = mapped_column(
        default=EnrollmentStatus.ACTIVE,
        nullable=False,
        comment="Current enrollment status",
    )
    
    progress_percentage: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        nullable=True,
        default=0.00,
        comment="Overall course completion percentage (0.00-100.00)",
    )
    
    # Financial information
    enrollment_fee: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Total fee for this enrollment",
    )
    
    amount_paid: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=0.00,
        comment="Total amount paid for this enrollment",
    )
    
    outstanding_balance: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=0.00,
        comment="Remaining balance to be paid",
    )
    
    # Additional enrollment information
    referral_source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="How the student heard about this course",
    )
    
    special_requirements: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Any special requirements or accommodations needed",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        String(1000),
        nullable=True,
        comment="Additional notes about this enrollment",
    )
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="course_enrollments")
    student = relationship("Student", back_populates="course_enrollments")
    course = relationship("Course", back_populates="enrollments")
    program = relationship("Program")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    # Constraints and indexes
    __table_args__ = (
        Index("idx_course_enrollments_user", "user_id"),
        Index("idx_course_enrollments_course", "course_id"),
        Index("idx_course_enrollments_program", "program_id"),
        Index("idx_course_enrollments_status", "status"),
        Index("idx_course_enrollments_enrollment_date", "enrollment_date"),
        Index("idx_course_enrollments_user_course", "user_id", "course_id"),
        Index("idx_course_enrollments_user_program", "user_id", "program_id"),
        Index("idx_course_enrollments_active", "status", "enrollment_date"),
        # New indexes for assignment fields
        Index("idx_course_enrollments_assignment_date", "assignment_date"),
        Index("idx_course_enrollments_assignment_type", "assignment_type"),
        Index("idx_course_enrollments_assigned_by", "assigned_by"),
        Index("idx_course_enrollments_credits", "credits_awarded"),
        Index("idx_course_enrollments_user_assignment", "user_id", "assignment_date"),
        Index("idx_course_enrollments_program_assignment", "program_id", "assignment_date"),
    )
    
    def __repr__(self) -> str:
        """String representation of the enrollment."""
        return (f"<CourseEnrollment("
                f"user_id='{self.user_id}', "
                f"course_id='{self.course_id}', "
                f"status='{self.status.value}')>")
    
    @property
    def is_active(self) -> bool:
        """Check if the enrollment is currently active."""
        return self.status == EnrollmentStatus.ACTIVE
    
    @property
    def is_completed(self) -> bool:
        """Check if the enrollment has been completed."""
        return self.status == EnrollmentStatus.COMPLETED
    
    @property
    def has_outstanding_balance(self) -> bool:
        """Check if there's an outstanding balance."""
        return (self.outstanding_balance or 0) > 0
    
    def calculate_progress_percentage(self) -> Decimal:
        """Calculate the current progress percentage (to be implemented with curriculum data)."""
        # This will be implemented when we integrate with the curriculum/lesson tracking
        return self.progress_percentage or Decimal('0.00')
    
    def update_financial_status(self, new_payment: Decimal) -> None:
        """Update financial status after a payment."""
        self.amount_paid = (self.amount_paid or 0) + new_payment
        if self.enrollment_fee:
            self.outstanding_balance = self.enrollment_fee - self.amount_paid
        
    def can_access_course(self) -> bool:
        """Check if the student can access the course content."""
        return self.status in [EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]