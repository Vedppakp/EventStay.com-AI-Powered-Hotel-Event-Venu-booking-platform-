import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] text-slate-600 text-xs border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
          {/* Col 1: Support */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Support</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/my-bookings" className="hover:text-[#006ce4] hover:underline">Manage your trips</Link></li>
              <li><Link to="/info/contact" className="hover:text-[#006ce4] hover:underline">Contact Customer Service</Link></li>
              <li><Link to="/info/safety" className="hover:text-[#006ce4] hover:underline">Safety Resource Center</Link></li>
            </ul>
          </div>

          {/* Col 2: Discover */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Discover</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/info/genius" className="hover:text-[#006ce4] hover:underline">Genius loyalty program</Link></li>
              <li><Link to="/explore?tier=value" className="hover:text-[#006ce4] hover:underline">Seasonal and holiday deals</Link></li>
              <li><Link to="/info/articles" className="hover:text-[#006ce4] hover:underline">Travel articles</Link></li>
              <li><Link to="/info/business" className="hover:text-[#006ce4] hover:underline">EventStay.com for Business</Link></li>
              <li><Link to="/info/awards" className="hover:text-[#006ce4] hover:underline">Traveller Review Awards</Link></li>
              <li><Link to="/info/car-rental" className="hover:text-[#006ce4] hover:underline">Car rental</Link></li>
              <li><Link to="/info/flights" className="hover:text-[#006ce4] hover:underline">Flight finder</Link></li>
              <li><Link to="/info/restaurants" className="hover:text-[#006ce4] hover:underline">Restaurant reservations</Link></li>
              <li><Link to="/info/travel-agents" className="hover:text-[#006ce4] hover:underline">Booking.com for Travel Agents</Link></li>
            </ul>
          </div>

          {/* Col 3: Terms and settings */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Terms and settings</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/info/privacy" className="hover:text-[#006ce4] hover:underline">Privacy Notice</Link></li>
              <li><Link to="/info/terms" className="hover:text-[#006ce4] hover:underline">Terms of Service</Link></li>
              <li><Link to="/info/accessibility" className="hover:text-[#006ce4] hover:underline">Accessibility Statement</Link></li>
              <li><Link to="/info/grievance" className="hover:text-[#006ce4] hover:underline">Grievance officer</Link></li>
              <li><Link to="/info/modern-slavery" className="hover:text-[#006ce4] hover:underline">Modern Slavery Statement</Link></li>
              <li><Link to="/info/human-rights" className="hover:text-[#006ce4] hover:underline">Human Rights Statement</Link></li>
            </ul>
          </div>

          {/* Col 4: Partners */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Partners</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/login?role=owner" className="hover:text-[#006ce4] hover:underline">Extranet login</Link></li>
              <li><Link to="/info/partner-help" className="hover:text-[#006ce4] hover:underline">Partner help</Link></li>
              <li><Link to="/owner/portal" className="hover:text-[#006ce4] hover:underline">List your property</Link></li>
              <li><Link to="/info/affiliate" className="hover:text-[#006ce4] hover:underline">Become an affiliate</Link></li>
            </ul>
          </div>

          {/* Col 5: About */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">About</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/info/about" className="hover:text-[#006ce4] hover:underline">About EventStay.com</Link></li>
              <li><Link to="/info/how-we-work" className="hover:text-[#006ce4] hover:underline">How We Work</Link></li>
              <li><Link to="/info/sustainability" className="hover:text-[#006ce4] hover:underline">Sustainability</Link></li>
              <li><Link to="/info/press" className="hover:text-[#006ce4] hover:underline">Press center</Link></li>
              <li><Link to="/info/careers" className="hover:text-[#006ce4] hover:underline">Careers</Link></li>
              <li><Link to="/info/investors" className="hover:text-[#006ce4] hover:underline">Investor relations</Link></li>
              <li><Link to="/info/corporate-contact" className="hover:text-[#006ce4] hover:underline">Corporate contact</Link></li>
              <li><Link to="/info/content-guidelines" className="hover:text-[#006ce4] hover:underline">Content guidelines and reporting</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 text-center text-[11px] text-slate-500 space-y-2">
          <p>EventStay.com is part of Booking Holdings Inc., the world leader in online travel and event services.</p>
          <p>Copyright © 1996–{new Date().getFullYear()} EventStay.com™. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
