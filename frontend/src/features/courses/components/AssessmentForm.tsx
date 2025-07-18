/**
 * AssessmentForm component for creating and editing assessments
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Assessment, AssessmentCreate, AssessmentUpdate, AssessmentType, CurriculumStatus } from '@/lib/api/types';
import { useLessons } from '../hooks/useContent';

const assessmentSchema = z.object({
  lesson_id: z.string().min(1, 'Lesson is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  assessment_type: z.enum(['QUIZ', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'PRESENTATION']),
  instructions: z.string().optional(),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  max_score: z.number().min(1, 'Max score must be at least 1').optional(),
  passing_score: z.number().min(0, 'Passing score cannot be negative').optional(),
  weight: z.number().min(0, 'Weight cannot be negative').max(100, 'Weight cannot exceed 100').optional(),
  is_required: z.boolean().default(true),
  is_proctored: z.boolean().default(false),
  sequence: z.number().min(0, 'Sequence cannot be negative').default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  assessment?: Assessment;
  onSubmit: (data: AssessmentCreate | AssessmentUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  preSelectedLessonId?: string;
}

export function AssessmentForm({
  assessment,
  onSubmit,
  onCancel,
  isLoading = false,
  title,
  preSelectedLessonId,
}: AssessmentFormProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons();

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      lesson_id: assessment?.lesson_id || preSelectedLessonId || '',
      name: assessment?.name || '',
      description: assessment?.description || '',
      assessment_type: assessment?.assessment_type || 'QUIZ',
      instructions: assessment?.instructions || '',
      duration_minutes: assessment?.duration_minutes,
      max_score: assessment?.max_score,
      passing_score: assessment?.passing_score,
      weight: assessment?.weight,
      is_required: assessment?.is_required ?? true,
      is_proctored: assessment?.is_proctored ?? false,
      sequence: assessment?.sequence || 0,
      status: assessment?.status || 'DRAFT',
    },
  });

  const handleSubmit = (data: AssessmentFormData) => {
    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    onSubmit(cleanData as AssessmentCreate | AssessmentUpdate);
  };

  const lessons = lessonsData?.items || [];

  const getAssessmentTypeDescription = (type: AssessmentType) => {
    switch (type) {
      case 'QUIZ':
        return 'Multiple choice or short answer questions';
      case 'ASSIGNMENT':
        return 'Written assignments and homework';
      case 'PROJECT':
        return 'Long-term projects and portfolios';
      case 'PRACTICAL':
        return 'Hands-on practical demonstrations';
      case 'PRESENTATION':
        return 'Oral presentations and demonstrations';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || (assessment ? 'Edit Assessment' : 'Create New Assessment')}</CardTitle>
        <CardDescription>
          {assessment ? 'Update assessment details and configuration' : 'Create a new assessment for lesson content'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter assessment name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lesson_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lesson" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id}>
                              {lesson.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="assessment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assessment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="QUIZ">
                          <div className="flex flex-col">
                            <span>Quiz</span>
                            <span className="text-xs text-muted-foreground">
                              {getAssessmentTypeDescription('QUIZ')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ASSIGNMENT">
                          <div className="flex flex-col">
                            <span>Assignment</span>
                            <span className="text-xs text-muted-foreground">
                              {getAssessmentTypeDescription('ASSIGNMENT')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PROJECT">
                          <div className="flex flex-col">
                            <span>Project</span>
                            <span className="text-xs text-muted-foreground">
                              {getAssessmentTypeDescription('PROJECT')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PRACTICAL">
                          <div className="flex flex-col">
                            <span>Practical</span>
                            <span className="text-xs text-muted-foreground">
                              {getAssessmentTypeDescription('PRACTICAL')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PRESENTATION">
                          <div className="flex flex-col">
                            <span>Presentation</span>
                            <span className="text-xs text-muted-foreground">
                              {getAssessmentTypeDescription('PRESENTATION')}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter assessment description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of what this assessment covers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter detailed instructions for students"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed instructions that students will see when taking the assessment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Time limit for completing the assessment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Order of this assessment within the lesson
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="max_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Score</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum possible score
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passing_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Score</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="70"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum score to pass
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Weight in final grade calculation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="is_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Required Assessment</FormLabel>
                        <FormDescription>
                          Students must complete this assessment to progress
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_proctored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Proctored Assessment</FormLabel>
                        <FormDescription>
                          Requires supervision during completion
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (assessment ? 'Update' : 'Create')} Assessment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}