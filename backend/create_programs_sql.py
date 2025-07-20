#!/usr/bin/env python3
"""
Create academy programs using direct SQL to avoid import issues
"""

import sys
import uuid
from pathlib import Path

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings


def create_academy_programs_sql():
    """Create academy programs using direct SQL."""
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.begin() as conn:
        try:
            print("🏊 Creating Academy Programs using SQL...")
            
            # Define the programs to create
            programs = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Swimming",
                    "program_code": "SWIM",
                    "description": "Comprehensive swimming program covering all skill levels from beginner to competitive. Includes stroke technique, safety protocols, and endurance training.",
                    "category": "Sports",
                    "status": "active",
                    "display_order": 1
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Football",
                    "program_code": "FOOTBALL",
                    "description": "Complete football training program focusing on skills development, team strategy, fitness, and sportsmanship.",
                    "category": "Sports", 
                    "status": "active",
                    "display_order": 2
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Basketball",
                    "program_code": "BASKETBALL",
                    "description": "Basketball development program covering fundamentals, team play, conditioning, and competitive strategies.",
                    "category": "Sports",
                    "status": "active", 
                    "display_order": 3
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Music",
                    "program_code": "MUSIC",
                    "description": "Comprehensive music education program including theory, performance, composition, and music appreciation across various genres and instruments.",
                    "category": "Arts",
                    "status": "active",
                    "display_order": 4
                },
                {
                    "id": str(uuid.uuid4()),
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
            
            for program_data in programs:
                # Check if program already exists
                result = conn.execute(
                    text("SELECT id FROM programs WHERE name = :name OR program_code = :code"),
                    {"name": program_data["name"], "code": program_data["program_code"]}
                ).fetchone()
                
                if result:
                    # Update existing program
                    conn.execute(
                        text("""
                            UPDATE programs 
                            SET name = :name,
                                program_code = :program_code,
                                description = :description,
                                category = :category,
                                status = :status,
                                display_order = :display_order,
                                updated_at = NOW(),
                                updated_by = 'admin'
                            WHERE id = :id
                        """),
                        {
                            "id": result[0],
                            "name": program_data["name"],
                            "program_code": program_data["program_code"],
                            "description": program_data["description"],
                            "category": program_data["category"],
                            "status": program_data["status"],
                            "display_order": program_data["display_order"]
                        }
                    )
                    print(f"✅ Updated existing program: {program_data['name']} ({program_data['program_code']})")
                    updated_count += 1
                else:
                    # Create new program
                    conn.execute(
                        text("""
                            INSERT INTO programs (
                                id, name, program_code, description, category, 
                                status, display_order, created_at, updated_at, 
                                created_by, updated_by
                            ) VALUES (
                                :id, :name, :program_code, :description, :category,
                                :status, :display_order, NOW(), NOW(),
                                'admin', 'admin'
                            )
                        """),
                        program_data
                    )
                    print(f"✅ Created new program: {program_data['name']} ({program_data['program_code']})")
                    created_count += 1
            
            print(f"\n🎉 Successfully processed {created_count + updated_count} programs!")
            print(f"   Created: {created_count}")
            print(f"   Updated: {updated_count}")
            
            # Display final program list ordered by display_order
            print("\n" + "="*60)
            print("ACADEMY PROGRAMS (ordered by priority)")
            print("="*60)
            
            result = conn.execute(
                text("SELECT name, program_code, category, status FROM programs ORDER BY display_order, name")
            )
            
            for i, row in enumerate(result, 1):
                status_emoji = "🟢" if row[3] == "active" else "🔴"
                print(f"{i:2d}. {status_emoji} {row[0]} ({row[1]})")
                print(f"    Category: {row[2]}")
                print(f"    Status: {row[3]}")
                print()
            
            print("="*60)
            print("✅ Academy programs are ready for use!")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating academy programs: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    print("🚀 Setting up Academy Programs...")
    success = create_academy_programs_sql()
    
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