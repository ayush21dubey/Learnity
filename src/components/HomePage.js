import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { BookOpen, Users, Trophy, Search, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Footer from './Footer';

function HomePage() {
  const [popularCourses, setPopularCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseThumbnails, setCourseThumbnails] = useState({});

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const popularCoursesQuery = query(
          coursesCollection,
          where('isPublic', '==', true),
          limit(3)
        );
        
        const coursesSnapshot = await getDocs(popularCoursesQuery);
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          views: doc.data().views || 0,
          description: doc.data().description || 'No description available',
          instructor: doc.data().instructor || 'Anonymous'
        }));

        // Fetch thumbnails for each course
        for (const course of coursesList) {
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
              course.thumbnail = thumbnails.medium?.url || thumbnails.default?.url;
            }
          } catch (error) {
            console.error('Error fetching thumbnail for course:', error);
          }
        }
        
        console.log('Fetched courses with thumbnails:', coursesList);
        setPopularCourses(coursesList);
      } catch (error) {
        console.error('Error fetching popular courses:', error);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
      <header className="bg-[#0077b6] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Welcome to Learnity</h1>
          <p className="text-xl mb-8 text-[#caf0f8]">Discover, Learn, and Grow with Our Online Courses</p>
          <Link to="/login">
            <button className="bg-white text-[#0077b6] px-6 py-3 rounded-md font-semibold hover:bg-[#f4f4f4] transition-all duration-300 transform hover:-translate-y-1">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 h-12 rounded-md border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent shadow-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <section className="mb-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-[#0077b6] text-center">Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map(course => (
              <Link 
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-[#f4f4f4] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-video">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">{course.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {course.views} views
                    </span>
                    <span className="text-[#0077b6]">{course.categoryName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center mb-12">
          <Link to="/courses">
            <button className="inline-flex items-center px-6 py-3 bg-[#0077b6] text-white rounded-md hover:bg-[#005f8b] transition-all duration-300 transform hover:-translate-y-1 shadow-md">
              <BookOpen className="mr-2 h-4 w-4" />
              Explore All Courses
            </button>
          </Link>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Help Us Improve
              </h2>
              <div className="flex justify-center gap-4">
                <Link
                  to="/feedback"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Provide Feedback
                </Link>
                <Link
                  to="/support"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Support Learnity
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
