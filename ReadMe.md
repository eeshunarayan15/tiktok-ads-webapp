# TikTok Ads Creative Flow - OAuth Integration

A production-ready frontend application demonstrating TikTok Ads API integration with OAuth authentication, conditional form validation, and comprehensive error handling. A minimal Node backend is included for secure OAuth token exchange.

## 🎯 Assignment Completion

This project implements all required features:
- ✅ TikTok OAuth Integration (Authorization Code Flow)
- ✅ Ad Creation Form with conditional validation
- ✅ Music selection with three options (Existing ID / Upload / None)
- ✅ Real-time Music ID validation
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Conditional business logic (Music required for Conversions)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- TikTok Developer Account (for real mode)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp sample.env .env

# For testing without TikTok credentials (Mock Mode)
# Edit .env and set:
VITE_API_MODE=mock
VITE_TIKTOK_APP_ID=test_app_id
TIKTOK_APP_ID=test_app_id
TIKTOK_APP_SECRET=test_secret
VITE_REDIRECT_URI=http://localhost:5173/auth/callback

# Run minimal OAuth backend (separate terminal)
npm run server

# Run development server
npm run dev
```

Open http://localhost:5173

## 🔐 OAuth Setup (Real Mode)

### 1. Create TikTok Developer App

1. Go to [TikTok Developer Portal](https://developers.tiktok.com/)
2. Create new app
3. Enable **Marketing API**
4. Add OAuth redirect URI: `http://localhost:5173/auth/callback`
5. Request scopes: `user.info.basic`, `ad_management`

### 2. Configure Environment

Edit `.env`:
```env
VITE_API_MODE=real
VITE_TIKTOK_APP_ID=your_app_id_here
TIKTOK_APP_ID=your_app_id_here
TIKTOK_APP_SECRET=your_secret_here
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_API_BASE_URL=https://business-api.tiktok.com
VITE_BACKEND_URL=http://localhost:8787
BACKEND_PORT=8787
BACKEND_ALLOWED_ORIGIN=http://localhost:5173
```

## 🧪 Testing Guide

### Mock Mode (Default)
The app auto-authenticates with mock data. Test scenarios:

**Valid Music IDs:**
- `1234567890123456`
- `9876543210987654`

**Test Workflows:**

1. **Traffic Campaign with No Music:**
   - ✅ Should succeed

2. **Conversions Campaign without Music:**
   - ❌ Should show validation error
   - Try selecting "No Music" - it becomes disabled

3. **Invalid Music ID:**
   - Enter: `invalid123`
   - ❌ Should show red error message

4. **Valid Music ID:**
   - Enter: `1234567890123456`
   - ✅ Should show green checkmark with track info

## 🏗️ Architecture Decisions

### Redux Store Structure
```
store/
├── reducer/
│   ├── authReducer.ts    # OAuth state management
│   ├── adReducer.ts      # Form state & submission
│   └── musicReducer.ts   # Music validation state
└── action/
    ├── authAction.ts     # Async OAuth operations
    ├── adAction.ts       # Form validation & API calls
    └── musicAction.ts    # Music validation logic
```

**Why Redux over Context?**
- Better DevTools for debugging OAuth flows
- Middleware support for async operations
- Clearer action tracking for complex validation logic

### Form Validation Strategy

**Client-Side (Immediate Feedback):**
- Field-level: On blur/change
- Music ID: Debounced API validation (500ms)

**Server-Side (Pre-Submit):**
- Full form validation in Redux action
- Prevents submission if any errors exist
- Race condition handling for async validation

### Error Handling Philosophy

**User-Friendly Messages:**
```typescript
// ❌ BAD: Raw API error
"Error 40104: Invalid access token"

// ✅ GOOD: Actionable guidance
"Session expired. Please reconnect your TikTok account."
```

**Error Categories:**
1. **Field Errors** → Inline below input
2. **System Errors** → Toast notifications
3. **OAuth Errors** → Banner with retry button

## 📋 Key Features

### 1. OAuth Integration
- **CSRF Protection:** Random state parameter validation
- **Token Management:** localStorage with expiry checking
- **Auto-Reconnect:** Detects expired tokens during API calls

### 2. Conditional Music Logic
```
IF Objective = "Conversions"
  THEN Music is REQUIRED
  DISABLE "No Music" option
  
IF Objective = "Traffic"
  THEN Music is OPTIONAL
  ALL options available
```

### 3. Music Validation
- **Real-time validation** (debounced)
- **Visual feedback:**
  - 🔵 Validating spinner
  - ✅ Green checkmark + track info
  - ❌ Red error message
