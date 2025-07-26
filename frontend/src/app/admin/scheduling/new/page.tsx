'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SessionCreateForm } from '@/features/scheduling/components/SessionCreateForm';
import { useCreateSession } from '@/features/scheduling/hooks';
import type { SessionCreate } from '@/features/scheduling/types';

export default function CreateSessionPage() {
  usePageTitle('Create Session', 'Schedule a new session for your facility');
  const router = useRouter();
  const createSession = useCreateSession();

  const handleBack = () => {
    router.push('/admin/scheduling');
  };

  const handleSubmit = async (data: any) => {
    try {
      // Transform form data to match API expectations
      const sessionData: SessionCreate = {
        ...data,
        // Convert date and time strings to ISO datetime
        start_time: new Date(`${data.date}T${data.startTime}`).toISOString(),
        end_time: new Date(
          new Date(`${data.date}T${data.startTime}`).getTime() + (data.duration * 60 * 1000)
        ).toISOString(),
        // Map session type from frontend to backend
        session_type: data.sessionType,
        // Handle optional fields
        difficulty_level: data.difficultyLevel,
        instructor_ids: data.instructorIds || [],
        student_ids: data.studentIds || [],
        // Let backend set defaults based on session type
        max_participants: undefined,
      };

      await createSession.mutateAsync(sessionData);
      toast.success('Session created successfully!');
      router.push('/admin/scheduling');
    } catch (error) {
      console.error('Failed to create session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schedule
        </Button>
      </div>

      {/* Session Creation Form */}
      <SessionCreateForm
        onSubmit={handleSubmit}
        onCancel={handleBack}
        isLoading={createSession.isPending}
      />
    </div>
  );
}