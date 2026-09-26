import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  Lock,
  KeyRound,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Eye,
  EyeOff,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import ExcelUploadModal from '../components/ExcelUploadModal';
import AdminHeader from '../components/AdminHeader';
import AdminHandoverModal from '../components/AdminHandoverModal';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [updatingPin, setUpdatingPin] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, secRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getProperties(),
        adminAPI.getSecurityStatus().catch(() => ({ success: false }))
      ]);

      if (sRes.success) setStats(sRes.stats);
      if (pRes.success) setProperties(pRes.properties || []);
      if (secRes?.success) setSecurityStatus(secRes);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleApprove = async (propId) => {
    try {
      const res = await adminAPI.toggleApproveProperty(propId);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Approval toggle failed');
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!newPin || !/^\d{4,8}$/.test(newPin)) {
      setPinError('New PIN must be 4 to 8 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PIN and confirmation do not match.');
      return;
    }

    setUpdatingPin(true);
    try {
      const res = await adminAPI.updateSecurityPin({
        currentPin: currentPin || '998877',
        newPin
      });
      if (res.success) {
        setPinSuccess('Security PIN updated successfully!');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setSecurityStatus((prev) => ({ ...prev, hasCustomPin: true }));
        setTimeout(() => {
          setPinModalOpen(false);
          setPinSuccess('');
        }, 1500);
      } else {
        throw new Error(res.message || 'Failed to update PIN');
      }
    } catch (err) {
      setPinError(err.message || 'Incorrect current PIN or update failed.');
    } finally {
      setUpdatingPin(false);
    }
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        onOpenExcel={() => setExcelModalOpen(true)}
        onOpenHandover={() => setHandoverModalOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Security & Handover Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Security PIN Gate */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white border border-slate-800 shadow-md flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Security PIN Defense
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Enforced
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Protected by private administrator PIN with automated Email OTP recovery.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setPinModalOpen(true);
                  setPinError('');
                  setPinSuccess('');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change PIN</span>
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('eventstay_admin_verified');
                  sessionStorage.removeItem('eventstay_admin_verified_time');
                  window.dispatchEvent(new Event('eventstay_admin_lock'));
                }}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Lock Panel</span>
              </button>
            </div>
          </div>

          {/* Card 2: Platform Handover & Clean Slate Reset */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/70 rounded-2xl p-5 text-white border border-amber-900/40 shadow-md flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <UserX className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Platform Handover & Wipe
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Clean Slate
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Transfer platform ownership to a new admin and delete all details of previous admin.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setHandoverModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Transfer & Reset Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-700">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Platform Superadmin Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            EventStay Ecosystem Control
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Platform GMV, 10% marketplace commission metrics, host approvals, and dispute arbitration
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
          >
            <span>Support Desk</span>
            {stats?.openComplaints > 0 && (
              <span className="w-5 h-5 bg-slate-900 text-amber-400 rounded-full flex items-center justify-center text-[10px] font-black">
                {stats.openComplaints}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: GMV */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Platform GMV</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{formatPrice(stats?.totalGMV || 0)}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total gross event transaction volume</p>
        </div>

        {/* KPI 2: Commission */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Commission (10%)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-600">
              {formatPrice(stats?.platformCommission || 0)}
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Net Revenue
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Pure platform monetization</p>
        </div>

        {/* KPI 3: Users & Hosts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Users & Venue Hosts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {(stats?.totalUsers || 0) + (stats?.totalOwners || 0)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {stats?.totalOwners} Venue Hosts
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Verified platform accounts</p>
        </div>

        {/* KPI 4: Venues */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Listed Venues & Palaces</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats?.totalProperties || 0}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {stats?.approvedProperties} Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{stats?.totalBookings} Total Bookings</p>
        </div>
      </div>

      {/* Property Moderation & Event Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Properties Approval Desk */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Venue Moderation & Approval Registry</h3>
              <p className="text-xs text-slate-500">Review submitted properties or bulk import via spreadsheet</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExcelModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import Excel</span>
              </button>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">{properties.length} Properties</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {properties.map((prop) => (
              <div key={prop._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={prop.images?.[0]}
                    alt={prop.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-sm">{prop.title}</h4>
                    <p className="text-slate-500">{prop.city} • Capacity {prop.maxCapacity} • Host: {prop.owner?.name}</p>
                    <span className="text-[10px] text-slate-400">Base Price: {formatPrice(prop.basePrice)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      prop.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prop.isApproved ? 'Approved' : 'Pending'}
                  </span>

                  <button
                    onClick={() => handleToggleApprove(prop._id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                      prop.isApproved
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {prop.isApproved ? 'Suspend' : 'Approve Venue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Type Share Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Event Type Distribution</h3>

          <div className="space-y-3">
            {stats?.eventTypeStats?.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{item._id || 'Wedding'}</span>
                  <span>{item.count} Bookings</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Total Volume:</span>
                  <span className="font-extrabold text-brand-600">{formatPrice(item.volume)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-extrabold block">Commission Payout Formula:</span>
            <p className="text-amber-800">
              Platform deducts 10% from every completed booking and automatically routes 90% to the venue host escrow account.
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Excel / CSV Upload Modal */}
      <ExcelUploadModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={() => fetchAdminData()}
      />

      {/* Change Admin Master PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Update Master PIN</h3>
                  <p className="text-xs text-slate-400">Change your secondary admin passcode</p>
                </div>
              </div>
              <button
                onClick={() => setPinModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Current Security PIN
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current PIN"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  New Master PIN (4 to 8 digits)
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={8}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm New Master PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter new PIN"
                  maxLength={8}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {pinError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{pinSuccess}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPin}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingPin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save New PIN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Handover & Previous Admin Details Wipe Modal */}
      <AdminHandoverModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
      />
      </div>
    </div>
  );
}
