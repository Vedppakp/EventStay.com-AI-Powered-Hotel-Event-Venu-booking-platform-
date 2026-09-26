import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function OwnerSecurityGuard({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState('');

  const refreshStatus = async () => {
    setChecking(true);
    setCheckMsg('');
    try {
      const res = await authAPI.getMe();
      if (res.success && res.user) {
        if (res.user.ownerApprovalStatus === 'approved' && !res.user.isBlocked) {
          window.location.reload();
        } else {
          setCheckMsg('Status verified: Hotel registration is still pending Super Admin decision.');
        }
      }
    } catch (err) {
      setCheckMsg('Could not verify status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-sm font-semibold">Verifying hotelier credentials...</span>
        </div>
      </div>
    );
  }

  // If Not Authenticated or Not Owner/Admin
  if (!isAuthenticated || (user?.role !== 'owner' && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f26] to-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Hotel Owner Portal</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This portal is exclusively reserved for registered & approved hotel, resort, and banquet venue owners.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/owner/portal"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Sign In to Hotel Owner Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Return to Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin bypass
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // Blocked Owner Notice
  if (user?.isBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-rose-300">Account Suspended</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your hotelier account has been blocked by Platform Super Administrator{' '}
              <span className="font-bold text-white">Ved Prakash Pandey</span>.
            </p>
            {user?.blockReason && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                Reason: {user.blockReason}
              </div>
            )}
          </div>
          <Link
            to="/"
            className="inline-block py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Return to Marketplace Home
          </Link>
        </div>
      </div>
    );
  }

  // Rejected Registration Notice
  if (user?.ownerApprovalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-rose-300">Registration Declined</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your hotel registration was declined by Super Administrator{' '}
              <span className="font-bold text-white">Ved Prakash Pandey</span>.
            </p>
            {user?.ownerRejectionReason && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                Admin Note: {user.ownerRejectionReason}
              </div>
            )}
          </div>
          <Link
            to="/owner/portal"
            className="inline-block py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Re-apply on Owner Portal
          </Link>
        </div>
      </div>
    );
  }

  // Pending Approval Status Gate
  if (user?.ownerApprovalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f26] to-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase">
              <span>Admin Approval In Progress</span>
            </div>
            <h2 className="text-2xl font-black text-white">Awaiting Approval</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your hotel application for <span className="font-bold text-indigo-300">{user?.businessName || 'Your Venue'}</span> has been submitted. Super Administrator{' '}
              <span className="font-bold text-white">Ved Prakash Pandey</span> has sole authority to approve and activate your portal.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Host:</span>
              <span className="font-bold text-white">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Host Email:</span>
              <span className="font-bold text-slate-300">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Brand / Hotel:</span>
              <span className="font-bold text-indigo-400">{user?.businessName || 'Property'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approval Status:</span>
              <span className="font-bold text-amber-400">⏳ Pending Super Admin Review</span>
            </div>
          </div>

          {checkMsg && (
            <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
              {checkMsg}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={refreshStatus}
              disabled={checking}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Return to Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Approved! Render hotel portal dashboard directly with NO password/PIN lock
  return <>{children}</>;
}
