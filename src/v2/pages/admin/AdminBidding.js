import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import { useToast } from '../../../app/contexts/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ReactPlayer from 'react-player';
import moment from 'moment';

const AdminBidding = ({ channel }) => {
  const { colors, isDark } = useTheme();
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
    <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: colors.background, padding: '1rem 1.5rem' }} className="v2-fade-in">
      {/* Two-column layout: 5/7 ratio like V1 */}
      <div className="admin-bidding-grid" style={{ maxWidth: '1536px', margin: '0 auto' }}>

        {/* ========== LEFT COLUMN - Items & Members ========== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Auction Items Card */}
          <Card padding="lg" hover={false}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate('/admin/auction')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: colors.text, padding: '0.25rem' }}
                  title="Back to Auctions"
                >
                  ←
                </button>
                <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, fontFamily: '"Hubot Sans", sans-serif', color: colors.text }}>
                  Auction Items
                </h2>
              </div>
              {/* Region Dropdown */}
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="h-11 appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  style={{ minWidth: '160px' }}
                >
                  {regions.map((region) => (
                    <option key={region} value={region} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{region}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {auctionData?.items
                ?.filter((item) => item?.region === selectedRegion)
                .map((item) => {
                  const isActive = activeItem?.id === item.id;
                  const isSold = !!item.sold_to;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      title={isSold ? `Sold to ${item.bids?.[0]?.user?.name} for $${Number(item.sold_amount).toFixed(2)}` : ''}
                      style={{
                        padding: '0.625rem 0.75rem',
                        borderRadius: '0.5rem',
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
                        gap: '0.375rem',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{item.seed} {item.description} {item.name}
                      </span>
                      {isSold && <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>}
                    </button>
                  );
                })}
            </div>
          </Card>

          {/* Auction Members Card */}
          <Card padding="lg" hover={false}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, fontFamily: '"Hubot Sans", sans-serif', color: colors.text }}>
                Auction Members
              </h2>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="h-11 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
                style={{ width: '180px' }}
              />
            </div>

            {/* Bid for member panel */}
            {hasStarted && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.875rem',
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'}`,
                borderRadius: '0.5rem',
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.text }}>
                  Bidding for:{' '}
                  {userOnBid ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: colors.brand.primary }}>{userOnBid.name}</strong>
                      <button
                        onClick={() => setUserOnBid(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.875rem', padding: '0 0.25rem' }}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </span>
                  ) : (
                    <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.8rem' }}>(Please select a member)</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    ref={bidInputRef}
                    type="number"
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(parseFloat(e.target.value))}
                    min={1}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="primary"
                    onClick={() => handlePlaceBid(customBidAmount, userOnBid?.id)}
                    disabled={isBidding || !hasStarted}
                    style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
                  >
                    {isBidding ? '...' : 'Place Bid'}
                  </Button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredUsers.length > 0 ? filteredUsers.map((member) => {
                const isOnline = auctionData?.joined_users?.find((d) => d.user_id === member.id);
                const isSelected = userOnBid?.id === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setUserOnBid(isSelected ? null : member)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isSelected ? colors.brand.primary : colors.border}`,
                      backgroundColor: isSelected ? `${colors.brand.primary}15` : colors.card,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isOnline ? (isDark ? '#10B98125' : '#D1FAE5') : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'),
                        color: isOnline ? '#10B981' : (isDark ? '#6B7280' : '#9CA3AF'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        flexShrink: 0,
                      }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, lineHeight: 1.2 }}>{member.name}</div>
                        <div style={{ fontSize: '0.65rem', color: colors.text, opacity: 0.5 }}>ID: {member.id}</div>
                      </div>
                    </div>
                    {isOnline && (
                      <Badge variant="success" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>Online</Badge>
                    )}
                  </div>
                );
              }) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', color: colors.text, opacity: 0.5 }}>
                  No members match your search
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ========== RIGHT COLUMN - Stream + Bidding ========== */}
        <div>
          <Card padding="lg" hover={false}>
            {/* Live Stream Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ color: '#EF4444' }}>📹</span>
                <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, fontFamily: '"Hubot Sans", sans-serif', color: colors.text }}>
                  Live Stream
                </h2>
                {hasStarted && <Badge variant="danger">LIVE</Badge>}
              </div>
              <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                {auctionData?.stream_url ? (
                  <ReactPlayer
                    url={auctionData.stream_url}
                    playing
                    controls
                    width="100%"
                    height="300px"
                    config={{ youtube: { playerVars: { showinfo: 1 } } }}
                  />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', opacity: 0.5 }}>
                    No stream URL set
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: colors.border, margin: '0 0 1.5rem 0' }} />

            {/* Bidding Details Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#10B981' }}>💰</span>
                <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, fontFamily: '"Hubot Sans", sans-serif', color: colors.text }}>
                  Bidding Details
                </h2>
              </div>

              {activeItem ? (
                <>
                  {/* Current Item Info */}
                  <div style={{
                    backgroundColor: colors.highlight,
                    borderRadius: '0.75rem',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.6, marginBottom: '0.25rem' }}>Current Item</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.375rem' }}>
                          #{activeItem.seed} {activeItem.description} {activeItem.name} - {activeItem.region}
                        </div>
                        <Badge variant={hasStarted ? 'success' : 'warning'}>
                          {hasStarted ? 'Bidding Active' : 'Not Started'}
                        </Badge>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.6, marginBottom: '0.25rem' }}>Current Highest Bidder</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.125rem' }}>
                          {activeItem.bids?.[0]?.user?.name || 'No Bids Yet'}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981' }}>
                          ${activeItem.bids?.[0] ? Number(activeItem.bids[0].bid_amount).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Control Panel - 4 column grid like V1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }} className="admin-bidding-controls">
                    {/* Start/End Buttons - stacked */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Button
                        variant="primary"
                        onClick={handleStart}
                        disabled={hasStarted || !activeItem.id}
                        style={{ backgroundColor: '#10B981', borderColor: '#10B981', width: '100%', fontSize: '0.8rem', padding: '0.625rem 0.5rem' }}
                      >
                        ▶ Start
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (activeItem?.bids?.[0]?.user_id !== 1) handleEndAuction();
                        }}
                        disabled={!hasStarted}
                        style={{
                          width: '100%',
                          fontSize: '0.8rem',
                          padding: '0.625rem 0.5rem',
                          borderColor: activeItem?.bids?.[0]?.user_id === 1 ? '#9CA3AF' : '#EF4444',
                          color: activeItem?.bids?.[0]?.user_id === 1 ? '#9CA3AF' : '#EF4444',
                          backgroundColor: activeItem?.bids?.[0]?.user_id === 1 ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
                        }}
                        title={activeItem?.bids?.[0]?.user_id === 1 ? 'Cannot end: Last bidder is anonymous' : ''}
                      >
                        ⏹ End
                      </Button>
                    </div>

                    {/* Starting Bid */}
                    <div style={{
                      backgroundColor: colors.highlight,
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                      <div style={{ fontSize: '0.7rem', color: colors.text, opacity: 0.6, marginBottom: '0.375rem', fontWeight: 500 }}>Starting Bid</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>${Number(activeItem.starting_bid).toFixed(2)}</div>
                    </div>

                    {/* Minimum Bid Increment */}
                    <div style={{
                      backgroundColor: colors.highlight,
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                      <div style={{ fontSize: '0.7rem', color: colors.text, opacity: 0.6, marginBottom: '0.375rem', fontWeight: 500 }}>Min Increment</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>${Number(activeItem.minimum_bid).toFixed(2)}</div>
                    </div>

                    {/* Next Minimum Bid */}
                    {hasStarted && (
                      <div style={{
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0'}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#10B981', marginBottom: '0.375rem', fontWeight: 600 }}>Next Min Bid</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>${Number(currentBidAmount).toFixed(2)}</div>
                      </div>
                    )}
                  </div>

                  {/* Bid History */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1rem' }}>📋</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text }}>Bid History</span>
                      {activeItem.bids?.length > 0 && <Badge variant="default">{activeItem.bids.length}</Badge>}
                    </div>

                    {activeItem.bids?.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        backgroundColor: colors.highlight,
                        borderRadius: '0.75rem',
                        color: colors.text,
                        opacity: 0.5,
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                        No bids have been placed yet.
                      </div>
                    ) : (
                      <div style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        maxHeight: '300px',
                        overflowY: 'auto',
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: colors.highlight }}>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: colors.text, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: colors.text, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bidder</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: colors.text, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: colors.text, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeItem.bids?.map((bid, i) => (
                              <tr
                                key={bid.id}
                                style={{
                                  backgroundColor: recentBid?.id === bid.id ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                                  borderBottom: `1px solid ${colors.border}`,
                                  transition: 'background-color 0.3s ease',
                                }}
                              >
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#10B981' }}>
                                  ${Number(bid.bid_amount).toFixed(2)}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: colors.text }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      flexShrink: 0,
                                    }}>
                                      👤
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{bid.user?.name}</div>
                                      <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>ID: {bid.user_id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: colors.text, opacity: 0.7, fontSize: '0.75rem' }}>
                                  {moment(bid.created_at).format('MMM DD, h:mm A')}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                  {i === 0 && (
                                    <button
                                      onClick={() => handleRemoveBid(bid.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#EF4444',
                                        fontSize: '1rem',
                                        padding: '0.25rem',
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
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  backgroundColor: colors.highlight,
                  borderRadius: '0.75rem',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👆</div>
                  <div style={{ color: colors.text, opacity: 0.6, fontSize: '1rem' }}>Select an item from the list to start bidding</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .admin-bidding-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .admin-bidding-grid {
            grid-template-columns: 5fr 7fr;
          }
        }
        .admin-bidding-controls {
          grid-template-columns: 1fr 1fr;
        }
        @media (min-width: 768px) {
          .admin-bidding-controls {
            grid-template-columns: 1fr 1fr 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBidding;
