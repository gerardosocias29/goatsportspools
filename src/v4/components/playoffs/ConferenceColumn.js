import React from 'react';
import RoundSection from './RoundSection';

const ROUND_CONFIG = [
  { round: 1, label: 'Round 1', subtitle: 'Pick 4 of 8', cap: 4 },
  { round: 2, label: 'Round 2', subtitle: 'Pick 2 of 4', cap: 2 },
  { round: 3, label: 'Conf. Finals', subtitle: 'Pick 1 of 2', cap: 1 },
];

const ConferenceColumn = ({
  conference,
  label,
  readOnly,
  getPicksForRound,
  getCandidates,
  onTogglePick,
  onSetGames,
  seeds,
  seedMap,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${conference === 'East' ? 'bg-blue-500' : 'bg-red-500'}`} />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          {label}
        </h3>
      </div>

      {ROUND_CONFIG.map(({ round, label: roundLabel, subtitle, cap }) => {
        const candidates = getCandidates(round, conference);
        const picks = getPicksForRound(round, conference);

        return (
          <RoundSection
            key={round}
            round={round}
            conference={conference}
            label={roundLabel}
            subtitle={subtitle}
            cap={cap}
            candidates={candidates}
            picks={picks}
            readOnly={readOnly}
            onTogglePick={onTogglePick}
            onSetGames={onSetGames}
            seedMap={seedMap}
          />
        );
      })}
    </div>
  );
};

export default ConferenceColumn;
