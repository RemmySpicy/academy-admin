#!/bin/bash

# Development watch script for automatic frontend Docker restart
# Usage: ./scripts/dev-watch.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✅ $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠️  $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ❌ $1"
}

# Function to restart frontend container
restart_frontend() {
    print_status "Detected frontend changes, restarting container..."
    
    if docker compose ps frontend | grep -q "Up"; then
        print_status "Stopping frontend container..."
        docker compose stop frontend
        
        print_status "Starting frontend container..."
        docker compose up -d frontend
        
        print_success "Frontend container restarted successfully!"
    else
        print_warning "Frontend container is not running, starting it..."
        docker compose up -d frontend
        print_success "Frontend container started!"
    fi
}

# Function to check if Docker Compose is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available"
        exit 1
    fi
}

# Function to check if fswatch is available (macOS) or inotify-tools (Linux)
check_watch_tools() {
    if command -v fswatch &> /dev/null; then
        WATCH_CMD="fswatch"
        print_status "Using fswatch for file monitoring"
    elif command -v inotifywait &> /dev/null; then
        WATCH_CMD="inotifywait"
        print_status "Using inotifywait for file monitoring"
    else
        print_error "Neither fswatch (macOS) nor inotify-tools (Linux) are installed"
        print_error "Please install the appropriate tool for your system:"
        print_error "  macOS: brew install fswatch"
        print_error "  Linux: sudo apt-get install inotify-tools"
        exit 1
    fi
}

# Function to start watching for changes
start_watching() {
    cd "$PROJECT_ROOT"
    
    print_success "Starting frontend development watch mode..."
    print_status "Watching for changes in: frontend/src/, frontend/public/, frontend/*.json, frontend/*.js"
    print_status "Press Ctrl+C to stop watching"
    echo ""
    
    if [ "$WATCH_CMD" = "fswatch" ]; then
        # macOS fswatch
        fswatch -o \
            frontend/src \
            frontend/public \
            frontend/package.json \
            frontend/package-lock.json \
            frontend/next.config.js \
            frontend/tailwind.config.js \
            frontend/tsconfig.json \
            shared \
            | while read num_changes; do
                restart_frontend
            done
    else
        # Linux inotifywait
        inotifywait -m -r -e modify,create,delete,move \
            frontend/src \
            frontend/public \
            frontend/package.json \
            frontend/package-lock.json \
            frontend/next.config.js \
            frontend/tailwind.config.js \
            frontend/tsconfig.json \
            shared \
            | while read path action file; do
                restart_frontend
            done
    fi
}

# Function to handle cleanup on exit
cleanup() {
    print_status "Stopping watch mode..."
    exit 0
}

# Main execution
main() {
    print_status "🚀 Academy Admin Frontend Development Watch"
    print_status "=========================================="
    
    # Check prerequisites
    check_docker
    check_watch_tools
    
    # Set up signal handling
    trap cleanup SIGINT SIGTERM
    
    # Start watching
    start_watching
}

# Run main function
main "$@"