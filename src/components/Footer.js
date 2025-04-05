import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learnity</h3>
            <p className="text-gray-600 text-sm">
              Making education accessible to everyone through free online courses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-600 hover:text-blue-600 text-sm">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 hover:text-blue-600 text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-600 hover:text-blue-600 text-sm">
                  Provide Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <p className="text-gray-600 text-sm mb-2">
              Email: support@learnity.com
            </p>
            <Link 
              to="/feedback" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Feedback
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Learnity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 