import React, { createContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserContext - Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('UserContext - Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log('UserContext - Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      console.log('UserContext - Logging out');
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    loading,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
