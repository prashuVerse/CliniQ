"use client";
import React, { createContext, useContext, useState } from 'react';

// 1. RENAME "Record" to "MedicalRecord" to avoid conflict
export type MedicalRecord = {
  id: string;
  type: "Lab Report" | "Prescription" | "Discharge Summary";
  date: string;
  title: string;
  doctor: string;
  summary: string;
};

type AppContextType = {
  records: MedicalRecord[]; // Updated name
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => void;
  addRecord: (record: MedicalRecord) => void; // Updated name
  allergies: string[];
  conditions: string[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
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
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const toggleEmergencyMode = () => setIsEmergencyMode(!isEmergencyMode);
  
  const addRecord = (record: MedicalRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  return (
    <AppContext.Provider value={{ records, isEmergencyMode, toggleEmergencyMode, addRecord, allergies, conditions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}