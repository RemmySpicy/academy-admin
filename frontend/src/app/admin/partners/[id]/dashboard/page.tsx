'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Users, 
  Search,
  Filter,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  BarChart3,
  Download,
  Mail,
  Phone
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';

// Mock data - in real app this would come from API
const mockPartnerInfo = {
  id: '1',
  name: 'Lagos Swimming Club',
  contact_person: 'Mrs. Adunni Adebayo',
  contact_email: 'adunni@lagosswimming.com',
  monthly_budget: 400000,
  max_students: 50,
  current_students: 32
};

const mockDashboardStats = {
  active_sponsorships: 32,
  pending_payments: 2,
  this_month_spent: 320000,
  remaining_budget: 80000,
  students_on_waitlist: 8,
  average_fee_per_student: 10000
};

const mockSponsoredStudents = [
  {
    id: '1',
    full_name: 'Kemi Adebola',
    age: 14,
    level: 'Intermediate',
    enrollment_date: '2024-02-01',
    monthly_fee: 10000,
    sponsorship_type: 'full',
    payment_status: 'current',
    last_payment: '2024-03-01',
    attendance_rate: 95,
    progress_score: 85
  },
  {
    id: '2',
    full_name: 'Tunde Okafor',
    age: 12,
    level: 'Beginner',
    enrollment_date: '2024-02-15',
    monthly_fee: 10000,
    sponsorship_type: 'full',
    payment_status: 'pending',
    last_payment: '2024-02-15',
    attendance_rate: 88,
    progress_score: 78
  },
  {
    id: '3',
    full_name: 'Fatima Ibrahim',
    age: 16,
    level: 'Advanced',
    enrollment_date: '2024-01-30',
    monthly_fee: 15000,
    sponsorship_type: 'partial',
    payment_status: 'current',
    last_payment: '2024-03-01',
    attendance_rate: 97,
    progress_score: 92
  }
];

const mockPaymentAlerts = [
  {
    id: '1',
    type: 'payment_due',
    message: 'Payment due for 2 students',
    amount: 20000,
    due_date: '2024-03-15',
    priority: 'high'
  },
  {
    id: '2',
    type: 'budget_limit',
    message: 'Approaching monthly budget limit',
    percentage: 85,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'attendance_low',
    message: '3 students with low attendance',
    priority: 'low'
  }
];

export default function PartnerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  usePageTitle(`${mockPartnerInfo.name} - Dashboard`, 'Partner dashboard for managing sponsored students');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      current: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-destructive/10 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-primary';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'border-red-500 bg-red-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-blue-500 bg-blue-50'
    };
    return colors[priority] || 'border-border bg-muted';
  };

  const filteredStudents = mockSponsoredStudents.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.payment_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partner
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockPartnerInfo.name}</h1>
            <p className="text-gray-600">Partnership Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button asChild>
            <Link href={`/admin/partners/${partnerId}/students/new`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">{mockDashboardStats.active_sponsorships}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(mockDashboardStats.this_month_spent)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Left</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(mockDashboardStats.remaining_budget)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{mockDashboardStats.pending_payments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Waitlist</p>
                <p className="text-2xl font-bold text-foreground">{mockDashboardStats.students_on_waitlist}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Fee</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(mockDashboardStats.average_fee_per_student)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {mockPaymentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPaymentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getPriorityColor(alert.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{alert.message}</p>
                      {alert.amount && (
                        <p className="text-sm text-muted-foreground">Amount: {formatCurrency(alert.amount)}</p>
                      )}
                      {alert.due_date && (
                        <p className="text-sm text-muted-foreground">Due: {new Date(alert.due_date).toLocaleDateString()}</p>
                      )}
                      {alert.percentage && (
                        <p className="text-sm text-muted-foreground">Budget used: {alert.percentage}%</p>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Budget</span>
                  <span className="font-semibold">{formatCurrency(mockPartnerInfo.monthly_budget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Spent This Month</span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(mockDashboardStats.this_month_spent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(mockDashboardStats.remaining_budget)}
                  </span>
                </div>
                
                {/* Budget Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Usage</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Partnership Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                  <p className="text-sm text-foreground mt-1">{mockPartnerInfo.contact_person}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{mockPartnerInfo.contact_email}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Student Capacity</span>
                    <span className="text-sm font-medium">
                      {mockPartnerInfo.current_students} / {mockPartnerInfo.max_students}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(mockPartnerInfo.current_students / mockPartnerInfo.max_students) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
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
                    Manage students sponsored by {mockPartnerInfo.name}
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
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Students List */}
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-foreground">{student.full_name}</h4>
                            <Badge variant="secondary">{student.level}</Badge>
                            <Badge className={getPaymentStatusColor(student.payment_status)}>
                              {student.payment_status}
                            </Badge>
                            <Badge variant="outline" className={
                              student.sponsorship_type === 'full' 
                                ? 'text-green-700 border-green-200' 
                                : 'text-orange-700 border-orange-200'
                            }>
                              {student.sponsorship_type === 'full' ? 'Full' : 'Partial'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Age:</span> {student.age} years
                            </div>
                            <div>
                              <span className="font-medium">Monthly Fee:</span> {formatCurrency(student.monthly_fee)}
                            </div>
                            <div>
                              <span className="font-medium">Attendance:</span> {student.attendance_rate}%
                            </div>
                            <div>
                              <span className="font-medium">Progress:</span> 
                              <span className={`ml-1 ${getProgressColor(student.progress_score)}`}>
                                {student.progress_score}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
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

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Students Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'No students match your search criteria.' 
                        : 'No sponsored students yet.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Management
              </CardTitle>
              <CardDescription>
                Track payments and financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Payment Management</h3>
                <p className="text-gray-600 mb-4">
                  Detailed payment tracking, invoice generation, and financial reporting.
                </p>
                <p className="text-sm text-muted-foreground">
                  This feature will include payment schedules, automated billing, and payment history.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics including student progress, attendance trends, and ROI metrics.
                </p>
                <p className="text-sm text-muted-foreground">
                  This feature will provide charts, graphs, and detailed reports on partnership performance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}