/**
 * Lesson Manager - Comprehensive lesson management interface
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
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Copy,
  MoreHorizontal,
  GripVertical,
  Video,
  FileText,
  Image,
  Play,
  Clock,
  Users,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Settings,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { LessonEditor } from './LessonEditor';
import type { 
  Section, 
  Lesson, 
  LessonResource,
  DifficultyLevel 
} from '../api/courseApiService';

interface LessonManagerProps {
  section: Section;
  lessons: Lesson[];
  onBack?: () => void;
  onCreateLesson?: (lessonData: any) => Promise<void>;
  onUpdateLesson?: (lessonId: string, lessonData: any) => Promise<void>;
  onDeleteLesson?: (lessonId: string) => Promise<void>;
  onDuplicateLesson?: (lessonId: string) => Promise<void>;
  onReorderLessons?: (reorderedLessons: Lesson[]) => Promise<void>;
  className?: string;
}

const contentTypeIcons = {
  text: FileText,
  video: Video,
  interactive: Play,
  document: FileText,
  presentation: Image,
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
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

export function LessonManager({
  section,
  lessons,
  onBack,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onReorderLessons,
  className,
}: LessonManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('sequence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Filter and sort lessons
  const filteredAndSortedLessons = lessons
    .filter(lesson => {
      const matchesSearch = !searchQuery || 
        lesson.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = filterDifficulty === 'all' || lesson.difficulty_level === filterDifficulty;
      const matchesStatus = filterStatus === 'all' || lesson.status === filterStatus;
      const matchesContentType = filterContentType === 'all' || lesson.content_type === filterContentType;
      
      return matchesSearch && matchesDifficulty && matchesStatus && matchesContentType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sequence':
          comparison = (a.sequence || 0) - (b.sequence || 0);
          break;
        case 'duration':
          comparison = (a.estimated_duration_minutes || 0) - (b.estimated_duration_minutes || 0);
          break;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          comparison = difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !onReorderLessons) return;

    const items = Array.from(filteredAndSortedLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sequence numbers
    const updatedLessons = items.map((lesson, index) => ({
      ...lesson,
      sequence: index + 1,
    }));

    onReorderLessons(updatedLessons);
  }, [filteredAndSortedLessons, onReorderLessons]);

  const handleCreateLesson = useCallback(() => {
    setEditingLesson(null);
    setShowEditor(true);
  }, []);

  const handleEditLesson = useCallback((lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowEditor(true);
  }, []);

  const handleSaveLesson = useCallback(async (lessonData: any) => {
    try {
      if (editingLesson) {
        await onUpdateLesson?.(editingLesson.id, lessonData);
      } else {
        await onCreateLesson?.(lessonData);
      }
      setShowEditor(false);
      setEditingLesson(null);
    } catch (error) {
      // Error handling is done in the editor
    }
  }, [editingLesson, onUpdateLesson, onCreateLesson]);

  const handleDeleteLesson = useCallback(async (lesson: Lesson) => {
    try {
      await onDeleteLesson?.(lesson.id);
      toast.success('Lesson deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  }, [onDeleteLesson]);

  const handleDuplicateLesson = useCallback(async (lesson: Lesson) => {
    try {
      await onDuplicateLesson?.(lesson.id);
      toast.success('Lesson duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate lesson');
    }
  }, [onDuplicateLesson]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDifficulty('all');
    setFilterStatus('all');
    setFilterContentType('all');
  };

  const renderLessonCard = (lesson: Lesson, index: number) => {
    const ContentTypeIcon = contentTypeIcons[lesson.content_type] || FileText;
    const StatusIcon = statusIcons[lesson.status as keyof typeof statusIcons] || AlertCircle;
    const isSelected = selectedLesson?.id === lesson.id;

    if (viewMode === 'list') {
      return (
        <Draggable draggableId={lesson.id} index={index} key={lesson.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`
                flex items-center gap-4 p-4 border rounded-lg transition-all cursor-pointer
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
                ${snapshot.isDragging ? 'shadow-lg' : ''}
              `}
              onClick={() => setSelectedLesson(lesson)}
            >
              <div {...provided.dragHandleProps} className="cursor-move text-gray-400">
                <GripVertical className="h-5 w-5" />
              </div>

              <ContentTypeIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{lesson.name}</h3>
                  <Badge variant="outline" className={statusColors[lesson.status as keyof typeof statusColors]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {lesson.status}
                  </Badge>
                  <Badge variant="outline" className={difficultyColors[lesson.difficulty_level]}>
                    {lesson.difficulty_level}
                  </Badge>
                  {lesson.is_required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                </div>
                {lesson.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{lesson.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.estimated_duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>#{lesson.sequence}</span>
                  </div>
                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{lesson.resources.length} resources</span>
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedLesson(lesson)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditLesson(lesson)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicateLesson(lesson)}>
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
                        <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{lesson.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteLesson(lesson)}
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
          )}
        </Draggable>
      );
    }

    // Grid view
    return (
      <Draggable draggableId={lesson.id} index={index} key={lesson.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              group relative transition-all cursor-pointer
              ${snapshot.isDragging ? 'scale-105 shadow-xl' : ''}
            `}
            onClick={() => setSelectedLesson(lesson)}
          >
            <Card className={`h-full ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
              <CardHeader className="pb-3 relative">
                <div
                  {...provided.dragHandleProps}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="flex items-start justify-between">
                  <ContentTypeIcon className="h-8 w-8 text-blue-600" />
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={statusColors[lesson.status as keyof typeof statusColors]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {lesson.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">{lesson.name}</CardTitle>
                  <Badge variant="outline" className={difficultyColors[lesson.difficulty_level]}>
                    {lesson.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {lesson.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{lesson.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium">{lesson.estimated_duration_minutes} min</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Target className="h-4 w-4" />
                      <span>Sequence</span>
                    </div>
                    <span className="font-medium">#{lesson.sequence}</span>
                  </div>

                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <FileText className="h-4 w-4" />
                        <span>Resources</span>
                      </div>
                      <span className="font-medium">{lesson.resources.length}</span>
                    </div>
                  )}

                  {lesson.is_required && (
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Required
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLesson(lesson);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicateLesson(lesson)}>
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
                            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{lesson.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteLesson(lesson)}
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
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  const renderLessonDetail = () => {
    if (!selectedLesson) return null;

    const ContentTypeIcon = contentTypeIcons[selectedLesson.content_type] || FileText;
    const StatusIcon = statusIcons[selectedLesson.status as keyof typeof statusIcons] || AlertCircle;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <ContentTypeIcon className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <CardTitle className="text-xl">{selectedLesson.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={statusColors[selectedLesson.status as keyof typeof statusColors]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {selectedLesson.status}
                  </Badge>
                  <Badge variant="outline" className={difficultyColors[selectedLesson.difficulty_level]}>
                    {selectedLesson.difficulty_level}
                  </Badge>
                  {selectedLesson.is_required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleEditLesson(selectedLesson)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {selectedLesson.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{selectedLesson.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Duration</h4>
              <p className="text-lg font-semibold">{selectedLesson.estimated_duration_minutes} min</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Sequence</h4>
              <p className="text-lg font-semibold">#{selectedLesson.sequence}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Content Type</h4>
              <p className="text-lg font-semibold capitalize">{selectedLesson.content_type}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Resources</h4>
              <p className="text-lg font-semibold">{selectedLesson.resources?.length || 0}</p>
            </div>
          </div>

          {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Learning Objectives</h4>
              <ul className="space-y-2">
                {selectedLesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedLesson.content && (
            <div>
              <h4 className="font-medium mb-3">Content Preview</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 line-clamp-6">
                  {selectedLesson.content}
                </pre>
              </div>
            </div>
          )}

          {selectedLesson.resources && selectedLesson.resources.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Resources</h4>
              <div className="space-y-2">
                {selectedLesson.resources.map((resource, index) => {
                  const TypeIcon = contentTypeIcons[resource.resource_type as keyof typeof contentTypeIcons] || FileText;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <TypeIcon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm">{resource.name}</h5>
                        {resource.description && (
                          <p className="text-xs text-gray-600">{resource.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">{resource.resource_type}</Badge>
                      {resource.is_downloadable && (
                        <Download className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedLesson.tags && selectedLesson.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLesson.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
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
            <h1 className="text-2xl font-bold">Lesson Management</h1>
            <p className="text-gray-600">Section: {section.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateLesson}>
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{lessons.length}</p>
                <p className="text-sm text-gray-600">Total Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{lessons.filter(l => l.status === 'published').length}</p>
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
                  {lessons.reduce((sum, l) => sum + (l.estimated_duration_minutes || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{lessons.filter(l => l.is_required).length}</p>
                <p className="text-sm text-gray-600">Required</p>
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
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
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

              <Select value={filterContentType} onValueChange={setFilterContentType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortDesc className="h-4 w-4 mr-2" />
                    )}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy('sequence')}>
                    Sequence Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('duration')}>
                    Duration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('difficulty')}>
                    Difficulty
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('status')}>
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created_at')}>
                    Created Date
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchQuery || filterDifficulty !== 'all' || filterStatus !== 'all' || filterContentType !== 'all') && (
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
        {/* Lessons List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Lessons ({filteredAndSortedLessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAndSortedLessons.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {lessons.length === 0 ? 'No lessons yet' : 'No lessons match your filters'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {lessons.length === 0 
                      ? 'Create your first lesson to get started'
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                  {lessons.length === 0 && (
                    <Button onClick={handleCreateLesson}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Lesson
                    </Button>
                  )}
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="lessons" type="lesson">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={
                          viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                            : 'space-y-3'
                        }
                      >
                        {filteredAndSortedLessons.map((lesson, index) =>
                          renderLessonCard(lesson, index)
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lesson Detail */}
        <div>
          {selectedLesson ? (
            renderLessonDetail()
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a lesson</h3>
                  <p>Choose a lesson to view its details and content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lesson Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
            </DialogTitle>
          </DialogHeader>
          <LessonEditor
            lesson={editingLesson || undefined}
            section={section}
            onSave={handleSaveLesson}
            onCancel={() => {
              setShowEditor(false);
              setEditingLesson(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}