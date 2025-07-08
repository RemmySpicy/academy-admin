# Curriculum Management Database Schema

## Schema Overview

The curriculum management database schema implements a sophisticated 7-level hierarchical structure for educational content organization. This design supports comprehensive curriculum management with assessment rubrics, equipment requirements, media library integration, and content versioning.

## Hierarchical Structure

The curriculum hierarchy follows a strict 7-level structure:

1. **Programs** → 2. **Courses** → 3. **Curricula** → 4. **Levels** → 5. **Modules** → 6. **Sections** → 7. **Lessons**

## Core Tables

### 1. Programs Table

Top-level categorization of academy offerings (e.g., Swimming, Football, Basketball).

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'SWIM', 'FOOT', 'BASK'
    category VARCHAR(100), -- e.g., 'Aquatics', 'Team Sports', 'Individual Sports'
    target_demographics VARCHAR(255), -- e.g., 'Children, Adults', 'All Ages'
    
    -- Program Details
    min_age INTEGER,
    max_age INTEGER,
    difficulty_level VARCHAR(50), -- beginner, intermediate, advanced
    duration_type VARCHAR(50), -- ongoing, seasonal, fixed-term
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Branding and Media
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    color_scheme VARCHAR(50),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### 2. Courses Table

Specific offerings within a program (e.g., Swimming Club, Adult Swimming, Survival Swimming).

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL, -- e.g., 'SWIM-CLUB', 'SWIM-ADULT'
    
    -- Course Details
    target_demographic VARCHAR(255), -- e.g., 'Children 6-12', 'Adults 18+'
    duration_weeks INTEGER,
    sessions_per_week INTEGER DEFAULT 1,
    session_duration_minutes INTEGER DEFAULT 60,
    
    -- Prerequisites and Requirements
    prerequisites TEXT,
    age_requirements VARCHAR(100),
    skill_requirements TEXT,
    
    -- Capacity and Pricing
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    base_price DECIMAL(10,2),
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_course_code UNIQUE (program_id, code)
);
```

### 3. Curricula Table

Age-specific or skill-level-specific groupings within courses.

```sql
CREATE TABLE curricula (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL, -- e.g., 'SWIM-CLUB-6-18'
    
    -- Age and Skill Targeting
    min_age INTEGER,
    max_age INTEGER,
    skill_level VARCHAR(50), -- beginner, intermediate, advanced
    
    -- Learning Framework
    prerequisites TEXT,
    learning_objectives TEXT,
    expected_outcomes TEXT,
    
    -- Duration and Structure
    estimated_duration_weeks INTEGER,
    total_levels INTEGER,
    
    -- Assessment Framework
    assessment_method VARCHAR(100), -- continuous, milestone, final
    progression_criteria TEXT,
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_curriculum_code UNIQUE (course_id, code),
    CONSTRAINT chk_age_range CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age)
);
```

### 4. Levels Table

Progressive skill levels within a curriculum.

```sql
CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL, -- e.g., 'LEVEL-1', 'LEVEL-2'
    
    -- Level Structure
    sequence_order INTEGER NOT NULL,
    level_number INTEGER,
    
    -- Learning Criteria
    entry_criteria TEXT,
    exit_criteria TEXT,
    mastery_requirements TEXT,
    
    -- Time and Effort
    estimated_duration_hours INTEGER,
    estimated_sessions INTEGER,
    
    -- Assessment Information
    assessment_frequency VARCHAR(50), -- weekly, bi-weekly, monthly
    pass_percentage DECIMAL(5,2) DEFAULT 75.00,
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_level_sequence UNIQUE (curriculum_id, sequence_order),
    CONSTRAINT uk_level_code UNIQUE (curriculum_id, code)
);
```

### 5. Modules Table

Thematic groupings of related skills or concepts within a level.

```sql
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL, -- e.g., 'MOD-1', 'MOD-2'
    
    -- Module Structure
    sequence_order INTEGER NOT NULL,
    module_number INTEGER,
    
    -- Learning Framework
    learning_objectives TEXT,
    key_concepts TEXT[],
    skills_developed TEXT[],
    
    -- Time and Effort
    estimated_duration_hours INTEGER,
    estimated_sessions INTEGER,
    
    -- Teaching Approach
    teaching_method VARCHAR(100), -- sequential, parallel, flexible
    difficulty_progression VARCHAR(50), -- linear, spiral, branching
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_core BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_module_sequence UNIQUE (level_id, sequence_order),
    CONSTRAINT uk_module_code UNIQUE (level_id, code)
);
```

### 6. Sections Table

Specific skill areas or topics within a module.

```sql
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL, -- e.g., 'SEC-1', 'SEC-2'
    
    -- Section Structure
    sequence_order INTEGER NOT NULL,
    section_number INTEGER,
    
    -- Learning Framework
    learning_outcomes TEXT,
    key_skills TEXT[],
    practice_activities TEXT[],
    
    -- Time and Effort
    estimated_duration_minutes INTEGER,
    estimated_practice_time INTEGER,
    
    -- Assessment
    is_assessable BOOLEAN DEFAULT true,
    assessment_type VARCHAR(50), -- practical, theoretical, mixed
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_prerequisite BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_section_sequence UNIQUE (module_id, sequence_order),
    CONSTRAINT uk_section_code UNIQUE (module_id, code)
);
```

### 7. Lessons Table

Individual teaching units with specific objectives and detailed content.

```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    lesson_id VARCHAR(20) NOT NULL, -- e.g., 'L101', 'L102'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Lesson Structure
    sequence_order INTEGER NOT NULL,
    lesson_number INTEGER,
    
    -- Content and Delivery
    lesson_type VARCHAR(50), -- instruction, practice, assessment, review
    difficulty_level VARCHAR(50), -- easy, medium, hard
    
    -- Detailed Content
    lesson_objectives TEXT,
    instructor_guidelines TEXT,
    lesson_content TEXT,
    
    -- Activities and Materials
    warm_up_activities TEXT[],
    main_activities TEXT[],
    cool_down_activities TEXT[],
    required_materials TEXT[],
    
    -- Timing and Pacing
    duration_minutes INTEGER DEFAULT 60,
    preparation_time INTEGER DEFAULT 15,
    
    -- Assessment Integration
    assessment_criteria TEXT,
    success_indicators TEXT[],
    
    -- Safety and Special Considerations
    safety_notes TEXT,
    special_considerations TEXT,
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Version Control
    version_number INTEGER DEFAULT 1,
    last_reviewed_date DATE,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_lesson_sequence UNIQUE (section_id, sequence_order),
    CONSTRAINT uk_lesson_id UNIQUE (section_id, lesson_id)
);
```

## Assessment and Evaluation Tables

### 8. Assessment Rubrics Table

Comprehensive assessment rubrics for each level with 0-3 star rating system.

```sql
CREATE TABLE assessment_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL,
    
    -- Rubric Configuration
    rubric_type VARCHAR(50) CHECK (rubric_type IN ('formative', 'summative', 'diagnostic', 'self_assessment')),
    total_possible_stars INTEGER DEFAULT 3,
    passing_threshold INTEGER DEFAULT 2,
    
    -- Weighting and Scoring
    weight_percentage DECIMAL(5,2) DEFAULT 100.00,
    scoring_method VARCHAR(50) DEFAULT 'average', -- average, weighted, highest, latest
    
    -- Usage Information
    frequency VARCHAR(50), -- daily, weekly, monthly, end_of_level
    is_mandatory BOOLEAN DEFAULT true,
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_rubric_code UNIQUE (level_id, code),
    CONSTRAINT chk_rubric_threshold CHECK (passing_threshold >= 0 AND passing_threshold <= total_possible_stars)
);
```

### 9. Assessment Criteria Table

Detailed criteria for each assessment rubric with 0-3 star descriptors.

```sql
CREATE TABLE assessment_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rubric_id UUID NOT NULL REFERENCES assessment_rubrics(id) ON DELETE CASCADE,
    criteria_name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL,
    
    -- Criteria Configuration
    sequence_order INTEGER NOT NULL,
    weight_percentage DECIMAL(5,2) DEFAULT 100.00,
    
    -- Star Rating Descriptors
    zero_star_descriptor TEXT NOT NULL,
    one_star_descriptor TEXT NOT NULL,
    two_star_descriptor TEXT NOT NULL,
    three_star_descriptor TEXT NOT NULL,
    
    -- Assessment Guidance
    assessment_guidelines TEXT,
    examples TEXT,
    common_errors TEXT,
    
    -- Skill Alignment
    skill_category VARCHAR(100),
    related_skills TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT true,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_criteria_sequence UNIQUE (rubric_id, sequence_order),
    CONSTRAINT uk_criteria_code UNIQUE (rubric_id, code)
);
```

## Equipment and Resources Tables

### 10. Equipment Requirements Table

Equipment specifications and requirements for each curriculum level.

```sql
CREATE TABLE equipment_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    equipment_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Equipment Classification
    equipment_type VARCHAR(100) CHECK (equipment_type IN ('safety', 'instructional', 'assessment', 'enhancement')),
    equipment_category VARCHAR(100), -- e.g., 'flotation', 'training_aids', 'safety_equipment'
    
    -- Requirements
    quantity_needed INTEGER DEFAULT 1,
    quantity_per_student INTEGER DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT true,
    is_consumable BOOLEAN DEFAULT false,
    
    -- Specifications
    specifications TEXT,
    brand_preferences TEXT,
    size_requirements TEXT,
    
    -- Safety and Compliance
    safety_notes TEXT,
    compliance_standards TEXT[],
    maintenance_requirements TEXT,
    
    -- Cost and Sourcing
    estimated_cost DECIMAL(10,2),
    preferred_suppliers TEXT[],
    replacement_frequency VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### 11. Media Library Table

