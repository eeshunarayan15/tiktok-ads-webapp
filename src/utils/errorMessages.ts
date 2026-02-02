// src/utils/errorMessages.ts
import type { ApiError, ErrorType, UserFriendlyError } from "../types/tiktok";
import { ERROR_CODES } from "./constants";

/**
 * Maps API errors to user-friendly error messages
 */
export function mapApiErrorToUserError(
  error: ApiError | Error | unknown,
): UserFriendlyError {
  // Handle network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: "NETWORK_ERROR",
      title: "Connection Error",
      message:
        "Unable to connect to TikTok servers. Please check your internet connection and try again.",
      action: "Retry",
      canRetry: true,
    };
  }

  // Handle structured API errors
  if (isApiError(error)) {
    const errorCode = error.data?.error_code;
    const errorMessage = error.message.toLowerCase();

    // OAuth-related errors
    if (
      error.code === ERROR_CODES.INVALID_CLIENT ||
      errorMessage.includes("invalid client")
    ) {
      return {
        type: "OAUTH_INVALID_CREDENTIALS",
        title: "Invalid Credentials",
        message:
          "Your TikTok App credentials are invalid. Please check your App ID and Secret in the .env file.",
        action: "Update credentials and reconnect",
        canRetry: false,
      };
    }

    if (
      error.code === ERROR_CODES.INVALID_GRANT ||
      errorCode === ERROR_CODES.EXPIRED_TOKEN
    ) {
      return {
        type: "OAUTH_EXPIRED_TOKEN",
        title: "Session Expired",
        message:
          "Your TikTok session has expired. Please reconnect your account to continue.",
        action: "Reconnect Account",
        canRetry: true,
      };
    }

    if (
      error.code === ERROR_CODES.UNAUTHORIZED_CLIENT ||
      errorCode === ERROR_CODES.INSUFFICIENT_PERMISSIONS
    ) {
      return {
        type: "OAUTH_MISSING_PERMISSIONS",
        title: "Missing Permissions",
        message:
          'Your app doesn\'t have the required permissions. Please ensure "ad_management" and "video_management" scopes are enabled.',
        action: "Check app permissions in TikTok Developer Portal",
        canRetry: false,
      };
    }

    if (
      errorCode === ERROR_CODES.GEO_RESTRICTED ||
      error.message.includes("geo")
    ) {
      return {
        type: "OAUTH_GEO_RESTRICTION",
        title: "Region Restricted",
        message:
          "TikTok Ads API is not available in your region. This service may be restricted to certain countries.",
        action: "Contact TikTok support for availability",
        canRetry: false,
      };
    }

    // Rate limiting
    if (
      errorCode === ERROR_CODES.RATE_LIMIT_EXCEEDED ||
      errorMessage.includes("rate limit")
    ) {
      return {
        type: "RATE_LIMIT",
        title: "Too Many Requests",
        message:
          "You've made too many requests. Please wait a moment before trying again.",
        action: "Wait 60 seconds and retry",
        canRetry: true,
      };
    }

    // Music validation errors
    if (
      errorCode === ERROR_CODES.INVALID_MUSIC_ID ||
      errorMessage.includes("music")
    ) {
      return {
        type: "MUSIC_INVALID_ID",
        title: "Invalid Music ID",
        message:
          "The music ID you entered doesn't exist in TikTok's library. Please check the ID and try again.",
        action: "Verify music ID",
        canRetry: true,
      };
    }

    if (errorCode === ERROR_CODES.MUSIC_NOT_AVAILABLE) {
      return {
        type: "MUSIC_NOT_AVAILABLE",
        title: "Music Not Available",
        message:
          "This music is not available for use in ads. Please select a different track.",
        action: "Choose different music",
        canRetry: true,
      };
    }

    // Generic API error
    return {
      type: "UNKNOWN_ERROR",
      title: "Something Went Wrong",
      message:
        error.data?.description ||
        error.message ||
        "An unexpected error occurred. Please try again.",
      action: "Retry",
      canRetry: true,
    };
  }

  // Default unknown error
  return {
    type: "UNKNOWN_ERROR",
    title: "Unexpected Error",
    message:
      "An unexpected error occurred. Please try again or contact support if the issue persists.",
    action: "Retry",
    canRetry: true,
  };
}

/**
 * Type guard for ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  campaignName: {
    required: "Campaign name is required",
    minLength: "Campaign name must be at least 3 characters",
    maxLength: "Campaign name must not exceed 100 characters",
  },
  objective: {
    required: "Please select a campaign objective",
  },
  adText: {
    required: "Ad text is required",
    maxLength: "Ad text must not exceed 100 characters",
  },
  cta: {
    required: "Please select a call-to-action",
  },
  musicOption: {
    required: "Please select a music option",
    invalidForObjective:
      'Music is required for Conversions campaigns. Please select "Use Existing Music ID" or "Upload Custom Music".',
  },
  musicId: {
    required: "Music ID is required",
    invalid: "Music ID must be a 10-20 digit number",
  },
  uploadedMusicFile: {
    required: "Please upload a music file",
    invalidType: "Please upload a valid audio file (MP3, WAV, or M4A)",
    tooLarge: "File size must not exceed 10MB",
  },
} as const;
/**
 * 🎯 Converts OAuth callback error codes to user-friendly messages
 * This is specifically for errors that happen during the OAuth redirect flow
 * 
 * @param errorCode - The error code from URL parameters (e.g., "access_denied", "missing_code")
 * @returns A user-friendly error object that can be displayed to users
 */
export function getOAuthFriendlyError(errorCode: string): UserFriendlyError {
  
  // User clicked "Cancel" or "Deny" on TikTok's authorization page
  if (errorCode === "access_denied") {
    return {
      type: "OAUTH_INVALID_CREDENTIALS",
      title: "Connection Cancelled",
      message: "You cancelled the TikTok connection. That's okay! Click 'Connect TikTok Ads Account' to try again.",
      action: "Click the Connect button above to retry",
      canRetry: true,
    };
  }

  // Authorization code is missing from the callback URL
  if (errorCode === "missing_code") {
    return {
      type: "OAUTH_INVALID_CREDENTIALS",
      title: "Connection Failed",
      message: "We couldn't receive authorization from TikTok. This might be a temporary issue.",
      action: "Please try connecting again",
      canRetry: true,
    };
  }

  // State parameter doesn't match (CSRF protection failed)
  if (errorCode === "invalid_state") {
    return {
      type: "OAUTH_INVALID_CREDENTIALS",
      title: "Security Check Failed",
      message: "The connection was interrupted for security reasons. Please start fresh.",
      action: "Click Connect TikTok Ads Account to try again",
      canRetry: true,
    };
  }

  // Generic OAuth failure
  if (errorCode === "oauth_failed") {
    return {
      type: "OAUTH_INVALID_CREDENTIALS",
      title: "Connection Error",
      message: "Something went wrong while connecting to TikTok. Please try again.",
      action: "Click Connect TikTok Ads Account",
      canRetry: true,
    };
  }

  // Fallback for any unknown error code
  return {
    type: "UNKNOWN_ERROR",
    title: "Unexpected Error",
    message: "An unexpected error occurred during connection. Please try again.",
    action: "Click Connect TikTok Ads Account",
    canRetry: true,
  };
}