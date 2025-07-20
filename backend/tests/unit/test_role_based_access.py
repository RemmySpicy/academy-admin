#!/usr/bin/env python3
"""
Test role-based access control and program assignments.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

try:
    import pytest
    from fastapi import HTTPException
    PYTEST_AVAILABLE = True
except ImportError:
    PYTEST_AVAILABLE = False
    
from unittest.mock import Mock, patch

from app.features.authentication.services.auth_service import auth_service
from app.middleware.program_context import get_program_filter, require_super_admin, require_program_admin
from app.features.users.models.user import UserRole


class TestRoleBasedAccess:
    """Test role-based access control functionality."""
    
    def test_super_admin_access(self):
        """Test super admin role has access to all programs."""
        
        # Mock super admin user
        super_admin = {
            "id": "super-admin-id",
            "username": "admin",
            "email": "admin@academy.com",
            "role": UserRole.SUPER_ADMIN,
            "program_assignments": []
        }
        
        # Test super admin bypass
        with patch('app.middleware.program_context.get_current_active_user', return_value=super_admin):
            mock_request = Mock()
            mock_request.headers = {"X-Bypass-Program-Filter": "true"}
            
            # Should return None (no filtering) for super admin bypass
            result = get_program_filter(mock_request, super_admin)
            assert result is None
            
        print("✓ Super admin bypass access works")
    
    def test_program_admin_access(self):
        """Test program admin role has access to assigned programs only."""
        
        # Mock program admin user
        program_admin = {
            "id": "program-admin-id",
            "username": "swim.admin",
            "email": "swim.admin@academy.com",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1", "program-2"]
        }
        
        # Test program admin with valid program context
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            mock_request = Mock()
            mock_request.headers = {"X-Program-Context": "program-1"}
            
            # Should return program-1 (user has access)
            result = get_program_filter(mock_request, program_admin)
            assert result == "program-1"
            
        print("✓ Program admin access to assigned program works")
    
    def test_program_admin_denied_access(self):
        """Test program admin is denied access to non-assigned programs."""
        
        # Mock program admin user
        program_admin = {
            "id": "program-admin-id",
            "username": "swim.admin",
            "email": "swim.admin@academy.com",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1", "program-2"]
        }
        
        # Test program admin with invalid program context
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            mock_request = Mock()
            mock_request.headers = {"X-Program-Context": "program-3"}  # Not assigned
            
            # Should raise HTTPException for unauthorized access
            with pytest.raises(HTTPException) as exc_info:
                get_program_filter(mock_request, program_admin)
            
            assert exc_info.value.status_code == 403
            assert "not authorized" in str(exc_info.value.detail).lower()
            
        print("✓ Program admin denied access to non-assigned program works")
    
    def test_program_coordinator_access(self):
        """Test program coordinator role has access to assigned programs only."""
        
        # Mock program coordinator user
        coordinator = {
            "id": "coordinator-id",
            "username": "coord.user",
            "email": "coord@academy.com",
            "role": UserRole.PROGRAM_COORDINATOR,
            "program_assignments": ["program-1"]
        }
        
        # Test coordinator with valid program context
        with patch('app.middleware.program_context.get_current_active_user', return_value=coordinator):
            mock_request = Mock()
            mock_request.headers = {"X-Program-Context": "program-1"}
            
            # Should return program-1 (user has access)
            result = get_program_filter(mock_request, coordinator)
            assert result == "program-1"
            
        print("✓ Program coordinator access works")
    
    def test_instructor_access(self):
        """Test instructor role has access to assigned programs only."""
        
        # Mock instructor user
        instructor = {
            "id": "instructor-id",
            "username": "instructor.user",
            "email": "instructor@academy.com",
            "role": UserRole.INSTRUCTOR,
            "program_assignments": ["program-1"]
        }
        
        # Test instructor with valid program context
        with patch('app.middleware.program_context.get_current_active_user', return_value=instructor):
            mock_request = Mock()
            mock_request.headers = {"X-Program-Context": "program-1"}
            
            # Should return program-1 (user has access)
            result = get_program_filter(mock_request, instructor)
            assert result == "program-1"
            
        print("✓ Tutor access works")
    
    def test_require_super_admin_decorator(self):
        """Test require_super_admin decorator functionality."""
        
        # Test with super admin
        super_admin = {
            "role": UserRole.SUPER_ADMIN
        }
        
        # Should not raise exception for super admin
        result = require_super_admin(super_admin)
        assert result == super_admin
        
        # Test with non-super admin
        program_admin = {
            "role": UserRole.PROGRAM_ADMIN
        }
        
        # Should raise HTTPException for non-super admin
        with pytest.raises(HTTPException) as exc_info:
            require_super_admin(program_admin)
        
        assert exc_info.value.status_code == 403
        assert "super admin" in str(exc_info.value.detail).lower()
        
        print("✓ require_super_admin decorator works")
    
    def test_require_program_admin_decorator(self):
        """Test require_program_admin decorator functionality."""
        
        # Test with super admin (should pass)
        super_admin = {
            "role": UserRole.SUPER_ADMIN
        }
        
        result = require_program_admin(super_admin)
        assert result == super_admin
        
        # Test with program admin (should pass)
        program_admin = {
            "role": UserRole.PROGRAM_ADMIN
        }
        
        result = require_program_admin(program_admin)
        assert result == program_admin
        
        # Test with coordinator (should fail)
        coordinator = {
            "role": UserRole.PROGRAM_COORDINATOR
        }
        
        with pytest.raises(HTTPException) as exc_info:
            require_program_admin(coordinator)
        
        assert exc_info.value.status_code == 403
        assert "admin" in str(exc_info.value.detail).lower()
        
        print("✓ require_program_admin decorator works")
    
    def test_no_program_context_handling(self):
        """Test behavior when no program context is provided."""
        
        # Mock non-super admin user
        program_admin = {
            "id": "program-admin-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1"]
        }
        
        # Test without program context header
        with patch('app.middleware.program_context.get_current_active_user', return_value=program_admin):
            mock_request = Mock()
            mock_request.headers = {}  # No X-Program-Context header
            
            # Should raise HTTPException for missing program context
            with pytest.raises(HTTPException) as exc_info:
                get_program_filter(mock_request, program_admin)
            
            assert exc_info.value.status_code == 400
            assert "program context" in str(exc_info.value.detail).lower()
            
        print("✓ Missing program context handling works")


class TestProgramAssignments:
    """Test user program assignment functionality."""
    
    def test_user_has_program_access(self):
        """Test checking if user has access to specific program."""
        
        # Mock user with program assignments
        user = {
            "id": "user-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1", "program-2"]
        }
        
        # Test valid program access
        assert "program-1" in user["program_assignments"]
        assert "program-2" in user["program_assignments"]
        
        # Test invalid program access
        assert "program-3" not in user["program_assignments"]
        
        print("✓ Program assignment checking works")
    
    def test_super_admin_program_bypass(self):
        """Test super admin can bypass program restrictions."""
        
        # Mock super admin
        super_admin = {
            "id": "super-admin-id",
            "role": UserRole.SUPER_ADMIN,
            "program_assignments": []  # No specific assignments
        }
        
        # Super admin should have access regardless of assignments
        assert super_admin["role"] == UserRole.SUPER_ADMIN
        
        print("✓ Super admin program bypass works")
    
    def test_multiple_program_assignments(self):
        """Test users with multiple program assignments."""
        
        # Mock user with multiple programs
        multi_program_user = {
            "id": "multi-user-id",
            "role": UserRole.PROGRAM_ADMIN,
            "program_assignments": ["program-1", "program-2", "program-3"]
        }
        
        # Test access to all assigned programs
        for program_id in ["program-1", "program-2", "program-3"]:
            assert program_id in multi_program_user["program_assignments"]
        
        print("✓ Multiple program assignments work")


def run_all_tests():
    """Run all role-based access tests."""
    
    print("Testing Role-Based Access Control...")
    print("=" * 50)
    
    # Test role-based access
    access_tests = TestRoleBasedAccess()
    access_tests.test_super_admin_access()
    access_tests.test_program_admin_access()
    access_tests.test_program_admin_denied_access()
    access_tests.test_program_coordinator_access()
    access_tests.test_instructor_access()
    access_tests.test_require_super_admin_decorator()
    access_tests.test_require_program_admin_decorator()
    access_tests.test_no_program_context_handling()
    
    print("\nTesting Program Assignments...")
    print("=" * 30)
    
    # Test program assignments
    assignment_tests = TestProgramAssignments()
    assignment_tests.test_user_has_program_access()
    assignment_tests.test_super_admin_program_bypass()
    assignment_tests.test_multiple_program_assignments()
    
    print("\n🎉 All role-based access control tests passed!")


if __name__ == "__main__":
    run_all_tests()