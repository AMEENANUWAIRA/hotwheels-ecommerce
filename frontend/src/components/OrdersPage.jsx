// frontend/src/components/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { Package, Calendar, DollarSign, Truck } from 'lucide-react';

export default function OrdersPage() {
  const { user, orders, ordersLoading, fetchOrders } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, fetchOrders, navigate]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Please log in to view your orders.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (ordersLoading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-4">No orders yet</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Order Number</p>
                  <p className="text-lg font-bold">{order.order_number}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${parseFloat(order.total).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold">${parseFloat(order.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold capitalize">{order.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-600">Order #</p>
                    <p className="font-semibold text-xs">{order.order_number}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => navigate(`/order-details/${order.id}`)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
