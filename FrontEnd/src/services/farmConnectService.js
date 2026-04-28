import { apiRequest } from './apiClient.js'

export const farmConnectService = {
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  verifyOtp: (payload) => apiRequest('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  resendOtp: (payload) => apiRequest('/api/auth/resend-otp', { method: 'POST', body: JSON.stringify(payload) }),
  getAuthStats: () => apiRequest('/api/auth/stats'),
  getAuthUsers: (token) => apiRequest('/api/auth/users', {}, token),
  updateUserBlocked: (userId, payload, token) =>
    apiRequest(`/api/auth/users/${userId}/block`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  deleteAuthUser: (userId, token) => apiRequest(`/api/auth/users/${userId}`, { method: 'DELETE' }, token),
  getProducts: (query = '', token = '') => apiRequest(`/api/products${query}`, {}, token),
  getFarmers: (token = '') => apiRequest('/api/farmers', {}, token),
  getOrders: (token, page = 0, size = 50) => apiRequest(`/api/orders?page=${page}&size=${size}`, {}, token),
  getUsers: (token) => apiRequest('/api/users', {}, token),
  getCurrentUserProfile: (token) => apiRequest('/api/users/me', {}, token),
  getCurrentFarmerProfile: (token, farmerId = '') =>
    farmerId ? apiRequest(`/api/farmers/${farmerId}`, {}, token) : apiRequest('/api/farmers/me', {}, token),
  updateUserProfile: (userId, payload, token) =>
    apiRequest(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  updateFarmerProfile: (userId, payload, token) =>
    apiRequest(`/api/farmers/${userId}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  createProduct: (payload, token) =>
    apiRequest('/api/products', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateProduct: (productId, payload, token) =>
    apiRequest(`/api/products/${productId}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  uploadImage: async (file, token) => {
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const response = await apiRequest('/api/upload/image', { 
        method: 'POST', 
        body: formData,
        headers: {} // Remove Content-Type for FormData
      }, token);
      
      console.log('Upload response:', response);
      
      // Handle different response formats
      if (typeof response === 'string') {
        return { url: response }; // If server returns just the URL as string
      }
      
      if (response && typeof response === 'object') {
        // If server returns { url: "..." } or { imageUrl: "..." }
        return response;
      }
      
      throw new Error('Invalid response format from server');
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
  deleteProduct: (productId, token) => apiRequest(`/api/products/${productId}`, { method: 'DELETE' }, token),
  placeOrder: (payload, token) => apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(payload) }, token),
  confirmOrderPayment: (orderId, payload, token) =>
    apiRequest('/api/payment/confirm', { method: 'POST', body: JSON.stringify({ orderId, ...payload }) }, token),
  updateOrderStatus: (orderId, payload, token) =>
    apiRequest(`/api/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  completeOrderPayout: (orderId, token) =>
    apiRequest('/api/admin/payout/pay', { method: 'POST', body: JSON.stringify({ orderId }) }, token),
}
