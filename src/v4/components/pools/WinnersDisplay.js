import React, { useState } from 'react';
import { useUserContext } from '../../contexts/UserContext';
import Modal from '../admin/common/Modal';

const WinnersDisplay = ({ pool, winners = [], game }) => {
  const { user, isSuperadmin } = useUserContext();
  const [proofModal, setProofModal] = useState({ open: false, image: null });
  const currentUserId = user?.id ? parseInt(user.id) : null;
  if (!winners || winners.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0013.125 11h-.25A3.375 3.375 0 009.5 14.25v4.5m6-9V6.375A3.375 3.375 0 0012.125 3h-.25A3.375 3.375 0 008.5 6.375V9.5" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          No winners calculated yet. Winners will appear once game scores are entered.
        </p>
      </div>
    );
  }

  const getQuarterLabel = (quarter) => {
    const labels = {
      'Q1': '1st Quarter',
      'Q2': '2nd Quarter',
      'Half': 'Halftime',
      'Q3': '3rd Quarter',
      'Q4': '4th Quarter',
      'Final': 'Final Score',
    };
    return labels[quarter] || quarter;
  };

  const getQuarterScores = (quarter) => {
    if (!game) return null;
    const map = {
      'Q1': { home: game.q1_home, visitor: game.q1_visitor },
      'Q2': { home: game.half_home, visitor: game.half_visitor },
      'Half': { home: game.half_home, visitor: game.half_visitor },
      'Q3': { home: game.q3_home, visitor: game.q3_visitor },
      'Q4': { home: game.final_home, visitor: game.final_visitor },
      'Final': { home: game.final_home, visitor: game.final_visitor },
    };
    return map[quarter];
  };

  const getLastDigit = (score) => {
    if (score === null || score === undefined) return '?';
    return score % 10;
  };

  // Group and sort winners by quarter
  const winnersByQuarter = winners.reduce((acc, w) => {
    let q = w.quarter || w.Quarter;
    if (typeof q === 'number') {
      q = q === 2 ? 'Half' : q === 4 ? 'Final' : `Q${q}`;
    }
    if (!acc[q]) acc[q] = [];
    acc[q].push(w);
    return acc;
  }, {});

  const quarterOrder = ['Q1', 'Half', 'Q3', 'Final'];
  const sortedQuarters = quarterOrder.filter(q => winnersByQuarter[q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0013.125 11h-.25A3.375 3.375 0 009.5 14.25v4.5m6-9V6.375A3.375 3.375 0 0012.125 3h-.25A3.375 3.375 0 008.5 6.375V9.5" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Winners
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedQuarters.map(quarter => {
          const qWinners = winnersByQuarter[quarter];
          const scores = getQuarterScores(quarter);

          return (
            <div
              key={quarter}
              className="rounded-2xl overflow-hidden border-2 border-brand-500 dark:border-brand-500/60"
            >
              {/* Quarter header */}
              <div className="px-4 py-3 bg-brand-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold !text-white">
                    {getQuarterLabel(quarter)}
                  </h3>
                  {scores && scores.home !== null && scores.visitor !== null && (
                    <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-lg">
                      <span className="!text-white font-bold text-sm">
                        {scores.home} - {scores.visitor}
                      </span>
                    </div>
                  )}
                </div>
                {scores && scores.home !== null && scores.visitor !== null && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-white/80 text-xs">Winning #:</span>
                    <div className="flex gap-1.5">
                      <div className="bg-white/30 px-2 py-0.5 rounded font-bold !text-white text-xs">
                        {getLastDigit(scores.visitor)}
                      </div>
                      <span className="!text-white text-xs">-</span>
                      <div className="bg-white/30 px-2 py-0.5 rounded font-bold !text-white text-xs">
                        {getLastDigit(scores.home)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Winner info */}
              <div className="p-4 bg-white dark:bg-gray-900">
                {qWinners.map((w, idx) => {
                  const winnerId = w.player_id ? parseInt(w.player_id) : null;
                  const isCurrentUser = currentUserId && winnerId && currentUserId === winnerId;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between ${
                        isCurrentUser ? 'p-2 -mx-2 rounded-xl bg-success-50/50 dark:bg-success-500/5 ring-1 ring-success-200 dark:ring-success-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          w.player_id ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'
                        }`}>
                          {w.player_id ? (
                            <span className="text-lg">👑</span>
                          ) : (
                            <svg className="w-5 h-5 !text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0013.125 11h-.25A3.375 3.375 0 009.5 14.25v4.5m6-9V6.375A3.375 3.375 0 0012.125 3h-.25A3.375 3.375 0 008.5 6.375V9.5" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${w.player_id ? 'text-gray-900 dark:text-white' : 'text-error-500'}`}>
                            {w.player_id
                              ? (w.player_name || w.player?.name || 'Unknown')
                              : 'No Winner (Unclaimed)'}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-xs font-medium text-success-600 dark:text-success-400">(You!)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${w.player_id ? 'text-brand-500' : 'text-error-500'}`}>
                          {(() => { const v = parseFloat(w.prize_amount || w.win_amount || 0); return v % 1 === 0 ? v.toFixed(0) : v.toFixed(2); })()}
                        </p>
                        {w.player_id && (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              w.is_paid
                                ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                                : 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500'
                            }`}>
                              {w.is_paid ? 'Paid' : 'Pending'}
                            </span>
                            {w.is_paid && w.proof_image && (isCurrentUser || isSuperadmin) && (
                              <button
                                onClick={() => setProofModal({ open: true, image: w.proof_image })}
                                className="text-brand-500 hover:text-brand-600 text-xs font-medium transition-colors"
                              >
                                Proof
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof Image Modal */}
      <Modal
        isOpen={proofModal.open}
        onClose={() => setProofModal({ open: false, image: null })}
        title="Proof of Transfer"
        maxWidth="max-w-lg"
      >
        {proofModal.image && (
          <img
            src={proofModal.image}
            alt="Proof of transfer"
            className="w-full rounded-xl"
          />
        )}
      </Modal>
    </div>
  );
};

export default WinnersDisplay;
