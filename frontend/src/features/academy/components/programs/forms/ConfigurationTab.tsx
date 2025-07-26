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
import { Input } from '@/components/ui/input';
import { AgeGroupsManager } from '../configuration/AgeGroupsManager';
import { DifficultyLevelsManager } from '../configuration/DifficultyLevelsManager';
import { SessionTypesManager } from '../configuration/SessionTypesManager';

interface ConfigurationTabProps {
  form: UseFormReturn<any>;
}

export function ConfigurationTab({ form }: ConfigurationTabProps) {
  return (
    <div className="space-y-8">
      {/* Default Session Duration */}
      <FormField
        control={form.control}
        name="default_session_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Session Duration (minutes) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="15"
                max="300"
                placeholder="60"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                className="w-48"
              />
            </FormControl>
            <FormDescription>
              Default duration for new sessions in this program (15-300 minutes)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Age Groups */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Age Groups</h3>
          <p className="text-sm text-muted-foreground">
            Define the age ranges that will be available for course creation and curriculum targeting in this program.
          </p>
        </div>
        <FormField
          control={form.control}
          name="age_groups"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AgeGroupsManager
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Difficulty Levels */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Difficulty Levels</h3>
          <p className="text-sm text-muted-foreground">
            Define the difficulty progression that will be used in curriculum creation and course assignment.
          </p>
        </div>
        <FormField
          control={form.control}
          name="difficulty_levels"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DifficultyLevelsManager
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Session Types */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Session Types</h3>
          <p className="text-sm text-muted-foreground">
            Define the types of sessions that can be scheduled for this program, including their capacity limits.
          </p>
        </div>
        <FormField
          control={form.control}
          name="session_types"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <SessionTypesManager
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}