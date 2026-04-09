import React from 'react';

const ROUND_LABELS = { 1: 'R1', 2: 'R2', 3: 'Conf. Finals', 4: 'Champion' };
const GAMES_LABELS = { 4: '4-0', 5: '4-1', 6: '4-2', 7: '4-3' };

const FinalizeConfirmModal = ({ picks, seeds, seedMap, onConfirm, onCancel }) => {
  const getTeam = (teamId) => {
    const seed = seeds.find((s) => (s.team_id || s.team?.id) === teamId);
    return seed?.team || seed || {};
  };

  const getSeed = (teamId) => {
    const info = seedMap[teamId];
    return info?.seed || '?';
  };

  const sortedPicks = [...picks].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    if (a.conference === 'East' && b.conference === 'West') return -1;
    if (a.conference === 'West' && b.conference === 'East') return 1;
    return 0;
  });

  const missingGames = picks.filter((p) => p.picked_games === null);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-3">
            <span className="text-2xl">🏀</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Finalize Bracket?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review your picks below. <strong className="text-error-500">This cannot be undone.</strong>
          </p>
        </div>

        {/* Picks grid */}
        <div className="space-y-1 mb-5">
          {sortedPicks.map((pick, i) => {
            const team = getTeam(pick.picked_team_id);
            const teamName = team?.nickname || team?.name || 'Unknown';
            const teamLogo = team?.image_url;
            const seed = getSeed(pick.picked_team_id);

            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  pick.round === 4
                    ? 'bg-brand-50 border border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase w-12 flex-shrink-0 ${
                  pick.round === 4 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {ROUND_LABELS[pick.round]}
                </span>
                {pick.conference && (
                  <span className={`text-[10px] font-bold w-6 flex-shrink-0 ${
                    pick.conference === 'East' ? 'text-blue-500' : 'text-red-500'
                  }`}>
                    {pick.conference === 'East' ? 'E' : 'W'}
                  </span>
                )}
                {!pick.conference && <span className="w-6 flex-shrink-0" />}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 w-4">{seed}</span>
                  {teamLogo ? (
                    <img src={teamLogo} alt={teamName} className="w-5 h-5 object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{teamName}</span>
                </div>
                <span className={`text-[10px] font-bold flex-shrink-0 ${
                  pick.picked_games ? 'text-brand-500' : 'text-error-500'
                }`}>
                  {pick.picked_games ? GAMES_LABELS[pick.picked_games] : 'No games'}
                </span>
              </div>
            );
          })}
        </div>

        {missingGames.length > 0 && (
          <div className="rounded-lg bg-error-50 border border-error-200 p-3 mb-5 dark:bg-error-500/10 dark:border-error-500/30">
            <p className="text-xs font-semibold text-error-600 dark:text-error-400">
              {missingGames.length} pick(s) are missing a games prediction. Set all to finalize.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={missingGames.length > 0 || picks.length !== 15}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-sm !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalize Bracket
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizeConfirmModal;
