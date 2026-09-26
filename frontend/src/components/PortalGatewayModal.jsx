import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  Users,
  X,
  ArrowRight,
  Sparkles,
  Bed,
  CheckCircle2,
  Lock,
  Layers,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PortalGatewayModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [rememberChoice, setRememberChoice] = useState(false);

  if (!isOpen) return null;

  const handleSelectPortal = (portalKey) => {
    if (rememberChoice) {
      localStorage.setItem('eventstay_default_portal', portalKey);
    }

    if (portalKey === 'customer') {
      navigate('/');
    } else if (portalKey === 'owner') {
      navigate('/owner/portal');
    } else if (portalKey === 'admin') {
      sessionStorage.removeItem('eventstay_admin_verified');
      sessionStorage.removeItem('eventstay_admin_verified_time');
      window.dispatchEvent(new Event('eventstay_admin_lock'));
      navigate('/admin/portal');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#003580] via-[#00224f] to-slate-950 p-6 sm:p-8 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#febb02]/20 border border-[#febb02]/40 text-[#febb02] text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated Platform Gateways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome to Event<span className="text-[#febb02]">Stay</span>.com
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Choose your dedicated portal window to enter. Each portal is completely separate and customized for your specific platform role.
            </p>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50">
          {/* 1. Customer Portal */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-[#006ce4] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#006ce4] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Bed className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006ce4] block">
                  Public Marketplace
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Customer Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For guests, travelers, and event organizers looking for stays and venues.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Explore Hotels & Palaces (100+ Cities)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>AI Event Package Recommendation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant Bookings & Digital Invoices</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPortal('customer')}
              className="mt-6 w-full py-3 px-4 bg-[#006ce4] hover:bg-[#0057b8] active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Customer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Hotel Owner Portal */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                  Hospitality Partners
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Hotel Owner Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For hotel, resort, and banquet hall owners to register & manage their venues.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Register Hotel (Admin Approval Flow)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Manage Your Own Venue Listings & Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Track Guest Bookings & Revenue Reports</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPortal('owner')}
              className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Hotel Owner Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. Super Admin Oversight Portal */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
                  Restricted Governance
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Super Admin Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Restricted command desk for Ved Prakash Pandey to oversee all platform activities.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hotel Owner Approvals (Approve/Reject)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Owner Password Authority & Account Blocking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Review Admin Access Applications</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPortal('admin')}
              className="mt-6 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-500/30"
            >
              <span>Enter Super Admin Portal</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="rounded border-slate-300 text-[#006ce4] focus:ring-[#006ce4]"
            />
            <span>Remember my portal preference for future visits</span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Continue as Guest / Close
          </button>
        </div>
      </div>
    </div>
  );
}
