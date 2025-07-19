#!/usr/bin/env python3
"""
Test program context filtering in API endpoints.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException

from app.main import app
from app.features.users.models.user import UserRole


class TestProgramContextAPI:
    """Test program context filtering in API endpoints."""
    
    def setUp(self):
        """Set up test client."""
        self.client = TestClient(app)
        
        # Mock authentication tokens
        self.super_admin_token = "super-admin-token"
        self.program_admin_token = "program-admin-token"
        self.coordinator_token = "coordinator-token"
        self.tutor_token = "tutor-token"
    
    def test_courses_api_program_filtering(self):
        """Test course API respects program context filtering."""
        
        # Mock program admin user
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=program_admin):
                
                # Test with valid program context
                headers = {
                    "Authorization": f"Bearer {self.program_admin_token}",
                    "X-Program-Context": "program-1"
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                
                # Should succeed (user has access to program-1)
                assert response.status_code in [200, 404]  # 404 if no courses exist
                
                print("✓ Course API program filtering works for authorized access")
                
                # Test with invalid program context
                headers["X-Program-Context"] = "program-2"  # User not assigned
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                
                # Should fail (user doesn't have access to program-2)
                assert response.status_code == 403
                
                print("✓ Course API program filtering blocks unauthorized access")
    
    def test_students_api_program_filtering(self):
        """Test student API respects program context filtering."""
        
        # Mock coordinator user
        coordinator = {
            "id": "coordinator-id",
            "role": UserRole.PROGRAM_COORDINATOR,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=coordinator):
            with patch('app.dependencies.auth.get_current_active_user', return_value=coordinator):
                
                # Test with valid program context
                headers = {
                    "Authorization": f"Bearer {self.coordinator_token}",
                    "X-Program-Context": "program-1"
                }
                
                response = self.client.get("/api/v1/students/", headers=headers)
                
                # Should succeed (user has access to program-1)
                assert response.status_code in [200, 404]  # 404 if no students exist
                
                print("✓ Student API program filtering works for authorized access")
    
    def test_facilities_api_program_filtering(self):
        """Test facility API respects program context filtering."""
        
        # Mock tutor user
        tutor = {
            "id": "tutor-id",
            "role": UserRole.TUTOR,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=tutor):
            with patch('app.dependencies.auth.get_current_active_user', return_value=tutor):
                
                # Test with valid program context
                headers = {
                    "Authorization": f"Bearer {self.tutor_token}",
                    "X-Program-Context": "program-1"
                }
                
                response = self.client.get("/api/v1/facilities/", headers=headers)
                
                # Should succeed (user has access to program-1)
                assert response.status_code in [200, 404]  # 404 if no facilities exist
                
                print("✓ Facility API program filtering works for authorized access")
    
    def test_super_admin_bypass_functionality(self):
        """Test super admin can bypass program filtering."""
        
        # Mock super admin user
        super_admin = {
            "id": "super-admin-id",
            "role": UserRole.SUPER_ADMIN,
            "program_assignments": []
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=super_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=super_admin):
                
                # Test bypass functionality
                headers = {
                    "Authorization": f"Bearer {self.super_admin_token}",
                    "X-Bypass-Program-Filter": "true"
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                
                # Should succeed (super admin bypass)
                assert response.status_code in [200, 404]
                
                print("✓ Super admin bypass functionality works")
    
    def test_missing_program_context_handling(self):
        """Test API behavior when program context is missing."""
        
        # Mock program admin user
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=program_admin):
                
                # Test without program context header
                headers = {
                    "Authorization": f"Bearer {self.program_admin_token}"
                    # No X-Program-Context header
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                
                # Should fail (missing program context)
                assert response.status_code == 400
                
                print("✓ Missing program context handling works")
    
    def test_program_specific_data_isolation(self):
        """Test that users only see data from their assigned programs."""
        
        # This test would need actual database data to be meaningful
        # For now, we'll test the filtering logic
        
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            # Mock the service layer to verify filtering
            with patch('app.features.courses.services.course_service.list_courses') as mock_list:
                mock_list.return_value = ([], 0)  # Empty result
                
                headers = {
                    "Authorization": f"Bearer {self.program_admin_token}",
                    "X-Program-Context": "program-1"
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                
                # Verify the service was called with program context
                assert mock_list.called
                call_args = mock_list.call_args
                # The program_context should be passed to the service
                assert "program-1" in str(call_args)
                
                print("✓ Program-specific data isolation works")
    
    def test_cross_program_data_access_prevention(self):
        """Test that users cannot access data from non-assigned programs."""
        
        # Mock user assigned to program-1 only
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=program_admin):
                
                # Try to access program-2 data (not assigned)
                headers = {
                    "Authorization": f"Bearer {self.program_admin_token}",
                    "X-Program-Context": "program-2"
                }
                
                # Test multiple endpoints
                endpoints = ["/api/v1/courses/", "/api/v1/students/", "/api/v1/facilities/"]
                
                for endpoint in endpoints:
                    response = self.client.get(endpoint, headers=headers)
                    assert response.status_code == 403
                
                print("✓ Cross-program data access prevention works")


class TestRoleBasedAPIAccess:
    """Test role-based access to specific API endpoints."""
    
    def setUp(self):
        """Set up test client."""
        self.client = TestClient(app)
    
    def test_super_admin_academy_access(self):
        """Test super admin access to academy administration endpoints."""
        
        super_admin = {
            "id": "super-admin-id",
            "role": UserRole.SUPER_ADMIN,
            "program_assignments": []
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=super_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=super_admin):
                
                headers = {
                    "Authorization": "Bearer super-admin-token",
                    "X-Bypass-Program-Filter": "true"
                }
                
                # Test program management (academy admin only)
                response = self.client.get("/api/v1/programs/", headers=headers)
                assert response.status_code in [200, 404]
                
                print("✓ Super admin academy access works")
    
    def test_program_admin_restrictions(self):
        """Test program admin restrictions on academy endpoints."""
        
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=program_admin):
                
                headers = {
                    "Authorization": "Bearer program-admin-token",
                    "X-Program-Context": "program-1"
                }
                
                # Try to create a new program (should fail - only super admin)
                program_data = {
                    "name": "Test Program",
                    "description": "Test description"
                }
                
                response = self.client.post("/api/v1/programs/", headers=headers, json=program_data)
                assert response.status_code == 403
                
                print("✓ Program admin restrictions work")
    
    def test_tutor_read_only_access(self):
        """Test tutor has read-only access to most endpoints."""
        
        tutor = {
            "id": "tutor-id",
            "role": UserRole.TUTOR,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=tutor):
            with patch('app.dependencies.auth.get_current_active_user', return_value=tutor):
                
                headers = {
                    "Authorization": "Bearer tutor-token",
                    "X-Program-Context": "program-1"
                }
                
                # Test read access (should work)
                response = self.client.get("/api/v1/students/", headers=headers)
                assert response.status_code in [200, 404]
                
                # Test write access (should fail for most endpoints)
                student_data = {
                    "first_name": "Test",
                    "last_name": "Student",
                    "email": "test@example.com"
                }
                
                response = self.client.post("/api/v1/students/", headers=headers, json=student_data)
                assert response.status_code in [403, 422]  # Forbidden or validation error
                
                print("✓ Tutor read-only access restrictions work")


def run_all_tests():
    """Run all program context API tests."""
    
    print("Testing Program Context API Integration...")
    print("=" * 40)
    
    # Test program context API
    context_tests = TestProgramContextAPI()
    context_tests.setUp()
    context_tests.test_courses_api_program_filtering()
    context_tests.test_students_api_program_filtering()
    context_tests.test_facilities_api_program_filtering()
    context_tests.test_super_admin_bypass_functionality()
    context_tests.test_missing_program_context_handling()
    context_tests.test_program_specific_data_isolation()
    context_tests.test_cross_program_data_access_prevention()
    
    print("\nTesting Role-Based API Access...")
    print("=" * 30)
    
    # Test role-based API access
    role_tests = TestRoleBasedAPIAccess()
    role_tests.setUp()
    role_tests.test_super_admin_academy_access()
    role_tests.test_program_admin_restrictions()
    role_tests.test_tutor_read_only_access()
    
    print("\n🎉 All program context API tests passed!")


if __name__ == "__main__":
    run_all_tests()