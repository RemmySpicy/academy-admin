/**
 * Assessment Manager - Comprehensive assessment management interface
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Copy,
  MoreHorizontal,
  FileText,
  Clock,
  Users,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Download,
  Upload,
  Settings,
  BarChart3,
  RefreshCw,
  Layers,
  GraduationCap,
  BookOpen,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { AssessmentBuilder } from './AssessmentBuilder';
import type { Course, Assessment } from '../api/courseApiService';

interface AssessmentManagerProps {
  course: Course;
  assessments: Assessment[];
  onBack?: () => void;
  onCreateAssessment?: (assessmentData: any) => Promise<void>;
  onUpdateAssessment?: (assessmentId: string, assessmentData: any) => Promise<void>;
  onDeleteAssessment?: (assessmentId: string) => Promise<void>;
  onDuplicateAssessment?: (assessmentId: string) => Promise<void>;
  className?: string;
}

const assessmentTypeIcons = {
  quiz: BookOpen,
  exam: GraduationCap,
  assignment: FileText,
  practice: Play,
};

const assessmentTypeColors = {
  quiz: 'bg-blue-100 text-blue-800',
  exam: 'bg-red-100 text-red-800',
  assignment: 'bg-green-100 text-green-800',
  practice: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

const statusIcons = {
  draft: AlertCircle,
  published: CheckCircle,
  archived: XCircle,
};

export function AssessmentManager({
  course,
  assessments,
  onBack,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  onDuplicateAssessment,
  className,
}: AssessmentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = !searchQuery || 
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || assessment.type === filterType;
    const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAssessment = useCallback(() => {
    setEditingAssessment(null);
    setShowBuilder(true);
  }, []);

  const handleEditAssessment = useCallback((assessment: Assessment) => {
    setEditingAssessment(assessment);
    setShowBuilder(true);
  }, []);

  const handleSaveAssessment = useCallback(async (assessmentData: any) => {
    try {
      if (editingAssessment) {
        await onUpdateAssessment?.(editingAssessment.id, assessmentData);
      } else {
        await onCreateAssessment?.(assessmentData);
      }
      setShowBuilder(false);
      setEditingAssessment(null);
    } catch (error) {
      // Error handling is done in the builder
    }
  }, [editingAssessment, onUpdateAssessment, onCreateAssessment]);

  const handleDeleteAssessment = useCallback(async (assessment: Assessment) => {
    try {
      await onDeleteAssessment?.(assessment.id);
      toast.success('Assessment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  }, [onDeleteAssessment]);

  const handleDuplicateAssessment = useCallback(async (assessment: Assessment) => {
    try {
      await onDuplicateAssessment?.(assessment.id);
      toast.success('Assessment duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate assessment');
    }
  }, [onDuplicateAssessment]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
  };

  const renderAssessmentCard = (assessment: Assessment) => {
    const TypeIcon = assessmentTypeIcons[assessment.type as keyof typeof assessmentTypeIcons] || BookOpen;
    const StatusIcon = statusIcons[assessment.status as keyof typeof statusIcons] || AlertCircle;
    const isSelected = selectedAssessment?.id === assessment.id;

    return (
      <div
        key={assessment.id}
        className={`
          group relative border rounded-lg p-6 transition-all cursor-pointer
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}
        `}
        onClick={() => setSelectedAssessment(assessment)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <TypeIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg">{assessment.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={assessmentTypeColors[assessment.type as keyof typeof assessmentTypeColors]}>
                  {assessment.type}
                </Badge>
                <Badge variant="outline" className={statusColors[assessment.status as keyof typeof statusColors]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {assessment.status}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedAssessment(assessment)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditAssessment(assessment)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateAssessment(assessment)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{assessment.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteAssessment(assessment)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {assessment.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assessment.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{assessment.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span>{assessment.total_points} pts</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{assessment.questions?.length || 0} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-500" />
            <span>{assessment.passing_score}% to pass</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleEditAssessment(assessment);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toast.info('Assessment preview coming soon');
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderAssessmentDetail = () => {
    if (!selectedAssessment) return null;

    const TypeIcon = assessmentTypeIcons[selectedAssessment.type as keyof typeof assessmentTypeIcons] || BookOpen;
    const StatusIcon = statusIcons[selectedAssessment.status as keyof typeof statusIcons] || AlertCircle;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <TypeIcon className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <CardTitle className="text-xl">{selectedAssessment.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={assessmentTypeColors[selectedAssessment.type as keyof typeof assessmentTypeColors]}>
                    {selectedAssessment.type}
                  </Badge>
                  <Badge variant="outline" className={statusColors[selectedAssessment.status as keyof typeof statusColors]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {selectedAssessment.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleEditAssessment(selectedAssessment)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {selectedAssessment.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{selectedAssessment.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Duration</h4>
              <p className="text-lg font-semibold">{selectedAssessment.duration_minutes} min</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Total Points</h4>
              <p className="text-lg font-semibold">{selectedAssessment.total_points}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Questions</h4>
              <p className="text-lg font-semibold">{selectedAssessment.questions?.length || 0}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Passing Score</h4>
              <p className="text-lg font-semibold">{selectedAssessment.passing_score}%</p>
            </div>
          </div>

          {selectedAssessment.instructions && (
            <div>
              <h4 className="font-medium mb-3">Instructions</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAssessment.instructions}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Attempts allowed:</span>
                  <span className="font-medium">{selectedAssessment.attempts_allowed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timed:</span>
                  <span className="font-medium">{selectedAssessment.is_timed ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shuffle questions:</span>
                  <span className="font-medium">{selectedAssessment.shuffle_questions ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Show results:</span>
                  <span className="font-medium">{selectedAssessment.show_results_immediately ? 'Immediately' : 'After review'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Question Types</h4>
              <div className="space-y-2">
                {selectedAssessment.questions && selectedAssessment.questions.length > 0 ? (
                  (() => {
                    const questionTypes = selectedAssessment.questions.reduce((acc, q) => {
                      acc[q.type] = (acc[q.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    return Object.entries(questionTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ));
                  })()
                ) : (
                  <p className="text-sm text-gray-500">No questions added yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            <h1 className="text-2xl font-bold">Assessment Management</h1>
            <p className="text-gray-600">Course: {course.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateAssessment}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{assessments.length}</p>
                <p className="text-sm text-gray-600">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{assessments.filter(a => a.status === 'published').length}</p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {assessments.reduce((sum, a) => sum + (a.duration_minutes || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {assessments.reduce((sum, a) => sum + (a.total_points || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Assessments ({filteredAssessments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {assessments.length === 0 ? 'No assessments yet' : 'No assessments match your filters'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {assessments.length === 0 
                      ? 'Create your first assessment to get started'
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                  {assessments.length === 0 && (
                    <Button onClick={handleCreateAssessment}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Assessment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredAssessments.map(assessment => renderAssessmentCard(assessment))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assessment Detail */}
        <div>
          {selectedAssessment ? (
            renderAssessmentDetail()
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select an assessment</h3>
                  <p>Choose an assessment to view its details and settings</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assessment Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssessment ? 'Edit Assessment' : 'Create Assessment'}
            </DialogTitle>
          </DialogHeader>
          <AssessmentBuilder
            course={course}
            assessment={editingAssessment || undefined}
            onSave={handleSaveAssessment}
            onCancel={() => {
              setShowBuilder(false);
              setEditingAssessment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}