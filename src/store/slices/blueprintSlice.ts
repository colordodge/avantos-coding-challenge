import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type {  BlueprintData, Node, Edge } from '../types'
import type { RootState } from '../index'
import { Position } from '@xyflow/react'

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

export const selectBlueprintNodes = (state: RootState) => {
    const edges = state.blueprint.data?.edges || []
    const nodes = state.blueprint.data?.nodes.map((node) => {
        const hasSourceConnection = edges.some((edge) => edge.target === node.id)
        const hasTargetConnection = edges.some((edge) => edge.source === node.id)
        return {
            id: node.id,
            type: 'custom',
            position: {x: node.position.x, y: node.position.y},
            data: { 
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

export const selectBlueprintEdges = (state: RootState) => {
    const edges = state.blueprint.data?.edges.map((edge) => {
        return {
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target
        }
    })
    return edges || []
}

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