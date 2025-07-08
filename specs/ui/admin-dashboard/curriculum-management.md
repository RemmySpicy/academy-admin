# Curriculum Management UI Specification

## Interface Overview

The curriculum management interface provides comprehensive tools for building, organizing, and maintaining the 7-level curriculum hierarchy. It enables administrators to create structured learning programs with detailed assessment rubrics, equipment requirements, and multimedia content integration.

## User Flow

### Curriculum Builder Flow
1. **Navigate**: Access curriculum management from main menu
2. **Select Program**: Choose program to work with
3. **Navigate Hierarchy**: Use tree view to navigate curriculum structure
4. **Create/Edit**: Add or modify curriculum elements
5. **Configure**: Set up assessments, equipment, and content
6. **Publish**: Activate curriculum for student use

### Content Management Flow
1. **Access Library**: Navigate to content library
2. **Upload Media**: Add videos, documents, images
3. **Organize Content**: Tag and categorize content
4. **Associate Lessons**: Link content to specific lessons
5. **Preview**: Review content presentation
6. **Publish**: Make content available to instructors

### Assessment Builder Flow
1. **Create Rubric**: Design assessment rubric for level
2. **Define Criteria**: Set up assessment criteria and descriptors
3. **Configure Ratings**: Set up 0-3 star rating system
4. **Preview Rubric**: Review assessment interface
5. **Activate**: Make rubric available for assessments

## Layout Specifications

### Curriculum Builder Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Curriculum Management                     [+ Add Program]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Hierarchy Tree  │ │ Content Editor                      │ │
│ │                 │ │                                     │ │
│ │ ▼ Swimming      │ │ ┌─────────────────────────────────┐ │ │
│ │   ▼ Club 3-5    │ │ │ Level 1: Water Safety           │ │ │
│ │     ▼ Level 1   │ │ │                                 │ │ │
│ │       ▼ Module 1│ │ │ Description: [_____________]    │ │ │
│ │         ▼ Sec 1 │ │ │ Prerequisites: [_____________]  │ │ │
│ │           L101  │ │ │ Duration: [___] hours           │ │ │
│ │           L102  │ │ │                                 │ │ │
│ │         ▶ Sec 2 │ │ │ [Equipment] [Rubrics] [Media]   │ │ │
│ │       ▶ Module 2│ │ └─────────────────────────────────┘ │ │
│ │     ▶ Level 2   │ │                                     │ │
│ │   ▶ Club 6-18   │ │                                     │ │ │
│ │ ▶ Football      │ │                                     │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Assessment Rubric Builder Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Assessment Rubric Builder                           [Save]   │
├─────────────────────────────────────────────────────────────┤
│ Rubric Name: Level 1 Swimming Assessment                    │
│ Level: Swimming Club 3-5 > Level 1                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Skill Area         │ 0 Star │ 1 Star │ 2 Star │ 3 Star │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Water Entry        │ Won't  │ Enters  │ Enters  │ Enters │ │
│ │                    │ enter  │ with    │ with    │ indep- │ │
│ │                    │ water  │ help    │ minimal │ endently│ │
│ │                    │        │         │ help    │        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Floating           │ Cannot │ Floats  │ Floats  │ Floats │ │
│ │                    │ float  │ with    │ 3-5 sec │ 10+ sec│ │
│ │                    │        │ support │         │        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [+ Add Skill Area]                                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Specifications

### Curriculum Tree Component
```typescript
interface CurriculumTreeProps {
  programs: Program[];
  selectedNode?: CurriculumNode;
  onNodeSelect: (node: CurriculumNode) => void;
  onNodeCreate: (parentNode: CurriculumNode, type: NodeType) => void;
  onNodeDelete: (node: CurriculumNode) => void;
  onNodeMove: (node: CurriculumNode, newParent: CurriculumNode) => void;
}

interface CurriculumNode {
  id: string;
  type: 'program' | 'course' | 'curriculum' | 'level' | 'module' | 'section' | 'lesson';
  name: string;
  description?: string;
  children: CurriculumNode[];
  isExpanded: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
}

type NodeType = 'course' | 'curriculum' | 'level' | 'module' | 'section' | 'lesson';
```

