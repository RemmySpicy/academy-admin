# Curriculum Management API Specification

## API Overview

The Curriculum Management API provides comprehensive management of educational content through a sophisticated 7-level hierarchical structure. This API enables administrators to create, organize, and maintain structured learning programs with detailed assessment rubrics, equipment requirements, and multimedia content integration.

## Base URLs and Versioning

- **Base URL**: `https://api.academy-admin.com/api/v1`
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token (required for all endpoints)

## Authentication Requirements

All endpoints require valid JWT token with appropriate role permissions:
```
Authorization: Bearer <jwt_token>
```

**Required Permissions:**
- **Super Admin**: Full access to all curriculum management endpoints
- **Program Admin**: Access limited to assigned programs
- **Instructor**: Read-only access to curriculum content
- **Content Manager**: Full access to media and content management

## Curriculum Hierarchy Structure

The API enforces a strict 7-level hierarchy:
1. **Program** → 2. **Course** → 3. **Curriculum** → 4. **Level** → 5. **Module** → 6. **Section** → 7. **Lesson**

## Detailed Endpoint Specifications

### Program Management Endpoints

#### GET /programs
List all programs with filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `is_active` (boolean): Filter by active status
- `category` (string): Filter by program category
- `search` (string): Search by program name or description

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Swimming",
        "description": "Comprehensive swimming program for all ages",
        "category": "Aquatics",
        "is_active": true,
        "courses_count": 3,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### POST /programs
Create new program.

