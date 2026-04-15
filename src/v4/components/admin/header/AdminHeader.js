import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../../contexts/SidebarContext';
import ThemeToggleButton from '../../common/ThemeToggleButton';
import AdminUserDropdown from './AdminUserDropdown';

const AdminHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-[99999] dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* Left section */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar toggle */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg z-[99999] dark:text-gray-400 lg:h-11 lg:w-11 lg:border border-gray-200 dark:border-gray-800"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 011.06-1.06L12 10.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 12l4.72 4.72a.75.75 0 11-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 01-1.06-1.06L10.94 12 6.22 7.28z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M.583 1A.75.75 0 011.333.25h13.334a.75.75 0 010 1.5H1.333A.75.75 0 01.583 1zm0 10a.75.75 0 01.75-.75h13.334a.75.75 0 010 1.5H1.333a.75.75 0 01-.75-.75zm.75-5.75a.75.75 0 000 1.5H8a.75.75 0 000-1.5H1.333z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden">
            <img src="/img/okrng.png" alt="OKRNG" className="h-8 w-auto" />
          </Link>

          {/* Mobile app menu toggle */}
          <button
            onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Right section */}
        <div
          className={`${isApplicationMenuOpen ? 'flex' : 'hidden'
            } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
          </div>
          <AdminUserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
