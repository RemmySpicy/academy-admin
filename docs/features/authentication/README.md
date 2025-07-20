# Academy Admin Authentication Guide

## 🔐 Authentication System Overview

Academy Admin uses JWT (JSON Web Token) based authentication with the following components:
- **Backend**: FastAPI with PyJWT and Passlib for secure authentication
- **Frontend**: Next.js with custom authentication context
- **Database**: PostgreSQL users table with hashed passwords

## 🚀 Quick Start

### Default Admin Credentials
```
Email: admin@academy.com
Password: admin123
```

### Login Process
1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials
3. Upon successful login, you'll be redirected to `/admin/curriculum`
4. JWT token is stored in the browser and used for API requests

## 🔧 Authentication Flow

### 1. User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@academy.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "admin@academy.com",
    "full_name": "Administrator",
    "role": "super_admin",
    "is_active": true
  }
}
```

### 2. Protected API Requests
All subsequent API requests must include the Bearer token:
```http
GET /api/v1/curriculum/programs/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Token Validation
- Tokens are validated on every protected endpoint
- Invalid/expired tokens return 401 Unauthorized
- Token expiry: 30 minutes (configurable)

## 🗄️ Database Setup

### Users Table Structure
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Default Admin User Creation
The admin user is automatically created by the `setup_db.py` script:
```python
admin_user = User(
    id=str(uuid.uuid4()),
    username="admin",
    email="admin@academy.com",
    password_hash=hash_password("admin123"),
    full_name="Administrator",
    role="super_admin",
    is_active=True
)
```

## 🔒 Security Features

### Password Hashing
- Uses Passlib with bcrypt for secure password hashing
- Passwords are never stored in plain text
- Salt is automatically generated for each password

### JWT Token Security
- Tokens are signed with a secret key (configurable via `SECRET_KEY`)
- Algorithm: HS256 (configurable via `ALGORITHM`)
- Expiry time: 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

### Protected Routes
**Frontend Routes:**
- `/admin/*` - Requires authentication
- `/login` - Public route
- Automatic redirect to `/login` if not authenticated

**Backend Endpoints:**
- `/api/v1/auth/login` - Public
- `/api/v1/health/` - Public  
- All other `/api/v1/*` endpoints - Protected

## 🛠️ Configuration

### Backend Environment Variables
```bash
# JWT Configuration
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/academy_admin
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 👥 User Roles

### Current Role System
- **admin**: Full access to all features
- **user**: Standard user access (future implementation)

### Role-Based Access (Future)
```python
# Example of future role-based decorators
@require_role("super_admin")
def admin_only_endpoint():
    pass

@require_role(["super_admin", "program_admin"])
def teacher_access_endpoint():
    pass
```

## 🔄 Session Management

### Frontend Session
- JWT token stored in browser memory (not localStorage for security)
- Token automatically included in API requests via Axios interceptors
- Session expires after token expiry (30 minutes)
- User redirected to login on token expiry

### Backend Session
- Stateless JWT tokens (no server-side session storage)
- Each request validates the token independently
- No session cleanup required

## 🚨 Security Best Practices

### Current Implementation
✅ **Password Hashing**: Bcrypt with salt  
✅ **JWT Tokens**: Signed and time-limited  
✅ **HTTPS Ready**: CORS configured for production  
✅ **Input Validation**: Pydantic schemas validate all inputs  
✅ **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection  

### Production Recommendations
- [ ] Change default admin password immediately
- [ ] Use strong SECRET_KEY (generate with `openssl rand -hex 32`)
- [ ] Enable HTTPS in production
- [ ] Implement password complexity requirements
- [ ] Add rate limiting for login attempts
- [ ] Implement refresh tokens for longer sessions
- [ ] Add two-factor authentication (2FA)

## 🔧 Development & Testing

### Creating Test Users
```python
# Add to setup_db.py or create a separate script
test_user = User(
    id=str(uuid.uuid4()),
    username="testuser",
    email="test@academy.com",
    password_hash=hash_password("testpass123"),
    full_name="Test User",
    role="user",
    is_active=True
)
```

### Testing Authentication
```bash
# Login and get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@academy.com", "password": "admin123"}'

# Use token for protected requests
curl -X GET http://localhost:8000/api/v1/curriculum/programs/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Troubleshooting

### Common Issues

**1. "Not authenticated" errors**
- Check if token is included in request headers
- Verify token hasn't expired
- Ensure login was successful

**2. "Invalid credentials" on login**
- Verify admin user exists in database
- Check if password is correct: `admin123`
- Ensure database is properly migrated

**3. Frontend redirects to login**
- Token may have expired
- Check browser network tab for 401 errors
- Verify API URL is correctly configured

**4. CORS errors in production**
- Update `CORS_ORIGINS` in backend environment
- Ensure frontend domain is included
- Check for trailing slashes in URLs

### Debug Commands
```bash
# Check if admin user exists
docker compose exec backend python -c "
from app.features.common.models.database import get_db
from app.features.authentication.models.user import User
db = next(get_db())
admin = db.query(User).filter(User.email == 'admin@academy.com').first()
print('Admin exists:', admin is not None)
"

# Test password verification
docker compose exec backend python -c "
from app.core.security import verify_password, hash_password
print('Password check:', verify_password('admin123', hash_password('admin123')))
"
```

## 🔮 Future Enhancements

### Planned Features
- **User Management**: CRUD operations for users
- **Role Management**: Dynamic role assignment
- **Password Reset**: Email-based password recovery
- **Multi-Factor Authentication**: TOTP/SMS verification
- **Session Management**: Active session monitoring
- **Audit Logging**: Track authentication events

### API Endpoints (Future)
```http
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/refresh        # Refresh token
POST /api/v1/auth/reset-password # Password reset
GET  /api/v1/users/              # User management
PUT  /api/v1/users/{id}/role     # Role assignment
```