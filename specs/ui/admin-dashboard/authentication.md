# Authentication UI Specification

## Interface Overview

The authentication system provides secure login functionality and user management interfaces for the Academy Admin system. It includes role-based access control, user profile management, and administrative user management tools for Super Admins.

## User Flow

### Login Flow
1. User accesses admin dashboard
2. Redirected to login page if not authenticated
3. User enters email and password
4. System validates credentials
5. User redirected to dashboard with appropriate role access
6. Session established with automatic refresh

### User Management Flow (Super Admin)
1. Super Admin accesses user management
2. Views list of all system users
3. Can create new Program Admin accounts
4. Can edit existing user profiles
5. Can assign users to programs/locations
6. Can deactivate/reactivate user accounts

### Profile Management Flow
1. User accesses profile from header menu
2. Views personal profile information
3. Can update contact information
4. Can change password
5. Can view activity history
6. Can manage notification preferences

## Layout Specifications

### Login Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│                     Academy Admin                          │
│                                                             │
│              ┌─────────────────────────────┐               │
│              │                             │               │
│              │        Login Form           │               │
│              │                             │               │
│              │  Email: [____________]      │               │
│              │  Password: [____________]   │               │
│              │                             │               │
│              │  [x] Remember me            │               │
│              │                             │               │
│              │     [Login Button]          │               │
│              │                             │               │
│              │   Forgot Password?          │               │
│              │                             │               │
│              └─────────────────────────────┘               │
│                                                             │
│                   System Status                             │
└─────────────────────────────────────────────────────────────┘
```

### User Management Layout
```
┌─────────────────────────────────────────────────────────────┐
│ User Management                    [+ Add User]             │
├─────────────────────────────────────────────────────────────┤
│ Search: [____________] | Filter: [All Roles ▼] | Sort: [▼]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name           │ Email          │ Role  │ Status │ Acts │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ John Smith     │ john@email.com │ Admin │ Active │ •••  │ │
│ │ Jane Doe       │ jane@email.com │ Admin │ Active │ •••  │ │
│ │ Bob Johnson    │ bob@email.com  │ Admin │ Inactive│ •••  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Pagination Controls]                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Specifications

### Login Form Component
```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

#### Login Form Elements
1. **Email Input**
   - Type: email
   - Validation: Required, valid email format
   - Placeholder: "Enter your email"
   - Auto-complete: email

2. **Password Input**
   - Type: password
   - Validation: Required, minimum 8 characters
   - Placeholder: "Enter your password"
   - Show/hide toggle button

3. **Remember Me Checkbox**
   - Optional persistent login
   - Extends session duration
   - Clear label and description

4. **Login Button**
   - Full width
   - Loading state with spinner
   - Disabled during submission

5. **Forgot Password Link**
   - Link to password reset flow
   - Styled as secondary text

#### Form Validation
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional()
});
```

### Password Reset Form
```typescript
interface PasswordResetProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  success?: boolean;
  error?: string;
}
```

#### Reset Flow Components
1. **Request Reset Form**
   - Email input
   - Submit button
   - Back to login link

2. **Reset Success Message**
   - Confirmation message
   - Instructions for next steps
   - Resend link option

3. **New Password Form**
   - New password input
   - Confirm password input
   - Password strength indicator
   - Submit button