Centralized media repository for all curriculum content.

```sql
CREATE TABLE media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('video', 'audio', 'document', 'image', 'interactive')),
    file_format VARCHAR(20), -- mp4, pdf, jpg, pptx, etc.
    file_size_bytes BIGINT,
    
    -- Storage Information
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    cdn_url VARCHAR(500),
    
    -- Content Metadata
    title VARCHAR(255),
    description TEXT,
    alt_text TEXT,
    
    -- Categorization
    tags TEXT[],
    categories TEXT[],
    difficulty_level VARCHAR(50),
    
    -- Media Properties
    duration_seconds INTEGER, -- for video/audio
    dimensions VARCHAR(50), -- for images/videos
    resolution VARCHAR(50),
    
    -- Usage and Licensing
    usage_rights VARCHAR(100),
    copyright_info TEXT,
    attribution_required BOOLEAN DEFAULT false,
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    
    -- Quality Control
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    review_status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_media_attachment CHECK (
        lesson_id IS NOT NULL OR section_id IS NOT NULL OR module_id IS NOT NULL
    )
);
```

## Content Management Tables

### 12. Content Versions Table

Version control for all curriculum content with change tracking.

```sql
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('program', 'course', 'curriculum', 'level', 'module', 'section', 'lesson')),
    content_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    
    -- Version Information
    version_name VARCHAR(100),
    version_description TEXT,
    
    -- Content Snapshot
    content_data JSONB NOT NULL,
    
    -- Change Information
    change_type VARCHAR(50) CHECK (change_type IN ('created', 'updated', 'deleted', 'restored')),
    change_summary TEXT,
    change_details TEXT,
    
    -- Publication Status
    is_published BOOLEAN DEFAULT false,
    is_current BOOLEAN DEFAULT false,
    publication_date TIMESTAMP,
    
    -- Author Information
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Review and Approval
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Notes
    change_notes TEXT,
    review_notes TEXT,
    
    CONSTRAINT uk_content_version UNIQUE (content_type, content_id, version_number)
);
```

