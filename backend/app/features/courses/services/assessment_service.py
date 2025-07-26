"""
Assessment service for curriculum management operations.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc
import json

from app.features.programs.models.program import Program
from app.features.courses.models.course import Course
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.level import Level
from app.features.courses.models.module import Module
from app.features.courses.models.section import Section
from app.features.courses.models.lesson import Lesson
from app.features.courses.models.assessment import AssessmentRubric, AssessmentCriteria
from app.features.courses.schemas.assessment import (
    AssessmentRubricCreate,
    AssessmentRubricUpdate,
    AssessmentRubricResponse,
    AssessmentRubricDetailResponse,
    AssessmentCriteriaCreate,
    AssessmentCriteriaUpdate,
    AssessmentCriteriaResponse,
    AssessmentSearchParams,
    AssessmentStatsResponse,
    AssessmentRubricBulkCreateRequest,
    AssessmentRubricCopyRequest,
    AssessmentReorderRequest,
    StudentAssessmentResponse
)
from .base_service import BaseService


class AssessmentService(BaseService[AssessmentRubric, AssessmentRubricCreate, AssessmentRubricUpdate]):
    """Service for assessment operations."""
    
    def __init__(self):
        super().__init__(AssessmentRubric)
    
    def create_rubric(self, 
                     db: Session, 
                     rubric_data: AssessmentRubricCreate, 
                     created_by: Optional[str] = None) -> AssessmentRubricResponse:
        """Create a new assessment rubric."""
        # Validate that at least one target (lesson, section, or module) is specified
        targets = [rubric_data.lesson_id, rubric_data.section_id, rubric_data.module_id]
        if not any(targets):
            raise ValueError("At least one target (lesson_id, section_id, or module_id) must be specified")
        
        # Validate that only one target is specified
        if sum(1 for target in targets if target is not None) > 1:
            raise ValueError("Only one target (lesson_id, section_id, or module_id) can be specified")
        
        # Verify target exists
        if rubric_data.lesson_id:
            lesson = db.query(Lesson).filter(Lesson.id == rubric_data.lesson_id).first()
            if not lesson:
                raise ValueError(f"Lesson with ID '{rubric_data.lesson_id}' not found")
        elif rubric_data.section_id:
            section = db.query(Section).filter(Section.id == rubric_data.section_id).first()
            if not section:
                raise ValueError(f"Section with ID '{rubric_data.section_id}' not found")
        elif rubric_data.module_id:
            module = db.query(Module).filter(Module.id == rubric_data.module_id).first()
            if not module:
                raise ValueError(f"Module with ID '{rubric_data.module_id}' not found")
        
        # Create rubric
        rubric = self.create(db, rubric_data, created_by)
        
        return self._to_rubric_response(db, rubric)
    
    def get_rubric(self, db: Session, rubric_id: str) -> Optional[AssessmentRubricResponse]:
        """Get assessment rubric by ID."""
        rubric = self.get(db, rubric_id)
        if not rubric:
            return None
        
        return self._to_rubric_response(db, rubric)
    
    def get_rubric_detail(self, db: Session, rubric_id: str) -> Optional[AssessmentRubricDetailResponse]:
        """Get assessment rubric with all criteria."""
        rubric = db.query(AssessmentRubric).options(
            joinedload(AssessmentRubric.criteria)
        ).filter(AssessmentRubric.id == rubric_id).first()
        
        if not rubric:
            return None
        
        # Convert to detail response
        rubric_response = self._to_rubric_response(db, rubric)
        criteria_responses = [self._to_criteria_response(db, criteria) for criteria in rubric.criteria]
        
        return AssessmentRubricDetailResponse(
            **rubric_response.dict(),
            criteria=criteria_responses
        )
    
    def update_rubric(self, 
                     db: Session, 
                     rubric_id: str, 
                     rubric_data: AssessmentRubricUpdate,
                     updated_by: Optional[str] = None) -> Optional[AssessmentRubricResponse]:
        """Update assessment rubric information."""
        rubric = self.get(db, rubric_id)
        if not rubric:
            return None
        
        # Update rubric
        updated_rubric = self.update(db, rubric, rubric_data, updated_by)
        
        return self._to_rubric_response(db, updated_rubric)
    
    def delete_rubric(self, db: Session, rubric_id: str) -> bool:
        """Delete an assessment rubric and all its criteria."""
        # Delete criteria first
        db.query(AssessmentCriteria).filter(
            AssessmentCriteria.rubric_id == rubric_id
        ).delete()
        
        # Delete rubric
        return self.delete(db, rubric_id)
    
    def create_criteria(self, 
                       db: Session, 
                       criteria_data: AssessmentCriteriaCreate, 
                       created_by: Optional[str] = None) -> AssessmentCriteriaResponse:
        """Create assessment criteria for a rubric."""
        # Verify rubric exists
        rubric = db.query(AssessmentRubric).filter(AssessmentRubric.id == criteria_data.rubric_id).first()
        if not rubric:
            raise ValueError(f"Rubric with ID '{criteria_data.rubric_id}' not found")
        
        # Validate star descriptors based on rubric's total possible stars
        total_stars = rubric.total_possible_stars
        required_descriptors = ["star_0_descriptor"]  # Always need 0 stars
        
        for i in range(1, total_stars + 1):
            required_descriptors.append(f"star_{i}_descriptor")
        
        # Check that we have descriptors for all required star levels
        criteria_dict = criteria_data.dict()
        for descriptor in required_descriptors:
            if not criteria_dict.get(descriptor):
                raise ValueError(f"Missing descriptor for {descriptor.replace('_', ' ').title()}")
        
        # Check that we don't have descriptors for star levels beyond the rubric's max
        for i in range(total_stars + 1, 6):  # 6 is max possible stars + 1
            descriptor = f"star_{i}_descriptor"
            if criteria_dict.get(descriptor):
                raise ValueError(f"Cannot have descriptor for {i} stars when rubric max is {total_stars}")
        
        # Create criteria
        criteria = AssessmentCriteria(**criteria_dict)
        if created_by:
            criteria.created_by = created_by
        
        db.add(criteria)
        db.commit()
        db.refresh(criteria)
        
        return self._to_criteria_response(db, criteria)
    
    def update_criteria(self, 
                       db: Session, 
                       criteria_id: str, 
                       criteria_data: AssessmentCriteriaUpdate,
                       updated_by: Optional[str] = None) -> Optional[AssessmentCriteriaResponse]:
        """Update assessment criteria."""
        criteria = db.query(AssessmentCriteria).filter(AssessmentCriteria.id == criteria_id).first()
        if not criteria:
            return None
        
        # Update criteria
        criteria_dict = criteria_data.dict(exclude_unset=True)
        if updated_by:
            criteria_dict['updated_by'] = updated_by
        
        for field, value in criteria_dict.items():
            if hasattr(criteria, field):
                setattr(criteria, field, value)
        
        db.add(criteria)
        db.commit()
        db.refresh(criteria)
        
        return self._to_criteria_response(db, criteria)
    
    def delete_criteria(self, db: Session, criteria_id: str) -> bool:
        """Delete assessment criteria."""
        criteria = db.query(AssessmentCriteria).filter(AssessmentCriteria.id == criteria_id).first()
        if criteria:
            db.delete(criteria)
            db.commit()
            return True
        return False
    
    def list_rubrics(self, 
                    db: Session,
                    search_params: Optional[AssessmentSearchParams] = None,
                    page: int = 1,
                    per_page: int = 20) -> Tuple[List[AssessmentRubricResponse], int]:
        """List assessment rubrics with optional search and pagination."""
        query = db.query(AssessmentRubric)
        
        # Join tables for filtering
        if search_params and any([
            search_params.lesson_id, search_params.section_id, search_params.module_id,
            search_params.level_id, search_params.curriculum_id, search_params.course_id,
            search_params.program_id
        ]):
            # Add joins as needed for filtering
            if search_params.lesson_id:
                query = query.filter(AssessmentRubric.lesson_id == search_params.lesson_id)
            if search_params.section_id:
                query = query.filter(AssessmentRubric.section_id == search_params.section_id)
            if search_params.module_id:
                query = query.filter(AssessmentRubric.module_id == search_params.module_id)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        AssessmentRubric.name.ilike(search_term),
                        AssessmentRubric.description.ilike(search_term)
                    )
                )
            
            if search_params.rubric_type:
                query = query.filter(AssessmentRubric.rubric_type == search_params.rubric_type)
            
            if search_params.status:
                query = query.filter(AssessmentRubric.status == search_params.status)
            
            if search_params.is_required is not None:
                query = query.filter(AssessmentRubric.is_required == search_params.is_required)
            
            if search_params.total_stars_min:
                query = query.filter(AssessmentRubric.total_possible_stars >= search_params.total_stars_min)
            
            if search_params.total_stars_max:
                query = query.filter(AssessmentRubric.total_possible_stars <= search_params.total_stars_max)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(AssessmentRubric, search_params.sort_by, AssessmentRubric.sequence)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(asc(AssessmentRubric.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        rubrics = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        rubric_responses = [self._to_rubric_response(db, rubric) for rubric in rubrics]
        
        return rubric_responses, total_count
    
    def get_assessment_stats(self, db: Session) -> AssessmentStatsResponse:
        """Get assessment statistics."""
        # Total rubrics and criteria
        total_rubrics = db.query(func.count(AssessmentRubric.id)).scalar()
        total_criteria = db.query(func.count(AssessmentCriteria.id)).scalar()
        
        # Rubrics by type
        type_stats = db.query(
            AssessmentRubric.rubric_type,
            func.count(AssessmentRubric.id)
        ).group_by(AssessmentRubric.rubric_type).all()
        rubrics_by_type = dict(type_stats)
        
        # Rubrics by status
        status_stats = db.query(
            AssessmentRubric.status,
            func.count(AssessmentRubric.id)
        ).group_by(AssessmentRubric.status).all()
        rubrics_by_status = dict(status_stats)
        
        # Average criteria per rubric
        avg_criteria_per_rubric = total_criteria / total_rubrics if total_rubrics > 0 else 0
        
        # Average total stars
        avg_total_stars = db.query(func.avg(AssessmentRubric.total_possible_stars)).scalar() or 0
        
        # Required rubrics count
        required_rubrics_count = db.query(func.count(AssessmentRubric.id)).filter(
            AssessmentRubric.is_required == True
        ).scalar()
        
        # Placeholder stats
        rubrics_by_curriculum = {}
        rubrics_by_program = {}
        usage_stats = {
            "total_assessments_completed": 1250,
            "average_score": 2.3,
            "most_used_rubric_types": ["technical_skills", "safety_compliance", "creativity"]
        }
        
        return AssessmentStatsResponse(
            total_rubrics=total_rubrics,
            total_criteria=total_criteria,
            rubrics_by_type=rubrics_by_type,
            rubrics_by_status=rubrics_by_status,
            rubrics_by_curriculum=rubrics_by_curriculum,
            rubrics_by_program=rubrics_by_program,
            average_criteria_per_rubric=avg_criteria_per_rubric,
            average_total_stars=avg_total_stars,
            required_rubrics_count=required_rubrics_count,
            usage_stats=usage_stats
        )
    
    def copy_rubric(self, 
                   db: Session, 
                   rubric_id: str,
                   request: AssessmentRubricCopyRequest,
                   created_by: Optional[str] = None) -> AssessmentRubricResponse:
        """Copy an assessment rubric to a new target."""
        # Get original rubric with criteria
        original = db.query(AssessmentRubric).options(
            joinedload(AssessmentRubric.criteria)
        ).filter(AssessmentRubric.id == rubric_id).first()
        
        if not original:
            raise ValueError(f"Rubric with ID '{rubric_id}' not found")
        
        # Validate target
        targets = [request.target_lesson_id, request.target_section_id, request.target_module_id]
        if not any(targets):
            raise ValueError("At least one target must be specified")
        
        if sum(1 for target in targets if target is not None) > 1:
            raise ValueError("Only one target can be specified")
        
        # Create new rubric
        new_rubric_data = {
            "name": request.new_name,
            "description": original.description,
            "lesson_id": request.target_lesson_id,
            "section_id": request.target_section_id,
            "module_id": request.target_module_id,
            "rubric_type": original.rubric_type,
            "total_possible_stars": original.total_possible_stars,
            "weight_percentage": original.weight_percentage,
            "sequence": 1,  # Will be updated to max + 1
            "is_required": original.is_required,
            "status": "draft"  # Always start as draft
        }
        
        new_rubric = AssessmentRubric(**new_rubric_data)
        if created_by:
            new_rubric.created_by = created_by
        
        db.add(new_rubric)
        db.flush()  # Get the ID without committing
        
        # Copy criteria if requested
        if request.copy_criteria:
            for original_criteria in original.criteria:
                new_criteria_data = {
                    "rubric_id": new_rubric.id,
                    "criterion_name": original_criteria.criterion_name,
                    "star_0_descriptor": original_criteria.star_0_descriptor,
                    "star_1_descriptor": original_criteria.star_1_descriptor,
                    "star_2_descriptor": original_criteria.star_2_descriptor,
                    "star_3_descriptor": original_criteria.star_3_descriptor,
                    "star_4_descriptor": original_criteria.star_4_descriptor,
                    "star_5_descriptor": original_criteria.star_5_descriptor,
                    "weight_percentage": original_criteria.weight_percentage,
                    "sequence": original_criteria.sequence
                }
                
                # Adjust criteria for target context if requested
                if request.adjust_for_target:
                    # This could involve modifying descriptors based on target context
                    # For now, just keep them as-is
                    pass
                
                new_criteria = AssessmentCriteria(**new_criteria_data)
                if created_by:
                    new_criteria.created_by = created_by
                
                db.add(new_criteria)
        
        db.commit()
        db.refresh(new_rubric)
        
        return self._to_rubric_response(db, new_rubric)
    
    def reorder_assessments(self, 
                           db: Session, 
                           request: AssessmentReorderRequest,
                           updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Reorder assessments by updating sequence."""
        successful = []
        failed = []
        
        for order_data in request.assessment_orders:
            try:
                assessment_id = order_data["id"]
                new_sequence = order_data["sequence"]
                
                assessment = self.get(db, assessment_id)
                if assessment:
                    assessment.sequence = new_sequence
                    if updated_by and hasattr(assessment, 'updated_by'):
                        assessment.updated_by = updated_by
                    
                    db.add(assessment)
                    successful.append(assessment_id)
                else:
                    failed.append({"id": assessment_id, "error": "Assessment not found"})
                    
            except Exception as e:
                failed.append({"id": order_data.get("id", "unknown"), "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.assessment_orders),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def bulk_create_rubrics(self, 
                           db: Session, 
                           request: AssessmentRubricBulkCreateRequest,
                           created_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk create assessment rubrics."""
        successful = []
        failed = []
        
        for rubric_data in request.rubrics:
            try:
                # Convert dict to schema
                rubric_create = AssessmentRubricCreate(**rubric_data)
                rubric = self.create_rubric(db, rubric_create, created_by)
                successful.append(rubric.id)
                
            except Exception as e:
                failed.append({"data": rubric_data, "error": str(e)})
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.rubrics),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def get_student_assessment(self, 
                              db: Session, 
                              student_id: str, 
                              rubric_id: str) -> Optional[StudentAssessmentResponse]:
        """Get student assessment results for a specific rubric."""
        # This would typically query a student_assessments table
        # For now, return placeholder data
        rubric = self.get(db, rubric_id)
        if not rubric:
            return None
        
        # Placeholder implementation
        return StudentAssessmentResponse(
            student_id=student_id,
            student_name="John Doe",
            rubric_id=rubric_id,
            rubric_name=rubric.name,
            total_score=7.5,
            max_possible_score=9.0,
            percentage=83.33,
            criteria_scores=[
                {
                    "criteria_id": "criteria-id-1",
                    "criterion_name": "Technical Skills",
                    "score": 2.5,
                    "max_score": 3.0
                }
            ],
            assessed_by="instructor-id-1",
            assessed_at="2025-01-08T14:30:00Z",
            notes="Good understanding of basic concepts"
        )
    
    def _to_rubric_response(self, db: Session, rubric: AssessmentRubric) -> AssessmentRubricResponse:
        """Convert AssessmentRubric model to AssessmentRubricResponse."""
        # Get related entity information
        lesson_title = None
        section_name = None
        module_name = None
        level_name = None
        curriculum_name = None
        course_name = None
        program_name = None
        program_code = None
        
        if rubric.lesson_id:
            lesson = db.query(Lesson).filter(Lesson.id == rubric.lesson_id).first()
            if lesson:
                lesson_title = lesson.title
                # Get section, module, level, etc. through relationships
        elif rubric.section_id:
            section = db.query(Section).filter(Section.id == rubric.section_id).first()
            if section:
                section_name = section.name
        elif rubric.module_id:
            module = db.query(Module).filter(Module.id == rubric.module_id).first()
            if module:
                module_name = module.name
        
        # Get criteria count
        criteria_count = db.query(func.count(AssessmentCriteria.id)).filter(
            AssessmentCriteria.rubric_id == rubric.id
        ).scalar() or 0
        
        # Placeholder usage data
        usage_count = 127
        average_score = 2.3
        
        return AssessmentRubricResponse(
            id=rubric.id,
            name=rubric.name,
            description=rubric.description,
            lesson_id=rubric.lesson_id,
            lesson_title=lesson_title,
            section_id=rubric.section_id,
            section_name=section_name,
            module_id=rubric.module_id,
            module_name=module_name,
            level_name=level_name,
            curriculum_name=curriculum_name,
            course_name=course_name,
            program_name=program_name,
            program_code=program_code,
            rubric_type=rubric.rubric_type,
            total_possible_stars=rubric.total_possible_stars,
            weight_percentage=rubric.weight_percentage,
            sequence=rubric.sequence,
            is_required=rubric.is_required,
            status=rubric.status,
            criteria_count=criteria_count,
            usage_count=usage_count,
            average_score=average_score,
            created_by=rubric.created_by,
            updated_by=rubric.updated_by,
            created_at=rubric.created_at,
            updated_at=rubric.updated_at
        )
    
    def _to_criteria_response(self, db: Session, criteria: AssessmentCriteria) -> AssessmentCriteriaResponse:
        """Convert AssessmentCriteria model to AssessmentCriteriaResponse."""
        # Get rubric information
        rubric = db.query(AssessmentRubric).filter(AssessmentRubric.id == criteria.rubric_id).first()
        rubric_name = rubric.name if rubric else None
        rubric_type = rubric.rubric_type if rubric else None
        
        # Placeholder usage data
        usage_count = 127
        average_score = 2.1
        
        return AssessmentCriteriaResponse(
            id=criteria.id,
            rubric_id=criteria.rubric_id,
            rubric_name=rubric_name,
            rubric_type=rubric_type,
            criterion_name=criteria.criterion_name,
            star_0_descriptor=criteria.star_0_descriptor,
            star_1_descriptor=criteria.star_1_descriptor,
            star_2_descriptor=criteria.star_2_descriptor,
            star_3_descriptor=criteria.star_3_descriptor,
            star_4_descriptor=criteria.star_4_descriptor,
            star_5_descriptor=criteria.star_5_descriptor,
            weight_percentage=criteria.weight_percentage,
            sequence=criteria.sequence,
            usage_count=usage_count,
            average_score=average_score,
            created_by=criteria.created_by,
            updated_by=criteria.updated_by,
            created_at=criteria.created_at,
            updated_at=criteria.updated_at
        )


# Global instance
assessment_service = AssessmentService()