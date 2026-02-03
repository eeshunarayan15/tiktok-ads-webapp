

interface ImportMetaEnv {
  readonly VITE_TIKTOK_APP_ID: string;
  readonly VITE_REDIRECT_URI: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_MODE: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
