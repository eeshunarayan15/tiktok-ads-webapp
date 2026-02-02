import React from 'react';

// CHANGED: Import from react-redux instead of AuthContext
import { useSelector, useDispatch } from 'react-redux';

// NEW: Import types and actions from your Redux store
import type { RootState, AppDispatch } from '../store/store';
import { loginStart, logoutUser } from '../store/action/authAction';

export const OAuthButton: React.FC = () => {
    // CHANGED: Get dispatch function from Redux
    const dispatch = useDispatch<AppDispatch>();

    // CHANGED: Get auth state from Redux store instead of Context
    // state.auth comes from your combineReducers({ auth: authReducer })
    const { isAuthenticated, user, loading } = useSelector(
        (state: RootState) => state.auth
    );
    console.log("Redux State:", { isAuthenticated, loading });
    // NEW: Handle logout (you didn't have this before, but we need it)
    const handleClick = () => {
        if (isAuthenticated) {
            // If already logged in, logout
            dispatch(logoutUser());
        } else {
            // If not logged in, start OAuth flow
            dispatch(loginStart());
        }
    };

    // NEW: Show loading state
    if (loading) {
        return (
            <button
                disabled
                className="bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed"
            >
                Loading...
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
            {/* CHANGED: Show user name if logged in */}
            {isAuthenticated
                ? `Disconnect (${user?.advertiser_name})`
                : 'Connect TikTok Ads Account'
            }
        </button>
    );
};