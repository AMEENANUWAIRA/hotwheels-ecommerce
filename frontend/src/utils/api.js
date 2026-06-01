// frontend/src/utils/api.js
// API client for communicating with Django backend

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if user is logged in
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  
  // If sending FormData, remove Content-Type header to let axios set it
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // User not authenticated - clear token
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// PRODUCTS
export const productsAPI = {
  // Get all products with filtering
  list: (params = {}) => 
    apiClient.get('/products/', { params }),
  
  // Get single product
  detail: (id) => 
    apiClient.get(`/products/${id}/`),
  
  // Search products
  search: (params) => 
    apiClient.get('/products/search/', { params }),
  
  // Get featured/top products
  featured: () => 
    apiClient.get('/products/featured/'),
  
  // Get recommended products
  recommendations: (productId) => 
    apiClient.get(`/products/${productId}/recommendations/`),
};

// REVIEWS
export const reviewsAPI = {
  // Get reviews for a product
  forProduct: (productId) => 
    apiClient.get('/reviews/', { params: { product_id: productId } }),
  
  // Create review
  create: (data) => 
    apiClient.post('/reviews/', data),
  
  // Update review
  update: (id, data) => 
    apiClient.patch(`/reviews/${id}/`, data),
  
  // Delete review
  delete: (id) => 
    apiClient.delete(`/reviews/${id}/`),
  
  // Mark review as helpful
  markHelpful: (id) => 
    apiClient.post(`/reviews/${id}/mark_helpful/`),
};

// CART
export const cartAPI = {
  // Get current cart
  view: () => 
    apiClient.get('/cart/view_cart/'),
  
  // Add item to cart
  addItem: (productId, quantity) =>
    apiClient.post('/cart/add_item/', { 
      product_id: productId, 
      quantity 
    }),
  
  // Update item quantity
  updateItem: (productId, quantity) =>
    apiClient.post('/cart/update_item/', { 
      product_id: productId, 
      quantity 
    }),
  
  // Remove item from cart
  removeItem: (productId) =>
    apiClient.post('/cart/remove_item/', { 
      product_id: productId 
    }),
  
  // Clear entire cart
  clear: () => 
    apiClient.post('/cart/clear_cart/'),
};

// ORDERS
export const ordersAPI = {
  // Get user's orders
  myOrders: () => 
    apiClient.get('/orders/my_orders/'),
  
  // Get order detail
  detail: (id) => 
    apiClient.get(`/orders/${id}/order_detail/`),
  
  // Create new order
  create: (data) => 
    apiClient.post('/orders/create_order/', data),
  
  // Get order by number
  byNumber: (orderNumber) => 
    apiClient.get('/orders/order_by_number/', { 
      params: { order_number: orderNumber } 
    }),
};

// AUTH
export const authAPI = {
  // Login user
  login: (username, password) =>
    apiClient.post('/auth/login/', {
      username,
      password,
    }),
  
  // Register new user
  register: (username, email, password) =>
    apiClient.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm: password,
    }),
  
  // Get user profile
  profile: () => 
    apiClient.get('/auth/profile/'),
  
  // Update profile
  updateProfile: (data) => 
    apiClient.patch('/auth/profile/', data),
};

// ADMIN
export const adminAPI = {
  // Products
  products: {
    list: () => apiClient.get('/admin/products/'),
    create: (data) => apiClient.post('/admin/products/', data),
    update: (id, data) => apiClient.patch(`/admin/products/${id}/`, data),
    delete: (id) => apiClient.delete(`/admin/products/${id}/`),
  },

  // Inventory
  inventory: {
    list: () => apiClient.get('/admin/inventory/'),
    updateStock: (id, quantity) => 
      apiClient.post(`/admin/inventory/${id}/update_stock/`, { quantity }),
    updateReorderLevel: (id, reorderLevel) => 
      apiClient.post(`/admin/inventory/${id}/reorder_alert/`, { reorder_level: reorderLevel }),
  },

  // Orders
  orders: {
    list: () => apiClient.get('/admin/orders/'),
    detail: (id) => apiClient.get(`/admin/orders/${id}/`),
    updateStatus: (id, status) => 
      apiClient.post(`/admin/orders/${id}/update_status/`, { status }),
  },

  // Users
  users: {
    list: () => apiClient.get('/admin/users/'),
    toggleStaff: (id) => apiClient.post(`/admin/users/${id}/toggle_staff/`),
    toggleActive: (id) => apiClient.post(`/admin/users/${id}/toggle_active/`),
  },

  // Reviews
  reviews: {
    list: () => apiClient.get('/admin/reviews/'),
    delete: (id) => apiClient.delete(`/admin/reviews/${id}/`),
  },
};

export default apiClient;