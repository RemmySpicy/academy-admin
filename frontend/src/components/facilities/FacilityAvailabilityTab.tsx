'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface FacilityAvailabilityTabProps {
  data: any;
  updateData: (updates: any) => void;
}

interface TimeSlot {
  from: string;
  to: string;
}

interface DaySchedule {
  available: boolean;
  timeSlots: TimeSlot[];
}

const DAYS_OF_WEEK = [
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
];

export function FacilityAvailabilityTab({ data, updateData }: FacilityAvailabilityTabProps) {
  const operatingHours = data.operating_hours || {};

  // Initialize default schedule if empty
  const getDefaultSchedule = (): DaySchedule => ({
    available: false,
    timeSlots: []
  });

  const getDaySchedule = (day: string): DaySchedule => {
    return operatingHours[day] || getDefaultSchedule();
  };

  const updateDaySchedule = (day: string, schedule: DaySchedule) => {
    const updatedHours = { ...operatingHours, [day]: schedule };
    updateData({ operating_hours: updatedHours });
  };

  const toggleDayAvailability = (day: string, available: boolean) => {
    const currentSchedule = getDaySchedule(day);
    const updatedSchedule = { 
      ...currentSchedule, 
      available,
      timeSlots: available ? (currentSchedule.timeSlots.length === 0 ? [{ from: '09:00', to: '17:00' }] : currentSchedule.timeSlots) : []
    };
    updateDaySchedule(day, updatedSchedule);
  };

  const addTimeSlot = (day: string) => {
    const currentSchedule = getDaySchedule(day);
    const newTimeSlot: TimeSlot = { from: '09:00', to: '17:00' };
    const updatedSchedule = {
      ...currentSchedule,
      timeSlots: [...currentSchedule.timeSlots, newTimeSlot]
    };
    updateDaySchedule(day, updatedSchedule);
  };

  const removeTimeSlot = (day: string, index: number) => {
    const currentSchedule = getDaySchedule(day);
    const updatedSchedule = {
      ...currentSchedule,
      timeSlots: currentSchedule.timeSlots.filter((_, i) => i !== index)
    };
    updateDaySchedule(day, updatedSchedule);
  };

  const updateTimeSlot = (day: string, index: number, field: 'from' | 'to', value: string) => {
    const currentSchedule = getDaySchedule(day);
    const updatedTimeSlots = currentSchedule.timeSlots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    const updatedSchedule = {
      ...currentSchedule,
      timeSlots: updatedTimeSlots
    };
    updateDaySchedule(day, updatedSchedule);
  };

  const copyFromPreviousDay = (currentDay: string) => {
    const currentIndex = DAYS_OF_WEEK.findIndex(d => d.key === currentDay);
    if (currentIndex === 0) return; // No previous day for Sunday
    
    const previousDay = DAYS_OF_WEEK[currentIndex - 1].key;
    const previousSchedule = getDaySchedule(previousDay);
    updateDaySchedule(currentDay, { ...previousSchedule });
  };

  const setAllDaysSchedule = (schedule: DaySchedule) => {
    const updatedHours = { ...operatingHours };
    DAYS_OF_WEEK.forEach(day => {
      updatedHours[day.key] = { ...schedule };
    });
    updateData({ operating_hours: updatedHours });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Operating Hours</h2>
          <p className="text-muted-foreground">
            Configure when the facility is available for use. You can set multiple time slots per day.
          </p>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAllDaysSchedule({ available: true, timeSlots: [{ from: '09:00', to: '17:00' }] })}
          >
            Set All 9AM-5PM
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAllDaysSchedule({ available: false, timeSlots: [] })}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const schedule = getDaySchedule(day.key);
          const isAvailable = schedule.available;

          return (
            <Card key={day.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-base">{day.label}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`${day.key}-available`} className="text-sm text-muted-foreground">
                        Available
                      </Label>
                      <Switch
                        id={`${day.key}-available`}
                        checked={isAvailable}
                        onCheckedChange={(checked) => toggleDayAvailability(day.key, checked)}
                      />
                    </div>
                  </div>
                  {index > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyFromPreviousDay(day.key)}
                    >
                      Copy from {DAYS_OF_WEEK[index - 1].label}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isAvailable && (
                <CardContent className="space-y-3">
                  {schedule.timeSlots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">Available from</Label>
                        <Input
                          type="time"
                          value={slot.from}
                          onChange={(e) => updateTimeSlot(day.key, slotIndex, 'from', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">till</Label>
                        <Input
                          type="time"
                          value={slot.to}
                          onChange={(e) => updateTimeSlot(day.key, slotIndex, 'to', e.target.value)}
                          className="w-32"
                        />
                      </div>

                      {schedule.timeSlots.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(day.key, slotIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(day.key)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            {DAYS_OF_WEEK.map(day => {
              const schedule = getDaySchedule(day.key);
              if (!schedule.available) {
                return (
                  <div key={day.key} className="flex justify-between">
                    <span className="font-medium">{day.label}:</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                );
              }

              const timeString = schedule.timeSlots
                .map(slot => `${slot.from} - ${slot.to}`)
                .join(', ');

              return (
                <div key={day.key} className="flex justify-between">
                  <span className="font-medium">{day.label}:</span>
                  <span>{timeString}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}