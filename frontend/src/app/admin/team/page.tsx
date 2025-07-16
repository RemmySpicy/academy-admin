'use client';

import { TeamManagement } from '@/features/teams';

/**
 * Team Management Page
 * 
 * Manage program team members, roles, and assignments
 */
export default function TeamPage() {
  return (
    <div className="p-6">
      <TeamManagement />
    </div>
  );
}