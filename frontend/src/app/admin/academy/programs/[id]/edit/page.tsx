'use client';

import { useParams } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ProgramEditPage } from '@/features/academy/components/programs/ProgramEditPage';

/**
 * Program Edit Page
 * 
 * Full-page program editing with tabbed interface for comprehensive configuration
 */
export default function EditProgramPage() {
  const params = useParams();
  const programId = params.id as string;

  usePageTitle('Edit Program', 'Update program configuration and settings');

  return <ProgramEditPage programId={programId} />;
}