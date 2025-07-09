#!/usr/bin/env python3
"""
Create New Feature Specification Script

This script helps create a new feature specification following the Academy Admin
project template and conventions.
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime

def create_feature_spec(feature_name, description="", priority="medium"):
    """Create a new feature specification with all required directories and files"""
    
    # Convert feature name to various formats
    kebab_case = feature_name.lower().replace(' ', '-').replace('_', '-')
    snake_case = feature_name.lower().replace(' ', '_').replace('-', '_')
    title_case = feature_name.replace('-', ' ').replace('_', ' ').title()
    
    # Base directories
    project_root = Path(__file__).parent.parent
    specs_dir = project_root / "specs"
    template_path = specs_dir / "templates" / "new-feature-template.md"
    
    # Create directories
    feature_dir = specs_dir / "features" / kebab_case
    api_spec_path = specs_dir / "api" / f"{kebab_case}.md"
    database_spec_path = specs_dir / "database" / f"{kebab_case}.md"
    ui_spec_path = specs_dir / "ui" / "admin-dashboard" / f"{kebab_case}.md"
    
    print(f"🚀 Creating feature specification for: {title_case}")
    print(f"📁 Feature directory: {feature_dir}")
    
    # Create feature directory
    feature_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy and customize template
    if template_path.exists():
        feature_readme = feature_dir / "README.md"
        with open(template_path, 'r') as template_file:
            content = template_file.read()
        
        # Replace placeholders
        content = content.replace('[Feature Name]', title_case)
        content = content.replace('[feature-name]', kebab_case)
        content = content.replace('[snake_case]', snake_case)
        content = content.replace('[What this feature does]', description)
        content = content.replace('[High/Medium/Low]', priority.title())
        
        # Add creation timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d")
        content = content.replace('---\n\n## Notes and Decisions', 
                                f'---\n\n**Created**: {timestamp}\n**Status**: Draft\n\n## Notes and Decisions')
        
        with open(feature_readme, 'w') as feature_file:
            feature_file.write(content)
        
        print(f"✅ Created feature specification: {feature_readme}")
    else:
        print(f"⚠️  Template not found: {template_path}")
    
    # Create API specification
    api_content = f"""# {title_case} API Specification

## Overview
API endpoints for {title_case} feature.

## Base URL
- Development: `http://localhost:8000/api/v1`
- Production: `https://your-api-domain.com/api/v1`

## Authentication
All endpoints require authentication via Bearer token.

## Endpoints

### {title_case} Management

#### List {title_case}s
```
GET /api/v1/{kebab_case}
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 20)
- `search` (string, optional): Search query
- `sort_by` (string, optional): Sort field
- `sort_order` (string, optional): Sort order (asc/desc)

**Response:**
```json
{{
  "items": [
    {{
      "id": "uuid",
      "created_at": "2025-01-08T00:00:00Z",
      "updated_at": "2025-01-08T00:00:00Z"
    }}
  ],
  "total": 0,
  "page": 1,
  "per_page": 20,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}}
```

#### Create {title_case}
```
POST /api/v1/{kebab_case}
```

**Request Body:**
```json
{{
  "name": "string"
}}
```

**Response:**
```json
{{
  "id": "uuid",
  "name": "string",
  "created_at": "2025-01-08T00:00:00Z",
  "updated_at": "2025-01-08T00:00:00Z"
}}
```

#### Get {title_case}
```
GET /api/v1/{kebab_case}/{{id}}
```

**Response:**
```json
{{
  "id": "uuid",
  "name": "string",
  "created_at": "2025-01-08T00:00:00Z",
  "updated_at": "2025-01-08T00:00:00Z"
}}
```

#### Update {title_case}
```
PUT /api/v1/{kebab_case}/{{id}}
```

**Request Body:**
```json
{{
  "name": "string"
}}
```

**Response:**
```json
{{
  "id": "uuid",
  "name": "string",
  "created_at": "2025-01-08T00:00:00Z",
  "updated_at": "2025-01-08T00:00:00Z"
}}
```

#### Delete {title_case}
```
DELETE /api/v1/{kebab_case}/{{id}}
```

**Response:**
```json
{{
  "message": "{title_case} deleted successfully"
}}
```

## Error Responses

### 400 Bad Request
```json
{{
  "detail": "Invalid request data"
}}
```

### 401 Unauthorized
```json
{{
  "detail": "Authentication required"
}}
```

### 403 Forbidden
```json
{{
  "detail": "Insufficient permissions"
}}
```

### 404 Not Found
```json
{{
  "detail": "{title_case} not found"
}}
```

### 422 Validation Error
```json
{{
  "detail": [
    {{
      "loc": ["field_name"],
      "msg": "Field is required",
      "type": "value_error.missing"
    }}
  ]
}}
```

### 500 Internal Server Error
```json
{{
  "detail": "Internal server error"
}}
```

## Rate Limiting
- Rate limit: 100 requests per minute per user
- Burst limit: 10 requests per second
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination
All list endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `per_page`: Items per page (max 100)

## Filtering and Sorting
List endpoints support filtering and sorting:
- `search`: Full-text search across relevant fields
- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`

## Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error
"""

    with open(api_spec_path, 'w') as api_file:
        api_file.write(api_content)
    
    print(f"✅ Created API specification: {api_spec_path}")
    
    # Create database specification
    database_content = f"""# {title_case} Database Schema

## Overview
Database schema for {title_case} feature.

## Tables

### {snake_case} Table
Main table for storing {title_case} data.

```sql
CREATE TABLE {snake_case} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Feature-specific columns
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT {snake_case}_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_{snake_case}_name ON {snake_case}(name);
CREATE INDEX idx_{snake_case}_active ON {snake_case}(is_active);
CREATE INDEX idx_{snake_case}_created_at ON {snake_case}(created_at);

-- Search indexes
CREATE INDEX idx_{snake_case}_search ON {snake_case} 
    USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

### Constraints
```sql
-- Business rule constraints
ALTER TABLE {snake_case} ADD CONSTRAINT {snake_case}_name_unique UNIQUE (name);
ALTER TABLE {snake_case} ADD CONSTRAINT {snake_case}_name_length CHECK (LENGTH(name) >= 2);
```

### Triggers
```sql
-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_{snake_case}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_{snake_case}_updated_at
    BEFORE UPDATE ON {snake_case}
    FOR EACH ROW
    EXECUTE FUNCTION update_{snake_case}_updated_at();
```

## Relationships

### Foreign Keys
```sql
-- Add foreign key relationships as needed
-- ALTER TABLE {snake_case} ADD CONSTRAINT fk_{snake_case}_parent
--     FOREIGN KEY (parent_id) REFERENCES parent_table(id);
```

### Junction Tables
```sql
-- Create junction tables for many-to-many relationships as needed
-- CREATE TABLE {snake_case}_related (
--     {snake_case}_id UUID REFERENCES {snake_case}(id) ON DELETE CASCADE,
--     related_id UUID REFERENCES related_table(id) ON DELETE CASCADE,
--     PRIMARY KEY ({snake_case}_id, related_id)
-- );
```

## Views
```sql
-- Create views for common queries
CREATE VIEW {snake_case}_summary AS
SELECT 
    id,
    name,
    is_active,
    created_at,
    updated_at
