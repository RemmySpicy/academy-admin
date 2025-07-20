# Academy Admin - Project Structure Guide

## 📁 **Repository Overview**

The Academy Admin project uses a multi-repository architecture with Git subtrees for managing separate mobile applications while maintaining a unified development environment.

### 🎯 **Repository Structure**

```
RemmySpicy/academy-admin                    # Main development repository
├── apps/                                   # Multi-app development environment
│   ├── academy-instructors-app/           # Instructor mobile app (development)
│   └── academy-students-app/              # Student mobile app (development)
├── shared/                                 # Shared resources across all apps
├── backend/                                # FastAPI backend
├── frontend/                               # Next.js admin dashboard
└── scripts/                                # Git subtree automation scripts

RemmySpicy/academy-instructors-app          # Standalone instructor app repository
└── [Complete React Native/Expo app]       # Deployed from apps/academy-instructors-app/

RemmySpicy/academy-students-app             # Standalone student app repository
└── [Complete React Native/Expo app]       # Deployed from apps/academy-students-app/
```

## 🔄 **Development Workflow**

### **Primary Development Location**
- **Work in**: `RemmySpicy/academy-admin` repository
- **Develop mobile apps in**: `apps/academy-instructors-app/` and `apps/academy-students-app/`
- **Shared resources in**: `shared/` directory

### **Deployment Flow**
```
apps/academy-instructors-app/ →  (Git Subtree)  →  RemmySpicy/academy-instructors-app
apps/academy-students-app/  →  (Git Subtree)  →  RemmySpicy/academy-students-app
```

### **Git Subtree Commands**
```bash
# Sync shared resources to mobile apps
npm run subtree:sync

# Deploy instructor app updates
npm run subtree:push:instructor

# Deploy student app updates  
npm run subtree:push:student

# Deploy both mobile apps
npm run subtree:push
```

## 🏗️ **Apps Directory Structure**

### `apps/academy-instructors-app/`
**Purpose**: Development version of the instructor mobile app
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

### `RemmySpicy/academy-instructors-app`
**Purpose**: Standalone deployment repository for instructor app
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
npm run dev:instructor     # Instructor app only
npm run dev:student        # Student app only
npm run dev:admin          # Admin dashboard only
```

### **Deployment**
```bash
# Full mobile deployment pipeline
npm run mobile:deploy

# Individual app deployment
npm run subtree:push:instructor
npm run subtree:push:student

# Sync shared resources before deployment
npm run subtree:sync
```

## 🔄 **Git Subtree Commands Reference**

### **Setup Commands** (One-time)
```bash
# Add remotes (done automatically by scripts)
./scripts/subtree-commands.sh setup-remotes

# Check subtree status
./scripts/subtree-commands.sh status
```

### **Daily Development Commands**
```bash
# Sync shared resources to mobile apps
npm run subtree:sync

# Push changes to mobile repositories
npm run subtree:push:instructor # Instructor app only
npm run subtree:push:student    # Student app only
npm run subtree:push            # Both apps

# Pull changes from mobile repositories (if edited externally)
./scripts/subtree-commands.sh pull-instructor
./scripts/subtree-commands.sh pull-student
```

### **Manual Git Subtree Commands**
```bash
# Push specific app
git subtree push --prefix=apps/academy-instructors-app instructor-mobile-origin main
git subtree push --prefix=apps/academy-students-app student-mobile-origin main

# Pull specific app
git subtree pull --prefix=apps/academy-instructors-app instructor-mobile-origin main --squash
git subtree pull --prefix=apps/academy-students-app student-mobile-origin main --squash

# Force push (use with caution)
git subtree push --prefix=apps/academy-instructors-app instructor-mobile-origin main --force
```

## 📋 **Best Practices**

### **Development**
1. **Always develop in the main repository** (`RemmySpicy/academy-admin`)
2. **Make changes in** `apps/academy-instructors-app/` and `apps/academy-students-app/`
3. **Update shared resources** in `shared/` directory
4. **Use Git subtrees for deployment** to standalone repositories

### **Daily Workflow**
1. **Start of day**: Pull any external mobile changes (if applicable)
2. **During development**: Work in `apps/` directories
3. **After shared changes**: Run `npm run subtree:sync` 
4. **Before commits**: Test all apps with `npm run dev:all`
5. **Deploy changes**: Use `npm run subtree:push`

### **Deployment**
1. **Test changes** in the main repository first
2. **Run quality checks**: `npm run quality:academy`
3. **Sync shared resources**: `npm run subtree:sync`
4. **Deploy to mobile repos**: `npm run subtree:push`

### **Shared Resource Management**
1. **Update types** in `shared/types/` when backend changes
2. **Extend API client** in `shared/api-client/` for new endpoints
3. **Keep utilities generic** in `shared/utils/` for reusability

### **Conflict Resolution**
```bash
# If subtree push fails
./scripts/subtree-commands.sh status  # Check current state
git status                            # Check for uncommitted changes

# If subtree pull conflicts occur
git subtree pull --prefix=apps/academy-instructors-app instructor-mobile-origin main --squash --strategy=ours

# For manual resolution
git mergetool
git commit -m "resolve: merge conflicts in mobile subtree"
```

## ⚠️ **Important Notes**

### **Don't Edit Mobile Repositories Directly**
- Mobile app repositories (`academy-instructors-app`, `academy-students-app`) are deployment targets
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
- **Instructor App**: `git@github.com:RemmySpicy/academy-instructors-app.git`
- **Students App**: `git@github.com:RemmySpicy/academy-students-app.git`

This structure provides the flexibility of separate app repositories for deployment while maintaining a unified development environment for shared resources and coordinated development.