/**
 * ContentCard component for displaying content items (lessons, assessments, activities)
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle, 
  Activity,
  Users,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Lesson, Assessment, ContentType, AssessmentType, CurriculumStatus, DifficultyLevel } from '@/lib/api/types';

// Union type for all content items
type ContentItem = Lesson | Assessment;

interface ContentCardProps {
  content: ContentItem;
  contentType: 'lesson' | 'assessment';
  onView?: (content: ContentItem) => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  onDuplicate?: (content: ContentItem) => void;
  className?: string;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
};

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-orange-100 text-orange-800',
  EXPERT: 'bg-red-100 text-red-800',
};

const contentTypeColors = {
  TEXT: 'bg-blue-100 text-blue-800',
  VIDEO: 'bg-purple-100 text-purple-800',
  INTERACTIVE: 'bg-green-100 text-green-800',
  DOCUMENT: 'bg-gray-100 text-gray-800',
};

const assessmentTypeColors = {
  QUIZ: 'bg-blue-100 text-blue-800',
  ASSIGNMENT: 'bg-purple-100 text-purple-800',
  PROJECT: 'bg-green-100 text-green-800',
  PRACTICAL: 'bg-orange-100 text-orange-800',
  PRESENTATION: 'bg-red-100 text-red-800',
};

const getContentTypeIcon = (contentType: ContentType | AssessmentType) => {
  switch (contentType) {
    case 'TEXT':
      return <BookOpen className="h-4 w-4" />;
    case 'VIDEO':
      return <Activity className="h-4 w-4" />;
    case 'INTERACTIVE':
      return <Target className="h-4 w-4" />;
    case 'QUIZ':
      return <CheckCircle className="h-4 w-4" />;
    case 'ASSIGNMENT':
    case 'PROJECT':
      return <Target className="h-4 w-4" />;
    case 'PRACTICAL':
      return <Settings className="h-4 w-4" />;
    case 'PRESENTATION':
      return <Users className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

export function ContentCard({
  content,
  contentType,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  className,
}: ContentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(content);
  };

  const formatDuration = () => {
    if (contentType === 'lesson') {
      const lesson = content as Lesson;
      return lesson.duration_minutes ? `${lesson.duration_minutes} min` : 'Duration not specified';
    } else {
      const assessment = content as Assessment;
      return assessment.duration_minutes ? `${assessment.duration_minutes} min` : 'Duration not specified';
    }
  };

  const getContentPath = () => {
    if (contentType === 'lesson') {
      const lesson = content as Lesson;
      return lesson.section?.module?.curriculum?.course?.name || 'Unknown Course';
    } else {
      const assessment = content as Assessment;
      return assessment.lesson?.section?.module?.curriculum?.course?.name || 'Unknown Course';
    }
  };

  const getContentHierarchy = () => {
    if (contentType === 'lesson') {
      const lesson = content as Lesson;
      return [
        lesson.section?.module?.curriculum?.name,
        lesson.section?.module?.name,
        lesson.section?.name,
      ].filter(Boolean).join(' → ');
    } else {
      const assessment = content as Assessment;
      return [
        assessment.lesson?.section?.module?.curriculum?.name,
        assessment.lesson?.section?.module?.name,
        assessment.lesson?.section?.name,
        assessment.lesson?.name,
      ].filter(Boolean).join(' → ');
    }
  };

  const getTypeColor = () => {
    if (contentType === 'lesson') {
      const lesson = content as Lesson;
      return contentTypeColors[lesson.content_type] || 'bg-gray-100 text-gray-800';
    } else {
      const assessment = content as Assessment;
      return assessmentTypeColors[assessment.assessment_type] || 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = () => {
    if (contentType === 'lesson') {
      const lesson = content as Lesson;
      return lesson.content_type;
    } else {
      const assessment = content as Assessment;
      return assessment.assessment_type;
    }
  };

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-medium line-clamp-1">
              {content.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {content.code} • {getContentPath()}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(content)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(content)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(content)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Content Type and Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn("text-xs", getTypeColor())}
            >
              {getContentTypeIcon(getTypeName())}
              <span className="ml-1">{getTypeName()}</span>
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", statusColors[content.status])}
            >
              {content.status}
            </Badge>
            {content.difficulty_level && (
              <Badge
                variant="outline"
                className={cn("text-xs", difficultyColors[content.difficulty_level])}
              >
                {content.difficulty_level}
              </Badge>
            )}
          </div>

          {/* Content Hierarchy */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Path:</span> {getContentHierarchy()}
          </div>

          {/* Description */}
          {content.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {content.description}
            </p>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Seq: {content.sequence}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDuration()}</span>
            </div>
            {contentType === 'lesson' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as Lesson).assessment_count || 0} assessments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as Lesson).is_interactive ? 'Interactive' : 'Static'}
                  </span>
                </div>
              </>
            )}
            {contentType === 'assessment' && (
              <>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as Assessment).max_score || 0} points
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as Assessment).is_required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Learning Objectives */}
          {content.objectives && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Learning Objectives</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.objectives}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView?.(content)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(content)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {contentType} "{content.name}" and all its related data.
              This action cannot be undone and will affect all curricula where this content is used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}