#### Tree Features
1. **Expandable Nodes**
   - Click to expand/collapse
   - Visual indicators for node state
   - Lazy loading of deep hierarchy

2. **Context Menu**
   - Right-click for actions
   - Add child nodes
   - Edit current node
   - Delete with confirmation
   - Copy/paste functionality

3. **Drag & Drop**
   - Reorder nodes within level
   - Move nodes between parents
   - Visual drop indicators
   - Validation of valid moves

4. **Search & Filter**
   - Search across all nodes
   - Filter by node type
   - Filter by status (active/inactive)
   - Highlight search results

### Content Editor Component
```typescript
interface ContentEditorProps {
  node: CurriculumNode;
  onSave: (updates: Partial<CurriculumNode>) => Promise<void>;
  onCancel: () => void;
  readonly?: boolean;
}
```

#### Editor Sections
1. **Basic Information**
   - Name and description fields
   - Rich text editor for descriptions
   - Metadata tags and categories
   - Status toggle (active/inactive)

2. **Node-Specific Fields**
   - **Level**: Entry/exit criteria, duration, prerequisites
   - **Module**: Learning objectives, sequence order
   - **Section**: Learning outcomes, estimated time
   - **Lesson**: Lesson content, instructor guidelines

3. **Associated Data**
   - Equipment requirements (for levels)
   - Assessment rubrics (for levels)
   - Media content (for lessons)
   - Prerequisites and dependencies

### Equipment Requirements Component
```typescript
interface EquipmentRequirementsProps {
  levelId: string;
  equipment: EquipmentRequirement[];
  onAdd: (equipment: EquipmentInput) => Promise<void>;
  onUpdate: (id: string, updates: Partial<EquipmentRequirement>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface EquipmentRequirement {
  id: string;
  name: string;
  type: 'safety' | 'instructional' | 'assessment' | 'enhancement';
  quantity: number;
  isMandatory: boolean;
  specifications?: string;
  safetyNotes?: string;
}
```

#### Equipment Management Features
1. **Equipment List**
   - Categorized by equipment type
   - Quantity and mandatory indicators
   - Specifications and safety notes
   - Quick edit capabilities

2. **Add Equipment Modal**
   - Equipment name and type selection
   - Quantity input with validation
   - Mandatory checkbox
   - Specifications text area
   - Safety notes section

3. **Equipment Library**
   - Predefined equipment templates
   - Search and filter capabilities
   - Copy from other levels
   - Bulk import functionality

### Assessment Rubric Builder
```typescript
interface RubricBuilderProps {
  levelId: string;
  rubric?: AssessmentRubric;
  onSave: (rubric: RubricInput) => Promise<void>;
  onCancel: () => void;
}

interface AssessmentRubric {
  id: string;
  name: string;
  description?: string;
  type: 'formative' | 'summative' | 'diagnostic';
  criteria: AssessmentCriteria[];
  isActive: boolean;
}

interface AssessmentCriteria {
  id: string;
  name: string;
  description?: string;
  weight: number;
  sequenceOrder: number;
  descriptors: {
    zeroStar: string;
    oneStar: string;
    twoStar: string;
    threeStar: string;
  };
}
```

#### Rubric Builder Features
1. **Rubric Matrix View**
   - Grid layout with criteria rows
   - 0-3 star rating columns
   - Inline editing of descriptors
   - Visual star rating display

2. **Criteria Management**
   - Add/remove skill areas
   - Reorder criteria with drag-drop
   - Weight assignment for criteria
   - Bulk edit capabilities

3. **Preview Mode**
   - Instructor assessment view
   - Student progress display
   - Print-friendly format
   - Export options

