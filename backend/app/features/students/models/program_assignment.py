"""
Program assignment model for managing user-program relationships.
"""

from datetime import date
from typing import Optional
from sqlalchemy import ForeignKey, String, Date, Index, Text, Boolean, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import ProgramRole


class ProgramAssignment(BaseModel):
    """
    Model for managing user assignments to programs.
    
    This model replaces the direct program_id fields in Student and Parent models,
    enabling:
    - Flexible program membership management
    - Cross-program user assignment capabilities
    - Tracking of assignment metadata and audit trail
    - Support for users with multiple roles (student and parent)
    
    Key features:
    - Links users to specific programs with role definition
    - Tracks assignment date, assigner, and notes
    - Supports active/inactive assignment status
    - Enables comprehensive assignment audit trail
    """
    
    __tablename__ = "program_assignments"
    
    # Core assignment relationships
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the user being assigned to the program",
    )
    
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the program the user is being assigned to",
    )
    
    # Assignment metadata
    assignment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
        comment="Date when the user was assigned to the program",
    )
    
    assigned_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="ID of the user who made this assignment",
    )
    
    role_in_program: Mapped[ProgramRole] = mapped_column(
        nullable=False,
        comment="Role of the user in this program (student, parent, both)",
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this assignment is currently active",
    )
    
    assignment_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Optional notes about this assignment",
    )
    
    # Deactivation metadata (for audit trail)
    deactivated_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Date when the assignment was deactivated",
    )
    
    deactivated_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="ID of the user who deactivated this assignment",
    )
    
    deactivation_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for deactivating this assignment",
    )
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    program = relationship("Program")
    assigner = relationship("User", foreign_keys=[assigned_by])
    deactivator = relationship("User", foreign_keys=[deactivated_by])
    
    # Constraints and indexes
    __table_args__ = (
        Index("idx_program_assignments_user", "user_id"),
        Index("idx_program_assignments_program", "program_id"),
        Index("idx_program_assignments_role", "role_in_program"),
        Index("idx_program_assignments_active", "is_active"),
        Index("idx_program_assignments_assignment_date", "assignment_date"),
        Index("idx_program_assignments_user_program", "user_id", "program_id"),
        Index("idx_program_assignments_user_active", "user_id", "is_active"),
        Index("idx_program_assignments_program_active", "program_id", "is_active"),
        Index("idx_program_assignments_user_program_active", "user_id", "program_id", "is_active"),
        # Unique constraint to prevent duplicate active assignments with same role
        Index("idx_program_assignments_unique_active", "user_id", "program_id", "role_in_program", "is_active",
              unique=True, postgresql_where=text("is_active = true")),
    )
    
    def __repr__(self) -> str:
        """String representation of the assignment."""
        return (f"<ProgramAssignment("
                f"user_id='{self.user_id}', "
                f"program_id='{self.program_id}', "
                f"role='{self.role_in_program.value}', "
                f"active={self.is_active})>")
    
    def deactivate(self, deactivated_by: str, reason: Optional[str] = None) -> None:
        """
        Deactivate this program assignment.
        
        Args:
            deactivated_by: ID of the user deactivating the assignment
            reason: Optional reason for deactivation
        """
        self.is_active = False
        self.deactivated_date = date.today()
        self.deactivated_by = deactivated_by
        self.deactivation_reason = reason
    
    def reactivate(self) -> None:
        """Reactivate this program assignment."""
        self.is_active = True
        self.deactivated_date = None
        self.deactivated_by = None
        self.deactivation_reason = None
    
    @property
    def is_student_role(self) -> bool:
        """Check if this assignment is for a student role."""
        return self.role_in_program in [ProgramRole.STUDENT, ProgramRole.BOTH]
    
    @property
    def is_parent_role(self) -> bool:
        """Check if this assignment is for a parent role."""
        return self.role_in_program in [ProgramRole.PARENT, ProgramRole.BOTH]
    
    @property
    def duration_days(self) -> Optional[int]:
        """Calculate the duration of this assignment in days."""
        if not self.assignment_date:
            return None
        
        end_date = self.deactivated_date if self.deactivated_date else date.today()
        return (end_date - self.assignment_date).days