# API Usage Examples - VitalSync

## Quick Start

### 1. Patient Login
```typescript
import { patientLogin, saveAuthToken, saveUserInfo } from "@/lib/api";

// In your component
const handleLogin = async (abhaId: string) => {
  const response = await patientLogin({ abhaid: abhaId });
  
  if (response.success && response.data) {
    // Save authentication data
    saveAuthToken(response.data.token);
    saveUserInfo(response.data.user);
    
    // Redirect to dashboard
    router.push("/dashboard");
  } else {
    // Show error: response.error
    setError(response.error);
  }
};
```

---

### 2. Doctor Requesting Patient Access
```typescript
import { askViewRequest, getUserInfo } from "@/lib/api";

// In doctor dashboard
const handleRequestAccess = async (patientAbhaId: string) => {
  const userInfo = getUserInfo(); // Get stored doctor info
  
  const response = await askViewRequest({
    requesterid: userInfo?.user_id || "DR-ID",
    targetid: patientAbhaId,
    scope: "medical_records"
  });
  
  if (response.success) {
    // Show success message
    console.log("Request sent:", response.data?.requestid);
  } else {
    // Show error
    console.error("Failed:", response.error);
  }
};
```

---

### 3. Checking Pending Requests (Patient)
```typescript
import { getViewRequests } from "@/lib/api";

// In patient dashboard
const loadPendingRequests = async () => {
  const response = await getViewRequests();
  
  if (response.success && Array.isArray(response.data)) {
    // Display requests
    const pendingRequests = response.data.filter(
      r => r.status === "Pending"
    );
    setPendingRequests(pendingRequests);
  }
};

// Use in useEffect
useEffect(() => {
  loadPendingRequests();
}, []);
```

---

### 4. Server Health Check
```typescript
import { checkApiHealth } from "@/lib/api";

// Verify backend is running
const verifyBackend = async () => {
  const response = await checkApiHealth();
  
  if (response.success) {
    console.log("Backend is healthy:", response.data?.status);
  } else {
    console.error("Backend unreachable:", response.error);
  }
};
```

---

### 5. Authentication Management
```typescript
import { getAuthToken, getUserInfo, clearAuth } from "@/lib/api";

// Check if user is logged in
const isLoggedIn = getAuthToken() !== null;

// Get current user info
const userInfo = getUserInfo();
if (userInfo) {
  console.log("User ID:", userInfo.user_id);
  console.log("ABHA ID:", userInfo.abhaId);
}

// Logout
const handleLogout = () => {
  clearAuth();
  router.push("/");
};
```

---

## Full Integration Examples

### Complete Login Flow
```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  patientLogin, 
  saveAuthToken, 
  saveUserInfo 
} from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [abhaId, setAbhaId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await patientLogin({ abhaid: abhaId });
      
      if (response.success && response.data) {
        // Save credentials
        saveAuthToken(response.data.token);
        saveUserInfo(response.data.user);
        
        // Redirect
        router.push("/dashboard");
      } else {
        setError(response.error || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={abhaId}
        onChange={(e) => setAbhaId(e.target.value)}
        placeholder="ABHA ID"
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

### Complete Doctor Request Flow
```typescript
"use client";
import { useState } from "react";
import { 
  askViewRequest, 
  getUserInfo,
  getViewRequests 
} from "@/lib/api";

