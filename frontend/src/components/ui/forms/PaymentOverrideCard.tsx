/**
 * Payment Override Card Component
 * 
 * A reusable component for displaying payment override information,
 * including organization sponsorships and parent responsibilities.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Calculator,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { useStudentPaymentStatus, useCalculatePayment } from '@/features/organizations/hooks/usePaymentOverrides';

interface PaymentOverrideCardProps {
  studentId: string;
  studentName?: string;
  courseId?: string;
  courseName?: string;
  baseAmount?: number;
  showCalculation?: boolean;
  compact?: boolean;
  className?: string;
}

interface PaymentBreakdownProps {
  breakdown: Array<{
    payer_id: string;
    payer_type: 'student' | 'parent' | 'organization';
    payer_name: string;
    amount: number;
    percentage: number;
    reason: string;
  }>;
  totalAmount: number;
  overrideReason: string;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ 
  breakdown, 
  totalAmount, 
  overrideReason 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPayerTypeColor = (type: string) => {
    const colors = {
      organization: 'bg-green-100 text-green-800',
      parent: 'bg-blue-100 text-blue-800',
      student: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPayerTypeIcon = (type: string) => {
    const icons = {
      organization: Building2,
      parent: Users,
      student: Users
    };
    const IconComponent = icons[type as keyof typeof icons] || Users;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Payment Breakdown</h4>
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      <div className="space-y-3">
        {breakdown.map((payer, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getPayerTypeIcon(payer.payer_type)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{payer.payer_name}</span>
                  <Badge className={getPayerTypeColor(payer.payer_type)}>
                    {payer.payer_type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{payer.reason}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(payer.amount)}
              </div>
              <div className="text-sm text-gray-600">
                {payer.percentage.toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {overrideReason && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {overrideReason}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const PaymentOverrideCard: React.FC<PaymentOverrideCardProps> = ({
  studentId,
  studentName,
  courseId,
  courseName,
  baseAmount = 0,
  showCalculation = false,
  compact = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentCalculation, setShowPaymentCalculation] = useState(false);

  // Get student payment status
  const { 
    data: paymentStatus, 
    isLoading: statusLoading, 
    error: statusError 
  } = useStudentPaymentStatus(studentId);

  // Payment calculation mutation
  const calculatePayment = useCalculatePayment();

  const handleCalculatePayment = async () => {
    if (!courseId || !baseAmount) return;

    try {
      const result = await calculatePayment.mutateAsync({
        student_id: studentId,
        course_id: courseId,
        base_amount: baseAmount
      });
      setShowPaymentCalculation(true);
    } catch (error) {
      console.error('Payment calculation failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (statusLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (statusError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load payment information
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasOverrides = paymentStatus?.has_payment_overrides || false;
  const sponsoringOrgs = paymentStatus?.sponsoring_organizations || [];
  const responsibleParents = paymentStatus?.responsible_parents || [];

  if (compact && !hasOverrides) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <CreditCard className="h-4 w-4 text-gray-400" />
        <span className="text-gray-600">Standard payment</span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center ${compact ? "text-base" : ""}`}>
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Information
          </CardTitle>
          {hasOverrides && (
            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
              Override Active
            </Badge>
          )}
        </div>
        {!compact && studentName && (
          <CardDescription>
            Payment details for {studentName}
            {courseName && ` in ${courseName}`}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Responsibility Summary */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Payment Type:</span>
          <Badge variant="secondary">
            {paymentStatus?.payment_responsibility_type || 'Student'}
          </Badge>
        </div>

        {/* Sponsoring Organizations */}
        {sponsoringOrgs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              Sponsoring Organizations
            </h4>
            <div className="space-y-2">
              {sponsoringOrgs.map((org, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-green-900">{org.organization_name}</span>
                    <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                      {org.membership_type}
                    </Badge>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responsible Parents */}
        {responsibleParents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Responsible Parents
            </h4>
            <div className="space-y-2">
              {responsibleParents.map((parent, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-blue-900">{parent.parent_name}</span>
                    <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">
                      {parent.relationship_type}
                    </Badge>
                  </div>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Override Message */}
        {!hasOverrides && (
          <div className="text-center py-4">
            <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Standard payment - no overrides active
            </p>
            <p className="text-xs text-gray-500">
              Student is responsible for all fees
            </p>
          </div>
        )}

        {/* Payment Calculation Section */}
        {showCalculation && courseId && baseAmount > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Payment Calculation</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCalculatePayment}
                  disabled={calculatePayment.isPending}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {calculatePayment.isPending ? 'Calculating...' : 'Calculate'}
                </Button>
              </div>

              {courseName && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Course:</span> {courseName}
                  <span className="ml-4 font-medium">Base Fee:</span> {formatCurrency(baseAmount)}
                </div>
              )}

              {/* Show calculation results */}
              {calculatePayment.data && showPaymentCalculation && (
                <PaymentBreakdown
                  breakdown={calculatePayment.data.payment_breakdown}
                  totalAmount={calculatePayment.data.total_amount}
                  overrideReason={calculatePayment.data.override_reason}
                />
              )}

              {calculatePayment.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to calculate payment breakdown
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Details Toggle */}
        {!compact && hasOverrides && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        )}

        {/* Additional Details */}
        {showDetails && (
          <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Student ID:</span> {studentId}
            </div>
            <div>
              <span className="font-medium">Override Status:</span> {hasOverrides ? 'Active' : 'None'}
            </div>
            <div>
              <span className="font-medium">Total Organizations:</span> {sponsoringOrgs.length}
            </div>
            <div>
              <span className="font-medium">Responsible Parents:</span> {responsibleParents.length}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentOverrideCard;