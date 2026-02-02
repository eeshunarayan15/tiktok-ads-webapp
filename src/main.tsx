import { StrictMode, useEffect } from 'react';  // Added useEffect import
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Provider, useDispatch } from 'react-redux';  // Added useDispatch
import { Toaster } from 'react-hot-toast';  // NEW: Toast notifications
import type { AppDispatch } from './store/store';  // NEW: Type for dispatch
import { initializeAuth } from './store/action/authAction';  // NEW: Auth check action
import store from './store/store';
import './index.css';
import App from './App.tsx';
import RootLayout from './components/RootLayout.tsx';
import { OAuthCallback } from './pages/OAuthCallback.tsx';

// NEW COMPONENT: Check if user is logged in when app starts
export  function AppInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        // This runs once when app loads
        // It checks localStorage for existing TikTok token
        dispatch(initializeAuth());
    }, [dispatch]);  // Empty dependency = run once on mount

    return children;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                {/* REMOVED: <AuthProvider> - no longer needed, using Redux now */}

                <AppInitializer>
                    <Routes>
                        <Route path="/" element={<RootLayout />}>
                            <Route index element={<App />} />
                            <Route path="auth/callback" element={<OAuthCallback />} />
                        </Route>
                    </Routes>
                </AppInitializer>

                {/* NEW: Toast notification container */}
                {/* This displays all toast messages (success, error, loading) */}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            style: {
                                background: '#10B981',  // Green for success
                            },
                            iconTheme: {
                                primary: '#fff',
                                secondary: '#10B981',
                            },
                        },
                        error: {
                            duration: 5000,
                            style: {
                                background: '#EF4444',  // Red for error
                            },
                            iconTheme: {
                                primary: '#fff',
                                secondary: '#EF4444',
                            },
                        },
                    }}
                />

            </Provider>
        </BrowserRouter>
    </StrictMode>,
);