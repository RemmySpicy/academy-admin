'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Users, Building2, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

// Import reusable components
import { PersonSearchAndSelect, OrganizationSelector, SimpleFormField as FormField } from '@/components/ui/forms';
import { useProgramContext } from '@/hooks/useProgramContext';
import { NewEnrollmentButton } from './EnrollmentButton';

// Types
interface StudentData {
  first_name: string;
  last_name: string;
  salutation?: string;
  email?: string;
  password?: string;
  phone?: string;
  date_of_birth?: string;
  referral_source?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  additional_notes?: string;
}

interface ParentRelationship {
  parent_id: string;
  relationship_type: 'father' | 'mother' | 'guardian' | 'stepfather' | 'stepmother' | 'grandparent' | 'other';
  is_primary_contact: boolean;
  can_pickup: boolean;
  emergency_contact: boolean;
}

interface OrganizationSponsorship {
  organization_id: string;
  payment_override?: {
    full_sponsorship?: boolean;
    partial_sponsorship?: number;
    discount_percentage?: number;
  };
}

interface CreateStudentFormData {
  student: StudentData;
  parent_relationship?: ParentRelationship;
  organization_sponsorship?: OrganizationSponsorship;
}

type CreationMode = 'independent' | 'with_parent';
type OrganizationMode = 'individual' | 'organization';

interface StudentCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StudentCreateForm({ onSuccess, onCancel }: StudentCreateFormProps) {
  const { currentProgram } = useProgramContext();
  
  // Toggle states
  const [creationMode, setCreationMode] = useState<CreationMode>('independent');
  const [organizationMode, setOrganizationMode] = useState<OrganizationMode>('individual');
  
  // Form data
  const [formData, setFormData] = useState<CreateStudentFormData>({
    student: {
      first_name: '',
      last_name: '',
      salutation: '',
      email: '',
      password: '',
      phone: '',
      date_of_birth: '',
      referral_source: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_notes: '',
      additional_notes: ''
    }
  });
  
