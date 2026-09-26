import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCog
} from 'lucide-react';
import { adminAPI } from '../services/api';

export default function EditUserModal({ user, isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [businessName, setBusinessName] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'customer');
      setBusinessName(user.businessName || '');
      setIsVerified(user.isVerified !== false);
      setNewPassword('');
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Valid email address is required');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        businessName: role === 'owner' ? businessName.trim() : businessName.trim(),
        isVerified: Boolean(isVerified)
      };

      if (newPassword) {
        payload.password = newPassword.trim();
      }

      const res = await adminAPI.updateUser(user._id, payload);

      if (res.success) {
        setSuccess('User details updated successfully!');
        if (onSuccess) onSuccess(res.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err.message || 'Error updating user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const res = await adminAPI.deleteUser(user._id);
      if (res.success) {
        if (onSuccess) onSuccess(null, user._id);
        onClose();
      } else {
        throw new Error(res.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-6 my-8 animate-scaleIn">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#003580]/10 border border-[#003580]/20 text-[#003580] flex items-center justify-center shrink-0">
              <UserCog className="w-6 h-6 text-[#003580]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Edit Account Details
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    role === 'owner'
                      ? 'bg-indigo-100 text-indigo-800'
                      : role === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Editing user profile for <span className="font-semibold text-slate-800">{user.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Account Role *
            </label>
            <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'owner'
                    ? 'bg-white text-indigo-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏨 Venue Owner
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Singhania"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@eventstay.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
                />
              </div>
            </div>
          </div>

          {/* Phone Number & Business Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98123 45678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {role === 'owner' ? 'Business / Company Name *' : 'Organization / Company'}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Singhania Hospitality"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
              />
            </div>
          </div>

          {/* Verification Badge Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded text-[#006ce4] focus:ring-[#006ce4] w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified KYC & Identity
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Authorizes venue listings, verified badges, and trusted host status
                </span>
              </div>
            </label>
          </div>

          {/* Optional Password Reset */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Set New Password (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#006ce4] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
            />
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || user.role === 'admin'}
              title={user.role === 'admin' ? 'Cannot delete admin account' : 'Delete user account'}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#006ce4] hover:bg-[#0057b8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
