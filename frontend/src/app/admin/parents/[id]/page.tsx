'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  Activity,
  Clock,
  BookOpen,
  Award,
  FileText,
  Heart,
  Baby,
  Users,
  MessageSquare,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { useParent, useParentFamily } from '@/features/parents/hooks/useParents';
import { ParentChildManager } from '@/features/students/components';
import { 
  useUserRelationships, 
  useCreateRelationship, 
  useUpdateRelationship, 
  useDeleteRelationship 
} from '@/features/students/hooks/useUserRelationships';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'read':
      return 'bg-purple-100 text-purple-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Mock communication history data
const mockCommunications = [
  {
    id: '1',
    type: 'email',
    subject: 'Swimming Schedule Update',
    content: 'Your child\'s swimming schedule has been updated for next week.',
    direction: 'outbound',
    status: 'read',
    sent_at: '2025-01-15T10:30:00Z',
    read_at: '2025-01-15T14:20:00Z',
    created_by: 'Coach Smith'
  },
  {
    id: '2',
    type: 'sms',
    content: 'Reminder: Johnny has swimming class tomorrow at 3 PM',
    direction: 'outbound',
    status: 'delivered',
    sent_at: '2025-01-14T18:00:00Z',
    created_by: 'System'
  },
  {
    id: '3',
    type: 'phone',
    subject: 'Progress Discussion',
    content: 'Discussed Johnny\'s progress in backstroke technique.',
    direction: 'inbound',
    status: 'completed',
    sent_at: '2025-01-12T15:45:00Z',
    created_by: 'Jane Doe'
  }
];

// Mock financial summary data
const mockFinancialSummary = {
  total_fees: 1200.00,
  total_paid: 800.00,
  outstanding_balance: 400.00,
  overdue_amount: 150.00,
  children_breakdown: [
    {
      child_id: '1',
      child_name: 'Johnny Doe',
      total_fees: 800.00,
      amount_paid: 600.00,
      outstanding_balance: 200.00,
      last_payment_date: '2025-01-01',
      next_due_date: '2025-02-01'
    },
    {
      child_id: '2', 
      child_name: 'Emma Doe',
      total_fees: 400.00,
      amount_paid: 200.00,
      outstanding_balance: 200.00,
      last_payment_date: '2024-12-15',
      next_due_date: '2025-01-15'
    }
  ],
  payment_history: [
    {
      id: '1',
      amount: 300.00,
      payment_date: '2025-01-01',
      payment_method: 'Credit Card',
      reference: 'PAY-2025-001',
      child_id: '1',
      description: 'Swimming Program - January'
    },
    {
      id: '2',
      amount: 200.00,
      payment_date: '2024-12-15',
      payment_method: 'Bank Transfer',
      reference: 'PAY-2024-045',
      child_id: '2',
      description: 'Water Safety Course'
    }
  ]
};

// Mock enrollment summary data
const mockEnrollmentSummary = {
  children_enrollments: [
    {
      child_id: '1',
      child_name: 'Johnny Doe',
      enrollments: [
        {
          id: '1',
          program_name: 'Swimming Program',
          course_name: 'Advanced Swimming',
          level: 'Level 3',
          instructor: 'Coach Smith',
          status: 'active',
          start_date: '2025-01-01',
          end_date: '2025-06-30',
          schedule: 'Mon, Wed, Fri 3:00-4:00 PM',
          progress_percentage: 75
        }
      ]
    },
    {
      child_id: '2',
      child_name: 'Emma Doe', 
      enrollments: [
        {
          id: '2',
          program_name: 'Water Safety',
          course_name: 'Beginner Water Safety',
          level: 'Beginner',
          instructor: 'Coach Johnson',
          status: 'active',
          start_date: '2025-01-15',
          end_date: '2025-04-15',
          schedule: 'Tue, Thu 4:00-5:00 PM',
          progress_percentage: 30
        }
      ]
    }
  ],
  family_schedule: [
    {
      day: 'Monday',
      sessions: [
        {
          time: '3:00-4:00 PM',
          child_name: 'Johnny Doe',
          program: 'Swimming Program',
          course: 'Advanced Swimming',
          instructor: 'Coach Smith',
          location: 'Pool A'
        }
      ]
    },
    {
      day: 'Tuesday',
      sessions: [
        {
          time: '4:00-5:00 PM',
          child_name: 'Emma Doe',
          program: 'Water Safety',
          course: 'Beginner Water Safety',
          instructor: 'Coach Johnson',
          location: 'Pool B'
        }
      ]
    }
  ]
};

