"""
Unified Family Management Service

High-level service for complex family creation and management workflows.
Orchestrates multiple services for comprehensive family operations.
"""

from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID, uuid4
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
import logging
from datetime import datetime

from app.features.authentication.models.user import User
from app.features.parents.models.parent import Parent
from app.features.students.models.student import Student
from app.features.parents.models.parent_child_relationship import ParentChildRelationship
from app.features.organizations.models.organization_membership import OrganizationMembership

from app.features.parents.services.atomic_creation_service import atomic_creation_service
from app.features.parents.services.parent_service import parent_service
from app.features.parents.services.relationship_service import relationship_service
from app.features.authentication.services.user_service import user_service

from app.features.parents.schemas.family_creation import (
    ParentWithChildrenCreate,
    MultiParentFamily,
    StudentToParentLink,
    FamilyCreationResponse,
    FamilySearchParams,
    FamilyStructureResponse,
    FamilyCreationType,
    EnhancedStudentCreate
)

logger = logging.getLogger(__name__)


class FamilyService:
    """
    Unified service for comprehensive family management operations.
    
    Provides high-level orchestration of family creation, management,
    and complex relationship operations across multiple services.
    """

    @staticmethod
    def create_parent_with_children_family(
        db: Session,
        family_data: ParentWithChildrenCreate,
        program_context: str,
        created_by: str = None
    ) -> FamilyCreationResponse:
        """
        Create a complete family with parent and multiple children.
        
        Args:
            db: Database session
            family_data: Comprehensive family creation data
            program_context: Program context
            created_by: ID of user creating the family
            
        Returns:
            FamilyCreationResponse with complete creation details
        """
        try:
            # Generate family ID for tracking
            family_id = f"family_{family_data.parent_data.last_name.lower()}_{datetime.now().strftime('%Y%m%d')}"
            
            # Convert enhanced student data to basic student data
            children_data = []
            for enhanced_student in family_data.children_data:
                # Extract basic student data
                student_data = enhanced_student.copy(exclude={'relationship_settings', 'inherit_from_parent'})
                children_data.append(student_data)
            
            # Use atomic creation service for the core creation
            result = atomic_creation_service.create_parent_with_children(
                db=db,
                parent_data=family_data.parent_data,
                children_data=children_data,
                program_context=program_context,
                organization_id=family_data.organization_id,
                created_by=created_by
            )
            
            # Extract created entities
            parent_user = result["parent"]["user"]
            parent_profile = result["parent"]["profile"]
            created_children = result["children"]
            
            # Update relationships with enhanced settings
            relationship_updates = []
            for i, enhanced_student in enumerate(family_data.children_data):
                if i < len(created_children):
                    child_info = created_children[i]
                    relationship = child_info["relationship"]
                    
                    # Apply custom relationship settings if provided
                    if enhanced_student.relationship_settings:
                        settings = enhanced_student.relationship_settings
                        
                        updated_rel = relationship_service.update_relationship(
                            db=db,
                            parent_id=relationship.parent_id,
                            student_id=relationship.student_id,
                            relationship_updates={
                                'can_pickup': settings.can_pickup,
                                'is_emergency_contact': settings.is_emergency_contact,
                                'has_payment_responsibility': settings.has_payment_responsibility,
                                'pickup_notes': settings.pickup_notes,
                                'special_instructions': settings.special_instructions
                            },
                            updated_by=created_by
                        )
                        relationship_updates.append(updated_rel)
            
            # Build comprehensive response
            created_parents = [{
                "parent_id": str(parent_profile.id),
                "user_id": str(parent_user.id),
                "first_name": parent_user.first_name,
                "last_name": parent_user.last_name,
                "email": parent_user.email,
                "phone": parent_user.phone,
                "is_active": parent_user.is_active,
                "payment_responsibility": parent_profile.payment_responsibility,
                "created_at": parent_profile.created_at.isoformat()
            }]
            
            created_children_response = []
            for child_info in created_children:
                student = child_info["profile"]
                user = child_info["user"]
                
                child_response = {
                    "student_id": str(student.id),
                    "user_id": str(user.id),
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
                    "has_login_credentials": bool(user.email and hasattr(user, 'password_hash')),
                    "is_active": user.is_active,
                    "created_at": student.created_at.isoformat()
                }
                created_children_response.append(child_response)
            
            created_relationships_response = []
            relationships_to_use = relationship_updates if relationship_updates else [child["relationship"] for child in created_children]
            
            for rel in relationships_to_use:
                rel_response = {
                    "parent_id": str(rel.parent_id),
                    "student_id": str(rel.student_id),
                    "can_pickup": rel.can_pickup,
                    "is_emergency_contact": rel.is_emergency_contact,
                    "has_payment_responsibility": rel.has_payment_responsibility,
                    "pickup_notes": rel.pickup_notes,
                    "special_instructions": rel.special_instructions
                }
                created_relationships_response.append(rel_response)
            
            # Get organization memberships if any
            organization_memberships = []
            if family_data.organization_id:
                # Get all family members' organization memberships
                family_user_ids = [parent_user.id] + [child["user"].id for child in created_children]
                
                for user_id in family_user_ids:
                    membership = db.query(OrganizationMembership).filter(
                        OrganizationMembership.user_id == user_id,
                        OrganizationMembership.organization_id == family_data.organization_id,
                        OrganizationMembership.program_id == program_context
                    ).first()
                    
                    if membership:
                        membership_info = {
                            "user_id": str(membership.user_id),
                            "organization_id": str(membership.organization_id),
                            "is_primary_contact": membership.is_primary_contact,
                            "created_at": membership.created_at.isoformat()
                        }
                        organization_memberships.append(membership_info)
            
            warnings = []
            if family_data.family_notes:
                warnings.append(f"Family notes: {family_data.family_notes}")
            
            logger.info(f"Successfully created family {family_id} with {len(created_parents)} parents and {len(created_children_response)} children")
            
            return FamilyCreationResponse(
                success=True,
                creation_type=family_data.creation_type,
                created_parents=created_parents,
                created_children=created_children_response,
                created_relationships=created_relationships_response,
                organization_memberships=organization_memberships,
                warnings=warnings,
                family_id=family_id
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating parent with children family: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating family"
            )

    @staticmethod
    def create_multi_parent_family(
        db: Session,
        family_data: MultiParentFamily,
        program_context: str,
        created_by: str = None
    ) -> FamilyCreationResponse:
        """
        Create a complex multi-parent family with custom relationships.
        
        Args:
            db: Database session
            family_data: Multi-parent family creation data
            program_context: Program context
            created_by: ID of user creating the family
            
        Returns:
            FamilyCreationResponse with complete creation details
        """
        try:
            db.begin()
            
            family_id = f"family_multiparent_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Step 1: Create all parents
            created_parents = []
            for parent_data in family_data.parents_data:
                # Create parent using atomic service (without children)
                result = atomic_creation_service.create_parent_with_children(
                    db=db,
                    parent_data=parent_data,
                    children_data=[],  # No children in this step
                    program_context=program_context,
                    organization_id=family_data.organization_id,
                    created_by=created_by
                )
                created_parents.append(result["parent"])
            
            # Step 2: Create all children
            created_children = []
            for child_data in family_data.children_data:
                # Create child user and profile
                child_user_data = {
                    "username": child_data.username or f"{child_data.first_name.lower()}.{child_data.last_name.lower()}",
                    "email": child_data.email,
                    "password": child_data.password,
                    "first_name": child_data.first_name,
                    "last_name": child_data.last_name,
                    "date_of_birth": child_data.date_of_birth,
                    "phone": child_data.phone,
                    "referral_source": child_data.referral_source or "Multi-parent family",
                    "profile_photo_url": child_data.profile_photo_url
                }
                
                # Remove None values
                child_user_data = {k: v for k, v in child_user_data.items() if v is not None}
                
                child_user = user_service.create_user_with_roles(
                    db=db,
                    user_data=child_user_data,
                    roles=["student"],
                    created_by=created_by
                )
                
                # Create student profile
                student_profile = Student(
                    user_id=child_user.id,
                    program_id=program_context,
                    address=child_data.address,
                    emergency_contact_name=child_data.emergency_contact_name,
                    emergency_contact_phone=child_data.emergency_contact_phone,
                    medical_conditions=child_data.medical_conditions,
                    dietary_restrictions=child_data.dietary_restrictions,
                    created_by=created_by
                )
                
                db.add(student_profile)
                db.flush()
                
                # Add organization membership if applicable
                if family_data.organization_id:
                    child_membership = OrganizationMembership(
                        user_id=child_user.id,
                        organization_id=family_data.organization_id,
                        program_id=program_context,
                        is_primary_contact=False,
                        created_by=created_by
                    )
                    db.add(child_membership)
                
                created_children.append({
                    "user": child_user,
                    "profile": student_profile
                })
            
            # Step 3: Create parent-child relationships based on mappings
            created_relationships = []
            for mapping in family_data.parent_child_mappings:
                parent_index = mapping["parent_index"]
                child_index = mapping["child_index"]
                
                parent_info = created_parents[parent_index]
                child_info = created_children[child_index]
                
                relationship_settings = mapping.get("relationship_settings", {})
                
                relationship = relationship_service.create_parent_child_relationship(
                    db=db,
                    parent_id=parent_info["profile"].id,
                    student_id=child_info["profile"].id,
                    program_context=program_context,
                    relationship_data=relationship_settings,
                    created_by=created_by
                )
                
                created_relationships.append(relationship)
            
            db.commit()
            
            # Build response
            created_parents_response = []
            for parent_info in created_parents:
                parent_response = {
                    "parent_id": str(parent_info["profile"].id),
                    "user_id": str(parent_info["user"].id),
                    "first_name": parent_info["user"].first_name,
                    "last_name": parent_info["user"].last_name,
                    "email": parent_info["user"].email,
                    "phone": parent_info["user"].phone,
                    "is_active": parent_info["user"].is_active,
                    "payment_responsibility": parent_info["profile"].payment_responsibility,
                    "created_at": parent_info["profile"].created_at.isoformat()
                }
                created_parents_response.append(parent_response)
            
            created_children_response = []
            for child_info in created_children:
                child_response = {
                    "student_id": str(child_info["profile"].id),
                    "user_id": str(child_info["user"].id),
                    "first_name": child_info["user"].first_name,
                    "last_name": child_info["user"].last_name,
                    "date_of_birth": child_info["user"].date_of_birth.isoformat() if child_info["user"].date_of_birth else None,
                    "has_login_credentials": bool(child_info["user"].email),
                    "is_active": child_info["user"].is_active,
                    "created_at": child_info["profile"].created_at.isoformat()
                }
                created_children_response.append(child_response)
            
            created_relationships_response = []
            for rel in created_relationships:
                rel_response = {
                    "parent_id": str(rel.parent_id),
                    "student_id": str(rel.student_id),
                    "can_pickup": rel.can_pickup,
                    "is_emergency_contact": rel.is_emergency_contact,
                    "has_payment_responsibility": rel.has_payment_responsibility,
                    "pickup_notes": rel.pickup_notes,
                    "special_instructions": rel.special_instructions
                }
                created_relationships_response.append(rel_response)
            
            warnings = []
            if family_data.family_structure_notes:
                warnings.append(f"Family structure notes: {family_data.family_structure_notes}")
            
            logger.info(f"Successfully created multi-parent family {family_id} with {len(created_parents)} parents and {len(created_children)} children")
            
            return FamilyCreationResponse(
                success=True,
                creation_type=family_data.creation_type,
                created_parents=created_parents_response,
                created_children=created_children_response,
                created_relationships=created_relationships_response,
                organization_memberships=[],  # TODO: Add organization membership details
                warnings=warnings,
                family_id=family_id
            )
            
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating multi-parent family: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating multi-parent family"
            )

    @staticmethod
    def link_student_to_parent(
        db: Session,
        link_data: StudentToParentLink,
        program_context: str,
        created_by: str = None
    ) -> Dict[str, Any]:
        """
        Link an existing student to an existing parent.
        
        Args:
            db: Database session
            link_data: Student-parent linking data
            program_context: Program context
            created_by: ID of user creating the link
            
        Returns:
            Dictionary with linking result information
        """
        try:
            # Verify both parent and student exist
            parent = parent_service.get_parent_by_id(
                db=db,
                parent_id=link_data.parent_id,
                program_context=program_context
            )
            
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent not found"
                )
            
            student = db.query(Student).filter(
                Student.id == link_data.student_id,
                Student.program_id == program_context
            ).first()
            
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student not found"
                )
            
            # Create the relationship
            relationship = relationship_service.create_parent_child_relationship(
                db=db,
                parent_id=link_data.parent_id,
                student_id=link_data.student_id,
                program_context=program_context,
                relationship_data={
                    'can_pickup': link_data.relationship_settings.can_pickup,
                    'is_emergency_contact': link_data.relationship_settings.is_emergency_contact,
                    'has_payment_responsibility': link_data.relationship_settings.has_payment_responsibility,
                    'pickup_notes': link_data.relationship_settings.pickup_notes,
                    'special_instructions': link_data.relationship_settings.special_instructions
                },
                created_by=created_by
            )
            
            logger.info(f"Successfully linked student {link_data.student_id} to parent {link_data.parent_id}")
            
            return {
                "success": True,
                "parent_id": str(relationship.parent_id),
                "student_id": str(relationship.student_id),
                "relationship": {
                    "can_pickup": relationship.can_pickup,
                    "is_emergency_contact": relationship.is_emergency_contact,
                    "has_payment_responsibility": relationship.has_payment_responsibility,
                    "pickup_notes": relationship.pickup_notes,
                    "special_instructions": relationship.special_instructions
                },
                "created_at": relationship.created_at.isoformat()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error linking student to parent: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating parent-student link"
            )

    @staticmethod
    def get_family_structure(
        db: Session,
        family_identifier: str,
        program_context: str,
        identifier_type: str = "user_id"
    ) -> FamilyStructureResponse:
        """
        Get comprehensive family structure information.
        
        Args:
            db: Database session
            family_identifier: Family identifier (user_id, parent_id, student_id)
            program_context: Program context
            identifier_type: Type of identifier provided
            
        Returns:
            FamilyStructureResponse with complete family information
        """
        try:
            # Get family structure using relationship service
            family_data = relationship_service.get_family_structure(
                db=db,
                user_id=family_identifier,
                program_context=program_context
            )
            
            # Generate family ID
            family_id = f"family_{family_data['user'].last_name.lower()}_{len(family_data['parents']) + len(family_data['children'])}"
            
            # Format parents information
            parents = []
            for parent_info in family_data["parents"]:
                parent_data = {
                    "parent_id": str(parent_info["parent_profile"].id),
                    "user_id": str(parent_info["user"].id),
                    "first_name": parent_info["user"].first_name,
                    "last_name": parent_info["user"].last_name,
                    "email": parent_info["user"].email,
                    "phone": parent_info["user"].phone,
                    "is_active": parent_info["user"].is_active,
                    "payment_responsibility": parent_info["parent_profile"].payment_responsibility,
                    "relationship": parent_info["relationship"]
                }
                parents.append(parent_data)
            
            # Format children information
            children = []
            for child_info in family_data["children"]:
                child_data = {
                    "student_id": str(child_info["student_profile"].id),
                    "user_id": str(child_info["user"].id),
                    "first_name": child_info["user"].first_name,
                    "last_name": child_info["user"].last_name,
                    "date_of_birth": child_info["user"].date_of_birth.isoformat() if child_info["user"].date_of_birth else None,
                    "is_active": child_info["user"].is_active,
                    "has_login_credentials": bool(child_info["user"].email),
                    "relationship": child_info["relationship"]
                }
                children.append(child_data)
            
            # Build family statistics
            total_members = len(parents) + len(children)
            active_members = len([p for p in parents if p["is_active"]]) + len([c for c in children if c["is_active"]])
            
            family_statistics = {
                "total_members": total_members,
                "parent_count": len(parents),
                "children_count": len(children),
                "active_members": active_members,
                "has_organization_sponsorship": False  # TODO: Check organization memberships
            }
            
            return FamilyStructureResponse(
                family_id=family_id,
                parents=parents,
                children=children,
                relationships=[],  # TODO: Format relationships properly
                organization_memberships=[],  # TODO: Get organization memberships
                family_statistics=family_statistics
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting family structure: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving family structure"
            )


# Singleton instance
family_service = FamilyService()