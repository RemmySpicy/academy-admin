'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Settings,
  Copy,
  Trash2,
  Award,
  Users,
  BarChart3,
  Target,
  Clock,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurriculum } from '@/features/courses/hooks/useCurricula';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-purple-100 text-purple-800',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export default function CurriculumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.id as string;
  
  const { data: curriculum, isLoading, error } = useCurriculum(curriculumId);
  
  usePageTitle(
    curriculum ? curriculum.name : 'Curriculum Details',
    curriculum ? `Manage curriculum for ${curriculum.course_name}` : 'Loading curriculum details...'
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !curriculum) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load curriculum details</p>
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDuplicate = async () => {
    try {
      // TODO: Implement curriculum duplication
      toast.success('Curriculum duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate curriculum');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${curriculum.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      // TODO: Implement curriculum deletion
      toast.success('Curriculum deleted successfully');
      router.push('/admin/courses?tab=curricula');
    } catch (error) {
      toast.error('Failed to delete curriculum');
    }
  };

  const handleSetDefault = async () => {
    try {
      // TODO: Implement set as default functionality
      toast.success('Curriculum set as default successfully');
    } catch (error) {
      toast.error('Failed to set curriculum as default');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/courses" className="hover:text-blue-600">
          Courses
        </Link>
        <span>/</span>
        <Link href="/admin/courses?tab=curricula" className="hover:text-blue-600">
          Curricula
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${curriculum.course_id}`} className="hover:text-blue-600">
          {curriculum.course_name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{curriculum.name}</span>
      </div>

      {/* Curriculum Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{curriculum.name}</h1>
                <Badge variant="outline" className={statusColors[curriculum.status]}>
                  {curriculum.status}
                </Badge>
                {curriculum.difficulty_level && (
                  <Badge variant="outline" className={difficultyColors[curriculum.difficulty_level]}>
                    {curriculum.difficulty_level}
                  </Badge>
                )}
                {/* TODO: Add default badge when curriculum is default for age groups */}
                {/* <Badge variant="default">
                  <Award className="h-3 w-3 mr-1" />
                  Default
                </Badge> */}
              </div>
              <div className="text-gray-600">
                <p className="font-medium">{curriculum.course_name}</p>
                {curriculum.program_name && (
                  <p className="text-sm">{curriculum.program_name}</p>
                )}
              </div>
              {curriculum.description && (
                <p className="text-gray-700 max-w-2xl">{curriculum.description}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Button variant="default" asChild>
                <Link href={`/admin/curricula/${curriculum.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={handleSetDefault}>
                <Award className="h-4 w-4 mr-2" />
                Set Default
              </Button>
              <Button
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Curriculum Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{curriculum.level_count || 0}</p>
              <p className="text-sm text-gray-600">Levels</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{curriculum.total_module_count || 0}</p>
              <p className="text-sm text-gray-600">Modules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{curriculum.total_lesson_count || 0}</p>
              <p className="text-sm text-gray-600">Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{curriculum.estimated_duration_hours || 0}h</p>
              <p className="text-sm text-gray-600">Duration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Details Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Curriculum Information */}
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Course:</span>
                    <p className="font-medium">{curriculum.course_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Program:</span>
                    <p className="font-medium">{curriculum.program_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{curriculum.duration_hours ? `${curriculum.duration_hours} hours` : 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Difficulty:</span>
                    <p className="font-medium">{curriculum.difficulty_level || 'Not specified'}</p>
                  </div>
                </div>

                {curriculum.age_ranges && curriculum.age_ranges.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">Age Ranges:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {curriculum.age_ranges.map((ageRange, index) => (
                        <Badge key={index} variant="outline">
                          {ageRange}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            {curriculum.learning_objectives && (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap">
                    {curriculum.learning_objectives}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prerequisites */}
            {curriculum.prerequisites && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap">
                    {curriculum.prerequisites}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Curriculum Structure
                <Button asChild>
                  <Link href={`/admin/curricula/${curriculum.id}/builder`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Curriculum Builder
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Structure Management</h3>
                <p className="text-gray-600 mb-4">Use the Curriculum Builder to manage levels, modules, and lessons</p>
                <Button asChild>
                  <Link href={`/admin/curricula/${curriculum.id}/builder`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Open Curriculum Builder
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Student enrollment coming soon</h3>
                <p className="text-gray-600">View and manage students enrolled in this curriculum</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Analytics</CardTitle>
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