import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useAxios } from '../../app/contexts/AxiosContext';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { isSignedIn, isLoaded } = useClerkUser();
  const axiosService = useAxios();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      // Fetch user data once
      axiosService.get('/api/me_user')
        .then((response) => {
          setUser(response.data.user || response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else if (isLoaded) {
      setUser(null);
      setLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  const refreshUser = async () => {
    try {
      const response = await axiosService.get('/api/me_user');
      setUser(response.data.user || response.data);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
