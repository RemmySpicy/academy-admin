/**
 * Enhanced Curriculum Builder - Level tabs with horizontal module grid layout
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
  TrendingUp
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
import { useCurriculum } from '../hooks/useCurricula';

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
  preset?: string;
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
  onBack?: () => void;
  className?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'archived', label: 'Archived' },
];

const MAX_LEVELS = 15;

export function CurriculumBuilder({
  curriculumId,
  onBack,
  className,
}: CurriculumBuilderProps) {
  // Load curriculum data
  const { data: curriculum, isLoading } = useCurriculum(curriculumId || '');

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
    code: '',
    description: '',
    skill_level: 'beginner',
    status: 'draft',
    duration_weeks: 1,
    age_min: undefined,
    age_max: undefined,
    objectives: [],
  });

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
        code: '', // curriculum.code doesn't exist in our schema
        description: curriculum.description || '',
        skill_level: curriculum.difficulty_level || 'beginner',
        status: curriculum.status || 'draft',
        duration_weeks: Math.ceil((curriculum.duration_hours || 0) / 40) || 1, // Convert hours to weeks
        age_min: undefined,
        age_max: undefined,
        objectives: curriculum.learning_objectives ? [curriculum.learning_objectives] : [],
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

    const { source, destination, type } = result;
    
    // Handle different types of drag and drop
    if (type === 'lesson') {
      // Reorder lessons within a section
      // Implementation would update the lessons array
      setHasUnsavedChanges(true);
      toast.success('Lesson order updated');
    }
  }, []);

  const handleSave = useCallback(async (publishMode = false) => {
    try {
      const curriculumData = {
        ...formData,
        levels: levels,
        progression_settings: progressionSettings,
        status: publishMode ? 'published' : 'draft',
      };

      // TODO: Implement actual save logic with API calls
      console.log('Saving curriculum:', curriculumData);
      
      setHasUnsavedChanges(false);
      setIsDraft(!publishMode);
      toast.success(publishMode ? 'Curriculum published successfully' : 'Curriculum saved as draft');
    } catch (error) {
      toast.error(`Failed to ${publishMode ? 'publish' : 'save'} curriculum`);
    }
  }, [formData, levels, progressionSettings]);

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
            <CardTitle className="text-base">
              {module.title ? `Module ${index + 1}: ${module.title}` : `Module ${index + 1}`}
            </CardTitle>
            {module.description && (
              <p className="text-sm text-gray-600 mt-1">{module.description}</p>
            )}
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
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">
                          {section.title ? `Section ${sectionIndex + 1}: ${section.title}` : `Section ${sectionIndex + 1}`}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {section.lessons.length} lessons
                        </Badge>
                      </div>
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
                                console.log('Update warm up:', e.target.value);
                              }}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Preset */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded cursor-pointer hover:bg-green-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-700">Preset</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-green-600" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 bg-white rounded-b">
                            <Textarea
                              placeholder="Enter preset instructions..."
                              value={section.preset || ''}
                              rows={2}
                              className="text-sm"
                              onChange={(e) => {
                                console.log('Update preset:', e.target.value);
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
                            {section.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-xs">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-3 w-3 text-gray-400 cursor-move" />
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
                            ))}
                            {section.lessons.length === 0 && (
                              <p className="text-xs text-gray-400 italic py-1">No lessons yet</p>
                            )}
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
                                console.log('Update post set:', e.target.value);
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
                                console.log('Update cool down:', e.target.value);
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
  }, [handleModuleExpand, handleAddLesson, handleAddSection]);

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
                  onClick={() => {
                    const newExpanded = new Set(expandedLevels);
                    if (isExpanded) {
                      newExpanded.delete(level.id);
                    } else {
                      newExpanded.add(level.id);
                    }
                    setExpandedLevels(newExpanded);
                  }}
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
                        // Handle level title update
                        console.log('Update level title:', e.target.value);
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
                        // Handle intro video URL update
                        console.log('Update intro video:', e.target.value);
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
                      // Handle equipment needed update
                      console.log('Update equipment:', e.target.value);
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
                      // Handle description update
                      console.log('Update description:', e.target.value);
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
            <h3 className="text-lg font-medium">Modules</h3>
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
  }, [renderModuleCard, handleAddModule]);

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

  if (!curriculum) {
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
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              Curriculum Builder
              {isDraft && <Badge variant="outline" className="ml-2">Draft</Badge>}
            </h1>
            <p className="text-gray-600">
              {curriculum.name} • {curriculum.course_name}
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
            onClick={() => setShowProgressionSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Progression Settings
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Publish Curriculum
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Basic Details</TabsTrigger>
          <TabsTrigger value="builder">Curriculum Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Enter curriculum name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => handleFormChange('code', e.target.value)}
                    placeholder="Enter curriculum code"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe this curriculum"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Skill Level</label>
                  <Select
                    value={formData.skill_level}
                    onValueChange={(value) => handleFormChange('skill_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleFormChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration (weeks)</label>
                  <Input
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => handleFormChange('duration_weeks', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          {/* Level Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Curriculum Levels
                </CardTitle>
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
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Curriculum Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">{formData.name}</h3>
                  <p className="text-gray-600">{formData.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Level: {formData.skill_level}</span>
                    <span>Duration: {formData.duration_weeks} weeks</span>
                    <span>Status: {formData.status}</span>
                    <span>Levels: {levels.length}</span>
                  </div>
                </div>

                {/* Progression Settings Summary */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Progression Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Module Unlock Threshold:</span>
                      <span className="ml-2">{progressionSettings.module_unlock_threshold_percentage}%</span>
                    </div>
                    <div>
                      <span className="font-medium">Cross-Level Progression:</span>
                      <span className="ml-2">{progressionSettings.allow_cross_level_progression ? 'Allowed' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                {/* Structure Overview */}
                <div className="space-y-4">
                  <h4 className="font-medium">Structure Overview</h4>
                  {levels.map((level) => (
                    <div key={level.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{level.name}</h5>
                        <Badge variant="outline">{level.modules.length} modules</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {level.modules.map((module) => (
                          <div key={module.id} className="flex items-center justify-between">
                            <span>{module.name}</span>
                            <span>{module.sections.reduce((sum, s) => sum + s.lessons.length, 0)} lessons</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progression Settings Dialog */}
      <Dialog open={showProgressionSettings} onOpenChange={setShowProgressionSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Progression Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Module Unlock Threshold (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={progressionSettings.module_unlock_threshold_percentage}
                onChange={(e) => setProgressionSettings(prev => ({
                  ...prev,
                  module_unlock_threshold_percentage: parseFloat(e.target.value)
                }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage of stars needed to unlock the next module
              </p>
            </div>
            {/* Add other progression settings here */}
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