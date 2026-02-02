// src/store/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";  // Import combineReducers

// Import your plain reducer (same pattern as your categoryReducer)
import { authReducer } from "./reducer/authReducer";
import {musicReducer} from "./reducer/musicReducer.ts";
import {adReducer} from "./reducer/adReducer.ts";

// Combine reducers (familiar pattern)
const rootReducer = combineReducers({
    auth: authReducer,
    music: musicReducer,
    ad: adReducer,
});

// Create store with configureStore (still gives you DevTools and thunk)
export const store = configureStore({
    reducer: rootReducer,
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;