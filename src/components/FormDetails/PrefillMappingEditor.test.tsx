import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { PrefillMappingEditor } from './PrefillMappingEditor'
import blueprintReducer from '../../store/slices/blueprintSlice'
import prefillMappingReducer from '../../store/slices/prefillMappingSlice'
import type { Node, BlueprintData, Form } from '../../store/types'

// Mock MUI Tree View components
vi.mock('@mui/x-tree-view/SimpleTreeView', () => ({
  SimpleTreeView: ({ children, selectedItems, onSelectedItemsChange }: any) => (
    <div data-testid="tree-view">
      <div data-testid="selected-item">{selectedItems || 'none'}</div>
      <button
        data-testid="select-global-test_data"
        onClick={() => onSelectedItemsChange({}, 'global:test_data')}
      >
        Select Global.test_data
      </button>
      <button
        data-testid="select-node1-email"
        onClick={() => onSelectedItemsChange({}, 'node1:email')}
      >
        Select Node1.email
      </button>
      <button
        data-testid="select-parent-group"
        onClick={() => onSelectedItemsChange({}, 'global')}
      >
        Select Parent Group
      </button>
      {children}
    </div>
  ),
}))

vi.mock('@mui/x-tree-view/TreeItem', () => ({
  TreeItem: ({ itemId, label, children }: any) => (
    <div data-testid={`tree-item-${itemId}`}>
      {label}
      {children}
    </div>
  ),
}))

// Mock MUI components
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={props['data-testid'] || 'button'}>
      {children}
    </button>
  ),
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

describe('PrefillMappingEditor', () => {
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the header', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByText('Select a Prefill Mapping')).toBeInTheDocument()
    })

    it('should display the mapping preview with form name and field', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByText(/Payment Form\.email/)).toBeInTheDocument()
    })

    it('should render the tree view', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should render cancel and save buttons', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('tree selection', () => {
    it('should start with no selection when no existing mapping', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByTestId('selected-item')).toHaveTextContent('none')
    })

    it('should initialize with existing mapping selected', () => {
      const preloadedState = {
        blueprint: {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null,
        },
        prefillMapping: {
          prefillMappings: [
            {
              source: {
                type: 'global' as const,
                id: 'global',
                name: 'Global',
                fieldKey: 'test_data',
              },
              targetNodeId: 'node2',
              targetFieldKey: 'email',
            },
          ],
          recentlyAddedMapping: null,
        },
      }

      renderWithRedux(
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByTestId('selected-item')).toHaveTextContent('global:test_data')
    })

    it('should update selection when tree item is clicked', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      await user.click(screen.getByTestId('select-global-test_data'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-item')).toHaveTextContent('global:test_data')
      })
    })

    it('should clear selection when parent group is clicked', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      // First select a leaf
      await user.click(screen.getByTestId('select-global-test_data'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-item')).toHaveTextContent('global:test_data')
      })

      // Then click parent group (not a leaf)
      await user.click(screen.getByTestId('select-parent-group'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-item')).toHaveTextContent('none')
      })
    })
  })

  describe('save button', () => {
    it('should be disabled when no tree item is selected', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      const saveButton = screen.getByText('Save')
      expect(saveButton).toBeDisabled()
    })

    it('should be enabled when tree item is selected', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      await user.click(screen.getByTestId('select-global-test_data'))

      await waitFor(() => {
        const saveButton = screen.getByText('Save')
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should dispatch addPrefillMapping when save is clicked', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      await user.click(screen.getByTestId('select-global-test_data'))
      await user.click(screen.getByText('Save'))

      await waitFor(() => {
        const state = store.getState()
        expect(state.prefillMapping.prefillMappings).toHaveLength(1)
        expect(state.prefillMapping.prefillMappings[0]).toMatchObject({
          source: {
            type: 'global',
            id: 'global',
            name: 'Global',
            fieldKey: 'test_data',
          },
          targetNodeId: 'node2',
          targetFieldKey: 'email',
        })
      })
    })

    it('should call onCancel after saving', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      await user.click(screen.getByTestId('select-global-test_data'))
      await user.click(screen.getByText('Save'))

      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('cancel button', () => {
    it('should call onCancel when cancel is clicked', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      await user.click(screen.getByText('Cancel'))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not save mapping when cancel is clicked', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      // Select something but then cancel
      await user.click(screen.getByTestId('select-global-test_data'))
      await user.click(screen.getByText('Cancel'))

      const state = store.getState()
      expect(state.prefillMapping.prefillMappings).toHaveLength(0)
    })
  })

  describe('mapping preview', () => {
    it('should show source name when item is selected', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      // Initially shows ?
      expect(screen.getByText(/Payment Form\.email : \?/)).toBeInTheDocument()

      // After selection shows source name
      await user.click(screen.getByTestId('select-global-test_data'))

      await waitFor(() => {
        expect(screen.getByText(/Payment Form\.email : Global\.test_data/)).toBeInTheDocument()
      })
    })

    it('should update preview when different selections are made', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      // Select first item
      await user.click(screen.getByTestId('select-global-test_data'))
      await waitFor(() => {
        expect(screen.getByText('Payment Form.email : Global.test_data')).toBeInTheDocument()
      })

      // Select different item
      await user.click(screen.getByTestId('select-node1-email'))
      await waitFor(() => {
        expect(screen.getByText('Payment Form.email : Customer Form.email')).toBeInTheDocument()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle null selectedNode gracefully', () => {
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      expect(screen.getByText(/Form\.email/)).toBeInTheDocument()
    })

    it('should not save if selectedTreeItem is null', async () => {
      const user = userEvent.setup()
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
        <PrefillMappingEditor selectedFieldKey="email" onCancel={mockOnCancel} />,
        { preloadedState }
      )

      // Save button should be disabled
      const saveButton = screen.getByText('Save')
      expect(saveButton).toBeDisabled()

      // Even if we somehow click it, nothing should save
      const state = store.getState()
      expect(state.prefillMapping.prefillMappings).toHaveLength(0)
    })
  })
})

