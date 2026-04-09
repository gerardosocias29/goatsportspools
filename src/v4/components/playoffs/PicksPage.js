import React, { useState } from 'react';
import BracketSelector from './BracketSelector';
import BracketEditor from './BracketEditor';
import PicksActionBar from './PicksActionBar';
import FinalizedCelebration from './FinalizedCelebration';
import FinalizeConfirmModal from './FinalizeConfirmModal';

const PicksPage = ({ hook }) => {
  const {
    pool, participant, brackets, activeBracket, picks,
    saving, dirty, isLocked, isFinalized, readOnly,
    totalPicks, picksWithGames, isComplete,
    selectBracket, createBracket, renameBracket,
    savePicks, finalizeBracket, selectMatchupWinner,
    setGames, getValidationErrors, seedMap,
  } = hook;

  const [toast, setToast] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [justFinalized, setJustFinalized] = useState(false);
  const [creatingBracket, setCreatingBracket] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Not joined yet
  if (!participant) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-3xl mb-3">🏀</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Join This Pool</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You need to join this pool before you can create brackets and make picks.</p>
        <button
          onClick={async () => {
            const result = await hook.joinPool();
            if (result.success) showToast('Joined pool!', 'success');
            else showToast(result.error, 'error');
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold !text-white bg-brand-500 hover:bg-brand-600 transition"
        >
          Join Pool
        </button>
      </div>
    );
  }

  const handleSelectMatchupWinner = (round, conference, teamId, opponentTeamId) => {
    selectMatchupWinner(round, conference, teamId, opponentTeamId);
  };

  const handleSaveDraft = async () => {
    const result = await savePicks();
    if (result.success) showToast('Draft saved!', 'success');
    else showToast(result.error || 'Failed to save', 'error');
  };

  const handleFinalize = async () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }
    setShowFinalizeModal(true);
  };

  const handleConfirmFinalize = async () => {
    setShowFinalizeModal(false);
    const result = await finalizeBracket();
    if (result.success) {
      setJustFinalized(true);
      showToast('Bracket finalized!', 'success');
    } else {
      showToast(result.error || 'Failed to finalize', 'error');
    }
  };

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top ${
          toast.type === 'success' ? 'bg-success-500 !text-white' :
          toast.type === 'error' ? 'bg-error-500 !text-white' :
          'bg-gray-800 !text-white'
        }`}>
          {toast.type === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Credits chip */}
      {pool?.credit_cost_per_bracket > 0 && participant && (
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {participant.credits_available} credits left
            </span>
          </div>
        </div>
      )}

      {/* Bracket Selector */}
      <BracketSelector
        brackets={brackets}
        activeBracketId={hook.activeBracketId}
        onSelect={selectBracket}
        onCreate={createBracket}
        pool={pool}
        participant={participant}
        isLocked={isLocked}
        showToast={showToast}
      />

      {/* Bracket Header */}
      {activeBracket && (
        <div className="flex items-center gap-3 mb-4 mt-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              defaultValue={activeBracket.bracket_name}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && val !== activeBracket.bracket_name) {
                  renameBracket(val);
                }
              }}
              disabled={readOnly}
              className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none w-full disabled:cursor-default"
              maxLength={50}
            />
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isFinalized
              ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
              : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400'
          }`}>
            {isFinalized ? 'Finalized' : 'Draft'}
          </span>
        </div>
      )}

      {/* Finalized Celebration */}
      {justFinalized && isFinalized && (
        <FinalizedCelebration
          onCreateAnother={async () => {
            setJustFinalized(false);
            const result = await createBracket();
            if (!result.success) showToast(result.error, 'error');
          }}
          onViewBracket={() => setJustFinalized(false)}
          canCreate={
            brackets.length < (pool?.max_brackets_per_user || 8) &&
            (pool?.credit_cost_per_bracket === 0 || (participant?.credits_available || 0) >= (pool?.credit_cost_per_bracket || 0))
          }
        />
      )}

      {/* Bracket Editor — always visible when bracket exists */}
      {activeBracket && (
        <BracketEditor
          hook={hook}
          onSelectMatchupWinner={handleSelectMatchupWinner}
          onSetGames={setGames}
        />
      )}

      {/* No brackets yet */}
      {!activeBracket && brackets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-3xl mb-3">🏀</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Brackets Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first bracket to start making picks.</p>
          <button
            onClick={async () => {
              setCreatingBracket(true);
              try {
                const result = await createBracket();
                if (result.success) {
                  showToast('Bracket created!', 'success');
                } else {
                  showToast(result.error || 'Failed to create bracket', 'error');
                }
              } catch (err) {
                console.error('Create bracket error:', err);
                showToast('Something went wrong. Please try again.', 'error');
              } finally {
                setCreatingBracket(false);
              }
            }}
            disabled={isLocked || creatingBracket}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingBracket ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              '+ Create Bracket'
            )}
          </button>
        </div>
      )}

      {/* Action Bar */}
      {activeBracket && !isFinalized && !justFinalized && (
        <PicksActionBar
          totalPicks={totalPicks}
          picksWithGames={picksWithGames}
          saving={saving}
          dirty={dirty}
          readOnly={readOnly}
          isComplete={isComplete}
          onSave={handleSaveDraft}
          onFinalize={handleFinalize}
        />
      )}

      {/* Modals */}
      {showFinalizeModal && (
        <FinalizeConfirmModal
          picks={picks}
          seeds={hook.seeds}
          seedMap={seedMap}
          onConfirm={handleConfirmFinalize}
          onCancel={() => setShowFinalizeModal(false)}
        />
      )}
    </div>
  );
};

export default PicksPage;
