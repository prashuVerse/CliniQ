"use client";
import { useState } from "react";
import { AppProvider, useAppContext, type MedicalRecord, type Reminder } from "../../lib/store";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/api";
import { UploadCloud, FileText, Sparkles, Activity, Clock, Plus, Trash2, Bell, BellOff, Calendar, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


// Wrapper
export default function DashboardPage() { //treat dashboard page as a component
  return (
    <AppProvider>
      <PatientDashboardContent />
    </AppProvider>
  );
}

function PatientDashboardContent() {
  const router = useRouter();
  const { 
    patientName, records, addRecord, allergies, conditions, 
    reminders, addReminder, toggleReminder, deleteReminder 
  } = useAppContext();

  const handleSignOut = () => {
    clearAuth();
    router.push("/auth/login");
  };
 // the app context contiains the patient data so we are taking the data from there and storing in these variables

  const [isUploading, setIsUploading] = useState(false);
  //weather file is being uploaded or not
  
  // Reminder Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedTime, setNewMedTime] = useState("");
  //state to store new medicine name and time for reminder

  // SIMULATE GEMINI UPLOAD
  const handleFileUpload = () => {
    //when user click on upload file
    setIsUploading(true); //set isUploading to true and it show the spinning animation

    setTimeout(() => {
      const newRecord: MedicalRecord = { 
        //created a new medical record, typescript enfroce the structure via MedicalRecord type
        id: Math.random().toString(), // create temporory uniwue id
        type: "Discharge Summary",
        date: new Date().toISOString().split('T')[0],
        title: "Gemini Analysis Result",
        doctor: "AI Extracted",
        summary: "New report analyzed. Detected prescription for Amoxicillin 500mg. Advice: Complete full course.",
      };
      addRecord(newRecord); //add the new record to the context using addRecord function
      setIsUploading(false); //set isUploading to false to stop the animation
    }, 2500);
  };

  // HANDLE ADD REMINDER
  const handleAddReminder = (e: React.FormEvent) => { //e is the form submit event
    e.preventDefault();
    if (!newMedName || !newMedTime) return; //if medicine or time is empty then return

    const newReminder: Reminder = { //create a new reminder object, typescript enfroce the structure via MedicalRecord type
      id: Math.random().toString(),
      medicine: newMedName,
      time: newMedTime,
      days: ["Daily"], // Default for demo
      active: true
    };

    addReminder(newReminder); //add the new reminder to the context using addReminder function
    setNewMedName("");
    setNewMedTime("");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Activity className="text-white h-5 w-5" />
          </div>
          VitalSync <span className="text-slate-400 font-normal text-sm ml-2">Patient Portal</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900">{patientName}</p>
              <p className="text-xs text-slate-500">ID: ABHA-9921</p>
           </div>
           <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {patientName.charAt(0)}
           </div>
           <button
             onClick={handleSignOut}
             className="ml-4 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
             title="Sign Out"
           >
             <LogOut size={20} />
           </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <UploadCloud className="text-blue-500" size={20} /> Upload Records
             </h2>
             
             <div 
               onClick={!isUploading ? handleFileUpload : undefined}
               className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isUploading ? 'bg-blue-50/50 border-blue-400' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
             >
               {isUploading ? (
                 <div className="space-y-3">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                   <p className="text-xs font-bold text-blue-700 animate-pulse">Gemini analyzing...</p>
                 </div>
               ) : (
                 <>
                   <FileText className="h-8 w-8 text-slate-400 mb-2" />
                   <p className="text-xs font-medium text-slate-600">Click to Scan/Upload</p>
                 </>
               )}
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Health Profile</h2>
            
            <div className="space-y-4">
               <div>
                  <span className="text-xs text-slate-500 font-semibold">Chronic Conditions</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {conditions.map(c => (
                      <span key={c} className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold border border-orange-100">
                        {c}
                      </span>
                    ))}
                  </div>
               </div>
               <div>
                  <span className="text-xs text-slate-500 font-semibold">Allergies</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allergies.map(a => (
                      <span key={a} className="bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-100">
                        {a}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Activity className="text-blue-600" /> Medical Timeline
           </h2>

           <div className="space-y-6 relative border-l-2 border-slate-200 ml-3 pl-8 pb-10">
             <AnimatePresence>
               {records.map((record) => (
                 <motion.div 
                   key={record.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="relative group"
                 >
                   <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-slate-50 bg-blue-500 shadow-sm"></div>
                   
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{record.date}</span>
                            <h3 className="font-bold text-slate-800">{record.title}</h3>
                         </div>
                         <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                           {record.type}
                         </span>
                      </div>
                      
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-3 relative">
                         <Sparkles className="absolute top-2 right-2 text-blue-400 w-3 h-3" />
                         <p className="text-sm text-slate-700 leading-relaxed">
                           <span className="font-semibold text-blue-900">Gemini Summary:</span> {record.summary}
                         </p>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Source: {record.doctor}</p>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <Clock className="text-purple-600" /> Medicine Cabinet
              </h2>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Set New Reminder</h3>
              <form onSubmit={handleAddReminder} className="space-y-3">
                 <div>
                    <input 
                      type="text" 
                      placeholder="Medicine Name (e.g. Dolo 650)" 
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="time" 
                      value={newMedTime}
                      onChange={(e) => setNewMedTime(e.target.value)}
                      className="flex-1 text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                 </div>
              </form>
           </div>

           <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Active Schedules</h3>
              
              {reminders.length === 0 && (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                   <p className="text-slate-400 text-sm">No active reminders.</p>
                </div>
              )}

              {reminders.map(reminder => (
                 <div key={reminder.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${reminder.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${reminder.active ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-400'}`}>
                          {reminder.active ? <Bell size={18} /> : <BellOff size={18} />}
                       </div>
                       <div>
                          <p className={`font-bold text-sm ${reminder.active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{reminder.medicine}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                             <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{reminder.time}</span>
                             <span>{reminder.days.join(", ")}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => toggleReminder(reminder.id)}
                         className="text-xs font-medium text-slate-400 hover:text-purple-600 px-2 py-1"
                       >
                         {reminder.active ? "Mute" : "Unmute"}
                       </button>
                       <button 
                         onClick={() => deleteReminder(reminder.id)}
                         className="text-slate-300 hover:text-red-500 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
              ))}
           </div>

        </div>
      </div>
    </div>
  );
}