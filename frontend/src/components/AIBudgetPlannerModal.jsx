import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Check, ArrowRight, ShieldAlert, Layers, TrendingUp, MapPin } from 'lucide-react';
import { aiAPI } from '../services/api';
import { INDIAN_CITIES_100 } from '../data/indianCities';

export default function AIBudgetPlannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState('Wedding');
  const [city, setCity] = useState('Janakpur');
  const [guests, setGuests] = useState(300);
  const [budget, setBudget] = useState(200000);
  const [includeCatering, setIncludeCatering] = useState(true);
  const [includeDecoration, setIncludeDecoration] = useState(true);
  const [includePhotography, setIncludePhotography] = useState(true);
  const [includeDJ, setIncludeDJ] = useState(true);
  const [additionalFacilities, setAdditionalFacilities] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await aiAPI.recommendPackage({
        eventType,
        city,
        guests: Number(guests),
        budget: Number(budget),
        includeCatering,
        includeDecoration,
        includePhotography,
        includeDJ,
        additionalFacilities: additionalFacilities.trim()
      });

      if (res.success && res.recommendation) {
        setResult(res);
      } else {
        setError(res.message || 'No packages found within this budget. Try increasing budget or reducing guests.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  const handleApplyToPlanner = () => {
    if (!result?.recommendation?.venue) return;
    onClose();
    const notesQuery = additionalFacilities.trim() ? `&notes=${encodeURIComponent(additionalFacilities.trim())}` : '';
    navigate(`/planner?propertyId=${result.recommendation.venue._id}${notesQuery}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">AI Event Package Recommendation Engine</h3>
              <p className="text-xs text-purple-200">Budget optimization & automated service bundling</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {!result ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              <p className="text-xs text-slate-500">
                Enter your celebration criteria, and our recommendation engine will find the best venue and calculate optimal catering, decor, and media within your spending target.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Corporate">Corporate Conference</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-500">Location</label>
                    <span className="text-[10px] text-purple-600 font-bold">100+ cities</span>
                  </div>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="All Cities">🌐 All Cities (Nationwide Search)</option>
                    <optgroup label="Popular Wedding & Event Destinations">
                      <option value="Janakpur">Janakpur (Mithila / Nepal)</option>
                      <option value="Patna">Patna (Bihar)</option>
                      <option value="Udaipur">Udaipur (Palace / Royal Venues)</option>
                      <option value="Jaipur">Jaipur (Pink City / Heritage)</option>
                      <option value="Goa">Goa (Beachside & Resorts)</option>
                      <option value="Delhi">Delhi NCR (Metropolitan)</option>
                      <option value="Mumbai">Mumbai (Coastal Luxury)</option>
                      <option value="Bengaluru">Bengaluru (Garden City)</option>
                      <option value="Varanasi">Varanasi (Spiritual / Ghats)</option>
                      <option value="Kolkata">Kolkata (Cultural Grandeur)</option>
                      <option value="Lucknow">Lucknow (Nawabi Heritage)</option>
                      <option value="Agra">Agra (Taj Heritage)</option>
                      <option value="Hyderabad">Hyderabad (Nizam Grandeur)</option>
                      <option value="Chandigarh">Chandigarh (City Beautiful)</option>
                      <option value="Rishikesh">Rishikesh (Ganges & Foothills)</option>
                    </optgroup>
                    <optgroup label="All 100+ Cities Across India & Region">
                      {INDIAN_CITIES_100.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} {c.state ? `(${c.state})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Expected Guests</label>
                  <input
                    type="number"
                    min="30"
                    max="1000"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Budget (₹)</label>
                  <input
                    type="number"
                    step="5000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-brand-600"
                  />
                </div>
              </div>

              {/* Service Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Services to Bundle</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCatering}
                      onChange={(e) => setIncludeCatering(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold">Catering</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDecoration}
                      onChange={(e) => setIncludeDecoration(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold">Decoration</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePhotography}
                      onChange={(e) => setIncludePhotography(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold">4K Photo</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDJ}
                      onChange={(e) => setIncludeDJ(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold">DJ Sound</span>
                  </label>
                </div>
              </div>

              {/* Description Note for Other Facilities */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Other Facilities & Special Notes</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium lowercase">blank description note</span>
                </div>
                <textarea
                  rows={3}
                  value={additionalFacilities}
                  onChange={(e) => setAdditionalFacilities(e.target.value)}
                  placeholder="Describe any other facilities or special notes needed (e.g., VIP bridal dressing suite, swimming pool access, valet parking, separate vegetarian/Jain kitchen, wheelchair ramps, stage fireworks, LED video wall)..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 hover:from-purple-800 hover:to-brand-700 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Venues & Services...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Generate Optimal Event Package</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* AI Recommended Badge & Venue */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-200 text-purple-900 uppercase tracking-wider">
                    Top AI Recommendation (Score {result.recommendation.suitabilityScore}/100)
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {result.recommendation.isWithinBudget ? '✅ 100% Within Budget' : 'Slightly Above Budget'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900">{result.recommendation.venue.title}</h4>
                <p className="text-xs text-slate-600">
                  {result.recommendation.venue.address}, {result.recommendation.venue.city} (Capacity:{' '}
                  {result.recommendation.venue.maxCapacity} Guests)
                </p>
              </div>

              {/* Rationale */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">🤖 AI Curated Rationale:</span>
                {result.aiAnalysis}
              </div>

              {/* Other Facilities Note Display if specified */}
              {additionalFacilities && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs space-y-1">
                  <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Other Facilities Requested:</span>
                  </span>
                  <p className="text-slate-700 italic pl-5">"{additionalFacilities}"</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Venue Rental:</span>
                  <span>{formatPrice(result.recommendation.venue.basePrice)}</span>
                </div>
                {result.recommendation.selectedServices.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{s.name}</span>
                    <span className="font-semibold">{formatPrice(s.cost)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Calculated Package Total:</span>
                  <span className="text-brand-600">{formatPrice(result.recommendation.estimatedTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Remaining Safety Buffer:</span>
                  <span>{formatPrice(result.recommendation.savings)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Adjust Parameters
                </button>
                <button
                  onClick={handleApplyToPlanner}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <span>Open in Package Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
