/**
 * API Service Layer
 * Handles all communication with the backend server
 * Base URL: http://localhost:8080/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cliniq-65r8.onrender.com/api";

// --- TYPE DEFINITIONS ---

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

export interface PatientRegisterData {
  username: string;
  abhaid: string;
  aadhar: string;
  phone: string;
  patientid: string;
}

export interface ViewRequest {
  requestid: string;
  requesterid: string;
  targetid: string;
  status: "Pending" | "Accepted" | "Rejected";
}

export interface ViewRequestsResponse {
  requests: ViewRequest[];
  total: number;
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
  message?: string;
}

// --- UTILITY FUNCTIONS ---

/**
 * Helper function to make API requests
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || "GET";
    
    // Log API call initiation
    console.log(`🚀 API CALL: ${method} ${endpoint}`, {
      timestamp: new Date().toISOString(),
      url,
      method,
      body: options.body ? JSON.parse(options.body as string) : null,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add any additional headers from options
    if (options.headers && typeof options.headers === 'object') {
      Object.assign(headers, options.headers);
    }

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`✅ Auth token attached to request`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Log response
    console.log(`📡 API RESPONSE: ${method} ${endpoint}`, {
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      data,
      timestamp: new Date().toISOString(),
    });

    if (!response.ok) {
      console.error(`❌ API ERROR: ${method} ${endpoint}`, {
        status: response.status,
        error: data.error || `Request failed with status ${response.status}`,
      });
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    console.log(`✨ API SUCCESS: ${method} ${endpoint}`);
    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`🔥 API EXCEPTION: ${options.method || "GET"} ${endpoint}`, {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// --- AUTHENTICATION ENDPOINTS ---

/**
 * Patient Login
 * POST /auth/patient
 * Authenticates patient with ABHA ID and returns JWT token
 */
export async function patientLogin(credentials: PatientCredentials): Promise<ApiResponse<PatientLoginResponse>> {
  return makeRequest<PatientLoginResponse>("/auth/patient", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Patient Register
 * POST /auth/patient (via patient handler)
 * Registers a new patient in the system
 */
export async function patientRegister(data: PatientRegisterData): Promise<ApiResponse<{ message: string }>> {
  return makeRequest<{ message: string }>("/auth/patient", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- CONSENT/ACCESS ENDPOINTS ---

/**
 * Get View Requests
 * GET /consent/viewRequest
 * Retrieves all pending view requests for the authenticated user
 */
export async function getViewRequests(): Promise<ApiResponse<ViewRequest[]>> {
  return makeRequest<ViewRequest[]>("/consent/viewRequest", {
    method: "GET",
  });
}

/**
 * Ask for View Request (Doctor requesting patient data)
 * POST /consent/askRequest
 * Doctor requests access to patient's medical records
 */
export async function askViewRequest(payload: AskRequestPayload): Promise<ApiResponse<{ requestid: string; message: string }>> {
  return makeRequest<{ requestid: string; message: string }>("/consent/askRequest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- UTILITY FUNCTIONS FOR STORAGE ---

/**
 * Save authentication token to localStorage
 */
export function saveAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

/**
 * Get stored authentication token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

/**
 * Save user info to localStorage
 */
export function saveUserInfo(userInfo: any): void {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

/**
 * Get stored user info
 */
export function getUserInfo(): any {
  const info = localStorage.getItem("userInfo");
  return info ? JSON.parse(info) : null;
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");
}

// --- HEALTH CHECK ---

/**
 * Check API health
 * GET /health
 */
export async function checkApiHealth(): Promise<ApiResponse<{ service: string; status: string }>> {
  return makeRequest<{ service: string; status: string }>("/health", {
    method: "GET",
  });
}
