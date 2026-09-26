import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Users,
  Building2,
  FileSpreadsheet,
  Layers,
  UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader({ onOpenExcel, onLockAdmin, onOpenHandover }) {
  const location = useLocation();
  const { user } = useAuth();

  const handleLock = () => {
    if (onLockAdmin) {
      onLockAdmin();
    } else {
      sessionStorage.removeItem('eventstay_admin_verified');
      sessionStorage.removeItem('eventstay_admin_verified_time');
      window.dispatchEvent(new Event('eventstay_admin_lock'));
    }
  };

  const navItems = [
    { label: 'Control Desk', path: '/admin/dashboard', icon: Layers },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Dispute Desk', path: '/admin/complaints', icon: ShieldAlert }
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 sm:py-4">
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-[#003580] text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-[#febb02]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Superadmin Command Center
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  PIN Secured
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Administrator: <span className="font-bold text-slate-800">{user?.name || 'Ved Prakash Pandey'}</span> • Platform Governance & Control
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            {onOpenExcel && (
              <button
                onClick={onOpenExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Excel</span>
              </button>
            )}

            {onOpenHandover && (
              <button
                onClick={onOpenHandover}
                title="Transfer Platform Ownership & Wipe Previous Admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <UserX className="w-3.5 h-3.5 text-amber-600" />
                <span>Handover / Reset</span>
              </button>
            )}

            {/* Lock Admin Panel Button */}
            <button
              onClick={handleLock}
              title="Lock Admin Panel immediately"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Lock Panel</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-1 -mb-px overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#006ce4] text-[#006ce4]'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#006ce4]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
