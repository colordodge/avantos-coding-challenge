import { describe, it, expect } from 'vitest'
import { getAncestorIds } from './graphUtils'
import type { Edge } from '../types'

describe('getAncestorIds', () => {
  // Test case 1: Node with no ancestors (root node)
  it('should return empty array when node has no ancestors', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node2' },
      { source: 'node2', target: 'node3' }
    ]
    
    // node1 is a root node (no edges point to it)
    const result = getAncestorIds('node1', edges)
    
    expect(result).toEqual([])
  })

  // Test case 2: Node with a single direct parent
  it('should return direct parent when node has one parent', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node2' }
    ]
    
    const result = getAncestorIds('node2', edges)
    
    expect(result).toEqual(['node1'])
  })

  // Test case 3: Node with a chain of ancestors (grandparent -> parent -> child)
  it('should return all ancestors in a linear chain', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node2' },
      { source: 'node2', target: 'node3' },
      { source: 'node3', target: 'node4' }
    ]
    
    const result = getAncestorIds('node4', edges)
    
    // Should contain all ancestors: immediate parent (node3), grandparent (node2), great-grandparent (node1)
    expect(result).toContain('node3')
    expect(result).toContain('node2')
    expect(result).toContain('node1')
    expect(result).toHaveLength(3)
  })

  // Test case 4: Node with multiple direct parents
  it('should return all parents when node has multiple parents', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node3' },
      { source: 'node2', target: 'node3' }
    ]
    
    const result = getAncestorIds('node3', edges)
    
    expect(result).toContain('node1')
    expect(result).toContain('node2')
    expect(result).toHaveLength(2)
  })

  // Test case 5: Complex DAG with multiple paths to the same node
  it('should handle complex graph with multiple paths converging', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node2' },
      { source: 'node1', target: 'node3' },
      { source: 'node2', target: 'node4' },
      { source: 'node3', target: 'node4' }
    ]
    
    const result = getAncestorIds('node4', edges)
    
    // node4 has two parents (node2, node3), and they both have node1 as parent
    // So ancestors should include: node2, node3, node1 (from node2), node1 (from node3)
    expect(result).toContain('node1')
    expect(result).toContain('node2')
    expect(result).toContain('node3')
  })

  // Test case 6: Empty edges array
  it('should return empty array when edges array is empty', () => {
    const edges: Edge[] = []
    
    const result = getAncestorIds('node1', edges)
    
    expect(result).toEqual([])
  })

  // Test case 7: Node that doesn't exist in the graph
  it('should return empty array for non-existent node', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node2' }
    ]
    
    const result = getAncestorIds('node999', edges)
    
    expect(result).toEqual([])
  })

  // Test case 8: Diamond pattern (common DAG pattern)
  it('should handle diamond pattern correctly', () => {
    // Diamond: A -> B -> D
    //          A -> C -> D
    const edges: Edge[] = [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' }
    ]
    
    const result = getAncestorIds('D', edges)
    
    // D's ancestors should include B, C, and A (appears through both paths)
    expect(result).toContain('A')
    expect(result).toContain('B')
    expect(result).toContain('C')
  })

  // Test case 9: Deep nesting
  it('should handle deeply nested ancestors', () => {
    const edges: Edge[] = [
      { source: 'node1', target: 'node2' },
      { source: 'node2', target: 'node3' },
      { source: 'node3', target: 'node4' },
      { source: 'node4', target: 'node5' },
      { source: 'node5', target: 'node6' }
    ]
    
    const result = getAncestorIds('node6', edges)
    
    expect(result).toHaveLength(5)
    expect(result).toContain('node1')
    expect(result).toContain('node2')
    expect(result).toContain('node3')
    expect(result).toContain('node4')
    expect(result).toContain('node5')
  })

  // Test case 10: Real-world scenario with form workflow
  it('should work with realistic form workflow scenario', () => {
    // Workflow: Start -> Form1 -> Form2 -> End
    //                 -> Form3 -> End
    const edges: Edge[] = [
      { source: 'start', target: 'form1' },
      { source: 'start', target: 'form3' },
      { source: 'form1', target: 'form2' },
      { source: 'form2', target: 'end' },
      { source: 'form3', target: 'end' }
    ]
    
    // Getting ancestors for the 'end' node
    const result = getAncestorIds('end', edges)
    
    expect(result).toContain('form2')
    expect(result).toContain('form3')
    expect(result).toContain('form1')
    expect(result).toContain('start')
  })
})

