import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  MapPin,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function OwnerPortalPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, switchRoleDemo } = useAuth();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register' | 'forgot_password'
  
  // Sign in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Hotel state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [propertyType, setPropertyType] = useState('Hotel');
  const [city, setCity] = useState('');

  // Forgot password request state
  const [forgotEmail, setForgotEmail] = useState('');
  const [requestedPassword, setRequestedPassword] = useState('');
  const [forgotReason, setForgotReason] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-redirect if already authenticated and approved
  useEffect(() => {
    if (isAuthenticated && user?.role === 'owner' && user?.ownerApprovalStatus === 'approved' && !user?.isBlocked) {
      navigate('/owner/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await login(email, password);
      if (res.user?.role === 'owner') {
        if (res.user.ownerApprovalStatus === 'approved' && !res.user.isBlocked) {
          navigate('/owner/dashboard');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials or account suspended');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterHotel = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: 'owner',
        businessName: hotelName
      });

      setSuccessMsg(
        '🎉 Hotel registration submitted! Your profile has been queued for Super Admin (Ved Prakash Pandey) review and approval.'
      );
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setForgotSuccess('');

    try {
      const res = await authAPI.requestOwnerPasswordReset({
        email: forgotEmail,
        requestedNewPassword: requestedPassword,
        reason: forgotReason
      });

      setForgotSuccess(res.message || 'Password reset request submitted for Super Admin approval.');
    } catch (err) {
      setError(err.message || 'Failed to submit reset request');
    } finally {
      setLoading(false);
    }
  };

  const refreshApprovalStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await authAPI.getMe();
      if (res.success && res.user) {
        if (res.user.ownerApprovalStatus === 'approved' && !res.user.isBlocked) {
          navigate('/owner/dashboard');
        } else {
          setSuccessMsg('Checked live status: Super Admin review is still in progress.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const fillDemoOwner = () => {
    setEmail('owner@eventstay.com');
    setPassword('password123');
    setError('');
  };

  // -------------------------------------------------------------
  // VIEW: LOGGED-IN OWNER WITH PENDING/REJECTED/BLOCKED STATUS
  // -------------------------------------------------------------
  if (isAuthenticated && user?.role === 'owner' && (user?.ownerApprovalStatus !== 'approved' || user?.isBlocked)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          {user?.isBlocked ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-rose-300">Account Suspended</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your hotel owner account has been blocked by Platform Super Administrator{' '}
                  <span className="font-bold text-white">Ved Prakash Pandey</span>.
                </p>
                {user?.blockReason && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                    Reason: {user.blockReason}
                  </div>
                )}
              </div>
            </>
          ) : user?.ownerApprovalStatus === 'rejected' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-rose-300">Registration Rejected</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your hotel registration was reviewed and declined by Platform Super Administrator{' '}
                  <span className="font-bold text-white">Ved Prakash Pandey</span>.
                </p>
                {user?.ownerRejectionReason && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                    Admin Note: {user.ownerRejectionReason}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase">
                  <span>Pending Admin Approval</span>
                </div>
                <h2 className="text-2xl font-black text-white">Hotel Under Review</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your hotel registration for <span className="font-bold text-indigo-300">{user?.businessName || 'Property'}</span> is currently pending review by Super Admin{' '}
                  <span className="font-bold text-white">Ved Prakash Pandey</span>.
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
                  <span className="font-bold text-indigo-400">{user?.businessName || 'Registered Venue'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Review Status:</span>
                  <span className="font-bold text-amber-400">⏳ Awaiting Super Admin Decision</span>
                </div>
              </div>

              {successMsg && (
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                  {successMsg}
                </div>
              )}

              <button
                type="button"
                onClick={refreshApprovalStatus}
                disabled={checkingStatus}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                <span>{checkingStatus ? 'Checking Live Approval Status...' : 'Check Approval Status'}</span>
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-800">
            <Link to="/" className="text-xs text-slate-400 hover:text-white underline">
              Return to Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: DEDICATED HOTEL OWNER GATEWAY FORM (Sign In / Register / Reset)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f26] to-slate-950 text-white py-12 px-4 flex flex-col justify-center items-center">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/30">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-extrabold uppercase">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Dedicated Hotelier Window</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Hotel & Venue Owner Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Register your property, manage live bookings, and access your verified venue dashboard.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError('');
            }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Hotel
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forgot_password');
              setError('');
            }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'forgot_password'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reset Request
          </button>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 1: OWNER SIGN IN                                    */}
          {/* ======================================================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Quick Demo Owner Pill */}
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-indigo-300 block">⚡ Demo Hotel Owner:</span>
                  Ved Prakash Pandey (Approved Host)
                </div>
                <button
                  type="button"
                  onClick={fillDemoOwner}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                >
                  Auto-fill Creds
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Owner Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@eventstay.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot_password')}
                    className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot Password? (Admin Authority)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter owner password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying Hotel Credentials...' : 'Sign In to Hotel Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                New hotel or resort partner?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                  Register your property here
                </button>
              </div>
            </form>
          )}

          {/* ======================================================= */}
          {/* TAB 2: REGISTER HOTEL / VENUE (Admin Approval Flow)     */}
          {/* ======================================================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterHotel} className="space-y-3.5">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Admin Approval Governed Registration:</span>
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Upon submission, your hotel application is queued for Super Admin (Ved Prakash Pandey) review. Once approved, your hotel portal is activated.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Host Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Singhania"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="partner@heritagepalace.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Hotel / Brand Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Royal Heritage Haveli & Banquets"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Password (Min 6)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Submitting Application...' : 'Submit Hotel Registration for Admin Review →'}</span>
              </button>

              <div className="text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* ======================================================= */}
          {/* TAB 3: FORGOT PASSWORD (REQUEST ADMIN APPROVAL)          */}
          {/* ======================================================= */}
          {activeTab === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-200">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Authority Password Reset:</span>
                </span>
                <p className="text-slate-400 leading-relaxed">
                  As per platform security policy, only Super Administrator Ved Prakash Pandey has authority to approve and activate password resets for hotel owners.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-emerald-300">{forgotSuccess}</p>
                  <p className="text-[11px] text-slate-400">
                    Once Super Admin approves, your updated password will become active.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="mt-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Registered Owner Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="owner@eventstay.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Requested New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={requestedPassword}
                      onChange={(e) => setRequestedPassword(e.target.value)}
                      placeholder="Desired new password (min 6 chars)"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Reason / Note for Admin
                    </label>
                    <textarea
                      rows={2}
                      value={forgotReason}
                      onChange={(e) => setForgotReason(e.target.value)}
                      placeholder="e.g. Forgot password during resort branch onboarding..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting to Admin...' : 'Submit Request to Super Admin'}</span>
                  </button>

                  <div className="text-center text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-indigo-400 hover:underline"
                    >
                      Back to Hotel Owner Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* Return to Marketplace link */}
        <div className="text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-white underline">
            Return to EventStay Customer Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
