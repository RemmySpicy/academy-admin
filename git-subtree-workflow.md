# Git Subtree Workflow for Multi-App Development

## Overview
This document outlines the Git Subtree workflow for managing multiple applications (admin dashboard, tutor mobile app, student mobile app) with a shared backend and common resources.

## Repository Structure

```
academy-admin/ (Main Repository)
├── apps/
│   ├── admin-dashboard/          ← Existing admin dashboard
│   ├── tutor-mobile/            ← Tutor/Coordinator mobile app (subtree)
│   └── student-mobile/          ← Student/Parent mobile app (subtree)
├── shared/
│   ├── types/                   ← Shared TypeScript types
│   ├── api-client/              ← Unified API client library
│   └── utils/                   ← Common utilities
├── backend/                     ← FastAPI backend (shared)
└── docs/                        ← Documentation
```

## Git Subtree Setup

### 1. Create Remote Repositories

First, create separate repositories for each mobile app:

```bash
# Create repositories on GitHub/GitLab
# - academy-tutor-mobile
# - academy-student-mobile
```

### 2. Initialize Mobile App Directories

```bash
# Create initial mobile app structures
mkdir -p apps/tutor-mobile
mkdir -p apps/student-mobile

# Initialize basic React Native/Expo projects
cd apps/tutor-mobile
npx create-expo-app@latest . --template
cd ../..

cd apps/student-mobile
npx create-expo-app@latest . --template
cd ../..
```

### 3. Add Subtree Remotes

```bash
# Add remote repositories
git remote add tutor-mobile-origin https://github.com/your-org/academy-tutor-mobile.git
git remote add student-mobile-origin https://github.com/your-org/academy-student-mobile.git
```

### 4. Create Initial Subtrees

```bash
# Push initial mobile app code to subtrees
git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main
git subtree push --prefix=apps/student-mobile student-mobile-origin main
```

## Daily Development Workflow

### Working on Mobile Apps

#### Option A: Work in Main Repository (Recommended for shared backend changes)

```bash
# Make changes to mobile apps in apps/tutor-mobile/ or apps/student-mobile/
# Commit changes normally
git add .
git commit -m "feat: add student progress tracking to mobile apps"

# Push changes to main repository
git push origin main

# Push subtree changes to mobile app repositories
git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main
git subtree push --prefix=apps/student-mobile student-mobile-origin main
```

#### Option B: Work in Separate Repository (for mobile-only changes)

```bash
# Clone mobile app repository separately
git clone https://github.com/your-org/academy-tutor-mobile.git tutor-mobile-dev
cd tutor-mobile-dev

# Make mobile-specific changes
# Commit and push to mobile repository
git add .
git commit -m "feat: add push notifications"
git push origin main

# Back to main repository - pull subtree changes
cd ../academy-admin
git subtree pull --prefix=apps/tutor-mobile tutor-mobile-origin main --squash
```

### Pulling Updates from Mobile Repositories

```bash
# Pull latest changes from mobile app repositories
git subtree pull --prefix=apps/tutor-mobile tutor-mobile-origin main --squash
git subtree pull --prefix=apps/student-mobile student-mobile-origin main --squash
```

### Pushing Updates to Mobile Repositories

```bash
# Push changes to mobile app repositories
git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main
git subtree push --prefix=apps/student-mobile student-mobile-origin main
```

## Common Git Subtree Commands

### Setup Commands (One-time)

```bash
# Add subtree (if directory doesn't exist)
git subtree add --prefix=apps/tutor-mobile tutor-mobile-origin main --squash

# Add subtree for existing directory
git subtree add --prefix=apps/tutor-mobile tutor-mobile-origin main --allow-unrelated-histories --squash
```

### Regular Commands

```bash
# Push subtree changes
git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main

# Pull subtree changes
git subtree pull --prefix=apps/tutor-mobile tutor-mobile-origin main --squash

# Check subtree status
git log --grep="git-subtree-dir: apps/tutor-mobile" --oneline
```

### Troubleshooting Commands

```bash
# Force push (use with caution)
git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main --force

# Split subtree history
git subtree split --prefix=apps/tutor-mobile -b tutor-mobile-branch

# Rejoin after split
git subtree merge --prefix=apps/tutor-mobile tutor-mobile-branch --squash
```

## Automated Scripts

### Push All Subtrees

Create `scripts/push-subtrees.sh`:

```bash
#!/bin/bash
set -e

echo "Pushing all mobile app subtrees..."

echo "Pushing tutor mobile app..."
git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main

echo "Pushing student mobile app..."
git subtree push --prefix=apps/student-mobile student-mobile-origin main

echo "All subtrees pushed successfully!"
```

### Pull All Subtrees

Create `scripts/pull-subtrees.sh`:

