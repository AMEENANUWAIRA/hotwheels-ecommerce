// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import useStore from './stores/useStore';
import ProductList from './components/ProductList';
import ProductDetailPage from './components/ProductDetailPage';
import ProductFilters from './components/ProductFilters';
import ShoppingCart from './components/ShoppingCart';
import Checkout from './components/Checkout';
import OrdersPage from './components/OrdersPage';
import OrderDetails from './components/OrderDetails';
import OrderConfirmation from './components/OrderConfirmation';
import ProductReviews from './components/ProductReviews';
import AdminDashboard from './components/AdminDashboard';
import { productsAPI } from './utils/api';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import HeroSection from "./components/ProductPage/HeroSection";
import FilterSidebar from "./components/ProductPage/FilterSidebar";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

function HomePage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Hot Wheels Store
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover an amazing collection of Hot Wheels toys
        </p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-bold"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}

function ProductsPage() {
  return (
    <>
      {/* 1. New Professional Promotional/Hero Banner */}
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 2. New Advanced Sidebar Filter */}
          <FilterSidebar />
          
          {/* 3. Your Product Grid Area */}
          <div className="lg:col-span-3">
            <ProductList />
          </div>
        </div>
      </div>
    </>
  );
}

// Simple Login Component (you'd want to expand this)
function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(credentials.username, credentials.password);
      // Redirect to products page after successful login
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder="Enter username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          disabled={isLoading}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

// Register Component
function RegisterPage() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    passwordConfirm: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useStore();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.username || !formData.email || !formData.password || !formData.passwordConfirm) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await register(formData.username, formData.email, formData.password);
      setSuccess(true);
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorDetail = err.response?.data;
      if (typeof errorDetail === 'object') {
        // Handle multiple error fields
        const messages = Object.entries(errorDetail)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
          .join(', ');
        setError(messages);
      } else {
        setError(errorDetail || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Registration Successful!</h2>
        <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
        <p className="text-gray-600">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.passwordConfirm}
          onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default function App() {
  const { user, fetchUser } = useStore();

  useEffect(() => {
    // Try to fetch user on app load if token exists
    if (localStorage.getItem('token')) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-details/:id" element={<OrderDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
