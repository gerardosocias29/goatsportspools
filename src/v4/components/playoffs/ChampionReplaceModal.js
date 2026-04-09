import React from 'react';

const ChampionReplaceModal = ({
  conflicts,
  teamId,
  teamConference,
  seeds,
  onConfirm,
  onCancel,
}) => {
  const getTeamName = (tId) => {
    const seed = seeds.find((s) => (s.team_id || s.team?.id) === tId);
    const team = seed?.team || seed;
    return team?.nickname || team?.name || `Team #${tId}`;
  };

  const champTeamName = getTeamName(teamId);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Replace Picks?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Picking <strong className="text-brand-500">{champTeamName}</strong> as Champion requires changes to your <strong>{teamConference}</strong> bracket:
          </p>
        </div>

        <div className="space-y-2 mb-5">
          {conflicts.map((c, i) => {
            const removeName = getTeamName(c.toRemove.picked_team_id);
            const roundLabels = { 1: 'Round 1', 2: 'Round 2', 3: 'Conf. Finals' };
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/5"
              >
                <svg className="w-4 h-4 text-error-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-error-700 dark:text-error-400">
                    {roundLabels[c.round] || `R${c.round}`}: Remove <strong>{removeName}</strong>
                  </p>
                  <p className="text-[10px] text-error-500 dark:text-error-400/70">
                    To make room for {champTeamName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-sm !text-white bg-brand-500 hover:bg-brand-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChampionReplaceModal;
