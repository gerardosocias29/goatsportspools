import React from 'react';
import GamesDropdown from './GamesDropdown';

const MatchupCard = ({
  teamA,
  teamB,
  winnerId,
  selectedGames,
  readOnly,
  onSelectWinner,
  onSetGames,
  conference,
  round,
}) => {
  const hasTeamA = !!teamA;
  const hasTeamB = !!teamB;
  const hasBothTeams = hasTeamA && hasTeamB;

  return (
    <div className="w-[150px] rounded-lg border border-gray-200 bg-white overflow-hidden dark:border-gray-700 dark:bg-gray-800 shadow-sm">
      {/* Team A row */}
      <TeamRow
        team={teamA}
        isWinner={winnerId && teamA && winnerId === teamA.team_id}
        isLoser={winnerId && teamA && winnerId !== teamA.team_id}
        readOnly={readOnly || !hasBothTeams}
        onClick={() => {
          if (!readOnly && hasTeamA && hasBothTeams) {
            onSelectWinner(teamA.team_id, teamB.team_id);
          }
        }}
        conference={conference}
        round={round}
      />

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Team B row */}
      <TeamRow
        team={teamB}
        isWinner={winnerId && teamB && winnerId === teamB.team_id}
        isLoser={winnerId && teamB && winnerId !== teamB.team_id}
        readOnly={readOnly || !hasBothTeams}
        onClick={() => {
          if (!readOnly && hasTeamB && hasBothTeams) {
            onSelectWinner(teamB.team_id, teamA.team_id);
          }
        }}
        conference={conference}
        round={round}
      />

      {/* Games dropdown — only when winner is picked */}
      {winnerId && (
        <div
          className="border-t border-gray-200 dark:border-gray-700 px-1.5 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GamesDropdown
            value={selectedGames}
            onChange={onSetGames}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  );
};

const TeamRow = ({ team, isWinner, isLoser, readOnly, onClick, conference }) => {
  if (!team) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-2 min-h-[34px]">
        <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
        <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">
          TBD
        </span>
      </div>
    );
  }

  const teamObj = team.team || team;
  const teamName = teamObj?.nickname || teamObj?.name || 'Unknown';
  const teamLogo = teamObj?.image_url;
  const seedNum = team.seed;
  const conf = team.conference || conference;

  return (
    <div
      onClick={readOnly ? undefined : onClick}
      className={`flex items-center gap-1 px-1.5 py-1.5 min-h-[34px] transition-colors select-none ${
        readOnly ? 'cursor-default' : 'cursor-pointer'
      } ${
        isWinner
          ? 'bg-brand-50 dark:bg-brand-500/10'
          : isLoser
          ? 'bg-gray-50/50 dark:bg-gray-900/30'
          : readOnly
          ? ''
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      {/* Seed badge */}
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${
          conf === 'East'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}
      >
        {seedNum}
      </div>

      {/* Logo */}
      {teamLogo ? (
        <img
          src={teamLogo}
          alt={teamName}
          className={`w-4 h-4 object-contain flex-shrink-0 ${
            isLoser ? 'opacity-40' : ''
          }`}
        />
      ) : (
        <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      )}

      {/* Name */}
      <span
        className={`text-[10px] font-semibold truncate flex-1 min-w-0 ${
          isWinner
            ? 'text-brand-700 dark:text-brand-400'
            : isLoser
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {teamName}
      </span>

      {/* Checkmark for winner */}
      {isWinner && (
        <div className="w-3.5 h-3.5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-2 h-2 !text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default MatchupCard;
