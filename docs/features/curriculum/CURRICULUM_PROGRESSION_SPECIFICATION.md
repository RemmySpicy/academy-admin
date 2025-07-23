# Academy Management System - Curriculum Progression & Assessment Specification

## Overview
This document captures the detailed specification for the star-based progression and assessment system across the Academy Management System, including requirements for the Admin Dashboard, Instructor Mobile App, and Student/Parent Mobile Apps.

## Core Progression System

### Star-Based Grading Framework
- **Lesson Grading**: 0-3 stars per lesson (instructor assessment)
- **Module Unlock Criteria**: Configurable percentage of total stars + minimum 1 star per lesson
- **Level Assessment**: End-of-level proficiency assessment on 5-10 key criteria (0-3 stars each)
- **Cross-Level Progression**: Students can continue to next level while previous level assessment is pending

### Module Unlock Logic
```
Module Unlock Requirements:
1. Achieve configured percentage of total available stars in current module (default: 70%)
2. Minimum 1 star in every lesson within the module
3. No instructor override capability (strict enforcement)
4. Immediate unlock when criteria met
```

### Level Assessment System
```
Level Assessment Structure:
- 5-10 predefined proficiency criteria per level
- Instructor observation-based ratings (0-3 stars per criteria)
- Equal weighting by default, with option to adjust weights dynamically
- Modifiable criteria (can be edited after creation)
- Assessment can be completed anytime after level completion
- Instructor can suspend student progression based on assessment results
```

## Configuration System

### Per-Curriculum Settings
- **Unlock Thresholds**: Configurable percentage per curriculum (not system-wide)
- **Assessment Criteria**: Predefined per level, modifiable
- **Progression Rules**: Default rules with customization options
- **Standards**: Preconfigured standards based on curriculum type/age group

### Default Thresholds by Age/Difficulty
```
Suggested Defaults (Configurable):
- Beginner/Young (5-8 years): 60% threshold
- Intermediate (9-12 years): 70% threshold  
- Advanced (13+ years): 80% threshold
```

## Data Tracking & Analytics

### Student Progress Tracking
- Time spent per lesson
- Number of attempts per lesson
- Completion patterns and behaviors
- Star progression over time
- Module unlock timeline
- Level assessment scores

### Instructor Analytics
- Grading patterns and consistency
- Student progress identification
- Struggling student alerts
- Instructor efficiency metrics
- Class performance analytics

## Application-Specific Features

### 🖥️ Admin Dashboard (Current Focus)
**Curriculum Builder Requirements:**
- Configure unlock thresholds per curriculum
- Define level assessment criteria (5-10 per level)
- Set up progression rules and standards
- Monitor system-wide progression analytics
- Manage curriculum templates and duplication

**Components to Implement:**
1. `CurriculumProgressionSettings` - Configure unlock thresholds and rules
2. `LevelAssessmentCriteriaManager` - Define and edit assessment criteria
3. `ProgressionAnalyticsDashboard` - System-wide analytics
4. `CurriculumBuilder` with progression configuration integration

### 📱 Instructor Mobile App (Future Implementation)
**Core Features Required:**
- **Lesson Grading Interface**: Quick 0-3 star rating per student per lesson
- **Classroom Management**: Add multiple students to classroom for bulk grading
- **Level Assessment Tool**: Rate students on predefined criteria (0-3 stars each)
- **Progress Monitoring**: View individual student progression
- **Suspension Controls**: Ability to suspend student progression based on assessments
- **Bulk Grading**: Grade multiple students on same lesson simultaneously
- **Analytics Dashboard**: Identify struggling students and track class performance

**Key UI Components Needed:**
- Quick star-rating interface
- Student roster with progress indicators
- Assessment criteria checklist
- Progress suspension toggle
- Bulk grading grid view

