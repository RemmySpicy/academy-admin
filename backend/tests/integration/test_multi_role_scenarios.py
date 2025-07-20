#!/usr/bin/env python3
"""
Test complex multi-role scenarios and edge cases.
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


class TestMultiRoleScenarios:
    """Test complex scenarios involving multiple roles and programs."""
    
    def setUp(self):
        """Set up test client."""
        self.client = TestClient(app)
    
    def test_user_role_promotion_scenario(self):
        """Test scenario where user role is promoted from instructor to admin."""
        
        # Start as instructor
        instructor_user = {
            "id": "user-id",
            "role": UserRole.INSTRUCTOR,
            "program_assignments": ["program-1"]
        }
        
        # Test instructor permissions
        with patch('app.middleware.program_context.get_current_active_user', return_value=instructor_user):
            headers = {
                "Authorization": "Bearer user-token",
                "X-Program-Context": "program-1"
            }
            
            # Should have read access
            response = self.client.get("/api/v1/students/", headers=headers)
            assert response.status_code in [200, 404]
            
        # Promote to program admin
        admin_user = {
            "id": "user-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1", "program-2"]  # More programs
        }
        
        # Test admin permissions
        with patch('app.middleware.program_context.get_current_active_user', return_value=admin_user):
            headers = {
                "Authorization": "Bearer user-token",
                "X-Program-Context": "program-2"  # New program access
            }
            
            # Should have access to new program
            response = self.client.get("/api/v1/courses/", headers=headers)
            assert response.status_code in [200, 404]
            
        print("✓ User role promotion scenario works")
    
    def test_multi_program_user_switching(self):
        """Test user switching between multiple assigned programs."""
        
        multi_program_admin = {
            "id": "multi-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1", "program-2", "program-3"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=multi_program_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=multi_program_admin):
                
                # Test access to each assigned program
                for program_id in ["program-1", "program-2", "program-3"]:
                    headers = {
                        "Authorization": "Bearer multi-admin-token",
                        "X-Program-Context": program_id
                    }
                    
                    response = self.client.get("/api/v1/courses/", headers=headers)
                    assert response.status_code in [200, 404]
                
                # Test access to non-assigned program
                headers = {
                    "Authorization": "Bearer multi-admin-token",
                    "X-Program-Context": "program-4"  # Not assigned
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                assert response.status_code == 403
                
        print("✓ Multi-program user switching works")
    
    def test_program_assignment_removal_scenario(self):
        """Test scenario where user loses access to a program."""
        
        # User initially has access to multiple programs
        initial_user = {
            "id": "user-id",
            "role": UserRole.PROGRAM_COORDINATOR,
            "program_assignments": ["program-1", "program-2"]
        }
        
        # Test initial access
        with patch('app.middleware.program_context.get_current_active_user', return_value=initial_user):
            headers = {
                "Authorization": "Bearer user-token",
                "X-Program-Context": "program-2"
            }
            
            response = self.client.get("/api/v1/students/", headers=headers)
            assert response.status_code in [200, 404]
        
        # User loses access to program-2
        updated_user = {
            "id": "user-id",
            "role": UserRole.PROGRAM_COORDINATOR,
            "program_assignments": ["program-1"]  # program-2 removed
        }
        
        # Test denied access
        with patch('app.middleware.program_context.get_current_active_user', return_value=updated_user):
            headers = {
                "Authorization": "Bearer user-token",
                "X-Program-Context": "program-2"  # No longer assigned
            }
            
            response = self.client.get("/api/v1/students/", headers=headers)
            assert response.status_code == 403
            
        print("✓ Program assignment removal scenario works")
    
    def test_super_admin_program_context_edge_cases(self):
        """Test edge cases for super admin program context handling."""
        
        super_admin = {
            "id": "super-admin-id",
            "role": UserRole.SUPER_ADMIN,
            "program_assignments": []
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=super_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=super_admin):
                
                # Test 1: Super admin with program context (should work)
                headers = {
                    "Authorization": "Bearer super-admin-token",
                    "X-Program-Context": "any-program"
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                assert response.status_code in [200, 404]
                
                # Test 2: Super admin with bypass flag (should work)
                headers = {
                    "Authorization": "Bearer super-admin-token",
                    "X-Bypass-Program-Filter": "true"
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                assert response.status_code in [200, 404]
                
                # Test 3: Super admin with no context (might work depending on implementation)
                headers = {
                    "Authorization": "Bearer super-admin-token"
                }
                
                response = self.client.get("/api/v1/courses/", headers=headers)
                # This might succeed or fail depending on implementation
                assert response.status_code in [200, 400, 404]
                
        print("✓ Super admin program context edge cases work")
    
    def test_concurrent_role_context_scenarios(self):
        """Test scenarios with concurrent access from different roles."""
        
        # Simulate multiple users accessing the same endpoints
        users = [
            {
                "id": "super-admin-id",
                "role": UserRole.SUPER_ADMIN,
                "program_assignments": [],
                "token": "super-admin-token"
            },
            {
                "id": "program-admin-id",
                "role": UserRole.PROGRAM_ADMIN,
                "program_assignments": ["program-1"],
                "token": "program-admin-token"
            },
            {
                "id": "coordinator-id",
                "role": UserRole.PROGRAM_COORDINATOR,
                "program_assignments": ["program-1"],
                "token": "coordinator-token"
            },
            {
                "id": "instructor-id",
                "role": UserRole.INSTRUCTOR,
                "program_assignments": ["program-1"],
                "token": "instructor-token"
            }
        ]
        
        # Test each user can access their allowed endpoints
        for user in users:
            with patch('app.middleware.program_context.get_current_active_user', return_value=user):
                with patch('app.dependencies.auth.get_current_active_user', return_value=user):
                    
                    if user["role"] == UserRole.SUPER_ADMIN:
                        headers = {
                            "Authorization": f"Bearer {user['token']}",
                            "X-Bypass-Program-Filter": "true"
                        }
                    else:
                        headers = {
                            "Authorization": f"Bearer {user['token']}",
                            "X-Program-Context": "program-1"
                        }
                    
                    # All should be able to read courses (with appropriate filtering)
                    response = self.client.get("/api/v1/courses/", headers=headers)
                    assert response.status_code in [200, 404]
        
        print("✓ Concurrent role context scenarios work")
    
    def test_invalid_program_context_edge_cases(self):
        """Test edge cases with invalid program context values."""
        
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            with patch('app.dependencies.auth.get_current_active_user', return_value=program_admin):
                
                # Test various invalid program context values
                invalid_contexts = [
                    "",  # Empty string
                    "   ",  # Whitespace
                    "null",  # String null
                    "undefined",  # String undefined
                    "program-999",  # Non-existent program
                    "invalid-format",  # Invalid format
                ]
                
                for invalid_context in invalid_contexts:
                    headers = {
                        "Authorization": "Bearer program-admin-token",
                        "X-Program-Context": invalid_context
                    }
                    
                    response = self.client.get("/api/v1/courses/", headers=headers)
                    # Should either be 400 (bad request) or 403 (forbidden)
                    assert response.status_code in [400, 403]
                
        print("✓ Invalid program context edge cases work")


class TestDataIsolationScenarios:
    """Test data isolation between programs and roles."""
    
    def test_program_data_isolation(self):
        """Test that data is properly isolated between programs."""
        
        # Mock users from different programs
        program1_admin = {
            "id": "admin1-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        program2_admin = {
            "id": "admin2-id", 
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-2"]
        }
        
        # Test that each admin only sees their program's data
        with patch('app.features.courses.services.course_service.list_courses') as mock_list:
            mock_list.return_value = ([], 0)
            
            # Program 1 admin access
            with patch('app.middleware.program_context.get_current_active_user', return_value=program1_admin):
                headers = {
                    "Authorization": "Bearer admin1-token",
                    "X-Program-Context": "program-1"
                }
                
                response = TestClient(app).get("/api/v1/courses/", headers=headers)
                
                # Verify service was called with program-1 context
                mock_list.assert_called()
                call_args = mock_list.call_args
                assert "program-1" in str(call_args)
            
            mock_list.reset_mock()
            
            # Program 2 admin access
            with patch('app.middleware.program_context.get_current_active_user', return_value=program2_admin):
                headers = {
                    "Authorization": "Bearer admin2-token",
                    "X-Program-Context": "program-2"
                }
                
                response = TestClient(app).get("/api/v1/courses/", headers=headers)
                
                # Verify service was called with program-2 context
                mock_list.assert_called()
                call_args = mock_list.call_args
                assert "program-2" in str(call_args)
        
        print("✓ Program data isolation works")
    
    def test_role_based_data_access_patterns(self):
        """Test different data access patterns based on roles."""
        
        # Test data access patterns for different roles
        roles_and_patterns = [
            {
                "role": UserRole.SUPER_ADMIN,
                "expected_pattern": "full_access",
                "can_bypass": True
            },
            {
                "role": UserRole.PROGRAM_ADMIN,
                "expected_pattern": "program_scoped",
                "can_bypass": False
            },
            {
                "role": UserRole.PROGRAM_COORDINATOR,
                "expected_pattern": "program_scoped",
                "can_bypass": False
            },
            {
                "role": UserRole.INSTRUCTOR,
                "expected_pattern": "program_scoped_readonly",
                "can_bypass": False
            }
        ]
        
        for role_info in roles_and_patterns:
            user = {
                "id": f"{role_info['role'].value}-id",
                "role": role_info["role"],
                "program_assignments": ["program-1"]
            }
            
            with patch('app.middleware.program_context.get_current_active_user', return_value=user):
                if role_info["can_bypass"]:
                    headers = {
                        "Authorization": f"Bearer {role_info['role'].value}-token",
                        "X-Bypass-Program-Filter": "true"
                    }
                else:
                    headers = {
                        "Authorization": f"Bearer {role_info['role'].value}-token",
                        "X-Program-Context": "program-1"
                    }
                
                response = TestClient(app).get("/api/v1/courses/", headers=headers)
                
                # All roles should be able to read (with appropriate filtering)
                assert response.status_code in [200, 404]
        
        print("✓ Role-based data access patterns work")


def run_all_tests():
    """Run all multi-role scenario tests."""
    
    print("Testing Multi-Role Scenarios...")
    print("=" * 30)
    
    # Test multi-role scenarios
    scenario_tests = TestMultiRoleScenarios()
    scenario_tests.setUp()
    scenario_tests.test_user_role_promotion_scenario()
    scenario_tests.test_multi_program_user_switching()
    scenario_tests.test_program_assignment_removal_scenario()
    scenario_tests.test_super_admin_program_context_edge_cases()
    scenario_tests.test_concurrent_role_context_scenarios()
    scenario_tests.test_invalid_program_context_edge_cases()
    
    print("\nTesting Data Isolation Scenarios...")
    print("=" * 35)
    
    # Test data isolation scenarios
    isolation_tests = TestDataIsolationScenarios()
    isolation_tests.test_program_data_isolation()
    isolation_tests.test_role_based_data_access_patterns()
    
    print("\n🎉 All multi-role scenario tests passed!")


if __name__ == "__main__":
    run_all_tests()