# TikTok Ads Creator

A React + Redux application for creating TikTok ads with OAuth authentication, form validation, and music integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation & Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp sample.env .env
```

3. **Choose your mode**

**Option A: Mock Mode (No TikTok account needed)**
```env
VITE_API_MODE=mock
VITE_TIKTOK_APP_ID=demo_app_id
TIKTOK_APP_ID=demo_app_id
TIKTOK_APP_SECRET=demo_secret
```

**Option B: Real Mode (Requires TikTok Developer Account)**
```env
VITE_API_MODE=real
VITE_TIKTOK_APP_ID=your_actual_app_id
TIKTOK_APP_ID=your_actual_app_id
TIKTOK_APP_SECRET=your_actual_secret
```

4. **Run the application**

```bash
# Terminal 1: Start OAuth backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

5. **Open browser**
```
http://localhost:5173
```

## 📋 Features

✅ **OAuth Authentication** - Secure TikTok account connection  
✅ **Form Validation** - Real-time error checking  
✅ **Music Integration** - Existing ID, upload, or none  
✅ **Conditional Logic** - Music required for Conversions campaigns  
✅ **Error Handling** - User-friendly error messages  
✅ **Mock Mode** - Test without TikTok credentials  

## 🧪 Testing (Mock Mode)

### Valid Test Data

**Music IDs (for "Use Existing Music ID")**
- `1234567890123456`
- `9876543210987654`

### Test Scenarios

1. **Traffic Campaign without Music** → ✅ Should succeed
2. **Conversions Campaign without Music** → ❌ Should show error
3. **Invalid Music ID** (`invalid123`) → ❌ Should show validation error
4. **Valid Music ID** → ✅ Should show green checkmark

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AdCreationForm.tsx
│   ├── MusicSelector.tsx
│   └── OAuthButton.tsx
├── store/
│   ├── action/         # Redux async actions
│   │   ├── authAction.ts
│   │   ├── adAction.ts
│   │   └── musicAction.ts
│   ├── reducer/        # Redux reducers
│   │   ├── authReducer.ts
│   │   ├── adReducer.ts
│   │   └── musicReducer.ts
│   └── store.ts        # Redux store config
├── services/           # API integration
│   ├── oauth.ts
│   └── tiktokApi.ts
├── types/              # TypeScript types
└── utils/              # Constants & helpers

server/
└── index.js           # OAuth token exchange server
```

## 🔐 OAuth Setup (Real Mode)

### Get TikTok Developer Credentials

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Enable **Marketing API**
4. Add redirect URI: `http://localhost:5173/auth/callback`
5. Copy your **App ID** and **Secret**
6. Update `.env` with your credentials

## 🛠️ Tech Stack

- **Frontend**: React 19, Redux, TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Backend**: Express (minimal OAuth server)
- **Notifications**: React Hot Toast

## 📝 Environment Variables

```env
# TikTok App Credentials
VITE_TIKTOK_APP_ID=your_app_id
TIKTOK_APP_ID=your_app_id
TIKTOK_APP_SECRET=your_secret

# OAuth Settings
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_API_BASE_URL=https://business-api.tiktok.com

# Mode: 'mock' or 'real'
VITE_API_MODE=mock

# OAuth Backend
VITE_BACKEND_URL=http://localhost:8787
BACKEND_PORT=8787
BACKEND_ALLOWED_ORIGIN=http://localhost:5173
```

## 🐛 Troubleshooting

### Frontend won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### OAuth backend not working
```bash
# Check if .env exists
cat .env

# Ensure backend is running
npm run server
```

### Mock mode not working
```bash
# Verify VITE_API_MODE in .env
VITE_API_MODE=mock
```

## ⚠️ Security Note

**This is a demo application.** The current implementation stores tokens in `localStorage` for simplicity. 

**For production:**
- Use HTTP-only cookies
- Implement server-side token management
- Add refresh token rotation
- Enable CORS protection

## 📄 License

MIT