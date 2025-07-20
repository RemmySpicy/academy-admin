'use client';

import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { FacilityScheduleManager } from '@/features/scheduling/components/FacilityScheduleManager';

export default function SchedulingPage() {
  usePageTitle('Scheduling & Calendar', 'Facility-centric schedule management and calendar system');
  
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');

  return (
    <div className="space-y-6">
      <FacilityScheduleManager
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={setSelectedFacilityId}
      />
    </div>
  );
}