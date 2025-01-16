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
  const [progress, setProgress] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(0);
  const [courseProgress, setCourseProgress] = useState(0);

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

  useEffect(() => {
    const fetchProgress = async () => {
      if (user && courseId) {
        try {
          const progressRef = doc(db, 'users', user.uid, 'courseProgress', courseId);
          const progressDoc = await getDoc(progressRef);
          
          if (progressDoc.exists()) {
            const data = progressDoc.data();
            setCourseProgress(data.progress || 0);
            setCompletedVideos(data.completedVideos || 0);
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
        }
      }
    };

    fetchProgress();
  }, [user, courseId]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {course?.title}
            </h1>
            {user && (
              <button className="w-full sm:w-auto bg-[#0077b6] text-white px-6 py-2 rounded-md hover:bg-[#005f8b]">
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Course Progress</h2>
            <span className="text-sm text-gray-600">
              {completedVideos} of {videos?.length} lectures completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos?.map((video, index) => (
                <Link
                  key={video.snippet.resourceId.videoId}
                  to={`/lecture/${video.snippet.resourceId.videoId}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.snippet.thumbnails?.medium?.url}
                      alt={video.snippet.title}
                      className="w-full h-full object-cover"
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
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
