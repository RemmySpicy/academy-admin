'use client';

import { useState, useMemo } from 'react';
import { Search, User, Clock, MapPin, Calendar, CheckCircle, AlertTriangle, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import type { SessionTypeString } from '../types';

// Mock instructor data type based on Feature Integration Guide
interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialties: string[];
  skill_levels: string[];
  facility_id: string;
  availability: {
    available: boolean;
    reason?: string;
    next_available?: string;
  };
  capacity_multiplier: number;
  total_sessions_today: number;
  max_sessions_per_day: number;
  current_rating: number;
  total_sessions_taught: number;
}

interface InstructorSelectorProps {
  sessionType: SessionTypeString;
  difficultyLevel: string;
  facilityId: string;
  date: string;
  startTime: string;
  duration: number;
  selectedInstructorIds: string[];
  onInstructorsChange: (instructorIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data demonstrating instructor availability and capacity checking
const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'instructor-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@academy.com',
    phone: '+234 801 234 5678',
    avatar: '/avatars/sarah.jpg',
    specialties: ['Swimming', 'Water Safety'],
    skill_levels: ['beginner', 'intermediate', 'advanced'],
    facility_id: 'facility-1',
    availability: { available: true },
    capacity_multiplier: 2.0,
    total_sessions_today: 2,
    max_sessions_per_day: 6,
    current_rating: 4.8,
    total_sessions_taught: 450
  },
  {
    id: 'instructor-2',
    name: 'Michael Chen',
    email: 'michael.chen@academy.com',
    phone: '+234 802 345 6789',
    specialties: ['Swimming', 'Competitive Training'],
    skill_levels: ['intermediate', 'advanced'],
    facility_id: 'facility-1',
    availability: { 
      available: false, 
      reason: 'Already teaching at this time',
      next_available: '15:00'
    },
    capacity_multiplier: 1.5,
    total_sessions_today: 4,
    max_sessions_per_day: 5,
    current_rating: 4.9,
    total_sessions_taught: 620
  },
  {
    id: 'instructor-3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@academy.com',
    phone: '+234 803 456 7890',
    specialties: ['Swimming', 'Beginner Programs'],
    skill_levels: ['beginner', 'intermediate'],
    facility_id: 'facility-1',
    availability: { available: true },
    capacity_multiplier: 1.8,
    total_sessions_today: 1,
    max_sessions_per_day: 6,
    current_rating: 4.7,
    total_sessions_taught: 280
  },
  {
    id: 'instructor-4',
    name: 'David Thompson',
    email: 'david.thompson@academy.com',
    phone: '+234 804 567 8901',
    specialties: ['Swimming', 'Rehabilitation'],
    skill_levels: ['beginner', 'intermediate'],
    facility_id: 'facility-1',
    availability: { 
      available: false,
      reason: 'Exceeds daily session limit',
      next_available: 'Tomorrow 9:00 AM'
    },
    capacity_multiplier: 1.2,
    total_sessions_today: 6,
    max_sessions_per_day: 6,
    current_rating: 4.6,
    total_sessions_taught: 890
  }
];