```bash
#!/bin/bash
set -e

echo "Pulling all mobile app subtrees..."

echo "Pulling tutor mobile app..."
git subtree pull --prefix=apps/tutor-mobile tutor-mobile-origin main --squash

echo "Pulling student mobile app..."
git subtree pull --prefix=apps/student-mobile student-mobile-origin main --squash

echo "All subtrees pulled successfully!"
```

### Sync Shared Resources

Create `scripts/sync-shared.sh`:

```bash
#!/bin/bash
set -e

echo "Syncing shared resources to mobile apps..."

# Copy shared types to mobile apps
cp -r shared/types/ apps/tutor-mobile/src/shared/types/
cp -r shared/types/ apps/student-mobile/src/shared/types/

# Copy API client to mobile apps
cp -r shared/api-client/ apps/tutor-mobile/src/shared/api-client/
cp -r shared/api-client/ apps/student-mobile/src/shared/api-client/

echo "Shared resources synced!"
```

## Best Practices

### 1. Commit Strategy

- **Main Repository**: Commit backend changes, shared resources, and mobile app coordination
- **Mobile Repositories**: Commit mobile-specific features, UI changes, and platform-specific code
- **Always use descriptive commit messages** that indicate which app the changes affect

### 2. Branch Strategy

- **Main Repository**: 
  - `main` - Production ready code
  - `develop` - Integration branch
  - `feature/mobile-*` - Features affecting mobile apps
  
- **Mobile Repositories**:
  - `main` - Production ready mobile app
  - `develop` - Mobile app development
  - `feature/*` - Mobile-specific features

### 3. Synchronization

- **Daily sync**: Pull subtree changes at start of day
- **Before major releases**: Ensure all subtrees are synchronized
- **After shared changes**: Push subtrees immediately after changing shared resources

### 4. Conflict Resolution

```bash
# If subtree pull conflicts occur:
git subtree pull --prefix=apps/tutor-mobile tutor-mobile-origin main --squash --strategy=ours

# For manual resolution:
git mergetool
git commit -m "resolve: merge conflicts in tutor mobile subtree"
```

## Development Environment Setup

### 1. Install Dependencies

```bash
# Install all dependencies (root + all apps)
npm run install:all

# Or install individually
npm install                           # Root dependencies
cd apps/tutor-mobile && npm install   # Tutor app dependencies
cd ../student-mobile && npm install   # Student app dependencies
```

### 2. Development Commands

```bash
# Start all development servers
npm run dev:all

# Start specific apps
npm run dev:admin         # Admin dashboard
npm run dev:tutor         # Tutor mobile app
npm run dev:student       # Student mobile app
npm run dev:backend       # Backend API
```

### 3. Docker Support

```bash
# Start everything with Docker
docker-compose up

# Start specific services
docker-compose up backend
docker-compose up admin
```

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/mobile-apps.yml`:

```yaml
name: Mobile Apps CI/CD

on:
  push:
    paths:
      - 'apps/tutor-mobile/**'
      - 'apps/student-mobile/**'
      - 'shared/**'

jobs:
  sync-subtrees:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          
      - name: Add Remotes
        run: |
          git remote add tutor-mobile-origin ${{ secrets.TUTOR_MOBILE_REPO }}
          git remote add student-mobile-origin ${{ secrets.STUDENT_MOBILE_REPO }}
          
      - name: Push Subtrees
        run: |
          git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main
          git subtree push --prefix=apps/student-mobile student-mobile-origin main
```

## Troubleshooting

### Common Issues

1. **Subtree push fails**:
   ```bash
   # Check for uncommitted changes
   git status
   
   # Ensure you're on the correct branch
   git branch
   
   # Try force push (careful!)
   git subtree push --prefix=apps/tutor-mobile tutor-mobile-origin main --force
   ```

2. **Merge conflicts during subtree pull**:
   ```bash
   # Use strategy option
   git subtree pull --prefix=apps/tutor-mobile tutor-mobile-origin main --squash --strategy=recursive -X theirs
   ```

3. **Lost subtree history**:
   ```bash
   # Re-add subtree with history
   git subtree add --prefix=apps/tutor-mobile tutor-mobile-origin main --squash
   ```

### Recovery Commands

```bash
# Remove subtree (emergency)
git rm -r apps/tutor-mobile
git commit -m "remove: tutor mobile subtree for recovery"

# Re-add subtree
git subtree add --prefix=apps/tutor-mobile tutor-mobile-origin main --squash
```

## Quick Reference

```bash
# Setup
git remote add <name> <url>
git subtree add --prefix=<path> <remote> <branch> --squash

# Daily workflow
git subtree pull --prefix=<path> <remote> <branch> --squash
git subtree push --prefix=<path> <remote> <branch>

# Maintenance
git subtree split --prefix=<path> -b <temp-branch>
git log --grep="git-subtree-dir: <path>" --oneline
```

This workflow ensures that we can develop all applications in a unified environment while maintaining separate repositories for deployment and distribution.