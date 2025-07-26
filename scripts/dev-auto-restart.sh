#!/bin/bash

# Auto-restart development script for Academy Admin
# This script automatically restarts frontend container on changes
# Usage: ./scripts/dev-auto-restart.sh [frontend|backend|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVICE="${1:-frontend}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
print_success() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✅ $1"; }
print_warning() { echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠️  $1"; }
print_error() { echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ❌ $1"; }
print_info() { echo -e "${PURPLE}[$(date +'%H:%M:%S')]${NC} 📋 $1"; }

# Check if running in WSL
is_wsl() {
    [ -n "${WSL_DISTRO_NAME:-}" ] || [ -n "${WSLENV:-}" ] || [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]
}

# Function to restart specific service
restart_service() {
    local service_name="$1"
    local change_file="$2"
    
    print_info "Change detected in: $change_file"
    print_status "Restarting $service_name container..."
    
    # Stop the service
    if docker compose ps "$service_name" | grep -q "Up"; then
        docker compose stop "$service_name" >/dev/null 2>&1
    fi
    
    # Rebuild and start the service
    docker compose up -d --build "$service_name" >/dev/null 2>&1
    
    # Wait for service to be healthy
    print_status "Waiting for $service_name to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker compose ps "$service_name" | grep -q "Up"; then
            if [ "$service_name" = "frontend" ]; then
                if curl -f http://localhost:3000 >/dev/null 2>&1; then
                    break
                fi
            elif [ "$service_name" = "backend" ]; then
                if curl -f http://localhost:8000/api/v1/health/ >/dev/null 2>&1; then
                    break
                fi
            else
                break
            fi
        fi
        
        sleep 2
        attempt=$((attempt + 1))
        
        if [ $((attempt % 5)) -eq 0 ]; then
            print_status "Still waiting for $service_name... ($attempt/$max_attempts)"
        fi
    done
    
    if [ $attempt -ge $max_attempts ]; then
        print_warning "$service_name took longer than expected to start"
    else
        print_success "$service_name restarted and ready! 🚀"
    fi
    
    echo ""
}

# Function to start watching frontend changes
watch_frontend() {
    print_info "Watching frontend files for changes..."
    
    if is_wsl; then
        # WSL-optimized watching (less resource intensive)
        while true; do
            find frontend/src frontend/public frontend/*.json frontend/*.js shared -type f -newer /tmp/last_frontend_check 2>/dev/null | head -1 | while read file; do
                if [ -n "$file" ]; then
                    restart_service "frontend" "$file"
                fi
            done
            
            touch /tmp/last_frontend_check
            sleep 3
        done
    else
        # Use inotify for Linux or fswatch for macOS
        if command -v inotifywait >/dev/null 2>&1; then
            inotifywait -m -r -e modify,create,delete,move \
                --exclude '\.(git|node_modules|\.next|dist)' \
                frontend/src frontend/public frontend/package.json frontend/package-lock.json \
                frontend/next.config.js frontend/tailwind.config.js frontend/tsconfig.json shared \
                2>/dev/null | while read path action file; do
                    restart_service "frontend" "$path$file"
                done
        elif command -v fswatch >/dev/null 2>&1; then
            fswatch -o -r \
                --exclude='\.git' --exclude='node_modules' --exclude='\.next' --exclude='dist' \
                frontend/src frontend/public frontend/package.json frontend/package-lock.json \
                frontend/next.config.js frontend/tailwind.config.js frontend/tsconfig.json shared \
                | while read; do
                    restart_service "frontend" "frontend files"
                done
        else
            print_warning "No file watching tool available, using polling method"
            watch_frontend  # Fallback to WSL method
        fi
    fi
}

# Function to start watching backend changes
watch_backend() {
    print_info "Watching backend files for changes..."
    
    if is_wsl; then
        while true; do
            find backend/app -name "*.py" -newer /tmp/last_backend_check 2>/dev/null | head -1 | while read file; do
                if [ -n "$file" ]; then
                    restart_service "backend" "$file"
                fi
            done
            
            touch /tmp/last_backend_check
            sleep 2
        done
    else
        if command -v inotifywait >/dev/null 2>&1; then
            inotifywait -m -r -e modify,create,delete,move \
                --include='\.py$' \
                backend/app \
                2>/dev/null | while read path action file; do
                    restart_service "backend" "$path$file"
                done
        elif command -v fswatch >/dev/null 2>&1; then
            fswatch -o -r --include='\.py$' backend/app \
                | while read; do
                    restart_service "backend" "backend files"
                done
        else
            watch_backend  # Fallback to WSL method
        fi
    fi
}

# Function to watch all services
watch_all() {
    print_info "Starting watchers for all services..."
    
    # Start backend watcher in background
    watch_backend &
    BACKEND_PID=$!
    
    # Start frontend watcher in background  
    watch_frontend &
    FRONTEND_PID=$!
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Cleanup function
cleanup() {
    print_status "Stopping auto-restart watch mode..."
    
    # Kill background processes
    if [ -n "${BACKEND_PID:-}" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_PID:-}" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Clean up temp files
    rm -f /tmp/last_frontend_check /tmp/last_backend_check
    
    print_success "Auto-restart stopped. Have a great day! 👋"
    exit 0
}

# Main execution
main() {
    cd "$PROJECT_ROOT"
    
    print_success "🔄 Academy Admin Auto-Restart Development Mode"
    print_success "=============================================="
    print_info "Service: $SERVICE"
    
    if is_wsl; then
        print_info "Running in WSL - using optimized polling method"
    fi
    
    print_info "Press Ctrl+C to stop auto-restart mode"
    echo ""
    
    # Set up signal handling
    trap cleanup SIGINT SIGTERM
    
    # Initialize timestamp files
    touch /tmp/last_frontend_check /tmp/last_backend_check
    
    # Start appropriate watcher
    case "$SERVICE" in
        "frontend")
            watch_frontend
            ;;
        "backend")
            watch_backend
            ;;
        "all")
            watch_all
            ;;
        *)
            print_error "Invalid service: $SERVICE"
            print_error "Usage: $0 [frontend|backend|all]"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"