import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2, QrCode, ShieldCheck } from 'lucide-react';

export default function BookingReceiptModal({ booking, onClose }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  const formattedDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls Header */}
        <div className="no-print p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Official Booking Tax Invoice & Confirmation
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-receipt" className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          {/* Brand & Invoice Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Event<span className="text-brand-600">Stay</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Platform Booking Receipt & Tax Invoice</p>
            </div>

            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONFIRMED & PAID
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1.5">Booking Ref: {booking.bookingNumber}</p>
              <p className="text-[11px] text-slate-400">Issued: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Parties Grid: Property vs Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                Reserved Venue
              </span>
              <h4 className="font-bold text-sm text-slate-900">{booking.property?.title}</h4>
              <p className="text-slate-600 mt-0.5">{booking.property?.address}, {booking.property?.city}</p>
              <p className="text-slate-500 mt-1">Host: {booking.property?.owner?.name || 'Verified Venue Host'}</p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                Customer Details
              </span>
              <h4 className="font-bold text-sm text-slate-900">{booking.contactDetails?.name || booking.user?.name}</h4>
              <p className="text-slate-600 mt-0.5">{booking.contactDetails?.email || booking.user?.email}</p>
              <p className="text-slate-600">{booking.contactDetails?.phone || booking.user?.phone}</p>
            </div>
          </div>

          {/* Event Key Specs */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 bg-brand-50/50 rounded-2xl border border-brand-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Type</span>
              <span className="font-bold text-brand-900">{booking.eventType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Date</span>
              <span className="font-bold text-brand-900">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Guests</span>
              <span className="font-bold text-brand-900">{booking.guestsCount} Guests</span>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Package Breakdown
            </h5>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-left">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Category / Details</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">
                    {booking.unit?.name || booking.property?.title} (Venue Rental)
                  </td>
                  <td className="py-2.5 text-center text-slate-500">Venue / Banquet</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">
                    {formatPrice(booking.pricing?.venueBasePrice)}
                  </td>
                </tr>

                {booking.selectedServices?.map((srv, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900">{srv.name}</span>
                      {srv.pricingType === 'per_guest' && (
                        <span className="block text-[10px] text-slate-400">
                          {booking.guestsCount} guests @ {formatPrice(srv.price)}/pax
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-slate-500 capitalize">{srv.category}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatPrice(srv.subtotal)}
                    </td>
                  </tr>
                ))}

                {booking.guestRoomsBooked?.map((rm, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900">{rm.roomName}</span>
                      <span className="block text-[10px] text-slate-400">
                        {rm.roomsCount} rooms × {rm.nights} nights
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-slate-500">Guest Accommodation</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatPrice(rm.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold">
                {formatPrice(
                  (booking.pricing?.venueBasePrice || 0) +
                    (booking.pricing?.servicesTotal || 0) +
                    (booking.pricing?.roomsTotal || 0)
                )}
              </span>
            </div>

            {booking.pricing?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Discount ({booking.couponApplied?.code || 'Coupon'})</span>
                <span>-{formatPrice(booking.pricing?.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>GST / Taxes (12%)</span>
              <span>+{formatPrice(booking.pricing?.taxAmount)}</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline text-base font-black text-slate-900">
              <span>Grand Total Paid</span>
              <span className="text-xl text-brand-600">{formatPrice(booking.pricing?.totalAmount)}</span>
            </div>
          </div>

          {/* Payment & Security Footer with Check-in QR */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-1 text-[11px] text-slate-500">
              <p>
                <span className="font-bold text-slate-700">Payment ID:</span> {booking.payment?.transactionId}
              </p>
              <p>
                <span className="font-bold text-slate-700">Payment Mode:</span> {booking.payment?.method || 'Online'}
              </p>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Booking Guarantee Protected
              </div>
            </div>

            {/* Check-in QR Code Stamp */}
            <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-16 h-16 bg-white rounded-lg p-1 border flex items-center justify-center mx-auto">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 block mt-1">CHECK-IN QR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
