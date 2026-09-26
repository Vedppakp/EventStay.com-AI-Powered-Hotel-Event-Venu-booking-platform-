import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { availabilityAPI } from '../services/api';

export default function AvailabilityCalendar({ propertyId, unitId, onSelectDate, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Default to November 2026 for demo alignment
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (!propertyId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await availabilityAPI.getMonth(propertyId, year, month + 1, unitId);
        if (res.success) {
          setBookedDates(res.bookedDates || []);
        }
      } catch (err) {
        console.error('Failed to fetch calendar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [propertyId, year, month, unitId]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build days matrix
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const isDateBooked = (day) => {
    if (!day) return null;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedDates.find((b) => b.dateStr === formattedDate);
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === formattedDate;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {monthNames[month]} {year}
            </h3>
            <span className="text-xs text-slate-400">Real-time venue availability</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-12 rounded-xl bg-slate-50/50" />;
          }

          const bookingInfo = isDateBooked(day);
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const selected = isSelected(day);

          if (bookingInfo) {
            return (
              <div
                key={day}
                className="h-12 rounded-xl p-1 bg-rose-50 border border-rose-200 text-rose-800 flex flex-col justify-between items-center text-xs font-bold cursor-not-allowed group relative"
                title={`Booked: ${bookingInfo.eventType} (${bookingInfo.guestsCount} guests)`}
              >
                <span>{day}</span>
                <span className="text-[9px] text-rose-600 font-extrabold px-1 bg-rose-100/80 rounded truncate max-w-full">
                  Booked
                </span>
              </div>
            );
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate && onSelectDate(dateString)}
              className={`h-12 rounded-xl p-1 flex flex-col justify-between items-center text-xs font-bold transition-all ${
                selected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                  : 'bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-100/70 text-emerald-900'
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[9px] font-semibold px-1 rounded ${
                  selected ? 'text-white' : 'text-emerald-700'
                }`}
              >
                Open
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-around text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Available Date</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Booked / Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-brand-600" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
