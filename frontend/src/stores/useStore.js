// frontend/src/stores/useStore.js
import { create } from 'zustand';
import { authAPI, cartAPI, ordersAPI, productsAPI } from '../utils/api';

export const useStore = create((set, get) => ({
  // USER STATE
  user: null,
  isLoading: false,
  error: null,

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

  register: async (username, email, password) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.register(username, email, password);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Registration failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

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

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, cart: null });
  },

  // CART STATE
  cart: null,
  cartLoading: false,

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

  updateCartItem: async (productId, quantity) => {
    try {
      const { cart } = get();
      const existingItem = cart?.items?.find(item => item.product.id === productId);

      if (existingItem) {
        const maxStock = existingItem.product.stock_quantity || 0;
        if (quantity > maxStock) {
          set({ error: `Only ${maxStock} units available in stock.` });
          return; 
        }
      }

      const response = await cartAPI.updateItem(productId, quantity);
      set({ cart: response.data, error: null });
    } catch (error) {
      set({ error: 'Failed to update cart' });
    }
  },

  removeFromCart: async (productId) => {
    try {
      const response = await cartAPI.removeItem(productId);
      set({ cart: response.data });
    } catch (error) {
      set({ error: 'Failed to remove from cart' });
    }
  },

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

  // DYNAMIC CATEGORIES STATE
  categories: [],
  categoriesLoading: false,

  fetchCategories: async () => {
    try {
      set({ categoriesLoading: true });
      const response = await productsAPI.getCategories();
      set({ categories: response.data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      set({ categoriesLoading: false });
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
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      
      // Prevent conflicts between Navbar (strings) and Sidebar (arrays)
      if (newFilters.category !== undefined) {
        if (typeof newFilters.category === 'string') {
          if (newFilters.category === 'all' || newFilters.category === '') {
            updatedFilters.category = []; // "All Categories" resets to clean empty array
          } else {
            updatedFilters.category = [newFilters.category]; // Convert single string to array
          }
        }
      }
      
      return { filters: updatedFilters };
    });
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

  clearError: () => set({ error: null }),
}));

export default useStore;