import React, { useState, useContext } from 'react';
import { UserContext } from '../UserContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Star, ThumbsUp, Send } from 'lucide-react';

function FeedbackPage() {
  const { user } = useContext(UserContext);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData = {
        userId: user.uid,
        userEmail: user.email,
        rating,
        feedback,
        category,
        createdAt: new Date().toISOString(),
        status: 'new'
      };
      console.log('Submitting feedback:', feedbackData);

      await addDoc(collection(db, 'feedback'), feedbackData);
      setSubmitted(true);
      setShowThankYou(true);
      console.log('Feedback submitted successfully');
      
      // Reset form
      setRating(0);
      setFeedback('');
      setCategory('general');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'general', label: 'General Feedback' },
    { id: 'bug', label: 'Report a Bug' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'content', label: 'Course Content' },
    { id: 'technical', label: 'Technical Issues' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feedback Matters</h1>
          <p className="text-gray-600">
            Help us improve your learning experience
          </p>
        </div>

        {submitted ? (
          // Success Message
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <ThumbsUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
            <p className="text-green-700 mb-4">
              Your feedback has been submitted successfully.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Submit another feedback
            </button>
          </div>
        ) : (
          // Feedback Form
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${category === cat.id
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      } border`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Your Experience
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded-full transition-colors
                      ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}
                      hover:scale-110`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts, suggestions, or report issues..."
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${isSubmitting || !feedback.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}

        {/* Thank You Popup */}
        {showThankYou && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <ThumbsUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
              <p className="text-green-700 mb-4">
                Your feedback has been submitted successfully.
              </p>
              <button
                onClick={() => setShowThankYou(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For urgent issues, contact us at{' '}
            <a
              href="mailto:support@learnity.com"
              className="text-blue-600 hover:text-blue-700"
            >
              support@learnity.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage; 