"""
Advanced schemas for curriculum management API.
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class SearchEntityType(str, Enum):
    """Entity types for search operations."""
    PROGRAM = "program"
    COURSE = "course"
    CURRICULUM = "curriculum"
    LEVEL = "level"
    MODULE = "module"
    SECTION = "section"
    LESSON = "lesson"
    ASSESSMENT = "assessment"
    EQUIPMENT = "equipment"
    MEDIA = "media"


class BulkOperationType(str, Enum):
    """Types of bulk operations."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    MOVE = "move"
    STATUS_CHANGE = "status_change"
    DUPLICATE = "duplicate"
    ARCHIVE = "archive"
    RESTORE = "restore"


class ExportFormat(str, Enum):
    """Export formats."""
    JSON = "json"
    CSV = "csv"
    XLSX = "xlsx"
    PDF = "pdf"
    SCORM = "scorm"


# Tree Navigation Schemas
class TreeNode(BaseModel):
    """Base tree node structure."""
    id: str
    name: str
    type: str
    status: str
    sequence: Optional[int] = None
    children: List['TreeNode'] = []
    metadata: Dict[str, Any] = {}


class FullCurriculumTreeResponse(BaseModel):
    """Complete curriculum tree response."""
    programs: List[TreeNode]
    total_programs: int
    total_courses: int
    total_curricula: int
    total_levels: int
    total_modules: int
    total_sections: int
    total_lessons: int
    total_assessments: int
    tree_depth: int
    generated_at: datetime


# Search Schemas
class SearchFilter(BaseModel):
    """Search filter criteria."""
    field: str
    operator: str = Field(..., pattern="^(eq|ne|gt|lt|gte|lte|in|not_in|contains|starts_with|ends_with)$")
    value: Union[str, int, float, bool, List[Any]]


class SearchSort(BaseModel):
    """Search sorting criteria."""
    field: str
    order: str = Field("asc", pattern="^(asc|desc)$")


class CurriculumSearchRequest(BaseModel):
    """Advanced search request."""
    query: Optional[str] = None
    entity_types: List[SearchEntityType] = []
    filters: List[SearchFilter] = []
    sort: List[SearchSort] = []
    facets: List[str] = []
    highlight: bool = True
    include_inactive: bool = False
    search_content: bool = True
    search_metadata: bool = True


class SearchResult(BaseModel):
    """Individual search result."""
    id: str
    entity_type: SearchEntityType
    title: str
    description: Optional[str] = None
    path: List[str] = []
    relevance_score: float
    highlights: Dict[str, List[str]] = {}
    metadata: Dict[str, Any] = {}


class SearchFacet(BaseModel):
    """Search facet information."""
    field: str
    values: List[Dict[str, Any]]


class CurriculumSearchResponse(BaseModel):
    """Advanced search response."""
    results: List[SearchResult]
    facets: List[SearchFacet]
    total: int
    page: int
    limit: int
    total_pages: int
    search_time_ms: int
    suggestions: List[str] = []


# Bulk Operations Schemas
class BulkOperation(BaseModel):
    """Individual bulk operation."""
    operation_type: BulkOperationType
    entity_type: SearchEntityType
    entity_id: str
    data: Dict[str, Any] = {}
    target_id: Optional[str] = None


class BulkCurriculumOperationRequest(BaseModel):
    """Bulk operation request."""
    operations: List[BulkOperation]
    dry_run: bool = False
    continue_on_error: bool = True
    batch_size: int = Field(100, ge=1, le=1000)


# Analytics Schemas
class EntityStats(BaseModel):
    """Statistics for an entity type."""
    total_count: int
    active_count: int
    inactive_count: int
    draft_count: int
    published_count: int
    average_duration: Optional[float] = None
    completion_rate: Optional[float] = None


class UsageStats(BaseModel):
    """Usage statistics."""
    total_views: int
    unique_users: int
    average_time_spent: float
    most_popular_items: List[Dict[str, Any]]
    peak_usage_times: List[Dict[str, Any]]


class StudentProgress(BaseModel):
    """Student progress statistics."""
    total_students: int
    active_students: int
    average_progress: float
    completion_rate: float
    struggling_students: int
    top_performers: int


class CurriculumAnalyticsResponse(BaseModel):
    """Curriculum analytics response."""
    entity_stats: Dict[str, EntityStats]
    usage_stats: UsageStats
    student_progress: StudentProgress
    trends: Dict[str, List[Dict[str, Any]]]
    recommendations: List[str]
    generated_at: datetime
    date_range: Dict[str, str]


# Path and Dependencies Schemas
class PathNode(BaseModel):
    """Node in curriculum path."""
    id: str
    name: str
    type: str
    level: int
    metadata: Dict[str, Any] = {}


class CurriculumPathResponse(BaseModel):
    """Curriculum path response."""
    lesson_id: str
    path: List[PathNode]
    total_depth: int
    prerequisites: List[str] = []
    next_lessons: List[str] = []


class Dependency(BaseModel):
    """Dependency relationship."""
    entity_id: str
    entity_type: str
    entity_name: str
    dependency_type: str
    is_required: bool
    can_be_removed: bool


class CurriculumDependencyResponse(BaseModel):
    """Curriculum dependency response."""
    entity_id: str
    entity_type: str
    entity_name: str
    dependencies: List[Dependency]
    dependents: List[Dependency]
    impact_analysis: Dict[str, Any]


# Export/Import Schemas
class CurriculumExportRequest(BaseModel):
    """Curriculum export request."""
    entity_type: SearchEntityType
    entity_id: str
    format: ExportFormat
    include_children: bool = True
    include_assessments: bool = True
    include_equipment: bool = True
    include_media: bool = True
    include_versions: bool = False
    custom_fields: List[str] = []


class CurriculumImportRequest(BaseModel):
    """Curriculum import request."""
    format: ExportFormat
    data: Union[str, Dict[str, Any]]
    target_program_id: str
    merge_strategy: str = Field("create_new", pattern="^(create_new|merge|replace)$")
    validate_only: bool = False
    custom_mappings: Dict[str, str] = {}


# Template Schemas
class CurriculumTemplateResponse(BaseModel):
    """Curriculum template response."""
    id: str
    name: str
    description: str
    template_type: str
    is_public: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
    usage_count: int
    rating: Optional[float] = None
    tags: List[str] = []
    preview_data: Dict[str, Any] = {}


# Update the TreeNode model to handle forward references
TreeNode.model_rebuild()