import React, { useState, useRef, useEffect } from 'react';

const StatusBadge = ({ bracket }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
    bracket.status === 'finalized'
      ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
      : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400'
  }`}>
    {bracket.status === 'finalized' ? 'Finalized' : 'Draft'}
  </span>
);

const PaidBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
    PAID
  </span>
);

const PencilIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const BracketSelector = ({
  brackets,
  activeBracketId,
  onSelect,
  onCreate,
  onRename,
  pool,
  participant,
  isLocked,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [savingRename, setSavingRename] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const maxBrackets = pool?.max_brackets_per_user || 8;
  const cost = pool?.credit_cost_per_bracket || 0;
  const credits = participant?.credits_available || 0;
  const atMax = brackets.length >= maxBrackets;
  const insufficientCredits = cost > 0 && credits < cost;
  const canCreate = !isLocked && !atMax && !insufficientCredits;

  const active = brackets.find((b) => b.id === activeBracketId);
  const canRename = active && !isLocked && active.status !== 'finalized' && !!onRename;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.select(), 0);
  }, [editing]);

  const startEdit = (e) => {
    e.stopPropagation();
    setEditValue(active?.bracket_name || '');
    setEditing(true);
    setIsOpen(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditValue('');
  };

  const saveEdit = async () => {
    const name = editValue.trim();
    if (!name || name === active?.bracket_name) { cancelEdit(); return; }
    setSavingRename(true);
    const result = await onRename(name);
    setSavingRename(false);
    if (result?.success) {
      showToast?.('Bracket renamed.', 'success');
      cancelEdit();
    } else {
      showToast?.(result?.error || 'Failed to rename', 'error');
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    const result = await onCreate();
    setCreating(false);
    setIsOpen(false);
    if (!result.success) showToast(result.error, 'error');
  };

  return (
    <div className="relative" ref={ref}>
      {editing ? (
        <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-brand-300 bg-white dark:border-brand-500/50 dark:bg-gray-800">
          <span className="text-lg shrink-0">🏀</span>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            disabled={savingRename}
            maxLength={50}
            placeholder="Bracket name"
            className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-900 dark:text-white focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={saveEdit}
            disabled={savingRename || !editValue.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition shrink-0"
          >
            {savingRename ? '...' : 'Save'}
          </button>
          <button
            onClick={cancelEdit}
            disabled={savingRename}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">🏀</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {active?.bracket_name || 'Select Bracket'}
            </span>
            {active && <StatusBadge bracket={active} />}
            {active?.is_paid && <PaidBadge />}
            {canRename && (
              <span
                role="button"
                tabIndex={0}
                onClick={startEdit}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startEdit(e); }}
                title="Rename bracket"
                className="ml-1 p-1 rounded-md text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition cursor-pointer"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {isOpen && !editing && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg z-20 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          {brackets.map((b) => (
            <button
              key={b.id}
              onClick={() => { onSelect(b.id); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                b.id === activeBracketId ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.bracket_name}</span>
                <StatusBadge bracket={b} />
                {b.is_paid && <PaidBadge />}
              </div>
              {b.total_points > 0 && (
                <span className="text-xs font-bold text-brand-500 shrink-0 ml-2">{b.total_points} pts</span>
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
              {creating ? 'Creating...' : 'Create New Bracket'}
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