- **Upload simulation** with generated Music ID

### 4. Form Submission Flow
```
User clicks "Create Ad"
  ↓
Validate all fields
  ↓
[If errors] → Show inline errors + toast
  ↓
[If valid] → Start API call
  ↓
Show loading state
  ↓
[Success] → Show success UI + auto-reset timer
[Error] → Show error toast + keep form data
```

## 🔧 Technical Implementation

### State Management
- **Auth State:** Token, user info, loading states
- **Ad State:** Form data, validation errors, submission status
- **Music State:** Validation cache, upload status

### API Integration
```typescript
// Mock Mode: Simulates API delays and responses
// Real Mode: Actual TikTok API calls with error handling

// Example: Music validation
dispatch(validateMusicId(musicId))
  → 500ms debounce
  → API call with timeout (10s)
  → Race condition check
  → Update Redux state
```

### Security Considerations
⚠️ **Current Implementation (Demo):**
- Tokens stored in localStorage
- Minimal backend for OAuth token exchange

✅ **Production Recommendations:**
- Use a dedicated OAuth backend with secret rotation
- Use httpOnly cookies
- Implement refresh token rotation
- Add CORS protection

## 📁 Project Structure

```
src/
├── components/
│   ├── AdCreationForm.tsx    # Main form component
│   ├── MusicSelector.tsx     # Music selection logic
│   ├── OAuthButton.tsx       # Connect/Disconnect button
│   └── FormField.tsx         # Reusable form field
├── store/
│   ├── reducer/              # Redux reducers
│   ├── action/               # Async actions
│   └── store.ts              # Store configuration
├── services/
│   ├── oauth.ts              # OAuth flow utilities
│   ├── tiktokApi.ts          # API client (real + mock)
│   └── validation.ts         # Form validation rules
├── types/
│   └── tiktok.ts             # TypeScript interfaces
└── utils/
    ├── constants.ts          # Config & options
    └── errorMessages.ts      # Error mapping

```

## 🎨 User Experience

### Loading States
- **OAuth:** Full-screen spinner during redirect
- **Music Validation:** Inline spinner in input
- **Form Submission:** Button disabled with loading text

### Error Messages
All errors include:
- **Title:** What went wrong
- **Message:** Why it happened
- **Action:** How to fix it
- **Retry option** (when applicable)

### Success Flow
```
Ad Created Successfully! ✓
  ↓
[5 second countdown]
  ↓
Auto-reset to new form
  ↓
"Create Another Ad" button available
```

## 🐛 Known Limitations

1. **Token Security:** Client-side storage (see Security section)
2. **Geo-Restrictions:** Some features may not work in all regions
3. **Mock API:** Simplified error simulation
4. **File Upload:** Simulated (no actual file processing)

## 🚢 Production Checklist

If deploying to production, implement:
- [ ] Harden OAuth backend (rate limiting, secrets management, monitoring)
- [ ] HttpOnly cookie storage
- [ ] Rate limiting on API calls
- [ ] Error logging (Sentry, etc.)
- [ ] Real music file upload
- [ ] Campaign preview before submission
- [ ] Multi-language support
- [ ] Accessibility audit (WCAG 2.1)

## 💡 What I Would Improve With More Time

1. **Testing:**
   - Unit tests for Redux actions
   - Integration tests for OAuth flow
   - E2E tests with Cypress

2. **Features:**
   - Campaign preview mode
   - Draft auto-save
   - Music library browser
   - A/B testing variants

3. **UX:**
   - Undo/redo functionality
   - Keyboard shortcuts
   - Dark mode
   - Animated transitions

4. **Performance:**
   - Music ID validation caching
   - Optimistic UI updates
   - Request deduplication

## 📊 Development Timeline

- **Planning & Architecture:** 1 hour
- **Core Implementation:** 4 hours
- **Error Handling & Validation:** 2 hours
- **UI/UX Polish:** 1 hour
- **Documentation:** 2 hours
- **Testing & Refinement:** 1 hour

**Total:** ~11 hours

## 🙏 Acknowledgments

Built as a technical assessment demonstrating:
- Production-quality React + Redux architecture
- Real-world API integration patterns
- User-centric error handling
- TypeScript best practices

## 📞 Questions?

For clarification on any implementation decisions, please refer to the 5-minute video walkthrough or the inline code comments throughout the project.

---

**Note:** This is a demonstration project. For production use, implement the security recommendations and conduct thorough testing.
