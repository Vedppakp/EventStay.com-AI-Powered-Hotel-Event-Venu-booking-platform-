import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  User,
  Building2,
  Search,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  Ban,
  Unlock,
  AlertCircle,
  XCircle,
  Send,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { adminAPI } from '../services/api';
import AdminHeader from '../components/AdminHeader';
import EditUserModal from '../components/EditUserModal';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'approvals' | 'resets' | 'admin_apps'

  // Directory state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Approvals state
  const [pendingOwners, setPendingOwners] = useState([]);
  const [approvingId, setApprovingId] = useState(null);

  // Password reset requests state
  const [resetRequests, setResetRequests] = useState([]);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Admin applications state
  const [adminApps, setAdminApps] = useState([]);

  // Direct Change Password modal state
  const [changePasswordTarget, setChangePasswordTarget] = useState(null);
  const [directNewPassword, setDirectNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Action status message
  const [actionNotice, setActionNotice] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [uRes, oRes, rRes, aRes] = await Promise.all([
        adminAPI.getUsers({ role: roleFilter }),
        adminAPI.getOwnerRequests({ status: 'pending' }).catch(() => ({ owners: [] })),
        adminAPI.getPasswordResetRequests().catch(() => ({ requests: [] })),
        adminAPI.getAdminApplications().catch(() => ({ applications: [] }))
      ]);

      if (uRes.success) setUsers(uRes.users || []);
      if (oRes.success) setPendingOwners(oRes.owners || []);
      if (rRes.success) setResetRequests(rRes.requests || []);
      if (aRes.success) setAdminApps(aRes.applications || []);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [roleFilter]);

  const showNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // --- Hotel Owner Approvals ---
  const handleApproveOwner = async (ownerId) => {
    setApprovingId(ownerId);
    try {
      const res = await adminAPI.approveOwnerRequest(ownerId);
      if (res.success) {
        showNotification(res.message);
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to approve owner');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectOwner = async (ownerId) => {
    const reason = prompt('Please enter the reason for declining this hotel registration:');
    if (reason === null) return; // cancelled
    setApprovingId(ownerId);
    try {
      const res = await adminAPI.rejectOwnerRequest(ownerId, reason);
      if (res.success) {
        showNotification(res.message);
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject owner');
    } finally {
      setApprovingId(null);
    }
  };

  // --- Block / Unblock User ---
  const handleToggleBlock = async (user) => {
    const actionText = user.isBlocked ? 'unblock' : 'block';
    let reason = '';
    if (!user.isBlocked) {
      reason = prompt(`Enter suspension reason for "${user.name}":`) || 'Policy compliance review';
    }
    try {
      const res = await adminAPI.toggleBlockUser(user._id, reason);
      if (res.success) {
        showNotification(res.message);
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || `Failed to ${actionText} user`);
    }
  };

  // --- Direct Change Password ---
  const handleDirectChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!directNewPassword || directNewPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await adminAPI.changeUserPassword(changePasswordTarget._id, directNewPassword);
      if (res.success) {
        showNotification(res.message);
        setChangePasswordTarget(null);
        setDirectNewPassword('');
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // --- Approve Owner Password Reset Request ---
  const handleApproveResetRequest = async (e) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await adminAPI.approvePasswordResetRequest(resettingUser._id, {
        newPassword: newPasswordInput,
        adminNote: 'Approved by Super Admin Ved Prakash Pandey'
      });
      if (res.success) {
        showNotification(res.message);
        setResettingUser(null);
        setNewPasswordInput('');
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to approve reset');
    }
  };

  const handleRejectResetRequest = async (userId) => {
    const reason = prompt('Reason for rejecting password reset:');
    if (reason === null) return;
    try {
      const res = await adminAPI.rejectPasswordResetRequest(userId, reason);
      if (res.success) {
        showNotification(res.message);
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject reset');
    }
  };

  // --- Admin Application Review ---
  const handleReviewAdminApp = async (userId, action) => {
    const note = prompt(`Enter review note for ${action === 'approve' ? 'granting' : 'declining'} admin access:`);
    if (note === null) return;
    try {
      const res = await adminAPI.reviewAdminApplication(userId, { action, adminNote: note });
      if (res.success) {
        showNotification(res.message);
        fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to review application');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    return (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Alert */}
        {actionNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600">
              Super Admin Command Desk
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Platform Governance & Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Admin: <span className="font-bold text-slate-800">Ved Prakash Pandey</span> • Manage hotel owner approvals, password authority, user suspensions & applications
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAllData}
            className="self-start sm:self-auto px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh All Data</span>
          </button>
        </div>

        {/* Main Governance View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User & Host Directory</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-bold">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hotel Owner Approvals</span>
            {pendingOwners.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold animate-pulse">
                {pendingOwners.length} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resets')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'resets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Owner Password Reset Requests</span>
            {resetRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold animate-pulse">
                {resetRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin_apps')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'admin_apps'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Access Applications</span>
            {adminApps.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full text-[10px] font-extrabold">
                {adminApps.length}
              </span>
            )}
          </button>
        </div>

        {/* ======================================================= */}
        {/* VIEW 1: HOTEL OWNER APPROVALS                           */}
        {/* ======================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Hotel Owner Approval Authority:</span>
                As Super Admin, only your approval unlocks the hotelier's management dashboard. Pending applicants cannot access property tools until you grant approval below.
              </div>
            </div>

            {pendingOwners.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">All Hotel Owners Reviewed</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  There are currently no hotel or resort registration requests waiting for your approval.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOwners.map((owner) => (
                  <div
                    key={owner._id}
                    className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 hover:border-amber-400 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold uppercase">
                          Pending Approval
                        </span>
                        <h3 className="text-base font-black text-slate-900">{owner.businessName || 'Property / Hotel'}</h3>
                        <p className="text-xs text-slate-500">
                          Host: <span className="font-bold text-slate-700">{owner.name}</span>
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-semibold text-slate-800">{owner.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-semibold text-slate-800">{owner.phone || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Application Date:</span>
                        <span>{new Date(owner.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={approvingId === owner._id}
                        onClick={() => handleApproveOwner(owner._id)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Hotelier</span>
                      </button>

                      <button
                        type="button"
                        disabled={approvingId === owner._id}
                        onClick={() => handleRejectOwner(owner._id)}
                        className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 2: OWNER PASSWORD RESET REQUESTS                   */}
        {/* ======================================================= */}
        {activeTab === 'resets' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl text-xs text-indigo-900 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Admin Exclusive Password Authority:</span>
                If an owner forgets their password, they cannot reset it alone. They submit a request here, and only you (Super Admin Ved Prakash Pandey) can approve and set their new password.
              </div>
            </div>

            {resetRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Pending Reset Requests</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All hotel owners currently have active login credentials.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resetRequests.map((reqUser) => (
                  <div
                    key={reqUser._id}
                    className="bg-white rounded-3xl p-6 border-2 border-indigo-200 hover:border-indigo-400 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-extrabold uppercase">
                          Password Reset Request
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">{reqUser.name}</h3>
                        <p className="text-xs text-slate-500">{reqUser.email}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <KeyRound className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotel / Business:</span>
                        <span className="font-semibold text-slate-800">{reqUser.businessName || 'Property'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Requested:</span>
                        <span>{new Date(reqUser.passwordResetRequest?.requestedAt || Date.now()).toLocaleString('en-IN')}</span>
                      </div>
                      {reqUser.passwordResetRequest?.requestedNewPassword && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400">Requested Password:</span>
                          <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                            {reqUser.passwordResetRequest.requestedNewPassword}
                          </span>
                        </div>
                      )}
                      {reqUser.passwordResetRequest?.adminNote && (
                        <div className="pt-1 text-[11px] text-slate-500 italic">
                          "{reqUser.passwordResetRequest.adminNote}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setResettingUser(reqUser);
                          setNewPasswordInput(reqUser.passwordResetRequest?.requestedNewPassword || '');
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Approve & Set Password</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectResetRequest(reqUser._id)}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 3: ADMIN ACCESS APPLICATIONS                       */}
        {/* ======================================================= */}
        {activeTab === 'admin_apps' && (
          <div className="space-y-4">
            <div className="bg-purple-50/80 border border-purple-200 p-4 rounded-2xl text-xs text-purple-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Admin Registration Security:</span>
                Direct registration as Admin is disabled. Only you (Super Admin Ved Prakash Pandey) can evaluate applications and grant administrator rights to candidates.
              </div>
            </div>

            {adminApps.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Admin Applications Pending</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No other users have requested administrator authority at this time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminApps.map((app) => (
                  <div
                    key={app._id}
                    className="bg-white rounded-3xl p-6 border-2 border-purple-200 hover:border-purple-400 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            app.adminApplication?.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.adminApplication?.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          Status: {app.adminApplication?.status || 'Pending'}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">
                          {app.adminApplication?.applicantName || app.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {app.adminApplication?.applicantEmail || app.email}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span>{app.adminApplication?.applicantPhone || app.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Applied At:</span>
                        <span>{new Date(app.adminApplication?.appliedAt || app.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200">
                        <span className="text-slate-400 block mb-0.5 font-semibold">Application Reason:</span>
                        <p className="text-slate-800 bg-white p-2 rounded-xl border border-slate-200 text-[11px] leading-relaxed">
                          "{app.adminApplication?.reason || 'No statement provided'}"
                        </p>
                      </div>
                    </div>

                    {app.adminApplication?.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleReviewAdminApp(app._id, 'approve')}
                          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Grant Admin Rights</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewAdminApp(app._id, 'reject')}
                          className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 4: USER & HOST DIRECTORY (With Password & Block)   */}
        {/* ======================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="max-w-md w-full">
                <input
                  type="text"
                  placeholder="Filter users by name, email, or hotel brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
              </div>

              {/* Role Filters */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-xs">
                {['all', 'customer', 'owner', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                      roleFilter === r
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'owner' ? 'Venue Owners' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Business / Hotel</th>
                      <th className="p-4">Approval Status</th>
                      <th className="p-4">Account State</th>
                      <th className="p-4 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={
                              u.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'owner'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role === 'owner' ? 'Venue Owner' : u.role}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="text-slate-800 font-semibold">{u.businessName || '—'}</span>
                        </td>

                        <td className="p-4">
                          {u.role === 'owner' ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                u.ownerApprovalStatus === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : u.ownerApprovalStatus === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {u.ownerApprovalStatus === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                              {u.ownerApprovalStatus === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                              {u.ownerApprovalStatus === 'rejected' && <XCircle className="w-3 h-3" />}
                              <span className="capitalize">{u.ownerApprovalStatus || 'Approved'}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standard Account</span>
                          )}
                        </td>

                        <td className="p-4">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                              <Ban className="w-3 h-3 text-rose-600" />
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Change Password Button */}
                            <button
                              type="button"
                              title="Directly change user password"
                              onClick={() => {
                                setChangePasswordTarget(u);
                                setDirectNewPassword('');
                              }}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Block / Unblock Button */}
                            {u.role !== 'admin' && (
                              <button
                                type="button"
                                title={u.isBlocked ? 'Unblock User' : 'Suspend / Block User'}
                                onClick={() => handleToggleBlock(u)}
                                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                  u.isBlocked
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                }`}
                              >
                                {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Edit Details Button */}
                            <button
                              type="button"
                              onClick={() => setEditingUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* MODAL: DIRECT CHANGE USER PASSWORD                      */}
      {/* ======================================================= */}
      {changePasswordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Change User Password</span>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Set new password for <span className="font-bold text-slate-900">{changePasswordTarget.name}</span>{' '}
              <span className="text-slate-400">({changePasswordTarget.email})</span>.
            </div>

            <form onSubmit={handleDirectChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  New Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={directNewPassword}
                  onChange={(e) => setDirectNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setChangePasswordTarget(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{savingPassword ? 'Updating...' : 'Set New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: APPROVE & SET REQUESTED PASSWORD                 */}
      {/* ======================================================= */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Approve Password Reset</span>
              </div>
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Confirm or specify the new password for <span className="font-bold text-slate-900">{resettingUser.name}</span>:
            </div>

            <form onSubmit={handleApproveResetRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Active New Password (Min 6 chars)
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter password to activate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Approve & Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Edit User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSuccess={() => fetchAllData()}
      />
    </div>
  );
}
