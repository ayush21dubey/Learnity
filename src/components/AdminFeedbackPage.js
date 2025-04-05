import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { UserContext } from '../UserContext';

function AdminFeedbackPage() {
  const { user } = useContext(UserContext);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Check if user is admin
        if (!user || user.email !== 'ayush21dubey@gmail.com') {
          setError('You do not have permission to view this page');
          setLoading(false);
          return;
        }

        console.log('Fetching feedback...');
        const feedbackCollection = collection(db, 'feedback');
        const feedbackQuery = query(feedbackCollection, orderBy('createdAt', 'desc'));
        const feedbackSnapshot = await getDocs(feedbackQuery);
        
        console.log('Feedback snapshot:', feedbackSnapshot);
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        console.log('Fetched feedback data:', feedbackData);
        setFeedbackList(feedbackData);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        if (error.code === 'permission-denied') {
          setError('You do not have permission to view feedback. Please make sure you are logged in as an admin.');
        } else {
          setError('An error occurred while fetching feedback: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            {error.includes('permission') && (
              <p className="mt-4 text-sm text-red-600">
                Please make sure you are logged in with the admin email: ayush21dubey@gmail.com
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Feedback</h1>
        {feedbackList.length === 0 ? (
          <p className="text-gray-600">No feedback available.</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">User Email</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Rating</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Feedback</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map(feedback => (
                  <tr key={feedback.id}>
                    <td className="py-2 px-4 border-b border-gray-200">{feedback.userEmail}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{feedback.category}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{feedback.rating}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{feedback.feedback}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeedbackPage; 