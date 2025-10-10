import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BlueprintGraph } from './BlueprintGraph'
import blueprintReducer from '../../store/slices/blueprintSlice'
import prefillMappingReducer from '../../store/slices/prefillMappingSlice'
import type { BlueprintData } from '../../store/types'

// Mock ReactFlow
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, edges, onNodeClick, onPaneClick }: any) => (
    <div data-testid="react-flow">
      <div data-testid="nodes-count">{nodes.length}</div>
      <div data-testid="edges-count">{edges.length}</div>
      {nodes.map((node: any) => (
        <button
          key={node.id}
          data-testid={`node-${node.id}`}
          onClick={(e) => onNodeClick?.(e, node)}
        >
          {node.data.label}
        </button>
      ))}
      <button data-testid="pane" onClick={onPaneClick}>
        Pane
      </button>
    </div>
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}))

// Mock Material-UI Modal
vi.mock('@mui/material', () => ({
  Modal: ({ open, onClose, children }: any) =>
    open ? (
      <div data-testid="modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}))

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock FormDetails component
vi.mock('../FormDetails/FormDetails', () => ({
  FormDetails: ({ onClose }: any) => (
    <div data-testid="form-details">
      <button data-testid="form-details-close" onClick={onClose}>
        Close Form
      </button>
    </div>
  ),
}))

const mockBlueprintData: BlueprintData = {
  $schema: 'test',
  id: 'bp1',
  tenant_id: 't1',
  name: 'Test Blueprint',
  description: 'Test',
  category: 'test',
  nodes: [
    {
      id: 'node1',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        id: 'data1',
        component_key: 'key1',
        component_type: 'form',
        component_id: 'form1',
        name: 'Customer Form',
        prerequisites: [],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: { number: 24, unit: 'hours' },
        approval_required: false,
        approval_roles: [],
      },
    },
    {
      id: 'node2',
      type: 'custom',
      position: { x: 200, y: 0 },
      data: {
        id: 'data2',
        component_key: 'key2',
        component_type: 'form',
        component_id: 'form2',
        name: 'Payment Form',
        prerequisites: [],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: { number: 24, unit: 'hours' },
        approval_required: false,
        approval_roles: [],
      },
    },
  ],
  edges: [{ source: 'node1', target: 'node2' }],
  forms: [],
  branches: [],
  triggers: [],
}

function renderWithRedux(
  ui: React.ReactElement,
  {
    preloadedState,
    store,
  }: {
    preloadedState?: any
    store?: any
  } = {}
) {
  const defaultStore = configureStore({
    reducer: {
      blueprint: blueprintReducer,
      prefillMapping: prefillMappingReducer,
    },
    preloadedState,
  } as any)

  return {
    ...render(<Provider store={store || defaultStore}>{ui}</Provider>),
    store: store || defaultStore,
  }
}

describe('BlueprintGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global fetch to prevent actual API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBlueprintData,
    })
  })

  describe('initial render and data fetching', () => {
    it('should render ReactFlow component', () => {
      renderWithRedux(<BlueprintGraph />)

      expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    })

    it('should render with empty nodes and edges initially', () => {
      renderWithRedux(<BlueprintGraph />)

      expect(screen.getByTestId('nodes-count')).toHaveTextContent('0')
      expect(screen.getByTestId('edges-count')).toHaveTextContent('0')
    })
  })

  describe('rendering with data', () => {
    it('should render nodes from Redux state', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.getByTestId('nodes-count')).toHaveTextContent('2')
      expect(screen.getByTestId('node-node1')).toBeInTheDocument()
      expect(screen.getByTestId('node-node2')).toBeInTheDocument()
    })

    it('should render edges from Redux state', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.getByTestId('edges-count')).toHaveTextContent('1')
    })

    it('should display node labels', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.getByText('Customer Form')).toBeInTheDocument()
      expect(screen.getByText('Payment Form')).toBeInTheDocument()
    })
  })

  describe('node selection', () => {
    it('should not show modal when no node is selected', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should show modal when a node is selected', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockBlueprintData.nodes[0],
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('form-details')).toBeInTheDocument()
    })
  })

  describe('event handlers', () => {
    it('should select node when node is clicked', async () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      const { store } = renderWithRedux(<BlueprintGraph />, { preloadedState })

      const nodeButton = screen.getByTestId('node-node1')
      nodeButton.click()

      await waitFor(() => {
        const state = store.getState()
        expect(state.blueprint.selectedNode?.id).toBe('node1')
      })
    })

    it('should clear selection when pane is clicked', async () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockBlueprintData.nodes[0],
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      const { store } = renderWithRedux(<BlueprintGraph />, { preloadedState })

      const paneButton = screen.getByTestId('pane')
      paneButton.click()

      await waitFor(() => {
        const state = store.getState()
        expect(state.blueprint.selectedNode).toBeNull()
      })
    })

    it('should close modal when modal close button is clicked', async () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockBlueprintData.nodes[0],
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      const { store } = renderWithRedux(<BlueprintGraph />, { preloadedState })

      const modalCloseButton = screen.getByTestId('modal-close')
      modalCloseButton.click()

      await waitFor(() => {
        const state = store.getState()
        expect(state.blueprint.selectedNode).toBeNull()
      })
    })

    it('should close modal when FormDetails close button is clicked', async () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockBlueprintData.nodes[0],
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      const { store } = renderWithRedux(<BlueprintGraph />, { preloadedState })

      const formDetailsCloseButton = screen.getByTestId('form-details-close')
      formDetailsCloseButton.click()

      await waitFor(() => {
        const state = store.getState()
        expect(state.blueprint.selectedNode).toBeNull()
      })
    })

    it('should render without errors when blueprint data exists', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })
      
      expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle null blueprint data', () => {
      const preloadedState = {
        blueprint: {
          data: null,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.getByTestId('react-flow')).toBeInTheDocument()
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('0')
    })

    it('should handle empty nodes array', () => {
      const emptyData: BlueprintData = {
        ...mockBlueprintData,
        nodes: [],
        edges: [],
      }

      const preloadedState = {
        blueprint: {
          data: emptyData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      expect(screen.getByTestId('nodes-count')).toHaveTextContent('0')
      expect(screen.getByTestId('edges-count')).toHaveTextContent('0')
    })

    it('should render without crashing when switching between states', async () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: null,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<BlueprintGraph />, { preloadedState })

      // Select a node
      const nodeButton = screen.getByTestId('node-node1')
      nodeButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Deselect
      const paneButton = screen.getByTestId('pane')
      paneButton.click()

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
      })
    })
  })
})

