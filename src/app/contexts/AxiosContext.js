import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext

const AxiosContext = createContext();

export const useAxios = () => {
  return useContext(AxiosContext);
};

export const AxiosProvider = ({ children }) => {
  const { apiToken } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      Authorization: apiToken ? `Bearer ${apiToken}` : '',
      'Content-Type': 'application/json',
    },
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