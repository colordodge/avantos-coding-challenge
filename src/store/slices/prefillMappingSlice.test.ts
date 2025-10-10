import { describe, it, expect } from 'vitest'
import prefillMappingReducer, {
  addPrefillMapping,
  removePrefillMapping,
  clearRecentlyAddedMapping,
  type PrefillMappingState,
  type PrefillMapping,
  type DataSource
} from './prefillMappingSlice'

// Mock data sources
const globalSource: DataSource = {
  type: 'global',
  id: 'global',
  name: 'Global',
  fieldKey: 'test_data'
}

const formFieldSource1: DataSource = {
  type: 'form_field',
  id: 'node1',
  name: 'Customer Form',
  fieldKey: 'email'
}

const formFieldSource2: DataSource = {
  type: 'form_field',
  id: 'node1',
  name: 'Customer Form',
  fieldKey: 'phone'
}

const formFieldSource3: DataSource = {
  type: 'form_field',
  id: 'node2',
  name: 'Address Form',
  fieldKey: 'street'
}

// Mock mappings
const mapping1: PrefillMapping = {
  source: globalSource,
  targetNodeId: 'node3',
  targetFieldKey: 'companyName'
}

const mapping2: PrefillMapping = {
  source: formFieldSource1,
  targetNodeId: 'node3',
  targetFieldKey: 'contactEmail'
}

const mapping3: PrefillMapping = {
  source: formFieldSource2,
  targetNodeId: 'node3',
  targetFieldKey: 'contactPhone'
}

const mapping4: PrefillMapping = {
  source: formFieldSource3,
  targetNodeId: 'node4',
  targetFieldKey: 'billingAddress'
}

