#!/bin/bash

echo "🗄️  Setting up local PostgreSQL database for Academy Admin..."

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    echo "❌ Please run this script from the academy-admin root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📋 Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "✅ .env.local created. Please review and update the database password if needed."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL database
echo "🚀 Starting PostgreSQL database..."
docker-compose -f docker-compose.local.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is ready
if docker-compose -f docker-compose.local.yml exec db pg_isready -U admin -d academy_admin_local > /dev/null 2>&1; then
    echo "✅ Database is ready!"
else
    echo "⏳ Database is still starting up. Waiting a bit more..."
    sleep 10
    
    if docker-compose -f docker-compose.local.yml exec db pg_isready -U admin -d academy_admin_local > /dev/null 2>&1; then
        echo "✅ Database is ready!"
    else
        echo "❌ Database failed to start. Check Docker logs:"
        docker-compose -f docker-compose.local.yml logs db
        exit 1
    fi
fi

# Run migrations
echo "🔧 Running database migrations..."
if [ -f "backend/alembic.ini" ]; then
    cd backend
    # Load environment variables for migration
    export $(cat ../.env.local | xargs)
    python3 -m alembic upgrade head
    cd ..
    echo "✅ Database migrations completed!"
else
    echo "⚠️  No alembic.ini found. Skipping migrations."
fi

echo ""
echo "🎉 Local PostgreSQL setup complete!"
echo "📊 Database: postgresql://admin:password@localhost:5432/academy_admin_local"
echo "🔧 To stop the database: docker-compose -f docker-compose.local.yml down"
echo "🔄 To restart the database: docker-compose -f docker-compose.local.yml restart"
echo ""
echo "Now you can run: ./start-dev.sh"