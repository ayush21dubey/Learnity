import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { UserContext } from '../UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen, Search, Clock, Loader2, Plus } from 'lucide-react';

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'personal'
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        let q;
        if (filter === 'personal' && user) {
          q = query(collection(db, 'courses'), where('createdBy', '==', user.uid));
        } else if (filter === 'public' || !user) {
          // Fetch public courses if the filter is 'public' or if the user is not logged in
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filter, user]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Create Course Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex justify-center space-x-4 w-full sm:w-auto">
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
          {user && (
            <Link
              to="/create-course"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 w-full sm:w-auto justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Course
            </Link>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses found
            </div>
          ) : (
            filteredCourses.map(course => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesList;
