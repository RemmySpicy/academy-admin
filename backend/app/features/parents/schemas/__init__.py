"""
Parent Schemas

Pydantic schemas for parent management and API operations.
"""

from .parent import (
    ParentBase,
    ParentCreate,
    ParentUpdate,
    ParentResponse,
    ParentListResponse,
    ParentSearchParams,
    ParentStatsResponse,
)
from .relationship import (
    ParentChildRelationshipBase,
    ParentChildRelationshipCreate,
    ParentChildRelationshipUpdate,
    ParentChildRelationshipResponse,
    FamilyStructureResponse,
)
from .family_creation import (
    FamilyCreationType,
    RelationshipSettings,
    EnhancedStudentCreate,
    ParentWithChildrenCreate,
    MultiParentFamily,
    StudentToParentLink,
    FamilyCreationResponse,
    FamilySearchParams,
    FamilyStructureResponse as ComprehensiveFamilyStructureResponse,
)

__all__ = [
    # Parent schemas
    "ParentBase",
    "ParentCreate", 
    "ParentUpdate",
    "ParentResponse",
    "ParentListResponse",
    "ParentSearchParams",
    "ParentStatsResponse",
    # Relationship schemas
    "ParentChildRelationshipBase",
    "ParentChildRelationshipCreate",
    "ParentChildRelationshipUpdate", 
    "ParentChildRelationshipResponse",
    "FamilyStructureResponse",
    # Family creation schemas
    "FamilyCreationType",
    "RelationshipSettings",
    "EnhancedStudentCreate",
    "ParentWithChildrenCreate",
    "MultiParentFamily",
    "StudentToParentLink",
    "FamilyCreationResponse",
    "FamilySearchParams",
    "ComprehensiveFamilyStructureResponse",
]