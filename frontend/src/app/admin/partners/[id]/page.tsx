'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  Edit,
  UserPlus,
  CreditCard,
  Settings,
  FileText,
  History
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';

// Mock data - in real app this would come from API
const mockOrganization = {
  id: '1',
  name: 'Lagos Swimming Club',
  organization_type: 'sports_club',
  contact_email: 'admin@lagosswimming.com',
  contact_phone: '+234 803 123 4567',
  address: {
    street: '15 Victoria Island Road',
    city: 'Lagos',
    state: 'Lagos State',
    postal_code: '101001',
    country: 'Nigeria'
  },
  is_partner: true,
  member_count: 45,
  sponsored_students: 32,
  status: 'active',
  created_at: '2024-01-15',
  partnership_date: '2024-01-20',
  total_fees_covered: 2400000, // NGN
  monthly_budget: 400000, // NGN
  description: 'Lagos Swimming Club is a premier aquatic sports facility dedicated to developing swimming talent in Lagos State. We partner with educational institutions to provide swimming training and competitive opportunities for young athletes.',
  website: 'https://lagosswimming.com',
  registration_number: 'RC123456',
  contact_person: {
    name: 'Mrs. Adunni Adebayo',
    title: 'Sports Director',
    email: 'adunni@lagosswimming.com',
    phone: '+234 803 123 4568'
  }
};

const mockSponsoredStudents = [
  {
    id: '1',
    full_name: 'Kemi Adebola',
    age: 14,
    level: 'Intermediate',
    enrollment_date: '2024-02-01',
    fees_covered: 75000,
    sponsorship_type: 'full'
  },
  {
    id: '2',
    full_name: 'Tunde Okafor',
    age: 12,
    level: 'Beginner',
    enrollment_date: '2024-02-15',
    fees_covered: 75000,
    sponsorship_type: 'full'
  },
  {
    id: '3',
    full_name: 'Fatima Ibrahim',
    age: 16,
    level: 'Advanced',
    enrollment_date: '2024-01-30',
    fees_covered: 50000,
    sponsorship_type: 'partial'
  }
];

const mockPaymentHistory = [
  {
    id: '1',
    date: '2024-03-01',
    amount: 400000,
    status: 'completed',
    description: 'Monthly sponsorship payment - March 2024',
    students_covered: 32
  },
  {
    id: '2',
    date: '2024-02-01',
    amount: 400000,
    status: 'completed',
    description: 'Monthly sponsorship payment - February 2024',
    students_covered: 30
  },
  {
    id: '3',
    date: '2024-01-20',
    amount: 300000,
    status: 'completed',
    description: 'Initial partnership payment',
    students_covered: 25
  }
];

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');

  usePageTitle(`${mockOrganization.name}`, 'Partner organization details and management');

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
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{mockOrganization.name}</h1>
              <Badge variant="secondary">
                {getTypeDisplayName(mockOrganization.organization_type)}
              </Badge>
              <Badge className={getStatusColor(mockOrganization.status)}>
                {mockOrganization.status}
              </Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                Partner Organization
              </Badge>
            </div>
            <p className="text-gray-600">Partner since {new Date(mockOrganization.partnership_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/partners/${partnerId}/dashboard`}>
              <Settings className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/partners/${partnerId}/students/new`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/partners/${partnerId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Partner
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sponsored Students</p>
                <p className="text-2xl font-bold text-gray-900">{mockOrganization.sponsored_students}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fees Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(mockOrganization.total_fees_covered)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(mockOrganization.monthly_budget)}
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
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{mockOrganization.member_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Sponsored Students</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{mockOrganization.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Website</label>
                  <p className="text-sm text-blue-600 mt-1">
                    <a href={mockOrganization.website} target="_blank" rel="noopener noreferrer">
                      {mockOrganization.website}
                    </a>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Registration Number</label>
                  <p className="text-sm text-gray-900 mt-1">{mockOrganization.registration_number}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Partnership Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(mockOrganization.partnership_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Primary Contact</label>
                  <div className="mt-1">
                    <p className="text-sm font-medium text-gray-900">{mockOrganization.contact_person.name}</p>
                    <p className="text-sm text-gray-600">{mockOrganization.contact_person.title}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{mockOrganization.contact_email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{mockOrganization.contact_phone}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p>{mockOrganization.address.street}</p>
                      <p>{mockOrganization.address.city}, {mockOrganization.address.state}</p>
                      <p>{mockOrganization.address.postal_code}, {mockOrganization.address.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sponsored Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Sponsored Students
                  </CardTitle>
                  <CardDescription>
                    Students currently sponsored by {mockOrganization.name}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/admin/partners/${partnerId}/students/new`}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSponsoredStudents.map((student) => (
                  <Card key={student.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{student.full_name}</h4>
                            <Badge variant="secondary">{student.level}</Badge>
                            <Badge variant="outline" className={
                              student.sponsorship_type === 'full' 
                                ? 'text-green-700 border-green-200' 
                                : 'text-orange-700 border-orange-200'
                            }>
                              {student.sponsorship_type === 'full' ? 'Full Sponsorship' : 'Partial Sponsorship'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Age: {student.age} years</p>
                            <p>Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}</p>
                            <p>Fees Covered: {formatCurrency(student.fees_covered)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/students/${student.id}`}>
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockSponsoredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sponsored Students</h3>
                    <p className="text-gray-600 mb-4">
                      This organization hasn't sponsored any students yet.
                    </p>
                    <Button asChild>
                      <Link href={`/admin/partners/${partnerId}/students/new`}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Student
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment History
              </CardTitle>
              <CardDescription>
                All payments received from {mockOrganization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPaymentHistory.map((payment) => (
                  <Card key={payment.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </h4>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{payment.description}</p>
                            <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                            <p>Students Covered: {payment.students_covered}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Partnership Settings
              </CardTitle>
              <CardDescription>
                Manage partnership configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Settings className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">Payment Settings</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Configure payment schedules, amounts, and billing preferences.
                      </p>
                      <Button variant="outline" size="sm">
                        Configure Payments
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">Sponsorship Rules</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Set rules for student selection and sponsorship criteria.
                      </p>
                      <Button variant="outline" size="sm">
                        Manage Rules
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Partnership Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <History className="h-4 w-4 mr-2" />
                      View Complete Activity Log
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Partnership Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}