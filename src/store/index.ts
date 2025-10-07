import { configureStore } from '@reduxjs/toolkit'
import blueprintReducer from './slices/blueprintSlice'
import prefillMappingReducer from './slices/prefillMappingSlice'

export const store = configureStore({
    reducer: {
        blueprint: blueprintReducer,
        prefillMapping: prefillMappingReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch