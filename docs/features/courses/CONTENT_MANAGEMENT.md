# Content Management System

## Overview
The Content Management System provides specialized forms for creating and managing lessons and assessments with hierarchical assignment capabilities and enhanced UI components.

## Enhanced Assignment System (2025-01-25)

### Lesson Creation
- **Title-based naming**: Lessons are identified by title instead of generic names
- **Instructor Guide**: Dedicated field for instructor-specific guidance and notes
- **Multiple Lesson Types**: Support for video, text, interactive, and practical lesson types
- **Resource Links**: Multiple resource links with type categorization (video, document, link, other)
- **Optional Duration**: Flexible duration setting in minutes
- **Hierarchical Assignment**: Course → Curriculum → Level → Module → Section

### Assessment Creation
- **Title-based naming**: Assessments are identified by title instead of generic names
- **Assessment Guide**: Dedicated field for assessment-specific instructions
- **Assessment Items**: Collapsible, expandable, and reorderable assessment questions/tasks
- **3-Star Grading System**: Built-in support for mobile app star-based grading
- **Hierarchical Assignment**: Course → Curriculum → Level (assessments assigned to curriculum levels)

### Assignment System Features
- **Multi-Assignment Capability**: Assign content to multiple locations simultaneously
- **Visual Assignment Management**: Breadcrumb navigation showing assignment hierarchy
- **Real-time Validation**: Prevents duplicate assignments
- **Sample Data Integration**: Includes sample course hierarchy for testing

### Database Schema Updates
- **Lesson Model**: Added `instructor_guide`, `resource_links` (JSON), `lesson_types` (array)
- **Assessment Model**: Added `assessment_guide`, `assessment_items` (JSON), improved difficulty tracking
- **New Enums**: `LessonType` and `AssessmentType` for better type safety

### UI Components
- **LessonCreateDialog**: Specialized form for lesson creation with embedded/standalone modes
- **AssessmentCreateDialog**: Specialized form for assessment creation with collapsible items
- **ContentCreateDialog**: Tabbed interface switching between lesson and assessment forms
- **Accessibility Compliance**: Proper DialogTitle and DialogDescription implementation

## Content Management Components

### ContentTable
- **Sortable Columns**: Sort by title, type, difficulty, status, created date
- **Advanced Filtering**: Filter by content type, difficulty level, status
- **Bulk Actions**: Select multiple items for bulk operations
- **Responsive Design**: Mobile-friendly table layout

### ContentUsageDialog
- **Assignment Tracking**: View where content is used across curricula
- **Usage Statistics**: Track assignment frequency and distribution
- **Quick Navigation**: Links to curriculum locations

### ContentViewControls
- **Search Functionality**: Real-time search across content titles and descriptions
- **Filter Controls**: Dropdown filters for type, difficulty, and status
- **View Options**: Toggle between grid and table views
- **Action Buttons**: Quick access to create, import, and export actions

### GlobalContentEditModal
- **Unified Editing**: Single interface for editing all content types
- **Form Validation**: Comprehensive validation with error handling
- **Auto-save**: Automatic saving of changes
- **Version History**: Track content modifications

## API Integration

### Content API Service
- **CRUD Operations**: Complete create, read, update, delete functionality
- **Search and Filtering**: Advanced search with multiple filter options
- **Bulk Operations**: Support for bulk updates and deletions
- **Error Handling**: Comprehensive error handling with user feedback

### TanStack Query Integration
- **Real-time Updates**: Automatic cache invalidation and refresh
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Background Sync**: Keep data fresh with background synchronization
- **Loading States**: Proper loading and error state management

## Testing Data

### Sample Course Hierarchy
```javascript
const sampleCourseHierarchy = [
  {
    id: 'course-1',
    name: 'Swimming Course',
    code: 'SWIM-101',
    curricula: [
      {
        id: 'curriculum-1',
        name: 'Beginner Swimming',
        levels: [
          {
            id: 'level-1',
            name: 'Level 1 - Water Introduction',
            modules: [
              {
                id: 'module-1',
                name: 'Water Safety',
                sections: [
                  { id: 'section-1', name: 'Pool Rules' },
                  { id: 'section-2', name: 'Safety Equipment' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
```

## Implementation Status

### ✅ Completed Features
- [x] Separate lesson and assessment creation forms
- [x] Hierarchical assignment system with visual feedback
- [x] Multi-assignment capability with duplicate prevention
- [x] Database schema updates and migrations
- [x] Accessibility compliance fixes
- [x] Content management UI components
- [x] API service integration
- [x] Sample data for testing

### 🔄 In Progress
- [ ] Content versioning system
- [ ] Advanced search functionality
- [ ] Content templates
- [ ] Import/export capabilities

### 📋 Planned Features
- [ ] Content analytics and usage reporting
- [ ] Collaborative editing
- [ ] Content approval workflow
- [ ] Integration with mobile apps for content delivery

## Usage Examples

### Creating a Lesson
```typescript
const lessonData = {
  title: 'Water Safety Basics',
  code: 'SWIM-SAFETY-001',
  description: 'Introduction to basic water safety principles',
  instructor_guide: 'Focus on demonstration and hands-on practice',
  lesson_types: ['practical', 'interactive'],
  resource_links: [
    {
      title: 'Safety Video',
      url: 'https://example.com/safety-video',
      type: 'video'
    }
  ],
  duration_minutes: 45,
  difficulty_level: 'beginner',
  is_required: true
};
```

### Creating an Assessment
```typescript
const assessmentData = {
  title: 'Water Safety Knowledge Check',
  code: 'SWIM-ASSESS-001',
  description: 'Assessment of water safety knowledge',
  assessment_guide: 'Use 3-star system: 1=needs improvement, 2=satisfactory, 3=excellent',
  assessment_type: 'practical',
  assessment_items: [
    {
      title: 'Pool Entry Safety',
      description: 'Demonstrate safe pool entry techniques',
      sequence: 1
    }
  ],
  difficulty_level: 'beginner',
  is_required: true
};
```

## Best Practices

### Content Creation
1. **Use Descriptive Titles**: Make titles clear and searchable
2. **Include Instructor Guides**: Provide detailed guidance for instructors
3. **Organize Resource Links**: Categorize resources by type for easy access
4. **Set Appropriate Difficulty**: Match difficulty to target audience
5. **Use Hierarchical Assignments**: Assign content to appropriate curriculum levels

### Assignment Management
1. **Review Existing Assignments**: Check for duplicates before adding new assignments
2. **Use Visual Feedback**: Leverage breadcrumb navigation for clarity
3. **Test Assignment Paths**: Verify assignment hierarchy makes logical sense
4. **Document Assignment Rationale**: Include notes on why content is assigned to specific locations

### Database Considerations
1. **Use JSON Fields**: Store structured data like resource links and assessment items in JSON
2. **Maintain Referential Integrity**: Ensure all assignments reference valid curriculum components
3. **Index Search Fields**: Optimize database queries for search functionality
4. **Regular Cleanup**: Remove orphaned assignments and unused content

## Troubleshooting

### Common Issues
1. **Assignment Section Not Showing**: Ensure `courseHierarchy` prop is not empty
2. **TypeScript Errors**: Check for HTML entities in JSX (use `→` instead of `&gt;`)
3. **Form Validation Errors**: Verify required fields are properly marked
4. **Database Migration Issues**: Check enum type consistency between models

### Performance Optimization
1. **Use React.memo**: Optimize component re-renders
2. **Implement Virtual Scrolling**: For large content lists
3. **Cache API Responses**: Use TanStack Query caching effectively
4. **Lazy Load Components**: Load heavy components on demand