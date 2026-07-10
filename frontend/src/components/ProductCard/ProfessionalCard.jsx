// frontend/src/components/ProductCard/ProfessionalCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user, addToCart } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    const success = await addToCart(product.id, 1);
    if (success) {
      navigate('/cart');
    }
    setIsAdding(false);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Container */}
      <div className="relative bg-gray-100 h-64 overflow-hidden">
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-gray-400 text-2xl">🏎️</span>
          </div>
        )}

        {/* Stock Badge */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="danger">Out of Stock</Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <Heart
            size={20}
            className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-400'}
          />
        </button>

        {/* Sale Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="success" size="sm">
            Save 15%
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <div className="mb-2">
          <Badge variant="primary" size="sm">
            {product.category?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Rating value={Math.floor(product.average_rating || 0)} size="sm" />
          <span className="text-xs text-gray-600">
            ({product.total_reviews || 0})
          </span>
        </div>

        {/* Color & Year */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
          <span>Color: {product.color}</span>
          <span>{product.year}</span>
        </div>

        {/* Price Section */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ${(parseFloat(product.price) * 1.18).toFixed(2)}
          </span>
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          {product.is_in_stock ? (
            <p className="text-xs text-green-600 font-semibold">✓ In Stock</p>
          ) : (
            <p className="text-xs text-red-600 font-semibold">Out of Stock</p>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.is_in_stock || isAdding}
          variant={product.is_in_stock ? 'primary' : 'secondary'}
          fullWidth
          size="md"
          icon={ShoppingCart}
        >
          {isAdding ? 'Adding...' : product.is_in_stock ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
}