### 13. Curriculum Templates Table

Reusable curriculum templates for rapid development.

```sql
CREATE TABLE curriculum_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- full_curriculum, level_template, module_template
    
    -- Template Configuration
    template_data JSONB NOT NULL,
    variables JSONB, -- Template variables for customization
    
    -- Usage Information
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    
    -- Categories and Tags
    category VARCHAR(100),
    tags TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

## Performance Indexes

### Primary Indexes
```sql
-- Hierarchy navigation indexes
CREATE INDEX idx_courses_program_id ON courses(program_id);
CREATE INDEX idx_curricula_course_id ON curricula(course_id);
CREATE INDEX idx_levels_curriculum_id ON levels(curriculum_id);
CREATE INDEX idx_modules_level_id ON modules(level_id);
CREATE INDEX idx_sections_module_id ON sections(module_id);
CREATE INDEX idx_lessons_section_id ON lessons(section_id);

-- Sequence order indexes for efficient ordering
CREATE INDEX idx_courses_sequence ON courses(program_id, sequence_order);
CREATE INDEX idx_curricula_sequence ON curricula(course_id, sequence_order);
CREATE INDEX idx_levels_sequence ON levels(curriculum_id, sequence_order);
CREATE INDEX idx_modules_sequence ON modules(level_id, sequence_order);
CREATE INDEX idx_sections_sequence ON sections(module_id, sequence_order);
CREATE INDEX idx_lessons_sequence ON lessons(section_id, sequence_order);

