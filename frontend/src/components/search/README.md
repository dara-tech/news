# Search Components

This folder contains all the components related to the search functionality, broken down from the original `SearchPageClient.tsx` for better maintainability and reusability.

## Components

### `SearchResultItem.tsx`
- Displays individual search result items
- Includes thumbnail, title, description, category, author, and metadata
- Handles featured and breaking news badges
- Responsive design with hover effects

### `SearchFilters.tsx`
- Advanced filtering component with dropdowns
- Categories, date range, sort options
- Clear filters functionality
- Apply filters button with loading state

### `SearchForm.tsx`
- Main search input form
- Search button with loading state
- Clear search functionality
- Toggle filters button

### `SearchLoadingStates.tsx`
- `SearchLoadingSkeleton`: Loading state with skeleton placeholders
- `SearchEmptyState`: No results found state with suggestions
- `SearchInitialState`: Initial empty state before search
- `SearchResultsHeader`: Results header with count and filter toggle
- `LoadMoreButton`: Pagination button for loading more results

### `types.ts`
- Shared TypeScript interfaces
- `SearchResult`: Structure for search result items
- `SearchFilters`: Available filter options
- `SearchPageClientProps`: Props for the main component

### `index.ts`
- Barrel export file for easy importing
- Exports all components and types

## Usage

```tsx
import {
  SearchResultItem,
  SearchFiltersComponent,
  SearchForm,
  SearchLoadingSkeleton,
  SearchEmptyState,
  SearchInitialState,
  SearchResultsHeader,
  LoadMoreButton,
  type SearchResult,
  type SearchFilters
} from '@/components/search'
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the application
3. **Maintainability**: Easier to update and debug individual components
4. **Testability**: Each component can be tested in isolation
5. **Performance**: Smaller bundle sizes and better tree-shaking
6. **Developer Experience**: Easier to find and modify specific functionality
