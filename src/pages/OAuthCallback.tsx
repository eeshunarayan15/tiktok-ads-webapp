import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NEW: Import Redux hooks instead of Context
import { useDispatch } from "react-redux";

// NEW: Import your types and actions
import type { AppDispatch } from "../store/store";
import { handleOAuthCallback } from "../store/action/authAction";

export function OAuthCallback() {
  const navigate = useNavigate();

  // CHANGED: Instead of useAuth(), we use Redux dispatch
  // useDispatch lets us send actions to Redux store
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const processCallback = async () => {
      // STEP 1: Get data from URL (same as before)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const errorParam = params.get("error");

      // STEP 2: User cancelled on TikTok
      if (errorParam === "access_denied") {
        navigate("/?error=access_denied");
        return;
      }

      // STEP 3: Other errors from TikTok
      if (errorParam) {
        navigate("/?error=oauth_failed");
        return;
      }

      // STEP 4: Missing code
      if (!code) {
        navigate("/?error=missing_code");
        return;
      }

      // STEP 5: Missing state (security check)
      if (!state) {
        navigate("/?error=invalid_state");
        return;
      }

      // STEP 6: Process the callback with Redux
      try {
        // CHANGED: Instead of handleCallback(code, state) from Context
        // We dispatch our Redux action
        // The 'await' waits for the API calls to finish
        await dispatch(handleOAuthCallback(code, state));

        // Success! Redirect to home
        navigate("/");

      } catch (error) {
        console.error("Callback error:", error);
        navigate("/?error=oauth_failed");
      }
    };

    processCallback();

    // Dependency array: run when component mounts
    // We include dispatch and navigate so ESLint doesn't complain
  }, [dispatch, navigate]);

  // SAME UI AS BEFORE - Loading screen
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connecting to TikTok...
          </h2>
          <p className="text-sm text-gray-600">
            Please wait while we complete the connection
          </p>
        </div>
      </div>
  );
}