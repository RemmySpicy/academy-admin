"""
Student service for handling student CRUD operations.
"""

import sqlite3
import json
import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple

from app.features.students.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentSearchParams,
    StudentBulkAction,
    StudentStatsResponse,
)


class StudentService:
    """Service for student operations."""
    
    def __init__(self, db_path: str = "academy_admin.db"):
        self.db_path = db_path
    
    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _generate_student_id(self) -> str:
        """Generate unique student ID in format STU-YYYY-NNNN."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Get current year
        current_year = date.today().year
        
        # Find the highest number for this year
        cursor.execute(
            "SELECT student_id FROM students WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1",
            (f"STU-{current_year}-%",)
        )
        last_student = cursor.fetchone()
        
        if last_student:
            # Extract the number from the last student ID
            last_number = int(last_student["student_id"].split("-")[2])
            next_number = last_number + 1
        else:
            next_number = 1
        
        conn.close()
        return f"STU-{current_year}-{next_number:04d}"
    
    def create_student(self, student_data: StudentCreate, created_by: str = None) -> StudentResponse:
        """Create a new student."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            # Generate IDs
            student_uuid = str(uuid.uuid4())
            student_id = self._generate_student_id()
            
            # Prepare address data
            address_json = None
            if student_data.address:
                address_json = json.dumps(student_data.address.dict())
            
            # Prepare emergency contact data
            emergency_name = None
            emergency_phone = None
            emergency_relationship = None
            if student_data.emergency_contact:
                emergency_name = student_data.emergency_contact.name
                emergency_phone = student_data.emergency_contact.phone
                emergency_relationship = student_data.emergency_contact.relationship
            
            # Prepare medical data
            medical_conditions = None
            medications = None
            allergies = None
            if student_data.medical_info:
                medical_conditions = student_data.medical_info.conditions
                medications = student_data.medical_info.medications
                allergies = student_data.medical_info.allergies
            
            # Insert student
            cursor.execute('''
                INSERT INTO students (
                    id, student_id, salutation, first_name, last_name, email, phone,
                    date_of_birth, gender, address, referral_source, enrollment_date, status,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                    medical_conditions, medications, allergies, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                student_uuid, student_id, student_data.salutation, student_data.first_name,
                student_data.last_name, student_data.email, student_data.phone,
                student_data.date_of_birth.isoformat(), student_data.gender,
                address_json, student_data.referral_source, student_data.enrollment_date.isoformat(),
                student_data.status, emergency_name, emergency_phone, emergency_relationship,
                medical_conditions, medications, allergies, student_data.notes, created_by
            ))
            
            conn.commit()
            
            # Return the created student
            return self.get_student(student_uuid)
            
        except sqlite3.IntegrityError as e:
            conn.rollback()
            if "email" in str(e):
                raise ValueError("Email already exists")
            elif "student_id" in str(e):
                raise ValueError("Student ID already exists")
            else:
                raise ValueError(f"Database constraint violation: {str(e)}")
        except Exception as e:
            conn.rollback()
            raise ValueError(f"Error creating student: {str(e)}")
        finally:
            conn.close()
    
    def get_student(self, student_id: str) -> Optional[StudentResponse]:
        """Get student by ID."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        student = cursor.fetchone()
        conn.close()
        
        if not student:
            return None
        
        return self._row_to_student_response(student)
    
    def get_student_by_student_id(self, student_id: str) -> Optional[StudentResponse]:
        """Get student by student ID (STU-YYYY-NNNN)."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM students WHERE student_id = ?", (student_id,))
        student = cursor.fetchone()
        conn.close()
        
        if not student:
            return None
        
        return self._row_to_student_response(student)
    
    def update_student(self, student_id: str, student_data: StudentUpdate, updated_by: str = None) -> Optional[StudentResponse]:
        """Update student information."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            # Build update query dynamically
            update_fields = []
            values = []
            
            # Handle basic fields
            basic_fields = [
                "first_name", "last_name", "email", "phone", "date_of_birth",
                "gender", "salutation", "referral_source", "enrollment_date", "status", "notes"
            ]
            
            for field in basic_fields:
                value = getattr(student_data, field, None)
                if value is not None:
                    if field in ["date_of_birth", "enrollment_date"]:
                        value = value.isoformat()
                    update_fields.append(f"{field} = ?")
                    values.append(value)
            
            # Handle address
            if student_data.address is not None:
                address_json = json.dumps(student_data.address.dict())
                update_fields.append("address = ?")
                values.append(address_json)
            
            # Handle emergency contact
            if student_data.emergency_contact is not None:
                emergency_contact = student_data.emergency_contact
                update_fields.append("emergency_contact_name = ?")
                values.append(emergency_contact.name)
                update_fields.append("emergency_contact_phone = ?")
                values.append(emergency_contact.phone)
                update_fields.append("emergency_contact_relationship = ?")
                values.append(emergency_contact.relationship)
            
            # Handle medical info
            if student_data.medical_info is not None:
                medical_info = student_data.medical_info
                update_fields.append("medical_conditions = ?")
                values.append(medical_info.conditions)
                update_fields.append("medications = ?")
                values.append(medical_info.medications)
                update_fields.append("allergies = ?")
                values.append(medical_info.allergies)
            
            if not update_fields:
                return self.get_student(student_id)
            
            # Add updated_by and updated_at
            update_fields.append("updated_by = ?")
            values.append(updated_by)
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            # Add student_id for WHERE clause
            values.append(student_id)
            
            query = f"UPDATE students SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                return None
            
            conn.commit()
            return self.get_student(student_id)
            
        except sqlite3.IntegrityError as e:
            conn.rollback()
            if "email" in str(e):
                raise ValueError("Email already exists")
            else:
                raise ValueError(f"Database constraint violation: {str(e)}")
        except Exception as e:
            conn.rollback()
            raise ValueError(f"Error updating student: {str(e)}")
        finally:
            conn.close()
    
    def delete_student(self, student_id: str) -> bool:
        """Delete a student."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return deleted
    
    def list_students(self, 
                     search_params: Optional[StudentSearchParams] = None,
                     page: int = 1,
                     per_page: int = 20) -> Tuple[List[StudentResponse], int]:
        """List students with optional search and pagination."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Build WHERE clause
        where_conditions = []
        params = []
        
        if search_params:
            if search_params.search:
                where_conditions.append("""
                    (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ?)
                """)
                search_term = f"%{search_params.search}%"
                params.extend([search_term, search_term, search_term, search_term])
            
            if search_params.status:
                where_conditions.append("status = ?")
                params.append(search_params.status)
            
            if search_params.enrollment_date_from:
                where_conditions.append("enrollment_date >= ?")
                params.append(search_params.enrollment_date_from.isoformat())
            
            if search_params.enrollment_date_to:
                where_conditions.append("enrollment_date <= ?")
                params.append(search_params.enrollment_date_to.isoformat())
            
            if search_params.gender:
                where_conditions.append("gender = ?")
                params.append(search_params.gender)
        
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Build ORDER BY clause
        order_clause = "ORDER BY created_at DESC"
        if search_params and search_params.sort_by:
            sort_order = search_params.sort_order or "asc"
            order_clause = f"ORDER BY {search_params.sort_by} {sort_order}"
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM students {where_clause}"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]
        
        # Get paginated results
        offset = (page - 1) * per_page
        list_query = f"""
            SELECT * FROM students 
            {where_clause} 
            {order_clause} 
            LIMIT ? OFFSET ?
        """
        cursor.execute(list_query, params + [per_page, offset])
        students = cursor.fetchall()
        
        conn.close()
        
        # Convert to response objects
        student_responses = [self._row_to_student_response(student) for student in students]
        
        return student_responses, total_count
    
    def get_student_stats(self) -> StudentStatsResponse:
        """Get student statistics."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Total students
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]
        
        # Students by status
        cursor.execute("SELECT status, COUNT(*) FROM students GROUP BY status")
        status_counts = dict(cursor.fetchall())
        
        # Students by gender
        cursor.execute("SELECT gender, COUNT(*) FROM students WHERE gender IS NOT NULL GROUP BY gender")
        gender_counts = dict(cursor.fetchall())
        
        # Recent enrollments (last 30 days)
        thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
        cursor.execute("SELECT COUNT(*) FROM students WHERE enrollment_date >= ?", (thirty_days_ago,))
        recent_enrollments = cursor.fetchone()[0]
        
        # Students by age group
        cursor.execute("SELECT date_of_birth FROM students WHERE date_of_birth IS NOT NULL")
        birth_dates = cursor.fetchall()
        
        age_groups = {"0-10": 0, "11-15": 0, "16-18": 0, "19+": 0}
        today = date.today()
        
        for row in birth_dates:
            birth_date = date.fromisoformat(row[0])
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            if age <= 10:
                age_groups["0-10"] += 1
            elif age <= 15:
                age_groups["11-15"] += 1
            elif age <= 18:
                age_groups["16-18"] += 1
            else:
                age_groups["19+"] += 1
        
        conn.close()
        
        return StudentStatsResponse(
            total_students=total_students,
            active_students=status_counts.get("active", 0),
            inactive_students=status_counts.get("inactive", 0),
            pending_students=status_counts.get("pending", 0),
            suspended_students=status_counts.get("suspended", 0),
            students_by_gender=gender_counts,
            students_by_age_group=age_groups,
            recent_enrollments=recent_enrollments
        )
    
    def bulk_update_status(self, student_ids: List[str], new_status: str, updated_by: str = None) -> Dict[str, Any]:
        """Bulk update student status."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        successful = []
        failed = []
        
        for student_id in student_ids:
            try:
                cursor.execute(
                    "UPDATE students SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (new_status, updated_by, student_id)
                )
                
                if cursor.rowcount > 0:
                    successful.append(student_id)
                else:
                    failed.append({"id": student_id, "error": "Student not found"})
                    
            except Exception as e:
                failed.append({"id": student_id, "error": str(e)})
        
        conn.commit()
        conn.close()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(student_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def _row_to_student_response(self, row: sqlite3.Row) -> StudentResponse:
        """Convert database row to StudentResponse."""
        # Parse address JSON
        address = None
        if row["address"]:
            try:
                address = json.loads(row["address"])
            except:
                address = None
        
        # Parse dates
        date_of_birth = None
        if row["date_of_birth"]:
            date_of_birth = date.fromisoformat(row["date_of_birth"])
        
        enrollment_date = None
        if row["enrollment_date"]:
            enrollment_date = date.fromisoformat(row["enrollment_date"])
        
        # Parse timestamps
        created_at = None
        if row["created_at"]:
            try:
                created_at = datetime.fromisoformat(row["created_at"].replace('Z', '+00:00'))
            except:
                created_at = datetime.now()
        
        updated_at = None
        if row["updated_at"]:
            try:
                updated_at = datetime.fromisoformat(row["updated_at"].replace('Z', '+00:00'))
            except:
                updated_at = datetime.now()
        
        return StudentResponse(
            id=row["id"],
            student_id=row["student_id"],
            salutation=row["salutation"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            email=row["email"],
            phone=row["phone"],
            date_of_birth=date_of_birth,
            gender=row["gender"],
            address=address,
            referral_source=row["referral_source"],
            enrollment_date=enrollment_date,
            status=row["status"],
            emergency_contact_name=row["emergency_contact_name"],
            emergency_contact_phone=row["emergency_contact_phone"],
            emergency_contact_relationship=row["emergency_contact_relationship"],
            medical_conditions=row["medical_conditions"],
            medications=row["medications"],
            allergies=row["allergies"],
            notes=row["notes"],
            created_by=row["created_by"],
            updated_by=row["updated_by"],
            created_at=created_at,
            updated_at=updated_at
        )


# Global instance
student_service = StudentService()