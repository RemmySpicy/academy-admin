'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { ProgramCreatePage } from '@/features/academy/components/programs/ProgramCreatePage';

/**
 * Program Creation Page
 * 
 * Full-page program creation with tabbed interface for comprehensive setup
 */
export default function NewProgramPage() {
  usePageTitle('Create Program', 'Set up a new academy program with comprehensive configuration');

  return <ProgramCreatePage />;
}