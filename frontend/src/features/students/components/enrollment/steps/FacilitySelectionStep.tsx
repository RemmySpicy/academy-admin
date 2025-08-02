/**
 * Facility Selection Step Component
 * Step 3: Select facility, age group, session type, and location type with real-time pricing
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Building, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Star,
  Calculator,
  Loader2
} from 'lucide-react';
import { 
  useStudentDefaultFacility,
  useAvailableFacilities,
  useFacilityAvailability,
  usePricingCalculation
} from '../../../hooks/useEnrollmentApi';
import { EnrollmentStepProps, Facility } from '../../../types/enrollment';
import { CURRENCY } from '@/lib/constants';

// Session type options with descriptions
const SESSION_TYPE_OPTIONS = [
  {
    value: 'private',
    label: 'Private Session',
    description: 'One-on-one instruction',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'group',
    label: 'Group Session',
    description: 'Small group instruction (2-8 students)',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'school_group',
    label: 'School Group',
    description: 'Large group instruction (8+ students)',
    icon: <Users className="h-4 w-4" />,
  },
] as const;

// Location type options with descriptions
const LOCATION_TYPE_OPTIONS = [
  {
    value: 'our-facility',
    label: 'Academy Facility',
    description: 'Classes at our academy location',
    icon: <Building className="h-4 w-4" />,
  },
  {
    value: 'client-location',
    label: 'Client Location',
    description: 'Classes at your preferred location',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    value: 'virtual',
    label: 'Virtual Session',
    description: 'Online video classes',
    icon: <Clock className="h-4 w-4" />,
  },
] as const;

// Facility availability status component
function FacilityAvailabilityStatus({ 
  facility, 
  courseId, 
  selectedAgeGroup, 
  selectedSessionType, 
  selectedLocationType 
}: {
  facility: Facility;
  courseId: string;
  selectedAgeGroup?: string;
  selectedSessionType?: string;
  selectedLocationType?: string;
}) {
  const { data: availability, isLoading } = useFacilityAvailability(
    courseId,
    facility.id,
    !!(courseId && facility.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking availability...</span>
      </div>
    );
  }

  if (!availability) {
    return (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Unable to check
      </Badge>
    );
  }

  const getStatusBadge = () => {
    switch (availability.availability_status) {
      case 'available':
        return (
          <Badge variant="default" className="text-xs bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case 'not_available':
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Not Available
          </Badge>
        );
      case 'no_pricing':
        return (
          <Badge variant="secondary" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            No Pricing
          </Badge>
        );
      default:
        return null;
    }
  };

  const isCompatible = !selectedAgeGroup || !selectedSessionType || !selectedLocationType ||
    (availability.age_groups_available.includes(selectedAgeGroup) &&
     availability.session_types_available.includes(selectedSessionType as any) &&
     availability.location_types_available.includes(selectedLocationType as any));

  return (
    <div className="space-y-2">
      {getStatusBadge()}
      {!isCompatible && (
        <Badge variant="outline" className="text-xs text-orange-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Incompatible Selection
        </Badge>
      )}
      {availability.message && (
        <p className="text-xs text-muted-foreground">{availability.message}</p>
      )}
    </div>
  );
}

export function FacilitySelectionStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onValidationChange,
  isLoading,
  error,
}: EnrollmentStepProps) {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    data.selectedFacility || null
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>(
    data.selectedAgeGroup || ''
  );
  const [selectedSessionType, setSelectedSessionType] = useState<string>(
    data.selectedSessionType || ''
  );
  const [selectedLocationType, setSelectedLocationType] = useState<string>(
    data.selectedLocationType || ''
  );

  const selectedPersonId = data.selectedPerson?.id || data.newPersonData?.id;
  const selectedCourseId = data.selectedCourse?.id;

  // Fetch student's default facility
  const { 
    data: defaultFacilityData, 
    isLoading: isLoadingDefault 
  } = useStudentDefaultFacility(
    selectedPersonId || '',
    !!selectedPersonId
  );

  // Fetch available facilities for the course
  const { 
    data: availableFacilitiesData, 
    isLoading: isLoadingFacilities,
    error: facilitiesError
  } = useAvailableFacilities(
    selectedCourseId || '',
    !!selectedCourseId
  );

  // Real-time pricing calculation
  const pricingCalculation = usePricingCalculation();

  // Set default facility when data loads
  useEffect(() => {
    if (!selectedFacility && defaultFacilityData?.default_facility) {
      setSelectedFacility(defaultFacilityData.default_facility);
    }
  }, [defaultFacilityData, selectedFacility]);

  // Available age groups from course eligibility data
  const availableAgeGroups = data.selectedCourse?.age_groups || [];

  // Available session and location types from course
  const availableSessionTypes = data.selectedCourse?.session_types || [];
  const availableLocationTypes = data.selectedCourse?.location_types || [];

  // Calculate pricing when selections change
  useEffect(() => {
    if (selectedFacility && selectedAgeGroup && selectedSessionType && 
        selectedLocationType && selectedCourseId) {
      pricingCalculation.mutate({
        course_id: selectedCourseId,
        facility_id: selectedFacility.id,
        age_group: selectedAgeGroup,
        session_type: selectedSessionType as any,
        location_type: selectedLocationType as any,
      });
    }
  }, [
    selectedFacility?.id, 
    selectedAgeGroup, 
    selectedSessionType, 
    selectedLocationType, 
    selectedCourseId,
    pricingCalculation
  ]);

  // Update parent component data
  useEffect(() => {
    onUpdate({
      selectedFacility,
      facilityId: selectedFacility?.id,
      selectedAgeGroup,
      selectedSessionType: selectedSessionType as any,
      selectedLocationType: selectedLocationType as any,
      pricing: pricingCalculation.data,
    });
  }, [
    selectedFacility,
    selectedAgeGroup,
    selectedSessionType,
    selectedLocationType,
    pricingCalculation.data,
    onUpdate
  ]);

  // Validate step
  useEffect(() => {
    const isValid = !!(
      selectedFacility &&
      selectedAgeGroup &&
      selectedSessionType &&
      selectedLocationType &&
      pricingCalculation.data &&
      !pricingCalculation.isLoading
    );
    
    const errors = [];
    if (!selectedFacility) {
      errors.push({
        step: 'facility-selection' as const,
        field: 'facility',
        message: 'Please select a facility',
      });
    }
    if (!selectedAgeGroup) {
      errors.push({
        step: 'facility-selection' as const,
        field: 'ageGroup',
        message: 'Please select an age group',
      });
    }
    if (!selectedSessionType) {
      errors.push({
        step: 'facility-selection' as const,
        field: 'sessionType',
        message: 'Please select a session type',
      });
    }
    if (!selectedLocationType) {
      errors.push({
        step: 'facility-selection' as const,
        field: 'locationType',
        message: 'Please select a location type',
      });
    }
    if (pricingCalculation.error) {
      errors.push({
        step: 'facility-selection' as const,
        field: 'pricing',
        message: 'Unable to calculate pricing for selected options',
      });
    }

    onValidationChange('facility-selection', {
      isValid,
      errors,
      canProceed: isValid,
    });
  }, [
    selectedFacility,
    selectedAgeGroup,
    selectedSessionType,
    selectedLocationType,
    pricingCalculation.data,
    pricingCalculation.isLoading,
    pricingCalculation.error,
    onValidationChange
  ]);

  const facilities = availableFacilitiesData?.facilities || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Facility & Session Configuration</h3>
        <p className="text-muted-foreground">
          Select facility, age group, and session preferences for {data.selectedCourse?.name}.
        </p>
      </div>

      {/* Facility Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-5 w-5" />
            Select Facility
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFacilities && (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {facilitiesError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading facilities. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {facilities.length > 0 && (
            <div className="space-y-3">
              {/* Default facility indicator */}
              {defaultFacilityData?.default_facility && (
                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{defaultFacilityData.default_facility.name}</strong> is the recommended facility 
                    based on previous enrollments.
                  </AlertDescription>
                </Alert>
              )}

              <RadioGroup
                value={selectedFacility?.id || ''}
                onValueChange={(value) => {
                  const facility = facilities.find(f => f.id === value);
                  setSelectedFacility(facility || null);
                }}
                className="space-y-3"
              >
                {facilities.map((facility) => (
                  <div key={facility.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem 
                      value={facility.id} 
                      id={facility.id}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={facility.id} className="font-medium cursor-pointer">
                            {facility.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {facility.code}
                          </p>
                        </div>
                        {defaultFacilityData?.default_facility?.id === facility.id && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      {facility.description && (
                        <p className="text-sm text-muted-foreground">
                          {facility.description}
                        </p>
                      )}

                      {facility.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {facility.location.address}, {facility.location.city}
                        </p>
                      )}

                      {selectedCourseId && (
                        <FacilityAvailabilityStatus
                          facility={facility}
                          courseId={selectedCourseId}
                          selectedAgeGroup={selectedAgeGroup}
                          selectedSessionType={selectedSessionType}
                          selectedLocationType={selectedLocationType}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {!isLoadingFacilities && facilities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No facilities available for this course</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Age Group Selection */}
      {selectedFacility && availableAgeGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                {availableAgeGroups.map((ageGroup) => (
                  <SelectItem key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Session Type Selection */}
      {selectedFacility && selectedAgeGroup && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedSessionType}
              onValueChange={setSelectedSessionType}
              className="space-y-3"
            >
              {SESSION_TYPE_OPTIONS
                .filter(option => availableSessionTypes.includes(option.value))
                .map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Location Type Selection */}
      {selectedFacility && selectedAgeGroup && selectedSessionType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedLocationType}
              onValueChange={setSelectedLocationType}
              className="space-y-3"
            >
              {LOCATION_TYPE_OPTIONS
                .filter(option => availableLocationTypes.includes(option.value))
                .map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Real-time Pricing Display */}
      {selectedFacility && selectedAgeGroup && selectedSessionType && selectedLocationType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pricing Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pricingCalculation.isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating pricing...</span>
              </div>
            )}

            {pricingCalculation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to calculate pricing. Please check your selections.
                </AlertDescription>
              </Alert>
            )}

            {pricingCalculation.data && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    {CURRENCY.FORMAT(pricingCalculation.data.total_amount)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base price per session:</span>
                    <span>{CURRENCY.FORMAT(pricingCalculation.data.base_price_per_session)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions per payment:</span>
                    <span>{pricingCalculation.data.sessions_per_payment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{CURRENCY.FORMAT(pricingCalculation.data.subtotal)}</span>
                  </div>
                  {pricingCalculation.data.coupon_discount_amount && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon discount ({pricingCalculation.data.coupon_code}):</span>
                      <span>-{CURRENCY.FORMAT(pricingCalculation.data.coupon_discount_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Payment Requirements:</strong> Minimum payment of {CURRENCY.FORMAT(pricingCalculation.data.minimum_payment_amount)} 
                      ({pricingCalculation.data.minimum_payment_percentage}%) required to access {pricingCalculation.data.sessions_accessible_with_payment} sessions.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FacilitySelectionStep;