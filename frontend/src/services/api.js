import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventora_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eventora_token')
      localStorage.removeItem('eventora_user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const vendorAPI = {
  getVendors: (params) => api.get('/public/vendors', { params }),
  getVendor: (id) => api.get(`/public/vendors/${id}`),
  getTopVendors: (params) => api.get('/public/vendors/top', { params }),
  createProfile: (data) => api.post('/vendor/profile', data),
  updateProfile: (data) => api.put('/vendor/profile', data),
  getMyProfile: () => api.get('/vendor/profile'),
  getStats: () => api.get('/vendor/stats'),
  approveVendor: (id) => api.post(`/admin/vendors/${id}/approve`),
  rejectVendor: (id, reason) => api.post(`/admin/vendors/${id}/reject`, { reason }),
}

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getVendorBookings: (params) => api.get('/bookings/vendor-bookings', { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  getByReference: (ref) => api.get(`/bookings/reference/${ref}`),
}

export const wishlistAPI = {
  toggle: (vendorId) => api.post(`/wishlist/toggle/${vendorId}`),
  getWishlist: () => api.get('/wishlist'),
}

export const chatbotAPI = {
  chat: (data) => api.post('/chatbot/public/chat', data),
  chatAuth: (data) => api.post('/chatbot/chat', data),
}

export const aiAPI = {
  estimateBudget: (data) => api.post('/ai/estimate-budget', data),
  rankVendors: (data) => api.post('/ai/rank-vendors', data),
}

export default api
