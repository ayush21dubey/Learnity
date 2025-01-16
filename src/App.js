import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import CoursesList from './components/CoursesList';
import CoursePage from './components/CoursePage';
import CourseCreation from './components/CourseCreation';
import LecturePage from './components/LecturePage';
import PrivateRoute from './PrivateRoute';
import SupportPage from './components/SupportPage';
import Analytics from './components/Analytics';
import ClarityTracking from './components/ClarityTracking';
import FeedbackPage from './components/FeedbackPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Analytics />
          <ClarityTracking />
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/courses" element={<CoursesList />} />
              <Route
                path="/create-course"
                element={
                  <PrivateRoute>
                    <CourseCreation />
                  </PrivateRoute>
                }
              />
              <Route path="/courses/:courseId" element={<CoursePage />} />
              <Route path="/lecture/:videoId" element={<LecturePage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
