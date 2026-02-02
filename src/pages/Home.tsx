import { getOAuthFriendlyError } from "../utils/errorMessages";
import { useSearchParams } from "react-router-dom";
import { OAuthButton } from "../components/OAuthButton";
import { AdCreationForm } from "../components/AdCreationForm";

// REMOVED: import { useAuth } from "../contexts/AuthContext";
// ADDED: Import Redux hooks
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

import type { UserFriendlyError } from "../types/tiktok";
import { ErrorBanner } from "../components/ErrorBanner";
import { useEffect, useState } from "react";

export function Home() {
  // CHANGED: Get auth state from Redux instead of Context
  // useSelector reads data from Redux store
  // state.auth comes from your reducer: combineReducers({ auth: authReducer })
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();
  const [oauthError, setOauthError] = useState<UserFriendlyError | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const friendlyError = getOAuthFriendlyError(error);
      setOauthError(friendlyError);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Loading state from Redux (checking localStorage on app start)
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
    );
  }

  // Rest of your JSX stays EXACTLY the same!
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  TikTok Ads Creator
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create engaging ad campaigns in minutes
                </p>
              </div>
              <OAuthButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-12">
          {oauthError && (
              <div className="mb-8 max-w-2xl mx-auto">
                <ErrorBanner
                    error={oauthError}
                    onDismiss={() => setOauthError(null)}
                />
              </div>
          )}

          {!isAuthenticated ? (
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center transform rotate-3">
                    <svg
                        className="w-12 h-12 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Get Started with TikTok Ads
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Connect your TikTok Ads account to start creating
                    high-performing ad campaigns that reach millions of users.
                  </p>

                  <div className="space-y-4 text-left max-w-md mx-auto mb-8">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Connect Your Account
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Securely link your TikTok Ads account via OAuth
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Create Your Ad
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Fill in campaign details, add creative, and select music
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Launch Campaign
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Submit your ad and start reaching your audience
                        </p>
                      </div>
                    </div>
                  </div>

                  <OAuthButton />
                </div>
              </div>
          ) : (
              <AdCreationForm />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/50 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center text-sm text-gray-600">
              <p>Built for TikTok Ads API Integration Assignment</p>
              <p className="mt-1 text-xs">
                This is a demo application. For production use, implement
                server-side token management.
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}