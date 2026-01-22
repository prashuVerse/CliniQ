"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TYPES ---
export type MedicalRecord = {
  id: string;
  type: "Lab Report" | "Prescription" | "Discharge Summary";
  date: string;
  title: string;
  doctor: string;
  summary: string;
};

export type Reminder = {
  id: string;
  medicine: string;
  time: string; // e.g., "08:00"
  days: string[]; // e.g., ["Mon", "Wed"]
  active: boolean;
};

type AppContextType = {
  // Patient Data
  patientName: string;
  records: MedicalRecord[];
  allergies: string[];
  conditions: string[];
  
  // Actions
  addRecord: (record: MedicalRecord) => void;
  
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Mock Patient Data
  const patientName = "Rahul Deshmukh";
  
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      type: "Prescription",
      date: "2023-11-15",
      title: "General Consultation",
      doctor: "Dr. A. Sharma",
      summary: "Prescribed Metformin 500mg. BP 130/85.",
    },
    {
      id: "2",
      type: "Lab Report",
      date: "2023-08-10",
      title: "Quarterly Blood Panel",
      doctor: "City Labs",
      summary: "HbA1c: 6.8%. Lipid profile borderline high.",
    }
  ]);

  const [allergies] = useState(["Penicillin", "Shellfish"]);
  const [conditions] = useState(["Type 2 Diabetes", "Hypertension"]);

  // --- REMINDER LOGIC ---
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "101", medicine: "Metformin", time: "09:00", days: ["Daily"], active: true },
    { id: "102", medicine: "Vitamin D", time: "20:00", days: ["Sun"], active: true }
  ]);

  const addRecord = (record: MedicalRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      patientName, 
      records, 
      addRecord, 
      allergies, 
      conditions,
      reminders,
      addReminder,
      toggleReminder,
      deleteReminder
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}