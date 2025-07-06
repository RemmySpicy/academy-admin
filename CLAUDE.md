# Academy Admin - Project Information

## Project Overview
Academy Management System built with modern full-stack technologies for comprehensive educational institution management.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Drag & Drop**: React DnD Kit
- **Date Handling**: Date-fns

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: SQLAlchemy (ORM)
- **Validation**: Pydantic
- **Migrations**: Alembic
- **Server**: Uvicorn (ASGI)
- **Background Tasks**: Celery
- **Testing**: Pytest
- **Authentication**: PyJWT + Passlib
- **File Uploads**: Python-multipart
- **Email Templates**: Jinja2

## Project Structure

```
academy-admin/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── store/          # Zustand stores
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── tests/              # Test files
│   └── requirements.txt
├── specs/                   # Feature specifications
└── docs/                   # Project documentation
```

## Development Commands

### Setup
- `npm run install:all` - Install all dependencies (frontend + backend)
- `npm run install:frontend` - Install frontend dependencies only
- `npm run install:backend` - Install backend dependencies only

### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run frontend:dev` - Start frontend only (port 3000)
- `npm run backend:dev` - Start backend only (port 8000)

### Production
- `npm run frontend:build` - Build frontend for production
- `npm run backend:start` - Start backend in production mode

### Code Quality
- `npm run lint:frontend` - Run frontend linting
- `npm run type-check:frontend` - Run TypeScript type checking
- `npm run test:backend` - Run backend tests

## Environment Setup

### Frontend Environment (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment (.env)
```
DATABASE_URL=sqlite:///./academy_admin.db
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
```

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

## Database
- **Development**: SQLite (academy_admin.db)
- **Production**: PostgreSQL (configurable via DATABASE_URL)

## Testing
- **Frontend**: React Testing Library + Jest (via Next.js)
- **Backend**: Pytest with async support
- **API Testing**: FastAPI TestClient

## Deployment Notes
- Frontend can be deployed to Vercel, Netlify, or similar
- Backend can be deployed to Railway, Heroku, or cloud providers
- Database migrations handled by Alembic
- Environment variables must be set in production

## Common Issues & Solutions

### Development Setup
1. **Python Version**: Ensure Python 3.11+ is installed
2. **Node Version**: Ensure Node.js 18+ is installed
3. **Database**: SQLite is used by default, no additional setup needed
4. **Redis**: Required for Celery background tasks (optional for basic setup)

### Port Conflicts
- Frontend: 3000 (configurable in package.json)
- Backend: 8000 (configurable in backend dev script)

### CORS Issues
- CORS is configured in backend to allow frontend origin
- Update BACKEND_CORS_ORIGINS in settings if needed