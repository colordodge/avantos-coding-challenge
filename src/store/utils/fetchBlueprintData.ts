import { createAsyncThunk } from "@reduxjs/toolkit"

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