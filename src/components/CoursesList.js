import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserContext } from '../UserContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen } from 'lucide-react';

function CoursesList() {
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [courseThumbnails, setCourseThumbnails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesCollection);
        const coursesList = coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesList);

        // Fetch thumbnails for all courses
        const thumbnailPromises = coursesList.map(async (course) => {
          try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
              params: {
                part: 'snippet',
                playlistId: course.playlistId,
                maxResults: 1,
                key: process.env.REACT_APP_YOUTUBE_API_KEY,
              },
            });

            if (response.data.items && response.data.items.length > 0) {
              const thumbnails = response.data.items[0].snippet.thumbnails;
              return {
                playlistId: course.playlistId,
                thumbnail: thumbnails.medium?.url || thumbnails.default?.url
              };
            }
          } catch (error) {
            console.error('Error fetching thumbnail:', error);
          }
          return null;
        });

        const thumbnailResults = await Promise.all(thumbnailPromises);
        const thumbnailMap = {};
        thumbnailResults.forEach(result => {
          if (result) {
            thumbnailMap[result.playlistId] = result.thumbnail;
          }
        });
        setCourseThumbnails(thumbnailMap);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const renderCourseCard = (course) => (
    <Link
      key={course.id}
      to={`/courses/${course.id}`}
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
    >
      <div className="relative aspect-video">
        {courseThumbnails[course.playlistId] ? (
          <img
            src={courseThumbnails[course.playlistId]}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            {course.views || 0} views
          </span>
          <span className="text-[#0077b6]">{course.categoryName}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Learning Platform</h2>
          {user && (
            <Link 
              to="/create-course"
              className="bg-[#0077b6] text-white px-6 py-3 rounded-lg hover:bg-[#005f8b] transition-all duration-300 transform hover:-translate-y-1 shadow-md flex items-center space-x-2"
            >
              <span>+ Create New Course</span>
            </Link>
          )}
        </div>

        {user && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Personal Courses</h3>
            {courses.filter((course) => !course.isPublic && course.userId === user.uid).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter((course) => !course.isPublic && course.userId === user.uid)
                  .map(renderCourseCard)}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 bg-white rounded-lg shadow-sm">
                You haven't created any personal courses yet.
              </p>
            )}
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Public Courses</h3>
          {courses.filter((course) => course.isPublic).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter((course) => course.isPublic)
                .map(renderCourseCard)}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8 bg-white rounded-lg shadow-sm">
              No public courses available at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesList;
