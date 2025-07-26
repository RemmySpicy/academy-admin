#!/bin/bash

# Academy Admin Test Runner
# Comprehensive test execution script for backend and frontend testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
TEST_DB="test_academy.db"
COVERAGE_THRESHOLD=80

echo -e "${BLUE}🧪 Academy Admin Test Suite${NC}"
echo -e "${BLUE}================================${NC}"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Clean up function
cleanup() {
    print_section "Cleaning up test artifacts"
    
    # Remove test database
    if [ -f "$BACKEND_DIR/$TEST_DB" ]; then
        rm "$BACKEND_DIR/$TEST_DB"
        print_success "Removed test database"
    fi
    
    # Remove coverage files
    if [ -f "$BACKEND_DIR/.coverage" ]; then
        rm "$BACKEND_DIR/.coverage"
    fi
    
    if [ -d "$BACKEND_DIR/htmlcov" ]; then
        rm -rf "$BACKEND_DIR/htmlcov"
    fi
    
    # Remove frontend test artifacts
    if [ -d "$FRONTEND_DIR/coverage" ]; then
        rm -rf "$FRONTEND_DIR/coverage"
    fi
    
    print_success "Cleanup completed"
}

# Trap cleanup on exit
trap cleanup EXIT

# Check prerequisites
print_section "Checking Prerequisites"

if ! command_exists python3; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is required but not installed"
    exit 1
fi

print_success "All prerequisites are available"

# Parse command line arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false
INTEGRATION_ONLY=false
COVERAGE_ONLY=false
VERBOSE=false
FAST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --integration-only)
            INTEGRATION_ONLY=true
            shift
            ;;
        --coverage-only)
            COVERAGE_ONLY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --fast)
            FAST=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend-only      Run only backend tests"
            echo "  --frontend-only     Run only frontend tests"
            echo "  --integration-only  Run only integration tests"
            echo "  --coverage-only     Generate coverage reports only"
            echo "  --verbose           Verbose output"
            echo "  --fast             Skip slow tests"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Backend Tests
if [ "$FRONTEND_ONLY" = false ]; then
    print_section "Backend Tests"
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    if [ ! -d "venv" ]; then
        print_warning "Creating virtual environment"
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    if [ ! -f ".dependencies_installed" ] || [ "$FAST" = false ]; then
        print_warning "Installing Python dependencies"
        pip install -r requirements.txt
        pip install pytest pytest-cov pytest-asyncio
        touch .dependencies_installed
    fi
    
    # Set test environment
    export TESTING=true
    export DATABASE_URL="sqlite:///./$TEST_DB"
    
    # Run tests based on options
    if [ "$INTEGRATION_ONLY" = true ]; then
        print_warning "Running integration tests only"
        pytest tests/integration/ -v ${VERBOSE:+--verbose} --tb=short
    elif [ "$COVERAGE_ONLY" = true ]; then
        print_warning "Generating coverage report only"
        coverage html --directory=htmlcov
        coverage report --show-missing
    else
        print_warning "Running all backend tests with coverage"
        
        # Unit tests
        pytest tests/unit/ -v ${VERBOSE:+--verbose} --cov=app --cov-report=term-missing --cov-report=html:htmlcov/unit
        
        # Integration tests
        pytest tests/integration/ -v ${VERBOSE:+--verbose} --cov=app --cov-append --cov-report=term-missing --cov-report=html:htmlcov/integration
        
        # Generate combined coverage report
        coverage combine
        coverage report --show-missing --fail-under=$COVERAGE_THRESHOLD
        coverage html --directory=htmlcov
        
        print_success "Backend tests completed"
        print_success "Coverage report generated in htmlcov/"
    fi
    
    cd ..
fi

# Frontend Tests
if [ "$BACKEND_ONLY" = false ]; then
    print_section "Frontend Tests"
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    if [ ! -d "node_modules" ] || [ "$FAST" = false ]; then
        print_warning "Installing Node.js dependencies"
        npm install
    fi
    
    # Run tests based on options
    if [ "$INTEGRATION_ONLY" = true ]; then
        print_warning "Running frontend integration tests only"
        npm run test:integration
    elif [ "$COVERAGE_ONLY" = true ]; then
        print_warning "Generating frontend coverage report only"
        npm run test:coverage
    else
        print_warning "Running all frontend tests"
        
        # Unit tests
        npm run test:unit
        
        # Integration tests
        npm run test:integration
        
        # Coverage report
        npm run test:coverage
        
        print_success "Frontend tests completed"
        print_success "Coverage report generated in coverage/"
    fi
    
    cd ..
fi

# End-to-End Tests
if [ "$BACKEND_ONLY" = false ] && [ "$FRONTEND_ONLY" = false ] && [ "$COVERAGE_ONLY" = false ]; then
    print_section "End-to-End Tests"
    
    # Check if E2E testing is set up
    if [ -d "tests/e2e" ]; then
        print_warning "Running end-to-end tests"
        
        # Start backend in test mode
        cd "$BACKEND_DIR"
        source venv/bin/activate
        export TESTING=true
        python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 &
        BACKEND_PID=$!
        
        cd ..
        
        # Start frontend in test mode
        cd "$FRONTEND_DIR"
        npm run build
        npm run start -- --port 3001 &
        FRONTEND_PID=$!
        
        cd ..
        
        # Wait for services to start
        sleep 10
        
        # Run E2E tests
        if command_exists playwright; then
            npx playwright test tests/e2e/
        else
            print_warning "Playwright not found, skipping E2E tests"
        fi
        
        # Clean up processes
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        
        print_success "End-to-end tests completed"
    else
        print_warning "No E2E tests found, skipping"
    fi
fi

# Test Summary
print_section "Test Summary"

# Backend summary
if [ "$FRONTEND_ONLY" = false ]; then
    if [ -f "$BACKEND_DIR/htmlcov/index.html" ]; then
        # Extract coverage percentage
        BACKEND_COVERAGE=$(grep -o 'pc_cov">[0-9]*%' "$BACKEND_DIR/htmlcov/index.html" | head -1 | grep -o '[0-9]*')
        if [ -n "$BACKEND_COVERAGE" ]; then
            if [ "$BACKEND_COVERAGE" -ge "$COVERAGE_THRESHOLD" ]; then
                print_success "Backend coverage: ${BACKEND_COVERAGE}% (✓ above threshold)"
            else
                print_warning "Backend coverage: ${BACKEND_COVERAGE}% (below ${COVERAGE_THRESHOLD}% threshold)"
            fi
        fi
    fi
fi

# Frontend summary
if [ "$BACKEND_ONLY" = false ]; then
    if [ -f "$FRONTEND_DIR/coverage/coverage-summary.json" ]; then
        # Extract coverage from JSON
        if command_exists jq; then
            FRONTEND_COVERAGE=$(jq -r '.total.lines.pct' "$FRONTEND_DIR/coverage/coverage-summary.json")
            FRONTEND_COVERAGE_INT=$(echo "$FRONTEND_COVERAGE" | cut -d'.' -f1)
            
            if [ "$FRONTEND_COVERAGE_INT" -ge "$COVERAGE_THRESHOLD" ]; then
                print_success "Frontend coverage: ${FRONTEND_COVERAGE}% (✓ above threshold)"
            else
                print_warning "Frontend coverage: ${FRONTEND_COVERAGE}% (below ${COVERAGE_THRESHOLD}% threshold)"
            fi
        fi
    fi
fi

# Final message
echo ""
echo -e "${GREEN}🎉 Test suite execution completed!${NC}"
echo ""

# Open coverage reports if running interactively
if [ -t 1 ] && [ "$COVERAGE_ONLY" = false ]; then
    read -p "Open coverage reports in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "$BACKEND_DIR/htmlcov/index.html" ]; then
            if command_exists xdg-open; then
                xdg-open "$BACKEND_DIR/htmlcov/index.html"
            elif command_exists open; then
                open "$BACKEND_DIR/htmlcov/index.html"
            fi
        fi
        
        if [ -f "$FRONTEND_DIR/coverage/lcov-report/index.html" ]; then
            if command_exists xdg-open; then
                xdg-open "$FRONTEND_DIR/coverage/lcov-report/index.html"
            elif command_exists open; then
                open "$FRONTEND_DIR/coverage/lcov-report/index.html"
            fi
        fi
    fi
fi