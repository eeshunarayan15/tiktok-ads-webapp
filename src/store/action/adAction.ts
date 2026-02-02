// src/store/action/adAction.ts

import type { AppDispatch } from "../store";
import type { RootState } from "../reducer";
import type { AdFormData } from "../../types/tiktok";
import {
    AD_UPDATE_FORM,
    AD_VALIDATE_FORM,
    AD_CREATE_REQUEST,
    AD_CREATE_SUCCESS,
    AD_CREATE_FAILURE,
} from "../reducer/adReducer";

// Action: Update form field (as user types)
export function updateAdField(field: keyof AdFormData, value: any) {
    return {
        type: AD_UPDATE_FORM,
        payload: { field, value },
    };
}

// Action: Create Ad (submit to TikTok API)
export function createAd() {
    return async function (dispatch: AppDispatch, getState: () => RootState) {
        try {
            // Step 1: Get current form data from Redux state
            const { ad, auth, music } = getState();  // ADDED: music
            const formData = ad.formData;
            const accessToken = auth.accessToken;
            const advertiserId = auth.advertiserId;

            // Step 2: Validate form before submitting
            const errors: Record<string, string> = {};

            // Campaign Name: Required, min 3 characters
            if (!formData.campaignName.trim()) {
                errors.campaignName = "Campaign name is required";
            } else if (formData.campaignName.trim().length < 3) {
                errors.campaignName = "Campaign name must be at least 3 characters";
            }

            // Ad Text: Required, max 100 characters
            if (!formData.adText.trim()) {
                errors.adText = "Ad text is required";
            } else if (formData.adText.length > 100) {
                errors.adText = "Ad text must not exceed 100 characters";
            }

            // CTA: Required
            if (!formData.cta) {
                errors.cta = "Call-to-action is required";
            }

            // ==========================================
            // ENHANCED MUSIC VALIDATION (FIXED)
            // ==========================================

            // Option A: Existing Music ID
            if (formData.musicOption === "existing") {
                // Check 1: Did user enter any Music ID?
                if (!formData.musicId) {
                    errors.musicId = "Please enter a Music ID";
                } else {
                    // Check 2: Is validation currently running?
                    if (music.validating) {
                        errors.musicId = "Please wait for music validation to complete";
                    }
                    // Check 3: Did validation fail?
                    else if (music.error) {
                        errors.musicId = "Music ID is invalid. Please enter a valid Music ID";
                    }
                    // Check 4: Did user type a DIFFERENT ID than what was validated?
                    else if (music.validMusicId !== formData.musicId) {
                        errors.musicId = "Please validate the Music ID before submitting";
                    }
                }
            }

            // Option B: Upload Custom Music
            if (formData.musicOption === "upload") {
                // Check if upload is still in progress
                if (music.uploadLoading) {
                    errors.musicOption = "Music upload is still in progress. Please wait";
                }
                // Check if upload completed but no ID generated
                else if (!music.uploadedMusicId && !formData.musicId) {
                    errors.musicOption = "Please upload a music file first";
                }
            }

            // Option C: No Music (conditional rule)
            if (formData.musicOption === "none" && formData.objective === "CONVERSIONS") {
                errors.musicOption = "Music is required for Conversions campaigns";
            }

            // If validation errors exist, stop here
            if (Object.keys(errors).length > 0) {
                dispatch({
                    type: AD_VALIDATE_FORM,
                    payload: errors,
                });

                // Show toast error
                import("react-hot-toast").then(({ default: toast }) => {
                    toast.error("Please fix the form errors");
                });

                return;
            }

            // Step 3: All valid, start API call
            dispatch({ type: AD_CREATE_REQUEST });

            // Check mode
            const API_MODE = import.meta.env.VITE_API_MODE || "real";
            let adId: string;

            if (API_MODE === "mock") {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Generate fake ad ID
                adId = "mock_ad_" + Math.random().toString(36).substr(2, 9);

                console.log("🧪 Mock ad created:", adId);
                console.log("Form data:", formData);

            } else {
                // Real API call to TikTok
                const response = await fetch(
                    "https://business-api.tiktok.com/open_api/v1.3/ad/create/",
                    {
                        method: "POST",
                        headers: {
                            "Access-Token": accessToken!,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            advertiser_id: advertiserId,
                            campaign_name: formData.campaignName,
                            objective: formData.objective,
                            ad_text: formData.adText,
                            call_to_action: formData.cta,
                            music_id: formData.musicId || undefined,
                        }),
                    }
                );

                const data = await response.json();

                // Handle TikTok specific errors
                if (data.code === 40104) {
                    throw new Error("Access token expired. Please reconnect.");
                }
                if (data.code === 403) {
                    throw new Error("This feature is not available in your region (Geo-restricted).");
                }
                if (data.code !== 0) {
                    throw new Error(data.message || "Failed to create ad");
                }

                adId = data.data.ad_id;
            }

            // Step 4: Success!
            dispatch({
                type: AD_CREATE_SUCCESS,
                payload: { adId },
            });

            // Show success toast
            import("react-hot-toast").then(({ default: toast }) => {
                toast.success("Ad created successfully! 🎉", {
                    duration: 5000,
                });
            });

        } catch (error) {
            // Step 5: Handle errors
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to create ad";

            dispatch({
                type: AD_CREATE_FAILURE,
                payload: errorMessage,
            });

            // Show error toast
            import("react-hot-toast").then(({ default: toast }) => {
                toast.error(errorMessage, {
                    duration: 5000,
                });
            });
        }
    };
}

// Action: Reset form (for "Create Another Ad" button)
export function resetAdForm() {
    return {
        type: "AD_RESET",
    };
}