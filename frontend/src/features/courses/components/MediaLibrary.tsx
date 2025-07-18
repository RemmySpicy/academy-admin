/**
 * MediaLibrary component for managing uploaded media files
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image, 
  Video, 
  FileText, 
  File,
  Download,
  Trash2,
  Eye,
  Copy,
  MoreHorizontal,
  Folder,
  FolderOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaUploadDialog } from './MediaUploadDialog';

interface MediaFile {
  id: string;
  name: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  file_size: number;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
  folder_path?: string;
  uploaded_at: string;
  uploaded_by: string;
  tags?: string[];
  description?: string;
}

interface MediaLibraryProps {
  onSelectMedia?: (media: MediaFile) => void;
  selectionMode?: boolean;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document' | 'other')[];
  className?: string;
}

const fileTypeIcons = {
  image: Image,
  video: Video,
  audio: FileText,
  document: FileText,
  other: File,
};

const fileTypeColors = {
  image: 'bg-green-100 text-green-800',
  video: 'bg-blue-100 text-blue-800',
  audio: 'bg-purple-100 text-purple-800',
  document: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

export function MediaLibrary({ 
  onSelectMedia, 
  selectionMode = false, 
  allowedTypes = ['image', 'video', 'audio', 'document', 'other'],
  className 
}: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);

  const { 
    mediaFiles, 
    folders, 
    isLoading, 
    uploadMedia, 
    deleteMedia, 
    createFolder 
  } = useMediaLibrary({
    search: searchQuery,
    file_type: selectedType === 'all' ? undefined : selectedType as any,
    folder_path: selectedFolder === 'all' ? undefined : selectedFolder,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: MediaFile['file_type']) => {
    const IconComponent = fileTypeIcons[fileType];
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredFiles = mediaFiles?.filter(file => 
    allowedTypes.includes(file.file_type)
  ) || [];

  const handleFileSelect = (file: MediaFile) => {
    if (selectionMode && onSelectMedia) {
      onSelectMedia(file);
    } else {
      setPreviewMedia(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Would show toast notification here
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Media Library</h3>
          <p className="text-sm text-muted-foreground">
            Manage your uploaded media files and assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <MediaUploadDialog
            open={showUploadDialog}
            onOpenChange={setShowUploadDialog}
            onUpload={uploadMedia}
            allowedTypes={allowedTypes}
          >
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </MediaUploadDialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search media files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {folders?.map((folder) => (
              <SelectItem key={folder} value={folder}>
                {folder || 'Root'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 text-sm">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredFiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredFiles.filter(f => f.file_type === 'image').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredFiles.filter(f => f.file_type === 'video').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredFiles.filter(f => f.file_type === 'document').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Media Files Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'No media files match your search criteria.' : 'Get started by uploading your first media file.'}
          </p>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          {filteredFiles.map((file) => (
            <Card 
              key={file.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectionMode ? 'hover:bg-accent' : ''
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <CardContent className="p-3">
                <div className="aspect-square relative mb-3 bg-gray-100 rounded overflow-hidden">
                  {file.file_type === 'image' && file.thumbnail_url ? (
                    <img 
                      src={file.thumbnail_url} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file.file_type)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className={`${fileTypeColors[file.file_type]} text-xs`}
                    >
                      {file.file_type}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
                {!selectionMode && (
                  <div className="mt-2 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewMedia(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteMedia(file.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card 
              key={file.id}
              className={`cursor-pointer hover:shadow-sm transition-shadow ${
                selectionMode ? 'hover:bg-accent' : ''
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    {file.file_type === 'image' && file.thumbnail_url ? (
                      <img 
                        src={file.thumbnail_url} 
                        alt={file.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file.file_type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <Badge
                        variant="secondary"
                        className={`${fileTypeColors[file.file_type]} text-xs`}
                      >
                        {file.file_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                      {file.folder_path && (
                        <span className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {file.folder_path}
                        </span>
                      )}
                    </div>
                  </div>
                  {!selectionMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewMedia(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteMedia(file.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Media Preview Dialog */}
      {previewMedia && (
        <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewMedia.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {previewMedia.file_type === 'image' ? (
                <img 
                  src={previewMedia.url} 
                  alt={previewMedia.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : previewMedia.file_type === 'video' ? (
                <video 
                  src={previewMedia.url}
                  controls
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(previewMedia.file_type)}
                  </div>
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">File Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{previewMedia.mime_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(previewMedia.file_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(previewMedia.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => copyToClipboard(previewMedia.url)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {previewMedia.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{previewMedia.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}