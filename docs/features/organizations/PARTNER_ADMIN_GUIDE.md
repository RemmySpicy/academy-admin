# Partner Admin Guide

**Complete guide for partner organization administrators to manage their sponsored students and organizational settings.**

## 📖 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Managing Students](#managing-students)
- [Payment Management](#payment-management)
- [Organization Settings](#organization-settings)
- [Reports and Analytics](#reports-and-analytics)
- [User Management](#user-management)
- [API Access](#api-access)

## Overview

The Partner Admin system provides organizations with a dedicated interface to manage their sponsored students, track payments, and configure organizational settings within the Academy Admin platform.

### What is a Partner Organization?

Partner organizations are entities that have formal relationships with the academy to sponsor student enrollments. These can include:

- **Corporate Partners**: Companies sponsoring employee children
- **Educational Institutions**: Schools with bulk enrollment agreements  
- **Community Organizations**: Non-profits with special arrangements
- **Government Agencies**: Municipal or state-sponsored programs

### Partner Admin Role

Partner Admins have specialized permissions to:

- ✅ **Manage Sponsored Students**: View and oversee students sponsored by their organization
- ✅ **Track Payments**: Monitor payment responsibilities and sponsorship amounts
- ✅ **Configure Sponsorship Rules**: Set payment overrides and coverage amounts
- ✅ **Generate Reports**: Access analytics and usage statistics
- ✅ **Manage Organization Profile**: Update contact information and settings
- ❌ **Limited Academy Access**: Cannot access other organizations' data or system-wide settings

## Getting Started

### 1. Account Creation

Partner Admin accounts are created by Academy Super Admins during the organization setup process:

```http
POST /api/v1/partner-auth/create-admin
Content-Type: application/json

{
  "organization_id": "org-123",
  "admin_data": {
    "username": "myorg.admin",
    "email": "admin@myorganization.com",
    "full_name": "Organization Administrator",
    "password": "secure_password123"
  }
}
```

### 2. First Login

1. Navigate to the Partner Admin login page: `https://academy.com/partner-login`
2. Enter your credentials provided by the Academy
3. Complete the initial setup wizard
4. Configure your organization profile

### 3. Initial Setup Checklist

- [ ] **Update Organization Profile**: Add contact information, logo, description
- [ ] **Configure Payment Rules**: Set sponsorship amounts and coverage percentages
- [ ] **Import Student List**: Add existing sponsored students to the system
- [ ] **Set Notification Preferences**: Configure email alerts and reports
- [ ] **Review Access Permissions**: Understand what data you can access

## Dashboard Overview

The Partner Admin dashboard provides a comprehensive view of your organization's academy engagement:

### Main Dashboard Sections

#### 1. Organization Overview Card
```typescript
interface OrganizationOverview {
  organization_name: string;
  total_members: number;
  active_students: number;
  programs_involved: string[];
  monthly_sponsorship_amount: number;
  status: 'active' | 'suspended' | 'pending';
}
```

**Key Metrics:**
- **Active Students**: Currently enrolled students sponsored by your organization
- **Programs**: Academy programs where your organization has students
- **Monthly Spend**: Total sponsorship amount for current month
- **Member Count**: Total organization members in the system

#### 2. Recent Activity Feed
- New student enrollments
- Payment transactions
- Policy changes
- System notifications

#### 3. Quick Actions
- **Add New Student**: Sponsor a new student enrollment
- **View Payment Summary**: See current month's payment breakdown
- **Generate Report**: Create custom analytics reports
- **Update Settings**: Modify organization configuration

#### 4. Alert Center
- **Budget Warnings**: Alerts when approaching spending limits
- **Payment Due**: Notifications for upcoming payment responsibilities
- **Enrollment Requests**: New student enrollment requests requiring approval
- **System Updates**: Important system changes affecting your organization

### Sample Dashboard Data

```json
{
  "organization": {
    "name": "TechCorp Inc.",
    "status": "active",
    "member_count": 45,
    "active_students": 12,
    "programs": ["Swimming", "Robotics", "Music"]
  },
  "current_month": {
    "total_sponsored": 3599.88,
    "budget_remaining": 1400.12,
    "payment_due_date": "2025-08-01",
    "new_enrollments": 3
  },
  "alerts": [
    {
      "type": "budget_warning", 
      "message": "Approaching 80% of monthly budget limit",
      "severity": "medium"
    },
    {
      "type": "enrollment_request",
      "message": "2 new enrollment requests awaiting approval",
      "severity": "low"
    }
  ]
}
```

## Managing Students

### 1. Student List View

The Students section shows all students currently sponsored by your organization:

#### Student List Features
- **Search and Filter**: Find students by name, program, enrollment status
- **Bulk Actions**: Perform actions on multiple students at once
- **Export Options**: Download student lists in CSV or PDF format
- **Status Tracking**: Monitor enrollment and payment status

#### Student Information Displayed
```typescript
interface SponsoredStudent {
  id: string;
  full_name: string;
  program: string;
  courses: Course[];
  enrollment_date: Date;
  sponsorship_amount: number;
  payment_status: 'current' | 'overdue' | 'upcoming';
  parent_contact: ParentContact;
  academic_progress: ProgressSummary;
}
```

### 2. Adding New Students

Partner Admins can sponsor new students through two methods:

#### Method 1: Sponsor Existing Student
1. Search for existing students in the academy system
2. Request sponsorship approval from parents
3. Configure sponsorship terms (full, partial, custom amount)
4. Submit sponsorship request to Academy for approval

#### Method 2: Create New Student Profile
1. Enter student information (name, age, contact details)
2. Create parent/guardian profiles if needed
3. Select courses and programs for enrollment
4. Configure sponsorship terms
5. Submit for Academy approval and enrollment processing

### 3. Student Sponsorship Configuration

For each sponsored student, you can configure:

```json
{
  "sponsorship_config": {
    "sponsorship_type": "partial",
    "coverage_percentage": 75.0,
    "max_annual_amount": 2000.00,
    "covered_programs": ["robotics", "stem"],
    "requires_approval": false,
    "notes": "STEM program sponsorship for employee children"
  }
}
```

**Sponsorship Options:**
- **Full Sponsorship (100%)**: Organization pays all enrollment fees
- **Partial Sponsorship (%)**: Organization pays percentage, parent pays remainder  
- **Fixed Amount**: Organization contributes fixed amount per course
- **Program Specific**: Different rules for different academy programs

### 4. Student Progress Tracking

Monitor sponsored students' academic progress:

- **Course Completion Rates**: Percentage of courses successfully completed
- **Attendance Records**: Class attendance and participation metrics
- **Assessment Results**: Grade and evaluation summaries
- **Milestone Achievements**: Certificates, awards, and recognitions

## Payment Management

### 1. Payment Dashboard

The Payment section provides comprehensive financial tracking:

#### Current Period Summary
```typescript
interface PaymentSummary {
  period: string; // "July 2025"
  total_amount: number;
  breakdown: PaymentBreakdownItem[];
  payment_due_date: Date;
  payment_status: 'pending' | 'processing' | 'completed' | 'overdue';
  budget_utilization: number; // percentage of budget used
}
```

#### Payment Breakdown
- **By Student**: Individual student sponsorship amounts
- **By Program**: Costs grouped by academy program
- **By Course**: Detailed course-level costs
- **By Payment Type**: Full vs partial sponsorships

### 2. Budget Management

Organizations can set and monitor budget limits:

```json
{
  "budget_configuration": {
    "annual_limit": 50000.00,
    "monthly_limit": 5000.00,
    "per_student_limit": 2000.00,
    "alert_thresholds": {
      "warning_at": 80,
      "critical_at": 95
    },
    "approval_required_above": 1000.00
  }
}
```

**Budget Features:**
- **Spending Limits**: Set annual, monthly, and per-student limits
- **Alert Thresholds**: Automatic notifications when approaching limits
- **Approval Workflows**: Require approval for high-value sponsorships
- **Historical Tracking**: View spending patterns over time

### 3. Payment Processing

#### Automatic Payments
Configure automatic payment processing for predictable sponsorships:

```json
{
  "auto_payment_config": {
    "enabled": true,
    "payment_method": "corporate_card",
    "payment_schedule": "monthly",
    "auto_approve_under": 500.00,
    "notification_email": "finance@techcorp.com"
  }
}
```

#### Manual Payment Review
For payments requiring approval:

1. **Review Payment Details**: Verify student information and course costs
2. **Approve or Deny**: Make payment decisions with optional comments
3. **Set Payment Method**: Choose from configured payment options
4. **Schedule Payment**: Set payment date and processing preferences

### 4. Payment History and Reporting

Track all historical payment data:

- **Transaction History**: Complete record of all payments made
- **Trend Analysis**: Spending patterns and growth over time
- **Cost Per Student**: Average sponsorship costs and ROI analysis
- **Program Comparison**: Cost analysis across different academy programs

## Organization Settings

### 1. Organization Profile

Manage your organization's public profile and contact information:

```typescript
interface OrganizationProfile {
  // Basic Information
  name: string;
  description: string;
  logo_url?: string;
  website?: string;
  
  // Contact Information
  primary_contact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  
  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Settings
  status: OrganizationStatus;
  preferences: OrganizationPreferences;
}
```

### 2. Sponsorship Rules Configuration

Define default sponsorship rules for your organization:

#### Global Sponsorship Settings
```json
{
  "default_sponsorship": {
    "type": "partial",
    "percentage": 70.0,
    "description": "Standard 70% coverage for all courses"
  },
  "program_overrides": {
    "stem": {
      "type": "full",
      "description": "100% coverage for STEM programs"
    },
    "arts": {
      "type": "partial", 
      "percentage": 50.0,
      "description": "50% coverage for arts programs"
    }
  }
}
```

#### Course-Specific Rules
Configure different sponsorship amounts for specific courses:

```json
{
  "course_sponsorship_rules": [
    {
      "course_category": "advanced",
      "sponsorship_type": "fixed",
      "fixed_amount": 500.00,
      "requires_approval": true
    },
    {
      "course_level": "beginner",
      "sponsorship_type": "full",
      "max_courses_per_student": 2
    }
  ]
}
```

### 3. Access Control

Manage who in your organization can access the Partner Admin system:

#### Admin User Management
- **Primary Admin**: Full access to all organization features
- **Finance Admin**: Access to payment and budget information only
- **HR Admin**: Access to student management and enrollment features
- **View Only**: Read-only access to reports and student information

#### Permission Levels
```typescript
enum PartnerPermission {
  MANAGE_STUDENTS = 'manage_students',
  VIEW_PAYMENTS = 'view_payments',
  APPROVE_PAYMENTS = 'approve_payments',
  CONFIGURE_SPONSORSHIP = 'configure_sponsorship',
  MANAGE_ORGANIZATION = 'manage_organization',
  GENERATE_REPORTS = 'generate_reports'
}
```

### 4. Notification Preferences

Configure how and when you receive notifications:

```json
{
  "notification_preferences": {
    "email_notifications": {
      "new_enrollments": true,
      "payment_due_reminders": true,
      "budget_alerts": true,
      "weekly_summary": true
    },
    "notification_timing": {
      "payment_reminder_days": 7,
      "budget_warning_threshold": 80,
      "report_frequency": "monthly"
    },
    "recipients": {
      "primary": "admin@techcorp.com",
      "finance": "finance@techcorp.com",
      "hr": "hr@techcorp.com"
    }
  }
}
```

## Reports and Analytics

### 1. Standard Reports

#### Monthly Sponsorship Report
- Total students sponsored
- Payment breakdown by program
- Budget utilization percentage
- Comparison to previous months

#### Student Progress Report
- Academic performance metrics
- Course completion rates
- Attendance summaries
- Achievement highlights

#### Financial Summary Report
- Year-to-date spending
- Cost per student analysis
- ROI calculations
- Budget forecasting

### 2. Custom Report Builder

Create custom reports with:

- **Flexible Date Ranges**: Daily, weekly, monthly, quarterly, or custom periods
- **Multiple Data Sources**: Students, payments, courses, programs
- **Various Chart Types**: Bar charts, line graphs, pie charts, tables
- **Export Options**: PDF, Excel, CSV formats
- **Scheduled Delivery**: Automatic email delivery of reports

### 3. Analytics Dashboard

Interactive dashboard with:

```typescript
interface AnalyticsDashboard {
  key_metrics: {
    total_students: number;
    monthly_spend: number;
    average_cost_per_student: number;
    retention_rate: number;
  };
  
  trend_charts: {
    enrollment_growth: ChartData;
    spending_trends: ChartData;
    program_popularity: ChartData;
  };
  
  comparisons: {
    year_over_year: ComparisonData;
    program_performance: ComparisonData;
    cost_effectiveness: ComparisonData;
  };
}
```

## User Management

### 1. Organization Team Members

Manage who has access to your Partner Admin account:

#### Adding Team Members
1. Navigate to **Settings > Team Members**
2. Click **Add New Member**
3. Enter user information and email
4. Select permission level
5. Send invitation email

#### Permission Levels
- **Admin**: Full access to all features
- **Manager**: Student management and payment viewing
- **Finance**: Payment and budget management only
- **Viewer**: Read-only access to reports

### 2. Student Access Management

Control which students your organization can sponsor:

#### Eligibility Rules
```json
{
  "eligibility_criteria": {
    "employee_children_only": true,
    "age_range": {
      "min": 5,
      "max": 18
    },
    "programs_allowed": ["stem", "robotics", "coding"],
    "max_students_per_employee": 3,
    "requires_verification": true
  }
}
```

#### Approval Workflows
- **Automatic Approval**: For students meeting all criteria
- **Manual Review**: For special cases or high-value sponsorships
- **Parent Consent**: Required documentation and approval processes

## API Access

### 1. Partner API Overview

Partner organizations can access a subset of the Academy API:

#### Available Endpoints
```typescript
// Organization Management
GET    /api/v1/partner/organization          // Get organization details
PUT    /api/v1/partner/organization          // Update organization
GET    /api/v1/partner/organization/stats    // Get organization statistics

// Student Management
GET    /api/v1/partner/students              // List sponsored students
POST   /api/v1/partner/students              // Add new sponsored student
GET    /api/v1/partner/students/{id}         // Get student details
PUT    /api/v1/partner/students/{id}         // Update student sponsorship

// Payment Management
GET    /api/v1/partner/payments              // List payments
GET    /api/v1/partner/payments/summary      // Payment summary
POST   /api/v1/partner/payments/approve      // Approve pending payments

// Reports
GET    /api/v1/partner/reports/monthly       // Monthly report
GET    /api/v1/partner/reports/students      // Student progress report
POST   /api/v1/partner/reports/custom        // Generate custom report
```

### 2. Authentication

Partner API uses JWT tokens with organization context:

```http
POST /api/v1/partner-auth/login
Content-Type: application/json

{
  "username": "techcorp.admin",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "organization_id": "org-123",
  "permissions": ["manage_students", "view_payments", "generate_reports"]
}
```

### 3. API Usage Examples

#### Get Sponsored Students
```javascript
const response = await fetch('/api/v1/partner/students', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const students = await response.json();
```

#### Generate Monthly Report
```javascript
const reportData = await fetch('/api/v1/partner/reports/monthly', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    month: '2025-07',
    include_details: true,
    format: 'json'
  })
});
```

### 4. Rate Limits and Security

#### API Rate Limits
- **Standard Endpoints**: 100 requests per minute
- **Report Generation**: 10 requests per hour
- **Bulk Operations**: 5 requests per minute

#### Security Best Practices
- Store API tokens securely
- Use HTTPS for all API calls
- Implement proper error handling
- Log API usage for auditing
- Rotate tokens regularly

## Troubleshooting

### Common Issues

#### 1. Cannot Access Student Information
**Cause**: Student not sponsored by your organization or permissions issue
**Solution**: Verify student sponsorship status and check user permissions

#### 2. Payment Not Processing
**Cause**: Budget limits exceeded or payment method issues
**Solution**: Check budget settings and update payment information

#### 3. Reports Not Generating
**Cause**: Insufficient data or date range issues
**Solution**: Adjust date range and verify data availability

#### 4. API Authentication Failures
**Cause**: Expired tokens or incorrect credentials
**Solution**: Re-authenticate and obtain new access token

### Getting Help

- **📧 Email Support**: partner-support@academy.com
- **📞 Phone Support**: 1-800-ACADEMY (business hours)
- **💬 Live Chat**: Available in Partner Admin dashboard
- **📚 Documentation**: https://docs.academy.com/partner-admin
- **🎯 Training**: Monthly webinars and video tutorials

---

**📋 Last Updated**: 2025-07-26  
**🔧 Version**: 1.0.0  
**👥 Maintainer**: Academy Admin Development Team