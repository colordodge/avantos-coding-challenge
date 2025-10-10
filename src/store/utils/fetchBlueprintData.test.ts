import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { fetchBlueprintData } from './fetchBlueprintData'
import blueprintReducer from '../slices/blueprintSlice'
import type { BlueprintData } from '../types'

// Mock data for successful responses
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

describe('fetchBlueprintData', () => {
  let store: ReturnType<typeof configureStore<{ blueprint: ReturnType<typeof blueprintReducer> }>>
  
  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        blueprint: blueprintReducer
      }
    })
    
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks()
  })

  describe('successful API responses', () => {
    it('should fetch and return blueprint data successfully', async () => {
      // ARRANGE: Mock successful fetch response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBlueprintData
      })
      global.fetch = mockFetch

      // ACT: Dispatch the thunk
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT: Verify the results
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/myapp/actions/blueprints/mybp/graph/'
      )
      expect(result.type).toBe('blueprint/fetchBlueprintData/fulfilled')
      expect(result.payload).toEqual(mockBlueprintData)
    })

    it('should update store state correctly on success', async () => {
      // ARRANGE
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBlueprintData
      })
      global.fetch = mockFetch

      // ACT
      await store.dispatch(fetchBlueprintData())

      // ASSERT: Check store state was updated
      const state = store.getState()
      expect(state.blueprint.data).toEqual(mockBlueprintData)
      expect(state.blueprint.loading).toBe(false)
      expect(state.blueprint.error).toBeNull()
    })
  })

  describe('HTTP error responses', () => {
    it('should handle 404 Not Found error', async () => {
      // ARRANGE: Mock 404 response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' })
      })
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toContain('HTTP error')
      expect(result.payload).toContain('404')
    })

    it('should handle 500 Internal Server Error', async () => {
      // ARRANGE: Mock 500 response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' })
      })
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toContain('HTTP error')
      expect(result.payload).toContain('500')
    })

    it('should handle 401 Unauthorized error', async () => {
      // ARRANGE: Mock 401 response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      })
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toContain('HTTP error')
      expect(result.payload).toContain('401')
    })

    it('should update store error state on HTTP error', async () => {
      // ARRANGE
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })
      global.fetch = mockFetch

      // ACT
      await store.dispatch(fetchBlueprintData())

      // ASSERT: Check store state reflects error
      const state = store.getState()
      expect(state.blueprint.data).toBeNull()
      expect(state.blueprint.loading).toBe(false)
      expect(state.blueprint.error).toBeTruthy()
    })
  })

  describe('network and fetch errors', () => {
    it('should handle network failure', async () => {
      // ARRANGE: Mock network error
      const mockFetch = vi.fn().mockRejectedValue(
        new Error('Network request failed')
      )
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toBe('Network request failed')
    })

    it('should handle fetch throwing an error', async () => {
      // ARRANGE: Mock fetch throwing
      const mockFetch = vi.fn().mockRejectedValue(
        new Error('Failed to fetch')
      )
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toBe('Failed to fetch')
    })

    it('should handle non-Error objects being thrown', async () => {
      // ARRANGE: Mock non-Error rejection (edge case)
      const mockFetch = vi.fn().mockRejectedValue('String error')
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toBe('An error occurred')
    })

    it('should handle timeout errors', async () => {
      // ARRANGE: Mock timeout
      const mockFetch = vi.fn().mockRejectedValue(
        new Error('Request timeout')
      )
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toBe('Request timeout')
    })
  })

  describe('loading state management', () => {
    it('should set loading to true when request starts', async () => {
      // ARRANGE: Create a promise we can control
      let resolvePromise: (value: any) => void
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      const mockFetch = vi.fn().mockReturnValue(fetchPromise)
      global.fetch = mockFetch

      // ACT: Dispatch but don't await
      const promise = store.dispatch(fetchBlueprintData())
      
      // ASSERT: Check loading state immediately
      let state = store.getState()
      expect(state.blueprint.loading).toBe(true)
      expect(state.blueprint.error).toBeNull()

      // Clean up: resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => mockBlueprintData
      })
      await promise
    })

    it('should set loading to false when request completes', async () => {
      // ARRANGE
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBlueprintData
      })
      global.fetch = mockFetch

      // ACT
      await store.dispatch(fetchBlueprintData())

      // ASSERT
      const state = store.getState()
      expect(state.blueprint.loading).toBe(false)
    })

    it('should set loading to false when request fails', async () => {
      // ARRANGE
      const mockFetch = vi.fn().mockRejectedValue(
        new Error('Network error')
      )
      global.fetch = mockFetch

      // ACT
      await store.dispatch(fetchBlueprintData())

      // ASSERT
      const state = store.getState()
      expect(state.blueprint.loading).toBe(false)
    })
  })

  describe('JSON parsing', () => {
    it('should correctly parse JSON response', async () => {
      // ARRANGE
      const jsonMock = vi.fn().mockResolvedValue(mockBlueprintData)
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: jsonMock
      })
      global.fetch = mockFetch

      // ACT
      await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should handle malformed JSON gracefully', async () => {
      // ARRANGE: Mock JSON parsing error
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Unexpected token in JSON')
        }
      })
      global.fetch = mockFetch

      // ACT
      const result = await store.dispatch(fetchBlueprintData())

      // ASSERT
      expect(result.type).toBe('blueprint/fetchBlueprintData/rejected')
      expect(result.payload).toContain('Unexpected token in JSON')
    })
  })
})

