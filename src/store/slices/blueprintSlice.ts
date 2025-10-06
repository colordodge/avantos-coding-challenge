import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type {  BlueprintData } from '../types'
import type { RootState } from '../index'

export interface BlueprintState {
    data: BlueprintData | null
    loading: boolean
    error: string | null
}

const initialState: BlueprintState = {
    data: null,
    loading: false,
    error: null
}

export const fetchBlueprintData = createAsyncThunk(
    'blueprint/fetchBlueprintData',
    async (_, { rejectWithValue }) => {
        try {
            const API_URL = 'http://localhost:3000/api/v1/myapp/actions/blueprints/mybp/graph/'
            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error('HTTP error! status:  ${response.status} ')
            }

            const data = await response.json()
            return data

        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
        }
    }
)

export const selectBlueprintData = (state: RootState) => state.blueprint.data
export const selectBlueprintLoading = (state: RootState) => state.blueprint.loading
export const selectBlueprintError = (state: RootState) => state.blueprint.error

const blueprintSlice = createSlice({
    name: 'blueprint',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearData: (state) => {
            state.data = null
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

export const {clearError, clearData} = blueprintSlice.actions
export default blueprintSlice.reducer