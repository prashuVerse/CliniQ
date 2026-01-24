"use client";
import { useState } from "react"; //manages componest state
import { useRouter } from "next/navigation"; //used to navigate programmatically
import { 
  User, Stethoscope, ArrowRight, ShieldCheck, 
  Building2, Phone, Fingerprint, CreditCard, Lock, Mail, Loader 
} from "lucide-react"; //like a library of icons
import Link from "next/link";// for linking between pages faster than <a href
import { patientLogin, saveAuthToken, saveUserInfo } from "@/lib/api";

export default function LoginPage() { //export default mean it treat login page as a component
  const router = useRouter(); //give u access to next.js navigation methods

  const [activeTab, setActiveTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");//state to track which tab is active either patient or doctor
  
  // --- PATIENT STATE ---
  const [patientStep, setPatientStep] = useState<"DETAILS" | "OTP">("DETAILS");
  //patientStep->current ui state
  //setPatientStep->function to update the state
  //patientStep can be either "DETAILS" or "OTP" initially set to "DETAILS"
  //when patient enter send otp then patientStep set to otp and show otp page"

  const [patientData, setPatientData] = useState({ phone: "", aadhaar: "", abha: "" });
  //store all patient input data like phone,aadhaar,abha in one object

  const [otp, setOtp] = useState(""); //store otp enter by user

  const [isLoading, setIsLoading] = useState(false); //track loading state for API calls
  const [error, setError] = useState(""); //store any error messages
  const [doctorMode, setDoctorMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  //now if actiive tab is doctor then doctorMode will decide whether to show sign in form or sign up form
  //doctorMode can be either "SIGNIN" or "SIGNUP" initially set to "SIGNIN"
  //if docror mode is set to signup then we show the signup page
  
  // --- HANDLERS ---

  const handlePatientLogin = async (e: React.FormEvent) => { //function execute when patient form is submitted
    e.preventDefault();
    setError("");

    if (patientStep === "DETAILS") {
      //if patientStep is details then we move to otp step
      setPatientStep("OTP"); //set the patient step to otp
    } else {
      // Call the backend API for patient login
      setIsLoading(true);
      try {
        const response = await patientLogin({ abhaid: patientData.abha });
        
        if (response.success && response.data) {
          // Save auth token and user info
          saveAuthToken(response.data.token);
          saveUserInfo(response.data.user);
          
          // Redirect to Patient Dashboard
          router.push("/dashboard");
        } else {
          setError(response.error || "Login failed. Please try again.");
        }
      } catch (err) {
        setError("An error occurred during login. Please try again.");
      } finally {
        setIsLoading(false);
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
                  {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                     {isLoading ? <><Loader className="animate-spin" size={16} /> Logging in...</> : "Get OTP"}
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
                   
                   {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-left">{error}</div>}
                   <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                     {isLoading ? <><Loader className="animate-spin" size={16} /> Verifying...</> : "Verify & Login"}
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