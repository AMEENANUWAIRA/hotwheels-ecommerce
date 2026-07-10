// frontend/src/components/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { Spinner } from '../ui/Spinner';
import { Card } from '../ui/Card';
import { LineChart, BarChart, Pie } from 'recharts';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats - replace with real API call
      setStats({
        totalOrders: 1256,
        totalRevenue: 45320.50,
        totalProducts: 342,
        totalCustomers: 892,
        ordersTrend: [
          { month: 'Jan', orders: 240 },
          { month: 'Feb', orders: 385 },
          { month: 'Mar', orders: 490 },
          { month: 'Apr', orders: 528 },
        ],
        topProducts: [
          { name: 'Classic Racer', sales: 145 },
          { name: 'Hot Truck', sales: 128 },
          { name: 'Sports Car', sales: 98 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalOrders.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-green-600 text-sm font-semibold">↑ 12% from last month</p>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-green-600 text-sm font-semibold">↑ 8% from last month</p>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalProducts.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">🏎️</span>
          </div>
          <p className="text-blue-600 text-sm font-semibold">+ 24 new this month</p>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalCustomers.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-blue-600 text-sm font-semibold">+ 142 new this month</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Orders Trend</h3>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - implement with recharts</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products</h3>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - implement with recharts</p>
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-gray-900">#HW-001234</td>
                <td className="py-3 px-4 text-gray-900">John Smith</td>
                <td className="py-3 px-4 font-semibold text-gray-900">$245.50</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Delivered
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">2024-06-01</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}