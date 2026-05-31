// frontend/src/components/ProductList.jsx
import { useEffect, useState } from 'react';
import { productsAPI } from '../utils/api';
import ProductCard from './ProductCard';
import useStore from '../stores/useStore';

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
      const params = {
        ...(filters.category.length && { category: filters.category.join(',') }),
        ...(filters.searchQuery && { search: filters.searchQuery }),
        ...(filters.minPrice && { min_price: filters.minPrice }),
        ...(filters.maxPrice && { max_price: filters.maxPrice }),
        ordering: filters.sortBy,
      };

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