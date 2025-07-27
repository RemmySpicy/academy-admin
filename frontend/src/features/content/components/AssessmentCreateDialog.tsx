/**
 * AssessmentCreateDialog component for creating new assessments
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  GraduationCap,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  GripVertical,
  CheckCircle,
  FileText,
  Target,
  AlertCircle,
  MapPin,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  AssessmentType,
  DifficultyLevel,
  CurriculumStatus
} from '../api/contentApiService';

interface AssessmentItem {
  id: string;
  title: string;
  description: string;
  sequence: number;
  isExpanded?: boolean;
}

interface AssessmentCreateData {
  title: string;
  code: string;
  description?: string;
  assessment_guide?: string;
  assessment_type: AssessmentType;
  assessment_items: AssessmentItem[];
  difficulty_level?: DifficultyLevel;
  is_required?: boolean;
  status?: CurriculumStatus;
  // Assignment data
  course_id?: string;
  curriculum_id?: string;
  level_id?: string; // Assessments are assigned to levels
}

interface AssessmentAssignment {
  id: string;
  course_id: string;
  course_name: string;
  curriculum_id: string;
  curriculum_name: string;
  level_id: string;
  level_name: string;
}

interface AssessmentCourseHierarchy {
  id: string;
  name: string;
  code: string;
  curricula: Array<{
    id: string;
    name: string;
    levels: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

interface AssessmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssessmentCreateData) => Promise<void>;
  loading?: boolean;
  availableCourses?: Array<{ id: string; name: string; code: string; }>;
  availableCurricula?: Array<{ id: string; name: string; course_name: string; }>;
  availableLevels?: Array<{ id: string; name: string; curriculum_name: string; }>;
  courseHierarchy?: Array<AssessmentCourseHierarchy>;
  preSelectedCurriculum?: string;
  preSelectedLevel?: string;
  // If true, renders as embedded form (no dialog wrapper)
  embedded?: boolean;
}

const assessmentTypeOptions: Array<{ value: AssessmentType; label: string; description: string; icon: React.ReactNode }> = [
  { 
    value: 'quiz', 
    label: 'Quiz', 
    description: 'Multiple choice questions',
    icon: <CheckCircle className="h-4 w-4" />
  },
  { 
    value: 'assignment', 
    label: 'Assignment', 
    description: 'Project-based evaluation',
    icon: <FileText className="h-4 w-4" />
  },
  { 
    value: 'practical', 
    label: 'Practical Test', 
    description: 'Hands-on skill assessment',
    icon: <Target className="h-4 w-4" />
  },
  { 
    value: 'project', 
    label: 'Project', 
    description: 'Comprehensive project work',
    icon: <GraduationCap className="h-4 w-4" />
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

export function AssessmentCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  availableCourses = [],
  availableCurricula = [],
  availableLevels = [],
  courseHierarchy = [],
  preSelectedCurriculum,
  preSelectedLevel,
  embedded = false,
}: AssessmentCreateDialogProps) {
  const [formData, setFormData] = useState<Partial<AssessmentCreateData>>({
    status: 'draft',
    difficulty_level: 'beginner',
    is_required: true,
    assessment_items: [],
    curriculum_id: preSelectedCurriculum,
    level_id: preSelectedLevel,
  });
  
  // Assignment state
  const [assignments, setAssignments] = useState<AssessmentAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState({
    course_id: '',
    curriculum_id: '',
    level_id: ''
  });
  
  // Available options for current assignment
  const [availableCurriculaForAssignment, setAvailableCurriculaForAssignment] = useState<any[]>([]);
  const [availableLevelsForAssignment, setAvailableLevelsForAssignment] = useState<any[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        status: 'draft',
        difficulty_level: 'beginner',
        is_required: true,
        assessment_items: [],
        curriculum_id: preSelectedCurriculum,
        level_id: preSelectedLevel,
      });
    }
  }, [open, preSelectedCurriculum, preSelectedLevel]);

  const handleInputChange = (field: keyof AssessmentCreateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAssessmentItem = () => {
    const newItem: AssessmentItem = {
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      sequence: (formData.assessment_items?.length || 0) + 1,
      isExpanded: true,
    };
    const currentItems = formData.assessment_items || [];
    handleInputChange('assessment_items', [...currentItems, newItem]);
  };

  const updateAssessmentItem = (id: string, field: keyof AssessmentItem, value: any) => {
    const currentItems = formData.assessment_items || [];
    const updatedItems = currentItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleInputChange('assessment_items', updatedItems);
  };

  const removeAssessmentItem = (id: string) => {
    const currentItems = formData.assessment_items || [];
    const updatedItems = currentItems
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, sequence: index + 1 }));
    handleInputChange('assessment_items', updatedItems);
  };

  const moveAssessmentItem = (id: string, direction: 'up' | 'down') => {
    const currentItems = formData.assessment_items || [];
    const itemIndex = currentItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return;
    
    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    
    if (newIndex < 0 || newIndex >= currentItems.length) return;
    
    const updatedItems = [...currentItems];
    [updatedItems[itemIndex], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[itemIndex]];
    
    // Update sequence numbers
    const resequencedItems = updatedItems.map((item, index) => ({
      ...item,
      sequence: index + 1
    }));
    
    handleInputChange('assessment_items', resequencedItems);
  };

  const toggleItemExpansion = (id: string) => {
    const currentItems = formData.assessment_items || [];
    const updatedItems = currentItems.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    );
    handleInputChange('assessment_items', updatedItems);
  };

  // Assignment handlers
  const handleAssessmentCourseSelection = (courseId: string) => {
    setCurrentAssignment(prev => ({ ...prev, course_id: courseId, curriculum_id: '', level_id: '' }));
    
    const selectedCourse = courseHierarchy.find(course => course.id === courseId);
    if (selectedCourse) {
      setAvailableCurriculaForAssignment(selectedCourse.curricula);
      setAvailableLevelsForAssignment([]);
    }
  };

  const handleAssessmentCurriculumSelection = (curriculumId: string) => {
    setCurrentAssignment(prev => ({ ...prev, curriculum_id: curriculumId, level_id: '' }));
    
    const selectedCourse = courseHierarchy.find(course => course.id === currentAssignment.course_id);
    const selectedCurriculum = selectedCourse?.curricula.find(curriculum => curriculum.id === curriculumId);
    if (selectedCurriculum) {
      setAvailableLevelsForAssignment(selectedCurriculum.levels);
    }
  };

  const handleAssessmentLevelSelection = (levelId: string) => {
    setCurrentAssignment(prev => ({ ...prev, level_id: levelId }));
  };

  const addAssessmentAssignment = () => {
    if (!currentAssignment.course_id || !currentAssignment.curriculum_id || !currentAssignment.level_id) {
      return;
    }

    // Get names for display
    const course = courseHierarchy.find(c => c.id === currentAssignment.course_id);
    const curriculum = course?.curricula.find(c => c.id === currentAssignment.curriculum_id);
    const level = curriculum?.levels.find(l => l.id === currentAssignment.level_id);

    if (!course || !curriculum || !level) return;

    const newAssignment: AssessmentAssignment = {
      id: `${currentAssignment.course_id}-${currentAssignment.curriculum_id}-${currentAssignment.level_id}`,
      course_id: currentAssignment.course_id,
      course_name: course.name,
      curriculum_id: currentAssignment.curriculum_id,
      curriculum_name: curriculum.name,
      level_id: currentAssignment.level_id,
      level_name: level.name,
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
      level_id: ''
    });
    setAvailableCurriculaForAssignment([]);
    setAvailableLevelsForAssignment([]);
  };

  const removeAssessmentAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: AssessmentCreateData = {
      title: formData.title || '',
      code: formData.code || '',
      description: formData.description || '',
      assessment_guide: formData.assessment_guide || '',
      assessment_type: formData.assessment_type!,
      assessment_items: formData.assessment_items || [],
      difficulty_level: formData.difficulty_level || 'beginner',
      is_required: formData.is_required !== false,
      status: formData.status || 'draft',
      course_id: formData.course_id === 'none' ? undefined : formData.course_id,
      curriculum_id: formData.curriculum_id === 'none' ? undefined : formData.curriculum_id,
      level_id: formData.level_id === 'none' ? undefined : formData.level_id,
    };

    await onSubmit(submitData);
  };

  const isFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.code?.trim() &&
      formData.assessment_type
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
                  placeholder="Enter assessment title"
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
                  placeholder="ASSESS-001"
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
                placeholder="Describe what this assessment evaluates..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment_guide">Assessment Guide</Label>
              <Textarea
                id="assessment_guide"
                placeholder="Instructions and guidelines for instructors conducting this assessment..."
                value={formData.assessment_guide || ''}
                onChange={(e) => handleInputChange('assessment_guide', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <Separator />

          {/* Assessment Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Assessment Type <span className="text-red-500">*</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {assessmentTypeOptions.map((option) => (
                <Card
                  key={option.value}
                  className={cn(
                    "cursor-pointer transition-colors border-2",
                    formData.assessment_type === option.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                  onClick={() => handleInputChange('assessment_type', option.value)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {option.icon}
                      {option.label}
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

          {/* Assessment Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Assessment Items</h3>
                <p className="text-sm text-muted-foreground">
                  Add individual questions or tasks for this assessment. Each item can be graded out of 3 stars.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAssessmentItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Star Grading Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">3-Star Grading System</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Each assessment item will be graded by instructors using a 3-star system through their mobile app:
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-blue-700">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>1 Star - Needs Improvement</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>2 Stars - Satisfactory</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>3 Stars - Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {formData.assessment_items && formData.assessment_items.length > 0 && (
              <div className="space-y-3">
                {formData.assessment_items.map((item, index) => (
                  <Card key={item.id} className="border-2">
                    <Collapsible
                      open={item.isExpanded}
                      onOpenChange={() => toggleItemExpansion(item.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Item {item.sequence}</span>
                              </div>
                              {item.isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {item.title || 'Untitled Item'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveAssessmentItem(item.id, 'up');
                                }}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveAssessmentItem(item.id, 'down');
                                }}
                                disabled={index === formData.assessment_items!.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAssessmentItem(item.id);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          <div className="space-y-2">
                            <Label>Item Title</Label>
                            <Input
                              placeholder="Enter assessment item title"
                              value={item.title}
                              onChange={(e) => updateAssessmentItem(item.id, 'title', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Describe what this assessment item evaluates..."
                              value={item.description}
                              onChange={(e) => updateAssessmentItem(item.id, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* General Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={formData.is_required !== false}
                onCheckedChange={(checked) => handleInputChange('is_required', checked)}
              />
              <Label htmlFor="required">Required assessment</Label>
            </div>
          </div>

          <Separator />

          {/* Hierarchical Assignment Options */}
          {true && ( // Always show assignment section
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Assessment Assignments</h3>
                <p className="text-sm text-muted-foreground">Assign this assessment to multiple curriculum levels</p>
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
                              <span className="text-primary">{assignment.level_name}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssessmentAssignment(assignment.id)}
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
                      onValueChange={handleAssessmentCourseSelection}
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
                        onValueChange={handleAssessmentCurriculumSelection}
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
                  {availableLevelsForAssignment.length > 0 && (
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select
                        value={currentAssignment.level_id}
                        onValueChange={handleAssessmentLevelSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLevelsForAssignment.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Add Assignment Button */}
                  {currentAssignment.level_id && (
                    <Button
                      type="button"
                      onClick={addAssessmentAssignment}
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
                  Create Assessment
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <div>
              <div>Create New Assessment</div>
              <div className="text-sm font-normal text-muted-foreground">
                Add a new assessment to your curriculum level
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Create an assessment that will be assigned to Course → Curriculum → Level.
            Assessments are graded using a 3-star system by instructors.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}