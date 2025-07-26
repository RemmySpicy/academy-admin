#!/usr/bin/env python3
"""
Simple script to populate existing programs with default configuration values.
Uses direct SQL to avoid SQLAlchemy relationship issues.
"""

import json
import os
import sys
from typing import Dict, Any

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker


def get_default_configuration() -> Dict[str, Any]:
    """Get default configuration for existing programs."""
    return {
        "age_groups": [
            {"id": "6-8", "name": "6-8 years", "from_age": 6, "to_age": 8},
            {"id": "9-12", "name": "9-12 years", "from_age": 9, "to_age": 12},
            {"id": "13-17", "name": "13-17 years", "from_age": 13, "to_age": 17},
            {"id": "18+", "name": "18+ years", "from_age": 18, "to_age": 99}
        ],
        "difficulty_levels": [
            {"id": "beginner", "name": "Beginner", "weight": 1},
            {"id": "intermediate", "name": "Intermediate", "weight": 2},
            {"id": "advanced", "name": "Advanced", "weight": 3}
        ],
        "session_types": [
            {"id": "private", "name": "Private", "capacity": 2},
            {"id": "group", "name": "Group", "capacity": 5},
            {"id": "school-group", "name": "School Group", "capacity": 50}
        ],
        "default_session_duration": 60
    }


def populate_program_defaults():
    """Populate existing programs with default configuration using direct SQL."""
    
    # Database connection
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://academy_user:academy_password@db:5432/academy_db')
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    
    try:
        # Get programs that need configuration
        result = db.execute(text("""
            SELECT id, name, program_code, age_groups, difficulty_levels, session_types, default_session_duration
            FROM programs 
            WHERE age_groups IS NULL OR difficulty_levels IS NULL OR session_types IS NULL OR default_session_duration IS NULL
        """))
        
        programs = result.fetchall()
        
        if not programs:
            print("✅ All programs already have configuration. No updates needed.")
            return
        
        print(f"📋 Found {len(programs)} programs that need default configuration:")
        
        default_config = get_default_configuration()
        updated_count = 0
        
        for program in programs:
            print(f"  - Updating '{program.name}' ({program.program_code or 'no code'})")
            
            # Determine what needs updating
            age_groups = program.age_groups if program.age_groups else default_config["age_groups"]
            difficulty_levels = program.difficulty_levels if program.difficulty_levels else default_config["difficulty_levels"]
            session_types = program.session_types if program.session_types else default_config["session_types"]
            default_duration = program.default_session_duration if program.default_session_duration else default_config["default_session_duration"]
            
            # Update the program
            db.execute(text("""
                UPDATE programs 
                SET 
                    age_groups = :age_groups,
                    difficulty_levels = :difficulty_levels,
                    session_types = :session_types,
                    default_session_duration = :default_session_duration,
                    updated_at = NOW()
                WHERE id = :program_id
            """), {
                "program_id": program.id,
                "age_groups": json.dumps(age_groups),
                "difficulty_levels": json.dumps(difficulty_levels),
                "session_types": json.dumps(session_types),
                "default_session_duration": default_duration
            })
            
            updated_count += 1
        
        if updated_count > 0:
            db.commit()
            print(f"✅ Successfully updated {updated_count} programs with default configuration.")
        else:
            print("ℹ️  No programs needed updates.")
            
        # Show summary
        print("\n📊 Default Configuration Applied:")
        print(f"  - Age Groups: {len(default_config['age_groups'])} groups")
        print(f"  - Difficulty Levels: {len(default_config['difficulty_levels'])} levels")
        print(f"  - Session Types: {len(default_config['session_types'])} types")
        print(f"  - Default Duration: {default_config['default_session_duration']} minutes")
        
    except Exception as e:
        print(f"❌ Error updating programs: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Starting program configuration population...")
    populate_program_defaults()
    print("🎉 Program configuration population completed!")