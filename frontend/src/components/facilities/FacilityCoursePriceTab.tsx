'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FacilityCoursePriceTabProps {
  data: any;
  updateData: (updates: any) => void;
}

export function FacilityCoursePriceTab({ data, updateData }: FacilityCoursePriceTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Course Pricing</h2>
        <p className="text-muted-foreground">
          Configure course pricing for different age groups and course types at this facility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program-Specific Course Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <p>Course pricing will be configured based on:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Available courses in the current program context</li>
                <li>Age group segmentation (Kids vs Adults)</li>
                <li>Course duration and complexity</li>
                <li>Facility-specific pricing adjustments</li>
              </ul>
            </div>
            
            <Button variant="outline" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Course Pricing (Coming Soon)
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              This feature will be implemented after the schedule management system is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}