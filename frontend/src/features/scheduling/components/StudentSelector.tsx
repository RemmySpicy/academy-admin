'use client';

import { useState, useEffect } from 'react';
import { Search, Users, CreditCard, AlertTriangle, CheckCircle, Info } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { StudentForScheduling, SessionTypeString } from '../types';

interface StudentSelectorProps {
  sessionType: SessionTypeString;
  difficultyLevel: string;
  facilityId: string;
  onStudentsChange: (studentIds: string[]) => void;
  selectedStudentIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

interface MockStudent extends StudentForScheduling {
  // Mock data structure based on Feature Integration Guide
}

// Mock student data (will be replaced with real API integration)
const MOCK_STUDENTS: MockStudent[] = [
  {
    id: 'student-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    remaining_credits: 8,
    course_enrollment: {
      course_name: 'Swimming Fundamentals',
      progress: '60% - Intermediate Level',
      skill_level: 'Intermediate'
    },
    eligibility: {
      student_id: 'student-1',
      is_eligible: true,
      has_credits: true,
      remaining_credits: 8,
      skill_level_match: true,
      recommended_difficulty: 'intermediate',
      warnings: []
    }
  },
  {
    id: 'student-2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    remaining_credits: 2,
    course_enrollment: {
      course_name: 'Swimming Basics',
      progress: '25% - Beginner Level',
      skill_level: 'Beginner'
    },
    eligibility: {
      student_id: 'student-2',
      is_eligible: true,
      has_credits: true,
      remaining_credits: 2,
      skill_level_match: false,
      recommended_difficulty: 'beginner',
      warnings: ['Skill level below session difficulty']
    }
  },
  {
    id: 'student-3',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    remaining_credits: 0,
    course_enrollment: {
      course_name: 'Advanced Swimming',
      progress: '90% - Advanced Level',
      skill_level: 'Advanced'
    },
    eligibility: {
      student_id: 'student-3',
      is_eligible: false,
      has_credits: false,
      remaining_credits: 0,
      skill_level_match: true,
      recommended_difficulty: 'advanced',
      warnings: ['No session credits available']
    }
  },
  {
    id: 'student-4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    remaining_credits: 12,
    course_enrollment: {
      course_name: 'Swimming Fundamentals',
      progress: '40% - Beginner to Intermediate',
      skill_level: 'Intermediate'
    },
    eligibility: {
      student_id: 'student-4',
      is_eligible: true,
      has_credits: true,
      remaining_credits: 12,
      skill_level_match: true,
      recommended_difficulty: 'intermediate',
      warnings: []
    }
  }
];

export function StudentSelector({
  sessionType,
  difficultyLevel,
  facilityId,
  onStudentsChange,
  selectedStudentIds,
  isOpen,
  onClose
}: StudentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<MockStudent[]>([]);
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);

  // Get capacity limits based on session type
  const getCapacityLimits = (sessionType: SessionTypeString) => {
    switch (sessionType) {
      case 'private':
        return { min: 1, max: 2 };
      case 'group':
        return { min: 3, max: 5 };
      case 'school_group':
        return { min: 1, max: null }; // Unlimited
      default:
        return { min: 1, max: null };
    }
  };

  const capacity = getCapacityLimits(sessionType);
  const isAtCapacity = capacity.max && selectedStudentIds.length >= capacity.max;

  // Filter students based on search and eligibility
  useEffect(() => {
    let filtered = MOCK_STUDENTS;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course_enrollment?.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Eligibility filter
    if (showOnlyEligible) {
      filtered = filtered.filter(student => student.eligibility.is_eligible);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, showOnlyEligible]);

  const handleStudentToggle = (studentId: string) => {
    const newSelection = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter(id => id !== studentId)
      : [...selectedStudentIds, studentId];
    
    onStudentsChange(newSelection);
  };

  const getSkillLevelBadgeVariant = (student: MockStudent) => {
    if (!student.eligibility.skill_level_match) {
      return 'destructive';
    }
    return 'outline';
  };

  const getCreditsBadgeVariant = (credits: number) => {
    if (credits === 0) return 'destructive';
    if (credits <= 3) return 'secondary';
    return 'default';
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Select Students</span>
            </CardTitle>
            <CardDescription>
              Add students to this {sessionType} session (Difficulty: {difficultyLevel})
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Capacity Info */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Session Capacity: {selectedStudentIds.length} / {capacity.max || '∞'} participants
            </span>
          </div>
          {isAtCapacity && (
            <Badge variant="secondary">At Capacity</Badge>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnlyEligible"
                checked={showOnlyEligible}
                onCheckedChange={setShowOnlyEligible}
              />
              <label htmlFor="showOnlyEligible" className="text-sm font-medium">
                Show only eligible students
              </label>
            </div>
          </div>
        </div>

        {/* Integration Features Info */}
        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Student Credit Integration Features:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>• Real-time credit balance display</div>
                <div>• Course progress and skill level matching</div>
                <div>• Eligibility warnings and recommendations</div>
                <div>• Automatic credit deduction on enrollment</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Students List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Available Students ({filteredStudents.length})</h4>
            <div className="text-sm text-gray-600">
              Selected: {selectedStudentIds.length}
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const canSelect = student.eligibility.is_eligible && (!isAtCapacity || isSelected);

                return (
                  <Card 
                    key={student.id} 
                    className={`relative cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    } ${!canSelect ? 'opacity-60' : ''}`}
                    onClick={() => canSelect && handleStudentToggle(student.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            disabled={!canSelect}
                            className="mt-1"
                          />
                          
                          <div className="space-y-2 flex-1">
                            {/* Student Basic Info */}
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{student.name}</h5>
                                <p className="text-sm text-gray-600">{student.email}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={getCreditsBadgeVariant(student.remaining_credits)}
                                  className="flex items-center space-x-1"
                                >
                                  <CreditCard className="h-3 w-3" />
                                  <span>{student.remaining_credits} credits</span>
                                </Badge>
                              </div>
                            </div>

                            {/* Course Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-1">
                                <p className="font-medium">Course Enrollment</p>
                                <p className="text-gray-600">{student.course_enrollment?.course_name}</p>
                                <p className="text-gray-600">{student.course_enrollment?.progress}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium">Skill Level</p>
                                <Badge 
                                  variant={getSkillLevelBadgeVariant(student)}
                                  className="text-xs"
                                >
                                  {student.course_enrollment?.skill_level}
                                  {student.eligibility.skill_level_match ? (
                                    <CheckCircle className="h-3 w-3 ml-1" />
                                  ) : (
                                    <AlertTriangle className="h-3 w-3 ml-1" />
                                  )}
                                </Badge>
                              </div>
                            </div>

                            {/* Warnings */}
                            {student.eligibility.warnings.length > 0 && (
                              <div className="space-y-1">
                                {student.eligibility.warnings.map((warning, index) => (
                                  <div key={index} className="flex items-center space-x-1 text-xs text-orange-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>{warning}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Eligibility Status */}
                            <div className="flex items-center space-x-2">
                              {student.eligibility.is_eligible ? (
                                <div className="flex items-center space-x-1 text-green-600 text-xs">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Eligible for session</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-red-600 text-xs">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Not eligible</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedStudentIds.length > 0 
              ? `${selectedStudentIds.length} student${selectedStudentIds.length > 1 ? 's' : ''} selected`
              : 'No students selected'
            }
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={onClose}
              disabled={selectedStudentIds.length === 0}
            >
              Add Selected Students
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}