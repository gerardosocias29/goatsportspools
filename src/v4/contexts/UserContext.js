import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const lastFetchedClerkId = useRef(null);

  const fetchUser = useCallback(() => {
    const clerkToken = Cookies.get('__session');
    axiosService.get('/api/user-details', { token: clerkToken })
      .then((response) => {
        const jwtToken = response.data.token;
        login(jwtToken);
        return axiosService.get('/api/me_user', { token: jwtToken });
      })
      .then((response) => {
        setUser(response.data.user || response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('V4 UserContext: Error fetching user data:', error);
        setLoading(false);
      });
  }, [axiosService, login]);

  useEffect(() => {
    if (isSignedIn && isLoaded && clerkUser?.id) {
      // Skip re-fetch if we already have data for this clerk user
      if (lastFetchedClerkId.current === clerkUser.id && user) {
        return;
      }
      lastFetchedClerkId.current = clerkUser.id;
      fetchUser();
    } else if (isLoaded) {
      lastFetchedClerkId.current = null;
      setUser(null);
      setLoading(false);
    }
  }, [isSignedIn, isLoaded, clerkUser?.id, fetchUser]);

  const getRoleLabel = useCallback(() => {
    if (!user) return '';
    if (user.role_id === 1) return 'Superadmin';
    if (user.role_id === 2) return 'Square Admin';
    return 'Player';
  }, [user]);

  const isSuperadmin = user?.role_id === 1;
  const isSquareAdmin = user?.role_id === 2;

  // Allow manual re-fetch (e.g. after role change)
  const refreshUser = useCallback(() => {
    if (isSignedIn && isLoaded && clerkUser?.id) {
      fetchUser();
    }
  }, [isSignedIn, isLoaded, clerkUser?.id, fetchUser]);

  const value = useMemo(() => ({
    user,
    clerkUser,
    loading,
    isSignedIn,
    isLoaded,
    getRoleLabel,
    isSuperadmin,
    isSquareAdmin,
    refreshUser,
  }), [user, clerkUser, loading, isSignedIn, isLoaded, getRoleLabel, isSuperadmin, isSquareAdmin, refreshUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
