/**
 * Course Form Component - Create and Edit Courses
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload,
  Star,
  Award,
  BookOpen,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, CourseCreate, CourseUpdate } from '../api/courseApiService';

interface CourseFormProps {
  course?: Course; // For editing
  onSubmit: (data: CourseCreate | CourseUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const courseFormSchema = z.object({
  program_id: z.string().min(1, 'Program is required'),
  name: z.string().min(1, 'Course name is required').max(200, 'Course name is too long'),
  code: z.string().min(1, 'Course code is required').max(50, 'Course code is too long'),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  duration_weeks: z.coerce.number().min(1, 'Duration must be at least 1 week').max(104, 'Duration cannot exceed 2 years'),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  instructor_id: z.string().optional(),
  max_students: z.coerce.number().optional(),
  min_students: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
  tags: z.array(z.string()).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  sequence: z.coerce.number().optional(),
  is_featured: z.boolean().default(false),
  is_certification_course: z.boolean().default(false),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
];

export function CourseForm({
  course,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CourseFormProps) {
  const [objectives, setObjectives] = useState<string[]>(course?.objectives || ['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(course?.prerequisites || ['']);
  const [tags, setTags] = useState<string[]>(course?.tags || []);
  const [newTag, setNewTag] = useState('');

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      program_id: course?.program_id || '',
      name: course?.name || '',
      code: course?.code || '',
      description: course?.description || '',
      objectives: course?.objectives || [],
      prerequisites: course?.prerequisites || [],
      duration_weeks: course?.duration_weeks || 1,
      difficulty_level: course?.difficulty_level || 'beginner',
      instructor_id: course?.instructor_id || '',
      max_students: course?.max_students || undefined,
      min_students: course?.min_students || undefined,
      price: course?.price || undefined,
      currency: course?.currency || 'USD',
      tags: course?.tags || [],
      image_url: course?.image_url || '',
      video_url: course?.video_url || '',
      sequence: course?.sequence || undefined,
      is_featured: course?.is_featured || false,
      is_certification_course: course?.is_certification_course || false,
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    try {
      const submitData = {
        ...data,
        objectives: objectives.filter(obj => obj.trim() !== ''),
        prerequisites: prerequisites.filter(prereq => prereq.trim() !== ''),
        tags: tags,
        // Clean up empty optional fields
        image_url: data.image_url || undefined,
        video_url: data.video_url || undefined,
        instructor_id: data.instructor_id || undefined,
        max_students: data.max_students || undefined,
        min_students: data.min_students || undefined,
        price: data.price || undefined,
        sequence: data.sequence || undefined,
      };

      await onSubmit(submitData);
      toast.success(course ? 'Course updated successfully' : 'Course created successfully');
    } catch (error) {
      toast.error(`Failed to ${course ? 'update' : 'create'} course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const addPrerequisite = () => {
    setPrerequisites([...prerequisites, '']);
  };

  const updatePrerequisite = (index: number, value: string) => {
    const newPrerequisites = [...prerequisites];
    newPrerequisites[index] = value;
    setPrerequisites(newPrerequisites);
  };

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter course name" />
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
                      <FormLabel>Course Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CS101, SWIM-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide a detailed description of the course"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="duration_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (weeks) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" max="104" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={option.color}>
                                  {option.label}
                                </Badge>
                              </div>
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
                  name="sequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence Order</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="Optional" />
                      </FormControl>
                      <FormDescription>
                        Order of this course in the program
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Learning objective ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeObjective(index)}
                    disabled={objectives.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Learning Objective
              </Button>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    placeholder={`Prerequisite ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePrerequisite(index)}
                    disabled={prerequisites.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrerequisite}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prerequisite
              </Button>
            </CardContent>
          </Card>

          {/* Enrollment & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="min_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Students</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Instructor ID (optional)" />
                      </FormControl>
                      <FormDescription>
                        Leave empty to assign later
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormDescription>
                        Leave empty for free courses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Media & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/course-image.jpg" />
                    </FormControl>
                    <FormDescription>
                      URL to the course thumbnail image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Preview Video URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://youtube.com/watch?v=..." />
                    </FormControl>
                    <FormDescription>
                      URL to the course preview video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Course Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Featured Course
                      </FormLabel>
                      <FormDescription>
                        Display this course prominently in the catalog
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
                name="is_certification_course"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Certification Course
                      </FormLabel>
                      <FormDescription>
                        Students will receive a certificate upon completion
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
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}