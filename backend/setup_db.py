#!/usr/bin/env python3
"""
Setup database with tables and admin user
"""
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from app.core.config import settings
from app.features.common.models.base import Base

# Import all models to ensure proper SQLAlchemy relationships
from app.features.authentication.models.user import User
from app.features.students.models.course_enrollment import CourseEnrollment
from app.features.students.models.student import Student
from app.features.programs.models.program import Program

# Create database engine
engine = create_engine(settings.DATABASE_URL)

# Create all tables
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin_user():
    """Create admin user"""
    db = SessionLocal()
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if existing_admin:
        print("Admin user already exists")
        db.close()
        return
    
    # Create password hash
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password_hash = pwd_context.hash("admin123")
    
    # Create admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        username="admin",
        email="admin@academy.com",
        password_hash=password_hash,
        first_name="System",
        last_name="Administrator",
        role="super_admin",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.close()
    
    print("Admin user created successfully!")
    print("Username: admin")
    print("Email: admin@academy.com")
    print("Password: admin123")

if __name__ == "__main__":
    create_admin_user()