'use client';

import { useState } from 'react';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for now
const mockLocations = [
  {
    id: '1',
    name: 'Main Campus',
    address: '123 Education St, Learning City, LC 12345',
    type: 'CAMPUS',
    capacity: 500,
    facilities: ['Pool', 'Gymnasium', 'Library', 'Computer Lab'],
    status: 'ACTIVE',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'main@academy.edu'
    }
  },
  {
    id: '2',
    name: 'Sports Complex',
    address: '456 Athletic Ave, Sports City, SC 67890',
    type: 'FACILITY',
    capacity: 200,
    facilities: ['Olympic Pool', 'Tennis Courts', 'Track & Field'],
    status: 'ACTIVE',
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'sports@academy.edu'
    }
  },
  {
    id: '3',
    name: 'Community Center',
    address: '789 Community Rd, Town Center, TC 54321',
    type: 'EXTERNAL',
    capacity: 100,
    facilities: ['Meeting Rooms', 'Kitchen'],
    status: 'INACTIVE',
    contact: {
      phone: '+1 (555) 345-6789',
      email: 'community@academy.edu'
    }
  }
];

export default function LocationsPage() {
  const [locations] = useState(mockLocations);

  const getStatusBadge = (status: string) => {
    const variant = status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      CAMPUS: 'bg-blue-100 text-blue-800',
      FACILITY: 'bg-green-100 text-green-800',
      EXTERNAL: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600">Manage academy locations and facilities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  {getStatusBadge(location.status)}
                  {getTypeBadge(location.type)}
                </div>
              </div>
              <CardDescription className="text-sm">
                {location.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capacity */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{location.capacity} people</span>
              </div>

              {/* Facilities */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Facilities:</p>
                <div className="flex flex-wrap gap-1">
                  {location.facilities.map((facility) => (
                    <Badge key={facility} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-600 space-y-1">
                  <div>{location.contact.phone}</div>
                  <div>{location.contact.email}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {locations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first location.</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      )}
    </div>
  );
}