FROM {snake_case}
WHERE is_active = TRUE;
```

## Stored Procedures
```sql
-- Create stored procedures for complex operations
CREATE OR REPLACE FUNCTION get_{snake_case}_stats()
RETURNS TABLE (
    total_count INTEGER,
    active_count INTEGER,
    inactive_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_count,
        COUNT(*) FILTER (WHERE is_active = TRUE)::INTEGER as active_count,
        COUNT(*) FILTER (WHERE is_active = FALSE)::INTEGER as inactive_count
    FROM {snake_case};
END;
$$ LANGUAGE plpgsql;
```

## Data Migration
```sql
-- Migration script for existing data
-- INSERT INTO {snake_case} (name, description, is_active)
-- SELECT old_name, old_description, old_active
-- FROM legacy_table;
```

## Sample Data
```sql
-- Insert sample data for testing
INSERT INTO {snake_case} (name, description, is_active) VALUES
    ('Sample {title_case} 1', 'Description for sample 1', TRUE),
    ('Sample {title_case} 2', 'Description for sample 2', TRUE),
    ('Sample {title_case} 3', 'Description for sample 3', FALSE);
```

## Performance Considerations
- Index on frequently queried columns
- Consider partitioning for large datasets
- Monitor query performance and optimize as needed
- Use appropriate data types for optimal storage

## Security Considerations
- Row Level Security (RLS) policies if needed
- Audit trail for sensitive operations
- Input validation at database level
- Encryption for sensitive data

## Backup and Recovery
- Regular backups of {snake_case} table
- Point-in-time recovery capabilities
- Test restore procedures
- Document recovery procedures
"""

    with open(database_spec_path, 'w') as db_file:
        db_file.write(database_content)
    
    print(f"✅ Created database specification: {database_spec_path}")
    
    # Create UI specification
    ui_content = f"""# {title_case} UI Specification

## Overview
User interface specifications for {title_case} feature in the admin dashboard.

## Page Layout

### {title_case} List Page
**URL**: `/admin/{kebab_case}`

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content Area                                 │
│         │ ┌─────────────────────────────────────────────────┐ │
│         │ │ Page Title & Actions                           │ │
│         │ ├─────────────────────────────────────────────────┤ │
│         │ │ Filters & Search                               │ │
│         │ ├─────────────────────────────────────────────────┤ │
│         │ │ Data Table                                     │ │
│         │ │ ┌─────────────────────────────────────────────┐ │ │
│         │ │ │ Table Headers                               │ │ │
│         │ │ ├─────────────────────────────────────────────┤ │ │
│         │ │ │ Table Rows                                  │ │ │
│         │ │ │ - Name                                      │ │ │
│         │ │ │ - Status                                    │ │ │
│         │ │ │ - Created Date                              │ │ │
│         │ │ │ - Actions                                   │ │ │
│         │ │ └─────────────────────────────────────────────┘ │ │
│         │ ├─────────────────────────────────────────────────┤ │
│         │ │ Pagination                                     │ │
│         │ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Components

##### Page Header
```typescript
interface {title_case}HeaderProps {{
  totalCount: number;
  onCreateClick: () => void;
}}

const {title_case}Header: React.FC<{title_case}HeaderProps> = ({{ totalCount, onCreateClick }}) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold">{title_case}s</h1>
      <p className="text-gray-600">{{totalCount}} total {title_case.lower()}s</p>
    </div>
    <Button onClick={{onCreateClick}} className="bg-blue-600 hover:bg-blue-700">
      Create {title_case}
    </Button>
  </div>
);
```

##### Filters Component
```typescript
interface {title_case}FiltersProps {{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
}}

