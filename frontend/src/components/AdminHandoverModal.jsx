import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  KeyRound,
  Trash2,
  Lock,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  UserX,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminHandoverModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, user: currentUser } = useAuth();

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [purgeActivity, setPurgeActivity] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newAdminName.trim()) {
      setError('Please provide the new administrator full name');
      return;
    }

    if (!newAdminEmail.trim() || !/^\S+@\S+\.\S+$/.test(newAdminEmail.trim())) {
      setError('Please enter a valid email for the new administrator');
      return;
    }

    if (!newAdminPassword || newAdminPassword.length < 6) {
      setError('New administrator password must be at least 6 characters');
      return;
    }

    if (!newAdminPin || !/^\d{4,8}$/.test(newAdminPin.trim())) {
      setError('New 6-digit Master PIN must be between 4 and 8 digits');
      return;
    }

    if (!currentPin.trim()) {
      setError('Current administrator Master PIN is required to authorize handover');
      return;
    }

    if (confirmationText.trim().toUpperCase() !== 'RESET-ADMIN') {
      setError('Please type "RESET-ADMIN" exactly to confirm platform wipe and transfer');
      return;
    }

    setLoading(true);

    try {
      const res = await adminAPI.resetAndTransfer({
        currentPin: currentPin.trim(),
        confirmationText: confirmationText.trim().toUpperCase(),
        newAdminName: newAdminName.trim(),
        newAdminEmail: newAdminEmail.trim().toLowerCase(),
        newAdminPassword,
        newAdminPin: newAdminPin.trim(),
        purgeActivity
      });

      if (res.success) {
        setSuccessData(res);
        // Clear all admin session flags
        sessionStorage.removeItem('eventstay_admin_verified');
        sessionStorage.removeItem('eventstay_admin_verified_time');

        // Automatically log out and redirect after 3 seconds
        setTimeout(() => {
          logout();
          navigate('/login', {
            state: {
              message: `Platform ownership transferred to ${res.newAdmin?.email}. All previous admin details have been deleted. Please log in with the new credentials.`
            }
          });
        }, 3200);
      } else {
        throw new Error(res.message || 'Platform handover failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete handover. Check your current PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl space-y-6 my-8 animate-scaleIn">
        {/* Success Screen */}
        {successData ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PLATFORM HANDOVER COMPLETE
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Ownership Successfully Transferred!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                All personal details, passwords, and sessions of previous admin{' '}
                <strong className="text-rose-400 font-bold">{currentUser?.email}</strong> have been wiped and deleted.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>New Administrator:</span>
                <span className="text-emerald-400 font-bold">{successData.newAdmin?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>New Admin Email:</span>
                <span className="text-cyan-400 font-bold">{successData.newAdmin?.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Security PIN:</span>
                <span className="text-amber-400 font-bold">•••••• (Configured)</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Redirecting to sign-in terminal in 3 seconds...</span>
            </div>
          </div>
        ) : (
          /* Handover Form */
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <UserX className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>Admin Handover & Factory Reset</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transfer ownership & delete all details of previous admin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Warning Callout */}
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs space-y-1 text-rose-300">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Irreversible Platform Ownership Transfer</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                This will overwrite the current administrator profile ({currentUser?.email}), wipe previous credentials, revoke all active sessions, and transfer primary superadmin access to the new administrator.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Section: New Admin Details */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 block">
                  1. New Administrator Profile
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      New Admin Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Vikram Mehta"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      New Admin Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="e.g. newadmin@platform.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300">
                        New Master Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      New 6-Digit Master PIN *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={8}
                      value={newAdminPin}
                      onChange={(e) => setNewAdminPin(e.target.value)}
                      placeholder="e.g. 654321"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Clean Slate Options */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 block">
                  2. Clean Slate Purge
                </span>
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={purgeActivity}
                    onChange={(e) => setPurgeActivity(e.target.checked)}
                    className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-slate-900 border-slate-700"
                  />
                  <div className="space-y-0.5 text-left">
                    <span className="font-bold text-white block">
                      Purge previous complaints & test reservations
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Cleans previous tickets and test bookings, providing the new administrator with a fresh control desk.
                    </span>
                  </div>
                </label>
              </div>

              {/* Section: Security Verification */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 block">
                  3. Security Verification & Confirmation
                </span>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Current Admin Security PIN (Verify Authorization) *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current Security PIN"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Type <span className="font-mono text-rose-400 font-bold">RESET-ADMIN</span> to Confirm *
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type RESET-ADMIN"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-500/50 rounded-xl text-white text-xs placeholder:text-slate-600 font-mono tracking-wider focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Wiping Previous Admin & Transferring...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Execute Handover & Delete Previous Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
