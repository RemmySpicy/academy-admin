'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { facilitiesApi } from '@/features/facilities/api';
import { FacilityCreate } from '@/features/facilities/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, X } from 'lucide-react';

// Import tab components (to be created)
import { FacilityDetailsTab } from '@/components/facilities/FacilityDetailsTab';
import { FacilitySpecificationTab } from '@/components/facilities/FacilitySpecificationTab';
import { FacilityAvailabilityTab } from '@/components/facilities/FacilityAvailabilityTab';
import { FacilityCoursePriceTab } from '@/components/facilities/FacilityCoursePriceTab';
import { FacilityTutorsTab } from '@/components/facilities/FacilityTutorsTab';
import { FacilityScheduleTab } from '@/components/facilities/FacilityScheduleTab';

export default function NewFacilityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilityData, setFacilityData] = useState({
    // Basic details
    name: '',
    description: '',
    facility_type: 'GYM',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    capacity: 0,
    area_sqft: 0,
    contact_phone: '',
    contact_email: '',
    
    // Enhanced fields
    facility_head_name: '',
    facility_head_phone: '',
    access_fee_kids: 0,
    access_fee_adults: 0,
    specifications: {},
    operating_hours: {},
    equipment: {},
    status: 'ACTIVE',
    facility_code: '',
    notes: ''
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!facilityData.name || !facilityData.address) {
        setError('Please fill in all required fields (Name and Address)');
        return;
      }

      // Create facility via API
      const facilityCreateData: FacilityCreate = {
        name: facilityData.name,
        description: facilityData.description,
        facility_type: facilityData.facility_type as any,
        address: facilityData.address,
        city: facilityData.city,
        state: facilityData.state,
        postal_code: facilityData.postal_code,
        country: facilityData.country,
        capacity: facilityData.capacity,
        area_sqft: facilityData.area_sqft,
        contact_phone: facilityData.contact_phone,
        contact_email: facilityData.contact_email,
        facility_head_name: facilityData.facility_head_name,
        facility_head_phone: facilityData.facility_head_phone,
        access_fee_kids: facilityData.access_fee_kids,
        access_fee_adults: facilityData.access_fee_adults,
        specifications: facilityData.specifications,
        operating_hours: facilityData.operating_hours,
        equipment: facilityData.equipment,
        status: facilityData.status as any,
        facility_code: facilityData.facility_code,
        notes: facilityData.notes
      };

      await facilitiesApi.createFacility(facilityCreateData);
      
      // Redirect to facilities list after successful save
      router.push('/admin/facilities');
    } catch (error: any) {
      console.error('Error saving facility:', error);
      setError(error.message || 'Failed to save facility. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/facilities');
  };

  const updateFacilityData = (updates: Partial<typeof facilityData>) => {
    setFacilityData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Facilities
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Facility</h1>
            <p className="text-gray-600">Enter facility data and configuration</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">{error}</div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>ENTER FACILITY DATA</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="details">DETAILS</TabsTrigger>
              <TabsTrigger value="specification">SPECIFICATION</TabsTrigger>
              <TabsTrigger value="availability">AVAILABILITY</TabsTrigger>
              <TabsTrigger value="course-price">COURSE PRICE</TabsTrigger>
              <TabsTrigger value="tutors">TUTORS</TabsTrigger>
              <TabsTrigger value="schedule">SCHEDULE</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="details" className="space-y-6">
                <FacilityDetailsTab 
                  data={facilityData} 
                  updateData={updateFacilityData}
                />
              </TabsContent>

              <TabsContent value="specification" className="space-y-6">
                <FacilitySpecificationTab 
                  data={facilityData} 
                  updateData={updateFacilityData}
                />
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <FacilityAvailabilityTab 
                  data={facilityData} 
                  updateData={updateFacilityData}
                />
              </TabsContent>

              <TabsContent value="course-price" className="space-y-6">
                <FacilityCoursePriceTab 
                  data={facilityData} 
                  updateData={updateFacilityData}
                />
              </TabsContent>

              <TabsContent value="tutors" className="space-y-6">
                <FacilityTutorsTab 
                  data={facilityData} 
                  updateData={updateFacilityData}
                />
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <FacilityScheduleTab 
                  data={facilityData} 
                  updateData={updateFacilityData}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}