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
  Eye,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  UserCheck,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCourseDetail } from '../hooks/useCourses';
import { useCurriculaByCourse } from '@/features/curricula/hooks';
import { useProgramContext } from '@/store/programContext';
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
} as const;

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
  expert: 'bg-red-100 text-red-800',
} as const;


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
    isLoading,
    error,
    updateCourse,
    deleteCourse,
    refetch,
  } = useCourseDetail(courseId);

  const { currentProgram } = useProgramContext();

  // Fetch curricula associated with this course
  const { 
    data: curriculaResponse, 
    isLoading: isCurriculaLoading,
    error: curriculaError 
  } = useCurriculaByCourse(courseId);
  
  const curricula = curriculaResponse?.items || [];
  
  // Calculate curriculum stats
  const totalCurricula = curricula.length;
  const totalLevels = curricula.reduce((sum, c) => sum + (c.level_count || 0), 0);
  const totalModules = curricula.reduce((sum, c) => sum + (c.module_count || 0), 0);
  const totalLessons = curricula.reduce((sum, c) => sum + (c.total_lesson_count || 0), 0);

  // Fetch course enrollments (simulated for now - we'll enhance this)
  const courseEnrollments = [
    { id: '1', student_name: 'Alice Johnson', status: 'active', progress: 75, enrolled_date: '2024-01-15', payment_status: 'paid' },
    { id: '2', student_name: 'Bob Smith', status: 'active', progress: 45, enrolled_date: '2024-02-01', payment_status: 'partial' },
    { id: '3', student_name: 'Carol Brown', status: 'completed', progress: 100, enrolled_date: '2023-11-20', payment_status: 'paid' },
    { id: '4', student_name: 'David Wilson', status: 'paused', progress: 30, enrolled_date: '2024-01-08', payment_status: 'overdue' },
    { id: '5', student_name: 'Emma Davis', status: 'active', progress: 60, enrolled_date: '2024-01-22', payment_status: 'paid' }
  ];

  // Calculate analytics data
  const enrollmentStats = {
    total: courseEnrollments.length,
    active: courseEnrollments.filter(e => e.status === 'active').length,
    completed: courseEnrollments.filter(e => e.status === 'completed').length,
    paused: courseEnrollments.filter(e => e.status === 'paused').length,
    averageProgress: courseEnrollments.length > 0 
      ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length)
      : 0,
    revenue: courseEnrollments.length * (course?.payment_amount || 0)
  };

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
                {course.difficulty_level && (
                  <Badge variant="outline" className={difficultyColors[course.difficulty_level as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800'}>
                    {course.difficulty_level}
                  </Badge>
                )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({enrollmentStats.total})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                  <Link href="/admin/curricula">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Curricula
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCurriculaLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading curricula...</p>
                </div>
              ) : curriculaError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Failed to load curricula</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : curricula && curricula.length > 0 ? (
                <div className="space-y-4">
                  {/* Curriculum Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {curricula.map((curriculum) => (
                      <Card key={curriculum.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{curriculum.name}</CardTitle>
                              <Badge variant="outline" className={statusColors[curriculum.status] || 'text-gray-600'}>
                                {curriculum.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link href={`/admin/curricula/${curriculum.id}`}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link href={`/admin/curricula/${curriculum.id}/edit`}>
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                            </div>
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Need to manage curricula in detail? Use the dedicated curricula management tab.
                    </p>
                    <Button asChild>
                      <Link href="/admin/curricula">
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

        <TabsContent value="enrollments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{enrollmentStats.active}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{enrollmentStats.completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{enrollmentStats.paused}</p>
                    <p className="text-sm text-gray-600">Paused</p>
                  </div>
                  <PauseCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{enrollmentStats.averageProgress}%</p>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Course Enrollments
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/admin/students/add?course_id=${courseId}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll Student
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{enrollment.student_name}</p>
                        <p className="text-sm text-gray-600">Enrolled: {enrollment.enrolled_date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{enrollment.progress}%</p>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={enrollment.status === 'active' ? 'default' : 
                                enrollment.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {enrollment.status}
                      </Badge>
                      
                      <Badge 
                        variant={enrollment.payment_status === 'paid' ? 'default' : 'destructive'}
                        className={
                          enrollment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          enrollment.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {enrollment.payment_status}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {courseEnrollments.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments yet</h3>
                  <p className="text-gray-600 mb-4">Start by enrolling students in this course</p>
                  <Button asChild>
                    <Link href={`/admin/students/add?course_id=${courseId}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll First Student
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {enrollmentStats.total > 0 ? Math.round((enrollmentStats.completed / enrollmentStats.total) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {enrollmentStats.completed} of {enrollmentStats.total} students completed
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${enrollmentStats.total > 0 ? (enrollmentStats.completed / enrollmentStats.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Average Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{enrollmentStats.averageProgress}%</p>
                  <p className="text-sm text-gray-600 mt-2">Across all active enrollments</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${enrollmentStats.averageProgress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    ₦{enrollmentStats.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Total course revenue</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {enrollmentStats.total} × ₦{(course?.payment_amount || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{enrollmentStats.active}</span>
                      <span className="text-sm text-gray-600">
                        ({enrollmentStats.total > 0 ? Math.round((enrollmentStats.active / enrollmentStats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{enrollmentStats.completed}</span>
                      <span className="text-sm text-gray-600">
                        ({enrollmentStats.total > 0 ? Math.round((enrollmentStats.completed / enrollmentStats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Paused</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{enrollmentStats.paused}</span>
                      <span className="text-sm text-gray-600">
                        ({enrollmentStats.total > 0 ? Math.round((enrollmentStats.paused / enrollmentStats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Emma Davis completed Module 3</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Bob Smith enrolled in course</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Carol Brown completed the course</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">David Wilson payment overdue</p>
                      <p className="text-xs text-gray-600">5 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600">Avg Days to Complete</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">4.8</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                  <p className="text-sm text-gray-600">Retention Rate</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">3</p>
                  <p className="text-sm text-gray-600">Avg Retakes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Base Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ₦{(course?.payment_amount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Standard course fee</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    ₦{enrollmentStats.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">From {enrollmentStats.total} enrollments</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sessions Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{course?.sessions_per_payment || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Sessions per payment</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Facility-Based Pricing</span>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Pricing
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course?.pricing_ranges?.map((range, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{range.age_group} Age Group</p>
                      <p className="text-sm text-gray-600">Age-specific pricing tier</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₦{range.price_from.toLocaleString()} - ₦{range.price_to.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Price range</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing ranges set</h3>
                    <p className="text-gray-600 mb-4">Configure facility-specific pricing for this course</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Pricing Range
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Paid in Full</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {courseEnrollments.filter(e => e.payment_status === 'paid').length}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({enrollmentStats.total > 0 ? 
                          Math.round((courseEnrollments.filter(e => e.payment_status === 'paid').length / enrollmentStats.total) * 100) 
                          : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Partial Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {courseEnrollments.filter(e => e.payment_status === 'partial').length}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({enrollmentStats.total > 0 ? 
                          Math.round((courseEnrollments.filter(e => e.payment_status === 'partial').length / enrollmentStats.total) * 100) 
                          : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {courseEnrollments.filter(e => e.payment_status === 'overdue').length}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({enrollmentStats.total > 0 ? 
                          Math.round((courseEnrollments.filter(e => e.payment_status === 'overdue').length / enrollmentStats.total) * 100) 
                          : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Collected Revenue</span>
                    <span className="font-medium text-green-600">
                      ₦{(courseEnrollments.filter(e => e.payment_status === 'paid').length * (course?.payment_amount || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Partial Payments</span>
                    <span className="font-medium text-yellow-600">
                      ₦{(courseEnrollments.filter(e => e.payment_status === 'partial').length * (course?.payment_amount || 0) * 0.5).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Outstanding</span>
                    <span className="font-medium text-red-600">
                      ₦{(courseEnrollments.filter(e => e.payment_status === 'overdue').length * (course?.payment_amount || 0)).toLocaleString()}
                    </span>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Expected</span>
                    <span>₦{enrollmentStats.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}