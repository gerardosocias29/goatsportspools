import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import { useToast } from '../../../app/contexts/ToastContext';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import ReactPlayer from 'react-player';
import moment from 'moment';

const AdminBidding = ({ channel }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const showToast = useToast();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction_id');
  const bidInputRef = useRef(null);

  // Main state
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('East');

  // Bidding state
  const [activeItem, setActiveItem] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [startedItem, setStartedItem] = useState(null);
  const [currentBidAmount, setCurrentBidAmount] = useState(1);
  const [customBidAmount, setCustomBidAmount] = useState(1);
  const [isBidding, setIsBidding] = useState(false);
  const [recentBid, setRecentBid] = useState(null);

  // User state
  const [users, setUsers] = useState([]);
  const [userOnBid, setUserOnBid] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const regions = ['East', 'West', 'Midwest', 'South'];

  // Fetch auction data
  useEffect(() => {
    if (!auctionId) {
      navigate('/admin/auction');
      return;
    }
    fetchAuctionData();
    fetchUsers();
  }, [auctionId]);

  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuctionData(response.data);

      const activeItemId = response.data.active_item_id;
      const matchedItem = response.data.items?.find((e) => e.id === activeItemId) || null;
      setActiveItem(matchedItem);
      if (matchedItem) setHasStarted(true);
    } catch (error) {
      console.error('Error fetching auction:', error);
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to load auction' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = process.env.REACT_APP_USER_QUERY || 0;
      let param = q == 1 ? '?query=true' : '';
      const response = await axiosService.get(`/api/users/all${param}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Update bid amounts when active item changes
  useEffect(() => {
    if (activeItem) {
      if (activeItem.bids?.length > 0) {
        const nextBid = activeItem.minimum_bid + (activeItem.bids[0]?.bid_amount || 0);
        setCurrentBidAmount(nextBid);
        setCustomBidAmount(nextBid);
      } else {
        setCurrentBidAmount(activeItem.starting_bid);
        setCustomBidAmount(activeItem.starting_bid);
      }
    }
  }, [activeItem]);

  // Pusher event listeners
  useEffect(() => {
    if (!channel) return;

    const handleNewBid = async (data) => {
      let auction_item_id = data.auction_item_id || data.data;
      if (!auction_item_id) return;

      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuctionData(response.data);

      try {
        const itemResponse = await axiosService.get(`/api/auctions/${auctionId}/${auction_item_id}/get-active-item`);
        setActiveItem(itemResponse.data);
        setRecentBid(data);
        setTimeout(() => setRecentBid(null), 2000);
      } catch {
        setActiveItem(null);
      }
    };

    const handleAuctionMembers = async () => {
      try {
        const response = await axiosService.get(`/api/auctions/${auctionId}/members`);
        setAuctionData((prev) => (prev ? { ...prev, joined_users: response.data } : null));
      } catch (err) {
        console.error('Failed to update auction members:', err);
      }
    };

    channel.bind('bid-event', handleNewBid);
    channel.bind('auction-members', handleAuctionMembers);

    return () => {
      channel.unbind('bid-event', handleNewBid);
      channel.unbind('auction-members', handleAuctionMembers);
    };
  }, [channel, auctionId]);

  // Place bid
  const handlePlaceBid = async (customAmount = 0, userId = null) => {
    if (!activeItem) return;
    setIsBidding(true);

    const data = {
      bid_amount: customAmount || currentBidAmount,
    };
    if (userId) data.user_id = userId;

    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/${activeItem.id}/bid`, data);
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Bid Placed' : 'Bid Error',
        detail: response.data.status ? `Successfully placed bid of ${data.bid_amount}` : response.data.message,
      });
    } catch (error) {
      showToast({
        severity: 'error',
        summary: 'Unable to Bid',
        detail: error.response?.data?.message || 'An error occurred',
      });
    } finally {
      setIsBidding(false);
    }
  };

  // Start bidding on item
  const handleStart = async () => {
    if (!activeItem) return;
    setStartedItem(activeItem);
    try {
      await axiosService.get(`/api/auctions/${auctionId}/${activeItem.id}/set-active-item`);
      setHasStarted(true);
      showToast({
        severity: 'success',
        summary: 'Auction Started',
        detail: `Bidding for ${activeItem.name} has begun`,
      });
    } catch (err) {
      showToast({ severity: 'error', summary: 'Failed to Start', detail: 'Could not start the auction' });
    }
  };

  // End bidding on item
  const handleEndAuction = async () => {
    if (!activeItem) return;
    try {
      await axiosService.post(`/api/auctions/${auctionId}/${activeItem.id}/end-active-item`, {
        sold_to: activeItem.bids?.length > 0 ? activeItem.bids[0].user_id : 0,
        sold_amount: activeItem.bids?.length > 0 ? activeItem.bids[0].bid_amount : 0,
      });

      showToast({
        severity: 'info',
        summary: 'Item Auction Ended',
        detail: activeItem.bids?.length > 0
          ? `Item sold to ${activeItem.bids[0].user?.name} for ${activeItem.bids[0].bid_amount}`
          : 'Item Auction ended with no bids',
      });

      setStartedItem(null);
      setActiveItem(null);
      setHasStarted(false);

      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuctionData(response.data);
    } catch (err) {
      console.error('Failed to end auction:', err);
    }
  };

  // Remove bid
  const handleRemoveBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to remove this bid?')) return;
    try {
      await axiosService.post('/api/auctions/remove-bid', { bid_id: bidId });
      showToast({ severity: 'success', summary: 'Bid Removed', detail: 'The bid has been removed successfully' });
    } catch (error) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to remove bid' });
    }
  };

  // Select item
  const handleSelectItem = (item) => {
    if (item.sold_to) return;
    if (startedItem?.id === item.id) {
      setActiveItem(startedItem);
      setHasStarted(true);
    } else {
      setActiveItem(item);
      setHasStarted(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.id?.toString().includes(searchTerm)
  );

  // Styles
  const containerStyles = {
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: colors.background,
    padding: '1.5rem',
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    maxWidth: '1536px',
    margin: '0 auto 1.5rem auto',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    maxWidth: '1536px',
    margin: '0 auto',
  };

  const itemButtonStyles = (isActive, isSold) => ({
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: isActive ? `2px solid ${colors.brand.primary}` : `1px solid ${colors.border}`,
    backgroundColor: isActive ? colors.brand.primary : colors.card,
    color: isActive ? '#ffffff' : colors.text,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: isSold ? 'not-allowed' : 'pointer',
    opacity: isSold ? 0.5 : 1,
    transition: 'all 0.2s ease',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  });

  const memberCardStyles = (isSelected, isOnline) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: `1px solid ${isSelected ? colors.brand.primary : colors.border}`,
    backgroundColor: isSelected ? `${colors.brand.primary}15` : colors.card,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const statBoxStyles = (bgColor) => ({
    backgroundColor: bgColor,
    borderRadius: '0.75rem',
    padding: '1rem',
    textAlign: 'center',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', backgroundColor: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/img/v2_logo.png" alt="Loading" style={{ width: '64px', marginBottom: '1rem' }} />
          <div style={{ color: colors.text }}>Loading auction...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles} className="v2-fade-in">
      {/* Header */}
      <div style={headerStyles}>
        <button
          onClick={() => navigate('/admin/auction')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: colors.text }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Hubot Sans", sans-serif', color: colors.text }}>
          {auctionData?.name || 'Live Auction Control'}
        </h1>
        <Badge variant="danger">⚡ LIVE</Badge>
      </div>

      {/* Main Grid */}
      <div style={gridStyles} className="admin-bidding-grid">
        {/* Left Column - Items & Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Auction Items */}
          <Card padding="lg" hover={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <CardTitle>Auction Items</CardTitle>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: selectedRegion === region ? colors.brand.primary : colors.highlight,
                      color: selectedRegion === region ? '#fff' : colors.text,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {auctionData?.items
                ?.filter((item) => item?.region === selectedRegion)
                .map((item) => (
                  <button
                    key={item.id}
                    style={itemButtonStyles(activeItem?.id === item.id, item.sold_to)}
                    onClick={() => handleSelectItem(item)}
                    title={item.sold_to ? `Sold to ${item.bids?.[0]?.user?.name} for $${item.sold_amount}` : ''}
                  >
                    <span>#{item.seed} {item.name}</span>
                    {item.sold_to && <span style={{ color: '#10B981' }}>✓</span>}
                  </button>
                ))}
            </div>
          </Card>

          {/* Auction Members */}
          <Card padding="lg" hover={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <CardTitle>Members</CardTitle>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                style={{ width: '150px', fontSize: '0.75rem' }}
              />
            </div>

            {hasStarted && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: colors.highlight, borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.text }}>
                  Bidding for: {userOnBid ? (
                    <strong style={{ color: colors.brand.primary }}>{userOnBid.name}</strong>
                  ) : (
                    <span style={{ color: '#EF4444' }}>(Select a member)</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input
                    ref={bidInputRef}
                    type="number"
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                    min={1}
                  />
                  <Button
                    variant="primary"
                    onClick={() => handlePlaceBid(customBidAmount, userOnBid?.id)}
                    disabled={isBidding || !hasStarted}
                  >
                    {isBidding ? '...' : 'Bid'}
                  </Button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {filteredUsers.map((member) => {
                const isOnline = auctionData?.joined_users?.find((d) => d.user_id === member.id);
                return (
                  <div
                    key={member.id}
                    style={memberCardStyles(userOnBid?.id === member.id, isOnline)}
                    onClick={() => setUserOnBid(userOnBid?.id === member.id ? null : member)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isOnline ? '#10B98130' : colors.highlight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOnline ? '#10B981' : colors.text,
                        fontSize: '0.75rem',
                      }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>{member.name}</div>
                        <div style={{ fontSize: '0.625rem', color: colors.text, opacity: 0.6 }}>ID: {member.id}</div>
                      </div>
                    </div>
                    {isOnline && <Badge variant="success" style={{ fontSize: '0.625rem' }}>Online</Badge>}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column - Bidding Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Live Stream */}
          <Card padding="lg" hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span>📹</span>
              <CardTitle>Live Stream</CardTitle>
              {hasStarted && <Badge variant="danger">LIVE</Badge>}
            </div>
            <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${colors.border}`, backgroundColor: '#000' }}>
              {auctionData?.stream_url ? (
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <ReactPlayer
                    url={auctionData.stream_url}
                    playing
                    controls
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#fff', opacity: 0.5 }}>
                  No stream URL set
                </div>
              )}
            </div>
          </Card>

          {/* Bidding Controls */}
          <Card padding="lg" hover={false}>
            <CardTitle style={{ marginBottom: '1rem' }}>Bidding Details</CardTitle>

            {activeItem ? (
              <>
                {/* Current Item */}
                <div style={{ backgroundColor: colors.highlight, borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>Current Item</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text }}>
                        #{activeItem.seed} {activeItem.name} - {activeItem.region}
                      </div>
                      <Badge variant={hasStarted ? 'success' : 'warning'}>
                        {hasStarted ? 'Bidding Active' : 'Not Started'}
                      </Badge>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>Highest Bidder</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>
                        {activeItem.bids?.[0]?.user?.name || 'No Bids Yet'}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
                        ${activeItem.bids?.[0] ? Number(activeItem.bids[0].bid_amount).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Button
                    variant="primary"
                    onClick={handleStart}
                    disabled={hasStarted || !activeItem.id}
                    style={{ flex: 1, backgroundColor: '#10B981' }}
                  >
                    ▶️ Start Bidding
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEndAuction}
                    disabled={!hasStarted}
                    style={{ flex: 1, borderColor: '#EF4444', color: '#EF4444' }}
                  >
                    ⏹️ End Bidding
                  </Button>
                </div>

                {/* Bid Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={statBoxStyles(colors.highlight)}>
                    <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>Starting Bid</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text }}>${activeItem.starting_bid}</div>
                  </div>
                  <div style={statBoxStyles(colors.highlight)}>
                    <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>Min Increment</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text }}>${activeItem.minimum_bid}</div>
                  </div>
                  <div style={statBoxStyles('#10B98120')}>
                    <div style={{ fontSize: '0.75rem', color: '#10B981' }}>Next Min Bid</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10B981' }}>${currentBidAmount}</div>
                  </div>
                </div>

                {/* Bid History */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: colors.text }}>Bid History</span>
                    {activeItem.bids?.length > 0 && <Badge variant="default">{activeItem.bids.length}</Badge>}
                  </div>

                  {activeItem.bids?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: colors.highlight, borderRadius: '0.75rem', color: colors.text, opacity: 0.6 }}>
                      No bids yet
                    </div>
                  ) : (
                    <div style={{ border: `1px solid ${colors.border}`, borderRadius: '0.75rem', overflow: 'hidden', maxHeight: '250px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: colors.highlight }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: colors.text }}>Amount</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: colors.text }}>Bidder</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: colors.text }}>Time</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: colors.text }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeItem.bids?.map((bid, i) => (
                            <tr
                              key={bid.id}
                              style={{
                                backgroundColor: recentBid?.id === bid.id ? '#10B98120' : 'transparent',
                                borderBottom: `1px solid ${colors.border}`,
                              }}
                            >
                              <td style={{ padding: '0.75rem', fontWeight: 600, color: '#10B981' }}>
                                ${Number(bid.bid_amount).toFixed(2)}
                              </td>
                              <td style={{ padding: '0.75rem', color: colors.text }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span>👤</span>
                                  <div>
                                    <div style={{ fontWeight: 500 }}>{bid.user?.name}</div>
                                    <div style={{ fontSize: '0.625rem', opacity: 0.6 }}>ID: {bid.user_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem', color: colors.text, opacity: 0.7 }}>
                                {moment(bid.created_at).format('MMM DD, h:mm A')}
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                {i === 0 && (
                                  <button
                                    onClick={() => handleRemoveBid(bid.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#EF4444',
                                      fontSize: '1rem',
                                    }}
                                    title="Remove Bid"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: colors.highlight, borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👆</div>
                <div style={{ color: colors.text, opacity: 0.6 }}>Select an item from the list to start bidding</div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <style>{`
        .admin-bidding-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 1024px) {
          .admin-bidding-grid {
            grid-template-columns: 400px 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBidding;
