import type { Edge } from "../types"


export function getAncestorIds(nodeId: string, edges: Edge[]): string[] {
    // Find ALL edges that point to this node (not just the first one)
    const parentEdges = edges.filter(edge => edge.target === nodeId)
    const parentNodeIds = parentEdges.map(edge => edge.source)
    
    if (parentNodeIds.length === 0) {
        return []
    }
    
    // Recursively get ancestors for each parent and flatten the results
    const allAncestors = parentNodeIds.flatMap(parentId => 
        [parentId, ...getAncestorIds(parentId, edges)]
    )
    
    return allAncestors
}