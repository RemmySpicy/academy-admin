"""
Authentication routes for login, logout, and user management.
"""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.authentication.models.user import User
from app.features.authentication.schemas.auth import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    UserCreate,
    UserUpdate,
    PasswordChangeRequest,
)
from app.features.authentication.services.auth_service import auth_service
from app.features.common.models.database import get_db


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user = auth_service.get_current_user(db, token)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint for OAuth2 password flow.
    
    Accepts username/email and password, returns JWT token.
    """
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Skip updating last login for now
    
    # Create access token
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Prepare user response (exclude password)
    user_response = UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.primary_role,
        is_active=user.is_active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat(),
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=auth_service.access_token_expire_minutes * 60,
        user=user_response
    )


@router.post("/login/json", response_model=LoginResponse)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint for JSON requests.
    
    Accepts username/email and password in JSON format, returns JWT token.
    """
    user = auth_service.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Skip updating last login for now
    
    # Create access token
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Prepare user response (exclude password)
    user_response = UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.primary_role,
        is_active=user.is_active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat(),
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=auth_service.access_token_expire_minutes * 60,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Get current user information."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.primary_role,
        is_active=current_user.is_active,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
    )


@router.get("/users", response_model=list[UserResponse])
async def get_users(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    if current_user.primary_role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        users = auth_service.get_users(db)
        return [
            UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.primary_role,
                is_active=user.is_active,
                last_login=user.last_login,
                created_at=user.created_at,
            )
            for user in users
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting users: {str(e)}"
        )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Get a specific user by ID (admin only)."""
    if current_user.primary_role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        user = auth_service.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.primary_role,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user: {str(e)}"
        )


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Create a new user.
    
    Permissions:
    - Super Admin: Can create users with any role
    - Program Admin: Can create student/parent users (requires program context via X-Program-Context header)
    - Program Coordinator: Can create student/parent users (requires program context via X-Program-Context header)
    """
    # Get program context from header for non-super admin users
    from app.middleware.program_context import get_program_context
    from fastapi import Request
    from starlette.requests import Request as StarletteRequest
    
    # Check user permissions
    is_super_admin = current_user.has_role("super_admin")
    is_program_admin = current_user.has_role("program_admin")
    is_program_coordinator = current_user.has_role("program_coordinator")
    
    # Check basic permission to create users
    if not (is_super_admin or is_program_admin or is_program_coordinator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create users"
        )
    
    # Get program context from middleware if available
    program_context = None
    # Note: This endpoint doesn't have direct access to program_context dependency
    # Program admins should use the /api/v1/users endpoint instead
    
    # For non-super admins, restrict role creation
    if not is_super_admin:
        # Only allow student/parent roles for program admins
        admin_level_roles = {"super_admin", "program_admin", "program_coordinator", "tutor"}
        user_level_roles = {"student", "parent"}
        
        if hasattr(user_data, 'role') and user_data.role in admin_level_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Program admins cannot create admin-level users. Use /api/v1/users endpoint with program context."
            )
        
        # Default to student role if not specified
        if not hasattr(user_data, 'role') or not user_data.role:
            user_data.role = "student"
    
    # Check if username or email already exists
    existing_user = auth_service.get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_user = auth_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create user with proper role handling
        user_dict = user_data.dict()
        # Ensure role is set
        if 'role' not in user_dict or not user_dict['role']:
            user_dict['role'] = 'student'
        
        user = auth_service.create_user(db, user_dict)
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.primary_role,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Update user information (admin only, or own profile)."""
    # Check permissions
    if current_user.primary_role != "super_admin" and str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Non-admin users cannot change their own role
    if current_user.primary_role != "super_admin" and "role" in user_data.dict(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change your own role"
        )
    
    try:
        user = auth_service.update_user(db, user_id, user_data.dict(exclude_unset=True))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.primary_role,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)."""
    if current_user.primary_role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Don't allow deleting yourself
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        success = auth_service.delete_user(db, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )


@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Change user password."""
    success = auth_service.change_password(
        db,
        str(current_user.id),
        password_data.current_password,
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    return {"detail": "Password changed successfully"}


@router.post("/logout")
async def logout(current_user: Annotated[User, Depends(get_current_active_user)]):
    """Logout endpoint (token invalidation would be handled client-side)."""
    return {"detail": "Successfully logged out"}


# Export dependencies for use in other modules
__all__ = ["router", "get_current_user", "get_current_active_user"]