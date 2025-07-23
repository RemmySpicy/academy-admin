"""
Service layer for the star-based curriculum progression system.

This service handles business logic for:
- Curriculum progression settings management
- Student lesson progress tracking and grading
- Module unlock calculations
- Level assessment management
- Progress analytics and reporting
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc

from app.features.courses.models.progression import (
    CurriculumProgressionSettings,
    LevelAssessmentCriteria,
    StudentLessonProgress,
    StudentModuleUnlock,
    StudentLevelAssessment,
    ProgressionAnalytics
)
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.level import Level
from app.features.courses.models.module import Module
from app.features.courses.models.lesson import Lesson
from app.features.courses.schemas.progression import (
    CurriculumProgressionSettingsCreate,
    CurriculumProgressionSettingsUpdate,
    LevelAssessmentCriteriaCreate,
    LevelAssessmentCriteriaUpdate,
    StudentLessonProgressCreate,
    StudentLessonProgressUpdate,
    StudentLevelAssessmentCreate,
    StudentLevelAssessmentUpdate,
    BulkLessonGradingRequest,
    AssessmentStatus
)
from app.features.common.services.base import BaseService


class ProgressionService(BaseService[CurriculumProgressionSettings]):
    """Service for managing curriculum progression system."""
    
    def __init__(self):
        super().__init__(CurriculumProgressionSettings)
    
    # Curriculum Progression Settings
    async def create_progression_settings(
        self, 
        db: Session, 
        settings_data: CurriculumProgressionSettingsCreate,
        user_id: str
    ) -> CurriculumProgressionSettings:
        """Create progression settings for a curriculum."""
        settings = CurriculumProgressionSettings(
            **settings_data.dict(),
            created_by=user_id,
            updated_by=user_id
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings
    
    async def get_progression_settings_by_curriculum(
        self, 
        db: Session, 
        curriculum_id: str
    ) -> Optional[CurriculumProgressionSettings]:
        """Get progression settings for a curriculum."""
        return db.query(CurriculumProgressionSettings).filter(
            CurriculumProgressionSettings.curriculum_id == curriculum_id
        ).first()
    
    async def update_progression_settings(
        self,
        db: Session,
        settings_id: str,
        settings_update: CurriculumProgressionSettingsUpdate,
        user_id: str
    ) -> Optional[CurriculumProgressionSettings]:
        """Update progression settings."""
        settings = db.query(CurriculumProgressionSettings).filter(
            CurriculumProgressionSettings.id == settings_id
        ).first()
        
        if not settings:
            return None
        
        update_data = settings_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        
        settings.updated_by = user_id
        settings.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(settings)
        return settings
    
    # Level Assessment Criteria
    async def create_assessment_criteria(
        self,
        db: Session,
        criteria_data: LevelAssessmentCriteriaCreate,
        user_id: str
    ) -> LevelAssessmentCriteria:
        """Create assessment criteria for a level."""
        criteria = LevelAssessmentCriteria(
            **criteria_data.dict(),
            created_by=user_id,
            updated_by=user_id
        )
        db.add(criteria)
        db.commit()
        db.refresh(criteria)
        return criteria
    
    async def get_assessment_criteria_by_level(
        self,
        db: Session,
        level_id: str
    ) -> List[LevelAssessmentCriteria]:
        """Get all assessment criteria for a level."""
        return db.query(LevelAssessmentCriteria).filter(
            LevelAssessmentCriteria.level_id == level_id
        ).order_by(LevelAssessmentCriteria.sequence_order).all()
    
    async def update_assessment_criteria(
        self,
        db: Session,
        criteria_id: str,
        criteria_update: LevelAssessmentCriteriaUpdate,
        user_id: str
    ) -> Optional[LevelAssessmentCriteria]:
        """Update assessment criteria."""
        criteria = db.query(LevelAssessmentCriteria).filter(
            LevelAssessmentCriteria.id == criteria_id
        ).first()
        
        if not criteria:
            return None
        
        update_data = criteria_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(criteria, field, value)
        
        criteria.updated_by = user_id
        criteria.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(criteria)
        return criteria
    
    async def delete_assessment_criteria(
        self,
        db: Session,
        criteria_id: str
    ) -> bool:
        """Delete assessment criteria."""
        criteria = db.query(LevelAssessmentCriteria).filter(
            LevelAssessmentCriteria.id == criteria_id
        ).first()
        
        if not criteria:
            return False
        
        db.delete(criteria)
        db.commit()
        return True
    
    # Student Lesson Progress
    async def create_lesson_progress(
        self,
        db: Session,
        progress_data: StudentLessonProgressCreate,
        user_id: str
    ) -> StudentLessonProgress:
        """Create or update student lesson progress."""
        # Check if progress already exists
        existing = db.query(StudentLessonProgress).filter(
            and_(
                StudentLessonProgress.student_id == progress_data.student_id,
                StudentLessonProgress.lesson_id == progress_data.lesson_id
            )
        ).first()
        
        if existing:
            # Update existing progress
            existing.attempt_count += 1
            existing.last_attempt_date = datetime.utcnow()
            existing.is_completed = progress_data.is_completed
            existing.updated_by = user_id
            existing.updated_at = datetime.utcnow()
            
            if progress_data.is_completed and not existing.completion_date:
                existing.completion_date = datetime.utcnow()
            
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new progress
            progress = StudentLessonProgress(
                **progress_data.dict(),
                attempt_count=1,
                last_attempt_date=datetime.utcnow(),
                completion_date=datetime.utcnow() if progress_data.is_completed else None,
                created_by=user_id,
                updated_by=user_id
            )
            db.add(progress)
            db.commit()
            db.refresh(progress)
            return progress
    
    async def grade_lesson(
        self,
        db: Session,
        student_id: str,
        lesson_id: str,
        stars_earned: int,
        instructor_id: str,
        notes: Optional[str] = None
    ) -> Optional[StudentLessonProgress]:
        """Grade a student's lesson performance."""
        progress = db.query(StudentLessonProgress).filter(
            and_(
                StudentLessonProgress.student_id == student_id,
                StudentLessonProgress.lesson_id == lesson_id
            )
        ).first()
        
        if not progress:
            return None
        
        progress.stars_earned = stars_earned
        progress.graded_by_instructor_id = instructor_id
        progress.graded_date = datetime.utcnow()
        progress.instructor_notes = notes
        progress.updated_by = instructor_id
        progress.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(progress)
        
        # Check if this grading unlocks the next module
        await self._check_and_update_module_unlocks(db, student_id, lesson_id)
        
        return progress
    
    async def bulk_grade_lessons(
        self,
        db: Session,
        grading_request: BulkLessonGradingRequest
    ) -> List[StudentLessonProgress]:
        """Bulk grade multiple lessons for classroom management."""
        graded_progress = []
        
        for grade_data in grading_request.grades:
            progress = await self.grade_lesson(
                db=db,
                student_id=grade_data["student_id"],
                lesson_id=grade_data["lesson_id"],
                stars_earned=grade_data["stars_earned"],
                instructor_id=grading_request.instructor_id,
                notes=grade_data.get("notes")
            )
            if progress:
                graded_progress.append(progress)
        
        return graded_progress
    
    async def get_student_lesson_progress(
        self,
        db: Session,
        student_id: str,
        curriculum_id: Optional[str] = None,
        module_id: Optional[str] = None
    ) -> List[StudentLessonProgress]:
        """Get lesson progress for a student."""
        query = db.query(StudentLessonProgress).filter(
            StudentLessonProgress.student_id == student_id
        )
        
        if curriculum_id:
            # Join through lesson -> section -> module -> level -> curriculum
            query = query.join(Lesson).join(Module).join(Level).join(Curriculum).filter(
                Curriculum.id == curriculum_id
            )
        elif module_id:
            query = query.join(Lesson).join(Module).filter(
                Module.id == module_id
            )
        
        return query.order_by(StudentLessonProgress.updated_at.desc()).all()
    
    # Module Unlock Logic
    async def _check_and_update_module_unlocks(
        self,
        db: Session,
        student_id: str,
        lesson_id: str
    ) -> None:
        """Check if grading this lesson unlocks the next module."""
        # Get the lesson and its module
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return
        
        # Get all lessons in the current module
        current_module_lessons = db.query(Lesson).filter(
            Lesson.section_id.in_(
                db.query(func.distinct(Lesson.section_id)).filter(
                    Lesson.id == lesson_id
                )
            )
        ).all()
        
        # Calculate stars earned vs possible in current module
        progress_records = db.query(StudentLessonProgress).filter(
            and_(
                StudentLessonProgress.student_id == student_id,
                StudentLessonProgress.lesson_id.in_([l.id for l in current_module_lessons])
            )
        ).all()
        
        total_possible_stars = len(current_module_lessons) * 3
        total_earned_stars = sum(p.stars_earned or 0 for p in progress_records)
        lessons_with_min_stars = sum(1 for p in progress_records if (p.stars_earned or 0) >= 1)
        
        # Get progression settings
        curriculum_id = db.query(Curriculum.id).join(Level).join(Module).filter(
            Module.id == lesson.section.module_id
        ).scalar()
        
        settings = await self.get_progression_settings_by_curriculum(db, curriculum_id)
        if not settings:
            return
        
        # Check unlock conditions
        percentage_achieved = (total_earned_stars / total_possible_stars) * 100 if total_possible_stars > 0 else 0
        threshold_met = (
            percentage_achieved >= settings.module_unlock_threshold_percentage and
            (not settings.require_minimum_one_star_per_lesson or 
             lessons_with_min_stars == len(current_module_lessons))
        )
        
        # Find the next module
        next_module = db.query(Module).filter(
            and_(
                Module.level_id == lesson.section.module.level_id,
                Module.sequence_order > lesson.section.module.sequence_order
            )
        ).order_by(Module.sequence_order).first()
        
        if next_module and threshold_met:
            # Create or update unlock record
            unlock_record = db.query(StudentModuleUnlock).filter(
                and_(
                    StudentModuleUnlock.student_id == student_id,
                    StudentModuleUnlock.module_id == next_module.id
                )
            ).first()
            
            if not unlock_record:
                unlock_record = StudentModuleUnlock(
                    student_id=student_id,
                    module_id=next_module.id,
                    is_unlocked=True,
                    unlocked_date=datetime.utcnow(),
                    stars_earned=total_earned_stars,
                    total_possible_stars=total_possible_stars,
                    unlock_percentage=percentage_achieved,
                    threshold_met=threshold_met
                )
                db.add(unlock_record)
            else:
                unlock_record.is_unlocked = True
                unlock_record.unlocked_date = datetime.utcnow()
                unlock_record.stars_earned = total_earned_stars
                unlock_record.total_possible_stars = total_possible_stars
                unlock_record.unlock_percentage = percentage_achieved
                unlock_record.threshold_met = threshold_met
            
            db.commit()
    
    async def get_student_module_unlocks(
        self,
        db: Session,
        student_id: str,
        curriculum_id: Optional[str] = None
    ) -> List[StudentModuleUnlock]:
        """Get module unlock status for a student."""
        query = db.query(StudentModuleUnlock).filter(
            StudentModuleUnlock.student_id == student_id
        )
        
        if curriculum_id:
            query = query.join(Module).join(Level).join(Curriculum).filter(
                Curriculum.id == curriculum_id
            )
        
        return query.order_by(StudentModuleUnlock.unlocked_date.desc()).all()
    
    # Level Assessment Management
    async def create_level_assessment(
        self,
        db: Session,
        assessment_data: StudentLevelAssessmentCreate,
        user_id: str
    ) -> StudentLevelAssessment:
        """Create a level assessment for a student."""
        assessment = StudentLevelAssessment(
            **assessment_data.dict(),
            status=AssessmentStatus.PENDING,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment
    
    async def complete_level_assessment(
        self,
        db: Session,
        assessment_id: str,
        criteria_scores: Dict[str, int],
        instructor_id: str,
        notes: Optional[str] = None
    ) -> Optional[StudentLevelAssessment]:
        """Complete a level assessment with criteria scores."""
        assessment = db.query(StudentLevelAssessment).filter(
            StudentLevelAssessment.id == assessment_id
        ).first()
        
        if not assessment:
            return None
        
        # Get assessment criteria for calculation
        criteria_list = await self.get_assessment_criteria_by_level(
            db, assessment.level_id
        )
        
        # Calculate overall score
        overall_score = assessment.calculate_overall_score(criteria_list)
        
        # Determine if passed (simplified - can be made more sophisticated)
        passed = overall_score >= 60.0  # 60% threshold
        
        # Update assessment
        assessment.criteria_scores = criteria_scores
        assessment.overall_score = overall_score
        assessment.passed = passed
        assessment.status = AssessmentStatus.PASSED if passed else AssessmentStatus.FAILED
        assessment.assessment_date = datetime.utcnow()
        assessment.instructor_notes = notes
        assessment.updated_by = instructor_id
        assessment.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(assessment)
        return assessment
    
    async def suspend_student_progression(
        self,
        db: Session,
        assessment_id: str,
        instructor_id: str,
        suspension_reason: str
    ) -> Optional[StudentLevelAssessment]:
        """Suspend a student's progression at level assessment."""
        assessment = db.query(StudentLevelAssessment).filter(
            StudentLevelAssessment.id == assessment_id
        ).first()
        
        if not assessment:
            return None
        
        assessment.progression_suspended = True
        assessment.can_continue_next_level = False
        assessment.suspension_reason = suspension_reason
        assessment.status = AssessmentStatus.SUSPENDED
        assessment.updated_by = instructor_id
        assessment.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(assessment)
        return assessment
    
    async def get_student_level_assessments(
        self,
        db: Session,
        student_id: str,
        curriculum_id: Optional[str] = None
    ) -> List[StudentLevelAssessment]:
        """Get level assessments for a student."""
        query = db.query(StudentLevelAssessment).filter(
            StudentLevelAssessment.student_id == student_id
        )
        
        if curriculum_id:
            query = query.join(Level).join(Curriculum).filter(
                Curriculum.id == curriculum_id
            )
        
        return query.order_by(StudentLevelAssessment.updated_at.desc()).all()
    
    async def get_pending_assessments_for_instructor(
        self,
        db: Session,
        instructor_id: str
    ) -> List[StudentLevelAssessment]:
        """Get pending level assessments for an instructor."""
        return db.query(StudentLevelAssessment).filter(
            and_(
                StudentLevelAssessment.assessed_by_instructor_id == instructor_id,
                StudentLevelAssessment.status == AssessmentStatus.PENDING
            )
        ).order_by(StudentLevelAssessment.created_at).all()
    
    # Progress Analytics
    async def generate_student_progress_summary(
        self,
        db: Session,
        student_id: str,
        curriculum_id: str
    ) -> Dict[str, Any]:
        """Generate comprehensive progress summary for a student."""
        # Get basic curriculum info
        curriculum = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
        if not curriculum:
            return {}
        
        # Get total lessons in curriculum
        total_lessons_query = db.query(func.count(Lesson.id)).join(Module).join(Level).filter(
            Level.curriculum_id == curriculum_id
        )
        total_lessons = total_lessons_query.scalar() or 0
        
        # Get student progress
        progress_records = await self.get_student_lesson_progress(
            db, student_id, curriculum_id
        )
        
        completed_lessons = len([p for p in progress_records if p.is_completed])
        graded_lessons = len([p for p in progress_records if p.stars_earned is not None])
        average_stars = sum(p.stars_earned for p in progress_records if p.stars_earned is not None) / max(graded_lessons, 1)
        
        # Get module unlocks
        module_unlocks = await self.get_student_module_unlocks(
            db, student_id, curriculum_id
        )
        unlocked_modules = len([u for u in module_unlocks if u.is_unlocked])
        
        # Get total modules
        total_modules = db.query(func.count(Module.id)).join(Level).filter(
            Level.curriculum_id == curriculum_id
        ).scalar() or 0
        
        # Get level assessments
        level_assessments = await self.get_student_level_assessments(
            db, student_id, curriculum_id
        )
        pending_assessments = [a for a in level_assessments if a.status == AssessmentStatus.PENDING]
        
        # Get time tracking
        total_time = sum(p.total_time_spent_minutes or 0 for p in progress_records)
        last_activity = max((p.last_attempt_date for p in progress_records if p.last_attempt_date), default=None)
        
        return {
            "student_id": student_id,
            "curriculum_id": curriculum_id,
            "curriculum_name": curriculum.name,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "graded_lessons": graded_lessons,
            "average_stars": round(average_stars, 2) if graded_lessons > 0 else None,
            "total_modules": total_modules,
            "unlocked_modules": unlocked_modules,
            "pending_assessments": len(pending_assessments),
            "total_time_spent_minutes": total_time,
            "last_activity_date": last_activity,
            "progress_percentage": round((completed_lessons / max(total_lessons, 1)) * 100, 1)
        }
    
    async def get_instructor_dashboard_summary(
        self,
        db: Session,
        instructor_id: str
    ) -> Dict[str, Any]:
        """Generate dashboard summary for an instructor."""
        # Get students needing grading
        students_to_grade = db.query(func.count(func.distinct(StudentLessonProgress.student_id))).filter(
            and_(
                StudentLessonProgress.is_completed == True,
                StudentLessonProgress.stars_earned == None
            )
        ).scalar() or 0
        
        # Get pending assessments
        pending_assessments = await self.get_pending_assessments_for_instructor(
            db, instructor_id
        )
        
        # Get recent grading activity
        recent_gradings = db.query(StudentLessonProgress).filter(
            and_(
                StudentLessonProgress.graded_by_instructor_id == instructor_id,
                StudentLessonProgress.graded_date >= datetime.utcnow().replace(day=1)  # This month
            )
        ).order_by(StudentLessonProgress.graded_date.desc()).limit(10).all()
        
        return {
            "instructor_id": instructor_id,
            "students_to_grade": students_to_grade,
            "assessments_to_complete": len(pending_assessments),
            "recent_gradings_count": len(recent_gradings),
            "pending_assessments": [
                {
                    "id": a.id,
                    "student_id": a.student_id,
                    "level_id": a.level_id,
                    "created_date": a.created_at
                }
                for a in pending_assessments[:5]  # Top 5
            ]
        }