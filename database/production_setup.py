#!/usr/bin/env python3
"""
Production Database Setup Script for Academy Admin

This script helps set up the database for production deployment.
It handles database initialization, migrations, and optional seeding.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def run_command(command, description, check=True):
    """Run a command and handle errors"""
    print(f"⚡ {description}...")
    try:
        result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False

def check_database_connection(database_url):
    """Check if database connection is working"""
    print("🔍 Checking database connection...")
    
    # Extract database type from URL
    if database_url.startswith('postgresql://'):
        check_cmd = f"psql '{database_url}' -c 'SELECT 1;'"
    elif database_url.startswith('mysql://'):
        check_cmd = f"mysql '{database_url}' -e 'SELECT 1;'"
    else:
        print("⚠️  Database connection check not supported for this database type")
        return True
    
    return run_command(check_cmd, "Testing database connection", check=False)

def run_init_scripts(database_url):
    """Run database initialization scripts"""
    init_dir = Path(__file__).parent / "init"
    
    if not init_dir.exists():
        print("⚠️  No init scripts found, skipping...")
        return True
    
    print(f"📁 Found init scripts in {init_dir}")
    
    # Get all SQL files and sort them
    sql_files = sorted(init_dir.glob("*.sql"))
    
    if not sql_files:
        print("⚠️  No SQL files found in init directory")
        return True
    
    for sql_file in sql_files:
        print(f"🗄️  Running {sql_file.name}...")
        
        if database_url.startswith('postgresql://'):
            cmd = f"psql '{database_url}' -f {sql_file}"
        elif database_url.startswith('mysql://'):
            cmd = f"mysql '{database_url}' < {sql_file}"
        else:
            print(f"❌ Unsupported database type for {sql_file.name}")
            continue
        
        if not run_command(cmd, f"Executing {sql_file.name}"):
            return False
    
    return True

def run_migrations():
    """Run Alembic migrations"""
    backend_dir = Path(__file__).parent.parent / "backend"
    
    if not (backend_dir / "alembic.ini").exists():
        print("⚠️  No alembic.ini found, skipping migrations...")
        return True
    
    print("🔄 Running database migrations...")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Run migrations
    return run_command("python -m alembic upgrade head", "Running Alembic migrations")

def run_seeders():
    """Run database seeders"""
    seeders_dir = Path(__file__).parent / "seeders"
    
    if not seeders_dir.exists():
        print("⚠️  No seeders directory found, skipping...")
        return True
    
    run_all_script = seeders_dir / "run_all.py"
    
    if not run_all_script.exists():
        print("⚠️  No run_all.py seeder script found, skipping...")
        return True
    
    print("🌱 Running database seeders...")
    return run_command(f"python {run_all_script}", "Running database seeders")

def main():
    parser = argparse.ArgumentParser(description="Set up Academy Admin database for production")
    parser.add_argument("--database-url", required=True, help="Database connection URL")
    parser.add_argument("--skip-init", action="store_true", help="Skip initialization scripts")
    parser.add_argument("--skip-migrations", action="store_true", help="Skip migrations")
    parser.add_argument("--skip-seeders", action="store_true", help="Skip seeders")
    parser.add_argument("--only-check", action="store_true", help="Only check database connection")
    
    args = parser.parse_args()
    
    print("🚀 Academy Admin Database Setup")
    print("=" * 40)
    
    # Check database connection
    if not check_database_connection(args.database_url):
        print("❌ Database connection failed!")
        sys.exit(1)
    
    print("✅ Database connection successful!")
    
    if args.only_check:
        print("✅ Connection check completed successfully!")
        return
    
    # Run initialization scripts
    if not args.skip_init:
        if not run_init_scripts(args.database_url):
            print("❌ Failed to run initialization scripts!")
            sys.exit(1)
        print("✅ Initialization scripts completed!")
    
    # Run migrations
    if not args.skip_migrations:
        if not run_migrations():
            print("❌ Failed to run migrations!")
            sys.exit(1)
        print("✅ Migrations completed!")
    
    # Run seeders
    if not args.skip_seeders:
        if not run_seeders():
            print("❌ Failed to run seeders!")
            sys.exit(1)
        print("✅ Seeders completed!")
    
    print("🎉 Database setup completed successfully!")
    print("\nNext steps:")
    print("1. Start your backend application")
    print("2. Test the API endpoints")
    print("3. Deploy your frontend application")

if __name__ == "__main__":
    main()