import { createSelector } from "@reduxjs/toolkit"
import { selectBlueprintData, selectSelectedNode } from "../slices/blueprintSlice"
import type { BlueprintData, Node } from "../types"
import { Position } from '@xyflow/react'


export const selectBlueprintNodes = createSelector(
    [selectBlueprintData],
    (data: BlueprintData | null) => {
        const edges = data?.edges || []
        const nodes = data?.nodes.map((node) => {
            const hasSourceConnection = edges.some((edge) => edge.target === node.id)
            const hasTargetConnection = edges.some((edge) => edge.source === node.id)
            return {
                id: node.id,
                type: 'custom',
                position: {x: node.position.x, y: node.position.y},
                data: { 
                    id: node.id,
                    label: node.data.name,
                    hasSourceConnection,
                    hasTargetConnection
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left
            }
        })
        return nodes || []
    }
)

export const selectBlueprintEdges = createSelector(
    [selectBlueprintData],
    (data: BlueprintData | null) => {
        const edges = data?.edges || []
        return edges.map((edge) => {
            return {
                id: `${edge.source}-${edge.target}`,
                source: edge.source,
                target: edge.target
            }
        })
    }
)

export const selectSelectedForm = createSelector(
    [selectBlueprintData, selectSelectedNode],
    (data: BlueprintData | null, selectedNode: Node | null) => {
        const selectedFormId = selectedNode?.data.component_id
        const selectedForm = data?.forms.find((form) => form.id === selectedFormId)
        return selectedForm
    }
)