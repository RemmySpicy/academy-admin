# Location Management - Technical Specification

## Overview & Business Requirements

### Problem Statement
Elitesgen Academy operates multiple physical locations that require comprehensive management with facility-specific operations, program assignments, and operational settings. The system must support independent facility operations while enabling consolidated oversight and student transfers between locations.

### User Stories
- **As a Super Admin**, I want to manage all facilities across the organization with full operational control
- **As a Program Admin**, I want to access only the facilities where my assigned programs operate
- **As any admin user**, I want to see facility-specific data and operations clearly separated
- **As a Super Admin**, I want to transfer students between facilities when needed
- **As any admin user**, I want to configure facility-specific settings like capacity, hours, and program availability

### Business Rules
- **Multi-Location Operations**: Each facility operates independently with its own schedules and capacity
- **Program Assignment**: Facilities can offer multiple programs, programs can operate at multiple facilities
- **Student Transfers**: Students can be transferred between facilities with proper data migration
- **Capacity Management**: Each facility has specific capacity limits for different session types
- **Operating Hours**: Facility-specific operating schedules and availability
- **Settings Override**: Facility-level settings can override global system settings

## Technical Architecture

### Database Schema Requirements

#### organizations table
```sql
-- Top-level organization entity
organizations:
  id: UUID (Primary Key)
  name: VARCHAR(255) NOT NULL  -- "Elitesgen Academy"
  description: TEXT
  logo_url: VARCHAR(500)
  contact_email: VARCHAR(255)
  contact_phone: VARCHAR(50)
  address: JSONB  -- {country, state, city, full_address}
  website_url: VARCHAR(255)
  timezone: VARCHAR(50) DEFAULT 'UTC'
  settings: JSONB  -- Global organization settings
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### facilities table
```sql
-- Physical location/facility entity
facilities:
  id: UUID (Primary Key)
  organization_id: UUID (Foreign Key → organizations.id)
  name: VARCHAR(255) NOT NULL  -- "Downtown Branch", "Westside Center"
  slug: VARCHAR(100) UNIQUE NOT NULL  -- URL-friendly identifier
  description: TEXT
  facility_code: VARCHAR(20) UNIQUE NOT NULL  -- Internal facility identifier
  address: JSONB NOT NULL  -- {country, state, city, full_address, postal_code}
  contact_phone: VARCHAR(50)
  contact_email: VARCHAR(255)
  manager_name: VARCHAR(255)
  manager_phone: VARCHAR(50)
  manager_email: VARCHAR(255)
  
  -- Operational Information
  operating_hours: JSONB NOT NULL  -- Weekly schedule with hours
  timezone: VARCHAR(50) NOT NULL
  
  -- Capacity Settings
  capacity_settings: JSONB NOT NULL  -- Session type capacity limits
  
  -- Facility Features
  amenities: JSONB  -- Available amenities and features
  equipment_inventory: JSONB  -- Equipment available at facility
  
  -- Coordinates for mapping
  latitude: DECIMAL(10, 8)
  longitude: DECIMAL(11, 8)
  
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### facility_programs table (from program management)
```sql
-- Many-to-many relationship between facilities and programs
facility_programs:
  id: UUID (Primary Key)
  facility_id: UUID (Foreign Key → facilities.id)
  program_id: UUID (Foreign Key → programs.id)
  is_active: BOOLEAN DEFAULT TRUE
  
  -- Program-specific facility settings
  capacity_overrides: JSONB  -- Program-specific capacity limits
  schedule_settings: JSONB  -- Program-specific scheduling rules
  pricing_overrides: JSONB  -- Program-specific pricing at facility
  
  assigned_by: UUID (Foreign Key → users.id)
  effective_date: DATE NOT NULL
  end_date: DATE NULL
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### facility_settings table
```sql
-- Facility-specific configuration overrides
facility_settings:
  id: UUID (Primary Key)
  facility_id: UUID (Foreign Key → facilities.id)
  setting_category: VARCHAR(100) NOT NULL  -- 'scheduling', 'capacity', 'notifications'
  setting_key: VARCHAR(100) NOT NULL
  setting_value: JSONB NOT NULL
  overrides_global: BOOLEAN DEFAULT TRUE
  effective_date: DATE DEFAULT CURRENT_DATE
  expires_date: DATE NULL
  updated_by: UUID (Foreign Key → users.id)
  created_at: TIMESTAMP AUTO