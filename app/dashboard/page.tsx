"use client";
import { useState } from "react";
import Link from "next/link";
// Relative import pointing to app/lib/store.tsx
import { AppProvider, useAppContext, type MedicalRecord } from "../../lib/store";
import { UploadCloud, FileText, CheckCircle, Lock, Siren, Activity, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Wrapper to provide context
export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

function DashboardContent() {
  const { records, addRecord, allergies, conditions } = useAppContext();
  
  const [isDoctorView, setIsDoctorView] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // SIMULATE GEMINI PROCESSING
   const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      // Create new record using the MedicalRecord type
      const newRecord: MedicalRecord = { 
        id: Math.random().toString(),
        type: "Discharge Summary",
        date: new Date().toISOString().split('T')[0],
        title: "Emergency Care - Appollo Hospital",
        doctor: "Dr. K. Verma",
        summary: "Admitted for severe allergic reaction. Treated with Epinephrine. Observation for 24h recommended. New allergy identified: Peanuts.",
      };
      addRecord(newRecord);
      setIsUploading(false);
    }, 2500);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDoctorView ? "bg-slate-100" : "bg-slate-50"}`}>
      
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-50 border-b px-6 py-3 flex justify-between items-center transition-colors ${isDoctorView ? "bg-slate-900 border-slate-800 text-white" : "bg-white/80 backdrop-blur-md border-slate-200 text-slate-800"}`}>
        <div className="flex items-center gap-2 font-bold text-lg">
          <Activity className={isDoctorView ? "text-green-400" : "text-blue-600"} /> VitalSync
          {isDoctorView && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/30">CLINICIAN MODE</span>}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDoctorView(!isDoctorView)}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${isDoctorView ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isDoctorView ? "Exit Doctor View" : "View as Doctor"}
          </button>

          {!isDoctorView && (
            <Link href="/emergency">
              <button className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition">
                <Siren className="h-4 w-4" /> Emergency
              </button>
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Upload & Context */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* UPLOAD CARD (Hidden in Doctor View) */}
          {!isDoctorView && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UploadCloud className="text-blue-500" /> Add Record
              </h2>
              <div 
                onClick={!isUploading ? handleFileUpload : undefined}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isUploading ? 'bg-blue-50/50 border-blue-400' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 h-4 w-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-700">Gemini is analyzing...</p>
                      <p className="text-xs text-slate-500">Extracting diagnosis & medications</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="h-10 w-10 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
                    <p className="text-sm font-medium text-slate-700">Drop PDF / Image here</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* CLINICAL CONTEXT CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="text-orange-500" /> Clinical Context
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Chronic Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(c => (
                    <span key={c} className="bg-orange-50 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-orange-100 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Known Allergies</h3>
                <div className="flex flex-wrap gap-2">
                  {allergies.map(a => (
                    <span key={a} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                      <Siren className="h-3 w-3" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[600px]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Patient History</h2>
                <p className="text-slate-500 mt-1">AI-synthesized timeline from verified documents.</p>
              </div>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-10 pb-12">
              <AnimatePresence>
                {records.map((record, index) => (
                  <motion.div 
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative pl-8"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 ${index === 0 ? 'bg-blue-600 border-blue-100' : 'bg-slate-300 border-white'}`}></div>
                    
                    {/* Content */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                           <span className="text-xs font-bold tracking-wide text-slate-400 uppercase">{record.date}</span>
                           <h3 className="text-lg font-bold text-slate-800">{record.title}</h3>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {record.type}
                        </span>
                      </div>

                      {/* AI Summary Box */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed relative">
                        <Sparkles className="absolute top-3 right-3 text-blue-400 h-3 w-3" />
                        <p><span className="font-semibold text-slate-900">Summary:</span> {record.summary}</p>
                        <p className="mt-2 text-xs text-slate-400 font-medium">Dr. {record.doctor}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}