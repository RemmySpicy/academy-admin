# Academy Admin

A comprehensive Academy Management System built with modern full-stack technologies for educational institution management.

## 🚀 Technology Stack

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

## 📁 Project Structure

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

## 🛠️ Development Commands

### Setup
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Install frontend dependencies only
npm run install:frontend

# Install backend dependencies only
npm run install:backend
```

### Development
```bash
# Start both frontend and backend in development mode
npm run dev

# Start frontend only (port 3000)
npm run frontend:dev

# Start backend only (port 8000)
npm run backend:dev
```

### Production
```bash
# Build frontend for production
npm run frontend:build

# Start backend in production mode
npm run backend:start
```

### Code Quality
```bash
# Run frontend linting
npm run lint:frontend

# Run TypeScript type checking
npm run type-check:frontend

# Run backend tests
npm run test:backend
```

## ⚙️ Environment Setup

### Prerequisites
- **Node.js**: 18+ required
- **Python**: 3.11+ required
- **Redis**: Optional (for Celery background tasks)

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment (.env)
```env
DATABASE_URL=sqlite:///./academy_admin.db
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
```

## 🌐 API Endpoints

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## 🗄️ Database

- **Development**: SQLite (academy_admin.db)
- **Production**: PostgreSQL (configurable via DATABASE_URL)

## 🧪 Testing

- **Frontend**: React Testing Library + Jest (via Next.js)
- **Backend**: Pytest with async support
- **API Testing**: FastAPI TestClient

## 🚀 Deployment

- **Frontend**: Vercel, Netlify, or similar platforms
- **Backend**: Railway, Heroku, or cloud providers
- **Database**: PostgreSQL recommended for production
- **Migrations**: Handled by Alembic

## 📚 Documentation

- **Feature Specifications**: `specs/features/`
- **API Specifications**: `specs/api/`
- **Database Schema**: `specs/database/`
- **UI/UX Specifications**: `specs/ui/`

## 🔧 Common Issues & Solutions

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.