describe('prefillMappingSlice', () => {
  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = prefillMappingReducer(undefined, { type: 'unknown' })
      
      expect(state).toEqual({
        prefillMappings: [],
        recentlyAddedMapping: null
      })
    })
  })

  describe('addPrefillMapping reducer', () => {
    it('should add mapping to empty array', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(previousState, addPrefillMapping(mapping1))
      
      expect(state.prefillMappings).toHaveLength(1)
      expect(state.prefillMappings[0]).toEqual(mapping1)
    })

    it('should add mapping to existing array', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(previousState, addPrefillMapping(mapping2))
      
      expect(state.prefillMappings).toHaveLength(2)
      expect(state.prefillMappings[0]).toEqual(mapping1)
      expect(state.prefillMappings[1]).toEqual(mapping2)
    })

    it('should set recentlyAddedMapping when adding', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(previousState, addPrefillMapping(mapping1))
      
      expect(state.recentlyAddedMapping).toEqual(mapping1)
    })

    it('should update recentlyAddedMapping when adding another mapping', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1],
        recentlyAddedMapping: mapping1
      }
      
      const state = prefillMappingReducer(previousState, addPrefillMapping(mapping2))
      
      expect(state.recentlyAddedMapping).toEqual(mapping2)
    })

    it('should allow adding multiple mappings', () => {
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      state = prefillMappingReducer(state, addPrefillMapping(mapping1))
      state = prefillMappingReducer(state, addPrefillMapping(mapping2))
      state = prefillMappingReducer(state, addPrefillMapping(mapping3))
      
      expect(state.prefillMappings).toHaveLength(3)
      expect(state.prefillMappings).toEqual([mapping1, mapping2, mapping3])
      expect(state.recentlyAddedMapping).toEqual(mapping3)
    })

    it('should allow duplicate mappings (same target)', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1],
        recentlyAddedMapping: null
      }
      
      // Add same mapping again
      const state = prefillMappingReducer(previousState, addPrefillMapping(mapping1))
      
      expect(state.prefillMappings).toHaveLength(2)
      expect(state.prefillMappings[0]).toEqual(mapping1)
      expect(state.prefillMappings[1]).toEqual(mapping1)
    })

    it('should preserve mapping structure', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(previousState, addPrefillMapping(mapping1))
      
      expect(state.prefillMappings[0]).toMatchObject({
        source: globalSource,
        targetNodeId: 'node3',
        targetFieldKey: 'companyName'
      })
    })
  })

  describe('removePrefillMapping reducer', () => {
    it('should remove mapping by targetNodeId and targetFieldKey', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, mapping2, mapping3],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'contactEmail'
        })
      )
      
      expect(state.prefillMappings).toHaveLength(2)
      expect(state.prefillMappings).toEqual([mapping1, mapping3])
      expect(state.prefillMappings).not.toContainEqual(mapping2)
    })

    it('should remove first matching mapping only when duplicates exist', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, mapping1, mapping2],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'companyName'
        })
      )
      
      // Should remove both duplicates since they match the filter criteria
      expect(state.prefillMappings).toHaveLength(1)
      expect(state.prefillMappings[0]).toEqual(mapping2)
    })

    it('should handle removing from single-item array', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1],
        recentlyAddedMapping: mapping1
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'companyName'
        })
      )
      
      expect(state.prefillMappings).toHaveLength(0)
      expect(state.prefillMappings).toEqual([])
    })

    it('should handle removing non-existent mapping', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, mapping2],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node999',
          targetFieldKey: 'nonExistent'
        })
      )
      
      // Should not change anything
      expect(state.prefillMappings).toHaveLength(2)
      expect(state.prefillMappings).toEqual([mapping1, mapping2])
    })

    it('should handle removing from empty array', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'companyName'
        })
      )
      
      expect(state.prefillMappings).toEqual([])
    })

    it('should match both targetNodeId and targetFieldKey (not just one)', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, mapping2, mapping3],
        recentlyAddedMapping: null
      }
      
      // Try to remove with matching nodeId but wrong fieldKey
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'wrongField'
        })
      )
      
      // Should not remove anything
      expect(state.prefillMappings).toHaveLength(3)
      expect(state.prefillMappings).toEqual([mapping1, mapping2, mapping3])
    })

    it('should not affect recentlyAddedMapping', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, mapping2],
        recentlyAddedMapping: mapping2
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'companyName'
        })
      )
      
      expect(state.recentlyAddedMapping).toEqual(mapping2)
    })

    it('should remove multiple mappings with same target', () => {
      const duplicateMapping: PrefillMapping = {
        ...mapping1,
        source: formFieldSource1 // Different source, same target
      }
      
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, duplicateMapping, mapping2],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(
        previousState,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'companyName'
        })
      )
      
      // Both mappings with same target should be removed
      expect(state.prefillMappings).toHaveLength(1)
      expect(state.prefillMappings[0]).toEqual(mapping2)
    })
  })

  describe('clearRecentlyAddedMapping reducer', () => {
    it('should clear recentlyAddedMapping when it exists', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1],
        recentlyAddedMapping: mapping1
      }
      
      const state = prefillMappingReducer(previousState, clearRecentlyAddedMapping())
      
      expect(state.recentlyAddedMapping).toBeNull()
    })

    it('should not affect prefillMappings', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1, mapping2, mapping3],
        recentlyAddedMapping: mapping3
      }
      
      const state = prefillMappingReducer(previousState, clearRecentlyAddedMapping())
      
      expect(state.prefillMappings).toHaveLength(3)
      expect(state.prefillMappings).toEqual([mapping1, mapping2, mapping3])
      expect(state.recentlyAddedMapping).toBeNull()
    })

    it('should work when recentlyAddedMapping is already null', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [mapping1],
        recentlyAddedMapping: null
      }
      
      const state = prefillMappingReducer(previousState, clearRecentlyAddedMapping())
      
      expect(state.recentlyAddedMapping).toBeNull()
    })

    it('should work with empty mappings array', () => {
      const previousState: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: mapping1
      }
      
      const state = prefillMappingReducer(previousState, clearRecentlyAddedMapping())
      
      expect(state.recentlyAddedMapping).toBeNull()
      expect(state.prefillMappings).toEqual([])
    })
  })

  describe('state transitions and workflows', () => {
    it('should handle complete add-clear workflow', () => {
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      // Add mapping
      state = prefillMappingReducer(state, addPrefillMapping(mapping1))
      expect(state.recentlyAddedMapping).toEqual(mapping1)
      
      // Clear recently added
      state = prefillMappingReducer(state, clearRecentlyAddedMapping())
      expect(state.recentlyAddedMapping).toBeNull()
      expect(state.prefillMappings).toHaveLength(1)
    })

    it('should handle add-remove workflow', () => {
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      // Add mapping
      state = prefillMappingReducer(state, addPrefillMapping(mapping1))
      expect(state.prefillMappings).toHaveLength(1)
      
      // Remove it
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: mapping1.targetNodeId,
          targetFieldKey: mapping1.targetFieldKey
        })
      )
      expect(state.prefillMappings).toHaveLength(0)
    })

    it('should handle multiple adds and selective removal', () => {
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      // Add multiple mappings
      state = prefillMappingReducer(state, addPrefillMapping(mapping1))
      state = prefillMappingReducer(state, addPrefillMapping(mapping2))
      state = prefillMappingReducer(state, addPrefillMapping(mapping3))
      state = prefillMappingReducer(state, addPrefillMapping(mapping4))
      expect(state.prefillMappings).toHaveLength(4)
      
      // Remove one
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: 'node3',
          targetFieldKey: 'contactEmail'
        })
      )
      expect(state.prefillMappings).toHaveLength(3)
      expect(state.prefillMappings).not.toContainEqual(mapping2)
    })

    it('should handle building up and tearing down mappings', () => {
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      // Build up
      state = prefillMappingReducer(state, addPrefillMapping(mapping1))
      state = prefillMappingReducer(state, addPrefillMapping(mapping2))
      state = prefillMappingReducer(state, addPrefillMapping(mapping3))
      expect(state.prefillMappings).toHaveLength(3)
      
      // Clear recently added indicator
      state = prefillMappingReducer(state, clearRecentlyAddedMapping())
      expect(state.recentlyAddedMapping).toBeNull()
      
      // Remove all one by one
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: mapping1.targetNodeId,
          targetFieldKey: mapping1.targetFieldKey
        })
      )
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: mapping2.targetNodeId,
          targetFieldKey: mapping2.targetFieldKey
        })
      )
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: mapping3.targetNodeId,
          targetFieldKey: mapping3.targetFieldKey
        })
      )
      
      expect(state.prefillMappings).toEqual([])
      expect(state.recentlyAddedMapping).toBeNull()
    })

    it('should maintain recentlyAddedMapping across removals of other mappings', () => {
      let state: PrefillMappingState = {
        prefillMappings: [mapping1, mapping2],
        recentlyAddedMapping: mapping2
      }
      
      // Remove mapping1
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: mapping1.targetNodeId,
          targetFieldKey: mapping1.targetFieldKey
        })
      )
      
      // recentlyAddedMapping should still be mapping2
      expect(state.recentlyAddedMapping).toEqual(mapping2)
      expect(state.prefillMappings).toHaveLength(1)
    })

    it('should handle real-world user scenario', () => {
      // User starts with empty state
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      // User adds mapping from global to node3.companyName
      state = prefillMappingReducer(state, addPrefillMapping(mapping1))
      expect(state.recentlyAddedMapping).toEqual(mapping1)
      
      // UI acknowledges the addition, clears indicator
      state = prefillMappingReducer(state, clearRecentlyAddedMapping())
      
      // User adds another mapping
      state = prefillMappingReducer(state, addPrefillMapping(mapping2))
      expect(state.recentlyAddedMapping).toEqual(mapping2)
      
      // User realizes they made a mistake, removes the second mapping
      state = prefillMappingReducer(
        state,
        removePrefillMapping({
          targetNodeId: mapping2.targetNodeId,
          targetFieldKey: mapping2.targetFieldKey
        })
      )
      
      // First mapping should still exist
      expect(state.prefillMappings).toHaveLength(1)
      expect(state.prefillMappings[0]).toEqual(mapping1)
      
      // recentlyAddedMapping is still mapping2 (not automatically cleared on remove)
      expect(state.recentlyAddedMapping).toEqual(mapping2)
    })
  })

  describe('edge cases', () => {
    it('should handle mappings with same source but different targets', () => {
      const mapping1SameSource: PrefillMapping = {
        source: globalSource,
        targetNodeId: 'node5',
        targetFieldKey: 'field1'
      }
      
      const mapping2SameSource: PrefillMapping = {
        source: globalSource,
        targetNodeId: 'node6',
        targetFieldKey: 'field2'
      }
      
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      state = prefillMappingReducer(state, addPrefillMapping(mapping1SameSource))
      state = prefillMappingReducer(state, addPrefillMapping(mapping2SameSource))
      
      expect(state.prefillMappings).toHaveLength(2)
      expect(state.prefillMappings[0].source).toBe(globalSource)
      expect(state.prefillMappings[1].source).toBe(globalSource)
    })

    it('should handle complex data source structures', () => {
      const complexSource: DataSource = {
        type: 'form_field',
        id: 'complex-node-123',
        name: 'Complex Form With Special Characters!@#',
        fieldKey: 'field.with.dots'
      }
      
      const complexMapping: PrefillMapping = {
        source: complexSource,
        targetNodeId: 'target-node-456',
        targetFieldKey: 'target.field.key'
      }
      
      let state: PrefillMappingState = {
        prefillMappings: [],
        recentlyAddedMapping: null
      }
      
      state = prefillMappingReducer(state, addPrefillMapping(complexMapping))
      
      expect(state.prefillMappings[0]).toEqual(complexMapping)
      expect(state.recentlyAddedMapping).toEqual(complexMapping)
    })
  })
})

