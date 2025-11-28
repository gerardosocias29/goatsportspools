import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiDollarSign, FiGrid, FiLock, FiUnlock, FiPlusCircle } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import JoinPoolModal from '../components/squares/JoinPoolModal';
import { borderRadius } from '../styles/theme';

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
  const [hoveredPool, setHoveredPool] = useState(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    league: 'all',
  });

  // Get user role
  const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id ?? 99;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (pool) => {
    const totalSquares = pool.total_squares || pool.totalSquares || 100;
    const selectedSquares = pool.squares_claimed || pool.selectedSquares || pool.claimed_squares || pool.squares_selected || 0;
    return ((selectedSquares / totalSquares) * 100).toFixed(0);
  };

  const getTeamName = (teamId) => {
    if (!teamId) return 'TBD';
    const team = teams.find(t => t.id === teamId);
    return team?.name || team?.team_name || 'TBD';
  };

  const getTeamLogo = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.logo || team?.image_url || null;
  };

  const getTeamBackground = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.background_url || team?.backgroundUrl || null;
  };

  const handlePoolClick = (poolId) => {
    navigate(`/squares/pool/${poolId}`);
  };

  const handleCreatePool = () => {
    navigate('/squares/create');
  };

  const handleJoinSuccess = (pool) => {
    // Reload pools list and navigate to the joined pool
    loadPools();
    if (pool && pool.id) {
      navigate(`/squares/pool/${pool.id}`);
    }
  };

  // Shared styles
  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 2rem',
  };

  const headerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const titleRowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  };

  const titleStyles = {
    fontSize: '3rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    margin: 0,
    color: colors.text,
  };

  const subtitleStyles = {
    fontSize: '1.1rem',
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
    borderRadius: borderRadius.md,
    padding: '0.85rem 1rem',
    border: `1px solid ${colors.border}`,
    backgroundColor: isDark ? '#1f2937' : '#f7f4f2',
    color: colors.text,
    outlineColor: colors.brand.primary,
    fontWeight: 600,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  };

  const poolCardStyles = {
    cursor: 'pointer',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  };

  const poolCardHoverStyles = {
    transform: 'translateY(-4px)',
    borderColor: colors.brand.primary,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
  };

  const badgeBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  };

  const getStatusBadge = (status) => {
    const map = {
      open: { label: 'Open for Selection', color: colors.success },
      SelectOpen: { label: 'Open for Selection', color: colors.success },
      closed: { label: 'Closed', color: colors.error },
      SelectClosed: { label: 'Selection Closed', color: colors.error },
      in_progress: { label: 'Game in Progress', color: colors.info },
      GameStarted: { label: 'Game Started', color: colors.info },
      completed: { label: 'Completed', color: colors.text },
    };

    const badge = map[status] || { label: status || 'Status', color: colors.text };

    return (
      <span style={{ ...badgeBase, backgroundColor: `${badge.color}20`, color: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const getPoolTypeBadge = (type) => {
    const isCredit = type === 'CREDIT';
    const color = isCredit ? colors.brand.secondary : colors.brand.primary;
    return (
      <span style={{ ...badgeBase, backgroundColor: `${color}15`, color }}>
        {isCredit ? <FiLock /> : <FiUnlock />}
        {isCredit ? 'Credit Pool' : 'Open Pool'}
      </span>
    );
  };

  const infoRowStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.75rem',
    marginTop: '1rem',
  };

  const statTileStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1rem',
    borderRadius: borderRadius.md,
    backgroundColor: isDark ? '#1f2735' : '#f5f1ec',
    border: `1px solid ${colors.border}`,
  };

  const renderProgressCircle = (percentString) => {
    const pct = Math.min(Math.max(parseInt(percentString, 10) || 0, 0), 100);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (pct / 100) * circumference;

    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={colors.border}
            strokeWidth="3"
            opacity={0.4}
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={`url(#progressGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.brand.primary} />
              <stop offset="100%" stopColor={colors.brand.primaryHover} />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: 'absolute',
            fontWeight: 600,
            color: colors.text,
            fontSize: '0.6rem',
          }}
        >
          {pct}%
        </div>
      </div>
    );
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
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {isSignedIn && (
                <Button variant="secondary" size="lg" icon={<FiPlusCircle />} onClick={() => setJoinModalOpen(true)}>
                  Join Pool
                </Button>
              )}
              {isSignedIn && userRoleId <= 2 && (
                <Button variant="primary" size="lg" icon={<FiGrid />} onClick={handleCreatePool}>
                  Create Pool
                </Button>
              )}
            </div>
          </div>

          {/* Special Launch Promotion - legacy style */}
          <div class="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-xl shadow-xl"><div class="flex items-center gap-4"><div class="text-5xl">🎉</div><div class="flex-1"><h3 class="text-2xl font-bold text-gray-900 mb-1">Special Launch Promotion!</h3><p class="text-gray-800 text-lg">First 10 grids FREE! Next 50 grids minimal fee. Create your pool now!</p></div></div></div>

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
                  src="/assets/images/favicon.png"
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
              <Card
                key={pool.id}
                padding="none"
                hover={false}
                style={{
                  ...poolCardStyles,
                  ...(hoveredPool === pool.id ? poolCardHoverStyles : {}),
                }}
                onMouseEnter={() => setHoveredPool(pool.id)}
                onMouseLeave={() => setHoveredPool(null)}
                onClick={() => handlePoolClick(pool.id)}
              >
                <div style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isDark ? '#1f2735' : '#f7f4f2',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {getStatusBadge(pool.pool_status)}
                    {getPoolTypeBadge(pool.player_pool_type)}
                  </div>
                  {renderProgressCircle(getProgressPercentage(pool))}
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: '"Hubot Sans", sans-serif',
                    margin: '0 0 0.5rem',
                    color: colors.text,
                  }}>
                    {pool.pool_name || pool.gridName}
                  </h3>

                  {pool.game && (
                    <div className='py-2'>
                      <div className='flex justify-between items-center mb-2'>
                        <div style={{ color: colors.brand.primary, fontWeight: 700 }}>
                          {pool.game.league || 'NFL'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: colors.text, opacity: 0.65 }}>
                          <FiCalendar size={14} />
                          <span>{formatDate(pool.game.game_time || pool.game.game_datetime || pool.game.gameTime)}</span>
                        </div>
                      </div>
                      <div className='grid xl:grid-cols-2 gap-2'>
                        <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 py-2" style={{
                          backgroundImage: `url(${getTeamBackground(pool.game?.home_team_id || pool.game?.homeTeamId)})`,
                          backgroundSize: 'cover', // Ensures the image covers the entire div
                          backgroundPosition: 'center', // Centers the image within the div
                        }}>
                          <img src={getTeamLogo(pool.game?.home_team_id || pool.game?.homeTeamId)} alt={getTeamName(pool.game.home_team_id || pool.game.homeTeamId)} className="w-[30px]"/>
                          <p className="font-bold text-white select-none text-xs">{getTeamName(pool.game.home_team_id || pool.game.homeTeamId)}</p>
                        </div>
                        <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 py-2" style={{
                          backgroundImage: `url(${getTeamBackground(pool.game?.visitor_team_id || pool.game?.visitorTeamId)})`,
                          backgroundSize: 'cover', // Ensures the image covers the entire div
                          backgroundPosition: 'center', // Centers the image within the div
                        }}>
                          <img src={getTeamLogo(pool.game?.visitor_team_id || pool.game?.visitorTeamId)} alt={getTeamName(pool.game.visitor_team_id || pool.game.visitorTeamId)} className="w-[30px]"/>
                          <p className="font-bold text-white select-none text-xs">{getTeamName(pool.game.visitor_team_id || pool.game.visitorTeamId)}</p>
                        </div>
                      </div>

                      
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: colors.text, marginBottom: '0.35rem' }}>
                      <span style={{ opacity: 0.7 }}>Squares Filled</span>
                      <span>{pool.squares_claimed || pool.selectedSquares || pool.claimed_squares || pool.squares_selected || 0}/{pool.total_squares || pool.totalSquares || 100}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      backgroundColor: isDark ? '#111827' : '#e9dfd6',
                    }}>
                      <div
                        style={{
                          width: `${getProgressPercentage(pool)}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${colors.brand.primary}, ${colors.brand.primaryHover})`,
                          transition: 'width 250ms ease',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div style={infoRowStyles}>
                    <div className='flex flex-col items-center p-3 bg-gray-100 rounded-md' style={statTileStyles}>
                      <span style={{ color: colors.text, fontWeight: 800 }}>
                        ${parseFloat(pool.entry_fee || pool.credit_cost || pool.costPerSquare || 0).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>
                        Per Square
                      </span>
                    </div>

                    <div className='flex flex-col items-center p-3 bg-gray-100 rounded-md' style={statTileStyles}>
                      <span style={{ color: colors.text, fontWeight: 800 }}>
                        ${parseFloat(pool.total_pot || pool.totalPot || 0).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>
                        Total Pot
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.text, opacity: 0.75 }}>
                    {(pool.player_pool_type === 'CREDIT' || pool.costType === 'PasswordOpen') ? <FiLock /> : <FiUnlock />}
                    <span>{pool.player_pool_type === 'CREDIT' || pool.costType === 'PasswordOpen' ? 'Password required' : 'Open access'}</span>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePoolClick(pool.id);
                      }}
                    >
                      {(pool.pool_status === 'open' || pool.pool_status === 'SelectOpen') ? 'Join & Select Squares' : 'View Pool'}
                    </Button>
                  </div>
                </div>
              </Card>
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
