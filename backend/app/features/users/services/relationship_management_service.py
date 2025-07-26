"""
Relationship Management Service

Central service for managing all types of relationships, profiles, and atomic operations
across students, parents, and organizations. This is the main service used by the frontend.
"""

from typing import List, Optional, Dict, Any, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from enum import Enum

from app.core.database import get_db
from app.features.students.services.atomic_creation_service import AtomicCreationService
from app.features.parents.services.atomic_creation_service import ParentAtomicCreationService
from app.features.students.models import Student
from app.features.parents.models import Parent
from app.features.organizations.models import OrganizationMembership
from app.features.users.models import ParentChildRelationship
from app.features.authentication.models.user import ProfileType
from app.core.exceptions import ValidationError, DatabaseError

import logging

logger = logging.getLogger(__name__)


class CreationMode(str, Enum):
    """Creation mode options for the form toggles."""
    INDEPENDENT_STUDENT = "independent_student"
    STUDENT_WITH_PARENT = "student_with_parent"
    PARENT_WITH_CHILDREN = "parent_with_children"
    FAMILY_UNIT = "family_unit"


class OrganizationMode(str, Enum):
    """Organization mode options for the form toggles."""
    INDIVIDUAL = "individual"
    ORGANIZATION_SPONSORED = "organization_sponsored"


