"""
Course schemas for the academy management system.
"""

# Common enums and base schemas
from .common import (
    CurriculumStatusEnum, 
    DifficultyLevelEnum, 
    EquipmentTypeEnum, 
    RubricTypeEnum, 
    MediaTypeEnum,
    TimestampMixin,
    PaginatedResponse,
    TreeNode,
    BulkActionRequest,
    BulkActionResponse
)

# Course schemas
from .course import (
    CourseBase, 
    CourseCreate, 
    CourseUpdate, 
    CourseResponse, 
    CourseListResponse,
    CourseSearchParams,
    CourseStatsResponse,
    CourseTreeResponse,
    CourseBulkMoveRequest,
    CourseBulkStatusUpdateRequest
)


__all__ = [
    # Common enums and base schemas
    "CurriculumStatusEnum",
    "DifficultyLevelEnum", 
    "EquipmentTypeEnum",
    "RubricTypeEnum",
    "MediaTypeEnum",
    "TimestampMixin",
    "PaginatedResponse",
    "TreeNode",
    "BulkActionRequest",
    "BulkActionResponse",
    
    # Course schemas
    "CourseBase",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse", 
    "CourseListResponse",
    "CourseSearchParams",
    "CourseStatsResponse",
    "CourseTreeResponse",
    "CourseBulkMoveRequest",
    "CourseBulkStatusUpdateRequest",
]