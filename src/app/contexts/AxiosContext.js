import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Cookies from 'js-cookie';

const AxiosContext = createContext();

export const useAxios = () => {
  return useContext(AxiosContext);
};

export const AxiosProvider = ({ children }) => {
  const { apiToken } = useContext(AuthContext);
  const [session, setSession] = useState(Cookies.get('__session'));

  useEffect(() => {
    const checkSession = () => {
      const sessionCookie = Cookies.get('__session');
      if (sessionCookie) {
        setSession(sessionCookie);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000); // Retry every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor to dynamically set the Authorization header
  axiosInstance.interceptors.request.use((config) => {
    const token = session && !apiToken ? session : apiToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  const get = (url, config) => axiosInstance.get(url, config);
  const post = (url, data, config) => axiosInstance.post(url, data, config);
  const patch = (url, data, config) => axiosInstance.patch(url, data, config);
  const del = (url, config) => axiosInstance.delete(url, config);

  const contextValue = {
    axios: axiosInstance,
    get,
    post,
    patch,
    delete: del,
  };

  return (
    <AxiosContext.Provider value={contextValue}>
      {children}
    </AxiosContext.Provider>
  );
};