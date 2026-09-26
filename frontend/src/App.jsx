import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIBudgetPlannerModal from './components/AIBudgetPlannerModal';
import AIChatbotWidget from './components/AIChatbotWidget';
import PortalGatewayModal from './components/PortalGatewayModal';

// Public & Customer Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import EventPlannerPage from './pages/EventPlannerPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InfoPage from './pages/InfoPage';

// Dedicated Portal Gateways
import OwnerPortalPage from './pages/OwnerPortalPage';
import AdminPortalPage from './pages/AdminPortalPage';

// Owner Management Pages & Security Guard
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerPropertiesPage from './pages/OwnerPropertiesPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import OwnerSecurityGuard from './components/OwnerSecurityGuard';

// Admin Governance Pages & Security Guard
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminSecurityGuard from './components/AdminSecurityGuard';

// Global Portal Security Watcher:
// Enforces that every time the user leaves or switches away from the Admin Portal,
// the admin security verification is immediately revoked so password is required on re-entry.
function PortalSecurityManager() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    const wasInAdmin = prevPath.startsWith('/admin');
    const isInAdmin = currentPath.startsWith('/admin');

    // If leaving the admin portal to any other window, invalidate admin security session
    if (wasInAdmin && !isInAdmin) {
      sessionStorage.removeItem('eventstay_admin_verified');
      sessionStorage.removeItem('eventstay_admin_verified_time');
      window.dispatchEvent(new Event('eventstay_admin_lock'));
    }

    prevPathRef.current = currentPath;
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);
  const [portalModalOpen, setPortalModalOpen] = useState(() => {
    // Open gateway on first opening of the platform if not previously dismissed
    return !sessionStorage.getItem('eventstay_portal_gateway_seen');
  });

  const handleClosePortalModal = () => {
    sessionStorage.setItem('eventstay_portal_gateway_seen', 'true');
    setPortalModalOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <PortalSecurityManager />
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
          <Navbar
            onOpenAIPlanner={() => setAiPlannerOpen(true)}
            onOpenPortalGateway={() => setPortalModalOpen(true)}
          />

          <main className="flex-1">
            <Routes>
              {/* Public & Customer Routes */}
              <Route path="/" element={<HomePage onOpenAIPlanner={() => setAiPlannerOpen(true)} />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/planner" element={<EventPlannerPage onOpenAIPlanner={() => setAiPlannerOpen(true)} />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/booking-success" element={<BookingSuccessPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/info/:slug" element={<InfoPage />} />
              <Route path="/info" element={<InfoPage />} />

              {/* Dedicated Portal Windows */}
              <Route path="/owner/portal" element={<OwnerPortalPage />} />
              <Route path="/admin/portal" element={<AdminPortalPage />} />

              {/* Venue Owner Portal - Protected by Admin Approval Guard */}
              <Route path="/owner/dashboard" element={<OwnerSecurityGuard><OwnerDashboardPage /></OwnerSecurityGuard>} />
              <Route path="/owner/properties" element={<OwnerSecurityGuard><OwnerPropertiesPage /></OwnerSecurityGuard>} />
              <Route path="/owner/bookings" element={<OwnerSecurityGuard><OwnerBookingsPage /></OwnerSecurityGuard>} />

              {/* Platform Superadmin Portal - Protected by PIN Security Guard */}
              <Route path="/admin/dashboard" element={<AdminSecurityGuard><AdminDashboardPage /></AdminSecurityGuard>} />
              <Route path="/admin/users" element={<AdminSecurityGuard><AdminUsersPage /></AdminSecurityGuard>} />
              <Route path="/admin/complaints" element={<AdminSecurityGuard><AdminComplaintsPage /></AdminSecurityGuard>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Individual Portal Window Gateway Modal */}
          <PortalGatewayModal
            isOpen={portalModalOpen}
            onClose={handleClosePortalModal}
          />

          {/* AI Global Modals & Float Widget */}
          <AIBudgetPlannerModal
            isOpen={aiPlannerOpen}
            onClose={() => setAiPlannerOpen(false)}
          />
          <AIChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}
