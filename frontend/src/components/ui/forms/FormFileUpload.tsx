import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FormFileUploadProps {
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  id?: string;
  accept?: string;
  multiple?: boolean;
}

export default function FormFileUpload({
  label,
  onChange,
  error,
  required,
  id,
  accept,
  multiple = false
}: FormFileUploadProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex items-center space-x-2">
        <Input
          id={id}
          type="file"
          onChange={onChange}
          accept={accept}
          multiple={multiple}
          className={error ? 'border-red-500' : ''}
        />
        <Button type="button" variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}