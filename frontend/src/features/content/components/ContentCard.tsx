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
  Settings,
  Link,
  AlertTriangle,
  GitBranch,
  ExternalLink
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
import { CurriculumStatus, DifficultyLevel } from '@/lib/api/types';
import { 
  ContentItem as UnifiedContentItem, 
  Lesson, 
  Assessment, 
  ContentUsageInfo 
} from '../api/contentApiService';

// Union type for all content items (backward compatibility + new unified type)
type ContentItem = Lesson | Assessment | UnifiedContentItem;

interface ContentCardProps {
  content: ContentItem;
  contentType?: 'lesson' | 'assessment'; // Optional - can be inferred from unified content
  onView?: (content: ContentItem) => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  onDuplicate?: (content: ContentItem) => void;
  onViewUsage?: (content: ContentItem) => void;
  onManageReferences?: (content: ContentItem) => void;
  onNavigateToCurriculum?: (curriculumId: string) => void;
  showUsageInfo?: boolean; // Whether to show the new usage information
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
  onViewUsage,
  onManageReferences,
  onNavigateToCurriculum,
  showUsageInfo = false,
  className,
}: ContentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(content);
  };

  // Helper functions for unified content handling
  const inferContentType = (): 'lesson' | 'assessment' => {
    if (contentType) return contentType;
    
    // Check if this is a unified content item
    if ('usage_info' in content) {
      // For unified content, we need to check the actual type
      return (content as any).content_type === 'lesson' ? 'lesson' : 'assessment';
    }
    
    // Legacy detection
    return 'assessment_type' in content ? 'assessment' : 'lesson';
  };

  const getUsageInfo = (): ContentUsageInfo | undefined => {
    return (content as UnifiedContentItem).usage_info;
  };

  const hasVersionInfo = (): boolean => {
    return 'version_number' in content || 'has_newer_version' in content;
  };

  const isLocked = (): boolean => {
    return (content as UnifiedContentItem).is_locked || false;
  };

  const actualContentType = inferContentType();
  const usageInfo = getUsageInfo();

  const formatDuration = () => {
    return content.duration_minutes ? `${content.duration_minutes} min` : 'Duration not specified';
  };

  const getContentPath = () => {
    // For unified content, we'll get this from usage info
    if (usageInfo && usageInfo.curricula.length > 0) {
      return usageInfo.curricula[0].course_name;
    }
    
    // Legacy fallback
    if (actualContentType === 'lesson') {
      const lesson = content as Lesson;
      return lesson.section?.module?.curriculum?.course?.name || 'Unknown Course';
    } else {
      const assessment = content as Assessment;
      return assessment.lesson?.section?.module?.curriculum?.course?.name || 'Unknown Course';
    }
  };

  const getContentHierarchy = () => {
    // For unified content with usage info, show first curriculum path
    if (usageInfo && usageInfo.curricula.length > 0) {
      const firstUsage = usageInfo.curricula[0];
      return `${firstUsage.course_name} → ${firstUsage.name}`;
    }
    
    // Legacy fallback
    if (actualContentType === 'lesson') {
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
    if (actualContentType === 'lesson') {
      const lesson = content as any;
      return contentTypeColors[lesson.content_type || lesson.lesson_content_type] || 'bg-gray-100 text-gray-800';
    } else {
      const assessment = content as any;
      return assessmentTypeColors[assessment.assessment_type] || 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = () => {
    if (actualContentType === 'lesson') {
      const lesson = content as any;
      return lesson.content_type || lesson.lesson_content_type || 'TEXT';
    } else {
      const assessment = content as any;
      return assessment.assessment_type || 'QUIZ';
    }
  };

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-medium line-clamp-1 flex items-center gap-2">
              {content.name}
              {isLocked() && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  Locked
                </Badge>
              )}
              {hasVersionInfo() && (content as UnifiedContentItem).has_newer_version && (
                <Badge variant="outline" className="text-xs px-1 py-0 text-orange-600 border-orange-600">
                  Update Available
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{content.code} • {getContentPath()}</span>
              {hasVersionInfo() && (content as UnifiedContentItem).version_number && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  v{(content as UnifiedContentItem).version_number}
                </Badge>
              )}
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
                <DropdownMenuItem 
                  onClick={() => onEdit(content)}
                  disabled={isLocked()}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isLocked() ? 'Locked for Editing' : 'Edit'}
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(content)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              
              {/* New usage-related actions */}
              {showUsageInfo && onViewUsage && (
                <DropdownMenuItem onClick={() => onViewUsage(content)}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  View Usage
                </DropdownMenuItem>
              )}
              {showUsageInfo && onManageReferences && (
                <DropdownMenuItem onClick={() => onManageReferences(content)}>
                  <Link className="mr-2 h-4 w-4" />
                  Manage References
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
            {actualContentType === 'lesson' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as any).assessment_count || 0} assessments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as any).is_interactive ? 'Interactive' : 'Static'}
                  </span>
                </div>
              </>
            )}
            {actualContentType === 'assessment' && (
              <>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(content as any).max_score || 0} points
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {content.is_required ? 'Required' : 'Optional'}
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

          {/* Usage Information */}
          {showUsageInfo && usageInfo && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Used in {usageInfo.usage_count} curricul{usageInfo.usage_count === 1 ? 'um' : 'a'}
                  </span>
                  {usageInfo.is_orphaned && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Orphaned
                    </Badge>
                  )}
                </div>
                {onViewUsage && (
                  <Button variant="ghost" size="sm" onClick={() => onViewUsage(content)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                )}
              </div>
              
              {usageInfo.curricula.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Recent usage:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {usageInfo.curricula.slice(0, 3).map((curriculum) => (
                      <Button
                        key={curriculum.id}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => onNavigateToCurriculum?.(curriculum.id)}
                      >
                        {curriculum.name}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                    {usageInfo.curricula.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{usageInfo.curricula.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
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
              disabled={isLocked()}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isLocked() ? 'Locked' : 'Edit'}
            </Button>
            {showUsageInfo && onViewUsage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewUsage(content)}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Usage
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {actualContentType} "{content.name}" and all its related data.
              This action cannot be undone.
              {usageInfo && usageInfo.usage_count > 0 && (
                <>
                  <br /><br />
                  <strong>⚠️ Impact Warning:</strong> This content is currently used in {usageInfo.usage_count} curricul{usageInfo.usage_count === 1 ? 'um' : 'a'}:
                  <ul className="mt-2 list-disc list-inside">
                    {usageInfo.curricula.slice(0, 5).map((curriculum) => (
                      <li key={curriculum.id} className="text-sm">
                        {curriculum.name} ({curriculum.course_name})
                      </li>
                    ))}
                    {usageInfo.curricula.length > 5 && (
                      <li className="text-sm">...and {usageInfo.curricula.length - 5} more</li>
                    )}
                  </ul>
                  Deleting this content will remove it from all these curricula.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {usageInfo && usageInfo.usage_count > 0 ? 'Delete Anyway' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}