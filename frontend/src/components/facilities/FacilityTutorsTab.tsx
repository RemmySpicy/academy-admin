'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface FacilityTutorsTabProps {
  data: any;
  updateData: (updates: any) => void;
}

export function FacilityTutorsTab({ data, updateData }: FacilityTutorsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Tutor Assignment</h2>
        <p className="text-muted-foreground">
          Assign and manage tutors for this facility. Configure their availability and specializations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tutors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <p>Tutor management will include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Assign qualified tutors to this facility</li>
                <li>Set tutor availability schedules</li>
                <li>Configure specializations and certifications</li>
                <li>Manage tutor contact information</li>
                <li>Track performance and ratings</li>
              </ul>
            </div>
            
            <Button variant="outline" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Tutor (Coming Soon)
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              This feature will be implemented as part of the comprehensive tutor management system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}