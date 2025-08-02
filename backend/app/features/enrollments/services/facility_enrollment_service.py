"""
Facility enrollment validation service for enhanced course enrollment workflow.

This service handles:
- Real-time facility availability validation
- Course-facility compatibility checks
- Age group eligibility validation
- Pricing calculation with facility-specific rates
- Default facility selection based on enrollment history
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.features.facilities.models.facility import Facility
from app.features.facilities.models.facility_course_pricing import FacilityCoursePricing
from app.features.courses.models.course import Course
from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.students.models.student import Student
from app.features.authentication.models.user import User
from app.core.exceptions import ValidationError


class FacilityEnrollmentService:
    """Service for facility-based enrollment validation and operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_student_default_facility(
        self, 
        user_id: str, 
        program_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get the default facility for a student based on their most recent enrollment
        in the specified program.
        
        Args:
            user_id: ID of the user
            program_id: ID of the program
            
        Returns:
            Dictionary with facility info or None if no previous enrollments
        """
        # Get most recent enrollment with facility for this user in this program
        recent_enrollment = (
            self.db.query(CourseEnrollment)
            .filter(
                and_(
                    CourseEnrollment.user_id == user_id,
                    CourseEnrollment.program_id == program_id,
                    CourseEnrollment.facility_id.isnot(None)
                )
            )
            .order_by(desc(CourseEnrollment.enrollment_date))
            .first()
        )
        
        if not recent_enrollment or not recent_enrollment.facility:
            return None
            
        return {
            "facility_id": recent_enrollment.facility_id,
            "facility_name": recent_enrollment.facility.name,
            "last_used_date": recent_enrollment.enrollment_date.isoformat(),
            "location_type": recent_enrollment.location_type,
            "session_type": recent_enrollment.session_type
        }
    
    def validate_course_facility_availability(
        self,
        course_id: str,
        facility_id: str,
        age_group: str,
        location_type: str,
        session_type: str
    ) -> Dict[str, Any]:
        """
        Validate if a course is available at a specific facility for given parameters.
        
        Args:
            course_id: ID of the course
            facility_id: ID of the facility
            age_group: Age group for the enrollment
            location_type: Location type (our-facility, client-location, virtual)
            session_type: Session type (private, group, school_group)
            
        Returns:
            Dictionary with availability status and details
        """
        # Check if course exists and get its configuration
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise ValidationError("Course not found")
        
        # Check if facility exists
        facility = self.db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValidationError("Facility not found")
        
        # Validate age group is supported by course
        course_age_groups = course.age_groups or []
        if age_group not in course_age_groups:
            return {
                "available": False,
                "reason": f"Course not available for age group '{age_group}'",
                "supported_age_groups": course_age_groups,
                "facility_name": facility.name
            }
        
        # Validate location type is supported by course
        course_location_types = course.location_types or []
        if location_type not in course_location_types:
            return {
                "available": False,
                "reason": f"Course not available for location type '{location_type}'",
                "supported_location_types": course_location_types,
                "facility_name": facility.name
            }
        
        # Validate session type is supported by course
        course_session_types = course.session_types or []
        if session_type not in course_session_types:
            return {
                "available": False,
                "reason": f"Course not available for session type '{session_type}'",
                "supported_session_types": course_session_types,
                "facility_name": facility.name
            }
        
        # Check if facility has pricing configured for this combination
        pricing = (
            self.db.query(FacilityCoursePricing)
            .filter(
                and_(
                    FacilityCoursePricing.facility_id == facility_id,
                    FacilityCoursePricing.course_id == course_id,
                    FacilityCoursePricing.age_group == age_group,
                    FacilityCoursePricing.location_type == location_type,
                    FacilityCoursePricing.session_type == session_type,
                    FacilityCoursePricing.is_active == True
                )
            )
            .first()
        )
        
        if not pricing:
            return {
                "available": False,
                "reason": f"No pricing configured for this course at {facility.name}",
                "facility_name": facility.name,
                "suggestion": "Contact admin to configure pricing for this combination"
            }
        
        return {
            "available": True,
            "facility_name": facility.name,
            "price": pricing.price,
            "pricing_notes": pricing.notes,
            "course_name": course.name,
            "course_description": course.description
        }
    
    def get_available_facilities_for_course(
        self,
        course_id: str,
        age_group: str,
        location_type: str,
        session_type: str,
        program_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get list of facilities where a course is available for given parameters.
        
        Args:
            course_id: ID of the course
            age_group: Age group for the enrollment
            location_type: Location type
            session_type: Session type
            program_id: ID of the program
            
        Returns:
            List of available facilities with pricing info
        """
        # Get all facilities with pricing for this course combination
        available_facilities = (
            self.db.query(FacilityCoursePricing, Facility)
            .join(Facility, FacilityCoursePricing.facility_id == Facility.id)
            .filter(
                and_(
                    FacilityCoursePricing.course_id == course_id,
                    FacilityCoursePricing.age_group == age_group,
                    FacilityCoursePricing.location_type == location_type,
                    FacilityCoursePricing.session_type == session_type,
                    FacilityCoursePricing.is_active == True,
                    Facility.program_id == program_id  # Only facilities in the same program
                )
            )
            .all()
        )
        
        facilities_list = []
        for pricing, facility in available_facilities:
            facilities_list.append({
                "facility_id": facility.id,
                "facility_name": facility.name,
                "address": facility.address,
                "price": pricing.price,
                "pricing_notes": pricing.notes,
                "contact_phone": facility.contact_phone,
                "operating_hours": facility.operating_hours
            })
        
        return facilities_list
    
    def validate_student_age_eligibility(
        self,
        user_id: str,
        course_id: str
    ) -> Dict[str, Any]:
        """
        Validate if a student's age makes them eligible for a course.
        
        Args:
            user_id: ID of the user
            course_id: ID of the course
            
        Returns:
            Dictionary with eligibility status and applicable age groups
        """
        # Get student info
        student = (
            self.db.query(Student)
            .filter(Student.user_id == user_id)
            .first()
        )
        
        if not student or not student.date_of_birth:
            return {
                "eligible": False,
                "reason": "Student profile not found or missing date of birth",
                "applicable_age_groups": []
            }
        
        # Calculate student age
        today = date.today()
        student_age = today.year - student.date_of_birth.year - (
            (today.month, today.day) < (student.date_of_birth.month, student.date_of_birth.day)
        )
        
        # Get course age groups
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise ValidationError("Course not found")
        
        course_age_groups = course.age_groups or []
        applicable_age_groups = []
        
        # Check which age groups the student qualifies for
        for age_group in course_age_groups:
            if self._student_fits_age_group(student_age, age_group):
                applicable_age_groups.append(age_group)
        
        if not applicable_age_groups:
            return {
                "eligible": False,
                "reason": f"Student age ({student_age}) doesn't match any course age groups",
                "student_age": student_age,
                "course_age_groups": course_age_groups,
                "applicable_age_groups": []
            }
        
        return {
            "eligible": True,
            "student_age": student_age,
            "course_age_groups": course_age_groups,
            "applicable_age_groups": applicable_age_groups,
            "recommended_age_group": applicable_age_groups[0]  # First match as default
        }
    
    def calculate_enrollment_pricing(
        self,
        facility_id: str,
        course_id: str,
        age_group: str,
        location_type: str,
        session_type: str,
        coupon_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate total pricing for an enrollment including discounts.
        
        Args:
            facility_id: ID of the facility
            course_id: ID of the course
            age_group: Age group
            location_type: Location type
            session_type: Session type
            coupon_code: Optional coupon code
            
        Returns:
            Dictionary with pricing breakdown
        """
        # Get base pricing
        pricing = (
            self.db.query(FacilityCoursePricing)
            .filter(
                and_(
                    FacilityCoursePricing.facility_id == facility_id,
                    FacilityCoursePricing.course_id == course_id,
                    FacilityCoursePricing.age_group == age_group,
                    FacilityCoursePricing.location_type == location_type,
                    FacilityCoursePricing.session_type == session_type,
                    FacilityCoursePricing.is_active == True
                )
            )
            .first()
        )
        
        if not pricing:
            raise ValidationError("No pricing found for this configuration")
        
        base_price = Decimal(str(pricing.price))
        discount_amount = Decimal('0.00')
        coupon_valid = False
        coupon_message = ""
        
        # Validate coupon if provided
        if coupon_code:
            # For now, just validate format - real coupon system to be implemented later
            if self._validate_coupon_format(coupon_code):
                # Placeholder: 10% discount for valid format
                discount_amount = base_price * Decimal('0.10')
                coupon_valid = True
                coupon_message = "10% discount applied"
            else:
                coupon_message = "Invalid coupon code format"
        
        total_amount = max(base_price - discount_amount, Decimal('0.00'))
        
        return {
            "base_price": float(base_price),
            "discount_amount": float(discount_amount),
            "total_amount": float(total_amount),
            "coupon_code": coupon_code,
            "coupon_valid": coupon_valid,
            "coupon_message": coupon_message,
            "payment_thresholds": {
                "minimum_to_start_sessions": float(total_amount * Decimal('0.50')),  # 50%
                "full_payment": float(total_amount)
            }
        }
    
    def _student_fits_age_group(self, student_age: int, age_group: str) -> bool:
        """
        Check if a student's age fits within an age group range.
        
        Args:
            student_age: Student's age in years
            age_group: Age group string (e.g., "6-8", "9-12", "13+")
            
        Returns:
            True if student fits in the age group
        """
        try:
            # Handle different age group formats
            if '+' in age_group:
                # Format: "13+" 
                min_age = int(age_group.replace('+', ''))
                return student_age >= min_age
            elif '-' in age_group:
                # Format: "6-8"
                parts = age_group.split('-')
                min_age = int(parts[0])
                max_age = int(parts[1])
                return min_age <= student_age <= max_age
            else:
                # Single age: "7"
                target_age = int(age_group)
                return student_age == target_age
        except (ValueError, IndexError):
            # If we can't parse the age group, assume it doesn't match
            return False
    
    def _validate_coupon_format(self, coupon_code: str) -> bool:
        """
        Validate coupon code format (placeholder for real coupon system).
        
        Args:
            coupon_code: Coupon code to validate
            
        Returns:
            True if coupon format is valid
        """
        # Simple validation: 6-12 characters, alphanumeric
        return (
            isinstance(coupon_code, str) and
            6 <= len(coupon_code) <= 12 and
            coupon_code.isalnum()
        )