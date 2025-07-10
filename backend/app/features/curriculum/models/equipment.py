"""
Equipment requirement model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import EquipmentType


class EquipmentRequirement(BaseModel):
    """
    Equipment requirement model for managing equipment needs per level.
    
    Represents equipment requirements for curriculum levels, including safety, 
    instructional, assessment, and enhancement equipment. Links to facility 
    inventory systems and ensures safety compliance.
    
    Relationships:
    - Many-to-one with levels
    """
    
    __tablename__ = "equipment_requirements"
    
    # Foreign Key to Level
    level_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("levels.id"),
        nullable=False,
        comment="Reference to parent level",
    )
    
    # Equipment Information
    equipment_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Name of the equipment (e.g., Swimming Pool Noodles, Safety Whistle)",
    )
    
    equipment_type: Mapped[EquipmentType] = mapped_column(
        default=EquipmentType.INSTRUCTIONAL,
        nullable=False,
        comment="Type of equipment",
    )
    
    # Quantity and Requirements
    quantity_needed: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Number of units needed",
    )
    
    is_mandatory: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this equipment is mandatory or optional",
    )
    
    # Detailed Information
    specifications: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed specifications and requirements",
    )
    
    safety_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Safety considerations and notes",
    )
    
    # Additional metadata
    equipment_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Equipment code (e.g., POOL-NOO, WHIS-SAF)",
    )
    
    brand_preference: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Preferred brand or manufacturer",
    )
    
    alternative_equipment: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Alternative equipment that can be used",
    )
    
    maintenance_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Maintenance and care instructions",
    )
    
    storage_requirements: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Storage requirements and considerations",
    )
    
    cost_estimate: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Estimated cost range",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying equipment within level",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # level = relationship("Level", back_populates="equipment_requirements")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_equipment_requirements_level_id", "level_id"),
        Index("idx_equipment_requirements_name", "equipment_name"),
        Index("idx_equipment_requirements_type", "equipment_type"),
        Index("idx_equipment_requirements_mandatory", "is_mandatory"),
        Index("idx_equipment_requirements_display_order", "display_order"),
        Index("idx_equipment_requirements_level_type", "level_id", "equipment_type"),
        Index("idx_equipment_requirements_level_name", "level_id", "equipment_name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.equipment_code:
            return f"{self.equipment_code}: {self.equipment_name}"
        return self.equipment_name
    
    @property
    def full_name(self) -> str:
        """Get full equipment name including level reference."""
        # This will be updated when Level relationship is established
        return f"Level Equipment: {self.equipment_name}"
    
    @property
    def type_display(self) -> str:
        """Get display-friendly equipment type."""
        return self.equipment_type.value.replace("_", " ").title()
    
    @property
    def quantity_display(self) -> str:
        """Get formatted quantity display."""
        if self.quantity_needed == 1:
            return "1 unit"
        return f"{self.quantity_needed} units"
    
    @property
    def requirement_level(self) -> str:
        """Get requirement level display."""
        return "Mandatory" if self.is_mandatory else "Optional"
    
    @property
    def safety_priority(self) -> bool:
        """Check if this is safety equipment."""
        return self.equipment_type == EquipmentType.SAFETY
    
    def __repr__(self) -> str:
        """String representation of the equipment requirement."""
        return f"<EquipmentRequirement(id={self.id}, name='{self.equipment_name}', level_id='{self.level_id}', type='{self.equipment_type}')>"