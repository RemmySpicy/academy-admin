# Database Specifications

This directory contains comprehensive database schema documentation for the Academy Management System.

## Database Design Principles

- **Normalized Design**: Proper normalization to eliminate redundancy
- **Referential Integrity**: Foreign key constraints and proper relationships
- **Scalability**: Designed to handle 1,000+ students efficiently
- **Multi-Location Support**: Location-specific data segregation
- **Audit Trail**: Change tracking for critical data

## Database Technology

- **Database**: PostgreSQL 15+
- **Migrations**: Alembic for database versioning
- **Indexing**: Strategic indexing for performance
- **Constraints**: Proper validation at database level

## Schema Organization

### Core Tables
- **users** - Authentication and user management
- **locations** - Academy locations and facilities
- **programs** - Sports programs and activities

### Student Management
- **students** - Student profiles and information
- **parents** - Parent/guardian profiles
- **student_parent_relationships** - Family relationships

### Curriculum Management
- **curricula** - Curriculum hierarchy (7-level deep)
- **assessments** - Assessment rubrics and scoring
- **progress_tracking** - Student progress records

### Scheduling
- **sessions** - Individual lesson sessions
- **bookings** - Student session bookings
- **attendance** - Session attendance tracking

## Key Design Decisions

- **Multi-Location**: Location-specific data with consolidated views
- **Curriculum Hierarchy**: Flexible 7-level hierarchy support
- **Assessment System**: 0-3 star rating with detailed rubrics
- **Session Management**: Complex scheduling with conflict prevention
- **Audit Trail**: Change tracking for all critical operations