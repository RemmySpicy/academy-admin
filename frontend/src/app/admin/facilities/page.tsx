'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { facilitiesApi } from '@/features/facilities/api';
import { Facility } from '@/features/facilities/types';

// Mock data for now
const mockFacilities = [
  {
    id: '1',
    name: 'Olympic Swimming Pool',
    address: '123 Aquatic Center, Pool City, PC 12345',
    type: 'POOL',
    capacity: 200,
    equipment: ['Starting Blocks', 'Timing System', 'Pool Deck', 'Underwater Cameras'],
    amenities: ['Locker Rooms', 'Viewing Gallery', 'Equipment Storage'],
    status: 'ACTIVE',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'aquatics@academy.edu'
    }
  },
  {
    id: '2',
    name: 'Tennis Court Complex',
    address: '456 Sports Ave, Athletic City, AC 67890',
    type: 'COURTS',
    capacity: 100,
    equipment: ['Clay Courts', 'Hard Courts', 'Net Systems', 'Court Lighting'],
    amenities: ['Pro Shop', 'Changing Rooms', 'Seating Areas'],
    status: 'ACTIVE',
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'tennis@academy.edu'
    }
  },
  {
    id: '3',
    name: 'Multi-Purpose Gymnasium',
    address: '789 Fitness Rd, Training Center, TC 54321',
    type: 'GYM',
    capacity: 300,
    equipment: ['Basketball Hoops', 'Volleyball Nets', 'Gymnastics Equipment', 'Sound System'],
    amenities: ['Storage Rooms', 'Score Board', 'Spectator Seating'],
    status: 'ACTIVE',
    contact: {
      phone: '+1 (555) 345-6789',
      email: 'gym@academy.edu'
    }
  }
];

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getStatusBadge = (status: string) => {
    const variant = status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      POOL: 'bg-blue-100 text-blue-800',
      COURTS: 'bg-green-100 text-green-800',
      GYM: 'bg-purple-100 text-purple-800',
      FIELD: 'bg-yellow-100 text-yellow-800',
      CLASSROOM: 'bg-orange-100 text-orange-800',
      EXTERNAL: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    );
  };

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await facilitiesApi.getFacilities();
        setFacilities(response.items);
      } catch (error: any) {
        console.error('Error loading facilities:', error);
        setError(error.message || 'Failed to load facilities');
        // Fallback to mock data if API fails
        setFacilities(mockFacilities as any);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  // Filter facilities based on search and filters
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (facility.facility_code && facility.facility_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || facility.status === statusFilter;
    const matchesType = typeFilter === 'all' || facility.facility_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (facilityId: string, facilityName: string) => {
    if (!confirm(`Are you sure you want to delete "${facilityName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(facilityId);
      await facilitiesApi.deleteFacility(facilityId);
      
      // Remove from local state
      setFacilities(prev => prev.filter(f => f.id !== facilityId));
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      setError(error.message || 'Failed to delete facility');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-600">Manage academy facilities and equipment</p>
        </div>
        <Button onClick={() => window.location.href = '/admin/facilities/new'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
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
              <p>{error}</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Facilities Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    {getStatusBadge(facility.status)}
                    {getTypeBadge(facility.facility_type)}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {facility.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Capacity */}
                {facility.capacity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{facility.capacity} people</span>
                  </div>
                )}

                {/* Facility Head */}
                {facility.facility_head_name && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">{facility.facility_head_name}</span>
                  </div>
                )}

                {/* Facility Code */}
                {facility.facility_code && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-medium">{facility.facility_code}</span>
                  </div>
                )}

                {/* Amenities */}
                {facility.equipment?.amenities && facility.equipment.amenities.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="font-medium">Amenities:</div>
                      <div className="flex flex-wrap gap-1">
                        {facility.equipment.amenities.slice(0, 3).map((amenity: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {facility.equipment.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{facility.equipment.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-600 space-y-1">
                    {facility.contact_phone && <div>{facility.contact_phone}</div>}
                    {facility.contact_email && <div>{facility.contact_email}</div>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/admin/facilities/${facility.id}/edit`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(facility.id, facility.name)}
                    disabled={deletingId === facility.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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