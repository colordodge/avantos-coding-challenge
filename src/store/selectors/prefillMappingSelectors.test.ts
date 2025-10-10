import { describe, it, expect } from 'vitest'
import {
  selectAvailableDataSourceMappings,
  selectGroupedAvailableDataSources
} from './prefillMappingSelectors'
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

// Mock forms
const mockForm1: Form = {
  id: 'form1',
  name: 'Customer Info',
  is_reusable: false,
  field_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' }
    },
    required: []
  },
  ui_schema: {
    type: 'VerticalLayout',
    elements: []
  },
  dynamic_field_config: {}
}

const mockForm2: Form = {
  id: 'form2',
  name: 'Address Info',
  is_reusable: false,
  field_schema: {
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' },
      zip: { type: 'string' }
    },
    required: []
  },
  ui_schema: {
    type: 'VerticalLayout',
    elements: []
  },
  dynamic_field_config: {}
}

// Mock nodes
const mockNode1: Node = {
  id: 'node1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    id: 'data1',
    component_key: 'key1',
    component_type: 'form',
    component_id: 'form1',
    name: 'Customer Info Form',
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
  position: { x: 300, y: 100 },
  data: {
    id: 'data2',
    component_key: 'key2',
    component_type: 'form',
    component_id: 'form2',
    name: 'Address Info Form',
    prerequisites: [],
    permitted_roles: ['admin'],
    input_mapping: {},
    sla_duration: { number: 24, unit: 'hours' },
    approval_required: false,
    approval_roles: []
  }
}

const mockNode3: Node = {
  id: 'node3',
  type: 'custom',
  position: { x: 500, y: 100 },
  data: {
    id: 'data3',
    component_key: 'key3',
    component_type: 'form',
    component_id: 'form3',
    name: 'Final Form',
    prerequisites: [],
    permitted_roles: ['admin'],
    input_mapping: {},
    sla_duration: { number: 24, unit: 'hours' },
    approval_required: false,
    approval_roles: []
  }
}

