"""
Organization Payment and Access Override Routes

API endpoints for managing payment responsibility overrides and access control
when students are sponsored by partner organizations.
"""

from typing import List, Dict, Any, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from ....features.common.models.database import get_db
from ....features.authentication.routes.auth import get_current_user
from ...authentication.models.user import User
from ..services.payment_override_service import PaymentOverrideService, AccessOverrideService

router = APIRouter(prefix="/payment-overrides", tags=["payment-overrides"])


# Request/Response Models
class PaymentCalculationRequest(BaseModel):
    student_id: str
    course_id: str
    base_amount: Decimal = Field(..., gt=0, description="Base course fee amount")


class PaymentBreakdownItem(BaseModel):
    payer_id: str
    payer_type: str  # "student", "parent", "organization"
    payer_name: str
    amount: Decimal
    percentage: float
    reason: str


class PaymentCalculationResponse(BaseModel):
    payer_type: str
    primary_payer_id: str
    payment_breakdown: List[PaymentBreakdownItem]
    total_amount: Decimal
    discounts_applied: List[str]
    override_reason: str


class StudentPaymentStatusResponse(BaseModel):
    student_id: str
    student_name: str
    sponsoring_organizations: List[Dict[str, Any]]
    responsible_parents: List[Dict[str, Any]]
    has_payment_overrides: bool
    payment_responsibility_type: str


class CourseAccessRequest(BaseModel):
    student_id: str
    course_id: str


class CourseAccessResponse(BaseModel):
    has_access: bool
    access_type: str  # "default", "granted", "restricted"
    reason: str
    access_grants: List[Dict[str, Any]]
    access_restrictions: List[Dict[str, Any]]
    organization_memberships: List[Dict[str, Any]]


class OrganizationCourseOverridesResponse(BaseModel):
    organization_id: str
    organization_name: str
    granted_courses: List[Dict[str, Any]]
    restricted_courses: List[Dict[str, Any]]
    total_overrides: int


# Payment Override Endpoints
@router.post("/calculate-payment", response_model=PaymentCalculationResponse)
async def calculate_payment_responsibility(
    request: PaymentCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate payment responsibility for a student's course enrollment.
    
    This endpoint determines who is responsible for paying course fees,
    considering organization sponsorships and parent relationships.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin", "program_coordinator"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        service = PaymentOverrideService(db)
        result = service.calculate_payment_responsibility(
            student_id=request.student_id,
            course_id=request.course_id,
            base_amount=request.base_amount,
            program_context="default"  # TODO: Fix program context
        )
        
        return PaymentCalculationResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to calculate payment responsibility: {str(e)}"
        )


@router.post("/apply-payment-overrides")
async def apply_payment_overrides(
    request: PaymentCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply payment overrides and create payment structure.
    
    This endpoint creates the actual payment records with appropriate
    responsibility assignments based on organization sponsorships.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        service = PaymentOverrideService(db)
        result = service.apply_payment_overrides(
            student_id=request.student_id,
            course_id=request.course_id,
            base_amount=request.base_amount,
            program_context="default"
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Payment overrides applied successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply payment overrides: {str(e)}"
        )


@router.get("/student/{student_id}/payment-status", response_model=StudentPaymentStatusResponse)
async def get_student_payment_status(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive payment status for a student.
    
    Returns information about organization sponsorships, parent responsibilities,
    and overall payment structure for the student.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin", "program_coordinator"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        service = PaymentOverrideService(db)
        result = service.get_student_payment_status(
            student_id=student_id,
            program_context="default"
        )
        
        return StudentPaymentStatusResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get student payment status: {str(e)}"
        )


# Access Override Endpoints
@router.post("/check-course-access", response_model=CourseAccessResponse)
async def check_course_access(
    request: CourseAccessRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a student has access to a course through organization membership.
    
    This endpoint evaluates course access permissions based on organization
    membership rules and access overrides.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin", "program_coordinator", "instructor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        service = AccessOverrideService(db)
        result = service.check_course_access(
            student_id=request.student_id,
            course_id=request.course_id,
            program_context="default"
        )
        
        return CourseAccessResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check course access: {str(e)}"
        )


@router.get("/organization/{organization_id}/course-overrides", response_model=OrganizationCourseOverridesResponse)
async def get_organization_course_overrides(
    organization_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all course access overrides for an organization.
    
    Returns information about which courses the organization grants or restricts
    access to for its members.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        service = AccessOverrideService(db)
        result = service.get_organization_course_overrides(
            organization_id=organization_id,
            program_context="default"
        )
        
        return OrganizationCourseOverridesResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get organization course overrides: {str(e)}"
        )


# Bulk Operations
@router.get("/students/payment-overrides")
async def get_students_with_payment_overrides(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    organization_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of students with payment overrides.
    
    Optionally filter by organization to see only students sponsored
    by a specific organization.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin", "program_coordinator"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        from sqlalchemy import and_
        from ...students.models.student import Student
        from ..models.organization import OrganizationMembership
        
        # Base query for students with organization memberships
        query = db.query(Student).join(
            OrganizationMembership,
            Student.user_id == OrganizationMembership.user_id
        ).filter(
            and_(
                Student.program_id == program_context,
                OrganizationMembership.has_payment_responsibility == True,
                OrganizationMembership.is_active == True
            )
        )
        
        # Filter by organization if specified
        if organization_id:
            query = query.filter(OrganizationMembership.organization_id == organization_id)
        
        # Apply pagination
        students = query.offset(offset).limit(limit).all()
        total = query.count()
        
        # Get payment status for each student
        service = PaymentOverrideService(db)
        students_data = []
        
        for student in students:
            payment_status = service.get_student_payment_status(
                student_id=student.id,
                program_context="default"
            )
            students_data.append(payment_status)
        
        return {
            "success": True,
            "data": {
                "students": students_data,
                "total": total,
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get students with payment overrides: {str(e)}"
        )


@router.get("/organizations/with-overrides")
async def get_organizations_with_overrides(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of organizations that have payment or access overrides.
    
    Returns summary information about organizations that provide sponsorships
    or have special course access rules.
    """
    
    # Require appropriate permissions
    if current_user.role not in ["super_admin", "program_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        from sqlalchemy import and_, func
        from ..models.organization import Organization, OrganizationMembership
        
        # Get organizations with payment responsibilities
        orgs_with_payment = db.query(
            Organization.id,
            Organization.name,
            Organization.organization_type,
            func.count(OrganizationMembership.id).label('sponsored_students')
        ).join(
            OrganizationMembership,
            Organization.id == OrganizationMembership.organization_id
        ).filter(
            and_(
                Organization.program_id == program_context,
                Organization.is_partner == True,
                OrganizationMembership.has_payment_responsibility == True,
                OrganizationMembership.is_active == True
            )
        ).group_by(
            Organization.id,
            Organization.name,
            Organization.organization_type
        ).all()
        
        organizations_data = []
        for org_data in orgs_with_payment:
            organizations_data.append({
                "organization_id": org_data.id,
                "organization_name": org_data.name,
                "organization_type": org_data.organization_type,
                "sponsored_students": org_data.sponsored_students,
                "has_payment_overrides": True,
                "has_access_overrides": False  # Could be enhanced to check for access rules
            })
        
        return {
            "success": True,
            "data": {
                "organizations": organizations_data,
                "total": len(organizations_data)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get organizations with overrides: {str(e)}"
        )