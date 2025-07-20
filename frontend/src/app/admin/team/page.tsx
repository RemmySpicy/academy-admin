'use client';

import { TeamManagement } from '@/features/teams';
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
      <TeamManagement />
    </div>
  );
}