"""
Simplified Profile Creation Routes

A temporary simplified implementation that routes to existing student creation.
"""

from typing import Annotated, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.features.students.schemas.student import StudentCreate, StudentResponse
from app.features.students.services.student_service import student_service

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile_request: Dict[str, Any],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Simplified profile creation that routes to student creation.
    
    This is a temporary implementation that accepts the frontend's expected format
    and converts it to work with the existing student creation endpoint.
    """
    try:
        # Validate user permissions
        if not current_user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )
        
        # Extract data from the request
        creation_mode = profile_request.get('creation_mode')
        profile_data = profile_request.get('profile_data', {})
        student_data = profile_data.get('student', {})
        program_id = profile_request.get('program_id')
        
        if not student_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student data is required"
            )
        
        if not program_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program ID is required"
            )
        
        # Convert frontend format to backend StudentCreate format
        from datetime import date, datetime
        
        # Handle date conversion
        date_of_birth = None
        if student_data.get('date_of_birth'):
            try:
                date_of_birth = datetime.fromisoformat(student_data['date_of_birth']).date()
            except:
                date_of_birth = date.today()
        else:
            date_of_birth = date.today()
        
        # Create StudentCreate object
        student_create = StudentCreate(
            first_name=student_data.get('first_name', ''),
            last_name=student_data.get('last_name', ''),
            email=student_data.get('email'),  # Now optional
            phone=student_data.get('phone'),
            date_of_birth=date_of_birth,
            salutation=student_data.get('salutation'),
            program_id=program_id,
            referral_source=student_data.get('referral_source'),
            enrollment_date=date.today(),
            notes=student_data.get('additional_notes')
        )
        
        # Create the student using existing service
        student = student_service.create_student(
            db=db,
            student_data=student_create,
            user_id=current_user["id"],
            program_context=program_id
        )
        
        # Return response in the format frontend expects
        return {
            "success": True,
            "data": {
                "student": {
                    "id": str(student.id),
                    "student_id": student.student_id if hasattr(student, 'student_id') else None,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "email": student.email,
                    "phone": student.phone,
                    "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
                    "status": student.status if hasattr(student, 'status') else 'active'
                }
            },
            "student_id": str(student.id),
            "user_id": str(student.user_id) if hasattr(student, 'user_id') else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in simplified create_profile: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to create profile: {str(e)}"
        }