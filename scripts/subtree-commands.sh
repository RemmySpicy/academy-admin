#!/bin/bash

# Git Subtree Management Scripts for Academy Admin Multi-App Development
# Usage: ./scripts/subtree-commands.sh [command] [options]

set -e

# Configuration
INSTRUCTOR_REMOTE="instructor-mobile-origin"
STUDENT_REMOTE="student-mobile-origin"
INSTRUCTOR_PATH="apps/academy-instructors-app"
STUDENT_PATH="apps/academy-students-app"
MAIN_BRANCH="main"

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

check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not a git repository"
        exit 1
    fi
}

check_remote() {
    local remote=$1
    if ! git remote get-url "$remote" > /dev/null 2>&1; then
        log_error "Remote '$remote' not found. Run 'setup-remotes' first."
        exit 1
    fi
}

# Command functions
setup_remotes() {
    log_info "Setting up remote repositories..."
    
    # Academy repository URLs (using SSH for authenticated access)
    local instructor_repo_url="git@github.com:RemmySpicy/academy-instructors-app.git"
    local student_repo_url="git@github.com:RemmySpicy/academy-students-app.git"
    
    # Add remotes if they don't exist
    if git remote get-url "$INSTRUCTOR_REMOTE" > /dev/null 2>&1; then
        log_warning "Remote '$INSTRUCTOR_REMOTE' already exists. Updating URL..."
        git remote set-url "$INSTRUCTOR_REMOTE" "$instructor_repo_url"
    else
        git remote add "$INSTRUCTOR_REMOTE" "$instructor_repo_url"
    fi
    
    if git remote get-url "$STUDENT_REMOTE" > /dev/null 2>&1; then
        log_warning "Remote '$STUDENT_REMOTE' already exists. Updating URL..."
        git remote set-url "$STUDENT_REMOTE" "$student_repo_url"
    else
        git remote add "$STUDENT_REMOTE" "$student_repo_url"
    fi
    
    log_success "Remotes configured successfully!"
    log_info "Instructor Mobile: $(git remote get-url $INSTRUCTOR_REMOTE)"
    log_info "Student Mobile: $(git remote get-url $STUDENT_REMOTE)"
}

add_subtrees() {
    log_info "Adding subtrees..."
    
    check_remote "$INSTRUCTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    # Add instructor mobile subtree
    if [ -d "$INSTRUCTOR_PATH" ] && [ "$(ls -A $INSTRUCTOR_PATH)" ]; then
        log_warning "Directory '$INSTRUCTOR_PATH' already exists and is not empty"
        read -p "Do you want to add it as existing subtree? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git subtree add --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH" --allow-unrelated-histories --squash
        fi
    else
        git subtree add --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH" --squash
    fi
    
    # Add student mobile subtree
    if [ -d "$STUDENT_PATH" ] && [ "$(ls -A $STUDENT_PATH)" ]; then
        log_warning "Directory '$STUDENT_PATH' already exists and is not empty"
        read -p "Do you want to add it as existing subtree? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git subtree add --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH" --allow-unrelated-histories --squash
        fi
    else
        git subtree add --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH" --squash
    fi
    
    log_success "Subtrees added successfully!"
}

push_all() {
    log_info "Pushing all subtrees..."
    
    check_remote "$INSTRUCTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        log_error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    
    log_info "Pushing instructor mobile app..."
    if git subtree push --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH"; then
        log_success "Instructor mobile app pushed successfully!"
    else
        log_error "Failed to push instructor mobile app"
        exit 1
    fi
    
    log_info "Pushing student mobile app..."
    if git subtree push --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH"; then
        log_success "Student mobile app pushed successfully!"
    else
        log_error "Failed to push student mobile app"
        exit 1
    fi
    
    log_success "All subtrees pushed successfully!"
}

pull_all() {
    log_info "Pulling all subtrees..."
    
    check_remote "$INSTRUCTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    log_info "Pulling instructor mobile app..."
    if git subtree pull --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH" --squash; then
        log_success "Instructor mobile app pulled successfully!"
    else
        log_error "Failed to pull instructor mobile app"
        exit 1
    fi
    
    log_info "Pulling student mobile app..."
    if git subtree pull --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH" --squash; then
        log_success "Student mobile app pulled successfully!"
    else
        log_error "Failed to pull student mobile app"
        exit 1
    fi
    
    log_success "All subtrees pulled successfully!"
}

push_instructor() {
    log_info "Pushing instructor mobile app..."
    check_remote "$INSTRUCTOR_REMOTE"
    
    if git subtree push --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH"; then
        log_success "Instructor mobile app pushed successfully!"
    else
        log_error "Failed to push instructor mobile app"
        exit 1
    fi
}

pull_instructor() {
    log_info "Pulling instructor mobile app..."
    check_remote "$INSTRUCTOR_REMOTE"
    
    if git subtree pull --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH" --squash; then
        log_success "Instructor mobile app pulled successfully!"
    else
        log_error "Failed to pull instructor mobile app"
        exit 1
    fi
}

