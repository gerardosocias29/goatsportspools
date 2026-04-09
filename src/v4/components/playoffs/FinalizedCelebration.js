import React from 'react';

const FinalizedCelebration = ({ onCreateAnother, onViewBracket, canCreate }) => {
  return (
    <div className="rounded-2xl border-2 border-success-300 bg-success-50 p-6 text-center mb-6 dark:border-success-500/30 dark:bg-success-500/5">
      <div className="mx-auto w-16 h-16 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center mb-3">
        <span className="text-3xl">🎉</span>
      </div>
      <h3 className="text-xl font-bold text-success-700 dark:text-success-400 mb-1">
        Bracket Finalized!
      </h3>
      <p className="text-sm text-success-600 dark:text-success-400/80 mb-4">
        Your picks are locked in. Good luck!
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {onViewBracket && (
          <button
            onClick={onViewBracket}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-brand-600 bg-white ring-1 ring-inset ring-brand-300 hover:bg-brand-50 dark:bg-gray-800 dark:text-brand-400 dark:ring-brand-500/30 dark:hover:bg-gray-700 transition"
          >
            Dismiss
          </button>
        )}
        <button
          onClick={onCreateAnother}
          disabled={!canCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Create Another Bracket
        </button>
      </div>
      {!canCreate && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Maximum brackets reached or insufficient credits
        </p>
      )}
    </div>
  );
};

export default FinalizedCelebration;
