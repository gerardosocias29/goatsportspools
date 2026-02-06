import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '@clerk/clerk-react';
import { useAxios } from '../../app/contexts/AxiosContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { borderRadius } from '../styles/theme';
import SquaresApiService from '../services/squaresApiService';

const Pools = () => {
  const { colors } = useTheme();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const squaresApiService = useMemo(() => new SquaresApiService(axiosService), [axiosService]);

  // Tab state
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-pools'
  const [activeSubTab, setActiveSubTab] = useState('active'); // 'active' | 'final'

  // My Pools data
  const [myPools, setMyPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch my pools when tab changes
  useEffect(() => {
    if (activeTab === 'my-pools' && isSignedIn) {
      fetchMyPools();
    }
  }, [activeTab, isSignedIn]);

  const fetchMyPools = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await squaresApiService.getMyPools();
      if (result.success) {
        setMyPools(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load pools');
    } finally {
      setLoading(false);
    }
  };

  // Filter pools by active/final status
  const filterPools = (pools, filter) => {
    const now = new Date();
    return pools.filter(pool => {
      const gameTime = new Date(pool.game?.game_datetime);
      const gameEndEstimate = new Date(gameTime.getTime() + 100 * 60 * 1000); // game time + 100 mins

      if (filter === 'active') {
        // Active: game hasn't finished yet (no final scores or game time + 100 mins > now)
        return !pool.game?.home_score_final || gameEndEstimate > now;
      } else {
        // Final: game has finished (has final scores)
        return pool.game?.home_score_final !== null && pool.game?.home_score_final !== undefined;
      }
    });
  };

  const getStatusBadge = (pool) => {
    const now = new Date();
    const gameTime = pool.game?.game_datetime ? new Date(pool.game.game_datetime) : null;

    if (!gameTime) return { text: 'Unknown', color: colors.text };

    if (pool.game?.home_score_final !== null && pool.game?.home_score_final !== undefined) {
      return { text: 'Completed', color: '#22c55e' };
    }

    if (gameTime <= now) {
      return { text: 'In Progress', color: '#f59e0b' };
    }

    if (pool.numbers_assigned) {
      return { text: 'Closed', color: '#ef4444' };
    }

    return { text: 'Open', color: '#3b82f6' };
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 2rem',
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyles = {
    fontSize: '3rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '1rem',
    color: colors.text,
  };

  const descStyles = {
    fontSize: '1.25rem',
    color: colors.text,
    opacity: 0.7,
    maxWidth: '600px',
    margin: '0 auto',
  };

  const tabContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    padding: '0.25rem',
    backgroundColor: colors.highlight,
    borderRadius: '12px',
    width: 'fit-content',
    margin: '0 auto 2rem',
  };

  const tabStyles = (isActive) => ({
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: isActive ? colors.card : colors.text,
    backgroundColor: isActive ? colors.brand?.primary || '#d47a3e' : 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const subTabContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const subTabStyles = (isActive) => ({
    padding: '0.5rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: isActive ? colors.brand?.primary || '#d47a3e' : colors.text,
    backgroundColor: 'transparent',
    border: `2px solid ${isActive ? colors.brand?.primary || '#d47a3e' : colors.border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  };

  const poolCardStyles = {
    cursor: 'pointer',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    borderRadius: borderRadius.md,
  };

  const poolCardHoverStyles = {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    borderColor: colors.brand?.primary || '#d47a3e',
  };

  const poolImagePlaceholderStyles = {
    width: '100%',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    fontSize: '3rem',
  };

  const poolTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '0.75rem',
    color: colors.text,
  };

  const poolDescStyles = {
    fontSize: '1rem',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  };

  const badgeStyles = {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginRight: '0.5rem',
  };

  const liveBadgeStyles = {
    ...badgeStyles,
    backgroundColor: colors.success + '20',
    color: colors.success,
  };

  const comingSoonBadgeStyles = {
    ...badgeStyles,
    backgroundColor: colors.border,
    color: colors.text,
    opacity: 0.6,
  };

  const infoBadgeStyles = {
    ...badgeStyles,
    backgroundColor: (colors.brand?.primary || '#d47a3e') + '20',
    color: colors.brand?.primary || '#d47a3e',
  };

  const browsePoolTypes = [
    {
      id: 'squares',
      title: 'Football Squares',
      description: 'Pick your squares on a 10x10 grid and win based on final scores. Perfect for game day with friends!',
      emoji: '🎯',
      status: 'live',
      badge: 'New!',
      route: '/squares',
    },
    {
      id: 'ncaa-basketball-auction',
      title: 'NCAA Basketball Auction',
      description: 'Bid on your favorite NCAA basketball teams in a live auction format. Watch the stream and compete with others!',
      emoji: '🏀',
      status: 'live',
      route: '/pools/ncaa-basketball-auction',
    },
    {
      id: 'nfl-betting',
      title: 'NFL Betting',
      description: 'Place bets on NFL games with spreads, totals, and moneylines. Join a league to start betting!',
      emoji: '🏈',
      status: 'live',
      badge: 'League Required',
      route: '/pools/nfl',
    },
  ];

  const handlePoolTypeClick = (pool) => {
    if (pool.status === 'live' && pool.route) {
      navigate(pool.route);
    }
  };

  const handleMyPoolClick = (pool) => {
    navigate(`/squares/pool/${pool.pool_number}`);
  };

  const getLeagueEmoji = (league) => {
    const leagueMap = {
      'NFL': '🏈',
      'NBA': '🏀',
      'PBA': '🎳',
    };
    return leagueMap[league] || '🎯';
  };

  const filteredMyPools = filterPools(myPools, activeSubTab);

  return (
    <div style={containerStyles} className="v2-fade-in">
      <div style={headerStyles}>
        <h1 style={titleStyles}>Pools</h1>
        <p style={descStyles}>
          Join exciting pools and compete with friends. From live auctions to classic squares, we've got it all!
        </p>
      </div>

      {/* Main Tabs */}
      <div style={tabContainerStyles}>
        <button
          style={tabStyles(activeTab === 'browse')}
          onClick={() => setActiveTab('browse')}
        >
          Browse Pools
        </button>
        <button
          style={tabStyles(activeTab === 'my-pools')}
          onClick={() => setActiveTab('my-pools')}
        >
          My Pools
        </button>
      </div>

      {/* Browse Pools Tab */}
      {activeTab === 'browse' && (
        <div style={gridStyles}>
          {browsePoolTypes.map((pool) => (
            <Card
              key={pool.id}
              padding="none"
              hover={pool.status === 'live'}
              style={{
                ...poolCardStyles,
                ...(hoveredCard === pool.id && pool.status === 'live' ? poolCardHoverStyles : {}),
              }}
              onMouseEnter={() => setHoveredCard(pool.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handlePoolTypeClick(pool)}
            >
              <div style={poolImagePlaceholderStyles}>
                {pool.emoji}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  {pool.status === 'live' ? (
                    <>
                      <span style={liveBadgeStyles}>● LIVE</span>
                      {pool.badge && <span style={infoBadgeStyles}>{pool.badge}</span>}
                    </>
                  ) : (
                    <span style={comingSoonBadgeStyles}>Coming Soon</span>
                  )}
                </div>
                <h3 style={poolTitleStyles}>{pool.title}</h3>
                <p style={poolDescStyles}>{pool.description}</p>
                {pool.status === 'live' ? (
                  <Button variant="primary" size="lg" fullWidth>
                    View Pools
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" fullWidth disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* My Pools Tab */}
      {activeTab === 'my-pools' && (
        <>
          {!isSignedIn ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: colors.highlight,
              borderRadius: '12px',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: colors.text,
                marginBottom: '1rem',
              }}>
                Sign in to view your pools
              </h3>
              <p style={{
                color: colors.text,
                opacity: 0.7,
                marginBottom: '1.5rem',
              }}>
                You need to be signed in to see the pools you've joined.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/sign-in')}>
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Sub-tabs: Active / Final */}
              <div style={subTabContainerStyles}>
                <button
                  style={subTabStyles(activeSubTab === 'active')}
                  onClick={() => setActiveSubTab('active')}
                >
                  Active ({filterPools(myPools, 'active').length})
                </button>
                <button
                  style={subTabStyles(activeSubTab === 'final')}
                  onClick={() => setActiveSubTab('final')}
                >
                  Final ({filterPools(myPools, 'final').length})
                </button>
              </div>

              {loading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4rem 2rem',
                  gap: '1.5rem',
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg
                      style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        animation: 'spin 1.5s linear infinite'
                      }}
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#D47A3E"
                        strokeWidth="4"
                        strokeDasharray="250 300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <img
                      src="/img/v2_logo.png"
                      alt="Loading"
                      style={{
                        width: '48px',
                        height: '48px',
                        position: 'relative',
                        zIndex: 1,
                        animation: 'bounce 1s ease-in-out infinite'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: colors.text,
                    fontFamily: '"Hubot Sans", sans-serif',
                  }}>
                    Loading your pools...
                  </div>
                </div>
              ) : error ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  backgroundColor: '#fee2e2',
                  borderRadius: '12px',
                }}>
                  <p style={{ color: '#dc2626' }}>{error}</p>
                  <Button variant="outline" size="md" onClick={fetchMyPools} style={{ marginTop: '1rem' }}>
                    Try Again
                  </Button>
                </div>
              ) : filteredMyPools.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  backgroundColor: colors.highlight,
                  borderRadius: '12px',
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: '1rem',
                  }}>
                    No {activeSubTab === 'active' ? 'active' : 'completed'} pools
                  </h3>
                  <p style={{
                    color: colors.text,
                    opacity: 0.7,
                    marginBottom: '1.5rem',
                  }}>
                    {activeSubTab === 'active'
                      ? "You haven't joined any active pools yet. Browse pools to get started!"
                      : "You don't have any completed pools yet."}
                  </p>
                  {activeSubTab === 'active' && (
                    <Button variant="primary" size="lg" onClick={() => setActiveTab('browse')}>
                      Browse Pools
                    </Button>
                  )}
                </div>
              ) : (
                <div style={gridStyles}>
                  {filteredMyPools.map((pool) => {
                    const status = getStatusBadge(pool);
                    const league = pool.game?.league || 'NFL';

                    return (
                      <Card
                        key={pool.id}
                        padding="none"
                        hover
                        style={{
                          ...poolCardStyles,
                          ...(hoveredCard === `my-${pool.id}` ? poolCardHoverStyles : {}),
                        }}
                        onMouseEnter={() => setHoveredCard(`my-${pool.id}`)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => handleMyPoolClick(pool)}
                      >
                        <div style={poolImagePlaceholderStyles}>
                          {getLeagueEmoji(league)}
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              ...badgeStyles,
                              backgroundColor: status.color + '20',
                              color: status.color,
                            }}>
                              {status.text}
                            </span>
                            <span style={infoBadgeStyles}>{league}</span>
                          </div>
                          <h3 style={poolTitleStyles}>{pool.pool_name || `Pool #${pool.id}`}</h3>
                          <p style={poolDescStyles}>
                            {pool.game?.game_description || 'Game details not available'}
                          </p>
                          <Button variant="primary" size="lg" fullWidth>
                            Select Squares
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Pools;
