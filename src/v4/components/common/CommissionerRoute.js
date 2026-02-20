import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../contexts/UserContext';
import PageLoader from './PageLoader';

const CommissionerRoute = ({ children }) => {
  const { user, loading, isSignedIn, isLoaded, isSquareAdmin, isSuperadmin } = useUserContext();

  if (!isLoaded || loading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/v4/sign-in" replace />;
  if (!user || (!isSquareAdmin && !isSuperadmin)) return <Navigate to="/v4/commissioner" replace />;

  return children;
};

export default CommissionerRoute;
