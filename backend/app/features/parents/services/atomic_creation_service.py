"""
Atomic Creation Service for complex profile creation scenarios.

This service handles complex creation workflows that involve multiple models
and relationships, ensuring data consistency through database transactions.
"""

from typing import Dict, List, Optional, Any, Union, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
import logging

from app.features.authentication.models.user import User
from app.features.authentication.models.user_relationship import UserRelationship
from app.features.authentication.models.user_program_assignment import UserProgramAssignment
from app.features.students.models.student import Student
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship
from app.features.organizations.models.organization_membership import OrganizationMembership
from app.features.authentication.services.user_service import user_service
from app.features.common.models.enums import UserRole, RelationshipType
from app.features.parents.schemas.parent import ParentCreate
from app.features.students.schemas.student import StudentCreate

logger = logging.getLogger(__name__)


class AtomicCreationService:
    """
    Service for handling atomic profile creation with complex relationships.
    
    This service ensures that complex creation operations involving multiple
    entities are handled atomically, with proper rollback on failures.
    """

    @staticmethod
    def create_parent_with_children(
        db: Session,
        parent_data: ParentCreate,
        children_data: List[StudentCreate],
        program_context: str,
        organization_id: Optional[str] = None,
        created_by: str = None
    ) -> Dict[str, Any]:
        """
        Atomically create a parent with multiple children.
        
        Args:
            db: Database session
            parent_data: Parent creation data
            children_data: List of children creation data
            program_context: Program context for assignments
            organization_id: Optional organization for membership
            created_by: ID of user creating the profiles
            
        Returns:
            Dict containing created parent and children information
            
        Raises:
            HTTPException: On validation or creation errors
        """
        try:
            # Start transaction
            db.begin()
            
            # Step 1: Create parent user account
            parent_user_data = {
                "username": parent_data.username,
                "email": parent_data.email,
                "password": parent_data.password,
                "first_name": parent_data.first_name,
                "last_name": parent_data.last_name,
                "salutation": parent_data.salutation,
                "phone": parent_data.phone,
                "date_of_birth": parent_data.date_of_birth,
                "referral_source": parent_data.referral_source,
                "profile_photo_url": parent_data.profile_photo_url
            }
            
            parent_user = user_service.create_user_with_roles(
                db=db,
                user_data=parent_user_data,
                roles=[UserRole.PARENT.value],
                created_by=created_by
            )
            
            # Step 2: Create parent profile
            parent_profile = Parent(
                user_id=parent_user.id,
                program_id=program_context,
                address=parent_data.address,
                emergency_contact_name=parent_data.emergency_contact_name,
                emergency_contact_phone=parent_data.emergency_contact_phone,
                occupation=parent_data.occupation,
                payment_responsibility=parent_data.payment_responsibility or True,
                created_by=created_by
            )
            
            db.add(parent_profile)
            db.flush()  # Get the parent ID
            
            # Step 3: Create organization membership if specified
            if organization_id:
                membership = OrganizationMembership(
                    user_id=parent_user.id,
                    organization_id=organization_id,
                    program_id=program_context,
                    is_primary_contact=True,
                    created_by=created_by
                )
                db.add(membership)
            
            # Step 4: Create children and relationships
            created_children = []
            
            for child_data in children_data:
                # Create child user (may not have login credentials)
                child_user_data = {
                    "username": child_data.username or f"{child_data.first_name.lower()}.{child_data.last_name.lower()}",
                    "email": child_data.email,  # May be None
                    "password": child_data.password,  # May be None
                    "first_name": child_data.first_name,
                    "last_name": child_data.last_name,
                    "date_of_birth": child_data.date_of_birth,
                    "phone": child_data.phone,
                    "referral_source": child_data.referral_source or parent_data.referral_source or "Parent referral",
                    "profile_photo_url": child_data.profile_photo_url
                }
                
                # Remove None values for optional fields
                child_user_data = {k: v for k, v in child_user_data.items() if v is not None}
                
                child_user = user_service.create_user_with_roles(
                    db=db,
                    user_data=child_user_data,
                    roles=[UserRole.STUDENT.value],
                    created_by=created_by
                )
                
                # Create student profile
                student_profile = Student(
                    user_id=child_user.id,
                    program_id=program_context,
                    address=child_data.address or parent_data.address,
                    emergency_contact_name=child_data.emergency_contact_name or f"{parent_data.first_name} {parent_data.last_name}",
                    emergency_contact_phone=child_data.emergency_contact_phone or parent_data.phone,
                    medical_conditions=child_data.medical_conditions,
                    dietary_restrictions=child_data.dietary_restrictions,
                    created_by=created_by
                )
                
                db.add(student_profile)
                db.flush()
                
                # Create parent-child relationship
                relationship = UserRelationship(
                    user_id=parent_user.id,
                    related_user_id=child_user.id,
                    relationship_type=RelationshipType.PARENT_CHILD,
                    program_id=program_context,
                    created_by=created_by
                )
                
                db.add(relationship)
                
                # Create parent-child specific relationship
                parent_child_rel = ParentChildRelationship(
                    parent_id=parent_profile.id,
                    student_id=student_profile.id,
                    can_pickup=True,
                    is_emergency_contact=True,
                    has_payment_responsibility=parent_data.payment_responsibility or True,
                    created_by=created_by
                )
                
                db.add(parent_child_rel)
                
                # Inherit organization membership if parent has one
                if organization_id:
                    child_membership = OrganizationMembership(
                        user_id=child_user.id,
                        organization_id=organization_id,
                        program_id=program_context,
                        is_primary_contact=False,
                        created_by=created_by
                    )
                    db.add(child_membership)
                
                created_children.append({
                    "user": child_user,
                    "profile": student_profile,
                    "relationship": parent_child_rel
                })
            
            # Commit transaction
            db.commit()
            
            logger.info(f"Successfully created parent {parent_user.id} with {len(created_children)} children")
            
            return {
                "parent": {
                    "user": parent_user,
                    "profile": parent_profile
                },
                "children": created_children,
                "organization_membership": organization_id is not None
            }
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error creating parent with children: {str(e)}")
            
            # Check for common integrity violations
            if "username" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
            elif "email" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Data integrity violation"
                )
                
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error creating parent with children: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during profile creation"
            )
            
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error creating parent with children: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error during profile creation"
            )

    @staticmethod
    def create_student_with_parent_relationship(
        db: Session,
        student_data: StudentCreate,
        parent_id: str,
        program_context: str,
        created_by: str = None
    ) -> Dict[str, Any]:
        """
        Create a student and link to an existing parent.
        
        Args:
            db: Database session
            student_data: Student creation data
            parent_id: ID of existing parent
            program_context: Program context
            created_by: ID of user creating the profile
            
        Returns:
            Dict containing created student and relationship information
        """
        try:
            db.begin()
            
            # Verify parent exists
            parent_user = db.query(User).filter(User.id == parent_id).first()
            if not parent_user or UserRole.PARENT.value not in parent_user.roles:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent not found"
                )
            
            parent_profile = db.query(Parent).filter(Parent.user_id == parent_id).first()
            if not parent_profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent profile not found"
                )
            
            # Create student user
            student_user_data = {
                "username": student_data.username or f"{student_data.first_name.lower()}.{student_data.last_name.lower()}",
                "email": student_data.email,  # May be None
                "password": student_data.password,  # May be None
                "first_name": student_data.first_name,
                "last_name": student_data.last_name,
                "date_of_birth": student_data.date_of_birth,
                "phone": student_data.phone,
                "referral_source": student_data.referral_source or "Parent referral",
                "profile_photo_url": student_data.profile_photo_url
            }
            
            # Remove None values
            student_user_data = {k: v for k, v in student_user_data.items() if v is not None}
            
            student_user = user_service.create_user_with_roles(
                db=db,
                user_data=student_user_data,
                roles=[UserRole.STUDENT.value],
                created_by=created_by
            )
            
            # Create student profile with inherited data from parent
            student_profile = Student(
                user_id=student_user.id,
                program_id=program_context,
                address=student_data.address or parent_profile.address,
                emergency_contact_name=student_data.emergency_contact_name or f"{parent_user.first_name} {parent_user.last_name}",
                emergency_contact_phone=student_data.emergency_contact_phone or parent_user.phone,
                medical_conditions=student_data.medical_conditions,
                dietary_restrictions=student_data.dietary_restrictions,
                created_by=created_by
            )
            
            db.add(student_profile)
            db.flush()
            
            # Create relationships
            user_relationship = UserRelationship(
                user_id=parent_id,
                related_user_id=student_user.id,
                relationship_type=RelationshipType.PARENT_CHILD,
                program_id=program_context,
                created_by=created_by
            )
            
            db.add(user_relationship)
            
            parent_child_rel = ParentChildRelationship(
                parent_id=parent_profile.id,
                student_id=student_profile.id,
                can_pickup=True,
                is_emergency_contact=True,
                has_payment_responsibility=parent_profile.payment_responsibility,
                created_by=created_by
            )
            
            db.add(parent_child_rel)
            
            # Inherit organization membership from parent
            parent_org_membership = db.query(OrganizationMembership).filter(
                OrganizationMembership.user_id == parent_id,
                OrganizationMembership.program_id == program_context
            ).first()
            
            if parent_org_membership:
                student_membership = OrganizationMembership(
                    user_id=student_user.id,
                    organization_id=parent_org_membership.organization_id,
                    program_id=program_context,
                    is_primary_contact=False,
                    created_by=created_by
                )
                db.add(student_membership)
            
            db.commit()
            
            logger.info(f"Successfully created student {student_user.id} with parent relationship to {parent_id}")
            
            return {
                "student": {
                    "user": student_user,
                    "profile": student_profile
                },
                "relationship": parent_child_rel,
                "organization_inherited": parent_org_membership is not None
            }
            
        except HTTPException:
            db.rollback()
            raise
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating student with parent relationship: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating student profile"
            )

    @staticmethod
    def update_family_relationships(
        db: Session,
        parent_id: str,
        student_id: str,
        relationship_updates: Dict[str, Any],
        program_context: str,
        updated_by: str = None
    ) -> ParentChildRelationship:
        """
        Update parent-child relationship settings.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            student_id: Student profile ID
            relationship_updates: Fields to update
            program_context: Program context
            updated_by: ID of user making updates
            
        Returns:
            Updated ParentChildRelationship
        """
        try:
            relationship = db.query(ParentChildRelationship).filter(
                ParentChildRelationship.parent_id == parent_id,
                ParentChildRelationship.student_id == student_id
            ).first()
            
            if not relationship:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent-child relationship not found"
                )
            
            # Update allowed fields
            allowed_fields = [
                'can_pickup', 'is_emergency_contact', 'has_payment_responsibility',
                'pickup_notes', 'special_instructions'
            ]
            
            for field, value in relationship_updates.items():
                if field in allowed_fields and hasattr(relationship, field):
                    setattr(relationship, field, value)
            
            relationship.updated_by = updated_by
            db.commit()
            db.refresh(relationship)
            
            return relationship
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating family relationship: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating relationship"
            )


# Singleton instance
atomic_creation_service = AtomicCreationService()