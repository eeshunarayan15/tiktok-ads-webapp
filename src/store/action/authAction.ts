// src/store/actions/authActions.ts

// Line 1: Import the string constants from reducer
import {
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILURE,
    AUTH_SET_LOADING,
    AUTH_LOGOUT
} from "../reducer/authReducer";

import type { TikTokUser } from "../../types/tiktok";
import type {AppDispatch} from "../store.ts";

// ==========================================
// Action: Initialize Auth (check localStorage)
// ==========================================
export function initializeAuth() {
    return async function (dispatch: AppDispatch) {
        try {
            // Use the constant (not function call)
            dispatch({ type: AUTH_SET_LOADING, payload: true });

            const storedToken = localStorage.getItem("tiktok_access_token");
            const storedUser = localStorage.getItem("tiktok_user");

            if (storedToken && storedUser) {
                const user: TikTokUser = JSON.parse(storedUser);

                // Dispatch with type constant and payload
                dispatch({
                    type: AUTH_LOGIN_SUCCESS,
                    payload: {
                        accessToken: storedToken,
                        user: user
                    }
                });
                return;
            }

            const API_MODE = import.meta.env.VITE_API_MODE || "real";
            if (API_MODE === "mock") {
                const mockUser: TikTokUser = {
                    advertiser_id: "mock_12345",
                    advertiser_name: "Demo Advertiser",
                    status: "activate"
                };

                localStorage.setItem("tiktok_access_token", "mock_token");
                localStorage.setItem("tiktok_user", JSON.stringify(mockUser));

                dispatch({
                    type: AUTH_LOGIN_SUCCESS,
                    payload: {
                        accessToken: "mock_token",
                        user: mockUser
                    }
                });
            } else {
                dispatch({ type: AUTH_SET_LOADING, payload: false });
            }
        } catch (error) {
            dispatch({
                type: AUTH_LOGIN_FAILURE,
                payload: "Failed to restore session"

            });
            console.error("Login start error:", error)

        }
    };
}

// ==========================================
// Action: Login Start (redirect to TikTok)
// ==========================================
export function loginStart() {
    return async function (dispatch: AppDispatch) {
        try {
            dispatch({ type: AUTH_SET_LOADING, payload: true });

            const randomState = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem("oauth_state", randomState);

            const appId = import.meta.env.VITE_TIKTOK_APP_ID || "demo_app_id";
            const redirectUri = import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173/auth/callback";

            const oauthUrl = `https://ads.tiktok.com/marketing_api/auth?` +
                `app_id=${appId}&` +
                `state=${randomState}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `scope=user.info.basic,ad_management`;

            window.location.href = oauthUrl;
        } catch (error) {
            dispatch({
                type: AUTH_LOGIN_FAILURE,
                payload: "Failed to start login"
            });
            console.error("Login start error:", error)
        }
    };
}

// ==========================================
// Action: Handle OAuth Callback
// ==========================================
export function handleOAuthCallback(code: string, state: string) {
    return async function (dispatch:AppDispatch ) {
        try {
            dispatch({ type: AUTH_SET_LOADING, payload: true });

            const savedState = sessionStorage.getItem("oauth_state");
            if (state !== savedState) {
                throw new Error("Invalid state parameter");
            }

            sessionStorage.removeItem("oauth_state");

            const API_MODE = import.meta.env.VITE_API_MODE || "real";
            let accessToken: string;
            let user: TikTokUser;

            if (API_MODE === "mock") {
                await new Promise(resolve => setTimeout(resolve, 1000));
                accessToken = "mock_token_" + code.substring(0, 8);
                user = {
                    advertiser_id: "mock_adv_" + Math.random().toString(36).substr(2, 9),
                    advertiser_name: "Demo Company",
                    status: "activate"
                };
            } else {
                // Real API calls...
                const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8787";
                const tokenResponse = await fetch(`${backendUrl}/oauth/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                const tokenData = await tokenResponse.json();
                if (!tokenResponse.ok || tokenData.code) {
                    throw new Error(tokenData.message || "Token exchange failed");
                }

                accessToken = tokenData.access_token;

                const userResponse = await fetch(
                    "https://business-api.tiktok.com/open_api/v1.3/advertiser/info/",
                    { headers: { "Access-Token": accessToken } }
                );

                const userData = await userResponse.json();
                if (userData.code !== 0) {
                    throw new Error(userData.message);
                }

                user = userData.data;
            }

            localStorage.setItem("tiktok_access_token", accessToken);
            localStorage.setItem("tiktok_user", JSON.stringify(user));

            dispatch({
                type: AUTH_LOGIN_SUCCESS,
                payload: { accessToken, user }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Authentication failed";
            dispatch({
                type: AUTH_LOGIN_FAILURE,
                payload: errorMessage
            });
        }
    };
}

// ==========================================
// Action: Logout
// ==========================================
export function logoutUser() {
    return async function (dispatch: any) {
        localStorage.removeItem("tiktok_access_token");
        localStorage.removeItem("tiktok_user");
        sessionStorage.removeItem("oauth_state");

        dispatch({ type: AUTH_LOGOUT });
    };
}
