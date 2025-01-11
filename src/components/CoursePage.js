import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays } from 'date-fns';
import { UserContext } from '../UserContext';
import { BookOpen, Calendar, Clock, ChevronDown, ChevronUp, Play, Users } from 'lucide-react';

function CoursePage() {
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          setCourse({ id: courseSnap.id, ...courseData });
          
          // Call fetchAllVideos with the playlist ID
          await fetchAllVideos(courseData.playlistId);

          // Update view count if user is logged in
          if (user && !courseData.uniqueViewers?.includes(user.uid)) {
            await updateDoc(courseRef, {
              views: (courseData.views || 0) + 1,
              uniqueViewers: arrayUnion(user.uid)
            });
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    const fetchAllVideos = async (playlistId) => {
      let allVideos = [];
      let nextPageToken = '';
      try {
        do {
          const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
              part: 'snippet',
              playlistId: playlistId,
              maxResults: 50, // Maximum allowed by the API
              pageToken: nextPageToken,
              key: process.env.REACT_APP_YOUTUBE_API_KEY,
            },
          });
          allVideos = allVideos.concat(response.data.items);
          nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        setVideos(allVideos);
      } catch (error) {
        console.error('Error fetching videos', error);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  useEffect(() => {
    if (deadline) {
      const today = new Date();
      const days = differenceInDays(deadline, today);
      setDaysRemaining(days);
    }
  }, [deadline]);

  const handleDeadlineChange = async (date) => {
    setDeadline(date);
    if (user) {
      const courseDoc = doc(db, 'courses', courseId);
      await updateDoc(courseDoc, {
        [`deadlines.${user.uid}`]: date.toISOString(),
      });
    }
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#0077b6] text-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-blue-100">
            <span className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              {videos.length} lectures
            </span>
            <span className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {course.views || 0} views
            </span>
            <span>{course.categoryName}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">About this Course</h2>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span className="flex items-center mr-4">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {videos.length} lectures
                </span>
                <span className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {course.views || 0} views
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
              className="text-purple-600 hover:text-purple-700 transition-colors"
            >
              {isDescriptionCollapsed ? (
                <ChevronDown className="h-6 w-6" />
              ) : (
                <ChevronUp className="h-6 w-6" />
              )}
            </button>
          </div>
          {!isDescriptionCollapsed && (
            <div className="mt-4 text-gray-600 leading-relaxed">
              <p>{course.description}</p>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm">
                  <span className="font-semibold">Instructor:</span> {course.instructor}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Created:</span> {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Deadline Section */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Course Deadline</h3>
            <div className="flex items-center space-x-4">
              <DatePicker
                selected={deadline}
                onChange={handleDeadlineChange}
                dateFormat="yyyy/MM/dd"
                disabled={deadline !== null}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              {daysRemaining !== null && (
                <span className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {daysRemaining} days remaining
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lectures List */}
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <h3 className="text-xl font-semibold p-6 border-b border-gray-200">Course Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <Link 
                key={video.snippet.resourceId.videoId}
                to={`/lecture/${video.snippet.resourceId.videoId}`}
                className="bg-[#f4f4f4] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="relative">
                  <img 
                    src={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url} 
                    alt={video.snippet.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-sm text-blue-600">Lecture {index + 1}</span>
                  <h4 className="font-medium text-gray-800 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.snippet.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 Learnity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default CoursePage;
