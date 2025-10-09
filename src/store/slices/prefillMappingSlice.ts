import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from ".."
import type { BlueprintData, Node } from "../types"
import { selectBlueprintData, selectSelectedNode } from "./blueprintSlice"
import { getAncestorIds } from "../utils/graphUtils"


export interface DataSource {
    type: 'form_field' | 'global'
    id: string
    name: string
    fieldKey: string
}

export interface PrefillMapping {
    source: DataSource
    targetNodeId: string
    targetFieldKey: string
}

export interface PrefillMappingState {
    prefillMappings: PrefillMapping[]
    recentlyAddedMapping: PrefillMapping | null
}

const initialState: PrefillMappingState = {
    prefillMappings: [],
    recentlyAddedMapping: null
}

export const selectPrefillMappings = (state: RootState) => state.prefillMapping.prefillMappings
export const selectRecentlyAddedMapping = (state: RootState) => state.prefillMapping.recentlyAddedMapping

// return a flat list of DataSources representing all possible mappings
export const selectAvailableDataSourceMappings = createSelector(
    [selectBlueprintData, selectSelectedNode],
    (data: BlueprintData | null, selectedNode: Node | null) => {
        if (!data || !selectedNode) {
            return [] as DataSource[]
        }

        const availableSources: DataSource[] = []

        // Global fields
        const globalFieldKeys = ['test_data', 'test_data2', 'test_data3']
        globalFieldKeys.forEach((fieldKey) => {
            availableSources.push({
                type: 'global',
                id: 'global',
                name: 'Global',
                fieldKey
            })
        })

        // Form fields from ancestor nodes
        let ancestorIds = getAncestorIds(selectedNode.id || '', data.edges)
        ancestorIds = [...new Set(ancestorIds)]
        const ancestorNodes = data.nodes.filter((node) => ancestorIds.includes(node.id))

        ancestorNodes.forEach((node) => {
            const form = data.forms.find((form) => form.id === node.data.component_id)
            if (!form) {
                return
            }
            const fieldKeys = Object.keys(form.field_schema.properties)
            fieldKeys.forEach((fieldKey) => {
                availableSources.push({
                    type: 'form_field',
                    id: node.id,
                    name: node.data.name,
                    fieldKey
                })
            })
        })

        return availableSources
    }
)

// Grouped selector for UI consumption: groups and fast leaf lookup
export interface DataSourceLeaf {
    leafId: string
    label: string
    source: DataSource
}

export interface DataSourceGroup {
    parentId: string
    parentName: string
    children: DataSourceLeaf[]
}

export interface GroupedAvailableDataSources {
    groups: DataSourceGroup[]
    leafIdToSource: Record<string, DataSource>
}

export const selectGroupedAvailableDataSources = createSelector(
    [selectAvailableDataSourceMappings],
    (sources: DataSource[]): GroupedAvailableDataSources => {
        const parentIdToGroup: Map<string, { parentName: string, children: DataSourceLeaf[] }> = new Map()
        const leafIdToSource: Record<string, DataSource> = {}

        sources.forEach((src) => {
            const parentId = src.id
            const parentName = src.name
            const leafId = `${parentId}:${src.fieldKey}`

            // map for O(1) lookup
            leafIdToSource[leafId] = src

            // group aggregation
            const group = parentIdToGroup.get(parentId)
            const child: DataSourceLeaf = {
                leafId,
                label: src.fieldKey,
                source: src
            }
            if (!group) {
                parentIdToGroup.set(parentId, { parentName, children: [child] })
            } else {
                group.children.push(child)
            }
        })

        // stable ordering for predictable rendering
        const groups: DataSourceGroup[] = Array.from(parentIdToGroup.entries())
            .map(([parentId, { parentName, children }]) => ({
                parentId,
                parentName,
                children: children.sort((a, b) => a.label.localeCompare(b.label))
            }))
            .sort((a, b) => a.parentName.localeCompare(b.parentName))

        return { groups, leafIdToSource }
    }
)

const prefillMappingSlice = createSlice({
    name: 'prefillMapping',
    initialState,
    reducers: {
        addPrefillMapping: (state, action: PayloadAction<PrefillMapping>) => {
            state.prefillMappings.push(action.payload)
            state.recentlyAddedMapping = action.payload
        },
        removePrefillMapping: (state, action: PayloadAction<{targetNodeId: string, targetFieldKey: string}>) => {
            state.prefillMappings = state.prefillMappings.filter(mapping => {
                const isTargetMapping = 
                    mapping.targetNodeId === action.payload.targetNodeId && 
                    mapping.targetFieldKey === action.payload.targetFieldKey
                return !isTargetMapping
            })
        },
        clearRecentlyAddedMapping: (state) => {
            state.recentlyAddedMapping = null
        }
    }
})

export const { addPrefillMapping, removePrefillMapping, clearRecentlyAddedMapping } = prefillMappingSlice.actions
export default prefillMappingSlice.reducer