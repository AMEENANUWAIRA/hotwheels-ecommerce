// frontend/src/components/ProductFilters.jsx
import { useEffect, useState } from 'react';
import useStore from '../stores/useStore';
import { Search, Sliders } from 'lucide-react';

export default function ProductFilters() {
  const { filters, setFilters, resetFilters, categories, fetchCategories } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Automatically fetch categories from backend when component loads
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sliders size={20} />
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          Reset Filters
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Hot Wheels..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category
        </label>
        <div className="space-y-2">
          
          {/* Permanent "All Categories" Option */}
          <label className="flex items-center pb-2 border-b border-gray-100 mb-2">
            <input
              type="checkbox"
              // Checked when no specific categories are selected
              checked={filters.category.length === 0}
              onChange={() => setFilters({ category: [] })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-900 font-medium">All Categories</span>
          </label>

          {/* Dynamically Loaded Categories */}
          {categories.map((category) => (
            <label key={category.value || category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category.includes(category.value)}
                onChange={(e) => {
                  const newCategories = e.target.checked
                    ? [...filters.category, category.value]
                    : filters.category.filter((c) => c !== category.value);
                  setFilters({ category: newCategories });
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-gray-700">{category.label || category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Price Range: ${filters.minPrice} - ${filters.maxPrice}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minPrice}
            onChange={(e) => setFilters({ minPrice: parseInt(e.target.value) })}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ maxPrice: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ sortBy: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="-created_at">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}