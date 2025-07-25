/**
 * LessonCreateDialog component for creating new lessons
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen,
  Clock,
  FileText,
  Users,
  Target,
  Plus,
  X,
  Link,
  Video,
  FileIcon,
  ChevronDown,
  ChevronRight,
  MapPin,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContentType,
  DifficultyLevel,
  CurriculumStatus
} from '../api/contentApiService';

interface LessonCreateData {
  title: string;
  code: string;
  description?: string;
  instructor_guide?: string;
  lesson_types: ContentType[];
  resource_links?: ResourceLink[];
  duration_minutes?: number;
  difficulty_level?: DifficultyLevel;
  is_required?: boolean;
  status?: CurriculumStatus;
  // Assignment data
  course_id?: string;
  curriculum_id?: string;
  module_id?: string;
  section_id?: string;
}

interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'document' | 'link' | 'other';
}

interface CourseHierarchy {
  id: string;
  name: string;
  code: string;
  curricula: Array<{
    id: string;
    name: string;
    levels: Array<{
      id: string;
      name: string;
      modules: Array<{
        id: string;
        name: string;
        sections: Array<{
          id: string;
          name: string;
        }>;
      }>;
    }>;
  }>;
}

interface LessonAssignment {
  id: string;
  course_id: string;
  course_name: string;
  curriculum_id: string;
  curriculum_name: string;
  level_id: string;
  level_name: string;
  module_id: string;
  module_name: string;
  section_id: string;
  section_name: string;
}

interface LessonCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LessonCreateData) => Promise<void>;
  loading?: boolean;
  availableCourses?: Array<{ id: string; name: string; code: string; }>;
  availableCurricula?: Array<{ id: string; name: string; course_name: string; }>;
  courseHierarchy?: Array<CourseHierarchy>;
  preSelectedCurriculum?: string;
  preSelectedModule?: string;
  preSelectedSection?: string;
  // If true, renders as embedded form (no dialog wrapper)
  embedded?: boolean;
}

const lessonTypeOptions: Array<{ value: ContentType; label: string; description: string; icon: React.ReactNode }> = [
  { 
    value: 'video', 
    label: 'Video Lesson', 
    description: 'Video-based learning content',
    icon: <Video className="h-4 w-4" />
  },
  { 
    value: 'text', 
    label: 'Text/Reading', 
    description: 'Written instructional content',
    icon: <BookOpen className="h-4 w-4" />
  },
  { 
    value: 'interactive', 
    label: 'Interactive', 
    description: 'Hands-on learning activities',
    icon: <Users className="h-4 w-4" />
  },
  { 
    value: 'practical', 
    label: 'Practical Exercise', 
    description: 'Real-world application tasks',
    icon: <Target className="h-4 w-4" />
  },
];

const difficultyOptions: Array<{ value: DifficultyLevel; label: string; color: string }> = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-600' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-600' },
  { value: 'advanced', label: 'Advanced', color: 'text-orange-600' },
  { value: 'expert', label: 'Expert', color: 'text-red-600' },
];

const statusOptions: Array<{ value: CurriculumStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'under_review', label: 'Under Review' },
];

const resourceTypeOptions = [
  { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { value: 'document', label: 'Document', icon: <FileIcon className="h-4 w-4" /> },
  { value: 'link', label: 'Link', icon: <Link className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <FileText className="h-4 w-4" /> },
];

export function LessonCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  availableCourses = [],
  availableCurricula = [],
  courseHierarchy = [],
  preSelectedCurriculum,
  preSelectedModule,
  preSelectedSection,
  embedded = false,
}: LessonCreateDialogProps) {
  const [formData, setFormData] = useState<Partial<LessonCreateData>>({
    status: 'draft',
    difficulty_level: 'beginner',
    is_required: true,
    lesson_types: [],
    resource_links: [],
    curriculum_id: preSelectedCurriculum,
    module_id: preSelectedModule,
    section_id: preSelectedSection,
  });
  
  // Assignment state
  const [assignments, setAssignments] = useState<LessonAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState({
    course_id: '',
    curriculum_id: '',
    level_id: '',
    module_id: '',
    section_id: ''
  });
  
  // Available options for current assignment
  const [availableCurriculaForAssignment, setAvailableCurriculaForAssignment] = useState<any[]>([]);
  const [availableLevels, setAvailableLevels] = useState<any[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [availableSections, setAvailableSections] = useState<any[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        status: 'draft',
        difficulty_level: 'beginner',
        is_required: true,
        lesson_types: [],
        resource_links: [],
        curriculum_id: preSelectedCurriculum,
        module_id: preSelectedModule,
        section_id: preSelectedSection,
      });
    }
  }, [open, preSelectedCurriculum, preSelectedModule, preSelectedSection]);

  const handleInputChange = (field: keyof LessonCreateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLessonTypeToggle = (type: ContentType) => {
    const currentTypes = formData.lesson_types || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    handleInputChange('lesson_types', updatedTypes);
  };

  const addResourceLink = () => {
    const newResource: ResourceLink = {
      id: `resource-${Date.now()}`,
      title: '',
      url: '',
      type: 'link'
    };
    const currentResources = formData.resource_links || [];
    handleInputChange('resource_links', [...currentResources, newResource]);
  };

  const updateResourceLink = (id: string, field: keyof ResourceLink, value: string) => {
    const currentResources = formData.resource_links || [];
    const updatedResources = currentResources.map(resource =>
      resource.id === id ? { ...resource, [field]: value } : resource
    );
    handleInputChange('resource_links', updatedResources);
  };

  const removeResourceLink = (id: string) => {
    const currentResources = formData.resource_links || [];
    const updatedResources = currentResources.filter(resource => resource.id !== id);
    handleInputChange('resource_links', updatedResources);
  };

  // Assignment handlers
  const handleCourseSelection = (courseId: string) => {
    setCurrentAssignment(prev => ({ ...prev, course_id: courseId, curriculum_id: '', level_id: '', module_id: '', section_id: '' }));
    
    const selectedCourse = courseHierarchy.find(course => course.id === courseId);
    if (selectedCourse) {
      setAvailableCurriculaForAssignment(selectedCourse.curricula);
      setAvailableLevels([]);
      setAvailableModules([]);
      setAvailableSections([]);
    }
  };

  const handleCurriculumSelection = (curriculumId: string) => {
    setCurrentAssignment(prev => ({ ...prev, curriculum_id: curriculumId, level_id: '', module_id: '', section_id: '' }));
    
    const selectedCourse = courseHierarchy.find(course => course.id === currentAssignment.course_id);
    const selectedCurriculum = selectedCourse?.curricula.find(curriculum => curriculum.id === curriculumId);
    if (selectedCurriculum) {
      setAvailableLevels(selectedCurriculum.levels);
      setAvailableModules([]);
      setAvailableSections([]);
    }
  };

  const handleLevelSelection = (levelId: string) => {
    setCurrentAssignment(prev => ({ ...prev, level_id: levelId, module_id: '', section_id: '' }));
    
    const selectedCourse = courseHierarchy.find(course => course.id === currentAssignment.course_id);
    const selectedCurriculum = selectedCourse?.curricula.find(curriculum => curriculum.id === currentAssignment.curriculum_id);
    const selectedLevel = selectedCurriculum?.levels.find(level => level.id === levelId);
    if (selectedLevel) {
      setAvailableModules(selectedLevel.modules);
      setAvailableSections([]);
    }
  };

  const handleModuleSelection = (moduleId: string) => {
    setCurrentAssignment(prev => ({ ...prev, module_id: moduleId, section_id: '' }));
    
    const selectedCourse = courseHierarchy.find(course => course.id === currentAssignment.course_id);
    const selectedCurriculum = selectedCourse?.curricula.find(curriculum => curriculum.id === currentAssignment.curriculum_id);
    const selectedLevel = selectedCurriculum?.levels.find(level => level.id === currentAssignment.level_id);
    const selectedModule = selectedLevel?.modules.find(module => module.id === moduleId);
    if (selectedModule) {
      setAvailableSections(selectedModule.sections);
    }
  };

  const handleSectionSelection = (sectionId: string) => {
    setCurrentAssignment(prev => ({ ...prev, section_id: sectionId }));
  };

  const addAssignment = () => {
    if (!currentAssignment.course_id || !currentAssignment.curriculum_id || !currentAssignment.level_id || 
        !currentAssignment.module_id || !currentAssignment.section_id) {
      return;
    }

    // Get names for display
    const course = courseHierarchy.find(c => c.id === currentAssignment.course_id);
    const curriculum = course?.curricula.find(c => c.id === currentAssignment.curriculum_id);
    const level = curriculum?.levels.find(l => l.id === currentAssignment.level_id);
    const module = level?.modules.find(m => m.id === currentAssignment.module_id);
    const section = module?.sections.find(s => s.id === currentAssignment.section_id);

    if (!course || !curriculum || !level || !module || !section) return;

    const newAssignment: LessonAssignment = {
      id: `${currentAssignment.course_id}-${currentAssignment.curriculum_id}-${currentAssignment.level_id}-${currentAssignment.module_id}-${currentAssignment.section_id}`,
      course_id: currentAssignment.course_id,
      course_name: course.name,
      curriculum_id: currentAssignment.curriculum_id,
      curriculum_name: curriculum.name,
      level_id: currentAssignment.level_id,
      level_name: level.name,
      module_id: currentAssignment.module_id,
      module_name: module.name,
      section_id: currentAssignment.section_id,
      section_name: section.name,
    };

    // Check if assignment already exists
    const exists = assignments.some(a => a.id === newAssignment.id);
    if (!exists) {
      setAssignments(prev => [...prev, newAssignment]);
    }

    // Reset current assignment
    setCurrentAssignment({
      course_id: '',
      curriculum_id: '',
      level_id: '',
      module_id: '',
      section_id: ''
    });
    setAvailableCurriculaForAssignment([]);
    setAvailableLevels([]);
    setAvailableModules([]);
    setAvailableSections([]);
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: LessonCreateData = {
      title: formData.title || '',
      code: formData.code || '',
      description: formData.description || '',
      instructor_guide: formData.instructor_guide || '',
      lesson_types: formData.lesson_types || [],
      resource_links: formData.resource_links || [],
      duration_minutes: formData.duration_minutes,
      difficulty_level: formData.difficulty_level || 'beginner',
      is_required: formData.is_required !== false,
      status: formData.status || 'draft',
      course_id: formData.course_id === 'none' ? undefined : formData.course_id,
      curriculum_id: formData.curriculum_id === 'none' ? undefined : formData.curriculum_id,
      module_id: formData.module_id,
      section_id: formData.section_id,
    };

    await onSubmit(submitData);
  };

  const isFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.code?.trim() &&
      formData.lesson_types && formData.lesson_types.length > 0
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter lesson title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="LESSON-001"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this lesson covers..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor_guide">Instructor Guide</Label>
              <Textarea
                id="instructor_guide"
                placeholder="Instructions and guidelines for instructors teaching this lesson..."
                value={formData.instructor_guide || ''}
                onChange={(e) => handleInputChange('instructor_guide', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <Separator />

          {/* Lesson Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Lesson Types <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Select one or more lesson types that apply to this lesson.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {lessonTypeOptions.map((option) => (
                <Card
                  key={option.value}
                  className={cn(
                    "cursor-pointer transition-colors border-2",
                    formData.lesson_types?.includes(option.value)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                  onClick={() => handleLessonTypeToggle(option.value)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {option.icon}
                      {option.label}
                      {formData.lesson_types?.includes(option.value) && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Resource Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Resource Links</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResourceLink}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add links to videos, documents, or other resources for this lesson.
            </p>

            {formData.resource_links && formData.resource_links.length > 0 && (
              <div className="space-y-3">
                {formData.resource_links.map((resource) => (
                  <Card key={resource.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Resource Type</Label>
                        <Select
                          value={resource.type}
                          onValueChange={(value) => updateResourceLink(resource.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {resourceTypeOptions.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  {type.icon}
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Resource title"
                          value={resource.title}
                          onChange={(e) => updateResourceLink(resource.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder="https://..."
                          value={resource.url}
                          onChange={(e) => updateResourceLink(resource.id, 'url', e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeResourceLink(resource.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* General Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) => handleInputChange('difficulty_level', value as DifficultyLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value as CurriculumStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="30 (optional)"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={formData.is_required !== false}
                onCheckedChange={(checked) => handleInputChange('is_required', checked)}
              />
              <Label htmlFor="required">Required lesson</Label>
            </div>
          </div>

          <Separator />

          {/* Hierarchical Assignment Options */}
          {true && ( // Always show assignment section
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Lesson Assignments</h3>
                <p className="text-sm text-muted-foreground">Assign this lesson to multiple curriculum sections</p>
              </div>
              
              {/* Current Assignments Display */}
              {assignments.length > 0 && (
                <div className="space-y-3">
                  <Label>Current Assignments</Label>
                  <div className="space-y-2">
                    {assignments.map((assignment) => (
                      <Card key={assignment.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <span className="font-medium">{assignment.course_name}</span>
                              <ChevronRight className="inline h-3 w-3 mx-1" />
                              <span>{assignment.curriculum_name}</span>
                              <ChevronRight className="inline h-3 w-3 mx-1" />
                              <span>{assignment.level_name}</span>
                              <ChevronRight className="inline h-3 w-3 mx-1" />
                              <span>{assignment.module_name}</span>
                              <ChevronRight className="inline h-3 w-3 mx-1" />
                              <span className="text-primary">{assignment.section_name}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssignment(assignment.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Assignment */}
              <Card className="p-4">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Add New Assignment</Label>
                  
                  {/* Course Selection */}
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={currentAssignment.course_id}
                      onValueChange={handleCourseSelection}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseHierarchy.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            <div className="flex flex-col items-start">
                              <span>{course.name}</span>
                              <span className="text-xs text-muted-foreground">{course.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Curriculum Selection */}
                  {availableCurriculaForAssignment.length > 0 && (
                    <div className="space-y-2">
                      <Label>Curriculum</Label>
                      <Select
                        value={currentAssignment.curriculum_id}
                        onValueChange={handleCurriculumSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a curriculum" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCurriculaForAssignment.map((curriculum) => (
                            <SelectItem key={curriculum.id} value={curriculum.id}>
                              {curriculum.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Level Selection */}
                  {availableLevels.length > 0 && (
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select
                        value={currentAssignment.level_id}
                        onValueChange={handleLevelSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Module Selection */}
                  {availableModules.length > 0 && (
                    <div className="space-y-2">
                      <Label>Module</Label>
                      <Select
                        value={currentAssignment.module_id}
                        onValueChange={handleModuleSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a module" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModules.map((module) => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Section Selection */}
                  {availableSections.length > 0 && (
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select
                        value={currentAssignment.section_id}
                        onValueChange={handleSectionSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Add Assignment Button */}
                  {currentAssignment.section_id && (
                    <Button
                      type="button"
                      onClick={addAssignment}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Assignment
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
          {/* Form Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Lesson
                </div>
              )}
            </Button>
          </div>
        </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <div>Create New Lesson</div>
              <div className="text-sm font-normal text-muted-foreground">
                Add a new lesson to your curriculum
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Create a lesson that will be assigned to Course → Curriculum → Module → Section.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}