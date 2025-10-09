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
}

const initialState: PrefillMappingState = {
    prefillMappings: []
}

export const selectPrefillMappings = (state: RootState) => state.prefillMapping.prefillMappings


const prefillMappingSlice = createSlice({
    name: 'prefillMapping',
    initialState,
    reducers: {
        addPrefillMapping: (state, action: PayloadAction<PrefillMapping>) => {
            state.prefillMappings.push(action.payload)
        },
        removePrefillMapping: (state, action: PayloadAction<{targetNodeId: string, targetFieldKey: string}>) => {
            state.prefillMappings = state.prefillMappings.filter(mapping => mapping.targetNodeId !== action.payload.targetNodeId && mapping.targetFieldKey !== action.payload.targetFieldKey)
        }
        
    }
})

export const { addPrefillMapping, removePrefillMapping } = prefillMappingSlice.actions
export default prefillMappingSlice.reducer