/**
 * CourseCard component for displaying course information in catalog views
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Award, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  User
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
import { Progress } from '@/components/ui/progress';
import type { Course } from '../api/courseApiService';

interface CourseCardProps {
  course: Course;
  onView?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onDuplicate?: (course: Course) => void;
  onAssignInstructor?: (course: Course) => void;
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  className?: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

const statusIcons = {
  draft: AlertCircle,
  published: CheckCircle,
  archived: AlertCircle,
  under_review: Clock,
};

export function CourseCard({
  course,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onAssignInstructor,
  viewMode = 'grid',
  showActions = true,
  className,
}: CourseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const StatusIcon = statusIcons[course.status];

  const handleAction = (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    switch (action) {
      case 'view':
        onView?.(course);
        break;
      case 'edit':
        onEdit?.(course);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'duplicate':
        onDuplicate?.(course);
        break;
      case 'assign-instructor':
        onAssignInstructor?.(course);
        break;
    }
  };

  const handleDelete = () => {
    onDelete?.(course);
    setShowDeleteDialog(false);
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };


  if (viewMode === 'list') {
    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`} onClick={() => onView?.(course)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Course Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {course.image_url ? (
                  <img 
                    src={course.image_url} 
                    alt={course.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{course.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${statusColors[course.status]} text-xs`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {course.status}
                    </Badge>
                    <Badge variant="outline" className={`${difficultyColors[course.difficulty_level]} text-xs`}>
                      {course.difficulty_level}
                    </Badge>
                    {course.is_featured && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description || 'No description available'}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{course.duration_weeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.total_curricula || 0} curricula</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.total_students || 0} students</span>
                  </div>
                  {course.instructor && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{course.instructor.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatPrice(course.price, course.currency)}</span>
                  </div>
                </div>

                {/* Completion Rate */}
                {course.completion_rate !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span className="font-medium">{course.completion_rate}%</span>
                    </div>
                    <Progress 
                      value={course.completion_rate} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleAction('view', e)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleAction('edit', e)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleAction('duplicate', e)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction('assign-instructor', e)}>
                      <User className="mr-2 h-4 w-4" />
                      Assign Instructor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => handleAction('delete', e)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${className}`} onClick={() => onView?.(course)}>
        {/* Course Image */}
        <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          {course.image_url ? (
            <img 
              src={course.image_url} 
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className={`${statusColors[course.status]} text-xs`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {course.status}
            </Badge>
          </div>

          {/* Featured Badge */}
          {course.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 text-sm font-semibold">
              {formatPrice(course.price, course.currency)}
            </Badge>
          </div>

          {/* Actions Overlay */}
          {showActions && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => handleAction('view', e)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-1">{course.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">{course.code}</CardDescription>
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleAction('duplicate', e)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction('assign-instructor', e)}>
                    <User className="mr-2 h-4 w-4" />
                    Assign Instructor
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => handleAction('delete', e)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {course.description || 'No description available'}
          </p>

          {/* Difficulty Level */}
          <div className="mb-4">
            <Badge variant="outline" className={`${difficultyColors[course.difficulty_level]} text-xs`}>
              <Target className="h-3 w-3 mr-1" />
              {course.difficulty_level}
            </Badge>
          </div>

          {/* Course Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Duration</span>
              </div>
              <span className="font-medium">{course.duration_weeks} weeks</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span>Curricula</span>
              </div>
              <span className="font-medium">{course.total_curricula || 0}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <Users className="h-4 w-4" />
                <span>Students</span>
              </div>
              <span className="font-medium">{course.total_students || 0}</span>
            </div>

            {course.instructor && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Instructor</span>
                </div>
                <span className="font-medium truncate ml-2">{course.instructor.name}</span>
              </div>
            )}

            {/* Rating */}
            {course.average_rating && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Star className="h-4 w-4" />
                  <span>Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            )}

            {/* Completion Rate */}
            {course.completion_rate !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-medium">{course.completion_rate}%</span>
                </div>
                <Progress 
                  value={course.completion_rate} 
                  className="h-2"
                />
              </div>
            )}

            {/* Certification Badge */}
            {course.is_certification_course && (
              <div className="pt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Certification Course
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.name}"? This action cannot be undone and will remove all associated curricula, lessons, and student progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}