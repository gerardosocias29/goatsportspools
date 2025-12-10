import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import Card, { CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import SquaresApiService from '../services/squaresApiService';

const Dashboard = ({ user }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const squaresApiService = useMemo(() => new SquaresApiService(axiosService), [axiosService]);

  // Dynamic state for stats
  const [stats, setStats] = useState({
    poolsJoined: 0,
    leaguesJoined: 0, // Placeholder - feature coming soon
    auctionsJoined: 0, // Placeholder - feature coming soon
    mySquares: 0,
  });
  const [myPools, setMyPools] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's pools and calculate stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const result = await squaresApiService.getMyPools();

        if (result.success && result.data) {
          const pools = Array.isArray(result.data) ? result.data : [];
          setMyPools(pools);

          // Count total squares owned by user across all pools
          // Backend returns: my_squares_count from SquaresPoolPlayer.squares_count
          const totalSquares = pools.reduce((sum, pool) => {
            const userSquares = pool.my_squares_count || 0;
            return sum + userSquares;
          }, 0);

          setStats({
            poolsJoined: pools.length,
            leaguesJoined: 0, // Placeholder
            auctionsJoined: 0, // Placeholder
            mySquares: totalSquares,
          });

          // Build recent activity from pools where user has squares
          const activities = pools
            .filter(pool => (pool.my_squares_count || 0) > 0)
            .map(pool => ({
              id: pool.id,
              type: 'squares_claimed',
              title: 'Squares claimed',
              description: `You claimed ${pool.my_squares_count || 0} square(s) in ${pool.pool_name || `Pool #${pool.pool_number}`}`,
              poolName: pool.pool_name || `Pool #${pool.pool_number}`,
              timestamp: pool.created_at, // Pool creation date
            }))
            .slice(0, 5);
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Helper to format relative time
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const containerStyles = {
    maxWidth: '1536px',
    margin: '0 auto',
    padding: '2rem',
  };

  const headerStyles = {
    marginBottom: '3rem',
  };

  const greetingStyles = {
    fontSize: '2.25rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '0.5rem',
  };

  const subheadingStyles = {
    fontSize: '1.125rem',
    color: colors.text,
    opacity: 0.7,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  };

  const statCardContentStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const statInfoStyles = {
    flex: 1,
  };

  const statLabelStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '0.5rem',
  };

  const statValueStyles = {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.brand.primary,
  };

  const statIconStyles = {
    width: '48px',
    height: '48px',
    borderRadius: '0.75rem',
    backgroundColor: colors.highlight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.brand.primary,
  };

  const sectionTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '1.5rem',
  };

  const activityItemStyles = {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 0',
    borderBottom: `1px solid ${colors.border}`,
  };

  const activityContentStyles = {
    flex: 1,
  };

  const activityTitleStyles = {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  };

  const activityDescStyles = {
    fontSize: '0.75rem',
    color: colors.text,
    opacity: 0.6,
  };

  const activityTimeStyles = {
    fontSize: '0.75rem',
    color: colors.text,
    opacity: 0.5,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={containerStyles} className="v2-fade-in">
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={greetingStyles}>
          Welcome back, {user?.name || 'Champion'}! 👋
        </h1>
        <p style={subheadingStyles}>
          Here's what's happening with your pools and leagues today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={gridStyles}>
        {/* Pools Joined */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>Pools Joined</div>
              <div style={statValueStyles}>{loading ? '...' : stats.poolsJoined}</div>
            </div>
            <div style={statIconStyles}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Leagues Joined */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>Leagues Joined</div>
              <div style={statValueStyles}>{loading ? '...' : stats.leaguesJoined}</div>
            </div>
            <div style={statIconStyles}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Auctions Joined */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>Auctions Joined</div>
              <div style={statValueStyles}>{loading ? '...' : stats.auctionsJoined}</div>
            </div>
            <div style={statIconStyles}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
          </div>
        </Card>

        {/* My Squares */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>My Squares</div>
              <div style={statValueStyles}>{loading ? '...' : stats.mySquares}</div>
            </div>
            <div style={statIconStyles}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Active Pools */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>My Pools</CardTitle>
            <CardDescription>Pools you've joined</CardDescription>
          </CardHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                Loading pools...
              </div>
            ) : myPools.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                You haven't joined any pools yet.
              </div>
            ) : (
              myPools.slice(0, 3).map((pool) => {
                const claimedSquares = pool.claimed_squares || pool.claimed_squares_count || 0;
                const totalSquares = 100;
                const poolStatus = pool.status || 'open';
                const statusVariant = poolStatus === 'active' || poolStatus === 'open' ? 'success'
                  : poolStatus === 'pending' ? 'warning'
                  : poolStatus === 'completed' ? 'default'
                  : 'info';

                return (
                  <div
                    key={pool.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      backgroundColor: colors.highlight,
                      cursor: 'pointer',
                      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onClick={() => navigate(`/v2/squares/${pool.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          {pool.pool_name || pool.name || `Pool #${pool.pool_number}`}
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                          {claimedSquares}/{totalSquares} squares filled
                        </div>
                      </div>
                      <Badge variant={statusVariant} size="sm">
                        {poolStatus.charAt(0).toUpperCase() + poolStatus.slice(1)}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {pool.my_squares_count || 0} squares owned
                      </div>
                      {pool.entry_fee > 0 && (
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.brand.primary }}>
                          ₱{parseFloat(pool.entry_fee).toLocaleString()} per square
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <CardFooter>
            <Button variant="outline" fullWidth onClick={() => navigate('/v2/squares')}>
              View All Pools
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest pool activities</CardDescription>
          </CardHeader>

          <div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                Loading activity...
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                No recent activity. Join a pool to get started!
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    ...activityItemStyles,
                    borderBottom: index === recentActivity.length - 1 ? 'none' : activityItemStyles.borderBottom,
                  }}
                >
                  <Avatar size="sm" alt={user?.name || 'You'} />
                  <div style={activityContentStyles}>
                    <div style={activityTitleStyles}>{activity.title}</div>
                    <div style={activityDescStyles}>
                      {activity.description}
                    </div>
                  </div>
                  <div style={activityTimeStyles}>{getTimeAgo(activity.timestamp)}</div>
                </div>
              ))
            )}
          </div>

          <CardFooter>
            <Button variant="ghost" fullWidth onClick={() => navigate('/v2/squares')}>
              View All Pools
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={sectionTitleStyles}>Quick Actions</h2>
        <div style={gridStyles}>
          <Card padding="lg" hover onClick={() => navigate('/v2/squares')}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  borderRadius: '1rem',
                  backgroundColor: colors.brand.primary,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Browse Pools
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Find and join squares pools
              </p>
            </div>
          </Card>

          <Card padding="lg" hover onClick={() => navigate('/v2/leagues')}>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <Badge
                variant="warning"
                size="sm"
                style={{ position: 'absolute', top: '-8px', right: '-8px' }}
              >
                Coming Soon
              </Badge>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  borderRadius: '1rem',
                  backgroundColor: colors.brand.secondary || '#6366F1',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Join League
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Fantasy leagues coming soon
              </p>
            </div>
          </Card>

          <Card padding="lg" hover onClick={() => navigate('/v2/auctions')}>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <Badge
                variant="warning"
                size="sm"
                style={{ position: 'absolute', top: '-8px', right: '-8px' }}
              >
                Coming Soon
              </Badge>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  borderRadius: '1rem',
                  backgroundColor: colors.success || '#22C55E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Join Auction
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Player auctions coming soon
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
