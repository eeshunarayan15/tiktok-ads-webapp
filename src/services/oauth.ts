// src/services/oauth.ts
import type { OAuthTokens, ApiError } from "../types/tiktok";
import { OAUTH_CONFIG } from "../utils/constants";

const APP_ID = import.meta.env.VITE_TIKTOK_APP_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8787";

/**
 * Initiates the OAuth flow by redirecting to TikTok's authorization page
 */
export function initiateOAuthFlow(): void {
  const state = generateRandomState();
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    app_id: APP_ID,
    state,
    redirect_uri: REDIRECT_URI,
    scope: OAUTH_CONFIG.scopes.join(","),
  });

  const authUrl = `${OAUTH_CONFIG.authUrl}?${params.toString()}`;
  window.location.href = authUrl;
}

/**
 * Handles the OAuth callback and exchanges code for tokens
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<OAuthTokens> {
  // Verify state to prevent CSRF attacks
  const savedState = sessionStorage.getItem("oauth_state");
  if (state !== savedState) {
    throw new Error("Invalid state parameter. Possible CSRF attack.");
  }
  sessionStorage.removeItem("oauth_state");

  try {
    // Exchange authorization code for access token
    const tokens = await exchangeCodeForTokens(code);

    // Store tokens with timestamp
    const tokensWithTimestamp: OAuthTokens = {
      ...tokens,
      timestamp: Date.now(),
    };

    // Store in memory and optionally in localStorage
    storeTokens(tokensWithTimestamp);

    return tokensWithTimestamp;
  } catch (error) {
    console.error("OAuth callback error:", error);
    throw error;
  }
}

/**
 * Exchanges authorization code for access token
 * NOTE: In production, this should be done server-side to keep the secret secure
 */
async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  const response = await fetch(`${BACKEND_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (!response.ok || data.code) {
    const error: ApiError = {
      code: data.code?.toString() || "token_exchange_failed",
      message: data.message || "Failed to exchange code for tokens",
      data: data.data,
    };
    throw error;
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expires_in: data.expires_in,
  };
}

/**
 * Checks if the current access token is still valid
 */
export function isTokenValid(tokens: OAuthTokens | null): boolean {
  if (!tokens) return false;

  const expirationTime = tokens.timestamp + tokens.expires_in * 1000;
  const now = Date.now();

  // Consider token expired if less than 5 minutes remaining
  const bufferTime = 5 * 60 * 1000;
  return now < expirationTime - bufferTime;
}

/**
 * Retrieves stored tokens
 */
export function getStoredTokens(): OAuthTokens | null {
  try {
    const stored = localStorage.getItem("tiktok_tokens");
    if (!stored) return null;

    const tokens: OAuthTokens = JSON.parse(stored);

    // Validate token is not expired
    if (!isTokenValid(tokens)) {
      clearTokens();
      return null;
    }

    return tokens;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
}

/**
 * Stores tokens in localStorage
 */
export function storeTokens(tokens: OAuthTokens): void {
  try {
    localStorage.setItem("tiktok_tokens", JSON.stringify(tokens));
  } catch (error) {
    console.error("Error storing tokens:", error);
  }
}

/**
 * Clears stored tokens
 */
export function clearTokens(): void {
  localStorage.removeItem("tiktok_tokens");
}

/**
 * Generates a random state string for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Refreshes an expired token (if refresh token is available)
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<OAuthTokens> {
  // TikTok API doesn't support refresh tokens in the same way
  // This would need to be implemented based on actual API capabilities
  throw new Error("Token refresh not implemented. Please re-authenticate.");
}
