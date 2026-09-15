import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import { FaStar, FaUser, FaTimes, FaSpinner, FaCommentDots } from 'react-icons/fa';

const ParkingReviews = ({ parkingId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (parkingId) {
      loadReviews();
    }
  }, [parkingId]);

  const loadReviews = async () => {
    try {
      const res = await reviewService.getParkingReviews(parkingId);
      setReviews(res.data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!newComment.trim()) {
      setError('Please write a comment');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await reviewService.createReview({ parking: parkingId, rating: newRating, comment: newComment });
      setShowModal(false);
      setNewRating(0);
      setNewComment('');
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#f9f0d7]">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-primary-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} className={s <= Math.round(averageRating) ? 'text-primary-400' : 'text-[#f3e0ae]'} size={14} />
                ))}
              </div>
              <span className="text-sm text-[#e7c588]/80">{averageRating} ({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Write Review
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-primary-600 text-xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <FaCommentDots className="text-[#e7c588]/80 text-4xl mx-auto mb-3" />
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80">No reviews yet</p>
          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
            >
              Be the first to review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-[#e7c588]/25 dark:border-[#e7c588]/25/50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {review.user?.name?.charAt(0).toUpperCase() || <FaUser />}
                </div>
                <div>
                  <p className="font-medium text-[#f9f0d7] text-sm">{review.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-[#e7c588]/80">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="ml-auto flex text-primary-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} className={s <= review.rating ? 'text-primary-400' : 'text-[#f3e0ae]'} size={12} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ml-12">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl p-6 w-full max-w-md animate-slideUp">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80">
              <FaTimes />
            </button>
            <h4 className="text-lg font-semibold text-[#f9f0d7] mb-4">Write a Review</h4>

            {error && <div className="bg-[#e7c588] border border-[#e7c588]/40 text-[#e7c588] px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setNewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                      <FaStar className={`text-2xl transition ${star <= (hoverRating || newRating) ? 'text-primary-400' : 'text-[#f3e0ae]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">Comment</label>
                <textarea
                  rows={4} value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none text-sm"
                />
              </div>
              <button
                type="submit" disabled={submitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : null}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingReviews;
