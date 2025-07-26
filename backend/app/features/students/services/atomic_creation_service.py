"""
Atomic Creation Service for Students and Parent-Child Relationships

This service provides atomic operations for creating complex multi-profile scenarios
including students with parents, organization memberships, and relationships.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.features.authentication.models import User
from app.features.authentication.services.user_service import UserService
from app.features.students.models import Student
from app.features.students.services.student_service import StudentService
from app.features.parents.models import Parent
from app.features.parents.services.parent_service import ParentService
from app.features.organizations.models import Organization, OrganizationMembership
from app.features.organizations.services.organization_service import OrganizationService
from app.features.users.models import UserProgramAssignment, ParentChildRelationship
from app.features.users.services.user_service import UserService as UserManagementService
from app.features.authentication.models.user import ProfileType
from app.core.exceptions import ValidationError, DatabaseError

import logging

logger = logging.getLogger(__name__)


class AtomicCreationService:
    """Service for atomic creation of complex multi-profile scenarios."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
        self.student_service = StudentService(db)
        self.parent_service = ParentService(db)
        self.organization_service = OrganizationService(db)
        self.user_management_service = UserManagementService(db)

    async def create_student_with_existing_parent(
        self,
        student_data: Dict[str, Any],
        parent_id: str,
        relationship_type: str,
        program_id: str,
        organization_id: Optional[str] = None,
        is_primary_contact: bool = True,
        can_pickup: bool = True,
        emergency_contact: bool = True
    ) -> Tuple[Student, ParentChildRelationship]:
        """
        Atomically create a student and link to an existing parent.
        
        Args:
            student_data: Student profile data
            parent_id: ID of existing parent
            relationship_type: Type of relationship (father, mother, guardian, etc.)
            program_id: Program context
            organization_id: Optional organization for membership
            is_primary_contact: Whether parent is primary contact
            can_pickup: Whether parent can pick up student
            emergency_contact: Whether parent is emergency contact
            
        Returns:
            Tuple of (Student, ParentChildRelationship)
        """
        try:
            # Start transaction
            with self.db.begin():
                # Verify parent exists and has access to program
                parent = self.parent_service.get_parent(parent_id, program_id)
                if not parent:
                    raise ValidationError(f"Parent {parent_id} not found or not accessible in program {program_id}")

                # Create user account for student (profile_only type)
                user_data = {
                    'full_name': student_data['full_name'],
                    'email': student_data.get('email'),  # Can be None for children
                    'phone': student_data.get('phone'),
                    'profile_type': ProfileType.PROFILE_ONLY,
                    'roles': ['student']
                }
                
                user = await self.user_service.create_user(user_data)
                
                # Create student profile
                student_data['user_id'] = user.id
                student_data['program_id'] = program_id
                student = await self.student_service.create_student(student_data, program_id)
                
                # Create program assignment for student
                await self.user_management_service.assign_user_to_program(
                    user_id=user.id,
                    program_id=program_id,
                    roles=['student']
                )
                
                # Create organization membership if specified
                if organization_id:
                    membership_data = {
                        'user_id': user.id,
                        'organization_id': organization_id,
                        'program_id': program_id,
                        'membership_type': 'sponsored_student',
                        'status': 'active'
                    }
                    await self.organization_service.create_membership(membership_data, program_id)
                
                # Create parent-child relationship
                relationship_data = {
                    'parent_id': parent_id,
                    'child_id': user.id,
                    'relationship_type': relationship_type,
                    'is_primary_contact': is_primary_contact,
                    'can_pickup': can_pickup,
                    'emergency_contact': emergency_contact,
                    'program_id': program_id
                }
                
                relationship = await self.user_management_service.create_parent_child_relationship(
                    relationship_data, program_id
                )
                
                # Commit transaction
                self.db.commit()
                
                logger.info(f"Successfully created student {student.id} with parent relationship {relationship.id}")
                return student, relationship
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error creating student with parent: {str(e)}")
            raise DatabaseError(f"Failed to create student with parent: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating student with parent: {str(e)}")
            raise

    async def create_parent_with_existing_children(
        self,
        parent_data: Dict[str, Any],
        child_relationships: List[Dict[str, Any]],
        program_id: str,
        organization_id: Optional[str] = None
    ) -> Tuple[Parent, List[ParentChildRelationship]]:
        """
        Atomically create a parent and link to existing children.
        
        Args:
            parent_data: Parent profile data
            child_relationships: List of child relationship data
                [{'child_id': str, 'relationship_type': str, 'is_primary_contact': bool, ...}]
            program_id: Program context
            organization_id: Optional organization for membership
            
        Returns:
            Tuple of (Parent, List[ParentChildRelationship])
        """
        try:
            with self.db.begin():
                # Verify all children exist and are accessible
                for child_rel in child_relationships:
                    child_user = self.user_management_service.get_user(child_rel['child_id'])
                    if not child_user:
                        raise ValidationError(f"Child {child_rel['child_id']} not found")
                    
                    # Verify child has student role in program
                    assignment = self.user_management_service.get_user_program_assignment(
                        child_rel['child_id'], program_id
                    )
                    if not assignment or 'student' not in assignment.roles:
                        raise ValidationError(f"Child {child_rel['child_id']} is not a student in program {program_id}")

                # Create user account for parent (full_user type)
                user_data = {
                    'full_name': parent_data['full_name'],
                    'email': parent_data['email'],
                    'phone': parent_data.get('phone'),
                    'profile_type': ProfileType.FULL_USER,
                    'roles': ['parent']
                }
                
                if 'password' in parent_data:
                    user_data['password'] = parent_data['password']
                
                user = await self.user_service.create_user(user_data)
                
                # Create parent profile
                parent_data['user_id'] = user.id
                parent_data['program_id'] = program_id
                parent = await self.parent_service.create_parent(parent_data, program_id)
                
                # Create program assignment for parent
                await self.user_management_service.assign_user_to_program(
                    user_id=user.id,
                    program_id=program_id,
                    roles=['parent']
                )
                
                # Create organization membership if specified
                if organization_id:
                    membership_data = {
                        'user_id': user.id,
                        'organization_id': organization_id,
                        'program_id': program_id,
                        'membership_type': 'parent_member',
                        'status': 'active'
                    }
                    await self.organization_service.create_membership(membership_data, program_id)
                
                # Create parent-child relationships
                relationships = []
                for child_rel in child_relationships:
                    relationship_data = {
                        'parent_id': user.id,
                        'child_id': child_rel['child_id'],
                        'relationship_type': child_rel['relationship_type'],
                        'is_primary_contact': child_rel.get('is_primary_contact', False),
                        'can_pickup': child_rel.get('can_pickup', True),
                        'emergency_contact': child_rel.get('emergency_contact', False),
                        'program_id': program_id
                    }
                    
                    relationship = await self.user_management_service.create_parent_child_relationship(
                        relationship_data, program_id
                    )
                    relationships.append(relationship)
                
                self.db.commit()
                
                logger.info(f"Successfully created parent {parent.id} with {len(relationships)} child relationships")
                return parent, relationships
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error creating parent with children: {str(e)}")
            raise DatabaseError(f"Failed to create parent with children: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating parent with children: {str(e)}")
            raise

    async def create_sponsored_student_profile(
        self,
        student_data: Dict[str, Any],
        organization_id: str,
        program_id: str,
        sponsor_payment_override: Optional[Dict[str, Any]] = None
    ) -> Tuple[Student, OrganizationMembership]:
        """
        Create a student profile sponsored by an organization.
        
        Args:
            student_data: Student profile data
            organization_id: Sponsoring organization ID
            program_id: Program context
            sponsor_payment_override: Optional payment override settings
            
        Returns:
            Tuple of (Student, OrganizationMembership)
        """
        try:
            with self.db.begin():
                # Verify organization exists and is a partner
                organization = self.organization_service.get_organization(organization_id, program_id)
                if not organization or not organization.is_partner:
                    raise ValidationError(f"Organization {organization_id} not found or not a partner")

                # Create user account (profile_only for sponsored students)
                user_data = {
                    'full_name': student_data['full_name'],
                    'email': student_data.get('email'),
                    'phone': student_data.get('phone'),
                    'profile_type': ProfileType.PROFILE_ONLY,
                    'roles': ['student']
                }
                
                user = await self.user_service.create_user(user_data)
                
                # Create student profile
                student_data['user_id'] = user.id
                student_data['program_id'] = program_id
                student = await self.student_service.create_student(student_data, program_id)
                
                # Create program assignment
                await self.user_management_service.assign_user_to_program(
                    user_id=user.id,
                    program_id=program_id,
                    roles=['student']
                )
                
                # Create organization membership with sponsorship details
                membership_data = {
                    'user_id': user.id,
                    'organization_id': organization_id,
                    'program_id': program_id,
                    'membership_type': 'sponsored_student',
                    'status': 'active',
                    'is_sponsored': True
                }
                
                # Add payment override if provided
                if sponsor_payment_override:
                    membership_data['payment_override'] = sponsor_payment_override
                
                membership = await self.organization_service.create_membership(membership_data, program_id)
                
                self.db.commit()
                
                logger.info(f"Successfully created sponsored student {student.id} for organization {organization_id}")
                return student, membership
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error creating sponsored student: {str(e)}")
            raise DatabaseError(f"Failed to create sponsored student: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating sponsored student: {str(e)}")
            raise

    async def create_independent_student(
        self,
        student_data: Dict[str, Any],
        program_id: str,
        create_login_credentials: bool = False
    ) -> Student:
        """
        Create an independent student (no parent relationship).
        
        Args:
            student_data: Student profile data
            program_id: Program context
            create_login_credentials: Whether to create login credentials
            
        Returns:
            Student object
        """
        try:
            with self.db.begin():
                # Determine profile type based on login credentials
                profile_type = ProfileType.FULL_USER if create_login_credentials else ProfileType.PROFILE_ONLY
                
                # Create user account
                user_data = {
                    'full_name': student_data['full_name'],
                    'email': student_data.get('email'),
                    'phone': student_data.get('phone'),
                    'profile_type': profile_type,
                    'roles': ['student']
                }
                
                if create_login_credentials and 'password' in student_data:
                    user_data['password'] = student_data['password']
                
                user = await self.user_service.create_user(user_data)
                
                # Create student profile
                student_data['user_id'] = user.id
                student_data['program_id'] = program_id
                student = await self.student_service.create_student(student_data, program_id)
                
                # Create program assignment
                await self.user_management_service.assign_user_to_program(
                    user_id=user.id,
                    program_id=program_id,
                    roles=['student']
                )
                
                self.db.commit()
                
                logger.info(f"Successfully created independent student {student.id}")
                return student
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error creating independent student: {str(e)}")
            raise DatabaseError(f"Failed to create independent student: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating independent student: {str(e)}")
            raise

    async def bulk_create_organization_students(
        self,
        students_data: List[Dict[str, Any]],
        organization_id: str,
        program_id: str,
        default_payment_override: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Student, OrganizationMembership]]:
        """
        Bulk create multiple students for an organization.
        
        Args:
            students_data: List of student profile data
            organization_id: Sponsoring organization ID
            program_id: Program context
            default_payment_override: Default payment override for all students
            
        Returns:
            List of (Student, OrganizationMembership) tuples
        """
        try:
            with self.db.begin():
                # Verify organization
                organization = self.organization_service.get_organization(organization_id, program_id)
                if not organization or not organization.is_partner:
                    raise ValidationError(f"Organization {organization_id} not found or not a partner")

                results = []
                
                for student_data in students_data:
                    # Create user account
                    user_data = {
                        'full_name': student_data['full_name'],
                        'email': student_data.get('email'),
                        'phone': student_data.get('phone'),
                        'profile_type': ProfileType.PROFILE_ONLY,
                        'roles': ['student']
                    }
                    
                    user = await self.user_service.create_user(user_data)
                    
                    # Create student profile
                    student_profile_data = student_data.copy()
                    student_profile_data['user_id'] = user.id
                    student_profile_data['program_id'] = program_id
                    student = await self.student_service.create_student(student_profile_data, program_id)
                    
                    # Create program assignment
                    await self.user_management_service.assign_user_to_program(
                        user_id=user.id,
                        program_id=program_id,
                        roles=['student']
                    )
                    
                    # Create organization membership
                    membership_data = {
                        'user_id': user.id,
                        'organization_id': organization_id,
                        'program_id': program_id,
                        'membership_type': 'sponsored_student',
                        'status': 'active',
                        'is_sponsored': True
                    }
                    
                    # Use individual payment override or default
                    payment_override = student_data.get('payment_override', default_payment_override)
                    if payment_override:
                        membership_data['payment_override'] = payment_override
                    
                    membership = await self.organization_service.create_membership(membership_data, program_id)
                    
                    results.append((student, membership))
                
                self.db.commit()
                
                logger.info(f"Successfully bulk created {len(results)} students for organization {organization_id}")
                return results
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error bulk creating students: {str(e)}")
            raise DatabaseError(f"Failed to bulk create students: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error bulk creating students: {str(e)}")
            raise


# Dependency injection function
def get_atomic_creation_service(db: Session = None) -> AtomicCreationService:
    """Get AtomicCreationService instance."""
    if db is None:
        db = next(get_db())
    return AtomicCreationService(db)