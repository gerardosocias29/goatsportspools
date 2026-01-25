import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme colors for both light and dark modes
export const getThemeColors = (isDark) => ({
  // Background colors
  background: isDark ? '#111827' : '#f9fafb',
  card: isDark ? '#1f2937' : '#ffffff',
  cardHover: isDark ? '#374151' : '#f3f4f6',

  // Text colors
  text: isDark ? '#f9fafb' : '#111827',
  textMuted: isDark ? '#9ca3af' : '#6b7280',
  textLight: isDark ? '#d1d5db' : '#374151',

  // Border colors
  border: isDark ? '#374151' : '#e5e7eb',
  borderLight: isDark ? '#4b5563' : '#f3f4f6',

  // Brand colors
  brand: {
    primary: '#D47A3E',
    primaryHover: '#C46B2F',
    secondary: '#d69a3e',
  },

  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('goat-v3-theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Toggle dark class on document root for Tailwind
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('goat-v3-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const colors = getThemeColors(isDark);

  const value = {
    isDark,
    setIsDark,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
