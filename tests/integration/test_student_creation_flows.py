"""
Integration Tests for Student Creation and Edit Flows

Tests the complete student creation and editing workflows including:
- Independent student creation
- Student with parent creation
- Organization-sponsored student creation
- Edit flows with relationships and organizations
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, date
import json

from app.main import app
from app.core.database import get_db
from app.features.users.models.user import User
from app.features.students.models.student import Student
from app.features.organizations.models.organization import Organization, OrganizationMembership
from app.features.relationships.models.parent_child_relationship import ParentChildRelationship
from tests.conftest import (
    test_db,
    client,
    super_admin_token,
    program_admin_token,
    create_test_program,
    create_test_user,
    create_test_organization
)


class TestStudentCreationFlows:
    """Test complete student creation workflows."""
    
    def test_independent_student_creation_flow(
        self, 
        client: TestClient, 
        test_db: Session, 
        super_admin_token: str,
        create_test_program
    ):
        """Test creating an independent student (no parent, no organization)."""
        
        program = create_test_program
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Test data for independent student
        student_data = {
            "profile_type": "independent",
            "organization_type": "individual",
            "basic_info": {
                "full_name": "John Independent",
                "date_of_birth": "2010-05-15",
                "email": "john.independent@test.com",
                "phone": "+234 801 234 5678"
            },
            "address": {
                "street": "123 Independence Street",
                "city": "Lagos",
                "state": "Lagos State",
                "country": "Nigeria"
            },
            "emergency_contact": {
                "name": "Jane Doe",
                "phone": "+234 802 345 6789",
                "relationship": "Guardian"
            },
            "enrollment_info": {
                "course_ids": [],
                "preferred_schedule": "Weekday evenings",
                "medical_conditions": "None",
                "special_requirements": "None"
            }
        }
        
        # Create independent student
        response = client.post(
            "/api/v1/students/atomic/create-independent",
            json=student_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        
        # Verify response structure
        assert result["success"] is True
        assert "student" in result["data"]
        assert "user" in result["data"]
        
        student_id = result["data"]["student"]["id"]
        user_id = result["data"]["user"]["id"]
        
        # Verify student in database
        student = test_db.query(Student).filter(Student.id == student_id).first()
        assert student is not None
        assert student.user.full_name == "John Independent"
        assert student.user.email == "john.independent@test.com"
        assert student.user.profile_type == "full_user"
        
        # Verify no parent relationships
        parent_rels = test_db.query(ParentChildRelationship).filter(
            ParentChildRelationship.child_id == user_id
        ).all()
        assert len(parent_rels) == 0
        
        # Verify no organization memberships
        org_memberships = test_db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == user_id
        ).all()
        assert len(org_memberships) == 0
    
    def test_student_with_parent_creation_flow(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program
    ):
        """Test creating a student with parent relationship."""
        
        program = create_test_program
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Test data for student with parent
        student_data = {
            "profile_type": "with_parent",
            "organization_type": "individual",
            "basic_info": {
                "full_name": "Mary WithParent",
                "date_of_birth": "2012-08-20",
                "email": "",  # Child without email
                "phone": ""
            },
            "parent_info": {
                "parent_type": "new",
                "parent_data": {
                    "full_name": "Sarah Parent",
                    "email": "sarah.parent@test.com",
                    "phone": "+234 803 456 7890",
                    "relationship_type": "mother",
                    "has_payment_responsibility": True,
                    "has_pickup_permission": True
                }
            },
            "address": {
                "street": "456 Family Avenue",
                "city": "Abuja",
                "state": "FCT",
                "country": "Nigeria"
            },
            "enrollment_info": {
                "course_ids": [],
                "medical_conditions": "Asthma",
                "special_requirements": "Inhaler required"
            }
        }
        
        # Create student with parent
        response = client.post(
            "/api/v1/students/atomic/create-with-parent",
            json=student_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        
        # Verify response structure
        assert result["success"] is True
        assert "student" in result["data"]
        assert "parent" in result["data"]
        assert "relationship" in result["data"]
        
        student_id = result["data"]["student"]["id"]
        parent_id = result["data"]["parent"]["id"]
        
        # Verify student in database
        student = test_db.query(Student).filter(Student.id == student_id).first()
        assert student is not None
        assert student.user.full_name == "Mary WithParent"
        assert student.user.profile_type == "profile_only"  # Child profile
        
        # Verify parent in database
        parent_user = test_db.query(User).filter(User.id == parent_id).first()
        assert parent_user is not None
        assert parent_user.full_name == "Sarah Parent"
        assert parent_user.email == "sarah.parent@test.com"
        assert parent_user.profile_type == "full_user"
        
        # Verify parent-child relationship
        relationship = test_db.query(ParentChildRelationship).filter(
            ParentChildRelationship.child_id == student.user_id,
            ParentChildRelationship.parent_id == parent_id
        ).first()
        assert relationship is not None
        assert relationship.relationship_type == "mother"
        assert relationship.has_payment_responsibility is True
        assert relationship.has_pickup_permission is True
    
    def test_organization_sponsored_student_creation(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_organization
    ):
        """Test creating a student sponsored by an organization."""
        
        program = create_test_program
        organization = create_test_organization
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Test data for sponsored student
        student_data = {
            "profile_type": "independent",
            "organization_type": "organization",
            "basic_info": {
                "full_name": "Tom Sponsored",
                "date_of_birth": "2011-12-10",
                "email": "tom.sponsored@test.com",
                "phone": "+234 804 567 8901"
            },
            "organization_info": {
                "organization_id": organization.id,
                "membership_type": "sponsored_student",
                "has_payment_responsibility": True,
                "sponsorship_details": {
                    "sponsorship_type": "full",
                    "coverage_percentage": 100,
                    "start_date": "2024-01-01"
                }
            },
            "address": {
                "street": "789 Sponsored Lane",
                "city": "Port Harcourt",
                "state": "Rivers State",
                "country": "Nigeria"
            },
            "enrollment_info": {
                "course_ids": [],
                "preferred_schedule": "Weekend mornings"
            }
        }
        
        # Create sponsored student
        response = client.post(
            "/api/v1/students/atomic/create-sponsored",
            json=student_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        
        # Verify response structure
        assert result["success"] is True
        assert "student" in result["data"]
        assert "organization_membership" in result["data"]
        
        student_id = result["data"]["student"]["id"]
        
        # Verify student in database
        student = test_db.query(Student).filter(Student.id == student_id).first()
        assert student is not None
        assert student.user.full_name == "Tom Sponsored"
        
        # Verify organization membership
        membership = test_db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == student.user_id,
            OrganizationMembership.organization_id == organization.id
        ).first()
        assert membership is not None
        assert membership.membership_type == "sponsored_student"
        assert membership.has_payment_responsibility is True
    
    def test_student_creation_validation_errors(
        self,
        client: TestClient,
        super_admin_token: str,
        create_test_program
    ):
        """Test validation errors in student creation."""
        
        program = create_test_program
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Test missing required fields
        invalid_data = {
            "profile_type": "independent",
            "basic_info": {
                "full_name": "",  # Empty name
                "date_of_birth": "invalid-date",  # Invalid date
                "email": "invalid-email"  # Invalid email
            }
        }
        
        response = client.post(
            "/api/v1/students/atomic/create-independent",
            json=invalid_data,
            headers=headers
        )
        
        assert response.status_code == 422  # Validation error
        error_detail = response.json()["detail"]
        
        # Check that validation errors are present
        error_fields = [error["loc"][-1] for error in error_detail if "loc" in error]
        assert "full_name" in str(error_fields) or any("full_name" in str(error) for error in error_detail)


class TestStudentEditFlows:
    """Test complete student edit workflows."""
    
    def test_student_basic_info_edit_flow(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_user
    ):
        """Test editing student basic information."""
        
        program = create_test_program
        user = create_test_user
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Create student
        student = Student(
            user_id=user.id,
            program_id=program.id,
            enrollment_date=date.today()
        )
        test_db.add(student)
        test_db.commit()
        test_db.refresh(student)
        
        # Update basic info
        update_data = {
            "full_name": "Updated Name",
            "email": "updated.email@test.com", 
            "phone": "+234 805 678 9012",
            "date_of_birth": "2010-06-15"
        }
        
        response = client.put(
            f"/api/v1/students/{student.id}/basic-info",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        
        # Verify updates in database
        test_db.refresh(student)
        assert student.user.full_name == "Updated Name"
        assert student.user.email == "updated.email@test.com"
    
    def test_student_relationship_management_flow(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_user
    ):
        """Test managing parent-child relationships."""
        
        program = create_test_program
        student_user = create_test_user
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Create student
        student = Student(
            user_id=student_user.id,
            program_id=program.id,
            enrollment_date=date.today()
        )
        test_db.add(student)
        test_db.commit()
        
        # Create parent user
        parent_user = User(
            full_name="Test Parent",
            email="test.parent@test.com",
            profile_type="full_user"
        )
        test_db.add(parent_user)
        test_db.commit()
        test_db.refresh(parent_user)
        
        # Add parent relationship
        relationship_data = {
            "parent_id": parent_user.id,
            "relationship_type": "father",
            "has_payment_responsibility": True,
            "has_pickup_permission": True,
            "emergency_contact": True
        }
        
        response = client.post(
            f"/api/v1/students/{student.id}/relationships",
            json=relationship_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        assert result["success"] is True
        
        # Verify relationship in database
        relationship = test_db.query(ParentChildRelationship).filter(
            ParentChildRelationship.child_id == student_user.id,
            ParentChildRelationship.parent_id == parent_user.id
        ).first()
        assert relationship is not None
        assert relationship.relationship_type == "father"
        assert relationship.has_payment_responsibility is True
        
        # Test updating relationship
        update_data = {
            "has_payment_responsibility": False,
            "has_pickup_permission": False
        }
        
        response = client.put(
            f"/api/v1/students/{student.id}/relationships/{relationship.id}",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200
        
        # Verify updates
        test_db.refresh(relationship)
        assert relationship.has_payment_responsibility is False
        assert relationship.has_pickup_permission is False
    
    def test_student_organization_membership_flow(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_user,
        create_test_organization
    ):
        """Test managing organization memberships."""
        
        program = create_test_program
        user = create_test_user
        organization = create_test_organization
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Create student
        student = Student(
            user_id=user.id,
            program_id=program.id,
            enrollment_date=date.today()
        )
        test_db.add(student)
        test_db.commit()
        
        # Add organization membership
        membership_data = {
            "organization_id": organization.id,
            "membership_type": "sponsored_student",
            "has_payment_responsibility": True,
            "membership_start_date": "2024-01-01"
        }
        
        response = client.post(
            f"/api/v1/students/{student.id}/organizations",
            json=membership_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        assert result["success"] is True
        
        # Verify membership in database
        membership = test_db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == user.id,
            OrganizationMembership.organization_id == organization.id
        ).first()
        assert membership is not None
        assert membership.membership_type == "sponsored_student"
        assert membership.has_payment_responsibility is True
        
        # Test updating membership 
        update_data = {
            "has_payment_responsibility": False,
            "membership_type": "regular_member"
        }
        
        response = client.put(
            f"/api/v1/students/{student.id}/organizations/{membership.id}",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200
        
        # Verify updates
        test_db.refresh(membership)
        assert membership.has_payment_responsibility is False
        assert membership.membership_type == "regular_member"


class TestParentCreationAndEditFlows:
    """Test parent creation and edit workflows."""
    
    def test_parent_with_children_creation_flow(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_user
    ):
        """Test creating a parent with existing children."""
        
        program = create_test_program
        child_user = create_test_user
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Create child student first
        child_student = Student(
            user_id=child_user.id,
            program_id=program.id,
            enrollment_date=date.today()
        )
        test_db.add(child_student)
        test_db.commit()
        
        # Test data for parent creation
        parent_data = {
            "basic_info": {
                "full_name": "Parent WithChildren",
                "email": "parent.children@test.com",
                "phone": "+234 806 789 0123"
            },
            "address": {
                "street": "321 Parent Street",
                "city": "Lagos",
                "state": "Lagos State",
                "country": "Nigeria"
            },
            "children_assignments": [
                {
                    "child_id": child_user.id,
                    "relationship_type": "mother",
                    "has_payment_responsibility": True,
                    "has_pickup_permission": True,
                    "emergency_contact": True
                }
            ],
            "organization_info": {
                "type": "individual"
            }
        }
        
        # Create parent with children
        response = client.post(
            "/api/v1/parents/atomic/create-with-children",
            json=parent_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        
        # Verify response structure
        assert result["success"] is True
        assert "parent" in result["data"]
        assert "relationships" in result["data"]
        
        parent_id = result["data"]["parent"]["id"]
        
        # Verify parent in database
        parent_user = test_db.query(User).filter(User.id == parent_id).first()
        assert parent_user is not None
        assert parent_user.full_name == "Parent WithChildren"
        assert parent_user.profile_type == "full_user"
        
        # Verify relationship created
        relationship = test_db.query(ParentChildRelationship).filter(
            ParentChildRelationship.parent_id == parent_id,
            ParentChildRelationship.child_id == child_user.id
        ).first()
        assert relationship is not None
        assert relationship.relationship_type == "mother"
        assert relationship.has_payment_responsibility is True


class TestPaymentOverrideIntegration:
    """Test payment override integration with creation/edit flows."""
    
    def test_payment_calculation_in_student_creation(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_organization
    ):
        """Test payment calculation integration during student creation."""
        
        program = create_test_program
        organization = create_test_organization
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Create sponsored student
        student_data = {
            "profile_type": "independent",
            "organization_type": "organization",
            "basic_info": {
                "full_name": "Payment Test Student",
                "date_of_birth": "2011-03-15",
                "email": "payment.test@test.com"
            },
            "organization_info": {
                "organization_id": organization.id,
                "membership_type": "sponsored_student",
                "has_payment_responsibility": True
            }
        }
        
        # Create student
        response = client.post(
            "/api/v1/students/atomic/create-sponsored",
            json=student_data,
            headers=headers
        )
        
        assert response.status_code == 201
        result = response.json()
        student_id = result["data"]["student"]["id"]
        
        # Test payment status
        response = client.get(
            f"/api/v1/organizations/payment-overrides/student/{student_id}/payment-status",
            headers=headers
        )
        
        assert response.status_code == 200
        payment_status = response.json()
        
        assert payment_status["has_payment_overrides"] is True
        assert payment_status["payment_responsibility_type"] == "organization"
        assert len(payment_status["sponsoring_organizations"]) == 1
        assert payment_status["sponsoring_organizations"][0]["organization_id"] == organization.id


@pytest.mark.asyncio
class TestEndToEndWorkflows:
    """Test complete end-to-end workflows."""
    
    async def test_complete_student_lifecycle(
        self,
        client: TestClient,
        test_db: Session,
        super_admin_token: str,
        create_test_program,
        create_test_organization
    ):
        """Test complete student lifecycle from creation to graduation."""
        
        program = create_test_program
        organization = create_test_organization
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
            "X-Program-Context": program.id
        }
        
        # Step 1: Create sponsored student
        student_data = {
            "profile_type": "independent",
            "organization_type": "organization",
            "basic_info": {
                "full_name": "Lifecycle Test Student",
                "date_of_birth": "2012-07-20",
                "email": "lifecycle.test@test.com",
                "phone": "+234 807 890 1234"
            },
            "organization_info": {
                "organization_id": organization.id,
                "membership_type": "sponsored_student",
                "has_payment_responsibility": True
            },
            "address": {
                "street": "123 Lifecycle Lane",
                "city": "Lagos",
                "state": "Lagos State",
                "country": "Nigeria"
            }
        }
        
        create_response = client.post(
            "/api/v1/students/atomic/create-sponsored",
            json=student_data,
            headers=headers
        )
        
        assert create_response.status_code == 201
        student_id = create_response.json()["data"]["student"]["id"]
        
        # Step 2: Add parent relationship
        parent_data = {
            "full_name": "Lifecycle Parent",
            "email": "lifecycle.parent@test.com",
            "phone": "+234 808 901 2345"
        }
        
        parent_response = client.post(
            "/api/v1/parents",
            json=parent_data,
            headers=headers
        )
        
        assert parent_response.status_code == 201
        parent_id = parent_response.json()["data"]["id"]
        
        # Add relationship
        relationship_data = {
            "parent_id": parent_id,
            "relationship_type": "guardian",
            "has_payment_responsibility": False,  # Organization still pays
            "has_pickup_permission": True,
            "emergency_contact": True
        }
        
        rel_response = client.post(
            f"/api/v1/students/{student_id}/relationships",
            json=relationship_data,
            headers=headers
        )
        
        assert rel_response.status_code == 201
        
        # Step 3: Verify payment structure (organization + parent)
        payment_response = client.get(
            f"/api/v1/organizations/payment-overrides/student/{student_id}/payment-status",
            headers=headers
        )
        
        assert payment_response.status_code == 200
        payment_status = payment_response.json()
        
        assert payment_status["has_payment_overrides"] is True
        assert len(payment_status["sponsoring_organizations"]) == 1
        assert len(payment_status["responsible_parents"]) == 0  # No payment responsibility
        
        # Step 4: Update student information
        update_data = {
            "phone": "+234 809 012 3456",
            "emergency_contact": {
                "name": "Updated Emergency Contact",
                "phone": "+234 810 123 4567"
            }
        }
        
        update_response = client.put(
            f"/api/v1/students/{student_id}/basic-info",
            json=update_data,
            headers=headers
        )
        
        assert update_response.status_code == 200
        
        # Step 5: Verify final state
        final_response = client.get(
            f"/api/v1/students/{student_id}",
            headers=headers
        )
        
        assert final_response.status_code == 200
        final_data = final_response.json()["data"]
        
        assert final_data["user"]["phone"] == "+234 809 012 3456"
        assert final_data["user"]["full_name"] == "Lifecycle Test Student"