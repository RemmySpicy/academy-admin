import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

export default function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  rows = 3
}: FormTextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}