import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import ReactPlayer from 'react-player';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const LiveAuction = ({ channel }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction_id');

  const [currentUser, setCurrentUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [currentBidAmount, setCurrentBidAmount] = useState(1);
  const [customBidAmount, setCustomBidAmount] = useState(1);
  const [isBidding, setIsBidding] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [isUserWinning, setIsUserWinning] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    if (!auctionId) {
      navigate('/v2/pools/ncaa-basketball-auction');
      return;
    }

    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await axiosService.get('/api/me_user');
        setCurrentUser(userResponse.data.user);
        
        // Join auction
        await axiosService.get(`/api/auctions/${auctionId}/join`);

        // Get auction details
        const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
        setEvent(response.data);

        const activeItemId = response.data.active_item_id;
        const matchedItem = response.data.items?.find((e) => e.id === activeItemId) || null;
        setActiveItem(matchedItem);

        // Get members
        const membersResponse = await axiosService.get(`/api/auctions/${auctionId}/members`);
        setMembers(membersResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching auction data:', error);
        setLoading(false);
      }
    };

    fetchAuctionData();

    // Handle page unload
    const handleUnload = () => {
      if (currentUser?.id) {
        const url = `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/${currentUser.id}/leave`;
        navigator.sendBeacon(url);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [auctionId]);

  // Update bid amounts when active item changes
  useEffect(() => {
    if (activeItem) {
      if (activeItem.bids?.length > 0) {
        const nextBid = activeItem.minimum_bid + (activeItem?.bids[0]?.bid_amount || 0);
        setCurrentBidAmount(nextBid);
        setCustomBidAmount(nextBid);
        
        // Check if user is winning
        const highestBidder = activeItem.bids[0];
        setIsUserWinning(highestBidder.user_id === currentUser?.id);
      } else {
        setCurrentBidAmount(activeItem.starting_bid);
        setCustomBidAmount(activeItem.starting_bid);
        setIsUserWinning(false);
      }
      setBidHistory(activeItem.bids || []);
    }
  }, [activeItem]);

  // Handle active item updates
  const handleActiveItem = (data) => {
    console.log('active-item-event', data);
    let auction_id = data.data;
    if (data.auction_item_id != null) {
      auction_id = data.auction_item_id;
    }

    if (auction_id === undefined || auction_id === 0) {
      setActiveItem(null);
      setCurrentBidAmount(0);
      setCustomBidAmount(0);
      setBidHistory([]);
      setIsUserWinning(false);

      axiosService
        .get(`/api/auctions/${auctionId}/get-by-id`)
        .then((response) => {
          setEvent(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

      return;
    }

    axiosService
      .get(`/api/auctions/${auctionId}/${auction_id}/get-active-item`)
      .then((response) => {
        setActiveItem(response.data);
        
        if (response.data && response.data.bids && response.data.bids.length > 0) {
          const highestBidder = response.data.bids[0];
          setIsUserWinning(highestBidder.user_id === currentUser?.id);
        } else {
          setIsUserWinning(false);
        }
        setBidHistory(response.data.bids || []);
      })
      .catch(() => {
        setActiveItem(null);
        setIsUserWinning(false);
      });
  };

  // Handle auction members update
  const handleAuctionMembers = async () => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error('Failed to update auction members:', err);
    }
  };

  // Pusher event listeners
  useEffect(() => {
    if (channel) {
      channel.bind('active-item-event', handleActiveItem);
      channel.bind('bid-event', handleActiveItem);
      channel.bind('auction-members', handleAuctionMembers);

      channel.bind('active-auction-event-all', (data) => {
        if (data.status !== 'live') {
          alert('The auction has ended!');
          navigate('/v2/pools/ncaa-basketball-auction');
        }
      });
    }

    return () => {
      if (channel) {
        channel.unbind('active-item-event');
        channel.unbind('bid-event');
        channel.unbind('auction-members');
        channel.unbind('active-auction-event-all');
      }
    };
  }, [channel]);

  // Place bid handler
  const handlePlaceBid = async (customAmount = 0) => {
    setIsBidding(true);

    let bid_amount = currentBidAmount;
    if (customAmount !== 0) {
      bid_amount = customAmount;
    }

    try {
      const response = await axiosService.post(
        `/api/auctions/${auctionId}/${activeItem.id}/bid`,
        { bid_amount: bid_amount }
      );

      if (response.data.status) {
        if (response.data.winning) {
          setIsUserWinning(true);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to place bid');
    } finally {
      setIsBidding(false);
    }
  };

  // Handle back navigation
  const handleBack = async () => {
    try {
      await axiosService.post(`/api/auctions/${auctionId}/${currentUser?.id}/leave`);
      navigate('/v2/pools/ncaa-basketball-auction');
    } catch (error) {
      console.error('Error leaving auction:', error);
      navigate('/v2/pools/ncaa-basketball-auction');
    }
  };

  // Styles
  const containerStyles = {
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: colors.background,
    padding: '2rem',
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '1rem',
    maxWidth: '1536px',
    margin: '0 auto 2rem auto',
  };

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
  };

  const liveBadgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
  };

  const desktopGridStyles = {
    ...gridStyles,
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  };

  const statBoxStyles = (bgColor, borderColor) => ({
    backgroundColor: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '0.75rem',
    padding: '1rem',
    textAlign: 'center',
  });

  const statLabelStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '0.25rem',
  };

  const statValueStyles = (color) => ({
    fontSize: '1.25rem',
    fontWeight: 700,
    color: color || colors.text,
  });

  const itemButtonStyles = (isActive, isSold) => ({
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: isActive ? `2px solid ${colors.brand.primary}` : `1px solid ${colors.border}`,
    backgroundColor: isActive ? colors.brand.primary : colors.card,
    color: isActive ? '#ffffff' : colors.text,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: isSold ? 'not-allowed' : 'default',
    opacity: isSold ? 0.5 : 1,
    transition: 'all 0.2s ease',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    boxShadow: isActive ? `0 4px 12px ${colors.brand.primary}40` : 'none',
  });

  const bidInputContainerStyles = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '0.875rem',
  };

  const tableHeaderStyles = {
    backgroundColor: colors.highlight,
  };

  const tableHeaderCellStyles = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tableCellStyles = (isCurrentUser) => ({
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: colors.text,
    backgroundColor: isCurrentUser ? colors.highlight : 'transparent',
    borderBottom: `1px solid ${colors.border}`,
  });

  const winningAlertStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#10B98120',
    border: '1px solid #10B981',
    borderRadius: '0.75rem',
    color: '#10B981',
    marginBottom: '1.5rem',
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
        backgroundColor: colors.background,
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
              stroke="#D47A3E"
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
          fontWeight: 600,
          color: colors.text,
          fontFamily: '"Hubot Sans", sans-serif',
        }}>
          Loading auction...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles} className="v2-fade-in">
      {/* Header */}
      <div style={headerStyles}>
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: colors.text,
            padding: '0.5rem',
          }}
        >
          ←
        </button>
        <h1 style={titleStyles}>{event?.name || 'NCAA Basketball Auction'}</h1>
        <span style={liveBadgeStyles}>● LIVE</span>
      </div>

      {/* Main Grid */}
      <div className="live-auction-grid">
        {/* Left Column - Livestream & Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Live Stream */}
          <Card padding="lg" hover={false}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📹</span>
                <CardTitle>Live Stream</CardTitle>
                <span style={liveBadgeStyles}>LIVE</span>
              </div>
            </CardHeader>
            <div style={{
              position: 'relative',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: `1px solid ${colors.border}`,
              backgroundColor: '#000',
              marginTop: '1rem',
            }}>
              {event?.stream_url ? (
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <ReactPlayer
                    url={event.stream_url}
                    playing
                    controls={true}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    config={{
                      youtube: {
                        playerVars: { 
                          showinfo: 1,
                          modestbranding: 1,
                          rel: 0
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.card,
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: colors.text,
                    opacity: 0.5,
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
                    <div>Stream not available</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Auction Items */}
          <Card padding="lg" hover={false}>
            <CardHeader>
              <CardTitle>Auction Items</CardTitle>
              <CardDescription>All items in this auction</CardDescription>
            </CardHeader>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginTop: '1rem',
            }}>
              {event?.items?.map((item) => (
                <div
                  key={item.id}
                  style={itemButtonStyles(
                    activeItem?.id === item.id,
                    item.sold_to
                  )}
                  title={item.sold_to ? 'This item is sold' : ''}
                >
                  <span>
                    #{item.seed} {item.description} {item.name} - {item.region}
                  </span>
                  {item.sold_to && (
                    <span style={{ color: colors.success }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Bidding Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card padding="none" hover={false}>
            <div style={{ 
              padding: '1.5rem',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <CardTitle>Item on Bid</CardTitle>
            </div>

            {activeItem ? (
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  color: colors.text,
                }}>
                  #{activeItem.seed} {activeItem.description} {activeItem.name} - {activeItem.region}
                </h3>

                {/* Bid Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={statBoxStyles(colors.card, colors.border)}>
                    <div style={statLabelStyles}>Starting Bid</div>
                    <div style={statValueStyles(colors.text)}>${activeItem.starting_bid}</div>
                  </div>
                  <div style={statBoxStyles(colors.card, colors.border)}>
                    <div style={statLabelStyles}>Min Increment</div>
                    <div style={statValueStyles(colors.text)}>${activeItem.minimum_bid}</div>
                  </div>
                  <div style={statBoxStyles('#10B98120', '#10B981')}>
                    <div style={{ ...statLabelStyles, color: '#10B981', opacity: 1 }}>Current Bid</div>
                    <div style={statValueStyles('#10B981')}>
                      ${activeItem.bids?.length > 0 ? activeItem.bids[0].bid_amount : '-'}
                    </div>
                  </div>
                </div>

                {/* Winning Alert */}
                {isUserWinning && (
                  <div style={winningAlertStyles}>
                    <span style={{ fontSize: '1.25rem' }}>✓</span>
                    <span style={{ fontWeight: 600 }}>You are winning this item!</span>
                  </div>
                )}

                {/* Quick Bid Button */}
                <div style={{ marginBottom: '1rem' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => handlePlaceBid()}
                    disabled={isBidding}
                  >
                    {isBidding ? 'Placing Bid...' : `Bid $${currentBidAmount}`}
                  </Button>
                </div>

                {/* Custom Bid */}
                <div style={bidInputContainerStyles}>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="number"
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(parseFloat(e.target.value))}
                      placeholder="Custom bid amount"
                      min={currentBidAmount}
                      step="1"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePlaceBid(customBidAmount)}
                    disabled={isBidding}
                  >
                    Submit
                  </Button>
                </div>

                {/* Bid History */}
                <div style={{ marginTop: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: colors.text,
                    }}>
                      Bid History
                    </h3>
                    {bidHistory?.length > 0 && (
                      <Badge variant="default">{bidHistory.length}</Badge>
                    )}
                  </div>

                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.75rem',
                  }}>
                    {bidHistory?.length > 0 ? (
                      <table style={tableStyles}>
                        <thead style={tableHeaderStyles}>
                          <tr>
                            <th style={tableHeaderCellStyles}>Amount</th>
                            <th style={tableHeaderCellStyles}>Name</th>
                            <th style={tableHeaderCellStyles}>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bidHistory.map((bid, index) => {
                            const isCurrentUser = bid.user_id === currentUser?.id;
                            const bidder = members.find((e) => e.user_id == bid.user_id);
                            return (
                              <tr key={index}>
                                <td style={tableCellStyles(isCurrentUser)}>
                                  <strong>${Number(bid.bid_amount).toFixed(2)}</strong>
                                </td>
                                <td style={tableCellStyles(isCurrentUser)}>
                                  {bidder?.user?.name || '-'}
                                </td>
                                <td style={tableCellStyles(isCurrentUser)}>
                                  {new Date(bid.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        color: colors.text,
                        opacity: 0.5,
                      }}>
                        No bids yet. Be the first to bid!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: colors.text,
                opacity: 0.5,
              }}>
                <p>No active item on bid yet.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Please wait for the auctioneer to activate an item.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveAuction;