-- Status and visibility indexes
CREATE INDEX idx_programs_active ON programs(is_active, is_visible);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_curricula_active ON curricula(is_active);
CREATE INDEX idx_levels_active ON levels(is_active);
CREATE INDEX idx_modules_active ON modules(is_active);
CREATE INDEX idx_sections_active ON sections(is_active);
CREATE INDEX idx_lessons_active ON lessons(is_active, is_published);

-- Assessment and equipment indexes
CREATE INDEX idx_assessment_rubrics_level_id ON assessment_rubrics(level_id);
CREATE INDEX idx_assessment_criteria_rubric_id ON assessment_criteria(rubric_id);
CREATE INDEX idx_equipment_requirements_level_id ON equipment_requirements(level_id);

-- Media library indexes
CREATE INDEX idx_media_library_lesson_id ON media_library(lesson_id);
CREATE INDEX idx_media_library_type ON media_library(file_type);
CREATE INDEX idx_media_library_tags ON media_library USING gin(tags);

-- Content versioning indexes
CREATE INDEX idx_content_versions_content ON content_versions(content_type, content_id);
CREATE INDEX idx_content_versions_current ON content_versions(is_current, is_published);
```

### Full-Text Search Indexes
```sql
-- Comprehensive search across curriculum content
CREATE INDEX idx_programs_search ON programs USING gin(to_tsvector('english', 
    name || ' ' || COALESCE(description, '')
));

CREATE INDEX idx_courses_search ON courses USING gin(to_tsvector('english', 
    name || ' ' || COALESCE(description, '')
));

CREATE INDEX idx_lessons_search ON lessons USING gin(to_tsvector('english', 
    title || ' ' || COALESCE(description, '') || ' ' || COALESCE(lesson_content, '')
));

CREATE INDEX idx_media_search ON media_library USING gin(to_tsvector('english', 
    title || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' ')
));
```

## Data Integrity Constraints

### Hierarchy Validation
```sql
-- Ensure proper sequence ordering
ALTER TABLE levels ADD CONSTRAINT chk_levels_sequence_positive 
    CHECK (sequence_order > 0);

ALTER TABLE modules ADD CONSTRAINT chk_modules_sequence_positive 
    CHECK (sequence_order > 0);

ALTER TABLE sections ADD CONSTRAINT chk_sections_sequence_positive 
    CHECK (sequence_order > 0);

ALTER TABLE lessons ADD CONSTRAINT chk_lessons_sequence_positive 
    CHECK (sequence_order > 0);

-- Ensure logical duration estimates
ALTER TABLE levels ADD CONSTRAINT chk_levels_duration_logical 
    CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours > 0);

ALTER TABLE modules ADD CONSTRAINT chk_modules_duration_logical 
    CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours > 0);

ALTER TABLE lessons ADD CONSTRAINT chk_lessons_duration_logical 
    CHECK (duration_minutes IS NULL OR duration_minutes > 0);
```

### Assessment Validation
```sql
-- Ensure rubric scoring is valid
ALTER TABLE assessment_rubrics ADD CONSTRAINT chk_rubric_stars_valid 
    CHECK (total_possible_stars >= 1 AND total_possible_stars <= 5);

ALTER TABLE assessment_criteria ADD CONSTRAINT chk_criteria_weight_valid 
    CHECK (weight_percentage >= 0 AND weight_percentage <= 100);

