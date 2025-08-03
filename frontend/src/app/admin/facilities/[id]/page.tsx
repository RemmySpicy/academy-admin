'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { 
  Edit, 
  Settings, 
  ArrowLeft, 
  MapPin, 
  Building, 
  Users, 
  Phone, 
  Mail, 
  UserCheck,
  CheckCircle,
  AlertCircle,
  Wrench,
  Activity,
  Clock,
  DollarSign,
  Download,
  Archive,
  Trash2,
  Copy
} from 'lucide-react';
import { useFacility } from '@/features/facilities/hooks';
import { FacilityDetailsTab } from '@/components/facilities/FacilityDetailsTab';
import { FacilitySpecificationTab } from '@/components/facilities/FacilitySpecificationTab';
import { FacilityAvailabilityTab } from '@/components/facilities/FacilityAvailabilityTab';
import { FacilityScheduleTab } from '@/components/facilities/FacilityScheduleTab';
import { FacilityTutorsTab } from '@/components/facilities/FacilityTutorsTab';
import { FacilityCoursePriceTab } from '@/components/facilities/FacilityCoursePriceTab';
import type { Facility } from '@/features/facilities/types';

interface FacilityViewPageProps {
  params: { id: string };
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

const typeColors = {
  POOL: 'bg-blue-100 text-blue-800',
  COURTS: 'bg-green-100 text-green-800',
  GYM: 'bg-purple-100 text-purple-800',
  FIELD: 'bg-yellow-100 text-yellow-800',
  CLASSROOM: 'bg-orange-100 text-orange-800',
  EXTERNAL: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  ACTIVE: CheckCircle,
  INACTIVE: AlertCircle,
  MAINTENANCE: Wrench,
};

const typeIcons = {
  POOL: Activity,
  COURTS: Building,
  GYM: Building,
  FIELD: MapPin,
  CLASSROOM: Building,
  EXTERNAL: MapPin,
};

export default function FacilityViewPage({ params }: FacilityViewPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: facility, isLoading, error } = useFacility(params.id);

  usePageTitle(
    facility ? `Facility: ${facility.name}` : 'Facility Details',
    facility ? `View and manage ${facility.name} facility` : 'Loading facility details'
  );

  const StatusIcon = facility ? statusIcons[facility.status] : CheckCircle;
  const TypeIcon = facility ? typeIcons[facility.facility_type] : Building;

  const formatPrice = (fee?: number) => {
    if (!fee || fee === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(fee);
  };

  const handleEdit = () => {
    router.push(`/admin/facilities/${params.id}/edit`);
  };

  const handleDuplicate = () => {
    // TODO: Implement facility duplication
    console.log('Duplicate facility:', facility?.name);
  };

  const handleArchive = () => {
    // TODO: Implement facility archiving
    console.log('Archive facility:', facility?.name);
  };

  const handleExportData = () => {
    if (!facility) return;
    
    const exportData = {
      facility: facility,
      export_date: new Date().toISOString(),
      export_note: "Facility data export"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `facility-export-${facility.facility_code || facility.id}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDelete = () => {
    // TODO: Implement facility deletion with proper confirmation
    console.log('Delete facility:', facility?.name);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error State
  if (error || !facility) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <p>{error?.message || 'Facility not found'}</p>
              <Button variant="outline" className="mt-2" onClick={() => router.push('/admin/facilities')}>
                Back to Facilities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TypeIcon className="h-6 w-6 text-gray-500" />
              <h1 className="text-2xl font-bold">{facility.name}</h1>
              <Badge variant="secondary" className={statusColors[facility.status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {facility.status}
              </Badge>
              <Badge variant="outline" className={typeColors[facility.facility_type]}>
                {facility.facility_type}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {facility.facility_code && `${facility.facility_code} • `}
              {facility.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Facility
          </Button>
        </div>
      </div>

      {/* Facility Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facility.capacity ? `${facility.capacity.toLocaleString()}` : 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground">people</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Area</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facility.area_sqft ? `${facility.area_sqft.toLocaleString()}` : 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground">square feet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facility.access_fee_kids || facility.access_fee_adults 
                ? (facility.access_fee_kids && facility.access_fee_adults 
                    ? `${formatPrice(Math.min(facility.access_fee_kids, facility.access_fee_adults))}`
                    : formatPrice(facility.access_fee_kids || facility.access_fee_adults))
                : 'Free'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {facility.access_fee_kids && facility.access_fee_adults 
                ? `Kids: ${formatPrice(facility.access_fee_kids)}, Adults: ${formatPrice(facility.access_fee_adults)}`
                : 'per visit'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manager</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facility.facility_head_name || 'Not assigned'}
            </div>
            <p className="text-xs text-muted-foreground">
              {facility.facility_head_phone || 'No contact'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="tutors">Staff</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FacilityDetailsTab facility={facility} />
        </TabsContent>

        <TabsContent value="specifications" className="space-y-6">
          <FacilitySpecificationTab facility={facility} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <FacilityAvailabilityTab facility={facility} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <FacilityScheduleTab facility={facility} />
        </TabsContent>

        <TabsContent value="tutors" className="space-y-6">
          <FacilityTutorsTab facility={facility} />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <FacilityCoursePriceTab facility={facility} />
        </TabsContent>
      </Tabs>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Manage this facility with common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Facility
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/facilities/${facility.id}/schedule`)}>
              <Clock className="h-4 w-4 mr-2" />
              Manage Schedule
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/facilities/${facility.id}/staff`)}>
              <UserCheck className="h-4 w-4 mr-2" />
              Assign Staff
            </Button>
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}