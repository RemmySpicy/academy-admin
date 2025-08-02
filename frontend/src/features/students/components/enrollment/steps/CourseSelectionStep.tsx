/**
 * Course Selection Step Component
 * Step 2: Display available courses and verify student eligibility
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Filter,
  Star
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCourses } from '@/lib/hooks/useCourses';
import { useStudentAgeEligibility } from '../../../hooks/useEnrollmentApi';
import { EnrollmentStepProps } from '../../../types/enrollment';
import { Course } from '@/features/courses/api/courseApiService';
import { CURRENCY } from '@/lib/constants';

// Calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Get the minimum price from pricing ranges
function getMinPrice(course: Course): number {
  if (!course.pricing_ranges || course.pricing_ranges.length === 0) {
    return 0;
  }
  return Math.min(...course.pricing_ranges.map(range => range.price_from));
}

export function CourseSelectionStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onValidationChange,
  isLoading,
  error,
}: EnrollmentStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(
    data.selectedCourse || null
  );
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Fetch courses
  const { 
    data: coursesData, 
    isLoading: isLoadingCourses, 
    error: coursesError 
  } = useCourses({
    search: debouncedSearchQuery,
    status: 'PUBLISHED',
    per_page: 20,
  });

  // Check age eligibility for selected person and course
  const selectedPersonId = data.selectedPerson?.id || (data.newPersonData?.id);
  const selectedCourseId = selectedCourse?.id;
  
  const { 
    data: eligibilityData, 
    isLoading: isCheckingEligibility, 
    error: eligibilityError 
  } = useStudentAgeEligibility(
    selectedPersonId || '',
    selectedCourseId || '',
    !!(selectedPersonId && selectedCourseId)
  );

  // Update parent component data
  useEffect(() => {
    onUpdate({
      selectedCourse,
      courseId: selectedCourse?.id,
    });
  }, [selectedCourse, onUpdate]);

  // Validate step
  useEffect(() => {
    const isValid = !!selectedCourse && !isCheckingEligibility && 
      (eligibilityData?.is_eligible ?? false);
    
    const errors = [];
    if (!selectedCourse) {
      errors.push({
        step: 'course-selection' as const,
        field: 'selectedCourse',
        message: 'Please select a course',
      });
    } else if (eligibilityData && !eligibilityData.is_eligible) {
      errors.push({
        step: 'course-selection' as const,
        field: 'ageEligibility',
        message: 'Selected person is not eligible for this course based on age requirements',
      });
    }

    onValidationChange('course-selection', {
      isValid,
      errors,
      canProceed: isValid,
    });
  }, [selectedCourse, eligibilityData, isCheckingEligibility, onValidationChange]);

  // Handle course selection
  const handleCourseSelect = useCallback((course: Course) => {
    setSelectedCourse(course);
  }, []);

  // Get student age for display
  const studentAge = data.selectedPerson?.date_of_birth 
    ? calculateAge(data.selectedPerson.date_of_birth)
    : data.newPersonData?.date_of_birth 
    ? calculateAge(data.newPersonData.date_of_birth)
    : null;

  const courses = coursesData?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Select Course</h3>
        <p className="text-muted-foreground">
          Choose a course for {data.selectedPerson?.full_name || data.newPersonData?.full_name || 'the selected person'}.
          {studentAge && ` Student age: ${studentAge} years`}
        </p>
      </div>

      {/* Course Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {isLoadingCourses && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {coursesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading courses. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {courses.length > 0 && (
          <div className="space-y-4">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              const minPrice = getMinPrice(course);
              const isEligibilityChecking = isSelected && isCheckingEligibility;
              const isEligible = isSelected && eligibilityData?.is_eligible;
              const hasEligibilityData = isSelected && eligibilityData;

              return (
                <Card 
                  key={course.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Course Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">{course.name}</h4>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {course.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm font-mono text-muted-foreground">
                            {course.code}
                          </p>
                          {course.description && (
                            <p className="text-muted-foreground">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Starting from</p>
                          <p className="text-lg font-semibold text-primary">
                            {CURRENCY.FORMAT(minPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {course.duration_weeks && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration_weeks} weeks</span>
                          </div>
                        )}
                        {course.sessions_per_payment && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.sessions_per_payment} sessions per payment</span>
                          </div>
                        )}
                        {course.max_students && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Max {course.max_students} students</span>
                          </div>
                        )}
                      </div>

                      {/* Course Badges */}
                      <div className="flex flex-wrap gap-2">
                        {course.age_groups.map((ageGroup) => (
                          <Badge key={ageGroup} variant="secondary">
                            {ageGroup}
                          </Badge>
                        ))}
                        {course.location_types.map((locationType) => (
                          <Badge key={locationType} variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {locationType.replace('_', ' ')}
                          </Badge>
                        ))}
                        {course.session_types.map((sessionType) => (
                          <Badge key={sessionType} variant="outline">
                            {sessionType.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      {/* Age Eligibility Status */}
                      {isSelected && (
                        <div className="pt-4 border-t">
                          {isEligibilityChecking && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              <span>Checking age eligibility...</span>
                            </div>
                          )}

                          {hasEligibilityData && (
                            <div className="space-y-2">
                              <div className={`flex items-center gap-2 ${
                                isEligible ? 'text-green-600' : 'text-destructive'
                              }`}>
                                {isEligible ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span className="font-medium">
                                  {isEligible ? 'Eligible for enrollment' : 'Not eligible for enrollment'}
                                </span>
                              </div>

                              {eligibilityData.eligible_age_groups.length > 0 && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    Eligible age groups:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {eligibilityData.eligible_age_groups.map((ageGroup) => (
                                      <Badge key={ageGroup} variant="secondary" className="text-xs">
                                        {ageGroup}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {eligibilityData.eligibility_details && (
                                <div className="text-xs text-muted-foreground">
                                  <p>Student age: {eligibilityData.age} years</p>
                                  {eligibilityData.eligibility_details.map((detail, index) => (
                                    <p key={index}>
                                      {detail.age_group}: {detail.min_age}-{detail.max_age} years
                                      {detail.is_eligible_for_group ? ' ✓' : ' ✗'}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {eligibilityError && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Error checking eligibility. Please try again.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoadingCourses && courses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h4 className="text-lg font-semibold mb-2">No Courses Found</h4>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No courses found matching "${searchQuery}"`
                  : "No published courses available at the moment"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Course Summary */}
      {selectedCourse && eligibilityData?.is_eligible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Selected Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-lg">{selectedCourse.name}</h4>
                <p className="text-sm font-mono text-muted-foreground">
                  {selectedCourse.code}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2">{selectedCourse.duration_weeks} weeks</span>
                </div>
                <div>
                  <span className="font-medium">Sessions per payment:</span>
                  <span className="ml-2">{selectedCourse.sessions_per_payment}</span>
                </div>
              </div>

              <div>
                <span className="font-medium text-sm">Eligible age groups:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {eligibilityData.eligible_age_groups.map((ageGroup) => (
                    <Badge key={ageGroup} variant="secondary" className="text-xs">
                      {ageGroup}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CourseSelectionStep;