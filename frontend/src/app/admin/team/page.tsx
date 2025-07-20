'use client';

import { TeamManagement } from '@/features/teams';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';

/**
 * Team Management Page
 * 
 * Manage program team members, roles, and assignments
 */
export default function TeamPage() {
  usePageTitle('Team Management', 'Manage your program team members, roles, and assignments');
  
  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <TeamManagement />
    </div>
  );
}