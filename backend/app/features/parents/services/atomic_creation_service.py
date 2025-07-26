"""
Atomic Creation Service for Parents and Family Management

This service provides atomic operations for creating complex parent-focused scenarios
including parents with multiple children, family units, and organization relationships.
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


class ParentAtomicCreationService:
    """Service for atomic creation of parent-focused scenarios."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
        self.student_service = StudentService(db)
        self.parent_service = ParentService(db)
        self.organization_service = OrganizationService(db)
        self.user_management_service = UserManagementService(db)

    async def create_family_unit(
        self,
        parents_data: List[Dict[str, Any]],
        children_data: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]],  # Maps parent-child relationships
        program_id: str,
        organization_id: Optional[str] = None
    ) -> Tuple[List[Parent], List[Student], List[ParentChildRelationship]]:
        """
        Atomically create a complete family unit with multiple parents and children.
        
        Args:
            parents_data: List of parent profile data
            children_data: List of child profile data
            relationships: List of relationship mappings
                [{'parent_index': int, 'child_index': int, 'relationship_type': str, ...}]
            program_id: Program context
            organization_id: Optional organization for family membership
            
        Returns:
            Tuple of (List[Parent], List[Student], List[ParentChildRelationship])
        """
        try:
            with self.db.begin():
                created_parents = []
                created_children = []
                created_relationships = []
                
                # Create all parent accounts
                for parent_data in parents_data:
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
                    parent_profile_data = parent_data.copy()
                    parent_profile_data['user_id'] = user.id
                    parent_profile_data['program_id'] = program_id
                    parent = await self.parent_service.create_parent(parent_profile_data, program_id)
                    
                    # Create program assignment
                    await self.user_management_service.assign_user_to_program(
                        user_id=user.id,
                        program_id=program_id,
                        roles=['parent']
                    )
                    
                    created_parents.append(parent)
                
                # Create all child accounts
                for child_data in children_data:
                    user_data = {
                        'full_name': child_data['full_name'],
                        'email': child_data.get('email'),  # Can be None
                        'phone': child_data.get('phone'),
                        'profile_type': ProfileType.PROFILE_ONLY,
                        'roles': ['student']
                    }
                    
                    user = await self.user_service.create_user(user_data)
                    
                    # Create student profile
                    student_profile_data = child_data.copy()
                    student_profile_data['user_id'] = user.id
                    student_profile_data['program_id'] = program_id
                    student = await self.student_service.create_student(student_profile_data, program_id)
                    
                    # Create program assignment
                    await self.user_management_service.assign_user_to_program(
                        user_id=user.id,
                        program_id=program_id,
                        roles=['student']
                    )
                    
                    created_children.append(student)
                
                # Create organization memberships for all family members
                if organization_id:
                    for parent in created_parents:
                        membership_data = {
                            'user_id': parent.user_id,
                            'organization_id': organization_id,
                            'program_id': program_id,
                            'membership_type': 'parent_member',
                            'status': 'active'
                        }
                        await self.organization_service.create_membership(membership_data, program_id)
                    
                    for child in created_children:
                        membership_data = {
                            'user_id': child.user_id,
                            'organization_id': organization_id,
                            'program_id': program_id,
                            'membership_type': 'sponsored_student',
                            'status': 'active',
                            'is_sponsored': True
                        }
                        await self.organization_service.create_membership(membership_data, program_id)
                
                # Create parent-child relationships
                for relationship in relationships:
                    parent_index = relationship['parent_index']
                    child_index = relationship['child_index']
                    
                    if parent_index >= len(created_parents) or child_index >= len(created_children):
                        raise ValidationError(f"Invalid relationship mapping: parent_index={parent_index}, child_index={child_index}")
                    
                    parent = created_parents[parent_index]
                    child = created_children[child_index]
                    
                    relationship_data = {
                        'parent_id': parent.user_id,
                        'child_id': child.user_id,
                        'relationship_type': relationship['relationship_type'],
                        'is_primary_contact': relationship.get('is_primary_contact', False),
                        'can_pickup': relationship.get('can_pickup', True),
                        'emergency_contact': relationship.get('emergency_contact', False),
                        'program_id': program_id
                    }
                    
                    created_relationship = await self.user_management_service.create_parent_child_relationship(
                        relationship_data, program_id
                    )
                    created_relationships.append(created_relationship)
                
                self.db.commit()
                
                logger.info(f"Successfully created family unit: {len(created_parents)} parents, {len(created_children)} children, {len(created_relationships)} relationships")
                return created_parents, created_children, created_relationships
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error creating family unit: {str(e)}")
            raise DatabaseError(f"Failed to create family unit: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating family unit: {str(e)}")
            raise

    async def create_parent_with_new_children(
        self,
        parent_data: Dict[str, Any],
        children_data: List[Dict[str, Any]],
        program_id: str,
        organization_id: Optional[str] = None
    ) -> Tuple[Parent, List[Student], List[ParentChildRelationship]]:
        """
        Create a parent with multiple new children in a single transaction.
        
        Args:
            parent_data: Parent profile data including relationship details for each child
            children_data: List of child profile data
            program_id: Program context
            organization_id: Optional organization for membership
            
        Returns:
            Tuple of (Parent, List[Student], List[ParentChildRelationship])
        """
        try:
            with self.db.begin():
                # Create parent user account
                parent_user_data = {
                    'full_name': parent_data['full_name'],
                    'email': parent_data['email'],
                    'phone': parent_data.get('phone'),
                    'profile_type': ProfileType.FULL_USER,
                    'roles': ['parent']
                }
                
                if 'password' in parent_data:
                    parent_user_data['password'] = parent_data['password']
                
                parent_user = await self.user_service.create_user(parent_user_data)
                
                # Create parent profile
                parent_profile_data = parent_data.copy()
                parent_profile_data['user_id'] = parent_user.id
                parent_profile_data['program_id'] = program_id
                parent = await self.parent_service.create_parent(parent_profile_data, program_id)
                
                # Create program assignment for parent
                await self.user_management_service.assign_user_to_program(
                    user_id=parent_user.id,
                    program_id=program_id,
                    roles=['parent']
                )
                
                # Create children and relationships
                created_children = []
                created_relationships = []
                
                for i, child_data in enumerate(children_data):
                    # Create child user account
                    child_user_data = {
                        'full_name': child_data['full_name'],
                        'email': child_data.get('email'),
                        'phone': child_data.get('phone'),
                        'profile_type': ProfileType.PROFILE_ONLY,
                        'roles': ['student']
                    }
                    
                    child_user = await self.user_service.create_user(child_user_data)
                    
                    # Create student profile
                    child_profile_data = child_data.copy()
                    child_profile_data['user_id'] = child_user.id
                    child_profile_data['program_id'] = program_id
                    child = await self.student_service.create_student(child_profile_data, program_id)
                    
                    # Create program assignment for child
                    await self.user_management_service.assign_user_to_program(
                        user_id=child_user.id,
                        program_id=program_id,
                        roles=['student']
                    )
                    
                    created_children.append(child)
                    
                    # Create parent-child relationship
                    # Use relationship data from parent_data if available, or defaults
                    child_relationships = parent_data.get('child_relationships', [])
                    relationship_info = child_relationships[i] if i < len(child_relationships) else {}
                    
                    relationship_data = {
                        'parent_id': parent_user.id,
                        'child_id': child_user.id,
                        'relationship_type': relationship_info.get('relationship_type', 'parent'),
                        'is_primary_contact': relationship_info.get('is_primary_contact', i == 0),  # First child gets primary
                        'can_pickup': relationship_info.get('can_pickup', True),
                        'emergency_contact': relationship_info.get('emergency_contact', i == 0),
                        'program_id': program_id
                    }
                    
                    relationship = await self.user_management_service.create_parent_child_relationship(
                        relationship_data, program_id
                    )
                    created_relationships.append(relationship)
                
                # Create organization memberships if specified
                if organization_id:
                    # Parent membership
                    parent_membership_data = {
                        'user_id': parent_user.id,
                        'organization_id': organization_id,
                        'program_id': program_id,
                        'membership_type': 'parent_member',
                        'status': 'active'
                    }
                    await self.organization_service.create_membership(parent_membership_data, program_id)
                    
                    # Children memberships
                    for child in created_children:
                        child_membership_data = {
                            'user_id': child.user_id,
                            'organization_id': organization_id,
                            'program_id': program_id,
                            'membership_type': 'sponsored_student',
                            'status': 'active',
                            'is_sponsored': True
                        }
                        await self.organization_service.create_membership(child_membership_data, program_id)
                
                self.db.commit()
                
                logger.info(f"Successfully created parent {parent.id} with {len(created_children)} children")
                return parent, created_children, created_relationships
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error creating parent with children: {str(e)}")
            raise DatabaseError(f"Failed to create parent with children: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating parent with children: {str(e)}")
            raise

    async def migrate_children_to_organization(
        self,
        parent_id: str,
        organization_id: str,
        program_id: str,
        payment_override: Optional[Dict[str, Any]] = None
    ) -> List[OrganizationMembership]:
        """
        Migrate all children of a parent to organization sponsorship.
        
        Args:
            parent_id: Parent user ID
            organization_id: Target organization ID
            program_id: Program context
            payment_override: Optional payment override for children
            
        Returns:
            List of created organization memberships
        """
        try:
            with self.db.begin():
                # Get all children of the parent
                parent_relationships = self.user_management_service.get_parent_children_relationships(
                    parent_id, program_id
                )
                
                if not parent_relationships:
                    raise ValidationError(f"No children found for parent {parent_id}")
                
                # Verify organization exists and is a partner
                organization = self.organization_service.get_organization(organization_id, program_id)
                if not organization or not organization.is_partner:
                    raise ValidationError(f"Organization {organization_id} not found or not a partner")
                
                created_memberships = []
                
                for relationship in parent_relationships:
                    child_id = relationship.child_id
                    
                    # Check if child already has organization membership
                    existing_membership = self.organization_service.get_user_organization_membership(
                        child_id, organization_id, program_id
                    )
                    
                    if existing_membership:
                        logger.info(f"Child {child_id} already has membership in organization {organization_id}")
                        continue
                    
                    # Create organization membership for child
                    membership_data = {
                        'user_id': child_id,
                        'organization_id': organization_id,
                        'program_id': program_id,
                        'membership_type': 'sponsored_student',
                        'status': 'active',
                        'is_sponsored': True
                    }
                    
                    if payment_override:
                        membership_data['payment_override'] = payment_override
                    
                    membership = await self.organization_service.create_membership(membership_data, program_id)
                    created_memberships.append(membership)
                
                # Also create membership for parent if not exists
                parent_membership = self.organization_service.get_user_organization_membership(
                    parent_id, organization_id, program_id
                )
                
                if not parent_membership:
                    parent_membership_data = {
                        'user_id': parent_id,
                        'organization_id': organization_id,
                        'program_id': program_id,
                        'membership_type': 'parent_member',
                        'status': 'active'
                    }
                    await self.organization_service.create_membership(parent_membership_data, program_id)
                
                self.db.commit()
                
                logger.info(f"Successfully migrated {len(created_memberships)} children to organization {organization_id}")
                return created_memberships
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error migrating children to organization: {str(e)}")
            raise DatabaseError(f"Failed to migrate children to organization: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error migrating children to organization: {str(e)}")
            raise

    async def clone_family_across_programs(
        self,
        parent_id: str,
        source_program_id: str,
        target_program_id: str
    ) -> Tuple[List[UserProgramAssignment], List[ParentChildRelationship]]:
        """
        Clone a family (parent and all children) to another program.
        
        Args:
            parent_id: Parent user ID
            source_program_id: Source program
            target_program_id: Target program
            
        Returns:
            Tuple of (List[UserProgramAssignment], List[ParentChildRelationship])
        """
        try:
            with self.db.begin():
                # Get parent and all relationships in source program
                parent_relationships = self.user_management_service.get_parent_children_relationships(
                    parent_id, source_program_id
                )
                
                if not parent_relationships:
                    raise ValidationError(f"No family found for parent {parent_id} in program {source_program_id}")
                
                created_assignments = []
                created_relationships = []
                
                # Create program assignment for parent in target program
                parent_assignment = await self.user_management_service.assign_user_to_program(
                    user_id=parent_id,
                    program_id=target_program_id,
                    roles=['parent']
                )
                created_assignments.append(parent_assignment)
                
                # Process each child
                for relationship in parent_relationships:
                    child_id = relationship.child_id
                    
                    # Create program assignment for child in target program
                    child_assignment = await self.user_management_service.assign_user_to_program(
                        user_id=child_id,
                        program_id=target_program_id,
                        roles=['student']
                    )
                    created_assignments.append(child_assignment)
                    
                    # Recreate parent-child relationship in target program
                    relationship_data = {
                        'parent_id': parent_id,
                        'child_id': child_id,
                        'relationship_type': relationship.relationship_type,
                        'is_primary_contact': relationship.is_primary_contact,
                        'can_pickup': relationship.can_pickup,
                        'emergency_contact': relationship.emergency_contact,
                        'program_id': target_program_id
                    }
                    
                    new_relationship = await self.user_management_service.create_parent_child_relationship(
                        relationship_data, target_program_id
                    )
                    created_relationships.append(new_relationship)
                
                self.db.commit()
                
                logger.info(f"Successfully cloned family {parent_id} from program {source_program_id} to {target_program_id}")
                return created_assignments, created_relationships
                
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error cloning family across programs: {str(e)}")
            raise DatabaseError(f"Failed to clone family across programs: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error cloning family across programs: {str(e)}")
            raise


# Dependency injection function
def get_parent_atomic_creation_service(db: Session = None) -> ParentAtomicCreationService:
    """Get ParentAtomicCreationService instance."""
    if db is None:
        db = next(get_db())
    return ParentAtomicCreationService(db)