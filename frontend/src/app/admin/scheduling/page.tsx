'use client';

import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { WeeklyScheduleManager } from '@/features/scheduling/components/WeeklyScheduleManager';

export default function SchedulingPage() {
  usePageTitle('Scheduling & Calendar', 'Weekly schedule management with facility-based sessions');
  
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');

  return (
    <div className="space-y-6">
      <WeeklyScheduleManager
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={setSelectedFacilityId}
      />
    </div>
  );
}