"use client";

import { useState, type FormEvent } from "react";
import { AppProvider, useAppContext, type MedicalRecord, type Reminder } from "../../../lib/store";
import { containerVariants, itemVariants } from "../../../lib/animation";
import {
  Sparkles, Activity, Clock, Plus, Trash2, Bell, BellOff,
  User, UploadCloud, FileText, AlertTriangle, QrCode, X,
  Share2, ShieldCheck, CalendarDays, RefreshCw, CheckCircle2, File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ================= WRAPPER =================
export default function DashboardPage() {
  return (
    <AppProvider>
      <PatientDashboardContent />
    </AppProvider>
  );
}

// ================= MAIN COMPONENT =================
function PatientDashboardContent() {
  const {
    patientName,
    records,
    addRecord,
    allergies,
    conditions,
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder
  } = useAppContext();

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedTime, setNewMedTime] = useState("");

  const [showTimeline, setShowTimeline] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [timelineData, setTimelineData] = useState<MedicalRecord[]>([]);

  // ================= FILE UPLOAD =================
  const handleFileUpload = () => {
    if (isUploading) return;
    setIsUploading(true);

    setTimeout(() => {
      const newRecord: MedicalRecord = {
        id: crypto.randomUUID(),
        type: "Lab Report",
        date: new Date().toISOString().split("T")[0],
        title: "Lab_Report_082995.pdf",
        doctor: "Uploaded by Patient",
        summary: "",
      };
      addRecord(newRecord);
      setIsUploading(false);
    }, 2000);
  };

  // ================= AI ANALYSIS =================
  const handleAnalyzeRecords = async () => {
    if (records.length === 0) {
      setAnalysisError("Please upload documents first.");
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      await new Promise((r) => setTimeout(r, 2000));

      const enrichedTimeline: MedicalRecord[] = records.map((record) => ({
        ...record,
        summary:
          record.summary?.trim() ||
          "AI Analysis: Clinical correlation required. Vitals indicate stable trend.",
      }));

      setTimelineData(enrichedTimeline);
      setShowTimeline(true);
    } catch (err) {
      console.error(err);
      setAnalysisError("Unable to analyze records.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // ================= ADD REMINDER =================
  const handleAddReminder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMedName || !newMedTime) return;

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      medicine: newMedName,
      time: newMedTime,
      days: ["Daily"],
      active: true,
    };

    addReminder(newReminder);
    setNewMedName("");
    setNewMedTime("");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 font-bold text-xl">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Activity className="text-white h-5 w-5" />
          </div>
          VitalSync
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowQR(true)}
            className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-bold"
          >
            <QrCode size={18} />
          </button>

          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold">
            {patientName?.charAt(0) ?? "U"}
          </div>
        </div>
      </nav>

      {/* QR MODAL */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-2xl"
            >
              <button onClick={() => setShowQR(false)}>
                <X />
              </button>
              <QrCode size={200} />
              <h3 className="font-bold mt-2">{patientName}</h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8"
      >

        {/* UPLOAD COLUMN */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">

          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-bold mb-4 flex gap-2">
              <UploadCloud /> Upload Records
            </h2>

            <div
              onClick={handleFileUpload}
              className="border-2 border-dashed p-6 text-center cursor-pointer rounded-xl"
            >
              {isUploading ? "Uploading..." : "Click to Upload"}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-bold mb-3">Documents</h2>

            {records.length === 0 ? (
              <p className="text-sm text-gray-400">No documents yet.</p>
            ) : (
              records.map((rec) => (
                <div key={rec.id} className="flex gap-2 items-center p-2 bg-slate-50 rounded-lg">
                  <File size={14} />
                  <div>
                    <p className="text-sm font-bold">{rec.title}</p>
                    <p className="text-xs text-gray-400">{rec.date}</p>
                  </div>
                  <CheckCircle2 className="text-green-500 ml-auto" size={14} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* TIMELINE COLUMN */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">

          <div className="bg-purple-600 text-white p-4 rounded-2xl">
            {analysisError && (
              <div className="bg-red-500/30 p-2 rounded mb-2 flex gap-2">
                <AlertTriangle size={14} /> {analysisError}
              </div>
            )}

            <button
              onClick={handleAnalyzeRecords}
              disabled={analysisLoading}
              className="bg-white text-purple-700 w-full py-2 rounded-lg font-bold"
            >
              {analysisLoading ? "Processing..." : showTimeline ? "Refresh Timeline" : "Generate Timeline"}
            </button>
          </div>

          {!showTimeline && (
            <div className="text-center text-gray-400 border-dashed border p-6 rounded-xl">
              Timeline Empty
            </div>
          )}

          {showTimeline && timelineData.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-xl border">
              <p className="text-xs text-gray-400">{record.date}</p>
              <h3 className="font-bold">{record.title}</h3>
              <p className="text-sm mt-2">{record.summary}</p>
              <p className="text-xs text-gray-400 mt-2">{record.doctor}</p>
            </div>
          ))}
        </motion.div>

        {/* REMINDERS COLUMN */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">

          <form onSubmit={handleAddReminder} className="bg-white p-4 rounded-xl border space-y-2">
            <input
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              placeholder="Medicine name"
              className="w-full border p-2 rounded"
            />
            <input
              type="time"
              value={newMedTime}
              onChange={(e) => setNewMedTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button className="bg-purple-600 text-white w-full py-2 rounded font-bold">
              Add Reminder
            </button>
          </form>

          {reminders.map((r) => (
            <div key={r.id} className="bg-white p-3 rounded-xl border flex justify-between items-center">
              <div>
                <p className="font-bold">{r.medicine}</p>
                <p className="text-xs text-gray-500">{r.time}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleReminder(r.id)}>
                  {r.active ? <Bell /> : <BellOff />}
                </button>
                <button onClick={() => deleteReminder(r.id)}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
}
