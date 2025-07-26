"""
Organization Payment and Access Override Service

This service handles payment responsibility overrides and access control
when students are sponsored by partner organizations or have organizational memberships.
"""

from typing import Dict, List, Optional, Any
from decimal import Decimal
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..models.organization import Organization, OrganizationMembership
from ...authentication.models.user import User
# TODO: Add these imports when models are available
# from ...students.models.student import Student  
# from ...payments.models.payment import Payment
# from ...courses.models.course import Course


class PaymentOverrideService:
    """Service for managing organization payment overrides and access control."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_payment_responsibility(
        self,
        student_id: str,
        course_id: str,
        base_amount: Decimal,
        program_context: str
    ) -> Dict[str, Any]:
        """
        Calculate who is responsible for payment and how much.
        
        Returns:
        {
            "payer_type": "student" | "parent" | "organization" | "mixed",
            "primary_payer_id": str,
            "payment_breakdown": [
                {
                    "payer_id": str,
                    "payer_type": str,
                    "payer_name": str,
                    "amount": Decimal,
                    "percentage": float,
                    "reason": str
                }
            ],
            "total_amount": Decimal,
            "discounts_applied": [],
            "override_reason": str
        }
        """
        
        # TODO: Implement full payment calculation when all models are available
        # For now, return a basic mock response for testing
        if not student_id:
            raise ValueError("Student ID is required")
        
        # Mock payment breakdown - student pays full amount
        payment_breakdown = [{
            "payer_id": student_id,
            "payer_type": "student", 
            "payer_name": f"Student {student_id}",
            "amount": base_amount,
            "percentage": 100.0,
            "reason": "Direct student payment"
        }]
        
        payer_type = "student"
        primary_payer_id = student_id
        
        return {
            "payer_type": payer_type,
            "primary_payer_id": primary_payer_id,
            "payment_breakdown": payment_breakdown,
            "total_amount": base_amount,
            "discounts_applied": [],
            "override_reason": "Standard payment - no overrides"
        }
    
    def _calculate_organization_coverage(
        self,
        membership: OrganizationMembership,
        course_id: str,
        base_amount: Decimal
    ) -> Dict[str, Any]:
        """Calculate how much an organization covers for a specific course."""
        
        org = membership.organization
        
        # Get organization's sponsorship settings
        sponsorship_settings = getattr(org, 'sponsorship_settings', {})
        
        if not sponsorship_settings:
            # Default full sponsorship for partners
            return {
                "amount": base_amount,
                "percentage": 100.0,
                "sponsorship_type": "full"
            }
        
        sponsorship_type = sponsorship_settings.get('type', 'full')
        
        if sponsorship_type == 'full':
            return {
                "amount": base_amount,
                "percentage": 100.0,
                "sponsorship_type": "full"
            }
        elif sponsorship_type == 'partial':
            percentage = Decimal(str(sponsorship_settings.get('percentage', 50)))
            amount = (base_amount * percentage) / 100
            return {
                "amount": amount,
                "percentage": float(percentage),
                "sponsorship_type": "partial"
            }
        elif sponsorship_type == 'fixed':
            fixed_amount = Decimal(str(sponsorship_settings.get('fixed_amount', 0)))
            amount = min(fixed_amount, base_amount)
            percentage = float((amount / base_amount) * 100) if base_amount > 0 else 0
            return {
                "amount": amount,
                "percentage": percentage,
                "sponsorship_type": "fixed"
            }
        
        return {
            "amount": Decimal('0'),
            "percentage": 0.0,
            "sponsorship_type": "none"
        }
    
    def _get_parent_payer(self, student: Student) -> Optional[Dict[str, str]]:
        """Get the parent responsible for payment."""
        
        # Check for parent relationships
        from ...relationships.models.parent_child_relationship import ParentChildRelationship
        
        parent_relationship = self.db.query(ParentChildRelationship).filter(
            and_(
                ParentChildRelationship.child_id == student.user_id,
                ParentChildRelationship.has_payment_responsibility == True,
                ParentChildRelationship.is_active == True
            )
        ).first()
        
        if parent_relationship:
            parent_user = self.db.query(User).filter(
                User.id == parent_relationship.parent_id
            ).first()
            
            if parent_user:
                return {
                    "id": parent_user.id,
                    "name": parent_user.full_name
                }
        
        return None
    
    def _get_override_reason(self, payment_breakdown: List[Dict]) -> str:
        """Generate a human-readable reason for payment override."""
        
        if len(payment_breakdown) == 1:
            payer = payment_breakdown[0]
            return payer['reason']
        
        # Multiple payers
        reasons = []
        for payer in payment_breakdown:
            if payer['payer_type'] == 'organization':
                reasons.append(f"{payer['payer_name']} covers {payer['percentage']:.0f}%")
            else:
                reasons.append(f"{payer['payer_name']} pays remaining {payer['percentage']:.0f}%")
        
        return "; ".join(reasons)
    
    def apply_payment_overrides(
        self,
        student_id: str,
        course_id: str,
        base_amount: Decimal,
        program_context: str
    ) -> Dict[str, Any]:
        """
        Apply payment overrides and create payment records.
        
        Returns the payment structure with override information.
        """
        
        payment_info = self.calculate_payment_responsibility(
            student_id, course_id, base_amount, program_context
        )
        
        # Here you would create actual payment records
        # This is a simplified version - in practice you'd integrate with your payment system
        
        return {
            "payment_structure": payment_info,
            "override_applied": len(payment_info['payment_breakdown']) > 1 or 
                              payment_info['payment_breakdown'][0]['payer_type'] != 'student',
            "created_at": datetime.utcnow(),
            "status": "pending"
        }
    
    def get_student_payment_status(
        self,
        student_id: str,
        program_context: str
    ) -> Dict[str, Any]:
        """Get comprehensive payment status for a student."""
        
        student = self.db.query(Student).filter(
            and_(
                Student.id == student_id,
                Student.program_id == program_context
            )
        ).first()
        
        if not student:
            raise ValueError(f"Student {student_id} not found")
        
        # Get active organization memberships
        org_memberships = self.db.query(OrganizationMembership).filter(
            and_(
                OrganizationMembership.user_id == student.user_id,
                OrganizationMembership.is_active == True
            )
        ).all()
        
        # Get parent relationships
        parent_relationships = self.db.query(ParentChildRelationship).filter(
            and_(
                ParentChildRelationship.child_id == student.user_id,
                ParentChildRelationship.is_active == True
            )
        ).all()
        
        sponsoring_orgs = []
        for membership in org_memberships:
            if membership.has_payment_responsibility and membership.organization.is_partner:
                sponsoring_orgs.append({
                    "organization_id": membership.organization.id,
                    "organization_name": membership.organization.name,
                    "membership_type": membership.membership_type,
                    "payment_responsibility": True
                })
        
        responsible_parents = []
        for relationship in parent_relationships:
            if relationship.has_payment_responsibility:
                parent_user = self.db.query(User).filter(
                    User.id == relationship.parent_id
                ).first()
                if parent_user:
                    responsible_parents.append({
                        "parent_id": parent_user.id,
                        "parent_name": parent_user.full_name,
                        "relationship_type": relationship.relationship_type
                    })
        
        return {
            "student_id": student_id,
            "student_name": student.user.full_name,
            "sponsoring_organizations": sponsoring_orgs,
            "responsible_parents": responsible_parents,
            "has_payment_overrides": len(sponsoring_orgs) > 0 or len(responsible_parents) > 0,
            "payment_responsibility_type": self._determine_payment_type(
                sponsoring_orgs, responsible_parents
            )
        }
    
    def _determine_payment_type(
        self,
        sponsoring_orgs: List[Dict],
        responsible_parents: List[Dict]
    ) -> str:
        """Determine the primary payment responsibility type."""
        
        if sponsoring_orgs and responsible_parents:
            return "mixed"
        elif sponsoring_orgs:
            return "organization"
        elif responsible_parents:
            return "parent"
        else:
            return "student"


class AccessOverrideService:
    """Service for managing organization-based access control overrides."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_course_access(
        self,
        student_id: str,
        course_id: str,
        program_context: str
    ) -> Dict[str, Any]:
        """
        Check if a student has access to a course through organization membership.
        
        Returns access information including any special permissions or restrictions.
        """
        
        student = self.db.query(Student).filter(
            and_(
                Student.id == student_id,
                Student.program_id == program_context
            )
        ).first()
        
        if not student:
            return {
                "has_access": False,
                "reason": "Student not found",
                "access_type": "none"
            }
        
        # Check organization memberships for access overrides
        org_memberships = self.db.query(OrganizationMembership).filter(
            and_(
                OrganizationMembership.user_id == student.user_id,
                OrganizationMembership.is_active == True
            )
        ).all()
        
        access_grants = []
        access_restrictions = []
        
        for membership in org_memberships:
            org = membership.organization
            
            # Check for special access permissions
            if hasattr(org, 'course_access_rules'):
                rules = getattr(org, 'course_access_rules', {})
                
                if course_id in rules.get('granted_courses', []):
                    access_grants.append({
                        "organization_id": org.id,
                        "organization_name": org.name,
                        "access_type": "granted",
                        "reason": f"Course access granted through {org.name} membership"
                    })
                
                if course_id in rules.get('restricted_courses', []):
                    access_restrictions.append({
                        "organization_id": org.id,
                        "organization_name": org.name,
                        "access_type": "restricted",
                        "reason": f"Course access restricted by {org.name} policy"
                    })
        
        # Determine final access
        has_access = True  # Default access
        access_type = "default"
        reason = "Standard course access"
        
        if access_restrictions:
            has_access = False
            access_type = "restricted"
            reason = access_restrictions[0]['reason']
        elif access_grants:
            has_access = True
            access_type = "granted"
            reason = access_grants[0]['reason']
        
        return {
            "has_access": has_access,
            "access_type": access_type,
            "reason": reason,
            "access_grants": access_grants,
            "access_restrictions": access_restrictions,
            "organization_memberships": [
                {
                    "organization_id": m.organization.id,
                    "organization_name": m.organization.name,
                    "membership_type": m.membership_type
                }
                for m in org_memberships
            ]
        }
    
    def get_organization_course_overrides(
        self,
        organization_id: str,
        program_context: str
    ) -> Dict[str, Any]:
        """Get all course access overrides for an organization."""
        
        org = self.db.query(Organization).filter(
            and_(
                Organization.id == organization_id,
                Organization.program_id == program_context
            )
        ).first()
        
        if not org:
            raise ValueError(f"Organization {organization_id} not found")
        
        # Get course access rules
        access_rules = getattr(org, 'course_access_rules', {})
        
        granted_courses = []
        restricted_courses = []
        
        if 'granted_courses' in access_rules:
            course_ids = access_rules['granted_courses']
            courses = self.db.query(Course).filter(
                and_(
                    Course.id.in_(course_ids),
                    Course.program_id == program_context
                )
            ).all()
            
            granted_courses = [
                {
                    "course_id": course.id,
                    "course_name": course.name,
                    "course_code": course.course_code
                }
                for course in courses
            ]
        
        if 'restricted_courses' in access_rules:
            course_ids = access_rules['restricted_courses']
            courses = self.db.query(Course).filter(
                and_(
                    Course.id.in_(course_ids),
                    Course.program_id == program_context
                )
            ).all()
            
            restricted_courses = [
                {
                    "course_id": course.id,
                    "course_name": course.name,
                    "course_code": course.course_code
                }
                for course in courses
            ]
        
        return {
            "organization_id": organization_id,
            "organization_name": org.name,
            "granted_courses": granted_courses,
            "restricted_courses": restricted_courses,
            "total_overrides": len(granted_courses) + len(restricted_courses)
        }