// frontend/src/components/ProductDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { productsAPI } from '../utils/api';
import ProductReviews from './ProductReviews';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, addToCart } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setError(null);
        const response = await productsAPI.detail(id);
        if (isMounted) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        if (isMounted) {
          setError('Failed to load product details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const success = await addToCart(parseInt(id), 1);
      if (success) {
        navigate('/cart', { state: { addedToCart: true } });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  // Check if inventory exists and has items in stock
  const isInStock = product.inventory && product.inventory.stock_quantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-gray-400">No image</span>';
              }}
            />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <span className="text-blue-600 font-semibold">
              {product.category.replace('_', ' ').toUpperCase()}
            </span>
          )}
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold">{product.average_rating || 0} ⭐</span>
            <span className="text-gray-600">({product.total_reviews || 0} reviews)</span>
          </div>

          {product.description && <p className="text-gray-600 mb-6">{product.description}</p>}

          <div className="space-y-3 mb-6 pb-6 border-b">
            {product.color && (
              <div>
                <span className="text-gray-600">Color:</span>
                <span className="ml-2 font-semibold">{product.color}</span>
              </div>
            )}
            {product.year && (
              <div>
                <span className="text-gray-600">Year:</span>
                <span className="ml-2 font-semibold">{product.year}</span>
              </div>
            )}
            {product.sku && (
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-semibold">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              ${product.price}
            </span>
          </div>

          {/* UPDATED STOCK STATUS SECTION */}
          <div className="space-y-2 mb-6">
            <div className={isInStock ? 'text-green-600' : 'text-red-600'}>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </div>
            
            {product.inventory?.stock_quantity !== undefined && (
              <div className="text-sm text-gray-600">
                {product.inventory.stock_quantity} units available
              </div>
            )}
          </div>

          {/* UPDATED BUTTON */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      {product.id && <ProductReviews productId={parseInt(product.id)} />}
    </div>
  );
}