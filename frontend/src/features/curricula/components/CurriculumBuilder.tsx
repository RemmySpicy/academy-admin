/**
 * Curriculum Builder - Streamlined interface with clean navigation
 * 
 * Enhanced curriculum builder with sophisticated interface:
 * - Level tabs for navigation (max 15 levels)
 * - Horizontal scrolling module grid per level
 * - Collapsible module cards with nested section/lesson lists
 * - Progression settings integration
 * - Draft/save system with explicit actions
 * - Content library integration
 */

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  BookOpen,
  Plus,
  Edit,
  ChevronDown,
  ChevronRight,
  Trash2,
  Save,
  Eye,
  Copy,
  Settings,
  Target,
  FileText,
  Play,
  Video,
  Clock,
  Users,
  GripVertical,
  Library,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// ContentLibraryModal temporarily removed - placeholder function
const ContentLibraryModal = ({ open, onOpenChange, onSelectLesson, ...props }: any) => null;
import type { 
  Course, 
  Curriculum,
  DifficultyLevel,
  CurriculumStatus
} from '../api/courseApiService';
import { useCurriculum, useCreateCurriculum, useUpdateCurriculum } from '../hooks/useCurricula';
import { useCourse, useCourses } from '@/features/courses';

interface Level {
  id: string;
  name: string;
  title?: string;
  description: string;
  intro_video_url?: string;
  equipment_needed?: string;
  sequence_order: number;
  modules: Module[];
  assessment_criteria: AssessmentCriteria[];
  is_draft: boolean;
}

interface Module {
  id: string;
  name: string;
  title?: string;
  description: string;
  sequence_order: number;
  estimated_duration_hours?: number;
  sections: Section[];
  is_expanded: boolean;
}

interface Section {
  id: string;
  name: string;
  title?: string;
  description: string;
  sequence_order: number;
  lessons: Lesson[];
  // Workout Components
  warm_up?: string;
  pre_set?: string;
  post_set?: string;
  cool_down?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  sequence_order: number;
  duration_minutes?: number;
  content_type?: string;
}

interface AssessmentCriteria {
  id: string;
  name: string;
  description: string;
  sequence_order: number;
  weight: number;
  max_score: number;
}

interface ProgressionSettings {
  module_unlock_threshold_percentage: number;
  require_minimum_one_star_per_lesson: boolean;
  allow_cross_level_progression: boolean;
  allow_lesson_retakes: boolean;
}

interface CurriculumBuilderProps {
  curriculumId?: string;
  courseId?: string; // For prefilling course context in create mode
  onBack?: () => void;
  className?: string;
}

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
];

const MAX_LEVELS = 15;

