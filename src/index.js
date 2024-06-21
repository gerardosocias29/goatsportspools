import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'primereact/resources/themes/saga-blue/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import { twMerge } from 'tailwind-merge';
import { AuthProvider } from './app/contexts/AuthContext';
import { AxiosProvider } from './app/contexts/AxiosContext';
import { ToastProvider } from './app/contexts/ToastContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PrimeReactProvider value={{ ripple: true, unstyled: false, pt: {}, ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge } }}>
    <ToastProvider>
      <AuthProvider>
        <AxiosProvider>
          <App />
        </AxiosProvider>
      </AuthProvider>
    </ToastProvider>
  </PrimeReactProvider>
);

reportWebVitals();
