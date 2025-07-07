# Academy Admin - Claude AI Instructions

## Project Overview
Academy Management System built with modern full-stack technologies for comprehensive educational institution management.

## Development Commands

### Quick Start
- `npm run setup:project` - Complete project setup (copies env files, installs deps, starts Docker)
- `npm run setup:dev` - Setup development environment files only

### Setup
- `npm run install:all` - Install all dependencies (frontend + backend)
- `npm run install:frontend` - Install frontend dependencies only
- `npm run install:backend` - Install backend dependencies only

#### System Requirements for Backend
For backend development, ensure your system has:
- Python 3.12+ installed
- Virtual environment support: `sudo apt install python3.12-venv` (on Ubuntu/Debian)
- For backend development: `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`

### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run frontend:dev` - Start frontend only (port 3000)
- `npm run backend:dev` - Start backend only (port 8000)

### Docker Development
- `npm run docker:dev` - Start development environment with Docker
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:build` - Build Docker images

### Database Management
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:down` - Rollback last migration
- `npm run db:reset` - Reset database (downgrade to base, then upgrade)
- `npm run db:seed` - Seed database with sample data

### Production
- `npm run frontend:build` - Build frontend for production
- `npm run backend:start` - Start backend in production mode
- `npm run docker:prod` - Start production environment with Docker

### Code Quality
- `npm run lint:frontend` - Run frontend linting
- `npm run type-check:frontend` - Run TypeScript type checking
- `npm run test:backend` - Run backend tests
- `npm run test:frontend` - Run frontend tests
- `npm run test:all` - Run all tests

### Utility Commands
- `npm run clean` - Clean build artifacts and dependencies
- `npm run build:all` - Build all applications for production

## API Endpoints

### Base URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## Feature Specifications Location
Feature specifications are stored in the `specs/` directory. Reference these files when implementing new features:

- `specs/features/` - Individual feature specifications
- `specs/api/` - API endpoint specifications
- `specs/database/` - Database schema specifications
- `specs/ui/` - UI/UX specifications