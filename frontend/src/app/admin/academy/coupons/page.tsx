'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Percent,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function CouponManagementPage() {
  usePageTitle('Coupon Management', 'Manage discount coupons and promotional codes');

  // Sample data for UI demonstration
  const sampleCoupons = [
    {
      id: '1',
      code: 'WELCOME2025',
      description: 'Welcome discount for new students',
      discount_type: 'percentage',
      discount_value: 20,
      max_uses: 100,
      used_count: 25,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      is_active: true,
      applicable_programs: ['Swimming Program', 'Tennis Program'],
      minimum_amount: 50000
    },
    {
      id: '2',
      code: 'EARLYBIRD',
      description: 'Early bird registration discount',
      discount_type: 'fixed',
      discount_value: 10000,
      max_uses: 50,
      used_count: 12,
      valid_from: '2025-01-01',
      valid_until: '2025-03-31',
      is_active: true,
      applicable_programs: ['All Programs'],
      minimum_amount: 25000
    },
    {
      id: '3',
      code: 'FAMILY10',
      description: 'Family discount for multiple enrollments',
      discount_type: 'percentage',
      discount_value: 10,
      max_uses: null,
      used_count: 8,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      is_active: false,
      applicable_programs: ['Swimming Program'],
      minimum_amount: 75000
    }
  ];

  const stats = {
    total_coupons: 15,
    active_coupons: 8,
    expired_coupons: 3,
    disabled_coupons: 4,
    total_usage: 156,
    total_discount_given: 485000
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_coupons}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_coupons}</div>
            <p className="text-xs text-muted-foreground">Currently usable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired_coupons}</div>
            <p className="text-xs text-muted-foreground">Past validity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.disabled_coupons}</div>
            <p className="text-xs text-muted-foreground">Manually disabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total_usage}</div>
            <p className="text-xs text-muted-foreground">Times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₦{stats.total_discount_given.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Student savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-800">Feature Under Development</CardTitle>
          </div>
          <CardDescription className="text-yellow-700">
            The coupon management system is currently being developed and will be available in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-yellow-800">
              <strong>Planned Features:</strong>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-800">
              <li className="flex items-center space-x-2">
                <Ticket className="h-4 w-4" />
                <span>Create & manage discount coupons</span>
              </li>
              <li className="flex items-center space-x-2">
                <Percent className="h-4 w-4" />
                <span>Percentage & fixed amount discounts</span>
              </li>
              <li className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Validity period management</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Usage limits & tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Program-specific restrictions</span>
              </li>
              <li className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Minimum purchase requirements</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Current Status:</strong> Coupon validation is available in the enrollment system with basic format checking. 
                Full coupon management features are scheduled for the next development phase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Coupon Management Interface (Preview) */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Coupon Management (Preview)</CardTitle>
              <CardDescription>
                Preview of the upcoming coupon management interface
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search coupons..."
                className="pl-10"
                disabled
              />
            </div>
            
            <Select disabled defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Sample Coupons Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Code</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Discount</th>
                  <th className="text-left p-3 font-medium">Usage</th>
                  <th className="text-left p-3 font-medium">Validity</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sampleCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-mono font-medium text-blue-600">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{coupon.description}</div>
                      <div className="text-sm text-gray-500">
                        Min: ₦{coupon.minimum_amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%`
                          : `₦${coupon.discount_value.toLocaleString()}`
                        }
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <span className="font-medium">{coupon.used_count}</span>
                        {coupon.max_uses && (
                          <span className="text-gray-500">/{coupon.max_uses}</span>
                        )}
                      </div>
                      {coupon.max_uses && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (coupon.used_count / coupon.max_uses) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{new Date(coupon.valid_from).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          to {new Date(coupon.valid_until).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={coupon.is_active ? "default" : "secondary"}
                        className={coupon.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {coupon.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" disabled>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" disabled>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 text-center">
              This is a preview of the coupon management interface. All buttons are disabled until the feature is fully implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}