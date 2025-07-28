/**
 * Simple form field component for forms without react-hook-form
 * Generates unique IDs and handles various input types
 */

import React, { useId } from 'react';

export interface SimpleFormFieldProps {
  label: string;
  type?: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  note?: string;
}

export function SimpleFormField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  options,
  rows = 3,
  min,
  max,
  step,
  note
}: SimpleFormFieldProps) {
  const fieldId = useId(); // React's built-in hook for unique IDs
  
  const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
  } ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value: newValue, type: inputType } = e.target;
    
    if (inputType === 'checkbox') {
      onChange((e.target as HTMLInputElement).checked);
    } else if (inputType === 'number') {
      onChange(newValue === '' ? '' : Number(newValue));
    } else {
      onChange(newValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={fieldId}
            value={String(value)}
            onChange={handleChange}
            disabled={disabled}
            className={baseClasses}
            required={required}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={String(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className={baseClasses}
            required={required}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldId}
              checked={Boolean(value)}
              onChange={handleChange}
              disabled={disabled}
              className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              required={required}
            />
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );

      default:
        return (
          <input
            type={type}
            id={fieldId}
            value={String(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={baseClasses}
            required={required}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {note && <p className="text-xs text-gray-500">{note}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {note && <p className="text-xs text-gray-500">{note}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default SimpleFormField;