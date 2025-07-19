# Academy Admin - Project Structure Guide

## 📁 **Repository Overview**

The Academy Admin project uses a multi-repository architecture with Git subtrees for managing separate mobile applications while maintaining a unified development environment.

### 🎯 **Repository Structure**

```
RemmySpicy/academy-admin                    # Main development repository
├── apps/                                   # Multi-app development environment
│   ├── academy-tutor-app/                 # Tutor mobile app (development)
│   └── academy-students-app/              # Student mobile app (development)
├── shared/                                 # Shared resources across all apps
├── backend/                                # FastAPI backend
├── frontend/                               # Next.js admin dashboard
└── scripts/                                # Git subtree automation scripts

RemmySpicy/academy-tutor-app                # Standalone tutor app repository
└── [Complete React Native/Expo app]       # Deployed from apps/academy-tutor-app/

RemmySpicy/academy-students-app             # Standalone student app repository
└── [Complete React Native/Expo app]       # Deployed from apps/academy-students-app/
```

## 🔄 **Development Workflow**

### **Primary Development Location**
- **Work in**: `RemmySpicy/academy-admin` repository
- **Develop mobile apps in**: `apps/academy-tutor-app/` and `apps/academy-students-app/`
- **Shared resources in**: `shared/` directory

### **Deployment Flow**
```
apps/academy-tutor-app/     →  (Git Subtree)  →  RemmySpicy/academy-tutor-app
apps/academy-students-app/  →  (Git Subtree)  →  RemmySpicy/academy-students-app
```

### **Git Subtree Commands**
```bash
# Sync shared resources to mobile apps
npm run subtree:sync

# Deploy tutor app updates
npm run subtree:push:tutor

# Deploy student app updates  
npm run subtree:push:student

# Deploy both mobile apps
npm run subtree:push
```

## 🏗️ **Apps Directory Structure**

### `apps/academy-tutor-app/`
**Purpose**: Development version of the tutor mobile app
- React Native/Expo configuration
- Shared API client integration
- TypeScript type definitions
- Example service implementations
- Existing code migration folder

### `apps/academy-students-app/`
**Purpose**: Development version of the student mobile app
- React Native/Expo configuration
- Shared API client integration
- TypeScript type definitions
- Example service implementations
- Existing code migration folder

## 📱 **Mobile App Repositories**

### `RemmySpicy/academy-tutor-app`
**Purpose**: Standalone deployment repository for tutor app
- Complete React Native/Expo project
- Includes shared resources
- Ready for app store deployment
- Independent development possible

### `RemmySpicy/academy-students-app`
**Purpose**: Standalone deployment repository for student app
- Complete React Native/Expo project
- Includes shared resources
- Ready for app store deployment
- Independent development possible

## 🔗 **Shared Resources**

### `shared/types/`
Common TypeScript type definitions used across all applications:
- Authentication types
- User and role definitions
- API response interfaces
- Common data structures

### `shared/api-client/`
Unified API client library for consistent backend communication:
- HTTP client with authentication
- Service layer abstractions
- Error handling and retry logic
- Caching and token management

### `shared/utils/`
Common utility functions and helpers used across applications.

## 🚀 **Development Commands**

### **Multi-App Development**
```bash
# Start all applications (backend + frontend + both mobile apps)
npm run dev:all

# Start only mobile apps
npm run mobile:dev

# Start individual apps
npm run dev:tutor          # Tutor app only
npm run dev:student        # Student app only
npm run dev:admin          # Admin dashboard only
```

### **Deployment**
```bash
# Full mobile deployment pipeline
npm run mobile:deploy

# Individual app deployment
npm run subtree:push:tutor
npm run subtree:push:student

# Sync shared resources before deployment
npm run subtree:sync
```

## 📋 **Best Practices**

### **Development**
1. **Always develop in the main repository** (`RemmySpicy/academy-admin`)
2. **Make changes in** `apps/academy-tutor-app/` and `apps/academy-students-app/`
3. **Update shared resources** in `shared/` directory
4. **Use Git subtrees for deployment** to standalone repositories

### **Deployment**
1. **Test changes** in the main repository first
2. **Run quality checks**: `npm run quality:academy`
3. **Sync shared resources**: `npm run subtree:sync`
4. **Deploy to mobile repos**: `npm run subtree:push`

### **Shared Resource Management**
1. **Update types** in `shared/types/` when backend changes
2. **Extend API client** in `shared/api-client/` for new endpoints
3. **Keep utilities generic** in `shared/utils/` for reusability

## ⚠️ **Important Notes**

### **Don't Edit Mobile Repositories Directly**
- Mobile app repositories (`academy-tutor-app`, `academy-students-app`) are deployment targets
- Direct changes will be overwritten by Git subtree pushes
- Always make changes in the main repository's `apps/` directory

### **Existing Code Migration**
- Place existing mobile app code in respective `existing-code/` folders
- Follow migration guides in each app's README
- Use shared API client instead of custom implementations

### **Git Subtree Workflow**
- Git subtrees maintain history and allow bidirectional sync
- Use provided scripts for consistency
- Manual git subtree commands should follow documented patterns

## 🔧 **Repository URLs**

- **Main Repository**: `git@github.com:RemmySpicy/academy-admin.git`
- **Tutor App**: `git@github.com:RemmySpicy/academy-tutor-app.git`
- **Students App**: `git@github.com:RemmySpicy/academy-students-app.git`

This structure provides the flexibility of separate app repositories for deployment while maintaining a unified development environment for shared resources and coordinated development.