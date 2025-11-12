import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthContext } from '../app/contexts/AuthContext';
import { useAxios } from '../app/contexts/AxiosContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
// Import fonts only - not the full globals.css to avoid conflicts with v1
import './styles/v2-scoped.css';

const V2App = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const axiosService = useAxios();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch user data
      axiosService.get('/api/me_user')
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleSignOut = () => {
    logout();
  };

  if (loading) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
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

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    isLoggedIn ? (
                      <Dashboard user={user} />
                    ) : (
                      <Navigate to="/v2/sign-in" replace />
                    )
                  }
                />

                {/* Placeholder routes for future pages */}
                <Route path="/pools" element={<ComingSoon title="Pools" />} />
                <Route path="/leagues" element={<ComingSoon title="Leagues" />} />
                <Route path="/betting" element={<ComingSoon title="Betting" />} />
                <Route path="/settings" element={<ComingSoon title="Settings" />} />
                <Route path="/activity" element={<ComingSoon title="Activity" />} />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/v2" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
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
