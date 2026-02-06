import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiPlusCircle } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BannerDisplay from '../components/ui/BannerDisplay';
import JoinPoolModal from '../components/squares/JoinPoolModal';
import PoolCard from '../components/squares/PoolCard';

/**
 * Squares Pool List Page
 * Shows all available squares pools with the v2 theme styling
 */
const SquaresPoolList = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const { user: currentUser, isSignedIn } = useUserContext();
  const { colors, isDark } = useTheme();

  const [pools, setPools] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filter, setFilter] = useState({
    status: 'all',
    league: 'all',
  });

  // Get user role
  const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id ?? 99;

  // Mobile detection for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadTeams();
    loadPools();
  }, [filter]);

  const loadTeams = async () => {
    try {
      const response = await axiosService.get('/api/teams');
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadPools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.league !== 'all') params.append('league', filter.league);

      const queryString = params.toString();
      const url = `/api/squares-pools${queryString ? `?${queryString}` : ''}`;

      const response = await axiosService.get(url);
      const poolsData = response.data.data || response.data || [];

      setPools(poolsData);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePoolClick = (poolNumber) => {
    navigate(`/squares/pool/${poolNumber}`);
  };

  const handleCreatePool = () => {
    navigate('/squares/create');
  };

  const handleJoinSuccess = (pool) => {
    // Reload pools list and navigate to the joined pool
    loadPools();
    if (pool && pool.pool_number) {
      navigate(`/squares/pool/${pool.pool_number}`);
    }
  };

  // Shared styles
  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: isMobile ? '1.5rem 1rem' : '3rem 2rem',
  };

  const headerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const titleRowStyles = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  };

  const titleStyles = {
    fontSize: isMobile ? '2rem' : '3rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    margin: 0,
    color: colors.text,
  };

  const subtitleStyles = {
    fontSize: isMobile ? '0.95rem' : '1.1rem',
    color: colors.text,
    opacity: 0.7,
    margin: 0,
  };

  const filtersCardStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    // marginTop: '1rem',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: colors.text,
    opacity: 0.7,
    marginBottom: '0.35rem',
  };

  const selectStyles = {
    width: '100%',
    borderRadius: '0.5rem',
    padding: '0.85rem 1rem',
    border: `1px solid ${colors.border}`,
    backgroundColor: isDark ? '#1f2937' : '#f7f4f2',
    color: colors.text,
    outlineColor: colors.brand.primary,
    fontWeight: 600,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: isMobile ? '1rem' : '1.5rem',
    marginTop: '1.5rem',
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div style={containerStyles} className="v2-fade-in">
        <div style={headerStyles}>
          <div style={titleRowStyles}>
            <div>
              <h1 style={titleStyles}>Squares Pools</h1>
              <p style={subtitleStyles}>Join a pool and pick your winning squares.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
              {isSignedIn && (
                <Button variant="secondary" size={isMobile ? 'md' : 'lg'} icon={<FiPlusCircle />} onClick={() => setJoinModalOpen(true)} style={{ flex: isMobile ? '1 1 auto' : 'none' }}>
                  Join Pool
                </Button>
              )}
              {isSignedIn && userRoleId <= 2 && (
                <Button variant="primary" size={isMobile ? 'md' : 'lg'} icon={<FiGrid />} onClick={handleCreatePool} style={{ flex: isMobile ? '1 1 auto' : 'none' }}>
                  Create Pool
                </Button>
              )}
            </div>
          </div>

          {/* Dynamic Banners */}
          <BannerDisplay page="squares" />

          <Card hover={false} padding="md">
            <div style={filtersCardStyles}>
              <div>
                <label style={labelStyles}>Status</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  style={selectStyles}
                >
                  <option value="all">All Status</option>
                  <option value="SelectOpen">Open for Selection</option>
                  <option value="SelectClosed">Selection Closed</option>
                  <option value="GameStarted">Game Started</option>
                </select>
              </div>
              <div>
                <label style={labelStyles}>League</label>
                <select
                  value={filter.league}
                  onChange={(e) => setFilter({ ...filter, league: e.target.value })}
                  style={selectStyles}
                >
                  <option value="all">All Leagues</option>
                  <option value="NFL">NFL</option>
                  <option value="NBA">NBA</option>
                  <option value="NCAAF">NCAA Football</option>
                  <option value="NCAAB">NCAA Basketball</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
            }}>
              <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg
                  style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    animation: 'spin 1.5s linear infinite'
                  }}
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={colors.brand.primary}
                    strokeWidth="4"
                    strokeDasharray="300 360"
                    strokeLinecap="round"
                  />
                </svg>
                <img
                  src="/img/v2_logo.png"
                  alt="Loading"
                  style={{
                    width: '64px',
                    height: '64px',
                    position: 'relative',
                    zIndex: 1,
                    animation: 'bounce 1s ease-in-out infinite'
                  }}
                />
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: colors.text,
                fontFamily: '"Hubot Sans", sans-serif',
              }}>
                Loading Squares Pools...
              </div>
            </div>
          </div>
        ) : pools.length === 0 ? (
          <Card hover={false} padding="xl" style={{ textAlign: 'center' }}>
            <FiGrid size={64} style={{ margin: '0 auto 1rem', color: isDark ? '#6B7280' : '#9CA3AF' }} />
            <p style={{ fontSize: '1.1rem', color: colors.text, opacity: 0.7 }}>
              {userRoleId <= 2 ? 'No pools found' : 'You haven\'t joined any pools yet'}
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isSignedIn && (
                <Button variant="secondary" size="lg" icon={<FiPlusCircle />} onClick={() => setJoinModalOpen(true)}>
                  Join a Pool
                </Button>
              )}
              {isSignedIn && userRoleId <= 2 && (
                <Button variant="primary" size="lg" onClick={handleCreatePool}>
                  Create the first pool
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div style={gridStyles}>
            {pools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                teams={teams}
                onSelect={(p) => handlePoolClick(p.pool_number)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Join Pool Modal */}
      <JoinPoolModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
};

export default SquaresPoolList;
