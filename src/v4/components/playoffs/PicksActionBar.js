import React from 'react';

const PicksActionBar = ({
  totalPicks,
  picksWithGames,
  saving,
  dirty,
  readOnly,
  isComplete,
  onSave,
  onFinalize,
}) => {
  if (readOnly) return null;

  return (
    <div className="sticky bottom-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 mt-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${Math.round((totalPicks / 15) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {totalPicks}/15 picks
            </span>
          </div>
          {totalPicks > 0 && picksWithGames < totalPicks && (
            <span className="text-[10px] text-warning-500 font-medium">
              {totalPicks - picksWithGames} need games
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving || !dirty}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={onFinalize}
            disabled={!isComplete}
            className="px-4 py-2 rounded-lg text-sm font-bold !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalize Picks
          </button>
        </div>
      </div>
    </div>
  );
};

export default PicksActionBar;
