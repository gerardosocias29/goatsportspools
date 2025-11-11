import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, user, onSignOut, showHeader = true, showFooter = true }) => {
  const { colors } = useTheme();

  const layoutStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
    color: colors.text,
  };

  const mainStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={layoutStyles}>
      {showHeader && <Header user={user} onSignOut={onSignOut} />}
      <main style={mainStyles}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
