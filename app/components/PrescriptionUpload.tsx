"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Trash2, Download, AlertCircle } from "lucide-react";
import { uploadPrescription, getPrescriptions, deletePrescription, downloadPrescription, Prescription } from "@/lib/api";

export default function PrescriptionUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["application/pdf", "text/plain"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Load prescriptions on mount
  React.useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPrescriptions();
      if (response.success && response.data) {
        setPrescriptions(response.data.prescriptions);
      } else {
        setError(response.error || "Failed to load prescriptions");
      }
    } catch (err) {
      setError("Error loading prescriptions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF and TXT files are allowed");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadPrescription(selectedFile, description);

      if (response.success) {
        setSuccess("Prescription uploaded successfully!");
        setSelectedFile(null);
        setDescription("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await loadPrescriptions();
      } else {
        setError(response.error || "Upload failed");
      }
    } catch (err) {
      setError("Error uploading prescription");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (prescriptionId: number) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await deletePrescription(prescriptionId);

      if (response.success) {
        setSuccess("Prescription deleted successfully");
        await loadPrescriptions();
      } else {
        setError(response.error || "Delete failed");
      }
    } catch (err) {
      setError("Error deleting prescription");
      console.error(err);
    }
  };

  const handleDownload = (prescriptionId: number, fileName: string) => {
    const url = downloadPrescription(prescriptionId);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Upload Prescription</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (PDF or TXT)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this prescription (e.g., date prescribed, doctor's name, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              selectedFile && !uploading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Prescription"}
          </button>
        </div>
      </div>

      {/* Prescriptions List Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Prescriptions</h2>
          </div>
          <span className="text-sm text-gray-500">
            {loading ? "Loading..." : `${prescriptions.length} file(s)`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading prescriptions...</div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            No prescriptions uploaded yet
          </div>
        ) : (
          <div className="space-y-2">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {prescription.file_name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(prescription.file_size)}</span>
                      <span>{formatDate(prescription.upload_date)}</span>
                      {prescription.description && (
                        <span className="text-gray-400">({prescription.description})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(prescription.id, prescription.file_name)}
                    className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prescription.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
