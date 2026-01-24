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

// --- PRESCRIPTION ENDPOINTS ---

export interface Prescription {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  description: string;
}

export interface UploadPrescriptionResponse {
  message: string;
  prescription_id: number;
  file_name: string;
  file_type: string;
  upload_date: string;
}

export interface GetPrescriptionsResponse {
  prescriptions: Prescription[];
  total: number;
}

/**
 * Upload a prescription file (PDF or TXT)
 * POST /api/prescription/upload
 */
export async function uploadPrescription(
  file: File,
  description?: string
): Promise<ApiResponse<UploadPrescriptionResponse>> {
  const formData = new FormData();
  formData.append("file", file);
  if (description) {
    formData.append("description", description);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/prescription/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return {
    success: response.ok,
    data: data as UploadPrescriptionResponse,
    error: response.ok ? undefined : (data.error || "Upload failed"),
  };
}

/**
 * Get all prescriptions for the current user
 * GET /api/prescription/list
 */
export async function getPrescriptions(): Promise<ApiResponse<GetPrescriptionsResponse>> {
  return makeRequest<GetPrescriptionsResponse>("/prescription/list", {
    method: "GET",
  });
}

/**
 * Delete a prescription by ID
 * DELETE /api/prescription/:id
 */
export async function deletePrescription(prescriptionId: number): Promise<ApiResponse<{ message: string }>> {
  return makeRequest<{ message: string }>(`/prescription/${prescriptionId}`, {
    method: "DELETE",
  });
}

/**
 * Download a prescription file
 * GET /api/prescription/download/:id
 */
export function downloadPrescription(prescriptionId: number): string {
  const token = getAuthToken();
  return `${API_BASE_URL}/prescription/download/${prescriptionId}?token=${token}`;
}

// --- AI ANALYSIS ENDPOINTS ---

export interface AnalysisRequest {
  patient_history: string;
  prescriptions: string;
}

export interface AnalysisResponse {
  analysis: string;
}

/**
 * Analyze patient prescriptions using Gemini AI
 * POST /api/ai/analyze
 */
export async function analyzePrescriptions(
  patientHistory: string,
  prescriptions: string
): Promise<ApiResponse<AnalysisResponse>> {
  return makeRequest<AnalysisResponse>("/ai/analyze", {
    method: "POST",
    body: JSON.stringify({
      patient_history: patientHistory,
      prescriptions: prescriptions,
    }),
  });
}

// --- QR CODE ENDPOINTS ---

export interface QRToken {
  id: number;
  token: string;
  qr_code: string;
  expires_at: string;
  access_level: string;
  is_used: boolean;
  used_at?: string;
  doctor?: {
    user_id: string;
    username: string;
  };
}

export interface GenerateQRResponse {
  message: string;
  token: string;
  qr_code: string;
  expires_at: string;
  access_level: string;
  duration_mins: number;
}

export interface ScanQRResponse {
  message: string;
  patient_id: number;
  patient_name: string;
  access_level: string;
  expires_at: string;
}

/**
 * Generate a QR code for temporary patient access
 * POST /api/qr/generate
 */
export async function generateQRCode(
  durationMinutes: number,
  accessLevel: "BASIC" | "FULL"
): Promise<ApiResponse<GenerateQRResponse>> {
  return makeRequest<GenerateQRResponse>("/qr/generate", {
    method: "POST",
    body: JSON.stringify({
      duration_minutes: durationMinutes,
      access_level: accessLevel,
    }),
  });
}

/**
 * Scan and validate a QR code token
 * POST /api/qr/scan
 */
export async function scanQRCode(
  token: string
): Promise<ApiResponse<ScanQRResponse>> {
  return makeRequest<ScanQRResponse>("/qr/scan", {
    method: "POST",
    body: JSON.stringify({
      token: token,
    }),
  });
}

/**
 * Get all QR tokens for current patient
 * GET /api/qr/my-tokens
 */
export async function getMyQRTokens(): Promise<
  ApiResponse<{ tokens: QRToken[]; total: number }>
> {
  return makeRequest<{ tokens: QRToken[]; total: number }>("/qr/my-tokens", {
    method: "GET",
  });
}

/**
 * Revoke a QR token
 * DELETE /api/qr/:id
 */
export async function revokeQRToken(
  tokenId: number
): Promise<ApiResponse<{ message: string }>> {
  return makeRequest<{ message: string }>(`/qr/${tokenId}`, {
    method: "DELETE",
  });
}


