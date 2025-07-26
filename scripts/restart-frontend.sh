#!/bin/bash

# Quick frontend restart script
# Usage: ./scripts/restart-frontend.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[RESTART]${NC} $1"; }
print_success() { echo -e "${GREEN}[RESTART]${NC} ✅ $1"; }
print_warning() { echo -e "${YELLOW}[RESTART]${NC} ⚠️  $1"; }

cd "$(dirname "$0")/.."

print_status "🔄 Restarting frontend container..."

# Check if frontend service is running
if docker compose ps frontend | grep -q "Up"; then
    print_status "Stopping frontend container..."
    docker compose stop frontend
    
    print_status "Starting frontend container..."
    docker compose up -d frontend
    
    print_success "Frontend container restarted!"
    
    # Wait a moment and check if it's healthy
    sleep 3
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is ready at http://localhost:3000"
    else
        print_warning "Frontend may still be starting up..."
        print_status "Check logs with: docker compose logs -f frontend"
    fi
else
    print_warning "Frontend container is not running, starting it..."
    docker compose up -d frontend
    print_success "Frontend container started!"
fi