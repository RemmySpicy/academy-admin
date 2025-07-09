import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormCheckboxProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  id?: string;
}

export default function FormCheckbox({
  label,
  checked,
  onCheckedChange,
  error,
  required,
  id
}: FormCheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={id}
          checked={checked} 
          onCheckedChange={onCheckedChange}
          className={error ? 'border-red-500' : ''}
        />
        {label && (
          <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}