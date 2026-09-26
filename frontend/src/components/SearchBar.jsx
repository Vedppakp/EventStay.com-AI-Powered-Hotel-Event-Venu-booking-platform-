import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, PartyPopper, Bed } from 'lucide-react';

import { INDIAN_CITIES_100 } from '../data/indianCities';

export default function SearchBar({ initialCity = '', initialEventType = '', initialGuests = '', compact = false }) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity || 'All');
  const [eventType, setEventType] = useState(initialEventType || 'Wedding');
  const [guests, setGuests] = useState(initialGuests || '300');
  const [eventDate, setEventDate] = useState('2026-11-15');
  const [needRooms, setNeedRooms] = useState(true);
  const [needBanquet, setNeedBanquet] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city && city !== 'All') params.set('city', city);
    if (eventType) params.set('suitableFor', eventType);
    if (guests) params.set('minGuests', guests);
    if (eventDate) params.set('date', eventDate);

    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className={`w-full ${compact ? 'max-w-4xl mx-auto' : 'max-w-5xl mx-auto'}`}>
      {/* Iconic Booking.com Golden-Yellow Search Box */}
      <form
        onSubmit={handleSearch}
        className="bg-[#febb02] p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-[#febb02]"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1">
          {/* 1. Destination / Where are you going? */}
          <div className="md:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3 flex items-center gap-3 border border-slate-200/50 hover:border-slate-400 transition-colors">
            <div className="text-slate-600 shrink-0">
              <Bed className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[11px] font-medium text-slate-500">
                Enter destination
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer truncate"
              >
                <option value="All">Where are you going? (100 Indian Cities)</option>
                <optgroup label="💎 Tier 1 — High Budget (Luxury & Metros)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'luxury').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} ({c.avgBudget})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌟 Tier 2 — Mid Budget (Balanced & Cultural)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'mid').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} ({c.avgBudget})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏷️ Tier 3 — Value Budget (Smart Savings & Spiritual)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'value').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} ({c.avgBudget})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* 2. Check-in / Event Date */}
          <div className="md:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3 flex items-center gap-3 border border-slate-200/50 hover:border-slate-400 transition-colors">
            <div className="text-slate-600 shrink-0">
              <Calendar className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[11px] font-medium text-slate-500">
                Select dates
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Occupancy & Occasion */}
          <div className="md:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3 flex items-center gap-3 border border-slate-200/50 hover:border-slate-400 transition-colors">
            <div className="text-slate-600 shrink-0">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[11px] font-medium text-slate-500">
                Select occupancy
              </label>
              <select
                value={`${guests}__${eventType}`}
                onChange={(e) => {
                  const [g, evt] = e.target.value.split('__');
                  setGuests(g);
                  setEventType(evt);
                }}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer truncate"
              >
                <option value="300__Wedding">2 adults · 0 children · 1 room (300 Guests)</option>
                <option value="500__Reception">500+ Guests · Grand Reception</option>
                <option value="150__Birthday Party">150 Guests · Party / Gala</option>
                <option value="200__Corporate">200 Guests · Corporate Summit</option>
                <option value="50__Stay">2 adults · 0 children · Hotel Stay</option>
                <option value="100__Wedding">100 Guests · Intimate Wedding</option>
                <option value="800__Wedding">800+ Guests · Royal Mega Wedding</option>
              </select>
            </div>
          </div>

          {/* 4. Search Button - Booking.com electric blue */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full min-h-[52px] bg-[#006ce4] hover:bg-[#0057b8] text-white font-extrabold text-base rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Booking.com Style Checkbox Toggles below Search */}
      <div className="flex flex-wrap items-center gap-6 mt-3 text-xs text-white/95 sm:text-white pl-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-white text-[#006ce4] focus:ring-transparent cursor-pointer"
          />
          <span className="font-medium">I'm traveling for work</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={needBanquet}
            onChange={(e) => setNeedBanquet(e.target.checked)}
            className="w-4 h-4 rounded text-[#006ce4] focus:ring-transparent cursor-pointer"
          />
          <span className="font-medium">I'm booking an event (Banquet Hall or Palace required)</span>
        </label>
      </div>
    </div>
  );
}
