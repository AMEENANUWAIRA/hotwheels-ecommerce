import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { Save } from 'lucide-react';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updates, setUpdates] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.inventory.list();
      setInventory(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId, newQuantity) => {
    setUpdates({
      ...updates,
      [productId]: { ...updates[productId], quantity: parseInt(newQuantity) },
    });
  };

  const handleReorderChange = (productId, newReorder) => {
    setUpdates({
      ...updates,
      [productId]: { ...updates[productId], reorderLevel: parseInt(newReorder) },
    });
  };

  const handleSave = async (productId) => {
    try {
      const update = updates[productId];
      if (update?.quantity !== undefined) {
        await adminAPI.inventory.updateStock(productId, update.quantity);
      }
      if (update?.reorderLevel !== undefined) {
        await adminAPI.inventory.updateReorderLevel(productId, update.reorderLevel);
      }
      
      // Refresh the data
      fetchInventory();
      
      // Clear the updates
      const newUpdates = { ...updates };
      delete newUpdates[productId];
      setUpdates(newUpdates);
      
      alert('Inventory updated successfully');
    } catch (err) {
      alert('Failed to update inventory');
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading inventory...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Product Name</th>
              <th className="px-4 py-2 text-left">Current Stock</th>
              <th className="px-4 py-2 text-left">Reorder Level</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((product) => {
              const productUpdate = updates[product.id];
              const currentStock = productUpdate?.quantity ?? product.inventory?.stock_quantity ?? 0;
              const reorderLevel = productUpdate?.reorderLevel ?? product.inventory?.reorder_level ?? 0;
              const isLow = currentStock <= reorderLevel;

              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{product.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) => handleStockChange(product.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-20"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={reorderLevel}
                      onChange={(e) => handleReorderChange(product.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-20"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isLow
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {productUpdate && (
                      <button
                        onClick={() => handleSave(product.id)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mx-auto"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inventory.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">No inventory found</p>
      )}
    </div>
  );
}
