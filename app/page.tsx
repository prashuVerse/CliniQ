import Link from "next/link";
import { 
  ShieldAlert, 
  BrainCircuit, 
  Stethoscope, 
  Lock, 
  ArrowRight, 
  User, 
  Activity,
  CheckCircle2,
  Database
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Soft Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="sticky top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <BrainCircuit className="text-white h-5 w-5" />
            </div>
            CliniQ
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hidden md:block text-sm font-medium text-slate-500 hover:text-slate-900 transition">How it works</Link>
            <Link 
              href="/auth/login" 
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 pt-40 pb-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm text-blue-700 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Lock className="w-3 h-3" /> Secure • Patient-Owned • AI-Powered
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Medical context, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-x bg-[length:200%_auto]">
              when it matters most.
            </span>
          </h1>
          
          {/* Subtext */}
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            VitalSync uses on-device AI to transform fragmented PDF records into a structured, lifesaving clinical timeline for doctors and emergency responders.
          </p>

          {/* Cards Container */}
          <div className="max-w-6xl mx-auto mt-20 grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            
            {/* Patient Card */}
            <Link href="/auth/login" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <User size={120} />
              </div>
              <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <User size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Patient Access</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Upload your history, manage consent, and own your medical data securely.
              </p>
              <div className="flex items-center text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Link>

            {/* Doctor Card */}
            <Link href="/auth/login" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Stethoscope size={120} />
              </div>
              <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Stethoscope size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Doctor View</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Request consent via ABHA ID and view synthesized clinical summaries instantly.
              </p>
              <div className="flex items-center text-emerald-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                Request Access <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Link>

            {/* Emergency Card */}
            <Link href="/auth/login" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:border-red-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldAlert size={120} />
              </div>
              <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Emergency Mode</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Critical access for verified first responders. Requires biometric audit.
              </p>
              <div className="flex items-center text-red-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                Clinician Login <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Link>

          </div>
        </div>
      </main>

      {/* TRUST/FEATURES STRIP */}
      <section className="bg-white border-y border-slate-100 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-blue-50 p-3 rounded-full mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900">E2E Encrypted</h4>
              <p className="text-xs text-slate-500">HIPAA Compliant Security</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-purple-50 p-3 rounded-full mb-2">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-bold text-slate-900">Local Processing</h4>
              <p className="text-xs text-slate-500">Data stays on device</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-emerald-50 p-3 rounded-full mb-2">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900">Real-time Sync</h4>
              <p className="text-xs text-slate-500">Instant updates</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-orange-50 p-3 rounded-full mb-2">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="font-bold text-slate-900">ABHA Integrated</h4>
              <p className="text-xs text-slate-500">Govt. Verified ID</p>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-slate-400 text-sm bg-slate-50 relative z-10">
        <p className="mb-2">© 2026 VitalSync AI. All rights reserved.</p>
        <p className="text-xs text-slate-300">Not for diagnostic use. In emergencies, dial 112.</p>
      </footer>
    </div>
  );
}