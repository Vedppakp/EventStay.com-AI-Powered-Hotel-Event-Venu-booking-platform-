import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Building2,
  CalendarCheck,
  Heart,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Layers,
  MapPin,
  HelpCircle,
  Bed,
  Utensils,
  PartyPopper,
  Compass,
  LayoutGrid,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function Navbar({ onOpenAIPlanner, onOpenPortalGateway }) {
  const { user, isAuthenticated, logout, isCustomer, isOwner, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const handleSwitchToAdmin = () => {
    sessionStorage.removeItem('eventstay_admin_verified');
    sessionStorage.removeItem('eventstay_admin_verified_time');
    window.dispatchEvent(new Event('eventstay_admin_lock'));
    setPortalDropdownOpen(false);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Determine current active portal window
  const getCurrentPortal = () => {
    if (location.pathname.startsWith('/admin')) {
      return {
        key: 'admin',
        name: 'Super Admin',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: ShieldAlert
      };
    }
    if (location.pathname.startsWith('/owner')) {
      return {
        key: 'owner',
        name: 'Hotel Owner',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        icon: Building2
      };
    }
    return {
      key: 'customer',
      name: 'Customer Portal',
      badgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
      icon: Bed
    };
  };

  const currentPortal = getCurrentPortal();
  const PortalIcon = currentPortal.icon;

  return (
    <header className="sticky top-0 z-40 bg-[#003580] text-white shadow-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 border-b border-white/15">
          {/* Logo - Booking.com Style with EventStay branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1">
              EventStay<span className="text-[#febb02]">.com</span>
            </span>
          </Link>

          {/* Right Utility Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 text-xs">
            {/* Currency */}
            <button
              title="Currency: Indian Rupee"
              className="px-2.5 py-1.5 text-white/90 hover:bg-white/10 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <span>INR</span>
            </button>

            {/* Country Flag (India) */}
            <div
              title="India (100 Cities Budget Spectrum)"
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-white/10 hover:bg-white/20 cursor-pointer text-base transition-colors"
            >
              <span>🇮🇳</span>
            </div>

            {/* Help / AI Concierge */}
            <button
              title="Customer Service & AI Concierge"
              onClick={onOpenAIPlanner}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Dedicated Portal Windows Switcher */}
            <div className="relative">
              <div className="flex items-center bg-white/10 rounded-xl border border-white/20 p-1">
                <button
                  type="button"
                  onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-white font-bold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Switch between Customer, Hotel Owner, and Admin Portal Windows"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#febb02]" />
                  <span className="text-[11px] text-white/80">Window:</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border ${currentPortal.badgeColor}`}>
                    {currentPortal.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </button>

                {onOpenPortalGateway && (
                  <button
                    type="button"
                    onClick={onOpenPortalGateway}
                    className="ml-1 px-2 py-1 bg-white/15 hover:bg-white/25 text-[#febb02] font-extrabold rounded-lg text-[10px] transition-all"
                    title="Open Full 3-Portal Window Gateway"
                  >
                    Select Window
                  </button>
                )}
              </div>

              {/* Portal Window Dropdown */}
              {portalDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setPortalDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Independent Platform Windows
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    <Link
                      to="/"
                      onClick={() => setPortalDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        currentPortal.key === 'customer'
                          ? 'bg-blue-600/30 text-sky-300 border border-blue-500/30'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <Bed className="w-4 h-4 text-sky-400" />
                      <div className="flex-1">
                        <div>🛍️ Customer Portal</div>
                        <p className="text-[10px] text-slate-400 font-normal">Explore & book venues</p>
                      </div>
                    </Link>

                    <Link
                      to="/owner/portal"
                      onClick={() => setPortalDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        currentPortal.key === 'owner'
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <div className="flex-1">
                        <div>🏨 Hotel Owner Portal</div>
                        <p className="text-[10px] text-slate-400 font-normal">Register & host management</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/portal"
                      onClick={handleSwitchToAdmin}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        currentPortal.key === 'admin'
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <div className="flex-1">
                        <div>🛡️ Super Admin Portal</div>
                        <p className="text-[10px] text-slate-400 font-normal">Approvals & platform control</p>
                      </div>
                    </Link>
                  </div>

                  {onOpenPortalGateway && (
                    <div className="p-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setPortalDropdownOpen(false);
                          onOpenPortalGateway();
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-[#febb02] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>View 3-Portal Window Gateway</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List Your Property CTA */}
            <Link
              to="/owner/portal"
              className="px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 rounded-lg border border-white/30 transition-colors"
            >
              List your property
            </Link>

            {/* Auth Buttons / User Profile */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/50"
                  />
                  <span className="font-bold text-xs max-w-[90px] truncate text-white">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 capitalize">
                        {user.role} Account
                      </span>
                    </div>

                    {isCustomer && (
                      <>
                        <Link
                          to="/my-bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006ce4]"
                        >
                          <CalendarCheck className="w-4 h-4 text-slate-400" />
                          My Bookings & Invoices
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006ce4]"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          Saved Venues
                        </Link>
                      </>
                    )}

                    {isOwner && (
                      <>
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          Owner Dashboard
                        </Link>
                        <Link
                          to="/owner/properties"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          My Properties & Halls
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={handleSwitchToAdmin}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" />
                          Admin Oversight Desk
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={handleSwitchToAdmin}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Owner Approvals & Users
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/register?role=customer"
                  className="px-3.5 py-1.5 bg-white text-[#006ce4] hover:bg-slate-50 font-bold rounded-md shadow-sm transition-all"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 bg-white text-[#006ce4] hover:bg-slate-50 font-bold rounded-md shadow-sm transition-all"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 text-xs">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              location.pathname === '/'
                ? 'border border-white bg-white/20 text-white shadow-sm'
                : 'text-white/90 hover:bg-white/10 hover:text-white border border-transparent'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Stays & Hotels</span>
          </Link>

          <Link
            to="/explore?category=venue"
            className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              location.pathname === '/explore' && (location.search.includes('venue') || location.search === '')
                ? 'border border-white bg-white/20 text-white'
                : 'text-white/90 hover:bg-white/10 hover:text-white border border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Banquet Venues & Palaces</span>
          </Link>

          <Link
            to="/planner"
            className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              location.pathname === '/planner'
                ? 'border border-white bg-white/20 text-white'
                : 'text-white/90 hover:bg-white/10 hover:text-white border border-transparent'
            }`}
          >
            <PartyPopper className="w-4 h-4 text-[#febb02]" />
            <span>Event Package Builder</span>
          </Link>

          <Link
            to="/explore?view=map"
            className="px-4 py-2 rounded-full font-bold flex items-center gap-2 whitespace-nowrap text-white/90 hover:bg-white/10 hover:text-white border border-transparent transition-all"
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>100 Cities Interactive Map</span>
          </Link>

          {onOpenAIPlanner && (
            <button
              onClick={onOpenAIPlanner}
              className="px-4 py-2 rounded-full font-bold flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white hover:bg-white/20 border border-purple-300/40 transition-all ml-auto shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#febb02]" />
              <span>AI Concierge</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#00224f] px-4 pt-4 pb-6 space-y-4">
          {/* Individual Portal Windows */}
          <div className="p-3 bg-white/10 rounded-2xl border border-white/15 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white/80">Platform Portal Windows:</p>
              {onOpenPortalGateway && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPortalGateway();
                  }}
                  className="text-[10px] text-[#febb02] font-extrabold underline"
                >
                  Gateway
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-2 rounded-xl text-xs font-bold text-center flex flex-col items-center gap-1 ${
                  currentPortal.key === 'customer' ? 'bg-white text-[#003580]' : 'bg-white/10 text-white'
                }`}
              >
                <span>🛍️</span>
                <span className="text-[10px]">Customer</span>
              </Link>
              <Link
                to="/owner/portal"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-2 rounded-xl text-xs font-bold text-center flex flex-col items-center gap-1 ${
                  currentPortal.key === 'owner' ? 'bg-white text-[#003580]' : 'bg-white/10 text-white'
                }`}
              >
                <span>🏨</span>
                <span className="text-[10px]">Owner</span>
              </Link>
              <Link
                to="/admin/portal"
                onClick={handleSwitchToAdmin}
                className={`py-2 px-2 rounded-xl text-xs font-bold text-center flex flex-col items-center gap-1 ${
                  currentPortal.key === 'admin' ? 'bg-white text-[#003580]' : 'bg-white/10 text-white'
                }`}
              >
                <span>🛡️</span>
                <span className="text-[10px]">Admin</span>
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/10"
            >
              <Bed className="w-4 h-4 text-sky-300" />
              <span>Stays & Hotels</span>
            </Link>
            <Link
              to="/explore?category=venue"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/10"
            >
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span>Banquet Venues & Palaces</span>
            </Link>
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#febb02] hover:bg-white/10"
            >
              Event Package Builder
            </Link>
            <Link
              to="/owner/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/10"
            >
              List your property (Owner Portal)
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-white/15 space-y-2">
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded-lg"
              >
                My Bookings & Invoices
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/users"
                  onClick={handleSwitchToAdmin}
                  className="block px-3 py-2 text-sm text-amber-300 font-bold hover:bg-white/10 rounded-lg"
                >
                  Admin Approvals & Directory
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-bold text-rose-300 hover:bg-white/10 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/15 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold bg-white text-[#006ce4] rounded-xl"
              >
                Sign in
              </Link>
              <Link
                to="/register?role=customer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold bg-[#006ce4] text-white rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
