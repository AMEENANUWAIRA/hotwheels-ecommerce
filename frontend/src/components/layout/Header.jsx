// frontend/src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';
import {
  ShoppingCart as CartIcon,
  Menu,
  X,
  LogOut,
  Search,
  Heart,
} from 'lucide-react';
import { Button } from '../ui/Button';

export default function Header() {
  // 1. Pull setFilters, categories, and fetchCategories from Zustand
  const { user, logout, cart, setFilters, categories, fetchCategories } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch categories when the header mounts so the breadcrumbs always populate
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 2. Update Zustand instead of the URL string
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Send the query to the global store (even if it's empty!)
    setFilters({ searchQuery: searchQuery.trim() });
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
    
    // Navigate to the products page
    navigate('/products');
  };

  // 3. New function to handle clicking a category link
  const handleCategoryClick = (categoryValue) => {
    // If no value is passed, reset to empty array (All Products)
    const newCategory = categoryValue ? [categoryValue] : [];
    setFilters({ category: newCategory });
    setMobileMenuOpen(false);
    navigate('/products');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar - Promotional */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        🎉 Free shipping on orders over $50! Use code: WHEELS50
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span className="text-3xl">🏎️</span>
            <span>Hot Wheels</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-0 bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 h-full"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative text-gray-600 hover:text-blue-600 transition-colors"
              title="Wishlist"
            >
              <Heart size={24} />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative text-gray-600 hover:text-blue-600 transition-colors"
              title="Shopping Cart"
            >
              <CartIcon size={24} />
              {cart && cart.item_count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cart.item_count}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="text-gray-600 hover:text-gray-900 p-2"
                  >
                    ⋮
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </Link>
                      {user.is_staff && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-blue-600 font-semibold hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1 pt-2"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* 4. Breadcrumb Navigation - Desktop Dynamic Categories */}
        <nav className="hidden md:flex gap-4 mt-4 pt-4 border-t border-gray-100 overflow-x-auto">
          <button
            onClick={() => handleCategoryClick(null)}
            className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value || cat.id}
              onClick={() => handleCategoryClick(cat.value)}
              className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {cat.label || cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 py-4 px-4 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 rounded-lg"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Mobile Links */}
          <button
            onClick={() => handleCategoryClick(null)}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-white rounded"
          >
            All Products
          </button>
          
          {user ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-white rounded"
              >
                My Orders
              </Link>
              {user.is_staff && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-blue-600 font-semibold hover:bg-white rounded"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-white rounded flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-blue-600 font-semibold hover:bg-white rounded"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 bg-blue-600 text-white font-semibold rounded text-center"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}