export default function ParentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const parentId = params.id as string;

  // Use React Query hooks for parent data
  const { data: parentResponse, isLoading: parentLoading, error: parentError } = useParent(parentId);
  const { data: familyResponse, isLoading: familyLoading } = useParentFamily(parentId);

  // User relationships hooks (for children management)
  const { data: relationships = [], isLoading: relationshipsLoading } = useUserRelationships(parentId);
  const createRelationshipMutation = useCreateRelationship();
  const updateRelationshipMutation = useUpdateRelationship();
  const deleteRelationshipMutation = useDeleteRelationship();

  // Mock data states
  const [communications] = useState(mockCommunications);
  const [financialSummary] = useState(mockFinancialSummary);
  const [enrollmentSummary] = useState(mockEnrollmentSummary);

  const parent = parentResponse?.data;
  const familyStructure = familyResponse?.data;

  const handleCreateRelationship = async (data: any) => {
    await createRelationshipMutation.mutateAsync(data);
  };

  const handleUpdateRelationship = async (id: string, data: any) => {
    await updateRelationshipMutation.mutateAsync({ id, data });
  };

  const handleDeleteRelationship = async (id: string) => {
    await deleteRelationshipMutation.mutateAsync(id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this parent? This action cannot be undone.')) {
      console.log('Delete parent:', parentId);
      router.push('/admin/students'); // Navigate back to unified page
    }
  };

  if (parentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading parent details...</span>
      </div>
    );
  }

  if (parentError || !parent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading parent</div>
          <div className="text-gray-600 mb-4">Failed to load parent details</div>
          <Button onClick={() => router.push('/admin/students')}>Back to Management</Button>
        </div>
      </div>
    );
  }

  const age = parent.date_of_birth ? calculateAge(parent.date_of_birth) : null;
  const childrenCount = familyStructure?.children?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Management
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {parent.full_name || parent.username}
            </h1>
            <p className="text-gray-600">
              Parent • {childrenCount} {childrenCount === 1 ? 'Child' : 'Children'} • 
              {parent.created_at ? ` Joined ${new Date(parent.created_at).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={`/admin/parents/${parentId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Parent
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Parent Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">
                  {parent.full_name ? parent.full_name.split(' ').map(n => n[0]).join('') : parent.username[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {parent.full_name || parent.username}
                </h2>
                <p className="text-gray-600">{parent.email}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <Baby className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{childrenCount} children</span>
                  </div>
                  {parent.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{parent.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                parent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {parent.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile Overview</TabsTrigger>
          <TabsTrigger value="children">Children Management</TabsTrigger>
          <TabsTrigger value="communications">Communication History</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
          <TabsTrigger value="enrollments">Program Enrollments</TabsTrigger>
        </TabsList>

        {/* Profile Overview Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-sm text-gray-900">
                    {parent.salutation ? `${parent.salutation} ` : ''}{parent.first_name} {parent.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-sm text-gray-900">{parent.username}</p>
                </div>
                {parent.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-sm text-gray-900">
                      {new Date(parent.date_of_birth).toLocaleDateString()} {age && `(Age ${age})`}
                    </p>
                  </div>
                )}
                {parent.referral_source && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">How they heard about us</label>
                    <p className="text-sm text-gray-900">{parent.referral_source}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <p className="text-sm text-gray-900">{parent.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {parent.created_at ? new Date(parent.created_at).toLocaleDateString() : 'Unknown'}
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
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">{parent.email}</p>
                </div>
                {parent.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm text-gray-900">{parent.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Login</label>
                  <p className="text-sm text-gray-900">
                    {parent.last_login_at ? new Date(parent.last_login_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Family Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Family Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Number of Children</label>
                  <p className="text-sm text-gray-900">{childrenCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Active Enrollments</label>
                  <p className="text-sm text-gray-900">
                    {enrollmentSummary.children_enrollments.reduce((total, child) => 
                      total + child.enrollments.filter(e => e.status === 'active').length, 0
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Programs Involved</label>
                  <p className="text-sm text-gray-900">
                    {[...new Set(enrollmentSummary.children_enrollments.flatMap(child => 
                      child.enrollments.map(e => e.program_name)
                    ))].join(', ') || 'None'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Preferred Method</label>
                  <p className="text-sm text-gray-900">Email</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email Notifications</label>
                  <p className="text-sm text-gray-900">Enabled</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SMS Notifications</label>
                  <p className="text-sm text-gray-900">Enabled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Children Management Tab */}
        <TabsContent value="children">
          <ParentChildManager
            userId={parentId}
            userRole="parent"
            relationships={relationships}
            onRelationshipCreate={handleCreateRelationship}
            onRelationshipUpdate={handleUpdateRelationship}
            onRelationshipDelete={handleDeleteRelationship}
            isLoading={relationshipsLoading || familyLoading}
          />
        </TabsContent>

        {/* Communication History Tab */}
        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Communication History
              </CardTitle>
              <CardDescription>Messages, notes, and interactions with this parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((communication) => (
                  <div key={communication.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {communication.type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                          {communication.type === 'sms' && <MessageSquare className="h-4 w-4 text-green-500" />}
                          {communication.type === 'phone' && <Phone className="h-4 w-4 text-purple-500" />}
                          <span className="text-sm font-medium capitalize">{communication.type}</span>
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{communication.direction}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(communication.status)}`}>
                          {communication.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(communication.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {communication.subject && (
                      <h4 className="font-medium mb-1">{communication.subject}</h4>
                    )}
                    <p className="text-sm text-gray-700 mb-2">{communication.content}</p>
                    <div className="text-xs text-gray-500">
                      {communication.direction === 'outbound' ? 'Sent by' : 'From'}: {communication.created_by}
                      {communication.read_at && (
                        <span className="ml-4">
                          Read: {new Date(communication.read_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send New Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Summary Tab */}
        <TabsContent value="financial">
          <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${financialSummary.total_fees}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <CreditCard className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${financialSummary.total_paid}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">${financialSummary.outstanding_balance}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${financialSummary.overdue_amount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Children Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Breakdown by Child</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialSummary.children_breakdown.map((child) => (
                    <div key={child.child_id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{child.child_name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Fees</p>
                          <p className="font-medium">${child.total_fees}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount Paid</p>
                          <p className="font-medium text-green-600">${child.amount_paid}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Outstanding</p>
                          <p className="font-medium text-yellow-600">${child.outstanding_balance}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Next Due</p>
                          <p className="font-medium">
                            {child.next_due_date ? new Date(child.next_due_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {financialSummary.payment_history.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{payment.description}</p>
                          <p className="text-xs text-gray-500">
                            {payment.payment_method} • {payment.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${payment.amount}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Program Enrollments Tab */}
        <TabsContent value="enrollments">
          <div className="space-y-6">
            {/* Family Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Family Schedule Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrollmentSummary.family_schedule.map((day) => (
                    <div key={day.day} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{day.day}</h4>
                      <div className="space-y-2">
                        {day.sessions.map((session, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{session.time}</p>
                            <p className="text-gray-600">{session.child_name}</p>
                            <p className="text-gray-500">{session.course} • {session.instructor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Children Enrollments */}
            <div className="space-y-4">
              {enrollmentSummary.children_enrollments.map((child) => (
                <Card key={child.child_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Baby className="h-5 w-5 mr-2" />
                      {child.child_name} - Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {child.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{enrollment.course_name}</h4>
                              <p className="text-sm text-gray-600">{enrollment.program_name} • {enrollment.level}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
                              {enrollment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Instructor</p>
                              <p className="font-medium">{enrollment.instructor}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Schedule</p>
                              <p className="font-medium">{enrollment.schedule}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Start Date</p>
                              <p className="font-medium">{new Date(enrollment.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">End Date</p>
                              <p className="font-medium">
                                {enrollment.end_date ? new Date(enrollment.end_date).toLocaleDateString() : 'Ongoing'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{enrollment.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${enrollment.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Navigation Panel */}
      {familyStructure?.children && familyStructure.children.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Baby className="h-5 w-5 mr-2" />
              Quick Access to Children
            </CardTitle>
            <CardDescription className="text-blue-600">
              Navigate directly to children's profiles and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyStructure.children.map((childRel) => (
                <Card key={childRel.user.id} className="bg-white border-blue-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Baby className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{childRel.user.full_name || childRel.user.username}</h4>
                        <p className="text-sm text-gray-600 capitalize">{childRel.relationship_type}</p>
                        {childRel.user.date_of_birth && (
                          <p className="text-xs text-gray-500">
                            Age {calculateAge(childRel.user.date_of_birth)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link href={`/admin/students/${childRel.user.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`mailto:${childRel.user.email}`, '_blank')}
                        title="Send email"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}