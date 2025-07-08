#!/usr/bin/env python3
"""
Test student database operations without external dependencies.
"""

import sqlite3
import json
import uuid
from datetime import date

def test_student_database():
    """Test student database operations."""
    
    print("Testing Student Database Operations...")
    
    # Connect to database
    conn = sqlite3.connect("academy_admin.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Test student creation
    print("\n1. Testing student creation...")
    
    student_id = str(uuid.uuid4())
    student_code = "STU-2025-TEST"
    
    address_data = {
        "line1": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "postal_code": "12345",
        "country": "US"
    }
    
    cursor.execute('''
        INSERT INTO students (
            id, student_id, first_name, last_name, email, phone,
            date_of_birth, gender, address, referral_source, enrollment_date, status,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
            medical_conditions, medications, allergies, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        student_id, student_code, "John", "Doe", "john.doe.test@example.com",
        "555-123-4567", "2010-05-15", "male", json.dumps(address_data),
        "Website", "2025-01-01", "active", "Jane Doe", "555-987-6543",
        "Mother", "None", "None", "Peanuts", "Test student"
    ))
    
    conn.commit()
    print(f"✓ Student created: {student_code}")
    
    # 2. Test student retrieval
    print("\n2. Testing student retrieval...")
    
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    
    if student:
        print(f"✓ Student retrieved: {student['student_id']} - {student['first_name']} {student['last_name']}")
        print(f"  Email: {student['email']}")
        print(f"  Phone: {student['phone']}")
        print(f"  Date of Birth: {student['date_of_birth']}")
        print(f"  Address: {student['address']}")
        print(f"  Emergency Contact: {student['emergency_contact_name']} ({student['emergency_contact_phone']})")
    else:
        print("✗ Student retrieval failed")
        return
    
    # 3. Test student update
    print("\n3. Testing student update...")
    
    cursor.execute(
        "UPDATE students SET phone = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        ("555-999-8888", "Updated test student", student_id)
    )
    
    conn.commit()
    
    cursor.execute("SELECT phone, notes FROM students WHERE id = ?", (student_id,))
    updated_student = cursor.fetchone()
    
    if updated_student and updated_student['phone'] == "555-999-8888":
        print(f"✓ Student updated: {updated_student['phone']}")
    else:
        print("✗ Student update failed")
    
    # 4. Test student list
    print("\n4. Testing student list...")
    
    cursor.execute("SELECT COUNT(*) FROM students")
    total_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT * FROM students ORDER BY created_at DESC LIMIT 10")
    students = cursor.fetchall()
    
    print(f"✓ Student list: {len(students)} students found (total: {total_count})")
    
    # 5. Test student search
    print("\n5. Testing student search...")
    
    search_term = "%John%"
    cursor.execute(
        "SELECT * FROM students WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?",
        (search_term, search_term, search_term)
    )
    search_results = cursor.fetchall()
    
    print(f"✓ Search results: {len(search_results)} students found for 'John'")
    
    # 6. Test student stats
    print("\n6. Testing student stats...")
    
    # Total students
    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]
    
    # Students by status
    cursor.execute("SELECT status, COUNT(*) FROM students GROUP BY status")
    status_counts = dict(cursor.fetchall())
    
    # Students by gender
    cursor.execute("SELECT gender, COUNT(*) FROM students WHERE gender IS NOT NULL GROUP BY gender")
    gender_counts = dict(cursor.fetchall())
    
    print(f"✓ Student stats:")
    print(f"  Total students: {total_students}")
    print(f"  Status breakdown: {status_counts}")
    print(f"  Gender breakdown: {gender_counts}")
    
    # 7. Test bulk update
    print("\n7. Testing bulk update...")
    
    cursor.execute(
        "UPDATE students SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        ("inactive", student_id)
    )
    
    affected_rows = cursor.rowcount
    conn.commit()
    
    print(f"✓ Bulk update: {affected_rows} students updated")
    
    # 8. Test student deletion
    print("\n8. Testing student deletion...")
    
    cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
    deleted_rows = cursor.rowcount
    conn.commit()
    
    if deleted_rows > 0:
        print("✓ Student deleted successfully")
    else:
        print("✗ Student deletion failed")
    
    conn.close()
    
    print("\n🎉 All student database tests completed!")


def test_student_id_generation():
    """Test student ID generation logic."""
    
    print("Testing Student ID Generation...")
    
    conn = sqlite3.connect("academy_admin.db")
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
        last_number = int(last_student[0].split("-")[2])
        next_number = last_number + 1
        print(f"✓ Last student ID: {last_student[0]}")
        print(f"✓ Next number: {next_number}")
    else:
        next_number = 1
        print("✓ No students found for current year, starting with 1")
    
    new_student_id = f"STU-{current_year}-{next_number:04d}"
    print(f"✓ Generated ID: {new_student_id}")
    
    conn.close()


def test_existing_student():
    """Test operations on existing student."""
    
    print("\nTesting Existing Student...")
    
    conn = sqlite3.connect("academy_admin.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Find existing student
    cursor.execute("SELECT * FROM students LIMIT 1")
    student = cursor.fetchone()
    
    if student:
        print(f"✓ Found existing student: {student['student_id']} - {student['first_name']} {student['last_name']}")
        
        # Calculate age
        if student['date_of_birth']:
            birth_date = date.fromisoformat(student['date_of_birth'])
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            print(f"✓ Student age: {age} years")
        
        # Parse address
        if student['address']:
            try:
                address = json.loads(student['address'])
                print(f"✓ Address parsed: {address}")
            except:
                print("✗ Address parsing failed")
        
    else:
        print("✗ No existing students found")
    
    conn.close()


if __name__ == "__main__":
    test_student_id_generation()
    test_existing_student()
    test_student_database()