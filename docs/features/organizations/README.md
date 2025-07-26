# Organization Management System

**Complete partner organization system with multi-tenant capabilities, payment overrides, and family structure management.**

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Usage Examples](#usage-examples)
- [Development Guide](#development-guide)

## Overview

The Organization Management System enables the Academy Admin platform to manage partner organizations that can:

- **Sponsor student enrollments** with custom payment arrangements
- **Manage member relationships** across multiple programs
- **Override payment responsibilities** for their members
- **Control course access** with organization-specific rules
- **Maintain complex family structures** with parent-child relationships

### Key Benefits

- **Multi-tenant Support**: Organizations can manage their own sponsored students
- **Flexible Payment Models**: Full sponsorship, partial coverage, or custom pricing
- **Family Structure Management**: Parent-child relationships with payment responsibility tracking
- **Program Context Integration**: All operations respect program-specific boundaries
- **Role-based Access Control**: Different permission levels for organization admins

## Architecture

### Core Components

```
Organization Management System
├── Database Models
│   ├── Organization (partner companies, schools, etc.)
│   ├── OrganizationMembership (user-organization relationships)
│   └── UserRelationship (parent-child family structures)
├── Services
│   ├── Partner Admin Service (organization management)
│   ├── Payment Override Service (financial calculations)
│   ├── Access Override Service (course access control)
│   └── Atomic Creation Service (multi-profile operations)
├── API Endpoints
│   ├── /api/v1/organizations/ (CRUD operations)
│   ├── /api/v1/payment-overrides/ (payment calculations)
│   └── /api/v1/partner-auth/ (partner admin authentication)
└── Frontend Components
    ├── Partner Dashboard (organization management interface)
    ├── Reusable Form Components (search and select)
    └── Student/Parent Creation Forms (enhanced workflows)
```

### Integration Points

- **User Management**: Enhanced user profiles with `full_user` vs `profile_only` types
- **Program Context**: All operations filtered by program assignments
- **Authentication**: Extended JWT system with organization context
- **Payment System**: Override calculations based on organization memberships

## Core Features

### 1. Partner Organization Management

Organizations represent partner entities that can sponsor students:

```typescript
interface Organization {
  id: string;
  name: string;
  description?: string;
  
  // Contact Information
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Address
  address_line1?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Configuration
  status: OrganizationStatus;
  payment_overrides?: Record<string, any>;
  program_permissions?: Record<string, any>;
  
  // Relationships
  memberships: OrganizationMembership[];
}
```

**Organization Types:**
- **Corporate Partners**: Companies sponsoring employee children
- **Educational Institutions**: Schools with bulk enrollment arrangements
- **Community Organizations**: Non-profits with special pricing
- **Government Agencies**: Municipal or state-sponsored programs

### 2. Organization Membership System

Links users to organizations with specific roles and permissions:

```typescript
interface OrganizationMembership {
  id: string;
  user_id: string;
  organization_id: string;
  program_id: string;
  
  // Membership Details
  membership_type: MembershipType; // sponsored, affiliate, partner
  is_sponsored: boolean;
  
  // Payment Configuration
  custom_pricing?: Record<string, any>;
  override_permissions?: Record<string, any>;
  
  // Membership Period
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
}
```

**Membership Types:**
- **Sponsored**: Organization pays for member's enrollment
- **Affiliate**: Member gets discounted rates
- **Partner**: Administrative access to organization features

### 3. Payment Override System

Calculates payment responsibility based on organization sponsorships:

```typescript
interface PaymentCalculation {
  payer_type: 'student' | 'parent' | 'organization' | 'mixed';
  primary_payer_id: string;
  payment_breakdown: PaymentBreakdownItem[];
  total_amount: Decimal;
  discounts_applied: string[];
  override_reason: string;
}

interface PaymentBreakdownItem {
  payer_id: string;
  payer_type: string;
  payer_name: string;
  amount: Decimal;
  percentage: number;
  reason: string;
}
```

**Payment Scenarios:**
- **Full Sponsorship**: Organization pays 100% of enrollment fees
- **Partial Sponsorship**: Organization pays percentage, remainder to parent/student
- **Custom Pricing**: Fixed amounts or special rates per organization
- **Mixed Responsibility**: Multiple payers with different percentages

### 4. Family Structure Management

Parent-child relationships with payment responsibility tracking:

```typescript
interface UserRelationship {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  relationship_type: RelationshipType;
  
  // Payment Configuration
  has_payment_responsibility: boolean;
  payment_percentage?: number;
  
  // Status
  is_active: boolean;
  start_date: Date;
  end_date?: Date;
}
```

**Relationship Types:**
- **Parent**: Legal guardian with full responsibility
- **Guardian**: Assigned guardian with specific permissions
- **Emergency Contact**: Contact person without payment responsibility
- **Authorized Pickup**: Person authorized to collect child

### 5. Access Control System

Organization-based course access overrides:

```typescript
interface CourseAccessRule {
  organization_id: string;
  granted_courses: string[]; // Course IDs with special access
  restricted_courses: string[]; // Course IDs with blocked access
  access_type: 'granted' | 'restricted' | 'default';
  reason: string;
}
```

## Database Schema

### Organizations Table

```sql
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Contact Information
    contact_name VARCHAR(200),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    
    -- Configuration
    status organizationstatus NOT NULL DEFAULT 'active',
    payment_overrides JSONB,
    program_permissions JSONB,
    notes TEXT,
    
    -- Additional
    website VARCHAR(255),
    logo_url VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);
```

### Organization Memberships Table

```sql
CREATE TABLE organization_memberships (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id VARCHAR(36) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Membership Details
    membership_type membershiptype NOT NULL DEFAULT 'sponsored',
    is_sponsored BOOLEAN NOT NULL DEFAULT true,
    
    -- Configuration
    custom_pricing JSONB,
    override_permissions JSONB,
    notes VARCHAR(500),
    
    -- Period
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, organization_id, program_id)
);
```

### User Relationships Table

```sql
CREATE TABLE user_relationships (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    parent_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id VARCHAR(36) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Relationship Details
    relationship_type relationshiptype NOT NULL DEFAULT 'parent',
    has_payment_responsibility BOOLEAN NOT NULL DEFAULT true,
    payment_percentage DECIMAL(5,2),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    
    -- Constraints
    UNIQUE(parent_user_id, child_user_id, program_id),
    CHECK (parent_user_id != child_user_id)
);
```

### Enhanced Users Table

```sql
-- Enhanced users table with profile types
ALTER TABLE users ADD COLUMN profile_type profiletype NOT NULL DEFAULT 'FULL_USER';

-- Profile types: FULL_USER (can login) vs PROFILE_ONLY (children)
CREATE TYPE profiletype AS ENUM ('FULL_USER', 'PROFILE_ONLY');

-- Check constraint for profile type logic
ALTER TABLE users ADD CONSTRAINT check_profile_credentials CHECK (
    (profile_type = 'FULL_USER' AND email IS NOT NULL AND password_hash IS NOT NULL AND username IS NOT NULL) 
    OR 
    (profile_type = 'PROFILE_ONLY')
);
```

## API Endpoints

### Organization Management

```typescript
// Organization CRUD
GET    /api/v1/organizations/                    // List organizations
POST   /api/v1/organizations/                    // Create organization
GET    /api/v1/organizations/{id}                // Get organization
PUT    /api/v1/organizations/{id}                // Update organization
DELETE /api/v1/organizations/{id}                // Delete organization

// Organization Members
GET    /api/v1/organizations/{id}/members        // List members
POST   /api/v1/organizations/{id}/members        // Add member
DELETE /api/v1/organizations/{id}/members/{user_id} // Remove member

// Organization Statistics
GET    /api/v1/organizations/{id}/stats          // Get organization statistics
GET    /api/v1/organizations/{id}/dashboard      // Dashboard data
```

### Payment Override System

```typescript
// Payment Calculations
POST   /api/v1/payment-overrides/calculate-payment     // Calculate payment responsibility
POST   /api/v1/payment-overrides/apply-payment-overrides // Apply overrides
GET    /api/v1/payment-overrides/student/{id}/payment-status // Get payment status

// Access Control
POST   /api/v1/payment-overrides/check-course-access   // Check course access
GET    /api/v1/payment-overrides/organization/{id}/course-overrides // Get access rules

// Bulk Operations
GET    /api/v1/payment-overrides/students/payment-overrides // List students with overrides
GET    /api/v1/payment-overrides/organizations/with-overrides // List organizations with overrides
```

### User Relationships

```typescript
// Family Relationships
GET    /api/v1/users/{id}/family                // Get family structure
POST   /api/v1/users/relationships              // Create relationship
PUT    /api/v1/users/relationships/{id}         // Update relationship
DELETE /api/v1/users/relationships/{id}         // Delete relationship

// Enhanced User Creation
POST   /api/v1/users/student-parent             // Create parent with child
POST   /api/v1/users/enrollments                // Enroll user in course
```

### Partner Authentication

```typescript
// Partner Admin Access
POST   /api/v1/partner-auth/create-admin        // Create partner admin
POST   /api/v1/partner-auth/login               // Partner admin login
GET    /api/v1/partner-auth/organizations       // Get admin's organizations
```

## Frontend Components

### 1. Reusable Form Components

#### PersonSearchAndSelect
```typescript
interface PersonSearchAndSelectProps {
  onSelect: (person: UserSearchResult) => void;
  searchType: 'all' | 'parents' | 'students';
  excludeIds?: string[];
  placeholder?: string;
  className?: string;
}

// Usage
<PersonSearchAndSelect
  onSelect={handlePersonSelect}
  searchType="parents"
  excludeIds={[currentUserId]}
  placeholder="Search for parent..."
/>
```

#### OrganizationSelector
```typescript
interface OrganizationSelectorProps {
  onSelect: (organization: OrganizationSearchResult) => void;
  programId?: string;
  organizationType?: 'partner' | 'sponsor' | 'all';
  placeholder?: string;
  className?: string;
}

// Usage
<OrganizationSelector
  onSelect={handleOrgSelect}
  organizationType="partner"
  placeholder="Search partner organizations..."
/>
```

#### RelationshipManager
```typescript
interface RelationshipManagerProps {
  userId: string;
  relationships: UserRelationship[];
  onUpdate: (relationships: UserRelationship[]) => void;
  mode: 'parent' | 'child';
  readonly?: boolean;
}

// Usage
<RelationshipManager
  userId={student.id}
  relationships={student.relationships}
  onUpdate={handleRelationshipsUpdate}
  mode="child"
/>
```

### 2. Enhanced Creation Forms

#### Student Creation Form
- **Independent vs Parent Toggle**: Choose creation method
- **Individual vs Organization Toggle**: Single or bulk creation
- **Organization Inheritance**: Automatic member assignment
- **Family Structure**: Parent relationship creation

#### Parent Creation Form
- **Children Assignment**: Link existing or create new children
- **Organization Membership**: Automatic organization assignment
- **Payment Responsibility**: Configure payment settings

### 3. Partner Dashboard

Complete partner management interface with:
- **Organization Overview**: Member statistics and budget tracking
- **Student Management**: View and manage sponsored students
- **Payment Tracking**: Monitor payment responsibilities and overrides
- **Analytics**: Usage statistics and enrollment trends

## Usage Examples

### 1. Creating a Corporate Partnership

```typescript
// 1. Create the organization
const organization = await organizationsApi.create({
  name: "TechCorp Inc.",
  description: "Corporate partner for employee children",
  contact_name: "Jane Smith",
  contact_email: "jane.smith@techcorp.com",
  status: OrganizationStatus.ACTIVE,
  payment_overrides: {
    "swimming": { bypass_payment: true, sponsorship_type: "full" },
    "robotics": { custom_price: 150.00, sponsorship_type: "partial" }
  }
});

// 2. Create partner admin
const admin = await partnerAuthApi.createAdmin({
  organization_id: organization.id,
  admin_data: {
    username: "techcorp.admin",
    email: "admin@techcorp.com",
    full_name: "TechCorp Administrator",
    password: "secure_password"
  }
});

// 3. Add sponsored members
const membership = await organizationsApi.addMember(organization.id, {
  user_id: student.id,
  membership_type: MembershipType.SPONSORED,
  is_sponsored: true,
  start_date: new Date()
});
```

### 2. Calculating Payment Responsibility

```typescript
// Calculate who pays for a course enrollment
const paymentCalc = await paymentOverridesApi.calculatePayment({
  student_id: "student-123",
  course_id: "swimming-101",
  base_amount: 299.99
});

// Result example:
{
  "payer_type": "organization",
  "primary_payer_id": "org-456",
  "payment_breakdown": [
    {
      "payer_id": "org-456",
      "payer_type": "organization",
      "payer_name": "TechCorp Inc.",
      "amount": 299.99,
      "percentage": 100.0,
      "reason": "Full corporate sponsorship"
    }
  ],
  "total_amount": 299.99,
  "override_reason": "TechCorp Inc. covers 100%"
}
```

### 3. Managing Family Structures

```typescript
// Create parent-child relationship
const relationship = await usersApi.createRelationship({
  parent_user_id: "parent-123",
  child_user_id: "child-456", 
  program_id: "swimming-program",
  relationship_type: RelationshipType.PARENT,
  has_payment_responsibility: true,
  payment_percentage: 50.0 // Parent pays 50%, organization pays other 50%
});

// Get complete family structure
const family = await usersApi.getFamilyStructure("parent-123");
```

## Development Guide

### Adding New Organization Features

1. **Database Changes**: Create migration for schema updates
2. **Models**: Update SQLAlchemy models with new fields
3. **Services**: Extend organization services with new functionality
4. **API Routes**: Add new endpoints with proper authentication
5. **Frontend Components**: Create or update UI components
6. **Documentation**: Update this guide with new features

### Testing Organization Features

```bash
# Run organization-specific tests
pytest tests/test_organizations.py -v

# Test payment override calculations
pytest tests/test_payment_overrides.py -v

# Test partner authentication
pytest tests/test_partner_auth.py -v

# Integration tests
pytest tests/integration/test_organization_flow.py -v
```

### Common Development Patterns

#### Service Layer Pattern
```python
class OrganizationService(BaseService):
    def create_with_admin(self, db: Session, org_data: dict, admin_data: dict):
        # Atomic operation: create org + admin user
        with db.begin():
            org = self.create(db, org_data)
            admin = self.create_admin_user(db, admin_data, org.id)
            return org, admin
```

#### Program Context Integration
```python
@require_program_context
def list_organizations(
    db: Session = Depends(get_db),
    program_context: str = Depends(get_program_context)
):
    # All operations automatically filtered by program
    return service.list_by_program(db, program_context)
```

#### Payment Override Logic
```python
def calculate_payment_responsibility(self, student_id: str, course_id: str, base_amount: Decimal):
    # 1. Check organization memberships
    # 2. Check parent relationships  
    # 3. Apply override rules
    # 4. Return payment breakdown
    pass
```

## Related Documentation

- **[Payment Override Specification](./PAYMENT_OVERRIDE_SPECIFICATION.md)**: Detailed payment calculation rules
- **[Partner Admin Guide](./PARTNER_ADMIN_GUIDE.md)**: Partner organization administration
- **[Family Structure Management](./FAMILY_STRUCTURE_MANAGEMENT.md)**: Parent-child relationship system
- **[API Reference](../../api/ORGANIZATION_ENDPOINTS.md)**: Complete API documentation
- **[Database Schema](../../database/ORGANIZATION_SCHEMA.md)**: Detailed schema documentation

---

**📋 Last Updated**: 2025-07-26  
**🔧 Version**: 1.0.0  
**👥 Maintainer**: Academy Admin Development Team