import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Heart, Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PropertyCard({ property, onHover, isHighlighted = false }) {
  const { toggleWishlist, isWishlisted, isAuthenticated } = useAuth();
  const wishlisted = isWishlisted(property._id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCategoryLabel = (type, category) => {
    if (category === 'both') return 'Hotel + Banquet';
    if (type === 'palace') return 'Heritage Palace';
    if (type === 'banquet_hall') return 'Banquet Hall';
    if (type === 'resort') return 'Resort & Lawn';
    if (type === 'hotel') return 'Hotel Accommodation';
    return 'Event Venue';
  };

  return (
    <div
      id={`property-card-${property._id}`}
      onMouseEnter={() => onHover && onHover(property._id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isHighlighted
          ? 'border-brand-500 shadow-2xl ring-4 ring-brand-400/40 scale-[1.02] -translate-y-1'
          : 'border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={
            property.images?.[0] ||
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
          }
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Tag */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
            {getCategoryLabel(property.propertyType, property.category)}
          </span>
          {property.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(property._id);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-600 shadow-sm hover:scale-110 active:scale-95 transition-all"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`}
            />
          </button>
        )}

        {/* Location Overlay Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-900/75 backdrop-blur-md text-white">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            {property.city}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating & Capacity - Booking.com signature rating score badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="bg-[#003580] text-white text-xs font-black px-2 py-1 rounded-t-lg rounded-br-lg shadow-sm">
                {((property.rating || 4.5) * 2).toFixed(1)}
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-bold text-slate-800">
                  {property.rating >= 4.8 ? 'Superb' : property.rating >= 4.5 ? 'Fabulous' : 'Very Good'}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {property.numReviews || 128} reviews
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Up to {property.maxCapacity} Guests</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/properties/${property._id}`}>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#006ce4] transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {property.description}
          </p>

          {/* Booking.com Perks / Amenities */}
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <span>✓ Free cancellation</span>
              <span className="text-slate-400 font-normal">• No prepayment needed</span>
            </div>
            {property.suitableFor && property.suitableFor.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {property.suitableFor.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price & Action - Booking.com signature format */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block font-normal">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">
                {formatPrice(property.basePrice)}
              </span>
              <span className="text-[11px] text-slate-500 font-normal"> / day</span>
            </div>
            <span className="text-[10px] text-slate-400 block">+ ₹{(property.basePrice * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })} taxes & charges</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to={`/planner?propertyId=${property._id}`}
              className="px-2.5 py-2 text-xs font-bold text-[#006ce4] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              title="Build Event Package"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Package</span>
            </Link>

            <Link
              to={`/properties/${property._id}`}
              className="px-3.5 py-2 text-xs font-extrabold text-white bg-[#006ce4] hover:bg-[#0057b8] rounded-lg shadow-sm transition-all flex items-center gap-1"
            >
              <span>See availability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