push_student() {
    log_info "Pushing student mobile app..."
    check_remote "$STUDENT_REMOTE"
    
    if git subtree push --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH"; then
        log_success "Student mobile app pushed successfully!"
    else
        log_error "Failed to push student mobile app"
        exit 1
    fi
}

pull_student() {
    log_info "Pulling student mobile app..."
    check_remote "$STUDENT_REMOTE"
    
    if git subtree pull --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH" --squash; then
        log_success "Student mobile app pulled successfully!"
    else
        log_error "Failed to pull student mobile app"
        exit 1
    fi
}

sync_shared() {
    log_info "Syncing shared resources to mobile apps..."
    
    # Ensure shared directories exist in mobile apps
    mkdir -p "$INSTRUCTOR_PATH/src/shared"
    mkdir -p "$STUDENT_PATH/src/shared"
    
    # Copy shared types
    if [ -d "shared/types" ]; then
        cp -r shared/types/ "$INSTRUCTOR_PATH/src/shared/"
        cp -r shared/types/ "$STUDENT_PATH/src/shared/"
        log_success "Shared types copied to mobile apps"
    fi
    
    # Copy shared API client
    if [ -d "shared/api-client" ]; then
        cp -r shared/api-client/ "$INSTRUCTOR_PATH/src/shared/"
        cp -r shared/api-client/ "$STUDENT_PATH/src/shared/"
        log_success "Shared API client copied to mobile apps"
    fi
    
    # Copy shared utilities
    if [ -d "shared/utils" ]; then
        cp -r shared/utils/ "$INSTRUCTOR_PATH/src/shared/"
        cp -r shared/utils/ "$STUDENT_PATH/src/shared/"
        log_success "Shared utilities copied to mobile apps"
    fi
    
    log_success "All shared resources synced!"
}

status() {
    log_info "Subtree status:"
    
    echo
    echo "Remotes:"
    echo "  Instructor Mobile: $(git remote get-url $INSTRUCTOR_REMOTE 2>/dev/null || echo 'Not configured')"
    echo "  Student Mobile: $(git remote get-url $STUDENT_REMOTE 2>/dev/null || echo 'Not configured')"
    
    echo
    echo "Subtree directories:"
    echo "  Instructor Mobile: $INSTRUCTOR_PATH $([ -d "$INSTRUCTOR_PATH" ] && echo '(exists)' || echo '(missing)')"
    echo "  Student Mobile: $STUDENT_PATH $([ -d "$STUDENT_PATH" ] && echo '(exists)' || echo '(missing)')"
    
    echo
    echo "Recent subtree commits:"
    git log --grep="git-subtree-dir: $INSTRUCTOR_PATH" --oneline -5 2>/dev/null || echo "  No instructor mobile commits found"
    git log --grep="git-subtree-dir: $STUDENT_PATH" --oneline -5 2>/dev/null || echo "  No student mobile commits found"
}

force_push_all() {
    log_warning "Force pushing all subtrees (this can overwrite remote changes)..."
    read -p "Are you sure? This will overwrite remote repositories. (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled"
        exit 0
    fi
    
    check_remote "$INSTRUCTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    log_info "Force pushing instructor mobile app..."
    git subtree push --prefix="$INSTRUCTOR_PATH" "$INSTRUCTOR_REMOTE" "$MAIN_BRANCH" --force
    
    log_info "Force pushing student mobile app..."
    git subtree push --prefix="$STUDENT_PATH" "$STUDENT_REMOTE" "$MAIN_BRANCH" --force
    
    log_success "All subtrees force pushed!"
}

show_help() {
    echo "Git Subtree Management for Academy Admin Multi-App Development"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  setup-remotes    Setup remote repositories for mobile apps"
    echo "  add-subtrees     Add mobile app directories as subtrees"
    echo "  push-all         Push all mobile app subtrees to remotes"
    echo "  pull-all         Pull all mobile app subtrees from remotes"
    echo "  push-instructor       Push instructor mobile app subtree"
    echo "  pull-instructor       Pull instructor mobile app subtree"
    echo "  push-student     Push student mobile app subtree"
    echo "  pull-student     Pull student mobile app subtree"
    echo "  sync-shared      Copy shared resources to mobile apps"
    echo "  status           Show subtree status and configuration"
    echo "  force-push-all   Force push all subtrees (destructive)"
    echo "  help             Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup-remotes     # First time setup"
    echo "  $0 add-subtrees      # Add mobile apps as subtrees"
    echo "  $0 sync-shared       # Sync shared code after changes"
    echo "  $0 push-all          # Deploy mobile apps"
}

# Main script logic
check_git_repo

case "${1:-help}" in
    setup-remotes)
        setup_remotes
        ;;
    add-subtrees)
        add_subtrees
        ;;
    push-all)
        push_all
        ;;
    pull-all)
        pull_all
        ;;
    push-instructor)
        push_instructor
        ;;
    pull-instructor)
        pull_instructor
        ;;
    push-student)
        push_student
        ;;
    pull-student)
        pull_student
        ;;
    sync-shared)
        sync_shared
        ;;
    status)
        status
        ;;
    force-push-all)
        force_push_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac