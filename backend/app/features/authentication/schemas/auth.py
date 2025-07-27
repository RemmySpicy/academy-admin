"""
Authentication schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


class LoginRequest(BaseModel):
    """Schema for login request."""
    
    username: str = Field(..., min_length=3, max_length=50, description="Username or email")
    password: str = Field(..., min_length=3, max_length=255, description="User password")
    
    class Config:
        schema_extra = {
            "example": {
                "username": "admin",
                "password": "admin123"
            }
        }


class LoginResponse(BaseModel):
    """Schema for login response."""
    
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: "UserResponse" = Field(..., description="User information")
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "username": "admin",
                    "email": "admin@academy.com",
                    "first_name": "System",
                    "last_name": "Administrator",
                    "role": "super_admin",
                    "is_active": True
                }
            }
        }


class TokenData(BaseModel):
    """Schema for token data."""
    
    username: Optional[str] = None
    scopes: list[str] = []


class UserResponse(BaseModel):
    """Schema for user response (public information)."""
    
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    role: str = Field(..., description="User role")
    is_active: bool = Field(..., description="Whether user is active")
    last_login: Optional[datetime] = Field(None, description="Last login time")
    created_at: datetime = Field(..., description="Account creation time")
    
    @property
    def full_name(self) -> str:
        """Get user's full name by combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "username": "admin",
                "email": "admin@academy.com",
                "first_name": "System",
                "last_name": "Administrator",
                "role": "super_admin",
                "is_active": True,
                "last_login": "2025-01-08T18:00:00Z",
                "created_at": "2025-01-08T12:00:00Z"
            }
        }


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=255, description="Password")
    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    salutation: Optional[str] = Field(None, max_length=10, description="User's salutation")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    date_of_birth: Optional[datetime] = Field(None, description="Date of birth")
    referral_source: Optional[str] = Field(None, max_length=100, description="How user heard about academy")
    role: str = Field(default="program_admin", description="User role")
    is_active: bool = Field(default=True, description="Whether user is active")
    
    @property
    def full_name(self) -> str:
        """Get user's full name by combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @validator("role")
    def validate_role(cls, v):
        """Validate user role."""
        allowed_roles = ["super_admin", "program_admin", "program_coordinator", "instructor", "student", "parent"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {allowed_roles}")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "username": "jdoe",
                "email": "john.doe@academy.com",
                "password": "securepassword123",
                "first_name": "John",
                "last_name": "Doe",
                "role": "program_admin",
                "is_active": True
            }
        }


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    email: Optional[EmailStr] = Field(None, description="Email address")
    first_name: Optional[str] = Field(None, min_length=1, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Last name")
    salutation: Optional[str] = Field(None, max_length=10, description="User's salutation")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    date_of_birth: Optional[datetime] = Field(None, description="Date of birth")
    referral_source: Optional[str] = Field(None, max_length=100, description="How user heard about academy")
    role: Optional[str] = Field(None, description="User role")
    is_active: Optional[bool] = Field(None, description="Whether user is active")
    
    @property
    def full_name(self) -> Optional[str]:
        """Get user's full name by combining first and last name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return None
    
    @validator("role")
    def validate_role(cls, v):
        """Validate user role."""
        if v is not None:
            allowed_roles = ["super_admin", "program_admin", "program_coordinator", "instructor", "student", "parent"]
            if v not in allowed_roles:
                raise ValueError(f"Role must be one of: {allowed_roles}")
        return v


class PasswordChangeRequest(BaseModel):
    """Schema for password change request."""
    
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, max_length=255, description="New password")
    
    class Config:
        schema_extra = {
            "example": {
                "current_password": "oldpassword123",
                "new_password": "newpassword456"
            }
        }


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    
    refresh_token: str = Field(..., description="Refresh token")
    
    class Config:
        schema_extra = {
            "example": {
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            }
        }


# Forward reference resolution
LoginResponse.model_rebuild()