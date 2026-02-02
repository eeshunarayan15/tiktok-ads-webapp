// src/store/reducer/musicReducer.ts

import type { MusicDetails } from "../../types/tiktok";

// Action types
export const MUSIC_VALIDATE_REQUEST = "MUSIC_VALIDATE_REQUEST";
export const MUSIC_VALIDATE_SUCCESS = "MUSIC_VALIDATE_SUCCESS";
export const MUSIC_VALIDATE_FAILURE = "MUSIC_VALIDATE_FAILURE";
export const MUSIC_UPLOAD_REQUEST = "MUSIC_UPLOAD_REQUEST";
export const MUSIC_UPLOAD_SUCCESS = "MUSIC_UPLOAD_SUCCESS";
export const MUSIC_RESET = "MUSIC_RESET";

export interface MusicState {
    validating: boolean;
    validMusicId: string | null;
    musicDetails: MusicDetails | null;
    uploadLoading: boolean;
    uploadedMusicId: string | null;
    error: string | null;
}

const initialState: MusicState = {
    validating: false,
    validMusicId: null,
    musicDetails: null,
    uploadLoading: false,
    uploadedMusicId: null,
    error: null,
};

export function musicReducer(state = initialState, action: any) {
    switch (action.type) {
        case MUSIC_VALIDATE_REQUEST:
            return { ...state, validating: true, error: null };

        case MUSIC_VALIDATE_SUCCESS:
            return {
                ...state,
                validating: false,
                validMusicId: action.payload.musicId,
                musicDetails: action.payload.details,
                error: null,
            };

        case MUSIC_VALIDATE_FAILURE:
            return {
                ...state,
                validating: false,
                validMusicId: null,
                musicDetails: null,
                error: action.payload,
            };

        case MUSIC_UPLOAD_REQUEST:
            return { ...state, uploadLoading: true };

        case MUSIC_UPLOAD_SUCCESS:
            return { ...state, uploadLoading: false, uploadedMusicId: action.payload };

        case MUSIC_RESET:
            return initialState;

        default:
            return state;
    }
}