import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import { adminAPI } from '../services/api';
import AdminHeader from '../components/AdminHeader';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingTarget, setResolvingTarget] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getComplaints();
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error('Complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await adminAPI.updateComplaint(id, {
        status,
        adminNotes: adminNotes || undefined
      });
      if (res.success) {
        setResolvingTarget(null);
        setAdminNotes('');
        fetchComplaints();
      }
    } catch (err) {
      alert(err.message || 'Failed to update complaint');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600">
          Dispute Resolution Desk
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Platform Complaints & Support Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Arbitrate issues between customers and venue hosts regarding amenities, billing, and cancellations
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All disputes resolved</h3>
          <p className="text-xs text-slate-400">There are no open complaints or customer escalations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      comp.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : comp.status === 'investigating'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {comp.status}
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">{comp.subject}</span>
                </div>

                <span className="text-slate-400">
                  Category: <strong className="text-slate-700">{comp.category}</strong> • User: {comp.user?.name}
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                "{comp.description}"
              </p>

              {comp.adminNotes && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">Admin Action / Resolution:</span>
                  <p>{comp.adminNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Filed on {new Date(comp.createdAt).toLocaleDateString('en-IN')}
                </span>

                <div className="flex items-center gap-2">
                  {comp.status !== 'resolved' && (
                    <button
                      onClick={() => setResolvingTarget(comp)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-lg font-bold text-slate-900">
              Resolve Ticket: {resolvingTarget.subject}
            </h3>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Administrative Action Notes</label>
              <textarea
                rows="3"
                required
                placeholder="Explain the settlement or contact with the host..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolvingTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(resolvingTarget._id, 'resolved')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-xl shadow"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
