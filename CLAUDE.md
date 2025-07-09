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
- `npm run setup:prod` - Setup production environment files

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

### Production
- `npm run frontend:build` - Build frontend for production
- `npm run build:prod` - Build frontend for production with optimizations
- `npm run frontend:start` - Start frontend in production mode
- `npm run backend:start` - Start backend in production mode
- `npm run backend:prod` - Start backend in production mode with proper host binding

### Docker Development
- `npm run docker:dev` - Start development environment with Docker
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:build` - Build Docker images
- `npm run docker:prod` - Start production environment with Docker

### Database Management
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:down` - Rollback last migration
- `npm run db:reset` - Reset database (downgrade to base, then upgrade)
- `npm run db:seed` - Seed database with sample data
- `npm run db:setup` - Run production database setup script

### Code Quality
- `npm run lint:frontend` - Run frontend linting
- `npm run type-check:frontend` - Run TypeScript type checking
- `npm run test:backend` - Run backend tests
- `npm run test:frontend` - Run frontend tests
- `npm run test:all` - Run all tests

### Deployment
- `npm run deploy:check` - Run all quality checks before deployment
- `npm run deploy:build` - Complete production build with all checks

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

## Deployment Strategy

### Architecture Overview
The Academy Admin system is designed for **separate deployment** of frontend, backend, and database components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │────│   (Railway)     │────│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Static Site   │    │ • API Service   │    │ • PostgreSQL    │
│ • Global CDN    │    │ • Auto Deploy   │    │ • Managed       │
│ • Auto Scale    │    │ • Health Checks │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Options

#### Recommended Stack (PaaS)
- **Frontend**: [Vercel](https://vercel.com) - Optimized for Next.js
- **Backend**: [Railway](https://railway.app) - Simple FastAPI deployment
- **Database**: [Supabase](https://supabase.com) - Managed PostgreSQL

#### Alternative Options
- **Frontend**: Netlify, Cloudflare Pages, AWS Amplify
- **Backend**: Render, Heroku, Fly.io, DigitalOcean App Platform
- **Database**: AWS RDS, Google Cloud SQL, PlanetScale

### Environment Configuration

#### Development vs Production
- **Development**: Uses Docker Compose for local development
- **Production**: Uses managed cloud services for scalability

#### Database Folder Usage
- **Development**: `database/init/` scripts initialize local PostgreSQL
- **Production**: Run `python database/production_setup.py` once on managed database
- **Ongoing**: Backend uses Alembic migrations for schema changes

### Deployment Commands
```bash
# Setup production environment
npm run setup:prod

# Database setup (run once)
npm run db:setup --database-url "your-production-database-url"

# Production build and deployment checks
npm run deploy:build
```

### Quick Deployment Guide
1. **Database**: Create Supabase project and run initialization script
2. **Backend**: Deploy to Railway with environment variables
3. **Frontend**: Deploy to Vercel with API URL configuration
4. **Configuration**: Update CORS origins and environment variables

For detailed deployment instructions, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## New Feature Development

### Adding New Features
When adding features not currently in the specs:

#### Quick Feature Creation
```bash
# Create a new feature specification
npm run create:feature "Feature Name" --description "Brief description" --priority high

# Example:
npm run create:feature "Payment Management" --description "Handle payments and billing" --priority high
```

This automatically creates:
- Feature specification: `specs/features/feature-name/README.md`
- API specification: `specs/api/feature-name.md`
- Database schema: `specs/database/feature-name.md`
- UI specification: `specs/ui/admin-dashboard/feature-name.md`

#### Manual Process
1. **Create Specifications**: Follow the established template in `specs/features/`
2. **Database Schema**: Add to `specs/database/`
3. **API Endpoints**: Document in `specs/api/`
4. **UI/UX Design**: Specify in `specs/ui/`

### Feature Specification Template
```
specs/features/[feature-name]/
├── README.md                 # Main feature specification
├── user-stories.md          # Detailed user stories (optional)
├── business-rules.md        # Complex business logic (optional)
└── technical-requirements.md # Detailed technical specs (optional)
```

### Sub-Agent Usage
Claude will automatically spawn sub-agents for:
- **Research Tasks**: Analyzing codebases, finding files, understanding patterns
- **Feature Analysis**: Reviewing specifications, identifying dependencies
- **Code Generation**: Creating consistent code following project patterns
- **Documentation**: Writing comprehensive documentation and guides

### Development Workflow
1. **Specification**: Create detailed specs following project template
2. **Database**: Design schema and migrations
3. **Backend**: Implement API endpoints and business logic
4. **Frontend**: Build UI components and integration
5. **Testing**: Write comprehensive tests for all layers
6. **Documentation**: Update API docs and user guides

## Version Information (Last Updated: 2025-01-08)
This project is configured with the latest stable versions as of January 2025. Key framework versions:
- Next.js 15.3.5 (latest stable)
- React 18.3.1 
- TypeScript 5.7.2
- Tailwind CSS 3.4.17
- FastAPI 0.115.12

### Recent Updates
- ✅ **Deployment Optimization**: Separate deployment strategy implemented
- ✅ **Environment Configuration**: Production-ready environment setup
- ✅ **Database Strategy**: Managed database service integration
- ✅ **Production Scripts**: Comprehensive build and deployment automation
- ✅ **Docker Support**: Optional containerized deployment configurations