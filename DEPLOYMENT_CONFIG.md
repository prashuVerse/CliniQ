# Deployment Configuration

## Backend URL
- **Production Backend:** https://cliniq-65r8.onrender.com
- **API Endpoint:** https://cliniq-65r8.onrender.com/api

## Frontend Configuration

### Environment Variables
The frontend is configured to use the production backend via:

**File: `.env.local`**
```
NEXT_PUBLIC_API_URL=https://cliniq-65r8.onrender.com/api
```

### How It Works
1. All API calls in `lib/api.ts` use the `NEXT_PUBLIC_API_URL` environment variable
2. If not set, defaults to: `https://cliniq-65r8.onrender.com/api`
3. All requests automatically include JWT bearer tokens in the Authorization header

## Testing the Connection

### Via Frontend
1. Go to Login page (`/auth/login`)
2. Enter a test ABHA ID
3. If successful, token will be stored and you'll be redirected to dashboard

### Via Terminal
```bash
# Test health check
curl https://cliniq-65r8.onrender.com/health

# Test patient login
curl -X POST https://cliniq-65r8.onrender.com/api/auth/patient \
  -H "Content-Type: application/json" \
  -d '{"abhaid": "test@abha"}'
```

## Available Endpoints

All endpoints are now pointing to the production backend:

| Endpoint | Full URL | Status |
|----------|----------|--------|
| Health Check | `https://cliniq-65r8.onrender.com/health` | ✅ |
| Patient Login | `https://cliniq-65r8.onrender.com/api/auth/patient` | ✅ |
| View Requests | `https://cliniq-65r8.onrender.com/api/consent/viewRequest` | ✅ |
| Ask Request | `https://cliniq-65r8.onrender.com/api/consent/askRequest` | ✅ |

## CORS Configuration
The backend (Render) should have CORS enabled for:
- Frontend origin (adjust as needed)
- Content-Type and Authorization headers

If CORS errors occur:
1. Check backend CORS configuration
2. Verify allowed origins include your frontend URL
3. Check Network tab in browser DevTools for error details

## Troubleshooting

### CORS Error
If you see CORS errors:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

Solution:
- Backend needs `Access-Control-Allow-Origin: *` or specific frontend origin
- Check Render backend logs for CORS issues

### Connection Timeout
If requests time out (5 second default):
- Verify backend is running on Render
- Check network connectivity
- Verify correct API URL in `.env.local`

### 404 Errors
If endpoints return 404:
- Verify endpoint path is correct
- Check backend routes in `backend_api/cmd/main.go`
- Ensure backend is properly deployed on Render

## Current Setup

✅ Frontend API calls → HTTPS (Production)
✅ Token management → Automatic
✅ Error handling → Enabled
✅ CORS support → Configured in backend

---

**Last Updated:** January 24, 2026
**Status:** Connected to Production Backend