### User Management Table
```typescript
interface UserManagementProps {
  users: User[];
  onCreateUser: (user: CreateUserInput) => Promise<void>;
  onUpdateUser: (id: string, updates: UpdateUserInput) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  loading?: boolean;
  currentUser: User;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'program_admin';
  isActive: boolean;
  lastLogin?: Date;
  programs?: Program[];
  locations?: Location[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Table Columns
1. **Name Column**
   - Full name (firstName + lastName)
   - Profile avatar/initials
   - Click to view details

2. **Email Column**
   - Email address
   - Verified status indicator
   - Click to copy email

3. **Role Column**
   - Role badge with color coding
   - Super Admin: primary color
   - Program Admin: secondary color

4. **Status Column**
   - Active/Inactive status badge
   - Last login timestamp
   - Account creation date

5. **Actions Column**
   - Edit user button
   - Deactivate/Activate toggle
   - Delete user button (with confirmation)
   - View assignments button

### Create/Edit User Modal
```typescript
interface UserModalProps {
  user?: User;
  programs: Program[];
  locations: Location[];
  onSave: (user: UserInput) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'program_admin';
  programIds?: string[];
  locationIds?: string[];
  isActive: boolean;
}
```

#### Modal Form Sections
1. **Personal Information**
   - First name (required)
   - Last name (required)
   - Email (required, unique)

2. **Role & Permissions**
   - Role selection (Super Admin/Program Admin)
   - Program assignments (multi-select)
   - Location assignments (multi-select)

3. **Account Settings**
   - Active/Inactive status
   - Password reset option
   - Force password change on next login

### User Profile Component
```typescript
interface UserProfileProps {
  user: User;
  onUpdate: (updates: ProfileUpdateInput) => Promise<void>;
  onChangePassword: (passwordData: PasswordChangeInput) => Promise<void>;
}

interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  notificationPreferences?: NotificationPreferences;
}

interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

#### Profile Form Sections
1. **Personal Information Tab**
   - Editable name fields
   - Email address
   - Profile photo upload
   - Contact information

2. **Security Tab**
   - Change password form
   - Two-factor authentication setup
   - Active sessions management
   - Login history

3. **Preferences Tab**
   - Notification settings
   - Language preferences
   - Timezone settings
   - Theme preferences

4. **Activity Tab**
   - Recent login history
   - Recent actions performed
   - Account changes log

## Data Table Design

### User Management Table
```typescript
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback>
            {row.original.firstName[0]}{row.original.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === 'super_admin' ? 'default' : 'secondary'}>
        {row.original.role === 'super_admin' ? 'Super Admin' : 'Program Admin'}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {row.original.lastLogin && (
          <span className="text-sm text-muted-foreground">
            Last login: {formatDistanceToNow(row.original.lastLogin)} ago
          </span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editUser(row.original)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => viewAssignments(row.original)}>
            <Users className="h-4 w-4 mr-2" />
            View Assignments
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => toggleUserStatus(row.original)}
            className={row.original.isActive ? 'text-warning' : 'text-success'}
          >
            {row.original.isActive ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => deleteUser(row.original)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
```

### Table Features
1. **Search & Filter**
   - Global search across all columns
   - Role-based filtering
   - Status filtering (Active/Inactive)
   - Date range filtering

2. **Sorting**
   - Name (alphabetical)
   - Role (hierarchical)
   - Status (active first)
   - Last login (most recent first)

3. **Selection**
   - Checkbox selection for bulk actions
   - Select all/none functionality
   - Bulk activate/deactivate
   - Bulk delete (with confirmation)

## Form Validation & Error Handling

### Login Form Validation
```typescript
const loginValidation = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters"
    }
  }
};
```

### User Creation Validation
```typescript
const userCreationValidation = {
  firstName: {
    required: "First name is required",
    maxLength: {
      value: 50,
      message: "First name cannot exceed 50 characters"
    }
  },
  lastName: {
    required: "Last name is required",
    maxLength: {
      value: 50,
      message: "Last name cannot exceed 50 characters"
    }
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    },
    validate: {
      unique: async (email: string) => {
        const exists = await checkEmailExists(email);
        return !exists || "Email address is already in use";
      }
    }
  },
  role: {
    required: "Role selection is required"
  }
};
```

### Password Validation
```typescript
const passwordValidation = {
  currentPassword: {
    required: "Current password is required"
  },
  newPassword: {
    required: "New password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters"
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: "Password must contain uppercase, lowercase, number, and special character"
    }
  },
  confirmPassword: {
    required: "Password confirmation is required",
    validate: {
      match: (value: string, { newPassword }: any) => 
        value === newPassword || "Passwords do not match"
    }
  }
};
```

## Status Indicators & Color Coding

### User Status Badges
```typescript
const statusConfig = {
  active: {
    variant: 'success',
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  inactive: {
    variant: 'secondary',
    label: 'Inactive',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  pending: {
    variant: 'warning',
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  suspended: {
    variant: 'destructive',
    label: 'Suspended',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
};
```

