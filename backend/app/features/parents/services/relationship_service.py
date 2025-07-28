"""
Relationship Service for managing parent-child relationships.

This service handles the complex business logic around family relationships,
including relationship creation, updates, and permission management.
"""

from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
import logging

from app.features.authentication.models.user import User
from app.features.authentication.models.user_relationship import UserRelationship
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship
from app.features.students.models.student import Student
from app.features.organizations.models.organization_membership import OrganizationMembership
from app.features.common.models.enums import UserRole, RelationshipType

logger = logging.getLogger(__name__)


class RelationshipService:
    """
    Service class for managing parent-child relationships and family structures.
    
    Handles relationship creation, permission management, and family structure
    queries within program context boundaries.
    """

    @staticmethod
    def create_parent_child_relationship(
        db: Session,
        parent_id: str,
        student_id: str,
        program_context: str,
        relationship_data: Optional[Dict[str, Any]] = None,
        created_by: str = None
    ) -> ParentChildRelationship:
        """
        Create a parent-child relationship between existing profiles.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            student_id: Student profile ID
            program_context: Program context
            relationship_data: Optional relationship settings
            created_by: ID of user creating relationship
            
        Returns:
            Created ParentChildRelationship
        """
        try:
            # Verify parent exists
            parent = db.query(Parent).filter(
                Parent.id == parent_id,
                Parent.program_id == program_context
            ).first()
            
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent profile not found"
                )
            
            # Verify student exists
            student = db.query(Student).filter(
                Student.id == student_id,
                Student.program_id == program_context
            ).first()
            
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student profile not found"
                )
            
            # Check if relationship already exists
            existing_relationship = db.query(ParentChildRelationship).filter(
                ParentChildRelationship.parent_id == parent_id,
                ParentChildRelationship.student_id == student_id
            ).first()
            
            if existing_relationship:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent-child relationship already exists"
                )
            
            # Set default relationship data
            rel_data = relationship_data or {}
            
            # Create parent-child relationship
            parent_child_rel = ParentChildRelationship(
                parent_id=parent_id,
                student_id=student_id,
                can_pickup=rel_data.get('can_pickup', True),
                is_emergency_contact=rel_data.get('is_emergency_contact', True),
                has_payment_responsibility=rel_data.get('has_payment_responsibility', parent.payment_responsibility),
                pickup_notes=rel_data.get('pickup_notes'),
                special_instructions=rel_data.get('special_instructions'),
                created_by=created_by
            )
            
            db.add(parent_child_rel)
            
            # Create general user relationship
            user_relationship = UserRelationship(
                user_id=parent.user_id,
                related_user_id=student.user_id,
                relationship_type=RelationshipType.PARENT_CHILD,
                program_id=program_context,
                created_by=created_by
            )
            
            db.add(user_relationship)
            db.commit()
            db.refresh(parent_child_rel)
            
            logger.info(f"Created parent-child relationship: parent {parent_id} -> student {student_id}")
            return parent_child_rel
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating parent-child relationship: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating parent-child relationship"
            )

    @staticmethod
    def get_relationship(
        db: Session,
        parent_id: str,
        student_id: str
    ) -> Optional[ParentChildRelationship]:
        """
        Get parent-child relationship by IDs.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            student_id: Student profile ID
            
        Returns:
            ParentChildRelationship or None
        """
        return db.query(ParentChildRelationship).options(
            joinedload(ParentChildRelationship.parent),
            joinedload(ParentChildRelationship.student)
        ).filter(
            ParentChildRelationship.parent_id == parent_id,
            ParentChildRelationship.student_id == student_id
        ).first()

    @staticmethod
    def update_relationship(
        db: Session,
        parent_id: str,
        student_id: str,
        relationship_updates: Dict[str, Any],
        updated_by: str = None
    ) -> ParentChildRelationship:
        """
        Update parent-child relationship settings.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            student_id: Student profile ID
            relationship_updates: Fields to update
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
            
            logger.info(f"Updated parent-child relationship: parent {parent_id} -> student {student_id}")
            return relationship
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating parent-child relationship: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating parent-child relationship"
            )

    @staticmethod
    def remove_relationship(
        db: Session,
        parent_id: str,
        student_id: str,
        program_context: str,
        deleted_by: str = None
    ) -> bool:
        """
        Remove parent-child relationship.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            student_id: Student profile ID
            program_context: Program context
            deleted_by: ID of user removing relationship
            
        Returns:
            True if successful
        """
        try:
            # Get the relationship
            relationship = db.query(ParentChildRelationship).filter(
                ParentChildRelationship.parent_id == parent_id,
                ParentChildRelationship.student_id == student_id
            ).first()
            
            if not relationship:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent-child relationship not found"
                )
            
            # Get parent and student to find user IDs
            parent = db.query(Parent).filter(Parent.id == parent_id).first()
            student = db.query(Student).filter(Student.id == student_id).first()
            
            if not parent or not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent or student profile not found"
                )
            
            # Remove general user relationship
            user_relationship = db.query(UserRelationship).filter(
                UserRelationship.user_id == parent.user_id,
                UserRelationship.related_user_id == student.user_id,
                UserRelationship.relationship_type == RelationshipType.PARENT_CHILD,
                UserRelationship.program_id == program_context
            ).first()
            
            if user_relationship:
                db.delete(user_relationship)
            
            # Remove parent-child specific relationship
            db.delete(relationship)
            db.commit()
            
            logger.info(f"Removed parent-child relationship: parent {parent_id} -> student {student_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error removing parent-child relationship: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error removing parent-child relationship"
            )

    @staticmethod
    def get_parent_children_relationships(
        db: Session,
        parent_id: str,
        program_context: str = None
    ) -> List[ParentChildRelationship]:
        """
        Get all children relationships for a parent.
        
        Args:
            db: Database session
            parent_id: Parent profile ID
            program_context: Optional program context filter
            
        Returns:
            List of ParentChildRelationship objects
        """
        query = db.query(ParentChildRelationship).options(
            joinedload(ParentChildRelationship.student).joinedload(Student.user),
            joinedload(ParentChildRelationship.parent).joinedload(Parent.user)
        ).filter(
            ParentChildRelationship.parent_id == parent_id
        )
        
        # Filter by program context if provided
        if program_context:
            query = query.join(Student).filter(Student.program_id == program_context)
        
        return query.all()

    @staticmethod
    def get_student_parent_relationships(
        db: Session,
        student_id: str,
        program_context: str = None
    ) -> List[ParentChildRelationship]:
        """
        Get all parent relationships for a student.
        
        Args:
            db: Database session
            student_id: Student profile ID
            program_context: Optional program context filter
            
        Returns:
            List of ParentChildRelationship objects
        """
        query = db.query(ParentChildRelationship).options(
            joinedload(ParentChildRelationship.parent).joinedload(Parent.user),
            joinedload(ParentChildRelationship.student).joinedload(Student.user)
        ).filter(
            ParentChildRelationship.student_id == student_id
        )
        
        # Filter by program context if provided
        if program_context:
            query = query.join(Parent).filter(Parent.program_id == program_context)
        
        return query.all()

    @staticmethod
    def get_family_structure(
        db: Session,
        user_id: str,
        program_context: str
    ) -> Dict[str, Any]:
        """
        Get complete family structure for a user (parent or student).
        
        Args:
            db: Database session
            user_id: User ID (can be parent or student)
            program_context: Program context
            
        Returns:
            Dictionary with family structure information
        """
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        family_structure = {
            "user": user,
            "children": [],
            "parents": []
        }
        
        # If user is a parent, get their children
        if UserRole.PARENT.value in user.roles:
            parent_profile = db.query(Parent).filter(
                Parent.user_id == user_id,
                Parent.program_id == program_context
            ).first()
            
            if parent_profile:
                children_relationships = RelationshipService.get_parent_children_relationships(
                    db, parent_profile.id, program_context
                )
                
                for rel in children_relationships:
                    child_info = {
                        "user": rel.student.user,
                        "student_profile": rel.student,
                        "relationship": {
                            "can_pickup": rel.can_pickup,
                            "is_emergency_contact": rel.is_emergency_contact,
                            "has_payment_responsibility": rel.has_payment_responsibility,
                            "pickup_notes": rel.pickup_notes,
                            "special_instructions": rel.special_instructions
                        }
                    }
                    family_structure["children"].append(child_info)
        
        # If user is a student, get their parents
        if UserRole.STUDENT.value in user.roles:
            student_profile = db.query(Student).filter(
                Student.user_id == user_id,
                Student.program_id == program_context
            ).first()
            
            if student_profile:
                parent_relationships = RelationshipService.get_student_parent_relationships(
                    db, student_profile.id, program_context
                )
                
                for rel in parent_relationships:
                    parent_info = {
                        "user": rel.parent.user,
                        "parent_profile": rel.parent,
                        "relationship": {
                            "can_pickup": rel.can_pickup,
                            "is_emergency_contact": rel.is_emergency_contact,
                            "has_payment_responsibility": rel.has_payment_responsibility,
                            "pickup_notes": rel.pickup_notes,
                            "special_instructions": rel.special_instructions
                        }
                    }
                    family_structure["parents"].append(parent_info)
        
        return family_structure

    @staticmethod
    def get_pickup_authorized_parents(
        db: Session,
        student_id: str,
        program_context: str
    ) -> List[Dict[str, Any]]:
        """
        Get all parents authorized to pick up a specific student.
        
        Args:
            db: Database session
            student_id: Student profile ID
            program_context: Program context
            
        Returns:
            List of authorized parents with contact information
        """
        relationships = db.query(ParentChildRelationship).options(
            joinedload(ParentChildRelationship.parent).joinedload(Parent.user)
        ).filter(
            ParentChildRelationship.student_id == student_id,
            ParentChildRelationship.can_pickup == True
        ).join(Parent).filter(
            Parent.program_id == program_context
        ).all()
        
        authorized_parents = []
        for rel in relationships:
            parent_info = {
                "parent_id": rel.parent_id,
                "user_id": rel.parent.user_id,
                "name": f"{rel.parent.user.first_name} {rel.parent.user.last_name}",
                "phone": rel.parent.user.phone,
                "email": rel.parent.user.email,
                "is_emergency_contact": rel.is_emergency_contact,
                "pickup_notes": rel.pickup_notes
            }
            authorized_parents.append(parent_info)
        
        return authorized_parents

    @staticmethod
    def get_emergency_contacts(
        db: Session,
        student_id: str,
        program_context: str
    ) -> List[Dict[str, Any]]:
        """
        Get all emergency contacts for a specific student.
        
        Args:
            db: Database session
            student_id: Student profile ID
            program_context: Program context
            
        Returns:
            List of emergency contacts
        """
        relationships = db.query(ParentChildRelationship).options(
            joinedload(ParentChildRelationship.parent).joinedload(Parent.user)
        ).filter(
            ParentChildRelationship.student_id == student_id,
            ParentChildRelationship.is_emergency_contact == True
        ).join(Parent).filter(
            Parent.program_id == program_context
        ).all()
        
        emergency_contacts = []
        for rel in relationships:
            contact_info = {
                "parent_id": rel.parent_id,
                "user_id": rel.parent.user_id,
                "name": f"{rel.parent.user.first_name} {rel.parent.user.last_name}",
                "phone": rel.parent.user.phone,
                "email": rel.parent.user.email,
                "relationship": "Parent/Guardian",
                "special_instructions": rel.special_instructions
            }
            emergency_contacts.append(contact_info)
        
        return emergency_contacts


# Singleton instance
relationship_service = RelationshipService()