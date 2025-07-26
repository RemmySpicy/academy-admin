"""
Organization Inheritance and Conflict Resolution Service

This service manages how organization settings, payments, and access controls
are inherited by members and resolves conflicts when users belong to multiple organizations.
"""

from typing import List, Optional, Dict, Any, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from decimal import Decimal
from enum import Enum
import logging

from app.core.database import get_db
from app.features.organizations.models import Organization, OrganizationMembership
from app.features.organizations.services.organization_service import OrganizationService
from app.features.users.models import UserProgramAssignment
from app.core.exceptions import ValidationError, BusinessLogicError

logger = logging.getLogger(__name__)


class InheritancePriority(str, Enum):
    """Priority levels for inheritance resolution."""
    HIGHEST = "highest"      # Organization admin override
    HIGH = "high"           # Sponsored/primary organization
    MEDIUM = "medium"       # Regular membership
    LOW = "low"            # Secondary memberships
    LOWEST = "lowest"      # Default/fallback


class ConflictResolutionStrategy(str, Enum):
    """Strategies for resolving conflicts between organizations."""
    HIGHEST_PRIORITY = "highest_priority"    # Use highest priority organization
    MOST_BENEFICIAL = "most_beneficial"      # Use most beneficial setting for user
    EXPLICIT_OVERRIDE = "explicit_override"  # Use explicitly set overrides
    AGGREGATE = "aggregate"                  # Combine benefits from all organizations


class PaymentResponsibility(str, Enum):
    """Who is responsible for payment."""
    ORGANIZATION = "organization"    # Organization pays
    USER = "user"                   # User pays
    SHARED = "shared"              # Split between organization and user
    PARENT = "parent"              # Parent pays (for children)