### Role Badges
```typescript
const roleConfig = {
  super_admin: {
    variant: 'default',
    label: 'Super Admin',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: Shield
  },
  program_admin: {
    variant: 'secondary',
    label: 'Program Admin',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: User
  }
};
```

## Responsive Behavior

### Desktop (≥1024px)
- **Login Form**: Centered card with side branding
- **User Table**: Full table with all columns
- **Modal Forms**: Standard modal dialogs
- **Profile**: Tabbed interface with sidebar

### Tablet (768px - 1023px)
- **Login Form**: Centered card, full width
- **User Table**: Responsive table with column hiding
- **Modal Forms**: Full-width modals
- **Profile**: Stacked tab navigation

### Mobile (<768px)
- **Login Form**: Full-screen form
- **User Table**: Card-based layout instead of table
- **Modal Forms**: Full-screen modals
- **Profile**: Accordion-style sections

## Accessibility Requirements

### Keyboard Navigation
```typescript
// Login form keyboard handling
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
};

// Focus management for modals
useEffect(() => {
  if (isOpen) {
    const focusableElements = modal.current?.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements?.[0]?.focus();
  }
}, [isOpen]);
```

### Screen Reader Support
```typescript
// ARIA labels and descriptions
<form aria-labelledby="login-title" aria-describedby="login-description">
  <h1 id="login-title">Administrator Login</h1>
  <p id="login-description">
    Enter your credentials to access the admin dashboard
  </p>
  
  <label htmlFor="email" className="sr-only">Email Address</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={errors.email ? 'true' : 'false'}
  />
  {errors.email && (
    <div id="email-error" role="alert" aria-live="polite">
      {errors.email.message}
    </div>
  )}
</form>
```

### Color Contrast
- **Text on Background**: 4.5:1 minimum contrast ratio
- **Interactive Elements**: 3:1 minimum contrast ratio
- **Status Indicators**: Color + text/icon combinations
- **Error Messages**: High contrast red text

## Security Considerations

### Password Security
- **Password Strength**: Visual indicator with requirements
- **Password Masking**: Toggle show/hide functionality
- **Auto-complete**: Appropriate HTML attributes
- **No Storage**: Never store passwords in local storage

### Session Management
- **Token Storage**: Secure HTTP-only cookies
- **Session Timeout**: Automatic logout after inactivity
- **Concurrent Sessions**: Limit active sessions per user
- **Remember Me**: Extended session with secure tokens

### Form Security
- **CSRF Protection**: Anti-forgery tokens
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: Prevent brute force attacks
- **Secure Headers**: Content Security Policy

## Testing Requirements

### Unit Tests
- **Form Validation**: Test all validation rules
- **Component Rendering**: Test UI components
- **User Interactions**: Test click handlers
- **Error Handling**: Test error states

### Integration Tests
- **Login Flow**: Complete authentication flow
- **User Management**: CRUD operations
- **Role-based Access**: Permission testing
- **Password Reset**: Full reset workflow

### Accessibility Tests
- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader**: ARIA labels and descriptions
- **Color Contrast**: Automated contrast testing
- **Form Labels**: Proper form labeling

### Security Tests
- **Authentication**: Valid/invalid credentials
- **Authorization**: Role-based access control
- **Session Management**: Token handling
- **Input Validation**: XSS and injection prevention

## Implementation Notes

### State Management
```typescript
// Authentication state with Zustand
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  logout: () => {
    authService.logout();
    set({ user: null, error: null });
  },
  refreshToken: async () => {
    try {
      const user = await authService.refreshToken();
      set({ user });
    } catch (error) {
      set({ user: null, error: error.message });
    }
  }
}));
```

### Route Protection
```typescript
// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'program_admin';
}) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

### API Integration
```typescript
// Authentication service
class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return response.json();
  }
  
  async refreshToken(): Promise<User> {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    return response.json();
  }
  
  logout(): void {
    fetch('/api/v1/auth/logout', { method: 'POST' });
  }
}
```