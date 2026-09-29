// Base API URL: uses VITE_API_URL when configured in production, falls back to '/api' for Vite dev proxy
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = getApiBase();

// Helper for authorized fetch
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('eventstay_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (netErr) {
    throw new Error('Cannot connect to backend API server. Please ensure the backend is running and accessible.');
  }

  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (jsonErr) {
    throw new Error(`Server returned status ${response.status}. Backend might be restarting.`);
  }

  if (!response.ok) {
    const error = new Error(data.message || `API request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  demoLogin: (role) => apiRequest('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => apiRequest('/auth/me'),
  toggleWishlist: (propertyId) => apiRequest(`/auth/wishlist/${propertyId}`, { method: 'POST' }),
  requestOwnerPasswordReset: (data) =>
    apiRequest('/auth/owner-forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  applyForAdmin: (data) =>
    apiRequest('/auth/apply-admin', { method: 'POST', body: JSON.stringify(data) })
};

export const propertyAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/properties${query ? `?${query}` : ''}`);
  },
  getFeatured: () => apiRequest('/properties/featured'),
  getCities: () => apiRequest('/properties/cities'),
  getById: (id) => apiRequest(`/properties/${id}`),
  create: (data) => apiRequest('/properties', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/properties/${id}`, { method: 'DELETE' }),
  addUnit: (propertyId, data) => apiRequest(`/properties/${propertyId}/units`, { method: 'POST', body: JSON.stringify(data) }),
  deleteUnit: (unitId) => apiRequest(`/properties/units/${unitId}`, { method: 'DELETE' }),
  bulkUpload: async (file) => {
    const token = localStorage.getItem('eventstay_token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/properties/bulk-upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Bulk upload failed');
    }
    return data;
  },
  downloadTemplate: (format = 'csv') => {
    window.open(`${API_BASE}/properties/excel-template?format=${format}`, '_blank');
  }
};

export const serviceAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/services${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/services/${id}`)
};

export const bookingAPI = {
  checkAvailability: (propertyId, unitId, date) =>
    apiRequest('/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify({ propertyId, unitId, date })
    }),
  create: (bookingData) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => apiRequest('/bookings/my'),
  getById: (id) => apiRequest(`/bookings/${id}`),
  cancel: (id, reason) => apiRequest(`/bookings/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  addReview: (id, reviewData) => apiRequest(`/bookings/${id}/review`, { method: 'POST', body: JSON.stringify(reviewData) })
};

export const availabilityAPI = {
  getMonth: (propertyId, year, month, unitId) => {
    const params = new URLSearchParams({
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
      ...(unitId ? { unitId } : {})
    }).toString();
    return apiRequest(`/availability/${propertyId}${params ? `?${params}` : ''}`);
  }
};

export const ownerAPI = {
  getStats: () => apiRequest('/owner/stats'),
  getProperties: () => apiRequest('/owner/properties'),
  getBookings: () => apiRequest('/owner/bookings'),
  updateBookingStatus: (id, status) =>
    apiRequest(`/owner/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getSecurityStatus: () => apiRequest('/owner/security-status'),
  registerOwner: (data) => apiRequest('/owner/register-owner', { method: 'POST', body: JSON.stringify(data) }),
  verifySecurity: (data) => apiRequest('/owner/verify-security', { method: 'POST', body: JSON.stringify(data) }),
  forgotPin: () => apiRequest('/owner/forgot-pin', { method: 'POST' }),
  verifyOtpAndSetPin: (data) => apiRequest('/owner/reset-pin-otp', { method: 'POST', body: JSON.stringify(data) })
};

export const adminAPI = {
  getStats: () => apiRequest('/admin/stats'),
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${q ? `?${q}` : ''}`);
  },
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  getProperties: () => apiRequest('/admin/properties'),
  toggleApproveProperty: (id) => apiRequest(`/admin/properties/${id}/toggle-approve`, { method: 'PUT' }),
  getComplaints: () => apiRequest('/admin/complaints'),
  updateComplaint: (id, data) => apiRequest(`/admin/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  verifySecurity: (data) => apiRequest('/admin/verify-security', { method: 'POST', body: JSON.stringify(data) }),
  getSecurityStatus: () => apiRequest('/admin/security-status'),
  updateSecurityPin: (data) => apiRequest('/admin/update-pin', { method: 'PUT', body: JSON.stringify(data) }),
  resetAndTransfer: (data) => apiRequest('/admin/reset-handover', { method: 'POST', body: JSON.stringify(data) }),
  getWebAuthnRegisterOptions: () => apiRequest('/admin/webauthn/register-options'),
  verifyWebAuthnRegister: (data) =>
    apiRequest('/admin/webauthn/register-verify', { method: 'POST', body: JSON.stringify(data) }),
  getWebAuthnAuthOptions: () => apiRequest('/admin/webauthn/auth-options'),
  deleteWebAuthnCredential: (id) => apiRequest(`/admin/webauthn/credentials/${id}`, { method: 'DELETE' }),
  registerAdmin: (data) => apiRequest('/admin/register-admin', { method: 'POST', body: JSON.stringify(data) }),
  forgotPin: () => apiRequest('/admin/forgot-pin', { method: 'POST' }),
  verifyOtpAndSetPin: (data) => apiRequest('/admin/reset-pin-otp', { method: 'POST', body: JSON.stringify(data) }),
  // Hotel Owner Approvals & Management
  getOwnerRequests: (params = {}) =>
    apiRequest('/admin/owner-requests' + (params.status ? `?status=${params.status}` : '')),
  approveOwnerRequest: (id) => apiRequest(`/admin/owner-requests/${id}/approve`, { method: 'PUT' }),
  rejectOwnerRequest: (id, reason) =>
    apiRequest(`/admin/owner-requests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  changeUserPassword: (id, newPassword) =>
    apiRequest(`/admin/users/${id}/change-password`, { method: 'PUT', body: JSON.stringify({ newPassword }) }),
  toggleBlockUser: (id, reason) =>
    apiRequest(`/admin/users/${id}/toggle-block`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  getPasswordResetRequests: () => apiRequest('/admin/password-reset-requests'),
  approvePasswordResetRequest: (id, data) =>
    apiRequest(`/admin/password-reset-requests/${id}/approve`, { method: 'PUT', body: JSON.stringify(data) }),
  rejectPasswordResetRequest: (id, reason) =>
    apiRequest(`/admin/password-reset-requests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  getAdminApplications: () => apiRequest('/admin/admin-applications'),
  reviewAdminApplication: (id, data) =>
    apiRequest(`/admin/admin-applications/${id}/review`, { method: 'PUT', body: JSON.stringify(data) })
};

export const couponAPI = {
  validate: (code, amount) =>
    apiRequest('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),
  getActive: () => apiRequest('/coupons')
};

export const aiAPI = {
  recommendPackage: (data) => apiRequest('/ai/recommend-package', { method: 'POST', body: JSON.stringify(data) }),
  chat: (message, context) => apiRequest('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) })
};
