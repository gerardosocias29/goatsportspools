import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUserContext } from './contexts/UserContext';
import { useUser } from '@clerk/clerk-react';
import Layout from './components/layout/Layout';
// Import fonts only - not the full globals.css to avoid conflicts with v1
import './styles/v2-scoped.css';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pools = lazy(() => import('./pages/Pools'));
const Leagues = lazy(() => import('./pages/Leagues'));
const NCAABasketballAuction = lazy(() => import('./pages/NCAABasketballAuction'));
const NFLBetting = lazy(() => import('./pages/NFLBetting'));
const LiveAuction = lazy(() => import('./pages/LiveAuction'));
const SignInPage = lazy(() => import('./pages/SignIn'));
const SignUpPage = lazy(() => import('./pages/SignUp'));
const SquaresPoolList = lazy(() => import('./pages/SquaresPoolList'));
const SquaresPoolDetail = lazy(() => import('./pages/SquaresPoolDetail'));
const CreateSquaresPool = lazy(() => import('./pages/CreateSquaresPool'));
const SquaresAdminDashboard = lazy(() => import('./pages/SquaresAdminDashboard'));
const ManageGames = lazy(() => import('./pages/ManageGames'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

// Loading fallback component for lazy-loaded routes
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#FAF6F2'
  }}>
    <div style={{
      position: 'relative',
      width: '120px',
      height: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Rotating Circle */}
      <svg
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          animation: 'spin 1.5s linear infinite'
        }}
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#D47A3E"
          strokeWidth="4"
          strokeDasharray="300 360"
          strokeLinecap="round"
        />
      </svg>

      {/* Logo */}
      <img
        src="/assets/images/favicon.png"
        alt="Loading"
        style={{
          width: '64px',
          height: '64px',
          position: 'relative',
          zIndex: 1,
          animation: 'bounce 1s ease-in-out infinite'
        }}
      />
    </div>
  </div>
);

// Inner component that uses UserContext
const V2AppContent = () => {
  const { isSignedIn } = useUser();
  const { user, loading } = useUserContext();
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    // Initialize Pusher for real-time auction updates when user is signed in
    if (isSignedIn && user && !pusher) {
      const initPusher = async () => {
        try {
          const Pusher = (await import('pusher-js')).default;
          const pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
            cluster: process.env.REACT_APP_PUSHER_CLUSTER,
          });

          const biddingChannel = pusherInstance.subscribe('bidding-channel');
          setPusher(pusherInstance);
          setChannel(biddingChannel);
        } catch (error) {
          console.error('Error loading Pusher:', error);
        }
      };
      initPusher();
    }

    // Cleanup Pusher on unmount
    return () => {
      if (pusher) {
        pusher.unsubscribe('bidding-channel');
        pusher.disconnect();
      }
    };
  }, [isSignedIn, user, pusher]);

  const handleSignOut = () => {
    window.location.href = '/v2/sign-in';
  };

  if (loading) {
    return (
      <Layout showHeader={false} showFooter={false}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#FAF6F2'
        }}>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Rotating Circle */}
            <svg
              style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                animation: 'spin 1.5s linear infinite'
              }}
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#D47A3E"
                strokeWidth="4"
                strokeDasharray="300 360"
                strokeLinecap="round"
              />
            </svg>

            {/* Logo */}
            <img
              src="/assets/images/favicon.png"
              alt="Loading"
              style={{
                width: '64px',
                height: '64px',
                position: 'relative',
                zIndex: 1,
                animation: 'bounce 1s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
          {/* Auth Routes - Without Layout */}
          <Route
            path="/sign-in/*"
            element={<SignInPage />}
          />
          <Route
            path="/sign-up/*"
            element={<SignUpPage />}
          />

          {/* All other routes - With Layout */}
          <Route
            path="/*"
            element={
              <Layout user={user} onSignOut={handleSignOut}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/v2" element={<Home />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      isSignedIn ? (
                        <Dashboard user={user} />
                      ) : (
                        <Navigate to="/v2/sign-in" replace />
                      )
                    }
                  />

                  {/* Pools Routes */}
                  <Route path="/pools" element={<Pools />} />
                  <Route path="/pools/ncaa-basketball-auction" element={<NCAABasketballAuction />} />
                  <Route
                    path="/pools/live-auction"
                    element={
                      isSignedIn ? (
                        <LiveAuction channel={channel} />
                      ) : (
                        <Navigate to="/v2/sign-in" replace />
                      )
                    }
                  />
                  <Route
                    path="/pools/nfl"
                    element={
                      isSignedIn ? (
                        <NFLBetting />
                      ) : (
                        <Navigate to="/v2/sign-in" replace />
                      )
                    }
                  />

                  {/* Leagues Route */}
                  <Route path="/leagues" element={<Leagues />} />

                  {/* Squares Routes */}
                  <Route path="/squares" element={<SquaresPoolList />} />
                  <Route path="/squares/pool/:poolId" element={<SquaresPoolDetail />} />
                  <Route
                    path="/squares/create"
                    element={
                      isSignedIn ? (
                        <CreateSquaresPool />
                      ) : (
                        <Navigate to="/v2/sign-in" replace />
                      )
                    }
                  />
                  <Route
                    path="/squares/admin"
                    element={
                      isSignedIn ? (
                        <SquaresAdminDashboard />
                      ) : (
                        <Navigate to="/v2/sign-in" replace />
                      )
                    }
                  />
                  <Route
                    path="/games/manage"
                    element={
                      isSignedIn ? (
                        <ManageGames />
                      ) : (
                        <Navigate to="/v2/sign-in" replace />
                      )
                    }
                  />

                  {/* Admin Routes - Superadmin Only */}
                  <Route
                    path="/admin/settings"
                    element={
                      isSignedIn && user?.role_id === 1 ? (
                        <AdminSettings />
                      ) : (
                        <Navigate to="/v2" replace />
                      )
                    }
                  />
                  <Route
                    path="/admin/auction"
                    element={
                      isSignedIn && user?.role_id === 1 ? (
                        <ComingSoon title="Manage Auction" />
                      ) : (
                        <Navigate to="/v2" replace />
                      )
                    }
                  />
                  <Route
                    path="/admin/teams"
                    element={
                      isSignedIn && user?.role_id === 1 ? (
                        <ComingSoon title="Manage Teams" />
                      ) : (
                        <Navigate to="/v2" replace />
                      )
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      isSignedIn && user?.role_id === 1 ? (
                        <ComingSoon title="User Management" />
                      ) : (
                        <Navigate to="/v2" replace />
                      )
                    }
                  />

                  {/* Placeholder routes for future pages */}
                  <Route path="/betting" element={<ComingSoon title="Betting" />} />
                  <Route path="/settings" element={<ComingSoon title="Settings" />} />
                  <Route path="/activity" element={<ComingSoon title="Activity" />} />

                  {/* Catch all - redirect to v2 home */}
                  <Route path="*" element={<Navigate to="/v2" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
  );
};

// Main V2App wrapper with providers
const V2App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <V2AppContent />
      </UserProvider>
    </ThemeProvider>
  );
};

// Coming Soon Component for placeholder pages
const ComingSoon = ({ title }) => {
  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '5rem 2rem',
    textAlign: 'center',
  };

  const titleStyles = {
    fontSize: '3rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '1rem',
  };

  const descStyles = {
    fontSize: '1.25rem',
    opacity: 0.7,
  };

  return (
    <div style={containerStyles} className="v2-fade-in">
      <h1 style={titleStyles}>{title}</h1>
      <p style={descStyles}>This page is coming soon. Stay tuned!</p>
    </div>
  );
};

export default V2App;
