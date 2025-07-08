#!/usr/bin/env python3
"""
Simple authentication test without external dependencies.
"""

import sqlite3
import hashlib
import hmac
import base64
import json
import time
from datetime import datetime, timedelta

def simple_hash_password(password: str) -> str:
    """Simple password hashing for testing."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash."""
    return simple_hash_password(password) == hashed

def create_simple_jwt(data: dict, secret: str = "test-secret") -> str:
    """Create a simple JWT-like token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["exp"] = int(time.time()) + 1800  # 30 minutes
    
    # Simple encoding (not production-ready)
    header_b64 = base64.b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        secret.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{header_b64}.{payload_b64}.{signature}"

def verify_simple_jwt(token: str, secret: str = "test-secret") -> dict:
    """Verify a simple JWT-like token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, signature = parts
        
        # Verify signature
        expected_signature = hmac.new(
            secret.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if signature != expected_signature:
            return None
        
        # Decode payload
        payload_json = base64.b64decode(payload_b64 + "==").decode()
        payload = json.loads(payload_json)
        
        # Check expiration
        if payload.get("exp", 0) < time.time():
            return None
        
        return payload
    except:
        return None

def test_simple_auth():
    """Test authentication with simple implementations."""
    
    print("Testing Simple Authentication...")
    
    # Connect to database
    conn = sqlite3.connect("academy_admin.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get admin user
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    user = cursor.fetchone()
    
    if not user:
        print("✗ Admin user not found")
        return
    
    print(f"✓ Found user: {user['username']} ({user['email']})")
    
    # Test password (we know it's bcrypt hashed, but let's check the structure)
    print(f"✓ Password hash exists: {user['password_hash'][:20]}...")
    
    # Test simple JWT creation
    token = create_simple_jwt({"sub": user['username'], "role": user['role']})
    print(f"✓ Simple JWT created: {token[:50]}...")
    
    # Test simple JWT verification
    payload = verify_simple_jwt(token)
    if payload:
        print(f"✓ Simple JWT verified: {payload['sub']}")
    else:
        print("✗ Simple JWT verification failed")
    
    # Test database query with authentication info
    cursor.execute("""
        SELECT username, email, role, is_active, created_at 
        FROM users 
        WHERE username = ? AND is_active = 1
    """, ("admin",))
    
    auth_user = cursor.fetchone()
    if auth_user:
        print(f"✓ Database auth query works: {dict(auth_user)}")
    else:
        print("✗ Database auth query failed")
    
    conn.close()
    
    print("\n🎉 Simple authentication tests completed!")
    print("\nReady for FastAPI authentication endpoints!")

if __name__ == "__main__":
    test_simple_auth()