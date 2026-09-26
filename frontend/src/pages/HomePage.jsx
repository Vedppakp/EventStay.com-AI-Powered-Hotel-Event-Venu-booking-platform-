import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Layers,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  MapPin,
  Clock,
  ThumbsUp,
  Globe2,
  Headphones,
  Tag,
  Gift,
  Compass,
  PartyPopper,
  Calendar,
  Heart,
  Check
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI, serviceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ onOpenAIPlanner }) {
  const { toggleWishlist, isWishlisted, isAuthenticated } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVibe, setActiveVibe] = useState('historical');
  const [popularTab, setPopularTab] = useState('domestic');

  const tripPlannerRef = useRef(null);
  const exploreIndiaRef = useRef(null);
  const beachTripRef = useRef(null);
  const propertyTypeRef = useRef(null);
  const uniquePropsRef = useRef(null);
  const weekendDealsRef = useRef(null);

  const scrollContainer = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, servsRes] = await Promise.all([
          propertyAPI.getFeatured(),
          serviceAPI.getAll()
        ]);
        if (propsRes.success) setFeaturedProperties(propsRes.properties || []);
        if (servsRes.success) setServices(servsRes.services || []);
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const VIBE_CATEGORIES = [
    { id: 'historical', label: 'Historical Expeditions' },
    { id: 'food', label: 'Food & Cooking' },
    { id: 'tours', label: 'Historical Tours' },
    { id: 'festivals', label: 'Festivals & Events' },
    { id: 'wellness', label: 'Wellness & Meditation' },
    { id: 'hills', label: 'Hill Station Retreats' }
  ];

  const VIBE_DESTINATIONS = {
    historical: [
      { city: 'Kolkata', dist: '366 km away', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80' },
      { city: 'Varanasi', dist: '633 km away', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80' },
      { city: 'Hyderabad', dist: '840 km away', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=600&q=80' },
      { city: 'Chennai', dist: '1,001 km away', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
      { city: 'Agra', dist: '1,106 km away', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80' },
      { city: 'Jaipur', dist: '1,259 km away', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80' }
    ],
    food: [
      { city: 'Lucknow', dist: '820 km away', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80' },
      { city: 'Amritsar', dist: '1,450 km away', img: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80' },
      { city: 'Mumbai', dist: '1,510 km away', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
      { city: 'Indore', dist: '1,120 km away', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=600&q=80' },
      { city: 'Kochi', dist: '1,950 km away', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' }
    ],
    tours: [
      { city: 'Udaipur', dist: '1,420 km away', img: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80' },
      { city: 'Jodhpur', dist: '1,380 km away', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80' },
      { city: 'Mysuru', dist: '1,710 km away', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
      { city: 'Hampi', dist: '1,580 km away', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=600&q=80' },
      { city: 'Madurai', dist: '1,890 km away', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' }
    ],
    festivals: [
      { city: 'Pushkar', dist: '1,290 km away', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80' },
      { city: 'Puri', dist: '490 km away', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80' },
      { city: 'Ayodhya', dist: '720 km away', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80' },
      { city: 'Mathura', dist: '1,040 km away', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80' },
      { city: 'Janakpur', dist: '180 km away', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80' }
    ],
    wellness: [
      { city: 'Rishikesh', dist: '1,310 km away', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80' },
      { city: 'Haridwar', dist: '1,280 km away', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80' },
      { city: 'Pondicherry', dist: '1,720 km away', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
      { city: 'Wayanad', dist: '1,890 km away', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
      { city: 'Dharamshala', dist: '1,620 km away', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' }
    ],
    hills: [
      { city: 'Manali', dist: '1,540 km away', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' },
      { city: 'Shimla', dist: '1,420 km away', img: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80' },
      { city: 'Srinagar', dist: '1,780 km away', img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80' },
      { city: 'Darjeeling', dist: '490 km away', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
      { city: 'Ooty', dist: '1,790 km away', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' }
    ]
  };

  const POPULAR_DIRECTORIES = {
    domestic: [
      ['Ooty hotels', 'Munnar hotels', 'Srinagar hotels', 'Alleppey hotels', 'Ahmedabad hotels'],
      ['Hyderabad hotels', 'Mumbai hotels', 'Rishikesh hotels', 'Shimla hotels', 'Ayodhya hotels'],
      ['Jaipur hotels', 'Bangalore hotels', 'Hampi hotels', 'Nainital hotels', 'Kolkata hotels'],
      ['Puri hotels', 'Udaipur hotels', 'Pondicherry hotels', 'Mangalore hotels', 'Alibaug hotels'],
      ['Cochin hotels', 'Varanasi hotels', 'Varkala hotels', 'Lonavala hotels', 'Tiruvannamalai hotels']
    ],
    international: [
      ['Dubai hotels', 'Singapore hotels', 'Bangkok hotels', 'London hotels', 'Paris hotels'],
      ['Kuala Lumpur hotels', 'Tokyo hotels', 'New York hotels', 'Rome hotels', 'Barcelona hotels'],
      ['Bali hotels', 'Phuket hotels', 'Abu Dhabi hotels', 'Amsterdam hotels', 'Istanbul hotels'],
      ['Male hotels', 'Doha hotels', 'Sydney hotels', 'Toronto hotels', 'Berlin hotels'],
      ['Colombo hotels', 'Kathmandu hotels', 'Hong Kong hotels', 'Seoul hotels', 'Zurich hotels']
    ],
    regions: [
      ['North Goa', 'South Goa', 'Himachal Pradesh', 'Uttarakhand', 'Kerala Backwaters'],
      ['Rajasthan Heritage', 'Kashmir Valley', 'Golden Triangle', 'Konkan Coast', 'Nilgiri Hills'],
      ['Delhi NCR', 'Mumbai Metropolitan', 'Coorg Hills', 'Andaman Islands', 'Ladakh Region'],
      ['Western Ghats', 'Eastern Ghats', 'Sundarbans', 'Rann of Kutch', 'Chola Heritage'],
      ['Malabar Coast', 'Coromandel Coast', 'Darjeeling Hills', 'Spiti Valley', 'Thar Desert']
    ],
    countries: [
      ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore'],
      ['Thailand', 'Indonesia', 'Malaysia', 'Maldives', 'France'],
      ['Italy', 'Germany', 'Spain', 'Switzerland', 'Australia'],
      ['Canada', 'Japan', 'Turkey', 'Sri Lanka', 'Nepal'],
      ['Netherlands', 'Greece', 'Vietnam', 'South Africa', 'New Zealand']
    ],
    places: [
      ['Beach Resorts', 'Royal Heritage Palaces', 'Boutique Hotels', 'Wedding Banquet Halls', 'Luxury Villas'],
      ['Hilltop Cottages', 'Houseboats & Lake Stays', 'Golf & Spa Resorts', 'Farmstays & Lawns', 'Serviced Apartments'],
      ['Eco Treehouses', 'Desert Luxury Camps', 'Historic Haveli Stays', 'Convention Centers', 'Business Executive Suites'],
      ['Tea Estate Bungalows', 'Private Island Stays', 'Ayurvedic Retreats', 'Palace Forts', 'Infinity Pool Stays'],
      ['Glamping Pods', 'Riverside Cabins', 'City Penthouses', 'Heritage Homestays', 'Vineyard Estates']
    ]
  };

  return (
    <div className="space-y-14 pb-20 bg-white">
      {/* 1. HERO SECTION - Booking.com signature deep royal blue */}
      <section className="bg-[#003580] text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Find your next stay
            </h1>
            <p className="text-base sm:text-2xl text-white/90 font-medium">
              Search deals on hotels, homes, and much more...
            </p>
          </div>

          {/* Golden Search Box Container - Booking.com signature frame */}
          <div className="pt-4 sm:pt-6">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* 2. WHY BOOKING.COM? (Booking.com Screenshot 2 Authentic 4-Card Gray Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Booking.com?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-[#f5f5f5] p-6 rounded-xl space-y-3 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="10" width="36" height="32" rx="4" fill="#3B82F6" fillOpacity="0.15" stroke="#2563EB" strokeWidth="2.5" />
                  <line x1="14" y1="6" x2="14" y2="12" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <line x1="34" y1="6" x2="34" y2="12" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <line x1="6" y1="18" x2="42" y2="18" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="16" cy="26" r="2.5" fill="#F59E0B" />
                  <circle cx="24" cy="26" r="2.5" fill="#10B981" />
                  <circle cx="32" cy="26" r="2.5" fill="#6366F1" />
                  <path d="M28 34l8-8 4 4-8 8-4-4z" fill="#F59E0B" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Book now, pay at the property
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FREE cancellation on most rooms
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f5f5f5] p-6 rounded-xl space-y-3 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <path d="M14 20v18H8a2 2 0 01-2-2V22a2 2 0 012-2h6z" fill="#006ce4" fillOpacity="0.2" stroke="#006ce4" strokeWidth="2.5" />
                  <path d="M14 20l7-10a3 3 0 015 2v5h10a4 4 0 014 4.5l-3 13A4 4 0 0133 38H14" stroke="#006ce4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="36" cy="14" r="7" fill="#F59E0B" />
                  <path d="M33 14l2 2 4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                300M+ reviews from fellow travelers
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get trusted information from guests like you
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f5f5f5] p-6 rounded-xl space-y-3 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="2.5" />
                  <ellipse cx="24" cy="24" rx="8" ry="16" stroke="#F59E0B" strokeWidth="2" />
                  <line x1="8" y1="24" x2="40" y2="24" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M26 10l6-4v6l-6-2z" fill="#006ce4" />
                  <line x1="26" y1="8" x2="26" y2="16" stroke="#006ce4" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                2+ million properties worldwide
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hotels, guest houses, apartments, and more...
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#f5f5f5] p-6 rounded-xl space-y-3 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="18" r="8" fill="#3B82F6" fillOpacity="0.2" stroke="#006ce4" strokeWidth="2.5" />
                  <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#006ce4" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 18a8 8 0 0116 0" stroke="#006ce4" strokeWidth="3" />
                  <circle cx="14" cy="18" r="2.5" fill="#006ce4" />
                  <circle cx="34" cy="18" r="2.5" fill="#006ce4" />
                  <path d="M34 18v6a3 3 0 01-3 3h-3" stroke="#006ce4" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Trusted 24/7 customer service you can rely on
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We're always here to help
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OFFERS (Booking.com Screenshot 2 Exact Card Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Offers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Promotions, deals, and special offers for you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Promo Card 1 - Authentic Booking.com Getaway Deal */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2.5 max-w-sm">
                <span className="text-xs text-slate-500 font-semibold block">
                  Escape for less with our Getaway Deals
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  No catch. Just getaways.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  At least 15% off select stays worldwide — just book and go.
                </p>
                <div className="pt-2">
                  <Link
                    to="/explore"
                    className="inline-block px-4 py-2.5 bg-[#006ce4] hover:bg-[#0057b8] text-white font-bold text-xs rounded-md shadow-sm transition-colors"
                  >
                    Save with a Getaway Deal
                  </Link>
                </div>
              </div>

              <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Beach Getaway Deal"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Promo Card 2 - Grand Wedding & Event Package Deal */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2.5 max-w-sm">
                <span className="text-xs text-slate-500 font-semibold block">
                  Special Wedding & Celebration Deal
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  Royal halls. Perfect days.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Save up to ₹5,000 on royal palace banquets or bundle catering & guest rooms.
                </p>
                <div className="pt-2">
                  <Link
                    to="/planner"
                    className="inline-block px-4 py-2.5 bg-[#006ce4] hover:bg-[#0057b8] text-white font-bold text-xs rounded-md shadow-sm transition-colors"
                  >
                    Save with an Event Deal
                  </Link>
                </div>
              </div>

              <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"
                  alt="Royal Banquet Offer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRENDING DESTINATIONS (Booking.com Screenshot 4 Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trending destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Most popular choices for travelers from India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Top Left: New Delhi */}
            <Link
              to="/explore?city=New Delhi"
              className="md:col-span-6 relative h-64 sm:h-72 rounded-xl overflow-hidden shadow-sm hover:shadow-md group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80"
                alt="New Delhi"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
              <div className="absolute top-4 left-4">
                <span className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 drop-shadow-md">
                  New Delhi <span>🇮🇳</span>
                </span>
              </div>
            </Link>

            {/* Top Right: Bangalore */}
            <Link
              to="/explore?city=Bengaluru"
              className="md:col-span-6 relative h-64 sm:h-72 rounded-xl overflow-hidden shadow-sm hover:shadow-md group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80"
                alt="Bangalore"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
              <div className="absolute top-4 left-4">
                <span className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 drop-shadow-md">
                  Bangalore <span>🇮🇳</span>
                </span>
              </div>
            </Link>

            {/* Bottom Row 1: Mumbai */}
            <Link
              to="/explore?city=Mumbai"
              className="md:col-span-4 relative h-56 sm:h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-md group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80"
                alt="Mumbai"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
              <div className="absolute top-4 left-4">
                <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 drop-shadow-md">
                  Mumbai <span>🇮🇳</span>
                </span>
              </div>
            </Link>

            {/* Bottom Row 2: Chennai */}
            <Link
              to="/explore?city=Chennai"
              className="md:col-span-4 relative h-56 sm:h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-md group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
                alt="Chennai"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
              <div className="absolute top-4 left-4">
                <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 drop-shadow-md">
                  Chennai <span>🇮🇳</span>
                </span>
              </div>
            </Link>

            {/* Bottom Row 3: Hyderabad */}
            <Link
              to="/explore?city=Hyderabad"
              className="md:col-span-4 relative h-56 sm:h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-md group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=800&q=80"
                alt="Hyderabad"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
              <div className="absolute top-4 left-4">
                <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 drop-shadow-md">
                  Hyderabad <span>🇮🇳</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. QUICK AND EASY TRIP PLANNER (Booking.com Screenshot 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quick and easy trip planner
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick a vibe and explore the top destinations in India
            </p>
          </div>

          {/* Vibe Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {VIBE_CATEGORIES.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVibe(v.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeVibe === v.id
                    ? 'border border-[#006ce4] bg-[#e8f2fe] text-[#006ce4]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Horizontal Slider with Carousel Next Button */}
          <div className="relative group/carousel">
            <div
              ref={tripPlannerRef}
              className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
            >
              {VIBE_DESTINATIONS[activeVibe]?.map((c) => (
                <Link
                  key={c.city}
                  to={`/explore?city=${c.city}`}
                  className="w-48 sm:w-56 shrink-0 group cursor-pointer"
                >
                  <div className="h-36 sm:h-40 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={c.img}
                      alt={c.city}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006ce4] transition-colors">
                      {c.city}
                    </h4>
                    <p className="text-xs text-slate-400">{c.dist}</p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollContainer(tripPlannerRef, 300)}
              className="absolute right-0 top-16 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10"
              aria-label="Next destinations"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. EXPLORE INDIA (Booking.com Screenshot 5 with Property Counts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore India
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              These popular destinations have a lot to offer
            </p>
          </div>

          <div className="relative group/carousel">
            <div
              ref={exploreIndiaRef}
              className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
            >
              {[
                { name: 'New Delhi', count: '3,558 properties', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
                { name: 'Bangalore', count: '3,563 properties', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' },
                { name: 'Mumbai', count: '1,981 properties', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' },
                { name: 'Chennai', count: '1,469 properties', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80' },
                { name: 'Hyderabad', count: '2,265 properties', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=400&q=80' },
                { name: 'Pondicherry', count: '1,140 properties', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80' },
                { name: 'Goa', count: '1,820 properties', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80' },
                { name: 'Jaipur', count: '1,640 properties', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80' }
              ].map((c) => (
                <Link
                  key={c.name}
                  to={`/explore?city=${c.name === 'Bangalore' ? 'Bengaluru' : c.name}`}
                  className="w-48 sm:w-56 shrink-0 group cursor-pointer"
                >
                  <div className="h-36 sm:h-40 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006ce4] transition-colors">
                      {c.name}
                    </h4>
                    <span className="text-xs text-slate-400 block">{c.count}</span>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollContainer(exploreIndiaRef, 300)}
              className="absolute right-0 top-16 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10"
              aria-label="Next cities"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. LOOKING FOR A BEACH TRIP? (Booking.com Screenshot 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Looking for a beach trip?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore beaches, flights, and more to start planning
            </p>
          </div>

          <div className="relative group/carousel">
            <div
              ref={beachTripRef}
              className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
            >
              {[
                {
                  title: 'Mediterranean Europe',
                  sub: 'Greek Islands • Majorca • Sicily and more',
                  img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?tier=luxury'
                },
                {
                  title: 'Atlantic Islands and Coast',
                  sub: 'Tenerife • Madeira Archipelago • Cape Verde and more',
                  img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?city=Goa'
                },
                {
                  title: 'Southeast Asia',
                  sub: 'Bali • Phuket Province • Boracay Island and more',
                  img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?city=Goa'
                },
                {
                  title: 'Indian Ocean Islands',
                  sub: 'Maldives • Mauritius • Seychelles and more',
                  img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?city=Kochi'
                }
              ].map((b) => (
                <Link
                  key={b.title}
                  to={b.link}
                  className="w-64 sm:w-72 shrink-0 group cursor-pointer"
                >
                  <div className="h-40 sm:h-44 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={b.img}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006ce4] transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{b.sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollContainer(beachTripRef, 300)}
              className="absolute right-0 top-18 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10"
              aria-label="Next beaches"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. BROWSE BY PROPERTY TYPE (Booking.com Screenshot 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse by property type
          </h2>

          <div className="relative group/carousel">
            <div
              ref={propertyTypeRef}
              className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
            >
              {[
                {
                  title: 'Hotels',
                  img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?category=hotel'
                },
                {
                  title: 'Apartments',
                  img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?category=hotel'
                },
                {
                  title: 'Resorts',
                  img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?city=Goa'
                },
                {
                  title: 'Villas',
                  img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?tier=luxury'
                },
                {
                  title: 'Banquet Halls',
                  img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?category=venue'
                },
                {
                  title: 'Heritage Palaces',
                  img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
                  link: '/explore?city=Jaipur'
                }
              ].map((t) => (
                <Link
                  key={t.title}
                  to={t.link}
                  className="w-60 sm:w-64 shrink-0 group cursor-pointer"
                >
                  <div className="h-40 sm:h-44 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={t.img}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006ce4] transition-colors">
                      {t.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollContainer(propertyTypeRef, 300)}
              className="absolute right-0 top-18 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10"
              aria-label="Next types"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. STAY AT OUR TOP UNIQUE PROPERTIES (New Screenshot media_1788577746186.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Stay at our top unique properties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              From castles and villas to boats and igloos, we have it all
            </p>
          </div>

          <div className="relative group/carousel">
            <div
              ref={uniquePropsRef}
              className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
            >
              {[
                {
                  id: 'uniq-1',
                  name: 'Radisson Blu Resort Temple Bay Mamallapuram',
                  location: 'Mahabalipuram, India',
                  type: 'Resort',
                  stars: 5,
                  score: '8.4',
                  ratingLabel: 'Very Good',
                  reviews: 797,
                  price: '₹ 13,500',
                  img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-2',
                  name: 'Marari Beach Resort Alleppey - A CGH Earth Experience',
                  location: 'Alleppey, India',
                  type: 'Resort',
                  stars: 5,
                  score: '9.2',
                  ratingLabel: 'Wonderful',
                  reviews: 413,
                  price: '₹ 16,871',
                  img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-3',
                  name: 'Coconut Lagoon Kumarakom - A CGH Earth Experience',
                  location: 'Kumarakom, India',
                  type: 'Resort',
                  stars: 5,
                  score: '9.1',
                  ratingLabel: 'Wonderful',
                  reviews: 454,
                  price: '₹ 19,571',
                  img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-4',
                  name: 'Grand Hyatt Goa',
                  location: 'Panaji, India',
                  type: 'Hotel',
                  stars: 5,
                  score: '8.8',
                  ratingLabel: 'Excellent',
                  reviews: 788,
                  price: '₹ 14,000',
                  img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-5',
                  name: 'The Oberoi Udaivilas Palace',
                  location: 'Udaipur, India',
                  type: 'Palace Resort',
                  stars: 5,
                  score: '9.6',
                  ratingLabel: 'Exceptional',
                  reviews: 1240,
                  price: '₹ 32,500',
                  img: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-6',
                  name: 'Taj Lake Palace Heritage Island',
                  location: 'Udaipur, India',
                  type: 'Palace',
                  stars: 5,
                  score: '9.8',
                  ratingLabel: 'Exceptional',
                  reviews: 1450,
                  price: '₹ 38,000',
                  img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-7',
                  name: 'Umaid Bhawan Palace Heritage',
                  location: 'Jodhpur, India',
                  type: 'Palace',
                  stars: 5,
                  score: '9.9',
                  ratingLabel: 'Exceptional',
                  reviews: 980,
                  price: '₹ 45,000',
                  img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-8',
                  name: 'The Leela Palace Bengaluru',
                  location: 'Bengaluru, India',
                  type: 'Hotel',
                  stars: 5,
                  score: '9.5',
                  ratingLabel: 'Superb',
                  reviews: 1120,
                  price: '₹ 24,000',
                  img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-9',
                  name: 'ITC Grand Chola Luxury Collection',
                  location: 'Chennai, India',
                  type: 'Hotel',
                  stars: 5,
                  score: '9.4',
                  ratingLabel: 'Superb',
                  reviews: 1680,
                  price: '₹ 18,500',
                  img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'uniq-10',
                  name: 'Wildflower Hall in the Himalayas',
                  location: 'Shimla, India',
                  type: 'Resort',
                  stars: 5,
                  score: '9.7',
                  ratingLabel: 'Exceptional',
                  reviews: 640,
                  price: '₹ 29,000',
                  img: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80'
                }
              ].map((p) => (
                <Link
                  key={p.id}
                  to="/explore"
                  className="w-64 sm:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 sm:h-48 overflow-hidden relative">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Heart Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-sm transition-colors"
                        aria-label="Wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{p.type}</span>
                        <div className="flex text-amber-400 text-xs">
                          {'★'.repeat(p.stars)}
                        </div>
                        <span className="text-amber-500 text-xs font-bold">👍</span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006ce4] transition-colors line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-400">{p.location}</p>

                      <div className="flex items-center gap-2 pt-1">
                        <div className="bg-[#003580] text-white font-black text-xs px-2 py-1 rounded-t-md rounded-br-md">
                          {p.score}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block leading-tight">{p.ratingLabel}</span>
                          <span className="text-[10px] text-slate-400 leading-tight">{p.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 text-right">
                    <span className="text-[11px] text-slate-400 block font-normal">Starting from</span>
                    <span className="text-base font-black text-slate-900">{p.price}</span>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollContainer(uniquePropsRef, 300)}
              className="absolute right-0 top-24 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10"
              aria-label="Next unique properties"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. SAVE MORE WITH WEEKEND DEALS (New Screenshot media_1788577746186.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Save more with weekend deals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Available on stays for this upcoming weekend • Sep 11 - Sep 13
            </p>
          </div>

          <div className="relative group/carousel">
            <div
              ref={weekendDealsRef}
              className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
            >
              {[
                {
                  id: 'deal-1',
                  name: 'S G International',
                  location: 'Kolkata, India',
                  badge: 'Genius',
                  dealBadge: 'Getaway Deal',
                  score: '8.2',
                  ratingLabel: 'Very Good',
                  reviews: 151,
                  originalPrice: '₹ 7,030',
                  dealPrice: '₹ 5,624',
                  img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-2',
                  name: 'Treebo Landmark Near Visakhapatnam Railway Station',
                  location: 'Visakhapatnam, India',
                  badge: null,
                  dealBadge: null,
                  score: '7.9',
                  ratingLabel: 'Good',
                  reviews: 14,
                  originalPrice: '₹ 7,580',
                  dealPrice: '₹ 4,275',
                  img: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-3',
                  name: 'A PREMIUM HOTEL ! Dev Bhoomi Residency ! - Near Sea Beach',
                  location: 'Puri, India',
                  badge: null,
                  dealBadge: 'Getaway Deal',
                  score: '5.8',
                  ratingLabel: 'Review score',
                  reviews: 17,
                  originalPrice: '₹ 3,998',
                  dealPrice: '₹ 3,198',
                  img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-4',
                  name: 'Hotel Aston Residency',
                  location: 'Kolkata, India',
                  badge: null,
                  dealBadge: null,
                  score: '7.2',
                  ratingLabel: 'Good',
                  reviews: 6,
                  originalPrice: '₹ 9,149',
                  dealPrice: '₹ 5,635',
                  img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-5',
                  name: 'Holiday Inn Express City Centre',
                  location: 'New Delhi, India',
                  badge: 'Genius',
                  dealBadge: 'Getaway Deal',
                  score: '8.6',
                  ratingLabel: 'Fabulous',
                  reviews: 580,
                  originalPrice: '₹ 8,500',
                  dealPrice: '₹ 5,100',
                  img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-6',
                  name: 'Lemon Tree Premier Hitec City',
                  location: 'Hyderabad, India',
                  badge: 'Genius',
                  dealBadge: null,
                  score: '8.5',
                  ratingLabel: 'Fabulous',
                  reviews: 420,
                  originalPrice: '₹ 8,400',
                  dealPrice: '₹ 6,200',
                  img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-7',
                  name: 'Ginger Hotel Whitefield',
                  location: 'Bengaluru, India',
                  badge: null,
                  dealBadge: 'Getaway Deal',
                  score: '8.1',
                  ratingLabel: 'Very Good',
                  reviews: 290,
                  originalPrice: '₹ 5,800',
                  dealPrice: '₹ 4,100',
                  img: 'https://images.unsplash.com/photo-1545232979-fbf67500b462?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-8',
                  name: 'Radisson Blu Resort & Spa Cavelossim',
                  location: 'Goa, India',
                  badge: 'Genius',
                  dealBadge: 'Getaway Deal',
                  score: '8.9',
                  ratingLabel: 'Fabulous',
                  reviews: 890,
                  originalPrice: '₹ 18,000',
                  dealPrice: '₹ 12,600',
                  img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-9',
                  name: 'Fortune Select Metropolitan',
                  location: 'Jaipur, India',
                  badge: null,
                  dealBadge: null,
                  score: '8.4',
                  ratingLabel: 'Very Good',
                  reviews: 360,
                  originalPrice: '₹ 9,500',
                  dealPrice: '₹ 6,900',
                  img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
                },
                {
                  id: 'deal-10',
                  name: 'FabHotel Prime Marine Drive',
                  location: 'Mumbai, India',
                  badge: null,
                  dealBadge: 'Getaway Deal',
                  score: '8.0',
                  ratingLabel: 'Very Good',
                  reviews: 180,
                  originalPrice: '₹ 6,200',
                  dealPrice: '₹ 4,400',
                  img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'
                }
              ].map((d) => (
                <Link
                  key={d.id}
                  to="/explore"
                  className="w-64 sm:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 sm:h-48 overflow-hidden relative">
                      <img
                        src={d.img}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-sm transition-colors"
                        aria-label="Wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      {d.badge && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#003580] text-white">
                          {d.badge}
                        </span>
                      )}

                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006ce4] transition-colors line-clamp-1 leading-snug">
                        {d.name}
                      </h4>
                      <p className="text-xs text-slate-400">{d.location}</p>

                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="bg-[#003580] text-white font-black text-xs px-2 py-1 rounded-t-md rounded-br-md">
                          {d.score}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block leading-tight">{d.ratingLabel}</span>
                          <span className="text-[10px] text-slate-400 leading-tight">{d.reviews} reviews</span>
                        </div>
                      </div>

                      {d.dealBadge && (
                        <div className="pt-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#008234] text-white">
                            {d.dealBadge}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 text-right">
                    <span className="text-xs text-slate-500 font-medium mr-1.5">2 nights</span>
                    <span className="text-xs text-red-600 line-through mr-1 font-semibold">{d.originalPrice}</span>
                    <span className="text-base font-black text-slate-900">{d.dealPrice}</span>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollContainer(weekendDealsRef, 300)}
              className="absolute right-0 top-24 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10"
              aria-label="Next weekend deals"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 11. TRAVEL MORE, SPEND LESS (Genius Loyalty Card from media_1788577746186.png & media_1788577777916.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm bg-white">
          <div className="space-y-2 max-w-lg">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign in, save money
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Save 10% or more at participating properties – just look for the blue Genius label
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2.5 bg-[#006ce4] hover:bg-[#0057b8] text-white font-bold text-xs rounded-md shadow-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-[#006ce4] hover:underline"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Genius Gift Box Graphic with Yellow Bow & Confetti */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              {/* Confetti particles */}
              <circle cx="20" cy="30" r="3" fill="#3B82F6" />
              <circle cx="100" cy="25" r="3" fill="#F59E0B" />
              <circle cx="15" cy="80" r="2.5" fill="#EF4444" />
              <circle cx="105" cy="75" r="3" fill="#10B981" />
              <rect x="25" y="15" width="4" height="8" rx="1" fill="#F59E0B" transform="rotate(25 25 15)" />
              <rect x="90" y="20" width="4" height="8" rx="1" fill="#3B82F6" transform="rotate(-30 90 20)" />
              <path d="M12 45 Q 16 55 22 50" stroke="#F59E0B" strokeWidth="2" fill="none" />
              <path d="M98 40 Q 106 50 100 60" stroke="#006ce4" strokeWidth="2" fill="none" />

              {/* Yellow Ribbon Bow */}
              <path d="M48 44 C42 30, 28 32, 40 46 C50 48, 54 46, 60 46 C66 46, 70 48, 80 46 C92 32, 78 30, 72 44 Z" fill="#FBBF24" />
              <circle cx="60" cy="46" r="5" fill="#F59E0B" />

              {/* Box Body */}
              <rect x="35" y="46" width="50" height="50" rx="6" fill="#006CE4" />
              <rect x="56" y="46" width="8" height="50" fill="#FBBF24" />
              <rect x="35" y="65" width="50" height="8" fill="#FBBF24" />
              <rect x="32" y="44" width="56" height="8" rx="2" fill="#0057B8" />
              <text x="60" y="85" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="system-ui, sans-serif">Genius</text>
            </svg>
          </div>
        </div>
      </section>

      {/* 12. FEATURED STAYS & VENUES (Live MongoDB Properties) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Stays & Venues
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Highest rated palaces, beach resorts, and banquet halls with verified availability
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006ce4] hover:underline"
          >
            <span>Explore All 2,866 Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 12).map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </section>

      {/* 13. AI EVENT CONCIERGE PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#00224f] rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#febb02]/20 text-[#febb02] text-xs font-bold border border-[#febb02]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#febb02]" />
              <span>Smart Event Concierge</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Calculate your entire wedding or stay budget in 3 seconds.
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Tell our AI Concierge your city, guest count, and date. It curates qualifying banquet halls, per-plate catering, and stage decor in an instant.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenAIPlanner}
              className="px-6 py-3.5 bg-[#febb02] hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow-lg transition-all text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Ask AI Event Planner</span>
            </button>
            <Link
              to="/planner"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-colors text-xs text-center"
            >
              Open Package Builder
            </Link>
          </div>
        </div>
      </section>

      {/* 14. POPULAR WITH TRAVELERS FROM INDIA (media_1788577777916.png Directory & Links) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular with travelers from India
          </h2>
        </div>

        {/* Directory Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'domestic', label: 'Domestic cities' },
            { id: 'international', label: 'International cities' },
            { id: 'regions', label: 'Regions' },
            { id: 'countries', label: 'Countries' },
            { id: 'places', label: 'Places to stay' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPopularTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                popularTab === tab.id
                  ? 'border border-[#006ce4] bg-[#e8f2fe] text-[#006ce4]'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 5-Column Link Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2 text-xs">
          {POPULAR_DIRECTORIES[popularTab]?.map((col, cIdx) => (
            <div key={cIdx} className="space-y-2.5">
              {col.map((item, idx) => (
                <Link
                  key={idx}
                  to={`/explore?search=${encodeURIComponent(item.replace(' hotels', ''))}`}
                  className="block text-slate-700 hover:text-[#006ce4] hover:underline truncate"
                >
                  {item}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Secondary Breadcrumb Link Strip */}
        <div className="pt-6 border-t border-slate-200 space-y-2 text-[11px] text-slate-500 leading-relaxed">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {['Countries', 'Regions', 'Cities', 'Districts', 'Airports', 'Hotels', 'Places of interest', 'Vacation Homes', 'Apartments', 'Resorts', 'Villas', 'Hostels', 'B&Bs', 'Guest Houses', 'Unique places to stay', 'All destinations'].map((crumb, idx, arr) => (
              <React.Fragment key={crumb}>
                <Link to="/explore" className="hover:text-[#006ce4] hover:underline">
                  {crumb}
                </Link>
                {idx < arr.length - 1 && <span className="text-slate-300">•</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {['All flight destinations', 'All car rental locations', 'All vacation destinations', 'Guides', 'Discover', 'Discover monthly stays'].map((crumb, idx, arr) => (
              <React.Fragment key={crumb}>
                <Link to="/explore" className="hover:text-[#006ce4] hover:underline">
                  {crumb}
                </Link>
                {idx < arr.length - 1 && <span className="text-slate-300">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
