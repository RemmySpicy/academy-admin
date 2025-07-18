/**
 * AssessmentDetailView component for viewing assessment details and managing criteria
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Clock, 
  Target, 
  Award, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Assessment, AssessmentCriteria } from '@/lib/api/types';
import { AssessmentForm } from './AssessmentForm';
import { AssessmentCriteriaManager } from './AssessmentCriteriaManager';

interface AssessmentDetailViewProps {
  assessment: Assessment;
  onUpdateAssessment: (data: any) => void;
  onAddCriteria: (data: any) => void;
  onUpdateCriteria: (id: string, data: any) => void;
  onDeleteCriteria: (id: string) => void;
  onReorderCriteria: (reorderData: Array<{ id: string; sequence: number }>) => void;
  isLoading?: boolean;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
};

const typeColors = {
  QUIZ: 'bg-blue-100 text-blue-800',
  ASSIGNMENT: 'bg-purple-100 text-purple-800',
  PROJECT: 'bg-green-100 text-green-800',
  PRACTICAL: 'bg-orange-100 text-orange-800',
  PRESENTATION: 'bg-red-100 text-red-800',
};

export function AssessmentDetailView({
  assessment,
  onUpdateAssessment,
  onAddCriteria,
  onUpdateCriteria,
  onDeleteCriteria,
  onReorderCriteria,
  isLoading = false,
}: AssessmentDetailViewProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const formatDuration = () => {
    if (!assessment.duration_minutes) return 'No time limit';
    const hours = Math.floor(assessment.duration_minutes / 60);
    const minutes = assessment.duration_minutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPassingPercentage = () => {
    if (!assessment.passing_score || !assessment.max_score) return 0;
    return Math.round((assessment.passing_score / assessment.max_score) * 100);
  };

  const getTypeIcon = () => {
    switch (assessment.assessment_type) {
      case 'QUIZ':
        return <CheckCircle className="h-4 w-4" />;
      case 'ASSIGNMENT':
        return <FileText className="h-4 w-4" />;
      case 'PROJECT':
        return <Target className="h-4 w-4" />;
      case 'PRACTICAL':
        return <Settings className="h-4 w-4" />;
      case 'PRESENTATION':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const criteria = assessment.criteria || [];
  const totalCriteriaScore = criteria.reduce((sum, c) => sum + c.max_score, 0);
  const averageScore = assessment.average_score || 0;
  const passRate = assessment.pass_rate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{assessment.lesson?.name || 'Unknown Lesson'}</span>
            <span>•</span>
            <span>{assessment.lesson?.section?.module?.curriculum?.name || 'Unknown Curriculum'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Assessment</DialogTitle>
              </DialogHeader>
              <AssessmentForm
                assessment={assessment}
                onSubmit={(data) => {
                  onUpdateAssessment(data);
                  setShowEditDialog(false);
                }}
                onCancel={() => setShowEditDialog(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status and Type Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="secondary"
          className={`${typeColors[assessment.assessment_type]} text-xs`}
        >
          {getTypeIcon()}
          <span className="ml-1">{assessment.assessment_type}</span>
        </Badge>
        <Badge
          variant="outline"
          className={`${statusColors[assessment.status]} text-xs`}
        >
          {assessment.status}
        </Badge>
        {assessment.is_required && (
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        )}
        {assessment.is_proctored && (
          <Badge variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Proctored
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{formatDuration()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{assessment.max_score || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passing Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">
                {assessment.passing_score || 0} ({getPassingPercentage()}%)
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{assessment.weight || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="criteria">Criteria</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {assessment.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sequence</span>
                  <span className="text-sm text-muted-foreground">{assessment.sequence}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Required</span>
                  <span className="text-sm text-muted-foreground">
                    {assessment.is_required ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Proctored</span>
                  <span className="text-sm text-muted-foreground">
                    {assessment.is_proctored ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {assessment.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {assessment.instructions}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="criteria" className="space-y-6">
          <AssessmentCriteriaManager
            assessmentId={assessment.id}
            criteria={criteria}
            onAddCriteria={onAddCriteria}
            onUpdateCriteria={onUpdateCriteria}
            onDeleteCriteria={onDeleteCriteria}
            onReorderCriteria={onReorderCriteria}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-lg font-bold">{averageScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pass Rate</span>
                  <span className="text-lg font-bold">{passRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Criteria Count</span>
                  <span className="text-lg font-bold">{criteria.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Criteria Score</span>
                  <span className="text-lg font-bold">{totalCriteriaScore}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {assessment.status === 'PUBLISHED' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    {assessment.status === 'PUBLISHED' ? 'Published and active' : 'Not yet published'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {criteria.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {criteria.length > 0 ? 'Has evaluation criteria' : 'No evaluation criteria'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {assessment.max_score && assessment.passing_score ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    {assessment.max_score && assessment.passing_score 
                      ? 'Scoring configured' 
                      : 'Scoring needs configuration'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criteria.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Consider adding evaluation criteria to provide clear grading guidelines</span>
                  </div>
                )}
                {!assessment.max_score && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Set a maximum score to enable proper grading</span>
                  </div>
                )}
                {assessment.status === 'DRAFT' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Publish this assessment to make it available to students</span>
                  </div>
                )}
                {criteria.length > 0 && assessment.max_score && assessment.status === 'PUBLISHED' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Assessment is properly configured and ready for use</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}