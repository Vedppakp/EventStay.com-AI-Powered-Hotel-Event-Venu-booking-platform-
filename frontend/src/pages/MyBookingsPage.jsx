import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Building2,
  Calendar,
  Users,
  Printer,
  XCircle,
  Star,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import BookingReceiptModal from '../components/BookingReceiptModal';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReceiptBooking, setActiveReceiptBooking] = useState(null);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Cancel dialog state
  const [cancelBookingTarget, setCancelBookingTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings();
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error('Error loading my bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelBookingTarget) return;
    setIsCancelling(true);
    try {
      const res = await bookingAPI.cancel(cancelBookingTarget._id, cancelReason);
      if (res.success) {
        setCancelBookingTarget(null);
        setCancelReason('');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setIsSubmittingReview(true);
    try {
      const res = await bookingAPI.addReview(reviewBooking._id, {
        rating,
        comment,
        eventType: reviewBooking.eventType
      });
      if (res.success) {
        alert('Thank you! Your review has been submitted.');
        setReviewBooking(null);
        setComment('');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Bookings & Event Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your reservations, download official tax invoices, or request date modifications
          </p>
        </div>

        <Link
          to="/planner"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>Plan New Event</span>
        </Link>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-4">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No bookings yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to organize your wedding, birthday, or corporate celebration? Discover vetted venues and bundle your services.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl"
          >
            Explore Venues Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === 'cancelled';
            const isCompleted = booking.bookingStatus === 'completed';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Image & Info */}
                <div className="flex gap-4 items-start">
                  <img
                    src={
                      booking.property?.images?.[0] ||
                      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={booking.property?.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0"
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800'
                            : isCompleted
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Ref: {booking.bookingNumber}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                      {booking.property?.title}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {booking.guestsCount} Guests ({booking.eventType})
                      </span>
                    </div>

                    {booking.selectedServices?.length > 0 && (
                      <p className="text-[11px] text-slate-400">
                        Bundled: {booking.selectedServices.map((s) => s.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Pricing & Action Buttons */}
                <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                  <div className="sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Total Paid</span>
                    <span className="text-xl font-black text-brand-600">
                      {formatPrice(booking.pricing?.totalAmount)}
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-bold">
                      Payment {booking.payment?.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveReceiptBooking(booking)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Receipt
                    </button>

                    {!isCancelled && (
                      <>
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          Review
                        </button>

                        <button
                          onClick={() => setCancelBookingTarget(booking)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Receipt Modal */}
      {activeReceiptBooking && (
        <BookingReceiptModal
          booking={activeReceiptBooking}
          onClose={() => setActiveReceiptBooking(null)}
        />
      )}

      {/* Cancellation Modal */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Cancel Booking {cancelBookingTarget.bookingNumber}?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel this reservation for{' '}
              <strong>{cancelBookingTarget.property?.title}</strong>? Free cancellation terms apply and refund will be credited back.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows="2"
                placeholder="Change of dates, guest count change, etc."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelBookingTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 font-bold text-xs rounded-xl text-slate-700 hover:bg-slate-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-xs rounded-xl text-white shadow"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Review {reviewBooking.property?.title}
            </h3>

            <div className="flex items-center gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Share your experience
              </label>
              <textarea
                rows="3"
                required
                placeholder="How was the hall ambiance, lighting, catering, and staff coordination?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReviewBooking(null)}
                className="flex-1 py-2.5 bg-slate-100 font-bold text-xs rounded-xl text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !comment.trim()}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 font-bold text-xs rounded-xl text-white shadow"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
