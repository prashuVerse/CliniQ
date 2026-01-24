"use client";

import { useState } from "react";
import { 
  Activity, Search, QrCode, Fingerprint, Siren, 
  FileText, CheckCircle, AlertTriangle, X, ChevronLeft, Sparkles, Loader,
  Plus, Trash2, Pill, Clock, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askViewRequest, getViewRequests, getUserInfo } from "@/lib/api";

// --- MOCK DATA ---
const MOCK_PATIENT = {
  name: "Rahul Deshmukh",
  age: 45,
  id: "ABHA-9921",
  blood: "O+",
  allergies: ["Penicillin", "Shellfish"],
  conditions: ["Type 2 Diabetes"],
  recentVisit: "10 Oct 2025 - Dr. Sharma (Cardiology)"
};

export default function DoctorDashboard() {
  const [activeMode, setActiveMode] = useState<"CLINICAL" | "EMERGENCY">("CLINICAL");

  // --- API STATE ---
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [patientAbhaId, setPatientAbhaId] = useState("");

  // --- DYNAMIC PRESCRIPTION STATE ---
  const [prescribedMeds, setPrescribedMeds] = useState([
    { name: "", dosage: "", timing: "After Food", note: "" }
  ]);

  // --- HANDLERS (Unchanged Logic) ---
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

  // Actions
  const handleRequestAccess = async () => {
    if (!patientAbhaId.trim()) {
      setRequestError("Please enter patient ABHA ID");
      return;
    }
    setIsLoadingRequest(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const userInfo = getUserInfo();
      const doctorId = userInfo?.user_id || "DR-8821"; 
      
      const response = await askViewRequest({
        requesterid: doctorId,
        targetid: patientAbhaId,
        scope: "medical_records"
      });

      if (response.success) {
        setRequestSuccess(`Access request sent to patient ${patientAbhaId}`);
        setPatientAbhaId("");
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

  const loadPendingRequests = async () => {
    try {
      const response = await getViewRequests();
      if (response.success && Array.isArray(response.data)) {
        setPendingRequests(response.data);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleScanPatient = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setPatientScanned(true);
    }, 2000); 
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
      setPatientScanned(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans ${activeMode === 'EMERGENCY' ? 'bg-slate-950 text-red-50' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- BACKGROUND TEXTURE --- */}
      <div className={`fixed inset-0 pointer-events-none opacity-20 ${activeMode === 'EMERGENCY' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 to-transparent' : 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 to-transparent'}`}></div>

      {/* --- TOP NAVIGATION --- */}
      <nav className={`sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b transition-all duration-500 backdrop-blur-xl ${activeMode === 'EMERGENCY' ? 'bg-slate-900/80 border-red-900/50' : 'bg-white/80 border-slate-200/60'}`}>
        <div className="flex items-center gap-4">
          <motion.div 
            layout
            className={`p-2.5 rounded-xl shadow-lg ${activeMode === 'EMERGENCY' ? 'bg-red-600 animate-pulse shadow-red-500/50' : 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-500/30'}`}
          >
             {activeMode === 'EMERGENCY' ? <Siren className="text-white h-6 w-6" /> : <Activity className="text-white h-6 w-6" />}
          </motion.div>
          <div>
            <h1 className={`font-bold text-xl tracking-tight ${activeMode === 'EMERGENCY' ? 'text-red-500' : 'text-slate-800'}`}>
              {activeMode === 'EMERGENCY' ? 'EMERGENCY PROTOCOL' : 'Dr. Arun Verma'}
            </h1>
            {activeMode === 'CLINICAL' && <p className="text-xs font-medium text-slate-500">Apollo Hospital, Pune • ID: DR-8821</p>}
          </div>
        </div>

        {/* MODE SWITCH BUTTON */}
        <button 
          onClick={toggleEmergency}
          className={`group px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
            activeMode === 'EMERGENCY' 
            ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
            : 'bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 shadow-red-100'
          }`}
        >
          {activeMode === 'EMERGENCY' ? (
             <><ChevronLeft size={18} /> Exit Emergency Mode</>
          ) : (
             <><Siren size={18} className="animate-pulse" /> ACTIVATE EMERGENCY</>
          )}
        </button>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto p-6 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ================= MODE 1: CLINICAL DASHBOARD ================= */}
          {activeMode === 'CLINICAL' && (
            <motion.div 
              key="clinical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* LEFT SIDEBAR: CONTEXT */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Patient Scanner / Info Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                   {!patientScanned ? (
                     <div className="p-8 py-12 text-center">
                        <div className="relative mx-auto w-56 h-56 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center mb-8 overflow-hidden group">
                           {isScanning && (
                             <>
                               <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                               <div className="absolute top-0 w-full h-1 bg-green-500 shadow-[0_0_30px_rgba(34,197,94,1)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                             </>
                           )}
                           <QrCode size={80} className={`text-slate-400 transition-colors ${isScanning ? 'text-slate-800' : ''}`} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">No Patient Selected</h2>
                        <p className="text-slate-500 text-sm mb-6">Scan a patient's ABHA QR code to begin consultation.</p>
                        <button 
                          onClick={handleScanPatient}
                          disabled={isScanning}
                          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait"
                        >
                          {isScanning ? <span className="flex items-center justify-center gap-2"><Loader className="animate-spin" size={18}/> Scanning...</span> : "Scan Patient QR"}
                        </button>
                     </div>
                   ) : (
                     /* SCANNED PATIENT VIEW */
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                           <div>
                             <h2 className="text-2xl font-bold text-slate-900 leading-tight">{MOCK_PATIENT.name}</h2>
                             <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs">{MOCK_PATIENT.id}</span>
                                <span>• {MOCK_PATIENT.age} Yrs</span>
                                <span className="font-bold text-red-500">• {MOCK_PATIENT.blood}</span>
                             </div>
                           </div>
                           <button onClick={() => setPatientScanned(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600">
                             <X size={20} />
                           </button>
                        </div>

                        <div className="p-6 space-y-6">
                           <div className="space-y-3">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={12}/> Medical Snapshot
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {MOCK_PATIENT.conditions.map(c => (
                                  <span key={c} className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-bold">{c}</span>
                                ))}
                                {MOCK_PATIENT.allergies.map(a => (
                                  <span key={a} className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <AlertCircle size={10} /> {a}
                                  </span>
                                ))}
                              </div>
                           </div>

                           <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                              <div className="text-xs font-bold text-blue-600 uppercase mb-1">Recent Visit</div>
                              <div className="text-sm font-medium text-slate-700">{MOCK_PATIENT.recentVisit}</div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                {/* 2. Request Access Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                     <Search size={16} className="text-blue-500" /> Request Record Access
                   </h3>
                   <div className="space-y-3">
                     <div className="relative">
                       <input 
                         type="text"
                         placeholder="e.g., name@abha"
                         value={patientAbhaId}
                         onChange={(e) => setPatientAbhaId(e.target.value)}
                         className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm font-medium transition-all"
                       />
                       <button 
                         onClick={handleRequestAccess}
                         disabled={isLoadingRequest}
                         className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                       >
                         {isLoadingRequest ? <Loader className="animate-spin" size={14} /> : "Send"}
                       </button>
                     </div>
                     
                     <AnimatePresence>
                       {requestError && (
                         <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                           <AlertCircle size={14} /> {requestError}
                         </motion.div>
                       )}
                       {requestSuccess && (
                         <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs rounded-lg flex items-center gap-2">
                           <CheckCircle size={14} /> {requestSuccess}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                </div>

                {/* 3. Gemini Assistant */}
                <AnimatePresence>
                  {patientScanned && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden group"
                    >
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                       <h3 className="font-bold text-sm mb-3 flex items-center gap-2 relative z-10">
                          <Sparkles size={16} className="text-indigo-200" /> AI Clinical Assistant
                       </h3>
                       
                       {!geminiSummary ? (
                          <button 
                            onClick={handleGeminiSummary}
                            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 rounded-xl text-sm font-medium transition backdrop-blur-sm relative z-10"
                          >
                            Analyze History & Interactions
                          </button>
                       ) : (
                          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-sm leading-relaxed bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-md relative z-10">
                             {geminiSummary}
                          </motion.div>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: PRESCRIPTION PAD */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 min-h-[700px] flex flex-col overflow-hidden relative">
                   {/* Pad Header */}
                   <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center backdrop-blur-md sticky top-0 z-20">
                      <h2 className="font-bold text-slate-800 flex items-center gap-2.5">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText size={18} /></div>
                        Digital Prescription
                      </h2>
                      <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-mono text-slate-400">
                        RX-{Math.floor(Math.random()*10000)}
                      </span>
                   </div>
                   
                   <div className="p-8 flex-1 overflow-y-auto">
                      {patientScanned ? (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                          
                          {/* 1. Diagnosis Section */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Clinical Diagnosis</label>
                             <textarea 
                               className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none resize-none text-sm font-medium transition-all" 
                               placeholder="Enter primary diagnosis and observations..."
                             ></textarea>
                          </div>

                          {/* 2. Medicine Table */}
                          <div className="space-y-4">
                             <div className="flex justify-between items-end pb-2 border-b border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                  <Pill size={14} /> Rx Medications
                                </label>
                                <button 
                                  onClick={addMedication}
                                  className="text-xs flex items-center gap-1.5 font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <Plus size={14} /> Add Drug
                                </button>
                             </div>

                             <div className="space-y-2">
                               <AnimatePresence>
                                 {prescribedMeds.map((med, index) => (
                                   <motion.div 
                                      key={index} 
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                      className="grid grid-cols-12 gap-3 items-start group bg-white hover:bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-200 transition-all duration-200"
                                   >
                                      {/* Number */}
                                      <div className="col-span-1 pt-3 text-xs font-bold text-slate-300 text-center">{index + 1}</div>
                                      
                                      {/* Fields */}
                                      <div className="col-span-10 grid grid-cols-12 gap-3">
                                         <div className="col-span-4">
                                            <input 
                                              type="text" 
                                              placeholder="Medicine Name"
                                              value={med.name}
                                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                              className="w-full p-2.5 bg-slate-100 border-none rounded-lg text-sm font-bold placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                         </div>
                                         <div className="col-span-2">
                                            <input 
                                              type="text" 
                                              placeholder="1-0-1"
                                              value={med.dosage}
                                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                              className="w-full p-2.5 bg-slate-100 border-none rounded-lg text-sm text-center font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                         </div>
                                         <div className="col-span-3">
                                            <div className="relative">
                                              <Clock size={14} className="absolute left-2.5 top-3 text-slate-400" />
                                              <select 
                                                value={med.timing}
                                                onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                                                className="w-full pl-8 p-2.5 bg-slate-100 border-none rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                              >
                                                <option>Before Food</option>
                                                <option>After Food</option>
                                                <option>Empty Stomach</option>
                                                <option>Before Sleep</option>
                                              </select>
                                            </div>
                                         </div>
                                         <div className="col-span-3">
                                            <input 
                                              type="text" 
                                              placeholder="Notes..."
                                              value={med.note}
                                              onChange={(e) => updateMedication(index, 'note', e.target.value)}
                                              className="w-full p-2.5 bg-slate-100 border-none rounded-lg text-xs text-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                         </div>
                                      </div>

                                      {/* Delete */}
                                      <div className="col-span-1 pt-1.5 flex justify-end">
                                         <button 
                                           onClick={() => removeMedication(index)}
                                           className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                         >
                                           <Trash2 size={16} />
                                         </button>
                                      </div>
                                   </motion.div>
                                 ))}
                               </AnimatePresence>
                             </div>
                          </div>
                          
                          {/* 3. Footer Actions */}
                          <div className="pt-6 border-t border-slate-100 space-y-4">
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Additional Advice</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium" placeholder="e.g. Drink plenty of water, rest for 2 days..." />
                             </div>

                             <div className="flex justify-end gap-4 pt-2">
                                <button className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors text-sm">Save Draft</button>
                                <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg shadow-blue-200 transition-all flex items-center gap-2 text-sm transform active:scale-95">
                                  <CheckCircle size={18} /> Sign & Issue
                                </button>
                             </div>
                          </div>

                        </motion.div>
                      ) : (
                        /* EMPTY STATE */
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 min-h-[400px]">
                           <div className="p-6 bg-slate-50 rounded-full mb-4 animate-in zoom-in duration-500">
                             <QrCode size={48} className="text-slate-400" />
                           </div>
                           <p className="font-medium text-slate-400">Scan patient QR to activate prescription pad</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= MODE 2: EMERGENCY PROTOCOL ================= */}
          {activeMode === 'EMERGENCY' && (
            <motion.div 
               key="emergency"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.4 }}
               className="max-w-4xl mx-auto mt-8"
            >
               {emergencyStep === 'SELECTION' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Biometric Option */}
                     <button 
                       onClick={() => setEmergencyStep('DATA')}
                       className="group relative h-72 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300"
                     >
                        <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-950/30 transition-all duration-300 shadow-inner">
                           <Fingerprint size={48} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Biometric Scan</h3>
                        <p className="text-slate-400 text-center text-sm">Quick access for unconscious patients via fingerprint.</p>
                     </button>

                     {/* QR Option */}
                     <button 
                       onClick={() => setEmergencyStep('DATA')}
                       className="group relative h-72 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300"
                     >
                        <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-950/30 transition-all duration-300 shadow-inner">
                           <QrCode size={48} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Emergency QR</h3>
                        <p className="text-slate-400 text-center text-sm">Scan Emergency Token or Wallet ID.</p>
                     </button>
                  </div>
               )}

               {emergencyStep === 'DATA' && (
                  <div className="bg-slate-900 border border-red-900/50 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 animate-in slide-in-from-bottom-8 duration-500">
                     
                     {/* Critical Header */}
                     <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="flex items-center gap-6 relative z-10">
                           <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                              <span className="text-3xl font-black text-white">O+</span>
                           </div>
                           <div>
                              <h2 className="text-3xl font-bold text-white tracking-tight">{MOCK_PATIENT.name}</h2>
                              <div className="flex items-center gap-3 mt-1 text-red-100 font-medium">
                                 <span>DOB: 12/05/1980</span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                 <span>MALE</span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                 <span>45 YRS</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right relative z-10">
                           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 text-white text-xs font-bold mb-2 backdrop-blur-md border border-white/10 animate-pulse">
                              <AlertTriangle size={14} /> CRITICAL ACCESS GRANTED
                           </div>
                           <p className="text-xs text-red-200 font-mono">ID: {MOCK_PATIENT.id}</p>
                        </div>
                     </div>

                     <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Allergies */}
                        <div>
                           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <AlertCircle size={14} /> Critical Allergies
                           </h3>
                           <div className="flex flex-wrap gap-3">
                              {MOCK_PATIENT.allergies.map(a => (
                                 <div key={a} className="flex items-center gap-3 px-5 py-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-400 font-bold shadow-lg shadow-red-900/10">
                                    <AlertTriangle size={18} /> {a}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Conditions */}
                        <div>
                           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Activity size={14} /> Known Conditions
                           </h3>
                           <div className="space-y-2">
                              {MOCK_PATIENT.conditions.map(c => (
                                 <div key={c} className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 font-medium">
                                    {c}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* GEMINI ANALYSIS (Full Width) */}
                        <div className="col-span-1 md:col-span-2 mt-2">
                           <div className="bg-gradient-to-r from-red-950/50 to-slate-900 border border-red-500/30 p-5 rounded-2xl flex items-start gap-5 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                              <div className="bg-red-500/20 p-3 rounded-xl">
                                 <Sparkles className="text-red-400 h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                 <h3 className="text-red-100 font-bold text-base mb-2">Gemini Rapid Risk Analysis</h3>
                                 <p className="text-red-200/80 text-sm leading-relaxed">
                                    Patient is diabetic. High risk of hypoglycemic shock if insulin was administered recently without food intake. 
                                    <strong className="text-white ml-1">Avoid corticosteroids</strong> due to potential glucose spike. Monitor vital signs every 15 mins.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     {/* Footer Action */}
                     <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-center">
                        <button className="w-full max-w-md py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-green-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3">
                           <CheckCircle size={24} /> Confirm Stabilization
                        </button>
                     </div>
                  </div>
               )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}