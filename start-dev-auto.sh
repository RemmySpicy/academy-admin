#!/bin/bash

# Academy Admin Development Starter with Auto-Restart
# Usage: ./start-dev-auto.sh [--watch]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[DEV]${NC} $1"; }
print_success() { echo -e "${GREEN}[DEV]${NC} ✅ $1"; }
print_warning() { echo -e "${YELLOW}[DEV]${NC} ⚠️  $1"; }

# Check if --watch flag is provided
ENABLE_WATCH=false
if [[ "$1" == "--watch" ]]; then
    ENABLE_WATCH=true
fi

print_success "🚀 Academy Admin Development Environment"
print_success "======================================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    exit 1
fi

print_status "Starting development environment..."

# Start the main services
if [ "$ENABLE_WATCH" = true ]; then
    print_status "Starting with file watcher enabled..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile watcher up -d
    
    print_success "Services started with auto-restart watcher!"
    print_warning "File changes in frontend/ will automatically restart the frontend container"
    
    # Start the external watcher as well
    print_status "Starting additional auto-restart script..."
    ./scripts/dev-auto-restart.sh frontend &
    WATCHER_PID=$!
    
    # Handle cleanup
    cleanup() {
        print_status "Stopping services and watchers..."
        kill $WATCHER_PID 2>/dev/null || true
        docker compose -f docker-compose.yml -f docker-compose.dev.yml down
        print_success "Development environment stopped"
        exit 0
    }
    
    trap cleanup SIGINT SIGTERM
    
    print_success "Development environment is running with auto-restart!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "API Docs: http://localhost:8000/docs"
    print_status "Database: localhost:5432"
    echo ""
    print_warning "Press Ctrl+C to stop all services"
    
    # Wait for interrupt
    wait $WATCHER_PID
    
else
    print_status "Starting without file watcher..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    print_success "Development environment is running!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "API Docs: http://localhost:8000/docs"
    print_status "Database: localhost:5432"
    echo ""
    print_status "To enable auto-restart on file changes, run:"
    print_status "  ./start-dev-auto.sh --watch"
    echo ""
    print_status "To stop the environment:"
    print_status "  docker compose down"
    echo ""
    print_status "To restart frontend manually:"
    print_status "  docker compose restart frontend"
fi