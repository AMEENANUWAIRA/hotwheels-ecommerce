// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import useStore from './stores/useStore';
import ProductList from './components/ProductList';
import ProductFilters from './components/ProductFilters';
import ShoppingCart from './components/ShoppingCart';
import Checkout from './components/Checkout';
import OrdersPage from './components/OrdersPage';
import OrderDetails from './components/OrderDetails';
import OrderConfirmation from './components/OrderConfirmation';
import ProductReviews from './components/ProductReviews';
import { ShoppingCart as CartIcon, LogOut, User, Menu, X } from 'lucide-react';
import { productsAPI } from './utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

function Header() {
  const { user, logout, cart } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold hover:text-blue-100">
            🏎️ Hot Wheels
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              to="/products"
              className="hover:text-blue-100 transition"
            >
              Shop
            </Link>

            {user ? (
              <>
                <Link
                  to="/orders"
                  className="hover:text-blue-100 transition"
                >
                  My Orders
                </Link>
                <div className="flex items-center gap-2">
                  <User size={20} />
                  <span>{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-blue-100"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                >
                  Register
                </Link>
              </>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative hover:text-blue-100"
            >
              <CartIcon size={24} />
              {cart && cart.item_count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.item_count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link
              to="/products"
              className="block hover:text-blue-100 py-2"
            >
              Shop
            </Link>
            {user ? (
              <>
                <Link
                  to="/orders"
                  className="block hover:text-blue-100 py-2"
                >
                  My Orders
                </Link>
                <Link
                  to="/cart"
                  className="block hover:text-blue-100 py-2"
                >
                  Cart ({cart?.item_count || 0})
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left hover:text-blue-100 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block hover:text-blue-100 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block hover:text-blue-100 py-2"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>
        <main className="lg:col-span-3">
          <ProductList />
        </main>
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, addToCart } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setError(null);
        const response = await productsAPI.detail(id);
        if (isMounted) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        if (isMounted) {
          setError('Failed to load product details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const success = await addToCart(parseInt(id), 1);
      if (success) {
        // Navigate to cart immediately without blocking alert
        navigate('/cart', { state: { addedToCart: true } });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-gray-400">No image</span>';
              }}
            />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <span className="text-blue-600 font-semibold">
              {product.category.replace('_', ' ').toUpperCase()}
            </span>
          )}
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold">{product.average_rating || 0} ⭐</span>
            <span className="text-gray-600">({product.total_reviews || 0} reviews)</span>
          </div>

          {product.description && <p className="text-gray-600 mb-6">{product.description}</p>}

          <div className="space-y-3 mb-6 pb-6 border-b">
            {product.color && (
              <div>
                <span className="text-gray-600">Color:</span>
                <span className="ml-2 font-semibold">{product.color}</span>
              </div>
            )}
            {product.year && (
              <div>
                <span className="text-gray-600">Year:</span>
                <span className="ml-2 font-semibold">{product.year}</span>
              </div>
            )}
            {product.sku && (
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-semibold">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Price and CTA */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              ${product.price}
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {product.inventory && (
              <>
                <div className={product.inventory.is_in_stock ? 'text-green-600' : 'text-red-600'}>
                  {product.inventory.is_in_stock ? 'In Stock' : 'Out of Stock'}
                </div>
                <div className="text-sm text-gray-600">
                  {product.inventory.stock_quantity} units available
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inventory?.is_in_stock}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      {product.id && <ProductReviews productId={parseInt(product.id)} />}
    </div>
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
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
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
      <div className="min-h-screen bg-gray-50">
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
            {/* Add more routes as needed */}
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p>&copy; 2024 Hot Wheels Store. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
