import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Cpu,
  X,
  Mail,
  Send,
  UserPlus,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const SESSION_KEY = 'eventstay_admin_verified';
const TIMESTAMP_KEY = 'eventstay_admin_verified_time';
const MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export default function AdminSecurityGuard({ children }) {
  const { user, isAuthenticated, loading: authLoading, demoLogin } = useAuth();

  const [isVerified, setIsVerified] = useState(() => {
    const verified = sessionStorage.getItem(SESSION_KEY) === 'true';
    const timestamp = parseInt(sessionStorage.getItem(TIMESTAMP_KEY) || '0', 10);
    const isValid = verified && Date.now() - timestamp < MAX_SESSION_DURATION;
    return isValid;
  });

  // Panel Mode: 'verify' (default) or 'register'
  const [panelMode, setPanelMode] = useState('verify'); // 'verify' | 'register'
  const [postRegNotice, setPostRegNotice] = useState('');

  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Admin Registration form state
  const [regName, setRegName] = useState(user?.name || 'Ved Prakash Pandey');
  const [regEmail, setRegEmail] = useState(user?.email || 'admin@eventstay.com');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  // Forgot PIN state
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: send otp, 2: verify & set pin
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPin, setForgotNewPin] = useState('');
  const [forgotConfirmPin, setForgotConfirmPin] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotDevPreview, setForgotDevPreview] = useState('');

  // Fetch security settings
  const fetchSecurityStatus = async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    try {
      const res = await adminAPI.getSecurityStatus();
      if (res.success) {
        if (res.adminName) setRegName(res.adminName);
        if (res.adminEmail) setRegEmail(res.adminEmail);
        if (res.adminRegistrationCompleted === false && !res.hasCustomPin) {
          setPanelMode('register');
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin security status:', err);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, [isAuthenticated, user]);

  // Listen to manual lock events from header
  useEffect(() => {
    const handleLockEvent = () => {
      setIsVerified(false);
      setPin('');
      setError('');
    };

    window.addEventListener('eventstay_admin_lock', handleLockEvent);
    return () => window.removeEventListener('eventstay_admin_lock', handleLockEvent);
  }, []);

  // Unlock session handler
  const grantAccess = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    sessionStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    setIsVerified(true);
    setError('');
  };

  // Submit Admin Registration & Proceed to Verification
  const handleRegisterAdminSubmit = async (e) => {
    if (e) e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please enter administrator full name');
      return;
    }
    if (!regEmail.trim() || !/^\S+@\S+\.\S+$/.test(regEmail.trim())) {
      setRegError('Please enter a valid administrator email address');
      return;
    }
    if (!regPin.trim() || !/^\d{4,8}$/.test(regPin.trim())) {
      setRegError('Security PIN must be 4 to 8 digits');
      return;
    }
    if (regPin.trim() !== regConfirmPin.trim()) {
      setRegError('Security PIN and Confirm PIN do not match');
      return;
    }

    setRegistering(true);

    try {
      const res = await adminAPI.registerAdmin({
        name: regName.trim(),
        email: regEmail.trim(),
        pin: regPin.trim()
      });

      if (res.success) {
        await fetchSecurityStatus();
        setPanelMode('verify');
        setPostRegNotice(`🎉 Admin Profile Registered for ${regName.trim()}! Please enter your Security PIN to unlock.`);
        setPin('');
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setRegError(err.message || 'Failed to register admin profile');
    } finally {
      setRegistering(false);
    }
  };

  // Request 6-digit OTP to registered email
  const handleRequestForgotPin = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await adminAPI.forgotPin();
      if (res.success) {
        setForgotStep(2);
        setForgotSuccess(res.message || 'Verification code sent to your email.');
        if (res.devPreviewOtp) {
          setForgotDevPreview(res.devPreviewOtp);
        }
      } else {
        throw new Error(res.message || 'Failed to dispatch reset code');
      }
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Verify OTP and update Security PIN
  const handleResetPinWithOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit code received on your email');
      return;
    }
    if (!forgotNewPin.trim() || !/^\d{4,8}$/.test(forgotNewPin.trim())) {
      setForgotError('New Security PIN must be 4 to 8 digits');
      return;
    }
    if (forgotNewPin.trim() !== forgotConfirmPin.trim()) {
      setForgotError('New PIN and Confirm PIN do not match');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await adminAPI.verifyOtpAndSetPin({
        otp: forgotOtp.trim(),
        newPin: forgotNewPin.trim()
      });

      if (res.success) {
        setForgotSuccess('✅ Security PIN reset successfully! You can now unlock.');
        setPin(forgotNewPin.trim());
        setTimeout(() => {
          setShowForgotPinModal(false);
          setForgotStep(1);
          setForgotOtp('');
          setForgotNewPin('');
          setForgotConfirmPin('');
          setForgotSuccess('');
          setForgotDevPreview('');
        }, 1500);
      } else {
        throw new Error(res.message || 'Failed to reset PIN');
      }
    } catch (err) {
      setForgotError(err.message || 'Invalid verification code or failed to reset PIN');
    } finally {
      setForgotLoading(false);
    }
  };

  // 7. PIN / Password Verification Flow
  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter your Security PIN');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      const res = await adminAPI.verifySecurity({
        pin: pin.trim(),
        password: pin.trim()
      });

      if (res.success && res.verified) {
        grantAccess();
      } else {
        throw new Error(res.message || 'Invalid Security PIN or Password');
      }
    } catch (err) {
      setError(err.message || 'Invalid Security PIN. If forgotten, click "Forgot PIN" below.');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeypadPress = (val) => {
    if (val === 'CLEAR') {
      setPin('');
      setError('');
    } else if (val === 'BACKSPACE') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 12) {
        setPin((prev) => prev + val);
      }
    }
  };

  // If Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-sm font-semibold">Verifying administrative credentials...</span>
        </div>
      </div>
    );
  }

  // If Not Authenticated or Not Admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-white shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Restricted Admin Zone
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This terminal is reserved exclusively for EventStay platform superadministrators. Please log in with authorized admin credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => demoLogin('admin')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Demo Superadmin</span>
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If Already Verified for this Session, Render Children
  if (isVerified) {
    return <>{children}</>;
  }

  // --- RENDER HIGH-SECURITY ACCESS GATE (PIN ONLY) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#071329] to-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>ADMIN SECURITY SHIELD ACTIVE</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Superadmin Access Verification
          </h2>
          <p className="text-xs text-slate-400">
            Administrator: <span className="font-bold text-cyan-300">{user?.name || 'Ved Prakash Pandey'}</span> <span className="text-slate-500">({user?.email})</span>
          </p>
        </div>

        {/* Mode Switcher: Verify Access vs Register Admin */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setPanelMode('verify');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              panelMode === 'verify'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Access</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPanelMode('register');
              setRegError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              panelMode === 'register'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Admin</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODE A: ADMIN REGISTRATION & PIN SETUP                   */}
        {/* ======================================================== */}
        {panelMode === 'register' && (
          <form onSubmit={handleRegisterAdminSubmit} className="space-y-4 py-1">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
              <p className="font-bold text-cyan-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Registration & Security PIN Setup</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Register your administrator credentials and set up your private Security PIN to protect platform access.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ved Prakash Pandey"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Administrator Official Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. admin@eventstay.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Security PIN (4-8 digits)
                  </label>
                  <input
                    type="password"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="Create PIN"
                    maxLength={8}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:font-sans focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Confirm Security PIN
                  </label>
                  <input
                    type="password"
                    value={regConfirmPin}
                    onChange={(e) => setRegConfirmPin(e.target.value)}
                    placeholder="Confirm PIN"
                    maxLength={8}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:font-sans focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-center"
                  />
                </div>
              </div>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={registering}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {registering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Registering Admin Profile...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration & Unlock with PIN →</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* MODE B: VERIFY ACCESS (UNLOCK WITH PIN)                  */}
        {/* ======================================================== */}
        {panelMode === 'verify' && (
          <div className="space-y-4 py-1">
            {/* Post-Registration Notification Banner */}
            {postRegNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start justify-between gap-2.5 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{postRegNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPostRegNotice('')}
                  className="text-emerald-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* PIN/Password Unlock Form */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-300 block mb-0.5">
                    Security Verification Required:
                  </span>
                  Password or PIN is required every time you switch to the Super Admin Portal.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enter Admin Password or PIN:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter Password (admin123) or PIN (998877)"
                    autoFocus
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-mono text-white placeholder:text-slate-600 placeholder:text-xs placeholder:font-sans focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                {/* Quick Helper Buttons for Fast Access */}
                <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPin('admin123')}
                      className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-[10px] font-bold"
                    >
                      Fill Password (admin123)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPin('123123')}
                      className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-bold"
                    >
                      Fill PIN (123123)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPinModal(true);
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                      setForgotDevPreview('');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1 cursor-pointer text-[10px]"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Forgot PIN?</span>
                  </button>
                </div>
              </div>

              {/* Visual Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num.toString())}
                    className="py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-900/50 text-white font-mono text-base font-bold transition-all border border-slate-700/50 cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('CLEAR')}
                  className="py-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-rose-400 font-bold text-xs transition-all border border-slate-700/50 cursor-pointer select-none"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-mono text-base font-bold transition-all border border-slate-700/50 cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('BACKSPACE')}
                  className="py-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all border border-slate-700/50 cursor-pointer select-none"
                >
                  ⌫
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Verify Password & Unlock Admin Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-2 animate-shake">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Admin Security Shield
          </span>
          <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Back to Platform →
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FORGOT PIN MODAL (EMAIL OTP VERIFICATION)                */}
      {/* ======================================================== */}
      {showForgotPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Security PIN</h3>
                  <p className="text-xs text-slate-400">Receive a one-time verification code via email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPinModal(false);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotStep === 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  We will send a secure 6-digit one-time verification code (OTP) to your registered administrator email:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="font-mono text-sm text-cyan-300 font-bold">{user?.email || 'admin@eventstay.com'}</span>
                </div>

                {forgotError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPinModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestForgotPin}
                    disabled={forgotLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reset Code to Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPinWithOtp} className="space-y-4">
                {forgotDevPreview && (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email Dispatched! [Dev Code Preview]:</span>
                    </p>
                    <p className="font-mono text-base font-black text-cyan-200 tracking-widest pl-5">
                      {forgotDevPreview}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Enter 6-Digit Email Verification Code
                    </label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 123456"
                      maxLength={6}
                      autoFocus
                      required
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        New Security PIN
                      </label>
                      <input
                        type="password"
                        value={forgotNewPin}
                        onChange={(e) => setForgotNewPin(e.target.value)}
                        placeholder="4-8 digits"
                        maxLength={8}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono tracking-widest text-center text-white focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Confirm New PIN
                      </label>
                      <input
                        type="password"
                        value={forgotConfirmPin}
                        onChange={(e) => setForgotConfirmPin(e.target.value)}
                        placeholder="Re-type PIN"
                        maxLength={8}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono tracking-widest text-center text-white focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {forgotError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    ← Re-send code
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPinModal(false)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Updating PIN...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Set New PIN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
