import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useAxios } from '../../app/contexts/AxiosContext';
import { AuthContext } from '../../app/contexts/AuthContext';
import Cookies from 'js-cookie';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { isSignedIn, isLoaded, user: clerkUser } = useClerkUser();
  const axiosService = useAxios();
  const { login } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      // First get fresh JWT token from user-details using Clerk session
      const clerkToken = Cookies.get('__session');
      axiosService.get('/api/user-details', { token: clerkToken })
        .then((response) => {
          // Store the new JWT token
          login(response.data.token);
          // Then fetch user data with the new token
          return axiosService.get('/api/me_user');
        })
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
  }, [isSignedIn, isLoaded, clerkUser?.id]);

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
    <UserContext.Provider value={{ user, loading, refreshUser, isSignedIn, isLoaded }}>
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
