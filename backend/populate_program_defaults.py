#!/usr/bin/env python3
"""
Script to populate existing programs with default configuration values.

This script applies the enhanced configuration defaults to all existing programs
that don't already have configuration data.
"""

import sys
import os
from typing import Dict, Any

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.features.common.models.database import get_db
from app.features.programs.models.program import Program
from app.features.programs.services.program_service import program_service


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
    """Populate existing programs with default configuration."""
    
    # Get database session
    db_generator = get_db()
    db: Session = next(db_generator)
    
    try:
        # Get all programs that don't have configuration
        programs = db.query(Program).filter(
            (Program.age_groups.is_(None)) |
            (Program.difficulty_levels.is_(None)) |
            (Program.session_types.is_(None)) |
            (Program.default_session_duration.is_(None))
        ).all()
        
        if not programs:
            print("✅ All programs already have configuration. No updates needed.")
            return
        
        print(f"📋 Found {len(programs)} programs that need default configuration:")
        
        default_config = get_default_configuration()
        updated_count = 0
        
        for program in programs:
            print(f"  - Updating '{program.name}' ({program.program_code or 'no code'})")
            
            # Apply defaults only for missing fields
            needs_update = False
            
            if not program.age_groups:
                program.age_groups = default_config["age_groups"]
                needs_update = True
                
            if not program.difficulty_levels:
                program.difficulty_levels = default_config["difficulty_levels"]
                needs_update = True
                
            if not program.session_types:
                program.session_types = default_config["session_types"]
                needs_update = True
                
            if not program.default_session_duration:
                program.default_session_duration = default_config["default_session_duration"]
                needs_update = True
            
            if needs_update:
                db.add(program)
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