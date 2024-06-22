import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const toast = useRef(null);

  const showToast = ({severity, summary, detail, life}) => {
    toast.current.show({ 
      severity: severity, 
      summary: summary, 
      detail: detail, 
      life: life || 3000 });
  };

  return (
    <ToastContext.Provider value={showToast}>
      <Toast ref={toast} />
      {children}
    </ToastContext.Provider>
  );
};
