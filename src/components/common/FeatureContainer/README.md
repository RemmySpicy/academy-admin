# FeatureContainer Component

`FeatureContainer` is a reusable component for creating consistent UI layouts across the application's features. It provides a standardized structure with configurable header, search, filters, content area, and pagination.

## Features

- Customizable header with title, icon, and badge
- Optional search functionality
- Support for primary and secondary action buttons
- Customizable filter components
- View toggle support
- Built-in pagination
- Flexible content area with padding options

## Installation

The component is already included in the codebase at `src/components/common/FeatureContainer`.

## Usage

Here's a basic example of using the `FeatureContainer`:

```jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FeatureContainer from '../components/common/FeatureContainer';

const MyFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <FeatureContainer
      title="My Feature"
      showSearch={true}
      searchPlaceholder="Search..."
      searchValue={searchQuery}
      onSearchChange={handleSearch}
      primaryAction={{
        label: 'Create',
        icon: Plus,
        onClick: () => console.log('Create clicked')
      }}
    >
      <div>Your feature content goes here</div>
    </FeatureContainer>
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | The title displayed in the header |
| `icon` | Component | Lucide icon component to display beside the title |
| `badge` | string | Optional badge text to show next to the title |
| `showSearch` | boolean | Whether to show the search input |
| `searchPlaceholder` | string | Placeholder text for the search input |
| `searchValue` | string | Current value of the search input |
| `onSearchChange` | function | Handler for search input changes |
| `primaryAction` | object | Configuration for primary action button |
| `secondaryActions` | array | Configuration for secondary action buttons |
| `customFilterComponent` | node | Custom filter component to render |
| `viewToggle` | node | Custom view toggle component |
| `noPadding` | boolean | Whether to remove padding from content area |
| `customPadding` | string | Custom padding value for content area |
| `showPagination` | boolean | Whether to show pagination |
| `paginationInfo` | string | Text showing pagination information |
| `currentPage` | number | Current page number |
| `totalPages` | number | Total number of pages |
| `onPageChange` | function | Handler for page changes |

## Action Button Props

Action buttons (`primaryAction` and items in `secondaryActions`) accept the following properties:

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Button text |
| `icon` | Component | Lucide icon to show in button |
| `onClick` | function | Click handler |
| `disabled` | boolean | Whether the button is disabled |
| `as` | Component | Component to render instead of button (e.g., Link) |
| `to` | string | Path to navigate to (if `as` is Link) |

## Utilities

The `utils.js` file provides helper functions to create common UI elements:

### createFilterDropdowns

Creates a group of dropdown selects for filtering.

```jsx
import { createFilterDropdowns } from '../components/common/FeatureContainer/utils';

// ...

const filterComponent = createFilterDropdowns([
  {
    value: categoryFilter,
    onChange: setCategoryFilter,
    options: [
      { value: '', label: 'All Categories' },
      { value: 'category1', label: 'Category 1' },
      { value: 'category2', label: 'Category 2' }
    ]
  }
]);
```

### createFilterButtons

Creates a group of toggle buttons for filtering.

```jsx
import { createFilterButtons } from '../components/common/FeatureContainer/utils';

// ...

const filterComponent = createFilterButtons(
  activeFilters,
  toggleFilter,
  [
    { value: 'filter1', label: 'Filter 1', icon: Icon1 },
    { value: 'filter2', label: 'Filter 2', icon: Icon2 }
  ]
);
```

### createViewToggle

Creates a toggle component for switching between view modes.

```jsx
import { createViewToggle } from '../components/common/FeatureContainer/utils';

// ...

const viewToggleComponent = createViewToggle(
  viewMode,
  setViewMode,
  [
    { value: 'grid', label: 'Grid' },
    { value: 'table', label: 'Table' }
  ]
);
```

### createPaginationInfo

Creates a formatted string for pagination information.

```jsx
import { createPaginationInfo } from '../components/common/FeatureContainer/utils';

// ...

const paginationText = createPaginationInfo(currentPage, itemsPerPage, totalItems);
```

## Examples

Check these files for implementation examples:

1. `src/components/courses/Management/index.js` - Grid/Table view with filters
2. `src/components/courses/CurriculaList/index.js` - Collapsible sections with cards
3. `src/components/courses/Lessons/index.js` - Table view with filter buttons 