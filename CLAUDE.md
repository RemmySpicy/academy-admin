# Academy Admin - Claude AI Instructions

## Project Overview
Academy Management System built with modern full-stack technologies for comprehensive educational institution management.

## Technology Stack (Updated 2025)

### Frontend
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Primary UI Library)
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand 4.5.5
- **Data Fetching**: TanStack Query 5.62.4
- **Animations**: Framer Motion 11.13.5
- **Charts**: Recharts
- **Drag & Drop**: DND Kit
- **Date Handling**: Date-fns
- **Icons**: Lucide React + Radix UI Icons

### Backend
- **Framework**: FastAPI 0.115.12
- **Language**: Python 3.12+
- **Database**: SQLAlchemy 2.0.36 (ORM)
- **Validation**: Pydantic 2.10.4
- **Migrations**: Alembic 1.14.0
- **Server**: Uvicorn 0.32.1 (ASGI)
- **Background Tasks**: Celery 5.4.0
- **Testing**: Pytest 8.3.4
- **Authentication**: PyJWT + Passlib

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

## shadcn/ui Configuration
The project uses shadcn/ui as the primary UI component library:

### Setup Status
- ✅ **components.json** - Configuration file created
- ✅ **src/lib/utils.ts** - Utility functions with `cn()` helper
- ✅ **Core Components Installed**: Button, Card, Dialog, Dropdown Menu, Select, Tabs, Toast

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

### Component Usage
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
```

### Available Components
- **Button** - All variants (default, destructive, outline, secondary, ghost, link)
- **Card** - Complete card system with header, content, footer
- **Dialog** - Modal dialogs with overlay
- **Dropdown Menu** - Context menus and dropdowns  
- **Select** - Styled select inputs
- **Tabs** - Tab navigation components
- **Toast** - Notification system with useToast hook

## Development Best Practices

### Code Quality Commands
Always run these before committing:
- `npm run lint:frontend` - Run frontend linting
- `npm run type-check:frontend` - Run TypeScript type checking
- `npm run test:frontend` - Run frontend tests
- `npm run test:backend` - Run backend tests

### Component Development
- Use shadcn/ui components as the foundation
- Follow the established pattern in `src/components/ui/`
- Utilize the `cn()` utility for conditional classes
- Prefer composition over customization

## Feature Specifications Location
Feature specifications are stored in the `specs/` directory. Reference these files when implementing new features:

- `specs/features/` - Individual feature specifications
- `specs/api/` - API endpoint specifications
- `specs/database/` - Database schema specifications
- `specs/ui/` - UI/UX specifications

## Version Information (Last Updated: 2025-01-07)
This project is configured with the latest stable versions as of January 2025. Key framework versions:
- Next.js 15.3.5 (latest stable)
- React 18.3.1 
- TypeScript 5.7.2
- Tailwind CSS 3.4.17
- FastAPI 0.115.12