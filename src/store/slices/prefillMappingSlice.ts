import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from ".."

export interface PrefillMapping {
    sourceFormId: string
    sourceFieldId: string
    targetFormId: string
    targetFieldId: string
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
        
    }
})

export const { addPrefillMapping } = prefillMappingSlice.actions
export default prefillMappingSlice.reducer