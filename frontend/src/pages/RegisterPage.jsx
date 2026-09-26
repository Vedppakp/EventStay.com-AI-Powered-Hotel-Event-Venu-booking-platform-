import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Lock, Mail, User, Phone, ArrowRight, CheckCircle2, Sparkles, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const queryRole = searchParams.get('role');
  const [role, setRole] = useState(
    queryRole === 'owner' ? 'owner' : queryRole === 'planner' ? 'planner' : 'customer'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (queryRole === 'owner') setRole('owner');
    else if (queryRole === 'planner') setRole('planner');
    else if (queryRole === 'customer') setRole('customer');
  }, [queryRole]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const backendRole = role === 'owner' ? 'owner' : 'customer';
      await register({
        name,
        email,
        password,
        phone,
        role: backendRole,
        businessName: role === 'owner' ? businessName : ''
      });
      if (role === 'owner') navigate('/owner/dashboard');
      else if (role === 'planner') navigate('/planner');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/30">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create EventStay Account
        </h1>
        <p className="text-xs text-slate-500">
          Join as a customer to book stays & venues, plan events, or register your property
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {/* Role Toggle with 3 options: Customer, Planner, Owner */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
            I want to join as
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                role === 'customer'
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="text-sm">👤</span>
              <span className="truncate w-full text-center">Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('planner')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                role === 'planner'
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="text-sm">🎉</span>
              <span className="truncate w-full text-center">Event Planner</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                role === 'owner'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="text-sm">🏨</span>
              <span className="truncate w-full text-center">Venue Owner</span>
            </button>
          </div>
        </div>

        {/* Informative Perks Tag for Customer */}
        {role === 'customer' && (
          <div className="p-3 bg-brand-50/80 border border-brand-200/70 rounded-2xl text-[11px] text-brand-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-brand-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>Customer Account Privileges:</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Book verified hotels, villas & wedding halls across 100+ cities in India & Nepal, save favorite venues, and track bookings seamlessly.
            </p>
          </div>
        )}

        {role === 'planner' && (
          <div className="p-3 bg-purple-50/80 border border-purple-200/70 rounded-2xl text-[11px] text-purple-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-purple-700">
              <PartyPopper className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Event Planner Account:</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Bundle banquets, catering, decor & photography packages with instant budget optimization and vendor management tools.
            </p>
          </div>
        )}

        {role === 'owner' && (
          <div className="p-3 bg-indigo-50/80 border border-indigo-200/70 rounded-2xl text-[11px] text-indigo-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Venue & Hotel Partner Portal:</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              List properties, update live pricing, manage room inventories, and access verified customer inquiries.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {role === 'owner' && (
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Hospitality / Business Brand Name
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Singhania Heritage Resorts"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
            role === 'owner'
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              : role === 'planner'
              ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
              : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
          }`}
        >
          <span>
            {loading
              ? 'Creating Account...'
              : role === 'owner'
              ? 'Create Host Account'
              : role === 'planner'
              ? 'Create Planner Account'
              : 'Create Customer Account'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
