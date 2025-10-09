import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from ".."
import type { BlueprintData, Node, PrefillOptionGroup } from "../types"
import { selectBlueprintData, selectSelectedNode } from "./blueprintSlice"
import { getAncestorIds } from "../utils/graphUtils"


export type DataSource = FormFieldSource | GlobalDataSource

export interface FormFieldSource {
    type: 'form_field'
    nodeId: string
    name: string
    fieldKey: string
}

export interface GlobalDataSource {
    type: 'global'
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

export const selectPrefillOptionGroups = createSelector(
    [selectBlueprintData, selectSelectedNode],
    (data: BlueprintData | null, selectedNode: Node | null) => {

        if (!data || !selectedNode) {
            return []
        }

        // global options
        const globalGroups: PrefillOptionGroup[] = [
            {
                type: 'global',
                parentId: 'global',
                parentName: 'Global',
                fieldKeys: ['test_data', 'test_data2', 'test_data3']
            }
        ]

        // form options
        // get a list of all the nodes that are above the selected node
        var ancestorIds = getAncestorIds(selectedNode.id || '', data.edges)
        // remove duplicates from ancestorIds
        ancestorIds = [...new Set(ancestorIds)]
        const ancestorNodes = data.nodes.filter(node => ancestorIds.includes(node.id))

        const formGroups = ancestorNodes.map(node => {
            const form = data.forms.find(form => form.id === node.data.component_id)
            if (!form) {
                return null
            }
            return {
                type: 'form_field',
                parentId: node.id,
                parentName: node.data.name,
                fieldKeys: Object.keys(form.field_schema.properties)
            }
        })

        return [...globalGroups, ...formGroups]
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