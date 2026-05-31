// frontend/src/components/ProductCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { Star, ShoppingCart } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the base URL
  return `${BASE_URL}${imagePath}`;
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { user, addToCart } = useStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    const success = await addToCart(product.id, quantity);
    if (success) {
      // Navigate to cart after successful add
      navigate('/cart', { state: { addedToCart: true } });
      setQuantity(1);
    }
    setIsAdding(false);
  };

  const stockStatus = product.is_in_stock ? 'In Stock' : 'Out of Stock';
  const stockColor = product.is_in_stock ? 'text-green-600' : 'text-red-600';

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Product Image */}
      <div className="relative bg-gray-100 h-48 overflow-hidden">
        {product.image ? (
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-400">No image</span></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category badge */}
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
          {product.category.replace('_', ' ').toUpperCase()}
        </span>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.floor(product.average_rating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.average_rating} ({product.total_reviews})
          </span>
        </div>

        {/* Stock Status */}
        <div className={`text-sm font-semibold mb-2 ${stockColor}`}>
          {stockStatus}
        </div>

        {/* Price and Color */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price}
          </span>
          <span className="text-sm text-gray-600">
            Color: {product.color}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.is_in_stock || isAdding}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart size={18} />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}