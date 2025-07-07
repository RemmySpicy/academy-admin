# Academy Admin Backend

The backend API for the Academy Admin system, built with FastAPI and modern Python technologies.

## 🚀 Technology Stack

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
backend/
├── app/
│   ├── api/                 # API routes
│   │   ├── api_v1/         # Version 1 API
│   │   │   ├── endpoints/  # API endpoints
│   │   │   └── api.py      # API router
│   │   └── __init__.py
│   ├── core/               # Core configuration
│   │   ├── config.py       # Application settings
│   │   └── __init__.py
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── main.py             # FastAPI application
│   └── __init__.py
├── tests/                  # Test files
├── requirements.txt        # Python dependencies
└── alembic/               # Database migrations (will be created)
```

## 🛠️ Development

### Prerequisites
- Python 3.11+ required
- pip package manager
- Redis (optional, for Celery background tasks)

### Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Or from project root
npm run install:backend
```

### Development Server
```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or from project root
npm run backend:dev
```

The API will be available at http://localhost:8000

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./academy_admin.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

## 📦 Key Dependencies

### Core
- **fastapi**: Modern web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation
- **sqlalchemy**: ORM
- **alembic**: Database migrations

### Database
- **sqlite**: Default database (development)
- **psycopg2**: PostgreSQL adapter (production)

### Authentication
- **python-jose[cryptography]**: JWT tokens
- **passlib[bcrypt]**: Password hashing
- **python-multipart**: File uploads

### Background Tasks
- **celery**: Task queue
- **redis**: Message broker

### Testing
- **pytest**: Testing framework
- **pytest-asyncio**: Async testing
- **httpx**: HTTP client for testing

## 🗄️ Database

### Default Setup
The backend uses SQLite by default for development. The database file will be created automatically as `academy_admin.db`.

### PostgreSQL Setup (Production)
```bash
# Install PostgreSQL dependencies
pip install psycopg2-binary

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost/academy_admin
```

### Migrations
```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_api.py

# Run tests in watch mode
pytest-watch
```

## 🔧 Scripts

```bash
# Development
uvicorn app.main:app --reload    # Start development server
python -m pytest               # Run tests

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Start production server

# Database
alembic upgrade head            # Apply migrations
alembic revision --autogenerate # Create migration
```

## 🚀 API Endpoints

### Health Check
- `GET /api/v1/health` - Health check endpoint

### Authentication (planned)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token

### Users (planned)
- `GET /api/v1/users/` - List users
- `POST /api/v1/users/` - Create user
- `GET /api/v1/users/{id}` - Get user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

## 🔐 Security

### Authentication
- JWT tokens for API authentication
- Bcrypt for password hashing
- Token expiration and refresh

### CORS
- Configured to allow frontend origin
- Adjustable via environment variables

### Data Validation
- Pydantic models for request/response validation
- SQLAlchemy models for database validation

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway/Heroku
1. Set environment variables
2. Use PostgreSQL database
3. Run migrations on deployment

### Production Considerations
- Use PostgreSQL instead of SQLite
- Set up Redis for Celery tasks
- Configure proper CORS origins
- Use environment variables for secrets
- Set up monitoring and logging

## 📚 Development Guidelines

### Code Structure
- **models/**: SQLAlchemy database models
- **schemas/**: Pydantic request/response models
- **services/**: Business logic and database operations
- **api/endpoints/**: API route handlers
- **utils/**: Helper functions and utilities

### Naming Conventions
- Files: snake_case
- Classes: PascalCase
- Functions/variables: snake_case
- Constants: UPPER_SNAKE_CASE

### Error Handling
- Use FastAPI's HTTPException for API errors
- Log errors appropriately
- Return meaningful error messages

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write tests for new features
4. Update API documentation
5. Run linting and tests before committing