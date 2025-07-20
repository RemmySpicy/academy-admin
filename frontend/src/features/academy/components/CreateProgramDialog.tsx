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
  DialogTrigger,
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
import { Plus, Loader2 } from 'lucide-react';
import { useCreateAcademyProgram, useAcademyPrograms } from '../hooks';

// Form validation schema
const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(200, 'Name must be 200 characters or less'),
  program_code: z.string()
    .min(1, 'Program code is required')
    .max(20, 'Program code must be 20 characters or less')
    .regex(/^[A-Za-z0-9_-]+$/, 'Program code can only contain letters, numbers, hyphens, and underscores'),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).default('active'),
  display_order: z.number().min(0, 'Display order must be a positive number').default(0),
});

type CreateProgramFormData = z.infer<typeof createProgramSchema>;

interface CreateProgramDialogProps {
  onProgramCreated: () => void;
  trigger?: React.ReactNode;
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

export function CreateProgramDialog({ onProgramCreated, trigger }: CreateProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const createProgram = useCreateAcademyProgram();
  const { data: programsData } = useAcademyPrograms({ page: 1, per_page: 100 });


  // Calculate next display order
  const nextDisplayOrder = programsData?.items 
    ? Math.max(...programsData.items.map(p => p.display_order || 0)) + 1 
    : 1;

  const form = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: '',
      program_code: '',
      description: '',
      category: '',
      status: 'active',
      display_order: 1,
    },
  });

  // Update display order when programs data changes
  useEffect(() => {
    if (nextDisplayOrder !== undefined) {
      form.setValue('display_order', nextDisplayOrder);
    }
  }, [nextDisplayOrder, form]);

  const handleSubmit = async (data: CreateProgramFormData) => {
    try {
      await createProgram.mutateAsync(data);
      form.reset();
      setOpen(false);
      onProgramCreated();
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Error creating program:', error);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  // Auto-generate program code from name
  const handleNameChange = (name: string) => {
    if (!form.getValues('program_code') && name) {
      const generatedCode = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
      form.setValue('program_code', generatedCode);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
          <DialogDescription>
            Add a new program to the academy. This will create a new program that can contain courses and curricula.
          </DialogDescription>
        </DialogHeader>

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
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                onClick={() => setOpen(false)}
                disabled={createProgram.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProgram.isPending}
              >
                {createProgram.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Program'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}