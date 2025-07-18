/**
 * MediaUploadDialog component for uploading media files
 */

import { useState, useCallback, ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText,
  CheckCircle,
  AlertCircle,
  Folder
} from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  preview?: string;
}

interface MediaUploadDialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: UploadFile[], metadata: { folder?: string; description?: string }) => Promise<void>;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document' | 'other')[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

const fileTypeIcons = {
  image: Image,
  video: Video,
  audio: FileText,
  document: FileText,
  other: File,
};

const acceptedFileTypes = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  document: '.pdf,.doc,.docx,.txt,.rtf',
  other: '*/*',
};

export function MediaUploadDialog({
  children,
  open,
  onOpenChange,
  onUpload,
  allowedTypes = ['image', 'video', 'audio', 'document', 'other'],
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
}: MediaUploadDialogProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const getFileType = (file: File): keyof typeof fileTypeIcons => {
    const type = file.type.toLowerCase();
    
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
    
    return 'other';
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    // Check file type
    const fileType = getFileType(file);
    if (!allowedTypes.includes(fileType)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = [];

    acceptedFiles.forEach((file) => {
      const error = validateFile(file);
      
      if (error) {
        newFiles.push({
          file,
          id: `${file.name}-${Date.now()}`,
          progress: 0,
          status: 'error',
          error,
        });
        return;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}`,
        progress: 0,
        status: 'pending',
        preview,
      });
    });

    setUploadFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [allowedTypes, maxFileSize, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles,
    maxSize: maxFileSize,
    accept: allowedTypes.reduce((acc, type) => {
      acc[acceptedFileTypes[type]] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    const validFiles = uploadFiles.filter(f => f.status === 'pending');
    
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setUploadFiles(prev => 
        prev.map(f => 
          f.status === 'pending' 
            ? { ...f, status: 'uploading' as const }
            : f
        )
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => 
          prev.map(f => 
            f.status === 'uploading' && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      // Call the upload function
      await onUpload(validFiles, {
        folder: selectedFolder || undefined,
        description: description || undefined,
      });

      clearInterval(progressInterval);

      // Mark as completed
      setUploadFiles(prev => 
        prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, status: 'completed' as const, progress: 100 }
            : f
        )
      );

      // Clear form after successful upload
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      setUploadFiles(prev => 
        prev.map(f => 
          f.status === 'uploading' 
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setUploadFiles([]);
    setSelectedFolder('');
    setDescription('');
    setIsUploading(false);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Media Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: {allowedTypes.join(', ')} | Max {maxFiles} files | 
                Max {Math.round(maxFileSize / (1024 * 1024))}MB per file
              </p>
            </div>
          </div>

          {/* Upload Configuration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder or leave empty for root" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root folder</SelectItem>
                  <SelectItem value="lessons">Lessons</SelectItem>
                  <SelectItem value="assessments">Assessments</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of these files"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Files to Upload ({uploadFiles.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadFiles.map((uploadFile) => {
                  const fileType = getFileType(uploadFile.file);
                  const IconComponent = fileTypeIcons[fileType];

                  return (
                    <div key={uploadFile.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {uploadFile.preview ? (
                            <img 
                              src={uploadFile.preview} 
                              alt={uploadFile.file.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <IconComponent className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{uploadFile.file.name}</p>
                            <Badge
                              variant="secondary"
                              className={`${getStatusColor(uploadFile.status)} text-xs`}
                            >
                              {getStatusIcon(uploadFile.status)}
                              <span className="ml-1">{uploadFile.status}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatFileSize(uploadFile.file.size)} • {fileType}
                          </p>

                          {uploadFile.status === 'uploading' && (
                            <Progress value={uploadFile.progress} className="h-2" />
                          )}

                          {uploadFile.error && (
                            <p className="text-sm text-red-600 mt-1">{uploadFile.error}</p>
                          )}
                        </div>

                        {uploadFile.status === 'pending' && !isUploading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadFiles.filter(f => f.status === 'pending').length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${uploadFiles.filter(f => f.status === 'pending').length} Files`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}