export const TIKTOK_ERROR_MAP: Record<string, string> = {
  invalid_client: "Invalid OAuth credentials. Check your app configuration.",
  invalid_scope: "Missing required permissions. Please reconnect your account.",
  access_denied: "Access denied. Please grant Ads Management permission.",
  invalid_grant: "Session expired. Please reconnect.",
  invalid_music_id: "Music ID not found or restricted.",
  403: "Service unavailable in your region (Geo-restriction).",
  401: "Authentication expired. Please login again.",
};

export const getUserFriendlyError = (code: string | number): string => {
  return (
    TIKTOK_ERROR_MAP[code] || "An unexpected error occurred. Please try again."
  );
};
