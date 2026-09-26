import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Map as MapIcon,
  Grid,
  Search,
  Users,
  Building2,
  Sparkles,
  SlidersHorizontal,
  X,
  Compass,
  Maximize2
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import InteractiveMap from '../components/InteractiveMap';
import { propertyAPI } from '../services/api';

import { INDIAN_CITIES_100, BUDGET_TIERS, findCity } from '../data/indianCities';

export const INDIAN_CITIES = [
  { value: 'All', label: 'All Destinations (100 Cities in India)' },
  ...INDIAN_CITIES_100.map((c) => ({
    value: c.name,
    label: `#${c.rank} ${c.name} (${c.tier === 'luxury' ? '💎 High' : c.tier === 'mid' ? '🌟 Mid' : '🏷️ Value'} • ${c.avgBudget})`,
    tier: c.tier,
    rank: c.rank
  }))
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('split'); // 'grid', 'split', or 'map'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [tier, setTier] = useState(searchParams.get('tier') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'all');
  const [minGuests, setMinGuests] = useState(searchParams.get('minGuests') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [suitableFor, setSuitableFor] = useState(searchParams.get('suitableFor') || '');
  const [sort, setSort] = useState('rating_desc');

  // Synchronize URL searchParams to filter states when URL changes (e.g. clicking Stays & Hotels in Navbar)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlCity = searchParams.get('city') || 'All';
    const urlTier = searchParams.get('tier') || 'all';
    const urlPropertyType = searchParams.get('propertyType') || 'all';
    const urlSearch = searchParams.get('search') || '';
    const urlMinGuests = searchParams.get('minGuests') || '';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlSuitableFor = searchParams.get('suitableFor') || '';
    const urlView = searchParams.get('view');

    setCategory((prev) => (prev !== urlCategory ? urlCategory : prev));
    setCity((prev) => (prev !== urlCity ? urlCity : prev));
    setTier((prev) => (prev !== urlTier ? urlTier : prev));
    setPropertyType((prev) => (prev !== urlPropertyType ? urlPropertyType : prev));
    setSearch((prev) => (prev !== urlSearch ? urlSearch : prev));
    setMinGuests((prev) => (prev !== urlMinGuests ? urlMinGuests : prev));
    setMinPrice((prev) => (prev !== urlMinPrice ? urlMinPrice : prev));
    setMaxPrice((prev) => (prev !== urlMaxPrice ? urlMaxPrice : prev));
    setSuitableFor((prev) => (prev !== urlSuitableFor ? urlSuitableFor : prev));
    if (urlView && ['grid', 'split', 'map'].includes(urlView)) {
      setViewMode(urlView);
    }
  }, [searchParams]);

  const fetchFilteredProperties = async (pageToFetch = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const params = {
        page: pageToFetch,
        limit: 48
      };
      if (search) params.search = search;
      if (city && city !== 'All') params.city = city;
      if (tier && tier !== 'all') params.tier = tier;
      if (category && category !== 'all') params.category = category;
      if (propertyType && propertyType !== 'all') params.propertyType = propertyType;
      if (minGuests) params.minGuests = minGuests;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (suitableFor) params.suitableFor = suitableFor;
      if (sort) params.sort = sort;

      const res = await propertyAPI.getAll(params);
      if (res.success) {
        if (append) {
          setProperties((prev) => [...prev, ...(res.properties || [])]);
        } else {
          setProperties(res.properties || []);
        }
        setTotalCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setPage(pageToFetch);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFilteredProperties(1, false);
  }, [city, tier, category, propertyType, minGuests, minPrice, maxPrice, suitableFor, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredProperties(1, false);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchFilteredProperties(page + 1, true);
    }
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setPropertyType('all');
    const newParams = new URLSearchParams(searchParams);
    if (newCat && newCat !== 'all') {
      newParams.set('category', newCat);
    } else {
      newParams.delete('category');
    }
    newParams.delete('propertyType');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('All');
    setTier('all');
    setCategory('all');
    setPropertyType('all');
    setMinGuests('');
    setMinPrice('');
    setMaxPrice('');
    setSuitableFor('');
    setSort('rating_desc');
    setSearchParams({});
  };

  const getHeaderTitle = () => {
    if (category === 'hotel') return 'Explore Stays & Hotels across India';
    if (category === 'venue') return 'Explore Banquet Venues & Palaces across India';
    return 'Explore Venues & Hotels across India';
  };

  const getHeaderSubtitle = () => {
    if (category === 'hotel') {
      return `Showing ${properties.length} of ${totalCount.toLocaleString()} verified hotels, resorts & guest stays in `;
    }
    if (category === 'venue') {
      return `Showing ${properties.length} of ${totalCount.toLocaleString()} verified banquet halls, royal palaces & event spaces in `;
    }
    return `Showing ${properties.length} of ${totalCount.toLocaleString()} mapped hotels, palaces & luxury stays in `;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100 Indian Cities • High → Low Budget Index</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            {getHeaderTitle()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {getHeaderSubtitle()}
            <span className="font-bold text-slate-800">
              {city === 'All' ? 'All Destinations' : city}
            </span>
            {tier !== 'all' && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-white">
                {tier === 'luxury' ? '💎 Tier 1 High Budget' : tier === 'mid' ? '🌟 Tier 2 Mid Budget' : '🏷️ Tier 3 Value Budget'}
              </span>
            )}
          </p>
        </div>

        {/* View mode toggle + Mobile filter button */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" /> Grid
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-4 h-4 text-brand-600" /> Split Map
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-600" /> Full Map
            </button>
          </div>
        </div>
      </div>

      {/* 🇮🇳 100 Indian Cities — High → Low Hotel Budget Bar */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            Budget Spectrum:
          </span>
          {[
            { id: 'all', label: 'All 100 Cities', range: '₹45k – ₹5.5L+' },
            { id: 'luxury', label: '💎 Tier 1: High Budget', range: '₹1.8L – ₹5.5L+' },
            { id: 'mid', label: '🌟 Tier 2: Mid Budget', range: '₹1.0L – ₹2.5L' },
            { id: 'value', label: '🏷️ Tier 3: Value Budget', range: '₹45k – ₹1.2L' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTier(t.id);
                if (t.id === 'all') setCity('All');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                tier === t.id
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-lg ${tier === t.id ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
                {t.range}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Jump City Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Select City:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer hover:border-brand-400 transition-colors"
          >
            <option value="All">All 100 Indian Cities</option>
            <optgroup label="💎 Tier 1 — High Budget (Luxury & Metros)">
              {INDIAN_CITIES_100.filter((c) => c.tier === 'luxury').map((c) => (
                <option key={c.name} value={c.name}>
                  #{c.rank} {c.name} — {c.avgBudget}
                </option>
              ))}
            </optgroup>
            <optgroup label="🌟 Tier 2 — Mid Budget (Balanced & Cultural)">
              {INDIAN_CITIES_100.filter((c) => c.tier === 'mid').map((c) => (
                <option key={c.name} value={c.name}>
                  #{c.rank} {c.name} — {c.avgBudget}
                </option>
              ))}
            </optgroup>
            <optgroup label="🏷️ Tier 3 — Value Budget (Smart Savings & Spiritual)">
              {INDIAN_CITIES_100.filter((c) => c.tier === 'value').map((c) => (
                <option key={c.name} value={c.name}>
                  #{c.rank} {c.name} — {c.avgBudget}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* FULL MAP VIEW MODE */}
      {viewMode === 'map' ? (
        <div className="relative w-full h-[calc(100vh-190px)] min-h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
          <InteractiveMap
            properties={properties}
            selectedCity={city}
            hoveredPropertyId={hoveredPropertyId}
            onSelectProperty={(p) => setHoveredPropertyId(p._id)}
            onCityChange={(newCity) => setCity(newCity)}
            className="w-full h-full"
          />

          {/* Floating Bottom Horizontal Hotel Drawer */}
          <div className="absolute bottom-6 left-6 right-6 z-[1000] flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 pointer-events-auto">
            {properties.map((p) => (
              <div
                key={p._id}
                className={`w-72 sm:w-80 shrink-0 transition-transform duration-200 ${
                  hoveredPropertyId === p._id ? 'scale-105' : ''
                }`}
              >
                <PropertyCard
                  property={p}
                  onHover={(id) => setHoveredPropertyId(id)}
                  isHighlighted={hoveredPropertyId === p._id}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* GRID / SPLIT VIEW CONTAINER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Filter Venues
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-600 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Search Keyword */}
            <form onSubmit={handleSearchSubmit}>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, landmark..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </form>

            {/* Budget Tier Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Budget Spectrum</label>
              <select
                value={tier}
                onChange={(e) => {
                  setTier(e.target.value);
                  if (e.target.value === 'all') setCity('All');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Tiers (100 Cities)</option>
                <option value="luxury">💎 Tier 1: High Budget (₹1.8L – ₹5.5L+)</option>
                <option value="mid">🌟 Tier 2: Mid Budget (₹1.0L – ₹2.5L)</option>
                <option value="value">🏷️ Tier 3: Value Budget (₹45k – ₹1.2L)</option>
              </select>
            </div>

            {/* City / Location */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Destination in India</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All 100 Indian Cities</option>
                <optgroup label="💎 Tier 1 — High Budget (Luxury & Metros)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'luxury').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} — {c.avgBudget}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌟 Tier 2 — Mid Budget (Balanced & Cultural)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'mid').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} — {c.avgBudget}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏷️ Tier 3 — Value Budget (Smart Savings & Spiritual)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'value').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} — {c.avgBudget}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Properties (2,866)</option>
                <option value="hotel">Hotels & Guest Stays (2,133)</option>
                <option value="venue">Event Venues & Banquets (733)</option>
                <option value="both">Both (Resort + Banquet)</option>
              </select>
            </div>

            {/* Guest Capacity */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Min Guests</label>
              <select
                value={minGuests}
                onChange={(e) => setMinGuests(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="">Any Capacity</option>
                <option value="100">100+ Guests</option>
                <option value="250">250+ Guests</option>
                <option value="400">400+ Guests</option>
                <option value="600">600+ Guests</option>
                <option value="800">800+ Guests</option>
                <option value="1000">1000+ Guests</option>
              </select>
            </div>

            {/* Event Suitable For */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Occasion</label>
              <select
                value={suitableFor}
                onChange={(e) => setSuitableFor(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="">All Occasions</option>
                <option value="Wedding">Royal Wedding</option>
                <option value="Reception">Grand Reception</option>
                <option value="Corporate">Corporate Summit</option>
                <option value="Birthday Party">Birthday / Cocktail</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Sort Order</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="rating_desc">Highest Rated ⭐</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_desc">Highest Capacity (Guests)</option>
              </select>
            </div>
          </div>

          {/* Results Column */}
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-9'} space-y-6`}>
            {/* Quick Property Type Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {(category === 'hotel'
                ? [
                    { id: 'all', label: 'All Stays & Hotels', icon: '🌟' },
                    { id: 'hotel', label: 'Hotels & Suites', icon: '🛏️' },
                    { id: 'resort', label: 'Resorts & Villas', icon: '🏖️' }
                  ]
                : category === 'venue'
                ? [
                    { id: 'all', label: 'All Venues', icon: '🌟' },
                    { id: 'banquet_hall', label: 'Banquet Halls', icon: '🏛️' },
                    { id: 'palace', label: 'Royal Palaces', icon: '👑' },
                    { id: 'venue', label: 'Event Grounds & Lawns', icon: '🎪' }
                  ]
                : [
                    { id: 'all', label: 'All Properties', icon: '🌟' },
                    { id: 'hotel', label: 'Hotels & Rooms', icon: '🛏️' },
                    { id: 'palace', label: 'Royal Palaces', icon: '👑' },
                    { id: 'resort', label: 'Resorts & Villas', icon: '🏖️' },
                    { id: 'banquet_hall', label: 'Banquet Halls', icon: '🏛️' }
                  ]
              ).map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setPropertyType(pt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    propertyType === pt.id
                      ? 'bg-[#003580] text-white shadow-sm ring-2 ring-[#003580]'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{pt.icon}</span>
                  <span>{pt.label}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">No properties matched your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try widening your price range, reducing minimum guest count, or selecting "All Destinations (India)".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'split' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {properties.map((p) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                    onHover={(id) => setHoveredPropertyId(id)}
                    isHighlighted={hoveredPropertyId === p._id}
                  />
                ))}
              </div>
            )}

            {/* Load More Hotels Button */}
            {!loading && properties.length < totalCount && (
              <div className="pt-6 pb-2 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3.5 bg-[#006ce4] hover:bg-[#0057b8] text-white font-extrabold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading more hotels...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Hotels</span>
                      <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Showing {properties.length} of {totalCount.toLocaleString()}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Interactive Map Column (Only in split view) */}
          {viewMode === 'split' && (
            <div className="hidden lg:block lg:col-span-4 sticky top-24 h-[calc(100vh-140px)]">
              <InteractiveMap
                properties={properties}
                selectedCity={city}
                hoveredPropertyId={hoveredPropertyId}
                onSelectProperty={(p) => {
                  setHoveredPropertyId(p._id);
                  const el = document.getElementById(`property-card-${p._id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onCityChange={(newCity) => setCity(newCity)}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="bg-white w-80 h-full p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Filter Properties</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Properties (2,866)</option>
                <option value="hotel">Hotels & Guest Stays (2,133)</option>
                <option value="venue">Event Venues & Banquets (733)</option>
                <option value="both">Both (Resort + Banquet)</option>
              </select>
            </div>

            {/* Budget Tier Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Budget Spectrum</label>
              <select
                value={tier}
                onChange={(e) => {
                  setTier(e.target.value);
                  if (e.target.value === 'all') setCity('All');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Tiers (100 Cities)</option>
                <option value="luxury">💎 Tier 1: High Budget (₹1.8L – ₹5.5L+)</option>
                <option value="mid">🌟 Tier 2: Mid Budget (₹1.0L – ₹2.5L)</option>
                <option value="value">🏷️ Tier 3: Value Budget (₹45k – ₹1.2L)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Destination</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All 100 Indian Cities</option>
                <optgroup label="💎 Tier 1 — High Budget (Luxury & Metros)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'luxury').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} — {c.avgBudget}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌟 Tier 2 — Mid Budget (Balanced & Cultural)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'mid').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} — {c.avgBudget}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏷️ Tier 3 — Value Budget (Smart Savings & Spiritual)">
                  {INDIAN_CITIES_100.filter((c) => c.tier === 'value').map((c) => (
                    <option key={c.name} value={c.name}>
                      #{c.rank} {c.name} — {c.avgBudget}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <button
              onClick={() => {
                setMobileFilterOpen(false);
                fetchFilteredProperties();
              }}
              className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

