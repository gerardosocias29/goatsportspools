import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiShield, FiUsers } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Admin Settings Dashboard - V2 Implementation
 * Central hub for superadmin management features
 * Provides access to Games, Auction, and Teams management
 */
const AdminSettings = () => {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();

  const adminSections = [
    {
      title: 'Manage Games',
      description: 'Create, edit, and manage games for squares pools and betting',
      icon: <FiCalendar size={48} />,
      path: '/v2/games/manage',
      available: true,
    },
    {
      title: 'Manage Auction',
      description: 'Configure auction settings, manage bids, and control live auctions',
      icon: <FiDollarSign size={48} />,
      path: '/v2/admin/auction',
      available: false,
    },
    {
      title: 'Manage Teams',
      description: 'Add, edit, and organize NFL teams and their information',
      icon: <FiShield size={48} />,
      path: '/v2/admin/teams',
      available: false,
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: <FiUsers size={48} />,
      path: '/v2/admin/users',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ color: colors.text }}>Admin Settings</h1>
          <p className="text-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Manage all aspects of your platform</p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {adminSections.map((section, index) => (
            <div
              key={index}
              onClick={() => section.available && navigate(section.path)}
              className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
                section.available
                  ? 'hover:scale-105 hover:shadow-2xl cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`
              }}
            >
              {/* Card Header */}
              <div
                className="px-8 py-6 flex items-center gap-4"
                style={{ backgroundColor: colors.brand.primary }}
              >
                <div className="text-white">{section.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  {!section.available && (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="px-8 py-6">
                <p className="text-lg leading-relaxed" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  {section.description}
                </p>

                {section.available && (
                  <div className="mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.path);
                      }}
                      className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                      style={{ backgroundColor: colors.brand.primary }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
                    >
                      Open Manager
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div
          className="mt-12 rounded-xl p-8"
          style={{
            backgroundColor: colors.card,
            border: `2px solid ${colors.brand.primary}`
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0" style={{ color: colors.brand.primary }}>
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Administrator Access</h3>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                You have full administrative privileges. Use these tools responsibly to manage the platform.
                Some features are still under development and will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
