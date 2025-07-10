# Academy Admin

A comprehensive Academy Management System built with modern full-stack technologies for educational institution management.

## 🎯 Current Status (Last Updated: 2025-07-10)

### ✅ Working Features
- **🔐 Authentication System**: JWT-based login with admin user
- **📚 Curriculum Management**: Programs CRUD with test data
- **🗄️ Database**: PostgreSQL with proper migrations
- **🌐 API**: FastAPI with comprehensive endpoints
- **🖥️ Frontend**: Next.js with shadcn/ui components
- **🐳 Docker**: Full containerized development environment

### 🚀 Quick Start
```bash
# Start the entire application
docker compose up

# Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:8000/docs
Admin Login: admin@academy.com / admin123
```

### 📊 Demo Data Available
- **5 Test Programs**: Robotics, AI/ML, Web Development, Sports, Arts
- **Admin User**: Ready to use with default credentials
- **Database**: Fully migrated with test data

## 🚀 Technology Stack

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
- **Testing**: Jest + Testing Library

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

### 🐳 Docker Development (Recommended)
```bash
# Start all services (frontend, backend, database)
docker compose up

# Start specific services
docker compose up backend
docker compose up frontend

# View logs
docker compose logs backend
docker compose logs frontend

# Stop all services
docker compose down

# Rebuild containers
docker compose up --build
```

### 🗄️ Database Management
```bash
# Run migrations
docker compose exec backend alembic upgrade head

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Create admin user (already done)
docker compose exec backend python setup_db.py
```

### 💻 Local Development (Alternative)
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start with local PostgreSQL
npm run dev:local
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
# Run all quality checks (recommended)
npm run quality:all

# Run frontend quality checks (linting, type checking, formatting)
npm run quality:frontend

# Run backend quality checks (linting, type checking, formatting)
npm run quality:backend

# Auto-fix quality issues
npm run quality:fix
```

### Testing
```bash
# Run all tests
npm run test:all

# Run frontend tests
npm run test:frontend

# Run frontend tests with coverage
npm run test:frontend:coverage

# Run backend tests
npm run test:backend

# Run backend tests with coverage
npm run test:backend:coverage

# Run end-to-end tests
npm run test:e2e
```

## ⚙️ Environment Setup

### Prerequisites
- **Node.js**: 18+ required
- **Python**: 3.12+ required
- **PostgreSQL**: Recommended for all environments
- **Redis**: Optional (for Celery background tasks)

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment (.env)
```env
DATABASE_URL=postgresql://admin:password@localhost:5432/academy_admin
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

## 🌐 API Endpoints

### 🔗 Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health/

### 🔑 Authentication Required Endpoints
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/curriculum/programs/` - List programs
- `POST /api/v1/curriculum/programs/` - Create program
- Most CRUD operations require authentication

### 📚 Curriculum API
All curriculum endpoints are under `/api/v1/curriculum/` and require authentication:
- **Programs**: `/programs/` - Manage educational programs
- **Courses**: `/courses/` - Manage courses within programs  
- **Curricula**: `/curricula/` - Manage specific curricula

## 🗄️ Database

### 🔧 Database Strategy
- **All Environments**: PostgreSQL (unified database strategy)
- **Development**: PostgreSQL via Docker (included in docker-compose)
- **Production**: Managed PostgreSQL (Supabase, AWS RDS, etc.)
- **Migrations**: Handled by Alembic with proper PostgreSQL configuration

### 📊 Current Schema
- **Users**: Authentication and user management
- **Students**: Student records and information
- **Programs**: Educational program definitions
- **Courses**: Courses within programs
- **Curricula**: Specific curriculum implementations

### 🧪 Test Data
Database includes 5 sample programs ready for testing:
1. **Robotics Engineering** (ROBOT-ENG) - Engineering category
2. **AI & Machine Learning** (AI-ML) - Technology category  
3. **Web Development** (WEB-DEV) - Technology category
4. **Sports Training** (SPORTS) - Sports category
5. **Arts & Creative** (ARTS) - Arts category

## 🧪 Testing & Quality

### Frontend Testing
- **Framework**: Jest with Next.js integration
- **Environment**: jsdom with React Testing Library
- **Coverage**: 70% threshold for branches, functions, lines, statements
- **Configuration**: `frontend/jest.config.js`

### Backend Testing
- **Framework**: Pytest 8.3.4 with async support
- **Test Database**: PostgreSQL test database
- **Coverage**: 70% threshold with HTML/XML reports
- **Markers**: Unit, integration, auth, database, API, feature-specific tests
- **Configuration**: `backend/pytest.ini` and `backend/pyproject.toml`

### Code Quality Tools
- **Frontend**: ESLint with Next.js rules, Prettier formatting
- **Backend**: Black (formatting), isort (imports), flake8 (linting), mypy (type checking)
- **Quality Commands**: `npm run quality:all` for comprehensive checks

## 🔒 Security Features

### Security Headers
- **Content Security Policy (CSP)**: Restricts resource loading
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS in production
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables cross-site scripting protection

### Rate Limiting
- **Default Limits**: 100 requests per 60 seconds per IP
- **Automatic Blocking**: Temporary 5-minute blocks for violators
- **Excluded Paths**: Health checks and documentation endpoints

### Request Monitoring
- **Comprehensive Logging**: All requests and responses logged
- **Performance Monitoring**: Response time tracking
- **Security Events**: Rate limit violations and suspicious activity

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
1. **Python Version**: Ensure Python 3.12+ is installed
2. **Node Version**: Ensure Node.js 18+ is installed
3. **Database**: PostgreSQL required (via Docker or local installation)
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