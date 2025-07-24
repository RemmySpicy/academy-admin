/**
 * Course Detail Component - Comprehensive course view with tree navigation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Settings,
  Users,
  BookOpen,
  ChevronRight,
  Plus,
  Award,
  Target,
  Star,
  BarChart3,
  CheckCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCourseDetail } from '../hooks/useCourses';
import type { Course, CourseTree, Curriculum, Level, Module, Section, Lesson } from '../api/courseApiService';

interface CourseDetailProps {
  courseId: string;
  onBack?: () => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onDuplicate?: (course: Course) => void;
  onCreateCurriculum?: (courseId: string) => void;
  onEditCurriculum?: (curriculum: Curriculum) => void;
  onCreateLesson?: (sectionId: string) => void;
  onEditLesson?: (lesson: Lesson) => void;
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


export function CourseDetail({
  courseId,
  onBack,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateCurriculum,
  onEditCurriculum,
  onCreateLesson,
  onEditLesson,
  className,
}: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    course,
    courseTree,
    curricula,
    isLoading,
    error,
    updateCourse,
    deleteCourse,
    refetch,
    totalCurricula,
    totalLevels,
    totalModules,
    totalLessons,
  } = useCourseDetail(courseId);

  const handleDuplicate = async () => {
    if (!course) return;
    try {
      onDuplicate?.(course);
      toast.success('Course duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate course');
    }
  };

  const handleDelete = async () => {
    if (!course) return;
    try {
      await deleteCourse.mutateAsync(course.id);
      onDelete?.(course);
      toast.success('Course deleted successfully');
    } catch (error) {
      toast.error('Failed to delete course');
    }
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
              <p className="text-red-600 mb-4">Failed to load course details</p>
              <Button onClick={() => refetch()} variant="outline">
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button onClick={onBack} className="hover:text-blue-600 cursor-pointer">
          Courses
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{course.name}</h1>
                <Badge variant="outline" className={statusColors[course.status]}>
                  {course.status}
                </Badge>
                <Badge variant="outline" className={difficultyColors[course.difficulty_level]}>
                  {course.difficulty_level}
                </Badge>
                {course.is_featured && (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {course.is_certification_course && (
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    Certification
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{course.code}</p>
              {course.description && (
                <p className="text-gray-700 max-w-2xl">{course.description}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Button variant="outline" onClick={() => onEdit?.(course)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
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
                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{course.name}"? This action cannot be undone
                      and will remove all associated curricula, lessons, and student progress.
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalCurricula}</p>
              <p className="text-sm text-gray-600">Curricula</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{totalLevels}</p>
              <p className="text-sm text-gray-600">Levels</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{totalModules}</p>
              <p className="text-sm text-gray-600">Modules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{totalLessons}</p>
              <p className="text-sm text-gray-600">Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{course.total_students || 0}</p>
              <p className="text-sm text-gray-600">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{course.completion_rate || 0}%</p>
              <p className="text-sm text-gray-600">Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{course.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <p className="font-medium">
                      {course.pricing_matrix && course.pricing_matrix.length > 0 
                        ? `${course.pricing_matrix.length} pricing options`
                        : 'Free'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Min Students:</span>
                    <p className="font-medium">{course.min_students || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Students:</span>
                    <p className="font-medium">{course.max_students || 'Unlimited'}</p>
                  </div>
                </div>

                {course.instructor && (
                  <div>
                    <span className="text-gray-600 text-sm">Instructor:</span>
                    <p className="font-medium">{course.instructor.name}</p>
                    <p className="text-sm text-gray-600">{course.instructor.email}</p>
                  </div>
                )}

                {course.tags && course.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            {course.objectives && course.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.objectives.map((objective, index) => (
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
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Course Structure
                <Button asChild>
                  <Link href="/admin/courses?tab=curricula">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Curricula
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {curricula && curricula.length > 0 ? (
                <div className="space-y-4">
                  {/* Curriculum Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {curricula.map((curriculum) => (
                      <Card key={curriculum.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{curriculum.name}</CardTitle>
                              <Badge variant="outline" className={statusColors[curriculum.status]}>
                                {curriculum.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/admin/curricula/${curriculum.id}`}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-lg font-semibold text-blue-600">{curriculum.level_count || 0}</p>
                              <p className="text-xs text-gray-600">Levels</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-green-600">{curriculum.module_count || 0}</p>
                              <p className="text-xs text-gray-600">Modules</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-purple-600">{curriculum.total_lesson_count || 0}</p>
                              <p className="text-xs text-gray-600">Lessons</p>
                            </div>
                          </div>
                          {curriculum.description && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                              {curriculum.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/admin/curricula/${curriculum.id}/edit`}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/admin/curricula/${curriculum.id}/builder`}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Builder
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Need to manage curricula in detail? Use the dedicated curricula management page.
                    </p>
                    <Button asChild>
                      <Link href="/admin/courses?tab=curricula">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Open Curricula Management
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No curricula yet</h3>
                  <p className="text-gray-600 mb-4">Start building your course by adding curricula</p>
                  <Button asChild>
                    <Link href={`/admin/curricula/new?course_id=${course.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Curriculum
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Student management coming soon</h3>
                <p className="text-gray-600">View enrolled students, track progress, and manage enrollments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics coming soon</h3>
                <p className="text-gray-600">Track completion rates, engagement metrics, and performance insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}