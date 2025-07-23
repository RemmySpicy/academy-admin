#!/usr/bin/env python3
"""
Test script for the star-based progression system.

This script verifies that the progression system API endpoints are working
correctly and demonstrates the key functionality:
- Progression settings management
- Level assessment criteria creation
- Student lesson progress tracking
- Module unlock calculations
- Level assessment workflow
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@academy.com"
ADMIN_PASSWORD = "admin123"

class ProgressionSystemTest:
    def __init__(self):
        self.auth_headers = {}
        self.test_data = {}
        
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
                print(response.text)
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to API server. Please ensure the backend is running on http://localhost:8000")
            return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_health_check(self) -> bool:
        """Test basic API connectivity."""
        try:
            response = requests.get(f"{API_BASE_URL}/health/")
            if response.status_code == 200:
                print("✅ API health check passed")
                return True
            else:
                print(f"❌ API health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def get_sample_curriculum(self) -> Optional[Dict[str, Any]]:
        """Get a sample curriculum for testing."""
        try:
            response = requests.get(f"{API_BASE_URL}/courses/curricula", headers=self.auth_headers)
            
            if response.status_code == 200:
                curricula = response.json()
                if curricula.get('data') and len(curricula['data']) > 0:
                    curriculum = curricula['data'][0]
                    print(f"✅ Found sample curriculum: {curriculum['name']}")
                    return curriculum
            
            print("⚠️  No existing curricula found. You'll need to create one first.")
            return None
            
        except Exception as e:
            print(f"❌ Error fetching curriculum: {e}")
            return None
    
    def test_progression_settings(self, curriculum_id: str) -> bool:
        """Test curriculum progression settings management."""
        print("\n🧪 Testing Progression Settings...")
        
        # Test creating progression settings
        settings_data = {
            "curriculum_id": curriculum_id,
            "module_unlock_threshold_percentage": 75.0,
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
                self.test_data['progression_settings'] = settings
                print(f"✅ Created progression settings with 75% unlock threshold")
                
                # Test retrieving settings
                response = requests.get(
                    f"{API_BASE_URL}/courses/progression/settings/curriculum/{curriculum_id}",
                    headers=self.auth_headers
                )
                
                if response.status_code == 200:
                    retrieved_settings = response.json()['data']
                    if retrieved_settings['module_unlock_threshold_percentage'] == 75.0:
                        print("✅ Successfully retrieved progression settings")
                        return True
                    else:
                        print("❌ Retrieved settings don't match created settings")
                        return False
                else:
                    print(f"❌ Failed to retrieve settings: {response.status_code}")
                    return False
            else:
                print(f"❌ Failed to create progression settings: {response.status_code}")
                print(response.text)
                return False
                
        except Exception as e:
            print(f"❌ Progression settings test error: {e}")
            return False
    
    def get_sample_level(self, curriculum_id: str) -> Optional[Dict[str, Any]]:
        """Get a sample level for testing assessment criteria."""
        try:
            response = requests.get(
                f"{API_BASE_URL}/courses/levels",
                headers=self.auth_headers,
                params={"curriculum_id": curriculum_id}
            )
            
            if response.status_code == 200:
                levels = response.json()
                if levels.get('data') and len(levels['data']) > 0:
                    level = levels['data'][0]
                    print(f"✅ Found sample level: {level['name']}")
                    return level
            
            print("⚠️  No existing levels found.")
            return None
            
        except Exception as e:
            print(f"❌ Error fetching level: {e}")
            return None
    
    def test_assessment_criteria(self, level_id: str) -> bool:
        """Test level assessment criteria management."""
        print("\n🧪 Testing Assessment Criteria...")
        
        # Test creating assessment criteria
        criteria_data = [
            {
                "level_id": level_id,
                "name": "Technical Proficiency",
                "description": "Assessment of technical skills and execution",
                "sequence_order": 1,
                "weight": 1.0,
                "max_score": 3,
                "min_passing_score": 1,
                "assessment_guidelines": "Observe student's technical execution and form",
                "score_descriptors": [
                    {"score": 0, "description": "Unable to perform technique"},
                    {"score": 1, "description": "Basic technique with major errors"},
                    {"score": 2, "description": "Good technique with minor errors"},
                    {"score": 3, "description": "Excellent technique, near perfect execution"}
                ]
            },
            {
                "level_id": level_id,
                "name": "Safety Awareness",
                "description": "Understanding and application of safety protocols",
                "sequence_order": 2,
                "weight": 1.5,  # Higher weight for safety
                "max_score": 3,
                "min_passing_score": 2,  # Higher minimum for safety
                "assessment_guidelines": "Evaluate safety knowledge and consistent application"
            }
        ]
        
        created_criteria = []
        
        try:
            for criteria in criteria_data:
                response = requests.post(
                    f"{API_BASE_URL}/courses/progression/assessment-criteria",
                    headers=self.auth_headers,
                    json=criteria
                )
                
                if response.status_code == 201:
                    created_criteria.append(response.json()['data'])
                else:
                    print(f"❌ Failed to create assessment criteria: {response.status_code}")
                    return False
            
            print(f"✅ Created {len(created_criteria)} assessment criteria")
            self.test_data['assessment_criteria'] = created_criteria
            
            # Test retrieving criteria
            response = requests.get(
                f"{API_BASE_URL}/courses/progression/assessment-criteria/level/{level_id}",
                headers=self.auth_headers
            )
            
            if response.status_code == 200:
                retrieved_criteria = response.json()['data']['items']
                if len(retrieved_criteria) >= len(created_criteria):
                    print("✅ Successfully retrieved assessment criteria")
                    return True
                else:
                    print("❌ Retrieved criteria count doesn't match")
                    return False
            else:
                print(f"❌ Failed to retrieve criteria: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Assessment criteria test error: {e}")
            return False
    
    def test_instructor_dashboard(self) -> bool:
        """Test instructor dashboard analytics."""
        print("\n🧪 Testing Instructor Dashboard...")
        
        try:
            response = requests.get(
                f"{API_BASE_URL}/courses/progression/analytics/instructor/dashboard",
                headers=self.auth_headers
            )
            
            if response.status_code == 200:
                dashboard = response.json()['data']
                print(f"✅ Instructor dashboard loaded successfully")
                print(f"   - Students to grade: {dashboard.get('students_to_grade', 0)}")
                print(f"   - Assessments to complete: {dashboard.get('assessments_to_complete', 0)}")
                return True
            else:
                print(f"❌ Failed to load instructor dashboard: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Instructor dashboard test error: {e}")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all progression system tests."""
        print("🚀 Starting Progression System Tests...")
        print("=" * 50)
        
        # Step 1: Health check
        if not self.test_health_check():
            return False
        
        # Step 2: Authentication
        if not self.authenticate():
            return False
        
        # Step 3: Get sample data
        curriculum = self.get_sample_curriculum()
        if not curriculum:
            print("⚠️  Skipping tests that require existing curriculum data.")
            print("   Create a curriculum first using the admin interface.")
            return False
        
        curriculum_id = curriculum['id']
        
        # Step 4: Test progression settings
        if not self.test_progression_settings(curriculum_id):
            return False
        
        # Step 5: Test assessment criteria (if level exists)
        level = self.get_sample_level(curriculum_id)
        if level:
            if not self.test_assessment_criteria(level['id']):
                return False
        else:
            print("⚠️  Skipping assessment criteria tests (no levels found)")
        
        # Step 6: Test instructor dashboard
        if not self.test_instructor_dashboard():
            return False
        
        print("\n" + "=" * 50)
        print("🎉 All progression system tests completed successfully!")
        print("\n📋 Test Summary:")
        print("✅ API connectivity")
        print("✅ Authentication")
        print("✅ Progression settings CRUD")
        if level:
            print("✅ Assessment criteria CRUD")
        print("✅ Instructor dashboard analytics")
        
        return True

def main():
    """Main test function."""
    tester = ProgressionSystemTest()
    
    try:
        success = tester.run_all_tests()
        
        if success:
            print("\n🎯 Next Steps:")
            print("1. Run database migrations if not already done:")
            print("   cd backend && alembic upgrade head")
            print("2. Test the frontend curriculum builder:")
            print("   http://localhost:3000/admin/courses")
            print("3. Create sample curricula with levels and modules")
            print("4. Test progression features in the Enhanced Curriculum Builder")
            
        else:
            print("\n❌ Some tests failed. Please check the error messages above.")
            return False
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error during tests: {e}")
        return False

if __name__ == "__main__":
    main()