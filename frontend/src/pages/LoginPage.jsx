import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  UserPlus,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register, switchRoleDemo } = useAuth();

  const initialMode =
    searchParams.get('mode') === 'register' || location.state?.mode === 'register'
      ? 'register'
      : 'signin';
  const [authMode, setAuthMode] = useState(initialMode);

  // Sign In state
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');

  // Register Customer state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setAuthMode('register');
    } else if (searchParams.get('mode') === 'signin') {
      setAuthMode('signin');
    }
  }, [searchParams]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: 'customer'
      });
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message || 'Customer registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    setError('');
    try {
      await switchRoleDemo(role);
      if (role === 'owner') navigate('/owner/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('customer@eventstay.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/30">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to Event<span className="text-brand-600">Stay</span>
        </h1>
        <p className="text-xs text-slate-500">
          {authMode === 'signin'
            ? 'Sign in to manage bookings, venues, or marketplace packages'
            : 'Create your personal customer account to book stays and event venues'}
        </p>
      </div>

      {/* Auth Mode Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setAuthMode('signin');
            setError('');
          }}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'signin'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-brand-600" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setError('');
          }}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'register'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Customer Account</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: SIGN IN TO ACCOUNT                               */}
        {/* ======================================================== */}
        {authMode === 'signin' && (
          <div className="space-y-5">
            {/* Quick Action: Create Account as Customer */}
            <div className="p-3.5 bg-gradient-to-r from-brand-50 via-rose-50/50 to-indigo-50/60 border border-brand-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>New Customer?</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Create EventStay Account as customer for easy bookings
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                }}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                Register Now →
              </button>
            </div>

            {/* 1-Click Demo Buttons Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  ⚡ 1-Click Instant Demo Login
                </span>
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="text-[10px] text-brand-600 hover:underline font-bold"
                >
                  Fill Customer Creds
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoClick('customer')}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span>👤 Customer (Aarav Sharma)</span>
                  <span className="text-[10px] text-brand-600 font-extrabold">Instant Login →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('owner')}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span>🏨 Venue Owner (Ved Prakash Pandey)</span>
                  <span className="text-[10px] text-indigo-600 font-extrabold">Instant Login →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('admin')}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span>👨‍💼 Super Admin (Ved Prakash Pandey)</span>
                  <span className="text-[10px] text-amber-600 font-extrabold">Instant Login →</span>
                </button>
              </div>
            </div>

            {/* Regular Email Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setError('');
                    }}
                    className="font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Create EventStay Account as Customer
                  </button>
                </p>
                <p className="text-[11px] text-slate-400">
                  Are you a hotel or wedding hall owner?{' '}
                  <Link to="/register?role=owner" className="font-bold text-indigo-600 hover:underline">
                    Host Registration
                  </Link>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CREATE EVENTSTAY ACCOUNT AS CUSTOMER              */}
        {/* ======================================================== */}
        {authMode === 'register' && (
          <form onSubmit={handleCustomerRegisterSubmit} className="space-y-4">
            {/* Customer Perks Banner */}
            <div className="p-3 bg-brand-50/90 border border-brand-200/80 rounded-2xl text-[11px] text-brand-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-brand-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Create EventStay Account as Customer:</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Sign up as a customer to book hotels, luxury banquet halls across 100+ cities in India & Nepal, save wishlists, and manage reservations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength="6"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating Customer Account...' : 'Create EventStay Account as Customer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError('');
                  }}
                  className="font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
              <p className="text-[11px] text-slate-400">
                Want to register as a Venue / Hotel Owner?{' '}
                <Link to="/register?role=owner" className="font-bold text-indigo-600 hover:underline">
                  Owner Portal Registration
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
