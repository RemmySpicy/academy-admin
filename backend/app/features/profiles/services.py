"""
Unified Profile Creation Service

Service for handling complex multi-profile creation scenarios.
"""

from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# For now, we'll use the basic student service until atomic creation is fully implemented
from app.features.students.services.student_service import student_service
from app.features.authentication.services.user_service import user_service
from app.features.authentication.models.user import ProfileType
# Note: ValidationError and DatabaseError might need to be defined locally
class ValidationError(Exception):
    pass

class DatabaseError(Exception):
    pass
from .schemas import ProfileCreationRequest, ProfileCreationResponse

import logging

logger = logging.getLogger(__name__)


class UnifiedProfileCreationService:
    """Service for unified profile creation."""
    
    def __init__(self, db: Session):
        self.db = db
        self.student_service = student_service
        self.user_service = user_service
    
    async def create_profile(
        self,
        request: ProfileCreationRequest,
        current_user_id: str
    ) -> ProfileCreationResponse:
        """
        Create a profile based on the request data.
        
        Args:
            request: Profile creation request
            current_user_id: ID of user creating the profile
            
        Returns:
            ProfileCreationResponse with creation results
        """
        try:
            creation_mode = request.creation_mode
            organization_mode = request.organization_mode
            profile_data = request.profile_data
            program_id = request.program_id
            
            student_data = profile_data['student']
            create_login_credentials = profile_data.get('create_login_credentials', False)
            
            # Prepare student data for creation
            prepared_student_data = self._prepare_student_data(student_data)
            
            if creation_mode == 'independent_student':
                return await self._create_independent_student(
                    prepared_student_data,
                    program_id,
                    organization_mode,
                    profile_data,
                    create_login_credentials
                )
            
            elif creation_mode == 'student_with_parent':
                return await self._create_student_with_parent(
                    prepared_student_data,
                    program_id,
                    organization_mode,
                    profile_data,
                    create_login_credentials
                )
            
            else:
                raise ValidationError(f"Unsupported creation mode: {creation_mode}")
                
        except ValidationError as e:
            logger.error(f"Validation error in profile creation: {str(e)}")
            return ProfileCreationResponse(
                success=False,
                error=str(e)
            )
        except Exception as e:
            logger.error(f"Error creating profile: {str(e)}")
            return ProfileCreationResponse(
                success=False,
                error=f"Failed to create profile: {str(e)}"
            )
    
    def _prepare_student_data(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare student data for creation."""
        prepared = student_data.copy()
        
        # Handle name fields - combine first_name and last_name into full_name for backend
        if 'first_name' in prepared and 'last_name' in prepared:
            prepared['full_name'] = f"{prepared['first_name']} {prepared['last_name']}"
        
        # Convert date string to date object if needed
        if 'date_of_birth' in prepared and isinstance(prepared['date_of_birth'], str):
            from datetime import datetime
            try:
                prepared['date_of_birth'] = datetime.fromisoformat(prepared['date_of_birth']).date()
            except ValueError:
                # Try other date formats if needed
                pass
        
        # Set default enrollment date if not provided
        if 'enrollment_date' not in prepared:
            from datetime import date
            prepared['enrollment_date'] = date.today()
        
        # Set default status
        if 'status' not in prepared:
            prepared['status'] = 'active'
        
        return prepared
    
    async def _create_independent_student(
        self,
        student_data: Dict[str, Any],
        program_id: str,
        organization_mode: str,
        profile_data: Dict[str, Any],
        create_login_credentials: bool
    ) -> ProfileCreationResponse:
        """Create an independent student."""
        try:
            # For now, use basic student creation
            # TODO: Implement full atomic creation with organization support
            
            # Convert the data to the format expected by student_service
            from app.features.students.schemas.student import StudentCreate
            from datetime import date
            
            # Prepare basic student creation data
            student_create_data = StudentCreate(
                first_name=student_data['first_name'],
                last_name=student_data['last_name'],
                email=student_data.get('email'),
                phone=student_data.get('phone'),
                date_of_birth=student_data.get('date_of_birth', date.today()),
                salutation=student_data.get('salutation'),
                program_id=program_id,
                referral_source=student_data.get('referral_source'),
                enrollment_date=student_data.get('enrollment_date', date.today()),
                notes=student_data.get('additional_notes')
            )
            
            student = self.student_service.create_student(
                self.db, 
                student_create_data, 
                user_id="temp",  # This will need to be fixed
                program_context=program_id
            )
            
            return ProfileCreationResponse(
                success=True,
                data={'student': self._serialize_student(student)},
                student_id=str(student.id),
                user_id=str(student.user_id) if hasattr(student, 'user_id') else None
            )
                
        except Exception as e:
            logger.error(f"Error creating independent student: {str(e)}")
            raise
    
    async def _create_student_with_parent(
        self,
        student_data: Dict[str, Any],
        program_id: str,
        organization_mode: str,
        profile_data: Dict[str, Any],
        create_login_credentials: bool
    ) -> ProfileCreationResponse:
        """Create a student with parent relationship."""
        try:
            parent_relationship = profile_data['parent_relationship']
            parent_id = parent_relationship['parent_id']
            relationship_type = parent_relationship['relationship_type']
            
            # Determine organization ID if applicable
            organization_id = None
            if organization_mode == 'organization':
                organization_id = profile_data.get('organization_id')
            
            student, relationship = await self.student_atomic_service.create_student_with_existing_parent(
                student_data=student_data,
                parent_id=parent_id,
                relationship_type=relationship_type,
                program_id=program_id,
                organization_id=organization_id,
                is_primary_contact=parent_relationship.get('is_primary_contact', True),
                can_pickup=parent_relationship.get('can_pickup', True),
                emergency_contact=parent_relationship.get('emergency_contact', True)
            )
            
            return ProfileCreationResponse(
                success=True,
                data={
                    'student': self._serialize_student(student),
                    'relationship': str(relationship.id) if relationship else None
                },
                student_id=str(student.id),
                user_id=str(student.user_id),
                relationships=[str(relationship.id)] if relationship else []
            )
            
        except Exception as e:
            logger.error(f"Error creating student with parent: {str(e)}")
            raise
    
    def _serialize_student(self, student) -> Dict[str, Any]:
        """Serialize student object for response."""
        return {
            'id': str(student.id),
            'student_id': student.student_id,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'phone': student.phone,
            'date_of_birth': student.date_of_birth.isoformat() if student.date_of_birth else None,
            'status': student.status,
            'created_at': student.created_at.isoformat() if student.created_at else None
        }


# Dependency injection function
def get_unified_profile_service(db: Session) -> UnifiedProfileCreationService:
    """Get UnifiedProfileCreationService instance."""
    return UnifiedProfileCreationService(db)