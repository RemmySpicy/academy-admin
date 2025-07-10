# Academy Admin API Documentation

## 🔗 Base Information

- **Base URL**: `http://localhost:8000` (development) / `https://your-backend.railway.app` (production)
- **API Version**: `v1`
- **Documentation**: Available at `/docs` (Swagger UI)
- **Authentication**: JWT Bearer tokens

## 🔑 Authentication

### Login
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
    "role": "admin",
    "is_active": true
  }
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

## 📚 Curriculum Management

### Programs

#### List Programs
```http
GET /api/v1/curriculum/programs/
Authorization: Bearer <token>

# Optional query parameters:
# ?page=1&per_page=20&category=Technology&status=active&search=robotics
```

**Response:**
```json
{
  "items": [
    {
      "id": "afc876b2-...",
      "name": "Robotics Engineering",
      "description": "Complete robotics engineering program",
      "category": "Engineering",
      "status": "active",
      "display_order": 1,
      "program_code": "ROBOT-ENG",
      "created_by": "admin",
      "updated_by": "admin",
      "created_at": "2025-07-10T05:12:28.811372",
      "updated_at": "2025-07-10T05:12:28.811372"
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 20,
  "pages": 1
}
```

#### Get Program by ID
```http
GET /api/v1/curriculum/programs/{program_id}
Authorization: Bearer <token>
```

#### Create Program
```http
POST /api/v1/curriculum/programs/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Program",
  "description": "Program description",
  "category": "Technology",
  "status": "active",
  "display_order": 6,
  "program_code": "NEW-PROG"
}
```

#### Update Program
```http
PUT /api/v1/curriculum/programs/{program_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Program Name",
  "description": "Updated description"
}
```

#### Delete Program
```http
DELETE /api/v1/curriculum/programs/{program_id}
Authorization: Bearer <token>
```

### Courses

#### List Courses
```http
GET /api/v1/curriculum/courses/
Authorization: Bearer <token>

# Optional query parameters:
# ?program_id=uuid&page=1&per_page=20&difficulty_level=beginner
```

#### Create Course
```http
POST /api/v1/curriculum/courses/
Authorization: Bearer <token>
Content-Type: application/json

{
  "program_id": "program-uuid-here",
  "name": "Introduction to Programming",
  "description": "Basic programming concepts",
  "objectives": "Learn fundamental programming skills",
  "duration_hours": 40,
  "difficulty_level": "beginner",
  "prerequisites": "None",
  "sequence": 1,
  "course_code": "PROG-101",
  "status": "active"
}
```

### Curricula

#### List Curricula
```http
GET /api/v1/curriculum/curricula/
Authorization: Bearer <token>

# Optional query parameters:
# ?course_id=uuid&page=1&per_page=20&difficulty_level=intermediate
```

#### Create Curriculum
```http
POST /api/v1/curriculum/curricula/
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course-uuid-here",
  "name": "Programming Fundamentals Curriculum",
  "description": "Detailed curriculum for programming basics",
  "objectives": "Master programming fundamentals",
  "duration_hours": 20,
  "difficulty_level": "beginner",
  "prerequisites": "None",
  "sequence": 1,
  "curriculum_code": "PROG-101-CURR",
  "status": "active"
}
```

## 🏥 Health Check

### API Health
```http
GET /api/v1/health/
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Academy Admin API is running"
}
```

## 👥 Students (Basic Structure)

### List Students
```http
GET /api/v1/students/
Authorization: Bearer <token>

# Optional query parameters:
# ?page=1&per_page=20&status=active&search=john
```

## 🔧 API Response Format

### Success Response
```json
{
  "items": [...],      // For list endpoints
  "data": {...},       // For single item endpoints
  "total": 100,        // Total count (list endpoints)
  "page": 1,           // Current page (list endpoints)
  "per_page": 20,      // Items per page (list endpoints)
  "pages": 5           // Total pages (list endpoints)
}
```

### Error Response
```json
{
  "detail": "Error message here",
  "code": "ERROR_CODE",
  "field": "field_name"  // For validation errors
}
```

## 🛡️ Authentication Requirements

**Protected Endpoints (require Bearer token):**
- All `/api/v1/curriculum/*` endpoints
- All `/api/v1/students/*` endpoints
- `/api/v1/auth/me`
- `/api/v1/auth/logout`

**Public Endpoints (no authentication required):**
- `/api/v1/auth/login`
- `/api/v1/health/`
- `/docs` (API documentation)

## 📊 Current Test Data

### Admin User
- **Email**: `admin@academy.com`
- **Password**: `admin123`
- **Role**: `admin`

### Sample Programs (5 available)
1. **Robotics Engineering** (ROBOT-ENG) - Engineering
2. **AI & Machine Learning** (AI-ML) - Technology
3. **Web Development** (WEB-DEV) - Technology
4. **Sports Training** (SPORTS) - Sports
5. **Arts & Creative** (ARTS) - Arts

## 🚀 Getting Started

1. **Start the API**: `docker compose up backend`
2. **Login**: POST to `/api/v1/auth/login` with admin credentials
3. **Get Bearer Token**: Save the `access_token` from login response
4. **Make Authenticated Requests**: Include `Authorization: Bearer <token>` header
5. **Explore Programs**: GET `/api/v1/curriculum/programs/`

## 📖 Interactive Documentation

Visit `http://localhost:8000/docs` for interactive API documentation with:
- Complete endpoint listings
- Request/response schemas
- Try-it-out functionality
- Authentication testing

## 🔍 Common Use Cases

### Get All Programs for a Category
```http
GET /api/v1/curriculum/programs/?category=Technology
Authorization: Bearer <token>
```

### Create a Complete Program → Course → Curriculum Flow
1. Create Program → Get program_id
2. Create Course with program_id → Get course_id  
3. Create Curriculum with course_id

### Search Programs
```http
GET /api/v1/curriculum/programs/?search=robotics
Authorization: Bearer <token>
```