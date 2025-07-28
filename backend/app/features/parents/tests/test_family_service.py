"""
Comprehensive tests for family management services.

Test suite covering atomic creation, complex family structures,
relationship management, and error handling scenarios.
"""

import pytest
from datetime import date, datetime
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.features.parents.services.family_service import family_service
from app.features.parents.schemas.family_creation import (
    ParentWithChildrenCreate,
    MultiParentFamily,
    StudentToParentLink,
    FamilyCreationType,
    RelationshipSettings,
    EnhancedStudentCreate
)
from app.features.parents.schemas.parent import ParentCreate
from app.features.students.schemas.student import StudentCreate


class TestFamilyService:
    """Test class for FamilyService functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)
    
    @pytest.fixture
    def sample_parent_data(self):
        """Sample parent creation data."""
        return ParentCreate(
            username="sarah.johnson",
            email="sarah.johnson@email.com",
            password="SecurePass123!",
            first_name="Sarah",
            last_name="Johnson",
            salutation="Mrs.",
            phone="+1234567890",
            date_of_birth=date(1985, 3, 15),
            address={"street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345"},
            occupation="Teacher",
            payment_responsibility=True
        )
    
    @pytest.fixture
    def sample_student_data(self):
        """Sample student creation data."""
        return EnhancedStudentCreate(
            first_name="Emma",
            last_name="Johnson",
            date_of_birth=date(2015, 3, 15),
            inherit_from_parent=True,
            relationship_settings=RelationshipSettings(
                can_pickup=True,
                is_emergency_contact=True,
                has_payment_responsibility=True
            )
        )
    
    @pytest.fixture
    def sample_family_data(self, sample_parent_data, sample_student_data):
        """Sample family creation data."""
        return ParentWithChildrenCreate(
            creation_type=FamilyCreationType.PARENT_WITH_CHILDREN,
            parent_data=sample_parent_data,
            children_data=[sample_student_data],
            family_notes="Single parent family"
        )
    
    def test_create_parent_with_children_family_success(self, mock_db, sample_family_data):
        """Test successful parent with children family creation."""
        # Mock the atomic creation service
        with patch('app.features.parents.services.family_service.atomic_creation_service') as mock_atomic:
            # Setup mock return value
            mock_atomic.create_parent_with_children.return_value = {
                "parent": {
                    "user": Mock(id="parent-user-id", first_name="Sarah", last_name="Johnson", 
                               email="sarah.johnson@email.com", phone="+1234567890", is_active=True),
                    "profile": Mock(id="parent-profile-id", payment_responsibility=True, 
                                  created_at=datetime.now())
                },
                "children": [
                    {
                        "user": Mock(id="child-user-id", first_name="Emma", last_name="Johnson", 
                                   date_of_birth=date(2015, 3, 15), email=None, is_active=True),
                        "profile": Mock(id="child-profile-id", created_at=datetime.now()),
                        "relationship": Mock(
                            parent_id="parent-profile-id",
                            student_id="child-profile-id",
                            can_pickup=True,
                            is_emergency_contact=True,
                            has_payment_responsibility=True,
                            pickup_notes=None,
                            special_instructions=None
                        )
                    }
                ],
                "organization_membership": False
            }
            
            # Call the service
            result = family_service.create_parent_with_children_family(
                db=mock_db,
                family_data=sample_family_data,
                program_context="test-program-id",
                created_by="test-user-id"
            )
            
            # Assertions
            assert result.success is True
            assert result.creation_type == FamilyCreationType.PARENT_WITH_CHILDREN
            assert len(result.created_parents) == 1
            assert len(result.created_children) == 1
            assert len(result.created_relationships) == 1
            assert result.family_id is not None
            
            # Verify atomic service was called correctly
            mock_atomic.create_parent_with_children.assert_called_once()
    
    def test_create_parent_with_children_family_validation_error(self, mock_db):
        """Test family creation with validation errors."""
        # Create invalid family data (missing required fields)
        invalid_parent_data = ParentCreate(
            username="",  # Empty username should cause validation error
            email="invalid-email",  # Invalid email format
            password="weak",  # Weak password
            first_name="",  # Empty first name
            last_name="Johnson"
        )
        
        invalid_family_data = ParentWithChildrenCreate(
            parent_data=invalid_parent_data,
            children_data=[]
        )
        
        # Should raise HTTPException due to validation errors
        with pytest.raises(HTTPException) as exc_info:
            family_service.create_parent_with_children_family(
                db=mock_db,
                family_data=invalid_family_data,
                program_context="test-program-id",
                created_by="test-user-id"
            )
        
        assert exc_info.value.status_code == 400
    
    def test_create_multi_parent_family_success(self, mock_db):
        """Test successful multi-parent family creation."""
        # Create multi-parent family data
        parent1_data = ParentCreate(
            username="john.doe",
            email="john.doe@email.com",
            password="SecurePass123!",
            first_name="John",
            last_name="Doe",
            salutation="Mr."
        )
        
        parent2_data = ParentCreate(
            username="jane.doe",
            email="jane.doe@email.com",
            password="SecurePass456!",
            first_name="Jane",
            last_name="Doe",
            salutation="Ms."
        )
        
        child_data = EnhancedStudentCreate(
            first_name="Alex",
            last_name="Doe",
            date_of_birth=date(2012, 8, 20)
        )
        
        multi_parent_data = MultiParentFamily(
            parents_data=[parent1_data, parent2_data],
            children_data=[child_data],
            parent_child_mappings=[
                {
                    "parent_index": 0,
                    "child_index": 0,
                    "relationship_settings": {
                        "can_pickup": True,
                        "is_emergency_contact": True,
                        "has_payment_responsibility": True
                    }
                },
                {
                    "parent_index": 1,
                    "child_index": 0,
                    "relationship_settings": {
                        "can_pickup": True,
                        "is_emergency_contact": True,
                        "has_payment_responsibility": False
                    }
                }
            ],
            family_structure_notes="Divorced parents with shared custody"
        )
        
        with patch('app.features.parents.services.family_service.atomic_creation_service') as mock_atomic, \
             patch('app.features.parents.services.family_service.user_service') as mock_user_service, \
             patch('app.features.parents.services.family_service.relationship_service') as mock_rel_service:
            
            # Setup mocks
            mock_db.begin.return_value = None
            mock_db.commit.return_value = None
            
            # Mock atomic service calls for each parent
            mock_atomic.create_parent_with_children.side_effect = [
                {
                    "parent": {
                        "user": Mock(id="parent1-user-id", first_name="John", last_name="Doe"),
                        "profile": Mock(id="parent1-profile-id", created_at=datetime.now())
                    }
                },
                {
                    "parent": {
                        "user": Mock(id="parent2-user-id", first_name="Jane", last_name="Doe"),
                        "profile": Mock(id="parent2-profile-id", created_at=datetime.now())
                    }
                }
            ]
            
            # Mock child user creation
            mock_user_service.create_user_with_roles.return_value = Mock(
                id="child-user-id", 
                first_name="Alex", 
                last_name="Doe",
                date_of_birth=date(2012, 8, 20),
                email=None
            )
            
            # Mock relationship creation
            mock_rel_service.create_parent_child_relationship.return_value = Mock(
                parent_id="parent1-profile-id",
                student_id="child-profile-id",
                can_pickup=True,
                is_emergency_contact=True,
                has_payment_responsibility=True,
                pickup_notes=None,
                special_instructions=None,
                created_at=datetime.now()
            )
            
            # Call the service
            result = family_service.create_multi_parent_family(
                db=mock_db,
                family_data=multi_parent_data,
                program_context="test-program-id",
                created_by="test-user-id"
            )
            
            # Assertions
            assert result.success is True
            assert result.creation_type == FamilyCreationType.MULTI_PARENT_FAMILY
            assert len(result.created_parents) == 2
            assert len(result.created_children) == 1
            assert result.family_id is not None
            assert "Divorced parents with shared custody" in result.warnings[0]
    
    def test_link_student_to_parent_success(self, mock_db):
        """Test successful student-parent linking."""
        link_data = StudentToParentLink(
            student_id="test-student-id",
            parent_id="test-parent-id",
            relationship_settings=RelationshipSettings(
                can_pickup=True,
                is_emergency_contact=False,
                has_payment_responsibility=False,
                pickup_notes="Secondary guardian"
            )
        )
        
        with patch('app.features.parents.services.family_service.parent_service') as mock_parent_service, \
             patch('app.features.parents.services.family_service.relationship_service') as mock_rel_service:
            
            # Mock parent and student existence
            mock_parent_service.get_parent_by_id.return_value = Mock(id="test-parent-id")
            mock_db.query.return_value.filter.return_value.first.return_value = Mock(id="test-student-id")
            
            # Mock relationship creation
            mock_rel_service.create_parent_child_relationship.return_value = Mock(
                parent_id="test-parent-id",
                student_id="test-student-id",
                can_pickup=True,
                is_emergency_contact=False,
                has_payment_responsibility=False,
                pickup_notes="Secondary guardian",
                special_instructions=None,
                created_at=datetime.now()
            )
            
            # Call the service
            result = family_service.link_student_to_parent(
                db=mock_db,
                link_data=link_data,
                program_context="test-program-id",
                created_by="test-user-id"
            )
            
            # Assertions
            assert result["success"] is True
            assert result["parent_id"] == "test-parent-id"
            assert result["student_id"] == "test-student-id"
            assert result["relationship"]["pickup_notes"] == "Secondary guardian"
    
    def test_link_student_to_parent_not_found(self, mock_db):
        """Test linking with non-existent parent or student."""
        link_data = StudentToParentLink(
            student_id="non-existent-student",
            parent_id="non-existent-parent",
            relationship_settings=RelationshipSettings()
        )
        
        with patch('app.features.parents.services.family_service.parent_service') as mock_parent_service:
            # Mock parent not found
            mock_parent_service.get_parent_by_id.return_value = None
            
            # Should raise 404 error
            with pytest.raises(HTTPException) as exc_info:
                family_service.link_student_to_parent(
                    db=mock_db,
                    link_data=link_data,
                    program_context="test-program-id",
                    created_by="test-user-id"
                )
            
            assert exc_info.value.status_code == 404
            assert "Parent not found" in str(exc_info.value.detail)
    
    def test_get_family_structure_success(self, mock_db):
        """Test successful family structure retrieval."""
        with patch('app.features.parents.services.family_service.relationship_service') as mock_rel_service:
            # Mock family structure data
            mock_rel_service.get_family_structure.return_value = {
                "user": Mock(id="test-user-id", last_name="Johnson"),
                "parents": [
                    {
                        "user": Mock(id="parent-user-id", first_name="Sarah", last_name="Johnson", 
                                   email="sarah@email.com", phone="+1234567890", is_active=True),
                        "parent_profile": Mock(id="parent-profile-id", payment_responsibility=True),
                        "relationship": {"can_pickup": True, "is_emergency_contact": True}
                    }
                ],
                "children": [
                    {
                        "user": Mock(id="child-user-id", first_name="Emma", last_name="Johnson", 
                                   date_of_birth=date(2015, 3, 15), email=None, is_active=True),
                        "student_profile": Mock(id="student-profile-id"),
                        "relationship": {"can_pickup": True, "is_emergency_contact": True}
                    }
                ]
            }
            
            # Call the service
            result = family_service.get_family_structure(
                db=mock_db,
                family_identifier="test-user-id",
                program_context="test-program-id"
            )
            
            # Assertions
            assert result.family_id is not None
            assert "johnson" in result.family_id.lower()
            assert len(result.parents) == 1
            assert len(result.children) == 1
            assert result.family_statistics["total_members"] == 2
            assert result.family_statistics["parent_count"] == 1
            assert result.family_statistics["children_count"] == 1
    
    def test_database_error_handling(self, mock_db, sample_family_data):
        """Test proper error handling for database errors."""
        with patch('app.features.parents.services.family_service.atomic_creation_service') as mock_atomic:
            # Mock database error
            mock_atomic.create_parent_with_children.side_effect = Exception("Database connection failed")
            
            # Should raise 500 error
            with pytest.raises(HTTPException) as exc_info:
                family_service.create_parent_with_children_family(
                    db=mock_db,
                    family_data=sample_family_data,
                    program_context="test-program-id",
                    created_by="test-user-id"
                )
            
            assert exc_info.value.status_code == 500
            assert "Error creating family" in str(exc_info.value.detail)


class TestFamilyServiceIntegration:
    """Integration tests for family service with real-like scenarios."""
    
    def test_complex_family_creation_scenario(self):
        """Test a complex family creation scenario with multiple validation steps."""
        # This would be an integration test with a test database
        # For now, we'll just verify the structure is correct
        
        # Sample complex family data
        parent_data = ParentCreate(
            username="complex.parent",
            email="complex@example.com",
            password="VerySecure123!",
            first_name="Complex",
            last_name="Parent",
            salutation="Dr.",
            phone="+1-555-123-4567",
            date_of_birth=date(1980, 5, 10),
            address={"street": "456 Complex St", "city": "Testville", "state": "TX", "zip": "75001"},
            occupation="Doctor",
            payment_responsibility=True,
            referral_source="Online search"
        )
        
        children_data = [
            EnhancedStudentCreate(
                first_name="Child",
                last_name="One",
                date_of_birth=date(2010, 1, 15),
                medical_conditions="Asthma",
                dietary_restrictions="Peanut allergy",
                inherit_from_parent=True,
                relationship_settings=RelationshipSettings(
                    can_pickup=True,
                    is_emergency_contact=True,
                    has_payment_responsibility=True,
                    special_instructions="Has inhaler, keep in office"
                )
            ),
            EnhancedStudentCreate(
                first_name="Child",
                last_name="Two",
                date_of_birth=date(2013, 6, 20),
                inherit_from_parent=True,
                relationship_settings=RelationshipSettings(
                    can_pickup=True,
                    is_emergency_contact=True,
                    has_payment_responsibility=True
                )
            )
        ]
        
        complex_family_data = ParentWithChildrenCreate(
            creation_type=FamilyCreationType.PARENT_WITH_CHILDREN,
            parent_data=parent_data,
            children_data=children_data,
            family_notes="Doctor parent with two children, one has medical needs"
        )
        
        # Verify the data structure is valid
        assert complex_family_data.creation_type == FamilyCreationType.PARENT_WITH_CHILDREN
        assert len(complex_family_data.children_data) == 2
        assert complex_family_data.parent_data.occupation == "Doctor"
        assert complex_family_data.children_data[0].medical_conditions == "Asthma"
        assert complex_family_data.children_data[0].relationship_settings.special_instructions is not None
    
    def test_divorced_family_structure(self):
        """Test divorced family with complex custody arrangements."""
        # Create divorced parents
        parent1 = ParentCreate(
            username="dad.divorced",
            email="dad@divorced.com",
            password="SecureDad123!",
            first_name="Dad",
            last_name="Divorced",
            salutation="Mr.",
            payment_responsibility=True
        )
        
        parent2 = ParentCreate(
            username="mom.divorced",
            email="mom@divorced.com", 
            password="SecureMom123!",
            first_name="Mom",
            last_name="Divorced",
            salutation="Ms.",
            payment_responsibility=False
        )
        
        child = EnhancedStudentCreate(
            first_name="Shared",
            last_name="Child",
            date_of_birth=date(2014, 4, 10)
        )
        
        divorced_family = MultiParentFamily(
            creation_type=FamilyCreationType.MULTI_PARENT_FAMILY,
            parents_data=[parent1, parent2],
            children_data=[child],
            parent_child_mappings=[
                {
                    "parent_index": 0,
                    "child_index": 0,
                    "relationship_settings": {
                        "can_pickup": True,
                        "is_emergency_contact": True,
                        "has_payment_responsibility": True,
                        "pickup_notes": "Primary custody, can pick up anytime"
                    }
                },
                {
                    "parent_index": 1,
                    "child_index": 0,
                    "relationship_settings": {
                        "can_pickup": True,
                        "is_emergency_contact": True,
                        "has_payment_responsibility": False,
                        "pickup_notes": "Alternate weekends only"
                    }
                }
            ],
            family_structure_notes="Divorced couple with shared custody arrangement"
        )
        
        # Verify the structure
        assert len(divorced_family.parents_data) == 2
        assert len(divorced_family.children_data) == 1
        assert len(divorced_family.parent_child_mappings) == 2
        assert divorced_family.parent_child_mappings[0]["relationship_settings"]["has_payment_responsibility"] is True
        assert divorced_family.parent_child_mappings[1]["relationship_settings"]["has_payment_responsibility"] is False