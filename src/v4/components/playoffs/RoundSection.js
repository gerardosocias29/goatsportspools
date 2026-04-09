import React from 'react';
import TeamPickCard from './TeamPickCard';

const RoundSection = ({
  round,
  conference,
  label,
  subtitle,
  cap,
  candidates,
  picks,
  readOnly,
  onTogglePick,
  onSetGames,
  seedMap,
}) => {
  const currentCount = picks.length;
  const needsUpstream = round >= 2 && candidates.length === 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            {label}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
          currentCount >= cap
            ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {currentCount} / {cap}
        </span>
      </div>

      {/* Empty state */}
      {needsUpstream && (
        <div className="flex items-center justify-center py-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Pick your R{round - 1} winners first
          </p>
        </div>
      )}

      {/* Team cards */}
      {!needsUpstream && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {candidates.map((seed) => {
            const teamId = seed.team_id || seed.team?.id;
            const team = seed.team || seed;
            const isSelected = picks.some((p) => p.picked_team_id === teamId);
            const pick = picks.find((p) => p.picked_team_id === teamId);

            return (
              <TeamPickCard
                key={teamId}
                team={team}
                seed={seed.seed}
                conference={conference}
                round={round}
                isSelected={isSelected}
                selectedGames={pick?.picked_games || null}
                isAuto={pick?.auto || false}
                readOnly={readOnly}
                onToggle={() => onTogglePick(round, conference, teamId)}
                onSetGames={(games) => onSetGames(round, conference, teamId, games)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoundSection;
