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

  const handleCreateCourse = async () => {
    if (!user) {
      alert('You must be logged in to create a course.');
      return;
    }

    if (!playlistUrl) {
      alert('Please enter a YouTube playlist URL.');
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      alert('Invalid playlist URL. Please enter a valid YouTube playlist link.');
      return;
    }

    setIsLoading(true);

    try {
      // First, get playlist details including categoryId
      const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: {
          part: 'snippet',
          id: playlistId,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
        },
      });

      if (playlistResponse.data.items.length === 0) {
        alert('No playlist found with the provided URL. Please check the link and try again.');
        setIsLoading(false);
        return;
      }

      // Get the first video from the playlist
      const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          playlistId: playlistId,
          maxResults: 1,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
        },
      });

      if (videoResponse.data.items.length === 0) {
        alert('The playlist appears to be empty.');
        setIsLoading(false);
        return;
      }

      // Get video details including categoryId
      const videoId = videoResponse.data.items[0].snippet.resourceId.videoId;
      const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet',
          id: videoId,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
        },
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
        alert('This playlist must be in one of these categories: Education, Nonprofits & Activism, Science & Technology, How-to & Style, or News & Politics. Please choose an appropriate playlist.');
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
        categoryName: categoryNames[categoryId] // Store the readable category name
      };

      const docRef = await addDoc(collection(db, 'courses'), newCourse);
      alert('Course created successfully!');
      navigate(`/courses/${docRef.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response?.status === 403) {
        alert('YouTube API key error. Please contact support.');
      } else {
        alert('Failed to create course. Please try again later.');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow-sm border border-gray-200">
        {user ? (
          <form className="p-8" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create Course</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  id="courseTitle"
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course Title (Optional - will use playlist title if empty)"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="playlistUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Playlist URL
                </label>
                <input
                  id="playlistUrl"
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="Enter YouTube Playlist URL"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateCourse} 
                disabled={!user || !playlistUrl || isLoading}
              >
                {isLoading ? 'Creating Course...' : 'Create Course'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center text-gray-600">
            Please log in to create a course.
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCreation;
