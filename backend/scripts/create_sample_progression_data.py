#!/usr/bin/env python3
"""
Create sample data for testing the star-based progression system.

This script creates:
- Sample curriculum with levels, modules, sections, and lessons
- Progression settings for the curriculum
- Assessment criteria for each level
- Sample student progress data
- Module unlock scenarios
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
import random

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@academy.com"
ADMIN_PASSWORD = "admin123"

class SampleDataCreator:
    def __init__(self):
        self.auth_headers = {}
        self.created_data = {}
        
    def authenticate(self) -> bool:
        """Authenticate and get JWT token."""
        try:
            response = requests.post(f"{API_BASE_URL}/auth/login", data={
                "username": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                token_data = response.json()
                self.auth_headers = {
                    "Authorization": f"Bearer {token_data['access_token']}",
                    "X-Program-Context": "1",  # Use first program
                    "Content-Type": "application/json"
                }
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def get_sample_course(self) -> Dict[str, Any]:
        """Get or create a sample course."""
        try:
            # Try to get existing courses first
            response = requests.get(f"{API_BASE_URL}/courses", headers=self.auth_headers)
            
            if response.status_code == 200:
                courses = response.json()
                if courses.get('data') and len(courses['data']) > 0:
                    course = courses['data'][0]
                    print(f"✅ Using existing course: {course['name']}")
                    return course
            
            # Create a new course if none exist
            course_data = {
                "name": "Swimming Fundamentals - Progression Test",
                "description": "Sample course for testing the star-based progression system",
                "skill_level": "beginner",
                "status": "active",
                "objectives": [
                    "Learn basic water safety",
                    "Master floating techniques", 
                    "Develop basic swimming strokes",
                    "Build water confidence"
                ]
            }
            
            response = requests.post(
                f"{API_BASE_URL}/courses",
                headers=self.auth_headers,
                json=course_data
            )
            
            if response.status_code == 201:
                course = response.json()['data']
                print(f"✅ Created sample course: {course['name']}")
                return course
            else:
                print(f"❌ Failed to create course: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error with sample course: {e}")
            return None
    
    def create_sample_curriculum_structure(self, course_id: str) -> Dict[str, Any]:
        """Create a complete curriculum structure."""
        print("\n🏗️ Creating sample curriculum structure...")
        
        # Create curriculum
        curriculum_data = {
            "name": "Beginner Swimming with Star Progression",
            "description": "A comprehensive beginner swimming curriculum using star-based progression",
            "course_id": course_id,
            "difficulty_level": "beginner",
            "min_age": 6,
            "max_age": 12,
            "learning_objectives": "Master basic swimming skills through progressive star-based learning",
            "status": "published"
        }
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/courses/curricula",
                headers=self.auth_headers,
                json=curriculum_data
            )
            
            if response.status_code == 201:
                curriculum = response.json()['data']
                print(f"✅ Created curriculum: {curriculum['name']}")
                self.created_data['curriculum'] = curriculum
                
                # Create levels, modules, sections, and lessons
                self.create_levels(curriculum['id'])
                
                return curriculum
            else:
                print(f"❌ Failed to create curriculum: {response.status_code}")
                print(response.text)
                return None
                
        except Exception as e:
            print(f"❌ Error creating curriculum: {e}")
            return None
    
    def create_levels(self, curriculum_id: str):
        """Create sample levels for the curriculum."""
        levels_data = [
            {
                "name": "Level 1: Water Introduction",
                "description": "Introduction to water safety and basic floating",
                "curriculum_id": curriculum_id,
                "sequence_order": 1,
                "entry_criteria": "No prior swimming experience required",
                "exit_criteria": "Comfortable floating and basic water safety knowledge",
                "estimated_duration_hours": 10
            },
            {
                "name": "Level 2: Basic Skills",
                "description": "Basic swimming movements and breathing techniques",
                "curriculum_id": curriculum_id,
                "sequence_order": 2,
                "entry_criteria": "Completed Level 1 assessment",
                "exit_criteria": "Can perform basic freestyle movements",
                "estimated_duration_hours": 15
            },
            {
                "name": "Level 3: Stroke Development", 
                "description": "Refinement of swimming strokes and technique",
                "curriculum_id": curriculum_id,
                "sequence_order": 3,
                "entry_criteria": "Completed Level 2 assessment",
                "exit_criteria": "Proficient in freestyle and backstroke",
                "estimated_duration_hours": 20
            }
        ]
        
        created_levels = []
        
        for level_data in levels_data:
            try:
                response = requests.post(
                    f"{API_BASE_URL}/courses/levels",
                    headers=self.auth_headers,
                    json=level_data
                )
                
                if response.status_code == 201:
                    level = response.json()['data']
                    created_levels.append(level)
                    print(f"✅ Created {level['name']}")
                    
                    # Create modules for this level
                    self.create_modules(level['id'], level['sequence_order'])
                    
                else:
                    print(f"❌ Failed to create level: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error creating level: {e}")
        
        self.created_data['levels'] = created_levels
    
    def create_modules(self, level_id: str, level_sequence: int):
        """Create sample modules for a level."""
        modules_data = {
            1: [  # Level 1 modules
                {
                    "name": "Water Safety Fundamentals",
                    "description": "Essential water safety knowledge and pool rules",
                    "estimated_duration_hours": 3
                },
                {
                    "name": "Basic Floating",
                    "description": "Learning to float on back and front",
                    "estimated_duration_hours": 4
                },
                {
                    "name": "Water Movement",
                    "description": "Moving through water with confidence",
                    "estimated_duration_hours": 3
                }
            ],
            2: [  # Level 2 modules
                {
                    "name": "Breathing Techniques",
                    "description": "Proper breathing for swimming",
                    "estimated_duration_hours": 5
                },
                {
                    "name": "Arm Movements",
                    "description": "Basic arm stroke techniques",
                    "estimated_duration_hours": 5
                },
                {
                    "name": "Leg Movements",
                    "description": "Kicking techniques and leg coordination",
                    "estimated_duration_hours": 5
                }
            ],
            3: [  # Level 3 modules
                {
                    "name": "Freestyle Mastery",
                    "description": "Advanced freestyle technique and efficiency",
                    "estimated_duration_hours": 7
                },
                {
                    "name": "Backstroke Development",
                    "description": "Backstroke technique and refinement", 
                    "estimated_duration_hours": 7
                },
                {
                    "name": "Endurance Building",
                    "description": "Building swimming stamina and distance",
                    "estimated_duration_hours": 6
                }
            ]
        }
        
        level_modules = modules_data.get(level_sequence, [])
        
        for seq, module_data in enumerate(level_modules, 1):
            module_data.update({
                "level_id": level_id,
                "sequence_order": seq,
                "status": "active"
            })
            
            try:
                response = requests.post(
                    f"{API_BASE_URL}/courses/modules",
                    headers=self.auth_headers,
                    json=module_data
                )
                
                if response.status_code == 201:
                    module = response.json()['data']
                    print(f"  ✅ Created module: {module['name']}")
                    
                    # Create sections for this module
                    self.create_sections(module['id'], seq)
                    
                else:
                    print(f"  ❌ Failed to create module: {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ Error creating module: {e}")
    
    def create_sections(self, module_id: str, module_sequence: int):
        """Create sample sections for a module."""
        # Create 2-3 sections per module
        sections_count = random.randint(2, 3)
        
        for seq in range(1, sections_count + 1):
            section_data = {
                "name": f"Section {seq}",
                "description": f"Learning activities for section {seq}",
                "module_id": module_id,
                "sequence_order": seq,
                "learning_outcomes": f"Complete specific objectives for section {seq}",
                "estimated_duration_minutes": random.randint(30, 60),
                "status": "active"
            }
            
            try:
                response = requests.post(
                    f"{API_BASE_URL}/courses/sections",
                    headers=self.auth_headers,
                    json=section_data
                )
                
                if response.status_code == 201:
                    section = response.json()['data']
                    
                    # Create lessons for this section
                    self.create_lessons(section['id'])
                    
                else:
                    print(f"    ❌ Failed to create section: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error creating section: {e}")
    
    def create_lessons(self, section_id: str):
        """Create sample lessons for a section."""
        # Create 3-5 lessons per section
        lessons_count = random.randint(3, 5)
        
        lesson_types = [
            ("Introduction", "video", "Overview and introduction to topic"),
            ("Demonstration", "practical", "Live demonstration of technique"),
            ("Practice", "practical", "Guided practice session"),
            ("Assessment", "assessment", "Skills assessment and feedback"),
            ("Review", "document", "Review and reinforcement of concepts")
        ]
        
        for seq in range(1, lessons_count + 1):
            lesson_type = lesson_types[(seq - 1) % len(lesson_types)]
            
            lesson_data = {
                "section_id": section_id,
                "lesson_id": f"L{random.randint(100, 999)}",
                "title": f"{lesson_type[0]} - Session {seq}",
                "description": lesson_type[2],
                "sequence_order": seq,
                "lesson_content": f"Detailed content for {lesson_type[0]} session",
                "instructor_guidelines": f"Guidelines for teaching {lesson_type[0]}",
                "learning_objectives": f"Students will be able to {lesson_type[0].lower()}",
                "duration_minutes": random.randint(15, 45),
                "difficulty_level": "beginner",
                "status": "active"
            }
            
            try:
                response = requests.post(
                    f"{API_BASE_URL}/courses/lessons",
                    headers=self.auth_headers,
                    json=lesson_data
                )
                
                if response.status_code == 201:
                    lesson = response.json()['data']
                    # Store lessons for later use in progression testing
                    if 'lessons' not in self.created_data:
                        self.created_data['lessons'] = []
                    self.created_data['lessons'].append(lesson)
                    
                else:
                    print(f"      ❌ Failed to create lesson: {response.status_code}")
                    
            except Exception as e:
                print(f"      ❌ Error creating lesson: {e}")
    
    def create_progression_settings(self, curriculum_id: str):
        """Create progression settings for the curriculum."""
        print("\n⚙️ Creating progression settings...")
        
        settings_data = {
            "curriculum_id": curriculum_id,
            "module_unlock_threshold_percentage": 70.0,
            "require_minimum_one_star_per_lesson": True,
            "allow_cross_level_progression": True,
            "allow_lesson_retakes": True,
            "track_time_spent": True,
            "track_attempts": True
        }
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/courses/progression/settings",
                headers=self.auth_headers,
                json=settings_data
            )
            
            if response.status_code == 201:
                settings = response.json()['data']
                print(f"✅ Created progression settings (70% unlock threshold)")
                self.created_data['progression_settings'] = settings
                return settings
            else:
                print(f"❌ Failed to create progression settings: {response.status_code}")
                print(response.text)
                return None
                
        except Exception as e:
            print(f"❌ Error creating progression settings: {e}")
            return None
    
    def create_assessment_criteria(self):
        """Create assessment criteria for all levels."""
        print("\n📋 Creating assessment criteria...")
        
        if 'levels' not in self.created_data:
            print("❌ No levels found to create assessment criteria")
            return
        
        # Standard assessment criteria for swimming
        criteria_templates = [
            {
                "name": "Technical Proficiency",
                "description": "Assessment of swimming technique and form",
                "weight": 1.0,
                "guidelines": "Observe stroke technique, body position, and coordination"
            },
            {
                "name": "Safety Awareness",
                "description": "Understanding and application of water safety",
                "weight": 1.5,  # Higher weight for safety
                "guidelines": "Evaluate safety knowledge and consistent safe practices"
            },
            {
                "name": "Confidence in Water",
                "description": "Comfort level and confidence while swimming",
                "weight": 1.0,
                "guidelines": "Assess student's comfort and willingness to participate"
            },
            {
                "name": "Following Instructions",
                "description": "Ability to listen to and follow instructor guidance",
                "weight": 0.8,
                "guidelines": "Evaluate responsiveness to instruction and feedback"
            },
            {
                "name": "Progress Rate",
                "description": "Rate of skill acquisition and improvement",
                "weight": 0.7,
                "guidelines": "Consider improvement shown during the level"
            }
        ]
        
        created_criteria = []
        
        for level in self.created_data['levels']:
            for seq, criteria_template in enumerate(criteria_templates, 1):
                criteria_data = {
                    "level_id": level['id'],
                    "name": criteria_template['name'],
                    "description": criteria_template['description'],
                    "sequence_order": seq,
                    "weight": criteria_template['weight'],
                    "max_score": 3,
                    "min_passing_score": 1,
                    "assessment_guidelines": criteria_template['guidelines'],
                    "score_descriptors": [
                        {"score": 0, "description": "Unable to demonstrate skill"},
                        {"score": 1, "description": "Basic demonstration with assistance"},
                        {"score": 2, "description": "Good demonstration with minor issues"},
                        {"score": 3, "description": "Excellent demonstration, independent"}
                    ]
                }
                
                try:
                    response = requests.post(
                        f"{API_BASE_URL}/courses/progression/assessment-criteria",
                        headers=self.auth_headers,
                        json=criteria_data
                    )
                    
                    if response.status_code == 201:
                        criteria = response.json()['data']
                        created_criteria.append(criteria)
                        
                    else:
                        print(f"❌ Failed to create assessment criteria: {response.status_code}")
                        
                except Exception as e:
                    print(f"❌ Error creating assessment criteria: {e}")
            
            print(f"✅ Created assessment criteria for {level['name']}")
        
        self.created_data['assessment_criteria'] = created_criteria
    
    def create_sample_data(self) -> bool:
        """Create all sample data for progression system testing."""
        print("🚀 Creating Sample Progression Data...")
        print("=" * 50)
        
        # Step 1: Authentication
        if not self.authenticate():
            return False
        
        # Step 2: Get or create sample course
        course = self.get_sample_course()
        if not course:
            return False
        
        # Step 3: Create curriculum structure
        curriculum = self.create_sample_curriculum_structure(course['id'])
        if not curriculum:
            return False
        
        # Step 4: Create progression settings
        settings = self.create_progression_settings(curriculum['id'])
        if not settings:
            return False
        
        # Step 5: Create assessment criteria
        self.create_assessment_criteria()
        
        # Summary
        print("\n" + "=" * 50)
        print("🎉 Sample data creation completed!")
        print(f"\n📊 Created Data Summary:")
        print(f"✅ Course: {course['name']}")
        print(f"✅ Curriculum: {curriculum['name']}")
        print(f"✅ Levels: {len(self.created_data.get('levels', []))}")
        print(f"✅ Lessons: {len(self.created_data.get('lessons', []))}")
        print(f"✅ Assessment Criteria: {len(self.created_data.get('assessment_criteria', []))}")
        print(f"✅ Progression Settings: 70% unlock threshold")
        
        print(f"\n🎯 Next Steps:")
        print("1. Test the progression system:")
        print("   python3 backend/scripts/test_progression_system.py")
        print("2. Access the Enhanced Curriculum Builder:")
        print("   http://localhost:3000/admin/courses")
        print("3. Try grading lessons and testing module unlocks")
        print("4. Test level assessments and progression controls")
        
        return True

def main():
    """Main function."""
    creator = SampleDataCreator()
    
    try:
        success = creator.create_sample_data()
        
        if not success:
            print("\n❌ Sample data creation failed. Please check the error messages above.")
            return False
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Sample data creation interrupted by user")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error during sample data creation: {e}")
        return False

if __name__ == "__main__":
    main()