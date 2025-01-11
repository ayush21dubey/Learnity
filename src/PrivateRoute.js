import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

function PrivateRoute({ children }) {
  const { user } = useContext(UserContext);

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
