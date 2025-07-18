'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { facilitiesApi } from '@/features/facilities/api';
import { Facility, FacilityUpdate } from '@/features/facilities/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, X } from 'lucide-react';

// Import tab components
import { FacilityDetailsTab } from '@/components/facilities/FacilityDetailsTab';
import { FacilitySpecificationTab } from '@/components/facilities/FacilitySpecificationTab';
import { FacilityAvailabilityTab } from '@/components/facilities/FacilityAvailabilityTab';
import { FacilityCoursePriceTab } from '@/components/facilities/FacilityCoursePriceTab';
import { FacilityTutorsTab } from '@/components/facilities/FacilityTutorsTab';
import { FacilityScheduleTab } from '@/components/facilities/FacilityScheduleTab';

export default function EditFacilityPage() {
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    const loadFacilityData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const facility = await facilitiesApi.getFacility(facilityId);
        
        // Convert facility data to form format
        setFacilityData({
          name: facility.name,
          description: facility.description || '',
          facility_type: facility.facility_type,
          address: facility.address,
          city: facility.city || '',
          state: facility.state || '',
          postal_code: facility.postal_code || '',
          country: facility.country || '',
          capacity: facility.capacity || 0,
          area_sqft: facility.area_sqft || 0,
          contact_phone: facility.contact_phone || '',
          contact_email: facility.contact_email || '',
          facility_head_name: facility.facility_head_name || '',
          facility_head_phone: facility.facility_head_phone || '',
          access_fee_kids: facility.access_fee_kids || 0,
          access_fee_adults: facility.access_fee_adults || 0,
          specifications: facility.specifications || {},
          operating_hours: facility.operating_hours || {},
          equipment: facility.equipment || {},
          status: facility.status,
          facility_code: facility.facility_code || '',
          notes: facility.notes || ''
        });
        
      } catch (error: any) {
        console.error('Error loading facility:', error);
        setError(error.message || 'Failed to load facility data');
      } finally {
        setIsLoading(false);
      }
    };

    if (facilityId) {
      loadFacilityData();
    }
  }, [facilityId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!facilityData.name || !facilityData.address) {
        setError('Please fill in all required fields (Name and Address)');
        return;
      }

      // Update facility via API
      const facilityUpdateData: FacilityUpdate = {
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

      await facilitiesApi.updateFacility(facilityId, facilityUpdateData);
      
      // Redirect to facilities list after successful save
      router.push('/admin/facilities');
    } catch (error: any) {
      console.error('Error saving facility:', error);
      setError(error.message || 'Failed to save facility. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/facilities');
  };

  const updateFacilityData = (updates: Partial<typeof facilityData>) => {
    setFacilityData(prev => ({ ...prev, ...updates }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Facilities
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loading Facility...</h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Facility</h1>
            <p className="text-gray-600">{facilityData.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

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