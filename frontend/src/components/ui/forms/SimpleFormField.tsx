/**
 * Simple form field component for forms without react-hook-form
 * Generates unique IDs and handles various input types
 */

import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

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
  
  // No need for baseClasses anymore as themed components handle styling

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value: newValue, type: inputType } = e.target;
    
    if (inputType === 'number') {
      onChange(newValue === '' ? '' : Number(newValue));
    } else {
      onChange(newValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select value={String(value)} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn(error && "border-destructive", className)}>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            value={String(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className={cn(error && "border-destructive", className)}
            required={required}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={disabled}
              required={required}
            />
            <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
          </div>
        );

      default:
        return (
          <Input
            type={type}
            id={fieldId}
            value={String(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={cn(error && "border-destructive", className)}
            required={required}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {renderInput()}
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default SimpleFormField;