"""
Student API routes for CRUD operations.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.features.common.dependencies.program_context import get_program_context
from app.features.students.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentListResponse,
    StudentSearchParams,
    StudentBulkAction,
    StudentBulkActionResponse,
    StudentStatsResponse,
)
from app.features.students.schemas.unified_creation import (
    UnifiedStudentCreateRequest,
    UnifiedStudentCreateResponse,
    UnifiedCreationErrorResponse,
)
from app.features.students.services.student_service import student_service
from app.features.students.services.unified_creation_service import unified_creation_service


router = APIRouter()


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Create a new student.
    
    Requires authentication and appropriate permissions.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        student = student_service.create_student(db, student_data, current_user["id"], program_context)
        return student
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating student: {str(e)}"
        )


@router.get("", response_model=StudentListResponse)
async def list_students(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    enrollment_date_from: Optional[str] = Query(None, description="Filter by enrollment date from (YYYY-MM-DD)"),
    enrollment_date_to: Optional[str] = Query(None, description="Filter by enrollment date to (YYYY-MM-DD)"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """
    List students with optional search and pagination.
    
    Supports filtering by various criteria and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, status_filter, enrollment_date_from, enrollment_date_to, gender, sort_by]):
            from datetime import date
            
            search_params = StudentSearchParams(
                search=search,
                status=status_filter,
                enrollment_date_from=date.fromisoformat(enrollment_date_from) if enrollment_date_from else None,
                enrollment_date_to=date.fromisoformat(enrollment_date_to) if enrollment_date_to else None,
                gender=gender,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        students, total_count = student_service.list_students(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page,
            program_context=program_context
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return StudentListResponse(
            items=students,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing students: {str(e)}"
        )


@router.get("/stats", response_model=StudentStatsResponse)
async def get_student_stats(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Get student statistics.
    
    Returns counts, demographics, and other statistical information.
    """
    try:
        stats = student_service.get_student_stats(db, program_context)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting student stats: {str(e)}"
        )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Get a specific student by ID.
    
    Returns detailed student information.
    """
    student = student_service.get_student(db, student_id, program_context)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: str,
    student_data: StudentUpdate,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update student information.
    
    Allows partial updates of student data.
    """
    try:
        student = student_service.update_student(student_id, student_data, current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        return student
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating student: {str(e)}"
        )


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a student.
    
    Permanently removes the student from the system.
    Requires admin privileges.
    """
    # Check admin permissions
    if current_user["role"] != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete students"
        )
    
    success = student_service.delete_student(student_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )


@router.post("/bulk-action", response_model=StudentBulkActionResponse)
async def bulk_student_action(
    action_data: StudentBulkAction,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Perform bulk actions on students.
    
    Supports operations like bulk status updates.
    """
    try:
        if action_data.action == "update_status":
            new_status = action_data.parameters.get("status")
            if not new_status:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Status parameter is required for update_status action"
                )
            
            result = student_service.bulk_update_status(
                action_data.student_ids,
                new_status,
                current_user["id"]
            )
            
            return StudentBulkActionResponse(
                successful=result["successful"],
                failed=result["failed"],
                total_processed=result["total_processed"],
                total_successful=result["total_successful"],
                total_failed=result["total_failed"]
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported action: {action_data.action}"
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing bulk action: {str(e)}"
        )


@router.get("/by-student-id/{student_id}", response_model=StudentResponse)
async def get_student_by_student_id(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a student by their student ID (STU-YYYY-NNNN).
    
    Alternative lookup method using the formatted student ID.
    """
    student = student_service.get_student_by_student_id(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student


# Mobile App Specific Endpoints

@router.get("/me", response_model=StudentResponse)
async def get_my_profile(
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get current student's profile (for student mobile app).
    
    Returns the authenticated student's own profile information.
    Requires student role.
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    # For students, get their profile by their user_id
    student = student_service.get_student_by_user_id(current_user["id"])
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return student


@router.patch("/me", response_model=StudentResponse)
async def update_my_profile(
    student_data: StudentUpdate,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update current student's profile (for student mobile app).
    
    Allows students to update their own profile information.
    Limited to certain fields for security.
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    # Get student record
    student = student_service.get_student_by_user_id(current_user["id"])
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    # Restrict what students can update
    allowed_fields = {
        "phone", "address", "emergency_contact", "notes"
    }
    
    # Filter the update data to only allowed fields
    filtered_data = StudentUpdate()
    for field, value in student_data.model_dump(exclude_unset=True).items():
        if field in allowed_fields:
            setattr(filtered_data, field, value)
    
    try:
        updated_student = student_service.update_student(
            student.id, filtered_data, current_user["id"]
        )
        return updated_student
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )


@router.get("/me/progress")
async def get_my_progress(
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get current student's progress across all courses (for student mobile app).
    
    Returns comprehensive progress information including:
    - Course enrollments and progress
    - Recent assessments
    - Attendance summary
    - Upcoming assignments
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    try:
        student = student_service.get_student_by_user_id(current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        progress_data = student_service.get_student_progress_summary(student.id)
        return progress_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving progress: {str(e)}"
        )


@router.get("/me/attendance")
async def get_my_attendance(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    course_id: Optional[str] = Query(None, description="Filter by course")
):
    """
    Get current student's attendance records (for student mobile app).
    
    Returns attendance records with optional date and course filtering.
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    try:
        student = student_service.get_student_by_user_id(current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        attendance_records = student_service.get_student_attendance(
            student.id, date_from, date_to, course_id
        )
        return attendance_records
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving attendance: {str(e)}"
        )


@router.get("/me/assessments")
async def get_my_assessments(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    course_id: Optional[str] = Query(None, description="Filter by course"),
    assessment_type: Optional[str] = Query(None, description="Filter by assessment type")
):
    """
    Get current student's assessment results (for student mobile app).
    
    Returns assessment results with optional filtering.
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    try:
        student = student_service.get_student_by_user_id(current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        assessments = student_service.get_student_assessments(
            student.id, course_id, assessment_type
        )
        return assessments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assessments: {str(e)}"
        )


@router.get("/me/communications")
async def get_my_communications(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    communication_type: Optional[str] = Query(None, description="Filter by type"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Get current student's communications (for student mobile app).
    
    Returns communications sent to or involving the student.
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    try:
        student = student_service.get_student_by_user_id(current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        communications = student_service.get_student_communications(
            student.id, communication_type, status_filter, date_from, date_to
        )
        return communications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving communications: {str(e)}"
        )


@router.get("/me/parents")
async def get_my_parents(
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get current student's parent/guardian contacts (for student mobile app).
    
    Returns list of parent/guardian contacts.
    """
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    try:
        student = student_service.get_student_by_user_id(current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        parents = student_service.get_student_parents(student.id)
        return parents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving parent contacts: {str(e)}"
        )


# New Two-Step Workflow Endpoints

@router.post("/profile-only", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student_profile_only(
    student_data: StudentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Create a student profile without automatic program assignment (Step 1 of two-step workflow).
    
    This endpoint creates a student profile that can later be assigned to programs/courses.
    It separates profile creation from program assignment for more flexible workflows.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        student = student_service.create_student_profile_only(db, student_data, current_user["id"])
        return student
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating student profile: {str(e)}"
        )


@router.post("/{student_id}/assign-to-program")
async def assign_student_to_program(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_id: str = Query(..., description="Program ID to assign to"),
    assignment_notes: Optional[str] = Query(None, description="Assignment notes")
):
    """
    Assign a student to a program (Step 2 of two-step workflow).
    
    This endpoint assigns an existing student profile to a specific program,
    enabling them to be enrolled in courses within that program.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        assignment = student_service.assign_student_to_program(
            db, student_id, program_id, current_user["id"], assignment_notes
        )
        return {
            "success": True,
            "message": "Student assigned to program successfully",
            "assignment": {
                "id": assignment.id,
                "user_id": assignment.user_id,
                "program_id": assignment.program_id,
                "role_in_program": assignment.role_in_program.value,
                "assignment_date": assignment.assignment_date.isoformat(),
                "is_active": assignment.is_active
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning student to program: {str(e)}"
        )


@router.post("/{student_id}/enroll-in-course")
async def enroll_student_in_course(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    course_id: str = Query(..., description="Course ID to enroll in"),
    assignment_type: Optional[str] = Query("direct", description="Assignment type"),
    credits_awarded: Optional[int] = Query(0, description="Credits to award"),
    assignment_notes: Optional[str] = Query(None, description="Assignment notes"),
    referral_source: Optional[str] = Query(None, description="Referral source"),
    special_requirements: Optional[str] = Query(None, description="Special requirements"),
    notes: Optional[str] = Query(None, description="Additional notes")
):
    """
    Enroll a student in a specific course.
    
    This endpoint enrolls an existing student in a course within the current program context.
    The student must already be assigned to the program.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        enrollment_details = {
            'assigned_by': current_user["id"],
            'assignment_type': assignment_type,
            'credits_awarded': credits_awarded,
            'assignment_notes': assignment_notes,
            'referral_source': referral_source,
            'special_requirements': special_requirements,
            'notes': notes
        }
        
        enrollment = student_service.enroll_student_in_course(
            db, student_id, course_id, enrollment_details, program_context
        )
        
        return {
            "success": True,
            "message": "Student enrolled in course successfully",
            "enrollment": {
                "id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "program_id": enrollment.program_id,
                "status": enrollment.status.value,
                "enrollment_date": enrollment.enrollment_date.isoformat(),
                "assignment_date": enrollment.assignment_date.isoformat(),
                "enrollment_fee": float(enrollment.enrollment_fee),
                "outstanding_balance": float(enrollment.outstanding_balance)
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enrolling student in course: {str(e)}"
        )


@router.post("/create-and-assign")
async def create_student_and_assign_to_course(
    student_data: StudentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    course_id: str = Query(..., description="Course ID to assign to")
):
    """
    Combined operation: create student profile and assign to course.
    
    This endpoint provides a convenient method for the common workflow of
    creating a student and immediately assigning them to a course. It combines
    all three steps: profile creation, program assignment, and course enrollment.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for this operation"
        )
    
    try:
        result = student_service.create_student_and_assign_to_course(
            db, student_data, course_id, program_context, current_user["id"]
        )
        
        if result.get('success'):
            return {
                "success": True,
                "message": result['message'],
                "student": result['student'],
                "enrollment": result['enrollment']
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Unknown error occurred')
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating and assigning student: {str(e)}"
        )


@router.get("/in-program-by-enrollment", response_model=StudentListResponse)
async def get_students_in_program_by_enrollment(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get students in program based on course enrollments (new assignment-based approach).
    
    This endpoint returns students who are in the program based on their course
    enrollments rather than direct program assignment. This supports the new
    assignment-based workflow where program membership is determined by course enrollments.
    """
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for this operation"
        )
    
    try:
        students, total_count = student_service.get_students_in_program_by_enrollment(
            db=db,
            program_id=program_context,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return StudentListResponse(
            items=students,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing students by enrollment: {str(e)}"
        )


# Unified Creation Workflows

@router.post("/create-with-program", 
    response_model=UnifiedStudentCreateResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create student with automatic program association",
    description="""
    Create a student with automatic program association and optional course enrollment.
    
    This unified workflow:
    1. Creates user account with student role
    2. Creates student profile  
    3. Auto-assigns to program (from admin's program context)
    4. Optionally enrolls in specified course
    
    Designed for program administrators to streamline student creation.
    """
)
async def create_student_with_program(
    request: UnifiedStudentCreateRequest,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Create a student with automatic program association and optional course enrollment.
    
    This is a unified workflow for program administrators that combines user creation,
    student profile creation, program assignment, and optional course enrollment in
    a single atomic transaction.
    """
    # Validate program context is available
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for unified student creation"
        )
    
    # Validate admin has access to create users in this program
    has_access = unified_creation_service.validate_program_admin_access(
        db, current_user["id"], program_context
    )
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create students in this program"
        )
    
    try:
        # Prepare user data
        user_data = request.user_data.model_dump()
        
        # Add password if provided
        if request.password:
            user_data["password"] = request.password
        
        # Prepare student data  
        student_data = request.student_data.model_dump()
        
        # Call unified creation service
        result = unified_creation_service.create_student_with_program(
            db=db,
            user_data=user_data,
            student_data=student_data,
            program_context=program_context,
            course_id=request.course_id,
            created_by=current_user["id"]
        )
        
        return UnifiedStudentCreateResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in unified student creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error during student creation"
        )