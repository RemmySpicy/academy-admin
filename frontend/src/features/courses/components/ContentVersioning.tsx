/**
 * ContentVersioning component for managing content versions and history
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  GitBranch, 
  Eye, 
  RotateCcw, 
  Compare, 
  Clock,
  User,
  FileText,
  Save,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useContentVersioning } from '../hooks/useContentVersioning';

export interface ContentVersion {
  id: string;
  content_id: string;
  content_type: 'lesson' | 'assessment';
  version_number: string;
  title: string;
  description?: string;
  content_data: any; // Full content object
  change_summary: string;
  created_by: string;
  created_at: string;
  is_current: boolean;
  is_published: boolean;
  tags?: string[];
  file_size: number;
  checksum: string;
}

export interface VersionComparison {
  version_a: ContentVersion;
  version_b: ContentVersion;
  differences: {
    field: string;
    old_value: any;
    new_value: any;
    change_type: 'added' | 'removed' | 'modified';
  }[];
}

interface ContentVersioningProps {
  contentId: string;
  contentType: 'lesson' | 'assessment';
  currentVersion?: ContentVersion;
  onVersionRestore?: (version: ContentVersion) => void;
  onCreateVersion?: (data: { title: string; description?: string; change_summary: string }) => void;
  className?: string;
}

const changeTypeColors = {
  added: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800',
  modified: 'bg-blue-100 text-blue-800',
};

const changeTypeIcons = {
  added: CheckCircle,
  removed: XCircle,
  modified: AlertCircle,
};

export function ContentVersioning({
  contentId,
  contentType,
  currentVersion,
  onVersionRestore,
  onCreateVersion,
  className,
}: ContentVersioningProps) {
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{a: ContentVersion | null; b: ContentVersion | null}>({
    a: null,
    b: null,
  });
  const [restoringVersion, setRestoringVersion] = useState<ContentVersion | null>(null);

  const {
    versions,
    isLoading,
    comparison,
    createVersion,
    restoreVersion,
    compareVersions: performComparison,
  } = useContentVersioning({
    content_id: contentId,
    content_type: contentType,
  });

  const handleViewVersion = (version: ContentVersion) => {
    setSelectedVersion(version);
    setShowVersionDialog(true);
  };

  const handleCompareVersions = (versionA: ContentVersion, versionB: ContentVersion) => {
    setCompareVersions({ a: versionA, b: versionB });
    performComparison.mutate({ 
      version_a_id: versionA.id, 
      version_b_id: versionB.id 
    });
    setShowComparison(true);
  };

  const handleRestoreVersion = (version: ContentVersion) => {
    setRestoringVersion(version);
  };

  const confirmRestore = () => {
    if (restoringVersion) {
      if (onVersionRestore) {
        onVersionRestore(restoringVersion);
      } else {
        restoreVersion.mutate(restoringVersion.id);
      }
      setRestoringVersion(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getChangeIcon = (changeType: 'added' | 'removed' | 'modified') => {
    const IconComponent = changeTypeIcons[changeType];
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version History</h3>
          <p className="text-sm text-muted-foreground">
            Track changes and manage content versions over time
          </p>
        </div>
        {onCreateVersion && (
          <Button onClick={() => onCreateVersion({
            title: `Version ${(versions?.length || 0) + 1}`,
            change_summary: 'Manual save point',
          })}>
            <Save className="mr-2 h-4 w-4" />
            Create Version
          </Button>
        )}
      </div>

      {/* Current Version Info */}
      {currentVersion && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Current Version</CardTitle>
                <Badge variant="default" className="text-xs">
                  v{currentVersion.version_number}
                </Badge>
                {currentVersion.is_published && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Published
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(currentVersion.created_at).date}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="font-medium">{currentVersion.title}</p>
              {currentVersion.description && (
                <p className="text-sm text-muted-foreground">{currentVersion.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {currentVersion.created_by}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {formatFileSize(currentVersion.file_size)}
                </span>
              </div>
              {currentVersion.tags && currentVersion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {currentVersion.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : versions && versions.length > 0 ? (
        <div className="space-y-3">
          {versions.map((version, index) => {
            const { date, time } = formatDateTime(version.created_at);
            
            return (
              <Card key={version.id} className={`hover:shadow-md transition-shadow ${
                version.is_current ? 'ring-2 ring-primary/20' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{version.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            v{version.version_number}
                          </Badge>
                          {version.is_current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          {version.is_published && (
                            <Badge variant="secondary" className="text-xs">
                              Published
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {version.change_summary}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.created_by}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {date} at {time}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {formatFileSize(version.file_size)}
                          </span>
                        </div>

                        {version.tags && version.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {version.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVersion(version)}
                        title="View version details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {index < versions.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompareVersions(version, versions[index + 1])}
                          title="Compare with previous version"
                        >
                          <Compare className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {!version.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreVersion(version)}
                          title="Restore this version"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Version History</h3>
          <p className="text-muted-foreground mb-4">
            No versions have been saved for this content yet
          </p>
          {onCreateVersion && (
            <Button onClick={() => onCreateVersion({
              title: 'Initial Version',
              change_summary: 'First version of content',
            })}>
              <Save className="mr-2 h-4 w-4" />
              Create First Version
            </Button>
          )}
        </div>
      )}

      {/* Version Details Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number} - {selectedVersion?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVersion && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Version Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>v{selectedVersion.version_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created by:</span>
                        <span>{selectedVersion.created_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>
                          {formatDateTime(selectedVersion.created_at).date} at{' '}
                          {formatDateTime(selectedVersion.created_at).time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>File size:</span>
                        <span>{formatFileSize(selectedVersion.file_size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <div className="flex gap-1">
                          {selectedVersion.is_current && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                          {selectedVersion.is_published && (
                            <Badge variant="secondary" className="text-xs">Published</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Change Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedVersion.change_summary}
                    </p>
                    {selectedVersion.description && (
                      <>
                        <h4 className="font-medium mb-2 mt-4">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedVersion.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Content Preview</h4>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm overflow-auto max-h-64">
                        {JSON.stringify(selectedVersion.content_data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Compare Versions: v{compareVersions.a?.version_number} vs v{compareVersions.b?.version_number}
            </DialogTitle>
          </DialogHeader>
          
          {comparison && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Version {comparison.version_a.version_number}
                      </CardTitle>
                      <CardDescription>
                        {formatDateTime(comparison.version_a.created_at).date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{comparison.version_a.title}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Version {comparison.version_b.version_number}
                      </CardTitle>
                      <CardDescription>
                        {formatDateTime(comparison.version_b.created_at).date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{comparison.version_b.title}</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Changes ({comparison.differences.length})</h4>
                  {comparison.differences.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No differences found between these versions
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {comparison.differences.map((diff, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {getChangeIcon(diff.change_type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-sm">{diff.field}</span>
                                  <Badge
                                    variant="secondary"
                                    className={`${changeTypeColors[diff.change_type]} text-xs`}
                                  >
                                    {diff.change_type}
                                  </Badge>
                                </div>
                                
                                <div className="grid gap-2 md:grid-cols-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Before:</span>
                                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
                                      <code className="text-xs">
                                        {JSON.stringify(diff.old_value, null, 2)}
                                      </code>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">After:</span>
                                    <div className="bg-green-50 border border-green-200 rounded p-2 mt-1">
                                      <code className="text-xs">
                                        {JSON.stringify(diff.new_value, null, 2)}
                                      </code>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoringVersion} onOpenChange={() => setRestoringVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore version {restoringVersion?.version_number}? 
              This will create a new version based on the selected version and set it as current.
              The existing current version will be preserved in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}