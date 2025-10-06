import { configureStore } from '@reduxjs/toolkit'
import blueprintReducer from './slices/blueprintSlice'

export const store = configureStore({
    reducer: {
        blueprint: blueprintReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch