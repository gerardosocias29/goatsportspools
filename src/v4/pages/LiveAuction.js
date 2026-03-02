import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { usePusher } from '../contexts/PusherContext';
import PageLoader from '../components/common/PageLoader';
import StreamEmbed from '../components/auction/StreamEmbed';
import RegionItemGrid from '../components/auction/RegionItemGrid';
import BidHistoryTable from '../components/auction/BidHistoryTable';
import useAuction from '../hooks/useAuction';

const LiveAuction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction_id');
  const { user, isSignedIn } = useUserContext();
  const { channel } = usePusher();

  const {
    fetchAuctionById,
    joinAuction,
    leaveAuction,
    placeBid,
    fetchActiveItem,
    fetchMembers,
  } = useAuction();

  // State
  const [event, setEvent] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [currentBidAmount, setCurrentBidAmount] = useState(1);
  const [customBidAmount, setCustomBidAmount] = useState(1);
  const [isBidding, setIsBidding] = useState(false);
  const [bidMessage, setBidMessage] = useState(null);
  const [isUserWinning, setIsUserWinning] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('East');

  // Initial data fetch
  useEffect(() => {
    if (!auctionId) {
      navigate('/march-madness');
      return;
    }
    if (!isSignedIn) {
      navigate(`/sign-in?redirect_url=/march-madness/live?auction_id=${auctionId}`);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // Join auction
      await joinAuction(auctionId);

      // Get auction details
      const data = await fetchAuctionById(auctionId);
      setEvent(data);

      if (data?.active_item_id) {
        const matchedItem = data.items?.find((e) => e.id === data.active_item_id) || null;
        setActiveItem(matchedItem);
      }

      // Get members
      const memberData = await fetchMembers(auctionId);
      setMembers(memberData);

      setLoading(false);
    };

    fetchData();

    // Handle page unload — leave auction
    const handleUnload = () => {
      if (user?.id) {
        const url = `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/${user.id}/leave`;
        navigator.sendBeacon(url);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  // Update bid amounts when active item changes
  useEffect(() => {
    if (activeItem) {
      if (activeItem.bids?.length > 0) {
        const nextBid = activeItem.minimum_bid + (activeItem.bids[0]?.bid_amount || 0);
        setCurrentBidAmount(nextBid);
        setCustomBidAmount(nextBid);
        // eslint-disable-next-line eqeqeq
        setIsUserWinning(activeItem.bids[0].user_id == user?.id);
      } else {
        setCurrentBidAmount(activeItem.starting_bid);
        setCustomBidAmount(activeItem.starting_bid);
        setIsUserWinning(false);
      }
    }
  }, [activeItem, user?.id]);

  // Handle active item change from Pusher (item start/end — still needs API refetch)
  const handleActiveItem = useCallback(async (data) => {
    let auction_item_id = data.auction_item_id ?? data.data;

    if (auction_item_id === undefined || auction_item_id === 0) {
      setActiveItem(null);
      setCurrentBidAmount(0);
      setCustomBidAmount(0);
      setIsUserWinning(false);

      const refreshed = await fetchAuctionById(auctionId);
      setEvent(refreshed);
      return;
    }

    const itemData = await fetchActiveItem(auctionId, auction_item_id);
    if (itemData) {
      setActiveItem(itemData);
    } else {
      setActiveItem(null);
    }
  }, [auctionId, fetchAuctionById, fetchActiveItem]);

  // Handle new bid from Pusher — use payload directly for instant updates (no API round-trip)
  const handleNewBid = useCallback((data) => {
    // data is the full bid object: { id, auction_item_id, user_id, bid_amount, user, created_at }
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
    setMembers(memberData);
  }, [auctionId, fetchMembers]);

  // Pusher event listeners
  useEffect(() => {
    if (!channel) return;

    channel.bind('active-item-event', handleActiveItem);
    channel.bind('bid-event', handleNewBid);
    channel.bind('auction-members', handleAuctionMembers);

    const handleAuctionEnd = (data) => {
      if (data.status !== 'live') {
        navigate('/march-madness');
      }
    };
    channel.bind('active-auction-event-all', handleAuctionEnd);

    return () => {
      channel.unbind('active-item-event', handleActiveItem);
      channel.unbind('bid-event', handleNewBid);
      channel.unbind('auction-members', handleAuctionMembers);
      channel.unbind('active-auction-event-all', handleAuctionEnd);
    };
  }, [channel, handleActiveItem, handleNewBid, handleAuctionMembers, navigate]);

  // Place bid
  const handlePlaceBid = async (customAmount = 0) => {
    setIsBidding(true);
    setBidMessage(null);
    const amount = customAmount || currentBidAmount;
    const result = await placeBid(auctionId, activeItem.id, amount);
    if (result.status === false) {
      setBidMessage({ type: 'error', text: result.message });
      setTimeout(() => setBidMessage(null), 5000);
    } else if (result.winning) {
      setIsUserWinning(true);
    }
    setIsBidding(false);
  };

  // Leave and go back
  const handleBack = async () => {
    if (user?.id) {
      await leaveAuction(auctionId, user.id);
    }
    navigate('/march-madness');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">{event?.name || 'Live Auction'}</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error-600 px-2.5 py-1 text-xs font-bold !text-white uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN: Stream + Items ─── */}
        <div className="flex flex-col gap-5">
          {/* Stream */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Live Stream</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-error-600 px-2 py-0.5 text-[10px] font-bold !text-white uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            </div>
            <StreamEmbed url={event?.stream_url} showLiveBadge />
          </div>

          {/* Auction Items */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Auction Items</h3>
            <RegionItemGrid
              items={event?.items || []}
              activeItemId={activeItem?.id}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              readOnly
            />
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Bidding Interface ─── */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sticky top-24">
            <div className="p-5 border-b border-gray-100 dark:border-white/[0.05]">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Item on Bid</h3>
            </div>

            {activeItem ? (
              <div className="p-5">
                {/* Active Item Name */}
                <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">
                  #{activeItem.seed} {activeItem.description || ''} {activeItem.name} — {activeItem.region}
                </h4>

                {/* Bid Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Starting Bid</div>
                    <div className="text-base font-bold text-gray-800 dark:text-white/90">${Number(activeItem.starting_bid).toFixed(2)}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Min Increment</div>
                    <div className="text-base font-bold text-gray-800 dark:text-white/90">${Number(activeItem.minimum_bid).toFixed(2)}</div>
                  </div>
                  <div className="rounded-xl bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30 p-3 text-center">
                    <div className="text-[11px] font-semibold text-success-600 dark:text-success-400 mb-1">Current Bid</div>
                    <div className="text-base font-extrabold text-success-600 dark:text-success-400">
                      {activeItem.bids?.length > 0 ? `$${Number(activeItem.bids[0].bid_amount).toFixed(2)}` : '-'}
                    </div>
                  </div>
                </div>

                {/* Winning Alert */}
                {isUserWinning && (
                  <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30 animate-pulse">
                    <svg className="w-6 h-6 text-success-600 dark:text-success-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-success-700 dark:text-success-400">You are winning this item!</span>
                  </div>
                )}

                {/* Bid Message */}
                {bidMessage && (
                  <div className={`flex items-center gap-2 p-3.5 mb-4 rounded-xl text-sm font-medium ${
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

                {/* Quick Bid Button */}
                <button
                  onClick={() => handlePlaceBid()}
                  disabled={isBidding}
                  className="w-full py-3.5 rounded-xl text-base font-bold !text-white bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 mb-4"
                >
                  {isBidding ? 'Placing Bid...' : `Bid $${Number(currentBidAmount).toFixed(2)}`}
                </button>

                {/* Custom Bid */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="number"
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(parseFloat(e.target.value))}
                    min={currentBidAmount}
                    step="1"
                    className="h-11 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="Custom bid amount"
                  />
                  <button
                    onClick={() => handlePlaceBid(customBidAmount)}
                    disabled={isBidding}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 disabled:opacity-50 transition"
                  >
                    Submit
                  </button>
                </div>

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
                    currentUserId={user?.id}
                    members={members}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Waiting for the auctioneer...</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">The next item will appear here when bidding starts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuction;
