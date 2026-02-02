// src/store/reducer/adReducer.ts

import type { AdFormData } from "../../types/tiktok";

// Action type constants
export const AD_UPDATE_FORM = "AD_UPDATE_FORM";
export const AD_VALIDATE_FORM = "AD_VALIDATE_FORM";
export const AD_CREATE_REQUEST = "AD_CREATE_REQUEST";
export const AD_CREATE_SUCCESS = "AD_CREATE_SUCCESS";
export const AD_CREATE_FAILURE = "AD_CREATE_FAILURE";
export const AD_RESET = "AD_RESET";
export const AD_CLEAR_ERROR = "AD_CLEAR_ERROR";

// State interface
export interface AdState {
    formData: AdFormData;
    loading: boolean;           // Submitting to API
    error: string | null;       // API error message
    validationErrors: Record<string, string>; // Field-specific errors
    createdAdId: string | null; // Success response
    success: boolean;
}

// Initial state - empty form
const initialState: AdState = {
    formData: {
        campaignName: "",
        objective: "TRAFFIC",
        adText: "",
        cta: "LEARN_MORE",
        musicOption: "none",
        musicId: undefined,
        customMusicName: undefined,
    },
    loading: false,
    error: null,
    validationErrors: {},
    createdAdId: null,
    success: false,
};

// Reducer function
export function adReducer(state = initialState, action: any) {
    switch (action.type) {

        // Update a single form field (e.g., user types in Campaign Name)
        case AD_UPDATE_FORM:
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.field]: action.payload.value,
                },
                // Clear validation error for this field when user types
                validationErrors: {
                    ...state.validationErrors,
                    [action.payload.field]: undefined,
                },
            };

        // Set validation errors (form submitted with errors)
        case AD_VALIDATE_FORM:
            return {
                ...state,
                validationErrors: action.payload,
            };

        // Start creating ad (API call begins)
        case AD_CREATE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                success: false,
                validationErrors: {},
            };

        // Ad created successfully
        case AD_CREATE_SUCCESS:
            return {
                ...state,
                loading: false,
                createdAdId: action.payload.adId,
                success: true,
                error: null,
            };

        // Ad creation failed (API error)
        case AD_CREATE_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false,
            };

        // Reset form (after success or when user clicks "Create New Ad")
        case AD_RESET:
            return {
                ...initialState,
            };

        // Clear error (user clicks X on error banner)
        case AD_CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
}