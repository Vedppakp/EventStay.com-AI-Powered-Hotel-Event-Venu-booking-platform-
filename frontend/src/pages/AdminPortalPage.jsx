import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Send,
  User,
  Phone,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, adminAPI } from '../services/api';

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Switch to different admin state
  const [switchAccountMode, setSwitchAccountMode] = useState(false);

  // Apply for Admin modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyReason, setApplyReason] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  // 1. Existing Logged-in Admin Re-authentication (Password required every time you switch to admin portal)
  const handleVerifyCurrentAdminPassword = async (e) => {
    if (e) e.preventDefault();
    if (!confirmPasswordInput.trim()) {
      setError('Please enter your Super Administrator password or PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminAPI.verifySecurity({
        password: confirmPasswordInput.trim(),
        pin: confirmPasswordInput.trim()
      });

      if (res.success && res.verified) {
        sessionStorage.setItem('eventstay_admin_verified', 'true');
        sessionStorage.setItem('eventstay_admin_verified_time', Date.now().toString());
        navigate('/admin/dashboard');
      } else {
        throw new Error(res.message || 'Invalid administrator password or PIN');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator password. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  // 2. New / Clean Sign In
  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.user?.role === 'admin') {
        sessionStorage.setItem('eventstay_admin_verified', 'true');
        sessionStorage.setItem('eventstay_admin_verified_time', Date.now().toString());
        navigate('/admin/dashboard');
      } else {
        setError('This account does not have Super Administrator privileges.');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('pandeyvedprakash499@gmail.com');
    setPassword('admin123');
    setError('');
  };

  const fillDemoPassword = () => {
    setConfirmPasswordInput('admin123');
    setError('');
  };

  const handleApplyAdminSubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const res = await authAPI.applyForAdmin({
        name: applyName,
        email: applyEmail,
        phone: applyPhone,
        reason: applyReason
      });

      setApplySuccess(
        res.message || 'Application submitted! Super Admin Ved Prakash Pandey will review your application.'
      );
      setTimeout(() => {
        setApplyName('');
        setApplyEmail('');
        setApplyPhone('');
        setApplyReason('');
      }, 1000);
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const isCurrentAdmin = isAuthenticated && user?.role === 'admin' && !switchAccountMode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0f111a] to-slate-950 text-white py-12 px-4 flex flex-col justify-center items-center">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30">
            <ShieldAlert className="w-7 h-7 text-slate-950" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold uppercase">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Restricted Super Admin Console</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Super Admin Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Governed platform administration desk for{' '}
            <span className="font-bold text-amber-300">Ved Prakash Pandey</span>.
          </p>
        </div>

        {/* Security Notice: Password Required Every Switch */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-300 block mb-0.5">
              Strict Security Enforcement:
            </span>
            Password is required every time you switch to the Super Admin Portal to protect platform approvals, owner credentials, and governance.
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ======================================================= */}
          {/* CASE A: ADMIN RE-AUTHENTICATION (PASSWORD REQUIRED)    */}
          {/* ======================================================= */}
          {isCurrentAdmin ? (
            <form onSubmit={handleVerifyCurrentAdminPassword} className="space-y-4">
              {/* Profile Card */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                    VP
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{user.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                      Super Administrator
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fillDemoPassword}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg cursor-pointer"
                >
                  Fill (admin123)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1 flex items-center justify-between">
                  <span>Enter Administrator Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Enter password (e.g. admin123)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying Password...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Password & Enter Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setSwitchAccountMode(true)}
                  className="text-xs text-slate-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Sign in with different administrator credentials
                </button>
              </div>
            </form>
          ) : (
            /* ======================================================= */
            /* CASE B: NEW / FRESH SIGN IN                             */
            /* ======================================================= */
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              {/* Quick Demo Helper */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  <span className="font-bold text-amber-400 block">⚡ Super Admin Account:</span>
                  Ved Prakash Pandey
                </div>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg cursor-pointer"
                >
                  Auto-fill Admin
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Admin Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pandeyvedprakash499@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                  <span>Admin Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Super Admin...' : 'Sign In as Super Administrator'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {switchAccountMode && isAuthenticated && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setSwitchAccountMode(false)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    ← Back to {user.name} session
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Action to Apply for Admin Access */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Need platform administrative authority?
            </p>
            <button
              type="button"
              onClick={() => {
                setShowApplyModal(true);
                setApplyError('');
                setApplySuccess('');
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply for Administrator Access</span>
            </button>
          </div>
        </div>

        {/* Return to Marketplace */}
        <div className="text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-white underline">
            Return to EventStay Customer Marketplace
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: APPLY FOR ADMIN ACCESS                             */}
      {/* ========================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Apply for Administrator Privileges</span>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your request to join the platform administration team. All applications are directly reviewed by{' '}
              <span className="font-semibold text-white">Ved Prakash Pandey</span>.
            </p>

            {applySuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{applySuccess}</span>
              </div>
            )}

            {applyError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplyAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={applyName}
                    onChange={(e) => setApplyName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={applyEmail}
                    onChange={(e) => setApplyEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Reason for Requesting Admin Privileges
                </label>
                <textarea
                  required
                  rows={3}
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  placeholder="Explain why you need platform administrator privileges (e.g. Regional manager, hotel compliance auditor)..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