describe('prefillMappingSelectors', () => {
  describe('selectAvailableDataSourceMappings', () => {
    it('should return empty array when data is null', () => {
      const state = createMockState(null, null)
      const result = selectAvailableDataSourceMappings(state)
      
      expect(result).toEqual([])
    })

    it('should return empty array when selectedNode is null', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, null)
      const result = selectAvailableDataSourceMappings(state)
      
      expect(result).toEqual([])
    })

    it('should return only global fields when node has no ancestors', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectAvailableDataSourceMappings(state)
      
      // Should only have 3 global fields
      expect(result).toHaveLength(3)
      expect(result.every(source => source.type === 'global')).toBe(true)
      expect(result.map(s => s.fieldKey)).toEqual(['test_data', 'test_data2', 'test_data3'])
    })

    it('should include global fields in all results', () => {
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
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectAvailableDataSourceMappings(state)
      
      // Should have global fields
      const globalSources = result.filter(s => s.type === 'global')
      expect(globalSources).toHaveLength(3)
      expect(globalSources[0]).toEqual({
        type: 'global',
        id: 'global',
        name: 'Global',
        fieldKey: 'test_data'
      })
    })

    it('should include form fields from direct ancestor', () => {
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
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectAvailableDataSourceMappings(state)
      
      // Should have global fields (3) + node1 form fields (3)
      expect(result).toHaveLength(6)
      
      const formFieldSources = result.filter(s => s.type === 'form_field')
      expect(formFieldSources).toHaveLength(3)
      expect(formFieldSources.map(s => s.fieldKey)).toEqual(['name', 'email', 'phone'])
      expect(formFieldSources[0]).toMatchObject({
        type: 'form_field',
        id: 'node1',
        name: 'Customer Info Form'
      })
    })

    it('should include form fields from multiple ancestors', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2, mockNode3],
        edges: [
          { source: 'node1', target: 'node2' },
          { source: 'node2', target: 'node3' }
        ],
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode3)
      const result = selectAvailableDataSourceMappings(state)
      
      // Should have global fields (3) + node1 fields (3) + node2 fields (3) = 9
      expect(result).toHaveLength(9)
      
      const formFieldSources = result.filter(s => s.type === 'form_field')
      expect(formFieldSources).toHaveLength(6)
      
      // Check node1 fields
      const node1Fields = formFieldSources.filter(s => s.id === 'node1')
      expect(node1Fields).toHaveLength(3)
      expect(node1Fields.map(s => s.fieldKey)).toEqual(['name', 'email', 'phone'])
      
      // Check node2 fields
      const node2Fields = formFieldSources.filter(s => s.id === 'node2')
      expect(node2Fields).toHaveLength(3)
      expect(node2Fields.map(s => s.fieldKey)).toEqual(['street', 'city', 'zip'])
    })

    it('should deduplicate ancestor IDs', () => {
      // Diamond pattern: node1 -> node2 -> node4
      //                  node1 -> node3 -> node4
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2, mockNode3],
        edges: [
          { source: 'node1', target: 'node2' },
          { source: 'node1', target: 'node3' },
          { source: 'node2', target: 'node4' },
          { source: 'node3', target: 'node4' }
        ],
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      
      const mockNode4: Node = {
        ...mockNode3,
        id: 'node4',
        data: { ...mockNode3.data, id: 'node4', name: 'Final Node' }
      }
      
      blueprintData.nodes.push(mockNode4)
      
      const state = createMockState(blueprintData, mockNode4)
      const result = selectAvailableDataSourceMappings(state)
      
      // node1 appears twice in ancestors but should only be included once
      const node1Sources = result.filter(s => s.id === 'node1')
      expect(node1Sources).toHaveLength(3) // 3 fields from form1
    })

    it('should skip ancestors without matching forms', () => {
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
        forms: [mockForm2], // Only form2, not form1
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectAvailableDataSourceMappings(state)
      
      // Should only have global fields (node1's form is missing)
      expect(result).toHaveLength(3)
      expect(result.every(s => s.type === 'global')).toBe(true)
    })

    it('should handle empty form field schemas', () => {
      const emptyForm: Form = {
        ...mockForm1,
        id: 'empty-form',
        field_schema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
      
      const nodeWithEmptyForm: Node = {
        ...mockNode1,
        data: { ...mockNode1.data, component_id: 'empty-form' }
      }
      
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [nodeWithEmptyForm, mockNode2],
        edges: [
          { source: 'node1', target: 'node2' }
        ],
        forms: [emptyForm],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectAvailableDataSourceMappings(state)
      
      // Should only have global fields (empty form has no fields)
      expect(result).toHaveLength(3)
      expect(result.every(s => s.type === 'global')).toBe(true)
    })
  })

  describe('selectGroupedAvailableDataSources', () => {
    it('should return empty groups when no sources available', () => {
      const state = createMockState(null, null)
      const result = selectGroupedAvailableDataSources(state)
      
      expect(result.groups).toEqual([])
      expect(result.leafIdToSource).toEqual({})
    })

    it('should group global fields correctly', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectGroupedAvailableDataSources(state)
      
      expect(result.groups).toHaveLength(1)
      expect(result.groups[0]).toMatchObject({
        parentId: 'global',
        parentName: 'Global'
      })
      expect(result.groups[0].children).toHaveLength(3)
    })

    it('should create correct leaf IDs', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectGroupedAvailableDataSources(state)
      
      const globalGroup = result.groups[0]
      expect(globalGroup.children[0].leafId).toBe('global:test_data')
      expect(globalGroup.children[1].leafId).toBe('global:test_data2')
      expect(globalGroup.children[2].leafId).toBe('global:test_data3')
    })

    it('should create leafIdToSource lookup map correctly', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectGroupedAvailableDataSources(state)
      
      expect(result.leafIdToSource['global:test_data']).toEqual({
        type: 'global',
        id: 'global',
        name: 'Global',
        fieldKey: 'test_data'
      })
      expect(result.leafIdToSource['global:test_data2']).toBeDefined()
      expect(result.leafIdToSource['global:test_data3']).toBeDefined()
    })

    it('should sort children alphabetically by label', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1],
        edges: [],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode1)
      const result = selectGroupedAvailableDataSources(state)
      
      const globalChildren = result.groups[0].children
      expect(globalChildren[0].label).toBe('test_data')
      expect(globalChildren[1].label).toBe('test_data2')
      expect(globalChildren[2].label).toBe('test_data3')
    })

    it('should place Global group first', () => {
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
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectGroupedAvailableDataSources(state)
      
      // Global should always be first
      expect(result.groups[0].parentId).toBe('global')
      expect(result.groups[0].parentName).toBe('Global')
    })

    it('should sort non-global groups alphabetically by name', () => {
      // Create a third form that should sort between the two
      const mockFormB: Form = {
        ...mockForm1,
        id: 'formB',
        name: 'B Form' // Should sort before "Customer Info Form"
      }
      
      const nodeB: Node = {
        ...mockNode1,
        id: 'nodeB',
        data: { ...mockNode1.data, id: 'nodeB', component_id: 'formB', name: 'B Form Node' }
      }
      
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, nodeB, mockNode2, mockNode3],
        edges: [
          { source: 'node1', target: 'node3' },
          { source: 'nodeB', target: 'node3' },
          { source: 'node2', target: 'node3' }
        ],
        forms: [mockForm1, mockFormB, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode3)
      const result = selectGroupedAvailableDataSources(state)
      
      // Should be: Global, Address Info Form, B Form Node, Customer Info Form
      expect(result.groups).toHaveLength(4)
      expect(result.groups[0].parentName).toBe('Global')
      expect(result.groups[1].parentName).toBe('Address Info Form')
      expect(result.groups[2].parentName).toBe('B Form Node')
      expect(result.groups[3].parentName).toBe('Customer Info Form')
    })

    it('should group multiple fields from same node', () => {
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
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      const result = selectGroupedAvailableDataSources(state)
      
      // Should have 2 groups: Global and Customer Info Form
      expect(result.groups).toHaveLength(2)
      
      const customerGroup = result.groups.find(g => g.parentId === 'node1')
      expect(customerGroup).toBeDefined()
      expect(customerGroup?.children).toHaveLength(3)
      expect(customerGroup?.children.map(c => c.label)).toEqual(['email', 'name', 'phone']) // alphabetically sorted
    })

    it('should handle complex multi-ancestor scenario', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2, mockNode3],
        edges: [
          { source: 'node1', target: 'node2' },
          { source: 'node2', target: 'node3' }
        ],
        forms: [mockForm1, mockForm2],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode3)
      const result = selectGroupedAvailableDataSources(state)
      
      // Should have 3 groups: Global, Address Info Form, Customer Info Form
      expect(result.groups).toHaveLength(3)
      expect(result.groups[0].parentName).toBe('Global')
      expect(result.groups[1].parentName).toBe('Address Info Form')
      expect(result.groups[2].parentName).toBe('Customer Info Form')
      
      // Check all leafIds are in the lookup
      result.groups.forEach(group => {
        group.children.forEach(child => {
          expect(result.leafIdToSource[child.leafId]).toBeDefined()
          expect(result.leafIdToSource[child.leafId]).toEqual(child.source)
        })
      })
    })
  })

  describe('selector memoization', () => {
    it('should memoize selectAvailableDataSourceMappings', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2],
        edges: [{ source: 'node1', target: 'node2' }],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      
      const result1 = selectAvailableDataSourceMappings(state)
      const result2 = selectAvailableDataSourceMappings(state)
      
      expect(result1).toBe(result2)
    })

    it('should memoize selectGroupedAvailableDataSources', () => {
      const blueprintData: BlueprintData = {
        $schema: 'test',
        id: 'bp1',
        tenant_id: 't1',
        name: 'Test',
        description: 'Test',
        category: 'test',
        nodes: [mockNode1, mockNode2],
        edges: [{ source: 'node1', target: 'node2' }],
        forms: [mockForm1],
        branches: [],
        triggers: []
      }
      const state = createMockState(blueprintData, mockNode2)
      
      const result1 = selectGroupedAvailableDataSources(state)
      const result2 = selectGroupedAvailableDataSources(state)
      
      expect(result1).toBe(result2)
    })
  })
})

