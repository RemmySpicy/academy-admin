#!/bin/bash

# Git Subtree Management Scripts for Academy Admin Multi-App Development
# Usage: ./scripts/subtree-commands.sh [command] [options]

set -e

# Configuration
TUTOR_REMOTE="tutor-mobile-origin"
STUDENT_REMOTE="student-mobile-origin"
TUTOR_PATH="apps/academy-tutor-app"
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
    
    # Academy repository URLs
    local tutor_repo_url="git@github.com:RemmySpicy/academy-tutor-app.git"
    local student_repo_url="git@github.com:RemmySpicy/academy-students-app.git"
    
    # Add remotes if they don't exist
    if git remote get-url "$TUTOR_REMOTE" > /dev/null 2>&1; then
        log_warning "Remote '$TUTOR_REMOTE' already exists. Updating URL..."
        git remote set-url "$TUTOR_REMOTE" "$tutor_repo_url"
    else
        git remote add "$TUTOR_REMOTE" "$tutor_repo_url"
    fi
    
    if git remote get-url "$STUDENT_REMOTE" > /dev/null 2>&1; then
        log_warning "Remote '$STUDENT_REMOTE' already exists. Updating URL..."
        git remote set-url "$STUDENT_REMOTE" "$student_repo_url"
    else
        git remote add "$STUDENT_REMOTE" "$student_repo_url"
    fi
    
    log_success "Remotes configured successfully!"
    log_info "Tutor Mobile: $(git remote get-url $TUTOR_REMOTE)"
    log_info "Student Mobile: $(git remote get-url $STUDENT_REMOTE)"
}

add_subtrees() {
    log_info "Adding subtrees..."
    
    check_remote "$TUTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    # Add tutor mobile subtree
    if [ -d "$TUTOR_PATH" ] && [ "$(ls -A $TUTOR_PATH)" ]; then
        log_warning "Directory '$TUTOR_PATH' already exists and is not empty"
        read -p "Do you want to add it as existing subtree? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git subtree add --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH" --allow-unrelated-histories --squash
        fi
    else
        git subtree add --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH" --squash
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
    
    check_remote "$TUTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        log_error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    
    log_info "Pushing tutor mobile app..."
    if git subtree push --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH"; then
        log_success "Tutor mobile app pushed successfully!"
    else
        log_error "Failed to push tutor mobile app"
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
    
    check_remote "$TUTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    log_info "Pulling tutor mobile app..."
    if git subtree pull --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH" --squash; then
        log_success "Tutor mobile app pulled successfully!"
    else
        log_error "Failed to pull tutor mobile app"
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

push_tutor() {
    log_info "Pushing tutor mobile app..."
    check_remote "$TUTOR_REMOTE"
    
    if git subtree push --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH"; then
        log_success "Tutor mobile app pushed successfully!"
    else
        log_error "Failed to push tutor mobile app"
        exit 1
    fi
}

pull_tutor() {
    log_info "Pulling tutor mobile app..."
    check_remote "$TUTOR_REMOTE"
    
    if git subtree pull --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH" --squash; then
        log_success "Tutor mobile app pulled successfully!"
    else
        log_error "Failed to pull tutor mobile app"
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
    mkdir -p "$TUTOR_PATH/src/shared"
    mkdir -p "$STUDENT_PATH/src/shared"
    
    # Copy shared types
    if [ -d "shared/types" ]; then
        cp -r shared/types/ "$TUTOR_PATH/src/shared/"
        cp -r shared/types/ "$STUDENT_PATH/src/shared/"
        log_success "Shared types copied to mobile apps"
    fi
    
    # Copy shared API client
    if [ -d "shared/api-client" ]; then
        cp -r shared/api-client/ "$TUTOR_PATH/src/shared/"
        cp -r shared/api-client/ "$STUDENT_PATH/src/shared/"
        log_success "Shared API client copied to mobile apps"
    fi
    
    # Copy shared utilities
    if [ -d "shared/utils" ]; then
        cp -r shared/utils/ "$TUTOR_PATH/src/shared/"
        cp -r shared/utils/ "$STUDENT_PATH/src/shared/"
        log_success "Shared utilities copied to mobile apps"
    fi
    
    log_success "All shared resources synced!"
}

status() {
    log_info "Subtree status:"
    
    echo
    echo "Remotes:"
    echo "  Tutor Mobile: $(git remote get-url $TUTOR_REMOTE 2>/dev/null || echo 'Not configured')"
    echo "  Student Mobile: $(git remote get-url $STUDENT_REMOTE 2>/dev/null || echo 'Not configured')"
    
    echo
    echo "Subtree directories:"
    echo "  Tutor Mobile: $TUTOR_PATH $([ -d "$TUTOR_PATH" ] && echo '(exists)' || echo '(missing)')"
    echo "  Student Mobile: $STUDENT_PATH $([ -d "$STUDENT_PATH" ] && echo '(exists)' || echo '(missing)')"
    
    echo
    echo "Recent subtree commits:"
    git log --grep="git-subtree-dir: $TUTOR_PATH" --oneline -5 2>/dev/null || echo "  No tutor mobile commits found"
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
    
    check_remote "$TUTOR_REMOTE"
    check_remote "$STUDENT_REMOTE"
    
    log_info "Force pushing tutor mobile app..."
    git subtree push --prefix="$TUTOR_PATH" "$TUTOR_REMOTE" "$MAIN_BRANCH" --force
    
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
    echo "  push-tutor       Push tutor mobile app subtree"
    echo "  pull-tutor       Pull tutor mobile app subtree"
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
    push-tutor)
        push_tutor
        ;;
    pull-tutor)
        pull_tutor
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