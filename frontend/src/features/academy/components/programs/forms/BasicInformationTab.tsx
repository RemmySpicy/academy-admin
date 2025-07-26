'use client';

import { UseFormReturn } from 'react-hook-form';
import {
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

interface BasicInformationTabProps {
  form: UseFormReturn<any>;
  onNameChange?: (name: string) => void;
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

export function BasicInformationTab({ form, onNameChange }: BasicInformationTabProps) {
  return (
    <div className="space-y-6">
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
                  onNameChange?.(e.target.value);
                }}
              />
            </FormControl>
            <FormDescription>
              The display name for this program (e.g., "Swimming", "Robotics Engineering")
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
              Unique identifier for this program. Auto-generated from name, but you can customize it.
              Only letters, numbers, hyphens, and underscores allowed.
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
              Optional description of what this program covers and its objectives
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Optional program category for organization
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
              Order in which this program appears in lists (0 = first, higher numbers appear later)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}