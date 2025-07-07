# Academy Management System - System Overview

## Executive Summary

A comprehensive multi-program academy management platform designed to digitize and streamline operations for Elitesgen Academy's year-round sports programs. The system consists of three interconnected applications with API-based communication, developed in sequence: Admin Dashboard → Parent App → Instructor App.

**Target Scale**: Up to 1,000 students within first year across multiple existing locations  
**Development Approach**: Building the "perfect system" with comprehensive features from day one  
**Technical Strategy**: API-first architecture with simultaneous dashboard development

## System Architecture

### Development Sequence
1. **Admin Dashboard** - Web-based management interface (desktop-optimized)
2. **Parent/Student App** - Mobile app for enrollment, scheduling, and progress tracking
3. **Instructor/Coordinator App** - Mobile app for lesson delivery and assessment (offline-capable)

### API Architecture
- **Central Academy API** - Core data management serving all applications
- **Basic Zoho Books Integration** - Essential payment status tracking
- **Multi-Location Data Management** - Facility-specific operations with consolidated oversight

## Core Data Model

### Student Profile Structure
- **Basic Information**: Salutation, first name, last name, email, phone, date of birth, referral source, address
- **Academy Assignment**: Activity/sport, course, facility assignment, instructor assignment
- **Progression Tracking**: Current curriculum level and module, star ratings (0-3), achievement milestones
- **Attendance Tracking**: Session-by-session attendance with detailed session information
- **Payment Integration**: Basic transaction status from Zoho Books (Paid, Sent, Overdue)
- **Schedule Management**: Session scheduling with status (Upcoming, Completed, Cancelled)

### Enhanced Curriculum Hierarchy
```
Program (Swimming, Football, Basketball, etc.)
├── Course (e.g., Swimming Club, Adult Swimming, Survival Swimming)
    ├── Curriculum (Age Group Based - e.g., Swimming Club: 3-5, Swimming Club: 6-18)
        ├── Level (e.g., Level 1, Level 2, Level 3)
            ├── Equipment Requirements
            ├── Assessment Rubric Package (0-3 star rating system)
            ├── Module (e.g., Module 1, Module 2)
                ├── Section (e.g., Section 1: Introduction to Frog Kick)
                    ├── Lesson Content
                        ├── Title & Description
                        ├── Instructor Delivery Guidelines
                        ├── Lesson ID (e.g., L101, L102)
                        ├── Difficulty Level
                        ├── Media Links (video/document references)
```

## Business Rules & Operational Logic

- **Multi-Location Operations**: Full support from launch with facility-specific data management
- **Assessment System**: Complete 0-3 star rating system with detailed rubrics
- **Parent-Child Relationships**: One parent manages multiple students, one student has one parent
- **Session Capacity**: Group sessions (5 students max), Private sessions (2 students max), School sessions (higher capacity)
- **Schedule Management**: 1-hour sessions with recurring and one-time options
- **Instructor Assignment**: Manual assignment by admins with availability conflict prevention
- **Admin Authority**: Super Admin override capabilities for all enrollment and scheduling rules

## Technical Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (recommended for complex relationships)
- **Authentication**: JWT-based with role-based access control
- **API Design**: RESTful with OpenAPI documentation

### Frontend
- **Framework**: Next.js (React + TypeScript)
- **UI Library**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Type Safety**: TypeScript throughout

### Infrastructure
- **Development**: Docker Compose for local development
- **Database**: PostgreSQL with Alembic migrations
- **API Documentation**: Automatic OpenAPI/Swagger generation

## Development Phases

### Phase 1: Admin Dashboard (Current Focus)
- Complete program and curriculum management
- Full student/parent management system
- Advanced scheduling with conflict prevention
- Multi-location support
- Basic Zoho Books integration
- Assessment rubric system (0-3 stars)

### Phase 2: Parent/Student App
- Student enrollment and course selection
- Schedule management and booking
- Progress tracking and assessment viewing
- Family account management
- Payment status integration

### Phase 3: Instructor/Coordinator App
- Curriculum delivery and access
- Assessment scoring and submission
- Student attendance tracking
- Offline lesson delivery capability

## Success Criteria

### Admin Dashboard Success
- Complete operational management of all academy programs
- Efficient multi-location facility management
- Comprehensive student and parent relationship tracking
- Advanced scheduling with conflict prevention
- Full curriculum and assessment management

### System Integration Success
- API-first architecture supporting all three applications
- Multi-location data management with consolidated oversight
- Scalable architecture supporting growth to 1,000+ students
- Comprehensive academy management replacing all current processes