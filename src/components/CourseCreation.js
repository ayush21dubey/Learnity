import React, { useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CourseCreation.css';

function CourseCreation() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateCourse = async () => {
    if (!user) {
      setError('You must be logged in to create a course.');
      return;
    }

    if (!playlistUrl) {
      setError('Please enter a YouTube playlist URL.');
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Invalid playlist URL. Please enter a valid YouTube playlist link.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate API key
      if (!process.env.REACT_APP_GOOGLE_API_KEY) {
        throw new Error('Google API key is not configured. Please check your .env file.');
      }

      // First, get playlist details including categoryId
      const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: {
          part: 'snippet',
          id: playlistId,
          key: process.env.REACT_APP_GOOGLE_API_KEY,
        },
        timeout: 10000, // 10 second timeout
      });

      if (playlistResponse.data.items.length === 0) {
        setError('No playlist found with the provided URL. Please check the link and try again.');
        setIsLoading(false);
        return;
      }

      // Get the first video from the playlist
      const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          playlistId: playlistId,
          maxResults: 1,
          key: process.env.REACT_APP_GOOGLE_API_KEY,
        },
        timeout: 10000,
      });

      if (videoResponse.data.items.length === 0) {
        setError('The playlist appears to be empty.');
        setIsLoading(false);
        return;
      }

      // Get video details including categoryId
      const videoId = videoResponse.data.items[0].snippet.resourceId.videoId;
      const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet',
          id: videoId,
          key: process.env.REACT_APP_GOOGLE_API_KEY,
        },
        timeout: 10000,
      });

      const categoryId = videoDetailsResponse.data.items[0].snippet.categoryId;
      
      // Updated allowed categories
      const allowedCategories = [
        '27', // Education
        '29', // Nonprofits & Activism
        '28', // Science & Technology
        '26', // How-to & Style
        '25'  // News & Politics
      ];

      if (!allowedCategories.includes(categoryId)) {
        setError('This playlist must be in one of these categories: Education, Nonprofits & Activism, Science & Technology, How-to & Style, or News & Politics. Please choose an appropriate playlist.');
        setIsLoading(false);
        return;
      }

      // Map category IDs to readable names
      const categoryNames = {
        '27': 'Education',
        '29': 'Nonprofits & Activism',
        '28': 'Science & Technology',
        '26': 'How-to & Style',
        '25': 'News & Politics'
      };

      const playlistData = playlistResponse.data.items[0].snippet;
      const newCourse = {
        title: courseTitle || playlistData.title,
        description: playlistData.description,
        playlistId: playlistId,
        userId: user.uid,
        instructor: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: isPublic,
        views: 0,
        uniqueViewers: [],
        creatorInfo: {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          email: user.email
        },
        categoryId: categoryId,
        categoryName: categoryNames[categoryId]
      };

      const docRef = await addDoc(collection(db, 'courses'), newCourse);
      alert('Course created successfully!');
      navigate(`/courses/${docRef.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Invalid request. Please check your playlist URL.');
            break;
          case 403:
            setError('YouTube API access forbidden. Please check your API key permissions.');
            break;
          case 404:
            setError('Playlist not found. Please check the URL.');
            break;
          case 429:
            setError('YouTube API quota exceeded. Please try again later.');
            break;
          default:
            setError('Failed to create course. Please try again later.');
        }
      } else if (error.message.includes('API key')) {
        setError('Google API key is not configured. Please check your .env file.');
      } else {
        setError('Failed to create course. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const extractPlaylistId = (url) => {
    try {
      const urlObj = new URL(url);
      const urlParams = new URLSearchParams(urlObj.search);
      return urlParams.get('list');
    } catch (error) {
      console.error('Invalid URL:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-2 sm:px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow-sm border border-gray-200">
        {user ? (
          <form className="p-4 sm:p-8" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">Create Course</h2>
            
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm sm:text-base">
                {error}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Course Title
                </label>
                <input
                  id="courseTitle"
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course Title (Optional - will use playlist title if empty)"
                  disabled={isLoading}
                  className="w-full px-3 sm:px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="playlistUrl" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  YouTube Playlist URL
                </label>
                <input
                  id="playlistUrl"
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="Enter YouTube Playlist URL"
                  disabled={isLoading}
                  className="w-full px-3 sm:px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this course public
                </label>
              </div>

              <button 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                onClick={handleCreateCourse} 
                disabled={!user || !playlistUrl || isLoading}
              >
                {isLoading ? 'Creating Course...' : 'Create Course'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-8 text-center text-gray-600 text-sm sm:text-base">
            Please log in to create a course.
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCreation;
