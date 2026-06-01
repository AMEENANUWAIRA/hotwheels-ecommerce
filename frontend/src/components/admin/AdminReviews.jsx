import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { Trash2, Star } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.reviews.list();
      setReviews(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await adminAPI.reviews.delete(reviewId);
        setReviews(reviews.filter((r) => r.id !== reviewId));
      } catch (err) {
        alert('Failed to delete review');
        console.error(err);
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center">Loading reviews...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews Moderation</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{review.title}</h3>
                <p className="text-sm text-gray-600">
                  By <span className="font-semibold">{review.username}</span> on{' '}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Rating</p>
              {renderStars(review.rating)}
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Product</p>
              <p className="font-semibold">{review.product_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Review</p>
              <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Marked as helpful by <span className="font-semibold">{review.helpful_count}</span> user{review.helpful_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">No reviews found</p>
      )}
    </div>
  );
}