export function InstructorSelector({
  sessionType,
  difficultyLevel,
  facilityId,
  date,
  startTime,
  duration,
  selectedInstructorIds,
  onInstructorsChange,
  isOpen,
  onClose
}: InstructorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Filter instructors based on facility, search, and availability
  const filteredInstructors = useMemo(() => {
    let instructors = MOCK_INSTRUCTORS.filter(instructor => 
      instructor.facility_id === facilityId
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      instructors = instructors.filter(instructor =>
        instructor.name.toLowerCase().includes(searchLower) ||
        instructor.email.toLowerCase().includes(searchLower) ||
        instructor.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply availability filter
    if (showOnlyAvailable) {
      instructors = instructors.filter(instructor => instructor.availability.available);
    }

    return instructors;
  }, [facilityId, searchTerm, showOnlyAvailable]);

  // Get instructor capacity and recommendations
  const getInstructorCapacity = (instructor: Instructor) => {
    const baseCapacity = getSessionBaseCapacity(sessionType);
    const adjustedCapacity = Math.floor(baseCapacity * instructor.capacity_multiplier);
    return adjustedCapacity;
  };

  const getSessionBaseCapacity = (sessionType: SessionTypeString) => {
    switch (sessionType) {
      case 'private': return 2;
      case 'group': return 5;
      case 'school_group': return 20;
      default: return 5;
    }
  };

  const getSkillLevelMatch = (instructor: Instructor, targetLevel: string) => {
    if (targetLevel === 'any') return 'perfect';
    if (instructor.skill_levels.includes(targetLevel)) return 'perfect';
    if (instructor.skill_levels.includes('intermediate') && 
        (targetLevel === 'beginner' || targetLevel === 'advanced')) return 'good';
    return 'poor';
  };

  const getAvailabilityBadge = (instructor: Instructor) => {
    if (instructor.availability.available) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          Available
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          Unavailable
        </Badge>
      );
    }
  };

  const getSkillMatchBadge = (match: string) => {
    switch (match) {
      case 'perfect':
        return <Badge variant="default" className="bg-green-100 text-green-800">Perfect Match</Badge>;
      case 'good':
        return <Badge variant="secondary">Good Match</Badge>;
      case 'poor':
        return <Badge variant="outline" className="text-orange-600">Limited Match</Badge>;
      default:
        return null;
    }
  };

  const handleInstructorToggle = (instructorId: string, checked: boolean) => {
    if (checked) {
      onInstructorsChange([...selectedInstructorIds, instructorId]);
    } else {
      onInstructorsChange(selectedInstructorIds.filter(id => id !== instructorId));
    }
  };

  const handleSelectAll = () => {
    const availableInstructorIds = filteredInstructors
      .filter(instructor => instructor.availability.available)
      .map(instructor => instructor.id);
    onInstructorsChange(availableInstructorIds);
  };

  const handleClearAll = () => {
    onInstructorsChange([]);
  };

  const selectedCount = selectedInstructorIds.length;
  const requiredInstructors = sessionType === 'school_group' ? 2 : 1;

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Select Instructors</span>
            </CardTitle>
            <CardDescription>
              Choose instructors for your {sessionType.replace('_', ' ')} session
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Context */}
        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{startTime} ({duration} min)</span>
          </div>
          <Badge variant="outline">{sessionType.replace('_', ' ')}</Badge>
          <Badge variant="outline">{difficultyLevel}</Badge>
        </div>

        {/* Requirements Alert */}
        {sessionType === 'school_group' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              School group sessions require at least 2 instructors for safety and supervision.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search instructors by name, email, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-available"
              checked={showOnlyAvailable}
              onCheckedChange={setShowOnlyAvailable}
            />
            <label htmlFor="show-available" className="text-sm">
              Show only available
            </label>
          </div>
        </div>

        {/* Selection Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select Available
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {selectedCount} of {filteredInstructors.length} instructors selected
            {requiredInstructors > 1 && (
              <span className="ml-2">
                (minimum {requiredInstructors} required)
              </span>
            )}
          </div>
        </div>

        {/* Instructors List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredInstructors.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No instructors found matching your criteria</p>
            </div>
          ) : (
            filteredInstructors.map((instructor) => {
              const isSelected = selectedInstructorIds.includes(instructor.id);
              const capacity = getInstructorCapacity(instructor);
              const skillMatch = getSkillLevelMatch(instructor, difficultyLevel);
              const isAvailable = instructor.availability.available;

              return (
                <Card 
                  key={instructor.id} 
                  className={cn(
                    "transition-all cursor-pointer",
                    isSelected && "ring-2 ring-blue-500 bg-blue-50",
                    !isAvailable && "opacity-60"
                  )}
                  onClick={() => isAvailable && handleInstructorToggle(instructor.id, !isSelected)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              isAvailable && handleInstructorToggle(instructor.id, checked as boolean)
                            }
                            disabled={!isAvailable}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            {instructor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold">{instructor.name}</h4>
                            <p className="text-sm text-gray-600">{instructor.email}</p>
                            {instructor.phone && (
                              <p className="text-sm text-gray-500">{instructor.phone}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span>★ {instructor.current_rating}/5</span>
                            <span>{instructor.total_sessions_taught} sessions</span>
                            <span>
                              {instructor.total_sessions_today}/{instructor.max_sessions_per_day} today
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {instructor.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        {getAvailabilityBadge(instructor)}
                        {getSkillMatchBadge(skillMatch)}
                        
                        <div className="text-xs text-gray-600">
                          Capacity: {capacity} students
                        </div>
                      </div>
                    </div>

                    {/* Availability Details */}
                    {!instructor.availability.available && instructor.availability.reason && (
                      <div className="mt-3 p-2 bg-red-50 rounded text-sm">
                        <div className="flex items-center space-x-2 text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{instructor.availability.reason}</span>
                        </div>
                        {instructor.availability.next_available && (
                          <p className="text-red-600 mt-1">
                            Next available: {instructor.availability.next_available}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          <span>Selected as instructor for this session</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Validation Warnings */}
        {selectedCount < requiredInstructors && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select at least {requiredInstructors} instructor{requiredInstructors > 1 ? 's' : ''} 
              for this session type.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onClose}
            disabled={selectedCount < requiredInstructors}
            className="min-w-[120px]"
          >
            Confirm Selection ({selectedCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}