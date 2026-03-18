import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePusher } from '../../contexts/PusherContext';
import PageLoader from '../../components/common/PageLoader';
import StreamEmbed from '../../components/auction/StreamEmbed';
import RegionItemGrid from '../../components/auction/RegionItemGrid';
import BidHistoryTable from '../../components/auction/BidHistoryTable';
import useAuction from '../../hooks/useAuction';

const LiveBidding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction_id');
  const { channel } = usePusher();
  const bidInputRef = useRef(null);

  const {
    fetchAuctionById,
    fetchAuctionUsers,
    setActiveItemOnServer,
    endActiveItem,
    placeBidAdmin,
    removeBid,
    fetchActiveItem,
    fetchMembers,
  } = useAuction();

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
  const [bidMessage, setBidMessage] = useState(null);

  // User state
  const [users, setUsers] = useState([]);
  const [userOnBid, setUserOnBid] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  useEffect(() => {
    if (!auctionId) {
      navigate('/admin/auctions');
      return;
    }

    const load = async () => {
      setLoading(true);
      const data = await fetchAuctionById(auctionId);
      setAuctionData(data);

      if (data?.active_item_id) {
        const matchedItem = data.items?.find((e) => e.id === data.active_item_id) || null;
        setActiveItem(matchedItem);
        if (matchedItem) setHasStarted(true);
      }

      const allUsers = await fetchAuctionUsers(auctionId);
      setUsers(allUsers);
      setLoading(false);
    };
    load();
  }, [auctionId, fetchAuctionById, fetchAuctionUsers, navigate]);

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

  // Pusher events — use bid payload directly for instant updates (no API round-trip)
  const handleNewBid = useCallback((data) => {
    // data is the full bid object from Pusher: { id, auction_item_id, user_id, bid_amount, user, created_at }
    const newBid = data;
    // eslint-disable-next-line eqeqeq
    const itemId = newBid.auction_item_id || newBid.data;
    if (!itemId) return;

    setActiveItem((prev) => {
      // eslint-disable-next-line eqeqeq
      if (!prev || prev.id != itemId) return prev;
      // Dedupe: skip if bid already exists
      if (prev.bids?.some((b) => b.id === newBid.id)) return prev;
      // Insert bid sorted by bid_amount desc
      const updatedBids = [newBid, ...(prev.bids || [])].sort(
        (a, b) => Number(b.bid_amount) - Number(a.bid_amount)
      );
      return { ...prev, bids: updatedBids };
    });
  }, []);

  const handleAuctionMembers = useCallback(async () => {
    const memberData = await fetchMembers(auctionId);
    setAuctionData((prev) => prev ? { ...prev, joined_users: memberData } : null);
  }, [auctionId, fetchMembers]);

  useEffect(() => {
    if (!channel) return;

    channel.bind('bid-event', handleNewBid);
    channel.bind('auction-members', handleAuctionMembers);

    return () => {
      channel.unbind('bid-event', handleNewBid);
      channel.unbind('auction-members', handleAuctionMembers);
    };
  }, [channel, handleNewBid, handleAuctionMembers]);

  // Actions
  const handlePlaceBid = async (customAmount = 0, userId = null) => {
    if (!activeItem) return;
    setIsBidding(true);
    setBidMessage(null);
    const amount = customAmount || currentBidAmount;
    const result = await placeBidAdmin(auctionId, activeItem.id, amount, userId);
    if (result.status === false) {
      setBidMessage({ type: 'error', text: result.message });
      setTimeout(() => setBidMessage(null), 5000);
    }
    setIsBidding(false);
  };

  const handleStart = async () => {
    if (!activeItem) return;
    setStartedItem(activeItem);
    const result = await setActiveItemOnServer(auctionId, activeItem.id);
    if (result.status) setHasStarted(true);
  };

  const handleEndAuction = async () => {
    if (!activeItem) return;
    const soldTo = activeItem.bids?.length > 0 ? activeItem.bids[0].user_id : 0;
    const soldAmount = activeItem.bids?.length > 0 ? activeItem.bids[0].bid_amount : 0;
    await endActiveItem(auctionId, activeItem.id, soldTo, soldAmount);
    setStartedItem(null);
    setActiveItem(null);
    setHasStarted(false);
    const refreshed = await fetchAuctionById(auctionId);
    setAuctionData(refreshed);
  };

  const handleRemoveBid = async (bidId) => {
    await removeBid(bidId);
    // Refetch after removal since Pusher bid-event only covers new bids
    if (activeItem) {
      const itemData = await fetchActiveItem(auctionId, activeItem.id);
      if (itemData) setActiveItem(itemData);
    }
  };

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
    (user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.id?.toString().includes(searchTerm)
  );

  const getBidderName = (bid) => {
    // Primary: use bid's own user relation (loaded by API)
    if (bid.user?.name) return bid.user.name;
    // Fallback: joined_users lookup
    // eslint-disable-next-line eqeqeq
    const member = (auctionData?.joined_users || []).find((m) => m.user_id == bid.user_id);
    if (member?.user?.name) return member.user.name;
    // Fallback: users list
    // eslint-disable-next-line eqeqeq
    const user = users.find((u) => u.id == bid.user_id);
    return user?.name || '-';
  };

  const canEnd = activeItem?.bids?.[0]?.user_id !== 1;

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/auctions')}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">Live Auction Control</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error-600 px-2.5 py-1 text-xs font-bold !text-white uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-5">
        {/* ─── LEFT COLUMN ─── */}
        <div className="flex flex-col gap-5">
          {/* Auction Items Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Auction Items</h3>
            <RegionItemGrid
              items={auctionData?.items || []}
              activeItemId={activeItem?.id}
              onSelectItem={handleSelectItem}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </div>

          {/* Auction Members Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Members</h3>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="h-9 w-40 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            {/* Bid for member panel */}
            {hasStarted && (
              <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30">
                <div className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                  Bidding for:{' '}
                  {userOnBid ? (
                    <span className="inline-flex items-center gap-1.5">
                      <strong className="text-brand-500">{userOnBid.name}</strong>
                      <button onClick={() => setUserOnBid(null)} className="text-error-500 hover:text-error-600 text-xs font-bold">x</button>
                    </span>
                  ) : (
                    <span className="text-error-500 font-semibold text-xs">(Select a member)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    ref={bidInputRef}
                    type="number"
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(parseFloat(e.target.value))}
                    min={1}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                    className="h-10 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                  <button
                    onClick={() => handlePlaceBid(customBidAmount, userOnBid?.id)}
                    disabled={isBidding || !hasStarted}
                    className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-success-500 hover:bg-success-600 transition disabled:opacity-50"
                  >
                    {isBidding ? '...' : 'Place Bid'}
                  </button>
                </div>
              </div>
            )}

            {/* Member Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {filteredUsers.length > 0 ? filteredUsers.map((member) => {
                // eslint-disable-next-line eqeqeq
                const isOnline = auctionData?.joined_users?.find((d) => d.user_id == member.id);
                const isSelected = userOnBid?.id === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setUserOnBid(isSelected ? null : member)}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-500/50'
                        : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isOnline
                          ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      }`}>
                        {member.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{member.name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">ID: {member.id}</div>
                      </div>
                    </div>
                    {isOnline && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400 flex-shrink-0">
                        Online
                      </span>
                    )}
                  </button>
                );
              }) : (
                <div className="col-span-2 text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                  No members match your search
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="flex flex-col gap-5">
          {/* Bidding Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Bidding Details</h3>
            </div>

            {activeItem ? (
              <>
                {/* Current Item Info */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 mb-5">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Current Item</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white/90 mb-1.5">
                        #{activeItem.seed} {activeItem.ncaa_team?.school || activeItem.description || ''} {activeItem.ncaa_team?.nickname || activeItem.name} — {activeItem.region}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        hasStarted
                          ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400'
                          : 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400'
                      }`}>
                        {hasStarted ? 'Bidding Active' : 'Not Started'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Highest Bidder</div>
                      <div className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                        {activeItem.bids?.[0] ? getBidderName(activeItem.bids[0]) : 'No Bids Yet'}
                      </div>
                      <div className="text-2xl font-extrabold text-success-500">
                        ${activeItem.bids?.[0] ? Number(activeItem.bids[0].bid_amount).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {/* Start/End Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleStart}
                      disabled={hasStarted || !activeItem.id}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold !text-white bg-success-500 hover:bg-success-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      Start
                    </button>
                    <button
                      onClick={() => canEnd && handleEndAuction()}
                      disabled={!hasStarted}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                        !canEnd
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                          : 'bg-white text-error-600 ring-1 ring-inset ring-error-300 hover:bg-error-50 dark:bg-gray-800 dark:text-error-400 dark:ring-error-500/30 dark:hover:bg-error-500/10'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title={!canEnd ? 'Cannot end: Last bidder is anonymous' : ''}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                      End
                    </button>
                  </div>

                  {/* Starting Bid */}
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 flex flex-col justify-center">
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Starting Bid</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white/90">${Number(activeItem.starting_bid).toFixed(2)}</div>
                  </div>

                  {/* Min Increment */}
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 flex flex-col justify-center">
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Min Increment</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white/90">${Number(activeItem.minimum_bid).toFixed(2)}</div>
                  </div>

                  {/* Next Min Bid */}
                  {hasStarted && (
                    <div className="rounded-xl bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30 p-3 flex flex-col justify-center">
                      <div className="text-[11px] font-semibold text-success-600 dark:text-success-400 mb-1">Next Min Bid</div>
                      <div className="text-lg font-extrabold text-success-600 dark:text-success-400">${Number(currentBidAmount).toFixed(2)}</div>
                    </div>
                  )}
                </div>

                {/* Bid Message */}
                {bidMessage && (
                  <div className={`flex items-center gap-2 p-3 mb-4 rounded-xl text-sm font-medium ${
                    bidMessage.type === 'error'
                      ? 'bg-error-50 text-error-600 border border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/30'
                      : 'bg-success-50 text-success-600 border border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/30'
                  }`}>
                    <span>{bidMessage.text}</span>
                    <button onClick={() => setBidMessage(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}

                {/* Bid History */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bid History</h4>
                    {activeItem.bids?.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {activeItem.bids.length}
                      </span>
                    )}
                  </div>
                  <BidHistoryTable
                    bids={activeItem.bids || []}
                    members={auctionData?.joined_users || []}
                    showRemove
                    onRemoveBid={handleRemoveBid}
                    isAdmin
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Select an item from the list to start bidding</p>
              </div>
            )}
          </div>

          {/* Stream - only shown when stream URL exists */}
          {auctionData?.stream_url && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Live Stream</h3>
                {hasStarted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-error-600 px-2 py-0.5 text-[10px] font-bold !text-white uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <StreamEmbed url={auctionData.stream_url} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveBidding;
