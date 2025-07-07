# Authentication System - Technical Specification

## Overview & Business Requirements

### Problem Statement
The academy management system requires secure authentication for admin users (Super Admin and Program Admin) with role-based access control. The system must support multi-program access for Program Admins while maintaining strict security boundaries.

### User Stories
- **As a Super Admin**, I want to log in and access all programs and facilities across the entire organization
- **As a Program Admin**, I want to log in and access only the programs assigned to me and their associated facilities
- **As any admin user**, I want my session to remain secure and automatically expire for security
- **As a Super Admin**, I want to manage other admin users and their program assignments

### Business Rules
- **Super Admin**: Full system access across all programs and facilities
- **Program Admin**: Access limited to assigned programs and their facilities only
- **Session Security**: JWT tokens with secure expiration and refresh mechanism
- **Password Security**: Strong password requirements with secure hashing
- **Account Security**: Account lockout after failed login attempts

## Technical Architecture

### Database Schema Requirements

#### users table
```sql
-- Core authentication entity
users:
  id: UUID (Primary Key)
  email: VARCHAR(255) UNIQUE NOT NULL
  password_hash: VARCHAR(255) NOT NULL  -- bcrypt hashed
  first_name: VARCHAR(100) NOT NULL
  last_name: VARCHAR(100) NOT NULL
  role: ENUM('super_admin', 'program_admin') NOT NULL
  is_active: BOOLEAN DEFAULT TRUE
  last_login: TIMESTAMP
  failed_login_attempts: INTEGER DEFAULT 0
  locked_until: TIMESTAMP NULL
  password_reset_token: VARCHAR(255) NULL
  password_reset_expires: TIMESTAMP NULL
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### user_program_assignments table
```sql
-- Many-to-many relationship for Program Admin access
user_program_assignments:
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key → users.id)
  program_id: UUID (Foreign Key → programs.id)
  assigned_by: UUID (Foreign Key → users.id)  -- Who made the assignment
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### user_sessions table
```sql
-- Track active user sessions for security
user_sessions:
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key → users.id)
  refresh_token_hash: VARCHAR(255) NOT NULL
  device_info: JSONB  -- Browser, OS info
  ip_address: INET
  expires_at: TIMESTAMP NOT NULL
  created_at: TIMESTAMP AUTO
  last_used: TIMESTAMP AUTO
```

### API Endpoints Specification

#### Authentication Endpoints

**POST /api/v1/auth/login**
- **Purpose**: User authentication and token generation
- **Request Validation**: Email format, password presence, rate limiting
- **Security**: Account lockout check, password verification, login attempt tracking
- **Response**: JWT access token, refresh token, user profile with permissions

**POST /api/v1/auth/refresh**
- **Purpose**: Refresh expired access tokens
- **Security**: Refresh token validation, session verification, rotation mechanism
- **Response**: New access token, updated refresh token

**POST /api/v1/auth/logout**
- **Purpose**: Invalidate user session and tokens
- **Security**: Token blacklisting, session cleanup, audit logging

**POST /api/v1/auth/forgot-password**
- **Purpose**: Initiate password reset process
- **Security**: Rate limiting, token generation, secure email delivery

**POST /api/v1/auth/reset-password**
- **Purpose**: Complete password reset with token
- **Security**: Token validation, password strength requirements, session invalidation

#### User Management Endpoints

**GET /api/v1/auth/me**
- **Purpose**: Get current user profile and permissions
- **Response**: User details, assigned programs, accessible facilities

**PUT /api/v1/auth/change-password**
- **Purpose**: Allow users to change their password
- **Security**: Current password verification, new password validation

### JWT Token Structure

#### Access Token Payload
```javascript
{
  user_id: "uuid",
  email: "admin@elitesgen.com",
  role: "super_admin" | "program_admin",
  programs: ["program_uuid1", "program_uuid2"],  // For program_admin
  facilities: ["facility_uuid1", "facility_uuid2"],  // Accessible facilities
  permissions: ["read:students", "write:enrollments", ...],
  exp: timestamp,  // 15 minutes expiration
  iat: timestamp,
  jti: "jwt_id"    // For token invalidation
}
```

