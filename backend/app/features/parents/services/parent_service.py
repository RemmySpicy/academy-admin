"""
Parent Service for business logic and data operations.

This service handles CRUD operations and business logic for parent profiles
and family relationships within the program context.
"""

from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID
from datetime import date, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
import logging

from app.features.authentication.models.user import User
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship
from app.features.students.models.student import Student
from app.features.enrollments.models.program_assignment import ProgramAssignment
from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.organizations.models.organization_membership import OrganizationMembership
from app.features.authentication.services.user_service import user_service
from app.features.common.models.enums import UserRole, ProgramRole, EnrollmentStatus, AssignmentType
from app.features.parents.schemas.parent import ParentCreate, ParentUpdate, ParentResponse

logger = logging.getLogger(__name__)


class ParentService:
    """
    Service class for parent profile management and family operations.
    
    Handles parent-specific business logic, family relationship management,
    and program context filtering.
    """

    @staticmethod
    def create_parent_profile(
        db: Session,
        user_id: str,
        parent_data: ParentCreate,
        program_context: str,
        created_by: str = None
    ) -> Parent:
        """
        Create a parent profile for an existing user.
        
        Args:
            db: Database session
            user_id: ID of existing user
            parent_data: Parent profile data
            program_context: Program context
            created_by: ID of user creating the profile
            
        Returns:
            Created Parent profile
        """
        try:
            # Verify user exists and has parent role
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            if UserRole.PARENT.value not in user.roles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User does not have parent role"
                )
            
            # Check if parent profile already exists
            existing_parent = db.query(Parent).filter(
                Parent.user_id == user_id
            ).first()
            
            if existing_parent:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent profile already exists for this user in this program"
                )
            
            # Create parent profile
            parent_profile = Parent(
                user_id=user_id,
                program_id=program_context,
                address=parent_data.address,
                emergency_contact_name=parent_data.emergency_contact_name,
                emergency_contact_phone=parent_data.emergency_contact_phone,
                occupation=parent_data.occupation,
                payment_responsibility=parent_data.payment_responsibility or True,
                created_by=created_by
            )
            
            db.add(parent_profile)
            db.commit()
            db.refresh(parent_profile)
            
            logger.info(f"Created parent profile {parent_profile.id} for user {user_id}")
            return parent_profile
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating parent profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating parent profile"
            )

    @staticmethod
    def get_parent_by_id(
        db: Session,
        parent_id: str,
        program_context: str
    ) -> Optional[Parent]:
        """
        Get parent profile by ID within program context.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            program_context: Program context
            
        Returns:
            Parent profile or None
        """
        parent = db.query(Parent).options(
            joinedload(Parent.user)
        ).filter(Parent.id == parent_id).first()
        
        # Check if parent is visible in the program context
        if parent and program_context and not parent.is_visible_in_program(program_context):
            return None
            
        return parent

    @staticmethod
    def get_parent_by_user_id(
        db: Session,
        user_id: str,
        program_context: str
    ) -> Optional[Parent]:
        """
        Get parent profile by user ID within program context.
        
        Args:
            db: Database session
            user_id: User ID
            program_context: Program context
            
        Returns:
            Parent profile or None
        """
        parent = db.query(Parent).options(
            joinedload(Parent.user)
        ).filter(Parent.user_id == user_id).first()
        
        # Check if parent is visible in the program context
        if parent and program_context and not parent.is_visible_in_program(program_context):
            return None
            
        return parent

    @staticmethod
    def get_parents_list(
        db: Session,
        program_context: str,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        has_children: Optional[bool] = None
    ) -> Tuple[List[Parent], int]:
        """
        Get paginated list of parents with optional filtering.
        
        Args:
            db: Database session
            program_context: Program context
            page: Page number
            per_page: Items per page
            search: Search query
            is_active: Filter by active status
            has_children: Filter by children status
            
        Returns:
            Tuple of (parents list, total count)
        """
        # Use enrollment-based approach for program filtering
        if program_context:
            # Delegate to the enrollment-based method and then apply additional filters
            parents, total_count = ParentService.get_parents_in_program_by_children_enrollment(
                db=db, 
                program_id=program_context, 
                page=1, 
                per_page=10000  # Get all for filtering
            )
            
            # Apply filters to the results
            filtered_parents = parents
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                filtered_parents = [
                    p for p in filtered_parents 
                    if (search_lower in p.user.first_name.lower() or
                        search_lower in p.user.last_name.lower() or
                        search_lower in p.user.email.lower())
                ]
            
            # Apply active status filter
            if is_active is not None:
                filtered_parents = [p for p in filtered_parents if p.user.is_active == is_active]
            
            # Apply has_children filter
            if has_children is not None:
                children_filtered = []
                for parent in filtered_parents:
                    children_count = db.query(ParentChildRelationship).filter(
                        ParentChildRelationship.parent_id == parent.id
                    ).count()
                    if (has_children and children_count > 0) or (not has_children and children_count == 0):
                        children_filtered.append(parent)
                filtered_parents = children_filtered
            
            # Apply pagination to filtered results
            total_count = len(filtered_parents)
            offset = (page - 1) * per_page
            parents = filtered_parents[offset:offset + per_page]
            
            return parents, total_count
        else:  
            # No program context - get all parents
            query = db.query(Parent).options(
                joinedload(Parent.user)
            )
            
            # Apply search filter
            if search:
                query = query.join(User).filter(
                    (User.first_name.ilike(f"%{search}%")) |
                    (User.last_name.ilike(f"%{search}%")) |
                    (User.email.ilike(f"%{search}%"))
                )
            
            # Apply active status filter
            if is_active is not None:
                query = query.join(User).filter(User.is_active == is_active)
            
            # Get total count before pagination
            total_count = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            parents = query.offset(offset).limit(per_page).all()
            
            # Apply has_children filter (post-query since it requires relationship counting)
            if has_children is not None:
                filtered_parents = []
                for parent in parents:
                    children_count = db.query(ParentChildRelationship).filter(
                        ParentChildRelationship.parent_id == parent.id
                    ).count()
                    
                    if (has_children and children_count > 0) or (not has_children and children_count == 0):
                        filtered_parents.append(parent)
                
                parents = filtered_parents
            
            return parents, total_count

    @staticmethod
    def update_parent_profile(
        db: Session,
        parent_id: str,
        parent_data: ParentUpdate,
        program_context: str,
        updated_by: str = None
    ) -> Parent:
        """
        Update parent profile information.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            parent_data: Updated parent data
            program_context: Program context
            updated_by: ID of user making updates
            
        Returns:
            Updated Parent profile
        """
        try:
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent not found"
                )
            
            # Check if parent is visible in the program context
            if program_context and not parent.is_visible_in_program(program_context):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent not found or not accessible in current program context"
                )
            
            # Update allowed fields
            update_data = parent_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(parent, field):
                    setattr(parent, field, value)
            
            parent.updated_by = updated_by
            db.commit()
            db.refresh(parent)
            
            logger.info(f"Updated parent profile {parent_id}")
            return parent
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating parent profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating parent profile"
            )

    @staticmethod
    def get_parent_children(
        db: Session,
        parent_id: str,
        program_context: str
    ) -> List[Dict[str, Any]]:
        """
        Get all children of a parent with relationship details.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            program_context: Program context
            
        Returns:
            List of children with relationship information
        """
        relationships = db.query(ParentChildRelationship).options(
            joinedload(ParentChildRelationship.student).joinedload(Student.user)
        ).filter(
            ParentChildRelationship.parent_id == parent_id
        ).all()
        
        children = []
        for rel in relationships:
            child_data = {
                "student_id": rel.student_id,
                "user_id": rel.student.user_id,
                "student": rel.student,
                "relationship": {
                    "can_pickup": rel.can_pickup,
                    "is_emergency_contact": rel.is_emergency_contact,
                    "has_payment_responsibility": rel.has_payment_responsibility,
                    "pickup_notes": rel.pickup_notes,
                    "special_instructions": rel.special_instructions
                }
            }
            children.append(child_data)
        
        return children

    @staticmethod
    def get_parent_organization_membership(
        db: Session,
        parent_user_id: str,
        program_context: str
    ) -> Optional[OrganizationMembership]:
        """
        Get parent's organization membership in program context.
        
        Args:
            db: Database session
            parent_user_id: Parent user ID
            program_context: Program context
            
        Returns:
            Organization membership or None
        """
        return db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == parent_user_id,
            OrganizationMembership.program_id == program_context
        ).first()

    def get_parent_stats(
        self,
        db: Session,
        program_context: str
    ) -> Dict[str, Any]:
        """
        Get parent statistics for current assignment-based architecture.
        
        Args:
            db: Database session
            program_context: Program context
            
        Returns:
            Dictionary with parent statistics relevant to assignment-based system
        """
        try:
            # Get all parents directly (not just via children enrollment filtering)
            # This gives us the actual count since parents exist as profiles
            all_parents = db.query(Parent).join(User, Parent.user_id == User.id).filter(
                User.is_active.is_(True)
            ).all()
            
            total_parents = len(all_parents)
            
            # Calculate children relationships
            parent_child_relationships = db.query(ParentChildRelationship).all()
            total_relationships = len(parent_child_relationships)
            
            # Count parents who actually have child relationships
            parents_with_relationships = len(set(rel.parent_id for rel in parent_child_relationships))
            
            # Count unique students with parent relationships
            students_with_parents = len(set(rel.student_id for rel in parent_child_relationships))
            
            # Calculate gender distribution with correct lowercase enum values
            parents_by_gender = {"male": 0, "female": 0, "other": 0, "prefer_not_to_say": 0, "unknown": 0}
            for parent in all_parents:
                if parent.gender:
                    gender_key = parent.gender.value
                else:
                    gender_key = "unknown"
                parents_by_gender[gender_key] = parents_by_gender.get(gender_key, 0) + 1
            
            # Calculate children count distribution based on actual relationships
            parents_by_children_count = {"0": 0, "1": 0, "2": 0, "3+": 0}
            primary_payers = 0
            
            for parent in all_parents:
                if parent.is_primary_payer:
                    primary_payers += 1
                    
                # Count actual child relationships for this parent
                children_count = sum(1 for rel in parent_child_relationships if rel.parent_id == parent.id)
                
                if children_count == 0:
                    parents_by_children_count["0"] += 1
                elif children_count == 1:
                    parents_by_children_count["1"] += 1
                elif children_count == 2:
                    parents_by_children_count["2"] += 1
                else:
                    parents_by_children_count["3+"] += 1
            
            # Calculate recent parent profile creations (last 30 days)
            thirty_days_ago = date.today() - timedelta(days=30)
            recent_parent_profiles = len([p for p in all_parents if p.enrollment_date >= thirty_days_ago])
            
            # Calculate average relationships per parent (more relevant than average children)
            avg_relationships_per_parent = total_relationships / total_parents if total_parents > 0 else 0
            
            # Count active course enrollments using raw SQL to avoid model/enum issues
            try:
                from sqlalchemy import text
                result = db.execute(
                    text("SELECT COUNT(*) FROM course_enrollments WHERE status IN ('active', 'paused')")
                )
                active_course_enrollments = result.scalar()
            except Exception as e:
                logger.warning(f"Error counting active course enrollments with raw SQL: {e}")
                # If even raw SQL fails, set to 0
                active_course_enrollments = 0
            
            # Calculate Active/Inactive status counts based on children relationships (simpler approach)
            active_parents = parents_with_relationships  # Parents with children are active
            inactive_parents = total_parents - parents_with_relationships  # Parents without children are inactive
            
            logger.info(f"Parent stats: total={total_parents}, active={active_parents}, inactive={inactive_parents}, with_children={parents_with_relationships}")
            
            return {
                "total_parents": total_parents,
                "parents_with_relationships": parents_with_relationships,
                "students_with_parents": students_with_parents,
                "total_parent_child_relationships": total_relationships,
                "primary_payers": primary_payers,
                "parents_by_gender": parents_by_gender,
                "parents_by_children_count": parents_by_children_count,
                "recent_parent_profiles": recent_parent_profiles,
                "active_course_enrollments": active_course_enrollments,
                "average_relationships_per_parent": round(avg_relationships_per_parent, 2),
                # Add the fields the frontend expects
                "active_parents": active_parents,
                "inactive_parents": inactive_parents,
                "parents_with_children": parents_with_relationships,  # Map to frontend field name
                "avg_children_per_parent": round(avg_relationships_per_parent, 1)  # Map to frontend field name
            }
        except Exception as e:
            logger.error(f"Error getting parent stats: {e}")
            # Return empty stats matching new schema instead of failing
            return {
                "total_parents": 0,
                "parents_with_relationships": 0,
                "students_with_parents": 0,
                "active_parents": 0,
                "inactive_parents": 0,
                "parents_with_children": 0,
                "avg_children_per_parent": 0.0,
                "total_parent_child_relationships": 0,
                "primary_payers": 0,
                "parents_by_gender": {"male": 0, "female": 0, "other": 0, "prefer_not_to_say": 0, "unknown": 0},
                "parents_by_children_count": {"0": 0, "1": 0, "2": 0, "3+": 0},
                "recent_parent_profiles": 0,
                "active_course_enrollments": 0,
                "average_relationships_per_parent": 0.0
            }

    @staticmethod
    def delete_parent_profile(
        db: Session,
        parent_id: str,
        program_context: str,
        deleted_by: str = None
    ) -> bool:
        """
        Soft delete parent profile and associated relationships.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            program_context: Program context
            deleted_by: ID of user making deletion
            
        Returns:
            True if successful
        """
        try:
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            
            if not parent:
                return False
            
            # Check if parent is visible in the program context
            if program_context and not parent.is_visible_in_program(program_context):
                return False
            
            # Check if parent has children relationships
            children_count = db.query(ParentChildRelationship).filter(
                ParentChildRelationship.parent_id == parent_id
            ).count()
            
            if children_count > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete parent with existing children relationships. Remove relationships first."
                )
            
            # Soft delete parent profile
            parent.is_deleted = True
            parent.updated_by = deleted_by
            db.commit()
            
            logger.info(f"Deleted parent profile {parent_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting parent profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting parent profile"
            )

    # New Two-Step Workflow Methods

    @staticmethod
    def create_parent_profile_only(
        db: Session,
        user_id: str,
        parent_data: ParentCreate,
        created_by: str = None
    ) -> Parent:
        """
        Create a parent profile without automatic program assignment.
        
        This is step 1 of the new two-step workflow where we create the parent
        profile first, then separately assign their children to courses.
        
        Args:
            db: Database session
            user_id: ID of existing user
            parent_data: Parent profile data
            created_by: ID of user creating the profile
            
        Returns:
            Created Parent profile
        """
        try:
            # Verify user exists and has parent role
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            if UserRole.PARENT.value not in user.roles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User does not have parent role"
                )
            
            # Create parent profile without program assignment
            parent_profile = Parent(
                user_id=user_id,
                program_id=None,  # No program assignment initially
                address=parent_data.address,
                emergency_contact_name=parent_data.emergency_contact_name,
                emergency_contact_phone=parent_data.emergency_contact_phone,
                occupation=parent_data.occupation,
                payment_responsibility=parent_data.payment_responsibility or True,
                created_by=created_by
            )
            
            db.add(parent_profile)
            db.commit()
            db.refresh(parent_profile)
            
            logger.info(f"Created parent profile {parent_profile.id} for user {user_id}")
            return parent_profile
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating parent profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating parent profile"
            )

    @staticmethod
    def assign_parent_to_program(
        db: Session,
        parent_id: str,
        program_id: str,
        assigned_by: str,
        assignment_notes: Optional[str] = None
    ) -> ProgramAssignment:
        """
        Assign a parent to a program (step 2 of workflow).
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            program_id: Program ID to assign to
            assigned_by: ID of user making assignment
            assignment_notes: Optional notes about assignment
            
        Returns:
            ProgramAssignment instance
        """
        try:
            # Validate parent exists
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent profile not found"
                )
            
            # Validate program exists
            from app.features.programs.models.program import Program
            program = db.query(Program).filter(Program.id == program_id).first()
            if not program:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Program not found"
                )
            
            # Check if assignment already exists
            existing_assignment = db.query(ProgramAssignment).filter(
                ProgramAssignment.user_id == parent.user_id,
                ProgramAssignment.program_id == program_id,
                ProgramAssignment.is_active == True
            ).first()
            
            if existing_assignment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent is already assigned to this program"
                )
            
            # Create program assignment
            assignment = ProgramAssignment(
                user_id=parent.user_id,
                program_id=program_id,
                assignment_date=date.today(),
                assigned_by=assigned_by,
                role_in_program=ProgramRole.PARENT,
                is_active=True,
                assignment_notes=assignment_notes
            )
            
            db.add(assignment)
            
            # Update parent's program_id for backward compatibility
            parent.program_id = program_id
            db.add(parent)
            
            db.commit()
            db.refresh(assignment)
            
            logger.info(f"Assigned parent {parent_id} to program {program_id}")
            return assignment
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error assigning parent to program: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error assigning parent to program"
            )

    @staticmethod
    def assign_children_to_courses(
        db: Session,
        parent_id: str,
        child_course_assignments: List[Dict[str, Any]],
        program_context: str,
        assigned_by: str
    ) -> List[CourseEnrollment]:
        """
        Assign parent's children to courses.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            child_course_assignments: List of assignment dictionaries
            program_context: Program context for assignments
            assigned_by: ID of user making assignments
            
        Returns:
            List of CourseEnrollment instances
        """
        try:
            # Validate parent exists
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent profile not found"
                )
            
            # Ensure parent has program assignment
            parent_assignment = db.query(ProgramAssignment).filter(
                ProgramAssignment.user_id == parent.user_id,
                ProgramAssignment.program_id == program_context,
                ProgramAssignment.is_active == True
            ).first()
            
            if not parent_assignment:
                # Auto-assign parent to program
                ParentService.assign_parent_to_program(
                    db, parent_id, program_context, assigned_by,
                    "Auto-assigned during child course enrollment"
                )
            
            enrollments = []
            
            # Use CourseAssignmentService for each child assignment
            from app.features.enrollments.services.enrollment_service import course_assignment_service
            
            for assignment in child_course_assignments:
                try:
                    child_user_id = assignment.get('child_user_id')
                    course_id = assignment.get('course_id')
                    assignment_details = assignment.get('assignment_details', {})
                    
                    if not child_user_id or not course_id:
                        logger.warning(f"Skipping assignment due to missing child_user_id or course_id")
                        continue
                    
                    # Mark assignment as parent-assigned
                    assignment_details['assignment_type'] = AssignmentType.PARENT_ASSIGNED
                    assignment_details['assignment_notes'] = f"Assigned by parent {parent_id} on {date.today()}"
                    
                    enrollment = course_assignment_service.assign_user_to_course(
                        db, child_user_id, course_id, program_context,
                        assigned_by, assignment_details
                    )
                    
                    enrollments.append(enrollment)
                    
                except Exception as e:
                    logger.error(f"Error assigning child {assignment.get('child_user_id')} to course {assignment.get('course_id')}: {str(e)}")
                    continue
            
            logger.info(f"Assigned {len(enrollments)} children to courses for parent {parent_id}")
            return enrollments
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error assigning children to courses: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error assigning children to courses"
            )

    @staticmethod
    def create_child_and_assign_to_course(
        db: Session,
        parent_id: str,
        child_data: Dict[str, Any],
        course_id: str,
        program_context: str,
        created_by: str
    ) -> Dict[str, Any]:
        """
        Create a child student profile and assign to course.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            child_data: Child student data
            course_id: Course ID to assign to
            program_context: Program context
            created_by: ID of user creating the child
            
        Returns:
            Dictionary with child and enrollment data
        """
        try:
            # Validate parent exists
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent profile not found"
                )
            
            # Create child user first
            from app.features.students.services.atomic_creation_service import atomic_creation_service
            
            # Prepare child user data
            child_user_data = {
                'first_name': child_data.get('first_name'),
                'last_name': child_data.get('last_name'),
                'email': child_data.get('email'),
                'phone': child_data.get('phone'),
                'roles': [UserRole.STUDENT.value],
                'is_active': True
            }
            
            # Create child student using atomic creation service
            creation_result = atomic_creation_service.create_student_with_user(
                db, child_user_data, child_data, program_context, created_by
            )
            
            if not creation_result.get('success'):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error creating child: {creation_result.get('error')}"
                )
            
            child_user = creation_result['user']
            child_student = creation_result['student']
            
            # Create parent-child relationship
            relationship = ParentChildRelationship(
                parent_id=parent_id,
                student_id=child_student.id,
                can_pickup=child_data.get('can_pickup', True),
                is_emergency_contact=child_data.get('is_emergency_contact', True),
                has_payment_responsibility=child_data.get('has_payment_responsibility', True),
                pickup_notes=child_data.get('pickup_notes'),
                special_instructions=child_data.get('special_instructions')
            )
            
            db.add(relationship)
            db.commit()
            db.refresh(relationship)
            
            # Assign child to course
            from app.features.enrollments.services.enrollment_service import course_assignment_service
            
            assignment_details = {
                'assignment_type': AssignmentType.PARENT_ASSIGNED,
                'assignment_notes': f"Created by parent {parent_id} and assigned on {date.today()}",
                'referral_source': child_data.get('referral_source', 'Parent referral')
            }
            
            enrollment = course_assignment_service.assign_user_to_course(
                db, child_user.id, course_id, program_context,
                created_by, assignment_details
            )
            
            return {
                'child_user': {
                    'id': child_user.id,
                    'first_name': child_user.first_name,
                    'last_name': child_user.last_name,
                    'email': child_user.email
                },
                'child_student': {
                    'id': child_student.id,
                    'student_id': child_student.student_id,
                    'program_id': child_student.program_id
                },
                'relationship': {
                    'id': relationship.id,
                    'can_pickup': relationship.can_pickup,
                    'is_emergency_contact': relationship.is_emergency_contact
                },
                'enrollment': {
                    'id': enrollment.id,
                    'course_id': enrollment.course_id,
                    'status': enrollment.status.value,
                    'enrollment_date': enrollment.enrollment_date.isoformat()
                },
                'success': True,
                'message': 'Child created and enrolled successfully'
            }
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating child and assigning to course: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating child and assigning to course"
            )

    @staticmethod
    def get_parents_in_program_by_children_enrollment(
        db: Session,
        program_id: str,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[Parent], int]:
        """
        Get parents in a program based on their children's course enrollments.
        
        This replaces the old direct program_id filtering approach.
        
        Args:
            db: Database session
            program_id: Program ID to filter by
            page: Page number
            per_page: Items per page
            
        Returns:
            Tuple of (parents list, total count)
        """
        try:
            # Get all user IDs with active enrollments in this program
            enrolled_user_ids_query = db.query(CourseEnrollment.user_id).filter(
                CourseEnrollment.program_id == program_id,
                CourseEnrollment.status.in_([EnrollmentStatus.active, EnrollmentStatus.paused])
            ).distinct()
            
            # Get students based on these enrollments
            enrolled_students_query = db.query(Student.id).filter(
                Student.user_id.in_(enrolled_user_ids_query)
            )
            
            # Get parents through parent-child relationships
            parent_ids_query = db.query(ParentChildRelationship.parent_id).filter(
                ParentChildRelationship.student_id.in_(enrolled_students_query)
            ).distinct()
            
            # Get parents based on these relationships
            query = db.query(Parent).options(
                joinedload(Parent.user)
            ).filter(
                Parent.id.in_(parent_ids_query)
            )
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            parents = query.offset(offset).limit(per_page).all()
            
            return parents, total_count
        except Exception as e:
            logger.error(f"Error retrieving parent in-program-by-children: {e}")
            # Return empty results instead of failing
            return [], 0

    @staticmethod
    def handle_parent_as_student(
        db: Session,
        parent_id: str,
        course_id: str,
        program_context: str,
        assigned_by: str
    ) -> CourseEnrollment:
        """
        Handle cases where a parent is also a student (dual role).
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            course_id: Course ID to enroll in
            program_context: Program context
            assigned_by: ID of user making assignment
            
        Returns:
            CourseEnrollment instance
        """
        try:
            # Get parent profile
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent profile not found"
                )
            
            # Get user to verify they have student role
            user = db.query(User).filter(User.id == parent.user_id).first()
            if not user or UserRole.STUDENT.value not in user.roles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User does not have student role"
                )
            
            # Update program assignment to 'both' if needed
            assignment = db.query(ProgramAssignment).filter(
                ProgramAssignment.user_id == parent.user_id,
                ProgramAssignment.program_id == program_context,
                ProgramAssignment.is_active == True
            ).first()
            
            if assignment and assignment.role_in_program == ProgramRole.PARENT:
                assignment.role_in_program = ProgramRole.BOTH
                assignment.assignment_notes = f"{assignment.assignment_notes or ''}\nUpdated to 'both' role on {date.today()} for student enrollment"
                db.add(assignment)
            
            # Use CourseAssignmentService to enroll as student
            from app.features.enrollments.services.enrollment_service import course_assignment_service
            
            assignment_details = {
                'assignment_type': AssignmentType.DIRECT,
                'assignment_notes': f"Parent enrolled as student on {date.today()}"
            }
            
            enrollment = course_assignment_service.assign_user_to_course(
                db, parent.user_id, course_id, program_context,
                assigned_by, assignment_details
            )
            
            logger.info(f"Parent {parent_id} enrolled as student in course {course_id}")
            return enrollment
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error handling parent as student: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error enrolling parent as student"
            )

    @staticmethod
    def _to_parent_response(db: Session, parent: Parent) -> ParentResponse:
        """Convert Parent model to ParentResponse with computed fields."""
        from sqlalchemy import text
        from datetime import date
        
        # Get basic parent data - ensure user is loaded
        user = parent.user
        if not user:
            # Load user if not already loaded
            user = db.query(User).filter(User.id == parent.user_id).first()
        
        # Calculate children count using raw SQL to avoid model issues
        children_result = db.execute(
            text("SELECT COUNT(*) FROM parent_child_relationships WHERE parent_id = :parent_id"),
            {"parent_id": parent.id}
        ).scalar()
        children_count = children_result or 0
        
        # Calculate outstanding balance from children's enrollments using raw SQL
        balance_result = db.execute(
            text("""
                SELECT COALESCE(SUM(ce.outstanding_balance), 0) as total_balance
                FROM parent_child_relationships pcr
                JOIN course_enrollments ce ON pcr.student_id = ce.student_id
                WHERE pcr.parent_id = :parent_id AND ce.outstanding_balance > 0
            """),
            {"parent_id": parent.id}
        ).scalar()
        outstanding_balance = float(balance_result or 0)
        
        # Get last payment date from children's enrollments
        last_payment_result = db.execute(
            text("""
                SELECT MAX(ce.updated_at) as last_payment
                FROM parent_child_relationships pcr
                JOIN course_enrollments ce ON pcr.student_id = ce.student_id
                WHERE pcr.parent_id = :parent_id AND ce.amount_paid > 0
            """),
            {"parent_id": parent.id}
        ).first()
        last_payment_date = last_payment_result.last_payment if last_payment_result else None
        
        # Determine parent status based on children's enrollment status
        active_enrollments_result = db.execute(
            text("""
                SELECT COUNT(*) FROM parent_child_relationships pcr
                JOIN course_enrollments ce ON pcr.student_id = ce.student_id
                WHERE pcr.parent_id = :parent_id AND ce.status = 'active'
            """),
            {"parent_id": parent.id}
        ).scalar()
        
        # Set status based on active enrollments and payment status
        if active_enrollments_result and active_enrollments_result > 0:
            if outstanding_balance > 0:
                status = "Active (Overdue)" if outstanding_balance > 25000 else "Active (Partial)"
            else:
                status = "Active (Paid)"
        else:
            status = "Inactive"
        
        # Format last payment for display
        if last_payment_date:
            from datetime import datetime, date
            if isinstance(last_payment_date, datetime):
                last_payment_display = last_payment_date.strftime("%b %Y")
            else:
                last_payment_display = "Recent"
        else:
            last_payment_display = "Never"
        
        return ParentResponse(
            id=str(parent.id),
            user_id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            date_of_birth=user.date_of_birth,
            gender=None,  # User model doesn't have gender field
            salutation=user.salutation,
            program_id=getattr(parent, 'program_id', '') or "",
            program_name=None,  # Could be populated if needed
            referral_source=user.referral_source,
            enrollment_date=getattr(parent, 'enrollment_date', None) or date.today(),
            address=getattr(parent, 'address', None),
            emergency_contact_name=getattr(parent, 'emergency_contact_name', None),
            emergency_contact_phone=getattr(parent, 'emergency_contact_phone', None),
            emergency_contact_relationship=getattr(parent, 'emergency_contact_relationship', None),
            notes=getattr(parent, 'notes', None),
            occupation=getattr(parent, 'occupation', None),
            employer=getattr(parent, 'employer', None),
            is_primary_payer=getattr(parent, 'is_primary_payer', True),
            children_count=children_count,
            primary_children_count=children_count,  # Assume all children are primary for now
            # Add computed fields that aren't in the standard schema but are needed by frontend
            outstanding_balance=outstanding_balance,
            status=status,
            last_payment_date=last_payment_display,
            created_by=parent.created_by,
            updated_by=parent.updated_by,
            created_at=parent.created_at,
            updated_at=parent.updated_at
        )

# Singleton instance
parent_service = ParentService()
