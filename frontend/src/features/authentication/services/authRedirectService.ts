/**
 * Authentication Redirect Service
 * 
 * Handles role-based redirects and route protection based on user roles
 * and program access permissions.
 */

import { useProgramContext } from '@/store';

export type UserRole = 'super_admin' | 'program_admin' | 'program_coordinator' | 'tutor';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  requiresProgram?: boolean;
  description: string;
}

/**
 * Route permissions configuration
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard - All authenticated users
  {
    path: '/admin',
    allowedRoles: ['super_admin', 'program_admin', 'program_coordinator', 'tutor'],
    requiresProgram: false,
    description: 'Main dashboard'
  },

  // Program Management - All roles (but data scoped by program)
  {
    path: '/admin/students',
    allowedRoles: ['super_admin', 'program_admin', 'program_coordinator', 'tutor'],
    requiresProgram: true,
    description: 'Student management'
  },
  {
    path: '/admin/curriculum',
    allowedRoles: ['super_admin', 'program_admin', 'program_coordinator', 'tutor'],
    requiresProgram: true,
    description: 'Curriculum management'
  },
  {
    path: '/admin/scheduling',
    allowedRoles: ['super_admin', 'program_admin', 'program_coordinator', 'tutor'],
    requiresProgram: true,
    description: 'Scheduling management'
  },
  {
    path: '/admin/team',
    allowedRoles: ['super_admin', 'program_admin'],
    requiresProgram: true,
    description: 'Team management'
  },
  {
    path: '/admin/payments',
    allowedRoles: ['super_admin', 'program_admin'],
    requiresProgram: true,
    description: 'Payment management'
  },

  // Academy Administration - Super Admin Only
  {
    path: '/admin/academy',
    allowedRoles: ['super_admin'],
    requiresProgram: false,
    description: 'Academy administration'
  },
  {
    path: '/admin/academy/programs',
    allowedRoles: ['super_admin'],
    requiresProgram: false,
    description: 'Academy program management'
  },
  {
    path: '/admin/academy/locations',
    allowedRoles: ['super_admin'],
    requiresProgram: false,
    description: 'Academy location management'
  },
  {
    path: '/admin/academy/users',
    allowedRoles: ['super_admin'],
    requiresProgram: false,
    description: 'Academy user management'
  },
  {
    path: '/admin/academy/settings',
    allowedRoles: ['super_admin'],
    requiresProgram: false,
    description: 'Academy system settings'
  },

  // Personal Settings - All authenticated users
  {
    path: '/admin/settings',
    allowedRoles: ['super_admin', 'program_admin', 'program_coordinator', 'tutor'],
    requiresProgram: false,
    description: 'Personal settings'
  },
];

/**
 * Default redirect paths based on user role
 */
export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  super_admin: '/admin',
  program_admin: '/admin',
  program_coordinator: '/admin/students',
  tutor: '/admin/students',
};

/**
 * Role hierarchy for access control
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  program_admin: 3,
  program_coordinator: 2,
  tutor: 1,
};

export class AuthRedirectService {
  /**
   * Get the appropriate redirect URL after login based on user role
   */
  static getLoginRedirectUrl(user: AuthUser, intendedUrl?: string): string {
    // If there's an intended URL, check if user has access
    if (intendedUrl && this.canAccessRoute(user, intendedUrl)) {
      return intendedUrl;
    }

    // Check if user has program access for program-dependent roles
    if (this.requiresProgramAccess(user.role)) {
      const programContext = useProgramContext.getState();
      
      // If no program assigned or selected, redirect to appropriate landing
      if (!programContext.currentProgram && !programContext.availablePrograms.length) {
        if (user.role === 'super_admin') {
          return '/admin/academy/programs'; // Super admin can create programs
        } else {
          return '/admin?error=no_program_access'; // Others need program assignment
        }
      }
    }

    // Return default redirect for role
    return DEFAULT_REDIRECTS[user.role] || '/admin';
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: AuthUser, path: string): boolean {
    // Remove query parameters and hash for matching
    const cleanPath = path.split('?')[0].split('#')[0];
    
    // Find exact match or closest parent route
    const permission = this.findRoutePermission(cleanPath);
    
    if (!permission) {
      // If no specific permission found, check if it's under /admin
      if (cleanPath.startsWith('/admin')) {
        // Default admin access - all authenticated users can access basic admin routes
        return true;
      }
      return false;
    }

    // Check role permission
    if (!permission.allowedRoles.includes(user.role)) {
      return false;
    }

    // Check program requirement
    if (permission.requiresProgram && this.requiresProgramAccess(user.role)) {
      const programContext = useProgramContext.getState();
      return programContext.currentProgram !== null;
    }

    return true;
  }

  /**
   * Find route permission for a given path
   */
  static findRoutePermission(path: string): RoutePermission | null {
    // Look for exact match first
    let permission = ROUTE_PERMISSIONS.find(p => p.path === path);
    
    if (permission) {
      return permission;
    }

    // Look for parent route matches (longest match wins)
    const parentRoutes = ROUTE_PERMISSIONS
      .filter(p => path.startsWith(p.path + '/') || path.startsWith(p.path))
      .sort((a, b) => b.path.length - a.path.length);

    return parentRoutes[0] || null;
  }

  /**
   * Check if a role requires program access
   */
  static requiresProgramAccess(role: UserRole): boolean {
    return role !== 'super_admin';
  }

  /**
   * Get accessible routes for a user
   */
  static getAccessibleRoutes(user: AuthUser): RoutePermission[] {
    return ROUTE_PERMISSIONS.filter(route => 
      route.allowedRoles.includes(user.role)
    );
  }

  /**
   * Check if user has higher or equal role level than required
   */
  static hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }

  /**
   * Get unauthorized redirect path
   */
  static getUnauthorizedRedirect(user: AuthUser): string {
    return DEFAULT_REDIRECTS[user.role] || '/admin';
  }

  /**
   * Validate route transition and get redirect if needed
   */
  static validateRouteTransition(user: AuthUser, fromPath: string, toPath: string): {
    allowed: boolean;
    redirectTo?: string;
    reason?: string;
  } {
    if (!this.canAccessRoute(user, toPath)) {
      return {
        allowed: false,
        redirectTo: this.getUnauthorizedRedirect(user),
        reason: 'Insufficient permissions for this route'
      };
    }

    const permission = this.findRoutePermission(toPath);
    
    if (permission?.requiresProgram && this.requiresProgramAccess(user.role)) {
      const programContext = useProgramContext.getState();
      
      if (!programContext.currentProgram) {
        return {
          allowed: false,
          redirectTo: '/admin?error=program_required',
          reason: 'Program selection required for this route'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get role-specific navigation items
   */
  static getNavigationItems(user: AuthUser): Array<{
    path: string;
    label: string;
    description: string;
    accessible: boolean;
  }> {
    return ROUTE_PERMISSIONS.map(route => ({
      path: route.path,
      label: route.path.split('/').pop() || route.path,
      description: route.description,
      accessible: route.allowedRoles.includes(user.role)
    }));
  }
}

export default AuthRedirectService;