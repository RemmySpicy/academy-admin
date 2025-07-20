"""
Team management schemas for request/response validation.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TeamMemberResponse(BaseModel):
    """Response schema for team member information."""
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    full_name: str = Field(..., description="Full name")
    roles: List[str] = Field(..., description="User roles")
    primary_role: str = Field(..., description="Primary role")
    is_active: bool = Field(..., description="Whether user is active")
    phone: Optional[str] = Field(None, description="Phone number")
    profile_photo_url: Optional[str] = Field(None, description="Profile photo URL")
    last_login: Optional[str] = Field(None, description="Last login datetime")
    created_at: str = Field(..., description="Account creation datetime")
    updated_at: str = Field(..., description="Last update datetime")
    
    # Program assignment specific fields
    program_id: str = Field(..., description="Program ID")
    program_name: Optional[str] = Field(None, description="Program name")
    is_default_program: bool = Field(..., description="Whether this is user's default program")
    assigned_at: str = Field(..., description="When assigned to program")
    assigned_by: Optional[str] = Field(None, description="Who assigned user to program")


class AddTeamMemberRequest(BaseModel):
    """Request schema for adding a team member."""
    user_id: str = Field(..., description="User ID to add to team")
    role: str = Field(..., description="Role to assign in the program")
    is_default_program: bool = Field(False, description="Set as user's default program")


class UpdateTeamMemberRequest(BaseModel):
    """Request schema for updating a team member."""
    role: Optional[str] = Field(None, description="New role for the team member")
    is_default_program: Optional[bool] = Field(None, description="Update default program setting")


class AvailableUserResponse(BaseModel):
    """Response schema for users available to be added to team."""
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    full_name: str = Field(..., description="Full name")
    roles: List[str] = Field(..., description="User roles")
    primary_role: str = Field(..., description="Primary role")
    is_active: bool = Field(..., description="Whether user is active")
    phone: Optional[str] = Field(None, description="Phone number")
    profile_photo_url: Optional[str] = Field(None, description="Profile photo URL")
    already_assigned: bool = Field(..., description="Whether user is already assigned to any program")


class TeamStatsResponse(BaseModel):
    """Response schema for team statistics."""
    total_members: int = Field(..., description="Total team members")
    active_members: int = Field(..., description="Active team members")
    inactive_members: int = Field(..., description="Inactive team members")
    by_role: dict = Field(..., description="Count of members by role")
    recent_additions: List[TeamMemberResponse] = Field(..., description="Recently added team members")


class TeamMemberListResponse(BaseModel):
    """Response schema for paginated team member list."""
    items: List[TeamMemberResponse] = Field(..., description="List of team members")
    total: int = Field(..., description="Total number of team members")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")


class AvailableUserListResponse(BaseModel):
    """Response schema for paginated available users list."""
    items: List[AvailableUserResponse] = Field(..., description="List of available users")
    total: int = Field(..., description="Total number of available users")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")


class TeamSearchParams(BaseModel):
    """Search parameters for team members."""
    search: Optional[str] = Field(None, description="Search query for name, username, or email")
    role: Optional[str] = Field(None, description="Filter by role")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    sort_by: Optional[str] = Field("full_name", description="Sort field")
    sort_order: Optional[str] = Field("asc", description="Sort order (asc/desc)")