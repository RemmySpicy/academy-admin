'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  Edit,
  Tag,
  Hash,
  FileText,
  Activity,
  ArrowLeft,
  Settings,
  UserCheck,
  Clock,
  Target,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAcademyProgram, useAcademyProgramStatistics } from '../../hooks';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

/**
 * Program View Page
 * 
 * Full-page program details view with enhanced configuration display
 */
// Helper function to safely get statistics values
const getStatValue = (value: number | undefined | null): number => {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};

// Helper function to validate statistics structure
const isValidStatistics = (stats: any): boolean => {
  return stats && 
    typeof stats === 'object' && 
    stats.courses && 
    stats.students && 
    stats.team && 
    stats.facilities && 
    stats.configuration;
};

// Component for displaying statistics row with better UX
const StatisticRow = ({ label, value, variant = 'default' }: { 
  label: string; 
  value: number; 
  variant?: 'default' | 'success' | 'muted' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'muted':
        return 'text-gray-500';
      default:
        return 'font-semibold';
    }
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className={getVariantClasses()}>
        {value}
        {value === 0 && (
          <span className="text-xs text-gray-400 ml-1">(None)</span>
        )}
      </span>
    </div>
  );
};

export function ProgramViewPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const { data: program, isLoading, error } = useAcademyProgram(programId);
  const { 
    data: statistics, 
    isLoading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useAcademyProgramStatistics(programId);



  usePageTitle(
    program ? `${program.name} - Program Details` : 'Program Details',
    program ? `View details and configuration for ${program.name}` : 'Loading program details...'
  );

  if (isLoading) {
    return <ProgramViewSkeleton />;
  }

  if (error || !program) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/academy/programs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </div>
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Program not found</h3>
          <p className="text-gray-600">The program you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/admin/academy/programs/${program.id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/academy/programs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
              <Badge className={cn(statusColors[program.status as keyof typeof statusColors] || statusColors.draft)}>
                {program.status}
              </Badge>
            </div>
            {program.program_code && (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Hash className="h-4 w-4" />
                {program.program_code}
              </p>
            )}
          </div>
        </div>
        
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Program
        </Button>
      </div>

      {/* Program Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Program Name</label>
                  <p className="text-gray-900">{program.name}</p>
                </div>
                
                {program.program_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Program Code</label>
                    <p className="text-gray-900">{program.program_code}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={cn(statusColors[program.status as keyof typeof statusColors] || statusColors.draft)}>
                      {program.status}
                    </Badge>
                  </div>
                </div>
                
                {program.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{program.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">Failed to load statistics</p>
                    <Button onClick={() => refetchStats()} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {statsLoading ? (
                          <Skeleton className="h-8 w-8 mx-auto" />
                        ) : (
                          statistics?.courses?.active ?? 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Active Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {statsLoading ? (
                          <Skeleton className="h-8 w-8 mx-auto" />
                        ) : (
                          statistics?.students?.total ?? 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {statsLoading ? (
                          <Skeleton className="h-8 w-8 mx-auto" />
                        ) : (
                          statistics?.team?.total_members ?? 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Team Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {statsLoading ? (
                          <Skeleton className="h-8 w-8 mx-auto" />
                        ) : (
                          statistics?.facilities?.total ?? 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Facilities</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">
                    {program.created_at ? new Date(program.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">
                    {program.updated_at ? new Date(program.updated_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6">
            {/* Age Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Age Groups
                  <Badge variant="secondary">{program.age_groups?.length || 0}</Badge>
                </CardTitle>
                <CardDescription>
                  Age group configurations for this program
                </CardDescription>
              </CardHeader>
              <CardContent>
                {program.age_groups?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {program.age_groups.map((ageGroup: any) => (
                      <div key={ageGroup.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{ageGroup.name}</div>
                        <div className="text-sm text-gray-600">
                          Ages {ageGroup.from_age} - {ageGroup.to_age === 99 ? '99+' : ageGroup.to_age}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No age groups configured</p>
                )}
              </CardContent>
            </Card>

            {/* Difficulty Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Difficulty Levels
                  <Badge variant="secondary">{program.difficulty_levels?.length || 0}</Badge>
                </CardTitle>
                <CardDescription>
                  Difficulty level definitions for this program
                </CardDescription>
              </CardHeader>
              <CardContent>
                {program.difficulty_levels?.length ? (
                  <div className="space-y-2">
                    {program.difficulty_levels
                      .sort((a: any, b: any) => a.weight - b.weight)
                      .map((level: any) => (
                        <div key={level.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="font-medium">{level.name}</div>
                          <Badge variant="outline">Weight: {level.weight}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No difficulty levels configured</p>
                )}
              </CardContent>
            </Card>

            {/* Session Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session Types
                  <Badge variant="secondary">{program.session_types?.length || 0}</Badge>
                </CardTitle>
                <CardDescription>
                  Session type configurations for this program
                </CardDescription>
              </CardHeader>
              <CardContent>
                {program.session_types?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {program.session_types.map((sessionType: any) => (
                      <div key={sessionType.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{sessionType.name}</div>
                          <Badge variant="outline">Max: {sessionType.capacity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No session types configured</p>
                )}
              </CardContent>
            </Card>

            {/* Default Session Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Default Session Duration
                </CardTitle>
                <CardDescription>
                  Default duration for sessions in this program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {program.default_session_duration || 60} minutes
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statsError ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Failed to load program statistics. Please try again.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchStats()}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : isValidStatistics(statistics) ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Courses Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <StatisticRow 
                      label="Total Courses" 
                      value={getStatValue(statistics.courses?.total)} 
                    />
                    <StatisticRow 
                      label="Active Courses" 
                      value={getStatValue(statistics.courses?.active)} 
                      variant="success"
                    />
                    <StatisticRow 
                      label="Inactive Courses" 
                      value={getStatValue(statistics.courses?.inactive)} 
                      variant="muted"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Students Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Students Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <StatisticRow 
                      label="Total Students" 
                      value={getStatValue(statistics.students?.total)} 
                    />
                    <StatisticRow 
                      label="Active Students" 
                      value={getStatValue(statistics.students?.active)} 
                      variant="success"
                    />
                    <StatisticRow 
                      label="Inactive Students" 
                      value={getStatValue(statistics.students?.inactive)} 
                      variant="muted"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Team & Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Team & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <StatisticRow 
                      label="Team Members" 
                      value={getStatValue(statistics.team?.total_members)} 
                    />
                    <StatisticRow 
                      label="Facilities" 
                      value={getStatValue(statistics.facilities?.total)} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <StatisticRow 
                      label="Age Groups" 
                      value={getStatValue(statistics.configuration?.age_groups)} 
                    />
                    <StatisticRow 
                      label="Difficulty Levels" 
                      value={getStatValue(statistics.configuration?.difficulty_levels)} 
                    />
                    <StatisticRow 
                      label="Session Types" 
                      value={getStatValue(statistics.configuration?.session_types)} 
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Default Duration</span>
                      <span className="font-semibold">
                        {getStatValue(statistics.configuration?.default_duration)} min
                        {getStatValue(statistics.configuration?.default_duration) === 0 && (
                          <span className="text-xs text-gray-400 ml-1">(Not set)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Statistics Available</h3>
              <p className="text-gray-600 mb-4">
                {statistics ? 
                  'The statistics data structure is incomplete or invalid.' : 
                  'No statistics data found for this program.'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => refetchStats()}
                className="mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Statistics
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
            <p className="text-gray-600">Team member assignments and management will be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Loading skeleton for program view page
 */
function ProgramViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}