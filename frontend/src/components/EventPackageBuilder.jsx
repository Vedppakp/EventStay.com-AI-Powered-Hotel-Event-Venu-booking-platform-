import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Utensils,
  Flower2,
  Camera,
  Music,
  Cake,
  Sparkles,
  Bed,
  CheckCircle2,
  Calendar,
  Users,
  Tag,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import { bookingAPI, couponAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventPackageBuilder({ initialProperty, initialNotes = '', allProperties = [], allServices = [] }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Selected Venue
  const [selectedProperty, setSelectedProperty] = useState(initialProperty || allProperties[0] || null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Event Specs
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('2026-11-16');
  const [guestsCount, setGuestsCount] = useState(300);
  const [specialNotes, setSpecialNotes] = useState(initialNotes);

  // Selected Services
  const [selectedCatering, setSelectedCatering] = useState(null);
  const [selectedDecor, setSelectedDecor] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedDJ, setSelectedDJ] = useState(null);
  const [selectedCake, setSelectedCake] = useState(null);
  const [selectedMakeup, setSelectedMakeup] = useState(null);

  // Guest Accommodation Hotel Rooms
  const [guestRoomsCount, setGuestRoomsCount] = useState(0);
  const [guestRoomNights, setGuestRoomNights] = useState(1);
  const [selectedRoomUnit, setSelectedRoomUnit] = useState(null);

  // Availability state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({ checked: false, available: true, message: '' });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Synchronize when initialProperty changes
  useEffect(() => {
    if (initialProperty) {
      setSelectedProperty(initialProperty);
    }
  }, [initialProperty]);

  // Synchronize when initialNotes changes
  useEffect(() => {
    if (initialNotes) {
      setSpecialNotes(initialNotes);
    }
  }, [initialNotes]);

  // Set default services when loaded
  useEffect(() => {
    if (allServices.length > 0) {
      const caterer = allServices.find((s) => s.category === 'catering');
      const decor = allServices.find((s) => s.category === 'decoration');
      const photo = allServices.find((s) => s.category === 'photography');
      const dj = allServices.find((s) => s.category === 'music_dj');

      if (caterer && !selectedCatering) setSelectedCatering(caterer);
      if (decor && !selectedDecor) setSelectedDecor(decor);
      if (photo && !selectedPhoto) setSelectedPhoto(photo);
      if (dj && !selectedDJ) setSelectedDJ(dj);
    }
  }, [allServices]);

  // Check date availability when venue or date changes
  useEffect(() => {
    if (selectedProperty?._id && eventDate) {
      const checkDate = async () => {
        setIsCheckingAvailability(true);
        try {
          const res = await bookingAPI.checkAvailability(
            selectedProperty._id,
            selectedUnit?._id,
            eventDate
          );
          setAvailabilityStatus({
            checked: true,
            available: res.available,
            message: res.message
          });
        } catch (err) {
          console.error('Availability check failed:', err);
        } finally {
          setIsCheckingAvailability(false);
        }
      };

      const timer = setTimeout(checkDate, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedProperty, selectedUnit, eventDate]);

  // Find room units in selected property for guest accommodation
  const roomUnits = selectedProperty?.units?.filter((u) => u.unitType === 'room' || u.unitType === 'suite') || [];

  // Calculations
  const venuePrice = selectedUnit ? selectedUnit.pricePerUnit : (selectedProperty?.basePrice || 0);

  const cateringPrice = selectedCatering
    ? (selectedCatering.pricingType === 'per_guest' ? selectedCatering.basePrice * guestsCount : selectedCatering.basePrice)
    : 0;

  const decorPrice = selectedDecor ? selectedDecor.basePrice : 0;
  const photoPrice = selectedPhoto ? selectedPhoto.basePrice : 0;
  const djPrice = selectedDJ ? selectedDJ.basePrice : 0;
  const cakePrice = selectedCake ? selectedCake.basePrice : 0;
  const makeupPrice = selectedMakeup ? selectedMakeup.basePrice : 0;

  const servicesTotal = cateringPrice + decorPrice + photoPrice + djPrice + cakePrice + makeupPrice;

  const roomUnitPrice = selectedRoomUnit ? selectedRoomUnit.pricePerUnit : (roomUnits[0]?.pricePerUnit || 3200);
  const roomsTotal = guestRoomsCount > 0 ? guestRoomsCount * guestRoomNights * roomUnitPrice : 0;

  const rawSubtotal = venuePrice + servicesTotal + roomsTotal;

  // Discount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.12);
  const totalGrandAmount = taxableAmount + taxAmount;

  // Coupon handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    try {
      const res = await couponAPI.validate(couponCode, rawSubtotal);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
    }
  };

  const handleProceedToCheckout = () => {
    if (!availabilityStatus.available) {
      alert('The selected date is booked! Please choose another available date before proceeding.');
      return;
    }

    const packageBundle = {
      property: selectedProperty,
      unit: selectedUnit,
      eventType,
      eventDate,
      guestsCount,
      selectedServices: [
        selectedCatering && { service: selectedCatering, name: selectedCatering.name, category: 'catering', price: selectedCatering.basePrice, pricingType: selectedCatering.pricingType, quantity: guestsCount, subtotal: cateringPrice },
        selectedDecor && { service: selectedDecor, name: selectedDecor.name, category: 'decoration', price: selectedDecor.basePrice, pricingType: 'fixed', quantity: 1, subtotal: decorPrice },
        selectedPhoto && { service: selectedPhoto, name: selectedPhoto.name, category: 'photography', price: selectedPhoto.basePrice, pricingType: 'fixed', quantity: 1, subtotal: photoPrice },
        selectedDJ && { service: selectedDJ, name: selectedDJ.name, category: 'music_dj', price: selectedDJ.basePrice, pricingType: 'fixed', quantity: 1, subtotal: djPrice },
        selectedCake && { service: selectedCake, name: selectedCake.name, category: 'cake', price: selectedCake.basePrice, pricingType: 'fixed', quantity: 1, subtotal: cakePrice },
        selectedMakeup && { service: selectedMakeup, name: selectedMakeup.name, category: 'makeup', price: selectedMakeup.basePrice, pricingType: 'fixed', quantity: 1, subtotal: makeupPrice }
      ].filter(Boolean),
      guestRoomsBooked: guestRoomsCount > 0 ? [{
        unit: selectedRoomUnit || roomUnits[0],
        roomName: (selectedRoomUnit || roomUnits[0])?.name || 'Deluxe Guest Room',
        roomsCount: guestRoomsCount,
        nights: guestRoomNights,
        pricePerNight: roomUnitPrice,
        subtotal: roomsTotal
      }] : [],
      pricing: {
        venueBasePrice: venuePrice,
        servicesTotal,
        roomsTotal,
        discountAmount,
        taxAmount,
        totalAmount: totalGrandAmount
      },
      specialRequests: specialNotes,
      notes: specialNotes,
      couponApplied: appliedCoupon
    };

    localStorage.setItem('eventstay_pending_package', JSON.stringify(packageBundle));
    navigate('/checkout');
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  const caterers = allServices.filter((s) => s.category === 'catering');
  const decorators = allServices.filter((s) => s.category === 'decoration');
  const photographers = allServices.filter((s) => s.category === 'photography');
  const djs = allServices.filter((s) => s.category === 'music_dj');
  const cakes = allServices.filter((s) => s.category === 'cake');
  const makeups = allServices.filter((s) => s.category === 'makeup');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 8 Cols: Customization Steps */}
      <div className="lg:col-span-8 space-y-8">
        {/* Step 1: Venue Selection & Date Availability */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-sm">
                1
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Choose Venue & Event Date</h3>
                <p className="text-xs text-slate-500">Pick your primary celebration venue and check real-time availability</p>
              </div>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          {/* Venue Selector if not preset */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Venue
            </label>
            <select
              value={selectedProperty?._id || ''}
              onChange={(e) => {
                const found = allProperties.find((p) => p._id === e.target.value);
                if (found) {
                  setSelectedProperty(found);
                  setSelectedUnit(null);
                }
              }}
              className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {allProperties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.city}) — Capacity {p.maxCapacity} Guests — {formatPrice(p.basePrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Event Specs Grid: Type, Date, Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Wedding">Wedding</option>
                <option value="Reception">Reception Gala</option>
                <option value="Birthday Party">Birthday Celebration</option>
                <option value="Corporate">Corporate Conference</option>
                <option value="Cultural Event">Cultural Festival</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Event Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Guests Count
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max={selectedProperty?.maxCapacity || 1000}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Availability Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-sm ${
              isCheckingAvailability
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : availabilityStatus.available
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isCheckingAvailability ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : availabilityStatus.available ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <span className="font-semibold">
                {isCheckingAvailability
                  ? 'Checking availability for date...'
                  : availabilityStatus.available
                  ? `✅ Date ${eventDate} is AVAILABLE for booking!`
                  : `❌ Date ${eventDate} is ALREADY BOOKED! Please choose another date (e.g. 2026-11-16).`}
              </span>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider">
              {selectedProperty?.city}
            </span>
          </div>
        </section>

        {/* Step 2: Catering Option */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
                2
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Buffet & Banquet Catering</h3>
                <p className="text-xs text-slate-500">Calculated dynamically for {guestsCount} guests</p>
              </div>
            </div>
            <Utensils className="w-5 h-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caterers.map((cat) => {
              const isSelected = selectedCatering?._id === cat._id;
              const subtotal = cat.pricingType === 'per_guest' ? cat.basePrice * guestsCount : cat.basePrice;

              return (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCatering(isSelected ? null : cat)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 shadow-md ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{cat.name}</h4>
                      <span className="text-xs text-slate-500 block mt-0.5">{cat.providerName}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cat.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      ₹{cat.basePrice} / guest × {guestsCount}
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Decoration Styling */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm">
                3
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Stage & Floral Decoration</h3>
                <p className="text-xs text-slate-500">Royal floral arches, luxury mandaps, and lighting setups</p>
              </div>
            </div>
            <Flower2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decorators.map((dec) => {
              const isSelected = selectedDecor?._id === dec._id;

              return (
                <div
                  key={dec._id}
                  onClick={() => setSelectedDecor(isSelected ? null : dec)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/40 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{dec.name}</h4>
                      <span className="text-xs text-slate-500 block mt-0.5">{dec.providerName}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{dec.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Flat Package</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatPrice(dec.basePrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 4: Photography & Entertainment (DJ) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                4
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Photography, Films & DJ Sound</h3>
                <p className="text-xs text-slate-500">Capture the memories and power the celebration dance floor</p>
              </div>
            </div>
            <Camera className="w-5 h-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo */}
            {photographers[0] && (
              <div
                onClick={() => setSelectedPhoto(selectedPhoto ? null : photographers[0])}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPhoto
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-md ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Cinematography</span>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{photographers[0].name}</h4>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPhoto ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                    {selectedPhoto && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{photographers[0].description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">4K Drone + Album</span>
                  <span className="text-base font-extrabold text-slate-900">{formatPrice(photographers[0].basePrice)}</span>
                </div>
              </div>
            )}

            {/* DJ */}
            {djs[0] && (
              <div
                onClick={() => setSelectedDJ(selectedDJ ? null : djs[0])}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedDJ
                    ? 'border-purple-500 bg-purple-50/40 shadow-md ring-1 ring-purple-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Live Sound & DJ</span>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{djs[0].name}</h4>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedDJ ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'}`}>
                    {selectedDJ && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{djs[0].description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Line-Array + Fog FX</span>
                  <span className="text-base font-extrabold text-slate-900">{formatPrice(djs[0].basePrice)}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step 5: Guest Hotel Rooms Accommodation */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                5
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Guest Accommodation Rooms</h3>
                <p className="text-xs text-slate-500">Book AC hotel rooms in the same property for out-of-town guests</p>
              </div>
            </div>
            <Bed className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Number of Rooms</label>
              <input
                type="number"
                min="0"
                max="25"
                value={guestRoomsCount}
                onChange={(e) => setGuestRoomsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm"
              />
              <span className="text-[11px] text-slate-400">0 = No rooms needed</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nights</label>
              <select
                value={guestRoomNights}
                onChange={(e) => setGuestRoomNights(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm"
              >
                <option value="1">1 Night</option>
                <option value="2">2 Nights</option>
                <option value="3">3 Nights</option>
              </select>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">Rooms Subtotal</span>
              <span className="text-xl font-black text-slate-900">
                {formatPrice(roomsTotal)}
              </span>
              {guestRoomsCount > 0 && (
                <span className="text-[11px] text-emerald-600 block font-medium">
                  {guestRoomsCount} rooms @ ₹{roomUnitPrice}/night
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Step 6: Other Facilities & Special Notes */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm">
                6
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Other Facilities & Custom Notes</h3>
                <p className="text-xs text-slate-500">Provide any specific requests for setup, accessibility, or additional facilities</p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>

          <div>
            <textarea
              rows={3}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Describe any other facilities or special notes needed (e.g. VIP bridal dressing suite, swimming pool access, valet parking, separate vegetarian/Jain kitchen, wheelchair ramps, stage fireworks, LED video wall)..."
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all resize-none"
            />
          </div>
        </section>
      </div>

      {/* Right 4 Cols: Live Sticky Price Summary & Checkout */}
      <div className="lg:col-span-4 sticky top-24 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              Event Package Summary
            </h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
              Live Total
            </span>
          </div>

          {/* Property Info in Receipt */}
          <div className="p-3 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{selectedProperty?.title}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{selectedProperty?.city}</span>
              <span>•</span>
              <span>{guestsCount} Guests</span>
              <span>•</span>
              <span>{eventDate}</span>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-slate-700">
              <span>Venue Rental</span>
              <span className="font-bold text-slate-900">{formatPrice(venuePrice)}</span>
            </div>

            {selectedCatering && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">Catering ({guestsCount} pax)</span>
                <span className="font-bold text-slate-900">{formatPrice(cateringPrice)}</span>
              </div>
            )}

            {selectedDecor && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">Decoration & Mandap</span>
                <span className="font-bold text-slate-900">{formatPrice(decorPrice)}</span>
              </div>
            )}

            {selectedPhoto && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">4K Cinema Photography</span>
                <span className="font-bold text-slate-900">{formatPrice(photoPrice)}</span>
              </div>
            )}

            {selectedDJ && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">Line-Array DJ & Sound</span>
                <span className="font-bold text-slate-900">{formatPrice(djPrice)}</span>
              </div>
            )}

            {guestRoomsCount > 0 && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">Hotel Rooms ({guestRoomsCount} rooms)</span>
                <span className="font-bold text-slate-900">{formatPrice(roomsTotal)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-600 text-xs">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(rawSubtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between items-center text-emerald-600 text-xs font-bold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-500 text-xs">
              <span>GST & Taxes (12%)</span>
              <span>+{formatPrice(taxAmount)}</span>
            </div>

            <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">Total Package Amount</span>
              <span className="text-2xl font-black text-brand-600">{formatPrice(totalGrandAmount)}</span>
            </div>
          </div>

          {/* Promo Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">Have a Coupon?</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOME5000"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs uppercase font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-rose-600 font-medium">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-xs text-emerald-600 font-bold">
                🎉 Coupon {appliedCoupon.code} applied! Saved {formatPrice(appliedCoupon.discountAmount)}
              </p>
            )}
          </form>

          {/* Book Package CTA */}
          <button
            onClick={handleProceedToCheckout}
            disabled={!availabilityStatus.available || isCheckingAvailability}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              !availabilityStatus.available
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>Proceed to Book Package</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-[11px] text-slate-400">
            🔒 Instant date hold with online confirmation & downloadable receipt
          </p>
        </div>
      </div>
    </div>
  );
}