export default function DoctorAccessRequest() {
  const [patientAbhaId, setPatientAbhaId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("success");

  const handleRequestAccess = async () => {
    if (!patientAbhaId.trim()) {
      setMessage("Please enter patient ABHA ID");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    
    try {
      const userInfo = getUserInfo();
      
      const response = await askViewRequest({
        requesterid: userInfo?.user_id || "DR-001",
        targetid: patientAbhaId,
        scope: "medical_records"
      });

      if (response.success) {
        setMessage(
          `Request sent to ${patientAbhaId}. Request ID: ${response.data?.requestid}`
        );
        setMessageType("success");
        setPatientAbhaId("");
        
        // Refresh pending requests
        loadPendingRequests();
      } else {
        setMessage(response.error || "Failed to send request");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    const response = await getViewRequests();
    if (response.success) {
      console.log("Pending requests:", response.data);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={patientAbhaId}
        onChange={(e) => setPatientAbhaId(e.target.value)}
        placeholder="Patient ABHA ID"
      />
      
      <button 
        onClick={handleRequestAccess} 
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Request Access"}
      </button>

      {message && (
        <div className={messageType === "error" ? "error" : "success"}>
          {message}
        </div>
      )}
    </div>
  );
}
```

---

### Protected Route Example
```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      // Redirect to login if not authenticated
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div>
      Protected content here
    </div>
  );
}
```

---

### Error Handling Pattern
```typescript
import { patientLogin } from "@/lib/api";

async function handleLogin(abhaId: string) {
  const response = await patientLogin({ abhaid: abhaId });

  // Check for success
  if (!response.success) {
    // Handle specific errors
    if (response.error?.includes("not found")) {
      console.error("User does not exist");
    } else if (response.error?.includes("invalid")) {
      console.error("Invalid credentials");
    } else {
      console.error("Unknown error:", response.error);
    }
    return;
  }

  // Process successful response
  if (response.data) {
    console.log("Login successful");
    console.log("Token:", response.data.token);
    console.log("User:", response.data.user);
  }
}
```

---

## Response Types

### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  error?: undefined;
}

// Example
{
  success: true,
  data: {
    token: "jwt...",
    user: { user_id: "1", abhaId: "name@abha" }
  }
}
```

### Error Response
```typescript
interface ApiResponse<T> {
  success: false;
  data?: undefined;
  error: string;
}

// Example
{
  success: false,
  error: "User not found"
}
```

---

## TypeScript Types

### All Available Types
```typescript
export interface PatientCredentials {
  abhaid: string;
}

export interface PatientLoginResponse {
  token: string;
  user: {
    user_id: string;
    abhaId: string;
  };
}

export interface ViewRequest {
  requestid: string;
  requesterid: string;
  targetid: string;
  status: "Pending" | "Accepted" | "Rejected";
}

export interface AskRequestPayload {
  requesterid: string;
  targetid: string;
  scope: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## Best Practices

### 1. Always Check Response.success
```typescript
// ✅ Good
if (response.success && response.data) {
  // Use response.data
}

// ❌ Bad
if (response.data) {
  // What if response.success is false?
}
```

### 2. Use Try-Catch for Network Errors
```typescript
try {
  const response = await askViewRequest(payload);
  if (response.success) {
    // Success
  }
} catch (error) {
  // Network error
  console.error("Network error:", error);
}
```

### 3. Always Set Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    const response = await apiCall();
    // Handle response
  } finally {
    setIsLoading(false); // Always reset
  }
};
```

### 4. Store Sensitive Data Properly
```typescript
// ✅ Good - Store in localStorage with key
saveAuthToken(response.data.token);

// ✅ Better - Use secure cookies (requires backend)
// setCookie('authToken', token, { secure: true, httpOnly: true })

// ❌ Bad - Don't store in plain state across navigation
// setToken(response.data.token);
```

---

## Testing the API

### Test Patient Login
```bash
curl -X POST http://localhost:8080/api/auth/patient \
  -H "Content-Type: application/json" \
  -d '{"abhaid": "testpatient@abha"}'
```

### Test Doctor Request
```bash
curl -X POST http://localhost:8080/api/consent/askRequest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requesterid": "DR-001",
    "targetid": "testpatient@abha",
    "scope": "medical_records"
  }'
```

### Test Get Pending Requests
```bash
curl -X GET http://localhost:8080/api/consent/viewRequest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Health Check
```bash
curl http://localhost:8080/health
```

---

**Last Updated:** January 23, 2026
**API Version:** 1.0
**Status:** Production Ready
