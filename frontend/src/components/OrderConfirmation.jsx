// frontend/src/components/OrderConfirmation.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { ordersAPI } from '../utils/api';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchOrder();
  }, [orderNumber, user, navigate]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.byNumber(orderNumber);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Please log in to view your order.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Message */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 text-lg">
          Thank you for your purchase, {user.username}!
        </p>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Order Number */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-800">Order Number</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{order.order_number}</p>
        </div>

        {/* Status */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-yellow-600" size={24} />
            <h3 className="font-semibold text-gray-800">Status</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600 capitalize">{order.status}</p>
        </div>

        {/* Total */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-800">Total Amount</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${parseFloat(order.total).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Order Details</h2>

        {/* Shipping Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Shipping Address</h3>
          <div className="bg-gray-50 rounded p-4">
            <p className="text-gray-700">{order.shipping_address}</p>
            <p className="text-gray-700">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Items Ordered</h3>
          <div className="space-y-4">
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 pb-4 border-b">
                {item.product_image && (
                  <img
                    src={getImageUrl(item.product_image)}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.product_name}</h4>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: ${parseFloat(item.price_at_purchase).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">${parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (8%):</span>
              <span className="font-semibold">${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping:</span>
              <span className="font-semibold">${parseFloat(order.shipping_cost).toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t pt-4 flex justify-between text-lg">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-green-600">${parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Information</h3>
          <div className="bg-gray-50 rounded p-4">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Method:</span> {order.payment_method.replace('_', ' ').toUpperCase()}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Status:</span> {order.is_paid ? '✓ Paid' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/orders')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          View All Orders
        </button>
        <button
          onClick={() => navigate('/products')}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
