# Parent Profiles - Technical Specification

## Overview & Business Requirements

### Problem Statement
The academy requires a comprehensive parent/guardian management system that handles multi-child families, consolidated financial management, communication preferences, and account administration. The system must support complex family structures while maintaining clear relationships and consolidated oversight for billing and communication.

### User Stories
- **As a Super Admin**, I want to manage all parent accounts across all programs and facilities
- **As a Program Admin**, I want to manage parents whose children are enrolled in my assigned programs
- **As any admin user**, I want to view consolidated information for families including all children and financial status
- **As any admin user**, I want to manage communication preferences and contact methods for parents
- **As any admin user**, I want to handle complex billing scenarios including multi-child payments and family discounts
- **As any admin user**, I want to track parent engagement and communication history

### Business Rules
- **One-to-Many Relationship**: One parent can manage multiple children, each child has exactly one parent account
- **Consolidated Billing**: Financial management at parent level with visibility across all children
- **Communication Hub**: Parent serves as primary communication point for all their children
- **App Access Control**: Parents can be granted access to mobile app for self-service
- **Family Discounts**: Support for family-based pricing and discount structures
- **Emergency Authority**: Parents have medical and pickup authority for all their children
- **Data Inheritance**: Children can inherit address and contact information from parent

## Technical Architecture

### Database Schema Requirements

#### parents table
```sql
-- Core parent/guardian profile entity
parents:
  id: UUID (Primary Key)
  parent_number: VARCHAR(20) UNIQUE NOT NULL  -- Academy-generated parent ID
  
  -- Personal Information
  salutation: VARCHAR(10)  -- Mr., Mrs., Dr., Ms., etc.
  first_name: VARCHAR(100) NOT NULL
  last_name: VARCHAR(100) NOT NULL
  preferred_name: VARCHAR(100)  -- How they prefer to be addressed
  email: VARCHAR(255) UNIQUE NOT NULL
  phone_primary: VARCHAR(50) NOT NULL
  phone_secondary: VARCHAR(50)
  
  -- Address Information
  address: JSONB NOT NULL  -- {country, state, city, full_address, postal_code}
  mailing_address: JSONB  -- Different mailing address if needed
  mailing_address_different: BOOLEAN DEFAULT FALSE
  
  -- Emergency and Secondary Contact
  emergency_contact: JSONB  -- {name, relationship, phone, email}
  spouse_partner_info: JSONB  -- {name, phone, email, relationship}
  
  -- Communication Preferences
  preferred_communication: ENUM('email', 'sms', 'phone', 'app') DEFAULT 'email'
  communication_languages: JSONB  -- Array of preferred languages
  communication_timezone: VARCHAR(50) DEFAULT 'UTC'
  newsletter_subscription: BOOLEAN DEFAULT TRUE
  marketing_consent: BOOLEAN DEFAULT FALSE
  
  -- App Access and Authentication
  app_access_enabled: BOOLEAN DEFAULT FALSE
  password_hash: VARCHAR(255)  -- For parent app access
  email_verified: BOOLEAN DEFAULT FALSE
  email_verification_token: VARCHAR(255)
  last_app_login: TIMESTAMP
  
  -- Financial Information
  billing_email: VARCHAR(255)  -- Different email for billing if needed
  payment_preferences: JSONB  -- Preferred payment methods and settings
  auto_pay_enabled: BOOLEAN DEFAULT FALSE
  billing_cycle_preference: ENUM('monthly', 'quarterly', 'annual') DEFAULT 'monthly'
  
  -- Family Information
  family_size: INTEGER DEFAULT 1  -- Number of children
  household_income_range: ENUM('under_30k', '30k_50k', '50k_75k', '75k_100k', 'over_100k')
  financial_assistance_eligible: BOOLEAN DEFAULT FALSE
  
  -- Administrative Information
  referral_source: VARCHAR(100)  -- How they found the academy
  referral_code: VARCHAR(50)  -- If they have a referral code
  registration_date: DATE NOT NULL
  notes: TEXT  -- Administrative notes about the parent
  
  -- Status and Tracking
  account_status: ENUM('active', 'inactive', 'suspended', 'closed') DEFAULT 'active'
  vip_status: BOOLEAN DEFAULT FALSE  -- Special recognition status
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### parent_communication_history table
```sql
-- Track all communications with parents
parent_communication_history:
  id: UUID (Primary Key)
  parent_id: UUID (Foreign Key → parents.id)
  communication_type: ENUM('email', 'sms', 'phone', 'in_person', 'app_message')
  subject: VARCHAR(255)
  content: TEXT
  sender_id: UUID (Foreign Key → users.id)  -- Who initiated communication
  recipient_response: TEXT  -- Parent's response if any
  communication_date: TIMESTAMP NOT NULL
  response_date: TIMESTAMP
  priority: ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'
  status: ENUM('sent', 'delivered', 'read', 'responded', 'failed') DEFAULT 'sent'
  related_student_id: UUID (Foreign Key → students.id)  -- If about specific child
  related_topic: VARCHAR(100)  -- billing, enrollment, behavior, etc.
  attachments: JSONB  -- Array of attachment file paths
  created_at: TIMESTAMP AUTO
