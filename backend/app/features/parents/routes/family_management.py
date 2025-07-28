"""
Unified Family Management API Routes

Comprehensive API endpoints for complex family creation and management workflows.
Provides high-level family operations beyond basic parent CRUD.
"""

from typing import Annotated, List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status
from sqlalchemy.orm import Session
import logging

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.features.common.dependencies.program_context import get_program_context

from app.features.parents.schemas.family_creation import (
    ParentWithChildrenCreate,
    MultiParentFamily,
    StudentToParentLink,
    FamilyCreationResponse,
    FamilySearchParams,
    FamilyStructureResponse,
    FamilyCreationType
)

from app.features.parents.services.family_service import family_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/create-family", response_model=FamilyCreationResponse, status_code=status.HTTP_201_CREATED)
async def create_complete_family(
    family_data: ParentWithChildrenCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Create a complete family with parent and multiple children atomically.
    
    This endpoint supports:
    - Single parent with multiple children
    - Organization-sponsored families
    - Custom relationship settings for each parent-child pair
    - Automatic data inheritance (address, emergency contacts)
    - Comprehensive validation and error handling
    
    The operation is atomic - either all profiles are created successfully,
    or none are created if any step fails.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user cannot create families"
        )
    
    try:
        result = family_service.create_parent_with_children_family(
            db=db,
            family_data=family_data,
            program_context=program_context,
            created_by=current_user["id"]
        )
        
        logger.info(f"Successfully created family {result.family_id} by user {current_user['id']}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating family: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating family"
        )


@router.post("/create-multi-parent-family", response_model=FamilyCreationResponse, status_code=status.HTTP_201_CREATED)
async def create_multi_parent_family(
    family_data: MultiParentFamily,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Create a complex multi-parent family with custom relationship mappings.
    
    This endpoint supports:
    - Multiple parents (2-4 parents supported)
    - Complex parent-child relationship mappings
    - Different permission settings per parent-child pair
    - Divorced/separated family structures
    - Blended family configurations
    - Organization sponsorship for the entire family
    
    Each parent-child relationship can have different settings for:
    - Pickup authorization
    - Emergency contact status
    - Payment responsibility
    - Special instructions
    """
    # Check permissions - multi-parent families may require higher privileges
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user cannot create families"
        )
    
    # Check if user has permission for complex family creation
    user_roles = current_user.get("roles", [])
    if "super_admin" not in user_roles and "program_admin" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for multi-parent family creation"
        )
    
    try:
        result = family_service.create_multi_parent_family(
            db=db,
            family_data=family_data,
            program_context=program_context,
            created_by=current_user["id"]
        )
        
        logger.info(f"Successfully created multi-parent family {result.family_id} by user {current_user['id']}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating multi-parent family: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating multi-parent family"
        )


@router.post("/link-student-to-parent", response_model=Dict[str, Any])
async def link_existing_student_to_parent(
    link_data: StudentToParentLink,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Link an existing student to an existing parent.
    
    This endpoint allows:
    - Adding a student to an additional parent (e.g., stepparent, guardian)
    - Creating secondary guardian relationships
    - Setting up temporary care arrangements
    - Managing complex custody situations
    
    The relationship can be configured with different permission levels
    and is useful for blended families or care situations.
    """
    try:
        result = family_service.link_student_to_parent(
            db=db,
            link_data=link_data,
            program_context=program_context,
            created_by=current_user["id"]
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking student to parent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating student-parent link"
        )


@router.get("/family-structure/{user_id}", response_model=FamilyStructureResponse)
async def get_family_structure(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    identifier_type: str = Query(default="user_id", description="Type of identifier (user_id, parent_id, student_id)")
):
    """
    Get comprehensive family structure information.
    
    Returns complete family information including:
    - All parents with their profiles and contact information
    - All children with their profiles and status
    - All parent-child relationships with permission settings
    - Organization memberships and sponsorship information
    - Family statistics and summary data
    
    Can be called with any family member's ID to get the complete family structure.
    """
    try:
        family_structure = family_service.get_family_structure(
            db=db,
            family_identifier=user_id,
            program_context=program_context,
            identifier_type=identifier_type
        )
        
        return family_structure
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting family structure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving family structure"
        )


