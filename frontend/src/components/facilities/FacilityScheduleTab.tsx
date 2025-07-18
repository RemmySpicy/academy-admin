'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface FacilityScheduleTabProps {
  data: any;
  updateData: (updates: any) => void;
}

export function FacilityScheduleTab({ data, updateData }: FacilityScheduleTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Current Schedule</h2>
        <p className="text-muted-foreground">
          View current bookings and schedules for this facility. Schedule management is handled in the main Schedule section.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>This Week: December 21 - 28</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="bg-muted rounded-full p-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            
            <div className="text-muted-foreground mb-6">
              <p className="mb-4">Schedule display will show:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Current bookings and reservations</li>
                <li>Recurring classes and sessions</li>
                <li>Maintenance and blocked time slots</li>
                <li>Tutor assignments and availability</li>
                <li>Real-time booking status</li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button variant="outline" disabled>
                <Clock className="h-4 w-4 mr-2" />
                View Full Schedule
              </Button>
              <Button variant="outline" disabled>
                <Calendar className="h-4 w-4 mr-2" />
                Manage Bookings
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              Schedule management will be available in the main Schedule section of the application.
              This tab provides a read-only view of current facility usage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sample Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Schedule Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Group Lesson Noon</p>
                <p className="text-sm text-muted-foreground">Kids • Beginner • Group Lesson</p>
              </div>
              <div className="text-right">
                <p className="font-medium">1:00pm - 2:00pm</p>
                <p className="text-sm text-blue-600">3 Booked • 2 Open</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Group Lesson Noon</p>
                <p className="text-sm text-muted-foreground">Kids • Beginner • Group Lesson</p>
              </div>
              <div className="text-right">
                <p className="font-medium">1:00pm - 2:00pm</p>
                <p className="text-sm text-green-600">Recurring</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Group Lesson Noon</p>
                <p className="text-sm text-muted-foreground">Kids • Beginner • Group Lesson</p>
              </div>
              <div className="text-right">
                <p className="font-medium">1:00pm - 2:00pm</p>
                <p className="text-sm text-gray-600">Recurring</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}