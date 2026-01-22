"use client";
import { useState } from "react";
import { 
  Activity, Search, QrCode, Fingerprint, Siren, 
  FileText, CheckCircle, AlertTriangle, X, ChevronLeft, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  // ... existing imports ...
  Plus, Trash2 
} from "lucide-react";

// --- MOCK DATA FOR SCANNED PATIENT ---
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

  // ... existing state ...

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

  const handleScanPatient = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setPatientScanned(true);
    }, 2000); // 2 second scan simulation
  };

  const handleGeminiSummary = () => {
    setGeminiSummary("Analyzing...");
    setTimeout(() => {
      setGeminiSummary("Patient has a history of Type 2 Diabetes (5 years). Recent ECG shows normal sinus rhythm. Adherence to Metformin is consistent. Warning: Potential interaction with new prescription if prescribing Beta Blockers.");
    }, 1500);
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
      
      {/* --- TOP NAVIGATION --- */}
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

        {/* THE MODE SWITCH BUTTON */}
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
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* =========================================================
            MODE 1: CLINICAL DASHBOARD (Standard View)
           ========================================================= */}
        {activeMode === 'CLINICAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: SCANNER & PATIENT INFO */}
            <div className="lg:col-span-4 space-y-6">
               {/* 1. Scanner Card */}
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
                            <h2 className="text-2xl font-bold text-slate-900">{MOCK_PATIENT.name}</h2>
                            <p className="text-slate-500 text-sm">Age: {MOCK_PATIENT.age} • {MOCK_PATIENT.id}</p>
                          </div>
                          <button onClick={() => setPatientScanned(false)} className="p-2 hover:bg-slate-100 rounded-full">
                            <X size={20} className="text-slate-400" />
                          </button>
                       </div>

                       <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                             <div className="text-xs font-bold text-blue-600 uppercase mb-1">Last Visit</div>
                             <div className="text-sm font-medium text-slate-700">{MOCK_PATIENT.recentVisit}</div>
                          </div>

                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase mb-2">Conditions</p>
                             <div className="flex flex-wrap gap-2">
                               {MOCK_PATIENT.conditions.map(c => (
                                 <span key={c} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{c}</span>
                               ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>

               {/* 2. Gemini Assistant (Only appears after scan) */}
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

            {/* RIGHT: PRESCRIPTION PAD */}
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
                         {/* 1. Diagnosis Section */}
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clinical Diagnosis</label>
                            <textarea 
                              className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm font-medium" 
                              placeholder="e.g. Acute Viral Fever with mild dehydration..."
                            ></textarea>
                         </div>

                         {/* 2. Dynamic Medicine Table */}
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
                                  {/* Number */}
                                  <div className="pt-3 text-xs font-bold text-slate-300 w-4">{index + 1}.</div>
                                  
                                  <div className="flex-1 grid grid-cols-12 gap-2">
                                    {/* Medicine Name */}
                                    <div className="col-span-4">
                                      <input 
                                        type="text" 
                                        placeholder="Medicine Name"
                                        value={med.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold placeholder:font-normal focus:outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    {/* Dosage (e.g. 1-0-1) */}
                                    <div className="col-span-2">
                                      <input 
                                        type="text" 
                                        placeholder="1-0-1"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    {/* Timing Dropdown */}
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

                                    {/* Note / Problem */}
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

                                  {/* Delete Button */}
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
                         
                         {/* 3. Footer Actions */}
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
                       /* EMPTY STATE (When no patient scanned) */
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

        {/* =========================================================
            MODE 2: EMERGENCY PROTOCOL (Separate View)
           ========================================================= */}
        {activeMode === 'EMERGENCY' && (
           <div className="max-w-4xl mx-auto mt-10">
             
             {/* STEP 1: SELECTION */}
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

             {/* STEP 2: CRITICAL DATA VIEW */}
             {emergencyStep === 'DATA' && (
                <div className="bg-slate-900 border border-red-900/50 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20">
                   {/* Emergency Header */}
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

                   {/* --- ADD THIS INSIDE THE EMERGENCY DATA GRID --- */}

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