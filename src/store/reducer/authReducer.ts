// src/store/reducer/authReducer.ts

// Line 1: Import the state type we defined
import type { AuthState } from "../../types/tiktok";

// Line 2: Define action types as constants
// This prevents typos and gives autocomplete
export const AUTH_LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS";
export const AUTH_LOGIN_FAILURE = "AUTH_LOGIN_FAILURE";
export const AUTH_SET_LOADING = "AUTH_SET_LOADING";
export const AUTH_LOGOUT = "AUTH_LOGOUT";

// Line 3: Initial state (same shape as your category reducer)
const initialState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    advertiserId: null,
    user: null,
    loading: true, // Start true because we check localStorage first
    error: null,
};

// Line 4: The reducer function (EXACTLY like your categoryReducer)
// Parameters: state (with default value), action
export function authReducer(state = initialState, action: any) {
    // Line 5: Switch on action type (your familiar pattern)
    switch (action.type) {

        // Line 6: Case for login success
        case AUTH_LOGIN_SUCCESS:
            return {
                ...state,                    // Spread existing state
                isAuthenticated: true,        // Update specific fields
                accessToken: action.payload.accessToken,
                user: action.payload.user,
                advertiserId: action.payload.user.advertiser_id,
                loading: false,
                error: null,
            };

        // Line 7: Case for login failure
        case AUTH_LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticated: false,
                accessToken: null,
                user: null,
                advertiserId: null,
                loading: false,
                error: action.payload,        // Error message from action
            };

        // Line 8: Case for set loading
        case AUTH_SET_LOADING:
            return {
                ...state,
                loading: action.payload,      // true or false
            };

        // Line 9: Case for logout
        case AUTH_LOGOUT:
            return {
                ...initialState,             // Reset to initial
                loading: false,              // But don't show loading spinner
            };

        // Line 10: Default case (your familiar pattern)
        default:
            return state;
    }
}