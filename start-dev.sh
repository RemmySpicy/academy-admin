#!/bin/bash

echo "🚀 Starting Academy Admin Development Servers..."

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    echo "❌ Please run this script from the academy-admin root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📋 .env.local not found. Creating from example..."
    cp .env.local.example .env.local
    echo "✅ .env.local created. Please review and update if needed."
fi

# Check if PostgreSQL database is running
echo "🔍 Checking PostgreSQL database..."
if ! docker-compose -f docker-compose.local.yml ps | grep -q "db.*Up"; then
    echo "⚠️  PostgreSQL database not running. Starting it..."
    docker-compose -f docker-compose.local.yml up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 8
    
    # Verify database is ready
    if ! docker-compose -f docker-compose.local.yml exec db pg_isready -U admin -d academy_admin_local > /dev/null 2>&1; then
        echo "❌ Database failed to start. Run './setup-local-db.sh' first."
        exit 1
    fi
fi

echo "✅ PostgreSQL database is ready!"

# Load environment variables
export $(cat .env.local | xargs)

# Start backend in background
echo "🔧 Starting backend on port 8000..."
cd backend
python3 -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend in background
echo "🎨 Starting frontend on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment and check if servers started
sleep 3

echo ""
echo "✅ Development servers started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️  Database: postgresql://admin:password@localhost:5432/academy_admin_local"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "💡 Database is still running. Use 'docker-compose -f docker-compose.local.yml down' to stop it."
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for user to press Ctrl+C
wait