// frontend/src/components/ProductReviews.jsx
import { useEffect, useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { reviewsAPI } from '../utils/api';
import useStore from '../stores/useStore';

export default function ProductReviews({ productId }) {
  const { user } = useStore();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
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
      await reviewsAPI.create({
        product: productId,
        ...newReview,
      });

      // Refresh reviews
      await fetchReviews();

      // Reset form
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      // Update local review
      if (Array.isArray(reviews)) {
        setReviews(
          reviews.map((r) =>
            r.id === reviewId
              ? { ...r, helpful_count: r.helpful_count + 1 }
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
      {user && (
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
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
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
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
                <div>
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
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Helpful Button */}
              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
              >
                <ThumbsUp size={16} />
                Helpful ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
