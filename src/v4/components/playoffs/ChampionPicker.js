import React from 'react';
import GamesDropdown from './GamesDropdown';

const ChampionPicker = ({
  candidates,
  championPick,
  readOnly,
  onPickChampion,
  onSetGames,
  seeds,
  seedMap,
}) => {
  const championTeamId = championPick?.picked_team_id || null;
  const needsBothConferences = candidates.length < 2;

  return (
    <div className="flex flex-col items-center lg:justify-center lg:min-w-[200px]">
      <div className="w-full rounded-xl border-2 border-brand-500/30 bg-brand-50/30 p-4 dark:bg-brand-500/5">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="text-2xl mb-1">🏆</div>
          <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
            NBA Champion
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Pick 1 of 2</p>
        </div>

        {/* Need conference picks first */}
        {candidates.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Pick your conference champions first
            </p>
          </div>
        )}

        {/* One conference filled */}
        {candidates.length === 1 && (
          <div className="space-y-2">
            {candidates.map((seed) => {
              const teamId = seed.team_id || seed.team?.id;
              const team = seed.team || seed;
              const isChampion = championTeamId === teamId;

              return (
                <ChampionCard
                  key={teamId}
                  team={team}
                  seed={seed.seed}
                  conference={seed.conference}
                  isChampion={isChampion}
                  selectedGames={isChampion ? championPick?.picked_games : null}
                  readOnly={readOnly}
                  onPick={() => !readOnly && onPickChampion(teamId)}
                  onSetGames={(games) => onSetGames(teamId, games)}
                />
              );
            })}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
              Waiting for other conference champion
            </p>
          </div>
        )}

        {/* Both conferences filled */}
        {candidates.length >= 2 && (
          <div className="space-y-2">
            <div className="text-center mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                championTeamId
                  ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {championTeamId ? '1 / 1' : '0 / 1'}
              </span>
            </div>
            {candidates.map((seed) => {
              const teamId = seed.team_id || seed.team?.id;
              const team = seed.team || seed;
              const isChampion = championTeamId === teamId;

              return (
                <ChampionCard
                  key={teamId}
                  team={team}
                  seed={seed.seed}
                  conference={seed.conference}
                  isChampion={isChampion}
                  selectedGames={isChampion ? championPick?.picked_games : null}
                  readOnly={readOnly}
                  onPick={() => !readOnly && onPickChampion(teamId)}
                  onSetGames={(games) => onSetGames(teamId, games)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ChampionCard = ({ team, seed, conference, isChampion, selectedGames, readOnly, onPick, onSetGames }) => {
  const teamName = team?.nickname || team?.name || 'Unknown';
  const teamLogo = team?.image_url || null;

  return (
    <div
      onClick={readOnly ? undefined : onPick}
      className={`relative rounded-lg border-2 p-3 transition-all cursor-pointer select-none ${
        readOnly ? 'cursor-default' : ''
      } ${
        isChampion
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
      }`}
    >
      {isChampion && !readOnly && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
          <svg className="w-3 h-3 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
          conference === 'East'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          {seed}
        </div>

        {teamLogo ? (
          <img src={teamLogo} alt={teamName} className="w-8 h-8 object-contain flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{teamName}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{conference}</p>
        </div>
      </div>

      {isChampion && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <GamesDropdown value={selectedGames} onChange={onSetGames} readOnly={readOnly} />
        </div>
      )}
    </div>
  );
};

export default ChampionPicker;
