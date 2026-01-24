"use client";
import { useState } from "react"; //manages componest state
import { useRouter } from "next/navigation"; //used to navigate programmatically
import { 
  User, Stethoscope, ArrowRight, ShieldCheck, 
  Building2, Phone, Fingerprint, CreditCard, Lock, Mail, Loader 
} from "lucide-react"; //like a library of icons
import Link from "next/link";// for linking between pages faster than <a href
import { patientLogin, doctorLogin, saveAuthToken, saveUserInfo } from "@/lib/api";

export default function LoginPage() { //export default mean it treat login page as a component
  const router = useRouter(); //give u access to next.js navigation methods

  const [activeTab, setActiveTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");//state to track which tab is active either patient or doctor
  
  // --- PATIENT STATE ---
  const [patientStep, setPatientStep] = useState<"DETAILS" | "OTP">("DETAILS");
  //patientStep->current ui state
  //setPatientStep->function to update the state
  //patientStep can be either "DETAILS" or "OTP" initially set to "DETAILS"
  //when patient enter send otp then patientStep set to otp and show otp page"

  const [patientData, setPatientData] = useState({ phone: "", aadhaar: "" });
  //store all patient input data like phone,aadhaar,abha in one object

  const [otp, setOtp] = useState(""); //store otp enter by user

  // --- DOCTOR STATE ---
  const [doctorData, setDoctorData] = useState({ doctorid: "", hospitalid: "", password: "" });

  const [isLoading, setIsLoading] = useState(false); //track loading state for API calls
  const [error, setError] = useState(""); //store any error messages
  const [doctorMode, setDoctorMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  //now if actiive tab is doctor then doctorMode will decide whether to show sign in form or sign up form
  //doctorMode can be either "SIGNIN" or "SIGNUP" initially set to "SIGNIN"
  //if docror mode is set to signup then we show the signup page
  
  // --- HANDLERS ---

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (patientStep === "DETAILS") {
      if (!patientData.phone && !patientData.aadhaar) {
        setError("Please enter either mobile number or aadhaar number");
        return;
      }
      // Generate a test OTP for development
      const testOTP = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`🔐 TEST OTP: ${testOTP}`);
      setPatientStep("OTP");
    } else {
      // Call the backend API for patient login
      if (!patientData.phone && !patientData.aadhaar) {
        setError("Please enter either mobile number or aadhaar number");
        setPatientStep("DETAILS");
        return;
      }
      setIsLoading(true);
      try {
        const response = await patientLogin({ 
          phone: patientData.phone || undefined,
          aadhaar: patientData.aadhaar || undefined,
          otp: otp
        });
        
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

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Validate input
      if (!doctorData.doctorid.trim() || !doctorData.hospitalid.trim() || !doctorData.password.trim()) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      // Call doctor login API
      const response = await doctorLogin({
        doctorid: doctorData.doctorid,
        hospitalid: doctorData.hospitalid,
        password: doctorData.password,
      });

      if (response.success && response.data) {
        // Save auth token and doctor info
        saveAuthToken(response.data.token);
        saveUserInfo(response.data.doctor);
        
        // Clear form
        setDoctorData({ doctorid: "", hospitalid: "", password: "" });
        
        // Redirect to Doctor Dashboard
        router.push("/doctor/dashboard");
      } else {
        setError(response.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Doctor login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      
      
<div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-2xl font-bold text-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl">
             <Stethoscope className="text-white h-6 w-6" />
          </div>
          VitalSync
        </div>
        <p className="text-slate-500 text-sm mt-2">Secure Unified Health Interface</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
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
          
          {activeTab === 'PATIENT' && (
            <form onSubmit={handlePatientLogin} className="space-y-4">
              {patientStep === "DETAILS" ? (
                <>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                        <div className="relative mt-1">
                           <Phone className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                           <input 
                             type="tel"
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                             placeholder="+91 98765 43210"
                             onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Aadhaar Number</label>
                        <div className="relative mt-1">
                           <Fingerprint className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                           <input 
                             type="text"
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                             placeholder="1234 5678 9012"
                             onChange={(e) => setPatientData({...patientData, aadhaar: e.target.value})}
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

          {activeTab === 'DOCTOR' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              
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

              <div className="space-y-3">
                 <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                    <input 
                      required
                      type="text" 
                      placeholder={doctorMode === "SIGNUP" ? "Hospital License ID" : "Doctor ID"} 
                      value={doctorData.doctorid}
                      onChange={(e) => setDoctorData({...doctorData, doctorid: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm font-bold text-slate-700"
                    />
                 </div>
                 <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                    <input 
                      required
                      type="text" 
                      placeholder="Hospital ID"
                      value={doctorData.hospitalid}
                      onChange={(e) => setDoctorData({...doctorData, hospitalid: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm font-bold text-slate-700"
                    />
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                    <input 
                      required
                      type="password" 
                      placeholder={doctorMode === "SIGNUP" ? "Create Password" : "Password"}
                      value={doctorData.password}
                      onChange={(e) => setDoctorData({...doctorData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm font-bold text-slate-700"
                    />
                 </div>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

              <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl mt-2 hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                 {isLoading ? (
                   <><Loader className="animate-spin" size={16} /> {doctorMode === "SIGNIN" ? "Logging in..." : "Registering..."}</>
                 ) : (
                   <>{doctorMode === "SIGNIN" ? "Access Dashboard" : "Register Profile"} <ArrowRight size={16} /></>
                 )}
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