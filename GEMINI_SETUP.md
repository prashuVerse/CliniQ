# Gemini API Integration Setup

## Overview
The CliniQ system now integrates Google's Gemini API for AI-powered medical analysis. The API key is securely stored in backend environment variables.

## Setup Instructions

### 1. Get Your Gemini API Key
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key

### 2. Configure Backend Environment Variables

#### Option A: Using .env file (Development)
1. Navigate to `backend_api/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and replace the Gemini API key:
   ```
   GEMINI_API_KEY=AIzaSyCodAh9A_eR5upS7sdVTxaGKDF3poHCLp4
   ```

#### Option B: Environment Variables (Production/Deployment)
Set the environment variable directly:
```bash
export GEMINI_API_KEY
`````

Or in your deployment platform (e.g., Render):
1. Go to your service settings
2. Add environment variable: `GEMINI_API_KEY=your-key-here`

### 3. Start the Backend
```bash
cd backend_api
go run cmd/main.go
```

The backend will now be able to call the Gemini API securely.

## API Endpoints

### Analyze Prescriptions
**Endpoint:** `POST /api/ai/analyze`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "patient_history": "Patient medical history details",
  "prescriptions": "Current prescriptions list"
}
```

**Response:**
```json
{
  "analysis": "AI-generated medical analysis..."
}
```

## Frontend Integration

The doctor dashboard's "Analyze Patient History" button now calls the real Gemini API through the secure backend endpoint.

### How It Works:
1. Doctor clicks "Analyze Patient History" button
2. Frontend sends patient data to backend: `/api/ai/analyze`
3. Backend securely calls Gemini API (API key never exposed to frontend)
4. Gemini returns analysis
5. Backend returns analysis to frontend
6. Analysis displayed in the UI

## Security Best Practices

✅ **API Key in Backend Only** - Never expose the API key to the frontend
✅ **Environment Variables** - Use `.env` files (not committed to git)
✅ **Rate Limiting** - Configure API limits in Google Cloud Console
✅ **Authenticated Endpoints** - All AI endpoints require authentication
✅ **.gitignore Protected** - `.env` files are in `.gitignore`

## Troubleshooting

### "GEMINI_API_KEY environment variable not set"
- Make sure `.env` file exists in `backend_api/` directory
- Verify the key is correctly set: `echo $GEMINI_API_KEY`
- Restart the backend server

### "Failed to analyze data"
- Check that your Gemini API key is valid
- Verify you have API quota available in Google Cloud Console
- Check backend logs for detailed error messages

### API Rate Limiting
- Google's free tier has rate limits
- If hitting limits, consider upgrading your plan or implementing request caching

## Example Usage (Frontend)

```typescript
import { analyzePrescriptions } from "@/lib/api";

// In your component
const response = await analyzePrescriptions(
  "Type 2 Diabetes, Hypertension",
  "Metformin 500mg BD, Lisinopril 10mg OD"
);

if (response.success) {
  console.log(response.data.analysis);
} else {
  console.error(response.error);
}
```

## API Quota & Limits

Check your Gemini API usage and limits at:
https://console.cloud.google.com/gen-app-builder/

## Support
For issues with Gemini API:
- https://ai.google.dev/docs
- https://support.google.com/cloud/answer/7011737
