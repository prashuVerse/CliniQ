"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Stethoscope, ArrowRight, ShieldCheck, 
  Building2, Phone, Fingerprint, CreditCard, Lock, Mail 
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  
  // --- PATIENT STATE ---
  const [patientStep, setPatientStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [patientData, setPatientData] = useState({ phone: "", aadhaar: "", abha: "" });
  const [otp, setOtp] = useState("");

  // --- DOCTOR STATE ---
  const [doctorMode, setDoctorMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  
  // --- HANDLERS ---

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientStep === "DETAILS") {
      // Logic: In a real app, this sends an OTP to the phone number
      setPatientStep("OTP");
    } else {
      // Logic: Mock OTP verification
      if (otp === "1234") {
        router.push("/dashboard"); // Redirect to Patient Dashboard
      } else {
        alert("Invalid OTP! (Use 1234 for demo)");
      }
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: In a real app, this would verify credentials with backend
    router.push("/doctor/dashboard"); // Redirect to Doctor Dashboard
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      
      {/* HEADER LOGO */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-2xl font-bold text-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl">
             <Stethoscope className="text-white h-6 w-6" />
          </div>
          VitalSync
        </div>
        <p className="text-slate-500 text-sm mt-2">Secure Unified Health Interface</p>
      </div>

      {/* LOGIN CARD */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* TABS (Patient vs Doctor) */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab("PATIENT")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'PATIENT' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={18} /> Patient
          </button>
          <button 
            onClick={() => setActiveTab("DOCTOR")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'DOCTOR' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Stethoscope size={18} /> Doctor
          </button>
        </div>

        <div className="p-8">
          
          {/* ================= PATIENT FORM ================= */}
          {activeTab === 'PATIENT' && (
            <form onSubmit={handlePatientLogin} className="space-y-4">
              {patientStep === "DETAILS" ? (
                <>
                  <div className="space-y-4">
                     {/* Phone Input */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                        <div className="relative mt-1">
                           <Phone className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                           <input 
                             type="tel" 
                             required
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                             placeholder="+91 98765 43210"
                             onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                           />
                        </div>
                     </div>
                     {/* Aadhaar Input */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Aadhaar Number</label>
                        <div className="relative mt-1">
                           <Fingerprint className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                           <input 
                             type="text" 
                             required
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                             placeholder="1234 5678 9012"
                             onChange={(e) => setPatientData({...patientData, aadhaar: e.target.value})}
                           />
                        </div>
                     </div>
                     {/* ABHA Input */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">ABHA ID</label>
                        <div className="relative mt-1">
                           <CreditCard className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                           <input 
                             type="text" 
                             required
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                             placeholder="name@abha"
                             onChange={(e) => setPatientData({...patientData, abha: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                     Get OTP
                  </button>
                </>
              ) : (
                /* OTP VIEW */
                <div className="text-center space-y-6">
                   <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="text-blue-600 h-8 w-8" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-800">Enter Verification Code</h3>
                      <p className="text-slate-500 text-xs">Sent to +91 ******{patientData.phone.slice(-4)}</p>
                   </div>
                   
                   <input 
                     type="text" 
                     className="w-32 mx-auto text-center text-2xl font-bold tracking-widest py-2 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none bg-transparent"
                     placeholder="0000"
                     maxLength={4}
                     value={otp}
                     onChange={(e) => setOtp(e.target.value)}
                   />
                   
                   <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                     Verify & Login
                  </button>
                  <button type="button" onClick={() => setPatientStep("DETAILS")} className="text-xs text-slate-400 hover:text-slate-600 underline">
                     Wrong number? Go Back
                  </button>
                </div>
              )}
            </form>
          )}

          {/* ================= DOCTOR FORM ================= */}
          {activeTab === 'DOCTOR' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              
              {/* Toggle Sign In / Sign Up */}
              <div className="flex justify-center mb-6">
                 <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <button 
                      type="button"
                      onClick={() => setDoctorMode("SIGNIN")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${doctorMode === 'SIGNIN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                    >
                      Sign In
                    </button>
                    <button 
                       type="button"
                       onClick={() => setDoctorMode("SIGNUP")}
                       className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${doctorMode === 'SIGNUP' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                    >
                      Sign Up
                    </button>
                 </div>
              </div>

              {/* SIGN UP FIELDS (Only show if Sign Up is selected) */}
              {doctorMode === "SIGNUP" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="relative">
                       <User className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                       <input required type="text" placeholder="Dr. Name" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-green-500" />
                     </div>
                     <div className="relative">
                       <Phone className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                       <input required type="text" placeholder="Phone" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-green-500" />
                     </div>
                   </div>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                      <input required type="email" placeholder="Email Address" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-green-500" />
                   </div>
                   <div className="relative">
                      <Building2 className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                      <input required type="text" placeholder="Hospital Name" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-green-500" />
                   </div>
                </div>
              )}

              {/* COMMON FIELDS (ID & Password) */}
              <div className="space-y-3">
                 <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                    <input 
                      required
                      type="text" 
                      placeholder={doctorMode === "SIGNUP" ? "Hospital License ID" : "Doctor / Hospital ID"} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm font-bold text-slate-700"
                    />
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                    <input 
                      required
                      type="password" 
                      placeholder={doctorMode === "SIGNUP" ? "Create Password" : "Password"}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm font-bold text-slate-700"
                    />
                 </div>
              </div>

              <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-xl mt-2 hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                 {doctorMode === "SIGNIN" ? "Access Dashboard" : "Register Profile"} <ArrowRight size={16} />
              </button>
            </form>
          )}

        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 underline">← Back to Home</Link>
      </div>

    </div>
  );
}