// src/store/action/musicAction.ts

import type {AppDispatch, RootState} from "../store";
import {
    MUSIC_VALIDATE_REQUEST,
    MUSIC_VALIDATE_SUCCESS,
    MUSIC_VALIDATE_FAILURE,
    MUSIC_UPLOAD_REQUEST,
    MUSIC_UPLOAD_SUCCESS,
} from "../reducer/musicReducer";

export function validateMusicId(musicId: string) {
    return async function (dispatch: AppDispatch, getState: () => RootState) {
        // 🎯 TIMEOUT FIX: Set 10 second timeout
        const TIMEOUT_MS = 10000;
        const startTime = Date.now();

        try {
            dispatch({ type: MUSIC_VALIDATE_REQUEST });

            const { auth } = getState();
            const accessToken = auth.accessToken;

            if (!accessToken) {
                throw new Error("Not authenticated");
            }

            // Wait 500ms (debounce) with timeout check
            await new Promise((resolve, reject) => {
                const timer = setTimeout(resolve, 500);

                // Check if timeout exceeded during debounce
                const checkInterval = setInterval(() => {
                    if (Date.now() - startTime > TIMEOUT_MS) {
                        clearTimeout(timer);
                        clearInterval(checkInterval);
                        reject(new Error("Validation timed out. Please check your connection and try again."));
                    }
                }, 100);
            });

            // 🎯 RACE CONDITION FIX: Check if musicId changed during validation
            const currentFormData = getState().ad.formData;
            if (currentFormData.musicId !== musicId) {
                console.log("Validation aborted: musicId changed");
                return; // Abort! User typed something else
            }

            // Check total time before processing
            if (Date.now() - startTime > TIMEOUT_MS) {
                throw new Error("Validation timed out. Please check your connection and try again.");
            }

            if (musicId.length < 5) {
                // Check again before dispatching error
                if (getState().ad.formData.musicId === musicId) {
                    dispatch({
                        type: MUSIC_VALIDATE_FAILURE,
                        payload: "Music ID too short",
                    });
                }
                return;
            }

            // Success - Check again before dispatching
            if (getState().ad.formData.musicId === musicId) {
                dispatch({
                    type: MUSIC_VALIDATE_SUCCESS,
                    payload: {
                        musicId,
                        details: {
                            music_id: musicId,
                            title: "Sample Song",
                            artist: "Sample Artist",
                            duration: 30,
                            is_available: true,
                        },
                    },
                });
            }
        } catch (error) {
            // Only dispatch error if this is still the current musicId
            if (getState().ad.formData.musicId === musicId) {
                dispatch({
                    type: MUSIC_VALIDATE_FAILURE,
                    payload: error instanceof Error ? error.message : "Invalid Music ID",
                });
            }
        }
    };
}

export function uploadCustomMusic() {
    return async function (dispatch: AppDispatch) {
        dispatch({ type: MUSIC_UPLOAD_REQUEST });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockMusicId = "uploaded_" + Date.now();

        dispatch({
            type: MUSIC_UPLOAD_SUCCESS,
            payload: mockMusicId,
        });

        return mockMusicId;
    };
}