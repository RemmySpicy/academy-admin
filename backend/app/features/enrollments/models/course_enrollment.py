"""
Course enrollment model for managing student enrollments across multiple programs.
"""

from datetime import date, datetime
from typing import Optional
from decimal import Decimal

from sqlalchemy import ForeignKey, String, Date, Numeric, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import EnrollmentStatus, AssignmentType, PaymentStatus


class CourseEnrollment(BaseModel):
    """
    Model for managing student enrollments in courses across multiple programs.
    
    This model enables:
    - Students to enroll in courses across multiple programs
    - Tracking of enrollment status and progress
    - Payment and financial tracking per enrollment
    - Facility-based course delivery
    - Audit trail for enrollment changes
    
    Key features:
    - Links users to specific courses and programs
    - Supports multiple simultaneous enrollments
    - Tracks enrollment lifecycle (active, paused, completed, etc.)
    - Integrates with financial and scheduling systems
    - Facility selection and location-based pricing
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
    
    # Facility information
    facility_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("facilities.id"),
        nullable=True,
        comment="ID of the facility where course will be delivered",
    )
    
    location_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Location type (our-facility, client-location, virtual)",
    )
    
    session_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Session type (private, group, school_group)",
    )
    
    age_group: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Age group selected for this enrollment",
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
    
    # Assignment metadata (new fields) - TEMPORARILY COMMENTED OUT
    # These fields don't exist in the database yet - need migration
    # assignment_date: Mapped[date] = mapped_column(
    #     Date,
    #     nullable=False,
    #     default=date.today,
    #     comment="Date when the user was assigned to this course",
    # )
    
    # assignment_type: Mapped[AssignmentType] = mapped_column(
    #     default=AssignmentType.DIRECT,
    #     nullable=False,
    #     comment="Type of assignment (direct, parent_assigned, bulk_assigned)",
    # )
    
    # credits_awarded: Mapped[Optional[int]] = mapped_column(
    #     Integer,
    #     nullable=True,
    #     default=0,
    #     comment="Credits awarded for this course enrollment",
    # )
    
    # assignment_notes: Mapped[Optional[str]] = mapped_column(
    #     Text,
    #     nullable=True,
    #     comment="Notes about this course assignment",
    # )
    
    # assigned_by: Mapped[str] = mapped_column(
    #     String(36),
    #     ForeignKey("users.id"),
    #     nullable=False,
    #     comment="ID of the user who made this assignment",
    # )
    
    # Status and progress
    status: Mapped[EnrollmentStatus] = mapped_column(
        default=EnrollmentStatus.active,
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
    
    # Payment tracking - COMMENTED OUT - field doesn't exist in database yet
    # payment_status: Mapped[PaymentStatus] = mapped_column(
    #     default=PaymentStatus.UNPAID,
    #     nullable=False,
    #     comment="Current payment status (unpaid, partially_paid, fully_paid)",
    # )
    
    total_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Total amount after discounts and coupons",
    )
    
    coupon_code: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Coupon code applied to this enrollment",
    )
    
    discount_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=0.00,
        comment="Discount amount applied via coupon",
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
    facility = relationship("Facility", foreign_keys=[facility_id])
    # assigner = relationship("User", foreign_keys=[assigned_by])  # COMMENTED OUT - field doesn't exist
    
    # Constraints and indexes
    __table_args__ = (
        Index("idx_course_enrollments_user", "user_id"),
        Index("idx_course_enrollments_course", "course_id"),
        Index("idx_course_enrollments_program", "program_id"),
        Index("idx_course_enrollments_facility", "facility_id"),
        Index("idx_course_enrollments_status", "status"),
        # Index("idx_course_enrollments_payment_status", "payment_status"),  # COMMENTED OUT - field doesn't exist
        Index("idx_course_enrollments_enrollment_date", "enrollment_date"),
        Index("idx_course_enrollments_user_course", "user_id", "course_id"),
        Index("idx_course_enrollments_user_program", "user_id", "program_id"),
        Index("idx_course_enrollments_facility_course", "facility_id", "course_id"),
        Index("idx_course_enrollments_active", "status", "enrollment_date"),
        Index("idx_course_enrollments_payment_lookup", "facility_id", "course_id", "age_group", "location_type", "session_type"),
        # New indexes for assignment fields - TEMPORARILY COMMENTED OUT
        # These fields don't exist in the database yet - need migration
        # Index("idx_course_enrollments_assignment_date", "assignment_date"),
        # Index("idx_course_enrollments_assignment_type", "assignment_type"),
        # Index("idx_course_enrollments_assigned_by", "assigned_by"),
        # Index("idx_course_enrollments_credits", "credits_awarded"),
        # Index("idx_course_enrollments_user_assignment", "user_id", "assignment_date"),
        # Index("idx_course_enrollments_program_assignment", "program_id", "assignment_date"),
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
        return self.status == EnrollmentStatus.active
    
    @property
    def is_completed(self) -> bool:
        """Check if the enrollment has been completed."""
        return self.status == EnrollmentStatus.completed
    
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
        return self.status in [EnrollmentStatus.active, EnrollmentStatus.paused]
    
    @property
    def is_payment_sufficient_for_sessions(self) -> bool:
        """Check if payment is sufficient to start sessions (at least 50% paid)."""
        return self.payment_status in [PaymentStatus.PARTIALLY_PAID, PaymentStatus.FULLY_PAID]
    
    @property
    def payment_percentage(self) -> float:
        """Calculate payment percentage."""
        if not self.total_amount or self.total_amount == 0:
            return 0.0
        return float((self.amount_paid or 0) / self.total_amount * 100)
    
    def can_start_sessions(self) -> bool:
        """Check if student can start attending sessions."""
        return (
            self.can_access_course() and
            self.is_payment_sufficient_for_sessions
        )
    
    def calculate_total_amount(self, base_price: Decimal) -> Decimal:
        """Calculate total amount after applying discounts."""
        discount = self.discount_amount or Decimal('0.00')
        return max(base_price - discount, Decimal('0.00'))
    
    def update_payment_status(self) -> None:
        """Update payment status based on amount paid."""
        if not self.total_amount or self.total_amount == 0:
            self.payment_status = PaymentStatus.FULLY_PAID
            return
            
        paid_percentage = self.payment_percentage
        
        if paid_percentage >= 100:
            self.payment_status = PaymentStatus.FULLY_PAID
        elif paid_percentage >= 50:  # 50% threshold for partially paid
            self.payment_status = PaymentStatus.PARTIALLY_PAID
        else:
            self.payment_status = PaymentStatus.UNPAID
    
    @property
    def facility_name(self) -> Optional[str]:
        """Get facility name if facility is loaded."""
        return self.facility.name if self.facility else None