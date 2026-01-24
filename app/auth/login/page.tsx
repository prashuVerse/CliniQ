"use client";
import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { 
  User, Stethoscope, ArrowRight, ShieldCheck, 
  Building2, Phone, Fingerprint, CreditCard, Lock, Mail, Loader 
} from "lucide-react"; //like a library of icons
import Link from "next/link";// for linking between pages faster than <a href
import { patientLogin, doctorLogin, saveAuthToken, saveUserInfo } from "@/lib/api";

export default function LoginPage() { 
  const router = useRouter(); 

  const [activeTab, setActiveTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  
  // --- PATIENT STATE ---
  const [patientStep, setPatientStep] = useState<"DETAILS" | "OTP">("DETAILS");
  
  
  const [loginMethod, setLoginMethod] = useState<"PHONE" | "AADHAAR">("PHONE");

  const [patientData, setPatientData] = useState({ phone: "", aadhaar: "", abhaid: "" });
  

  const [otp, setOtp] = useState(""); //store otp enter by user

  
  const [doctorData, setDoctorData] = useState({ doctorid: "", hospitalid: "", password: "" });

  const [isLoading, setIsLoading] = useState(false); //track loading state for API calls
  const [error, setError] = useState(""); //store any error messages
  const [doctorMode, setDoctorMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");

  // --- HANDLERS ---

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (patientStep === "DETAILS") {
      if (!patientData.phone && !patientData.aadhaar) {
        setError("Please enter either mobile number or aadhaar number");
        return;
      }
  
      const testOTP = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(` TEST OTP: ${testOTP}`);
      setPatientStep("OTP");
    } else {
  
      if (!patientData.phone && !patientData.aadhaar) {
        setError("Please enter either mobile number or aadhaar number");
        setPatientStep("DETAILS");
        return;
      }
      setIsLoading(true);
      try {
  
        const abhaid = patientData.abhaid || patientData.aadhaar || patientData.phone;
        const response = await patientLogin({ 
          abhaid: abhaid
        });
        
        if (response.success && response.data) {
          saveAuthToken(response.data.token);
          saveUserInfo(response.data.user);
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
    // UPDATED: Background with gradient and subtle grid pattern
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center p-4 overflow-hidden">
      
      
<div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-2xl font-bold text-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl">
             <Stethoscope className="text-white h-6 w-6" />
          </div>
          VitalSync
        </div>
        <p className="text-slate-500 font-medium text-sm mt-3">Secure Unified Health Interface</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab("PATIENT")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'PATIENT' ? 'bg-white text-blue-600 shadow-md shadow-slate-200 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <User size={18} /> Patient
          </button>
          <button 
            onClick={() => setActiveTab("DOCTOR")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'DOCTOR' ? 'bg-white text-green-600 shadow-md shadow-slate-200 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <Stethoscope size={18} /> Doctor
          </button>
        </div>

        <div className="p-8">
          
          {activeTab === 'PATIENT' && (
            <form onSubmit={handlePatientLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {patientStep === "DETAILS" ? (
                <>
                  {/* TOGGLE */}
                  <div className="bg-slate-100 p-1.5 rounded-xl flex relative">
                     {/* Animated Background Slider Logic (Simple Version) */}
                     <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${loginMethod === 'PHONE' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
                     
                     <button 
                        type="button"
                        onClick={() => setLoginMethod("PHONE")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${loginMethod === 'PHONE' ? 'text-blue-600' : 'text-slate-500'}`}
                     >
                        Via Mobile
                     </button>
                     <button 
                        type="button"
                        onClick={() => setLoginMethod("AADHAAR")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${loginMethod === 'AADHAAR' ? 'text-blue-600' : 'text-slate-500'}`}
                     >
                        Via Aadhaar
                     </button>
                  </div>

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

                  {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-in fade-in zoom-in">{error}</div>}
                  
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl mt-4 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                     {isLoading ? <><Loader className="animate-spin" size={18} /> Logging in...</> : <>Get Verification Code <ArrowRight size={18}/></>}
                  </button>
                </>
              ) : (
                <div className="text-center space-y-6">
                   <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="text-blue-600 h-8 w-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800">Enter Verification Code</h3>
                      <p className="text-slate-500 text-sm mt-1">
                        {loginMethod === "PHONE" 
                           ? `Sent to +91 ******${patientData.phone.slice(-4)}`
                           : `Sent to Aadhaar linked mobile`
                        }
                      </p>
                   </div>
                   
                   <input 
                      type="text" 
                      className="w-40 mx-auto text-center text-3xl font-bold tracking-[0.5em] py-3 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none bg-transparent transition-all"
                      placeholder="0000"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      autoFocus
                   />
                   
                   {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-left">{error}</div>}
                   
                   <div className="space-y-3">
                     <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isLoading ? <><Loader className="animate-spin" size={18} /> Verifying...</> : "Verify & Login"}
                     </button>
                     <button type="button" onClick={() => setPatientStep("DETAILS")} className="text-xs text-slate-400 hover:text-blue-600 underline transition-colors">
                        Entered wrong details? Go Back
                     </button>
                   </div>
                </div>
              )}
            </form>
          )}

          {activeTab === 'DOCTOR' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              
              <div className="flex justify-center mb-6">
                 <div className="bg-slate-100 p-1 rounded-xl inline-flex relative">
                    {/* Sliding Pill */}
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${doctorMode === 'SIGNIN' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>

                    <button 
                      type="button"
                      onClick={() => setDoctorMode("SIGNIN")}
                      className={`px-6 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${doctorMode === 'SIGNIN' ? 'text-green-700' : 'text-slate-500'}`}
                    >
                      Sign In
                    </button>
                    <button 
                       type="button"
                       onClick={() => setDoctorMode("SIGNUP")}
                       className={`px-6 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${doctorMode === 'SIGNUP' ? 'text-green-700' : 'text-slate-500'}`}
                    >
                      Sign Up
                    </button>
                 </div>
              </div>

              {doctorMode === "SIGNUP" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="relative group focus-within:scale-[1.02] transition-transform">
                       <User className="absolute left-3 top-3.5 text-slate-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                       <input required type="text" placeholder="Dr. Name" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:font-normal" />
                     </div>
                     <div className="relative group focus-within:scale-[1.02] transition-transform">
                       <Phone className="absolute left-3 top-3.5 text-slate-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                       <input required type="text" placeholder="Phone" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:font-normal" />
                     </div>
                   </div>
                   <div className="relative group focus-within:scale-[1.02] transition-transform">
                      <Mail className="absolute left-3 top-3.5 text-slate-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                      <input required type="email" placeholder="Email Address" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:font-normal" />
                   </div>
                   <div className="relative group focus-within:scale-[1.02] transition-transform">
                      <Building2 className="absolute left-3 top-3.5 text-slate-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                      <input required type="text" placeholder="Hospital Name" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:font-normal" />
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
                 <div className="relative group focus-within:scale-[1.02] transition-all duration-300">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5 group-focus-within:text-green-600 transition-colors" />
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

     <div className="relative z-10 mt-8 text-center text-xs text-slate-400 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        <Link 
          href="/" 
          className="
            inline-block 
            cursor-pointer 
            text-slate-400 
            transition-all 
            duration-300 
            hover:text-blue-600 
            hover:scale-110 
            hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.6)] 
            hover:-translate-y-1
          "
        >
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}