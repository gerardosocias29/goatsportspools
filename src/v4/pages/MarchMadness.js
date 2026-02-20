import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import PageLoader from '../components/common/PageLoader';
import AuctionStatusBadge from '../components/auction/AuctionStatusBadge';
import useAuction from '../hooks/useAuction';

const MarchMadness = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUserContext();
  const { fetchLiveAuction, fetchUpcoming, fetchMyItems, joinAuction } = useAuction();

  const [liveAuction, setLiveAuction] = useState(null);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      setLoading(true);
      const [live, upcoming, items] = await Promise.all([
        fetchLiveAuction(),
        fetchUpcoming(),
        isSignedIn ? fetchMyItems() : Promise.resolve([]),
      ]);
      setLiveAuction(live);
      setUpcomingAuctions(upcoming || []);
      setMyItems(items || []);
      setLoading(false);
    };
    load();
  }, [isLoaded, isSignedIn, fetchLiveAuction, fetchUpcoming, fetchMyItems]);

  const handleJoinLive = async () => {
    if (!isSignedIn) {
      navigate('/v4/sign-in?redirect_url=/v4/march-madness');
      return;
    }
    if (!liveAuction) return;
    setJoining(true);
    await joinAuction(liveAuction.id);
    navigate(`/v4/march-madness/live?auction_id=${liveAuction.id}`);
    setJoining(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          NCAA Basketball Auction
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
          Bid on NCAA basketball teams in live auctions. Watch the livestream and compete with other fans to build the ultimate tournament roster!
        </p>
      </div>

      {/* Live Auction Banner */}
      {liveAuction && Object.keys(liveAuction).length > 0 && (
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border-2 border-error-400 bg-gradient-to-r from-error-50 to-brand-50 dark:from-error-500/10 dark:to-brand-500/10 dark:border-error-500/50 p-6 md:p-8">
            {/* Pulsing background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-error-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-error-600 px-3 py-1 text-xs font-bold !text-white uppercase tracking-wider shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Live Now
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{liveAuction.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {liveAuction.event_date
                    ? new Date(liveAuction.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                    : ''}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    {liveAuction.items?.length || 0} Teams
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    {liveAuction.members?.length || 0} Participants
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleJoinLive}
                  disabled={joining}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold !text-white bg-error-600 hover:bg-error-700 shadow-lg shadow-error-500/30 transition-all hover:shadow-xl hover:shadow-error-500/40 disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'Join Live Auction'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Auctions */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Upcoming Auctions</h2>
        {upcomingAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingAuctions.map((auction) => (
              <div key={auction.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-theme-md hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <AuctionStatusBadge status={auction.status} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2">{auction.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {auction.event_date
                    ? new Date(auction.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                    : ''}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-5">
                  <span>{auction.items?.length || 0} Teams</span>
                </div>
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                >
                  Starts {auction.event_date ? new Date(auction.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming auctions at the moment</p>
            </div>
          </div>
        )}
      </div>

      {/* My Won Items */}
      {isSignedIn && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">My Won Items</h2>
          {myItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-800 dark:text-white/90">{item.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                      Won
                    </span>
                  </div>
                  {item.seed && item.region && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      #{item.seed} Seed — {item.region}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Winning Bid</span>
                    <span className="text-lg font-bold text-success-600 dark:text-success-400">
                      ${item.sold_amount ? Number(item.sold_amount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.02 6.02 0 01-7.54 0" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">No won items yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Join an auction to start bidding!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sign In Prompt (not signed in) */}
      {!isSignedIn && isLoaded && (
        <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10 p-8 text-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Sign in to participate</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Create an account or sign in to join auctions and bid on teams.
          </p>
          <button
            onClick={() => navigate('/v4/sign-in?redirect_url=/v4/march-madness')}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            Sign In
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MarchMadness;
