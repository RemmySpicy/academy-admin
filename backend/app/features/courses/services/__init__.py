"""
Curriculum services for business logic and database operations.
"""

from .base_service import BaseService
from .course_service import CourseService, course_service
from .curriculum_service import CurriculumService, curriculum_service
from .level_service import LevelService, level_service
from .assessment_service import AssessmentService, assessment_service
from .media_service import MediaService, media_service

# TODO: Implement remaining services
# from .module_service import ModuleService, module_service
# from .section_service import SectionService, section_service
# from .lesson_service import LessonService, lesson_service
# from .equipment_service import EquipmentService, equipment_service
# from .content_version_service import ContentVersionService, content_version_service

__all__ = [
    # Base service
    "BaseService",
    
    # Service classes
    "CourseService", 
    "CurriculumService",
    "LevelService",
    "AssessmentService",
    "MediaService",
    
    # Service instances
    "course_service",
    "curriculum_service", 
    "level_service",
    "assessment_service",
    "media_service",
    
    # TODO: Add remaining services
    # "ModuleService",
    # "SectionService",
    # "LessonService",
    # "EquipmentService",
    # "ContentVersionService",
    # "module_service",
    # "section_service",
    # "lesson_service",
    # "equipment_service",
    # "content_version_service",
]