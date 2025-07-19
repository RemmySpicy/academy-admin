# Academy Admin - System Overview

## Architecture Philosophy

The Academy Admin system is built on a **program-centric architecture** where educational programs serve as the primary organizational and security boundary. This design ensures data isolation, role-based access control, and scalable multi-program management.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Academy Admin System                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15)              Backend (FastAPI)       │
│  ┌─────────────────────┐            ┌──────────────────────┐ │
│  │ Program Context     │◄──────────►│ Program Context      │ │
│  │ Management          │ HTTP       │ Middleware           │ │
│  │                     │ Headers    │                      │ │
│  │ - Role-based UI     │            │ - Auto Filtering     │ │
│  │ - Program Switcher  │            │ - Access Control     │ │
│  │ - Context Injection │            │ - Data Isolation     │ │
│  └─────────────────────┘            └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Database (PostgreSQL)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Program-Scoped Tables (program_id FK on all)           │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │ │
│  │ │Students │ │Courses  │ │Faciliti.│ │Course Hierarchy │ │ │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │ │
│  │                                                         │ │
│  │ Academy-Wide Tables                                     │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────────────────────────┐ │ │
│  │ │Programs │ │Users    │ │User Program Assignments     │ │ │
│  │ └─────────┘ └─────────┘ └─────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. **Program-Centric Organization**
- Programs are the top-level organizational unit
- All educational data is scoped by program
- Users are assigned to specific programs based on their role
- Data isolation prevents cross-program access

### 2. **Role-Based Access Control**
- **Super Admin**: System-wide access + academy administration
- **Program Admin**: Full management within assigned programs
- **Program Coordinator**: Student-focused management within programs
- **Tutor**: Read-only interaction within programs

### 3. **HTTP Header-Based Context**
- `X-Program-Context` header automatically injected by frontend
- `X-Bypass-Program-Filter` header for super admin cross-program operations
- Middleware automatically filters all API responses by program context

### 4. **Security-First Design**
- Automatic program context validation
- Cross-program access prevention
- Role-based endpoint restrictions
- Data isolation at database level

## System Components

### **Frontend (Next.js 15)**
- **App Router**: Modern routing with route groups
- **Program Context Store**: Zustand-based state management
- **HTTP Client**: Automatic program context injection
- **Role-Based UI**: Dynamic interface based on user permissions
- **Unsaved Changes Protection**: Data loss prevention during context switching

### **Backend (FastAPI)**
- **Modular Architecture**: Feature-based organization
- **Program Context Middleware**: Automatic filtering and validation
- **Service Layer**: Business logic with program context enforcement
- **Role-Based Dependencies**: Decorator-based access control
- **Comprehensive Testing**: Role-based and program context tests

### **Database (PostgreSQL)**
- **Program Context Schema**: Foreign key relationships for data scoping
- **UUID Primary Keys**: Enhanced security and performance
- **Alembic Migrations**: Version-controlled schema management
- **Optimized Indexes**: Performance optimization for program-filtered queries

## Data Flow

### **User Authentication & Program Selection**
1. User logs in with credentials
2. Backend validates and returns JWT with role and program assignments
3. Frontend automatically selects appropriate program context
4. All subsequent API calls include program context headers

### **API Request Flow**
1. Frontend makes API request with automatic headers
2. Program context middleware extracts and validates context
3. Service layer filters data based on program context
4. Database queries automatically include program filtering
5. Response contains only program-scoped data

### **Security Enforcement**
1. Every API endpoint validates user program access
2. Database queries include program context filtering
3. Cross-program data access blocked (except Super Admin bypass)
4. Role-based permissions enforced at route level

## Technology Decisions

### **Why Program-Centric?**
- **Scalability**: Support multiple educational programs
- **Security**: Natural data isolation boundaries
- **Multi-tenancy**: Clean separation without complex tenant systems
- **User Experience**: Context-aware interface for different programs

### **Why HTTP Headers for Context?**
- **Automatic**: No manual context passing required
- **Secure**: Validated at middleware level
- **Flexible**: Easy to override for super admin operations
- **Transparent**: Clear separation of concerns

### **Why Role-Based Architecture?**
- **Educational Focus**: Matches real-world academy hierarchies
- **Progressive Access**: Roles build upon each other naturally
- **Simplified Permissions**: Clear access patterns
- **Maintainable**: Easy to understand and modify

## Performance Considerations

### **Database Optimization**
- Indexed `program_id` columns for fast filtering
- Query optimization with program context
- Connection pooling for concurrent access
- Efficient pagination for large datasets

### **Frontend Optimization**
- Context caching to minimize state changes
- Optimistic updates for better user experience
- Lazy loading for program-specific components
- Efficient re-renders with React Query

### **API Optimization**
- Program context middleware for consistent filtering
- Bulk operations with program context validation
- Efficient serialization with program-scoped data
- Response caching where appropriate

## Deployment Architecture

### **Containerized Development**
- Docker Compose for local development
- Separate containers for frontend, backend, database
- Environment-specific configuration
- Consistent development across team

### **Production Deployment**
- Separate deployment of frontend (Vercel/Netlify)
- Backend API deployment (Railway/Render)
- Managed PostgreSQL (Supabase/RDS)
- Environment-based configuration management

## Quality Assurance

### **Automated Testing**
- Role-based access control tests
- Program context filtering validation
- Cross-program access prevention tests
- Multi-role scenario testing

### **Code Quality**
- Program context linting and validation
- Security vulnerability scanning
- Automated quality checks in CI/CD
- Pre-commit hooks for compliance

### **Documentation**
- Architecture documentation (this file)
- API specifications with program context examples
- Development workflow guides
- Feature specifications for all major components