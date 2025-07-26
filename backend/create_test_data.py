#!/usr/bin/env python3
"""
Script to create test data for the curriculum system
"""

import sys
import os
sys.path.append('/app')

from app.features.common.models.database import get_db
from app.features.programs.models.program import Program
from app.features.courses.models.course import Course
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.level import Level
from app.features.courses.models.module import Module
from app.features.courses.models.section import Section
from app.features.courses.models.lesson import Lesson
from app.features.common.models.enums import DifficultyLevel, CurriculumStatus
from sqlalchemy.orm import Session

def create_test_data():
    """Create test curriculum data"""
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create test programs
        print("Creating test programs...")
        
        # Robotics Program
        robotics_program = Program(
            name="Robotics Engineering",
            code="ROBOT-ENG",
            description="Complete robotics engineering program covering design, programming, and automation",
            objectives="Students will learn to design, build, and program robots for various applications",
            duration_weeks=24,
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            prerequisites="Basic programming knowledge helpful",
            target_audience="High school students and adults interested in robotics",
            certification_available=True,
            status=CurriculumStatus.ACTIVE,
            is_featured=True,
            created_by="admin",
            updated_by="admin"
        )
        db.add(robotics_program)
        db.commit()
        db.refresh(robotics_program)
        
        # AI & Machine Learning Program
        ai_program = Program(
            name="AI & Machine Learning",
            code="AI-ML",
            description="Comprehensive program covering artificial intelligence and machine learning concepts",
            objectives="Students will understand AI principles and implement ML algorithms",
            duration_weeks=16,
            difficulty_level=DifficultyLevel.ADVANCED,
            prerequisites="Programming experience required",
            target_audience="College students and professionals",
            certification_available=True,
            status=CurriculumStatus.ACTIVE,
            is_featured=True,
            created_by="admin",
            updated_by="admin"
        )
        db.add(ai_program)
        db.commit()
        db.refresh(ai_program)
        
        # Web Development Program
        web_program = Program(
            name="Web Development",
            code="WEB-DEV",
            description="Full-stack web development program",
            objectives="Students will build modern web applications",
            duration_weeks=12,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="No prior experience required",
            target_audience="Beginners to web development",
            certification_available=True,
            status=CurriculumStatus.ACTIVE,
            is_featured=False,
            created_by="admin",
            updated_by="admin"
        )
        db.add(web_program)
        db.commit()
        db.refresh(web_program)
        
        print(f"Created {3} programs")
        
        # Create test courses for robotics program
        print("Creating test courses...")
        
        # Robotics courses
        intro_course = Course(
            program_id=robotics_program.id,
            name="Introduction to Robotics",
            code="ROBOT-101",
            description="Basic concepts and principles of robotics",
            objectives="Understand robot components and basic programming",
            duration_hours=40,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="None",
            sequence=1,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(intro_course)
        
        advanced_course = Course(
            program_id=robotics_program.id,
            name="Advanced Robot Programming",
            code="ROBOT-201",
            description="Advanced programming techniques for robots",
            objectives="Implement complex robot behaviors and algorithms",
            duration_hours=60,
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            prerequisites="Introduction to Robotics",
            sequence=2,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(advanced_course)
        
        # AI courses
        ai_fundamentals = Course(
            program_id=ai_program.id,
            name="AI Fundamentals",
            code="AI-101",
            description="Introduction to artificial intelligence concepts",
            objectives="Understand basic AI principles and applications",
            duration_hours=35,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="Basic programming",
            sequence=1,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(ai_fundamentals)
        
        # Web development courses
        html_css = Course(
            program_id=web_program.id,
            name="HTML & CSS Basics",
            code="WEB-101",
            description="Introduction to web markup and styling",
            objectives="Create basic websites with HTML and CSS",
            duration_hours=25,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="None",
            sequence=1,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(html_css)
        
        db.commit()
        print(f"Created {4} courses")
        
        # Create test curricula
        print("Creating test curricula...")
        
        # Robotics curriculum
        robotics_curriculum = Curriculum(
            course_id=intro_course.id,
            name="Robot Building Basics",
            code="ROBOT-101-CURR",
            description="Learn to build your first robot",
            objectives="Build and program a simple robot",
            duration_hours=20,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="None",
            sequence=1,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(robotics_curriculum)
        
        # AI curriculum
        ai_curriculum = Curriculum(
            course_id=ai_fundamentals.id,
            name="Introduction to AI Concepts",
            code="AI-101-CURR",
            description="Basic AI principles and concepts",
            objectives="Understand what AI is and its applications",
            duration_hours=15,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="Basic programming",
            sequence=1,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(ai_curriculum)
        
        # Web curriculum
        web_curriculum = Curriculum(
            course_id=html_css.id,
            name="Web Page Creation",
            code="WEB-101-CURR",
            description="Create your first web page",
            objectives="Build a complete web page with HTML and CSS",
            duration_hours=12,
            difficulty_level=DifficultyLevel.BEGINNER,
            prerequisites="None",
            sequence=1,
            status=CurriculumStatus.ACTIVE,
            created_by="admin",
            updated_by="admin"
        )
        db.add(web_curriculum)
        
        db.commit()
        print(f"Created {3} curricula")
        
        print("✅ Test data created successfully!")
        print("\nSummary:")
        print(f"  - {3} Programs")
        print(f"  - {4} Courses")
        print(f"  - {3} Curricula")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()