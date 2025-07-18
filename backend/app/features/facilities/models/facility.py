"""
Facility model for managing physical facilities and equipment.
"""

from typing import List, Optional
import enum

from sqlalchemy import Index, String, Text, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


class Facility(BaseModel):
    """
    Facility model for managing physical facilities and equipment.
    
    Represents specific facilities like swimming pools, gymnasiums, classrooms, etc.
    Facilities are associated with programs and can have equipment/amenities.
    
    Relationships:
    - Many-to-many with programs (through program_facilities junction table)
    - One-to-many with equipment/amenities (stored as JSON for flexibility)
    """
    
    __tablename__ = "facilities"
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Facility name (e.g., Olympic Pool, Gymnasium A, Tennis Court 1)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed facility description",
    )
    
    facility_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Type of facility (POOL, COURTS, GYM, FIELD, CLASSROOM, EXTERNAL)",
    )
    
    # Location Information
    address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Full address of the facility",
    )
    
    city: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="City where facility is located",
    )
    
    state: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="State/province where facility is located",
    )
    
    postal_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Postal/ZIP code",
    )
    
    country: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Country where facility is located",
    )
    
    # Capacity and Physical Properties
    capacity: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum occupancy capacity",
    )
    
    area_sqft: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Facility area in square feet",
    )
    
    # Status Management
    status: Mapped[str] = mapped_column(
        String(20),
        default="ACTIVE",
        nullable=False,
        comment="Facility status (ACTIVE, INACTIVE, MAINTENANCE)",
    )
    
    # Equipment and Amenities (stored as JSON for flexibility)
    equipment: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="Equipment and amenities available at the facility",
    )
    
    # Contact Information
    contact_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Facility contact phone number",
    )
    
    contact_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Facility contact email address",
    )
    
    # Facility Head Information
    facility_head_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Name of the facility head/manager",
    )
    
    facility_head_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Phone number of the facility head/manager",
    )
    
    # Access Fees
    access_fee_kids: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Access fee for kids (in cents to avoid decimal issues)",
    )
    
    access_fee_adults: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Access fee for adults (in cents to avoid decimal issues)",
    )
    
    # Activity-Specific Specifications
    specifications: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="Activity-specific facility specifications (e.g., pool dimensions, court surface)",
    )
    
    # Operating Information
    operating_hours: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="Operating hours by day of week",
    )
    
    # Program Association
    program_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=True,
        comment="Associated program ID",
    )
    
    # Additional metadata
    facility_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        unique=True,
        nullable=True,
        comment="Unique facility code (e.g., POOL-01, GYM-A)",
    )
    
    # Relationships
    # Note: Program relationship will be defined when needed
    # program = relationship("Program", back_populates="facilities")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_facilities_name", "name"),
        Index("idx_facilities_status", "status"),
        Index("idx_facilities_type", "facility_type"),
        Index("idx_facilities_program_id", "program_id"),
        Index("idx_facilities_city", "city"),
        Index("idx_facilities_code", "facility_code"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.facility_code:
            return f"{self.facility_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if facility is active."""
        return self.status == "ACTIVE"
    
    @property
    def full_address(self) -> str:
        """Get formatted full address."""
        parts = [self.address]
        if self.city:
            parts.append(self.city)
        if self.state:
            parts.append(self.state)
        if self.postal_code:
            parts.append(self.postal_code)
        if self.country:
            parts.append(self.country)
        return ", ".join(parts)
    
    @property
    def equipment_list(self) -> List[str]:
        """Get list of equipment/amenities."""
        if not self.equipment:
            return []
        if isinstance(self.equipment, dict):
            return list(self.equipment.keys())
        return []
    
    def __repr__(self) -> str:
        """String representation of the facility."""
        return f"<Facility(id={self.id}, name='{self.name}', type='{self.facility_type}')>"