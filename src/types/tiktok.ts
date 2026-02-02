// src/types/tiktok.ts

// ============================================================================
// OAUTH TYPES (Interfaces - because TikTok might extend these)
// ============================================================================

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;      // Optional: TikTok might not always send this
  expires_in: number;         // Seconds until expiration
  timestamp: number;          // When we received it (for expiry calc)
}

export interface TikTokUser {
  advertiser_id: string;
  advertiser_name: string;
  // Add other fields TikTok returns
  status?: 'activate' | 'deactivate';
  role?: 'ADMIN' | 'OPERATOR';
  timezone?: string;
}

// OAuth Request/Response payloads
export interface OAuthTokenRequest {
  app_id: string;
  secret: string;
  auth_code: string;
}

export interface OAuthTokenResponse {
  code: number;              // 0 = success
  message: string;
  data: {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    open_id?: string;
  };
}

export interface TikTokApiError {
  code: number;
  message: string;
  request_id?: string;
}

export interface TikTokApiResponse<T> {
  code: number;
  message: string;
  data: T;
}


// ============================================================================
// REDUX STATE TYPES (Interfaces - state shapes can evolve)
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  advertiserId: string | null;
  user: TikTokUser | null;
  loading: boolean;
  error: AuthError | null;    // Structured error, not just string
}

export interface AdState {
  loading: boolean;
  error: AdError | null;
  createdAdId: string | null;
  formData: AdFormData;
}

export interface MusicState {
  validating: boolean;
  validMusicId: string | null;
  musicDetails: MusicDetails | null;
  error: string | null;
}

// Root state combines all
export interface RootState {
  auth: AuthState;
  ad: AdState;
  music: MusicState;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

// Main Ad Creation Form
export interface AdFormData {
  campaignName: string;
  objective: CampaignObjective;
  adText: string;
  cta: CallToAction;
  musicOption: MusicOption;
  musicId?: string;           // Conditional: only if musicOption = 'existing'
  customMusicFile?: File;     // Conditional: only if musicOption = 'upload'
}

// Use TYPE for unions (fixed set of values)
export type CampaignObjective = 'TRAFFIC' | 'CONVERSIONS';

export type CallToAction =
    | 'LEARN_MORE'
    | 'SHOP_NOW'
    | 'SIGN_UP'
    | 'DOWNLOAD'
    | 'BOOK_NOW'
    | 'CONTACT_US';

export type MusicOption = 'existing' | 'upload' | 'none';

// ============================================================================
// ERROR TYPES (Interfaces - structured error handling)
// ============================================================================

export interface AuthError {
  type: AuthErrorType;
  title: string;
  message: string;
  canRetry: boolean;
  action?: string;            // Suggested action for user
}

export type AuthErrorType =
    | 'INVALID_CREDENTIALS'
    | 'EXPIRED_TOKEN'
    | 'GEO_RESTRICTED'
    | 'MISSING_PERMISSIONS'
    | 'NETWORK_ERROR'
    | 'INVALID_STATE'
    | 'USER_CANCELLED';

export interface AdError {
  field?: string;             // Which field caused error (if validation)
  code: number;
  message: string;
  type: 'VALIDATION' | 'API' | 'NETWORK';
}

export interface MusicValidationError {
  musicId: string;
  reason: 'NOT_FOUND' | 'NOT_AVAILABLE' | 'COPYRIGHT_ISSUE';
  message: string;
}
// ============================================================================
// API CONTRACT TYPES (Interfaces - strict contracts with TikTok)
// ============================================================================

// TikTok Advertiser Info API
export interface AdvertiserInfoRequest {
  // GET request, params in query string
  advertiser_ids?: string[];  // Optional: filter specific IDs
}

export interface AdvertiserInfoResponse {
  list: TikTokUser[];
  page_info?: {
    page: number;
    page_size: number;
    total_number: number;
  };
}

// TikTok Music Validation API
export interface MusicValidationRequest {
  music_id: string;
  advertiser_id: string;      // Required by TikTok
}

export interface MusicDetails {
  music_id: string;
  title: string;
  artist: string;
  duration: number;           // Seconds
  cover_url?: string;
  is_available: boolean;
}

// Ad Creation API
export interface AdCreationRequest {
  advertiser_id: string;
  campaign_name: string;
  objective: CampaignObjective;
  ad_text: string;
  call_to_action: CallToAction;
  music_id?: string;
  // Optional fields you might add later:
  budget?: number;
  schedule_start?: string;    // ISO date
  schedule_end?: string;
}

export interface AdCreationResponse {
  ad_id: string;
  campaign_id: string;
  ad_group_id?: string;
  create_time: string;
}
// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface OAuthButtonProps {
  className?: string;
  onError?: (error: AuthError) => void;
}

export interface AdCreationFormProps {
  onSuccess?: (adId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<AdFormData>;
}

export interface MusicSelectorProps {
  value: MusicOption;
  musicId?: string;
  objective: CampaignObjective;  // To enforce conditional logic
  onChange: (option: MusicOption, musicId?: string) => void;
  error?: string;
  disabled?: boolean;
}

export interface ErrorBannerProps {
  error: AuthError | AdError | string;
  onDismiss?: () => void;
  onRetry?: () => void;
}