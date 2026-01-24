"use client";
import { useState, useEffect } from "react";
import { AppProvider, useAppContext, type MedicalRecord, type Reminder } from "../../lib/store";
import { containerVariants, itemVariants } from "../../lib/animation";
import { 
  Sparkles, Activity, Clock, Plus, Trash2, Bell, BellOff, 
  User, UploadCloud, FileText, AlertTriangle, Eye, EyeOff, 
  QrCode, X, Share2, ShieldCheck, CalendarDays, RefreshCw, CheckCircle2, File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeMedicalRecords, type MedicalRecordAnalysis } from "../../lib/gemini";

// --- WRAPPER COMPONENT ---
export default function DashboardPage() {
  return (
    <AppProvider>
      <PatientDashboardContent />
    </AppProvider>
  );
}

// --- MAIN CONTENT ---
function PatientDashboardContent() {
  const { 
    patientName, records, addRecord, allergies, conditions, 
    reminders, addReminder, toggleReminder, deleteReminder 
  } = useAppContext();

  // State Management
  const [isUploading, setIsUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedTime, setNewMedTime] = useState("");

  // Gemini Analysis State
  const [showAIAnalysis, setShowAIAnalysis] = useState(false); // Controls AI Analysis Visibility
  const [showTimeline, setShowTimeline] = useState(false); // Controls Timeline Visibility
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<MedicalRecordAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Timeline Data State (Populated ONLY by AI)
  const [timelineData, setTimelineData] = useState<MedicalRecord[]>([]);

  // --- LOGIC: SIMULATE UPLOAD ---
  const handleFileUpload = () => {
    if (isUploading) return;
    setIsUploading(true);

    setTimeout(() => {
      // Just adding a raw file record now, NOT a detailed timeline entry yet
      const newRecord: MedicalRecord = { 
        id: Math.random().toString(),
        type: "Lab Report",
        date: new Date().toISOString().split('T')[0],
        title: "Lab_Report_082995.pdf", // Filename style
        doctor: "Uploaded by Patient",
        summary: "", // Empty summary initially
      };
      addRecord(newRecord);
      setIsUploading(false);
    }, 2000);
  };

 // --- LOGIC: GEMINI ANALYSIS & TIMELINE GENERATION ---
  const handleAnalyzeRecords = async () => {
    if (records.length === 0) {
        setAnalysisError("Please upload documents first.");
        return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      // 1. Simulate API Call processing the "Raw Files"
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Build timeline compatible with your UI (MedicalRecord[])
      // The UI expects properties like .title, .doctor, .date, .summary
      const enrichedTimeline: MedicalRecord[] = records.map((record) => ({
        ...record,
        // Simulate AI filling in a missing summary if it's empty
        summary: record.summary || "AI Analysis: Clinical correlation required. Vitals indicate stable trend.", 
      }));

      // ---------------------------------------------
      // 🛑 THE FIX: Update the state variables here
      // ---------------------------------------------
      setTimelineData(enrichedTimeline); 
      setShowTimeline(true); 
      // ---------------------------------------------

      // 3. Generate summary for the Analysis Box (Optional, for the JSON view)
      const recordSummary = `Patient has ${records.length} medical record(s) on file.`;

      // 4. Mock AI Response
      const demoAnalysis = {
        summary: recordSummary,
        chronic_conditions: conditions.length > 0 ? conditions : ["Not specified"],
        surgeries: [],
        risk_flags: [],
        timeline: [], // This is for the internal analysis object
        allergies: allergies.length > 0 ? allergies : ["None documented"],
        recent_hospitalizations: 0,
        duplicates_detected: [],
        warnings: [],
        explanation: `Analysis based on ${records.length} uploaded medical record(s).`
      };
      
      setGeminiAnalysis(demoAnalysis);
      if (!showAIAnalysis) setShowAIAnalysis(true);

    } catch (err) {
      console.error(err);
      setAnalysisError("Unable to analyze records at this moment.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // --- LOGIC: ADD REMINDER ---
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedTime) return;

    const newReminder: Reminder = {
      id: Math.random().toString(),
      medicine: newMedName,
      time: newMedTime,
      days: ["Daily"],
      active: true
    };

    addReminder(newReminder);
    setNewMedName("");
    setNewMedTime("");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none"></div>

      {/* --- TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3 font-bold text-xl text-slate-800 tracking-tight">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="text-white h-5 w-5" />
          </div>
          <div>
            VitalSync <span className="text-slate-400 font-medium text-sm ml-1 hidden sm:inline-block">| Patient Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowQR(true)}
             className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
           >
             <QrCode size={18} /> <span className="hidden sm:inline">My Patient QR</span>
           </button>

           <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900">{patientName}</p>
              <p className="text-xs text-slate-500 font-mono">ID: Patient-9921</p>
           </div>
           <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-slate-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-white shadow-sm ring-1 ring-slate-100">
              {patientName.charAt(0)}
           </div>
        </div>
      </nav>

      {/* --- QR MODAL --- */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
                <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-1 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20} /></button>
                <div className="inline-flex p-3 bg-white/10 rounded-full mb-3 backdrop-blur-md border border-white/20"><ShieldCheck size={32} /></div>
                <h2 className="text-xl font-bold">Patient Health Card</h2>
                <p className="text-blue-100 text-sm opacity-90">National Health Authority</p>
              </div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm mb-6"><QrCode size={180} className="text-slate-900" /></div>
                <h3 className="text-2xl font-bold text-slate-800">{patientName}</h3>
                <p className="text-slate-500 font-mono mt-1 mb-6 text-lg">91-2345-6789-12</p>
                <button className="w-full py-3 flex items-center justify-center gap-2 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition"><Share2 size={18} /> Share Card</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DASHBOARD GRID --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
      >
        
        {/* ================= COLUMN 1: UPLOAD & DOCUMENTS ================= */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
          
          {/* UPLOAD CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500"></div>
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UploadCloud className="text-blue-600" size={20} /> Upload Records
                </h2>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={!isUploading ? handleFileUpload : undefined}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${isUploading ? 'bg-blue-50/50 border-blue-400' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'}`}
                >
                  <AnimatePresence mode="wait">
                    {isUploading ? (
                      <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="relative h-12 w-12 mx-auto">
                           <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                           <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                           <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Securely Recording...</p>
                          <p className="text-xs text-blue-600 font-medium">Encrypting File</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-blue-100/50 p-4 rounded-full inline-block mb-3 group-hover:bg-blue-100 transition-colors"><FileText className="h-6 w-6 text-blue-600" /></div>
                        <p className="text-sm font-bold text-slate-700">Select PDF / Image</p>
                        <p className="text-xs text-slate-500 mt-1">Smart Scan Enabled</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
          </div>

          {/* RECORDED FILES LIST (Simple List - No Timeline) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={14} /> Recorded Documents
            </h2>
            <div className="space-y-2">
               {records.length === 0 ? (
                 <p className="text-sm text-slate-400 italic">No documents uploaded yet.</p>
               ) : (
                 records.map((rec, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="bg-white p-2 rounded-lg border border-slate-100 text-blue-500">
                        <File size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{rec.title || "Untitled Document"}</p>
                        <p className="text-[10px] text-slate-400">{rec.date} • {rec.type}</p>
                      </div>
                      <CheckCircle2 size={16} className="text-green-500" />
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* HEALTH PROFILE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={14} /> Health Profile
            </h2>
            <div className="space-y-6">
               <div>
                  <span className="text-xs font-bold text-slate-500 mb-3 block">Chronic Conditions</span>
                  <div className="flex flex-col gap-3">
                    {conditions.map((c, i) => (
                      <div key={i} className="flex flex-col items-start bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-bold shadow-sm mb-1">{c}</span>
                        <div className="flex items-center gap-1.5 ml-1 text-[10px] text-slate-400 font-medium"><CalendarDays size={10} /><span>Diagnosed: 2021</span></div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="h-px bg-slate-100"></div>
               <div>
                  <span className="text-xs font-bold text-slate-500 mb-3 block">Known Allergies</span>
                  <div className="flex flex-col gap-3">
                    {allergies.map((a, i) => (
                      <div key={i} className="flex flex-col items-start bg-red-50/50 p-2 rounded-xl border border-red-100">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-bold shadow-sm mb-1">{a}</span>
                        <div className="flex items-center gap-1.5 ml-1 text-[10px] text-slate-400 font-medium"><CalendarDays size={10} /><span>Recorded: 2023</span></div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* ================= COLUMN 2: GEMINI TIMELINE (5 Cols) ================= */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
           
           {/* AI GENERATOR CARD */}
           <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-1 rounded-3xl shadow-xl shadow-purple-200">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-[20px] text-white">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg"><Sparkles size={20} className="text-yellow-300" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Timeline Generator</h2>
                      <p className="text-xs text-purple-100 opacity-80">Transform {records.length} raw files into a clinical timeline</p>
                    </div>
                 </div>

                 {analysisError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 text-white text-xs rounded-xl flex items-center gap-2">
                       <AlertTriangle size={14} /> {analysisError}
                    </div>
                 )}

                 <button
                    onClick={handleAnalyzeRecords}
                    className="w-full py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={analysisLoading || records.length === 0}
                 >
                    {analysisLoading ? <><span className="animate-spin">⏳</span> Processing Records...</> : showTimeline ? <><RefreshCw size={16}/> Refresh Timeline</> : "Generate Timeline"}
                 </button>
              </div>
           </div>

           {/* TIMELINE AREA - ONLY SHOWS IF GENERATED */}
           <div className="min-h-[400px]">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Activity size={20} /></div>
                  Medical Timeline
               </h2>
               {showTimeline && (
                 <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                   <Sparkles size={10} /> AI Generated
                 </span>
               )}
             </div>

             <div className="relative pl-8 border-l-2 border-slate-200/60 ml-3 space-y-8 pb-12">
               <AnimatePresence mode="popLayout">
                 {/* EMPTY STATE */}
                 {!showTimeline && (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute top-0 left-8 right-0 p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center">
                      <div className="bg-slate-100 p-4 rounded-full inline-block mb-3"><Sparkles className="text-slate-400" /></div>
                      <h3 className="font-bold text-slate-600">Timeline Empty</h3>
                      <p className="text-sm text-slate-400 mt-1">Upload documents and click "Generate Timeline" to visualize your medical history.</p>
                   </motion.div>
                 )}

                 {/* GENERATED TIMELINE CARDS */}
                 {showTimeline && timelineData.map((record) => (
                   <motion.div 
                     layout
                     key={record.id}
                     initial={{ opacity: 0, x: -20, scale: 0.9 }}
                     animate={{ opacity: 1, x: 0, scale: 1 }}
                     transition={{ duration: 0.5 }}
                     className="relative group"
                   >
                     <div className="absolute -left-[39px] top-4 h-5 w-5 rounded-full border-[3px] border-slate-50 bg-blue-500 shadow-sm z-10 group-hover:scale-125 transition-transform duration-300"></div>
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{record.date}</span>
                              <h3 className="font-bold text-slate-800 text-base mt-1 group-hover:text-blue-600 transition-colors">{record.title}</h3>
                           </div>
                           <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border bg-purple-50 text-purple-700 border-purple-100">
                             AI Extracted
                           </span>
                        </div>
                        
                        {/* Summary Block */}
                        <div className="mt-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 relative overflow-hidden group-hover:border-blue-200 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
                            <div className="flex gap-3">
                              <Sparkles className="text-purple-500 shrink-0 mt-0.5" size={16} />
                              <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">AI Extracted Details</p>
                                  <p className="text-sm text-slate-700 leading-7 font-medium">{record.summary}</p>
                              </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                           <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center"><User size={10} /></div>
                           {record.doctor}
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           </div>
        </motion.div>

        {/* ================= COLUMN 3: MEDICINE CABINET ================= */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Clock size={20} /></div>
              Medicine Cabinet
           </h2>
           <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
             <div className="p-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Set New Reminder</h3>
             </div>
             <form onSubmit={handleAddReminder} className="p-4 space-y-3">
                <input 
                  type="text" 
                  placeholder="Medicine Name (e.g. Metformin)" 
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-medium placeholder:font-normal"
                />
                <div className="flex gap-2">
                   <div className="relative flex-1">
                     <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                     <input 
                       type="time" 
                       value={newMedTime}
                       onChange={(e) => setNewMedTime(e.target.value)}
                       className="w-full text-sm pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-medium"
                     />
                   </div>
                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center aspect-square"><Plus size={20} /></motion.button>
                </div>
             </form>
           </div>

           <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Schedules</h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{reminders.filter(r => r.active).length} Active</span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence initial={false} mode="popLayout">
                  {reminders.length === 0 && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                       <BellOff className="mx-auto text-slate-300 mb-2" />
                       <p className="text-slate-400 text-sm font-medium">No active reminders</p>
                    </motion.div>
                  )}
                  {reminders.map(reminder => (
                     <motion.div 
                       layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} key={reminder.id} 
                       className={`group p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${reminder.active ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                     >
                        {reminder.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div 
                                onClick={() => toggleReminder(reminder.id)}
                                className={`cursor-pointer h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${reminder.active ? 'bg-purple-50 text-purple-600' : 'bg-slate-200 text-slate-400'}`}
                              >
                                 {reminder.active ? <Bell size={18} className="fill-current" /> : <BellOff size={18} />}
                              </div>
                              <div>
                                 <p className={`font-bold text-sm ${reminder.active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{reminder.medicine}</p>
                                 <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                                    <Clock size={12} /><span>{reminder.time}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span><span className="text-slate-400">{reminder.days.join(", ")}</span>
                                 </div>
                              </div>
                           </div>
                           <motion.button whileHover={{ scale: 1.1, color: "#EF4444" }} whileTap={{ scale: 0.9 }} onClick={() => deleteReminder(reminder.id)} className="text-slate-300 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></motion.button>
                        </div>
                     </motion.div>
                  ))}
                </AnimatePresence>
              </div>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}