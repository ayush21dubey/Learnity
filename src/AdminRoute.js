import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  // Check if user is admin
  const isAdmin = user?.email === 'ayush21dubey@gmail.com';

  // Debug logging
  useEffect(() => {
    console.log('AdminRoute - Current user:', user);
    console.log('AdminRoute - Loading state:', loading);
    console.log('AdminRoute - Is admin:', isAdmin);
  }, [user, loading, isAdmin]);

  // Wait for auth state to be determined
  if (loading) {
    console.log('AdminRoute - Waiting for auth state...');
    return null; // or a loading spinner
  }

  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    console.log('AdminRoute - Not admin, redirecting to home');
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute; 