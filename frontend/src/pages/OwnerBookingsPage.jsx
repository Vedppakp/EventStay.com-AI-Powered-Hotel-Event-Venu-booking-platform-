import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { ownerAPI } from '../services/api';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getBookings();
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error('Fetch owner bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await ownerAPI.updateBookingStatus(id, status);
      if (res.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.bookingStatus === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600">
            Venue Operations
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Customer Reservations & Event Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track booked dates, review guest counts, and mark celebrations completed
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No reservations found</h3>
          <p className="text-xs text-slate-400">
            {statusFilter !== 'all' ? `No bookings with status "${statusFilter}".` : 'No bookings have been made yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((bk) => (
            <div
              key={bk._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex gap-4 items-start">
                <img
                  src={bk.property?.images?.[0]}
                  alt={bk.property?.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {bk.property?.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                      {bk.bookingNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {new Date(bk.eventDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {bk.guestsCount} Guests ({bk.eventType})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 pt-1">
                    <span>Host: {bk.user?.name}</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {bk.contactDetails?.phone || bk.user?.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col sm:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Gross</span>
                  <span className="text-xl font-black text-indigo-600">{formatPrice(bk.pricing?.totalAmount)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {bk.bookingStatus === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(bk._id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(bk._id, 'cancelled')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {bk.bookingStatus === 'completed' && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 font-bold text-xs rounded-xl">
                      ✅ Event Completed
                    </span>
                  )}

                  {bk.bookingStatus === 'cancelled' && (
                    <span className="px-3 py-1 bg-rose-50 text-rose-800 font-bold text-xs rounded-xl">
                      ❌ Cancelled & Refunded
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
