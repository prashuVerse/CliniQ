"use client";
import { useState } from "react";
import { 
  Activity, Search, QrCode, Fingerprint, Siren, 
  FileText, CheckCircle, AlertTriangle, X, ChevronLeft, Sparkles, Loader, LogOut
} from "lucide-react";
//import { motion, AnimatePresence } from "framer-motion";
import { 
  // ... existing imports ...
  Plus, Trash2 
} from "lucide-react";
import { 
  askViewRequest, 
  getViewRequests, 
  getUserInfo, 
  getPatientData,
  getPatientByQRToken,
  clearAuth,
  type PatientData 
} from "@/lib/api";
import { useRouter } from "next/navigation";

// Mock patient data for emergency mode
const MOCK_PATIENT = {
  name: "John Doe",
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Type 2 Diabetes", "Hypertension", "Asthma"]
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<"CLINICAL" | "EMERGENCY">("CLINICAL");

  const handleSignOut = () => {
    clearAuth();
    router.push("/auth/login");
  };

  // --- PATIENT DATA STATE ---
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");

  // --- NEW: API STATE ---
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [patientId, setPatientId] = useState(""); // To store the Patient ID to request access

  // --- NEW: DYNAMIC PRESCRIPTION STATE ---
  const [prescribedMeds, setPrescribedMeds] = useState([
    { name: "", dosage: "", timing: "After Food", note: "" }
  ]);

  const addMedication = () => {
    setPrescribedMeds([...prescribedMeds, { name: "", dosage: "", timing: "After Food", note: "" }]);
  };

  const removeMedication = (index: number) => {
    const updated = prescribedMeds.filter((_, i) => i !== index);
    setPrescribedMeds(updated);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...prescribedMeds];
    // @ts-ignore
    updated[index][field] = value;
    setPrescribedMeds(updated);
  };

  // Clinical State
  const [patientScanned, setPatientScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [geminiSummary, setGeminiSummary] = useState("");

  // Emergency State
  const [emergencyStep, setEmergencyStep] = useState<"SELECTION" | "DATA">("SELECTION");

  // --- ACTIONS ---

  // Handle request access from patient
  const handleRequestAccess = async () => {
    if (!patientId.trim()) {
      setRequestError("Please enter patient ID");
      return;
    }

    setIsLoadingRequest(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const userInfo = getUserInfo();
      const doctorId = userInfo?.user_id || "DR-8821"; // Fallback to mock ID
      
      const response = await askViewRequest({
        requesterid: doctorId,
        targetid: patientId,
        scope: "medical_records"
      });

      if (response.success) {
        setRequestSuccess(`Access request sent to patient ${patientId}`);
        setPatientId("");
        // Reload pending requests
        loadPendingRequests();
      } else {
        setRequestError(response.error || "Failed to send request");
      }
    } catch (err) {
      setRequestError("An error occurred while sending request");
    } finally {
      setIsLoadingRequest(false);
    }
  };

  // Load pending view requests
  const loadPendingRequests = async () => {
    try {
      const response = await getViewRequests();
      if (response.success && Array.isArray(response.data)) {
        setPendingRequests(response.data);
      }
    } catch (err) {
      // Silent fail for pending requests
    }
  };

  const handleScanPatient = async () => {
    setIsScanning(true);
    setPatientError("");
    
    try {
      // In a real scenario, this would open a QR code scanner
      // For now, we'll prompt for a QR token or patient ID
      const qrToken = prompt("Enter QR Token or Patient ID:");
      
      if (!qrToken) {
        setIsScanning(false);
        return;
      }

      // Try to scan QR token first
      const response = await getPatientByQRToken(qrToken);
      
      if (response.success && response.data) {
        setPatientData(response.data.data);
        setPatientScanned(true);
      } else {
        // If QR scan fails, try fetching by patient ID directly
        const patientResponse = await getPatientData(qrToken);
        if (patientResponse.success && patientResponse.data) {
          setPatientData(patientResponse.data);
          setPatientScanned(true);
        } else {
          setPatientError("Could not retrieve patient data. Invalid token or ID.");
        }
      }
    } catch (error) {
      console.error("Error scanning patient:", error);
      setPatientError("Failed to scan QR code. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGeminiSummary = async () => {
    setGeminiSummary("Analyzing...");
    try {
      // Get patient history and prescriptions from the UI
      const patientHistory = "Patient with Type 2 Diabetes, hypertension. Recent ECG normal.";
      const prescriptions = "Metformin 500mg BD, Lisinopril 10mg OD";

      // Call the Gemini API via backend
      const { analyzePrescriptions } = await import("@/lib/api");
      const response = await analyzePrescriptions(patientHistory, prescriptions);

      if (response.success && response.data) {
        setGeminiSummary(response.data.analysis);
      } else {
        setGeminiSummary(
          "Error analyzing patient data: " + (response.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setGeminiSummary("Failed to analyze patient data. Please try again.");
    }
  };

  const toggleEmergency = () => {
    if (activeMode === "CLINICAL") {
      setActiveMode("EMERGENCY");
      setEmergencyStep("SELECTION");
    } else {
      setActiveMode("CLINICAL");
      setPatientScanned(false); // Reset clinical view
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${activeMode === 'EMERGENCY' ? 'bg-slate-900 text-red-50' : 'bg-slate-50 text-slate-900'}`}>
      
      <nav className={`sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b ${activeMode === 'EMERGENCY' ? 'bg-red-950/30 border-red-900/50 backdrop-blur-md' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${activeMode === 'EMERGENCY' ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
             {activeMode === 'EMERGENCY' ? <Siren className="text-white" /> : <Activity className="text-white" />}
          </div>
          <div>
            <h1 className={`font-bold text-lg ${activeMode === 'EMERGENCY' ? 'text-red-500' : 'text-slate-800'}`}>
              {activeMode === 'EMERGENCY' ? 'EMERGENCY PROTOCOL ACTIVE' : 'Dr. Arun Verma'}
            </h1>
            {activeMode === 'CLINICAL' && <p className="text-xs text-slate-500">Apollo Hospital, Pune • ID: DR-8821</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleEmergency}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
              activeMode === 'EMERGENCY' 
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:shadow-red-200 hover:scale-105'
            }`}
          >
            {activeMode === 'EMERGENCY' ? (
               <><ChevronLeft /> Exit Emergency</>
            ) : (
               <><Siren size={18} /> ACTIVATE EMERGENCY</>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className={`p-3 rounded-lg transition-colors ${
              activeMode === 'EMERGENCY'
                ? 'text-red-500 hover:text-red-400 hover:bg-red-950/50'
                : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
            }`}
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        
        {activeMode === 'CLINICAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                  {!patientScanned ? (
                    <div className="py-10">
                       <div className="relative mx-auto w-48 h-48 border-2 border-slate-900 rounded-xl flex items-center justify-center mb-6 overflow-hidden bg-slate-50">
                          {isScanning && <div className="absolute inset-0 bg-green-500/20 animate-pulse"></div>}
                          <QrCode size={80} className="text-slate-800" />
                          {isScanning && <div className="absolute top-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)] animate-[scan_1.5s_ease-in-out_infinite]"></div>}
                       </div>
                       <button 
                         onClick={handleScanPatient}
                         disabled={isScanning}
                         className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
                       >
                         {isScanning ? "Scanning..." : "Scan Patient QR"}
                       </button>
                    </div>
                  ) : (
                    <div className="text-left">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">{patientData?.name || "Unknown"}</h2>
                            <p className="text-slate-500 text-sm">{patientData?.patient_id || patientData?.id || "-"}</p>
                          </div>
                          <button onClick={() => { setPatientScanned(false); setPatientData(null); }} className="p-2 hover:bg-slate-100 rounded-full">
                            <X size={20} className="text-slate-400" />
                          </button>
                       </div>

                       {patientError && (
                         <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-600">
                           {patientError}
                         </div>
                       )}

                       <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                             <div className="text-xs font-bold text-blue-600 uppercase mb-1">Last Visit</div>
                             <div className="text-sm font-medium text-slate-700">{patientData?.recent_visit || "No visits recorded"}</div>
                          </div>

                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase mb-2">Conditions</p>
                             <div className="flex flex-wrap gap-2">
                               {patientData?.conditions && patientData.conditions.length > 0 ? (
                                 patientData.conditions.map(c => (
                                   <span key={c} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{c}</span>
                                 ))
                               ) : (
                                 <span className="text-slate-500 text-sm">No conditions recorded</span>
                               )}
                             </div>
                          </div>

                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase mb-2">Allergies</p>
                             <div className="flex flex-wrap gap-2">
                               {patientData?.allergies && patientData.allergies.length > 0 ? (
                                 patientData.allergies.map(a => (
                                   <span key={a} className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">{a}</span>
                                 ))
                               ) : (
                                 <span className="text-slate-500 text-sm">No known allergies</span>
                               )}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 bg-slate-50 rounded-lg">
                               <p className="text-xs text-slate-500 mb-1">Blood Type</p>
                               <p className="font-bold text-slate-900">{patientData?.blood_type || "-"}</p>
                             </div>
                             <div className="p-3 bg-slate-50 rounded-lg">
                               <p className="text-xs text-slate-500 mb-1">Contact</p>
                               <p className="font-bold text-slate-900">{patientData?.phone || "-"}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>

               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Search size={18} /> Request Patient Access
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Patient ID</label>
                      <input 
                        type="text"
                        placeholder="e.g., PAT-12345"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                    {requestError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {requestError}
                      </div>
                    )}
                    {requestSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
                        {requestSuccess}
                      </div>
                    )}
                    <button 
                      onClick={handleRequestAccess}
                      disabled={isLoadingRequest}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoadingRequest ? <><Loader className="animate-spin" size={16} /> Sending...</> : "Send Request"}
                    </button>
                  </div>
               </div>

               {patientScanned && (
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <Sparkles className="absolute top-4 right-4 text-blue-300 opacity-50" size={40} />
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                       <Sparkles size={18} /> Gemini Medical
                    </h3>
                    
                    {!geminiSummary ? (
                       <button 
                         onClick={handleGeminiSummary}
                         className="mt-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm"
                       >
                         Analyze Patient History
                       </button>
                    ) : (
                       <div className="mt-4 text-sm leading-relaxed bg-white/10 p-4 rounded-lg border border-white/10">
                          {geminiSummary}
                       </div>
                    )}
                 </div>
               )}
            </div>

            <div className="lg:col-span-8">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                     <h2 className="font-bold text-slate-800 flex items-center gap-2">
                       <FileText className="text-slate-400" /> Digital Prescription
                     </h2>
                     <span className="text-xs font-mono text-slate-400">ID: RX-{Math.floor(Math.random()*10000)}</span>
                  </div>
                  
                  <div className="p-8 flex-1 space-y-6 overflow-y-auto max-h-[600px]">
                     {patientScanned ? (
                       <>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clinical Diagnosis</label>
                            <textarea 
                              className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm font-medium" 
                              placeholder="e.g. Acute Viral Fever with mild dehydration..."
                            ></textarea>
                         </div>

                         <div>
                            <div className="flex justify-between items-end mb-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase">Rx (Medications)</label>
                              <button 
                                onClick={addMedication}
                                className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition"
                              >
                                <Plus size={14} /> Add Drug
                              </button>
                            </div>

                            <div className="space-y-3">
                              {prescribedMeds.map((med, index) => (
                                <div key={index} className="flex gap-2 items-start group">
                                  <div className="pt-3 text-xs font-bold text-slate-300 w-4">{index + 1}.</div>
                                  
                                  <div className="flex-1 grid grid-cols-12 gap-2">
                                    <div className="col-span-4">
                                      <input 
                                        type="text" 
                                        placeholder="Medicine Name"
                                        value={med.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold placeholder:font-normal focus:outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    <div className="col-span-2">
                                      <input 
                                        type="text" 
                                        placeholder="1-0-1"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    <div className="col-span-3">
                                      <select 
                                        value={med.timing}
                                        onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500"
                                      >
                                        <option>Before Food</option>
                                        <option>After Food</option>
                                        <option>Empty Stomach</option>
                                        <option>Before Sleep</option>
                                      </select>
                                    </div>

                                    <div className="col-span-3">
                                      <input 
                                        type="text" 
                                        placeholder="For fever/pain..."
                                        value={med.note}
                                        onChange={(e) => updateMedication(index, 'note', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => removeMedication(index)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                         </div>
                         
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Additional Advice</label>
                            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="e.g. Drink plenty of water, rest for 2 days..." />
                         </div>

                         <div className="pt-4 flex justify-end gap-4 border-t border-slate-100 mt-4">
                            <button className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Save Draft</button>
                            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2">
                              <CheckCircle size={18} /> Sign & Issue
                            </button>
                         </div>
                       </>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-300 mt-20">
                          <QrCode size={64} className="mb-4 opacity-50" />
                          <p className="font-medium">Scan patient to enable prescription pad</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeMode === 'EMERGENCY' && (
           <div className="max-w-4xl mx-auto mt-10">
             
             {emergencyStep === 'SELECTION' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <button 
                     onClick={() => setEmergencyStep('DATA')}
                     className="group relative h-80 bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-red-500 transition-all duration-300"
                   >
                      <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                         <Fingerprint size={48} className="text-red-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Biometric Scan</h3>
                      <p className="text-slate-400 text-center text-sm">Use fingerprint for unconscious patients.</p>
                   </button>

                   <button 
                     onClick={() => setEmergencyStep('DATA')}
                     className="group relative h-80 bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-red-500 transition-all duration-300"
                   >
                      <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                         <QrCode size={48} className="text-red-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Emergency QR</h3>
                      <p className="text-slate-400 text-center text-sm">Scan Emergency Token or Digital ID.</p>
                   </button>
                </div>
             )}

             {emergencyStep === 'DATA' && (
                <div className="bg-slate-900 border border-red-900/50 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20">
                   <div className="bg-red-600 p-6 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <span className="text-2xl font-black text-white">O+</span>
                         </div>
                         <div>
                            <h2 className="text-2xl font-bold text-white">{MOCK_PATIENT.name}</h2>
                            <p className="text-red-100 opacity-90">DOB: 12/05/1980 • MALE</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 text-white text-xs font-bold mb-1 backdrop-blur-sm">
                            <AlertTriangle size={12} /> CRITICAL ACCESS
                         </div>
                         <p className="text-xs text-red-200">Verified via Biometrics</p>
                      </div>
                   </div>

                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Critical Allergies</h3>
                         <div className="flex flex-wrap gap-3">
                            {MOCK_PATIENT.allergies.map(a => (
                               <div key={a} className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold">
                                  <AlertTriangle size={18} /> {a}
                               </div>
                            ))}
                         </div>
                      </div>

                      <div>
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Known Conditions</h3>
                         <div className="space-y-2">
                            {MOCK_PATIENT.conditions.map(c => (
                               <div key={c} className="px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-medium border border-slate-700">
                                  {c}
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

<div className="col-span-1 md:col-span-2 mt-4">
  <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-xl flex items-start gap-4">
    <div className="bg-red-500/20 p-2 rounded-lg">
      <Sparkles className="text-red-400 h-5 w-5" />
    </div>
    <div className="flex-1">
      <h3 className="text-red-200 font-bold text-sm mb-1">Gemini Rapid Risk Analysis</h3>
      <p className="text-red-100/70 text-sm leading-relaxed">
        Patient is diabetic. High risk of hypoglycemic shock if insulin was administered recently without food. 
        <strong>Avoid corticosteroids</strong> due to potential glucose spike.
      </p>
    </div>
  </div>
</div>
                   
                   <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-center">
                      <button className="w-full max-w-md py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105">
                         Confirm Patient Stabilization
                      </button>
                   </div>
                </div>
             )}
           </div>
        )}

      </main>
    </div>
  );
}