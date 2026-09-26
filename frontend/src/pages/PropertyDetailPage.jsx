import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Users,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Heart,
  Share2,
  ArrowRight,
  Bed,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { propertyAPI } from '../services/api';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import InteractiveMap from '../components/InteractiveMap';
import { useAuth } from '../context/AuthContext';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2026-11-16');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getById(id);
        if (res.success) {
          setProperty(res.property);
          setUnits(res.units || []);
          setReviews(res.reviews || []);
        }
      } catch (err) {
        console.error('Detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-10 bg-slate-200 rounded-xl w-1/3 animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <Link to="/explore" className="text-brand-600 font-bold hover:underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');
  const wishlisted = isWishlisted(property._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-50 text-brand-700 capitalize">
              {property.propertyType}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{property.rating}</span>
              <span className="text-slate-400 font-normal">({property.numReviews} reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {property.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAuthenticated && (
            <button
              onClick={() => toggleWishlist(property._id)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold ${
                wishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{wishlisted ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <Link
            to={`/planner?propertyId=${property._id}`}
            className="px-5 py-3 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-lg shadow-brand-500/20 flex items-center gap-2 text-xs transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Customize Event Package</span>
          </Link>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[340px] sm:h-[460px] rounded-3xl overflow-hidden">
        <div className="md:col-span-2 h-full">
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'}
            alt={property.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:grid grid-cols-1 gap-4 h-full">
          <img
            src={property.images?.[1] || 'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=800&q=80'}
            alt="Hall interior"
            className="w-full h-[220px] object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
          />
          <img
            src={property.images?.[2] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
            alt="Lawn view"
            className="w-full h-[220px] object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:grid grid-cols-1 gap-4 h-full">
          <img
            src={property.images?.[3] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
            alt="Guest room"
            className="w-full h-[220px] object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
          />
          <div className="w-full h-[220px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center space-y-2">
            <Users className="w-6 h-6 text-brand-400" />
            <span className="font-extrabold text-sm">Capacity up to</span>
            <span className="text-2xl font-black text-white">{property.maxCapacity} Guests</span>
          </div>
        </div>
      </div>

      {/* Details & Sticky Booking Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 8 Cols: Overview, Amenities, Units, Calendar, Reviews */}
        <div className="lg:col-span-8 space-y-10">
          {/* Host & Description */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={property.owner?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
                  alt={property.owner?.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Hosted by {property.owner?.name || 'Verified Host'}
                  </h3>
                  <p className="text-xs text-slate-500">{property.owner?.businessName || 'Heritage Venues Group'}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Host
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-slate-900">About this Venue</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Maximum Capacity</span>
                <span className="font-black text-sm text-slate-900">{property.maxCapacity} Guests</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Starting Price</span>
                <span className="font-black text-sm text-slate-900">{formatPrice(property.basePrice)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Property Type</span>
                <span className="font-black text-sm text-slate-900 capitalize">{property.category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Rating</span>
                <span className="font-black text-sm text-slate-900">⭐ {property.rating} / 5.0</span>
              </div>
            </div>
          </section>

          {/* Sub-Units (Halls & Hotel Rooms) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Available Halls & Guest Rooms</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reserve specific halls for ceremonies or bundle hotel rooms for attending guests
              </p>
            </div>

            <div className="space-y-4">
              {units.map((unit) => (
                <div
                  key={unit._id}
                  className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {unit.unitType}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{unit.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Capacity: {unit.capacity} Guests</span>
                      {unit.sizeSqFt && <span>• {unit.sizeSqFt} sq.ft</span>}
                      {unit.totalCount > 1 && <span>• {unit.totalCount} Units Available</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">{formatPrice(unit.pricePerUnit)}</span>
                      <span className="text-xs text-slate-500 font-normal"> / {unit.priceType.replace('_', ' ')}</span>
                    </div>

                    <Link
                      to={`/planner?propertyId=${property._id}&unitId=${unit._id}`}
                      className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Select
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Facilities & Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 bg-slate-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Location & Real Map Section */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
                  Location & Map
                </span>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <span>Where You'll Celebrate</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
              </div>

              {property.location?.lat && property.location?.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.location.lat},${property.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0"
                >
                  <Navigation className="w-4 h-4 text-brand-600" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>

            {/* Map Container */}
            {property.location?.lat && property.location?.lng ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[380px]">
                <InteractiveMap
                  properties={[property]}
                  center={[property.location.lat, property.location.lng]}
                  zoom={14}
                  showQuickPills={false}
                  className="w-full h-full min-h-[380px]"
                />
              </div>
            ) : (
              <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                Map coordinates not available for this venue
              </div>
            )}

            {/* Geographic details & Landmark chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">GPS Coordinates</span>
                <span className="font-mono font-bold text-slate-800">
                  {property.location?.lat?.toFixed(4)}° N, {property.location?.lng?.toFixed(4)}° E
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">City Destination</span>
                <span className="font-bold text-slate-800">
                  {property.city}, {property.state}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Venue Type</span>
                <span className="font-bold text-slate-800 capitalize">
                  {property.propertyType} • Up to {property.maxCapacity} Guests
                </span>
              </div>
            </div>
          </section>

          {/* Date Availability Calendar */}
          <section className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Check Date Availability</h3>
              <p className="text-xs text-slate-500">
                Click on any open date to check availability or verify reserved dates
              </p>
            </div>
            <AvailabilityCalendar
              propertyId={property._id}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
            />
          </section>

          {/* Customer Reviews */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-500">Verified feedback from hosts and guests</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{property.rating}</span>
                <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                        {rev.user?.name?.[0] || 'U'}
                      </div>
                      <span className="font-bold text-slate-900">{rev.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">Event: {rev.eventType}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right 4 Cols: Sticky Booking Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex justify-between items-baseline pb-4 border-b border-slate-100">
              <div>
                <span className="text-2xl font-black text-slate-900">{formatPrice(property.basePrice)}</span>
                <span className="text-xs text-slate-500 font-normal"> / day</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{property.rating}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Date:</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guest Capacity:</span>
                <span className="font-bold text-slate-900">Up to {property.maxCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cancellation:</span>
                <span className="font-bold text-emerald-600">Free up to 7 days</span>
              </div>
            </div>

            {/* Recommended: Event Package Button */}
            <div className="space-y-3">
              <Link
                to={`/planner?propertyId=${property._id}&date=${selectedDate}`}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Layers className="w-5 h-5" />
                <span>Build Event Package</span>
              </Link>
              <p className="text-[11px] text-center text-slate-400">
                ⭐ Recommended: Bundle Catering + Decor + DJ + Rooms for special savings
              </p>
            </div>

            {/* Direct Venue Reserve */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate(`/planner?propertyId=${property._id}&date=${selectedDate}&mode=venue_only`)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Reserve Venue Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
