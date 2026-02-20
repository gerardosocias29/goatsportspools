import React from 'react';

const SelectionFooter = ({
  selectedSquares = [],
  onConfirm,
  onCancel,
  costPerSquare = 0,
  maxPerPlayer,
  currentOwnedCount = 0,
  isConfirming = false,
  claimProgress = { current: 0, total: 0 },
}) => {
  if (selectedSquares.length === 0) return null;

  const totalCost = selectedSquares.length * costPerSquare;
  const remaining = maxPerPlayer ? maxPerPlayer - currentOwnedCount - selectedSquares.length : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Progress bar during claiming */}
        {isConfirming && claimProgress.total > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Claiming squares...</span>
              <span>{claimProgress.current}/{claimProgress.total}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${(claimProgress.current / claimProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {/* Left: Selection info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''} selected
              {costPerSquare > 0 && (
                <span className="ml-2 text-brand-500">
                  ({totalCost.toFixed(2)})
                </span>
              )}
            </p>
            {remaining !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {remaining > 0
                  ? `${remaining} more available (${maxPerPlayer} max)`
                  : 'Maximum selection reached'}
              </p>
            )}
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={onCancel}
              disabled={isConfirming}
              className="rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className="rounded-lg px-4 sm:px-5 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isConfirming
                ? `Claiming ${claimProgress.current}/${claimProgress.total}...`
                : `Claim ${selectedSquares.length} Square${selectedSquares.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionFooter;
