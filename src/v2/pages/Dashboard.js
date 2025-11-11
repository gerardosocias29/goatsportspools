import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Card, { CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar, { AvatarGroup } from '../components/ui/Avatar';

const Dashboard = ({ user }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();

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
        {/* Total Balance */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>Total Balance</div>
              <div style={statValueStyles}>$2,450</div>
            </div>
            <div style={statIconStyles}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Active Pools */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>Active Pools</div>
              <div style={statValueStyles}>8</div>
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

        {/* Leagues */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>My Leagues</div>
              <div style={statValueStyles}>3</div>
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

        {/* Win Rate */}
        <Card padding="lg">
          <div style={statCardContentStyles}>
            <div style={statInfoStyles}>
              <div style={statLabelStyles}>Win Rate</div>
              <div style={statValueStyles}>67%</div>
            </div>
            <div style={statIconStyles}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
            <CardTitle>Active Pools</CardTitle>
            <CardDescription>Your currently running competitions</CardDescription>
          </CardHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Pool Item 1 */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: colors.highlight,
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => navigate('/v2/pools/1')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    NFL Week 12 Squares
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    45/100 squares filled
                  </div>
                </div>
                <Badge variant="success" size="sm">Live</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AvatarGroup max={4} size="sm">
                  <Avatar alt="User 1" />
                  <Avatar alt="User 2" />
                  <Avatar alt="User 3" />
                  <Avatar alt="User 4" />
                  <Avatar alt="User 5" />
                </AvatarGroup>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.brand.primary }}>
                  $500 Prize
                </div>
              </div>
            </div>

            {/* Pool Item 2 */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: colors.highlight,
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => navigate('/v2/pools/2')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    NBA Playoff Bracket
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    32 participants
                  </div>
                </div>
                <Badge variant="warning" size="sm">Pending</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AvatarGroup max={4} size="sm">
                  <Avatar alt="User 1" />
                  <Avatar alt="User 2" />
                  <Avatar alt="User 3" />
                </AvatarGroup>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.brand.primary }}>
                  $1,000 Prize
                </div>
              </div>
            </div>

            {/* Pool Item 3 */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: colors.highlight,
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => navigate('/v2/pools/3')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    March Madness 2025
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    128 participants
                  </div>
                </div>
                <Badge variant="info" size="sm">Upcoming</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AvatarGroup max={4} size="sm">
                  <Avatar alt="User 1" />
                  <Avatar alt="User 2" />
                  <Avatar alt="User 3" />
                  <Avatar alt="User 4" />
                </AvatarGroup>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.brand.primary }}>
                  $5,000 Prize
                </div>
              </div>
            </div>
          </div>

          <CardFooter>
            <Button variant="outline" fullWidth onClick={() => navigate('/v2/pools')}>
              View All Pools
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your pools and leagues</CardDescription>
          </CardHeader>

          <div>
            {/* Activity Item 1 */}
            <div style={activityItemStyles}>
              <Avatar size="sm" alt="John Doe" status="online" />
              <div style={activityContentStyles}>
                <div style={activityTitleStyles}>New bet placed</div>
                <div style={activityDescStyles}>
                  You placed a $50 bet on Chiefs -3.5
                </div>
              </div>
              <div style={activityTimeStyles}>2h ago</div>
            </div>

            {/* Activity Item 2 */}
            <div style={activityItemStyles}>
              <Avatar size="sm" alt="Sarah Smith" />
              <div style={activityContentStyles}>
                <div style={activityTitleStyles}>Pool winner announced</div>
                <div style={activityDescStyles}>
                  You won $125 in NFL Week 11 Squares!
                </div>
              </div>
              <div style={activityTimeStyles}>5h ago</div>
            </div>

            {/* Activity Item 3 */}
            <div style={activityItemStyles}>
              <Avatar size="sm" alt="Mike Johnson" />
              <div style={activityContentStyles}>
                <div style={activityTitleStyles}>League invitation</div>
                <div style={activityDescStyles}>
                  Mike invited you to "Office Champions League"
                </div>
              </div>
              <div style={activityTimeStyles}>1d ago</div>
            </div>

            {/* Activity Item 4 */}
            <div style={activityItemStyles}>
              <Avatar size="sm" alt="System" />
              <div style={activityContentStyles}>
                <div style={activityTitleStyles}>Balance updated</div>
                <div style={activityDescStyles}>
                  $200 added to your account
                </div>
              </div>
              <div style={activityTimeStyles}>2d ago</div>
            </div>

            {/* Activity Item 5 */}
            <div style={{ ...activityItemStyles, borderBottom: 'none' }}>
              <Avatar size="sm" alt="Emma Wilson" />
              <div style={activityContentStyles}>
                <div style={activityTitleStyles}>New pool created</div>
                <div style={activityDescStyles}>
                  Emma created "Super Bowl Squares 2025"
                </div>
              </div>
              <div style={activityTimeStyles}>3d ago</div>
            </div>
          </div>

          <CardFooter>
            <Button variant="ghost" fullWidth onClick={() => navigate('/v2/activity')}>
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={sectionTitleStyles}>Quick Actions</h2>
        <div style={gridStyles}>
          <Card padding="lg" hover onClick={() => navigate('/v2/pools/create')}>
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
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Create Pool
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Start a new pool and invite friends
              </p>
            </div>
          </Card>

          <Card padding="lg" hover onClick={() => navigate('/v2/leagues/join')}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  borderRadius: '1rem',
                  backgroundColor: colors.brand.secondary,
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
                Find and join existing leagues
              </p>
            </div>
          </Card>

          <Card padding="lg" hover onClick={() => navigate('/v2/betting')}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  borderRadius: '1rem',
                  backgroundColor: colors.success,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Place Bet
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Browse games and place bets
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
