#!/usr/bin/env python3
"""
Test student API functionality.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from datetime import date
from app.features.students.services.student_service import student_service
from app.features.students.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentAddressBase,
    StudentEmergencyContact,
    StudentMedicalInfo,
    StudentSearchParams,
)


def test_student_service():
    """Test student service functionality."""
    
    print("Testing Student Service...")
    
    # Test student creation
    print("\n1. Testing student creation...")
    
    address = StudentAddressBase(
        line1="123 Main St",
        city="Anytown",
        state="CA",
        postal_code="12345",
        country="US"
    )
    
    emergency_contact = StudentEmergencyContact(
        name="Jane Doe",
        phone="555-987-6543",
        relationship="Mother"
    )
    
    medical_info = StudentMedicalInfo(
        conditions="None",
        medications="None",
        allergies="Peanuts"
    )
    
    student_data = StudentCreate(
        first_name="John",
        last_name="Doe",
        email="john.doe.test@example.com",
        phone="555-123-4567",
        date_of_birth=date(2010, 5, 15),
        gender="male",
        salutation="Mr",
        referral_source="Website",
        enrollment_date=date(2025, 1, 1),
        status="active",
        address=address,
        emergency_contact=emergency_contact,
        medical_info=medical_info,
        notes="Test student"
    )
    
    try:
        created_student = student_service.create_student(student_data, "admin-id")
        print(f"✓ Student created: {created_student.student_id} - {created_student.full_name}")
        student_id = created_student.id
    except Exception as e:
        print(f"✗ Student creation failed: {e}")
        return
    
    # Test student retrieval
    print("\n2. Testing student retrieval...")
    
    retrieved_student = student_service.get_student(student_id)
    if retrieved_student:
        print(f"✓ Student retrieved: {retrieved_student.student_id} - {retrieved_student.full_name}")
        print(f"  Address: {retrieved_student.address}")
        print(f"  Emergency Contact: {retrieved_student.emergency_contact_name}")
        print(f"  Age: {retrieved_student.age} years")
    else:
        print("✗ Student retrieval failed")
        return
    
    # Test student update
    print("\n3. Testing student update...")
    
    update_data = StudentUpdate(
        phone="555-999-8888",
        notes="Updated test student"
    )
    
    updated_student = student_service.update_student(student_id, update_data, "admin-id")
    if updated_student and updated_student.phone == "555-999-8888":
        print(f"✓ Student updated: {updated_student.phone}")
    else:
        print("✗ Student update failed")
    
    # Test student list
    print("\n4. Testing student list...")
    
    students, total = student_service.list_students(page=1, per_page=10)
    print(f"✓ Student list: {len(students)} students found (total: {total})")
    
    # Test student search
    print("\n5. Testing student search...")
    
    search_params = StudentSearchParams(
        search="John",
        status="active"
    )
    
    search_results, search_total = student_service.list_students(
        search_params=search_params,
        page=1,
        per_page=10
    )
    print(f"✓ Search results: {len(search_results)} students found")
    
    # Test student stats
    print("\n6. Testing student stats...")
    
    stats = student_service.get_student_stats()
    print(f"✓ Student stats:")
    print(f"  Total students: {stats.total_students}")
    print(f"  Active students: {stats.active_students}")
    print(f"  Students by gender: {stats.students_by_gender}")
    print(f"  Students by age group: {stats.students_by_age_group}")
    
    # Test bulk update
    print("\n7. Testing bulk update...")
    
    bulk_result = student_service.bulk_update_status([student_id], "inactive", "admin-id")
    print(f"✓ Bulk update: {bulk_result['total_successful']} successful, {bulk_result['total_failed']} failed")
    
    # Test student deletion
    print("\n8. Testing student deletion...")
    
    deleted = student_service.delete_student(student_id)
    if deleted:
        print("✓ Student deleted successfully")
    else:
        print("✗ Student deletion failed")
    
    print("\n🎉 All student service tests completed!")


def test_student_id_generation():
    """Test student ID generation."""
    
    print("\nTesting Student ID Generation...")
    
    # Test multiple ID generations
    ids = []
    for i in range(5):
        student_id = student_service._generate_student_id()
        ids.append(student_id)
        print(f"Generated ID {i+1}: {student_id}")
    
    # Check uniqueness
    if len(set(ids)) == len(ids):
        print("✓ All generated IDs are unique")
    else:
        print("✗ Duplicate IDs found")
    
    # Check format
    import re
    pattern = r"^STU-\d{4}-\d{4}$"
    
    for student_id in ids:
        if re.match(pattern, student_id):
            print(f"✓ ID format valid: {student_id}")
        else:
            print(f"✗ ID format invalid: {student_id}")


if __name__ == "__main__":
    test_student_id_generation()
    test_student_service()