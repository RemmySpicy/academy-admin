/**
 * Person Selection Step Component
 * Step 1: Select person to enroll (existing user or create new)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, User, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { EnrollmentStepProps } from '../../../types/enrollment';
import { User as UserType } from '@/shared/types';

// Mock user search hook (replace with actual implementation)
function useUserSearch(query: string, enabled: boolean) {
  const [data, setData] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !query || query.length < 2) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    const timeout = setTimeout(() => {
      // Mock search results
      const mockUsers: UserType[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe',
          profile_type: 'student',
          is_active: true,
          date_of_birth: '2010-05-15',
          gender: 'male',
          phone: '+234 123 456 7890',
          address: {
            street: '123 Main St',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            postal_code: '100001',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          full_name: 'Jane Smith',
          profile_type: 'student',
          is_active: true,
          date_of_birth: '2012-08-22',
          gender: 'female',
          phone: '+234 987 654 3210',
          address: {
            street: '456 Oak Ave',
            city: 'Abuja',
            state: 'FCT',
            country: 'Nigeria',
            postal_code: '900001',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ].filter(user => 
        user.full_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

      setData(mockUsers);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, enabled]);

  return { data, isLoading, error };
}

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

export function PersonSelectionStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onValidationChange,
  isLoading,
  error,
}: EnrollmentStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [personType, setPersonType] = useState<'existing' | 'new'>(
    data.personType || 'existing'
  );
  const [selectedPerson, setSelectedPerson] = useState<UserType | null>(
    data.selectedPerson || null
  );
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // User search
  const { 
    data: searchResults, 
    isLoading: isSearching, 
    error: searchError 
  } = useUserSearch(debouncedSearchQuery, personType === 'existing');

  // Update parent component data
  useEffect(() => {
    onUpdate({
      personType,
      selectedPerson,
      newPersonData: personType === 'new' ? data.newPersonData : undefined,
    });
  }, [personType, selectedPerson, onUpdate, data.newPersonData]);

  // Validate step
  useEffect(() => {
    const isValid = personType === 'existing' 
      ? !!selectedPerson
      : !!(data.newPersonData?.first_name && data.newPersonData?.last_name && data.newPersonData?.email);
    
    const errors = [];
    if (personType === 'existing' && !selectedPerson) {
      errors.push({
        step: 'person-selection' as const,
        field: 'selectedPerson',
        message: 'Please select a person to enroll',
      });
    } else if (personType === 'new') {
      if (!data.newPersonData?.first_name) {
        errors.push({
          step: 'person-selection' as const,
          field: 'firstName',
          message: 'First name is required',
        });
      }
      if (!data.newPersonData?.last_name) {
        errors.push({
          step: 'person-selection' as const,
          field: 'lastName',
          message: 'Last name is required',
        });
      }
      if (!data.newPersonData?.email) {
        errors.push({
          step: 'person-selection' as const,
          field: 'email',
          message: 'Email is required',
        });
      }
    }

    onValidationChange('person-selection', {
      isValid,
      errors,
      canProceed: isValid,
    });
  }, [personType, selectedPerson, data.newPersonData, onValidationChange]);

  // Handle person type change
  const handlePersonTypeChange = useCallback((value: string) => {
    const newPersonType = value as 'existing' | 'new';
    setPersonType(newPersonType);
    setSelectedPerson(null);
    setSearchQuery('');
  }, []);

  // Handle person selection
  const handlePersonSelect = useCallback((person: UserType) => {
    setSelectedPerson(person);
  }, []);

  // Handle new person data update
  const handleNewPersonDataUpdate = useCallback((field: string, value: string) => {
    onUpdate({
      newPersonData: {
        ...data.newPersonData,
        [field]: value,
        ...(field === 'first_name' || field === 'last_name' ? {
          full_name: `${field === 'first_name' ? value : data.newPersonData?.first_name || ''} ${field === 'last_name' ? value : data.newPersonData?.last_name || ''}`.trim()
        } : {}),
      },
    });
  }, [data.newPersonData, onUpdate]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Select Person to Enroll</h3>
        <p className="text-muted-foreground">
          Choose an existing person or create a new profile for enrollment.
        </p>
      </div>

      {/* Person Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={personType}
            onValueChange={handlePersonTypeChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="existing" id="existing" />
              <div className="flex-1">
                <Label htmlFor="existing" className="font-medium cursor-pointer">
                  Existing Person
                </Label>
                <p className="text-sm text-muted-foreground">
                  Search and select from existing users
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="new" id="new" />
              <div className="flex-1">
                <Label htmlFor="new" className="font-medium cursor-pointer">
                  New Person
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create a new user profile
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Existing Person Search */}
      {personType === 'existing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Existing Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isSearching && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error searching users. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((person) => (
                  <div
                    key={person.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPerson?.id === person.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePersonSelect(person)}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{person.full_name}</p>
                        {selectedPerson?.id === person.id && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{person.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {person.profile_type}
                        </Badge>
                        {person.date_of_birth && (
                          <Badge variant="outline" className="text-xs">
                            Age {calculateAge(person.date_of_birth)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {debouncedSearchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching "{debouncedSearchQuery}"</p>
                <p className="text-sm">Try a different search term or create a new person.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Person Form */}
      {personType === 'new' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={data.newPersonData?.first_name || ''}
                  onChange={(e) => handleNewPersonDataUpdate('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={data.newPersonData?.last_name || ''}
                  onChange={(e) => handleNewPersonDataUpdate('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={data.newPersonData?.email || ''}
                onChange={(e) => handleNewPersonDataUpdate('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={data.newPersonData?.phone || ''}
                  onChange={(e) => handleNewPersonDataUpdate('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={data.newPersonData?.date_of_birth || ''}
                  onChange={(e) => handleNewPersonDataUpdate('date_of_birth', e.target.value)}
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A new user account will be created with these details. 
                The person will receive login credentials via email.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Selected Person Summary */}
      {selectedPerson && personType === 'existing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Selected Person
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-lg">{selectedPerson.full_name}</p>
                <p className="text-muted-foreground">{selectedPerson.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {selectedPerson.profile_type}
                  </Badge>
                  {selectedPerson.date_of_birth && (
                    <Badge variant="outline">
                      Age {calculateAge(selectedPerson.date_of_birth)}
                    </Badge>
                  )}
                  <Badge variant={selectedPerson.is_active ? "default" : "destructive"}>
                    {selectedPerson.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PersonSelectionStep;