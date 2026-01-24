"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Clock, Lock, Trash2, AlertCircle, Copy, CheckCircle } from "lucide-react";
import { generateQRCode, getMyQRTokens, revokeQRToken, QRToken } from "@/lib/api";

export default function QRCodeGenerator() {
  const [tokens, setTokens] = useState<QRToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    durationMinutes: 15,
    accessLevel: "FULL" as "BASIC" | "FULL",
  });

  // Load tokens on mount
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyQRTokens();
      if (response.success && response.data) {
        setTokens(response.data.tokens);
      } else {
        setError(response.error || "Failed to load tokens");
      }
    } catch (err) {
      setError("Error loading tokens");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await generateQRCode(formData.durationMinutes, formData.accessLevel);

      if (response.success && response.data) {
        setSuccess(`QR Code generated! Valid for ${response.data.duration_mins} minutes`);
        setFormData({ durationMinutes: 15, accessLevel: "FULL" });
        await loadTokens();
      } else {
        setError(response.error || "Failed to generate QR code");
      }
    } catch (err) {
      setError("Error generating QR code");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (tokenId: number) => {
    if (!window.confirm("Are you sure you want to revoke this QR code?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await revokeQRToken(tokenId);
      if (response.success) {
        setSuccess("QR code revoked successfully");
        await loadTokens();
      } else {
        setError(response.error || "Failed to revoke QR code");
      }
    } catch (err) {
      setError("Error revoking QR code");
      console.error(err);
    }
  };

  const handleCopyToken = (token: string, tokenId: number) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isTokenValid = (token: QRToken) => {
    return !token.is_used && new Date(token.expires_at) > new Date();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <QrCode className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Generate QR Code Access</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Validity Duration
            </label>
            <select
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={480}>8 hours</option>
              <option value={1440}>24 hours</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose how long the QR code will be valid</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Access Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, accessLevel: "BASIC" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.accessLevel === "BASIC"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-sm">BASIC</div>
                <div className="text-xs text-gray-500 mt-1">View medications & conditions</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, accessLevel: "FULL" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.accessLevel === "FULL"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-sm">FULL</div>
                <div className="text-xs text-gray-500 mt-1">Complete medical history</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={generating}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              generating
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {generating ? "Generating..." : "Generate QR Code"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your QR Codes</h2>
          </div>
          <span className="text-sm text-gray-500">
            {loading ? "Loading..." : `${tokens.length} code(s)`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading QR codes...</div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <QrCode className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No QR codes generated yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => {
              const isValid = isTokenValid(token);
              return (
                <div
                  key={token.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isValid
                      ? "border-blue-200 bg-blue-50"
                      : token.is_used
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            token.access_level === "FULL"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {token.access_level}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            isValid
                              ? "bg-yellow-200 text-yellow-800"
                              : token.is_used
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                          }`}
                        >
                          {token.is_used ? "Used" : "Active"}
                        </span>
                      </div>

                      {token.is_used ? (
                        <p className="text-xs text-gray-600 mb-2">
                          Scanned by {token.doctor?.username || "Unknown Doctor"}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 mb-2">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {getTimeRemaining(token.expires_at)}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 flex-1 truncate">
                          {token.token.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => handleCopyToken(token.token, token.id)}
                          className="p-1 text-gray-600 hover:bg-white rounded transition-colors"
                          title="Copy token"
                        >
                          {copiedToken === token.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-gray-500">
                        Created: {new Date(token.created_at).toLocaleString()}
                      </p>
                    </div>

                    {!token.is_used && (
                      <button
                        onClick={() => handleRevoke(token.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors ml-2"
                        title="Revoke QR code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Generate a QR code with your desired access duration and level</li>
              <li>Share the QR code or token with the doctor</li>
              <li>The doctor scans the QR code to get temporary access to your information</li>
              <li>Access automatically expires after the set duration</li>
              <li>You can revoke access at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
