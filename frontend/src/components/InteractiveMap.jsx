import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import {
  Star,
  Users,
  ArrowRight,
  Maximize2,
  Layers,
  MapPin,
  Sparkles,
  Compass,
  Navigation,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { ALL_INDIAN_CITY_CENTERS, INDIAN_CITIES_100, BUDGET_TIERS, findCity } from '../data/indianCities';

// City center lookup with optimal zoom levels across all 100 Indian Cities
export const INDIAN_CITY_CENTERS = ALL_INDIAN_CITY_CENTERS;

// Available map tile providers
const TILE_STYLES = {
  clean: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors'
  },
  streets: {
    name: 'OSM Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  voyager: {
    name: 'Travel Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors'
  }
};

// Helper to format prices into compact Indian currency (e.g. ₹2.8L, ₹65k)
const formatPriceBadge = (price) => {
  if (!price) return '₹0';
  if (price >= 100000) {
    const lk = (price / 100000).toFixed(1).replace('.0', '');
    return `₹${lk}L`;
  }
  return `₹${Math.round(price / 1000)}k`;
};

// Custom interactive divIcon showing hotel price pill
function createCustomPriceMarker(property, isHovered, isSelected) {
  const price = formatPriceBadge(property.basePrice);
  const active = isHovered || isSelected;

  const activeStyles = active
    ? 'bg-brand-600 text-white border-brand-700 shadow-xl shadow-brand-600/40 ring-4 ring-brand-300 scale-110 -translate-y-1'
    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-900 hover:text-white shadow-md hover:scale-105';

  const arrowStyles = active ? 'bg-brand-600 border-brand-700' : 'bg-white border-slate-300';

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-200">
        <div class="px-2.5 py-1 rounded-full text-xs font-black tracking-tight border flex items-center gap-1.5 transition-all duration-200 ${activeStyles}">
          <span class="w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-300 animate-ping' : 'bg-brand-500'}"></span>
          <span>${price}</span>
        </div>
        <div class="w-2 h-2 rotate-45 -mt-1 border-r border-b ${arrowStyles}"></div>
      </div>
    `,
    iconSize: [68, 34],
    iconAnchor: [34, 30],
    popupAnchor: [0, -32]
  });
}

// Controller component to manage flyTo and bounds inside MapContainer
function MapController({ targetCity, targetCenter, targetZoom, properties, fitBoundsSignal }) {
  const map = useMap();

  // Smooth flyTo when targetCenter changes
  useEffect(() => {
    if (targetCenter && targetCenter[0] && targetCenter[1]) {
      map.flyTo(targetCenter, targetZoom || 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    } else if (targetCity) {
      const cityInfo = INDIAN_CITY_CENTERS[targetCity] || INDIAN_CITY_CENTERS['All'];
      map.flyTo(cityInfo.center, cityInfo.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [targetCity, targetCenter, targetZoom, map]);

  // Fit bounds when signal triggered
  useEffect(() => {
    if (fitBoundsSignal && properties.length > 0) {
      const validLocs = properties
        .filter((p) => p.location?.lat && p.location?.lng)
        .map((p) => [p.location.lat, p.location.lng]);

      if (validLocs.length > 0) {
        map.fitBounds(validLocs, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true,
          duration: 1.0
        });
      }
    }
  }, [fitBoundsSignal, properties, map]);

  return null;
}

export default function InteractiveMap({
  properties = [],
  selectedCity = 'All',
  center = null,
  zoom = null,
  hoveredPropertyId = null,
  onSelectProperty = null,
  onCityChange = null,
  showQuickPills = true,
  className = 'w-full h-full min-h-[460px]'
}) {
  const [tileStyle, setTileStyle] = useState('clean');
  const [fitSignal, setFitSignal] = useState(0);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const [tierTab, setTierTab] = useState('all'); // 'all', 'luxury', 'mid', 'value'

  const cityConfig = INDIAN_CITY_CENTERS[selectedCity] || INDIAN_CITY_CENTERS['All'];
  const effectiveCenter = center || cityConfig.center;
  const effectiveZoom = zoom || cityConfig.zoom;

  const currentCityObj = findCity(selectedCity);

  const displayedCities = INDIAN_CITIES_100.filter((c) => {
    if (tierTab === 'all') return true;
    return c.tier === tierTab;
  });

  const handleFitAll = () => {
    setFitSignal((prev) => prev + 1);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg z-10 flex flex-col ${className}`}>
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Budget Tier Selector + City Dropdown + Map Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Budget Tier Filter Pills */}
          {showQuickPills && (
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Cities (100)' },
                { id: 'luxury', label: '💎 High Budget' },
                { id: 'mid', label: '🌟 Mid Budget' },
                { id: 'value', label: '🏷️ Value Budget' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTierTab(t.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                    tierTab === t.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Quick Select Any of 100 Cities & Style Switcher */}
          <div className="pointer-events-auto flex items-center gap-1.5 ml-auto">
            {showQuickPills && (
              <div className="relative">
                <select
                  value={selectedCity || 'All'}
                  onChange={(e) => onCityChange && onCityChange(e.target.value)}
                  className="px-3 py-1.5 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-7 hover:border-brand-400 transition-colors"
                >
                  <option value="All">📍 All India (100 Cities)</option>
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
            )}

            <button
              onClick={handleFitAll}
              title="Fit all hotels in view"
              className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fit All</span>
            </button>

            <select
              value={tileStyle}
              onChange={(e) => setTileStyle(e.target.value)}
              className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="clean">🗺️ Clean Positron</option>
              <option value="streets">🛣️ OSM Streets</option>
              <option value="voyager">🏝️ Travel Voyager</option>
            </select>
          </div>
        </div>

        {/* Row 2: Scrollable Quick City Pills Filtered by Tier */}
        {showQuickPills && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-md border border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 pl-1 shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-600" />
              {tierTab === 'all' ? 'Top Cities:' : `${tierTab.toUpperCase()} Cities:`}
            </span>

            {displayedCities.slice(0, tierTab === 'all' ? 14 : 25).map((c) => {
              const active = (selectedCity || 'All').toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  onClick={() => onCityChange && onCityChange(c.name)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[9px] px-1 rounded font-normal ${active ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    #{c.rank}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected City Budget Tier Floating Banner */}
      {currentCityObj && (
        <div className="absolute bottom-4 left-4 z-[1000] pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 text-xs flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900">{currentCityObj.name}, {currentCityObj.state}</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Rank #{currentCityObj.rank}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Budget: <strong className="text-slate-800">{currentCityObj.avgBudget}</strong> • {currentCityObj.tag}
            </span>
          </div>
        </div>
      )}

      {/* Main Leaflet Map */}
      <div className="flex-1 w-full h-full min-h-[360px]">
        <MapContainer
          center={effectiveCenter}
          zoom={effectiveZoom}
          scrollWheelZoom={true}
          className="w-full h-full min-h-[360px]"
        >
          <MapController
            targetCity={selectedCity}
            targetCenter={center}
            targetZoom={zoom}
            properties={properties}
            fitBoundsSignal={fitSignal}
          />

          <TileLayer
            attribution={TILE_STYLES[tileStyle].attribution}
            url={TILE_STYLES[tileStyle].url}
          />

          {properties.map((property) => {
            if (!property.location?.lat || !property.location?.lng) return null;

            const isHovered = hoveredPropertyId === property._id;
            const isSelected = selectedPropertyId === property._id;
            const icon = createCustomPriceMarker(property, isHovered, isSelected);

            return (
              <Marker
                key={property._id}
                position={[property.location.lat, property.location.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedPropertyId(property._id);
                    if (onSelectProperty) onSelectProperty(property);
                  }
                }}
              >
                <Popup className="custom-hotel-popup">
                  <div className="w-64 p-3 font-sans bg-white">
                    {/* Thumbnail Image */}
                    <div className="relative rounded-2xl overflow-hidden mb-2.5 shadow-sm">
                      <img
                        src={
                          property.images?.[0] ||
                          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={property.title}
                        className="w-full h-28 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                        {property.propertyType?.replace('_', ' ') || 'Venue'}
                      </span>
                    </div>

                    {/* Title & City */}
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">
                      {property.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {property.address || property.city}
                    </p>

                    {/* Specs Row */}
                    <div className="flex items-center justify-between text-xs mt-2 mb-3 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-bold text-slate-900">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {property.rating}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({property.numReviews || 24})
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-600 text-[11px]">
                        <Users className="w-3 h-3 text-slate-400" />
                        Up to {property.maxCapacity} pax
                      </span>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold leading-none">Starting from</span>
                        <span className="font-black text-sm text-brand-600">
                          ₹{property.basePrice?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">/day</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/properties/${property._id}`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          Details <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                        <Link
                          to={`/planner?propertyId=${property._id}`}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-bold rounded-xl transition-colors"
                        >
                          Bundle
                        </Link>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Floating Stats Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Showing <strong>{properties.length}</strong> mapped hotels in {cityConfig.label}
        </span>
      </div>
    </div>
  );
}

