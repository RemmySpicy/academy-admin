"""
Curriculum schemas for the academy management system.
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

# Program schemas
from .program import (
    ProgramBase, 
    ProgramCreate, 
    ProgramUpdate, 
    ProgramResponse, 
    ProgramListResponse,
    ProgramSearchParams,
    ProgramStatsResponse,
    ProgramTreeResponse
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

# Curriculum schemas
from .curriculum import (
    CurriculumBase, 
    CurriculumCreate, 
    CurriculumUpdate, 
    CurriculumResponse, 
    CurriculumListResponse,
    CurriculumSearchParams,
    CurriculumStatsResponse,
    CurriculumTreeResponse,
    CurriculumBulkMoveRequest,
    CurriculumBulkStatusUpdateRequest,
    CurriculumDuplicateRequest
)

# Level schemas
from .level import (
    LevelBase, 
    LevelCreate, 
    LevelUpdate, 
    LevelResponse, 
    LevelListResponse,
    LevelSearchParams,
    LevelStatsResponse,
    LevelTreeResponse,
    LevelReorderRequest,
    LevelBulkStatusUpdateRequest,
    LevelProgressTrackingResponse
)

# Module schemas
from .module import (
    ModuleBase, 
    ModuleCreate, 
    ModuleUpdate, 
    ModuleResponse, 
    ModuleListResponse,
    ModuleSearchParams,
    ModuleStatsResponse,
    ModuleTreeResponse,
    ModuleReorderRequest,
    ModuleBulkStatusUpdateRequest,
    ModuleProgressTrackingResponse,
    ModuleDuplicateRequest
)

# Section schemas
from .section import (
    SectionBase, 
    SectionCreate, 
    SectionUpdate, 
    SectionResponse, 
    SectionListResponse,
    SectionSearchParams,
    SectionStatsResponse,
    SectionTreeResponse,
    SectionReorderRequest,
    SectionBulkStatusUpdateRequest,
    SectionProgressTrackingResponse,
    SectionDuplicateRequest
)

# Lesson schemas
from .lesson import (
    LessonBase, 
    LessonCreate, 
    LessonUpdate, 
    LessonResponse, 
    LessonListResponse,
    LessonSearchParams,
    LessonStatsResponse,
    LessonDetailResponse,
    LessonReorderRequest,
    LessonBulkStatusUpdateRequest,
    LessonProgressTrackingResponse,
    LessonDuplicateRequest,
    LessonContentVersionRequest,
    ContentTypeEnum
)

# Assessment schemas
from .assessment import (
    AssessmentRubricBase, 
    AssessmentRubricCreate, 
    AssessmentRubricUpdate, 
    AssessmentRubricResponse,
    AssessmentRubricListResponse,
    AssessmentCriteriaBase, 
    AssessmentCriteriaCreate, 
    AssessmentCriteriaUpdate, 
    AssessmentCriteriaResponse,
    AssessmentCriteriaListResponse,
    AssessmentSearchParams,
    AssessmentStatsResponse,
    AssessmentRubricDetailResponse,
    AssessmentRubricBulkCreateRequest,
    AssessmentRubricCopyRequest,
    AssessmentReorderRequest,
    StudentAssessmentResponse
)

# Equipment schemas
from .equipment import (
    EquipmentRequirementBase, 
    EquipmentRequirementCreate, 
    EquipmentRequirementUpdate, 
    EquipmentRequirementResponse,
    EquipmentRequirementListResponse,
    EquipmentSearchParams,
    EquipmentStatsResponse,
    EquipmentInventoryResponse,
    EquipmentBulkUpdateRequest,
    EquipmentMaintenanceRequest,
    EquipmentMaintenanceResponse,
    EquipmentOrderRequest
)

# Media schemas
from .media import (
    MediaLibraryBase, 
    MediaLibraryCreate, 
    MediaLibraryUpdate, 
    MediaLibraryResponse,
    MediaLibraryListResponse,
    MediaSearchParams,
    MediaStatsResponse,
    MediaUploadRequest,
    MediaUploadResponse,
    MediaBulkTagRequest,
    MediaUsageResponse,
    MediaProcessingStatusResponse
)

# Content version schemas
from .content_version import (
    ContentVersionBase, 
    ContentVersionCreate, 
    ContentVersionUpdate, 
    ContentVersionResponse,
    ContentVersionListResponse,
    ContentVersionSearchParams,
    ContentVersionStatsResponse,
    ContentVersionDetailResponse,
    ContentVersionPublishRequest,
    ContentVersionRollbackRequest,
    ContentVersionCompareRequest,
    ContentVersionCompareResponse,
    ContentVersionBulkActionRequest,
    PublicationStatusEnum
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
    
    # Program schemas
    "ProgramBase",
    "ProgramCreate",
    "ProgramUpdate", 
    "ProgramResponse",
    "ProgramListResponse",
    "ProgramSearchParams",
    "ProgramStatsResponse",
    "ProgramTreeResponse",
    
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
    
    # Curriculum schemas
    "CurriculumBase",
    "CurriculumCreate",
    "CurriculumUpdate",
    "CurriculumResponse",
    "CurriculumListResponse",
    "CurriculumSearchParams",
    "CurriculumStatsResponse",
    "CurriculumTreeResponse",
    "CurriculumBulkMoveRequest",
    "CurriculumBulkStatusUpdateRequest",
    "CurriculumDuplicateRequest",
    
    # Level schemas
    "LevelBase",
    "LevelCreate",
    "LevelUpdate",
    "LevelResponse",
    "LevelListResponse",
    "LevelSearchParams",
    "LevelStatsResponse",
    "LevelTreeResponse",
    "LevelReorderRequest",
    "LevelBulkStatusUpdateRequest",
    "LevelProgressTrackingResponse",
    
    # Module schemas
    "ModuleBase",
    "ModuleCreate",
    "ModuleUpdate",
    "ModuleResponse",
    "ModuleListResponse",
    "ModuleSearchParams",
    "ModuleStatsResponse",
    "ModuleTreeResponse",
    "ModuleReorderRequest",
    "ModuleBulkStatusUpdateRequest",
    "ModuleProgressTrackingResponse",
    "ModuleDuplicateRequest",
    
    # Section schemas
    "SectionBase",
    "SectionCreate",
    "SectionUpdate",
    "SectionResponse",
    "SectionListResponse",
    "SectionSearchParams",
    "SectionStatsResponse",
    "SectionTreeResponse",
    "SectionReorderRequest",
    "SectionBulkStatusUpdateRequest",
    "SectionProgressTrackingResponse",
    "SectionDuplicateRequest",
    
    # Lesson schemas
    "LessonBase",
    "LessonCreate",
    "LessonUpdate",
    "LessonResponse",
    "LessonListResponse",
    "LessonSearchParams",
    "LessonStatsResponse",
    "LessonDetailResponse",
    "LessonReorderRequest",
    "LessonBulkStatusUpdateRequest",
    "LessonProgressTrackingResponse",
    "LessonDuplicateRequest",
    "LessonContentVersionRequest",
    "ContentTypeEnum",
    
    # Assessment schemas
    "AssessmentRubricBase",
    "AssessmentRubricCreate",
    "AssessmentRubricUpdate",
    "AssessmentRubricResponse",
    "AssessmentRubricListResponse",
    "AssessmentCriteriaBase",
    "AssessmentCriteriaCreate",
    "AssessmentCriteriaUpdate", 
    "AssessmentCriteriaResponse",
    "AssessmentCriteriaListResponse",
    "AssessmentSearchParams",
    "AssessmentStatsResponse",
    "AssessmentRubricDetailResponse",
    "AssessmentRubricBulkCreateRequest",
    "AssessmentRubricCopyRequest",
    "AssessmentReorderRequest",
    "StudentAssessmentResponse",
    
    # Equipment schemas
    "EquipmentRequirementBase",
    "EquipmentRequirementCreate",
    "EquipmentRequirementUpdate",
    "EquipmentRequirementResponse",
    "EquipmentRequirementListResponse",
    "EquipmentSearchParams",
    "EquipmentStatsResponse",
    "EquipmentInventoryResponse",
    "EquipmentBulkUpdateRequest",
    "EquipmentMaintenanceRequest",
    "EquipmentMaintenanceResponse",
    "EquipmentOrderRequest",
    
    # Media schemas
    "MediaLibraryBase",
    "MediaLibraryCreate",
    "MediaLibraryUpdate",
    "MediaLibraryResponse",
    "MediaLibraryListResponse",
    "MediaSearchParams",
    "MediaStatsResponse",
    "MediaUploadRequest",
    "MediaUploadResponse",
    "MediaBulkTagRequest",
    "MediaUsageResponse",
    "MediaProcessingStatusResponse",
    
    # Content version schemas
    "ContentVersionBase",
    "ContentVersionCreate",
    "ContentVersionUpdate",
    "ContentVersionResponse",
    "ContentVersionListResponse",
    "ContentVersionSearchParams",
    "ContentVersionStatsResponse",
    "ContentVersionDetailResponse",
    "ContentVersionPublishRequest",
    "ContentVersionRollbackRequest",
    "ContentVersionCompareRequest",
    "ContentVersionCompareResponse",
    "ContentVersionBulkActionRequest",
    "PublicationStatusEnum",
]