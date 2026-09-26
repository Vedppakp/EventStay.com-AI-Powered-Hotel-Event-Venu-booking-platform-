import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  Landmark,
  Layers,
  AlertCircle
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [packageData, setPackageData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('eventstay_pending_package');
    if (!raw) {
      navigate('/planner');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setPackageData(parsed);
      if (parsed.specialRequests || parsed.notes) {
        setSpecialRequests(parsed.specialRequests || parsed.notes);
      }
    } catch (e) {
      navigate('/planner');
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setContactName(user.name || '');
      setContactEmail(user.email || '');
      setContactPhone(user.phone || '+91 98765 43210');
    }
  }, [user]);

  if (!packageData) return null;

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  const handlePayAndBook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in or select a demo account from the top bar to finalize your booking!');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const payload = {
        propertyId: packageData.property._id,
        unitId: packageData.unit?._id,
        bookingType: 'event_package',
        eventType: packageData.eventType,
        eventDate: packageData.eventDate,
        guestsCount: packageData.guestsCount,
        selectedServices: packageData.selectedServices?.map((s) => ({
          serviceId: s.service._id,
          quantity: s.quantity
        })),
        guestRoomsBooked: packageData.guestRoomsBooked?.map((r) => ({
          unitId: r.unit._id,
          roomsCount: r.roomsCount,
          nights: r.nights
        })),
        couponCode: packageData.couponApplied?.code,
        paymentMethod: `Simulated ${paymentMethod}`,
        specialRequests,
        contactDetails: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone
        }
      };

      const res = await bookingAPI.create(payload);

      if (res.success && res.booking) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        localStorage.removeItem('eventstay_pending_package');
        navigate(`/booking-success?id=${res.booking._id}`);
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMessage(err.message || 'Payment processing failed. Date might be conflicting.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
          Step 3 of 3 • Secure Checkout
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Review & Confirm Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review your itemized package, verify contact details, and complete your secure simulated payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Contact & Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Event Host & Primary Contact</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Special Requests (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Welcome marigold garland at entrance, extra green room chairs..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateway Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Select Payment Mode (Simulated Gateway)
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Demo Safe
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-600 bg-brand-50/40 text-brand-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-brand-600 mb-2" />
                <span className="text-xs font-bold">UPI / QR Code</span>
                <span className="text-[10px] text-slate-400 font-normal">GPay / PhonePe / Paytm</span>
              </div>

              <div
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'Card'
                    ? 'border-brand-600 bg-brand-50/40 text-brand-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="text-xs font-bold">Debit / Credit Card</span>
                <span className="text-[10px] text-slate-400 font-normal">Visa / MasterCard / RuPay</span>
              </div>

              <div
                onClick={() => setPaymentMethod('Net Banking')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'Net Banking'
                    ? 'border-brand-600 bg-brand-50/40 text-brand-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Landmark className="w-5 h-5 text-emerald-600 mb-2" />
                <span className="text-xs font-bold">Net Banking</span>
                <span className="text-[10px] text-slate-400 font-normal">HDFC / SBI / ICICI</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handlePayAndBook}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-brand-600 via-rose-600 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white font-black rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 text-sm transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Safe Payment & Holding Date...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Pay {formatPrice(packageData.pricing?.totalAmount)} & Confirm Booking
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Itemized Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              Package Bill Breakdown
            </h3>
          </div>

          {/* Property snippet */}
          <div className="flex gap-3 items-center p-3 bg-slate-50 rounded-2xl">
            <img
              src={packageData.property?.images?.[0]}
              alt={packageData.property?.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{packageData.property?.title}</h4>
              <p className="text-[11px] text-slate-500">{packageData.property?.city}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border">
                {packageData.eventType} • {packageData.guestsCount} Guests
              </span>
            </div>
          </div>

          {/* Line items list */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between font-medium">
              <span>Venue Space Rental</span>
              <span className="font-bold text-slate-900">{formatPrice(packageData.pricing?.venueBasePrice)}</span>
            </div>

            {packageData.selectedServices?.map((s, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate pr-2">{s.name}</span>
                <span className="font-bold text-slate-900">{formatPrice(s.subtotal)}</span>
              </div>
            ))}

            {packageData.guestRoomsBooked?.map((r, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate pr-2">{r.roomName} ({r.roomsCount} rooms)</span>
                <span className="font-bold text-slate-900">{formatPrice(r.subtotal)}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-100 flex justify-between font-semibold text-slate-700">
              <span>Subtotal</span>
              <span>
                {formatPrice(
                  packageData.pricing?.venueBasePrice +
                  packageData.pricing?.servicesTotal +
                  packageData.pricing?.roomsTotal
                )}
              </span>
            </div>

            {packageData.pricing?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Applied</span>
                <span>-{formatPrice(packageData.pricing?.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>Platform Service & GST (12%)</span>
              <span>+{formatPrice(packageData.pricing?.taxAmount)}</span>
            </div>

            <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline text-sm font-black text-slate-900">
              <span>Total Amount Payable</span>
              <span className="text-2xl text-brand-600">{formatPrice(packageData.pricing?.totalAmount)}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>EventStay Trust & Guarantee</span>
            </div>
            <p className="text-emerald-700">
              Payment is held in escrow and released to the venue and service providers after successful event completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