const {title_case}Filters: React.FC<{title_case}FiltersProps> = ({{
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters
}}) => (
  <div className="bg-white p-4 rounded-lg shadow mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Search</label>
        <input
          type="text"
          value={{searchQuery}}
          onChange={{(e) => onSearchChange(e.target.value)}}
          placeholder="Search {title_case.lower()}s..."
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <select
          value={{statusFilter}}
          onChange={{(e) => onStatusChange(e.target.value)}}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button
          onClick={{onClearFilters}}
          variant="outline"
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  </div>
);
```

##### Data Table
```typescript
interface {title_case}TableProps {{
  data: {title_case}[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}}

const {title_case}Table: React.FC<{title_case}TableProps> = ({{
  data,
  loading,
  onEdit,
  onDelete,
  onView
}}) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {{data.map((item) => (
          <tr key={{item.id}} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {{item.name}}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={{`px-2 py-1 text-xs rounded-full ${{
                item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }}`}}>
                {{item.is_active ? 'Active' : 'Inactive'}}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{new Date(item.created_at).toLocaleDateString()}}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={{() => onView(item.id)}}
                className="text-blue-600 hover:text-blue-900 mr-3"
              >
                View
              </button>
              <button
                onClick={{() => onEdit(item.id)}}
                className="text-yellow-600 hover:text-yellow-900 mr-3"
              >
                Edit
              </button>
              <button
                onClick={{() => onDelete(item.id)}}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}}
      </tbody>
    </table>
  </div>
);
```

### Create/Edit {title_case} Modal

#### Modal Component
```typescript
interface {title_case}ModalProps {{
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Partial<{title_case}>;
  onSubmit: (data: {title_case}FormData) => void;
}}

const {title_case}Modal: React.FC<{title_case}ModalProps> = ({{
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit
}}) => {{
  const form = useForm<{title_case}FormData>({{
    resolver: zodResolver({snake_case}Schema),
    defaultValues: initialData
  }});

  return (
    <Dialog open={{isOpen}} onOpenChange={{onClose}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {{mode === 'create' ? 'Create' : 'Edit'}} {title_case}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={{form.handleSubmit(onSubmit)}} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {{...form.register('name')}}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter {title_case.lower()} name"
            />
            {{form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {{form.formState.errors.name.message}}
              </p>
            )}}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {{...form.register('description')}}
              className="w-full px-3 py-2 border rounded-md"
              rows={{3}}
              placeholder="Enter description (optional)"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {{...form.register('is_active')}}
              id="is_active"
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={{onClose}}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {{mode === 'create' ? 'Create' : 'Update'}} {title_case}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}};
```

## Form Validation

### Validation Schema
```typescript
import {{ z }} from 'zod';

const {snake_case}Schema = z.object({{
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
}});

type {title_case}FormData = z.infer<typeof {snake_case}Schema>;
```

## Responsive Design

### Mobile Layout
- Stack filters vertically on mobile
- Hide less important table columns on small screens
- Use swipe gestures for table actions
- Optimize modal size for mobile devices

### Tablet Layout
- Show 2-column filter layout
- Display all table columns
- Maintain desktop-like functionality

## Accessibility

### ARIA Labels
- Add proper ARIA labels for all interactive elements
- Use semantic HTML elements
- Ensure keyboard navigation works properly

### Screen Reader Support
- Provide descriptive text for actions
- Use proper heading hierarchy
- Add loading states with announcements

## Error Handling

### Error States
- Display error messages clearly
- Provide actionable error resolution
- Show loading states during operations
- Handle network errors gracefully

### Validation Errors
- Highlight invalid fields
- Show specific validation messages
- Prevent form submission with errors
- Clear errors when fields are corrected

## Performance Considerations

### Loading States
- Show skeleton loaders for tables
- Display progress indicators for long operations
- Implement pagination for large datasets
- Use debounced search input

### Optimization
- Implement virtual scrolling for large tables
- Use React.memo for expensive components
- Optimize re-renders with proper key props
- Cache API responses appropriately
"""

    # Create UI spec directory if it doesn't exist
    ui_spec_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(ui_spec_path, 'w') as ui_file:
        ui_file.write(ui_content)
    
    print(f"✅ Created UI specification: {ui_spec_path}")
    
    # Update specs README to include new feature
    specs_readme = specs_dir / "README.md"
    if specs_readme.exists():
        with open(specs_readme, 'r') as readme_file:
            readme_content = readme_file.read()
        
        # Add feature to the list (if not already present)
        if kebab_case not in readme_content:
            # Find the features section and add the new feature
            features_section = "## Available Features"
            if features_section in readme_content:
                lines = readme_content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith(features_section):
                        # Find the end of the features list
                        j = i + 1
                        while j < len(lines) and (lines[j].startswith('-') or lines[j].strip() == ''):
                            j += 1
                        
                        # Insert new feature
                        lines.insert(j - 1, f"- **{title_case}**: {description or 'Feature description'}")
                        
                        # Write back to file
                        with open(specs_readme, 'w') as readme_file:
                            readme_file.write('\n'.join(lines))
                        
                        print(f"✅ Updated specs README with new feature")
                        break
    
    print(f"\n🎉 Feature specification created successfully!")
    print(f"📝 Next steps:")
    print(f"   1. Review and customize the specifications in:")
    print(f"      - {feature_dir}/README.md")
    print(f"      - {api_spec_path}")
    print(f"      - {database_spec_path}")
    print(f"      - {ui_spec_path}")
    print(f"   2. Update the specifications with specific requirements")
    print(f"   3. Create database migrations")
    print(f"   4. Implement API endpoints")
    print(f"   5. Build UI components")
    print(f"   6. Write tests")

def main():
    parser = argparse.ArgumentParser(description="Create new feature specification")
    parser.add_argument("feature_name", help="Name of the feature (e.g., 'Payment Management')")
    parser.add_argument("--description", "-d", default="", help="Brief description of the feature")
    parser.add_argument("--priority", "-p", choices=["low", "medium", "high"], default="medium", help="Feature priority")
    
    args = parser.parse_args()
    
    create_feature_spec(args.feature_name, args.description, args.priority)

if __name__ == "__main__":
    main()