#### Refresh Token Payload
```javascript
{
  user_id: "uuid",
  session_id: "session_uuid",
  exp: timestamp,  // 7 days expiration
  iat: timestamp,
  jti: "refresh_jwt_id"
}
```

## Backend Implementation Details

### Password Security Implementation
```pseudocode
// Password hashing with bcrypt
FUNCTION hash_password(plain_password):
    salt_rounds = 12
    return bcrypt.hash(plain_password, salt_rounds)

FUNCTION verify_password(plain_password, hashed_password):
    return bcrypt.verify(plain_password, hashed_password)

// Password strength validation
FUNCTION validate_password_strength(password):
    requirements = {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special_chars: true
    }
    return validate_against_requirements(password, requirements)
```

### Login Security Implementation
```pseudocode
// Account lockout mechanism
FUNCTION check_account_lockout(user):
    if user.locked_until > current_time():
        raise AccountLockedError()
    
    if user.failed_login_attempts >= 5:
        user.locked_until = current_time() + 30_minutes
        save_user(user)
        raise AccountLockedError()

// Login attempt tracking
FUNCTION track_login_attempt(user, success):
    if success:
        user.failed_login_attempts = 0
        user.locked_until = null
        user.last_login = current_time()
    else:
        user.failed_login_attempts += 1
    
    save_user(user)
```

### Session Management Implementation
```pseudocode
// Create user session
FUNCTION create_user_session(user, device_info, ip_address):
    session = {
        user_id: user.id,
        refresh_token_hash: hash_refresh_token(generate_token()),
        device_info: device_info,
        ip_address: ip_address,
        expires_at: current_time() + 7_days
    }
    return save_session(session)

// Cleanup expired sessions
FUNCTION cleanup_expired_sessions():
    delete_sessions_where(expires_at < current_time())
```

### Permission System Implementation
```pseudocode
// Calculate user permissions based on role
FUNCTION calculate_user_permissions(user):
    if user.role == "super_admin":
        return get_all_permissions()
    
    if user.role == "program_admin":
        assigned_programs = get_user_program_assignments(user.id)
        return calculate_program_permissions(assigned_programs)

// Permission checking middleware
FUNCTION check_permission(required_permission):
    user_permissions = get_current_user_permissions()
    if required_permission not in user_permissions:
        raise PermissionDeniedError()
```

## Frontend Implementation Details

### Authentication State Management (Zustand)
```pseudocode
// Authentication store structure
AuthStore = {
    user: User | null,
    tokens: {
        access_token: string | null,
        refresh_token: string | null
    },
    isAuthenticated: boolean,
    isLoading: boolean,
    
    // Actions
    login: (credentials) => Promise<void>,
    logout: () => void,
    refreshToken: () => Promise<void>,
    updateUser: (userData) => void
}
```

### Route Protection Implementation
```pseudocode
// Protected route component
FUNCTION ProtectedRoute({ children, requiredPermission }):
    auth = useAuthStore()
    
    if not auth.isAuthenticated:
        return redirect_to_login()
    
    if requiredPermission and not user_has_permission(requiredPermission):
        return show_access_denied()
    
    return render(children)

// Permission hook
FUNCTION usePermission(permission):
    auth = useAuthStore()
    return auth.user?.permissions.includes(permission) || false
```

### Login Form Implementation (shadcn/ui)
```pseudocode
// Login form with validation
LoginForm = {
    form_schema: {
        email: email_validation(),
        password: password_validation()
    },
    
    submit_handler: async (values) => {
        try:
            await auth.login(values)
            redirect_to_dashboard()
        catch LoginError:
            show_error_message()
        catch AccountLockedError:
            show_lockout_message()
    }
}
```

## UI/UX Requirements

