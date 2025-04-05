import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { LogOut, ChevronDown, Menu, X } from 'lucide-react';

function Header() {
  const { user, logout } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-[#0077b6]">
              Learnity
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/courses" className="text-gray-600 hover:text-gray-800">
              Courses
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <span>{user.displayName || user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-12 bg-white rounded-md shadow-lg py-2 w-48">
                    <Link 
                      to="/create-course"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Create Course
                    </Link>
                    {user.email === 'ayush21dubey@gmail.com' && (
                      <Link 
                        to="/admin/feedback"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
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
                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                  Log In
                </Link>
                <Link to="/signup" className="bg-[#0077b6] text-white px-4 py-2 rounded-md hover:bg-[#005f8b]">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/courses"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            {user ? (
              <>
                <span className="block px-3 py-2 text-base font-medium text-gray-500">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-[#0077b6] text-white hover:bg-[#005f8b]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Header;
