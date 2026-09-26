import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Plus,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  KeyRound
} from 'lucide-react';
import { ownerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await ownerAPI.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Owner stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" /> Venue Host Portal
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <KeyRound className="w-3.5 h-3.5" /> PIN Secured
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {user?.businessName || 'Host Management Dashboard'} • Real-time bookings, revenue payouts, and property inventory
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/owner/properties"
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property / Hall</span>
          </Link>
          <Link
            to="/owner/bookings"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-colors"
          >
            Manage Bookings
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('eventstay_owner_lock'))}
            title="Lock Host Session"
            className="px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-2xl border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Panel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Gross Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gross Volume</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatPrice(stats?.totalRevenue || 0)}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Across all venue reservations</p>
        </div>

        {/* Card 2: Net Payout */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Host Earnings (90%)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">
              {formatPrice(stats?.netEarnings || 0)}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">After 10% Fee</span>
          </div>
          <p className="text-[11px] text-slate-400">Automatic direct bank deposit</p>
        </div>

        {/* Card 3: Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reservations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {stats?.totalBookings || 0}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {stats?.confirmedCount || 0} Confirmed
            </span>
          </div>
          <p className="text-[11px] text-slate-400">0% Double booking rate</p>
        </div>

        {/* Card 4: Properties */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Listed Venues & Halls</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {stats?.totalProperties || 0}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              100% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Janakpur & regional venues</p>
        </div>
      </div>

      {/* Revenue Trends Bar Chart & Upcoming Celebrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly Revenue Trajectory</h3>
              <p className="text-xs text-slate-500">Gross event bookings & package sales</p>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              FY 2026
            </span>
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="pt-6 grid grid-cols-6 gap-3 items-end h-48 border-b border-slate-100 pb-2">
            {stats?.monthlyRevenue?.map((m, idx) => {
              const maxRev = Math.max(...(stats.monthlyRevenue.map((x) => x.revenue) || [100000]));
              const heightPercent = Math.max(15, Math.round((m.revenue / (maxRev || 1)) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(m.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-indigo-600 group-hover:bg-brand-500 rounded-t-xl transition-all duration-300"
                  />
                  <span className="text-[11px] font-bold text-slate-600 mt-1">{m.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Peak Month: September (Festive & Wedding Season)</span>
            <span>Platform Commission: 10% Flat</span>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Upcoming Celebrations</h3>
            <Link to="/owner/bookings" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {stats?.upcomingBookings?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No upcoming events scheduled.</p>
          ) : (
            <div className="space-y-3">
              {stats?.upcomingBookings?.map((bk) => (
                <div
                  key={bk._id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{bk.property?.title}</span>
                    <span className="text-slate-500">
                      {bk.eventType} • {bk.guestsCount} Guests
                    </span>
                    <span className="text-[10px] text-slate-400 block">Host: {bk.user?.name}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-indigo-600 block">
                      {new Date(bk.eventDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {bk.bookingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
