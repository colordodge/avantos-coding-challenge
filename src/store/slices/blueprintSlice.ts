import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {  BlueprintData, Node } from '../types'
import type { RootState } from '../index'

import { fetchBlueprintData } from '../utils/fetchBlueprintData'



export interface BlueprintState {
    data: BlueprintData | null
    selectedNode: Node | null
    loading: boolean
    error: string | null
}


const initialState: BlueprintState = {
    data: null,
    selectedNode: null,
    loading: false,
    error: null
}

export const selectBlueprintData = (state: RootState) => state.blueprint.data
export const selectBlueprintLoading = (state: RootState) => state.blueprint.loading
export const selectBlueprintError = (state: RootState) => state.blueprint.error
export const selectSelectedNode = (state: RootState) => state.blueprint.selectedNode


const blueprintSlice = createSlice({
    name: 'blueprint',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearData: (state) => {
            state.data = null
        },
        setSelectedNode: (state, action: PayloadAction<Node | null>) => {
            state.selectedNode = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchBlueprintData.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchBlueprintData.fulfilled, (state, action: PayloadAction<BlueprintData>) => {
            state.loading = false
            state.data = action.payload
            state.error = null
        })
        .addCase(fetchBlueprintData.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
    }
})

export const {clearError, clearData, setSelectedNode} = blueprintSlice.actions
export default blueprintSlice.reducer