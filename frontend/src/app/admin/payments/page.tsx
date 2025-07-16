'use client';

import { PaymentManagement } from '@/features/payments';

/**
 * Payments Management Page
 * 
 * Comprehensive payment management interface
 */
export default function PaymentsPage() {
  return (
    <div className="p-6">
      <PaymentManagement />
    </div>
  );
}