### Media Library Component
```typescript
interface MediaLibraryProps {
  lessonId?: string;
  media: MediaFile[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAssociate: (mediaId: string, lessonId: string) => Promise<void>;
}

interface MediaFile {
  id: string;
  fileName: string;
  originalFileName: string;
  fileType: 'video' | 'audio' | 'document' | 'image';
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  lessonAssociations: string[];
  isActive: boolean;
}
```

#### Media Library Features
1. **File Upload**
   - Drag-and-drop interface
   - Multiple file selection
   - Progress indicators
   - File type validation
   - Size limit enforcement

2. **Media Grid/List View**
   - Toggle between grid and list
   - Thumbnail previews
   - File information display
   - Quick action buttons
   - Search and filter

3. **Media Preview**
   - In-browser video/audio playback
   - Document preview
   - Image lightbox
   - Download options
   - Usage tracking

## Drag & Drop Functionality

### Curriculum Hierarchy Reordering
```typescript
const useCurriculumDragDrop = () => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const activeNode = findNode(active.id);
    const overNode = findNode(over.id);
    
    if (!activeNode || !overNode) return;
    
    // Validate move operation
    if (!isValidMove(activeNode, overNode)) {
      toast.error("Invalid move operation");
      return;
    }
    
    // Perform the move
    moveNode(activeNode, overNode);
  };

  return { sensors, handleDragEnd };
};
```

### File Upload Drag & Drop
```typescript
const MediaUploadZone = ({ onUpload }: { onUpload: (files: File[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => isValidFileType(file));
    
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  }, [onUpload]);
  
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border"
      )}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        Drag and drop files here, or click to select
      </p>
    </div>
  );
};
```

## Data Visualization

### Curriculum Progress Charts
```typescript
interface ProgressChartProps {
  data: CurriculumProgress[];
  timeframe: 'week' | 'month' | 'quarter';
}

const CurriculumProgressChart = ({ data, timeframe }: ProgressChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum Development Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--chart-1)" 
              strokeWidth={2}
              name="Completed Lessons"
            />
            <Line 
              type="monotone" 
              dataKey="inProgress" 
              stroke="var(--chart-2)" 
              strokeWidth={2}
              name="In Progress"
            />
            <Line 
              type="monotone" 
              dataKey="planned" 
              stroke="var(--chart-3)" 
              strokeWidth={2}
              name="Planned"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

### Rubric Performance Analytics
```typescript
const RubricAnalyticsChart = ({ rubricData }: { rubricData: RubricAnalytics[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Rubric Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={rubricData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skillArea" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageRating" fill="var(--chart-1)" name="Average Rating" />
            <Bar dataKey="assessmentCount" fill="var(--chart-2)" name="Assessment Count" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

## Form Validation & Error Handling

### Curriculum Node Validation
```typescript
const curriculumNodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  type: z.enum(['course', 'curriculum', 'level', 'module', 'section', 'lesson']),
  isActive: z.boolean().default(true),
  
  // Level-specific validation
  entryRating: z.number().min(0).max(3).optional(),
  exitRating: z.number().min(0).max(3).optional(),
  estimatedDuration: z.number().positive().optional(),
  
  // Module-specific validation
  learningObjectives: z.string().optional(),
  sequenceOrder: z.number().positive(),
  
  // Lesson-specific validation
  lessonContent: z.string().min(1, "Lesson content is required").optional(),
  instructorGuidelines: z.string().optional(),
  durationMinutes: z.number().positive().optional(),
}).refine((data) => {
  // Custom validation based on node type
  if (data.type === 'level') {
    return data.entryRating !== undefined && data.exitRating !== undefined;
  }
  if (data.type === 'lesson') {
    return data.lessonContent !== undefined;
  }
  return true;
}, {
  message: "Required fields missing for node type"
});
```

### Assessment Rubric Validation
```typescript
const rubricSchema = z.object({
  name: z.string().min(1, "Rubric name is required"),
  description: z.string().optional(),
  type: z.enum(['formative', 'summative', 'diagnostic']),
  criteria: z.array(z.object({
    name: z.string().min(1, "Criteria name is required"),
    weight: z.number().min(0).max(100),
    descriptors: z.object({
      zeroStar: z.string().min(1, "0-star descriptor is required"),
      oneStar: z.string().min(1, "1-star descriptor is required"),
      twoStar: z.string().min(1, "2-star descriptor is required"),
      threeStar: z.string().min(1, "3-star descriptor is required"),
    })
  })).min(1, "At least one criteria is required")
}).refine((data) => {
  // Validate total weight equals 100%
  const totalWeight = data.criteria.reduce((sum, criteria) => sum + criteria.weight, 0);
  return totalWeight === 100;
}, {
  message: "Criteria weights must total 100%"
});
```

### Media Upload Validation
```typescript
const mediaUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  description: z.string().optional(),
  tags: z.array(z.string()),
}).refine((data) => {
  // Validate file types and sizes
  const validTypes = ['video/mp4', 'image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  return data.files.every(file => 
    validTypes.includes(file.type) && file.size <= maxSize
  );
}, {
  message: "Invalid file type or size too large"
});
```

## Status Indicators & Color Coding

### Node Status System
```typescript
const nodeStatusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: Edit,
    description: 'Content is being developed'
  },
  review: {
    label: 'In Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Eye,
    description: 'Content is under review'
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Content is published and active'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Content is not currently in use'
  },
  archived: {
    label: 'Archived',
    color: 'bg-blue-100 text-blue-800',
    icon: Archive,
    description: 'Content has been archived'
  }
};
```

### Assessment Rating Visual
```typescript
const StarRating = ({ 
  rating, 
  maxRating = 3, 
  onChange, 
  readonly = false 
}: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const filled = index < rating;
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(index + 1)}
            className={cn(
              "w-6 h-6 transition-colors",
              filled ? "text-yellow-500" : "text-gray-300",
              !readonly && "hover:text-yellow-400"
            )}
          >
            <Star className={cn("w-full h-full", filled && "fill-current")} />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating}/{maxRating}
      </span>
    </div>
  );
};
```

### Equipment Type Indicators
```typescript
const equipmentTypeConfig = {
  safety: {
    label: 'Safety',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    priority: 1
  },
  instructional: {
    label: 'Instructional',
    color: 'bg-blue-100 text-blue-800',
    icon: BookOpen,
    priority: 2
  },
  assessment: {
    label: 'Assessment',
    color: 'bg-purple-100 text-purple-800',
    icon: ClipboardCheck,
    priority: 3
  },
  enhancement: {
    label: 'Enhancement',
    color: 'bg-green-100 text-green-800',
    icon: Plus,
    priority: 4
  }
};
```

## Responsive Behavior

### Desktop (≥1024px)
- **Split Layout**: Tree view (30%) + Content editor (70%)
- **Full Rubric Builder**: Matrix view with all columns visible
- **Media Grid**: 4-column grid layout
- **Modal Dialogs**: Standard modal sizes

### Tablet (768px - 1023px)
- **Collapsible Tree**: Tree collapses to give more space to editor
- **Responsive Rubric**: Horizontal scrolling for rubric matrix
- **Media Grid**: 2-column grid layout
- **Full-width Modals**: Modals take more screen space

### Mobile (<768px)
- **Tab Navigation**: Switch between tree and editor views
- **Stacked Rubric**: Vertical layout for rubric criteria
- **Single Column Media**: Single column media list
- **Full-screen Modals**: Modals take entire screen

### Mobile Curriculum Navigation
```typescript
const MobileCurriculumNav = ({ 
  currentNode, 
  onNodeSelect 
}: MobileCurriculumNavProps) => {
  const [viewMode, setViewMode] = useState<'tree' | 'editor'>('tree');
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b">
        <button
          className={cn(
            "flex-1 py-2 text-center",
            viewMode === 'tree' && "bg-primary text-primary-foreground"
          )}
          onClick={() => setViewMode('tree')}
        >
          <TreePine className="w-4 h-4 mx-auto mb-1" />
          <span className="text-xs">Structure</span>
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-center",
            viewMode === 'editor' && "bg-primary text-primary-foreground"
          )}
          onClick={() => setViewMode('editor')}
        >
          <Edit className="w-4 h-4 mx-auto mb-1" />
          <span className="text-xs">Editor</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {viewMode === 'tree' ? (
          <CurriculumTree onNodeSelect={onNodeSelect} />
        ) : (
          <ContentEditor node={currentNode} />
        )}
      </div>
    </div>
  );
};
```

## Accessibility Requirements

### Tree Navigation
```typescript
// Keyboard navigation for tree
const handleKeyDown = (e: KeyboardEvent, node: CurriculumNode) => {
  switch (e.key) {
    case 'ArrowRight':
      if (!node.isExpanded && node.children.length > 0) {
        expandNode(node.id);
      } else if (node.children.length > 0) {
        focusNode(node.children[0].id);
      }
      break;
    case 'ArrowLeft':
      if (node.isExpanded) {
        collapseNode(node.id);
      } else if (node.parent) {
        focusNode(node.parent.id);
      }
      break;
    case 'ArrowDown':
      focusNextNode(node.id);
      break;
    case 'ArrowUp':
      focusPreviousNode(node.id);
      break;
    case 'Enter':
    case ' ':
      selectNode(node.id);
      break;
  }
};
```

### ARIA Labels and Roles
```typescript
// Tree accessibility
<div
  role="tree"
  aria-label="Curriculum hierarchy"
  onKeyDown={handleTreeKeyDown}
>
  {nodes.map((node) => (
    <div
      key={node.id}
      role="treeitem"
      aria-expanded={node.isExpanded}
      aria-level={node.level}
      aria-selected={node.isSelected}
      tabIndex={node.isSelected ? 0 : -1}
    >
      {node.name}
    </div>
  ))}
</div>

// Form accessibility
<form aria-labelledby="curriculum-form-title">
  <h2 id="curriculum-form-title">Edit Curriculum Level</h2>
  
  <label htmlFor="level-name">Level Name</label>
  <input
    id="level-name"
    aria-describedby="level-name-help level-name-error"
    aria-invalid={!!errors.name}
  />
  <div id="level-name-help">Enter a descriptive name for this level</div>
  {errors.name && (
    <div id="level-name-error" role="alert">
      {errors.name.message}
    </div>
  )}
</form>
```

### Screen Reader Support
- **Tree Structure**: Proper ARIA tree roles and properties
- **Form Labels**: All form fields properly labeled
- **Error Messages**: Live regions for validation errors
- **Status Updates**: Announcements for save operations
- **Navigation**: Skip links and logical tab order

## Performance Considerations

### Virtual Tree Rendering
```typescript
// Virtual tree for large curricula
const VirtualCurriculumTree = ({ nodes }: { nodes: CurriculumNode[] }) => {
  const { width, height } = useWindowSize();
  const flattenedNodes = useMemo(() => flattenTree(nodes), [nodes]);
  
  return (
    <FixedSizeList
      height={height - 100}
      width={width}
      itemCount={flattenedNodes.length}
      itemSize={32}
      itemData={flattenedNodes}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <TreeNode 
            node={data[index]} 
            level={data[index].level}
          />
        </div>
      )}
    </FixedSizeList>
  );
};
```

### Lazy Loading Content
```typescript
// Lazy load curriculum content
const useCurriculumNode = (nodeId: string) => {
  return useQuery({
    queryKey: ['curriculum-node', nodeId],
    queryFn: () => fetchCurriculumNode(nodeId),
    enabled: !!nodeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Prefetch adjacent nodes
const prefetchAdjacentNodes = (currentNode: CurriculumNode) => {
  const queryClient = useQueryClient();
  
  // Prefetch siblings
  if (currentNode.siblings) {
    currentNode.siblings.forEach(sibling => {
      queryClient.prefetchQuery({
        queryKey: ['curriculum-node', sibling.id],
        queryFn: () => fetchCurriculumNode(sibling.id),
      });
    });
  }
  
  // Prefetch children
  if (currentNode.children) {
    currentNode.children.forEach(child => {
      queryClient.prefetchQuery({
        queryKey: ['curriculum-node', child.id],
        queryFn: () => fetchCurriculumNode(child.id),
      });
    });
  }
};
```

### Media Optimization
```typescript
// Optimized media preview
const MediaPreview = ({ file }: { file: MediaFile }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  if (file.fileType === 'video') {
    return (
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        <video
          src={file.fileUrl}
          poster={file.thumbnailUrl}
          controls
          className="w-full h-full object-cover"
          onLoadedData={() => setIsLoading(false)}
          preload="metadata"
        />
      </div>
    );
  }
  
  if (file.fileType === 'image') {
    return (
      <div className="relative aspect-square">
        <Image
          src={file.fileUrl}
          alt={file.description || file.fileName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-md"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }
  
  return <DocumentPreview file={file} />;
};
```

## Testing Requirements

### Unit Tests
- **Tree Operations**: Add, edit, delete, move nodes
- **Form Validation**: All validation schemas
- **Component Rendering**: All UI components
- **Data Transformations**: Curriculum data processing

### Integration Tests
- **Curriculum Creation**: Complete hierarchy creation
- **Rubric Builder**: Assessment rubric creation and editing
- **Media Management**: File upload and association
- **Content Publishing**: Draft to published workflow

### Performance Tests
- **Large Curricula**: Test with 1000+ lessons
- **Tree Rendering**: Virtual tree performance
- **Media Loading**: Large file upload and preview
- **Search Performance**: Search across curriculum content

### Accessibility Tests
- **Tree Navigation**: Keyboard navigation testing
- **Form Accessibility**: Screen reader compatibility
- **Focus Management**: Proper focus handling
- **Color Contrast**: Visual accessibility validation

## Implementation Notes

### State Management
```typescript
// Curriculum state with Zustand
interface CurriculumState {
  selectedNode: CurriculumNode | null;
  expandedNodes: Set<string>;
  searchQuery: string;
  filteredNodes: CurriculumNode[];
  
  // Actions
  selectNode: (node: CurriculumNode) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  setSearchQuery: (query: string) => void;
  updateNode: (nodeId: string, updates: Partial<CurriculumNode>) => void;
}

const useCurriculumStore = create<CurriculumState>((set, get) => ({
  selectedNode: null,
  expandedNodes: new Set(),
  searchQuery: '',
  filteredNodes: [],
  
  selectNode: (node) => set({ selectedNode: node }),
  expandNode: (nodeId) => set((state) => ({
    expandedNodes: new Set([...state.expandedNodes, nodeId])
  })),
  collapseNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    newExpanded.delete(nodeId);
    return { expandedNodes: newExpanded };
  }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  updateNode: (nodeId, updates) => {
    // Update node in the tree
    // Trigger re-render of affected components
  }
}));
```

### File Upload Service
```typescript
class MediaUploadService {
  async uploadFiles(files: File[]): Promise<MediaFile[]> {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }
      
      return response.json();
    });
    
    return Promise.all(uploadPromises);
  }
  
  async generateThumbnail(file: MediaFile): Promise<string> {
    if (file.fileType === 'video') {
      return this.generateVideoThumbnail(file);
    }
    if (file.fileType === 'image') {
      return this.resizeImage(file);
    }
    return this.getDocumentIcon(file);
  }
  
  private async generateVideoThumbnail(file: MediaFile): Promise<string> {
    // Video thumbnail generation logic
    const video = document.createElement('video');
    video.src = file.fileUrl;
    
    return new Promise((resolve) => {
      video.addEventListener('loadeddata', () => {
        video.currentTime = 1; // Capture at 1 second
      });
      
      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        resolve(canvas.toDataURL());
      });
    });
  }
}
```