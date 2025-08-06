# Teams Management System

## Overview

The Teams Management System provides program-specific team member management capabilities, allowing Program Admins and Coordinators to manage their team independently within their program context.

## Key Features

### ✅ **Program-Specific Team Management**
- Manage team members within specific program context
- Completely separate from academy-wide user management
- Program context filtering enforced on all operations

### ✅ **Role-Based Team Composition**
- **Program Admin**: Full program management access
- **Program Coordinator**: Operational program support  
- **Tutor**: Teaching and student interaction
- Support for multiple roles per user

### ✅ **Team Member Operations**
- Add existing academy users to program teams
- Update team member roles and settings
- Remove team members from program
- View comprehensive team statistics

### ✅ **Advanced Team Analytics**
- Team composition by role
- Active vs inactive member counts
- Recent team additions tracking
- Program assignment statistics

## Architecture

### **Program Context Integration**
All team operations respect program boundaries:
- Users can only manage teams within their assigned programs
- All API endpoints filter data by program context
- No cross-program team access possible

### **User Program Assignment Model**
Teams functionality leverages the existing `UserProgramAssignment` model:
- Links users to specific programs with metadata
- Supports default program designation
- Tracks assignment history and assignment source

### **Role-Based Access Control**
- **Program Admin**: Full team management capabilities
- **Program Coordinator**: View team, limited edit permissions  
- **Tutor**: View team only
- **Super Admin**: Can manage all program teams

## API Endpoints

### **Team Members**
```
GET    /api/v1/teams/members              # List program team members
POST   /api/v1/teams/members              # Add user to program team
PUT    /api/v1/teams/members/{user_id}    # Update team member role/settings
DELETE /api/v1/teams/members/{user_id}    # Remove team member from program
```

### **Team Utilities**
```
GET    /api/v1/teams/available-users      # List users available to add to team
GET    /api/v1/teams/stats                # Team statistics and member counts by role
```

All endpoints require program context and apply appropriate filtering.

## Frontend Components

### **TeamManagement Component**
Main interface with three tabs:
- **Team Members**: List, search, filter, and manage team members
- **Roles & Permissions**: Overview of role capabilities and member counts
- **Assignments**: Future feature for class/student assignments

### **AddTeamMemberDialog Component**
Modal for adding new team members:
- Search existing academy users
- Select user and assign role
- Set default program designation
- Validation and error handling

### **Features**
- Real-time search and filtering
- Responsive design with loading states
- Error handling and user feedback
- Role-based UI elements and permissions

## Usage Examples

### **Adding a Team Member**
1. Navigate to Teams page (`/admin/team`)
2. Click "Add Team Member" button
3. Search for existing user by name/email
4. Select user and assign appropriate role
5. Optionally set as user's default program
6. Submit to add to team

### **Managing Team Roles**
1. View team member in Team Members tab
2. Click dropdown menu for member
3. Select "Edit Role" to change permissions
4. Or select "Remove" to remove from team

### **Viewing Team Analytics**
1. Team stats automatically displayed at top of page
2. View member counts by role in Roles tab
3. See recent additions in stats overview

## Security Considerations

### **Program Context Enforcement**
- All operations filtered by current program context
- Users cannot access other programs' teams
- Program context injected via middleware

### **Role-Based Permissions**
- Team management permissions based on user role
- Higher roles can manage lower roles
- Super Admins have override capabilities

### **Data Isolation**
- Team data completely isolated by program
- No cross-program data leakage possible
- Database-level filtering enforced

## Integration Points

### **With User Management**
- Teams page manages program assignments
- Academy Administration manages global users
- Clear separation of concerns maintained

### **With Authentication System**
- Leverages existing role-based access control
- Uses program context middleware
- Integrates with user program assignments

### **With Other Features**
- Team assignments can link to scheduling
- Team members appear in course management
- Role permissions apply across all features

## Future Enhancements

### **Team Assignments Tab**
- Assign team members to specific classes
- Manage student groups assignments
- Schedule-based team management

### **Team Communication**
- Internal team messaging
- Announcement distribution
- Task assignment and tracking

### **Advanced Analytics**
- Team performance metrics
- Workload distribution analysis
- Team collaboration insights

## Development Notes

### **Adding New Team Features**
1. Follow program context filtering requirements
2. Use existing team service patterns
3. Maintain role-based access control
4. Update documentation accordingly

### **Testing Requirements**
- Program context filtering tests mandatory
- Cross-program access prevention tests
- Role-based permission verification
- API endpoint security validation

### **Recent Fixes (2025-08-03)**
- **Authentication Object Access**: Fixed `current_user["id"]` → `current_user.id` pattern in team service methods
- **API Endpoint Stability**: Teams management endpoints now fully functional with proper authentication
- **Error Resolution**: Resolved AttributeError issues affecting team member operations

For detailed implementation standards, see [`development/DEVELOPMENT_STANDARDS.md`](../../development/DEVELOPMENT_STANDARDS.md).

## Related Documentation

- **API Reference**: [`docs/api/API_ENDPOINTS.md`](../../api/API_ENDPOINTS.md)
- **Program Context Architecture**: [`docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`](../../architecture/PROGRAM_CONTEXT_ARCHITECTURE.md)
- **Development Standards**: [`docs/development/DEVELOPMENT_STANDARDS.md`](../../development/DEVELOPMENT_STANDARDS.md)
- **Authentication System**: [`docs/features/authentication/README.md`](../authentication/README.md)