class RelationshipManagementService:
    """Central service for managing relationships and atomic creation operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.student_atomic_service = AtomicCreationService(db)
        self.parent_atomic_service = ParentAtomicCreationService(db)

    async def create_profile(
        self,
        creation_mode: CreationMode,
        organization_mode: OrganizationMode,
        profile_data: Dict[str, Any],
        program_id: str
    ) -> Dict[str, Any]:
        """
        Universal profile creation based on form toggle states.
        
        Args:
            creation_mode: Independent student, student with parent, etc.
            organization_mode: Individual or organization sponsored
            profile_data: Complete profile data including relationships
            program_id: Program context
            
        Returns:
            Dictionary with created profiles and relationships
        """
        try:
            organization_id = profile_data.get('organization_id') if organization_mode == OrganizationMode.ORGANIZATION_SPONSORED else None
            
            if creation_mode == CreationMode.INDEPENDENT_STUDENT:
                return await self._create_independent_student(profile_data, program_id, organization_id)
            
            elif creation_mode == CreationMode.STUDENT_WITH_PARENT:
                return await self._create_student_with_parent(profile_data, program_id, organization_id)
            
            elif creation_mode == CreationMode.PARENT_WITH_CHILDREN:
                return await self._create_parent_with_children(profile_data, program_id, organization_id)
            
            elif creation_mode == CreationMode.FAMILY_UNIT:
                return await self._create_family_unit(profile_data, program_id, organization_id)
            
            else:
                raise ValidationError(f"Unsupported creation mode: {creation_mode}")
                
        except Exception as e:
            logger.error(f"Error in profile creation: {str(e)}")
            raise

    async def _create_independent_student(
        self,
        profile_data: Dict[str, Any],
        program_id: str,
        organization_id: Optional[str]
    ) -> Dict[str, Any]:
        """Create an independent student."""
        student_data = profile_data['student']
        create_login = profile_data.get('create_login_credentials', False)
        
        if organization_id:
            # Sponsored student
            payment_override = profile_data.get('payment_override')
            student, membership = await self.student_atomic_service.create_sponsored_student_profile(
                student_data, organization_id, program_id, payment_override
            )
            
            return {
                'type': 'sponsored_student',
                'student': student,
                'organization_membership': membership,
                'organization_id': organization_id
            }
        else:
            # Independent student
            student = await self.student_atomic_service.create_independent_student(
                student_data, program_id, create_login
            )
            
            return {
                'type': 'independent_student',
                'student': student
            }

    async def _create_student_with_parent(
        self,
        profile_data: Dict[str, Any],
        program_id: str,
        organization_id: Optional[str]
    ) -> Dict[str, Any]:
        """Create a student with an existing parent relationship."""
        student_data = profile_data['student']
        parent_id = profile_data['parent_id']
        relationship_data = profile_data.get('relationship', {})
        
        relationship_type = relationship_data.get('relationship_type', 'parent')
        is_primary_contact = relationship_data.get('is_primary_contact', True)
        can_pickup = relationship_data.get('can_pickup', True)
        emergency_contact = relationship_data.get('emergency_contact', True)
        
        student, relationship = await self.student_atomic_service.create_student_with_existing_parent(
            student_data=student_data,
            parent_id=parent_id,
            relationship_type=relationship_type,
            program_id=program_id,
            organization_id=organization_id,
            is_primary_contact=is_primary_contact,
            can_pickup=can_pickup,
            emergency_contact=emergency_contact
        )
        
        return {
            'type': 'student_with_parent',
            'student': student,
            'relationship': relationship,
            'parent_id': parent_id,
            'organization_id': organization_id
        }

    async def _create_parent_with_children(
        self,
        profile_data: Dict[str, Any],
        program_id: str,
        organization_id: Optional[str]
    ) -> Dict[str, Any]:
        """Create a parent with existing children relationships."""
        parent_data = profile_data['parent']
        child_relationships = profile_data['child_relationships']  # List of existing child IDs and relationship info
        
        parent, relationships = await self.student_atomic_service.create_parent_with_existing_children(
            parent_data=parent_data,
            child_relationships=child_relationships,
            program_id=program_id,
            organization_id=organization_id
        )
        
        return {
            'type': 'parent_with_children',
            'parent': parent,
            'relationships': relationships,
            'organization_id': organization_id
        }

    async def _create_family_unit(
        self,
        profile_data: Dict[str, Any],
        program_id: str,
        organization_id: Optional[str]
    ) -> Dict[str, Any]:
        """Create a complete family unit with multiple parents and children."""
        parents_data = profile_data['parents']
        children_data = profile_data['children']
        relationships = profile_data['relationships']
        
        parents, children, family_relationships = await self.parent_atomic_service.create_family_unit(
            parents_data=parents_data,
            children_data=children_data,
            relationships=relationships,
            program_id=program_id,
            organization_id=organization_id
        )
        
        return {
            'type': 'family_unit',
            'parents': parents,
            'children': children,
            'relationships': family_relationships,
            'organization_id': organization_id
        }

    async def update_relationship(
        self,
        relationship_id: str,
        updates: Dict[str, Any],
        program_id: str
    ) -> ParentChildRelationship:
        """
        Update an existing parent-child relationship.
        
        Args:
            relationship_id: Relationship ID to update
            updates: Fields to update
            program_id: Program context
            
        Returns:
            Updated relationship
        """
        try:
            # Validate that relationship exists in program
            from app.features.users.services.user_service import UserService
            user_service = UserService(self.db)
            
            relationship = user_service.get_parent_child_relationship(relationship_id, program_id)
            if not relationship:
                raise ValidationError(f"Relationship {relationship_id} not found in program {program_id}")
            
            # Update the relationship
            updated_relationship = await user_service.update_parent_child_relationship(
                relationship_id, updates, program_id
            )
            
            logger.info(f"Successfully updated relationship {relationship_id}")
            return updated_relationship
            
        except Exception as e:
            logger.error(f"Error updating relationship {relationship_id}: {str(e)}")
            raise

    async def add_child_to_parent(
        self,
        parent_id: str,
        child_id: str,
        relationship_data: Dict[str, Any],
        program_id: str
    ) -> ParentChildRelationship:
        """
        Add a child to an existing parent.
        
        Args:
            parent_id: Parent user ID
            child_id: Child user ID
            relationship_data: Relationship details
            program_id: Program context
            
        Returns:
            Created relationship
        """
        try:
            relationship_data.update({
                'parent_id': parent_id,
                'child_id': child_id,
                'program_id': program_id
            })
            
            from app.features.users.services.user_service import UserService
            user_service = UserService(self.db)
            
            relationship = await user_service.create_parent_child_relationship(
                relationship_data, program_id
            )
            
            logger.info(f"Successfully added child {child_id} to parent {parent_id}")
            return relationship
            
        except Exception as e:
            logger.error(f"Error adding child to parent: {str(e)}")
            raise

    async def remove_child_from_parent(
        self,
        relationship_id: str,
        program_id: str
    ) -> bool:
        """
        Remove a parent-child relationship.
        
        Args:
            relationship_id: Relationship ID to remove
            program_id: Program context
            
        Returns:
            Success boolean
        """
        try:
            from app.features.users.services.user_service import UserService
            user_service = UserService(self.db)
            
            success = await user_service.delete_parent_child_relationship(
                relationship_id, program_id
            )
            
            if success:
                logger.info(f"Successfully removed relationship {relationship_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error removing relationship {relationship_id}: {str(e)}")
            raise

    async def transfer_child_to_organization(
        self,
        child_id: str,
        organization_id: str,
        program_id: str,
        payment_override: Optional[Dict[str, Any]] = None
    ) -> OrganizationMembership:
        """
        Transfer a child to organization sponsorship.
        
        Args:
            child_id: Child user ID
            organization_id: Target organization ID
            program_id: Program context
            payment_override: Optional payment override
            
        Returns:
            Created organization membership
        """
        try:
            from app.features.organizations.services.organization_service import OrganizationService
            org_service = OrganizationService(self.db)
            
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
            
            membership = await org_service.create_membership(membership_data, program_id)
            
            logger.info(f"Successfully transferred child {child_id} to organization {organization_id}")
            return membership
            
        except Exception as e:
            logger.error(f"Error transferring child to organization: {str(e)}")
            raise

    async def get_family_overview(
        self,
        user_id: str,
        program_id: str
    ) -> Dict[str, Any]:
        """
        Get complete family overview for a user (parent or child).
        
        Args:
            user_id: User ID (can be parent or child)
            program_id: Program context
            
        Returns:
            Family overview data
        """
        try:
            from app.features.users.services.user_service import UserService
            user_service = UserService(self.db)
            
            # Get user details
            user = user_service.get_user(user_id)
            if not user:
                raise ValidationError(f"User {user_id} not found")
            
            # Get user's program assignment to determine roles
            assignment = user_service.get_user_program_assignment(user_id, program_id)
            if not assignment:
                raise ValidationError(f"User {user_id} not assigned to program {program_id}")
            
            family_data = {
                'user': user,
                'roles': assignment.roles,
                'relationships': [],
                'organization_memberships': []
            }
            
            # If user is a parent, get their children
            if 'parent' in assignment.roles:
                children_relationships = user_service.get_parent_children_relationships(user_id, program_id)
                family_data['relationships'].extend(children_relationships)
                family_data['is_parent'] = True
            
            # If user is a student, get their parents
            if 'student' in assignment.roles:
                parent_relationships = user_service.get_child_parents_relationships(user_id, program_id)
                family_data['relationships'].extend(parent_relationships)
                family_data['is_student'] = True
            
            # Get organization memberships
            from app.features.organizations.services.organization_service import OrganizationService
            org_service = OrganizationService(self.db)
            memberships = org_service.get_user_memberships(user_id, program_id)
            family_data['organization_memberships'] = memberships
            
            logger.info(f"Retrieved family overview for user {user_id}")
            return family_data
            
        except Exception as e:
            logger.error(f"Error getting family overview for user {user_id}: {str(e)}")
            raise

    async def validate_creation_data(
        self,
        creation_mode: CreationMode,
        organization_mode: OrganizationMode,
        profile_data: Dict[str, Any],
        program_id: str
    ) -> Dict[str, List[str]]:
        """
        Validate profile creation data before attempting creation.
        
        Args:
            creation_mode: Creation mode
            organization_mode: Organization mode
            profile_data: Profile data to validate
            program_id: Program context
            
        Returns:
            Dictionary of validation errors by field
        """
        errors = {}
        
        try:
            # Validate organization if specified
            if organization_mode == OrganizationMode.ORGANIZATION_SPONSORED:
                org_id = profile_data.get('organization_id')
                if not org_id:
                    errors['organization_id'] = ['Organization is required for sponsored profiles']
                else:
                    from app.features.organizations.services.organization_service import OrganizationService
                    org_service = OrganizationService(self.db)
                    org = org_service.get_organization(org_id, program_id)
                    if not org:
                        errors['organization_id'] = ['Organization not found']
                    elif not org.is_partner:
                        errors['organization_id'] = ['Organization is not a partner']
            
            # Validate based on creation mode
            if creation_mode == CreationMode.INDEPENDENT_STUDENT:
                student_errors = self._validate_student_data(profile_data.get('student', {}))
                if student_errors:
                    errors['student'] = student_errors
            
            elif creation_mode == CreationMode.STUDENT_WITH_PARENT:
                student_errors = self._validate_student_data(profile_data.get('student', {}))
                if student_errors:
                    errors['student'] = student_errors
                
                parent_id = profile_data.get('parent_id')
                if not parent_id:
                    errors['parent_id'] = ['Parent is required']
                else:
                    # Validate parent exists
                    from app.features.users.services.user_service import UserService
                    user_service = UserService(self.db)
                    parent_assignment = user_service.get_user_program_assignment(parent_id, program_id)
                    if not parent_assignment or 'parent' not in parent_assignment.roles:
                        errors['parent_id'] = ['Parent not found or not a parent in this program']
            
            elif creation_mode == CreationMode.PARENT_WITH_CHILDREN:
                parent_errors = self._validate_parent_data(profile_data.get('parent', {}))
                if parent_errors:
                    errors['parent'] = parent_errors
                
                child_relationships = profile_data.get('child_relationships', [])
                if not child_relationships:
                    errors['child_relationships'] = ['At least one child relationship is required']
                else:
                    for i, child_rel in enumerate(child_relationships):
                        child_id = child_rel.get('child_id')
                        if not child_id:
                            if 'child_relationships' not in errors:
                                errors['child_relationships'] = []
                            errors['child_relationships'].append(f'Child {i+1}: Child ID is required')
            
            elif creation_mode == CreationMode.FAMILY_UNIT:
                parents_data = profile_data.get('parents', [])
                children_data = profile_data.get('children', [])
                
                if not parents_data:
                    errors['parents'] = ['At least one parent is required']
                if not children_data:
                    errors['children'] = ['At least one child is required']
                
                # Validate each parent and child
                for i, parent_data in enumerate(parents_data):
                    parent_errors = self._validate_parent_data(parent_data)
                    if parent_errors:
                        errors[f'parent_{i}'] = parent_errors
                
                for i, child_data in enumerate(children_data):
                    child_errors = self._validate_student_data(child_data)
                    if child_errors:
                        errors[f'child_{i}'] = child_errors
            
            return errors
            
        except Exception as e:
            logger.error(f"Error validating creation data: {str(e)}")
            return {'general': [f'Validation error: {str(e)}']}

    def _validate_student_data(self, student_data: Dict[str, Any]) -> List[str]:
        """Validate student data."""
        errors = []
        
        if not student_data.get('first_name') or not student_data.get('last_name'):
            errors.append('First name and last name are required')
        
        # Add other student validation rules as needed
        
        return errors

    def _validate_parent_data(self, parent_data: Dict[str, Any]) -> List[str]:
        """Validate parent data."""
        errors = []
        
        if not parent_data.get('first_name') or not parent_data.get('last_name'):
            errors.append('First name and last name are required')
        
        if not parent_data.get('email'):
            errors.append('Email is required for parents')
        
        # Add other parent validation rules as needed
        
        return errors


# Dependency injection function
def get_relationship_management_service(db: Session = None) -> RelationshipManagementService:
    """Get RelationshipManagementService instance."""
    if db is None:
        db = next(get_db())
    return RelationshipManagementService(db)