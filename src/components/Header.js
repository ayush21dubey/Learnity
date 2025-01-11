import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { LogOut } from 'lucide-react';

function Header() {
  const { user, logout } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-[#0077b6] py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Learnity
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/courses" className="text-white hover:text-blue-100 transition-colors">
            Courses
          </Link>
          
          {user ? (
            <div className="flex items-center relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-50 transition-colors"
              >
                <span className="text-[#0077b6] font-medium">
                  Hi, {user.displayName || 'User'}
                </span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-12 bg-white rounded-md shadow-lg py-2 w-48">
                  <Link 
                    to="/create-course"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Create Course
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-white hover:text-blue-100 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="bg-white text-[#0077b6] px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
