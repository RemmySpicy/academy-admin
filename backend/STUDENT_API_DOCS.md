# Student API Documentation

## ✅ **Student CRUD API - COMPLETED**

### **Base URL**: `http://localhost:8000/api/v1/students`

### **Authentication**
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## **API Endpoints**

### **1. Create Student**
```http
POST /api/v1/students/
Content-Type: application/json
Authorization: Bearer <token>

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "salutation": "Mr",
  "referral_source": "Website",
  "enrollment_date": "2025-01-01",
  "status": "active",
  "address": {
    "line1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postal_code": "12345",
    "country": "US"
  },
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "555-987-6543",
    "relationship": "Mother"
  },
  "medical_info": {
    "conditions": "None",
    "medications": "None",
    "allergies": "Peanuts"
  },
  "notes": "Great student"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "student_id": "STU-2025-0002",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "salutation": "Mr",
  "referral_source": "Website",
  "enrollment_date": "2025-01-01",
  "status": "active",
  "address": {
    "line1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postal_code": "12345",
    "country": "US"
  },
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "555-987-6543",
  "emergency_contact_relationship": "Mother",
  "medical_conditions": "None",
  "medications": "None",
  "allergies": "Peanuts",
  "notes": "Great student",
  "created_at": "2025-01-08T18:00:00Z",
  "updated_at": "2025-01-08T18:00:00Z"
}
```

### **2. List Students**
```http
GET /api/v1/students/?page=1&per_page=20
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `search` (string): Search query (name, email, student_id)
- `status` (string): Filter by status (active, inactive, pending, suspended)
- `enrollment_date_from` (date): Filter by enrollment date from
- `enrollment_date_to` (date): Filter by enrollment date to
- `gender` (string): Filter by gender
- `sort_by` (string): Sort field
- `sort_order` (string): Sort order (asc, desc)

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "student_id": "STU-2025-0001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "status": "active",
      "enrollment_date": "2025-01-01",
      "created_at": "2025-01-08T18:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

### **3. Get Student**
```http
GET /api/v1/students/{student_id}
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "student_id": "STU-2025-0001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "status": "active",
  "enrollment_date": "2025-01-01",
  "address": {
    "line1": "123 Main St",
    "city": "Anytown",
    "state": "CA"
  },
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "555-987-6543",
  "medical_conditions": "None",
  "created_at": "2025-01-08T18:00:00Z",
  "updated_at": "2025-01-08T18:00:00Z"
}
```

### **4. Update Student**
```http
PUT /api/v1/students/{student_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "phone": "555-999-8888",
  "notes": "Updated student information"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "student_id": "STU-2025-0001",
  "phone": "555-999-8888",
  "notes": "Updated student information",
  "updated_at": "2025-01-08T18:30:00Z"
}
```

### **5. Delete Student** (Admin Only)
```http
DELETE /api/v1/students/{student_id}
Authorization: Bearer <token>
```

**Response** (204 No Content)

### **6. Get Student Statistics**
```http
GET /api/v1/students/stats
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "total_students": 50,
  "active_students": 45,
  "inactive_students": 3,
  "pending_students": 2,
  "suspended_students": 0,
  "students_by_gender": {
    "male": 25,
    "female": 23,
    "other": 2
  },
  "students_by_age_group": {
    "0-10": 15,
    "11-15": 20,
    "16-18": 10,
    "19+": 5
  },
  "recent_enrollments": 8
}
```

### **7. Bulk Actions**
```http
POST /api/v1/students/bulk-action
Content-Type: application/json
Authorization: Bearer <token>

{
  "student_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "action": "update_status",
  "parameters": {
    "status": "inactive"
  }
}
```

**Response** (200 OK):
```json
{
  "successful": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "failed": [],
  "total_processed": 2,
  "total_successful": 2,
  "total_failed": 0
}
```

### **8. Get Student by Student ID**
```http
GET /api/v1/students/by-student-id/{student_id}
Authorization: Bearer <token>
```

Example: `GET /api/v1/students/by-student-id/STU-2025-0001`

---

## **Data Models**

### **Student Fields**
- `id` (string): UUID primary key
- `student_id` (string): Formatted ID (STU-YYYY-NNNN)
- `first_name` (string): Student's first name
- `last_name` (string): Student's last name
- `email` (string): Student's email address (unique)
- `phone` (string): Student's phone number
- `date_of_birth` (date): Student's date of birth
- `gender` (enum): male, female, other, prefer_not_to_say
- `salutation` (enum): Mr, Mrs, Ms, Dr, Prof
- `referral_source` (string): How student heard about academy
- `enrollment_date` (date): Date of enrollment
- `status` (enum): active, inactive, pending, suspended
- `address` (object): Address information
- `emergency_contact_name` (string): Emergency contact name
- `emergency_contact_phone` (string): Emergency contact phone
- `emergency_contact_relationship` (string): Relationship to student
- `medical_conditions` (string): Medical conditions
- `medications` (string): Current medications
- `allergies` (string): Known allergies
- `notes` (string): Additional notes
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp
- `created_by` (string): Created by user ID
- `updated_by` (string): Updated by user ID

### **Address Object**
```json
{
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "Anytown",
  "state": "CA",
  "postal_code": "12345",
  "country": "US"
}
```

### **Status Values**
- `active`: Active student
- `inactive`: Inactive student
- `pending`: Pending enrollment
- `suspended`: Suspended student

### **Gender Values**
- `male`: Male
- `female`: Female
- `other`: Other
- `prefer_not_to_say`: Prefer not to say

---

## **Error Responses**

### **400 Bad Request**
```json
{
  "detail": "Email already exists"
}
```

### **401 Unauthorized**
```json
{
  "detail": "Could not validate credentials"
}
```

### **403 Forbidden**
```json
{
  "detail": "Only administrators can delete students"
}
```

### **404 Not Found**
```json
{
  "detail": "Student not found"
}
```

### **422 Validation Error**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## **Features Implemented**

### **✅ Core CRUD Operations**
- Create student with full profile
- Read student details
- Update student information (partial updates)
- Delete student (admin only)

### **✅ Advanced Features**
- Auto-generated student IDs (STU-YYYY-NNNN)
- Comprehensive search and filtering
- Pagination support
- Student statistics
- Bulk operations
- Address handling (JSON storage)
- Emergency contact management
- Medical information tracking

### **✅ Security & Validation**
- JWT authentication required
- Role-based access control
- Input validation with Pydantic
- Email uniqueness enforcement
- Data sanitization

### **✅ Database Integration**
- SQLite database with proper indexing
- Audit trail (created_by, updated_by)
- Timestamp tracking
- JSON storage for flexible data

---

## **Usage Examples**

### **Create and Manage Students**
```bash
# Login first
curl -X POST http://localhost:8000/api/v1/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Create student
curl -X POST http://localhost:8000/api/v1/students/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe", "email": "john@example.com", "date_of_birth": "2010-05-15", "enrollment_date": "2025-01-01"}'

# List students
curl -X GET "http://localhost:8000/api/v1/students/?page=1&per_page=10" \
  -H "Authorization: Bearer <token>"

# Search students
curl -X GET "http://localhost:8000/api/v1/students/?search=John&status=active" \
  -H "Authorization: Bearer <token>"
```

---

## **Status: Student CRUD API COMPLETE** ✅

All student management endpoints are fully implemented with comprehensive validation, security, and database integration.