**Request Body:**
```json
{
  "name": "Swimming",
  "description": "Comprehensive swimming program for all ages",
  "category": "Aquatics",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Swimming",
    "description": "Comprehensive swimming program for all ages",
    "category": "Aquatics",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /programs/{id}
Get program details with course summary.

**Path Parameters:**
- `id` (UUID): Program ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Swimming",
    "description": "Comprehensive swimming program for all ages",
    "category": "Aquatics",
    "is_active": true,
    "courses": [
      {
        "id": "course-id-1",
        "name": "Swimming Club",
        "description": "Regular swimming lessons",
        "target_demographic": "Ages 3-18",
        "duration_weeks": 12,
        "is_active": true
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /programs/{id}/courses
Get courses for a specific program.

**Path Parameters:**
- `id` (UUID): Program ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-id-1",
        "name": "Swimming Club",
        "description": "Regular swimming lessons for recreational swimmers",
        "target_demographic": "Ages 3-18",
        "duration_weeks": 12,
        "is_active": true,
        "curricula_count": 2,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Course Management Endpoints

#### GET /courses
List courses with filtering.

**Query Parameters:**
- `program_id` (UUID): Filter by program
- `is_active` (boolean): Filter by active status
- `target_demographic` (string): Filter by target demographic
- `search` (string): Search by course name

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-id-1",
        "program_id": "123e4567-e89b-12d3-a456-426614174000",
        "program_name": "Swimming",
        "name": "Swimming Club",
        "description": "Regular swimming lessons for recreational swimmers",
        "target_demographic": "Ages 3-18",
        "duration_weeks": 12,
        "is_active": true,
        "curricula_count": 2,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /courses
Create new course.

**Request Body:**
```json
{
  "program_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Swimming Club",
  "description": "Regular swimming lessons for recreational swimmers",
  "target_demographic": "Ages 3-18",
  "duration_weeks": 12,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "course-id-1",
    "program_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Swimming Club",
    "description": "Regular swimming lessons for recreational swimmers",
    "target_demographic": "Ages 3-18",
    "duration_weeks": 12,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /courses/{id}/curricula
Get curricula for a specific course.

**Path Parameters:**
- `id` (UUID): Course ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "curricula": [
      {
        "id": "curriculum-id-1",
        "name": "Swimming Club: 3-5 years",
        "description": "Age-appropriate swimming curriculum for preschoolers",
        "min_age": 3,
        "max_age": 5,
        "prerequisites": "Basic water comfort",
        "learning_objectives": "Develop basic swimming skills and water safety",
        "is_active": true,
        "levels_count": 3,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Curriculum Management Endpoints

#### GET /curricula
List curricula with filtering.

**Query Parameters:**
- `course_id` (UUID): Filter by course
- `min_age` (integer): Filter by minimum age
- `max_age` (integer): Filter by maximum age
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "curricula": [
      {
        "id": "curriculum-id-1",
        "course_id": "course-id-1",
        "course_name": "Swimming Club",
        "name": "Swimming Club: 3-5 years",
        "description": "Age-appropriate swimming curriculum for preschoolers",
        "min_age": 3,
        "max_age": 5,
        "prerequisites": "Basic water comfort",
        "learning_objectives": "Develop basic swimming skills and water safety",
        "is_active": true,
        "levels_count": 3,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /curricula
Create new curriculum.

**Request Body:**
```json
{
  "course_id": "course-id-1",
  "name": "Swimming Club: 3-5 years",
  "description": "Age-appropriate swimming curriculum for preschoolers",
  "min_age": 3,
  "max_age": 5,
  "prerequisites": "Basic water comfort",
  "learning_objectives": "Develop basic swimming skills and water safety",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "curriculum-id-1",
    "course_id": "course-id-1",
    "name": "Swimming Club: 3-5 years",
    "description": "Age-appropriate swimming curriculum for preschoolers",
    "min_age": 3,
    "max_age": 5,
    "prerequisites": "Basic water comfort",
    "learning_objectives": "Develop basic swimming skills and water safety",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /curricula/{id}/clone
Clone curriculum structure to another course.

**Path Parameters:**
- `id` (UUID): Source curriculum ID

**Request Body:**
```json
{
  "target_course_id": "course-id-2",
  "new_name": "Swimming Club: 6-8 years",
  "min_age": 6,
  "max_age": 8,
  "include_assessments": true,
  "include_equipment": true,
  "include_media": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "curriculum-id-2",
    "course_id": "course-id-2",
    "name": "Swimming Club: 6-8 years",
    "description": "Age-appropriate swimming curriculum for school-age children",
    "min_age": 6,
    "max_age": 8,
    "cloned_from": "curriculum-id-1",
    "levels_cloned": 3,
    "created_at": "2024-01-15T11:30:00Z"
  }
}
```

### Level Management Endpoints

#### GET /levels
List levels with filtering.

**Query Parameters:**
- `curriculum_id` (UUID): Filter by curriculum
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "levels": [
      {
        "id": "level-id-1",
        "curriculum_id": "curriculum-id-1",
        "name": "Level 1",
        "description": "Introduction to water and basic safety",
        "sequence_order": 1,
        "entry_criteria": "Age 3-5, comfortable in water",
        "exit_criteria": "Can float independently for 10 seconds",
        "estimated_duration_hours": 10,
        "is_active": true,
        "modules_count": 3,
        "equipment_count": 5,
        "rubrics_count": 2,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /levels
Create new level.

**Request Body:**
```json
{
  "curriculum_id": "curriculum-id-1",
  "name": "Level 1",
  "description": "Introduction to water and basic safety",
  "sequence_order": 1,
  "entry_criteria": "Age 3-5, comfortable in water",
  "exit_criteria": "Can float independently for 10 seconds",
  "estimated_duration_hours": 10,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "level-id-1",
    "curriculum_id": "curriculum-id-1",
    "name": "Level 1",
    "description": "Introduction to water and basic safety",
    "sequence_order": 1,
    "entry_criteria": "Age 3-5, comfortable in water",
    "exit_criteria": "Can float independently for 10 seconds",
    "estimated_duration_hours": 10,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /levels/{id}/equipment
Get equipment requirements for a level.

**Path Parameters:**
- `id` (UUID): Level ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipment_requirements": [
      {
        "id": "equipment-req-1",
        "level_id": "level-id-1",
        "equipment_name": "Pool Noodles",
        "equipment_type": "instructional",
        "quantity_needed": 5,
        "is_mandatory": true,
        "specifications": "36-inch foam pool noodles",
        "safety_notes": "Ensure proper supervision during use",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### GET /levels/{id}/rubrics
Get assessment rubrics for a level.

**Path Parameters:**
- `id` (UUID): Level ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rubrics": [
      {
        "id": "rubric-id-1",
        "level_id": "level-id-1",
        "name": "Level 1 Skills Assessment",
        "description": "Comprehensive assessment of Level 1 swimming skills",
        "rubric_type": "summative",
        "total_possible_stars": 3,
        "is_active": true,
        "criteria_count": 5,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Module Management Endpoints

#### GET /modules
List modules with filtering.

**Query Parameters:**
- `level_id` (UUID): Filter by level
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "module-id-1",
        "level_id": "level-id-1",
        "name": "Module 1: Water Introduction",
        "description": "Getting comfortable in the water environment",
        "sequence_order": 1,
        "learning_objectives": "Develop water confidence and basic safety awareness",
        "estimated_duration_hours": 3,
        "is_active": true,
        "sections_count": 4,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /modules
Create new module.

**Request Body:**
```json
{
  "level_id": "level-id-1",
  "name": "Module 1: Water Introduction",
  "description": "Getting comfortable in the water environment",
  "sequence_order": 1,
  "learning_objectives": "Develop water confidence and basic safety awareness",
  "estimated_duration_hours": 3,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "module-id-1",
    "level_id": "level-id-1",
    "name": "Module 1: Water Introduction",
    "description": "Getting comfortable in the water environment",
    "sequence_order": 1,
    "learning_objectives": "Develop water confidence and basic safety awareness",
    "estimated_duration_hours": 3,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Section Management Endpoints

#### GET /sections
List sections with filtering.

**Query Parameters:**
- `module_id` (UUID): Filter by module
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "section-id-1",
        "module_id": "module-id-1",
        "name": "Section 1: Pool Entry and Exit",
        "description": "Safe methods for entering and exiting the pool",
        "sequence_order": 1,
        "learning_outcomes": "Students can safely enter and exit pool with assistance",
        "estimated_duration_minutes": 45,
        "is_active": true,
        "lessons_count": 3,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /sections
Create new section.

**Request Body:**
```json
{
  "module_id": "module-id-1",
  "name": "Section 1: Pool Entry and Exit",
  "description": "Safe methods for entering and exiting the pool",
  "sequence_order": 1,
  "learning_outcomes": "Students can safely enter and exit pool with assistance",
  "estimated_duration_minutes": 45,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "section-id-1",
    "module_id": "module-id-1",
    "name": "Section 1: Pool Entry and Exit",
    "description": "Safe methods for entering and exiting the pool",
    "sequence_order": 1,
    "learning_outcomes": "Students can safely enter and exit pool with assistance",
    "estimated_duration_minutes": 45,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Lesson Management Endpoints

#### GET /lessons
List lessons with filtering.

**Query Parameters:**
- `section_id` (UUID): Filter by section
- `difficulty_level` (string): Filter by difficulty level
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "lesson-id-1",
        "section_id": "section-id-1",
        "lesson_id": "L101",
        "title": "Safe Pool Entry - Steps",
        "description": "Teaching students to enter pool using steps safely",
        "sequence_order": 1,
        "difficulty_level": "beginner",
        "duration_minutes": 15,
        "is_active": true,
        "media_count": 2,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /lessons
Create new lesson.

**Request Body:**
```json
{
  "section_id": "section-id-1",
  "lesson_id": "L101",
  "title": "Safe Pool Entry - Steps",
  "description": "Teaching students to enter pool using steps safely",
  "sequence_order": 1,
  "difficulty_level": "beginner",
  "instructor_guidelines": "Demonstrate proper step entry technique, emphasize safety",
  "lesson_content": "1. Show proper hand placement on rails\n2. Demonstrate step-by-step entry\n3. Practice with student support",
  "duration_minutes": 15,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "lesson-id-1",
    "section_id": "section-id-1",
    "lesson_id": "L101",
    "title": "Safe Pool Entry - Steps",
    "description": "Teaching students to enter pool using steps safely",
    "sequence_order": 1,
    "difficulty_level": "beginner",
    "instructor_guidelines": "Demonstrate proper step entry technique, emphasize safety",
    "lesson_content": "1. Show proper hand placement on rails\n2. Demonstrate step-by-step entry\n3. Practice with student support",
    "duration_minutes": 15,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /lessons/{id}/media
Get media files for a lesson.

**Path Parameters:**
- `id` (UUID): Lesson ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "media_files": [
      {
        "id": "media-id-1",
        "lesson_id": "lesson-id-1",
        "file_name": "pool-entry-demonstration.mp4",
        "original_file_name": "Pool Entry Demo.mp4",
        "file_type": "video",
        "file_size_bytes": 15728640,
        "file_url": "https://cdn.academy.com/media/pool-entry-demonstration.mp4",
        "thumbnail_url": "https://cdn.academy.com/thumbnails/pool-entry-demo.jpg",
        "description": "Video demonstration of safe pool entry using steps",
        "tags": ["safety", "pool-entry", "demonstration"],
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /lessons/{id}/media
Upload media file for a lesson.

**Path Parameters:**
- `id` (UUID): Lesson ID

**Request Body** (multipart/form-data):
```
file: <media_file>
description: "Video demonstration of safe pool entry using steps"
tags: ["safety", "pool-entry", "demonstration"]
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "media-id-1",
    "lesson_id": "lesson-id-1",
    "file_name": "pool-entry-demonstration.mp4",
    "original_file_name": "Pool Entry Demo.mp4",
    "file_type": "video",
    "file_size_bytes": 15728640,
    "file_url": "https://cdn.academy.com/media/pool-entry-demonstration.mp4",
    "thumbnail_url": "https://cdn.academy.com/thumbnails/pool-entry-demo.jpg",
    "description": "Video demonstration of safe pool entry using steps",
    "tags": ["safety", "pool-entry", "demonstration"],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Assessment Rubric Management Endpoints

#### GET /assessment-rubrics
List assessment rubrics.

**Query Parameters:**
- `level_id` (UUID): Filter by level
- `rubric_type` (string): Filter by rubric type
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rubrics": [
      {
        "id": "rubric-id-1",
        "level_id": "level-id-1",
        "name": "Level 1 Skills Assessment",
        "description": "Comprehensive assessment of Level 1 swimming skills",
        "rubric_type": "summative",
        "total_possible_stars": 3,
        "is_active": true,
        "criteria_count": 5,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /assessment-rubrics
Create new assessment rubric.

**Request Body:**
```json
{
  "level_id": "level-id-1",
  "name": "Level 1 Skills Assessment",
  "description": "Comprehensive assessment of Level 1 swimming skills",
  "rubric_type": "summative",
  "total_possible_stars": 3,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "rubric-id-1",
    "level_id": "level-id-1",
    "name": "Level 1 Skills Assessment",
    "description": "Comprehensive assessment of Level 1 swimming skills",
    "rubric_type": "summative",
    "total_possible_stars": 3,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /assessment-rubrics/{id}/criteria
Get criteria for a rubric.

**Path Parameters:**
- `id` (UUID): Rubric ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "criteria": [
      {
        "id": "criteria-id-1",
        "rubric_id": "rubric-id-1",
        "criteria_name": "Water Entry",
        "description": "Ability to enter water safely",
        "weight_percentage": 20.00,
        "sequence_order": 1,
        "star_descriptors": {
          "0": "Cannot enter water independently",
          "1": "Enters water with significant assistance",
          "2": "Enters water with minimal assistance",
          "3": "Enters water independently and safely"
        },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /assessment-rubrics/{id}/criteria
Add criteria to a rubric.

**Path Parameters:**
- `id` (UUID): Rubric ID

**Request Body:**
```json
{
  "criteria_name": "Water Entry",
  "description": "Ability to enter water safely",
  "weight_percentage": 20.00,
  "sequence_order": 1,
  "zero_star_descriptor": "Cannot enter water independently",
  "one_star_descriptor": "Enters water with significant assistance",
  "two_star_descriptor": "Enters water with minimal assistance",
  "three_star_descriptor": "Enters water independently and safely"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "criteria-id-1",
    "rubric_id": "rubric-id-1",
    "criteria_name": "Water Entry",
    "description": "Ability to enter water safely",
    "weight_percentage": 20.00,
    "sequence_order": 1,
    "star_descriptors": {
      "0": "Cannot enter water independently",
      "1": "Enters water with significant assistance",
      "2": "Enters water with minimal assistance",
      "3": "Enters water independently and safely"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Equipment Requirements Management Endpoints

#### GET /equipment-requirements
List equipment requirements.

**Query Parameters:**
- `level_id` (UUID): Filter by level
- `equipment_type` (string): Filter by equipment type
- `is_mandatory` (boolean): Filter by mandatory status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipment_requirements": [
      {
        "id": "equipment-req-1",
        "level_id": "level-id-1",
        "equipment_name": "Pool Noodles",
        "equipment_type": "instructional",
        "quantity_needed": 5,
        "is_mandatory": true,
        "specifications": "36-inch foam pool noodles, various colors",
        "safety_notes": "Ensure proper supervision during use",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /equipment-requirements
Create new equipment requirement.

**Request Body:**
```json
{
  "level_id": "level-id-1",
  "equipment_name": "Pool Noodles",
  "equipment_type": "instructional",
  "quantity_needed": 5,
  "is_mandatory": true,
  "specifications": "36-inch foam pool noodles, various colors",
  "safety_notes": "Ensure proper supervision during use"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "equipment-req-1",
    "level_id": "level-id-1",
    "equipment_name": "Pool Noodles",
    "equipment_type": "instructional",
    "quantity_needed": 5,
    "is_mandatory": true,
    "specifications": "36-inch foam pool noodles, various colors",
    "safety_notes": "Ensure proper supervision during use",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Media Library Management Endpoints

#### GET /media
List media files with filtering.

**Query Parameters:**
- `file_type` (string): Filter by file type (video, audio, document, image)
- `lesson_id` (UUID): Filter by lesson
- `tags` (string): Filter by tags (comma-separated)
- `search` (string): Search by filename or description

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "media_files": [
      {
        "id": "media-id-1",
        "lesson_id": "lesson-id-1",
        "file_name": "pool-entry-demonstration.mp4",
        "original_file_name": "Pool Entry Demo.mp4",
        "file_type": "video",
        "file_size_bytes": 15728640,
        "file_url": "https://cdn.academy.com/media/pool-entry-demonstration.mp4",
        "thumbnail_url": "https://cdn.academy.com/thumbnails/pool-entry-demo.jpg",
        "description": "Video demonstration of safe pool entry using steps",
        "tags": ["safety", "pool-entry", "demonstration"],
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /media/upload
Upload media file.

**Request Body** (multipart/form-data):
```
file: <media_file>
lesson_id: "lesson-id-1"
description: "Video demonstration of safe pool entry using steps"
tags: ["safety", "pool-entry", "demonstration"]
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "media-id-1",
    "lesson_id": "lesson-id-1",
    "file_name": "pool-entry-demonstration.mp4",
    "original_file_name": "Pool Entry Demo.mp4",
    "file_type": "video",
    "file_size_bytes": 15728640,
    "file_url": "https://cdn.academy.com/media/pool-entry-demonstration.mp4",
    "thumbnail_url": "https://cdn.academy.com/thumbnails/pool-entry-demo.jpg",
    "description": "Video demonstration of safe pool entry using steps",
    "tags": ["safety", "pool-entry", "demonstration"],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /media/{id}/stream
Stream media file.

**Path Parameters:**
- `id` (UUID): Media ID

**Response (200 OK):**
- Content-Type: video/mp4 (or appropriate MIME type)
- Content-Length: file size in bytes
- Stream of media file content

### Hierarchy Navigation Endpoints

#### GET /curriculum-tree/{program_id}
Get complete curriculum tree for a program.

**Path Parameters:**
- `program_id` (UUID): Program ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "program": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Swimming",
      "courses": [
        {
          "id": "course-id-1",
          "name": "Swimming Club",
          "curricula": [
            {
              "id": "curriculum-id-1",
              "name": "Swimming Club: 3-5 years",
              "levels": [
                {
                  "id": "level-id-1",
                  "name": "Level 1",
                  "modules": [
                    {
                      "id": "module-id-1",
                      "name": "Module 1: Water Introduction",
                      "sections": [
                        {
                          "id": "section-id-1",
                          "name": "Section 1: Pool Entry and Exit",
                          "lessons": [
                            {
                              "id": "lesson-id-1",
                              "lesson_id": "L101",
                              "title": "Safe Pool Entry - Steps"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

#### GET /curriculum-path/{lesson_id}
Get full hierarchy path to a lesson.

**Path Parameters:**
- `lesson_id` (UUID): Lesson ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "path": [
      {
        "level": "program",
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Swimming"
      },
      {
        "level": "course",
        "id": "course-id-1",
        "name": "Swimming Club"
      },
      {
        "level": "curriculum",
        "id": "curriculum-id-1",
        "name": "Swimming Club: 3-5 years"
      },
      {
        "level": "level",
        "id": "level-id-1",
        "name": "Level 1"
      },
      {
        "level": "module",
        "id": "module-id-1",
        "name": "Module 1: Water Introduction"
      },
      {
        "level": "section",
        "id": "section-id-1",
        "name": "Section 1: Pool Entry and Exit"
      },
      {
        "level": "lesson",
        "id": "lesson-id-1",
        "name": "Safe Pool Entry - Steps"
      }
    ]
  }
}
```

#### GET /curriculum-search
Search across all curriculum content.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Content type filter (program, course, curriculum, level, module, section, lesson)
- `program_id` (UUID): Limit search to specific program
- `limit` (integer): Number of results (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "lesson",
        "id": "lesson-id-1",
        "title": "Safe Pool Entry - Steps",
        "description": "Teaching students to enter pool using steps safely",
        "path": "Swimming > Swimming Club > Swimming Club: 3-5 years > Level 1 > Module 1: Water Introduction > Section 1: Pool Entry and Exit > Safe Pool Entry - Steps",
        "relevance_score": 0.95
      }
    ],
    "total_results": 1,
    "query": "pool entry"
  }
}
```

## Data Models and Schemas

### Program Model
```json
{
  "id": "UUID",
  "name": "string (required)",
  "description": "string",
  "category": "string",
  "is_active": "boolean",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Assessment Rubric Model
```json
{
  "id": "UUID",
  "level_id": "UUID (required)",
  "name": "string (required)",
  "description": "string",
  "rubric_type": "string (enum: formative, summative, diagnostic)",
  "total_possible_stars": "integer (default: 3)",
  "is_active": "boolean",
  "criteria": [
    {
      "id": "UUID",
      "criteria_name": "string (required)",
      "description": "string",
      "weight_percentage": "decimal",
      "sequence_order": "integer",
      "star_descriptors": {
        "0": "string",
        "1": "string",
        "2": "string",
        "3": "string"
      }
    }
  ],
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

## Error Response Formats

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": ["Error message 1", "Error message 2"]
    }
  }
}
```

## Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied - insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists or hierarchy violation
- **413 Payload Too Large**: File upload size exceeded
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

## Rate Limiting

### Media Upload Endpoints
- **Limit**: 100 uploads per hour per user
- **File Size**: Maximum 500MB per file
- **Concurrent Uploads**: 5 simultaneous uploads

### General API Endpoints
- **Limit**: 1000 requests per hour per authenticated user
- **Burst**: 100 requests per minute

## Security Considerations

### File Upload Security
- Virus scanning on all uploads
- File type validation and restriction
- Secure file storage with access controls
- Content sanitization for media metadata

### Access Control
- Role-based access control enforced
- Program-specific access for Program Admins
- Instructor read-only access to curriculum content
- Media access controls based on user permissions

### Content Security
- Version control for all curriculum content
- Audit logging for all modifications
- Secure media streaming with authentication
- Content backup and recovery procedures

## Example Usage

### Create Complete Curriculum Structure
```javascript
// 1. Create program
const program = await createProgram({
  name: "Swimming",
  description: "Comprehensive swimming program",
  category: "Aquatics"
});

// 2. Create course
const course = await createCourse({
  program_id: program.id,
  name: "Swimming Club",
  target_demographic: "Ages 3-5"
});

// 3. Create curriculum
const curriculum = await createCurriculum({
  course_id: course.id,
  name: "Swimming Club: 3-5 years",
  min_age: 3,
  max_age: 5
});

// 4. Create level with equipment and rubrics
const level = await createLevel({
  curriculum_id: curriculum.id,
  name: "Level 1",
  description: "Introduction to water"
});

// 5. Add equipment requirements
await createEquipmentRequirement({
  level_id: level.id,
  equipment_name: "Pool Noodles",
  quantity_needed: 5,
  is_mandatory: true
});

// 6. Create assessment rubric
const rubric = await createAssessmentRubric({
  level_id: level.id,
  name: "Level 1 Skills Assessment",
  rubric_type: "summative"
});
```

## Testing Endpoints

### Get Curriculum Tree
```bash
curl -X GET "https://api.academy-admin.com/api/v1/curriculum-tree/program-id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upload Media File
```bash
curl -X POST "https://api.academy-admin.com/api/v1/media/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@video.mp4" \
  -F "lesson_id=lesson-id-1" \
  -F "description=Swimming demonstration"
```

### Search Curriculum
```bash
curl -X GET "https://api.academy-admin.com/api/v1/curriculum-search?q=pool%20entry&type=lesson" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```