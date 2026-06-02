// frontend/src/components/ShoppingCart.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../stores/useStore';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the base URL
  return `${BASE_URL}${imagePath}`;
};

export default function ShoppingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cart, cartLoading, fetchCart, updateCartItem, removeFromCart } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(location.state?.addedToCart || false);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Please log in to view your cart.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (cartLoading) {
    return <div className="text-center py-12">Loading cart...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      // Find item and check max stock before allowing update
      const item = cart?.items?.find((i) => i.product.id === productId);
      const maxStock = item?.product?.stock_quantity;

      if (maxStock !== undefined && newQuantity > maxStock) return;

      setIsUpdating(true);
      await updateCartItem(productId, newQuantity);
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={18} />
        Continue Shopping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Shopping Cart ({cart.item_count} items)</h2>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={getImageUrl(item.product.image)}
                      alt={item.product.name}
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

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Color: {item.product.color}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      disabled={isUpdating}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      disabled={isUpdating || item.quantity >= (item.product.stock_quantity ?? 0)}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title={item.quantity >= (item.product.stock_quantity ?? 0) ? "Maximum stock reached" : ""}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Price */}
                  <p className="text-lg font-bold text-gray-900">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg shadow-md p-6 h-fit">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>

          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span className="font-semibold">${(cart.total * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-semibold">$5.00</span>
            </div>
          </div>

          <div className="flex justify-between mb-6 text-lg font-bold">
            <span>Total:</span>
            <span>${(cart.total + cart.total * 0.08 + 5).toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}