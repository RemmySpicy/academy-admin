#!/bin/bash

# Prepare Mobile App Repositories for Manual Deployment
# This script creates the complete repository structure in local directories
# that can then be manually pushed to GitHub

set -e

# Configuration
OUTPUT_DIR="/mnt/c/Users/remmy/Programming/academy-admin/mobile-repos"

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

# Clean up and create output directory
log_info "Preparing output directory..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Prepare Tutor App Repository
prepare_tutor_repo() {
    log_info "Preparing Academy Tutor App repository..."
    
    local tutor_dir="$OUTPUT_DIR/academy-tutor-app"
    mkdir -p "$tutor_dir"
    
    # Copy tutor app files
    cp -r apps/academy-tutor-app/* "$tutor_dir/"
    
    # Copy shared resources
    mkdir -p "$tutor_dir/shared"
    cp -r shared/* "$tutor_dir/shared/"
    
    # Create repository-specific files
    cd "$tutor_dir"
    
    # Create README.md for the repository
    cat > README.md << 'EOF'
# Academy Tutor & Coordinator Mobile App

React Native/Expo mobile application for academy tutors and program coordinators.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android  # Android
npm run ios      # iOS
npm run web      # Web browser
```

## 📱 Features

### For Tutors
- Student management and progress tracking
- Attendance recording
- Communication with students and parents
- Task management
- Schedule overview

### For Program Coordinators
- Program oversight and analytics
- Staff coordination
- Resource management
- Comprehensive reporting

## 🔧 Configuration

### API Configuration
Edit `src/services/apiConfig.ts` to configure the backend API:

```typescript
const API_CONFIG = {
  baseURL: 'https://your-api-endpoint.com/api/v1',
  // ... other configuration
};
```

### Authentication
The app uses JWT-based authentication with automatic token refresh and secure storage.

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Main app screens
├── navigation/    # Navigation configuration
├── services/      # API services and configuration
├── types/         # TypeScript type definitions
└── utils/         # Utility functions

shared/            # Shared resources with other apps
├── api-client/    # Unified API client
├── types/         # Common type definitions
└── utils/         # Shared utilities

existing-code/     # Place existing code here for migration
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Environment Setup
1. Install Expo CLI: `npm install -g @expo/cli`
2. Install dependencies: `npm install`
3. Configure API endpoint in `src/services/apiConfig.ts`
4. Start development: `npm start`

## 📱 Deployment

### App Store Deployment
1. Build for production: `expo build:android` / `expo build:ios`
2. Follow Expo's deployment guide for app stores
3. Configure app signing and certificates

### Enterprise Distribution
Configure enterprise distribution for internal staff deployment.

## 🤝 Contributing

1. Place existing code in `existing-code/` folder
2. Follow the migration guide in `existing-code/README.md`
3. Use shared API client and types for consistency
4. Follow TypeScript best practices

## 📚 Documentation

- [Shared API Client](./shared/api-client/README.md)
- [Type Definitions](./shared/types/)
- [Migration Guide](./existing-code/README.md)

Generated with [Claude Code](https://claude.ai/code)
EOF

    # Create .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
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

# Temporary folders
tmp/
temp/

# Existing code (for reference only)
existing-code/node_modules/
existing-code/.expo/
existing-code/dist/
EOF

    # Initialize git repository
    git init
    git config user.email "remmylknolaotan@gmail.com"
    git config user.name "RemmySpicy"
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

    log_success "Academy Tutor App repository prepared at: $tutor_dir"
    cd - > /dev/null
}

# Prepare Student App Repository
prepare_student_repo() {
    log_info "Preparing Academy Students App repository..."
    
    local student_dir="$OUTPUT_DIR/academy-students-app"
    mkdir -p "$student_dir"
    
    # Copy student app files
    cp -r apps/academy-students-app/* "$student_dir/"
    
    # Copy shared resources
    mkdir -p "$student_dir/shared"
    cp -r shared/* "$student_dir/shared/"
    
    # Create repository-specific files
    cd "$student_dir"
    
    # Create README.md for the repository
    cat > README.md << 'EOF'
# Academy Students & Parents Mobile App

React Native/Expo mobile application for academy students and their parents/guardians.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android  # Android
npm run ios      # iOS
npm run web      # Web browser
```

## 📱 Features

### For Students
- Dashboard with progress overview
- Course progress tracking
- Attendance records
- Assignment management
- Communication with tutors
- Achievement tracking

### For Parents/Guardians
- Child progress monitoring
- Communication with tutors
- Attendance tracking
- Assignment overview
- Emergency contact management

## 🔧 Configuration

### API Configuration
Edit `src/services/apiConfig.ts` to configure the backend API:

```typescript
const API_CONFIG = {
  baseURL: 'https://your-api-endpoint.com/api/v1',
  // ... other configuration
};
```

### Authentication
The app uses JWT-based authentication with automatic token refresh and secure storage.

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Main app screens
├── navigation/    # Navigation configuration
├── services/      # API services and configuration
├── types/         # TypeScript type definitions
└── utils/         # Utility functions

shared/            # Shared resources with other apps
├── api-client/    # Unified API client
├── types/         # Common type definitions
└── utils/         # Shared utilities

existing-code/     # Place existing code here for migration
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Environment Setup
1. Install Expo CLI: `npm install -g @expo/cli`
2. Install dependencies: `npm install`
3. Configure API endpoint in `src/services/apiConfig.ts`
4. Start development: `npm start`

## 📱 Deployment

### App Store Deployment
1. Build for production: `expo build:android` / `expo build:ios`
2. Follow Expo's deployment guide for app stores
3. Configure app signing and certificates

### Distribution
Deploy to both iOS App Store and Google Play Store for student and parent access.

## 🤝 Contributing

1. Place existing code in `existing-code/` folder
2. Follow the migration guide in `existing-code/README.md`
3. Use shared API client and types for consistency
4. Follow TypeScript best practices

## 📚 Documentation

- [Shared API Client](./shared/api-client/README.md)
- [Type Definitions](./shared/types/)
- [Migration Guide](./existing-code/README.md)

Generated with [Claude Code](https://claude.ai/code)
EOF

    # Create .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
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

# Temporary folders
tmp/
temp/

# Existing code (for reference only)
existing-code/node_modules/
existing-code/.expo/
existing-code/dist/
EOF

    # Initialize git repository
    git init
    git config user.email "remmylknolaotan@gmail.com"
    git config user.name "RemmySpicy"
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

    log_success "Academy Students App repository prepared at: $student_dir"
    cd - > /dev/null
}

# Main execution
main() {
    log_info "Preparing mobile app repositories for deployment..."
    
    # Check if we're in the right directory
    if [ ! -d "apps/academy-tutor-app" ] || [ ! -d "apps/academy-students-app" ]; then
        log_error "Please run this script from the academy-admin root directory"
        exit 1
    fi
    
    # Prepare both repositories
    prepare_tutor_repo
    prepare_student_repo
    
    log_success "Mobile app repositories prepared successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Navigate to the prepared repositories:"
    log_info "   - Tutor App: $OUTPUT_DIR/academy-tutor-app"
    log_info "   - Students App: $OUTPUT_DIR/academy-students-app"
    log_info ""
    log_info "2. For each repository, add the remote and push:"
    log_info "   cd $OUTPUT_DIR/academy-tutor-app"
    log_info "   git remote add origin https://github.com/RemmySpicy/academy-tutor-app.git"
    log_info "   git push -u origin main"
    log_info ""
    log_info "   cd $OUTPUT_DIR/academy-students-app"
    log_info "   git remote add origin https://github.com/RemmySpicy/academy-students-app.git"
    log_info "   git push -u origin main"
    log_info ""
    log_info "3. Alternatively, you can upload the contents directly to GitHub"
}

# Run main function
main "$@"