import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Headphones,
  FileText,
  Lock,
  Award,
  Sparkles,
  Users,
  Building2,
  Car,
  Plane,
  UtensilsCrossed,
  Briefcase,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Globe,
  HeartHandshake,
  Leaf,
  Newspaper,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Check
} from 'lucide-react';

export default function InfoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const activeSlug = slug || 'about';

  // State for interactive Contact Customer Service Form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    bookingId: '',
    topic: 'Booking & Reservations',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSlug]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({
        name: '',
        email: '',
        bookingId: '',
        topic: 'Booking & Reservations',
        message: ''
      });
    }, 4000);
  };

  const SECTIONS = [
    {
      category: 'Support',
      items: [
        { id: 'contact', title: 'Contact Customer Service', icon: Headphones, summary: '24/7 dedicated guest support, call centers & live assistance' },
        { id: 'safety', title: 'Safety Resource Center', icon: Shield, summary: 'Guest protection, property security & hygiene protocols' },
        { id: 'partner-help', title: 'Partner Help Center', icon: HelpCircle, summary: 'Onboarding guides & property operations for hotel owners' }
      ]
    },
    {
      category: 'Discover',
      items: [
        { id: 'genius', title: 'Genius Loyalty Program', icon: Award, summary: 'Unlock up to 20% discounts, free breakfasts & room upgrades' },
        { id: 'articles', title: 'Travel Articles & Guides', icon: Newspaper, summary: 'Expert destination wedding planners & holiday tips' },
        { id: 'business', title: 'EventStay.com for Business', icon: Briefcase, summary: 'Corporate retreats, summits & centralized business billing' },
        { id: 'awards', title: 'Traveler Review Awards', icon: Sparkles, summary: 'Annual verified guest satisfaction & hospitality honors' },
        { id: 'car-rental', title: 'Car & Fleet Rental', icon: Car, summary: 'Wedding luxury convoys, airport pickups & guest coaches' },
        { id: 'flights', title: 'Flight Finder', icon: Plane, summary: 'Group flight bookings & destination wedding air charters' },
        { id: 'restaurants', title: 'Restaurant & Catering', icon: UtensilsCrossed, summary: 'Banquet tasting sessions & fine dining reservations' },
        { id: 'travel-agents', title: 'Travel Agent Portal', icon: Globe, summary: 'B2B rates & wholesale commissions for travel agencies' }
      ]
    },
    {
      category: 'Terms and Settings',
      items: [
        { id: 'privacy', title: 'Privacy Notice', icon: Lock, summary: 'Digital Personal Data Protection (DPDP) & GDPR compliance' },
        { id: 'terms', title: 'Terms of Service', icon: FileText, summary: 'Platform usage, cancellation terms & guest agreements' },
        { id: 'accessibility', title: 'Accessibility Statement', icon: Users, summary: 'Equal access, ramp facilities & digital compliance' },
        { id: 'grievance', title: 'Grievance Officer', icon: AlertCircle, summary: 'Statutory Indian IT Rules grievance redressal mechanism' },
        { id: 'modern-slavery', title: 'Modern Slavery Statement', icon: HeartHandshake, summary: 'Zero tolerance for forced labor & fair wages' },
        { id: 'human-rights', title: 'Human Rights Statement', icon: Shield, summary: 'Universal dignity, anti-discrimination & ethical conduct' }
      ]
    },
    {
      category: 'Partners',
      items: [
        { id: 'partner-overview', title: 'Partner Overview', icon: Building2, summary: 'Grow your hotel and banquet business with EventStay' },
        { id: 'affiliate', title: 'Become an Affiliate', icon: TrendingUp, summary: 'Earn referral commissions on weddings and staycations' }
      ]
    },
    {
      category: 'About',
      items: [
        { id: 'about', title: 'About EventStay.com', icon: Building2, summary: 'India’s premier hybrid hotel stay & grand venue ecosystem' },
        { id: 'how-we-work', title: 'How We Work', icon: CheckCircle2, summary: 'Transparent bookings, price guarantees & escrow safety' },
        { id: 'sustainability', title: 'Sustainability', icon: Leaf, summary: 'Eco-conscious resorts, energy efficiency & zero-waste events' },
        { id: 'press', title: 'Press Center', icon: Newspaper, summary: 'Company news, media kits & official press releases' },
        { id: 'careers', title: 'Careers', icon: Briefcase, summary: 'Join our mission to revolutionize Indian hospitality' },
        { id: 'investors', title: 'Investor Relations', icon: TrendingUp, summary: 'Financial disclosures, corporate governance & growth roadmaps' },
        { id: 'corporate-contact', title: 'Corporate Contact', icon: MapPin, summary: 'Registered office addresses, legal contacts & headquarters' },
        { id: 'content-guidelines', title: 'Content Guidelines', icon: FileText, summary: 'Review verification standards & anti-fraud policies' }
      ]
    }
  ];

  const currentItem = SECTIONS.flatMap((s) => s.items).find((i) => i.id === activeSlug) || SECTIONS[4].items[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Blue Header Banner */}
      <div className="bg-[#003580] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-200 mb-2">
              <Link to="/" className="hover:underline">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white capitalize">{currentItem.title}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <currentItem.icon className="w-8 h-8 text-[#febb02]" />
              <span>{currentItem.title}</span>
            </h1>
            <p className="text-sm text-sky-100 mt-1 max-w-2xl">
              {currentItem.summary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="px-4 py-2.5 bg-white text-[#003580] rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 transition-colors"
            >
              Explore 2,866+ Hotels
            </Link>
            <Link
              to="/owner/portal"
              className="px-4 py-2.5 bg-[#febb02] text-slate-900 rounded-xl font-bold text-xs shadow-md hover:bg-amber-400 transition-colors"
            >
              Owner Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              Information Directory
            </h3>

            <div className="space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {SECTIONS.map((sec) => (
                <div key={sec.category} className="space-y-1.5">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-2">
                    {sec.category}
                  </h4>
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const isActive = activeSlug === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/info/${item.id}`)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                            isActive
                              ? 'bg-[#003580] text-white shadow-sm font-bold'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#febb02]' : 'text-slate-400'}`} />
                            <span className="truncate">{item.title}</span>
                          </div>
                          {isActive && <ChevronRight className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Detailed Section Content */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
            {/* 1. CONTACT CUSTOMER SERVICE */}
            {activeSlug === 'contact' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">24/7 Guest & Host Support</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Our concierge and customer care team is available 24 hours a day, 7 days a week across India.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <Phone className="w-5 h-5 text-[#006ce4]" />
                    <h4 className="text-xs font-bold text-slate-900">Toll-Free Helpline</h4>
                    <p className="text-sm font-extrabold text-[#006ce4]">+91 1800 209 8899</p>
                    <p className="text-[11px] text-slate-400">Toll-free across all Indian networks</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">Email Support</h4>
                    <p className="text-sm font-extrabold text-slate-800">support@eventstay.com</p>
                    <p className="text-[11px] text-slate-400">Response guaranteed in &lt; 2 hours</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <h4 className="text-xs font-bold text-slate-900">Live Concierge</h4>
                    <p className="text-sm font-extrabold text-purple-700">Online Now</p>
                    <p className="text-[11px] text-slate-400">Instant AI & human agent assistance</p>
                  </div>
                </div>

                {/* Direct Message Form */}
                <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#006ce4]" />
                    Send a Support Inquiry
                  </h3>

                  {contactSubmitted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Thank you! Your ticket #ES-{Math.floor(100000 + Math.random() * 900000)} has been created. A support specialist will respond to {contactForm.email} shortly.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Ved Prakash Pandey"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#006ce4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="ved@example.com"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#006ce4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Booking Reference ID (Optional)</label>
                          <input
                            type="text"
                            value={contactForm.bookingId}
                            onChange={(e) => setContactForm({ ...contactForm, bookingId: e.target.value })}
                            placeholder="e.g. BK-98213"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#006ce4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Inquiry Topic</label>
                          <select
                            value={contactForm.topic}
                            onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#006ce4]"
                          >
                            <option value="Booking & Reservations">Booking & Reservations</option>
                            <option value="Cancellation & Refunds">Cancellation & Refunds</option>
                            <option value="Hotel Owner Registration">Hotel / Venue Owner Inquiries</option>
                            <option value="Billing & Invoices">Billing & GST Invoices</option>
                            <option value="Other Assistance">Other Assistance</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Describe your query</label>
                        <textarea
                          rows={3}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="How can we assist you with your stay or event?"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#006ce4]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#006ce4] hover:bg-[#0057b8] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Submit Support Ticket
                      </button>
                    </form>
                  )}
                </div>

                {/* Frequently Asked Questions */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-extrabold text-base text-slate-900">Frequently Asked Questions</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <p className="font-bold text-slate-800">How do I cancel or modify my hotel reservation?</p>
                      <p className="text-slate-500 mt-1">Navigate to your <Link to="/my-bookings" className="text-[#006ce4] underline">My Bookings</Link> dashboard, select the reservation, and click "Cancel Reservation". Cancellations within the free cancellation window receive a 100% prompt refund.</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <p className="font-bold text-slate-800">Can I inspect the banquet hall before making payment?</p>
                      <p className="text-slate-500 mt-1">Yes! We provide on-site walkthrough appointments with the verified venue owner prior to final contract signing.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SAFETY RESOURCE CENTER */}
            {activeSlug === 'safety' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Safety Resource Center</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    EventStay standards for verified guest safety, emergency readiness, and property inspection.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">1</div>
                    <h3 className="font-bold text-sm text-slate-900">100% Verified Properties</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Every hotel and banquet hall listed undergoes physical address verification, trade license audits, and verified host background screening before receiving an approval badge.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
                    <h3 className="font-bold text-sm text-slate-900">Fire & Crowd Security</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      All event grounds and palace banquets must maintain certified fire NOC clearances, visible emergency exit routes, and dedicated security guards for gathering safety.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">3</div>
                    <h3 className="font-bold text-sm text-slate-900">Secure Escrow Payments</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your booking funds are held safely in escrow and disbursed to hosts only after successful check-in or event commencement, shielding you from last-minute cancellations.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">4</div>
                    <h3 className="font-bold text-sm text-slate-900">24/7 Rapid Incident Desk</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      If any issue arises during check-in or occupancy, our rapid intervention team relocates guests to an equal or upgraded tier property at no extra cost.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GENIUS LOYALTY PROGRAM */}
            {activeSlug === 'genius' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    EventStay Rewards
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Genius Loyalty Program</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Book stays and banquets across India and unlock lifetime discounts, free room upgrades, and complimentary gourmet breakfasts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-3 hover:border-[#006ce4] transition-colors">
                    <span className="text-xs font-black text-[#006ce4] uppercase">Level 1</span>
                    <h3 className="text-lg font-black text-slate-900">10% Off Stays</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Instant eligibility upon creating your customer account. Enjoy 10% discount on participating hotel rooms nationwide.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 10% Room Discount</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Early check-in priority</li>
                    </ul>
                  </div>

                  <div className="p-5 bg-sky-50 border-2 border-[#006ce4] rounded-2xl space-y-3 shadow-md relative">
                    <div className="absolute -top-3 right-4 px-2 py-0.5 bg-[#006ce4] text-white text-[10px] font-black rounded-full uppercase">
                      Most Popular
                    </div>
                    <span className="text-xs font-black text-[#006ce4] uppercase">Level 2</span>
                    <h3 className="text-lg font-black text-slate-900">15% Off + Breakfast</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Complete 5 bookings within 24 months to unlock complimentary luxury breakfasts and higher savings.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 15% Hotel Discount</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Free Gourmet Breakfast</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Free Room Upgrades</li>
                    </ul>
                  </div>

                  <div className="p-5 bg-amber-50/60 border-2 border-amber-300 rounded-2xl space-y-3">
                    <span className="text-xs font-black text-amber-700 uppercase">Level 3 (VIP)</span>
                    <h3 className="text-lg font-black text-slate-900">20% Off + Concierge</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Complete 10 stays or 1 grand wedding booking. Lifetime VIP status with direct executive concierge.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 20% Off Stays & Banquets</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Personal Concierge</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Late 4:00 PM Checkout</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#006ce4] hover:bg-[#0057b8] text-white text-xs font-black rounded-xl shadow-md"
                  >
                    <span>Browse Genius Discounted Stays</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* 4. TRAVEL ARTICLES */}
            {activeSlug === 'articles' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Travel Articles & Destination Inspiration</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Curated guides for luxury wedding destinations, cultural heritage trails, and weekend staycations across 100 Indian cities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Top 10 Royal Palaces in Rajasthan for Grand Destination Weddings',
                      city: 'Jaipur & Udaipur',
                      tag: 'Weddings',
                      img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
                      desc: 'A comprehensive guide to palatial courtyards, mandap setups, and guest suite capacity in royal forts.'
                    },
                    {
                      title: 'Goa Beachfront Resorts: Sunset Mandaps & Coastal Luxury',
                      city: 'Goa',
                      tag: 'Resorts',
                      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                      desc: 'Best beachside villas and 5-star properties offering private beach lawns and cocktail decks.'
                    },
                    {
                      title: 'Planning a 500-Guest Wedding on a Smart Budget: City Breakdown',
                      city: 'All 100 Indian Cities',
                      tag: 'Budget Guide',
                      img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
                      desc: 'How tier classification (Tier 1 vs Tier 2 vs Tier 3) helps you save up to 40% on catering and decor.'
                    },
                    {
                      title: 'Spiritual Retreats & Heritage Stays in Varanasi and Tirupati',
                      city: 'Spiritual Circuits',
                      tag: 'Culture',
                      img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
                      desc: 'Peaceful boutique hotels near ancient ghats and sacred temples with pure-vegetarian gourmet dining.'
                    }
                  ].map((art, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="h-36 overflow-hidden">
                        <img src={art.img} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="px-2 py-0.5 bg-[#006ce4]/10 text-[#006ce4] font-bold rounded-md">{art.tag}</span>
                          <span className="text-slate-400 font-semibold">{art.city}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{art.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{art.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. EVENTSTAY FOR BUSINESS */}
            {activeSlug === 'business' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">EventStay.com for Business</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Streamlined corporate event booking, offsites, annual general meetings, and group business stays across 100 cities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Briefcase className="w-6 h-6 text-[#006ce4]" />
                    <h3 className="font-bold text-sm text-slate-900">MICE & Conferences</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">High-capacity auditoriums, high-speed Wi-Fi, audio-visual conference equipment, and delegate dining.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">Centralized GST Billing</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Single corporate consolidated invoices with instant GST input tax credit pass-through for enterprise finance.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-sm text-slate-900">Dedicated Account Exec</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">A single point of contact to coordinate room blocks, airport pick-ups, and conference itineraries.</p>
                  </div>
                </div>

                <div className="p-6 bg-[#003580] text-white rounded-2xl space-y-3">
                  <h3 className="text-base font-extrabold text-white">Book Corporate Events or Bulk Rooms</h3>
                  <p className="text-xs text-sky-100 max-w-xl">
                    Planning an offsite or conference for 50 to 2,000 delegates? Connect with our corporate solutions team for corporate discounts.
                  </p>
                  <button
                    onClick={() => navigate('/info/contact')}
                    className="px-5 py-2.5 bg-[#febb02] text-slate-900 text-xs font-black rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Request Enterprise Proposal
                  </button>
                </div>
              </div>
            )}

            {/* 6. CONCIERGE SERVICES (Car Rental, Flights, Restaurants) */}
            {(activeSlug === 'car-rental' || activeSlug === 'flights' || activeSlug === 'restaurants') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {activeSlug === 'car-rental' ? 'Wedding Fleet & Chauffeur Services' : activeSlug === 'flights' ? 'Group Flights & Air Charters' : 'Banquet Culinary & Tasting Sessions'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    EventStay concierge integration for end-to-end event logistics and guest hospitality.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    {activeSlug === 'car-rental' && <Car className="w-8 h-8 text-[#006ce4]" />}
                    {activeSlug === 'flights' && <Plane className="w-8 h-8 text-sky-600" />}
                    {activeSlug === 'restaurants' && <UtensilsCrossed className="w-8 h-8 text-amber-600" />}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {activeSlug === 'car-rental' ? 'Luxury Wedding Convoys & Guest Coaches' : activeSlug === 'flights' ? 'Group Flight Reservations & Air Ticketing' : 'Full-Spectrum Event Catering & Chef Tastings'}
                      </h3>
                      <p className="text-xs text-slate-500">Available across all 100 Indian cities in partnership with certified operators.</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    You can seamlessly bundle transportation, group flights, or custom catering into your booking using our interactive <Link to="/planner" className="text-[#006ce4] font-bold underline">Event Package Builder</Link> or by consulting with our dedicated event concierge.
                  </p>

                  <div className="pt-2 flex gap-3">
                    <Link
                      to="/planner"
                      className="px-5 py-2.5 bg-[#006ce4] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0057b8]"
                    >
                      Open Event Package Builder
                    </Link>
                    <Link
                      to="/info/contact"
                      className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100"
                    >
                      Contact Logistics Desk
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 7. TERMS & PRIVACY POLICIES */}
            {(activeSlug === 'privacy' || activeSlug === 'terms' || activeSlug === 'accessibility' || activeSlug === 'grievance' || activeSlug === 'modern-slavery' || activeSlug === 'human-rights') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 capitalize">
                    {currentItem.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Last updated: January 2026 • Compliant with Indian IT Act 2000, Consumer Protection Rules 2020 & DPDP 2023.
                  </p>
                </div>

                <div className="prose prose-sm max-w-none text-slate-600 text-xs leading-relaxed space-y-4">
                  {activeSlug === 'privacy' && (
                    <>
                      <p>At EventStay.com (under Booking Holdings Inc.), we value your privacy. We collect customer information—including name, verified email, phone number, and transaction logs—strictly to facilitate hotel room reservations, event contracts, and mandatory local regulatory compliance.</p>
                      <h4 className="text-sm font-bold text-slate-900 mt-3">1. Data Storage & Encryption</h4>
                      <p>All sensitive payment data is processed through PCI-DSS Level 1 certified gateways with 256-bit AES encryption. We never store raw credit/debit card numbers or bank passwords on our servers.</p>
                      <h4 className="text-sm font-bold text-slate-900 mt-3">2. User Rights & Data Erasure</h4>
                      <p>Users hold the right to review, download, or request permanent deletion of their personal profile by contacting privacy@eventstay.com.</p>
                    </>
                  )}

                  {activeSlug === 'terms' && (
                    <>
                      <p>Welcome to EventStay.com. By accessing or booking through this platform, you agree to comply with our Terms of Service.</p>
                      <h4 className="text-sm font-bold text-slate-900 mt-3">1. Booking Confirmation & Escrow Protection</h4>
                      <p>A reservation is confirmed once the initial deposit or full amount is authorized. Funds remain protected under EventStay Escrow until property check-in or event verification.</p>
                      <h4 className="text-sm font-bold text-slate-900 mt-3">2. Host Obligations & Accurate Representations</h4>
                      <p>All property photos, guest capacity counts, and amenities displayed must accurately match physical conditions. Material discrepancies entitle guests to an immediate re-allocation or full refund.</p>
                    </>
                  )}

                  {activeSlug === 'grievance' && (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <h3 className="text-sm font-black text-slate-900">Grievance Redressal Mechanism (Rule 3(2) Indian IT Rules 2021)</h3>
                      <p>In accordance with the Information Technology Act 2000 and rules made thereunder, the contact details of the Grievance Officer are:</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-bold text-slate-800">Officer Name:</span> Rajesh K. Verma</p>
                        <p><span className="font-bold text-slate-800">Designation:</span> Head of Legal & Grievance Redressal</p>
                        <p><span className="font-bold text-slate-800">Email:</span> grievance@eventstay.com</p>
                        <p><span className="font-bold text-slate-800">Address:</span> EventStay India Legal Cell, Barakhamba Road, Connaught Place, New Delhi 110001</p>
                        <p><span className="font-bold text-slate-800">Turnaround Time:</span> Acknowledged within 24 hours; resolved within 15 days.</p>
                      </div>
                    </div>
                  )}

                  {activeSlug === 'accessibility' && (
                    <>
                      <p>EventStay is committed to digital and physical accessibility. We continuously enhance our website following WCAG 2.1 AA standards, supporting screen readers, keyboard-only navigation, and high-contrast visuals.</p>
                      <p>Furthermore, our venue directory explicitly filters for step-free access, wheelchair elevators, and accessible guest suites.</p>
                    </>
                  )}

                  {activeSlug === 'modern-slavery' && (
                    <>
                      <p>EventStay maintains a strict zero-tolerance stance on human trafficking, child labor, and modern slavery across all partner hotels, catering vendors, and logistics contractors.</p>
                      <p>All affiliated venues must comply with minimum wage standards, lawful working hours, and fair employment conditions.</p>
                    </>
                  )}

                  {activeSlug === 'human-rights' && (
                    <>
                      <p>We believe hospitality is rooted in dignity and respect. EventStay enforces a strict anti-discrimination policy ensuring that no guest is denied access or treated inequitably on grounds of religion, race, caste, gender, sexual orientation, disability, or marital status.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 8. PARTNER OVERVIEW & AFFILIATES */}
            {(activeSlug === 'partner-overview' || activeSlug === 'partner-help' || activeSlug === 'affiliate') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {activeSlug === 'affiliate' ? 'Become an EventStay Affiliate' : 'Partner Network & Extranet'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Connect with over 2.5 million monthly celebrants and business travelers looking for stays and venues in India.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <Building2 className="w-7 h-7 text-[#006ce4]" />
                    <h3 className="font-black text-base text-slate-900">List Your Hotel or Banquet Hall</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Register your property in under 5 minutes. Enjoy zero listing fees, automated booking calendar management, and instant payouts.
                    </p>
                    <Link
                      to="/owner/portal"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006ce4] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0057b8]"
                    >
                      <span>Go to Owner Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <Lock className="w-7 h-7 text-emerald-600" />
                    <h3 className="font-black text-base text-slate-900">Hotel Owner Extranet Login</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Already an approved hotel owner? Access your live reservations, update room prices, block dates, and download guest manifests.
                    </p>
                    <Link
                      to="/login?role=owner"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700"
                    >
                      <span>Owner Extranet Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {activeSlug === 'affiliate' && (
                  <div className="p-6 bg-gradient-to-r from-blue-900 to-[#003580] text-white rounded-2xl space-y-3">
                    <h3 className="text-base font-black text-white">Event Planner & Travel Influencer Commissions</h3>
                    <p className="text-xs text-sky-100 max-w-xl">
                      Earn up to 5% commission on every verified room stay and banquet hall booking referred through your custom affiliate link or agency code.
                    </p>
                    <button
                      onClick={() => navigate('/info/contact')}
                      className="px-5 py-2.5 bg-[#febb02] text-slate-900 text-xs font-black rounded-xl hover:bg-amber-400"
                    >
                      Apply for Affiliate Code
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 9. ABOUT EVENTSTAY & COMPANY */}
            {(activeSlug === 'about' || activeSlug === 'how-we-work' || activeSlug === 'sustainability' || activeSlug === 'press' || activeSlug === 'careers' || activeSlug === 'investors' || activeSlug === 'corporate-contact' || activeSlug === 'content-guidelines' || activeSlug === 'awards' || activeSlug === 'travel-agents') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {currentItem.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    EventStay.com — Pioneering the future of hospitality, staycations, and wedding celebrations in India.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                  {activeSlug === 'about' && (
                    <>
                      <p className="text-sm font-bold text-slate-800">
                        EventStay.com is India's first unified digital marketplace specifically engineered to bridge the worlds of luxury hotel accommodations and grand celebratory venues.
                      </p>
                      <p>
                        Led by Owner & Administrator <strong>Ved Prakash Pandey</strong>, EventStay bridges 2,866+ verified properties across 100 Indian cities with high-to-low budget tiers. Whether booking a single executive room in Bengaluru or booking an entire heritage palace in Jaipur with 40 guest suites for a 3-day royal wedding, EventStay makes celebration bookings seamless and reliable.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                        <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200">
                          <p className="text-xl font-black text-[#006ce4]">2,866+</p>
                          <p className="text-[11px] text-slate-500 font-semibold">Mapped Properties</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200">
                          <p className="text-xl font-black text-emerald-600">100</p>
                          <p className="text-[11px] text-slate-500 font-semibold">Indian Cities</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200">
                          <p className="text-xl font-black text-purple-600">3 Tiers</p>
                          <p className="text-[11px] text-slate-500 font-semibold">High, Mid & Value</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200">
                          <p className="text-xl font-black text-amber-600">100%</p>
                          <p className="text-[11px] text-slate-500 font-semibold">Verified Hosts</p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeSlug === 'how-we-work' && (
                    <div className="space-y-4">
                      <p>Our 4-step process ensures verified transparency and zero booking surprises:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-black text-[#006ce4]">Step 1: Explore & Filter</span>
                          <p className="text-slate-500">Filter by city, guest capacity, price per day, and occasion (wedding, corporate, party).</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-black text-[#006ce4]">Step 2: Real-time Availability</span>
                          <p className="text-slate-500">Live calendar dates synchronized with hotel PMS systems preventing double-bookings.</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-black text-[#006ce4]">Step 3: Escrow Payment</span>
                          <p className="text-slate-500">Pay safely using UPI, NetBanking, or Credit Card. Funds are secured until check-in.</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-black text-[#006ce4]">Step 4: Check-in & Celebration</span>
                          <p className="text-slate-500">Direct digital invoice, hotel voucher, and 24/7 concierge assistance on event day.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSlug === 'sustainability' && (
                    <div className="space-y-3">
                      <p>EventStay is committed to reducing the environmental footprint of major gatherings and holiday travels:</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                        <li><strong>Green Venue Certification:</strong> We highlight venues that utilize solar power, rainwater harvesting, and organic waste composters.</li>
                        <li><strong>Zero Food Waste Initiative:</strong> Partnering with local NGOs across Delhi, Mumbai, and Patna to safely donate surplus banquet meals to communities in need.</li>
                        <li><strong>No Single-Use Plastic:</strong> Advocating for glass carafes and biodegradable cutlery in event operations.</li>
                      </ul>
                    </div>
                  )}

                  {activeSlug === 'corporate-contact' && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-slate-900">Corporate & Registered Offices</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-extrabold text-slate-800">New Delhi Headquarters</p>
                          <p className="text-slate-500 mt-1">Level 7, Connaught Place Tower, Barakhamba Road, New Delhi 110001</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-extrabold text-slate-800">Regional Operations (East & North)</p>
                          <p className="text-slate-500 mt-1">EventStay Executive Center, Fraser Road, Patna, Bihar 800001</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSlug === 'careers' && (
                    <div className="space-y-3">
                      <p>We are always seeking passionate product engineers, venue liaisons, and hospitality professionals.</p>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-sm text-slate-800">Open Positions</h4>
                        <ul className="space-y-1 text-slate-600">
                          <li>• Senior Fullstack React/Node Engineer (Remote / Delhi)</li>
                          <li>• Regional Venue Partnership Manager (Mumbai, Bengaluru, Jaipur)</li>
                          <li>• 24/7 Guest Experience Specialist (Patna / Delhi)</li>
                        </ul>
                        <p className="pt-2 text-slate-500">Send your resume to <strong className="text-slate-800">careers@eventstay.com</strong>.</p>
                      </div>
                    </div>
                  )}

                  {activeSlug !== 'about' && activeSlug !== 'how-we-work' && activeSlug !== 'sustainability' && activeSlug !== 'corporate-contact' && activeSlug !== 'careers' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="font-bold text-sm text-slate-800">Official Platform Governance</h4>
                      <p>
                        For inquiries regarding {currentItem.title}, please contact our administrative desk at <strong className="text-slate-800">info@eventstay.com</strong> or utilize our 24/7 support line.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
