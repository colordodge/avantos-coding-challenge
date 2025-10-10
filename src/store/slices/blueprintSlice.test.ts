import { describe, it, expect } from 'vitest'
import blueprintReducer, {
  clearError,
  clearData,
  setSelectedNode,
  type BlueprintState
} from './blueprintSlice'
import { fetchBlueprintData } from '../utils/fetchBlueprintData'
import type { BlueprintData, Node } from '../types'

// Mock data
const mockBlueprintData: BlueprintData = {
  $schema: 'test-schema',
  id: 'bp-123',
  tenant_id: 'tenant-456',
  name: 'Test Blueprint',
  description: 'A test blueprint',
  category: 'testing',
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
        name: 'Test Node',
        prerequisites: [],
        permitted_roles: ['admin'],
        input_mapping: {},
        sla_duration: { number: 24, unit: 'hours' },
        approval_required: false,
        approval_roles: []
      }
    }
  ],
  edges: [
    { source: 'node1', target: 'node2' }
  ],
  forms: [],
  branches: [],
  triggers: []
}

const mockNode: Node = {
  id: 'node1',
  type: 'custom',
  position: { x: 100, y: 200 },
  data: {
    id: 'data1',
    component_key: 'key1',
    component_type: 'form',
    component_id: 'form1',
    name: 'Test Node',
    prerequisites: [],
    permitted_roles: ['admin'],
    input_mapping: {},
    sla_duration: { number: 24, unit: 'hours' },
    approval_required: false,
    approval_roles: []
  }
}

