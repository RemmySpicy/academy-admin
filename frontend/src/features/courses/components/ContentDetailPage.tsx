/**
 * ContentDetailPage component for comprehensive content management
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  History, 
  Settings, 
  Wrench,
  Image,
  Save,
  Edit,
  Eye,
  Share,
  Archive
} from 'lucide-react';
import { ContentVersioning } from './ContentVersioning';
import { EquipmentManager } from './EquipmentManager';
import { MediaLibrary } from './MediaLibrary';
import { AssessmentDetailView } from './AssessmentDetailView';
import { useContentVersioning } from '../hooks/useContentVersioning';

interface ContentDetailPageProps {
  contentId: string;
  contentType: 'lesson' | 'assessment';
  content?: any; // The actual content object
  onContentUpdate?: (updatedContent: any) => void;
  onContentSave?: () => void;
  className?: string;
}

export function ContentDetailPage({
  contentId,
  contentType,
  content,
  onContentUpdate,
  onContentSave,
  className,
}: ContentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  const {
    versions,
    currentVersion,
    createVersion,
    restoreVersion,
    totalVersions,
    publishedVersions,
  } = useContentVersioning({
    content_id: contentId,
    content_type: contentType,
  });

  const handleCreateVersion = async (versionData: {
    title: string;
    description?: string;
    change_summary: string;
  }) => {
    if (content) {
      await createVersion.mutateAsync({
        content_id: contentId,
        content_type: contentType,
        content_data: content,
        ...versionData,
      });
    }
  };

  const handleVersionRestore = async (version: any) => {
    await restoreVersion.mutateAsync(version.id);
    if (onContentUpdate) {
      onContentUpdate(version.content_data);
    }
  };

  const handleSaveContent = () => {
    if (onContentSave) {
      onContentSave();
    }
    
    // Automatically create a version when saving
    handleCreateVersion({
      title: `Auto-save ${new Date().toLocaleString()}`,
      change_summary: 'Automatic save point',
    });
  };

  const getContentIcon = () => {
    return contentType === 'lesson' ? BookOpen : FileText;
  };

  const ContentIcon = getContentIcon();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ContentIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{content?.name || 'Content Details'}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {contentType}
                </Badge>
                {currentVersion && (
                  <Badge variant="outline" className="text-xs">
                    v{currentVersion.version_number}
                  </Badge>
                )}
                <span>•</span>
                <span>{totalVersions} versions</span>
                <span>•</span>
                <span>{publishedVersions} published</span>
              </div>
            </div>
          </div>
          {content?.description && (
            <p className="text-muted-foreground max-w-2xl">
              {content.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
          
          <Button onClick={handleSaveContent}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge 
                variant={content?.status === 'published' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {content?.status || 'draft'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {currentVersion ? new Date(currentVersion.created_at).toLocaleDateString() : 'Never'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {currentVersion?.version_number || '1.0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {currentVersion ? `${Math.round(currentVersion.file_size / 1024)} KB` : '0 KB'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Name</h4>
                  <p className="text-sm text-muted-foreground">
                    {content?.name || 'Untitled Content'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {content?.description || 'No description provided'}
                  </p>
                </div>
                
                {content?.objectives && (
                  <div>
                    <h4 className="font-medium mb-2">Learning Objectives</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {content.objectives.map((objective: string, index: number) => (
                        <li key={index}>• {objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <Badge variant="secondary">
                    {contentType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Version Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentVersion ? (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Current Version</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">v{currentVersion.version_number}</Badge>
                        <span className="text-sm text-muted-foreground">
                          by {currentVersion.created_by}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Last Change</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentVersion.change_summary}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Modified</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentVersion.created_at).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No version history available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Content
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {contentType === 'assessment' && content ? (
            <AssessmentDetailView
              assessment={content}
              onUpdateAssessment={onContentUpdate}
              onAddCriteria={() => {}}
              onUpdateCriteria={() => {}}
              onDeleteCriteria={() => {}}
              onReorderCriteria={() => {}}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Editor</CardTitle>
                <CardDescription>
                  Edit the main content of this {contentType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Content Preview</h4>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(content, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveContent}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <EquipmentManager
            contentId={contentId}
            contentType={contentType}
            mode="requirements"
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <MediaLibrary
            selectionMode={true}
            allowedTypes={['image', 'video', 'audio', 'document']}
            onSelectMedia={(media) => {
              console.log('Selected media:', media);
              // Handle media attachment to content
            }}
          />
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <ContentVersioning
            contentId={contentId}
            contentType={contentType}
            currentVersion={currentVersion}
            onVersionRestore={handleVersionRestore}
            onCreateVersion={handleCreateVersion}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publishing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge variant={content?.status === 'published' ? 'default' : 'secondary'}>
                    {content?.status || 'draft'}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    {content?.visibility || 'Private'}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button size="sm">Publish</Button>
                  <Button variant="outline" size="sm">Save as Draft</Button>
                  <Button variant="outline" size="sm">Archive</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content ID</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {contentId}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {content?.created_at ? new Date(content.created_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Last Modified</h4>
                  <p className="text-sm text-muted-foreground">
                    {content?.updated_at ? new Date(content.updated_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="text-red-600">
                    Delete Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}