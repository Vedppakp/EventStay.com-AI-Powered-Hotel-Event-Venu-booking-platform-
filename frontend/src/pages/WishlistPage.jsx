import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';

export default function WishlistPage() {
  const { user } = useAuth();
  const wishlistItems = user?.wishlist || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
          Saved Favorites
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          My Saved Venues & Hotels
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep track of your top venue selections for upcoming celebrations
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any venue or hotel card to save it for quick reference later.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow"
          >
            Explore Venues
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            // item may be populated object or ID string
            if (!item._id) return null;
            return <PropertyCard key={item._id} property={item} />;
          })}
        </div>
      )}
    </div>
  );
}
