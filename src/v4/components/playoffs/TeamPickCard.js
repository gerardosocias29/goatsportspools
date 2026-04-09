import React from 'react';
import GamesDropdown from './GamesDropdown';

const TeamPickCard = ({
  team,
  seed,
  conference,
  round,
  isSelected,
  selectedGames,
  isAuto,
  readOnly,
  onToggle,
  onSetGames,
}) => {
  const teamName = team?.nickname || team?.name || 'Unknown';
  const teamLogo = team?.image_url || null;
  const seedNum = seed || team?.seed;

  return (
    <div
      onClick={readOnly ? undefined : onToggle}
      className={`relative rounded-lg border-2 p-2.5 transition-all cursor-pointer select-none ${
        readOnly ? 'cursor-default' : ''
      } ${
        isSelected
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/5 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
      }`}
    >
      {/* Lock overlay */}
      {readOnly && (
        <div className="absolute inset-0 rounded-lg bg-gray-900/5 dark:bg-gray-900/20 flex items-center justify-center z-10 pointer-events-none">
          {isSelected && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
      )}

      {/* Auto badge */}
      {isAuto && isSelected && (
        <span className="absolute top-1 right-1 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 z-20">
          auto
        </span>
      )}

      {/* Checkmark */}
      {isSelected && !readOnly && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center z-20">
          <svg className="w-3 h-3 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Seed badge */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
          conference === 'East'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          {seedNum}
        </div>

        {/* Logo */}
        {teamLogo ? (
          <img src={teamLogo} alt={teamName} className="w-7 h-7 object-contain flex-shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        )}

        {/* Name */}
        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
          {teamName}
        </span>
      </div>

      {/* Games dropdown (only when selected) */}
      {isSelected && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
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

export default TeamPickCard;