-- Ensure equipment quantities are logical
ALTER TABLE equipment_requirements ADD CONSTRAINT chk_equipment_quantities 
    CHECK (quantity_needed > 0 AND quantity_per_student > 0);
```

## Sample Data Examples

### Sample Program
```sql
INSERT INTO programs (name, description, code, category, is_active) VALUES
('Swimming', 'Comprehensive swimming instruction for all ages and skill levels', 'SWIM', 'Aquatics', true);
```

### Sample Course
```sql
INSERT INTO courses (program_id, name, description, code, target_demographic, duration_weeks, max_participants) VALUES
((SELECT id FROM programs WHERE code = 'SWIM'), 'Swimming Club', 'Ongoing swimming program for children and teens', 'SWIM-CLUB', 'Children 6-18', 52, 5);
```

### Sample Curriculum
```sql
INSERT INTO curricula (course_id, name, description, code, min_age, max_age, total_levels) VALUES
((SELECT id FROM courses WHERE code = 'SWIM-CLUB'), 'Swimming Club: 6-18', 'Age-appropriate swimming curriculum for children and teens', 'SWIM-CLUB-6-18', 6, 18, 10);
```

### Sample Level with Assessment
```sql
INSERT INTO levels (curriculum_id, name, description, code, sequence_order, estimated_duration_hours, estimated_sessions) VALUES
((SELECT id FROM curricula WHERE code = 'SWIM-CLUB-6-18'), 'Level 1: Water Safety and Basic Skills', 'Introduction to water safety and fundamental swimming skills', 'LEVEL-1', 1, 24, 24);

INSERT INTO assessment_rubrics (level_id, name, description, code, rubric_type) VALUES
((SELECT id FROM levels WHERE code = 'LEVEL-1'), 'Level 1 Assessment Rubric', 'Comprehensive assessment for Level 1 skills', 'LEVEL-1-RUBRIC', 'summative');
```

## Migration Considerations

### Schema Evolution
```sql
-- Add new optional fields to existing tables
ALTER TABLE programs ADD COLUMN certification_body VARCHAR(100);
ALTER TABLE levels ADD COLUMN prerequisite_skills TEXT[];
ALTER TABLE lessons ADD COLUMN video_url VARCHAR(500);

-- Create indexes for new fields
CREATE INDEX idx_programs_certification ON programs(certification_body);
CREATE INDEX idx_lessons_video ON lessons(video_url);
```

### Data Migration Scripts
```sql
-- Migrate legacy curriculum data
WITH legacy_programs AS (
    SELECT * FROM legacy_curriculum_table
)
INSERT INTO programs (name, description, code, category, is_active)
SELECT 
    program_name, 
    program_description, 
    UPPER(LEFT(program_name, 4)),
    'Legacy Import',
    true
FROM legacy_programs;
```

## Performance Optimization

### Efficient Hierarchy Queries
```sql
-- Get complete curriculum tree
WITH RECURSIVE curriculum_tree AS (
    -- Base case: Programs
    SELECT id, name, 'program' as type, 1 as level, id as program_id, 
           NULL::UUID as parent_id, sequence_order
    FROM programs 
    WHERE id = $1
    
    UNION ALL
    
    -- Recursive case: All child levels
    SELECT c.id, c.name, 'course' as type, 2 as level, ct.program_id, 
           ct.id as parent_id, c.sequence_order
    FROM courses c
    JOIN curriculum_tree ct ON c.program_id = ct.id
    WHERE ct.type = 'program'
    
    -- Continue for all levels...
)
SELECT * FROM curriculum_tree ORDER BY level, sequence_order;

-- Efficient lesson search with hierarchy context
SELECT l.*, s.name as section_name, m.name as module_name, 
       lv.name as level_name, c.name as curriculum_name
FROM lessons l
JOIN sections s ON l.section_id = s.id
JOIN modules m ON s.module_id = m.id
JOIN levels lv ON m.level_id = lv.id
JOIN curricula c ON lv.curriculum_id = c.id
WHERE l.is_active = true
  AND l.is_published = true
  AND to_tsvector('english', l.title || ' ' || l.description) @@ plainto_tsquery('english', $1)
ORDER BY l.sequence_order;
```

This comprehensive curriculum database schema provides a robust foundation for managing complex educational content with proper hierarchy, assessment integration, and performance optimization.