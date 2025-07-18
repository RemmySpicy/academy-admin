/**
 * CurriculumForm component for creating and editing curricula
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
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Curriculum, CurriculumCreate, CurriculumUpdate, Course, DifficultyLevel, CurriculumStatus } from '@/lib/api/types';
import { useCourses } from '@/lib/hooks/useCourses';

const curriculumSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  course_id: z.string().min(1, 'Course is required'),
  code: z.string().min(1, 'Code is required').max(20, 'Code must be less than 20 characters'),
  description: z.string().optional(),
  objectives: z.string().optional(),
  duration_hours: z.number().min(1, 'Duration must be at least 1 hour').optional(),
  difficulty_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
  prerequisites: z.string().optional(),
  sequence: z.number().min(0, 'Sequence cannot be negative').default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

type CurriculumFormData = z.infer<typeof curriculumSchema>;

interface CurriculumFormProps {
  curriculum?: Curriculum;
  onSubmit: (data: CurriculumCreate | CurriculumUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
}

export function CurriculumForm({
  curriculum,
  onSubmit,
  onCancel,
  isLoading = false,
  title,
}: CurriculumFormProps) {
  const { data: coursesData, isLoading: coursesLoading } = useCourses();

  const form = useForm<CurriculumFormData>({
    resolver: zodResolver(curriculumSchema),
    defaultValues: {
      name: curriculum?.name || '',
      course_id: curriculum?.course_id || '',
      code: curriculum?.code || '',
      description: curriculum?.description || '',
      objectives: curriculum?.objectives || '',
      duration_hours: curriculum?.duration_hours,
      difficulty_level: curriculum?.difficulty_level || 'BEGINNER',
      prerequisites: curriculum?.prerequisites || '',
      sequence: curriculum?.sequence || 0,
      status: curriculum?.status || 'DRAFT',
    },
  });

  const handleSubmit = (data: CurriculumFormData) => {
    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    onSubmit(cleanData as CurriculumCreate | CurriculumUpdate);
  };

  const courses = coursesData?.items || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || (curriculum ? 'Edit Curriculum' : 'Create New Curriculum')}</CardTitle>
        <CardDescription>
          {curriculum ? 'Update curriculum information and settings' : 'Create a new curriculum for your course'}
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
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter curriculum name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="CURR-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
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
                        placeholder="Enter curriculum description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of what this curriculum covers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Objectives</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter learning objectives"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List the key learning objectives students will achieve
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="40"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Estimated duration in hours
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
                        Order in which this curriculum should appear
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prerequisites</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter prerequisites for this curriculum"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List any skills or knowledge students need before starting this curriculum
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isLoading ? 'Saving...' : (curriculum ? 'Update' : 'Create')} Curriculum
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}