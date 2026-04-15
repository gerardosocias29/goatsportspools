import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../contexts/SidebarContext';
import SidebarWidget from './SidebarWidget';

// ─── Inline SVG Icons (all 24x24, stroke-based for crisp light/dark) ────────
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

// Squares grid — represents pools
const PoolsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" strokeWidth={1.5} />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" strokeWidth={1.5} />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" strokeWidth={1.5} />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeWidth={1.5} d="M7 7v0M17 7v0M7 17v0M17 17v0" />
  </svg>
);

// Gavel — auctions
const AuctionIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.5 4.5l5 5M11 8l5 5M8 11l5 5M4.5 18.5l7-7M13 21h8" />
  </svg>
);

// Bracket/tournament tree — playoffs
const PlayoffsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h4v4H3zM3 15h4v4H3zM17 10h4v4h-4zM7 7h4v5h6M7 17h4v-5" />
  </svg>
);

// Shield — teams
const TeamsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.8-.7-8-4.5-8-9V6l8-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.5 12l2 2 3.5-4" />
  </svg>
);

// Basketball — games
const GamesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18M12 3v18M5.6 5.6c3.5 3.5 9.3 3.5 12.8 0M5.6 18.4c3.5-3.5 9.3-3.5 12.8 0" />
  </svg>
);

// Person — users
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Clipboard-check — applications
const ApplicationsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2m-5 8l2 2 4-4" />
  </svg>
);

// Wallet — payouts
const PayoutsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8zM3 8l3-3h10M17 13h2" />
  </svg>
);

// Megaphone — banners
const BannersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5L6 9H3v6h3l5 4V5zM15 9a4 4 0 010 6M18 6a8 8 0 010 12" />
  </svg>
);

// Gear — settings
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

// ─── Menu Groups ────────────────────────────────────────────────
const mainItems = [
  { name: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
];

const competitionItems = [
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
  {
    name: 'NBA Playoffs',
    icon: <PlayoffsIcon />,
    subItems: [
      { name: 'All Playoffs', path: '/admin/playoffs' },
      { name: 'Standings', path: '/admin/playoffs/standings' },
    ],
  },
];

const sportsDataItems = [
  { name: 'Teams', icon: <TeamsIcon />, path: '/admin/teams' },
  { name: 'Games', icon: <GamesIcon />, path: '/admin/games' },
];

const membersItems = [
  { name: 'Users', icon: <UsersIcon />, path: '/admin/users' },
  { name: 'Applications', icon: <ApplicationsIcon />, path: '/admin/applications' },
  { name: 'Payouts', icon: <PayoutsIcon />, path: '/admin/payouts' },
];

const contentItems = [
  { name: 'Banners', icon: <BannersIcon />, path: '/admin/banners' },
];

// Document — content editor
const ContentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h4m-4-8h6m2 13H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
  </svg>
);

const systemItems = [
  { name: 'Content', icon: <ContentIcon />, path: '/admin/content' },
  { name: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const MENU_GROUPS = [
  { key: 'main', label: 'Main', items: mainItems },
  { key: 'competitions', label: 'Pools & Competitions', items: competitionItems },
  { key: 'sports', label: 'Sports Data', items: sportsDataItems },
  { key: 'members', label: 'Members', items: membersItems },
  { key: 'content', label: 'Content', items: contentItems },
  { key: 'system', label: 'System', items: systemItems },
];

const AdminSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path, { exact = false } = {}) => {
      if (path === '/admin' || exact) return location.pathname === path;
      return location.pathname === path || location.pathname.startsWith(path + '/');
    },
    [location.pathname]
  );

  const hasActiveChild = useCallback(
    (subItems) => subItems?.some((sub) => isActive(sub.path, { exact: true })) || false,
    [isActive]
  );

  useEffect(() => {
    let matched = false;
    MENU_GROUPS.forEach(({ key, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems && hasActiveChild(nav.subItems)) {
          setOpenSubmenu({ type: key, index });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive, hasActiveChild]);

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
      if (prev && prev.type === menuType && prev.index === index) return null;
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
                          isActive(subItem.path, { exact: true })
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
      <div className={`py-8 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link to="/" className="flex items-center gap-2">
          <img src="/img/v2_logo.png" alt="OKRNG" className="h-8 w-auto" />
          {isVisible && (
            <span className="font-bold text-xl text-gray-900 dark:text-white">OKRNG</span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear" style={{ scrollbarWidth: 'none' }}>
        <nav className="mb-6">
          <div className="flex flex-col gap-3">
            {MENU_GROUPS.map(({ key, label, items }) => (
              <div key={key}>
                {renderCategoryHeading(label)}
                {renderMenuItems(items, key)}
              </div>
            ))}
          </div>
        </nav>
        {isVisible ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AdminSidebar;
