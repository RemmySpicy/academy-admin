/**
 * CurriculumForm component for creating/editing curriculum items
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Program, 
  Course, 
  Curriculum, 
  DifficultyLevel, 
  CurriculumStatus,
  ProgramCreate,
  CourseCreate,
  CurriculumCreate 
} from '@/lib/api/types';
import { useCreateProgram, useCreateCourse, useCreateCurriculum } from '@/lib/hooks/useCurriculum';
import { toast } from 'sonner';

// Validation schemas
const programSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().optional(),
  objectives: z.string().optional(),
  duration_weeks: z.number().min(1).max(104).optional(),
  difficulty_level: z.nativeEnum(DifficultyLevel),
  prerequisites: z.string().optional(),
  target_audience: z.string().optional(),
  certification_available: z.boolean().default(false),
  status: z.nativeEnum(CurriculumStatus).default(CurriculumStatus.DRAFT),
  is_featured: z.boolean().default(false),
});

const courseSchema = z.object({
  program_id: z.string().min(1, 'Program is required'),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().optional(),
  objectives: z.string().optional(),
  duration_hours: z.number().min(1).max(1000).optional(),
  difficulty_level: z.nativeEnum(DifficultyLevel),
  prerequisites: z.string().optional(),
  sequence: z.number().min(1),
  status: z.nativeEnum(CurriculumStatus).default(CurriculumStatus.DRAFT),
});

const curriculumSchema = z.object({
  course_id: z.string().min(1, 'Course is required'),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().optional(),
  objectives: z.string().optional(),
  duration_hours: z.number().min(1).max(1000).optional(),
  difficulty_level: z.nativeEnum(DifficultyLevel),
  prerequisites: z.string().optional(),
  sequence: z.number().min(1),
  status: z.nativeEnum(CurriculumStatus).default(CurriculumStatus.DRAFT),
});

interface CurriculumFormProps {
  type: 'program' | 'course' | 'curriculum';
  initialData?: Program | Course | Curriculum;
  onSuccess?: () => void;
  onCancel?: () => void;
  parentOptions?: { value: string; label: string }[];
}

export function CurriculumForm({
  type,
  initialData,
  onSuccess,
  onCancel,
  parentOptions = [],
}: CurriculumFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createProgramMutation = useCreateProgram();
  const createCourseMutation = useCreateCourse();
  const createCurriculumMutation = useCreateCurriculum();

  const getSchema = () => {
    switch (type) {
      case 'program':
        return programSchema;
      case 'course':
        return courseSchema;
      case 'curriculum':
        return curriculumSchema;
      default:
        return programSchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: initialData || {
      name: '',
      code: '',
      description: '',
      objectives: '',
      difficulty_level: DifficultyLevel.BEGINNER,
      prerequisites: '',
      status: CurriculumStatus.DRAFT,
      sequence: 1,
      ...(type === 'program' && {
        target_audience: '',
        certification_available: false,
        is_featured: false,
        duration_weeks: 1,
      }),
      ...(type !== 'program' && {
        duration_hours: 1,
      }),
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      switch (type) {
        case 'program':
          await createProgramMutation.mutateAsync(data as ProgramCreate);
          break;
        case 'course':
          await createCourseMutation.mutateAsync(data as CourseCreate);
          break;
        case 'curriculum':
          await createCurriculumMutation.mutateAsync(data as CurriculumCreate);
          break;
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed to create ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return initialData ? `Edit ${typeLabel}` : `Create New ${typeLabel}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Parent Selection (for courses and curricula) */}
          {type !== 'program' && (
            <div className="space-y-2">
              <Label htmlFor={`${type === 'course' ? 'program' : 'course'}_id`}>
                {type === 'course' ? 'Program' : 'Course'}
              </Label>
              <Select
                value={form.watch(`${type === 'course' ? 'program' : 'course'}_id`)}
                onValueChange={(value) => 
                  form.setValue(`${type === 'course' ? 'program' : 'course'}_id`, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${type === 'course' ? 'Program' : 'Course'}`} />
                </SelectTrigger>
                <SelectContent>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors[`${type === 'course' ? 'program' : 'course'}_id`] && (
                <p className="text-sm text-destructive">
                  {form.formState.errors[`${type === 'course' ? 'program' : 'course'}_id`]?.message}
                </p>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                {...form.register('code')}
                placeholder="Enter code"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <Label htmlFor="objectives">Learning Objectives</Label>
            <Textarea
              id="objectives"
              {...form.register('objectives')}
              placeholder="Enter learning objectives"
              rows={3}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Select
                value={form.watch('difficulty_level')}
                onValueChange={(value) => form.setValue('difficulty_level', value as DifficultyLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
                  <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                  <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
                  <SelectItem value={DifficultyLevel.EXPERT}>Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as CurriculumStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CurriculumStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={CurriculumStatus.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={CurriculumStatus.UNDER_REVIEW}>Under Review</SelectItem>
                  <SelectItem value={CurriculumStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration ({type === 'program' ? 'weeks' : 'hours'})
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max={type === 'program' ? "104" : "1000"}
                {...form.register(type === 'program' ? 'duration_weeks' : 'duration_hours', {
                  valueAsNumber: true,
                })}
              />
            </div>

            {type !== 'program' && (
              <div className="space-y-2">
                <Label htmlFor="sequence">Sequence</Label>
                <Input
                  id="sequence"
                  type="number"
                  min="1"
                  {...form.register('sequence', { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Textarea
              id="prerequisites"
              {...form.register('prerequisites')}
              placeholder="Enter prerequisites"
              rows={2}
            />
          </div>

          {/* Program-specific fields */}
          {type === 'program' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Textarea
                  id="target_audience"
                  {...form.register('target_audience')}
                  placeholder="Enter target audience"
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certification_available"
                    checked={form.watch('certification_available')}
                    onCheckedChange={(checked) => 
                      form.setValue('certification_available', checked as boolean)
                    }
                  />
                  <Label htmlFor="certification_available">Certification Available</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={form.watch('is_featured')}
                    onCheckedChange={(checked) => 
                      form.setValue('is_featured', checked as boolean)
                    }
                  />
                  <Label htmlFor="is_featured">Featured Program</Label>
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}