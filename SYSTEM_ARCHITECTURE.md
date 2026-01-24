# 🔗 Frontend-Backend Connection Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│                   localhost:3000                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │ Login Page   │  │ Doctor       │  │ Patient        │    │
│  │ /auth/login  │  │ Dashboard    │  │ Dashboard      │    │
│  │ ✅ Connected │  │ ✅ Connected │  │ 📋 Ready       │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘    │
│         │                  │                   │             │
│         └──────────────────┼───────────────────┘             │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  lib/api.ts     │                        │
│                   │  API Service    │                        │
│                   │  Layer          │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                 HTTPS (Secure)                               │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   BACKEND (Go + Gin)                   │
        │   Render Hosting                       │
        │   https://cliniq-65r8.onrender.com     │
        │                                        │
        │  ┌──────────────────────────────────┐ │
        │  │ API Endpoints                    │ │
        │  │                                  │ │
        │  │ POST /api/auth/patient          │ │
        │  │    ✅ Patient Login              │ │
        │  │                                  │ │
        │  │ POST /api/consent/askRequest    │ │
        │  │    ✅ Doctor Request             │ │
        │  │                                  │ │
        │  │ GET /api/consent/viewRequest    │ │
        │  │    ✅ View Requests              │ │
        │  │                                  │ │
        │  │ GET /health                     │ │
        │  │    ✅ Health Check               │ │
        │  └──────────────────────────────────┘ │
        │                                        │
        │  ┌──────────────────────────────────┐ │
        │  │ Database                         │ │
        │  │ (GORM ORM)                       │ │
        │  └──────────────────────────────────┘ │
        └────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

```
User Input (ABHA ID)
        │
        ▼
┌─────────────────────────┐
│ Frontend Login Page     │
│ (app/auth/login/)       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ patientLogin() API Call                     │
│ lib/api.ts                                  │
│ POST /api/auth/patient                      │
│ Body: {"abhaid": "user@abha"}              │
└────────┬────────────────────────────────────┘
         │
         │ HTTPS Request
         │
         ▼
┌──────────────────────────────────────────────┐
│ Backend: PatientLogin Handler               │
│ backend_api/handlers/auth.go                │
│ - Validate ABHA ID                          │
│ - Generate JWT Token                        │
│ - Return token + user info                  │
└────────┬─────────────────────────────────────┘
         │
         │ HTTPS Response
         │
         ▼
┌──────────────────────────────────────────┐
│ Save Auth Data                           │
│ saveAuthToken(token)                     │
│ saveUserInfo(userInfo)                   │
│ localStorage storage                     │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Redirect to Dashboard        │
│ router.push("/dashboard")    │
└──────────────────────────────┘
```

---

## 🔐 Request Flow with Authentication

```
API Request (any endpoint)
        │
        ▼
┌────────────────────────────────────┐
│ makeRequest() in lib/api.ts        │
│                                    │
│ 1. Build headers                   │
│ 2. Get stored token                │
│ 3. Add Authorization header        │
│    Authorization: Bearer <JWT>     │
└────────┬──────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ HTTPS Request to Backend           │
│ https://cliniq-65r8.onrender.com   │
└────────┬──────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Backend Verification               │
│ - Check Authorization header       │
│ - Verify JWT token                 │
│ - Process request                  │
└────────┬──────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Response to Frontend               │
│ Success/Error JSON                 │
└────────┬──────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Handle Response                    │
│ Update UI / Show messages          │
└────────────────────────────────────┘
```

---

## 📝 Configuration Summary

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://cliniq-65r8.onrender.com/api
```

### API Service Configuration
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  "https://cliniq-65r8.onrender.com/api";

// Automatic token injection
headers["Authorization"] = `Bearer ${token}`;
```

### Token Storage
```
localStorage:
  - authToken: JWT Token (used for API calls)
  - userInfo: User ID, ABHA ID (user info)
```

---

## ✅ Verification Points

| Component | Status | Check |
|-----------|--------|-------|
| API URL | ✅ Set | `lib/api.ts` line 7 |
| Env Config | ✅ Set | `.env.local` |
| Token Storage | ✅ Ready | `localStorage` |
| Error Handling | ✅ Ready | All API functions |
| CORS Support | ✅ Backend | Render config |
| TypeScript | ✅ Clean | 0 errors |

---

## 🧪 Testing Quick Commands

### Test Backend Health
```bash
curl https://cliniq-65r8.onrender.com/health
```

### Test Patient Login
```bash
curl -X POST https://cliniq-65r8.onrender.com/api/auth/patient \
  -H "Content-Type: application/json" \
  -d '{"abhaid": "test@abha"}'
```

### Test in Browser
1. Open DevTools Network tab
2. Login with test ABHA ID
3. Watch for requests to: `https://cliniq-65r8.onrender.com/api/auth/patient`
4. Check Application tab > Local Storage for auth token

---

## 🚀 Start Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000

# Navigate to login
http://localhost:3000/auth/login
```

---

## 📊 Connection Statistics

- **Total Endpoints:** 4
- **Active (Integrated):** 2 (Login, Doctor Request)
- **Ready to Integrate:** 2 (View Requests, Patient Accept/Reject)
- **API Calls:** Fully Typed with TypeScript
- **Authentication:** JWT Token-based
- **Storage:** localStorage
- **Protocol:** HTTPS (Secure)

---

## 🎯 Current Status

```
Frontend: ✅ READY
Backend:  ✅ CONNECTED
API:      ✅ ACCESSIBLE
Auth:     ✅ CONFIGURED
Database: ✅ CONNECTED (Backend)
CORS:     ✅ ENABLED
```

---

**Setup Date:** January 24, 2026
**Backend:** https://cliniq-65r8.onrender.com
**Status:** ✅ LIVE & CONNECTED
