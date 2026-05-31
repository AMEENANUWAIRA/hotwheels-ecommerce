// frontend/src/stores/useStore.js
// Global state management with Zustand

import { create } from 'zustand';
import { authAPI, cartAPI, ordersAPI } from '../utils/api';

export const useStore = create((set, get) => ({
  // USER STATE
  user: null,
  isLoading: false,
  error: null,

  // Fetch current user
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authAPI.profile();
      set({ user: response.data, error: null });
    } catch (error) {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  // Register user
  register: async (username, email, password) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.register(username, email, password);
      // After registration, try to fetch user profile
      // In real app, you'd get token from backend
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Registration failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Login user
  login: async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.data.token);
      set({ user: response.data.user, error: null });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, cart: null });
  },

  // CART STATE
  cart: null,
  cartLoading: false,

  // Fetch user's cart
  fetchCart: async () => {
    try {
      set({ cartLoading: true });
      const response = await cartAPI.view();
      set({ cart: response.data });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      set({ cartLoading: false });
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addItem(productId, quantity);
      set({ cart: response.data });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to add to cart' });
      return false;
    }
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await cartAPI.updateItem(productId, quantity);
      set({ cart: response.data });
    } catch (error) {
      set({ error: 'Failed to update cart' });
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    try {
      const response = await cartAPI.removeItem(productId);
      set({ cart: response.data });
    } catch (error) {
      set({ error: 'Failed to remove from cart' });
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ cart: null });
    } catch (error) {
      set({ error: 'Failed to clear cart' });
    }
  },

  // ORDERS STATE
  orders: [],
  ordersLoading: false,

  // Fetch user's orders
  fetchOrders: async () => {
    try {
      set({ ordersLoading: true });
      const response = await ordersAPI.myOrders();
      set({ orders: response.data });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      set({ ordersLoading: false });
    }
  },

  // FILTERS STATE
  filters: {
    category: [],
    minPrice: 0,
    maxPrice: 100,
    searchQuery: '',
    sortBy: '-created_at',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        category: [],
        minPrice: 0,
        maxPrice: 100,
        searchQuery: '',
        sortBy: '-created_at',
      },
    });
  },

  // UTILITY
  clearError: () => set({ error: null }),
}));

export default useStore;
