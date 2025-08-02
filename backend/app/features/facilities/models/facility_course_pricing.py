"""
Facility Course Pricing model for managing actual course prices at specific facilities.
"""

from typing import Optional
from sqlalchemy import ForeignKey, Index, String, Integer, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


class FacilityCoursePricing(BaseModel):
    """
    Facility Course Pricing model for storing actual prices customers pay for courses at facilities.
    
    This model stores the specific prices that override the course price ranges when customers
    enroll for courses at specific facilities. Each entry represents the actual price for a 
    specific combination of facility, course, age group, location type, and session type.
    
    Relationships:
    - Many-to-one with facilities
    - Many-to-one with courses
    """
    
    __tablename__ = "facility_course_pricing"
    
    # Foreign Keys
    facility_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("facilities.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to facility",
    )
    
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to course",
    )
    
    # Pricing Configuration
    age_group: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Age group (must match course age groups)",
    )
    
    location_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Location type (our-facility, client-location, virtual)",
    )
    
    session_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Session type (group, private, etc.)",
    )
    
    # Pricing Details
    price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Actual price in NGN (kobo not supported)",
    )
    
    # Management Fields
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this pricing entry is active",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes about this pricing",
    )
    
    # Audit Fields (inherited from BaseModel: created_by, updated_by, created_at, updated_at)
    
    # Relationships
    facility = relationship("Facility", back_populates="course_pricing")
    # course = relationship("Course", back_populates="facility_pricing")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_facility_course_pricing_facility_id", "facility_id"),
        Index("idx_facility_course_pricing_course_id", "course_id"),
        Index("idx_facility_course_pricing_lookup", "facility_id", "course_id", "age_group", "location_type", "session_type"),
        Index("idx_facility_course_pricing_active", "is_active"),
        # Unique constraint to prevent duplicate active pricing entries
        Index("unique_facility_course_pricing", "facility_id", "course_id", "age_group", "location_type", "session_type", 
              unique=True, postgresql_where="is_active = true"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        return f"{self.age_group} | {self.location_type} | {self.session_type}"
    
    @property
    def formatted_price(self) -> str:
        """Get formatted price string."""
        return f"₦{self.price:,}"
    
    @property
    def pricing_key(self) -> str:
        """Get unique key for this pricing configuration."""
        return f"{self.facility_id}:{self.course_id}:{self.age_group}:{self.location_type}:{self.session_type}"
    
    def is_valid_for_course(self, course) -> bool:
        """Check if this pricing entry is valid for the given course."""
        return (
            self.course_id == course.id and
            self.age_group in course.age_groups and
            self.location_type in course.location_types and
            self.session_type in course.session_types and
            self.is_active
        )
    
    def __repr__(self) -> str:
        """String representation of the facility course pricing."""
        return f"<FacilityCoursePricing(facility_id='{self.facility_id}', course_id='{self.course_id}', price={self.price})>"