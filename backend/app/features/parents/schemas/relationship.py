"""
Parent-Child Relationship schemas for API requests and responses.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from app.features.common.models.enums import RelationshipType
from app.features.students.schemas.common import TimestampMixin


class ParentChildRelationshipBase(BaseModel):
    """Base parent-child relationship schema."""
    
    relationship_type: RelationshipType = Field(..., description="Type of relationship")
    is_primary_contact: bool = Field(default=True, description="Whether parent is primary contact")
    can_pickup: bool = Field(default=True, description="Whether parent can pick up child")
    emergency_contact: bool = Field(default=True, description="Whether parent is emergency contact")
    receive_notifications: bool = Field(default=True, description="Whether parent receives notifications")
    receive_reports: bool = Field(default=True, description="Whether parent receives reports")
    payment_responsibility: bool = Field(default=True, description="Whether parent is responsible for payments")


class ParentChildRelationshipCreate(ParentChildRelationshipBase):
    """Schema for creating a parent-child relationship."""
    
    parent_id: str = Field(..., description="Parent ID")
    student_id: str = Field(..., description="Student ID")
    program_id: str = Field(..., description="Program ID")
    relationship_notes: Optional[str] = Field(None, max_length=500, description="Relationship-specific notes")
    
    @validator('relationship_notes')
    def validate_notes_length(cls, v):
        """Validate notes length."""
        if v and len(v.strip()) == 0:
            return None
        return v


class ParentChildRelationshipUpdate(BaseModel):
    """Schema for updating a parent-child relationship."""
    
    relationship_type: Optional[RelationshipType] = Field(None, description="Type of relationship")
    is_primary_contact: Optional[bool] = Field(None, description="Whether parent is primary contact")
    can_pickup: Optional[bool] = Field(None, description="Whether parent can pick up child")
    emergency_contact: Optional[bool] = Field(None, description="Whether parent is emergency contact")
    receive_notifications: Optional[bool] = Field(None, description="Whether parent receives notifications")
    receive_reports: Optional[bool] = Field(None, description="Whether parent receives reports")
    payment_responsibility: Optional[bool] = Field(None, description="Whether parent is responsible for payments")
    relationship_notes: Optional[str] = Field(None, max_length=500, description="Relationship-specific notes")
    
    @validator('relationship_notes')
    def validate_notes_length(cls, v):
        """Validate notes length."""
        if v and len(v.strip()) == 0:
            return None
        return v


class ParentChildRelationshipResponse(ParentChildRelationshipBase, TimestampMixin):
    """Schema for parent-child relationship response."""
    
    id: str = Field(..., description="Relationship ID")
    parent_id: str = Field(..., description="Parent ID")
    student_id: str = Field(..., description="Student ID")
    program_id: str = Field(..., description="Program ID")
    user_relationship_id: str = Field(..., description="Core user relationship ID")
    relationship_notes: Optional[str] = Field(None, description="Relationship-specific notes")
    
    # Related entity information (for convenience)
    parent_name: Optional[str] = Field(None, description="Parent full name")
    parent_email: Optional[str] = Field(None, description="Parent email")
    student_name: Optional[str] = Field(None, description="Student full name")
    student_id_formatted: Optional[str] = Field(None, description="Student ID (STU-YYYY-NNNN)")
    program_name: Optional[str] = Field(None, description="Program name")
    
    # Status information
    is_active: bool = Field(..., description="Whether relationship is active")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "parent_id": "parent-uuid",
                "student_id": "student-uuid",
                "program_id": "program-uuid",
                "user_relationship_id": "user-rel-uuid",
                "relationship_type": "mother",
                "is_primary_contact": True,
                "can_pickup": True,
                "emergency_contact": True,
                "receive_notifications": True,
                "receive_reports": True,
                "payment_responsibility": True,
                "relationship_notes": "Primary caregiver",
                "parent_name": "Jane Doe",
                "parent_email": "jane.doe@example.com",
                "student_name": "John Doe",
                "student_id_formatted": "STU-2025-0001",
                "program_name": "Swimming Program",
                "is_active": True,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z"
            }
        }


class StudentInfo(BaseModel):
    """Student information for family structure."""
    
    id: str = Field(..., description="Student ID")
    student_id: str = Field(..., description="Student ID (STU-YYYY-NNNN)")
    first_name: str = Field(..., description="Student first name")
    last_name: str = Field(..., description="Student last name")
    email: Optional[str] = Field(None, description="Student email")
    age: Optional[int] = Field(None, description="Student age")
    has_login_credentials: bool = Field(..., description="Whether student has login access")


class ParentInfo(BaseModel):
    """Parent information for family structure."""
    
    id: str = Field(..., description="Parent ID")
    first_name: str = Field(..., description="Parent first name")
    last_name: str = Field(..., description="Parent last name")
    email: str = Field(..., description="Parent email")
    phone: Optional[str] = Field(None, description="Parent phone")
    is_primary_payer: bool = Field(..., description="Whether parent is primary payer")


class FamilyRelationship(BaseModel):
    """Family relationship information."""
    
    id: str = Field(..., description="Relationship ID")
    relationship_type: RelationshipType = Field(..., description="Type of relationship")
    is_primary_contact: bool = Field(..., description="Whether parent is primary contact")
    can_pickup: bool = Field(..., description="Whether parent can pick up child")
    emergency_contact: bool = Field(..., description="Whether parent is emergency contact")
    payment_responsibility: bool = Field(..., description="Whether parent is responsible for payments")
    parent: ParentInfo = Field(..., description="Parent information")
    student: StudentInfo = Field(..., description="Student information")


class FamilyStructureResponse(BaseModel):
    """Schema for family structure response."""
    
    program_id: str = Field(..., description="Program ID")
    program_name: str = Field(..., description="Program name")
    total_families: int = Field(..., description="Total number of families")
    total_relationships: int = Field(..., description="Total number of relationships")
    
    relationships: List[FamilyRelationship] = Field(..., description="All family relationships")
    
    # Statistics
    relationships_by_type: Dict[str, int] = Field(..., description="Relationships grouped by type")
    parents_by_children_count: Dict[str, int] = Field(..., description="Parents grouped by number of children")
    students_with_parents: int = Field(..., description="Students with at least one parent")
    students_without_parents: int = Field(..., description="Students without parents")
    
    class Config:
        json_schema_extra = {
            "example": {
                "program_id": "program-uuid",
                "program_name": "Swimming Program",
                "total_families": 15,
                "total_relationships": 28,
                "relationships": [
                    {
                        "id": "rel-uuid",
                        "relationship_type": "mother",
                        "is_primary_contact": True,
                        "can_pickup": True,
                        "emergency_contact": True,
                        "payment_responsibility": True,
                        "parent": {
                            "id": "parent-uuid",
                            "first_name": "Jane",
                            "last_name": "Doe",
                            "email": "jane.doe@example.com",
                            "phone": "555-123-4567",
                            "is_primary_payer": True
                        },
                        "student": {
                            "id": "student-uuid",
                            "student_id": "STU-2025-0001",
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": None,
                            "age": 8,
                            "has_login_credentials": False
                        }
                    }
                ],
                "relationships_by_type": {
                    "mother": 15,
                    "father": 12,
                    "guardian": 1
                },
                "parents_by_children_count": {
                    "1": 10,
                    "2": 4,
                    "3": 1
                },
                "students_with_parents": 25,
                "students_without_parents": 3
            }
        }