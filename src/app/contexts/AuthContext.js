import React, { createContext, useState, useEffect } from 'react';

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


  const login = (token) => {
    setApiToken(token);
    setLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('apiToken', token);
  };

  const logout = () => {
    setApiToken(null);
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('apiToken');
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, apiToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };