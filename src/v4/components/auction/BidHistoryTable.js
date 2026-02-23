import React, { useEffect, useRef, useState } from 'react';

const BidHistoryTable = React.memo(({
  bids = [],
  currentUserId,
  members = [],
  showRemove = false,
  onRemoveBid,
}) => {
  const [flashBidId, setFlashBidId] = useState(null);
  const prevBidsLenRef = useRef(bids.length);

  // Flash green on new bid
  useEffect(() => {
    if (bids.length > prevBidsLenRef.current && bids.length > 0) {
      const newestBid = bids[0];
      setFlashBidId(newestBid.id);
      const timer = setTimeout(() => setFlashBidId(null), 2000);
      return () => clearTimeout(timer);
    }
    prevBidsLenRef.current = bids.length;
  }, [bids]);

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <svg className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm text-gray-400 dark:text-gray-500">No bids yet</p>
      </div>
    );
  }

  const getBidderName = (bid) => {
    if (bid.user?.name) return bid.user.name;
    const member = members.find((m) => m.user_id === bid.user_id);
    return member?.user?.name || 'Unknown';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] max-h-[320px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Bidder
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Time
            </th>
            {showRemove && (
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {bids.map((bid, index) => {
            const isCurrentUser = bid.user_id === currentUserId;
            const isFlashing = flashBidId === bid.id;

            return (
              <tr
                key={bid.id || index}
                className={`transition-colors duration-500 ${
                  isFlashing
                    ? 'bg-success-50 dark:bg-success-500/10'
                    : isCurrentUser
                    ? 'bg-brand-50/50 dark:bg-brand-500/5'
                    : ''
                }`}
              >
                <td className="px-4 py-3 font-bold text-success-600 dark:text-success-400">
                  ${Number(bid.bid_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {getBidderName(bid).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${isCurrentUser ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {getBidderName(bid)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                  {new Date(bid.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </td>
                {showRemove && (
                  <td className="px-4 py-3 text-right">
                    {index === 0 && (
                      <button
                        onClick={() => onRemoveBid?.(bid.id)}
                        className="p-1.5 rounded-lg text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                        title="Remove bid"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

BidHistoryTable.displayName = 'BidHistoryTable';
export default BidHistoryTable;
