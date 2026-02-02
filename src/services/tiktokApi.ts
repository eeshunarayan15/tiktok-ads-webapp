// src/services/tiktokApi.ts

import type {
  ApiError,
  MusicValidationResponse,
  AdCreationResponse,
  AdFormData,
  TikTokUser,
} from "../types/tiktok";
import { API_ENDPOINTS, MOCK_MUSIC_IDS } from "../utils/constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_MODE = import.meta.env.VITE_API_MODE || "real";

/**
 * Makes an authenticated API request to TikTok
 */
async function apiRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Access-Token": accessToken,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // TikTok API returns errors with code !== 0
    if (data.code !== 0) {
      const error: ApiError = {
        code: data.code?.toString() || "api_error",
        message: data.message || "API request failed",
        data: data.data,
      };
      throw error;
    }

    return data.data;
  } catch (error) {
    // Re-throw API errors
    if (isApiError(error)) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      const networkError: ApiError = {
        code: "network_error",
        message: "Network request failed. Please check your connection.",
      };
      throw networkError;
    }

    // Generic error
    throw error;
  }
}

/**
 * Validates a music ID
 */
export async function validateMusicId(
  musicId: string,
  accessToken: string,
): Promise<MusicValidationResponse> {
  // Use mock API in development or when configured
  if (API_MODE === "mock") {
    return mockValidateMusicId(musicId);
  }

  try {
    const data = await apiRequest<any>(
      API_ENDPOINTS.validateMusic,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          music_id: musicId,
        }),
      },
    );

    return {
      valid: true,
      music_id: musicId,
      title: data.title,
      artist: data.artist,
    };
  } catch (error) {
    if (isApiError(error)) {
      return {
        valid: false,
        music_id: musicId,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Creates an ad
 */
export async function createAd(
  formData: AdFormData,
  accessToken: string,
): Promise<AdCreationResponse> {
  // Use mock API in development or when configured
  if (API_MODE === "mock") {
    return mockCreateAd(formData);
  }

  try {
    const requestBody = {
      campaign_name: formData.campaignName,
      objective: formData.objective,
      ad_text: formData.adText,
      call_to_action: formData.cta,
      music_id: formData.musicOption === "none" ? null : formData.musicId,
    };

    const data = await apiRequest<any>(API_ENDPOINTS.createAd, accessToken, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    return {
      success: true,
      ad_id: data.ad_id,
    };
  } catch (error) {
    if (isApiError(error)) {
      return {
        success: false,
        error,
      };
    }
    throw error;
  }
}

/**
 * Gets advertiser information
 */
export async function getAdvertiserInfo(
  accessToken: string,
): Promise<TikTokUser> {
  // Use mock API in development or when configured
  if (API_MODE === "mock") {
    return mockGetAdvertiserInfo();
  }

  const data = await apiRequest<any>(API_ENDPOINTS.getAdvertiser, accessToken, {
    method: "GET",
  });

  return {
    advertiser_id: data.advertiser_id,
    advertiser_name: data.advertiser_name,
  };
}

/**
 * Simulates uploading music and returns a music ID
 */
export async function uploadMusic(
  file: File,
  _accessToken: string, // ✅ FIXED: Prefixed with underscore (unused in mock mode)
): Promise<string> {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In a real implementation, this would upload the file to TikTok
  // and return the music ID from the response
  const mockMusicId = `UPLOAD_${Date.now()}${Math.floor(Math.random() * 10000)}`;

  return mockMusicId;
}

// ============================================================================
// Mock API implementations for development
// ============================================================================

function mockValidateMusicId(
  musicId: string,
): Promise<MusicValidationResponse> {
  // ✅ FIXED: Added Promise<>
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Valid music IDs
      if (MOCK_MUSIC_IDS.includes(musicId)) {
        // ✅ FIXED: Removed 'as any'
        resolve({
          valid: true,
          music_id: musicId,
          title: "Sample Track",
          artist: "Sample Artist",
        });
      } else {
        // Invalid music ID
        resolve({
          valid: false,
          music_id: musicId,
          error: "Music ID not found in TikTok library",
        });
      }
    }, 800);
  });
}

function mockCreateAd(formData: AdFormData): Promise<AdCreationResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random API failures for testing
      const shouldFail = Math.random() < 0.1; // 10% chance of failure

      if (shouldFail) {
        const error: ApiError = {
          code: "40002",
          message: "Rate limit exceeded",
        };
        resolve({
          success: false,
          error,
        });
      } else {
        resolve({
          success: true,
          ad_id: `AD_${Date.now()}`,
        });
      }
    }, 1200);
  });
}

function mockGetAdvertiserInfo(): Promise<TikTokUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        advertiser_id: "ADV_1234567890",
        advertiser_name: "Demo Advertiser",
      });
    }, 500);
  });
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
