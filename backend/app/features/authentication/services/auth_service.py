"""
Authentication service for handling JWT tokens and password operations.
"""

from datetime import datetime, timedelta
from typing import Optional

import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.authentication.models.user import User
from app.features.authentication.schemas.auth import TokenData, UserResponse
from app.features.common.models.database import get_db


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password."""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            if username is None:
                return None
            token_data = TokenData(username=username)
            return token_data
        except jwt.PyJWTError:
            return None
    
    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate a user with username/password."""
        user = self.get_user_by_username(db, username)
        if not user:
            return None
        if not self.verify_password(password, user.password_hash):
            return None
        return user
    
    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """Get user by username or email."""
        return db.query(User).filter(
            (User.username == username) | (User.email == username)
        ).first()
    
    def get_user_by_id(self, db: Session, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, user_data: dict) -> dict:
        """Create a new user."""
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        # Generate UUID for user ID
        import uuid
        user_id = str(uuid.uuid4())
        
        # Hash password
        password_hash = self.get_password_hash(user_data["password"])
        
        # Insert user
        cursor.execute('''
            INSERT INTO users (
                id, username, email, password_hash, full_name, role, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            user_data["username"],
            user_data["email"],
            password_hash,
            user_data["full_name"],
            user_data.get("role", "user"),
            user_data.get("is_active", True)
        ))
        
        conn.commit()
        conn.close()
        
        # Return created user (without password)
        return self.get_user_by_id(user_id)
    
    def update_user(self, user_id: str, user_data: dict) -> Optional[dict]:
        """Update user information."""
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        for field in ["username", "email", "full_name", "role", "is_active"]:
            if field in user_data:
                update_fields.append(f"{field} = ?")
                values.append(user_data[field])
        
        if not update_fields:
            return self.get_user_by_id(user_id)
        
        # Add updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(user_id)
        
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(query, values)
        
        conn.commit()
        conn.close()
        
        return self.get_user_by_id(user_id)
    
    def change_password(self, user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password."""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        # Verify current password
        if not self.verify_password(current_password, user["password_hash"]):
            return False
        
        # Update password
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        new_password_hash = self.get_password_hash(new_password)
        cursor.execute(
            "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_password_hash, user_id)
        )
        
        conn.commit()
        conn.close()
        
        return True
    
    def update_last_login(self, user_id: str) -> None:
        """Update user's last login timestamp."""
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
            (user_id,)
        )
        
        conn.commit()
        conn.close()
    
    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate a user account."""
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (user_id,)
        )
        
        affected_rows = cursor.rowcount
        conn.commit()
        conn.close()
        
        return affected_rows > 0
    
    def get_users(self) -> list:
        """Get all users (admin only)."""
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, full_name, role, is_active, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        ''')
        
        users = []
        for row in cursor.fetchall():
            users.append({
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "full_name": row[3],
                "role": row[4],
                "is_active": bool(row[5]),
                "created_at": row[6],
                "updated_at": row[7]
            })
        
        conn.close()
        return users
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user (admin only)."""
        conn = sqlite3.connect("academy_admin.db")
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if cursor.fetchone() is None:
            conn.close()
            return False
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        affected_rows = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return affected_rows > 0
    
    def get_current_user(self, db: Session, token: str) -> Optional[User]:
        """Get current user from JWT token."""
        token_data = self.verify_token(token)
        if token_data is None:
            return None
        
        user = self.get_user_by_username(db, token_data.username)
        if user is None:
            return None
        
        return user


# Global instance
auth_service = AuthService()