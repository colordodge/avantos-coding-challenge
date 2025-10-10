# Avantos Coding Challenge - Form Prefill DAG

A React + TypeScript application that visualizes a Directed Acyclic Graph (DAG) of forms and manages prefill mappings between form fields. This application allows users to configure how fields in downstream forms can be prefilled with data from upstream forms or global sources.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Architecture & Code Organization](#architecture--code-organization)
- [Key Design Patterns](#key-design-patterns)
- [Extensibility: Adding New Data Sources](#extensibility-adding-new-data-sources)
- [Testing](#testing)
- [Tech Stack](#tech-stack)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation & Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avantos-coding-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Mock Server Setup (Important!)**
   
   The application expects a mock server running at `http://localhost:3000` that serves blueprint data. The fetch call is made to:
   ```
   GET http://localhost:3000/api/v1/myapp/actions/blueprints/mybp/graph/
   ```
   
   If you don't have a mock server, the app will fall back to sample data located in `src/resources/sampleData.json`. To use the sample data automatically, you can modify the fetch logic or setup a simple mock server using tools like `json-server` or `msw`.

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:once` - Run tests once (CI mode)
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint

## Project Overview

This application implements a form prefill configuration system with the following features:

1. **DAG Visualization**: Displays a graph of interconnected forms using React Flow
2. **Prefill Mapping View**: Shows which fields in a form are configured to be prefilled
3. **Prefill Mapping Editor**: Allows users to configure prefill sources for form fields
4. **Data Source Traversal**: Automatically discovers available data sources by traversing the DAG
5. **Multiple Data Source Types**: Supports form fields (direct and transitive dependencies) and global data

## Architecture & Code Organization

The project follows a modular, feature-based architecture with clear separation of concerns:

```
src/
├── components/           # React components organized by feature
│   ├── DAG/             # Graph visualization components
│   │   ├── BlueprintGraph.tsx      # Main graph container
│   │   └── CustomNode.tsx          # Custom node rendering
│   └── FormDetails/     # Form detail and prefill components
│       ├── FormDetails.tsx         # Container managing view/edit modes
│       ├── PrefillMappingView.tsx  # Displays configured mappings
│       └── PrefillMappingEditor.tsx # Tree-based mapping editor
│
├── store/               # Redux state management
│   ├── slices/          # Redux Toolkit slices
│   │   ├── blueprintSlice.ts       # Blueprint data & selected node
│   │   └── prefillMappingSlice.ts  # Prefill mappings state
│   ├── selectors/       # Reselect selectors for derived state
│   │   ├── blueprintSelectors.ts   # Blueprint-related selectors
│   │   └── prefillMappingSelectors.ts # Data source aggregation
│   ├── utils/           # Store utilities
│   │   ├── fetchBlueprintData.ts   # Async thunk for API calls
│   │   └── graphUtils.ts           # DAG traversal utilities
│   └── types/           # TypeScript type definitions
│
├── resources/           # Static data and mock responses
├── test/               # Test configuration
└── theme/              # MUI theme configuration
```

### Key Architectural Decisions

1. **Redux Toolkit for State Management**: Centralized state with slices for different domains (blueprint, prefillMapping)

2. **Selector Pattern**: Complex data transformations are encapsulated in memoized selectors (using Reselect)

3. **Component Composition**: Components are small, focused, and composable
   - `FormDetails` orchestrates view/edit modes
   - `PrefillMappingView` and `PrefillMappingEditor` are separate concerns
   - `BlueprintGraph` handles graph rendering and node selection

4. **Type Safety**: Comprehensive TypeScript interfaces for all data structures

5. **Testing Strategy**: Unit tests for business logic (selectors, reducers, utilities) and integration tests for components

## Key Design Patterns

### 1. **Data Source Abstraction Pattern**

The `DataSource` interface provides a unified abstraction for all prefill sources:

```typescript
// src/store/slices/prefillMappingSlice.ts
export interface DataSource {
    type: 'form_field' | 'global'  // Extensible type union
    id: string                      // Source identifier
    name: string                    // Display name
    fieldKey: string               // Field within the source
}
```

This abstraction allows the UI to work with any data source type without modification.

### 2. **Selector Pattern for Data Aggregation**

Complex data transformations are handled by memoized selectors:

```typescript
// src/store/selectors/prefillMappingSelectors.ts

// Step 1: Flat list of all available sources
selectAvailableDataSourceMappings (data, selectedNode) => DataSource[]

// Step 2: Grouped for UI consumption
selectGroupedAvailableDataSources (sources) => {
    groups: DataSourceGroup[]
    leafIdToSource: Record<string, DataSource>
}
```

**Benefits:**
- Memoization prevents unnecessary recalculations
- Business logic is separate from UI components
- Easy to test in isolation
- Components receive pre-processed, UI-ready data

### 3. **Graph Traversal Utilities**

DAG traversal logic is encapsulated in reusable utility functions:

```typescript
// src/store/utils/graphUtils.ts
export function getAncestorIds(nodeId: string, edges: Edge[]): string[]
```

This recursive function finds all upstream dependencies (both direct and transitive), enabling the discovery of all valid prefill sources.

### 4. **Separation of View and Edit Concerns**

The `FormDetails` component acts as a state machine with two modes:
- **View Mode**: `PrefillMappingView` - Read-only display of configured mappings
- **Edit Mode**: `PrefillMappingEditor` - Interactive tree for selecting sources

This separation makes each component simpler and more focused.

### 5. **Animation for UX Enhancement**

Framer Motion provides smooth transitions:
- Modal slide-up animation when opening form details
- Horizontal slide transitions between view/edit modes
- Visual feedback for user interactions

## Extensibility: Adding New Data Sources

The application is designed to support new data source types with **minimal code changes**. Here's how to add a new data source:

### Example: Adding "Environment Variables" as a Data Source

#### Step 1: Update the DataSource Type

```typescript
// src/store/slices/prefillMappingSlice.ts

export interface DataSource {
    type: 'form_field' | 'global' | 'environment'  // Add new type
    id: string
    name: string
    fieldKey: string
}
```

#### Step 2: Add Source Discovery Logic

```typescript
// src/store/selectors/prefillMappingSelectors.ts

export const selectAvailableDataSourceMappings = createSelector(
    [selectBlueprintData, selectSelectedNode],
    (data, selectedNode) => {
        const availableSources: DataSource[] = []

        // Existing: Global fields
        const globalFieldKeys = ['test_data', 'test_data2', 'test_data3']
        globalFieldKeys.forEach((fieldKey) => {
            availableSources.push({
                type: 'global',
                id: 'global',
                name: 'Global',
                fieldKey
            })
        })

        // NEW: Environment variables
        const envVars = ['API_URL', 'TENANT_ID', 'REGION']
        envVars.forEach((fieldKey) => {
            availableSources.push({
                type: 'environment',
                id: 'environment',
                name: 'Environment Variables',
                fieldKey
            })
        })

        // Existing: Form fields from ancestors...
        // ... rest of the code
    }
)
```

#### Step 3: (Optional) Custom Rendering

If you need type-specific rendering in the UI, you can add conditional logic:

```typescript
// In PrefillMappingView.tsx, customize icon based on source type
const getSourceIcon = (sourceType: DataSource['type']) => {
    switch (sourceType) {
        case 'form_field': return <FormIcon />
        case 'global': return <PublicIcon />
        case 'environment': return <SettingsIcon />  // New
        default: return <SourceIcon />
    }
}
```

### Why This Works

1. **Type Union Extensibility**: The `type` field in `DataSource` is a union type that can be extended
2. **Centralized Discovery**: All data source logic is in `selectAvailableDataSourceMappings`
3. **UI Agnostic**: The grouping selector (`selectGroupedAvailableDataSources`) works with any source type
4. **No Component Changes**: The tree UI in `PrefillMappingEditor` automatically renders new sources

### Advanced: Dynamic Data Sources

For sources that require API calls or complex logic:

```typescript
// Create a new utility function
async function fetchAvailableApiEndpoints(): Promise<DataSource[]> {
    const response = await fetch('/api/endpoints')
    const endpoints = await response.json()
    
    return endpoints.map(endpoint => ({
        type: 'api_endpoint' as const,
        id: endpoint.id,
        name: endpoint.name,
        fieldKey: endpoint.outputField
    }))
}

// Use in an async selector or thunk
export const fetchAndSetDataSources = createAsyncThunk(...)
```

## Testing

The project has comprehensive test coverage for all critical logic:

### Test Organization

```
src/
├── components/
│   ├── DAG/
│   │   ├── BlueprintGraph.test.tsx
│   │   └── CustomNode.test.tsx
│   └── FormDetails/
│       ├── FormDetails.test.tsx
│       ├── PrefillMappingView.test.tsx
│       └── PrefillMappingEditor.test.tsx
├── store/
│   ├── slices/
│   │   ├── blueprintSlice.test.ts
│   │   └── prefillMappingSlice.test.ts
│   ├── selectors/
│   │   ├── blueprintSelectors.test.ts
│   │   └── prefillMappingSelectors.test.ts
│   └── utils/
│       ├── fetchBlueprintData.test.ts
│       └── graphUtils.test.ts
```

### Test Strategy

1. **Utility Functions**: Pure function unit tests (e.g., `graphUtils.test.ts`)
2. **Selectors**: Test input/output transformations with mock state
3. **Reducers**: Test state transitions for all actions
4. **Components**: Integration tests using React Testing Library
   - User interactions (clicks, form inputs)
   - Conditional rendering
   - Integration with Redux store

### Running Tests

```bash
# Watch mode (development)
npm test

# Single run (CI)
npm run test:once

# With coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Coverage

The project is configured to generate coverage reports with the following exclusions:
- Configuration files
- Type definitions
- Test files
- Barrel exports (index.ts)
- Theme files

View coverage report: Open `coverage/index.html` after running `npm run test:coverage`

## Tech Stack

### Core Technologies
- **React 19** - UI library with modern hooks and patterns
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool with HMR
- **Redux Toolkit** - State management with RTK Query for async operations

### UI & Visualization
- **React Flow (@xyflow/react)** - Interactive graph visualization
- **Material-UI (MUI)** - Component library for consistent UI
- **Framer Motion** - Animation library for smooth transitions
- **CSS Modules** - Scoped styling

### Testing
- **Vitest** - Fast unit test runner (Vite-native)
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom matchers
- **happy-dom** - Lightweight DOM implementation for tests

### Development Tools
- **ESLint** - Code linting with React and TypeScript rules
- **TypeScript ESLint** - TypeScript-specific linting

---

## Project Highlights

### Strengths of This Implementation

1. ✅ **Extensible Architecture**: New data source types can be added with 2-3 line changes
2. ✅ **Comprehensive Testing**: High test coverage for critical business logic
3. ✅ **Type Safety**: Full TypeScript coverage with strict typing
4. ✅ **Performance**: Memoized selectors prevent unnecessary recalculations
5. ✅ **Clean Code**: Well-organized, readable, and maintainable codebase
6. ✅ **Modern React**: Hooks, functional components, and contemporary patterns
7. ✅ **Separation of Concerns**: Clear boundaries between UI, state, and business logic

### Design Principles Applied

- **DRY (Don't Repeat Yourself)**: Reusable utilities and components
- **SOLID**: Single responsibility, open/closed principle (extensibility)
- **Composition over Inheritance**: Component composition patterns
- **Unidirectional Data Flow**: Redux ensures predictable state management
