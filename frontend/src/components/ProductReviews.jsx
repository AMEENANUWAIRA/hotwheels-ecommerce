// frontend/src/components/ProductReviews.jsx
import { useEffect, useState } from 'react';
import { Star, ThumbsUp, Edit2, Trash2, X } from 'lucide-react';
import { reviewsAPI } from '../utils/api';
import useStore from '../stores/useStore';

export default function ProductReviews({ productId }) {
  const { user } = useStore();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchReviewsData = async () => {
      setIsLoading(true);
      try {
        const response = await reviewsAPI.forProduct(productId);
        console.log('Reviews API Response:', response);
        if (isMounted) {
          // Handle both array and object responses
          let reviewsData = [];
          if (Array.isArray(response.data)) {
            reviewsData = response.data;
          } else if (response.data?.results) {
            reviewsData = response.data.results;
          } else if (typeof response.data === 'object' && response.data !== null) {
            // If it's a single object, wrap it in an array
            reviewsData = [response.data];
          }
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error.response || error.message);
        if (isMounted) {
          setReviews([]); // Default to empty array on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviewsData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await reviewsAPI.forProduct(productId);
      console.log('Reviews API Response:', response);
      // Handle both array and object responses
      let reviewsData = [];
      if (Array.isArray(response.data)) {
        reviewsData = response.data;
      } else if (response.data?.results) {
        reviewsData = response.data.results;
      } else if (typeof response.data === 'object' && response.data !== null) {
        // If it's a single object, wrap it in an array
        reviewsData = [response.data];
      }
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch reviews:', error.response || error.message);
      setReviews([]); // Default to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingReviewId) {
        // Update existing review
        await reviewsAPI.update(editingReviewId, {
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
        });
      } else {
        // Create new review
        await reviewsAPI.create({
          product_id: productId,
          ...newReview,
        });
      }

      // Refresh reviews
      await fetchReviews();

      // Reset form
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      setEditingReviewId(null);
    } catch (error) {
      console.error('Failed to submit review:', error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setNewReview({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });
    setEditingReviewId(review.id);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsAPI.delete(reviewId);
        await fetchReviews();
      } catch (error) {
        console.error('Failed to delete review:', error.response?.data || error.message);
      }
    }
  };

  const handleMarkHelpful = async (reviewId, isCurrentlyMarked) => {
    try {
      const response = await reviewsAPI.markHelpful(reviewId);
      // Update local review
      if (Array.isArray(reviews)) {
        setReviews(
          reviews.map((r) =>
            r.id === reviewId
              ? { 
                  ...r, 
                  helpful_count: response.data.helpful_count,
                  is_marked_helpful: response.data.is_marked_helpful
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const StarRating = ({ rating, onChange }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="cursor-pointer"
        >
          <Star
            size={24}
            fill={star <= rating ? '#FFD700' : 'none'}
            color={star <= rating ? '#FFD700' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

      {/* Write Review Button */}
      {user && !showReviewForm && (
        <button
          onClick={() => {
            setShowReviewForm(true);
            setEditingReviewId(null);
            setNewReview({ rating: 5, title: '', comment: '' });
          }}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">
              {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setEditingReviewId(null);
                setNewReview({ rating: 5, title: '', comment: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating
            </label>
            <StarRating
              rating={newReview.rating}
              onChange={(rating) => setNewReview({ ...newReview, rating })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Sum up your experience"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Share your experience with this product"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <p className="text-gray-600">Loading reviews...</p>
      ) : !Array.isArray(reviews) || reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="pb-4 border-b last:border-b-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800">{review.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    by {review.username} on{' '}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Edit/Delete Buttons */}
                {user && review.is_user_review && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit review"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete review"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Helpful Button */}
              <button
                onClick={() => handleMarkHelpful(review.id, review.is_marked_helpful)}
                className={`flex items-center gap-2 text-sm px-3 py-1 rounded transition-colors ${
                  review.is_marked_helpful
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                disabled={!user}
              >
                <ThumbsUp 
                  size={16} 
                  fill={review.is_marked_helpful ? 'currentColor' : 'none'}
                />
                Helpful ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
