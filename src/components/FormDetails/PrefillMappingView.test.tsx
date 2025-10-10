import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { PrefillMappingView } from './PrefillMappingView'
import blueprintReducer from '../../store/slices/blueprintSlice'
import prefillMappingReducer from '../../store/slices/prefillMappingSlice'
import type { Node, BlueprintData, Form } from '../../store/types'
import type { PrefillMapping } from '../../store/slices/prefillMappingSlice'

// Mock Material-UI icons
vi.mock('@mui/icons-material/Clear', () => ({
  default: (props: any) => <div data-testid="clear-icon" {...props}>X</div>,
}))

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

const mockForm: Form = {
  id: 'form1',
  name: 'Customer Form',
  is_reusable: false,
  field_schema: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      phone: { type: 'string' },
      name: { type: 'string' },
    },
    required: [],
  },
  ui_schema: {
    type: 'VerticalLayout',
    elements: [],
  },
  dynamic_field_config: {},
}

const mockNode: Node = {
  id: 'node2',
  type: 'custom',
  position: { x: 200, y: 0 },
  data: {
    id: 'data2',
    component_key: 'key2',
    component_type: 'form',
    component_id: 'form1',
    name: 'Payment Form',
    prerequisites: [],
    permitted_roles: [],
    input_mapping: {},
    sla_duration: { number: 24, unit: 'hours' },
    approval_required: false,
    approval_roles: [],
  },
}

const mockAncestorNode: Node = {
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
}

const mockBlueprintData: BlueprintData = {
  $schema: 'test',
  id: 'bp1',
  tenant_id: 't1',
  name: 'Test',
  description: 'Test',
  category: 'test',
  nodes: [mockAncestorNode, mockNode],
  edges: [{ source: 'node1', target: 'node2' }],
  forms: [mockForm],
  branches: [],
  triggers: [],
}

const mockMapping: PrefillMapping = {
  source: {
    type: 'global',
    id: 'global',
    name: 'Global',
    fieldKey: 'test_data',
  },
  targetNodeId: 'node2',
  targetFieldKey: 'email',
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

describe('PrefillMappingView', () => {
  const mockHandleFieldClick = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render the form name', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('Payment Form')).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('email')).toBeInTheDocument()
      expect(screen.getByText('phone')).toBeInTheDocument()
      expect(screen.getByText('name')).toBeInTheDocument()
    })

    it('should render Done button', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('should render field with mapping information', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('email : Global.test_data')).toBeInTheDocument()
    })

    it('should render clear icon for fields with mappings', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping],
          recentlyAddedMapping: null,
        },
      }

      const { container } = renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      const clearIcons = container.querySelectorAll('[data-testid="clear-icon"]')
      expect(clearIcons.length).toBeGreaterThan(0)
    })
  })

  describe('field interactions', () => {
    it('should call handleFieldClick when field is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      const emailField = screen.getByText('email')
      await user.click(emailField)

      expect(mockHandleFieldClick).toHaveBeenCalledWith('email')
    })

    it('should call handleFieldClick with correct field key', async () => {
      const user = userEvent.setup({ delay: null })
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      await user.click(screen.getByText('phone'))
      expect(mockHandleFieldClick).toHaveBeenCalledWith('phone')

      await user.click(screen.getByText('name'))
      expect(mockHandleFieldClick).toHaveBeenCalledWith('name')
    })
  })

  describe('removing mappings', () => {
    it('should dispatch removePrefillMapping when clear icon is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping],
          recentlyAddedMapping: null,
        },
      }

      const { store } = renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      const clearIcon = screen.getAllByTestId('clear-icon')[0]
      await user.click(clearIcon)

      await waitFor(() => {
        const state = store.getState()
        expect(state.prefillMapping.prefillMappings).toHaveLength(0)
      })
    })

    it('should not call handleFieldClick when clear icon is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      const clearIcon = screen.getAllByTestId('clear-icon')[0]
      await user.click(clearIcon)

      expect(mockHandleFieldClick).not.toHaveBeenCalled()
    })
  })

  describe('done button', () => {
    it('should call onClose when Done is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      await user.click(screen.getByText('Done'))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('recently added mapping animation', () => {
    it('should clear recentlyAddedMapping after timeout', async () => {
      vi.useFakeTimers()
      
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping],
          recentlyAddedMapping: mockMapping,
        },
      }

      const { store } = renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      // Initially, recentlyAddedMapping should exist
      expect(store.getState().prefillMapping.recentlyAddedMapping).toEqual(mockMapping)

      // Fast-forward time and run all timers
      await vi.runAllTimersAsync()

      const state = store.getState()
      expect(state.prefillMapping.recentlyAddedMapping).toBeNull()
      
      vi.useRealTimers()
    })

    it('should not clear if no recentlyAddedMapping', () => {
      vi.useFakeTimers()
      
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      const { store } = renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      vi.advanceTimersByTime(1500)

      const state = store.getState()
      expect(state.prefillMapping.recentlyAddedMapping).toBeNull()
      
      vi.useRealTimers()
    })

    it('should cleanup timer on unmount', () => {
      vi.useFakeTimers()
      
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping],
          recentlyAddedMapping: mockMapping,
        },
      }

      const { unmount } = renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      unmount()
      vi.advanceTimersByTime(1500)

      // Should not throw error - timer was cleaned up
      vi.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('should handle null selectedForm', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      // Remove form to make selectedForm null
      const stateWithoutForm = {
        ...preloadedState,
        blueprint: {
          ...preloadedState.blueprint,
          data: {
            ...mockBlueprintData,
            forms: [],
          },
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState: stateWithoutForm }
      )

      // Should render without crashing
      expect(screen.getByText('Payment Form')).toBeInTheDocument()
    })

    it('should handle null selectedNode', () => {
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

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('Form')).toBeInTheDocument()
    })

    it('should handle empty field schema', () => {
      const emptyForm: Form = {
        ...mockForm,
        field_schema: {
          type: 'object',
          properties: {},
          required: [],
        },
      }

      const dataWithEmptyForm: BlueprintData = {
        ...mockBlueprintData,
        forms: [emptyForm],
      }

      const preloadedState = {
        blueprint: {
          data: dataWithEmptyForm,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('Payment Form')).toBeInTheDocument()
    })

    it('should handle multiple mappings', () => {
      const mapping2: PrefillMapping = {
        source: {
          type: 'form_field',
          id: 'node1',
          name: 'Customer Form',
          fieldKey: 'email',
        },
        targetNodeId: 'node2',
        targetFieldKey: 'phone',
      }

      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [mockMapping, mapping2],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      expect(screen.getByText('email : Global.test_data')).toBeInTheDocument()
      expect(screen.getByText('phone : Customer Form.email')).toBeInTheDocument()
    })
  })

  describe('getPropertyKeys utility', () => {
    it('should return empty array for null form', () => {
      const preloadedState = {
        blueprint: {
          data: {
            ...mockBlueprintData,
            forms: [],
          },
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [],
          recentlyAddedMapping: null,
        },
      }

      const { container } = renderWithRedux(
        <PrefillMappingView handleFieldClick={mockHandleFieldClick} onClose={mockOnClose} />,
        { preloadedState }
      )

      // No fields should be rendered
      expect(screen.queryByText('email')).not.toBeInTheDocument()
      expect(screen.queryByText('phone')).not.toBeInTheDocument()
    })
  })
})