export function CurriculumBuilder({
  curriculumId,
  courseId,
  onBack,
  className,
}: CurriculumBuilderProps) {
  const isEditMode = Boolean(curriculumId);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [activeLevel, setActiveLevel] = useState<string>('');
  const [isDraft, setIsDraft] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showProgressionSettings, setShowProgressionSettings] = useState(false);
  const [showContentLibrary, setShowContentLibrary] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    curriculum_code: '',
    description: '',
    course_id: courseId || '', // Prefill with courseId if provided
    difficulty_level: 'beginner',
    duration_hours: '',
    prerequisites: '',
    learning_objectives: '',
    age_ranges: [] as string[],
    is_default_for_age_groups: [] as string[],
    status: 'draft',
  });

  // Load curriculum data (only when we have an ID for edit mode)
  const { data: curriculum, isLoading } = useCurriculum(curriculumId || '', { 
    enabled: Boolean(curriculumId) 
  });
  const { data: coursesData } = useCourses({ page: 1, per_page: 100 });
  const { data: selectedCourse } = useCourse(formData.course_id, { enabled: !!formData.course_id });
  
  // Curriculum CRUD hooks
  const createCurriculum = useCreateCurriculum();
  const updateCurriculum = useUpdateCurriculum();

  const availableCourses = coursesData?.items || [];
  const courseAgeRanges = selectedCourse?.age_ranges || [];

  // Curriculum structure state
  const [levels, setLevels] = useState<Level[]>([]);
  const [progressionSettings, setProgressionSettings] = useState<ProgressionSettings>({
    module_unlock_threshold_percentage: 70.0,
    require_minimum_one_star_per_lesson: true,
    allow_cross_level_progression: true,
    allow_lesson_retakes: true,
  });

  // Initialize form data and levels from existing curriculum
  useEffect(() => {
    if (curriculum) {
      // Update form data
      setFormData({
        name: curriculum.name || '',
        curriculum_code: curriculum.curriculum_code || '',
        description: curriculum.description || '',
        course_id: curriculum.course_id || '',
        difficulty_level: curriculum.difficulty_level || 'beginner',
        duration_hours: curriculum.duration_hours ? curriculum.duration_hours.toString() : '',
        prerequisites: curriculum.prerequisites || '',
        learning_objectives: curriculum.learning_objectives || '',
        age_ranges: curriculum.age_ranges || [],
        is_default_for_age_groups: curriculum.is_default_for_age_groups || [],
        status: curriculum.status || 'draft',
      });
      
      // Initialize levels from curriculum data
      // For now, create a default structure - this would be loaded from API
      setIsDraft(curriculum.status === 'draft');
      
      const defaultLevel: Level = {
        id: `level-${Date.now()}`,
        name: 'Level 1',
        description: '',
        sequence_order: 1,
        modules: [],
        assessment_criteria: [],
        is_draft: true,
      };
      setLevels([defaultLevel]);
      setActiveLevel(defaultLevel.id);
    }
  }, [curriculum]);

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleAgeRangeToggle = useCallback((ageRange: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      age_ranges: checked 
        ? [...prev.age_ranges, ageRange]
        : prev.age_ranges.filter(range => range !== ageRange)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleDefaultAgeGroupToggle = useCallback((ageGroup: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_default_for_age_groups: checked
        ? [...prev.is_default_for_age_groups, ageGroup]
        : prev.is_default_for_age_groups.filter(group => group !== ageGroup)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleAddLevel = useCallback(() => {
    if (levels.length >= MAX_LEVELS) {
      toast.error(`Maximum ${MAX_LEVELS} levels allowed per curriculum`);
      return;
    }

    const newLevel: Level = {
      id: `level-${Date.now()}`,
      name: `Level ${levels.length + 1}`,
      description: '',
      sequence_order: levels.length + 1,
      modules: [],
      assessment_criteria: [
        {
          id: `criteria-${Date.now()}-1`,
          name: 'Technical Skills',
          description: 'Assessment of technical proficiency',
          sequence_order: 1,
          weight: 1.0,
          max_score: 3,
        },
        {
          id: `criteria-${Date.now()}-2`,
          name: 'Safety Awareness',
          description: 'Understanding and application of safety protocols',
          sequence_order: 2,
          weight: 1.0,
          max_score: 3,
        },
      ],
      is_draft: true,
    };

    setLevels(prev => [...prev, newLevel]);
    setActiveLevel(newLevel.id);
    setHasUnsavedChanges(true);
    toast.success('New level added successfully');
  }, [levels]);

  const handleRemoveLevel = useCallback((levelId: string) => {
    if (levels.length <= 1) {
      toast.error('At least one level is required');
      return;
    }

    setLevels(prev => {
      const filtered = prev.filter(l => l.id !== levelId);
      // Resequence remaining levels
      return filtered.map((level, index) => ({
        ...level,
        sequence_order: index + 1,
        name: level.name.replace(/Level \d+/, `Level ${index + 1}`)
      }));
    });

    // Update active level if needed
    if (activeLevel === levelId && levels.length > 1) {
      const remainingLevels = levels.filter(l => l.id !== levelId);
      setActiveLevel(remainingLevels[0].id);
    }

    setHasUnsavedChanges(true);
    toast.success('Level removed successfully');
  }, [levels, activeLevel]);

  const handleAddModule = useCallback((levelId: string) => {
    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        const newModule: Module = {
          id: `module-${Date.now()}`,
          name: `Module ${level.modules.length + 1}`,
          description: '',
          sequence_order: level.modules.length + 1,
          estimated_duration_hours: 2,
          sections: [],
          is_expanded: false,
        };
        return {
          ...level,
          modules: [...level.modules, newModule]
        };
      }
      return level;
    }));
    setHasUnsavedChanges(true);
    toast.success('New module added successfully');
  }, []);

  const handleModuleExpand = useCallback((levelId: string, moduleId: string) => {
    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return { ...module, is_expanded: !module.is_expanded };
            }
            return module;
          })
        };
      }
      return level;
    }));
  }, []);

  const handleLevelExpand = useCallback((levelId: string) => {
    setExpandedLevels(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(levelId)) {
        newExpanded.delete(levelId);
      } else {
        newExpanded.add(levelId);
      }
      return newExpanded;
    });
  }, []);

  const handleUpdateLevel = useCallback((levelId: string, field: keyof Level, value: any) => {
    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        return { ...level, [field]: value };
      }
      return level;
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleUpdateModule = useCallback((levelId: string, moduleId: string, field: keyof Module, value: any) => {
    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return { ...module, [field]: value };
            }
            return module;
          })
        };
      }
      return level;
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleUpdateSection = useCallback((levelId: string, moduleId: string, sectionId: string, field: keyof Section, value: any) => {
    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.map(section => {
                  if (section.id === sectionId) {
                    return { ...section, [field]: value };
                  }
                  return section;
                })
              };
            }
            return module;
          })
        };
      }
      return level;
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleAddSection = useCallback((levelId: string, moduleId: string) => {
    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              const newSection: Section = {
                id: `section-${Date.now()}`,
                name: `Section ${module.sections.length + 1}`,
                description: '',
                sequence_order: module.sections.length + 1,
                lessons: [],
              };
              return {
                ...module,
                sections: [...module.sections, newSection]
              };
            }
            return module;
          })
        };
      }
      return level;
    }));
    setHasUnsavedChanges(true);
    toast.success('New section added successfully');
  }, []);

  const handleAddLesson = useCallback((levelId: string, moduleId: string, sectionId: string, fromLibrary = false) => {
    if (fromLibrary) {
      setShowContentLibrary(true);
      // Store context for library selection
      (window as any).libraryContext = { levelId, moduleId, sectionId };
      return;
    }

    setLevels(prev => prev.map(level => {
      if (level.id === levelId) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.map(section => {
                  if (section.id === sectionId) {
                    const newLesson: Lesson = {
                      id: `lesson-${Date.now()}`,
                      title: `Lesson ${section.lessons.length + 1}`,
                      description: '',
                      sequence_order: section.lessons.length + 1,
                      duration_minutes: 30,
                      content_type: 'instruction',
                    };
                    return {
                      ...section,
                      lessons: [...section.lessons, newLesson]
                    };
                  }
                  return section;
                })
              };
            }
            return module;
          })
        };
      }
      return level;
    }));
    setHasUnsavedChanges(true);
    toast.success('New lesson added successfully');
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type, draggableId } = result;
    
    // Handle different types of drag and drop
    if (type === 'lesson') {
      // Extract context from draggableId (format: level-module-section-lesson)
      const [levelId, moduleId, sectionId] = draggableId.split('-').slice(0, 3);
      
      setLevels(prev => prev.map(level => {
        if (level.id === `level-${levelId}`) {
          return {
            ...level,
            modules: level.modules.map(module => {
              if (module.id === `module-${moduleId}`) {
                return {
                  ...module,
                  sections: module.sections.map(section => {
                    if (section.id === `section-${sectionId}`) {
                      const lessons = Array.from(section.lessons);
                      const [reorderedItem] = lessons.splice(source.index, 1);
                      lessons.splice(destination.index, 0, reorderedItem);
                      
                      // Update sequence_order for all lessons
                      const updatedLessons = lessons.map((lesson, index) => ({
                        ...lesson,
                        sequence_order: index + 1
                      }));
                      
                      return {
                        ...section,
                        lessons: updatedLessons
                      };
                    }
                    return section;
                  })
                };
              }
              return module;
            })
          };
        }
        return level;
      }));
      
      setHasUnsavedChanges(true);
      toast.success('Lesson order updated');
    }
  }, []);

  const handleSave = useCallback(async (publishMode = false) => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Please enter a curriculum name');
        return;
      }
      if (!formData.course_id) {
        toast.error('Please select a course');
        return;
      }

      const curriculumData = {
        name: formData.name,
        description: formData.description,
        curriculum_code: formData.curriculum_code,
        course_id: formData.course_id,
        difficulty_level: formData.difficulty_level as DifficultyLevel,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
        prerequisites: formData.prerequisites,
        learning_objectives: formData.learning_objectives,
        age_ranges: formData.age_ranges,
        is_default_for_age_groups: formData.is_default_for_age_groups,
        status: (publishMode ? 'published' : 'draft') as CurriculumStatus,
        // TODO: Add levels and progression settings when backend supports them
        // levels: levels,
        // progression_settings: progressionSettings,
      };

      if (isEditMode && curriculumId) {
        // Update existing curriculum
        await updateCurriculum.mutateAsync({
          id: curriculumId,
          data: curriculumData
        });
        toast.success(publishMode ? 'Curriculum published successfully' : 'Curriculum updated successfully');
      } else {
        // Create new curriculum
        const newCurriculum = await createCurriculum.mutateAsync(curriculumData);
        toast.success(publishMode ? 'Curriculum published successfully' : 'Curriculum created successfully');
        
        // Navigate to edit mode for the newly created curriculum
        if (onBack) {
          onBack();
        }
      }
      
      setHasUnsavedChanges(false);
      setIsDraft(!publishMode);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to ${publishMode ? 'publish' : 'save'} curriculum`);
    }
  }, [formData, isEditMode, curriculumId, updateCurriculum, createCurriculum, onBack]);

  const renderModuleCard = useCallback((level: Level, module: Module, index: number) => {
    const totalLessons = module.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    const totalDuration = module.sections.reduce((sum, section) => 
      sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration_minutes || 0), 0), 0
    );

    return (
      <Card key={module.id} className="w-full border-2 hover:border-blue-300 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <Badge variant="outline" className="text-xs">Module {index + 1}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModuleExpand(level.id, module.id)}
                className="h-6 w-6 p-0"
              >
                {module.is_expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <Input
              value={module.title || ''}
              placeholder={`Module ${index + 1} title...`}
              className="text-base font-semibold mb-2"
              onChange={(e) => handleUpdateModule(level.id, module.id, 'title', e.target.value)}
            />
            <Textarea
              value={module.description || ''}
              placeholder="Module description..."
              className="text-sm"
              rows={2}
              onChange={(e) => handleUpdateModule(level.id, module.id, 'description', e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Module summary */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>{totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(totalDuration / 60)} hours</span>
            </div>
            {module.estimated_duration_hours && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{module.estimated_duration_hours}h est.</span>
              </div>
            )}
          </div>

          {/* Expanded content */}
          {module.is_expanded && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                {module.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="border rounded-lg p-3 bg-gray-50">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Play className="h-4 w-4 text-orange-600" />
                        <Input
                          value={section.title || ''}
                          placeholder={`Section ${sectionIndex + 1} title...`}
                          className="text-sm font-medium h-8 flex-1"
                          onChange={(e) => handleUpdateSection(level.id, module.id, section.id, 'title', e.target.value)}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {section.lessons.length} lessons
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Section Description */}
                    <div className="mb-3">
                      <Textarea
                        value={section.description || ''}
                        placeholder="Section description..."
                        className="text-sm"
                        rows={2}
                        onChange={(e) => handleUpdateSection(level.id, module.id, section.id, 'description', e.target.value)}
                      />
                    </div>
                    
                    {/* Workout Components */}
                    <div className="space-y-3">
                      {/* Warm Up */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-700">Warm Up</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-blue-600" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 bg-white rounded-b">
                            <Textarea
                              placeholder="Enter warm up instructions..."
                              value={section.warm_up || ''}
                              rows={2}
                              className="text-sm"
                              onChange={(e) => {
                                handleUpdateSection(level.id, module.id, section.id, 'warm_up', e.target.value);
                              }}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Pre Set */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded cursor-pointer hover:bg-green-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-700">Pre Set</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-green-600" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 bg-white rounded-b">
                            <Textarea
                              placeholder="Enter pre set instructions..."
                              value={section.pre_set || ''}
                              rows={2}
                              className="text-sm"
                              onChange={(e) => {
                                handleUpdateSection(level.id, module.id, section.id, 'pre_set', e.target.value);
                              }}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Main Set (Lessons) */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-purple-700">Main Set (Lessons)</span>
                              <Badge variant="secondary" className="text-xs">
                                {section.lessons.length} lessons
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddLesson(level.id, module.id, section.id);
                                }}
                                className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Open lesson library modal
                                  console.log('Open lesson library');
                                }}
                                className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700"
                              >
                                <Library className="h-3 w-3" />
                              </Button>
                              <ChevronRight className="h-4 w-4 text-purple-600" />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 bg-white rounded-b space-y-1">
                            <Droppable droppableId={`${level.id}-${module.id}-${section.id}`} type="lesson">
                              {(provided, snapshot) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className={`space-y-1 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                                >
                                  {section.lessons.map((lesson, lessonIndex) => (
                                    <Draggable
                                      key={lesson.id}
                                      draggableId={`${level.id}-${module.id}-${section.id}-${lesson.id}`}
                                      index={lessonIndex}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-xs ${
                                            snapshot.isDragging ? 'shadow-lg bg-white border' : ''
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="h-3 w-3 text-gray-400 cursor-move" />
                                            </div>
                                            <Video className="h-3 w-3 text-red-600" />
                                            <span>{lesson.title}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-500">
                                            {lesson.duration_minutes && (
                                              <span>{lesson.duration_minutes}m</span>
                                            )}
                                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:text-red-600">
                                              <Trash2 className="h-2 w-2" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  {section.lessons.length === 0 && (
                                    <p className="text-xs text-gray-400 italic py-1">No lessons yet</p>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Post Set */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 bg-orange-50 rounded cursor-pointer hover:bg-orange-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-orange-700">Post Set</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-orange-600" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 bg-white rounded-b">
                            <Textarea
                              placeholder="Enter post set instructions..."
                              value={section.post_set || ''}
                              rows={2}
                              className="text-sm"
                              onChange={(e) => {
                                handleUpdateSection(level.id, module.id, section.id, 'post_set', e.target.value);
                              }}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Cool Down */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 bg-cyan-50 rounded cursor-pointer hover:bg-cyan-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-cyan-700">Cool Down</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-cyan-600" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 bg-white rounded-b">
                            <Textarea
                              placeholder="Enter cool down instructions..."
                              value={section.cool_down || ''}
                              rows={2}
                              className="text-sm"
                              onChange={(e) => {
                                handleUpdateSection(level.id, module.id, section.id, 'cool_down', e.target.value);
                              }}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                ))}
                {module.sections.length === 0 && (
                  <p className="text-sm text-gray-400 italic py-2">No sections yet</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection(level.id, module.id)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Section
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [handleModuleExpand, handleAddLesson, handleAddSection, handleUpdateModule, handleUpdateSection]);

  const renderLevelContent = useCallback((level: Level) => {
    const isExpanded = expandedLevels.has(level.id);
    const levelDisplayName = level.title ? `Level ${level.sequence_order}: ${level.title}` : `Level ${level.sequence_order}`;
    
    return (
      <div className="space-y-6">
        {/* Level info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <CardTitle className="flex items-center gap-2">
                    {levelDisplayName}
                    {level.is_draft && <Badge variant="outline">Draft</Badge>}
                  </CardTitle>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {level.description || 'No description provided'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Assessment Criteria
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddModule(level.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLevelExpand(level.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Collapsible Level Details */}
          <Collapsible open={isExpanded}>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4 border-t bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Level Title</label>
                    <Input
                      value={level.title || ''}
                      placeholder="Enter level title..."
                      className="mt-1"
                      onChange={(e) => {
                        handleUpdateLevel(level.id, 'title', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Introductory Video URL</label>
                    <Input
                      value={level.intro_video_url || ''}
                      placeholder="Enter video URL..."
                      className="mt-1"
                      onChange={(e) => {
                        handleUpdateLevel(level.id, 'intro_video_url', e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Equipment Needed</label>
                  <Textarea
                    value={level.equipment_needed || ''}
                    placeholder="List equipment needed for this level..."
                    className="mt-1"
                    rows={3}
                    onChange={(e) => {
                      handleUpdateLevel(level.id, 'equipment_needed', e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Level Description</label>
                  <Textarea
                    value={level.description || ''}
                    placeholder="Enter level description..."
                    className="mt-1"
                    rows={3}
                    onChange={(e) => {
                      handleUpdateLevel(level.id, 'description', e.target.value);
                    }}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Modules horizontal scroll */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Curriculum Modules
            </h3>
            <Badge variant="secondary">
              {level.modules.length} module{level.modules.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex flex-col gap-4 pb-4">
              {level.modules.length > 0 ? (
                level.modules.map((module, index) => renderModuleCard(level, module, index))
              ) : (
                <Card className="w-full border-dashed border-2 border-gray-300">
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-gray-500">
                      <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-3">No modules created yet</p>
                      <Button onClick={() => handleAddModule(level.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Module
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }, [renderModuleCard, handleAddModule, handleLevelExpand, handleUpdateLevel, expandedLevels]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Only show "not found" error in edit mode when curriculum should exist
  if (isEditMode && !isLoading && !curriculum) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Curriculum not found</h3>
          <p className="mb-4">The requested curriculum could not be found.</p>
          {onBack && (
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Curricula
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit Curriculum' : 'Create Curriculum'}
              {isDraft && <Badge variant="outline" className="ml-2">Draft</Badge>}
            </h1>
            <p className="text-gray-600">
              {isEditMode && curriculum
                ? `Edit ${curriculum.name} for ${curriculum.course_name}`
                : 'Create a new curriculum for your course'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={createCurriculum.isPending || updateCurriculum.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createCurriculum.isPending || updateCurriculum.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={createCurriculum.isPending || updateCurriculum.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {createCurriculum.isPending || updateCurriculum.isPending ? 'Publishing...' : 'Publish Curriculum'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Preview & Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Curriculum Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="e.g., Swimming Fundamentals - Beginner"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course_id">Course *</Label>
                      <Select 
                        value={formData.course_id} 
                        onValueChange={(value) => handleFormChange('course_id', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty_level">Difficulty Level</Label>
                      <Select 
                        value={formData.difficulty_level} 
                        onValueChange={(value) => handleFormChange('difficulty_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration_hours">Duration (hours)</Label>
                      <Input
                        id="duration_hours"
                        type="number"
                        min="1"
                        value={formData.duration_hours}
                        onChange={(e) => handleFormChange('duration_hours', e.target.value)}
                        placeholder="e.g., 40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Describe what students will learn in this curriculum..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="learning_objectives">Learning Objectives</Label>
                    <Textarea
                      id="learning_objectives"
                      value={formData.learning_objectives}
                      onChange={(e) => handleFormChange('learning_objectives', e.target.value)}
                      placeholder="List the main learning objectives for this curriculum..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prerequisites">Prerequisites</Label>
                    <Textarea
                      id="prerequisites"
                      value={formData.prerequisites}
                      onChange={(e) => handleFormChange('prerequisites', e.target.value)}
                      placeholder="List any prerequisites or prior knowledge required..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Age Groups Selection */}
              {courseAgeRanges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Age Groups *</CardTitle>
                    <p className="text-sm text-gray-600">
                      Select the age groups this curriculum applies to
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {courseAgeRanges.map((ageRange) => (
                        <div key={ageRange} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`age-${ageRange}`}
                              checked={formData.age_ranges.includes(ageRange)}
                              onCheckedChange={(checked) => handleAgeRangeToggle(ageRange, checked as boolean)}
                            />
                            <Label htmlFor={`age-${ageRange}`} className="font-medium">
                              {ageRange}
                            </Label>
                          </div>
                          
                          {formData.age_ranges.includes(ageRange) && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`default-${ageRange}`}
                                checked={formData.is_default_for_age_groups.includes(ageRange)}
                                onCheckedChange={(checked) => handleDefaultAgeGroupToggle(ageRange, checked as boolean)}
                              />
                              <Label htmlFor={`default-${ageRange}`} className="text-sm text-orange-600">
                                <Award className="h-3 w-3 inline mr-1" />
                                Set as default
                              </Label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleFormChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Selected Age Groups:</h4>
                    {formData.age_ranges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.age_ranges.map((ageRange) => (
                          <Badge 
                            key={ageRange} 
                            variant={formData.is_default_for_age_groups.includes(ageRange) ? "default" : "outline"}
                          >
                            {formData.is_default_for_age_groups.includes(ageRange) && (
                              <Award className="h-3 w-3 mr-1" />
                            )}
                            {ageRange}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No age groups selected</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleSave(true)}
                    className="w-full"
                    disabled={!formData.name.trim() || createCurriculum.isPending || updateCurriculum.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createCurriculum.isPending || updateCurriculum.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleSave(false)}
                    disabled={!formData.name.trim() || createCurriculum.isPending || updateCurriculum.isPending}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {createCurriculum.isPending || updateCurriculum.isPending ? 'Saving...' : 'Save as Draft'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Curriculum Levels
            </h3>
            <Button
              variant="outline"
              onClick={handleAddLevel}
              disabled={levels.length >= MAX_LEVELS}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Level
              {levels.length >= MAX_LEVELS && (
                <span className="ml-2 text-xs text-gray-500">(Max {MAX_LEVELS})</span>
              )}
            </Button>
          </div>
          {levels.length > 0 ? (
            <Tabs value={activeLevel} onValueChange={setActiveLevel}>
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-auto p-1 bg-gray-100">
                  {levels.map((level) => (
                    <TabsTrigger 
                      key={level.id} 
                      value={level.id}
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <Target className="h-4 w-4" />
                      {level.name}
                      {level.is_draft && (
                        <Badge variant="secondary" className="text-xs ml-1">Draft</Badge>
                      )}
                      {levels.length > 1 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div
                              className="h-4 w-4 p-0 ml-2 text-red-600 hover:text-red-700 cursor-pointer inline-flex items-center justify-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3 w-3" />
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Level</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{level.name}"? This will also delete all modules, sections, and lessons within this level.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveLevel(level.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {levels.map((level) => (
                <TabsContent key={level.id} value={level.id} className="mt-6">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    {renderLevelContent(level)}
                  </DragDropContext>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No levels created yet</h3>
              <p className="mb-4">Start building your curriculum by adding the first level</p>
              <Button onClick={handleAddLevel}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Level
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Curriculum Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Curriculum Overview
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Preview and configure your curriculum settings</p>
                </div>
                <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{formData.name || 'Untitled Curriculum'}</h3>
                <p className="text-gray-600 mb-3">{formData.description || 'No description provided'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Difficulty:</span>
                    <p className="capitalize">{formData.difficulty_level}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <p>{formData.duration_hours || 'Not set'} hours</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Levels:</span>
                    <p>{levels.length} level{levels.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Modules:</span>
                    <p>{levels.reduce((sum, level) => sum + level.modules.length, 0)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progression Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Progression Settings
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Configure how students progress through the curriculum</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProgressionSettings(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Module Unlock Threshold</p>
                      <p className="text-sm text-gray-600">Stars required to unlock next module</p>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      {progressionSettings.module_unlock_threshold_percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Minimum Stars Per Lesson</p>
                      <p className="text-sm text-gray-600">Require at least one star per lesson</p>
                    </div>
                    <Badge variant={progressionSettings.require_minimum_one_star_per_lesson ? 'default' : 'secondary'}>
                      {progressionSettings.require_minimum_one_star_per_lesson ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Cross-Level Progression</p>
                      <p className="text-sm text-gray-600">Allow skipping between levels</p>
                    </div>
                    <Badge variant={progressionSettings.allow_cross_level_progression ? 'default' : 'secondary'}>
                      {progressionSettings.allow_cross_level_progression ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Lesson Retakes</p>
                      <p className="text-sm text-gray-600">Allow students to retake lessons</p>
                    </div>
                    <Badge variant={progressionSettings.allow_lesson_retakes ? 'default' : 'secondary'}>
                      {progressionSettings.allow_lesson_retakes ? 'Allowed' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structure Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Curriculum Structure
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Overview of all levels, modules, and lessons</p>
            </CardHeader>
            <CardContent>
              {levels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No levels created yet</p>
                  <p className="text-sm">Switch to the Builder tab to create your curriculum structure</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {levels.map((level, levelIndex) => {
                    const totalLessons = level.modules.reduce((sum, module) => 
                      sum + module.sections.reduce((sectionSum, section) => sectionSum + section.lessons.length, 0), 0
                    );
                    const totalDuration = level.modules.reduce((sum, module) => 
                      sum + module.sections.reduce((sectionSum, section) => 
                        sectionSum + section.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration_minutes || 0), 0), 0), 0
                    );

                    return (
                      <div key={level.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                                {levelIndex + 1}
                              </div>
                              <div>
                                <h5 className="font-medium text-lg">{level.name}</h5>
                                <p className="text-sm text-gray-600">{level.description || 'No description'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-medium">{level.modules.length}</p>
                                <p className="text-gray-600">Modules</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium">{totalLessons}</p>
                                <p className="text-gray-600">Lessons</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium">{Math.round(totalDuration / 60)}h</p>
                                <p className="text-gray-600">Duration</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {level.modules.map((module, moduleIndex) => {
                              const moduleLessons = module.sections.reduce((sum, section) => sum + section.lessons.length, 0);
                              const moduleDuration = module.sections.reduce((sum, section) => 
                                sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration_minutes || 0), 0), 0
                              );

                              return (
                                <div key={module.id} className="flex items-center justify-between p-3 bg-white border rounded">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-purple-600" />
                                    <div>
                                      <p className="font-medium text-sm">{module.name}</p>
                                      <p className="text-xs text-gray-600">{module.sections.length} sections</p>
                                    </div>
                                  </div>
                                  <div className="text-right text-xs text-gray-600">
                                    <p>{moduleLessons} lessons</p>
                                    <p>{Math.round(moduleDuration / 60)}h</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Curriculum Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{levels.length}</div>
                  <div className="text-sm text-gray-600">Total Levels</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {levels.reduce((sum, level) => sum + level.modules.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {levels.reduce((sum, level) => 
                      sum + level.modules.reduce((moduleSum, module) => moduleSum + module.sections.length, 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Sections</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {levels.reduce((sum, level) => 
                      sum + level.modules.reduce((moduleSum, module) => 
                        moduleSum + module.sections.reduce((sectionSum, section) => sectionSum + section.lessons.length, 0), 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Lessons</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progression Settings Dialog */}
      <Dialog open={showProgressionSettings} onOpenChange={setShowProgressionSettings}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Progression Settings
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Configure how students progress through your curriculum
            </p>
          </DialogHeader>
          <div className="space-y-6">
            {/* Module Unlock Threshold */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Label className="text-sm font-medium">Module Unlock Threshold</Label>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={progressionSettings.module_unlock_threshold_percentage}
                  onChange={(e) => setProgressionSettings(prev => ({
                    ...prev,
                    module_unlock_threshold_percentage: parseFloat(e.target.value) || 0
                  }))}
                  className="w-24"
                />
                <span className="text-sm">% of stars required to unlock next module</span>
              </div>
              <p className="text-xs text-gray-500">
                Students must earn this percentage of available stars in a module before the next module becomes available
              </p>
            </div>

            <Separator />

            {/* Boolean Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Minimum Stars Per Lesson */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <Label className="text-sm font-medium">Minimum Stars Per Lesson</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={progressionSettings.require_minimum_one_star_per_lesson}
                    onCheckedChange={(checked) => setProgressionSettings(prev => ({
                      ...prev,
                      require_minimum_one_star_per_lesson: Boolean(checked)
                    }))}
                  />
                  <Label className="text-sm">Require at least one star per lesson</Label>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, students must earn at least one star on each lesson to progress
                </p>
              </div>

              {/* Cross-Level Progression */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-medium">Cross-Level Progression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={progressionSettings.allow_cross_level_progression}
                    onCheckedChange={(checked) => setProgressionSettings(prev => ({
                      ...prev,
                      allow_cross_level_progression: Boolean(checked)
                    }))}
                  />
                  <Label className="text-sm">Allow students to skip between levels</Label>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, advanced students can move to higher levels without completing all previous levels
                </p>
              </div>

              {/* Lesson Retakes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-orange-500" />
                  <Label className="text-sm font-medium">Lesson Retakes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={progressionSettings.allow_lesson_retakes}
                    onCheckedChange={(checked) => setProgressionSettings(prev => ({
                      ...prev,
                      allow_lesson_retakes: Boolean(checked)
                    }))}
                  />
                  <Label className="text-sm">Allow students to retake lessons</Label>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, students can repeat lessons to improve their star ratings
                </p>
              </div>
            </div>

            <Separator />

            {/* Settings Preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Settings Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Module unlock at:</span>
                  <span className="ml-2">{progressionSettings.module_unlock_threshold_percentage}% stars</span>
                </div>
                <div>
                  <span className="font-medium">Minimum stars:</span>
                  <span className="ml-2">{progressionSettings.require_minimum_one_star_per_lesson ? 'Required' : 'Optional'}</span>
                </div>
                <div>
                  <span className="font-medium">Cross-level:</span>
                  <span className="ml-2">{progressionSettings.allow_cross_level_progression ? 'Allowed' : 'Restricted'}</span>
                </div>
                <div>
                  <span className="font-medium">Retakes:</span>
                  <span className="ml-2">{progressionSettings.allow_lesson_retakes ? 'Allowed' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProgressionSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowProgressionSettings(false);
                toast.success('Progression settings updated');
              }}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Library Modal */}
      <ContentLibraryModal
        open={showContentLibrary}
        onOpenChange={setShowContentLibrary}
        onSelectLesson={(lesson) => {
          // Handle lesson selection from library
          const context = (window as any).libraryContext;
          if (context) {
            handleAddLesson(context.levelId, context.moduleId, context.sectionId, false);
            (window as any).libraryContext = null;
          }
          toast.success(`Added "${lesson.title}" from content library`);
        }}
      />
    </div>
  );
}