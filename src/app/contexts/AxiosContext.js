import React, { createContext, useContext, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Cookies from 'js-cookie';

const AxiosContext = createContext();

export const useAxios = () => {
  return useContext(AxiosContext);
};

export const AxiosProvider = ({ children }) => {
  const { apiToken, logout } = useContext(AuthContext);
  const apiTokenRef = useRef(apiToken);
  apiTokenRef.current = apiToken;

  // Stable axios instance created once
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          error.response.data.message === 'Unauthenticated.'
        ) {
          // Only logout if there's no active Clerk session.
          // If __session cookie exists, Clerk is still managing auth —
          // redirecting now would cause a refresh loop on page reload.
          const hasClerkSession = Cookies.get('__session');
          if (!hasClerkSession) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    instance.interceptors.request.use((config) => {
      let token;
      if (config.token) {
        token = config.token;
      } else {
        const sessionCookie = Cookies.get('__session');
        token = sessionCookie && !apiTokenRef.current ? sessionCookie : apiTokenRef.current;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return instance;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable context value — functions never change since axiosInstance is stable
  const contextValue = useMemo(() => ({
    axios: axiosInstance,
    get: (url, config) => axiosInstance.get(url, config),
    post: (url, data, config) => axiosInstance.post(url, data, config),
    put: (url, data, config) => axiosInstance.put(url, data, config),
    patch: (url, data, config) => axiosInstance.patch(url, data, config),
    delete: (url, config) => axiosInstance.delete(url, config),
  }), [axiosInstance]);

  return (
    <AxiosContext.Provider value={contextValue}>
      {children}
    </AxiosContext.Provider>
  );
};
