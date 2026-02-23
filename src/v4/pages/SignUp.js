import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';

const getAppearance = (isDark) => ({
  elements: {
    rootBox: { width: '100%' },
    cardBox: { width: '100%', boxShadow: 'none' },
    card: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      boxShadow: isDark
        ? '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2)'
        : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)',
      borderRadius: '1rem',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      padding: '1.5rem',
    },
    socialButtonsBlockButton: {
      borderRadius: '0.75rem',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      backgroundColor: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#e5e7eb' : '#374151',
      transition: 'all 150ms ease',
    },
    socialButtonsBlockButtonText: {
      color: isDark ? '#e5e7eb' : '#374151',
      fontWeight: 500,
    },
    formButtonPrimary: {
      backgroundColor: '#D47A3E',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: 600,
      padding: '0.75rem 1.5rem',
      height: '2.75rem',
      transition: 'all 150ms ease',
    },
    formFieldInput: {
      borderRadius: '0.75rem',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      backgroundColor: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f3f4f6' : '#111827',
      fontSize: '1rem',
      padding: '0.75rem 1rem',
      height: '2.75rem',
    },
    formFieldLabel: {
      color: isDark ? '#d1d5db' : '#374151',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    footerActionLink: {
      color: '#D47A3E',
      fontWeight: 600,
    },
    footerActionText: {
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    identityPreviewText: {
      color: isDark ? '#e5e7eb' : '#374151',
    },
    identityPreviewEditButton: {
      color: '#D47A3E',
    },
    headerTitle: {
      color: isDark ? '#f9fafb' : '#111827',
    },
    headerSubtitle: {
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    dividerLine: {
      borderColor: isDark ? '#374151' : '#e5e7eb',
    },
    dividerText: {
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    formFieldInputShowPasswordButton: {
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    otpCodeFieldInput: {
      borderColor: isDark ? '#4b5563' : '#d1d5db',
      color: isDark ? '#f3f4f6' : '#111827',
      backgroundColor: isDark ? '#111827' : '#ffffff',
    },
    formResendCodeLink: {
      color: '#D47A3E',
    },
    alertText: {
      color: isDark ? '#fca5a5' : '#dc2626',
    },
    alert: {
      backgroundColor: isDark ? 'rgba(127,29,29,0.2)' : 'rgba(254,242,242,1)',
      borderColor: isDark ? 'rgba(185,28,28,0.3)' : 'rgba(252,165,165,1)',
    },
    backLink: {
      color: '#D47A3E',
    },
  },
});

const SignUp = () => {
  const { isDark } = useTheme();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <img src="/img/v2_logo.png" alt="OKRNG" className="h-10 w-auto" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">OKRNG</span>
      </div>

      <ClerkSignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={getAppearance(isDark)}
      />
    </div>
  );
};

export default SignUp;
