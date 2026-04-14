import { useEffect, useState } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import SharedModal from '../admin/common/Modal';

const roundLabels = { 1: 'Round 1', 2: 'Round 2', 3: 'Conference Finals', 4: 'NBA Finals' };

/**
 * Read-only bracket view. Works for:
 * - Owner of the bracket
 * - Superadmin
 * - Other pool participants once the pool is locked / past close_datetime
 *
 * Backend enforces the gate; frontend simply surfaces errors.
 */
const BracketViewModal = ({ poolNumber, bracketId, onClose, title }) => {
  const { get } = useAxios();
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await get(`/api/playoff-pools/${poolNumber}/brackets/${bracketId}`);
        if (ignore) return;
        if (res?.data?.status) setBracket(res.data.data);
        else setError(res?.data?.message || 'Failed to load bracket');
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load bracket');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [poolNumber, bracketId, get]);

  const picks = bracket?.picks || [];
  const owner = bracket?.participant?.user;

  const byRound = [1, 2, 3, 4].map((r) => ({
    round: r,
    label: roundLabels[r],
    east: picks.filter((p) => p.round === r && p.conference === 'East'),
    west: picks.filter((p) => p.round === r && p.conference === 'West'),
    all: picks.filter((p) => p.round === r && !p.conference),
  }));

  return (
    <SharedModal isOpen onClose={onClose} title={title || bracket?.bracket_name || 'Bracket'} maxWidth="max-w-3xl">
      {owner && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-5">
          by {owner.name || owner.username}{owner.username ? ` · @${owner.username}` : ''}
          {bracket?.status && <span className="ml-2 capitalize">· {bracket.status}</span>}
          {bracket?.is_paid && <span className="ml-2 text-success-600 dark:text-success-400 font-semibold">· PAID</span>}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 p-4 text-sm text-error-600 dark:text-error-400">
          {error}
        </div>
      ) : picks.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic py-8 text-center">No picks recorded for this bracket.</p>
      ) : (
        <div className="space-y-5">
          {byRound.map(({ round, label, east, west, all }) => (
            <div key={round}>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{label}</h4>
              {all.length > 0 && (
                <ul className="space-y-1.5">
                  {all.map((p) => <PickRow key={p.id} pick={p} />)}
                </ul>
              )}
              {(east.length > 0 || west.length > 0) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {east.length > 0 && <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">East</div>
                    <ul className="space-y-1.5">{east.map((p) => <PickRow key={p.id} pick={p} />)}</ul>
                  </div>}
                  {west.length > 0 && <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">West</div>
                    <ul className="space-y-1.5">{west.map((p) => <PickRow key={p.id} pick={p} />)}</ul>
                  </div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SharedModal>
  );
};

const PickRow = ({ pick }) => {
  const team = pick.picked_team;
  const correct = (pick.base_points || 0) > 0;
  return (
    <li className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
      correct
        ? 'border-success-200 dark:border-success-500/30 bg-success-50/50 dark:bg-success-500/5'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40'
    }`}>
      {team?.image_url && <img src={team.image_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />}
      <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1">
        {team?.nickname || team?.name || 'TBD'}
      </span>
      {pick.picked_games && (
        <span className="text-xs text-gray-400 shrink-0">in {pick.picked_games}</span>
      )}
      {correct && (
        <span className="text-xs font-semibold text-success-600 dark:text-success-400 shrink-0">
          +{(pick.base_points || 0) + (pick.games_bonus || 0) + (pick.seed_bonus || 0)}
        </span>
      )}
    </li>
  );
};

export default BracketViewModal;