class OrganizationInheritanceService:
    """Service for managing organization inheritance and conflict resolution."""
    
    def __init__(self, db: Session):
        self.db = db
        self.organization_service = OrganizationService(db)

    def get_effective_settings(
        self,
        user_id: str,
        program_id: str,
        setting_type: str = None
    ) -> Dict[str, Any]:
        """
        Get effective settings for a user after inheritance and conflict resolution.
        
        Args:
            user_id: User ID
            program_id: Program context
            setting_type: Specific setting type to retrieve (optional)
            
        Returns:
            Dictionary of effective settings
        """
        try:
            # Get all organization memberships for user in program
            memberships = self._get_user_memberships(user_id, program_id)
            
            if not memberships:
                return self._get_default_settings(setting_type)
            
            # Get settings from all organizations
            organization_settings = []
            for membership in memberships:
                org_settings = self._get_organization_settings(membership, setting_type)
                organization_settings.append(org_settings)
            
            # Resolve conflicts and inherit settings
            effective_settings = self._resolve_setting_conflicts(
                organization_settings, memberships, setting_type
            )
            
            logger.info(f"Resolved effective settings for user {user_id} in program {program_id}")
            return effective_settings
            
        except Exception as e:
            logger.error(f"Error getting effective settings for user {user_id}: {str(e)}")
            raise

    def get_payment_responsibility(
        self,
        user_id: str,
        program_id: str,
        service_type: str = "tuition"
    ) -> Dict[str, Any]:
        """
        Determine who is responsible for payment and calculate amounts.
        
        Args:
            user_id: User ID
            program_id: Program context
            service_type: Type of service (tuition, materials, events, etc.)
            
        Returns:
            Payment responsibility details
        """
        try:
            memberships = self._get_user_memberships(user_id, program_id)
            
            payment_info = {
                'responsibility': PaymentResponsibility.USER,
                'primary_organization': None,
                'organization_portion': Decimal('0'),
                'user_portion': Decimal('100'),  # Percentage
                'total_discount': Decimal('0'),
                'overrides': [],
                'sponsoring_organizations': []
            }
            
            if not memberships:
                return payment_info
            
            # Prioritize memberships
            prioritized_memberships = self._prioritize_memberships(memberships)
            
            # Find the best payment arrangement
            for membership in prioritized_memberships:
                payment_override = self._get_payment_override(membership, service_type)
                
                if payment_override:
                    if payment_override.get('full_sponsorship', False):
                        # Full sponsorship - organization pays everything
                        payment_info.update({
                            'responsibility': PaymentResponsibility.ORGANIZATION,
                            'primary_organization': membership.organization_id,
                            'organization_portion': Decimal('100'),
                            'user_portion': Decimal('0')
                        })
                        break
                    
                    elif payment_override.get('partial_sponsorship'):
                        # Partial sponsorship
                        org_percentage = Decimal(str(payment_override['partial_sponsorship']))
                        user_percentage = Decimal('100') - org_percentage
                        
                        if org_percentage > payment_info['organization_portion']:
                            payment_info.update({
                                'responsibility': PaymentResponsibility.SHARED,
                                'primary_organization': membership.organization_id,
                                'organization_portion': org_percentage,
                                'user_portion': user_percentage
                            })
                    
                    elif payment_override.get('discount_percentage'):
                        # Discount only
                        discount = Decimal(str(payment_override['discount_percentage']))
                        if discount > payment_info['total_discount']:
                            payment_info['total_discount'] = discount
                
                # Track all sponsoring organizations
                if payment_override and (
                    payment_override.get('full_sponsorship') or 
                    payment_override.get('partial_sponsorship') or 
                    payment_override.get('discount_percentage')
                ):
                    payment_info['sponsoring_organizations'].append({
                        'organization_id': membership.organization_id,
                        'organization_name': membership.organization.name,
                        'override': payment_override
                    })
            
            # Check for parent responsibility (for profile_only users)
            if payment_info['responsibility'] == PaymentResponsibility.USER:
                payment_info = self._check_parent_responsibility(
                    user_id, program_id, payment_info
                )
            
            logger.info(f"Determined payment responsibility for user {user_id}: {payment_info['responsibility']}")
            return payment_info
            
        except Exception as e:
            logger.error(f"Error determining payment responsibility for user {user_id}: {str(e)}")
            raise

    def get_access_permissions(
        self,
        user_id: str,
        program_id: str
    ) -> Dict[str, Any]:
        """
        Get effective access permissions from organization memberships.
        
        Args:
            user_id: User ID
            program_id: Program context
            
        Returns:
            Access permissions dictionary
        """
        try:
            memberships = self._get_user_memberships(user_id, program_id)
            
            permissions = {
                'facility_access': [],
                'schedule_flexibility': False,
                'priority_booking': False,
                'extended_hours': False,
                'special_programs': [],
                'equipment_access': [],
                'instructor_preferences': [],
                'custom_curriculum': False,
                'assessment_frequency': 'standard',
                'reporting_level': 'basic'
            }
            
            if not memberships:
                return permissions
            
            # Aggregate permissions from all organizations (most permissive wins)
            for membership in memberships:
                org_permissions = self._get_organization_permissions(membership)
                permissions = self._merge_permissions(permissions, org_permissions)
            
            logger.info(f"Retrieved access permissions for user {user_id}")
            return permissions
            
        except Exception as e:
            logger.error(f"Error getting access permissions for user {user_id}: {str(e)}")
            raise

    def resolve_scheduling_conflicts(
        self,
        user_id: str,
        program_id: str,
        requested_schedule: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Resolve scheduling conflicts based on organization priorities.
        
        Args:
            user_id: User ID
            program_id: Program context
            requested_schedule: Requested schedule details
            
        Returns:
            Resolved schedule with conflict information
        """
        try:
            memberships = self._get_user_memberships(user_id, program_id)
            
            schedule_resolution = {
                'approved_schedule': requested_schedule.copy(),
                'conflicts': [],
                'recommendations': [],
                'priority_level': 'standard',
                'flexibility_options': []
            }
            
            if not memberships:
                return schedule_resolution
            
            # Check organization-specific scheduling rules
            highest_priority_membership = self._get_highest_priority_membership(memberships)
            
            if highest_priority_membership:
                org_schedule_rules = self._get_organization_schedule_rules(highest_priority_membership)
                
                if org_schedule_rules:
                    schedule_resolution = self._apply_schedule_rules(
                        schedule_resolution, org_schedule_rules, highest_priority_membership
                    )
            
            logger.info(f"Resolved scheduling conflicts for user {user_id}")
            return schedule_resolution
            
        except Exception as e:
            logger.error(f"Error resolving scheduling conflicts for user {user_id}: {str(e)}")
            raise

    def validate_organization_membership(
        self,
        user_id: str,
        organization_id: str,
        program_id: str,
        membership_data: Dict[str, Any]
    ) -> Dict[str, List[str]]:
        """
        Validate organization membership for conflicts and requirements.
        
        Args:
            user_id: User ID
            organization_id: Organization ID
            program_id: Program context
            membership_data: Proposed membership data
            
        Returns:
            Validation errors by field
        """
        errors = {}
        
        try:
            # Check for existing conflicting memberships
            existing_memberships = self._get_user_memberships(user_id, program_id)
            
            for membership in existing_memberships:
                if membership.organization_id == organization_id:
                    errors['organization'] = ['User already has membership in this organization']
                    break
                
                # Check for conflicting organization types
                conflicts = self._check_organization_conflicts(
                    membership.organization, organization_id
                )
                if conflicts:
                    if 'organization' not in errors:
                        errors['organization'] = []
                    errors['organization'].extend(conflicts)
            
            # Validate membership type compatibility
            membership_type = membership_data.get('membership_type')
            user_roles = self._get_user_roles(user_id, program_id)
            
            if membership_type == 'sponsored_student' and 'student' not in user_roles:
                errors['membership_type'] = ['Sponsored student membership requires student role']
            
            if membership_type == 'parent_member' and 'parent' not in user_roles:
                errors['membership_type'] = ['Parent membership requires parent role']
            
            # Validate organization capacity
            organization = self.organization_service.get_organization(organization_id, program_id)
            if organization:
                capacity_errors = self._check_organization_capacity(organization, membership_data)
                if capacity_errors:
                    errors['capacity'] = capacity_errors
            
            return errors
            
        except Exception as e:
            logger.error(f"Error validating organization membership: {str(e)}")
            return {'general': [f'Validation error: {str(e)}']}

    def _get_user_memberships(self, user_id: str, program_id: str) -> List[OrganizationMembership]:
        """Get all active organization memberships for a user in a program."""
        return self.db.query(OrganizationMembership).filter(
            and_(
                OrganizationMembership.user_id == user_id,
                OrganizationMembership.program_id == program_id,
                OrganizationMembership.status == 'active'
            )
        ).all()

    def _prioritize_memberships(
        self, 
        memberships: List[OrganizationMembership]
    ) -> List[OrganizationMembership]:
        """Prioritize memberships for conflict resolution."""
        def get_priority_score(membership):
            score = 0
            
            # Sponsored memberships get higher priority
            if membership.is_sponsored:
                score += 100
            
            # Primary memberships get priority
            if membership.is_primary:
                score += 50
            
            # Admin memberships get priority
            if membership.membership_type in ['organization_admin', 'partner_admin']:
                score += 30
            
            # Parent memberships over student memberships
            if membership.membership_type == 'parent_member':
                score += 20
            
            # More recent memberships get slight priority
            if membership.created_at:
                score += (membership.created_at.timestamp() / 1000000)  # Small boost for recency
            
            return score
        
        return sorted(memberships, key=get_priority_score, reverse=True)

    def _get_highest_priority_membership(
        self, 
        memberships: List[OrganizationMembership]
    ) -> Optional[OrganizationMembership]:
        """Get the highest priority membership."""
        prioritized = self._prioritize_memberships(memberships)
        return prioritized[0] if prioritized else None

    def _get_organization_settings(
        self, 
        membership: OrganizationMembership, 
        setting_type: str = None
    ) -> Dict[str, Any]:
        """Get organization settings for a membership."""
        settings = {
            'organization_id': membership.organization_id,
            'membership_type': membership.membership_type,
            'priority': self._get_membership_priority(membership),
            'settings': {}
        }
        
        # Get organization configuration
        org = membership.organization
        if org and org.configuration:
            org_config = org.configuration if isinstance(org.configuration, dict) else {}
            
            if setting_type:
                settings['settings'] = org_config.get(setting_type, {})
            else:
                settings['settings'] = org_config
        
        # Apply membership-specific overrides
        if membership.configuration:
            membership_config = membership.configuration if isinstance(membership.configuration, dict) else {}
            settings['settings'].update(membership_config)
        
        return settings

    def _get_membership_priority(self, membership: OrganizationMembership) -> InheritancePriority:
        """Determine priority level for a membership."""
        if membership.membership_type in ['organization_admin', 'partner_admin']:
            return InheritancePriority.HIGHEST
        elif membership.is_sponsored or membership.is_primary:
            return InheritancePriority.HIGH
        elif membership.membership_type == 'parent_member':
            return InheritancePriority.MEDIUM
        else:
            return InheritancePriority.LOW

    def _resolve_setting_conflicts(
        self,
        organization_settings: List[Dict[str, Any]],
        memberships: List[OrganizationMembership],
        setting_type: str = None
    ) -> Dict[str, Any]:
        """Resolve conflicts between organization settings."""
        if not organization_settings:
            return self._get_default_settings(setting_type)
        
        # Sort by priority
        sorted_settings = sorted(
            organization_settings,
            key=lambda x: self._priority_order(x['priority']),
            reverse=True
        )
        
        # Start with highest priority settings
        effective_settings = sorted_settings[0]['settings'].copy()
        
        # Apply conflict resolution strategies
        for settings in sorted_settings[1:]:
            effective_settings = self._merge_settings(
                effective_settings, 
                settings['settings'],
                ConflictResolutionStrategy.MOST_BENEFICIAL
            )
        
        return effective_settings

    def _priority_order(self, priority: InheritancePriority) -> int:
        """Get numeric order for priority comparison."""
        order = {
            InheritancePriority.HIGHEST: 5,
            InheritancePriority.HIGH: 4,
            InheritancePriority.MEDIUM: 3,
            InheritancePriority.LOW: 2,
            InheritancePriority.LOWEST: 1
        }
        return order.get(priority, 0)

    def _merge_settings(
        self,
        current_settings: Dict[str, Any],
        new_settings: Dict[str, Any],
        strategy: ConflictResolutionStrategy
    ) -> Dict[str, Any]:
        """Merge settings using specified strategy."""
        merged = current_settings.copy()
        
        for key, value in new_settings.items():
            if key not in merged:
                merged[key] = value
            else:
                # Apply conflict resolution strategy
                if strategy == ConflictResolutionStrategy.MOST_BENEFICIAL:
                    merged[key] = self._choose_most_beneficial(merged[key], value, key)
                elif strategy == ConflictResolutionStrategy.HIGHEST_PRIORITY:
                    # Keep current (higher priority)
                    pass
                elif strategy == ConflictResolutionStrategy.AGGREGATE:
                    merged[key] = self._aggregate_values(merged[key], value, key)
        
        return merged

    def _choose_most_beneficial(self, current_value: Any, new_value: Any, key: str) -> Any:
        """Choose the most beneficial value for the user."""
        # For boolean permissions, True is more beneficial
        if isinstance(current_value, bool) and isinstance(new_value, bool):
            return current_value or new_value
        
        # For numeric discounts/benefits, higher is better
        if key in ['discount_percentage', 'credit_amount', 'priority_level']:
            try:
                return max(float(current_value), float(new_value))
            except (ValueError, TypeError):
                return current_value
        
        # For lists, combine unique values
        if isinstance(current_value, list) and isinstance(new_value, list):
            return list(set(current_value + new_value))
        
        # Default: keep current value
        return current_value

    def _aggregate_values(self, current_value: Any, new_value: Any, key: str) -> Any:
        """Aggregate values from multiple organizations."""
        # For lists, combine
        if isinstance(current_value, list) and isinstance(new_value, list):
            return list(set(current_value + new_value))
        
        # For numeric values, sum (with limits)
        if key in ['credit_amount', 'discount_amount']:
            try:
                total = float(current_value) + float(new_value)
                # Cap at reasonable limits
                return min(total, 100.0 if 'percentage' in key else float('inf'))
            except (ValueError, TypeError):
                return current_value
        
        # For boolean, OR operation
        if isinstance(current_value, bool) and isinstance(new_value, bool):
            return current_value or new_value
        
        return current_value

    def _get_payment_override(
        self, 
        membership: OrganizationMembership, 
        service_type: str
    ) -> Optional[Dict[str, Any]]:
        """Get payment override for a specific service type."""
        if not membership.payment_override:
            return None
        
        payment_config = membership.payment_override
        if isinstance(payment_config, dict):
            return payment_config.get(service_type, payment_config.get('default'))
        
        return None

    def _check_parent_responsibility(
        self,
        user_id: str,
        program_id: str,
        payment_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if payment responsibility should fall to parent."""
        # Get user's profile type
        from app.features.users.services.user_service import UserService
        user_service = UserService(self.db)
        
        user = user_service.get_user(user_id)
        if user and user.profile_type == 'profile_only':
            # For profile-only users (children), check for parent relationships
            parent_relationships = user_service.get_child_parents_relationships(user_id, program_id)
            
            if parent_relationships:
                # Find primary contact parent
                primary_parent = next(
                    (rel for rel in parent_relationships if rel.is_primary_contact),
                    parent_relationships[0]  # Default to first parent
                )
                
                payment_info.update({
                    'responsibility': PaymentResponsibility.PARENT,
                    'responsible_parent_id': primary_parent.parent_id
                })
        
        return payment_info

    def _get_default_settings(self, setting_type: str = None) -> Dict[str, Any]:
        """Get default settings when no organization memberships exist."""
        defaults = {
            'payment': {
                'responsibility': 'user',
                'discount_percentage': 0,
                'payment_plan_available': True
            },
            'access': {
                'facility_access': ['standard'],
                'schedule_flexibility': False,
                'priority_booking': False
            },
            'curriculum': {
                'custom_curriculum': False,
                'assessment_frequency': 'standard'
            }
        }
        
        return defaults.get(setting_type, defaults) if setting_type else defaults

    def _get_organization_permissions(self, membership: OrganizationMembership) -> Dict[str, Any]:
        """Get permissions from organization membership."""
        # Extract permissions from organization and membership configuration
        permissions = {}
        
        if membership.organization and membership.organization.configuration:
            org_config = membership.organization.configuration
            if isinstance(org_config, dict):
                permissions.update(org_config.get('permissions', {}))
        
        if membership.configuration:
            membership_config = membership.configuration
            if isinstance(membership_config, dict):
                permissions.update(membership_config.get('permissions', {}))
        
        return permissions

    def _merge_permissions(
        self, 
        current_permissions: Dict[str, Any], 
        new_permissions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Merge permissions (most permissive wins)."""
        merged = current_permissions.copy()
        
        for key, value in new_permissions.items():
            if key not in merged:
                merged[key] = value
            else:
                if isinstance(value, bool) and isinstance(merged[key], bool):
                    merged[key] = merged[key] or value
                elif isinstance(value, list) and isinstance(merged[key], list):
                    merged[key] = list(set(merged[key] + value))
                elif key in ['assessment_frequency', 'reporting_level']:
                    # For these, take the more advanced option
                    levels = {
                        'basic': 1, 'standard': 2, 'advanced': 3, 'premium': 4
                    }
                    current_level = levels.get(merged[key], 1)
                    new_level = levels.get(value, 1)
                    if new_level > current_level:
                        merged[key] = value
        
        return merged

    def _get_user_roles(self, user_id: str, program_id: str) -> List[str]:
        """Get user's roles in a program."""
        assignment = self.db.query(UserProgramAssignment).filter(
            and_(
                UserProgramAssignment.user_id == user_id,
                UserProgramAssignment.program_id == program_id
            )
        ).first()
        
        return assignment.roles if assignment else []

    def _check_organization_conflicts(
        self, 
        existing_org: Organization, 
        new_org_id: str
    ) -> List[str]:
        """Check for conflicts between organizations."""
        conflicts = []
        
        new_org = self.organization_service.get_organization(new_org_id, existing_org.program_id)
        if not new_org:
            return conflicts
        
        # Check for exclusive organization types
        if (existing_org.organization_type == 'competitor' and 
            new_org.organization_type == 'competitor'):
            conflicts.append('Cannot belong to multiple competitor organizations')
        
        # Check for conflicting terms
        if (existing_org.configuration and new_org.configuration and
            isinstance(existing_org.configuration, dict) and 
            isinstance(new_org.configuration, dict)):
            
            existing_exclusions = existing_org.configuration.get('exclusions', [])
            if new_org_id in existing_exclusions:
                conflicts.append(f'Organization {existing_org.name} excludes membership in {new_org.name}')
        
        return conflicts

    def _check_organization_capacity(
        self, 
        organization: Organization, 
        membership_data: Dict[str, Any]
    ) -> List[str]:
        """Check if organization has capacity for new membership."""
        capacity_errors = []
        
        if organization.configuration and isinstance(organization.configuration, dict):
            capacity_config = organization.configuration.get('capacity', {})
            
            if capacity_config:
                membership_type = membership_data.get('membership_type')
                max_members = capacity_config.get(f'max_{membership_type}', capacity_config.get('max_total'))
                
                if max_members:
                    current_count = self.db.query(OrganizationMembership).filter(
                        and_(
                            OrganizationMembership.organization_id == organization.id,
                            OrganizationMembership.membership_type == membership_type,
                            OrganizationMembership.status == 'active'
                        )
                    ).count()
                    
                    if current_count >= max_members:
                        capacity_errors.append(f'Organization at capacity for {membership_type} memberships')
        
        return capacity_errors

    def _get_organization_schedule_rules(self, membership: OrganizationMembership) -> Dict[str, Any]:
        """Get organization-specific scheduling rules."""
        if membership.organization and membership.organization.configuration:
            config = membership.organization.configuration
            if isinstance(config, dict):
                return config.get('scheduling', {})
        return {}

    def _apply_schedule_rules(
        self,
        schedule_resolution: Dict[str, Any],
        schedule_rules: Dict[str, Any],
        membership: OrganizationMembership
    ) -> Dict[str, Any]:
        """Apply organization schedule rules to resolve conflicts."""
        # Priority booking
        if schedule_rules.get('priority_booking', False):
            schedule_resolution['priority_level'] = 'high'
        
        # Schedule flexibility
        if schedule_rules.get('flexible_scheduling', False):
            schedule_resolution['flexibility_options'].extend([
                'reschedule_without_penalty',
                'multi_location_access',
                'extended_booking_window'
            ])
        
        # Time restrictions
        if 'restricted_hours' in schedule_rules:
            restricted = schedule_rules['restricted_hours']
            # Apply restrictions to approved schedule
            # Implementation depends on schedule format
        
        return schedule_resolution


# Dependency injection function
def get_organization_inheritance_service(db: Session = None) -> OrganizationInheritanceService:
    """Get OrganizationInheritanceService instance."""
    if db is None:
        db = next(get_db())
    return OrganizationInheritanceService(db)