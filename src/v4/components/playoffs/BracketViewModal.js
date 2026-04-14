import { useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import SharedModal from '../admin/common/Modal';
import BracketEditor from './BracketEditor';
import * as bracketUtils from './bracketUtils';

/**
 * Read-only bracket view using the same BracketEditor layout users see while picking.
 *
 * Access rules (backend enforced):
 * - Owner / superadmin: always
 * - Other pool participants: only after pool is locked / past close_datetime
 */
const BracketViewModal = ({ poolNumber, bracketId, onClose, title }) => {
  const { get } = useAxios();
  const [bracket, setBracket] = useState(null);
  const [seeds, setSeeds] = useState([]);
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
        if (res?.data?.status) {
          setBracket(res.data.data);
          setSeeds(res.data.seeds || []);
        } else {
          setError(res?.data?.message || 'Failed to load bracket');
        }
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load bracket');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [poolNumber, bracketId, get]);

  // Build a minimal read-only hook shim that satisfies BracketEditor's needs
  const readonlyHook = useMemo(() => {
    const picks = (bracket?.picks || []).map((p) => ({
      ...p,
      picked_team_id: p.picked_team_id,
      round: p.round,
      conference: p.conference,
      picked_games: p.picked_games,
    }));
    return {
      readOnly: true,
      getMatchups: (round, conference) => bracketUtils.getMatchups(round, conference, picks, seeds),
      getPicksForRound: (round, conference) => {
        if (round === 4) return picks.filter((p) => p.round === 4);
        return picks.filter((p) => p.round === round && p.conference === conference);
      },
      seeds,
      picks,
    };
  }, [bracket, seeds]);

  const owner = bracket?.participant?.user;
  const hasBracket = bracket && (bracket.picks?.length ?? 0) > 0 && seeds.length > 0;

  return (
    <SharedModal isOpen onClose={onClose} title={title || bracket?.bracket_name || 'Bracket'} maxWidth="max-w-[min(1500px,95vw)]">
      {owner && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-5">
          by {owner.name || owner.username}{owner.username ? ` · @${owner.username}` : ''}
          {bracket?.status && <span className="ml-2 capitalize">· {bracket.status}</span>}
          {bracket?.is_paid && <span className="ml-2 text-success-600 dark:text-success-400 font-semibold">· PAID</span>}
          {bracket?.total_points > 0 && <span className="ml-2 font-semibold text-brand-500">· {bracket.total_points} pts</span>}
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
      ) : !hasBracket ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic py-8 text-center">No picks recorded for this bracket.</p>
      ) : (
        <div className="-mx-6 px-6 overflow-x-auto">
          <BracketEditor
            hook={readonlyHook}
            onSelectMatchupWinner={() => {}}
            onSetGames={() => {}}
          />
        </div>
      )}
    </SharedModal>
  );
};

export default BracketViewModal;
