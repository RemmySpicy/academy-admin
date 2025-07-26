/**
 * Reusable emergency contact form component
 */

import React from 'react';
import FormField from './FormField';

export interface EmergencyContactData {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

interface EmergencyContactFormProps {
  contact: EmergencyContactData;
  onChange: (contact: EmergencyContactData) => void;
  errors?: Record<string, string>;
  fieldPrefix?: string;
  required?: boolean;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'aunt', label: 'Aunt' },
  { value: 'uncle', label: 'Uncle' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'friend', label: 'Family Friend' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'other', label: 'Other' },
];

export function EmergencyContactForm({
  contact,
  onChange,
  errors = {},
  fieldPrefix = 'emergency_contact',
  required = false
}: EmergencyContactFormProps) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({
      ...contact,
      [field]: value
    });
  };

  const getFieldError = (field: string) => {
    return errors[`${fieldPrefix}.${field}`] || errors[field];
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Contact Name"
        field="name"
        value={contact.name}
        onChange={handleFieldChange}
        error={getFieldError('name')}
        placeholder="Full name of emergency contact"
        required={required}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Phone Number"
          field="phone"
          type="tel"
          value={contact.phone}
          onChange={handleFieldChange}
          error={getFieldError('phone')}
          placeholder="Contact phone number"
          required={required}
        />

        <FormField
          label="Relationship"
          field="relationship"
          type="select"
          value={contact.relationship}
          onChange={handleFieldChange}
          error={getFieldError('relationship')}
          options={RELATIONSHIP_OPTIONS}
          required={required}
        />
      </div>

      <FormField
        label="Email Address"
        field="email"
        type="email"
        value={contact.email || ''}
        onChange={handleFieldChange}
        error={getFieldError('email')}
        placeholder="Contact email (optional)"
      />
    </div>
  );
}

export default EmergencyContactForm;