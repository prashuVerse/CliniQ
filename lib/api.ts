const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

if (!API_BASE_URL) {
  console.log("Backend not accessible.")
}


export interface PatientCredentials {
  phone?: string;
  aadhaar?: string;
  otp?: string;
}

export interface PatientLoginResponse {
  token: string;
  user: {
    user_id: string;
    patientId: string;
  };
}

export interface PatientRegisterData {
  username: string;
  patientid: string;
  aadhar: string;
  phone: string;
}

export interface DoctorCredentials {
  doctorid: string;
  hospitalid: string;
  password: string;
}

export interface DoctorLoginResponse {
  token: string;
  doctor: {
    doctor_id: string;
    doctorid: string;
    doctor_name: string;
    hospital_id: string;
  };
}

export interface PatientData {
  name: string;
  id: string;
  blood_type: string;
  allergies: string[];
  conditions: string[];
  email: string;
  phone: string;
  abha_id: string;
  address: string;
  emergency_contact: string;
  patient_id?: string;
  aadhar?: string;
  recent_visit?: string;
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

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || "GET";

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

    console.log(`[API] Response ${method} ${endpoint} - Status: ${response.status}`);

    if (!response.ok) {
      console.error(`[API] Error ${method} ${endpoint} - ${response.status}: ${data.error || 'Unknown error'}`);
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
    console.error(`[API] Exception: ${errorMessage}`, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function patientLogin(credentials: PatientCredentials): Promise<ApiResponse<PatientLoginResponse>> {
  return makeRequest<PatientLoginResponse>("/auth/patient", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function patientRegister(data: PatientRegisterData): Promise<ApiResponse<{ message: string }>> {
  return makeRequest<{ message: string }>("/auth/patient", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function doctorLogin(credentials: DoctorCredentials): Promise<ApiResponse<DoctorLoginResponse>> {
  return makeRequest<DoctorLoginResponse>("/auth/doctor", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getViewRequests(): Promise<ApiResponse<ViewRequest[]>> {
  return makeRequest<ViewRequest[]>("/consent/viewRequest", {
    method: "GET",
  });
}

export async function askViewRequest(payload: AskRequestPayload): Promise<ApiResponse<{ requestid: string; message: string }>> {
  return makeRequest<{ requestid: string; message: string }>("/consent/askRequest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

export function saveUserInfo(userInfo: any): void {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

export function getUserInfo(): any {
  const info = localStorage.getItem("userInfo");
  return info ? JSON.parse(info) : null;
}

export function clearAuth(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");
}

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

export async function getPrescriptions(): Promise<ApiResponse<GetPrescriptionsResponse>> {
  return makeRequest<GetPrescriptionsResponse>("/prescription/list", {
    method: "GET",
  });
}

export async function deletePrescription(prescriptionId: number): Promise<ApiResponse<{ message: string }>> {
  return makeRequest<{ message: string }>(`/prescription/${prescriptionId}`, {
    method: "DELETE",
  });
}

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
  created_at: string;
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

export async function getMyQRTokens(): Promise<
  ApiResponse<{ tokens: QRToken[]; total: number }>
> {
  return makeRequest<{ tokens: QRToken[]; total: number }>("/qr/my-tokens", {
    method: "GET",
  });
}

export async function revokeQRToken(
  tokenId: number
): Promise<ApiResponse<{ message: string }>> {
  return makeRequest<{ message: string }>(`/qr/${tokenId}`, {
    method: "DELETE",
  });
}

export async function getPatientData(patientId: string): Promise<ApiResponse<PatientData>> {
  return makeRequest<PatientData>(`/doctor/patient/${patientId}`, {
    method: "GET",
  });
}

export async function getPatientByQRToken(token: string): Promise<ApiResponse<{
  data: PatientData;
  token_info: {
    access_level: string;
    remaining_time: string;
  };
}>> {
  return makeRequest<{
    data: PatientData;
    token_info: {
      access_level: string;
      remaining_time: string;
    };
  }>(`/doctor/patient-by-qr?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}
