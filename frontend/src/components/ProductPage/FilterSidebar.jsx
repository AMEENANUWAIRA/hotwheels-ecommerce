// frontend/src/components/ProductPage/FilterSidebar.jsx
import { useEffect } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import useStore from '../../stores/useStore';

export default function FilterSidebar() {
  // Grab categories and fetchCategories from your store
  const { filters, setFilters, resetFilters, categories, fetchCategories } = useStore();

  // Safely ensure category is always an array
  const selectedCategories = Array.isArray(filters.category) ? filters.category : [];

  // Automatically fetch categories from backend when component loads
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20 h-fit">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Category
          </label>
          <div className="space-y-2">
            
            {/* Permanent "All Categories" Checkbox */}
            <label className="flex items-center pb-2 border-b border-gray-100 mb-2">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => setFilters({ category: [] })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900 font-medium">All Categories</span>
            </label>

            {/* Dynamically Loaded Categories */}
            {categories.map((category) => (
              <label key={category.value || category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...selectedCategories, category.value]
                      : selectedCategories.filter((c) => c !== category.value);
                    setFilters({ category: newCategories });
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{category.label || category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Price Range
          </label>
          <p className="text-sm text-gray-600 mb-3">
            ${filters.minPrice} - ${filters.maxPrice}
          </p>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minPrice || 0}
              onChange={(e) => setFilters({ minPrice: parseInt(e.target.value) })}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.maxPrice || 100}
              onChange={(e) => setFilters({ maxPrice: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <Select
            label="Sort By"
            options={[
              { value: '-created_at', label: 'Newest' },
              { value: 'price', label: 'Price: Low to High' },
              { value: '-price', label: 'Price: High to Low' },
              { value: 'name', label: 'Name: A to Z' },
            ]}
            value={filters.sortBy || '-created_at'}
            onChange={(e) => setFilters({ sortBy: e.target.value })}
          />
        </div>

        <Button variant="primary" fullWidth onClick={resetFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}