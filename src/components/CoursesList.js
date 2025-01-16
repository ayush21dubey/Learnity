import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { UserContext } from '../UserContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen, Search, Clock } from 'lucide-react';

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'personal'
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let q;
        if (filter === 'personal' && user) {
          q = query(collection(db, 'courses'), where('createdBy', '==', user.uid));
        } else if (filter === 'public') {
          q = query(collection(db, 'courses'), where('isPublic', '==', true));
        } else {
          q = query(collection(db, 'courses'));
        }
        
        const querySnapshot = await getDocs(q);
        const coursesData = [];
        
        for (const doc of querySnapshot.docs) {
          const courseData = doc.data();
          // Fetch first video thumbnail from playlist
          if (courseData.playlistId) {
            try {
              const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/playlistItems`,
                {
                  params: {
                    part: 'snippet',
                    playlistId: courseData.playlistId,
                    maxResults: 1,
                    key: process.env.REACT_APP_YOUTUBE_API_KEY,
                  },
                }
              );
              if (response.data.items[0]) {
                courseData.thumbnail = response.data.items[0].snippet.thumbnails.medium.url;
              }
            } catch (error) {
              console.error('Error fetching thumbnail:', error);
            }
          }
          coursesData.push({ id: doc.id, ...courseData });
        }
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [filter, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Buttons */}
        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-md ${
              filter === 'public' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Public Courses
          </button>
          {user && (
            <button
              onClick={() => setFilter('personal')}
              className={`px-4 py-2 rounded-md ${
                filter === 'personal' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              My Courses
            </button>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="aspect-video relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.views || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursesList;
