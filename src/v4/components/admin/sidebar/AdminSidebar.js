import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../contexts/SidebarContext';
import SidebarWidget from './SidebarWidget';

// --- Inline SVG Icons ---
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const PoolsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const AuctionIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TeamsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const GamesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BannersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const DotsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

// --- Menu Data ---
const menuItems = [
  {
    name: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin',
  },
  {
    name: 'Pools',
    icon: <PoolsIcon />,
    subItems: [
      { name: 'All Pools', path: '/admin/pools' },
      { name: 'Create Pool', path: '/admin/pools/create' },
    ],
  },
  {
    name: 'Auctions',
    icon: <AuctionIcon />,
    subItems: [
      { name: 'Manage Auctions', path: '/admin/auctions' },
      { name: 'Live Bidding', path: '/admin/auctions/live' },
    ],
  },
];

const PayoutsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ApplicationsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const managementItems = [
  { name: 'Teams', icon: <TeamsIcon />, path: '/admin/teams' },
  { name: 'Games', icon: <GamesIcon />, path: '/admin/games' },
  { name: 'Users', icon: <UsersIcon />, path: '/admin/users' },
  { name: 'Applications', icon: <ApplicationsIcon />, path: '/admin/applications' },
  { name: 'Payouts', icon: <PayoutsIcon />, path: '/admin/payouts' },
  { name: 'Banners', icon: <BannersIcon />, path: '/admin/banners' },
];

const settingsItems = [
  { name: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const AdminSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => {
      // Dashboard (/admin) is exact match only to avoid matching every admin route
      if (path === '/admin') return location.pathname === '/admin';
      return location.pathname === path || location.pathname.startsWith(path + '/');
    },
    [location.pathname]
  );

  // Check if any child of a submenu group is active
  const hasActiveChild = useCallback(
    (subItems) => subItems?.some((sub) => isActive(sub.path)) || false,
    [isActive]
  );

  // Auto-expand submenu for active route
  useEffect(() => {
    let submenuMatched = false;
    const allGroups = [
      { items: menuItems, type: 'menu' },
      { items: managementItems, type: 'management' },
      { items: settingsItems, type: 'settings' },
    ];

    allGroups.forEach(({ items, type }) => {
      items.forEach((nav, index) => {
        if (nav.subItems && hasActiveChild(nav.subItems)) {
          setOpenSubmenu({ type, index });
          submenuMatched = true;
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, hasActiveChild]);

  // Calculate submenu heights for animation
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const isVisible = isExpanded || isHovered || isMobileOpen;

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => {
        const isOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        const childActive = nav.subItems ? hasActiveChild(nav.subItems) : false;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm cursor-pointer transition-colors ${
                  childActive
                    ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
                    : isOpen
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                } ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
              >
                <span className={`w-6 h-6 ${
                  childActive || isOpen
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {nav.icon}
                </span>
                {isVisible && <span className="flex-1 text-left">{nav.name}</span>}
                {isVisible && (
                  <ChevronDownIcon
                    className={`w-5 h-5 ml-auto transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 text-brand-500 dark:text-brand-400'
                        : 'text-gray-400'
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`relative flex items-center w-full gap-3 py-2 font-medium rounded-lg text-sm transition-colors ${
                    isActive(nav.path)
                      ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400 border-l-[3px] border-brand-500 pl-2.5 pr-3'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3'
                  }`}
                >
                  <span className={`w-6 h-6 ${
                    isActive(nav.path)
                      ? 'text-brand-500 dark:text-brand-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {nav.icon}
                  </span>
                  {isVisible && <span>{nav.name}</span>}
                </Link>
              )
            )}
            {nav.subItems && isVisible && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px',
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                          isActive(subItem.path)
                            ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400 border-l-[3px] border-brand-500 pl-2.5 pr-3'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderCategoryHeading = (label) => (
    <h2
      className={`mb-2 text-xs uppercase flex leading-5 text-gray-400 ${
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
      }`}
    >
      {isVisible ? label : <DotsIcon />}
    </h2>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded || isMobileOpen
          ? 'w-[290px]'
          : isHovered
          ? 'w-[290px]'
          : 'w-[90px]'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link to="/" className="flex items-center gap-2">
          <img src="/img/v2_logo.png" alt="OKRNG" className="h-8 w-auto" />
          {isVisible && (
            <span className="font-bold text-xl text-gray-900 dark:text-white">OKRNG</span>
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear" style={{ scrollbarWidth: 'none' }}>
        <nav className="mb-6">
          <div className="flex flex-col gap-3">
            {/* MENU category */}
            <div>
              {renderCategoryHeading('Menu')}
              {renderMenuItems(menuItems, 'menu')}
            </div>

            {/* MANAGEMENT category */}
            <div>
              {renderCategoryHeading('Management')}
              {renderMenuItems(managementItems, 'management')}
            </div>

            {/* SETTINGS category */}
            <div>
              {renderCategoryHeading('Settings')}
              {renderMenuItems(settingsItems, 'settings')}
            </div>
          </div>
        </nav>
        {isVisible ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AdminSidebar;
