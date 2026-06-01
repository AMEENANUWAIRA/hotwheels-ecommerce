import { useEffect, useState } from 'react';
import useStore from '../../stores/useStore';
import { adminAPI } from '../../utils/api';
import { Shield, Lock } from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users.list();
      setUsers(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStaff = async (userId, currentStatus) => {
    try {
      await adminAPI.users.toggleStaff(userId);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_staff: !currentStatus } : u
        )
      );
    } catch (err) {
      alert('Failed to update staff status');
      console.error(err);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.users.toggleActive(userId);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        )
      );
    } catch (err) {
      alert('Failed to update user status');
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Joined</th>
              <th className="px-4 py-2 text-center">Active</th>
              <th className="px-4 py-2 text-center">Staff</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {new Date(user.date_joined).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_staff
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.is_staff ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleToggleStaff(user.id, user.is_staff)}
                      disabled={currentUser?.id === user.id}
                      className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Shield size={14} />
                      {user.is_staff ? 'Remove' : 'Make'} Staff
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      disabled={currentUser?.id === user.id}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${
                        currentUser?.id === user.id
                          ? 'bg-gray-400 text-white'
                          : user.is_active
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <Lock size={14} />
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">No users found</p>
      )}
    </div>
  );
}
