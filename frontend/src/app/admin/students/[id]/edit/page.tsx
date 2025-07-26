'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Users, Building2, AlertCircle, CheckCircle, History, Settings } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';

// Import reusable components
import { PersonSearchAndSelect, OrganizationSelector, RelationshipManager, FormField } from '@/components/ui/forms';

// Hooks for data fetching
import { useStudent } from '@/features/students/hooks';

// Types
interface StudentEditFormData {
  basic_info: {
    full_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medical_notes?: string;
    additional_notes?: string;
  };
  account_settings: {
    profile_type: 'full_user' | 'profile_only';
    has_login_credentials: boolean;
    password?: string;
    roles: string[];
  };
  relationships: any[];
  organization_memberships: any[];
}

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { currentProgram } = useProgramContext();
  
  const { data: student, isLoading, error } = useStudent(studentId);
  
  // State
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<StudentEditFormData>({
    basic_info: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_notes: '',
      additional_notes: ''
    },
    account_settings: {
      profile_type: 'profile_only',
      has_login_credentials: false,
      roles: ['student']
    },
    relationships: [],
    organization_memberships: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  usePageTitle(
    student ? `Edit ${student.first_name} ${student.last_name}` : 'Edit Student',
    'Update student information and relationships'
  );

  // Initialize form data when student loads
  React.useEffect(() => {
    if (student) {
      setFormData({
        basic_info: {
          full_name: student.full_name || '',
          email: student.email || '',
          phone: student.phone || '',
          date_of_birth: student.date_of_birth || '',
          emergency_contact_name: student.emergency_contact_name || '',
          emergency_contact_phone: student.emergency_contact_phone || '',
          medical_notes: student.medical_notes || '',
          additional_notes: student.additional_notes || ''
        },
        account_settings: {
          profile_type: student.profile_type || 'profile_only',
          has_login_credentials: !!student.email && student.profile_type === 'full_user',
          roles: student.roles || ['student']
        },
        relationships: student.parent_relationships || [],
        organization_memberships: student.organization_memberships || []
      });
    }
  }, [student]);

  // Handlers
  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      basic_info: {
        ...prev.basic_info,
        [field]: value
      }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAccountSettingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      account_settings: {
        ...prev.account_settings,
        [field]: value
      }
    }));
  };

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
      const response = await fetch(`/api/v1/organizations/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}`, {
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

  const handleRelationshipAdd = useCallback((relationship: any) => {
    setFormData(prev => ({
      ...prev,
      relationships: [...prev.relationships, relationship]
    }));
  }, []);

  const handleRelationshipUpdate = useCallback((relationshipId: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.map(rel =>
        rel.id === relationshipId ? { ...rel, ...updates } : rel
      )
    }));
  }, []);

  const handleRelationshipRemove = useCallback((relationshipId: string) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.filter(rel => rel.id !== relationshipId)
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic info validation
    if (!formData.basic_info.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    // Account settings validation
    if (formData.account_settings.has_login_credentials && !formData.basic_info.email) {
      newErrors.email = 'Email is required for login credentials';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const updateData = {
        basic_info: formData.basic_info,
        account_settings: formData.account_settings,
        relationships: formData.relationships,
        organization_memberships: formData.organization_memberships
      };

      const response = await fetch(`/api/v1/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Program-Context': currentProgram?.id || ''
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update student');
      }

      router.push(`/admin/students/${studentId}`);
      
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/students/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading student...</span>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading student</div>
          <div className="text-gray-600">Failed to load student details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-600">Update student information and relationships</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={student.profile_type === 'full_user' ? 'default' : 'secondary'}>
            {student.profile_type === 'full_user' ? 'Full Account' : 'Profile Only'}
          </Badge>
          {student.organization_memberships?.length > 0 && (
            <Badge variant="outline">
              Organization Member
            </Badge>
          )}
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Student's personal information and contact details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Full Name"
                  type="text"
                  value={formData.basic_info.full_name}
                  onChange={(value) => handleBasicInfoChange('full_name', value)}
                  placeholder="Enter student's full name"
                  required
                  error={errors.full_name}
                />
                
                <FormField
                  label="Date of Birth"
                  type="date"
                  value={formData.basic_info.date_of_birth || ''}
                  onChange={(value) => handleBasicInfoChange('date_of_birth', value)}
                />
                
                <FormField
                  label="Email"
                  type="email"
                  value={formData.basic_info.email || ''}
                  onChange={(value) => handleBasicInfoChange('email', value)}
                  placeholder="student@example.com"
                  error={errors.email}
                  note={formData.account_settings.has_login_credentials ? "Required for login access" : "Optional"}
                />
                
                <FormField
                  label="Phone"
                  type="tel"
                  value={formData.basic_info.phone || ''}
                  onChange={(value) => handleBasicInfoChange('phone', value)}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Emergency Contact Name"
                    type="text"
                    value={formData.basic_info.emergency_contact_name || ''}
                    onChange={(value) => handleBasicInfoChange('emergency_contact_name', value)}
                    placeholder="Contact person name"
                  />
                  
                  <FormField
                    label="Emergency Contact Phone"
                    type="tel"
                    value={formData.basic_info.emergency_contact_phone || ''}
                    onChange={(value) => handleBasicInfoChange('emergency_contact_phone', value)}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <FormField
                  label="Medical Notes"
                  type="textarea"
                  value={formData.basic_info.medical_notes || ''}
                  onChange={(value) => handleBasicInfoChange('medical_notes', value)}
                  placeholder="Any medical conditions, allergies, or special requirements..."
                  rows={3}
                />
                
                <FormField
                  label="Additional Notes"
                  type="textarea"
                  value={formData.basic_info.additional_notes || ''}
                  onChange={(value) => handleBasicInfoChange('additional_notes', value)}
                  placeholder="Any other relevant information..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Parent-Child Relationships
                  </CardTitle>
                  <CardDescription>
                    Manage relationships with parents and guardians
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RelationshipManager
                relationships={formData.relationships}
                onRelationshipAdd={handleRelationshipAdd}
                onRelationshipUpdate={handleRelationshipUpdate}
                onRelationshipRemove={handleRelationshipRemove}
                onSearchParents={searchParents}
                mode="child-focused"
                title="My Parents & Guardians"
                description="Parents and guardians who have responsibility for this student"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Organization Memberships
                  </CardTitle>
                  <CardDescription>
                    Organizations sponsoring or supporting this student
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formData.organization_memberships.length > 0 ? (
                <div className="space-y-4">
                  {formData.organization_memberships.map((membership, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{membership.organization?.name}</h4>
                            <p className="text-sm text-gray-600">{membership.organization?.organization_type}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {membership.membership_type}
                              </Badge>
                              {membership.is_sponsored && (
                                <Badge variant="outline" className="text-green-700 border-green-200">
                                  Sponsored
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Memberships</h3>
                  <p className="text-gray-600 mb-4">
                    This student is not currently associated with any organizations.
                  </p>
                  <Button variant="outline">
                    Add Organization
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Login credentials and account configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Type */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Profile Type</label>
                    <p className="text-xs text-gray-500">
                      Determines if student can log in independently
                    </p>
                  </div>
                  <Badge variant={formData.account_settings.profile_type === 'full_user' ? "default" : "secondary"}>
                    {formData.account_settings.profile_type === 'full_user' ? "Full User" : "Profile Only"}
                  </Badge>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formData.account_settings.profile_type === 'full_user' 
                      ? "Student can log in with their own credentials and access their dashboard."
                      : "Student profile managed by parents/administrators. No independent login access."
                    }
                  </AlertDescription>
                </Alert>
              </div>

              {/* Login Credentials */}
              {formData.account_settings.profile_type === 'full_user' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Login Credentials</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Login Email"
                      type="email"
                      value={formData.basic_info.email || ''}
                      onChange={(value) => handleBasicInfoChange('email', value)}
                      placeholder="student@example.com"
                      required
                      note="Used for login authentication"
                    />
                    
                    <FormField
                      label="New Password"
                      type="password"
                      value={formData.account_settings.password || ''}
                      onChange={(value) => handleAccountSettingChange('password', value)}
                      placeholder="Enter new password (optional)"
                      note="Leave blank to keep current password"
                    />
                  </div>
                </div>
              )}

              {/* Account Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Account Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    View Activity History
                  </Button>
                  
                  {formData.account_settings.profile_type === 'profile_only' && (
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Upgrade to Full Account
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}