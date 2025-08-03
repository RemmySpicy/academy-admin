# Academy Admin - Project Structure Guide

## 📁 **Repository Overview**

The Academy Admin project uses a simplified single-repository structure with separate workspaces for web admin and mobile applications.

### 🎯 **Directory Structure**

```
Programming/
├── academy-admin/                          # Main admin system repository
│   ├── backend/                            # FastAPI backend
│   ├── frontend/                           # Next.js admin dashboard
│   ├── docs/                               # Documentation
│   ├── tools/                              # Quality assurance tools
│   └── scripts/                            # Development scripts
│
└── academy-apps/                           # Mobile apps workspace (separate)
    ├── academy-instructors-app/            # Instructor mobile app
    ├── academy-students-app/               # Student mobile app
    ├── shared/                             # Shared mobile resources
    ├── package.json                        # Mobile workspace config
    └── docker-compose.mobile.yml           # Mobile development environment
```

## 🔄 **Development Workflow**

### **Web Admin Development**
```bash
cd academy-admin
npm run dev                    # Backend + Frontend
```

### **Mobile Apps Development**
```bash
cd academy-apps
npm run install:all           # Install dependencies
npm run dev:all              # Start both mobile apps
```

### **Backend Integration**
Mobile apps connect to the same backend:
```bash
cd academy-admin
docker-compose up db backend  # Provides API for mobile apps
```

## 🏗️ **Academy Admin Structure**

### `backend/`
**FastAPI Backend System**
- RESTful API with 208+ endpoints
- PostgreSQL database with SQLAlchemy
- JWT authentication and role-based access
- Program context architecture
- Feature-based organization

### `frontend/`
**Next.js Admin Dashboard**
- TypeScript + Tailwind CSS
- React Query for data fetching
- Shadcn/ui components
- Program context management
- Role-based UI rendering

### `docs/`
**Comprehensive Documentation**
- API endpoints reference
- Development workflows
- Architecture documentation
- Feature implementation guides

### `tools/`
**Quality Assurance Tools**
- Code quality checks
- Security scanning
- Program context validation
- Test coverage analysis

## 📱 **Academy Apps Structure**

### `academy-instructors-app/`
**Instructor Mobile App**
- React Native/Expo configuration
- Student management features
- Attendance and progress tracking
- Communication tools

### `academy-students-app/`
**Student Mobile App**
- React Native/Expo configuration
- Course progress viewing
- Assignment management
- Parent communication features

### `shared/`
**Shared Mobile Resources**
- Common TypeScript types
- Unified API client
- Utility functions
- Cross-app components

## 🚀 **Development Commands**

### **Academy Admin (Web)**
```bash
cd academy-admin

# Development
npm run dev                    # Full stack development
npm run frontend:dev          # Frontend only
npm run backend:dev           # Backend only

# Quality assurance
npm run quality:academy       # Comprehensive checks
npm run test:all             # Run all tests
npm run build:all            # Production build
```

### **Mobile Apps**
```bash
cd academy-apps

# Development
npm run dev:all              # Both mobile apps
npm run dev:instructor       # Instructor app only
npm run dev:student         # Student app only

# Building
npm run build:all           # Build both apps
npm run test:all            # Test all apps

# Docker development
npm run docker:up           # Mobile development environment
```

## 🔗 **Backend Integration**

Both web and mobile applications connect to the same FastAPI backend:

- **API Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: JWT tokens with automatic refresh
- **Program Context**: Automatic data filtering by user program assignments
- **Real-time Features**: WebSocket support for live updates

### **API Features**
- 208+ RESTful endpoints
- Role-based access control (Super Admin, Program Admin, Coordinator, Tutor)
- Program context filtering for multi-tenant data isolation
- Comprehensive error handling and validation

## 📋 **Development Best Practices**

### **Web Admin Development**
1. Use program context hooks for data fetching
2. Follow feature-based organization in `src/features/`
3. Use TypeScript strictly with proper type definitions
4. Run quality checks before committing
5. Test across different user roles and programs

### **Mobile Development**
1. Develop in the `academy-apps` workspace
2. Use shared resources for consistency
3. Test with real backend integration
4. Follow React Native/Expo best practices
5. Ensure offline capability where appropriate

### **Shared Development**
1. Keep backend API documentation updated
2. Use consistent data models across web and mobile
3. Maintain program context throughout all applications
4. Test integration between web and mobile features

## 🔧 **Configuration**

### **Environment Setup**
- **Node.js**: 18+
- **Docker**: For development environment
- **PostgreSQL**: Database (via Docker)
- **Redis**: Caching (optional)

### **Required Environment Variables**
```bash
# Academy Admin
DATABASE_URL=postgresql://...
JWT_SECRET=...
PROGRAM_CONTEXT_ENABLED=true

# Mobile Apps
API_BASE_URL=http://localhost:8000/api/v1
WS_BASE_URL=ws://localhost:8000/ws
```

## 📚 **Documentation**

- **Setup Guide**: [`docs/setup/PROJECT_SETUP.md`](docs/setup/PROJECT_SETUP.md)
- **API Reference**: [`docs/api/API_ENDPOINTS.md`](docs/api/API_ENDPOINTS.md)
- **Architecture**: [`docs/architecture/`](docs/architecture/)
- **Features**: [`docs/features/`](docs/features/)
- **Mobile Apps**: [`../academy-apps/README.md`](../academy-apps/README.md)

This simplified structure provides clean separation between web admin and mobile applications while maintaining shared backend integration and development consistency.