```

#### parent_preferences table
```sql
-- Detailed parent preferences and settings
parent_preferences:
  id: UUID (Primary Key)
  parent_id: UUID (Foreign Key → parents.id)
  preference_category: VARCHAR(100) NOT NULL  -- 'notifications', 'privacy', 'billing'
  preference_key: VARCHAR(100) NOT NULL
  preference_value: JSONB NOT NULL
  effective_date: DATE DEFAULT CURRENT_DATE
  expires_date: DATE
  updated_by: UUID (Foreign Key → users.id)
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### family_financial_summary table
```sql
-- Consolidated financial overview for families
family_financial_summary:
  id: UUID (Primary Key)
  parent_id: UUID (Foreign Key → parents.id)
  billing_period: DATE NOT NULL  -- Start of billing period
  
  -- Financial Totals
  total_charges: DECIMAL(10,2) DEFAULT 0.00
  total_payments: DECIMAL(10,2) DEFAULT 0.00
  total_credits: DECIMAL(10,2) DEFAULT 0.00
  total_adjustments: DECIMAL(10,2) DEFAULT 0.00
  current_balance: DECIMAL(10,2) DEFAULT 0.00
  
  -- Family Discounts
  family_discount_applied: DECIMAL(10,2) DEFAULT 0.00
  multi_child_discount: DECIMAL(10,2) DEFAULT 0.00
  loyalty_discount: DECIMAL(10,2) DEFAULT 0.00
  financial_assistance: DECIMAL(10,2) DEFAULT 0.00
  
  -- Payment Status
  payment_status: ENUM('current', 'overdue', 'collections', 'payment_plan') DEFAULT 'current'
  next_payment_due: DATE
  last_payment_date: DATE
  
  -- Session Credits
  total_unused_credits: INTEGER DEFAULT 0
  credits_expiring_30_days: INTEGER DEFAULT 0
  
  calculated_at: TIMESTAMP NOT NULL
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

### API Endpoints Specification

#### Parent Management Endpoints

**GET /api/v1/parents**
- **Purpose**: List parents with filtering and pagination
- **Authorization**: Role-based access with program/facility filtering
- **Query Parameters**:
  - `facility_id`: UUID (optional) - parents with children at facility
  - `program_id`: UUID (optional) - parents with children in program
  - `account_status`: enum (optional) - active, inactive, suspended
  - `payment_status`: enum (optional) - current, overdue, collections
  - `family_size_min`: integer (optional) - minimum number of children
  - `family_size_max`: integer (optional) - maximum number of children
  - `search`: string (optional) - search by name, email, phone
  - `sort_by`: enum (optional) - name, registration_date, balance, last_activity
  - `sort_order`: enum (default: asc) - asc, desc
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20, max: 100)
- **Response**: Paginated parent list with family summary information