"""
Authentication service for handling JWT tokens and password operations.
"""

from datetime import datetime, timedelta
from typing import Optional, List

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
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, db: Session, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, db: Session, user_data: dict) -> User:
        """Create a new user."""
        # Hash password
        password_hash = self.get_password_hash(user_data["password"])
        
        # Auto-generate full_name from first_name and last_name if not provided
        if "full_name" not in user_data:
            first_name = user_data.get("first_name", "").strip()
            last_name = user_data.get("last_name", "").strip()
            
            # Generate full_name with proper spacing
            if first_name and last_name:
                full_name = f"{first_name} {last_name}"
            elif first_name:
                full_name = first_name
            elif last_name:
                full_name = last_name
            else:
                raise ValueError("Either first_name, last_name, or full_name must be provided")
        else:
            full_name = user_data["full_name"]
        
        # Create user instance
        db_user = User(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=password_hash,
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            full_name=full_name,
            salutation=user_data.get("salutation"),
            phone=user_data.get("phone"),
            date_of_birth=user_data.get("date_of_birth"),
            referral_source=user_data.get("referral_source"),
            roles=user_data.get("roles", ["program_admin"]),
            primary_role=user_data.get("role", "program_admin"),
            is_active=user_data.get("is_active", True),
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    def update_user(self, db: Session, user_id: str, user_data: dict) -> Optional[User]:
        """Update user information."""
        db_user = self.get_user_by_id(db, user_id)
        if not db_user:
            return None
        
        # Update fields that exist in the user_data
        for field, value in user_data.items():
            if hasattr(db_user, field):
                setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    def change_password(self, db: Session, user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password."""
        user = self.get_user_by_id(db, user_id)
        if not user:
            return False
        
        # Verify current password
        if not self.verify_password(current_password, user.password_hash):
            return False
        
        # Update password
        new_password_hash = self.get_password_hash(new_password)
        user.password_hash = new_password_hash
        
        db.commit()
        return True
    
    def update_last_login(self, db: Session, user_id: str) -> None:
        """Update user's last login timestamp."""
        user = self.get_user_by_id(db, user_id)
        if user:
            user.last_login = datetime.utcnow()
            db.commit()
    
    def deactivate_user(self, db: Session, user_id: str) -> bool:
        """Deactivate a user account."""
        user = self.get_user_by_id(db, user_id)
        if not user:
            return False
        
        user.is_active = False
        db.commit()
        return True
    
    def get_users(self, db: Session) -> List[User]:
        """Get all users (admin only)."""
        return db.query(User).order_by(User.created_at.desc()).all()
    
    def delete_user(self, db: Session, user_id: str) -> bool:
        """Delete a user (admin only)."""
        user = self.get_user_by_id(db, user_id)
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        return True
    
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