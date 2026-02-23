import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [apiToken, setApiToken] = useState(localStorage.getItem('apiToken'));

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    const storedApiToken = localStorage.getItem('apiToken');

    if (storedLoggedIn) {
      setLoggedIn(storedLoggedIn);
    }

    if (storedApiToken) {
      setApiToken(storedApiToken);
    }
  }, []);

  const login = useCallback((token) => {
    setApiToken(token);
    setLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('apiToken', token);
  }, []);

  const logout = useCallback(() => {
    setApiToken(null);
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('apiToken');
    window.location.replace('/login');
  }, []);

  const value = useMemo(() => ({
    isLoggedIn, login, logout, apiToken,
  }), [isLoggedIn, login, logout, apiToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