### 📱 Student/Parent Mobile App (Future Implementation)
**Student Features Required:**
- **Progress Visualization**: Star progress per module and overall
- **Unlock Requirements Display**: Show exactly what's needed to unlock next module
- **Available Content**: Access to unlocked lessons and modules
- **Pending Assessments**: View and status of level assessments
- **Retake Capability**: Ability to retake lessons to improve stars
- **Cross-Level Navigation**: Access to unlocked content across levels

**Parent Features Required:**
- **Child Progress Monitoring**: View star progression and analytics
- **Assessment Status**: Track pending and completed level assessments
- **Performance Insights**: Identify areas where child is struggling
- **Communication**: Receive updates on significant milestones

## Technical Implementation Requirements

### Database Schema Extensions
```sql
-- Curriculum progression settings
curriculum_progression_settings:
- curriculum_id (FK)
- unlock_threshold_percentage (default: 70)
- min_stars_per_lesson (default: 1)
- level_assessment_required (boolean)
- created_at, updated_at

-- Level assessment criteria
level_assessment_criteria:
- id, level_id (FK)
- criteria_name, description
- weight (default: 1.0)
- sequence_order
- created_at, updated_at

-- Student progress tracking
student_lesson_progress:
- student_id (FK), lesson_id (FK)
- stars_earned (0-3)
- time_spent_minutes
- attempts_count
- last_attempt_at
- instructor_id (who graded)
- created_at, updated_at

-- Module unlock status
student_module_unlocks:
- student_id (FK), module_id (FK)
- unlocked_at, criteria_met_at
- stars_earned, stars_required
- percentage_achieved
- created_at

-- Level assessments
student_level_assessments:
- student_id (FK), level_id (FK)
- instructor_id (FK), assessed_at
- overall_score, max_score
- suspension_status
- notes, created_at, updated_at

-- Level assessment scores (individual criteria)
student_level_assessment_scores:
- assessment_id (FK), criteria_id (FK)
- stars_earned (0-3)
- notes, created_at
```

### API Endpoints Required
```
Progression Management:
POST /api/v1/curricula/{id}/progression-settings
GET /api/v1/curricula/{id}/progression-settings
PUT /api/v1/curricula/{id}/progression-settings

Level Assessment:
POST /api/v1/levels/{id}/assessment-criteria
GET /api/v1/levels/{id}/assessment-criteria
PUT /api/v1/levels/{id}/assessment-criteria/{criteria_id}

Student Progress:
GET /api/v1/students/{id}/progress
POST /api/v1/students/{id}/lessons/{lesson_id}/grade
GET /api/v1/students/{id}/modules/{module_id}/unlock-status
POST /api/v1/students/{id}/levels/{level_id}/assess

Analytics:
GET /api/v1/analytics/student-progress
GET /api/v1/analytics/instructor-efficiency
GET /api/v1/analytics/struggling-students
```

## Implementation Priority

### Phase 1 (Admin Dashboard - Current)
1. Curriculum progression settings configuration
2. Level assessment criteria management
3. Basic progress tracking setup
4. Curriculum builder integration

### Phase 2 (Instructor Mobile App)
1. Lesson grading interface
2. Classroom management
3. Level assessment tools
4. Progress monitoring

### Phase 3 (Student/Parent Mobile App)
1. Progress visualization
2. Content access control
3. Assessment status display
4. Parent monitoring dashboard

### Phase 4 (Advanced Analytics)
1. Comprehensive analytics dashboards
2. AI-powered struggling student identification
3. Instructor performance analytics
4. Predictive progression modeling

## Notes for Future Development
- All star-based progression logic must be strictly enforced (no instructor overrides for unlocking)
- Retaking lessons should always be possible for improvement
- Cross-level progression allows continuous learning flow
- Assessment timing is flexible - instructors grade when convenient
- Mobile apps require offline capability for lesson grading
- Parent app needs real-time progress sync
- Consider gamification elements for student motivation

## Success Metrics
- Student engagement and completion rates
- Instructor grading consistency
- Time-to-module-unlock averages
- Level assessment pass rates
- Parent engagement with progress monitoring
- Overall learning outcome improvements

---
*This specification will evolve as the system is implemented and tested with real users.*