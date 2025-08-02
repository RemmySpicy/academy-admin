/**
 * Review & Payment Step Component
 * Step 4: Review all selections, apply coupon codes, set payment status
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  BookOpen, 
  Building, 
  CreditCard,
  Tag,
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCreateCourseAssignment, useCouponValidation } from '../../../hooks/useEnrollmentApi';
import { EnrollmentStepProps, CourseAssignment } from '../../../types/enrollment';
import { CURRENCY } from '@/lib/constants';

// Payment status options
const PAYMENT_STATUS_OPTIONS = [
  {
    value: 'unpaid',
    label: 'Unpaid',
    description: 'No payment received yet',
    color: 'destructive',
  },
  {
    value: 'partially_paid',
    label: 'Partially Paid',
    description: 'Partial payment received',
    color: 'warning',
  },
  {
    value: 'fully_paid',
    label: 'Fully Paid',
    description: 'Full payment received',
    color: 'success',
  },
] as const;

interface ReviewPaymentStepProps extends EnrollmentStepProps {
  onComplete: (assignment: CourseAssignment) => void;
}

export function ReviewPaymentStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onValidationChange,
  onComplete,
  isLoading,
  error,
}: ReviewPaymentStepProps) {
  const [couponCode, setCouponCode] = useState(data.couponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus || 'unpaid');
  const [paymentAmount, setPaymentAmount] = useState(
    data.paymentAmount?.toString() || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Coupon validation
  const couponValidation = useCouponValidation();
  
  // Course assignment creation
  const createAssignment = useCreateCourseAssignment();

  // Validate coupon when entered
  const handleValidateCoupon = useCallback(async () => {
    if (!couponCode.trim() || !data.selectedCourse?.id || !data.selectedFacility?.id || !data.pricing) {
      return;
    }

    try {
      const result = await couponValidation.mutateAsync({
        couponCode: couponCode.trim(),
        courseId: data.selectedCourse.id,
        facilityId: data.selectedFacility.id,
        subtotal: data.pricing.subtotal,
      });

      if (result.is_valid) {
        setAppliedCoupon(couponCode.trim());
        onUpdate({
          couponCode: couponCode.trim(),
          couponDiscount: result.discount_amount,
          pricing: {
            ...data.pricing,
            coupon_code: couponCode.trim(),
            coupon_discount_amount: result.discount_amount,
            total_amount: data.pricing.subtotal - result.discount_amount,
          },
        });
      }
    } catch (error) {
      console.error('Coupon validation failed:', error);
    }
  }, [couponCode, data.selectedCourse?.id, data.selectedFacility?.id, data.pricing, couponValidation, onUpdate]);

  // Remove applied coupon
  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon('');
    onUpdate({
      couponCode: undefined,
      couponDiscount: undefined,
      pricing: data.pricing ? {
        ...data.pricing,
        coupon_code: undefined,
        coupon_discount_amount: undefined,
        total_amount: data.pricing.subtotal,
      } : undefined,
    });
  }, [data.pricing, onUpdate]);

  // Update payment information
  useEffect(() => {
    onUpdate({
      paymentStatus: paymentStatus as any,
      paymentAmount: paymentAmount ? parseFloat(paymentAmount) : undefined,
    });
  }, [paymentStatus, paymentAmount, onUpdate]);

  // Validate step
  useEffect(() => {
    const numericPaymentAmount = paymentAmount ? parseFloat(paymentAmount) : 0;
    const totalAmount = data.pricing?.total_amount || 0;
    const minimumAmount = data.pricing?.minimum_payment_amount || 0;

    const isValidPayment = paymentStatus === 'unpaid' || 
      (paymentStatus === 'partially_paid' && numericPaymentAmount >= minimumAmount && numericPaymentAmount < totalAmount) ||
      (paymentStatus === 'fully_paid' && numericPaymentAmount >= totalAmount);

    const isValid = !!(
      data.selectedPerson &&
      data.selectedCourse &&
      data.selectedFacility &&
      data.selectedAgeGroup &&
      data.selectedSessionType &&
      data.selectedLocationType &&
      data.pricing &&
      isValidPayment
    );
    
    const errors = [];
    if (paymentStatus !== 'unpaid' && !paymentAmount) {
      errors.push({
        step: 'review-payment' as const,
        field: 'paymentAmount',
        message: 'Payment amount is required',
      });
    }
    if (paymentStatus === 'partially_paid' && numericPaymentAmount < minimumAmount) {
      errors.push({
        step: 'review-payment' as const,
        field: 'paymentAmount',
        message: `Minimum payment of ${CURRENCY.FORMAT(minimumAmount)} required`,
      });
    }
    if (paymentStatus === 'fully_paid' && numericPaymentAmount < totalAmount) {
      errors.push({
        step: 'review-payment' as const,
        field: 'paymentAmount',
        message: `Full payment of ${CURRENCY.FORMAT(totalAmount)} required`,
      });
    }

    onValidationChange('review-payment', {
      isValid,
      errors,
      canProceed: isValid,
    });
  }, [
    paymentStatus,
    paymentAmount,
    data.pricing,
    data.selectedPerson,
    data.selectedCourse,
    data.selectedFacility,
    data.selectedAgeGroup,
    data.selectedSessionType,
    data.selectedLocationType,
    onValidationChange
  ]);

  // Handle enrollment submission
  const handleSubmit = useCallback(async () => {
    if (!data.selectedPerson?.id && !data.newPersonData) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const assignmentData = {
        user_id: data.selectedPerson?.id || 'new-user', // Will be handled by backend
        course_id: data.selectedCourse!.id,
        facility_id: data.selectedFacility!.id,
        age_group: data.selectedAgeGroup!,
        session_type: data.selectedSessionType!,
        location_type: data.selectedLocationType!,
        payment_status: paymentStatus as any,
        amount_paid: paymentAmount ? parseFloat(paymentAmount) : undefined,
        coupon_code: appliedCoupon || undefined,
        notes: `Enrollment via admin wizard`,
        // Include new user data if creating a new person
        ...(data.newPersonData && { new_user_data: data.newPersonData }),
      };

      const result = await createAssignment.mutateAsync(assignmentData);
      onComplete(result);
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    data,
    paymentStatus,
    paymentAmount,
    appliedCoupon,
    createAssignment,
    onComplete
  ]);

  if (!data.pricing) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Pricing information is missing. Please go back and complete facility selection.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review & Payment</h3>
        <p className="text-muted-foreground">
          Review your enrollment details and configure payment settings.
        </p>
      </div>

      {/* Enrollment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Enrollment Summary</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-muted-foreground"
            >
              {showFullDetails ? (
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Person */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {data.selectedPerson?.full_name || data.newPersonData?.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.selectedPerson?.email || data.newPersonData?.email}
                {data.newPersonData && (
                  <Badge variant="secondary" className="ml-2 text-xs">New User</Badge>
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Course */}
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{data.selectedCourse?.name}</p>
              <p className="text-sm text-muted-foreground">{data.selectedCourse?.code}</p>
            </div>
          </div>

          <Separator />

          {/* Facility & Configuration */}
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">{data.selectedFacility?.name}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{data.selectedAgeGroup}</Badge>
                <Badge variant="outline">
                  {data.selectedSessionType?.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {data.selectedLocationType?.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {showFullDetails && (
            <>
              <Separator />
              
              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sessions per payment:</span>
                  <span className="ml-2">{data.pricing.sessions_per_payment}</span>
                </div>
                <div>
                  <span className="font-medium">Base price per session:</span>
                  <span className="ml-2">{CURRENCY.FORMAT(data.pricing.base_price_per_session)}</span>
                </div>
                <div>
                  <span className="font-medium">Course duration:</span>
                  <span className="ml-2">{data.selectedCourse?.duration_weeks} weeks</span>
                </div>
                <div>
                  <span className="font-medium">Payment deadline:</span>
                  <span className="ml-2">{data.selectedCourse?.completion_deadline_weeks} weeks</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Coupon Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || couponValidation.isLoading}
                variant="outline"
              >
                {couponValidation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Coupon Applied: {appliedCoupon}</span>
                <span>(-{CURRENCY.FORMAT(data.couponDiscount || 0)})</span>
              </div>
              <Button
                onClick={handleRemoveCoupon}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800"
              >
                Remove
              </Button>
            </div>
          )}

          {couponValidation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid coupon code or cannot be applied to this enrollment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base price ({data.pricing.sessions_per_payment} sessions):</span>
              <span>{CURRENCY.FORMAT(data.pricing.subtotal)}</span>
            </div>
            
            {data.pricing.coupon_discount_amount && (
              <div className="flex justify-between text-green-600">
                <span>Coupon discount ({data.pricing.coupon_code}):</span>
                <span>-{CURRENCY.FORMAT(data.pricing.coupon_discount_amount)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-primary">
              {CURRENCY.FORMAT(data.pricing.total_amount)}
            </span>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Requirements:</strong> Minimum payment of {CURRENCY.FORMAT(data.pricing.minimum_payment_amount)} 
              ({data.pricing.minimum_payment_percentage}%) required to access sessions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={paymentStatus} onValueChange={setPaymentStatus}>
            <div className="space-y-3">
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {paymentStatus !== 'unpaid' && (
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                max={data.pricing.total_amount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
              <div className="text-xs text-muted-foreground">
                Minimum: {CURRENCY.FORMAT(data.pricing.minimum_payment_amount)} | 
                Maximum: {CURRENCY.FORMAT(data.pricing.total_amount)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || createAssignment.isLoading}
            className="w-full"
            size="lg"
          >
            {isSubmitting || createAssignment.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Enrollment...
              </>
            ) : (
              <>
                Complete Enrollment
              </>
            )}
          </Button>

          {createAssignment.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to create enrollment. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReviewPaymentStep;