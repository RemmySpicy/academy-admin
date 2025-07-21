#!/usr/bin/env python3
"""
Setup script for creating users and program assignments.
This script will:
1. Update existing admin user to super_admin role
2. Create new program admin for Swimming program
3. Assign users to appropriate programs
4. Migrate existing data to Swimming program
"""

import asyncio
import sys
from pathlib import Path

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from app.core.config import settings

# Import all models to ensure proper SQLAlchemy relationships  
from app.features.authentication.models.user import User
from app.features.authentication.models.user_program_assignment import UserProgramAssignment
from app.features.students.models.course_enrollment import CourseEnrollment
from app.features.students.models.student import Student
from app.features.courses.models.program import Program


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def setup_users_and_programs():
    """Set up users and program assignments."""
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    with SessionLocal() as db:
        try:
            # 1. Find the Swimming program
            swimming_program = db.query(Program).filter(Program.name == "Swimming").first()
            if not swimming_program:
                print("❌ Swimming program not found! Please ensure it exists in the database.")
                return False
            
            print(f"✅ Found Swimming program: {swimming_program.id}")
            
            # 2. Update existing admin user to super_admin role
            existing_admin = db.query(User).filter(User.email == "admin@academy.com").first()
            if existing_admin:
                existing_admin.role = "super_admin"
                print(f"✅ Updated existing admin user to super_admin role")
                
                # Assign super admin to Swimming program (default)
                super_admin_assignment = UserProgramAssignment()
                super_admin_assignment.user_id = existing_admin.id
                super_admin_assignment.program_id = swimming_program.id
                super_admin_assignment.is_default = True
                super_admin_assignment.assigned_by = existing_admin.id
                db.add(super_admin_assignment)
                print(f"✅ Assigned super admin to Swimming program as default")
            else:
                print("❌ Existing admin user not found!")
                return False
            
            # 3. Create new program admin for Swimming
            existing_program_admin = db.query(User).filter(User.email == "swim.admin@academy.com").first()
            if not existing_program_admin:
                program_admin = User()
                program_admin.username = "swim.admin"
                program_admin.email = "swim.admin@academy.com"
                program_admin.password_hash = hash_password("swim123")
                program_admin.full_name = "Swimming Program Administrator"
                program_admin.role = "program_admin"
                program_admin.is_active = True
                program_admin.created_by = existing_admin.id
                program_admin.updated_by = existing_admin.id
                db.add(program_admin)
                db.flush()  # Get the ID
                
                # Assign program admin to Swimming program
                program_admin_assignment = UserProgramAssignment()
                program_admin_assignment.user_id = program_admin.id
                program_admin_assignment.program_id = swimming_program.id
                program_admin_assignment.is_default = True
                program_admin_assignment.assigned_by = existing_admin.id
                db.add(program_admin_assignment)
                print(f"✅ Created new program admin: swim.admin@academy.com")
                print(f"✅ Assigned program admin to Swimming program")
            else:
                print(f"ℹ️  Program admin already exists: swim.admin@academy.com")
                # Ensure they have the correct role
                existing_program_admin.role = "program_admin"
                
                # Check if assignment exists
                existing_assignment = db.query(UserProgramAssignment).filter(
                    UserProgramAssignment.user_id == existing_program_admin.id,
                    UserProgramAssignment.program_id == swimming_program.id
                ).first()
                
                if not existing_assignment:
                    assignment = UserProgramAssignment()
                    assignment.user_id = existing_program_admin.id
                    assignment.program_id = swimming_program.id
                    assignment.is_default = True
                    assignment.assigned_by = existing_admin.id
                    db.add(assignment)
                    print(f"✅ Assigned existing program admin to Swimming program")
            
            # 4. Migrate existing students to Swimming program
            students_updated = db.execute(
                text("UPDATE students SET program_id = :program_id WHERE program_id IS NULL"),
                {"program_id": swimming_program.id}
            ).rowcount
            
            print(f"✅ Migrated {students_updated} students to Swimming program")
            
            # 5. Commit all changes
            db.commit()
            print("✅ All changes committed successfully!")
            
            # 6. Display summary
            print("\n" + "="*50)
            print("SETUP SUMMARY")
            print("="*50)
            print(f"Super Admin: admin@academy.com (role: super_admin)")
            print(f"Program Admin: swim.admin@academy.com (role: program_admin)")
            print(f"Swimming Program ID: {swimming_program.id}")
            print(f"Students migrated: {students_updated}")
            print("="*50)
            
            return True
            
        except Exception as e:
            print(f"❌ Error during setup: {e}")
            db.rollback()
            return False


if __name__ == "__main__":
    print("🚀 Starting user and program setup...")
    success = setup_users_and_programs()
    
    if success:
        print("✅ Setup completed successfully!")
        print("\nYou can now login with:")
        print("  Super Admin: admin@academy.com / admin123")
        print("  Program Admin: swim.admin@academy.com / swim123")
    else:
        print("❌ Setup failed!")
        sys.exit(1)