"use client";
import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { 
  User, Stethoscope, ArrowRight, ShieldCheck, 
  Building2, Phone, Lock, Mail, Loader,
  Droplet, Users 
} from "lucide-react"; 
import Link from "next/link";
import { patientLogin, doctorLogin, saveAuthToken, saveUserInfo } from "@/lib/api";

export default function LoginPage() { 
  const router = useRouter(); 

  const [activeTab, setActiveTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [patientStep, setPatientStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [patientMode, setPatientMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");

  const [patientData, setPatientData] = useState({ 
    name: "",
    phone: "", 
    aadhaar: "", // Kept for API compatibility, but unused in UI
    email: "",
    bloodGroup: "",
    emergencyContact: ""
  });

  const [otp, setOtp] = useState(""); 
  const [doctorData, setDoctorData] = useState({ doctorid: "", hospitalid: "", password: "" });
  const [doctorMode, setDoctorMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(""); 

  // --- HANDLERS ---

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (patientStep === "DETAILS") {
      // VALIDATION LOGIC
      if (patientMode === "SIGNIN") {
        if (!patientData.phone) {
          setError("Please enter your Mobile Number.");
          return;
        }
      } else {
        // Sign Up Validation
        if (!patientData.name || !patientData.phone || !patientData.email || !patientData.bloodGroup || !patientData.emergencyContact) {
          setError("Please fill in all registration fields.");
          return;
        }
      }

      // Generate a test OTP
      const testOTP = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(` TEST OTP: ${testOTP}`);
      setPatientStep("OTP");
    } else {
      // OTP VERIFICATION STEP
      setIsLoading(true);
      try {
  
        const abhaid = patientData.aadhaar || patientData.phone;
        const response = await patientLogin({ 
          phone: patientData.phone,
          aadhaar: patientData.aadhaar, // Will be empty string
          otp: otp,
        });
        
        if (response.success && response.data) {
          saveAuthToken(response.data.token);
          saveUserInfo(response.data.user);
          router.push("/dashboard");
        } else {
          setError(response.error || "Verification failed. Please try again.");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
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
      if (!doctorData.doctorid.trim() || !doctorData.hospitalid.trim() || !doctorData.password.trim()) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const response = await doctorLogin({
        doctorid: doctorData.doctorid,
        hospitalid: doctorData.hospitalid,
        password: doctorData.password,
      });

      if (response.success && response.data) {
        saveAuthToken(response.data.token);
        saveUserInfo(response.data.doctor);
        setDoctorData({ doctorid: "", hospitalid: "", password: "" });
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
        
        {/* MAIN TABS (Patient vs Doctor) */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setActiveTab("PATIENT"); setPatientStep("DETAILS"); }}
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
          
          {/* ================= PATIENT TAB ================= */}
          {activeTab === 'PATIENT' && (
            <form onSubmit={handlePatientLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {patientStep === "DETAILS" ? (
                <>
                  {/* PATIENT SIGN IN / SIGN UP TOGGLE */}
                  <div className="bg-slate-100 p-1 rounded-xl flex relative mb-4">
                      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${patientMode === 'SIGNIN' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
                      
                      <button 
                        type="button"
                        onClick={() => setPatientMode("SIGNIN")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${patientMode === 'SIGNIN' ? 'text-blue-600' : 'text-slate-500'}`}
                      >
                        Sign In
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPatientMode("SIGNUP")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${patientMode === 'SIGNUP' ? 'text-blue-600' : 'text-slate-500'}`}
                      >
                        Sign Up
                      </button>
                  </div>

                  <div className="space-y-4">
                     
                     {/* --- PATIENT SIGN IN FORM --- */}
                     {patientMode === "SIGNIN" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                              <div className="relative mt-1">
                                 <Phone className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                 <input 
                                    type="tel"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                                    placeholder="+91 98765 43210"
                                    value={patientData.phone}
                                    onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {/* --- PATIENT SIGN UP FORM (Aadhaar Removed) --- */}
                     {patientMode === "SIGNUP" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                           <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                 <User className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                                 <input required type="text" placeholder="Full Name" 
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                                    value={patientData.name}
                                    onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                                 />
                              </div>
                              <div className="relative">
                                 <Phone className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                                 <input required type="tel" placeholder="Mobile" 
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                                    value={patientData.phone}
                                    onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                                 />
                              </div>
                           </div>
                           
                           <div className="relative">
                              <Mail className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                              <input required type="email" placeholder="Email Address" 
                                 className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                                 value={patientData.email}
                                 onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                              />
                           </div>

                           <div className="relative">
                                <Users className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                                <input required type="tel" placeholder="Emergency Contact No." 
                                   className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                                   value={patientData.emergencyContact}
                                   onChange={(e) => setPatientData({...patientData, emergencyContact: e.target.value})}
                                />
                           </div>

                           <div className="relative">
                              <Droplet className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                              <select 
                                 required
                                 className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700"
                                 value={patientData.bloodGroup}
                                 onChange={(e) => setPatientData({...patientData, bloodGroup: e.target.value})}
                              >
                                 <option value="" disabled>Select Blood Group</option>
                                 <option value="A+">A+</option>
                                 <option value="A-">A-</option>
                                 <option value="B+">B+</option>
                                 <option value="B-">B-</option>
                                 <option value="O+">O+</option>
                                 <option value="O-">O-</option>
                                 <option value="AB+">AB+</option>
                                 <option value="AB-">AB-</option>
                              </select>
                           </div>
                        </div>
                     )}
                  </div>

                  {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-in fade-in zoom-in">{error}</div>}
                  
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl mt-4 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                     {isLoading ? <><Loader className="animate-spin" size={18} /> Processing...</> : <>{patientMode === "SIGNIN" ? "Get Verification Code" : "Register & Verify"} <ArrowRight size={18}/></>}
                  </button>
                </>
              ) : (
                <div className="text-center space-y-6">
                   {/* OTP SCREEN */}
                   <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="text-blue-600 h-8 w-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800">Enter Verification Code</h3>
                      <p className="text-slate-500 text-sm mt-1">
                         Sent to +91 ******{patientData.phone.slice(-4)}
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

          {/* ================= DOCTOR TAB ================= */}
          {activeTab === 'DOCTOR' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              
              <div className="flex justify-center mb-6">
                 <div className="bg-slate-100 p-1 rounded-xl inline-flex relative">
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
          className="inline-block cursor-pointer text-slate-400 transition-all duration-300 hover:text-blue-600 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.6)] hover:-translate-y-1"
        >
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}