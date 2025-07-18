/**
 * Lesson Editor - Rich content editor for lesson creation and editing
 */

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Save,
  X,
  Eye,
  Upload,
  Image,
  Video,
  FileText,
  Link,
  Play,
  Pause,
  Volume2,
  Download,
  Trash2,
  Plus,
  Edit,
  Copy,
  Settings,
  Target,
  Clock,
  Users,
  Award,
  BookOpen,
  FileImage,
  Film,
  Headphones,
  File,
  ExternalLink,
  Code,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { toast } from 'sonner';
import type { Lesson, LessonResource, Section, DifficultyLevel } from '../api/courseApiService';

interface LessonEditorProps {
  lesson?: Lesson;
  section: Section;
  onSave: (data: LessonFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const lessonFormSchema = z.object({
  section_id: z.string().min(1, 'Section is required'),
  name: z.string().min(1, 'Lesson name is required').max(200, 'Name is too long'),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  content: z.string().optional(),
  content_type: z.enum(['text', 'video', 'interactive', 'document', 'presentation']),
  sequence: z.coerce.number().min(0),
  estimated_duration_minutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  status: z.enum(['draft', 'published', 'archived']),
  is_required: z.boolean().default(true),
  prerequisite_lesson_ids: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  resources: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    resource_type: z.enum(['file', 'link', 'video', 'image', 'document']),
    resource_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
    is_downloadable: z.boolean().default(false),
    sequence: z.number().default(0),
  })).optional(),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

const contentTypeOptions = [
  { value: 'text', label: 'Text Content', icon: Type },
  { value: 'video', label: 'Video Lesson', icon: Video },
  { value: 'interactive', label: 'Interactive Content', icon: Play },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'presentation', label: 'Presentation', icon: FileImage },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const resourceTypeOptions = [
  { value: 'file', label: 'File', icon: File },
  { value: 'link', label: 'Link', icon: Link },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'document', label: 'Document', icon: FileText },
];

export function LessonEditor({
  lesson,
  section,
  onSave,
  onCancel,
  isLoading = false,
  className,
}: LessonEditorProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [objectives, setObjectives] = useState<string[]>(lesson?.objectives || ['']);
  const [tags, setTags] = useState<string[]>(lesson?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [resources, setResources] = useState<LessonResource[]>(lesson?.resources || []);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<LessonResource | null>(null);
  const [content, setContent] = useState(lesson?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      section_id: section.id,
      name: lesson?.name || '',
      description: lesson?.description || '',
      objectives: lesson?.objectives || [],
      content: lesson?.content || '',
      content_type: lesson?.content_type || 'text',
      sequence: lesson?.sequence || 0,
      estimated_duration_minutes: lesson?.estimated_duration_minutes || 30,
      difficulty_level: lesson?.difficulty_level || 'beginner',
      status: lesson?.status || 'draft',
      is_required: lesson?.is_required ?? true,
      prerequisite_lesson_ids: lesson?.prerequisite_lesson_ids || [],
      tags: lesson?.tags || [],
      resources: lesson?.resources || [],
    },
  });

  const handleSubmit = async (data: LessonFormData) => {
    try {
      const submitData = {
        ...data,
        objectives: objectives.filter(obj => obj.trim() !== ''),
        tags: tags,
        resources: resources,
        content,
      };

      await onSave(submitData);
      toast.success(lesson ? 'Lesson updated successfully' : 'Lesson created successfully');
    } catch (error) {
      toast.error(`Failed to ${lesson ? 'update' : 'create'} lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addResource = (resource: Omit<LessonResource, 'id' | 'lesson_id'>) => {
    const newResource: LessonResource = {
      ...resource,
      id: `temp-${Date.now()}`,
      lesson_id: lesson?.id || 'new',
      sequence: resources.length,
    };
    setResources([...resources, newResource]);
  };

  const updateResource = (resourceId: string, updates: Partial<LessonResource>) => {
    setResources(resources.map(resource => 
      resource.id === resourceId ? { ...resource, ...updates } : resource
    ));
  };

  const removeResource = (resourceId: string) => {
    setResources(resources.filter(resource => resource.id !== resourceId));
  };

  const insertTextAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    }
  }, [content]);

  const formatText = (formatType: string) => {
    const selectedText = window.getSelection()?.toString() || '';
    let formattedText = '';

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText || 'underlined text'}</u>`;
        break;
      case 'h1':
        formattedText = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText || 'Heading 3'}`;
        break;
      case 'list':
        formattedText = `- ${selectedText || 'List item'}`;
        break;
      case 'ordered-list':
        formattedText = `1. ${selectedText || 'List item'}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'Quote text'}`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        break;
    }

    insertTextAtCursor(formattedText);
  };

  const renderResourceDialog = () => (
    <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingResource ? 'Edit Resource' : 'Add Resource'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input placeholder="Resource name" />
          </div>
          <div>
            <Label>Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>URL</Label>
            <Input placeholder="Resource URL" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Optional description" rows={3} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch />
            <Label>Downloadable</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowResourceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowResourceDialog(false)}>
              {editingResource ? 'Update' : 'Add'} Resource
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {lesson ? 'Edit Lesson' : 'Create Lesson'}
              </h2>
              <p className="text-gray-600">Section: {section.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="button" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Lesson Content</CardTitle>
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contentTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon className="h-4 w-4" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lesson Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter lesson name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimated_duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes) *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description of the lesson"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content Editor Toolbar */}
                  <div className="border rounded-lg">
                    <div className="border-b p-2 flex items-center gap-1 flex-wrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('underline')}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('h1')}
                      >
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('h2')}
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('h3')}
                      >
                        <Heading3 className="h-4 w-4" />
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('ordered-list')}
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('quote')}
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('code')}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('link')}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Content Editor */}
                    <div className="p-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your lesson content here... You can use Markdown formatting."
                                rows={12}
                                className="min-h-[300px] border-0 resize-none focus:ring-0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {difficultyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={option.color}>
                                      {option.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sequence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sequence Order</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                          <FormDescription>
                            Order of this lesson in the section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <Label className="text-sm font-medium">Learning Objectives</Label>
                    <div className="space-y-2 mt-2">
                      {objectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Input
                            value={objective}
                            onChange={(e) => updateObjective(index, e.target.value)}
                            placeholder={`Learning objective ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeObjective(index)}
                            disabled={objectives.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addObjective}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Learning Objective
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Lesson Resources</CardTitle>
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingResource(null);
                        setShowResourceDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {resources.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">No resources added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResourceDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Resource
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resources.map((resource) => {
                        const TypeIcon = resourceTypeOptions.find(
                          option => option.value === resource.resource_type
                        )?.icon || File;
                        
                        return (
                          <div
                            key={resource.id}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <TypeIcon className="h-5 w-5 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{resource.name}</h4>
                              {resource.description && (
                                <p className="text-xs text-gray-600 truncate">{resource.description}</p>
                              )}
                              <p className="text-xs text-gray-500">{resource.resource_url}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {resource.resource_type}
                              </Badge>
                              {resource.is_downloadable && (
                                <Badge variant="secondary" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" />
                                  Downloadable
                                </Badge>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingResource(resource);
                                  setShowResourceDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeResource(resource.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="is_required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Required Lesson</FormLabel>
                          <FormDescription>
                            Students must complete this lesson to progress
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Prerequisites */}
                  <div>
                    <Label className="text-sm font-medium">Prerequisites</Label>
                    <FormDescription className="mb-2">
                      Other lessons that must be completed before this one
                    </FormDescription>
                    {/* This would be a multi-select component for available lessons */}
                    <div className="border rounded-lg p-4 text-center text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Prerequisite selection coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {renderResourceDialog()}
    </div>
  );
}