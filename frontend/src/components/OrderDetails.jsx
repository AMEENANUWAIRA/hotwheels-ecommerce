// frontend/src/components/OrderDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { ordersAPI } from '../utils/api';
import { Package, Truck, Clock, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

export default function OrderDetails() {
  const { id } = useParams();
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
  }, [id, user, navigate]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.detail(id);
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
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>
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
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-8">Order Details</h1>

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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Order Information</h2>

          {/* Shipping Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Shipping Address</h3>
            <div className="bg-gray-50 rounded p-4">
              <p className="text-gray-700">{order.shipping_address}</p>
              <p className="text-gray-700">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Information</h3>
            <div className="bg-gray-50 rounded p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Payment Method:</span>
                <span className="font-semibold">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Payment Status:</span>
                <span className={`font-semibold ${order.is_paid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.is_paid ? 'Paid' : 'Pending'}
                </span>
              </div>
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

          {/* Cost Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Cost Summary</h3>
            <div className="bg-gray-50 rounded p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax (8%):</span>
                <span className="font-semibold">${parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping:</span>
                <span className="font-semibold">${parseFloat(order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-blue-600">${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Timeline</h3>
            <div className="bg-gray-50 rounded p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Order Placed</p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                {order.updated_at && (
                  <div>
                    <p className="text-gray-600 text-sm">Last Updated</p>
                    <p className="font-semibold">
                      {new Date(order.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Orders Button */}
      <button
        onClick={() => navigate('/orders')}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mb-4"
      >
        Back to Orders
      </button>
    </div>
  );
}
