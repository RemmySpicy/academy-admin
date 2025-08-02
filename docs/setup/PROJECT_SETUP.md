# Academy Admin - Project Setup Guide

## Quick Start Commands

### Development Setup
- `npm run setup:project` - Complete project setup (copies env files, installs deps)
- `docker compose up` - **RECOMMENDED**: Full Docker development (all services)
- `npm run dev:local` - Local development with PostgreSQL

### Daily Development
- `docker compose up` - Start all services in containers
- `./start-dev.sh` - Start local development with PostgreSQL database

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui
- **State Management**: Zustand 4.5.5
- **Data Fetching**: TanStack Query 5.62.4

### Backend
- **Framework**: FastAPI 0.115.12
- **Language**: Python 3.12+
- **Database**: PostgreSQL with SQLAlchemy 2.0.36
- **Authentication**: JWT + Role-based access control
- **Testing**: Pytest 8.3.4
- **Currency**: Nigerian Naira (NGN) for all pricing

## Environment Files
- **`.env.docker`** - Full Docker development (RECOMMENDED)
- **`.env.local`** - Local development with PostgreSQL
- **`.env.production`** - Production deployment

## Key Directories
- `/backend/` - FastAPI backend application
- `/frontend/` - Next.js frontend application
- `/docs/` - Project documentation
- `/specs/` - Feature specifications
- `/tools/` - Development tools and quality checks

## Quality Assurance
- `npm run quality:academy` - **MANDATORY**: Academy Admin specific checks
- `npm run deploy:check` - Full deployment readiness check
- `npm run test:all` - Run all tests

## Database Setup
All environments use PostgreSQL for consistency:
- **Development**: PostgreSQL in Docker container
- **Production**: Managed PostgreSQL (Supabase/RDS)

## Default User Accounts
- **Super Admin**: `admin@academy.com` / `admin123`
- **Program Admin**: `swim.admin@academy.com` / `swim123`

## User Creation & Management
- **✅ Auto Full Name Generation**: System automatically creates `full_name` from `first_name + " " + last_name`
- **🔐 Program Admin Permissions**: Program admins can create student/parent users within their assigned programs
- **🔧 Database Enum Consistency**: All enums aligned between Python code and database schema
- **📋 Unified Creation Workflows**: Single-step user creation with automatic program association