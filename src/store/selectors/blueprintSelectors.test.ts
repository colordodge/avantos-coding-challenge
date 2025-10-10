import { describe, it, expect } from 'vitest'
import { Position } from '@xyflow/react'
import {
  selectBlueprintNodes,
  selectBlueprintEdges,
  selectSelectedForm
} from './blueprintSelectors'
import type { BlueprintData, Node, Form } from '../types'
import type { RootState } from '../index'

// Helper function to create mock state
const createMockState = (
  blueprintData: BlueprintData | null = null,
  selectedNode: Node | null = null
): RootState => ({
  blueprint: {
    data: blueprintData,
    selectedNode,
    loading: false,
    error: null
  },
  prefillMapping: {
    prefillMappings: [],
    recentlyAddedMapping: null
  }
})

// Mock data
const mockForm: Form = {
  id: 'form1',
  name: 'Test Form',
  is_reusable: false,
  field_schema: {
    type: 'object',
    properties: {
      field1: { type: 'string' }
    },
    required: []
  },
  ui_schema: {
    type: 'VerticalLayout',
    elements: []
  },
  dynamic_field_config: {}
}

const mockNode1: Node = {
  id: 'node1',
  type: 'custom',
  position: { x: 100, y: 200 },
  data: {
    id: 'data1',
    component_key: 'key1',
    component_type: 'form',
    component_id: 'form1',
    name: 'First Node',
    prerequisites: [],
    permitted_roles: ['admin'],
    input_mapping: {},
    sla_duration: { number: 24, unit: 'hours' },
    approval_required: false,
    approval_roles: []
  }
}

const mockNode2: Node = {
  id: 'node2',
  type: 'custom',
  position: { x: 300, y: 200 },
  data: {
    id: 'data2',
    component_key: 'key2',
    component_type: 'form',
    component_id: 'form2',
    name: 'Second Node',
    prerequisites: [],
    permitted_roles: ['user'],
    input_mapping: {},
    sla_duration: { number: 48, unit: 'hours' },
    approval_required: true,
    approval_roles: ['manager']
  }
}

