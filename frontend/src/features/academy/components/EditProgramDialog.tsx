'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useUpdateAcademyProgram } from '../hooks';
import type { Program } from '@/lib/api/types';

// Form validation schema
const editProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(200, 'Name must be 200 characters or less'),
  program_code: z.string()
    .min(1, 'Program code is required')
    .max(20, 'Program code must be 20 characters or less')
    .regex(/^[A-Za-z0-9_-]+$/, 'Program code can only contain letters, numbers, hyphens, and underscores'),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  display_order: z.number().min(0, 'Display order must be a positive number'),
});

type EditProgramFormData = z.infer<typeof editProgramSchema>;

interface EditProgramDialogProps {
  program: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgramUpdated: () => void;
}

const programCategories = [
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Science', label: 'Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Music', label: 'Music' },
  { value: 'Language', label: 'Language' },
  { value: 'Health', label: 'Health' },
  { value: 'Other', label: 'Other' },
];

export function EditProgramDialog({ 
  program, 
  open, 
  onOpenChange, 
  onProgramUpdated 
}: EditProgramDialogProps) {
  const updateProgram = useUpdateAcademyProgram();

  const form = useForm<EditProgramFormData>({
    resolver: zodResolver(editProgramSchema),
    defaultValues: {
      name: '',
      program_code: '',
      description: '',
      category: '',
      status: 'active',
      display_order: 0,
    },
  });

  // Update form values when program changes
  useEffect(() => {
    if (program && open) {
      form.reset({
        name: program.name || '',
        program_code: program.program_code || '',
        description: program.description || '',
        category: program.category || 'none',
        status: program.status as 'active' | 'inactive' | 'draft' | 'archived' || 'active',
        display_order: program.display_order || 0,
      });
    }
  }, [program, open, form]);

  const handleSubmit = async (data: EditProgramFormData) => {
    if (!program?.id) return;

    try {
      await updateProgram.mutateAsync({
        id: program.id,
        data: {
          name: data.name,
          program_code: data.program_code,
          description: data.description || undefined,
          category: data.category === 'none' ? undefined : data.category || undefined,
          status: data.status,
          display_order: data.display_order,
        },
      });
      onOpenChange(false);
      onProgramUpdated();
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Error updating program:', error);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
          <DialogDescription>
            Update the program information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        {program && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Program Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter program name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The display name for this program
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Program Code */}
              <FormField
                control={form.control}
                name="program_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter unique program code"
                        {...field}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this program. Only letters, numbers, hyphens, and underscores allowed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Program Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter program description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of what this program covers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {programCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional program category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the program
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Display Order */}
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Order in which this program appears in lists (0 = first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateProgram.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProgram.isPending}
                >
                  {updateProgram.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Program'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}