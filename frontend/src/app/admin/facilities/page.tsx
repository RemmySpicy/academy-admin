'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useFacilities, 
  useDeleteFacility, 
  useDuplicateFacility, 
  useArchiveFacility, 
  useAssignFacilityManager 
} from '@/features/facilities/hooks';
import { FacilityCard } from '@/features/facilities/components';
import type { Facility } from '@/features/facilities/types';

export default function FacilitiesPage() {
  const router = useRouter();
  usePageTitle('Facilities', 'Manage academy facilities and equipment');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Build search parameters
  const searchParams = {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    facility_type: typeFilter !== 'all' ? typeFilter : undefined,
    page: 1,
    per_page: 50,
  };

  // Use facilities hook with program context
  const { data: facilitiesResponse, isLoading, error } = useFacilities(searchParams);
  const deleteFacilityMutation = useDeleteFacility();
  const duplicateFacilityMutation = useDuplicateFacility();
  const archiveFacilityMutation = useArchiveFacility();
  const assignManagerMutation = useAssignFacilityManager();
  
  const facilities = facilitiesResponse?.items || [];

  // All filtering is now handled by the API through search parameters
  const filteredFacilities = facilities;

  // Action handlers
  const handleView = (facility: Facility) => {
    router.push(`/admin/facilities/${facility.id}`);
  };

  const handleEdit = (facility: Facility) => {
    router.push(`/admin/facilities/${facility.id}/edit`);
  };

  const handleDuplicate = async (facility: Facility) => {
    try {
      await duplicateFacilityMutation.mutateAsync({
        facilityId: facility.id,
        duplicateData: {
          name: `${facility.name} (Copy)`,
          facility_code: `${facility.facility_code || 'COPY'}-${Date.now().toString().slice(-4)}`,
          copy_specifications: true,
          copy_equipment: true,
          copy_operating_hours: true,
          copy_pricing: false,
        }
      });
    } catch (error: any) {
      console.error('Error duplicating facility:', error);
      alert(`Failed to duplicate facility: ${error.message}`);
    }
  };

  const handleArchive = async (facility: Facility) => {
    if (!confirm(`Archive "${facility.name}"? This will make it inactive but preserve all data.`)) {
      return;
    }

    try {
      await archiveFacilityMutation.mutateAsync({
        facilityId: facility.id,
        archiveData: {
          reason: 'Manual archive from facilities page',
          archive_date: new Date().toISOString(),
          notify_users: true,
        }
      });
    } catch (error: any) {
      console.error('Error archiving facility:', error);
      alert(`Failed to archive facility: ${error.message}`);
    }
  };

  const handleExportData = (facility: Facility) => {
    const exportData = {
      facility: facility,
      export_date: new Date().toISOString(),
      export_note: "Facility data export from facilities listing"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `facility-export-${facility.facility_code || facility.id}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleAssignManager = (facility: Facility) => {
    // TODO: Open manager assignment dialog
    console.log('Assign manager to facility:', facility.name);
  };

  const handleManageSchedule = (facility: Facility) => {
    router.push(`/admin/facilities/${facility.id}?tab=schedule`);
  };

  const handleDelete = async (facility: Facility) => {
    // Offer to backup facility data first
    const shouldBackup = confirm(`📄 BACKUP FACILITY DATA
    
Before deleting "${facility.name}", would you like to download a backup of the facility data?

Click OK to download backup first, or Cancel to skip backup.`);

    if (shouldBackup) {
      handleExportData(facility);
      alert("✅ Facility backup downloaded successfully.");
    }

    // Enhanced protection against accidental deletion
    const confirmMessage = `⚠️ WARNING: DELETE FACILITY
    
You are about to permanently delete "${facility.name}".

This action will:
• Remove all facility data
• Cannot be undone
• May affect associated programs and schedules

Type "DELETE" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    if (userInput !== "DELETE") {
      alert("Deletion cancelled. Facility was not deleted.");
      return;
    }

    // Double confirmation
    if (!confirm(`Final confirmation: Delete "${facility.name}"? Click Cancel to keep the facility.`)) {
      alert("Deletion cancelled. Facility was not deleted.");
      return;
    }

    try {
      await deleteFacilityMutation.mutateAsync(facility.id);
      alert(`✅ Facility "${facility.name}" has been successfully deleted.`);
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      alert(`❌ Error: Failed to delete facility. ${error.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Showing {filteredFacilities.length} of {facilities.length} facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => router.push('/admin/facilities/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search facilities by name, address, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="POOL">Pool</SelectItem>
                  <SelectItem value="COURTS">Courts</SelectItem>
                  <SelectItem value="GYM">Gym</SelectItem>
                  <SelectItem value="FIELD">Field</SelectItem>
                  <SelectItem value="CLASSROOM">Classroom</SelectItem>
                  <SelectItem value="EXTERNAL">External</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
          
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredFacilities.length} of {facilities.length} facilities
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <p>{error.message || 'An error occurred while loading facilities'}</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Facilities Display */}
      {!isLoading && !error && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              viewMode={viewMode}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onExportData={handleExportData}
              onAssignManager={handleAssignManager}
              onManageSchedule={handleManageSchedule}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredFacilities.length === 0 && facilities.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first facility.</p>
          <Button onClick={() => window.location.href = '/admin/facilities/new'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isLoading && !error && filteredFacilities.length === 0 && facilities.length > 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}