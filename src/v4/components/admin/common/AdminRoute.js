import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../../contexts/UserContext';
import PageLoader from '../../common/PageLoader';

const AdminRoute = ({ children }) => {
  const { user, loading, isSignedIn, isLoaded, isSuperadmin } = useUserContext();

  if (!isLoaded || loading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (!user || !isSuperadmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