@router.get("/family-search", response_model=List[Dict[str, Any]])
async def search_families(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    search_query: Optional[str] = Query(None, description="Search by names, email, phone"),
    family_size_min: Optional[int] = Query(None, ge=1, description="Minimum family size"),
    family_size_max: Optional[int] = Query(None, ge=1, description="Maximum family size"),
    has_organization: Optional[bool] = Query(None, description="Filter by organization membership"),
    organization_id: Optional[str] = Query(None, description="Filter by specific organization"),
    include_inactive: bool = Query(False, description="Include inactive family members"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Search and filter families with advanced criteria.
    
    Supports comprehensive filtering by:
    - Family size (number of parents + children)
    - Organization membership status
    - Specific organization affiliation
    - Text search across names, emails, and phone numbers
    - Active/inactive status
    - Creation date ranges
    
    Results are paginated and include summary family information.
    Use the family structure endpoint to get detailed information about specific families.
    """
    # TODO: Implement comprehensive family search
    # This would involve complex queries across parents, students, and relationships
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Family search functionality will be implemented in a future update"
    )


@router.get("/family-statistics", response_model=Dict[str, Any])
async def get_family_statistics(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Get comprehensive family statistics for the program.
    
    Returns statistical information including:
    - Total number of families
    - Average family size
    - Distribution of family types (single parent, multi-parent, etc.)
    - Organization sponsorship statistics
    - Parent-child relationship patterns
    - Family creation trends over time
    
    Useful for administrative reporting and program analytics.
    """
    # TODO: Implement comprehensive family statistics
    # This would involve aggregating data across all families in the program
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Family statistics functionality will be implemented in a future update"
    )


@router.put("/update-family-relationship", response_model=Dict[str, Any])
async def update_family_relationship(
    parent_id: str,
    student_id: str,
    relationship_updates: Dict[str, Any],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Update parent-child relationship settings.
    
    Allows modification of:
    - Pickup authorization status
    - Emergency contact designation
    - Payment responsibility
    - Special pickup notes
    - Relationship-specific instructions
    
    Changes are logged and require appropriate permissions.
    """
    try:
        from app.features.parents.services.relationship_service import relationship_service
        
        updated_relationship = relationship_service.update_relationship(
            db=db,
            parent_id=parent_id,
            student_id=student_id,
            relationship_updates=relationship_updates,
            updated_by=current_user["id"]
        )
        
        return {
            "success": True,
            "parent_id": str(updated_relationship.parent_id),
            "student_id": str(updated_relationship.student_id),
            "relationship": {
                "can_pickup": updated_relationship.can_pickup,
                "is_emergency_contact": updated_relationship.is_emergency_contact,
                "has_payment_responsibility": updated_relationship.has_payment_responsibility,
                "pickup_notes": updated_relationship.pickup_notes,
                "special_instructions": updated_relationship.special_instructions
            },
            "updated_at": updated_relationship.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating family relationship: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating family relationship"
        )


@router.delete("/remove-family-relationship")
async def remove_family_relationship(
    parent_id: str,
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Remove a parent-child relationship.
    
    This operation:
    - Removes the specific relationship between a parent and child
    - Does not delete the parent or child profiles
    - Requires administrative permissions
    - Is logged for audit purposes
    
    Use cases:
    - Custody changes
    - Guardian relationship termination
    - Family structure modifications
    
    WARNING: This action cannot be undone. The relationship will need to be recreated if needed again.
    """
    # Check admin permissions
    user_roles = current_user.get("roles", [])
    if "super_admin" not in user_roles and "program_admin" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to remove family relationships"
        )
    
    try:
        from app.features.parents.services.relationship_service import relationship_service
        
        success = relationship_service.remove_relationship(
            db=db,
            parent_id=parent_id,
            student_id=student_id,
            program_context=program_context,
            deleted_by=current_user["id"]
        )
        
        if success:
            logger.info(f"Removed relationship between parent {parent_id} and student {student_id} by user {current_user['id']}")
            return {"success": True, "message": "Family relationship removed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to remove family relationship"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing family relationship: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error removing family relationship"
        )