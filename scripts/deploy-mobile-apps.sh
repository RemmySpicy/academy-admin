#!/bin/bash

# Deploy Mobile Apps to Separate Repositories
# This script manually deploys the mobile apps to their respective repositories

set -e

# Configuration
TUTOR_REPO="https://github.com/RemmySpicy/academy-tutor-app.git"
STUDENT_REPO="https://github.com/RemmySpicy/academy-students-app.git"
TEMP_DIR="/tmp/academy-mobile-deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Clean up function
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        log_info "Cleaning up temporary directory..."
        rm -rf "$TEMP_DIR"
    fi
}

# Set up cleanup on exit
trap cleanup EXIT

# Create temporary directory
log_info "Creating temporary directory..."
mkdir -p "$TEMP_DIR"

# Deploy Tutor App
deploy_tutor_app() {
    log_info "Deploying Academy Tutor App..."
    
    cd "$TEMP_DIR"
    
    # Clone or initialize the repository
    if git clone "$TUTOR_REPO" tutor-app 2>/dev/null; then
        log_info "Cloned existing tutor app repository"
        cd tutor-app
        # Remove all existing files except .git
        find . -maxdepth 1 ! -name .git ! -name . -exec rm -rf {} \;
    else
        log_info "Initializing new tutor app repository"
        mkdir tutor-app
        cd tutor-app
        git init
        git remote add origin "$TUTOR_REPO"
    fi
    
    # Set git config in this repository
    git config user.email "remmylknolaotan@gmail.com"
    git config user.name "RemmySpicy"
    
    # Copy tutor app files
    log_info "Copying tutor app files..."
    cp -r /mnt/c/Users/remmy/Programming/academy-admin/apps/academy-tutor-app/* .
    
    # Copy shared resources
    log_info "Copying shared resources..."
    mkdir -p shared
    cp -r /mnt/c/Users/remmy/Programming/academy-admin/shared/* shared/
    
    # Create .gitignore for the repository
    cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Typescript
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs
*.log

# Temporary
tmp/
temp/

# Existing code that shouldn't be committed
existing-code/node_modules/
existing-code/.expo/
existing-code/dist/
EOF
    
    # Commit and push
    git add .
    git commit -m "Initial commit: Academy Tutor App with complete React Native/Expo setup

## Features
- React Native/Expo configuration for tutors and coordinators
- Shared API client and TypeScript types
- Role-based access control for tutor, coordinator, and admin roles
- Program context management
- Comprehensive service layer examples
- Development environment setup
- Existing code folder for migration

## Ready for Development
- Place existing code in existing-code/ folder
- Run npm install to set up dependencies
- Use npm start to begin development

🤖 Generated with Claude Code"
    
    if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
        log_success "Academy Tutor App deployed successfully!"
    else
        log_error "Failed to push tutor app"
        return 1
    fi
    
    cd "$TEMP_DIR"
}

# Deploy Student App
deploy_student_app() {
    log_info "Deploying Academy Students App..."
    
    cd "$TEMP_DIR"
    
    # Clone or initialize the repository
    if git clone "$STUDENT_REPO" student-app 2>/dev/null; then
        log_info "Cloned existing student app repository"
        cd student-app
        # Remove all existing files except .git
        find . -maxdepth 1 ! -name .git ! -name . -exec rm -rf {} \;
    else
        log_info "Initializing new student app repository"
        mkdir student-app
        cd student-app
        git init
        git remote add origin "$STUDENT_REPO"
    fi
    
    # Set git config in this repository
    git config user.email "remmylknolaotan@gmail.com"
    git config user.name "RemmySpicy"
    
    # Copy student app files
    log_info "Copying student app files..."
    cp -r /mnt/c/Users/remmy/Programming/academy-admin/apps/academy-students-app/* .
    
    # Copy shared resources
    log_info "Copying shared resources..."
    mkdir -p shared
    cp -r /mnt/c/Users/remmy/Programming/academy-admin/shared/* shared/
    
    # Create .gitignore for the repository
    cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Typescript
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs
*.log

# Temporary
tmp/
temp/

# Existing code that shouldn't be committed
existing-code/node_modules/
existing-code/.expo/
existing-code/dist/
EOF
    
    # Commit and push
    git add .
    git commit -m "Initial commit: Academy Students App with complete React Native/Expo setup

## Features
- React Native/Expo configuration for students and parents
- Shared API client and TypeScript types
- Student and parent role support
- Mobile-optimized UI components
- Comprehensive service layer examples
- Development environment setup
- Existing code folder for migration

## Ready for Development
- Place existing code in existing-code/ folder
- Run npm install to set up dependencies
- Use npm start to begin development

🤖 Generated with Claude Code"
    
    if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
        log_success "Academy Students App deployed successfully!"
    else
        log_error "Failed to push student app"
        return 1
    fi
    
    cd "$TEMP_DIR"
}

# Main execution
main() {
    log_info "Starting mobile app deployment..."
    
    # Check if we're in the right directory
    if [ ! -d "apps/academy-tutor-app" ] || [ ! -d "apps/academy-students-app" ]; then
        log_error "Please run this script from the academy-admin root directory"
        exit 1
    fi
    
    # Deploy both apps
    deploy_tutor_app
    deploy_student_app
    
    log_success "All mobile apps deployed successfully!"
    log_info "Tutor App: https://github.com/RemmySpicy/academy-tutor-app"
    log_info "Students App: https://github.com/RemmySpicy/academy-students-app"
}

# Run main function
main "$@"