/**
 * ContentCreateDialog component for creating new lessons and assessments
 * Now uses separate forms for lessons and assessments
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { LessonCreateDialog } from './LessonCreateDialog';
import { AssessmentCreateDialog } from './AssessmentCreateDialog';
import { useCourses } from '@/features/courses';

// Legacy data structures for backward compatibility
export interface ContentCreateData {
  name: string;
  code: string;
  description?: string;
  objectives?: string;
  content_type?: 'video' | 'text' | 'interactive' | 'practical';
  assessment_type?: 'quiz' | 'assignment' | 'practical' | 'project';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_minutes?: number;
  is_required?: boolean;
  status?: 'draft' | 'published' | 'under_review';
  max_score?: number;
  passing_score?: number;
  course_id?: string;
  assign_to_curriculum?: string;
}

interface ContentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType?: 'lesson' | 'assessment';
  onSubmit: (data: ContentCreateData) => Promise<void>;
  loading?: boolean;
  availableCourses?: Array<{ id: string; name: string; code: string; }>;
  availableCurricula?: Array<{ id: string; name: string; course_name: string; }>;
  availableLevels?: Array<{ id: string; name: string; curriculum_name: string; }>;
  // Pre-selected assignment targets
  preSelectedCurriculum?: string;
  preSelectedModule?: string;
  preSelectedSection?: string;
  preSelectedLevel?: string;
}

export function ContentCreateDialog({
  open,
  onOpenChange,
  contentType: initialContentType = 'lesson',
  onSubmit,
  loading = false,
  availableCourses = [],
  availableCurricula = [],
  availableLevels = [],
  preSelectedCurriculum,
  preSelectedModule,
  preSelectedSection,
  preSelectedLevel,
}: ContentCreateDialogProps) {
  const [activeTab, setActiveTab] = useState<'lesson' | 'assessment'>(initialContentType);
  
  // Fetch course data for hierarchical assignment
  const { data: coursesData } = useCourses({ 
    page: 1, 
    per_page: 100 // Get all courses
  });
  
  // Create sample course hierarchy for testing (until we implement full data fetching)
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
                },
                {
                  id: 'module-2',
                  name: 'Basic Floating',
                  sections: [
                    { id: 'section-3', name: 'Back Float' },
                    { id: 'section-4', name: 'Front Float' }
                  ]
                }
              ]
            },
            {
              id: 'level-2',
              name: 'Level 2 - Basic Swimming',
              modules: [
                {
                  id: 'module-3',
                  name: 'Stroke Fundamentals',
                  sections: [
                    { id: 'section-5', name: 'Freestyle Basics' },
                    { id: 'section-6', name: 'Breathing Techniques' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'course-2',
      name: 'Robotics Engineering',
      code: 'ROBOT-101',
      curricula: [
        {
          id: 'curriculum-2',
          name: 'Introduction to Robotics',
          levels: [
            {
              id: 'level-3',
              name: 'Getting Started',
              modules: [
                {
                  id: 'module-4',
                  name: 'Robot Components',
                  sections: [
                    { id: 'section-7', name: 'Sensors' },
                    { id: 'section-8', name: 'Motors' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // Handlers for the separate forms
  const handleLessonSubmit = async (lessonData: any) => {
    // Transform lesson data to legacy format for compatibility
    const legacyData: ContentCreateData = {
      name: lessonData.title,
      code: lessonData.code,
      description: lessonData.description,
      content_type: lessonData.lesson_types?.[0] || 'text', // Use first selected type for legacy compatibility
      difficulty_level: lessonData.difficulty_level,
      duration_minutes: lessonData.duration_minutes,
      is_required: lessonData.is_required,
      status: lessonData.status,
      course_id: lessonData.course_id,
      assign_to_curriculum: lessonData.curriculum_id,
    };
    
    await onSubmit(legacyData);
  };

  const handleAssessmentSubmit = async (assessmentData: any) => {
    // Transform assessment data to legacy format for compatibility
    const legacyData: ContentCreateData = {
      name: assessmentData.title,
      code: assessmentData.code,
      description: assessmentData.description,
      assessment_type: assessmentData.assessment_type,
      difficulty_level: assessmentData.difficulty_level,
      is_required: assessmentData.is_required,
      status: assessmentData.status,
      course_id: assessmentData.course_id,
      assign_to_curriculum: assessmentData.curriculum_id,
    };
    
    await onSubmit(legacyData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {activeTab === 'lesson' ? (
              <BookOpen className="h-6 w-6 text-blue-600" />
            ) : (
              <GraduationCap className="h-6 w-6 text-purple-600" />
            )}
            <div>
              <div>Create New {activeTab === 'lesson' ? 'Lesson' : 'Assessment'}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Add reusable content to your library
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Create {activeTab === 'lesson' ? 'a lesson' : 'an assessment'} that can be used across multiple curricula in your program.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'lesson' | 'assessment')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lesson" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Create Lesson
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Create Assessment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lesson" className="mt-0">
            <LessonCreateDialog
              open={activeTab === 'lesson'}
              onOpenChange={onOpenChange}
              onSubmit={handleLessonSubmit}
              loading={loading}
              availableCourses={availableCourses}
              availableCurricula={availableCurricula}
              courseHierarchy={sampleCourseHierarchy}
              preSelectedCurriculum={preSelectedCurriculum}
              preSelectedModule={preSelectedModule}
              preSelectedSection={preSelectedSection}
              embedded={true}
            />
          </TabsContent>
          
          <TabsContent value="assessment" className="mt-0">
            <AssessmentCreateDialog
              open={activeTab === 'assessment'}
              onOpenChange={onOpenChange}
              onSubmit={handleAssessmentSubmit}
              loading={loading}
              availableCourses={availableCourses}
              availableCurricula={availableCurricula}
              availableLevels={availableLevels}
              courseHierarchy={sampleCourseHierarchy}
              preSelectedCurriculum={preSelectedCurriculum}
              preSelectedLevel={preSelectedLevel}
              embedded={true}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}