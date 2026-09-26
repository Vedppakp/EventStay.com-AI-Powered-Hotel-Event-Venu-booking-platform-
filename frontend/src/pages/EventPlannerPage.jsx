import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';
import EventPackageBuilder from '../components/EventPackageBuilder';
import { propertyAPI, serviceAPI } from '../services/api';

export default function EventPlannerPage({ onOpenAIPlanner }) {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const initialNotes = searchParams.get('notes') || '';

  const [properties, setProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([
          propertyAPI.getAll(),
          serviceAPI.getAll()
        ]);

        if (pRes.success) {
          setProperties(pRes.properties || []);
          if (propertyId) {
            const found = pRes.properties.find((p) => p._id === propertyId);
            if (found) setSelectedProperty(found);
          } else if (pRes.properties.length > 0) {
            setSelectedProperty(pRes.properties[0]);
          }
        }

        if (sRes.success) {
          setServices(sRes.services || []);
        }
      } catch (err) {
        console.error('Planner load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-20 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-brand-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5" /> Event Package Customizer
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Design Your Complete Celebration
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Customize venue rental, per-plate catering, floral stage decor, 4K photography, and hotel rooms for guests. Watch your bill update live with zero hidden surprises.
          </p>
        </div>

        {onOpenAIPlanner && (
          <button
            onClick={onOpenAIPlanner}
            className="px-5 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Budget Auto-Builder</span>
          </button>
        )}
      </div>

      {/* Package Builder Core */}
      <EventPackageBuilder
        initialProperty={selectedProperty}
        initialNotes={initialNotes}
        allProperties={properties}
        allServices={services}
      />
    </div>
  );
}
