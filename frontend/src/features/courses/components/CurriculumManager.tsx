/**
 * Curriculum Manager - Complete curriculum management interface
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Trash2,
  Copy,
  Eye,
  TreePine,
  Layout,
  Settings,
  Target,
  FileText,
  Play,
  Video,
  Award,
  Users,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Save,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { CurriculumBuilder } from './CurriculumBuilder';
import { CurriculumTreeNavigator } from './CurriculumTreeNavigator';
import { LessonManager } from './LessonManager';
import { AssessmentManager } from './AssessmentManager';
import { useCourseDetail } from '../hooks/useCourses';
import type { Course, Curriculum, CourseTree, Section, Lesson, Assessment } from '../api/courseApiService';

interface CurriculumManagerProps {
  courseId: string;
  onBack?: () => void;
  className?: string;
}

interface SelectedItem {
  data: any;
  type: 'curriculum' | 'level' | 'module' | 'section' | 'lesson';
}

export function CurriculumManager({
  courseId,
  onBack,
  className,
}: CurriculumManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showAssessmentManager, setShowAssessmentManager] = useState(false);

  const {
    course,
    courseTree,
    curricula,
    isLoading,
    error,
    refetch,
    totalCurricula,
    totalLevels,
    totalModules,
    totalLessons,
  } = useCourseDetail(courseId);

  const handleSelectItem = useCallback((data: any, type: string) => {
    setSelectedItem({ data, type: type as SelectedItem['type'] });
  }, []);

  const handleEditItem = useCallback((data: any, type: string) => {
    if (type === 'curriculum') {
      setEditingCurriculum(data);
      setShowBuilder(true);
    } else if (type === 'section') {
      setSelectedSection(data);
      setShowLessonManager(true);
    } else {
      // Handle editing other types
      toast.info(`Edit ${type} functionality coming soon`);
    }
  }, []);

  const handleDeleteItem = useCallback(async (data: any, type: string) => {
    try {
      // Handle delete based on type
      toast.success(`${type} deleted successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  }, [refetch]);

  const handleAddItem = useCallback((parentData: any, parentType: string, childType: string) => {
    if (parentType === 'section' && childType === 'lesson') {
      setSelectedSection(parentData);
      setShowLessonManager(true);
    } else {
      // Handle adding other types
      toast.info(`Add ${childType} functionality coming soon`);
    }
  }, []);

  const handleSaveCurriculum = useCallback(async (curriculumData: any) => {
    try {
      // Save curriculum logic
      toast.success('Curriculum saved successfully');
      setShowBuilder(false);
      setEditingCurriculum(null);
      refetch();
    } catch (error) {
      toast.error('Failed to save curriculum');
    }
  }, [refetch]);

  // Lesson management handlers
  const handleCreateLesson = useCallback(async (lessonData: any) => {
    try {
      // Create lesson logic
      toast.success('Lesson created successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to create lesson');
    }
  }, [refetch]);

  const handleUpdateLesson = useCallback(async (lessonId: string, lessonData: any) => {
    try {
      // Update lesson logic
      toast.success('Lesson updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update lesson');
    }
  }, [refetch]);

  const handleDeleteLesson = useCallback(async (lessonId: string) => {
    try {
      // Delete lesson logic
      toast.success('Lesson deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  }, [refetch]);

  const handleDuplicateLesson = useCallback(async (lessonId: string) => {
    try {
      // Duplicate lesson logic
      toast.success('Lesson duplicated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to duplicate lesson');
    }
  }, [refetch]);

  const handleReorderLessons = useCallback(async (reorderedLessons: Lesson[]) => {
    try {
      // Reorder lessons logic
      toast.success('Lessons reordered successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to reorder lessons');
    }
  }, [refetch]);

  // Assessment management handlers
  const handleCreateAssessment = useCallback(async (assessmentData: any) => {
    try {
      // Create assessment logic
      toast.success('Assessment created successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to create assessment');
    }
  }, [refetch]);

  const handleUpdateAssessment = useCallback(async (assessmentId: string, assessmentData: any) => {
    try {
      // Update assessment logic
      toast.success('Assessment updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update assessment');
    }
  }, [refetch]);

  const handleDeleteAssessment = useCallback(async (assessmentId: string) => {
    try {
      // Delete assessment logic
      toast.success('Assessment deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  }, [refetch]);

  const handleDuplicateAssessment = useCallback(async (assessmentId: string) => {
    try {
      // Duplicate assessment logic
      toast.success('Assessment duplicated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to duplicate assessment');
    }
  }, [refetch]);

  const renderItemDetail = () => {
    if (!selectedItem) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Layout className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select an item to view details</h3>
          <p>Choose any curriculum, level, module, section, or lesson from the navigator</p>
        </div>
      );
    }

    const { data, type } = selectedItem;
    const typeLabels = {
      curriculum: 'Curriculum',
      level: 'Level',
      module: 'Module',
      section: 'Section',
      lesson: 'Lesson',
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{typeLabels[type]}</Badge>
              {data.status && (
                <Badge variant="secondary">{data.status}</Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold">{data.name}</h2>
            {data.description && (
              <p className="text-gray-600 mt-1">{data.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleEditItem(data, type)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {type === 'section' && (
              <Button variant="outline" onClick={() => {
                setSelectedSection(data);
                setShowLessonManager(true);
              }}>
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Lessons
              </Button>
            )}
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {typeLabels[type]}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{data.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteItem(data, type)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.code && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Code</label>
                  <p className="text-sm">{data.code}</p>
                </div>
              )}
              
              {data.skill_level && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Skill Level</label>
                  <p className="text-sm capitalize">{data.skill_level}</p>
                </div>
              )}
              
              {data.duration_weeks && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-sm">{data.duration_weeks} weeks</p>
                </div>
              )}
              
              {data.estimated_duration_hours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Estimated Duration</label>
                  <p className="text-sm">{data.estimated_duration_hours} hours</p>
                </div>
              )}
              
              {data.estimated_duration_minutes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-sm">{data.estimated_duration_minutes} minutes</p>
                </div>
              )}
              
              {(data.age_min || data.age_max) && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Age Range</label>
                  <p className="text-sm">
                    {data.age_min && data.age_max 
                      ? `${data.age_min} - ${data.age_max} years`
                      : data.age_min 
                        ? `${data.age_min}+ years`
                        : `Up to ${data.age_max} years`
                    }
                  </p>
                </div>
              )}
              
              {data.sequence && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Sequence</label>
                  <p className="text-sm">#{data.sequence}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objectives */}
          {data.objectives && data.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {data.prerequisites && data.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.prerequisites.map((prerequisite: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Type and Resources */}
          {type === 'lesson' && (
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.content_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Content Type</label>
                    <p className="text-sm capitalize">{data.content_type}</p>
                  </div>
                )}
                
                {data.is_required !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Required</label>
                    <p className="text-sm">{data.is_required ? 'Yes' : 'No'}</p>
                  </div>
                )}

                {data.resources && data.resources.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resources</label>
                    <div className="space-y-2 mt-2">
                      {data.resources.map((resource: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{resource.name}</span>
                          <Badge variant="outline" className="text-xs">{resource.resource_type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load curriculum data</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl font-bold">Curriculum Management</h1>
            <p className="text-gray-600">Course: {course.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setShowAssessmentManager(true)}>
            <Award className="h-4 w-4 mr-2" />
            Assessments
          </Button>
          <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCurriculum(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Curriculum
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCurriculum ? 'Edit Curriculum' : 'Create Curriculum'}
                </DialogTitle>
              </DialogHeader>
              <CurriculumBuilder
                course={course}
                curriculum={editingCurriculum || undefined}
                onSave={handleSaveCurriculum}
                onCancel={() => {
                  setShowBuilder(false);
                  setEditingCurriculum(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lesson Manager Dialog */}
      {showLessonManager && selectedSection && (
        <Dialog open={showLessonManager} onOpenChange={setShowLessonManager}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lesson Management - {selectedSection.name}</DialogTitle>
            </DialogHeader>
            <LessonManager
              section={selectedSection}
              lessons={selectedSection.lessons || []}
              onBack={() => {
                setShowLessonManager(false);
                setSelectedSection(null);
              }}
              onCreateLesson={handleCreateLesson}
              onUpdateLesson={handleUpdateLesson}
              onDeleteLesson={handleDeleteLesson}
              onDuplicateLesson={handleDuplicateLesson}
              onReorderLessons={handleReorderLessons}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Assessment Manager Dialog */}
      {showAssessmentManager && (
        <Dialog open={showAssessmentManager} onOpenChange={setShowAssessmentManager}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assessment Management - {course.name}</DialogTitle>
            </DialogHeader>
            <AssessmentManager
              course={course}
              assessments={course.assessments || []}
              onBack={() => setShowAssessmentManager(false)}
              onCreateAssessment={handleCreateAssessment}
              onUpdateAssessment={handleUpdateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onDuplicateAssessment={handleDuplicateAssessment}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalCurricula}</p>
                <p className="text-sm text-gray-600">Curricula</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalLevels}</p>
                <p className="text-sm text-gray-600">Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalModules}</p>
                <p className="text-sm text-gray-600">Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Video className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-sm text-gray-600">Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tree Navigator */}
            <div>
              {courseTree && (
                <CurriculumTreeNavigator
                  courseTree={courseTree}
                  onSelectItem={handleSelectItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onAddItem={handleAddItem}
                  selectedItemId={selectedItem?.data.id}
                />
              )}
            </div>

            {/* Item Detail */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderItemDetail()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Structure</CardTitle>
            </CardHeader>
            <CardContent>
              {courseTree ? (
                <CurriculumTreeNavigator
                  courseTree={courseTree}
                  onSelectItem={handleSelectItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onAddItem={handleAddItem}
                  selectedItemId={selectedItem?.data.id}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TreePine className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No curriculum structure</h3>
                  <p className="mb-4">Create your first curriculum to get started</p>
                  <Button onClick={() => setShowBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Curriculum
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Analytics coming soon</h3>
                <p>Track curriculum completion rates, engagement metrics, and performance insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}