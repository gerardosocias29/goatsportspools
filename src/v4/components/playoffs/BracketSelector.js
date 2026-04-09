import React, { useState, useRef, useEffect } from 'react';

const BracketSelector = ({
  brackets,
  activeBracketId,
  onSelect,
  onCreate,
  pool,
  participant,
  isLocked,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const ref = useRef(null);

  const maxBrackets = pool?.max_brackets_per_user || 8;
  const cost = pool?.credit_cost_per_bracket || 0;
  const credits = participant?.credits_available || 0;
  const atMax = brackets.length >= maxBrackets;
  const insufficientCredits = cost > 0 && credits < cost;
  const canCreate = !isLocked && !atMax && !insufficientCredits;

  const active = brackets.find((b) => b.id === activeBracketId);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    const result = await onCreate();
    setCreating(false);
    setIsOpen(false);
    if (!result.success) {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏀</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {active?.bracket_name || 'Select Bracket'}
          </span>
          {active && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              active.status === 'finalized'
                ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400'
            }`}>
              {active.status === 'finalized' ? 'Finalized' : 'Draft'}
            </span>
          )}
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg z-20 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          {brackets.map((b) => (
            <button
              key={b.id}
              onClick={() => { onSelect(b.id); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                b.id === activeBracketId ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{b.bracket_name}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  b.status === 'finalized'
                    ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                    : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400'
                }`}>
                  {b.status === 'finalized' ? 'Finalized' : 'Draft'}
                </span>
              </div>
              {b.total_points > 0 && (
                <span className="text-xs font-bold text-brand-500">{b.total_points} pts</span>
              )}
            </button>
          ))}

          {/* Create New */}
          <button
            onClick={canCreate ? handleCreate : undefined}
            disabled={!canCreate || creating}
            className={`w-full flex items-center gap-2 px-4 py-3 text-left border-t border-gray-100 dark:border-gray-700 transition ${
              canCreate
                ? 'text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/5'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-semibold">
              {creating ? 'Creating...' : '+ Create New Bracket'}
            </span>
            {cost > 0 && canCreate && (
              <span className="text-[10px] text-gray-400 ml-auto">{cost} credits</span>
            )}
            {atMax && <span className="text-[10px] text-gray-400 ml-auto">Max reached</span>}
            {!atMax && insufficientCredits && (
              <span className="text-[10px] text-error-400 ml-auto">Need {cost} credits</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BracketSelector;
