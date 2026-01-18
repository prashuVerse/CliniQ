import Link from "next/link";
import { AlertTriangle, ChevronLeft, Phone, Droplets, Activity, FileWarning, Clock } from "lucide-react";

// Mock data strictly for Emergency View 
const EMERGENCY_DATA = {
  bloodType: "O+",
  allergies: ["Penicillin", "Shellfish"],
  conditions: ["Type 2 Diabetes", "Hypertension"],
  currentMeds: ["Metformin 500mg", "Lisinopril 10mg"],
  contact: "+91 98765 43210 (Wife)"
};

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      {/* Mobile-like Container */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Emergency Header - Red Alert Style */}
        <div className="bg-red-600 text-white p-6 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-red-500 opacity-20">
             <AlertTriangle size={120} />
           </div>
           
           <div className="relative z-10">
             <div className="flex justify-between items-start">
               <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm inline-block mb-4">
                 <Activity size={24} />
               </div>
               <Link href="/dashboard" className="text-xs bg-black/20 hover:bg-black/30 px-3 py-1 rounded-full transition">
                 Exit Demo
               </Link>
             </div>
             <h1 className="text-2xl font-bold">Emergency Context</h1>
             <p className="text-red-100 text-sm opacity-90">ID: P-882-991 • Verified Access</p>
           </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Critical Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Blood Type</span>
              <span className="text-4xl font-black text-slate-800">{EMERGENCY_DATA.bloodType}</span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conditions</span>
              <div className="flex flex-wrap gap-1">
                {EMERGENCY_DATA.conditions.map(c => (
                  <span key={c} className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">{c}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Critical Allergies */}
          <div className="bg-white border-l-4 border-red-500 shadow-sm rounded-r-xl p-4">
            <h2 className="text-red-600 font-bold text-sm uppercase flex items-center gap-2 mb-2">
              <AlertTriangle size={16} /> Severe Allergies
            </h2>
            <div className="flex flex-wrap gap-2">
              {EMERGENCY_DATA.allergies.map(a => (
                <span key={a} className="text-lg font-bold text-slate-900">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Meds & Contact */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Current Medications</h3>
              <ul className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                {EMERGENCY_DATA.currentMeds.map(m => (
                  <li key={m} className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {m}
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition">
              <Phone size={20} /> Call Emergency Contact
            </button>
          </div>
          
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Clock size={12} /> Last Synced: Today, 09:30 AM
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}