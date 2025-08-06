'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';
import Link from 'next/link';

// Mock data - in real app this would come from API
const mockOrganizations = [
  {
    id: '1',
    name: 'Lagos Swimming Club',
    organization_type: 'sports_club',
    contact_email: 'admin@lagosswimming.com',
    contact_phone: '+234 803 123 4567',
    address: {
      street: '15 Victoria Island Road',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria'
    },
    is_partner: true,
    member_count: 45,
    sponsored_students: 32,
    status: 'active',
    created_at: '2024-01-15',
    total_fees_covered: 2400000 // NGN
  },
  {
    id: '2',
    name: 'International School Lagos',
    organization_type: 'school',
    contact_email: 'sports@isl.edu.ng',
    contact_phone: '+234 801 987 6543',
    address: {
      street: '20 Admiralty Way',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria'
    },
    is_partner: true,
    member_count: 120,
    sponsored_students: 85,
    status: 'active',
    created_at: '2024-02-01',
    total_fees_covered: 8500000 // NGN
  },
  {
    id: '3',
    name: 'Youth Development Foundation',
    organization_type: 'non_profit',
    contact_email: 'programs@ydf.org.ng',
    contact_phone: '+234 805 456 7890',
    address: {
      street: '45 Allen Avenue',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria'
    },
    is_partner: true,
    member_count: 200,
    sponsored_students: 150,
    status: 'active',
    created_at: '2024-01-10',
    total_fees_covered: 6750000 // NGN
  }
];

const mockStats = {
  total_partners: 3,
  total_sponsored_students: 267,
  total_revenue_covered: 17650000, // NGN
  active_partnerships: 3
};

export default function PartnersPage() {
  usePageTitle('Partners Management', 'Manage partner organizations and sponsorships');
  
  const { currentProgram } = useProgramContext();
  const [activeTab, setActiveTab] = useState('organizations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Filter organizations based on search and type
  const filteredOrganizations = mockOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          org.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || org.organization_type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeDisplayName = (type: string) => {
    const types: Record<string, string> = {
      school: 'School',
      company: 'Company',
      non_profit: 'Non-Profit',
      government: 'Government',
      religious: 'Religious',
      sports_club: 'Sports Club',
      community: 'Community',
      other: 'Other'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-muted text-muted-foreground',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partners Management</h1>
          <p className="text-muted-foreground">Manage partner organizations and sponsorship programs</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href="/admin/partners/reports">
              <TrendingUp className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/partners/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.total_partners}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sponsored Students</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.total_sponsored_students}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(mockStats.total_revenue_covered)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Partnerships</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.active_partnerships}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
          <TabsTrigger value="requests">Partnership Requests</TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Partner Organizations
                  </CardTitle>
                  <CardDescription>
                    Organizations that sponsor students in your program
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="non_profit">Non-Profit</SelectItem>
                    <SelectItem value="sports_club">Sports Club</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organizations List */}
              <div className="space-y-4">
                {filteredOrganizations.map((org) => (
                  <Card key={org.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                            <Badge variant="secondary">
                              {getTypeDisplayName(org.organization_type)}
                            </Badge>
                            <Badge className={getStatusColor(org.status)}>
                              {org.status}
                            </Badge>
                            <Badge variant="outline" className="text-blue-700 border-blue-200">
                              Partner
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {org.contact_email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {org.contact_phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {org.address.city}, {org.address.state}
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{org.member_count} total members</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <UserPlus className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600">{org.sponsored_students} sponsored students</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4 text-purple-500" />
                              <span className="text-gray-600">{formatCurrency(org.total_fees_covered)} covered</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/partners/${org.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/partners/${org.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredOrganizations.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? 'No organizations match your search criteria.' : 'No partner organizations have been added yet.'}
                    </p>
                    <Button asChild>
                      <Link href="/admin/partners/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Partner
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sponsorships Tab */}
        <TabsContent value="sponsorships">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Active Sponsorships
              </CardTitle>
              <CardDescription>
                Students currently sponsored by partner organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sponsorships Management</h3>
                <p className="text-gray-600 mb-4">
                  View and manage all student sponsorships by partner organizations.
                </p>
                <p className="text-sm text-gray-500">
                  This feature will show detailed sponsorship relationships, payment status, and sponsorship terms.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partnership Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Partnership Requests
              </CardTitle>
              <CardDescription>
                Organizations requesting to become partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600 mb-4">
                  There are currently no pending partnership requests to review.
                </p>
                <p className="text-sm text-gray-500">
                  When organizations apply to become partners, they will appear here for approval.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}