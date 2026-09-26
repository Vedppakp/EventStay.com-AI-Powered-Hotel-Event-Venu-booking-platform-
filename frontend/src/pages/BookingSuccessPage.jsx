import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, Calendar, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { bookingAPI } from '../services/api';
import BookingReceiptModal from '../components/BookingReceiptModal';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.getById(bookingId);
        if (res.success) {
          setBooking(res.booking);
        }
      } catch (err) {
        console.error('Error loading booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600">Retrieving confirmed booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-slate-600">Booking information not found.</p>
        <Link to="/" className="text-brand-600 font-bold hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      {/* Celebration Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Payment & Reservation Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Celebration is Booked!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            We have notified the host at <strong className="text-slate-800">{booking.property?.title}</strong>. Your event date is locked.
          </p>
        </div>

        {/* Highlight details box */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-left">
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Booking Ref</span>
            <span className="font-extrabold text-slate-900 text-sm">{booking.bookingNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Event Date</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {new Date(booking.eventDate).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Total Guests</span>
            <span className="font-extrabold text-slate-900 text-sm">{booking.guestsCount} Guests</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Total Amount</span>
            <span className="font-extrabold text-brand-600 text-sm">
              {formatPrice(booking.pricing?.totalAmount)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setReceiptOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Download & Print Tax Receipt</span>
          </button>

          <Link
            to="/my-bookings"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Go to My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Invoice Modal */}
      {receiptOpen && (
        <BookingReceiptModal booking={booking} onClose={() => setReceiptOpen(false)} />
      )}
    </div>
  );
}
