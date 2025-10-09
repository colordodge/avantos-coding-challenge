import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from ".."


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