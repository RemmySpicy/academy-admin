"""
Team service for managing program team members and roles.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.authentication.models.user import User
from app.features.authentication.models.user_program_assignment import UserProgramAssignment
from app.features.programs.models.program import Program
from app.features.common.models.enums import UserRole
from app.features.teams.schemas.team_schemas import (
    TeamMemberResponse,
    AvailableUserResponse,
    TeamStatsResponse,
    TeamSearchParams
)


class TeamService:
    """Service for team management operations."""
    
    def __init__(self):
        pass
    
    def get_team_members(
        self,
        db: Session,
        program_context: str,
        search_params: Optional[TeamSearchParams] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[TeamMemberResponse], int]:
        """Get all team members for a program with filtering and pagination."""
        
        # Base query - get users assigned to the program with program details
        query = db.query(User, UserProgramAssignment, Program).join(
            UserProgramAssignment, User.id == UserProgramAssignment.user_id
        ).join(
            Program, UserProgramAssignment.program_id == Program.id
        ).filter(
            UserProgramAssignment.program_id == program_context
        )
        
        # Apply search filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        User.full_name.ilike(search_term),
                        User.username.ilike(search_term),
                        User.email.ilike(search_term)
                    )
                )
            
            if search_params.role:
                query = query.filter(User.roles.any(search_params.role))
            
            if search_params.is_active is not None:
                query = query.filter(User.is_active == search_params.is_active)
            
            # Apply sorting
            if search_params.sort_by and search_params.sort_order:
                sort_field = getattr(User, search_params.sort_by, User.full_name)
                if search_params.sort_order.lower() == "desc":
                    query = query.order_by(desc(sort_field))
                else:
                    query = query.order_by(asc(sort_field))
        else:
            # Default sorting
            query = query.order_by(User.full_name)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        results = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        team_members = []
        for user, assignment, program in results:
            team_member = TeamMemberResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                roles=user.roles,
                primary_role=user.primary_role,
                is_active=user.is_active,
                phone=user.phone,
                profile_photo_url=user.profile_photo_url,
                last_login=user.last_login.isoformat() if user.last_login else None,
                created_at=user.created_at.isoformat(),
                updated_at=user.updated_at.isoformat(),
                program_id=str(assignment.program_id),
                program_name=program.name,
                is_default_program=assignment.is_default,
                assigned_at=assignment.assigned_at.isoformat(),
                assigned_by=str(assignment.assigned_by) if assignment.assigned_by else None
            )
            team_members.append(team_member)
        
        return team_members, total_count
    
    def add_team_member(
        self,
        db: Session,
        user_id: str,
        program_id: str,
        role: str,
        is_default_program: bool = False,
        assigned_by: Optional[str] = None
    ) -> TeamMemberResponse:
        """Add a user to the program team."""
        
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Validate program exists
        program = db.query(Program).filter(Program.id == program_id).first()
        if not program:
            raise ValueError(f"Program with id {program_id} not found")
        
        # Check if user is already assigned to this program
        existing_assignment = db.query(UserProgramAssignment).filter(
            UserProgramAssignment.user_id == user_id,
            UserProgramAssignment.program_id == program_id
        ).first()
        
        if existing_assignment:
            raise ValueError("User is already assigned to this program")
        
        # Validate role
        valid_roles = [role.value for role in UserRole]
        if role not in valid_roles:
            raise ValueError(f"Invalid role: {role}")
        
        # Add role to user if not present
        if role not in user.roles:
            user.roles = list(set(user.roles + [role]))
            # Update primary role if this is a higher priority role
            role_priority = {
                UserRole.SUPER_ADMIN.value: 1,
                UserRole.PROGRAM_ADMIN.value: 2,
                UserRole.PROGRAM_COORDINATOR.value: 3,
                UserRole.INSTRUCTOR.value: 4,
                UserRole.PARENT.value: 5,
                UserRole.STUDENT.value: 6
            }
            
            current_priority = role_priority.get(user.primary_role, 10)
            new_priority = role_priority.get(role, 10)
            
            if new_priority < current_priority:
                user.primary_role = role
        
        # Create program assignment
        assignment = UserProgramAssignment(
            user_id=user_id,
            program_id=program_id,
            is_default=is_default_program,
            assigned_by=assigned_by
        )
        
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        db.refresh(user)
        
        # Return team member response
        return TeamMemberResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            roles=user.roles,
            primary_role=user.primary_role,
            is_active=user.is_active,
            phone=user.phone,
            profile_photo_url=user.profile_photo_url,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
            program_id=str(assignment.program_id),
            program_name=program.name,
            is_default_program=assignment.is_default,
            assigned_at=assignment.assigned_at.isoformat(),
            assigned_by=str(assignment.assigned_by) if assignment.assigned_by else None
        )
    
    def update_team_member(
        self,
        db: Session,
        user_id: str,
        program_id: str,
        role: Optional[str] = None,
        is_default_program: Optional[bool] = None,
        updated_by: Optional[str] = None
    ) -> Optional[TeamMemberResponse]:
        """Update a team member's role or assignment settings."""
        
        # Get the assignment
        assignment = db.query(UserProgramAssignment).filter(
            UserProgramAssignment.user_id == user_id,
            UserProgramAssignment.program_id == program_id
        ).first()
        
        if not assignment:
            return None
        
        # Get user and program
        user = db.query(User).filter(User.id == user_id).first()
        program = db.query(Program).filter(Program.id == program_id).first()
        
        if not user or not program:
            return None
        
        # Update role if provided
        if role:
            valid_roles = [role_enum.value for role_enum in UserRole]
            if role not in valid_roles:
                raise ValueError(f"Invalid role: {role}")
            
            # Add new role to user if not present
            if role not in user.roles:
                user.roles = list(set(user.roles + [role]))
                # Update primary role if this is a higher priority role
                role_priority = {
                    UserRole.SUPER_ADMIN.value: 1,
                    UserRole.PROGRAM_ADMIN.value: 2,
                    UserRole.PROGRAM_COORDINATOR.value: 3,
                    UserRole.INSTRUCTOR.value: 4,
                    UserRole.PARENT.value: 5,
                    UserRole.STUDENT.value: 6
                }
                
                current_priority = role_priority.get(user.primary_role, 10)
                new_priority = role_priority.get(role, 10)
                
                if new_priority < current_priority:
                    user.primary_role = role
        
        # Update default program setting if provided
        if is_default_program is not None:
            assignment.is_default = is_default_program
        
        # Update timestamps
        assignment.updated_at = func.now()
        if updated_by:
            user.updated_by = updated_by
        
        db.commit()
        db.refresh(assignment)
        db.refresh(user)
        
        # Return updated team member response
        return TeamMemberResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            roles=user.roles,
            primary_role=user.primary_role,
            is_active=user.is_active,
            phone=user.phone,
            profile_photo_url=user.profile_photo_url,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
            program_id=str(assignment.program_id),
            program_name=program.name,
            is_default_program=assignment.is_default,
            assigned_at=assignment.assigned_at.isoformat(),
            assigned_by=str(assignment.assigned_by) if assignment.assigned_by else None
        )
    
    def remove_team_member(
        self,
        db: Session,
        user_id: str,
        program_id: str
    ) -> bool:
        """Remove a user from the program team."""
        
        # Get the assignment
        assignment = db.query(UserProgramAssignment).filter(
            UserProgramAssignment.user_id == user_id,
            UserProgramAssignment.program_id == program_id
        ).first()
        
        if not assignment:
            return False
        
        # Remove the assignment
        db.delete(assignment)
        db.commit()
        
        return True
    
    def get_available_users(
        self,
        db: Session,
        program_context: str,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[AvailableUserResponse], int]:
        """Get users that can be added to the team."""
        
        # Get users not already assigned to this program
        subquery = db.query(UserProgramAssignment.user_id).filter(
            UserProgramAssignment.program_id == program_context
        ).subquery()
        
        query = db.query(User).filter(
            ~User.id.in_(subquery),
            User.is_active == True
        )
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
                    User.username.ilike(search_term),
                    User.email.ilike(search_term)
                )
            )
        
        # Order by name
        query = query.order_by(User.full_name)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        users = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        available_users = []
        for user in users:
            # Check if user has any program assignments
            has_assignments = db.query(UserProgramAssignment).filter(
                UserProgramAssignment.user_id == user.id
            ).first() is not None
            
            available_user = AvailableUserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                roles=user.roles,
                primary_role=user.primary_role,
                is_active=user.is_active,
                phone=user.phone,
                profile_photo_url=user.profile_photo_url,
                already_assigned=has_assignments
            )
            available_users.append(available_user)
        
        return available_users, total_count
    
    def get_team_stats(
        self,
        db: Session,
        program_context: str
    ) -> TeamStatsResponse:
        """Get team statistics for the program."""
        
        # Get all team members
        team_members_query = db.query(User, UserProgramAssignment).join(
            UserProgramAssignment, User.id == UserProgramAssignment.user_id
        ).filter(
            UserProgramAssignment.program_id == program_context
        )
        
        team_members = team_members_query.all()
        
        total_members = len(team_members)
        active_members = len([member for member, _ in team_members if member.is_active])
        inactive_members = total_members - active_members
        
        # Count by role
        by_role = {}
        for user, _ in team_members:
            for role in user.roles:
                by_role[role] = by_role.get(role, 0) + 1
        
        # Get recent additions (last 30 days)
        recent_query = team_members_query.filter(
            UserProgramAssignment.assigned_at >= func.now() - func.interval('30 days')
        ).order_by(desc(UserProgramAssignment.assigned_at)).limit(5)
        
        recent_results = recent_query.all()
        recent_additions = []
        
        for user, assignment in recent_results:
            program = db.query(Program).filter(Program.id == assignment.program_id).first()
            recent_member = TeamMemberResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                roles=user.roles,
                primary_role=user.primary_role,
                is_active=user.is_active,
                phone=user.phone,
                profile_photo_url=user.profile_photo_url,
                last_login=user.last_login.isoformat() if user.last_login else None,
                created_at=user.created_at.isoformat(),
                updated_at=user.updated_at.isoformat(),
                program_id=str(assignment.program_id),
                program_name=program.name if program else None,
                is_default_program=assignment.is_default,
                assigned_at=assignment.assigned_at.isoformat(),
                assigned_by=str(assignment.assigned_by) if assignment.assigned_by else None
            )
            recent_additions.append(recent_member)
        
        return TeamStatsResponse(
            total_members=total_members,
            active_members=active_members,
            inactive_members=inactive_members,
            by_role=by_role,
            recent_additions=recent_additions
        )


# Create singleton instance
team_service = TeamService()