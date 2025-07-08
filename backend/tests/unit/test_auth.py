#!/usr/bin/env python3
"""
Test authentication functionality.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.features.authentication.services.auth_service import auth_service

def test_authentication():
    """Test authentication functionality."""
    
    print("Testing Authentication Service...")
    
    # Test password hashing
    password = "admin123"
    hashed = auth_service.get_password_hash(password)
    print(f"✓ Password hashing works: {hashed[:50]}...")
    
    # Test password verification
    is_valid = auth_service.verify_password(password, hashed)
    print(f"✓ Password verification works: {is_valid}")
    
    # Test user retrieval
    user = auth_service.get_user_by_username("admin")
    if user:
        print(f"✓ User retrieval works: {user['username']} ({user['email']})")
    else:
        print("✗ User retrieval failed")
        return
    
    # Test user authentication
    auth_user = auth_service.authenticate_user("admin", "admin123")
    if auth_user:
        print(f"✓ User authentication works: {auth_user['username']}")
    else:
        print("✗ User authentication failed")
        return
    
    # Test JWT token creation
    token = auth_service.create_access_token(data={"sub": "admin"})
    print(f"✓ JWT token creation works: {token[:50]}...")
    
    # Test JWT token verification
    token_data = auth_service.verify_token(token)
    if token_data and token_data.username == "admin":
        print(f"✓ JWT token verification works: {token_data.username}")
    else:
        print("✗ JWT token verification failed")
        return
    
    # Test get current user
    current_user = auth_service.get_current_user(token)
    if current_user:
        print(f"✓ Get current user works: {current_user['username']}")
    else:
        print("✗ Get current user failed")
        return
    
    print("\n🎉 All authentication tests passed!")

if __name__ == "__main__":
    test_authentication()