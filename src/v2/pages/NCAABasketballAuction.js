import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import moment from 'moment';

const NCAABasketballAuction = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction_id');

  const [liveAuction, setLiveAuction] = useState(null);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctionData();
  }, []);

  const fetchAuctionData = async () => {
    try {
      setLoading(true);

      // Fetch live auction
      const liveResponse = await axiosService.get('/api/auctions/live');
      if (liveResponse.data) {
        setLiveAuction(liveResponse.data);
      }

      // Fetch upcoming auctions
      const upcomingResponse = await axiosService.get('/api/auctions/upcoming');
      setUpcomingAuctions(upcomingResponse.data || []);

      // Fetch user's auctioned items
      const myItemsResponse = await axiosService.get('/api/auctions/my-items');
      setMyItems(myItemsResponse.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching auction data:', error);
      setLoading(false);
    }
  };

  const handleJoinAuction = async (auction) => {
    try {
      await axiosService.get(`/api/auctions/${auction.id}/join`);
      navigate(`/pools/live-auction?auction_id=${auction.id}`);
    } catch (error) {
      console.error('Error joining auction:', error);
    }
  };

  const handleJoinLiveAuction = async () => {
    if (!liveAuction) return;
    try {
      await axiosService.get(`/api/auctions/${liveAuction.id}/join`);
      navigate(`/pools/live-auction?auction_id=${liveAuction.id}`);
    } catch (error) {
      console.error('Error joining live auction:', error);
    }
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 2rem',
  };

  const headerStyles = {
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
  };

  const sectionTitleStyles = {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '1.5rem',
    color: colors.text,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  };

  const auctionCardStyles = {
    padding: '1.5rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
  };

  const liveAuctionCardStyles = {
    padding: '1.5rem',
    border: `2px solid ${colors.error}`,
    borderRadius: '1rem',
  };

  const liveBadgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: colors.error,
    color: '#ffffff',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const auctionTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '0.75rem',
    color: colors.text,
  };

  const auctionInfoStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '1rem',
  };

  const statRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  };

  const statLabelStyles = {
    color: colors.text,
    opacity: 0.7,
  };

  const statValueStyles = {
    fontWeight: 600,
    color: colors.text,
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: colors.text,
    opacity: 0.5,
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        gap: '2rem',
      }}>
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Rotating Circle */}
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
              stroke="#D47A3E"
              strokeWidth="4"
              strokeDasharray="300 360"
              strokeLinecap="round"
            />
          </svg>

          {/* Bouncing Logo */}
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

        {/* Loading Text */}
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: colors.text,
          fontFamily: '"Hubot Sans", sans-serif',
        }}>
          Loading auctions...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles} className="v2-fade-in">
      <div style={headerStyles}>
        <h1 style={titleStyles}>NCAA Basketball Auction</h1>
        <p style={descStyles}>
          Bid on your favorite NCAA basketball teams in live auctions. Watch the livestream and compete with other fans!
        </p>
      </div>

      {/* Live Auction Section */}
      {liveAuction && Object.keys(liveAuction).length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={sectionTitleStyles}>
            <span style={liveBadgeStyles}>● LIVE</span>
          </h2>
          <Card style={liveAuctionCardStyles}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={auctionTitleStyles}>{liveAuction.name}</h3>
                <p style={auctionInfoStyles}>
                  Started: {moment(liveAuction.event_date).format('ddd, MMM D • h:mm A')}
                </p>
              </div>
              <span style={liveBadgeStyles}>LIVE NOW</span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={statRowStyles}>
                <span style={statLabelStyles}>Total Items:</span>
                <span style={statValueStyles}>{liveAuction.items?.length || 0}</span>
              </div>
              <div style={statRowStyles}>
                <span style={statLabelStyles}>Participants:</span>
                <span style={statValueStyles}>{liveAuction.members?.length || 0}</span>
              </div>
              {liveAuction.active_item_id && (
                <div style={statRowStyles}>
                  <span style={statLabelStyles}>Current Item:</span>
                  <span style={statValueStyles}>
                    {liveAuction.items?.find(item => item.id === liveAuction.active_item_id)?.name || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleJoinLiveAuction}
            >
              Join Live Auction
            </Button>
          </Card>
        </div>
      )}

      {/* Upcoming Auctions Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={sectionTitleStyles}>Upcoming Auctions</h2>
        {upcomingAuctions.length > 0 ? (
          <div style={gridStyles}>
            {upcomingAuctions.map((auction) => (
              <Card key={auction.id} style={auctionCardStyles} hover>
                <div style={{ marginBottom: '1rem' }}>
                  <Badge variant="default" style={{ marginBottom: '0.75rem' }}>
                    {auction.status === 'pending' ? 'Upcoming' : auction.status}
                  </Badge>
                  <h3 style={auctionTitleStyles}>{auction.name}</h3>
                  <p style={auctionInfoStyles}>
                    📅 {moment(auction.event_date).format('ddd, MMM D • h:mm A')}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={statRowStyles}>
                    <span style={statLabelStyles}>Total Items:</span>
                    <span style={statValueStyles}>{auction.items?.length || 0}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={true}
                  style={{ cursor: 'not-allowed', opacity: 0.6 }}
                >
                  Starts {moment(auction.event_date).format('MMM D, h:mm A')}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card style={auctionCardStyles}>
            <div style={emptyStateStyles}>
              <p>No upcoming auctions at the moment</p>
            </div>
          </Card>
        )}
      </div>

      {/* My Auctioned Items Section */}
      <div>
        <h2 style={sectionTitleStyles}>My Auctioned Items</h2>
        {myItems.length > 0 ? (
          <div style={gridStyles}>
            {myItems.map((item) => (
              <Card key={item.id} style={auctionCardStyles}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={auctionTitleStyles}>{item.name}</h3>
                  {item.seed && item.region && (
                    <p style={auctionInfoStyles}>
                      #{item.seed} Seed - {item.region}
                    </p>
                  )}
                </div>

                <div>
                  <div style={statRowStyles}>
                    <span style={statLabelStyles}>Winning Bid:</span>
                    <span style={{ ...statValueStyles, color: colors.success }}>
                      ${item.sold_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div style={statRowStyles}>
                    <span style={statLabelStyles}>Status:</span>
                    <Badge variant="success">Won</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card style={auctionCardStyles}>
            <div style={emptyStateStyles}>
              <p>You haven't won any items yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Join an auction to start bidding!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NCAABasketballAuction;
