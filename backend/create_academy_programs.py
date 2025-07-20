#!/usr/bin/env python3
"""
Create the specific programs requested for the Academy Administration:
1. Swimming (Display order 1 - highest priority)
2. Football
3. Basketball  
4. Music
5. Robotics Engineering (update existing if it exists)
"""

import asyncio
import sys
import uuid
from pathlib import Path

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.features.courses.models.program import Program
from app.features.common.models.enums import CurriculumStatus


def create_academy_programs():
    """Create the specific academy programs with proper ordering."""
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    with SessionLocal() as db:
        try:
            print("🏊 Creating Academy Programs...")
            
            # Define the programs to create
            programs_to_create = [
                {
                    "name": "Swimming",
                    "program_code": "SWIM",
                    "description": "Comprehensive swimming program covering all skill levels from beginner to competitive. Includes stroke technique, safety protocols, and endurance training.",
                    "category": "Sports",
                    "status": "active",
                    "display_order": 1
                },
                {
                    "name": "Football",
                    "program_code": "FOOTBALL",
                    "description": "Complete football training program focusing on skills development, team strategy, fitness, and sportsmanship.",
                    "category": "Sports", 
                    "status": "active",
                    "display_order": 2
                },
                {
                    "name": "Basketball",
                    "program_code": "BASKETBALL",
                    "description": "Basketball development program covering fundamentals, team play, conditioning, and competitive strategies.",
                    "category": "Sports",
                    "status": "active", 
                    "display_order": 3
                },
                {
                    "name": "Music",
                    "program_code": "MUSIC",
                    "description": "Comprehensive music education program including theory, performance, composition, and music appreciation across various genres and instruments.",
                    "category": "Arts",
                    "status": "active",
                    "display_order": 4
                },
                {
                    "name": "Robotics Engineering",
                    "program_code": "ROBOTICS-ENG", 
                    "description": "Advanced robotics engineering program covering mechanical design, programming, electronics, and automation systems.",
                    "category": "Engineering",
                    "status": "active",
                    "display_order": 5
                }
            ]
            
            created_count = 0
            updated_count = 0
            
            for program_data in programs_to_create:
                # Check if program already exists (by name or code)
                existing_program = db.query(Program).filter(
                    (Program.name == program_data["name"]) | 
                    (Program.program_code == program_data["program_code"])
                ).first()
                
                if existing_program:
                    # Update existing program
                    existing_program.name = program_data["name"]
                    existing_program.program_code = program_data["program_code"]
                    existing_program.description = program_data["description"]
                    existing_program.category = program_data["category"]
                    existing_program.status = program_data["status"]
                    existing_program.display_order = program_data["display_order"]
                    existing_program.updated_by = "admin"
                    
                    print(f"✅ Updated existing program: {program_data['name']} ({program_data['program_code']})")
                    updated_count += 1
                else:
                    # Create new program
                    new_program = Program(
                        id=str(uuid.uuid4()),
                        name=program_data["name"],
                        program_code=program_data["program_code"],
                        description=program_data["description"],
                        category=program_data["category"],
                        status=program_data["status"],
                        display_order=program_data["display_order"],
                        created_by="admin",
                        updated_by="admin"
                    )
                    db.add(new_program)
                    
                    print(f"✅ Created new program: {program_data['name']} ({program_data['program_code']})")
                    created_count += 1
            
            # Commit all changes
            db.commit()
            print(f"\n🎉 Successfully processed {created_count + updated_count} programs!")
            print(f"   Created: {created_count}")
            print(f"   Updated: {updated_count}")
            
            # Display final program list ordered by display_order
            print("\n" + "="*60)
            print("ACADEMY PROGRAMS (ordered by priority)")
            print("="*60)
            
            programs = db.query(Program).order_by(Program.display_order, Program.name).all()
            for i, program in enumerate(programs, 1):
                status_emoji = "🟢" if program.status == "active" else "🔴"
                print(f"{i:2d}. {status_emoji} {program.name} ({program.program_code})")
                print(f"    Category: {program.category}")
                print(f"    Status: {program.status}")
                if program.description:
                    description = program.description[:80] + "..." if len(program.description) > 80 else program.description
                    print(f"    Description: {description}")
                print()
            
            print("="*60)
            print("✅ Academy programs are ready for use!")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating academy programs: {e}")
            import traceback
            traceback.print_exc()
            db.rollback()
            return False


if __name__ == "__main__":
    print("🚀 Setting up Academy Programs...")
    success = create_academy_programs()
    
    if success:
        print("\n✅ All programs created successfully!")
        print("\n🎯 Next Steps:")
        print("   1. Start the frontend application")
        print("   2. Login as Super Admin (admin@academy.com / admin123)")
        print("   3. Navigate to Academy Administration > Programs")
        print("   4. Verify all programs are visible and functional")
    else:
        print("❌ Program creation failed!")
        sys.exit(1)