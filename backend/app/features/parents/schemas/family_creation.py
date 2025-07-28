"""
Comprehensive Family Creation Schemas

Advanced schemas for complex family creation workflows including
parent-with-children, multi-parent families, and organization integration.
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator, root_validator
from datetime import date, datetime
from enum import Enum

from app.features.parents.schemas.parent import ParentCreate
from app.features.students.schemas.student import StudentCreate


class FamilyCreationType(str, Enum):
    """Types of family creation workflows."""
    PARENT_WITH_CHILDREN = "parent_with_children"
    SINGLE_PARENT = "single_parent"
    MULTI_PARENT_FAMILY = "multi_parent_family"
    ORGANIZATION_SPONSORED = "organization_sponsored"


class RelationshipSettings(BaseModel):
    """Settings for parent-child relationships."""
    can_pickup: bool = Field(default=True, description="Parent can pick up child")
    is_emergency_contact: bool = Field(default=True, description="Parent is emergency contact")
    has_payment_responsibility: bool = Field(default=True, description="Parent has payment responsibility")
    pickup_notes: Optional[str] = Field(default=None, description="Special pickup instructions")
    special_instructions: Optional[str] = Field(default=None, description="Special relationship instructions")
    
    class Config:
        json_schema_extra = {
            "example": {
                "can_pickup": True,
                "is_emergency_contact": True,
                "has_payment_responsibility": True,
                "pickup_notes": "Must show ID when picking up",
                "special_instructions": "Primary guardian contact"
            }
        }


class EnhancedStudentCreate(StudentCreate):
    """Enhanced student creation with relationship settings."""
    relationship_settings: Optional[RelationshipSettings] = Field(
        default_factory=RelationshipSettings,
        description="Parent-child relationship settings"
    )
    inherit_from_parent: bool = Field(
        default=True,
        description="Inherit address and emergency contact from parent"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "Emma",
                "last_name": "Johnson",
                "date_of_birth": "2015-03-15",
                "email": None,
                "password": None,
                "medical_conditions": "None",
                "dietary_restrictions": "Vegetarian",
                "inherit_from_parent": True,
                "relationship_settings": {
                    "can_pickup": True,
                    "is_emergency_contact": True,
                    "has_payment_responsibility": True
                }
            }
        }


class ParentWithChildrenCreate(BaseModel):
    """Schema for creating a parent with multiple children atomically."""
    creation_type: FamilyCreationType = Field(
        default=FamilyCreationType.PARENT_WITH_CHILDREN,
        description="Type of family creation"
    )
    parent_data: ParentCreate = Field(
        description="Parent profile data including user account information"
    )
    children_data: List[EnhancedStudentCreate] = Field(
        default_factory=list,
        description="List of children to create with relationship settings"
    )
    organization_id: Optional[str] = Field(
        default=None,
        description="Organization ID for sponsored family membership"
    )
    family_notes: Optional[str] = Field(
        default=None,
        description="General family notes or special instructions"
    )
    
    @validator('children_data')
    def validate_children_data(cls, v):
        if len(v) > 10:  # Reasonable limit
            raise ValueError("Cannot create more than 10 children at once")
        return v
    
    @root_validator
    def validate_organization_sponsored(cls, values):
        creation_type = values.get('creation_type')
        organization_id = values.get('organization_id')
        
        if creation_type == FamilyCreationType.ORGANIZATION_SPONSORED and not organization_id:
            raise ValueError("Organization ID is required for organization sponsored families")
        
        return values
    
    class Config:
        json_schema_extra = {
            "example": {
                "creation_type": "parent_with_children",
                "parent_data": {
                    "username": "sarah.johnson",
                    "email": "sarah.johnson@email.com",
                    "password": "SecurePass123!",
                    "first_name": "Sarah",
                    "last_name": "Johnson",
                    "salutation": "Mrs.",
                    "phone": "+1234567890",
                    "address": {"street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345"},
                    "occupation": "Teacher",
                    "payment_responsibility": True
                },
                "children_data": [
                    {
                        "first_name": "Emma",
                        "last_name": "Johnson",
                        "date_of_birth": "2015-03-15",
                        "inherit_from_parent": True,
                        "relationship_settings": {
                            "can_pickup": True,
                            "is_emergency_contact": True,
                            "has_payment_responsibility": True
                        }
                    }
                ],
                "family_notes": "Single parent family, Emma is very shy"
            }
        }


class MultiParentFamily(BaseModel):
    """Schema for creating families with multiple parents."""
    creation_type: FamilyCreationType = Field(
        default=FamilyCreationType.MULTI_PARENT_FAMILY,
        description="Type of family creation"
    )
    parents_data: List[ParentCreate] = Field(
        min_items=2,
        max_items=4,
        description="List of parents to create (2-4 parents supported)"
    )
    children_data: List[EnhancedStudentCreate] = Field(
        default_factory=list,
        description="List of children to create"
    )
    parent_child_mappings: List[Dict[str, Any]] = Field(
        description="Mapping of which parents are related to which children"
    )
    organization_id: Optional[str] = Field(
        default=None,
        description="Organization ID for sponsored family membership"
    )
    family_structure_notes: Optional[str] = Field(
        default=None,
        description="Notes about the family structure (divorced, blended, etc.)"
    )
    
    @validator('parent_child_mappings')
    def validate_parent_child_mappings(cls, v, values):
        parents_count = len(values.get('parents_data', []))
        children_count = len(values.get('children_data', []))
        
        for mapping in v:
            parent_index = mapping.get('parent_index')
            child_index = mapping.get('child_index')
            
            if parent_index is None or child_index is None:
                raise ValueError("Each mapping must have parent_index and child_index")
            
            if parent_index < 0 or parent_index >= parents_count:
                raise ValueError(f"parent_index {parent_index} out of range")
            
            if child_index < 0 or child_index >= children_count:
                raise ValueError(f"child_index {child_index} out of range")
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "creation_type": "multi_parent_family",
                "parents_data": [
                    {
                        "username": "john.doe",
                        "email": "john.doe@email.com",
                        "password": "SecurePass123!",
                        "first_name": "John",
                        "last_name": "Doe",
                        "salutation": "Mr.",
                        "phone": "+1234567890"
                    },
                    {
                        "username": "jane.doe",
                        "email": "jane.doe@email.com",
                        "password": "SecurePass456!",
                        "first_name": "Jane",
                        "last_name": "Doe",
                        "salutation": "Ms.",
                        "phone": "+1234567891"
                    }
                ],
                "children_data": [
                    {
                        "first_name": "Alex",
                        "last_name": "Doe",
                        "date_of_birth": "2012-08-20"
                    }
                ],
                "parent_child_mappings": [
                    {
                        "parent_index": 0,
                        "child_index": 0,
                        "relationship_settings": {
                            "can_pickup": True,
                            "is_emergency_contact": True,
                            "has_payment_responsibility": True
                        }
                    },
                    {
                        "parent_index": 1,
                        "child_index": 0,
                        "relationship_settings": {
                            "can_pickup": True,
                            "is_emergency_contact": True,
                            "has_payment_responsibility": False
                        }
                    }
                ],
                "family_structure_notes": "Divorced parents with shared custody"
            }
        }


class StudentToParentLink(BaseModel):
    """Schema for linking an existing student to an existing parent."""
    student_id: str = Field(description="ID of existing student profile")
    parent_id: str = Field(description="ID of existing parent profile")
    relationship_settings: RelationshipSettings = Field(
        default_factory=RelationshipSettings,
        description="Relationship settings for this parent-child link"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "123e4567-e89b-12d3-a456-426614174000",
                "parent_id": "123e4567-e89b-12d3-a456-426614174001",
                "relationship_settings": {
                    "can_pickup": True,
                    "is_emergency_contact": False,
                    "has_payment_responsibility": False,
                    "pickup_notes": "Secondary guardian, requires permission from primary"
                }
            }
        }


class FamilyCreationResponse(BaseModel):
    """Response schema for family creation operations."""
    success: bool = Field(description="Whether the operation was successful")
    creation_type: FamilyCreationType = Field(description="Type of family creation performed")
    created_parents: List[Dict[str, Any]] = Field(
        description="List of created parent profiles with user information"
    )
    created_children: List[Dict[str, Any]] = Field(
        description="List of created student profiles with user information"
    )
    created_relationships: List[Dict[str, Any]] = Field(
        description="List of created parent-child relationships"
    )
    organization_memberships: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of created organization memberships"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Any warnings or issues that occurred during creation"
    )
    family_id: Optional[str] = Field(
        default=None,
        description="Generated family identifier for tracking"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "creation_type": "parent_with_children",
                "created_parents": [
                    {
                        "parent_id": "123e4567-e89b-12d3-a456-426614174000",
                        "user_id": "123e4567-e89b-12d3-a456-426614174001",
                        "first_name": "Sarah",
                        "last_name": "Johnson",
                        "email": "sarah.johnson@email.com"
                    }
                ],
                "created_children": [
                    {
                        "student_id": "123e4567-e89b-12d3-a456-426614174002",
                        "user_id": "123e4567-e89b-12d3-a456-426614174003",
                        "first_name": "Emma",
                        "last_name": "Johnson",
                        "has_login_credentials": False
                    }
                ],
                "created_relationships": [
                    {
                        "parent_id": "123e4567-e89b-12d3-a456-426614174000",
                        "student_id": "123e4567-e89b-12d3-a456-426614174002",
                        "can_pickup": True,
                        "is_emergency_contact": True,
                        "has_payment_responsibility": True
                    }
                ],
                "organization_memberships": [],
                "warnings": [],
                "family_id": "family_johnson_20250128"
            }
        }


class FamilySearchParams(BaseModel):
    """Parameters for searching and filtering families."""
    search_query: Optional[str] = Field(
        default=None,
        description="Search by parent or child names, email, phone"
    )
    family_size_min: Optional[int] = Field(
        default=None,
        ge=1,
        description="Minimum family size (parent + children count)"
    )
    family_size_max: Optional[int] = Field(
        default=None,
        ge=1,
        description="Maximum family size (parent + children count)"
    )
    has_organization: Optional[bool] = Field(
        default=None,
        description="Filter families with organization membership"
    )
    organization_id: Optional[str] = Field(
        default=None,
        description="Filter by specific organization"
    )
    creation_date_from: Optional[date] = Field(
        default=None,
        description="Filter families created after this date"
    )
    creation_date_to: Optional[date] = Field(
        default=None,
        description="Filter families created before this date"
    )
    include_inactive: bool = Field(
        default=False,
        description="Include families with inactive members"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "search_query": "Johnson",
                "family_size_min": 2,
                "family_size_max": 5,
                "has_organization": True,
                "creation_date_from": "2025-01-01",
                "include_inactive": False
            }
        }


class FamilyStructureResponse(BaseModel):
    """Response schema for family structure queries."""
    family_id: str = Field(description="Family identifier")
    parents: List[Dict[str, Any]] = Field(description="Parent information and profiles")
    children: List[Dict[str, Any]] = Field(description="Children information and profiles")
    relationships: List[Dict[str, Any]] = Field(description="Parent-child relationship details")
    organization_memberships: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Organization memberships for family members"
    )
    family_statistics: Dict[str, Any] = Field(
        description="Family statistics and summary information"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "family_id": "family_johnson_20250128",
                "parents": [
                    {
                        "parent_id": "123e4567-e89b-12d3-a456-426614174000",
                        "first_name": "Sarah",
                        "last_name": "Johnson",
                        "email": "sarah.johnson@email.com",
                        "phone": "+1234567890",
                        "is_active": True,
                        "payment_responsibility": True
                    }
                ],
                "children": [
                    {
                        "student_id": "123e4567-e89b-12d3-a456-426614174002",
                        "first_name": "Emma",
                        "last_name": "Johnson",
                        "date_of_birth": "2015-03-15",
                        "is_active": True,
                        "has_login_credentials": False
                    }
                ],
                "relationships": [
                    {
                        "parent_id": "123e4567-e89b-12d3-a456-426614174000",
                        "student_id": "123e4567-e89b-12d3-a456-426614174002",
                        "can_pickup": True,
                        "is_emergency_contact": True,
                        "has_payment_responsibility": True,
                        "relationship_type": "parent"
                    }
                ],
                "organization_memberships": [],
                "family_statistics": {
                    "total_members": 2,
                    "parent_count": 1,
                    "children_count": 1,
                    "active_members": 2,
                    "has_organization_sponsorship": False
                }
            }
        }