describe('blueprintSelectors', () => {
  describe('selectBlueprintNodes', () => {
    it('should return empty array when data is null', () => {
      const state = createMockState(null)
      const result = selectBlueprintNodes(state)
      
      expect(result).toEqual([])
    })

    it('should return empty array when nodes array is undefined', () => {
      const blueprintData = {
        nodes: undefined,
        edges: []
      } as any
      const state = createMockState(blueprintData)
      const result = selectBlueprintNodes(state)
      
      expect(result).toEqual([])
    })

    it('should transform nodes with correct structure', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintNodes(state)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'node1',
        type: 'custom',
        position: { x: 100, y: 200 },
        data: {
          id: 'node1',
          label: 'First Node',
          hasSourceConnection: false,
          hasTargetConnection: false
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      })
    })

    it('should detect source connections correctly', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2],
        edges: [
          { source: 'node1', target: 'node2' }
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintNodes(state)
      
      // node2 should have a source connection (something points to it)
      const node2Result = result.find(n => n.id === 'node2')
      expect(node2Result?.data.hasSourceConnection).toBe(true)
      expect(node2Result?.data.hasTargetConnection).toBe(false)
    })

    it('should detect target connections correctly', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2],
        edges: [
          { source: 'node1', target: 'node2' }
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintNodes(state)
      
      // node1 should have a target connection (it points to something)
      const node1Result = result.find(n => n.id === 'node1')
      expect(node1Result?.data.hasSourceConnection).toBe(false)
      expect(node1Result?.data.hasTargetConnection).toBe(true)
    })

    it('should handle nodes with both source and target connections', () => {
      const mockNode3: Node = {
        ...mockNode1,
        id: 'node3',
        data: { ...mockNode1.data, id: 'node3', name: 'Middle Node' }
      }
      
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode3, mockNode2],
        edges: [
          { source: 'node1', target: 'node3' },
          { source: 'node3', target: 'node2' }
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintNodes(state)
      
      // node3 is in the middle - has both connections
      const node3Result = result.find(n => n.id === 'node3')
      expect(node3Result?.data.hasSourceConnection).toBe(true)
      expect(node3Result?.data.hasTargetConnection).toBe(true)
    })

    it('should handle multiple edges to same node', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2],
        edges: [
          { source: 'node1', target: 'node2' },
          { source: 'node1', target: 'node2' } // duplicate edge
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintNodes(state)
      
      expect(result).toHaveLength(2)
      const node2Result = result.find(n => n.id === 'node2')
      expect(node2Result?.data.hasSourceConnection).toBe(true)
    })
  })

  describe('selectBlueprintEdges', () => {
    it('should return empty array when data is null', () => {
      const state = createMockState(null)
      const result = selectBlueprintEdges(state)
      
      expect(result).toEqual([])
    })

    it('should return empty array when edges array is undefined', () => {
      const blueprintData = {
        edges: undefined
      } as any
      const state = createMockState(blueprintData)
      const result = selectBlueprintEdges(state)
      
      expect(result).toEqual([])
    })

    it('should transform edges with correct ID format', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [],
        edges: [
          { source: 'node1', target: 'node2' },
          { source: 'node2', target: 'node3' }
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintEdges(state)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'node1-node2',
        source: 'node1',
        target: 'node2'
      })
      expect(result[1]).toEqual({
        id: 'node2-node3',
        source: 'node2',
        target: 'node3'
      })
    })

    it('should handle single edge', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [],
        edges: [
          { source: 'start', target: 'end' }
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintEdges(state)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('start-end')
    })

    it('should handle complex DAG edges', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [],
        edges: [
          { source: 'A', target: 'B' },
          { source: 'A', target: 'C' },
          { source: 'B', target: 'D' },
          { source: 'C', target: 'D' }
        ],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      const result = selectBlueprintEdges(state)
      
      expect(result).toHaveLength(4)
      expect(result.map(e => e.id)).toEqual(['A-B', 'A-C', 'B-D', 'C-D'])
    })
  })

  describe('selectSelectedForm', () => {
    it('should return undefined when data is null', () => {
      const state = createMockState(null, null)
      const result = selectSelectedForm(state)
      
      expect(result).toBeUndefined()
    })

    it('should return undefined when selectedNode is null', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [],
        edges: [],
        forms: [mockForm],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, null)
      const result = selectSelectedForm(state)
      
      expect(result).toBeUndefined()
    })

    it('should return the correct form when selectedNode matches', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectSelectedForm(state)
      
      expect(result).toEqual(mockForm)
      expect(result?.id).toBe('form1')
    })

    it('should return undefined when form is not found', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [], // No forms
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectSelectedForm(state)
      
      expect(result).toBeUndefined()
    })

    it('should return the correct form when multiple forms exist', () => {
      const mockForm2: Form = {
        ...mockForm,
        id: 'form2',
        name: 'Second Form'
      }
      
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2],
        edges: [],
        forms: [mockForm, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectSelectedForm(state)
      
      expect(result).toEqual(mockForm2)
      expect(result?.id).toBe('form2')
    })
  })

  describe('selector memoization', () => {
    it('should return same reference when state has not changed', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [{ source: 'node1', target: 'node2' }],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      
      const result1 = selectBlueprintNodes(state)
      const result2 = selectBlueprintNodes(state)
      
      // Should return exact same reference (memoized)
      expect(result1).toBe(result2)
    })

    it('should return new reference when state has changed', () => {
      const blueprintData1: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [],
        branches: [],
        triggers: []
      }
      
      const blueprintData2: BlueprintData = {
        ...blueprintData1,
        nodes: [mockNode1, mockNode2]
      }
      
      const state1 = createMockState(blueprintData1)
      const state2 = createMockState(blueprintData2)
      
      const result1 = selectBlueprintNodes(state1)
      const result2 = selectBlueprintNodes(state2)
      
      // Should return different references
      expect(result1).not.toBe(result2)
      expect(result1).toHaveLength(1)
      expect(result2).toHaveLength(2)
    })

    it('should memoize selectBlueprintEdges correctly', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [],
        edges: [{ source: 'node1', target: 'node2' }],
        forms: [],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData)
      
      const result1 = selectBlueprintEdges(state)
      const result2 = selectBlueprintEdges(state)
      
      expect(result1).toBe(result2)
    })

    it('should memoize selectSelectedForm correctly', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      
      const result1 = selectSelectedForm(state)
      const result2 = selectSelectedForm(state)
      
      expect(result1).toBe(result2)
    })
  })
})