### Login Page Design
- **Layout**: Centered card on full-screen background
- **Branding**: Elitesgen Academy logo and colors
- **Form Elements**: Email input, password input, remember me checkbox, login button
- **Security Features**: Show/hide password toggle, CAPTCHA after failed attempts
- **Error Handling**: Clear error messages for different failure scenarios
- **Loading States**: Button loading indicator during authentication

### Dashboard Integration
- **User Profile**: Display current user name, role, and avatar in sidebar
- **Program Context**: Program switcher for Program Admins (if multiple programs)
- **Session Indicator**: Show session status and auto-logout warning
- **Quick Actions**: Change password, logout options in user menu

### Form Validation & Feedback
- **Real-time Validation**: Email format, password requirements
- **Error Messages**: Specific feedback for different validation failures
- **Success Feedback**: Clear confirmation of successful operations
- **Loading States**: Form disable during submission, loading indicators

## Security Features

### Token Security
- **Short-lived Access Tokens**: 15-minute expiration for security
- **Secure Refresh Tokens**: 7-day expiration with rotation
- **Token Storage**: Secure HTTP-only cookies for refresh tokens
- **Token Invalidation**: Blacklist mechanism for logout and security events

### Session Security
- **Session Tracking**: Monitor active sessions per user
- **Device Tracking**: Record device and IP information
- **Concurrent Session Limits**: Maximum active sessions per user
- **Session Cleanup**: Automatic cleanup of expired sessions

### API Security
- **Rate Limiting**: Prevent brute force attacks on login endpoints
- **Request Validation**: Comprehensive input validation and sanitization
- **CORS Configuration**: Strict cross-origin request policies
- **Security Headers**: Implement security headers (CSP, HSTS, etc.)

## Integration Points

### Email Service Integration
- **Password Reset**: Secure email delivery for password reset links
- **Account Notifications**: Login notifications for security monitoring
- **Template System**: Reusable email templates for authentication flows

### Audit Logging
- **Authentication Events**: Log all login attempts, successes, and failures
- **Permission Changes**: Track role and program assignment modifications
- **Security Events**: Monitor suspicious activities and security violations

### Future Mobile App Preparation
- **OAuth Preparation**: Structure ready for OAuth integration
- **Role Expansion**: Framework for adding Parent, Student, Instructor roles
- **API Versioning**: Consistent API structure for mobile app integration

## Implementation Steps

### Phase 1: Core Authentication
1. Set up database schema for users and sessions
2. Implement password hashing and validation
3. Create JWT token generation and validation
4. Build login/logout API endpoints
5. Implement basic session management

### Phase 2: Security Features
1. Add account lockout mechanism
2. Implement refresh token rotation
3. Add rate limiting and security middleware
4. Create password reset functionality
5. Implement audit logging

### Phase 3: Frontend Integration
1. Create authentication state management
2. Build login page with shadcn/ui components
3. Implement route protection system
4. Add user profile and session management
5. Create password change functionality

### Phase 4: Advanced Features
1. Add device tracking and session monitoring
2. Implement concurrent session management
3. Create admin user management interface
4. Add comprehensive security logging
5. Optimize performance and security

## Testing Requirements

### Security Testing
- **Authentication Flow**: Verify login/logout functionality
- **Password Security**: Test hashing and validation
- **Token Security**: Validate JWT generation and expiration
- **Account Lockout**: Verify lockout mechanism effectiveness
- **Rate Limiting**: Test API rate limiting functionality

### Integration Testing
- **Database Integration**: Verify user and session data handling
- **Email Integration**: Test password reset email delivery
- **Frontend Integration**: End-to-end authentication flow testing

### Performance Testing
- **Login Performance**: Measure authentication response times
- **Session Cleanup**: Verify efficient session management
- **Concurrent Users**: Test multiple simultaneous authentication requests

This comprehensive authentication system provides secure, scalable user management for the academy system while preparing for future mobile app integration and maintaining strict security standards.