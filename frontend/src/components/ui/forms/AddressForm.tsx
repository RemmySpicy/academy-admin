/**
 * Reusable address form component
 */

import React from 'react';
import FormField from './FormField';

export interface AddressData {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface AddressFormProps {
  address: AddressData;
  onChange: (address: AddressData) => void;
  errors?: Record<string, string>;
  fieldPrefix?: string;
  required?: boolean;
}

const COUNTRIES = [
  { value: 'NG', label: 'Nigeria' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
];

export function AddressForm({
  address,
  onChange,
  errors = {},
  fieldPrefix = 'address',
  required = false
}: AddressFormProps) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  const getFieldError = (field: string) => {
    return errors[`${fieldPrefix}.${field}`] || errors[field];
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Address Line 1"
        field="line1"
        value={address.line1}
        onChange={handleFieldChange}
        error={getFieldError('line1')}
        placeholder="Enter street address"
        required={required}
      />

      <FormField
        label="Address Line 2"
        field="line2"
        value={address.line2}
        onChange={handleFieldChange}
        error={getFieldError('line2')}
        placeholder="Apartment, suite, etc. (optional)"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="City"
          field="city"
          value={address.city}
          onChange={handleFieldChange}
          error={getFieldError('city')}
          placeholder="Enter city"
          required={required}
        />

        <FormField
          label="State/Province"
          field="state"
          value={address.state}
          onChange={handleFieldChange}
          error={getFieldError('state')}
          placeholder="Enter state"
          required={required}
        />

        <FormField
          label="Postal Code"
          field="postal_code"
          value={address.postal_code}
          onChange={handleFieldChange}
          error={getFieldError('postal_code')}
          placeholder="Enter postal code"
          required={required}
        />
      </div>

      <FormField
        label="Country"
        field="country"
        type="select"
        value={address.country}
        onChange={handleFieldChange}
        error={getFieldError('country')}
        options={COUNTRIES}
        required={required}
      />
    </div>
  );
}

export default AddressForm;