import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { Eye } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.orders.list();
      setOrders(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.orders.updateStatus(orderId, newStatus);
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      setStatusUpdate({ ...statusUpdate, [orderId]: newStatus });
    } catch (err) {
      alert('Failed to update order status');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Order #</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{order.order_number}</td>
                    <td className="px-4 py-2">
                      {order.username || 'Guest'}
                    </td>
                    <td className="px-4 py-2">${parseFloat(order.total).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mx-auto"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="bg-gray-50 rounded-lg p-6 h-fit sticky top-20">
            <h3 className="text-lg font-bold mb-4">Order Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold">{selectedOrder.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold">
                  {selectedOrder.username || 'Guest'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold">${parseFloat(selectedOrder.total).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <select
                  value={statusUpdate[selectedOrder.id] || selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ordered On</p>
                <p className="font-semibold">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="text-sm border-l-2 border-gray-300 pl-2">
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-gray-600">Qty: {item.quantity} × ${parseFloat(item.price_at_purchase).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">No orders found</p>
      )}
    </div>
  );
}