  // UI state
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdStudent, setCreatedStudent] = useState<any>(null);
  const [showEnrollmentOption, setShowEnrollmentOption] = useState(false);

  // Handlers
  const handleStudentDataChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleParentSelect = useCallback((parent: any) => {
    setSelectedParent(parent);
    setFormData(prev => ({
      ...prev,
      // Update student data with parent information
      student: {
        ...prev.student,
        // Prefill phone from parent
        phone: prev.student.phone || parent.phone || '',
        // Set referral source to parent
        referral_source: prev.student.referral_source || parent.phone || parent.email || 'Parent referral',
        // Prefill emergency contact with parent info
        emergency_contact_name: prev.student.emergency_contact_name || `${parent.first_name} ${parent.last_name}`.trim(),
        emergency_contact_phone: prev.student.emergency_contact_phone || parent.phone || ''
      },
      parent_relationship: {
        parent_id: parent.id,
        relationship_type: 'father', // Default, user can change
        is_primary_contact: true,
        can_pickup: true,
        emergency_contact: true
      }
    }));
    setErrors(prev => ({ ...prev, parent_id: '' }));
  }, []);

  const handleParentRemove = useCallback(() => {
    setSelectedParent(null);
    setFormData(prev => {
      const { parent_relationship, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleOrganizationSelect = useCallback((organization: any) => {
    setSelectedOrganization(organization);
    setFormData(prev => ({
      ...prev,
      // Auto-fill referral source with organization name
      student: {
        ...prev.student,
        referral_source: prev.student.referral_source || organization.name
      },
      organization_sponsorship: {
        organization_id: organization.id,
        payment_override: {
          full_sponsorship: true // Default to full sponsorship
        }
      }
    }));
    setErrors(prev => ({ ...prev, organization_id: '' }));
  }, []);

  const handleOrganizationRemove = useCallback(() => {
    setSelectedOrganization(null);
    setFormData(prev => {
      const { organization_sponsorship, ...rest } = prev;
      return {
        ...rest,
        // Clear referral source if it was auto-filled with organization name
        student: {
          ...rest.student,
          referral_source: prev.student.referral_source === selectedOrganization?.name ? '' : prev.student.referral_source
        }
      };
    });
  }, [selectedOrganization]);

  const searchParents = async (query: string) => {
    try {
      const response = await fetch(`/api/v1/parents/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}`, {
        headers: {
          'X-Program-Context': currentProgram?.id || ''
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Parent search error:', error);
      return [];
    }
  };

  const searchOrganizations = async (query: string) => {
    try {
      const response = await fetch(`/api/v1/organizations/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}&partners_only=true`, {
        headers: {
          'X-Program-Context': currentProgram?.id || ''
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Organization search error:', error);
      return [];
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Student validation
    if (!formData.student.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.student.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.student.date_of_birth || !formData.student.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    // Parent validation (if with parent mode)
    if (creationMode === 'with_parent' && !selectedParent) {
      newErrors.parent_id = 'Please select a parent';
    }

    // Organization validation (if organization mode)
    if (organizationMode === 'organization' && !selectedOrganization) {
      newErrors.organization_id = 'Please select an organization';
    }

    // Email validation (required for independent students)
    if (isEmailRequired() && (!formData.student.email || !formData.student.email.trim())) {
      newErrors.email = 'Email is required for independent students';
    } else if (formData.student.email && formData.student.email.trim() && !/\S+@\S+\.\S+/.test(formData.student.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (required for independent students)
    if (isPasswordRequired() && (!formData.student.password || !formData.student.password.trim())) {
      newErrors.password = 'Password is required for independent students';
    } else if (formData.student.password && formData.student.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        creation_mode: creationMode === 'with_parent' ? 'student_with_parent' : 'independent_student',
        organization_mode: organizationMode,
        profile_data: {
          student: formData.student,
          create_login_credentials: !!(formData.student.email && formData.student.password),
          ...(creationMode === 'with_parent' && formData.parent_relationship && {
            parent_relationship: formData.parent_relationship
          }),
          ...(organizationMode === 'organization' && formData.organization_sponsorship && {
            organization_id: formData.organization_sponsorship.organization_id,
            payment_override: formData.organization_sponsorship.payment_override
          })
        },
        program_id: currentProgram?.id
      };

      const response = await fetch('/api/v1/profiles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Program-Context': currentProgram?.id || ''
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create student');
      }

      const result = await response.json();
      
      // Store created student data and show enrollment option
      setCreatedStudent(result.student || result);
      setShowEnrollmentOption(true);
      
    } catch (error) {
      console.error('Creation error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for dynamic behavior
  const getSalutationOptions = () => {
    if (creationMode === 'independent') {
      // Independent students get full adult salutations like parents
      return [
        { value: 'Mr.', label: 'Mr.' },
        { value: 'Mrs.', label: 'Mrs.' },
        { value: 'Ms.', label: 'Ms.' },
        { value: 'Dr.', label: 'Dr.' },
        { value: 'Prof.', label: 'Prof.' },
        { value: 'Chief', label: 'Chief' },
        { value: 'Hon.', label: 'Hon.' }
      ];
    } else {
      // Child students get limited salutations
      return [
        { value: 'Master', label: 'Master' },
        { value: 'Miss', label: 'Miss' }
      ];
    }
  };

  const isEmailRequired = () => creationMode === 'independent';
  const isPasswordRequired = () => creationMode === 'independent';

  // Determine form state
  const isIndependent = creationMode === 'independent';
  const isWithParent = creationMode === 'with_parent';
  const isIndividual = organizationMode === 'individual';
  const isOrganizationSponsored = organizationMode === 'organization';

  return (
    <div className="space-y-6">
      {/* Creation Mode Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Creation Options
          </CardTitle>
          <CardDescription>
            Configure how you want to create this student profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Independent vs Parent-linked Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Family Connection</label>
                  <Badge variant={isIndependent ? "outline" : "default"}>
                    {isIndependent ? "Independent Profile" : "Child of Existing Parent"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isIndependent 
                    ? "Create a standalone student profile with no family connections" 
                    : "Link this student to an existing parent in the system"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${isIndependent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Independent
                </span>
                <Switch
                  checked={isWithParent}
                  onCheckedChange={(checked) => {
                    setCreationMode(checked ? 'with_parent' : 'independent');
                    if (!checked) {
                      handleParentRemove();
                    }
                  }}
                />
                <span className={`text-sm ${isWithParent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Child
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Individual vs Organization Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Organization Membership</label>
                  <Badge variant={isIndividual ? "outline" : "default"}>
                    {isIndividual ? "Individual Student" : "Organization Member"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isIndividual 
                    ? "Regular student registration with standard payment options" 
                    : "Student associated with a partner organization (configurations, sponsorship, etc.)"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${isIndividual ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Individual
                </span>
                <Switch
                  checked={isOrganizationSponsored}
                  onCheckedChange={(checked) => {
                    setOrganizationMode(checked ? 'organization' : 'individual');
                    if (!checked) {
                      handleOrganizationRemove();
                    }
                  }}
                />
                <span className={`text-sm ${isOrganizationSponsored ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Organization
                </span>
              </div>
            </div>
            
            {isOrganizationSponsored && (
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Organization members inherit settings from their partner organization and may receive sponsorship benefits.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parent Selection (conditional) */}
      {isWithParent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Parent Selection
            </CardTitle>
            <CardDescription>
              Select the parent this student will be linked to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonSearchAndSelect
              searchLabel="Select Parent"
              placeholder="Search for parent by name, email, or phone..."
              selectedPersons={selectedParent ? [selectedParent] : []}
              onPersonSelect={handleParentSelect}
              onPersonRemove={handleParentRemove}
              onSearchFunction={searchParents}
              allowMultiple={false}
              filterRoles={['parent']}
              required
              error={errors.parent_id}
            />
            
            {selectedParent && formData.parent_relationship && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium">Relationship Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Relationship Type"
                    type="select"
                    value={formData.parent_relationship.relationship_type}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      parent_relationship: prev.parent_relationship ? {
                        ...prev.parent_relationship,
                        relationship_type: value as any
                      } : undefined
                    }))}
                    options={[
                      { value: 'father', label: 'Father' },
                      { value: 'mother', label: 'Mother' },
                      { value: 'guardian', label: 'Guardian' },
                      { value: 'stepfather', label: 'Stepfather' },
                      { value: 'stepmother', label: 'Stepmother' },
                      { value: 'grandparent', label: 'Grandparent' },
                      { value: 'other', label: 'Other' }
                    ]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.parent_relationship.is_primary_contact}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parent_relationship: prev.parent_relationship ? {
                            ...prev.parent_relationship,
                            is_primary_contact: e.target.checked
                          } : undefined
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span>Primary Contact</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.parent_relationship.can_pickup}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parent_relationship: prev.parent_relationship ? {
                            ...prev.parent_relationship,
                            can_pickup: e.target.checked
                          } : undefined
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span>Can Pick Up Student</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.parent_relationship.emergency_contact}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parent_relationship: prev.parent_relationship ? {
                            ...prev.parent_relationship,
                            emergency_contact: e.target.checked
                          } : undefined
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span>Emergency Contact</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organization Selection (conditional) */}
      {isOrganizationSponsored && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organization Sponsorship
            </CardTitle>
            <CardDescription>
              Select the partner organization that will sponsor this student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationSelector
              searchLabel="Select Sponsoring Organization"
              placeholder="Search for partner organizations..."
              selectedOrganization={selectedOrganization}
              onOrganizationSelect={handleOrganizationSelect}
              onOrganizationRemove={handleOrganizationRemove}
              onSearchFunction={searchOrganizations}
              partnersOnly={true}
              required
              error={errors.organization_id}
            />
            
            {selectedOrganization && formData.organization_sponsorship && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium">Sponsorship Details</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.organization_sponsorship.payment_override?.full_sponsorship || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        organization_sponsorship: prev.organization_sponsorship ? {
                          ...prev.organization_sponsorship,
                          payment_override: {
                            ...prev.organization_sponsorship.payment_override,
                            full_sponsorship: e.target.checked,
                            ...(e.target.checked && { partial_sponsorship: undefined, discount_percentage: undefined })
                          }
                        } : undefined
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span>Full Sponsorship (Organization pays all fees)</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Information
          </CardTitle>
          <CardDescription>
            Basic information about the student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Salutation"
              type="select"
              value={formData.student.salutation || ''}
              onChange={(value) => handleStudentDataChange('salutation', value)}
              placeholder="Select salutation"
              options={getSalutationOptions()}
              note={isIndependent ? "Professional title for independent student" : "Appropriate title for the student"}
            />
            
            <FormField
              label="First Name"
              type="text"
              value={formData.student.first_name}
              onChange={(value) => handleStudentDataChange('first_name', value)}
              placeholder="Enter first name"
              required
              error={errors.first_name}
            />
            
            <FormField
              label="Last Name"
              type="text"
              value={formData.student.last_name}
              onChange={(value) => handleStudentDataChange('last_name', value)}
              placeholder="Enter last name"
              required
              error={errors.last_name}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Date of Birth"
              type="date"
              value={formData.student.date_of_birth || ''}
              onChange={(value) => handleStudentDataChange('date_of_birth', value)}
              required
              error={errors.date_of_birth}
            />
            
            <FormField
              label="Referral (Parent, Friend, Website, Organization)"
              type="text"
              value={formData.student.referral_source || ''}
              onChange={(value) => handleStudentDataChange('referral_source', value)}
              placeholder={selectedOrganization ? selectedOrganization.name : "e.g., Parent referral, Friend, Website"}
              note={selectedOrganization ? `Auto-filled: ${selectedOrganization.name}` : "How did you hear about us?"}
            />
            
            <FormField
              label="Email"
              type="email"
              value={formData.student.email || ''}
              onChange={(value) => handleStudentDataChange('email', value)}
              placeholder="student@example.com"
              required={isEmailRequired()}
              error={errors.email}
              note={isEmailRequired() ? "Required for independent students" : "Optional for child students"}
            />
            
            <FormField
              label="Password"
              type="password"
              value={formData.student.password || ''}
              onChange={(value) => handleStudentDataChange('password', value)}
              placeholder="Enter password"
              required={isPasswordRequired()}
              error={errors.password}
              note={isPasswordRequired() ? "Required for independent students (min 6 characters)" : "Optional for child students"}
            />
            
            <FormField
              label="Phone"
              type="tel"
              value={formData.student.phone || ''}
              onChange={(value) => handleStudentDataChange('phone', value)}
              placeholder="+234 xxx xxx xxxx"
              note="Will be auto-filled if parent selected"
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Emergency Contact Name"
                type="text"
                value={formData.student.emergency_contact_name || ''}
                onChange={(value) => handleStudentDataChange('emergency_contact_name', value)}
                placeholder="Emergency contact person"
                note="Will be auto-filled if parent selected"
              />
              
              <FormField
                label="Emergency Contact Phone"
                type="tel"
                value={formData.student.emergency_contact_phone || ''}
                onChange={(value) => handleStudentDataChange('emergency_contact_phone', value)}
                placeholder="+234 xxx xxx xxxx"
                note="Will be auto-filled if parent selected"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Additional Information</h4>
            <FormField
              label="Medical Notes"
              type="textarea"
              value={formData.student.medical_notes || ''}
              onChange={(value) => handleStudentDataChange('medical_notes', value)}
              placeholder="Any medical conditions, allergies, or special needs..."
              rows={2}
            />
            
            <FormField
              label="Additional Notes"
              type="textarea"
              value={formData.student.additional_notes || ''}
              onChange={(value) => handleStudentDataChange('additional_notes', value)}
              placeholder="Any other relevant information..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Success Section with Enrollment Option */}
      {showEnrollmentOption && createdStudent && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Student Created Successfully!
            </CardTitle>
            <CardDescription className="text-green-600">
              {createdStudent.first_name} {createdStudent.last_name} has been added to the system.
              Would you like to enroll them in a course?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Next Step:</strong> Enroll {createdStudent.first_name} in courses with facility selection and payment tracking.
                </div>
                <div className="text-xs text-gray-600">
                  You can also do this later from the student's profile page.
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => onSuccess && onSuccess()}>
                  Skip for Now
                </Button>
                <NewEnrollmentButton
                  onEnrollmentComplete={(assignment) => {
                    console.log('Enrollment completed:', assignment);
                    // Call success callback after enrollment
                    if (onSuccess) {
                      onSuccess();
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!showEnrollmentOption && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Student
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}