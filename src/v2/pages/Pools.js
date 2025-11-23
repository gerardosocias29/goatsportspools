import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { borderRadius } from '../styles/theme';

const Pools = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 2rem',
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '3rem',
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
    borderColor: colors.brand.primary,
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
    backgroundColor: colors.brand.primary + '20',
    color: colors.brand.primary,
  };

  const pools = [
    {
      id: 'squares',
      title: 'Football Squares',
      description: 'Pick your squares on a 10x10 grid and win based on final scores. Perfect for game day with friends!',
      emoji: '🎯',
      status: 'live',
      badge: 'New!',
      route: '/v2/squares',
    },
    {
      id: 'ncaa-basketball-auction',
      title: 'NCAA Basketball Auction',
      description: 'Bid on your favorite NCAA basketball teams in a live auction format. Watch the stream and compete with others!',
      emoji: '🏀',
      status: 'live',
      route: '/v2/pools/ncaa-basketball-auction',
    },
    {
      id: 'nfl-betting',
      title: 'NFL Betting',
      description: 'Place bets on NFL games with spreads, totals, and moneylines. Join a league to start betting!',
      emoji: '🏈',
      status: 'live',
      badge: 'League Required',
      route: '/v2/pools/nfl',
    },
  ];

  const [hoveredCard, setHoveredCard] = React.useState(null);

  const handlePoolClick = (pool) => {
    if (pool.status === 'live' && pool.route) {
      navigate(pool.route);
    }
  };

  return (
    <div style={containerStyles} className="v2-fade-in">
      <div style={headerStyles}>
        <h1 style={titleStyles}>Pools</h1>
        <p style={descStyles}>
          Join exciting pools and compete with friends. From live auctions to classic squares, we've got it all!
        </p>
      </div>

      <div style={gridStyles}>
        {pools.map((pool) => (
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
            onClick={() => handlePoolClick(pool)}
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
    </div>
  );
};

export default Pools;
