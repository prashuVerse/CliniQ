import Link from "next/link";
import { ShieldAlert, BrainCircuit, Stethoscope, Lock, ArrowRight, User } from "lucide-react";


export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="fixed w-full z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BrainCircuit className="text-white h-5 w-5" />
            </div>
            VitalSync
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Log In</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
            <Lock className="w-3 h-3" /> Secure • Patient-Owned • AI-Powered
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Medical context, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              when it matters most.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            VitalSync uses local AI to transform your fragmented PDF records into a structured clinical timeline for doctors and emergency responders.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
          
          <Link href="/auth/login" className="clinical-card p-8 hover:border-blue-400 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition">
              <User size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Patient Access</h3>
            <p className="text-slate-500 mt-2 text-sm">Upload records, manage consent, and view your synthesized timeline.</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold">
              Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>

          <Link href="/auth/login" className="clinical-card p-8 hover:border-green-400 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition">
              <Stethoscope size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Doctor View</h3>
            <p className="text-slate-500 mt-2 text-sm">Request patient consent via ABHA ID to view clinical summaries.</p>
            <div className="mt-4 flex items-center text-green-600 text-sm font-semibold">
              Request Access <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>

          <Link href="/auth/login" className="clinical-card p-8 bg-red-50/50 hover:bg-red-50 border-red-100 hover:border-red-400 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-red-900">Emergency Mode</h3>
            <p className="text-red-700/70 mt-2 text-sm">Restricted Access. Requires Verified Clinician Login.</p>
            <div className="mt-4 flex items-center text-red-700 text-sm font-semibold">
              Clinician Login <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>

        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        © 2026 VitalSync AI. Not for diagnostic use.
      </footer>
    </div>
  );
}