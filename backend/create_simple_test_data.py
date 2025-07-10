#!/usr/bin/env python3
"""
Simple script to create test data for the curriculum system
"""

import sys
import os
import uuid
sys.path.append('/app')

from app.features.common.models.database import get_db
from app.features.curriculum.models.program import Program
from app.features.common.models.enums import CurriculumStatus
from sqlalchemy.orm import Session

def create_test_data():
    """Create simple test curriculum data"""
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create test programs
        print("Creating test programs...")
        
        # Robotics Program
        robotics_program = Program(
            id=str(uuid.uuid4()),
            name="Robotics Engineering",
            program_code="ROBOT-ENG",
            description="Complete robotics engineering program covering design, programming, and automation",
            category="Engineering",
            status="active",  # Using string instead of enum
            display_order=1,
            created_by="admin",
            updated_by="admin"
        )
        db.add(robotics_program)
        
        # AI & Machine Learning Program
        ai_program = Program(
            id=str(uuid.uuid4()),
            name="AI & Machine Learning",
            program_code="AI-ML",
            description="Comprehensive program covering artificial intelligence and machine learning concepts",
            category="Technology",
            status="active",
            display_order=2,
            created_by="admin",
            updated_by="admin"
        )
        db.add(ai_program)
        
        # Web Development Program
        web_program = Program(
            id=str(uuid.uuid4()),
            name="Web Development",
            program_code="WEB-DEV",
            description="Full-stack web development program",
            category="Technology",
            status="active",
            display_order=3,
            created_by="admin",
            updated_by="admin"
        )
        db.add(web_program)
        
        # Sports Program
        sports_program = Program(
            id=str(uuid.uuid4()),
            name="Sports Training",
            program_code="SPORTS",
            description="Comprehensive sports training program",
            category="Sports",
            status="active",
            display_order=4,
            created_by="admin",
            updated_by="admin"
        )
        db.add(sports_program)
        
        # Arts Program
        arts_program = Program(
            id=str(uuid.uuid4()),
            name="Arts & Creative",
            program_code="ARTS",
            description="Creative arts and design program",
            category="Arts",
            status="active",
            display_order=5,
            created_by="admin",
            updated_by="admin"
        )
        db.add(arts_program)
        
        db.commit()
        print(f"Created {5} programs successfully!")
        
        # List created programs
        programs = db.query(Program).all()
        print("\nCreated programs:")
        for program in programs:
            print(f"  - {program.name} ({program.program_code}) - {program.category}")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()