describe('blueprintSlice', () => {
  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = blueprintReducer(undefined, { type: 'unknown' })
      
      expect(state).toEqual({
        data: null,
        selectedNode: null,
        loading: false,
        error: null
      })
    })
  })

  describe('clearError reducer', () => {
    it('should clear error when error exists', () => {
      const previousState: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: 'Some error message'
      }
      
      const state = blueprintReducer(previousState, clearError())
      
      expect(state.error).toBeNull()
    })

    it('should not affect other state properties', () => {
      const previousState: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: mockNode,
        loading: true,
        error: 'Some error'
      }
      
      const state = blueprintReducer(previousState, clearError())
      
      expect(state.data).toBe(mockBlueprintData)
      expect(state.selectedNode).toBe(mockNode)
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should work when error is already null', () => {
      const previousState: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      const state = blueprintReducer(previousState, clearError())
      
      expect(state.error).toBeNull()
    })
  })

  describe('clearData reducer', () => {
    it('should clear data when data exists', () => {
      const previousState: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      const state = blueprintReducer(previousState, clearData())
      
      expect(state.data).toBeNull()
    })

    it('should not affect other state properties', () => {
      const previousState: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: mockNode,
        loading: true,
        error: 'Some error'
      }
      
      const state = blueprintReducer(previousState, clearData())
      
      expect(state.data).toBeNull()
      expect(state.selectedNode).toBe(mockNode)
      expect(state.loading).toBe(true)
      expect(state.error).toBe('Some error')
    })

    it('should work when data is already null', () => {
      const previousState: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      const state = blueprintReducer(previousState, clearData())
      
      expect(state.data).toBeNull()
    })
  })

  describe('setSelectedNode reducer', () => {
    it('should set selected node when node is provided', () => {
      const previousState: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      const state = blueprintReducer(previousState, setSelectedNode(mockNode))
      
      expect(state.selectedNode).toEqual(mockNode)
    })

    it('should update selected node when a different node is provided', () => {
      const node2: Node = {
        ...mockNode,
        id: 'node2',
        data: { ...mockNode.data, id: 'data2', name: 'Another Node' }
      }
      
      const previousState: BlueprintState = {
        data: null,
        selectedNode: mockNode,
        loading: false,
        error: null
      }
      
      const state = blueprintReducer(previousState, setSelectedNode(node2))
      
      expect(state.selectedNode).toEqual(node2)
      expect(state.selectedNode?.id).toBe('node2')
    })

    it('should set selected node to null when null is provided', () => {
      const previousState: BlueprintState = {
        data: null,
        selectedNode: mockNode,
        loading: false,
        error: null
      }
      
      const state = blueprintReducer(previousState, setSelectedNode(null))
      
      expect(state.selectedNode).toBeNull()
    })

    it('should not affect other state properties', () => {
      const previousState: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: null,
        loading: true,
        error: 'Some error'
      }
      
      const state = blueprintReducer(previousState, setSelectedNode(mockNode))
      
      expect(state.selectedNode).toBe(mockNode)
      expect(state.data).toBe(mockBlueprintData)
      expect(state.loading).toBe(true)
      expect(state.error).toBe('Some error')
    })
  })

  describe('fetchBlueprintData async thunk', () => {
    describe('pending', () => {
      it('should set loading to true when fetch starts', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: false,
          error: null
        }
        
        const action = { type: fetchBlueprintData.pending.type }
        const state = blueprintReducer(previousState, action)
        
        expect(state.loading).toBe(true)
      })

      it('should clear error when fetch starts', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: false,
          error: 'Previous error'
        }
        
        const action = { type: fetchBlueprintData.pending.type }
        const state = blueprintReducer(previousState, action)
        
        expect(state.error).toBeNull()
      })

      it('should not affect data or selectedNode', () => {
        const previousState: BlueprintState = {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: false,
          error: null
        }
        
        const action = { type: fetchBlueprintData.pending.type }
        const state = blueprintReducer(previousState, action)
        
        expect(state.data).toBe(mockBlueprintData)
        expect(state.selectedNode).toBe(mockNode)
      })
    })

    describe('fulfilled', () => {
      it('should set loading to false when fetch succeeds', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.fulfilled.type,
          payload: mockBlueprintData
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.loading).toBe(false)
      })

      it('should set data when fetch succeeds', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.fulfilled.type,
          payload: mockBlueprintData
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.data).toEqual(mockBlueprintData)
      })

      it('should clear error when fetch succeeds', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: 'Previous error'
        }
        
        const action = {
          type: fetchBlueprintData.fulfilled.type,
          payload: mockBlueprintData
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.error).toBeNull()
      })

      it('should replace existing data with new data', () => {
        const oldData: BlueprintData = {
          ...mockBlueprintData,
          id: 'old-bp',
          name: 'Old Blueprint'
        }
        
        const previousState: BlueprintState = {
          data: oldData,
          selectedNode: null,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.fulfilled.type,
          payload: mockBlueprintData
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.data).toEqual(mockBlueprintData)
        expect(state.data?.id).toBe('bp-123')
        expect(state.data?.name).toBe('Test Blueprint')
      })

      it('should not affect selectedNode', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: mockNode,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.fulfilled.type,
          payload: mockBlueprintData
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.selectedNode).toBe(mockNode)
      })
    })

    describe('rejected', () => {
      it('should set loading to false when fetch fails', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.rejected.type,
          payload: 'Network error'
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.loading).toBe(false)
      })

      it('should set error when fetch fails', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.rejected.type,
          payload: 'Network error'
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.error).toBe('Network error')
      })

      it('should handle different error messages', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.rejected.type,
          payload: 'HTTP error! status: 404'
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.error).toBe('HTTP error! status: 404')
      })

      it('should not affect data or selectedNode', () => {
        const previousState: BlueprintState = {
          data: mockBlueprintData,
          selectedNode: mockNode,
          loading: true,
          error: null
        }
        
        const action = {
          type: fetchBlueprintData.rejected.type,
          payload: 'Network error'
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.data).toBe(mockBlueprintData)
        expect(state.selectedNode).toBe(mockNode)
      })

      it('should replace previous error with new error', () => {
        const previousState: BlueprintState = {
          data: null,
          selectedNode: null,
          loading: true,
          error: 'Old error'
        }
        
        const action = {
          type: fetchBlueprintData.rejected.type,
          payload: 'New error'
        }
        const state = blueprintReducer(previousState, action)
        
        expect(state.error).toBe('New error')
      })
    })
  })

  describe('state transitions', () => {
    it('should handle complete fetch success flow', () => {
      // Start with initial state
      let state: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      // Pending
      state = blueprintReducer(state, { type: fetchBlueprintData.pending.type })
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
      
      // Fulfilled
      state = blueprintReducer(state, {
        type: fetchBlueprintData.fulfilled.type,
        payload: mockBlueprintData
      })
      expect(state.loading).toBe(false)
      expect(state.data).toEqual(mockBlueprintData)
      expect(state.error).toBeNull()
    })

    it('should handle complete fetch failure flow', () => {
      // Start with initial state
      let state: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      // Pending
      state = blueprintReducer(state, { type: fetchBlueprintData.pending.type })
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
      
      // Rejected
      state = blueprintReducer(state, {
        type: fetchBlueprintData.rejected.type,
        payload: 'Network error'
      })
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
      expect(state.data).toBeNull()
    })

    it('should handle retry after failure', () => {
      // Start with error state
      let state: BlueprintState = {
        data: null,
        selectedNode: null,
        loading: false,
        error: 'Previous error'
      }
      
      // Retry - pending should clear error
      state = blueprintReducer(state, { type: fetchBlueprintData.pending.type })
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
      
      // Success
      state = blueprintReducer(state, {
        type: fetchBlueprintData.fulfilled.type,
        payload: mockBlueprintData
      })
      expect(state.loading).toBe(false)
      expect(state.data).toEqual(mockBlueprintData)
      expect(state.error).toBeNull()
    })

    it('should allow selecting node after data is loaded', () => {
      let state: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: null,
        loading: false,
        error: null
      }
      
      state = blueprintReducer(state, setSelectedNode(mockNode))
      expect(state.selectedNode).toEqual(mockNode)
      expect(state.data).toBe(mockBlueprintData)
    })

    it('should allow clearing selection', () => {
      let state: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: mockNode,
        loading: false,
        error: null
      }
      
      state = blueprintReducer(state, setSelectedNode(null))
      expect(state.selectedNode).toBeNull()
      expect(state.data).toBe(mockBlueprintData)
    })

    it('should allow clearing data and error independently', () => {
      let state: BlueprintState = {
        data: mockBlueprintData,
        selectedNode: mockNode,
        loading: false,
        error: 'Some error'
      }
      
      // Clear error first
      state = blueprintReducer(state, clearError())
      expect(state.error).toBeNull()
      expect(state.data).toBe(mockBlueprintData)
      
      // Clear data
      state = blueprintReducer(state, clearData())
      expect(state.data).toBeNull()
      expect(state.selectedNode).toBe(mockNode)
    })
  })
})

