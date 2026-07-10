// frontend/src/components/ProductList.jsx
import { useEffect, useState } from 'react';
import { productsAPI } from '../utils/api';
// import ProductCard from './ProductCard';
import useStore from '../stores/useStore';
import ProductCard from './ProductCard/ProfessionalCard';
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { filters } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Build params object - axios will handle arrays as multiple query params
      const params = {
        ordering: filters.sortBy,
      };
      
      // Add category filter if selected
      if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
        params.category = filters.category;
      }
      
      // Add search filter if provided
      if (filters.searchQuery) {
        params.search = filters.searchQuery;
      }
      
      // Add price filters - always include them
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        params.min_price = filters.minPrice;
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        params.max_price = filters.maxPrice;
      }

      const response = await productsAPI.list(params);
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No products found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}