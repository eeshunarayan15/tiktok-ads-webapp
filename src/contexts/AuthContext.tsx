// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { TikTokAuthState } from "../types/tiktok";
import {
  getStoredTokens,
  clearTokens,
  isTokenValid,
  initiateOAuthFlow,
  handleOAuthCallback,
} from "../services/oauth";
import { getAdvertiserInfo } from "../services/tiktokApi";

// Extend the base state with methods
interface AuthContextType extends TikTokAuthState {
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔧 Get API mode from environment
const API_MODE = import.meta.env.VITE_API_MODE || "real";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TikTokAuthState>({
    isAuthenticated: false,
    accessToken: null,
    advertiserId: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      // 🎯 STEP 1: Check if we have stored tokens first
      const tokens = getStoredTokens();

      if (tokens && isTokenValid(tokens)) {
        try {
          const user = await getAdvertiserInfo(tokens.accessToken);

          setState({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            advertiserId: user.advertiser_id,
            user,
            loading: false,
            error: null,
          });
          return; // ✅ Exit early if real auth exists
        } catch (error) {
          clearTokens();
          // Continue to mock mode check below
        }
      }

      // 🎯 STEP 2: If no valid tokens AND we're in mock mode, auto-authenticate
      if (API_MODE === "mock") {
        console.log("🧪 Mock mode detected - auto-authenticating...");

        // Create fake tokens for mock mode
        const mockTokens = {
          accessToken: "mock_token_for_testing_12345",
          expires_in: 7200,
          timestamp: Date.now(),
        };

        try {
          // Get mock user info
          const user = await getAdvertiserInfo(mockTokens.accessToken);

          setState({
            isAuthenticated: true,
            accessToken: mockTokens.accessToken,
            advertiserId: user.advertiser_id,
            user,
            loading: false,
            error: null,
          });
          return; // ✅ Exit early after mock auth
        } catch (error) {
          console.error("Mock auth failed:", error);
          // Continue to unauthenticated state below
        }
      }

      // 🎯 STEP 3: If neither real tokens nor mock mode, show unauthenticated state
      setState({
        isAuthenticated: false,
        accessToken: null,
        advertiserId: null,
        user: null,
        loading: false,
        error: null,
      });
    };

    initAuth();
  }, []);

  const login = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    initiateOAuthFlow();
  };

  const logout = () => {
    clearTokens();
    setState({
      isAuthenticated: false,
      accessToken: null,
      advertiserId: null,
      user: null,
      loading: false,
      error: null,
    });
  };

  const handleCallback = async (code: string, callbackState: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const tokens = await handleOAuthCallback(code, callbackState);
      const user = await getAdvertiserInfo(tokens.accessToken);

      setState({
        isAuthenticated: true,
        accessToken: tokens.accessToken,
        advertiserId: user.advertiser_id,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";

      setState({
        isAuthenticated: false,
        accessToken: null,
        advertiserId: null,
        user: null,
        loading: false,
        error: errorMessage,
      });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    handleCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
