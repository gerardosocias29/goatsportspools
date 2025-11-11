import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemeColors, colors } from '../styles/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Check localStorage and system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('goat-v2-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('goat-v2-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      ...getThemeColors(isDark),
      brand: colors.brand,
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`v2-root ${isDark ? 'v2-dark' : 'v2-light'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
