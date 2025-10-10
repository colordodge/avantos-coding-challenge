import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { CustomNode } from './CustomNode'
import blueprintReducer from '../../store/slices/blueprintSlice'
import prefillMappingReducer from '../../store/slices/prefillMappingSlice'
import type { Node } from '../../store/types'

// Mock ReactFlow's Handle component since we're testing CustomNode in isolation
vi.mock('@xyflow/react', () => ({
  Handle: ({ type, position, style }: any) => (
    <div
      data-testid={`handle-${type}`}
      data-handlepos={position}
      data-handleid={`${type}-${position}`}
      style={style}
    />
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}))

// Mock Material-UI icons for simpler testing
vi.mock('@mui/icons-material/Article', () => ({
  default: () => <div data-testid="ArticleIcon">📄</div>,
}))

// Helper to render components with Redux store
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

// Mock node data for testing
const mockNodeData = {
  id: 'node1',
  label: 'Customer Form',
  hasSourceConnection: true,
  hasTargetConnection: true,
}

const mockNodeDataNoConnections = {
  id: 'node2',
  label: 'Start Node',
  hasSourceConnection: false,
  hasTargetConnection: false,
}

// Full node object used for Redux selection state
const mockSelectedNode: Node = {
  id: 'node1',
  type: 'custom',
  position: { x: 100, y: 200 },
  data: {
    id: 'data1',
    component_key: 'key1',
    component_type: 'form',
    component_id: 'form1',
    name: 'Customer Form',
    prerequisites: [],
    permitted_roles: ['admin'],
    input_mapping: {},
    sla_duration: { number: 24, unit: 'hours' },
    approval_required: false,
    approval_roles: [],
  },
}

describe('CustomNode', () => {
  describe('rendering', () => {
    it('should render the node label', () => {
      renderWithRedux(<CustomNode data={mockNodeData} />)
      expect(screen.getByText('Customer Form')).toBeInTheDocument()
    })

    it('should render the document icon', () => {
      renderWithRedux(<CustomNode data={mockNodeData} />)
      expect(screen.getByTestId('ArticleIcon')).toBeInTheDocument()
    })

    it('should render with different labels', () => {
      const customData = { ...mockNodeData, label: 'Payment Form' }
      renderWithRedux(<CustomNode data={customData} />)
      expect(screen.getByText('Payment Form')).toBeInTheDocument()
    })
  })

  describe('selection state from Redux', () => {
    it('should render correctly when node is selected in Redux', () => {
      const preloadedState = {
        blueprint: {
          data: null,
          selectedNode: mockSelectedNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<CustomNode data={mockNodeData} />, { preloadedState })
      expect(screen.getByText('Customer Form')).toBeInTheDocument()
    })

    it('should NOT apply selected class when node is not selected', () => {
      const differentNode: Node = {
        ...mockSelectedNode,
        id: 'different-node',
      }

      const preloadedState = {
        blueprint: {
          data: null,
          selectedNode: differentNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(<CustomNode data={mockNodeData} />, { preloadedState })
      
      const nodeElement = screen.getByText('Customer Form').parentElement
      expect(nodeElement).not.toHaveClass('selected')
    })

    it('should NOT apply selected class when no node is selected', () => {
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

      renderWithRedux(<CustomNode data={mockNodeData} />, { preloadedState })
      
      const nodeElement = screen.getByText('Customer Form').parentElement
      expect(nodeElement).not.toHaveClass('selected')
    })
  })

  describe('connection handles', () => {
    it('should show target handle when hasSourceConnection is true', () => {
      const { container } = renderWithRedux(<CustomNode data={mockNodeData} />)

      const targetHandle = container.querySelector('[data-handlepos="left"]')
      expect(targetHandle).toBeInTheDocument()
      expect(targetHandle).toHaveStyle({ opacity: 1 })
    })

    it('should hide target handle when hasSourceConnection is false', () => {
      const { container } = renderWithRedux(<CustomNode data={mockNodeDataNoConnections} />)

      const targetHandle = container.querySelector('[data-handlepos="left"]')
      expect(targetHandle).toHaveStyle({ opacity: 0 })
    })

    it('should show source handle when hasTargetConnection is true', () => {
      const { container } = renderWithRedux(<CustomNode data={mockNodeData} />)

      const sourceHandle = container.querySelector('[data-handlepos="right"]')
      expect(sourceHandle).toBeInTheDocument()
      expect(sourceHandle).toHaveStyle({ opacity: 1 })
    })

    it('should hide source handle when hasTargetConnection is false', () => {
      const { container } = renderWithRedux(<CustomNode data={mockNodeDataNoConnections} />)

      const sourceHandle = container.querySelector('[data-handlepos="right"]')
      expect(sourceHandle).toHaveStyle({ opacity: 0 })
    })

    it('should handle mixed connection states', () => {
      const mixedData = {
        ...mockNodeData,
        hasSourceConnection: true,
        hasTargetConnection: false,
      }

      const { container } = renderWithRedux(<CustomNode data={mixedData} />)

      const targetHandle = container.querySelector('[data-handlepos="left"]')
      const sourceHandle = container.querySelector('[data-handlepos="right"]')

      expect(targetHandle).toHaveStyle({ opacity: 1 })
      expect(sourceHandle).toHaveStyle({ opacity: 0 })
    })
  })

  describe('props handling', () => {
    it('should handle all connection types correctly', () => {
      const allCombinations = [
        { hasSourceConnection: true, hasTargetConnection: true },
        { hasSourceConnection: true, hasTargetConnection: false },
        { hasSourceConnection: false, hasTargetConnection: true },
        { hasSourceConnection: false, hasTargetConnection: false },
      ]

      allCombinations.forEach((connections) => {
        const data = { ...mockNodeData, ...connections }
        const { container, unmount } = renderWithRedux(<CustomNode data={data} />)

        const targetHandle = container.querySelector('[data-handlepos="left"]')
        const sourceHandle = container.querySelector('[data-handlepos="right"]')

        expect(targetHandle).toHaveStyle({
          opacity: connections.hasSourceConnection ? 1 : 0,
        })
        expect(sourceHandle).toHaveStyle({
          opacity: connections.hasTargetConnection ? 1 : 0,
        })

        unmount()
      })
    })

    it('should render correctly with minimal data', () => {
      const minimalData = {
        id: 'minimal',
        label: 'Test',
        hasSourceConnection: false,
        hasTargetConnection: false,
      }

      renderWithRedux(<CustomNode data={minimalData} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should render both handles regardless of visibility', () => {
      const { container } = renderWithRedux(<CustomNode data={mockNodeDataNoConnections} />)

      const handles = container.querySelectorAll('[data-handleid]')
      expect(handles).toHaveLength(2)
    })

    it('should render with proper structure', () => {
      const { container } = renderWithRedux(<CustomNode data={mockNodeData} />)

      expect(screen.getByText('Customer Form')).toBeInTheDocument()
      expect(screen.getByTestId('ArticleIcon')).toBeInTheDocument()
      
      const handles = container.querySelectorAll('[data-handleid]')
      expect(handles).toHaveLength(2)
    })
  })
})

