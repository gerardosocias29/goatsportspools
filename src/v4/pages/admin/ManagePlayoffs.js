import { useState, useEffect, useCallback, useRef } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import PageLoader from '../../components/common/PageLoader';
import SharedModal from '../../components/admin/common/Modal';

const roundLabels = { 1: 'Round 1', 2: 'Round 2', 3: 'Conf Finals', 4: 'NBA Finals' };
const R1_PAIRS = [[1, 8], [4, 5], [3, 6], [2, 7]];

// ─── Matchup helpers (unchanged from previous impl) ───────────────
function buildMatchups(round, conference, playoffTeams) {
  if (!playoffTeams || playoffTeams.length === 0) return [];
  const confTeams = playoffTeams.filter((t) => t.conference === conference);
  const bySeed = {};
  confTeams.forEach((t) => { bySeed[t.seed] = t; });

  if (round === 1) {
    return R1_PAIRS.map(([sA, sB]) => ({
      seedA: sA, seedB: sB, teamA: bySeed[sA] || null, teamB: bySeed[sB] || null,
    }));
  }
  if (round === 2) {
    const r1Winners = confTeams.filter((t) => t.r1_beat_seed != null);
    const findW = (seedPair) => r1Winners.find((w) => seedPair.includes(w.seed)) || null;
    return [
      { teamA: findW([1, 8]), teamB: findW([4, 5]) },
      { teamA: findW([3, 6]), teamB: findW([2, 7]) },
    ].map((m) => ({ ...m, seedA: m.teamA?.seed || null, seedB: m.teamB?.seed || null }));
  }
  if (round === 3) {
    const r2Winners = confTeams.filter((t) => t.r2_beat_seed != null);
    return [{
      seedA: r2Winners[0]?.seed || null, seedB: r2Winners[1]?.seed || null,
      teamA: r2Winners[0] || null, teamB: r2Winners[1] || null,
    }];
  }
  return [];
}

function buildFinalsMatchup(playoffTeams) {
  if (!playoffTeams || playoffTeams.length === 0) return null;
  const eastR3 = playoffTeams.find((t) => t.conference === 'East' && t.r3_beat_seed != null);
  const westR3 = playoffTeams.find((t) => t.conference === 'West' && t.r3_beat_seed != null);
  return {
    seedA: eastR3?.seed || null, seedB: westR3?.seed || null,
    teamA: eastR3 || null, teamB: westR3 || null,
    confA: 'East', confB: 'West',
  };
}

// ═══════════════════════════════════════════════════════════════════
//   Main Page
// ═══════════════════════════════════════════════════════════════════
const ManagePlayoffs = () => {
  const { get, post, patch, delete: del } = useAxios();

  const getRef = useRef(get);
  const postRef = useRef(post);
  const patchRef = useRef(patch);
  const delRef = useRef(del);
  getRef.current = get;
  postRef.current = post;
  patchRef.current = patch;
  delRef.current = del;

  const [playoffs, setPlayoffs] = useState([]);
  const [pools, setPools] = useState([]);
  const [nbaTeams, setNbaTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Modal state: { type: 'results'|'setup'|'pools'|'edit'|'new'|'editPool', playoff?, pool? }
  const [modal, setModal] = useState(null);

  const clearAlerts = () => { setError(null); setSuccess(null); };
  const flashSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 4000); };

  const fetchPlayoffs = useCallback(async () => {
    try {
      const res = await getRef.current('/api/admin/playoffs');
      if (res?.data?.status) setPlayoffs(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchPools = useCallback(async () => {
    try {
      const res = await getRef.current('/api/playoff-pools/list');
      if (res?.data?.status) setPools(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchNbaTeams = useCallback(async () => {
    try {
      const res = await getRef.current('/api/admin/playoffs/nba-teams');
      if (res?.data?.status) setNbaTeams(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    Promise.all([fetchPlayoffs(), fetchPools(), fetchNbaTeams()]).finally(() => setLoading(false));
  }, [fetchPlayoffs, fetchPools, fetchNbaTeams]);

  const reloadPlayoff = async (playoffId) => {
    if (!playoffId) return null;
    try {
      const res = await getRef.current(`/api/admin/playoffs/${playoffId}`);
      if (res?.data?.status) {
        const data = res.data.data;
        const allTeams = [...(data.east || []), ...(data.west || [])];
        return { ...data.playoff, teams: allTeams };
      }
    } catch (err) { console.error(err); }
    return null;
  };

  const poolsForPlayoff = (playoffId) => pools.filter((p) => p.playoff?.id === playoffId);
  const visiblePlayoffs = showArchived
    ? playoffs
    : playoffs.filter((p) => !p.deleted_at);

  if (loading) return <PageLoader inline />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Playoffs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Playoff years, teams, series results, and bracket pools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
            Show archived
          </label>
          <button
            onClick={() => { clearAlerts(); setModal({ type: 'new' }); }}
            className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            + New Playoff
          </button>
        </div>
      </div>

      {error && <Alert kind="error" msg={error} />}
      {success && <Alert kind="success" msg={success} />}

      {/* Playoffs Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-5 py-3">Year / Name</th>
                <th className="px-5 py-3">Pools</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Round</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {visiblePlayoffs.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  No playoffs yet. Click <span className="font-semibold">+ New Playoff</span> to create one.
                </td></tr>
              )}
              {visiblePlayoffs.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 ${p.deleted_at ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{p.year} — {p.name}</div>
                    {p.deleted_at && <div className="text-xs text-gray-400 mt-0.5">Archived</div>}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{poolsForPlayoff(p.id).length}</td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {p.current_round ? roundLabels[p.current_round] : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <ActionBtn onClick={() => { clearAlerts(); setModal({ type: 'results', playoff: p }); }}
                        variant="brand">Series Results</ActionBtn>
                      <ActionBtn onClick={() => { clearAlerts(); setModal({ type: 'setup', playoff: p }); }}>
                        Team Setup</ActionBtn>
                      <ActionBtn onClick={() => { clearAlerts(); setModal({ type: 'pools', playoff: p }); }}>
                        View Pools</ActionBtn>
                      <ActionBtn onClick={() => { clearAlerts(); setModal({ type: 'edit', playoff: p }); }}
                        variant="ghost">Edit</ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {modal?.type === 'new' && (
        <NewPlayoffModal
          onClose={() => setModal(null)}
          onCreated={async (p) => {
            flashSuccess('Playoff created.');
            await fetchPlayoffs();
            setModal({ type: 'setup', playoff: p });
          }}
          onError={setError}
        />
      )}

      {modal?.type === 'edit' && (
        <EditPlayoffModal
          playoff={modal.playoff}
          onClose={() => setModal(null)}
          onSaved={async () => { flashSuccess('Playoff updated.'); await fetchPlayoffs(); setModal(null); }}
          onArchived={async () => { flashSuccess('Playoff archived.'); await fetchPlayoffs(); setModal(null); }}
          onError={setError}
          patchRef={patchRef}
          delRef={delRef}
        />
      )}

      {modal?.type === 'results' && (
        <SeriesResultsModal
          playoff={modal.playoff}
          onClose={() => setModal(null)}
          onError={setError}
          onSuccess={flashSuccess}
          postRef={postRef}
          reloadPlayoff={reloadPlayoff}
        />
      )}

      {modal?.type === 'setup' && (
        <TeamSetupModal
          playoff={modal.playoff}
          nbaTeams={nbaTeams}
          onClose={() => setModal(null)}
          onSaved={flashSuccess}
          onError={setError}
          postRef={postRef}
          reloadPlayoff={reloadPlayoff}
        />
      )}

      {modal?.type === 'pools' && (
        <PoolsModal
          playoff={modal.playoff}
          pools={poolsForPlayoff(modal.playoff.id)}
          onClose={() => setModal(null)}
          onRefresh={fetchPools}
          onError={setError}
          onSuccess={flashSuccess}
          postRef={postRef}
          patchRef={patchRef}
          delRef={delRef}
          getRef={getRef}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Shared UI bits
// ═══════════════════════════════════════════════════════════════════
const Alert = ({ kind, msg }) => {
  const styles = kind === 'error'
    ? 'bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-500/20 text-error-600 dark:text-error-400'
    : 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20 text-success-600 dark:text-success-400';
  return <div className={`rounded-lg border p-4 text-sm ${styles}`}>{msg}</div>;
};

const StatusBadge = ({ status }) => {
  const map = {
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    upcoming: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    open: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400',
    locked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${cls}`}>
    {(status || 'setup').replace('_', ' ')}
  </span>;
};

const ActionBtn = ({ onClick, children, variant = 'default', disabled, size = 'sm' }) => {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm';
  const variants = {
    brand: 'bg-brand-500 hover:bg-brand-600 !text-white',
    default: 'text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
    warn: 'bg-yellow-500 hover:bg-yellow-600 !text-white',
    danger: 'bg-red-600 hover:bg-red-700 !text-white',
  };
  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${pad} ${variants[variant]}`}>{children}</button>;
};

// Modal wrapper — adapts shared admin Modal to our (title, subtitle, size) API
const WIDTHS = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
const Modal = ({ title, subtitle, onClose, children, size = 'md' }) => (
  <SharedModal isOpen onClose={onClose} title={title} maxWidth={WIDTHS[size]}>
    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-5">{subtitle}</p>}
    {children}
  </SharedModal>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = 'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

// Searchable dropdown — keyboard + click, filters as user types
const SearchableSelect = ({ value, options, onChange, placeholder = 'Select...' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === String(value));
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())
        || (o.sub || '').toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0); }, [open]);
  useEffect(() => { setHighlight(0); }, [query]);

  const pick = (opt) => { onChange(opt.value); setOpen(false); setQuery(''); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlight]) pick(filtered[highlight]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={wrapRef} className="relative flex-1">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-left text-gray-900 dark:text-white hover:border-brand-300">
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {selected?.image && <img src={selected.image} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />}
          <span className={`truncate ${selected ? '' : 'text-gray-400 dark:text-gray-500'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown} placeholder="Search..."
              className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-2.5 py-1.5 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-2 text-xs text-gray-400">No matches</li>}
            {value && (
              <li>
                <button type="button" onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/40">Clear selection</button>
              </li>
            )}
            {filtered.map((opt, i) => (
              <li key={opt.value}>
                <button type="button" onMouseEnter={() => setHighlight(i)} onClick={() => pick(opt)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${
                    i === highlight ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  } ${opt.value === String(value) ? 'font-semibold' : ''}`}>
                  {opt.image && <img src={opt.image} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />}
                  <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                  {opt.sub && <span className="text-xs text-gray-400 truncate">{opt.sub}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   New Playoff Modal
// ═══════════════════════════════════════════════════════════════════
const NewPlayoffModal = ({ onClose, onCreated, onError }) => {
  const { post } = useAxios();
  const [form, setForm] = useState({ year: new Date().getFullYear(), name: 'NBA Playoffs' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.year || !form.name.trim()) { onError('Year and name are required.'); return; }
    setSaving(true);
    try {
      const res = await post('/api/admin/playoffs/create', form);
      if (res?.data?.status) onCreated(res.data.data);
      else onError(res?.data?.message || 'Failed to create playoff');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to create playoff');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="New Playoff" onClose={onClose} size="sm">
      <div className="space-y-4">
        <Field label="Year"><input type="number" value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className={inputCls} /></Field>
        <Field label="Name"><input type="text" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. NBA Playoffs" className={inputCls} /></Field>
        <div className="flex justify-end gap-3 pt-2">
          <ActionBtn onClick={onClose} variant="default" size="md">Cancel</ActionBtn>
          <ActionBtn onClick={submit} variant="brand" size="md" disabled={saving}>
            {saving ? 'Creating...' : 'Create'}
          </ActionBtn>
        </div>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Edit Playoff Modal
// ═══════════════════════════════════════════════════════════════════
const EditPlayoffModal = ({ playoff, onClose, onSaved, onArchived, onError, patchRef, delRef }) => {
  const [form, setForm] = useState({
    name: playoff.name || '', year: playoff.year || '', status: playoff.status || 'upcoming',
  });
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await patchRef.current(`/api/admin/playoffs/${playoff.id}`, form);
      if (res?.data?.status) onSaved();
      else onError(res?.data?.message || 'Failed to update');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const archive = async () => {
    if (!window.confirm(`Archive "${playoff.year} ${playoff.name}"? It will be hidden unless you toggle "Show archived".`)) return;
    setArchiving(true);
    try {
      const res = await delRef.current(`/api/admin/playoffs/${playoff.id}`);
      if (res?.data?.status) onArchived();
      else onError(res?.data?.message || 'Failed to archive');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to archive');
    } finally { setArchiving(false); }
  };

  return (
    <Modal title="Edit Playoff" subtitle={`${playoff.year} — ${playoff.name}`} onClose={onClose} size="sm">
      <div className="space-y-4">
        <Field label="Name"><input type="text" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
        <Field label="Year"><input type="number" value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className={inputCls} /></Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
            <option value="upcoming">Upcoming</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </Field>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
          <ActionBtn onClick={archive} variant="danger" size="md" disabled={archiving}>
            {archiving ? 'Archiving...' : 'Archive'}
          </ActionBtn>
          <div className="flex gap-3">
            <ActionBtn onClick={onClose} variant="default" size="md">Cancel</ActionBtn>
            <ActionBtn onClick={save} variant="brand" size="md" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </ActionBtn>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Series Results Modal
// ═══════════════════════════════════════════════════════════════════
const SeriesResultsModal = ({ playoff, onClose, onError, onSuccess, postRef, reloadPlayoff }) => {
  const [state, setState] = useState({ playoff, teams: [], round: 1, loading: true });
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    const data = await reloadPlayoff(playoff.id);
    if (data) setState((s) => ({ ...s, playoff: data, teams: data.teams || [], loading: false }));
    else setState((s) => ({ ...s, loading: false }));
  }, [playoff.id, reloadPlayoff]);

  useEffect(() => { load(); }, [load]);

  const submit = async (teamId, round, beatSeed, games) => {
    const key = `${teamId}-${round}`;
    setSaving(key);
    try {
      const res = await postRef.current(`/api/admin/playoffs/${playoff.id}/results`, {
        team_id: parseInt(teamId), round: parseInt(round),
        beat_seed: parseInt(beatSeed), games: parseInt(games),
      });
      if (res?.data?.status) { onSuccess(res.data.message); load(); }
      else onError(res?.data?.message || 'Failed to save');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(null); }
  };

  const { teams, round } = state;

  return (
    <Modal title="Series Results" subtitle={`${playoff.year} — ${playoff.name}`} onClose={onClose} size="lg">
      {state.loading ? (
        <div className="py-10"><PageLoader inline /></div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No teams assigned yet. Use <strong>Team Setup</strong> first.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5">
            {[1, 2, 3, 4].map((r) => (
              <button key={r}
                onClick={() => setState((s) => ({ ...s, round: r }))}
                className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 ${
                  round === r ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}>{roundLabels[r]}</button>
            ))}
          </div>
          <div className="space-y-5">
            {round === 4 ? (
              (() => {
                const finals = buildFinalsMatchup(teams);
                return finals && (finals.teamA || finals.teamB) ? (
                  <MatchupResultCard matchup={finals} round={4} playoffTeams={teams} onSubmit={submit} saving={saving} />
                ) : <p className="text-sm text-gray-400 italic">Waiting for Conference Finals...</p>;
              })()
            ) : (
              ['East', 'West'].map((conf) => {
                const matchups = buildMatchups(round, conf, teams);
                if (matchups.length === 0) return null;
                return (
                  <div key={conf}>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">{conf} Conference</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {matchups.map((m, i) => (
                        <MatchupResultCard key={`${conf}-${round}-${i}`} matchup={m} round={round}
                          playoffTeams={teams} onSubmit={submit} saving={saving} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Team Setup Modal
// ═══════════════════════════════════════════════════════════════════
const TeamSetupModal = ({ playoff, nbaTeams, onClose, onSaved, onError, postRef, reloadPlayoff }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await reloadPlayoff(playoff.id);
      const existing = data?.teams || [];
      if (existing.length > 0) {
        setAssignments(existing.map((t) => ({
          team_id: t.team_id || t.team?.id || '', conference: t.conference, seed: t.seed,
        })));
      } else {
        const slots = [];
        ['East', 'West'].forEach((conf) => { for (let s = 1; s <= 8; s++) slots.push({ team_id: '', conference: conf, seed: s }); });
        setAssignments(slots);
      }
      setLoading(false);
    })();
  }, [playoff.id, reloadPlayoff]);

  const save = async () => {
    const east = assignments.filter((t) => t.conference === 'East' && t.team_id);
    const west = assignments.filter((t) => t.conference === 'West' && t.team_id);
    if (east.length !== 8 || west.length !== 8) { onError('Need exactly 8 East and 8 West teams.'); return; }
    setSaving(true);
    try {
      const res = await postRef.current(`/api/admin/playoffs/${playoff.id}/teams`, {
        teams: assignments.filter((t) => t.team_id).map((t) => ({
          team_id: parseInt(t.team_id), conference: t.conference, seed: parseInt(t.seed),
        })),
      });
      if (res?.data?.status) { onSaved(res.data.message || 'Teams saved.'); onClose(); }
      else onError(res?.data?.message || 'Failed to save');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Team Setup" subtitle={`${playoff.year} — ${playoff.name}`} onClose={onClose} size="lg">
      {loading ? <div className="py-10"><PageLoader inline /></div> : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {['East', 'West'].map((conf) => (
              <div key={conf}>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">{conf} Conference</h4>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((seed) => {
                    const idx = assignments.findIndex((t) => t.conference === conf && t.seed === seed);
                    const currentId = idx >= 0 ? String(assignments[idx].team_id) : '';
                    const takenIds = new Set(
                      assignments
                        .filter((t) => t.team_id && String(t.team_id) !== currentId)
                        .map((t) => String(t.team_id))
                    );
                    const confPrefix = conf.toLowerCase(); // "east" / "west"
                    const confTeams = nbaTeams.filter(
                      (t) => (t.conference || '').toLowerCase().startsWith(confPrefix)
                        && !takenIds.has(String(t.id))
                    );
                    return (
                      <div key={seed} className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">{seed}</span>
                        <SearchableSelect
                          value={currentId}
                          placeholder="Select team..."
                          options={confTeams.map((t) => ({
                            value: String(t.id),
                            label: t.nickname || t.name,
                            sub: t.name !== (t.nickname || t.name) ? t.name : null,
                            image: t.image_url,
                          }))}
                          onChange={(val) => setAssignments((prev) => {
                            const next = [...prev];
                            if (idx >= 0) next[idx] = { ...next[idx], team_id: val };
                            return next;
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-800">
            <ActionBtn onClick={onClose} variant="default" size="md">Cancel</ActionBtn>
            <ActionBtn onClick={save} variant="brand" size="md" disabled={saving}>
              {saving ? 'Saving...' : 'Save Teams'}
            </ActionBtn>
          </div>
        </>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Pools Modal (table of pools for a playoff)
// ═══════════════════════════════════════════════════════════════════
const PoolsModal = ({ playoff, pools, onClose, onRefresh, onError, onSuccess, postRef, patchRef, delRef, getRef }) => {
  const [busyPool, setBusyPool] = useState(null);
  const [editingPool, setEditingPool] = useState(null);
  const [viewingBracketsOf, setViewingBracketsOf] = useState(null);

  const act = async (pool, action, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusyPool(`${pool.pool_number}-${action}`);
    try {
      let res;
      if (action === 'lock') res = await postRef.current(`/api/admin/playoffs/pools/${pool.pool_number}/lock`);
      else if (action === 'recalc') res = await postRef.current(`/api/admin/playoffs/pools/${pool.pool_number}/recalculate`);
      else if (action === 'delete') res = await delRef.current(`/api/admin/playoffs/pools/${pool.pool_number}`);
      if (res?.data?.status) { onSuccess(res.data.message || 'Done'); onRefresh(); }
      else onError(res?.data?.message || 'Action failed');
    } catch (err) {
      onError(err?.response?.data?.message || 'Action failed');
    } finally { setBusyPool(null); }
  };

  return (
    <Modal title="Pools" subtitle={`${playoff.year} — ${playoff.name}`} onClose={onClose} size="xl">
      {viewingBracketsOf ? (
        <BracketsPanel pool={viewingBracketsOf} onBack={() => setViewingBracketsOf(null)}
          onError={onError} onSuccess={onSuccess} getRef={getRef} patchRef={patchRef} />
      ) : editingPool ? (
        <EditPoolForm pool={editingPool} onCancel={() => setEditingPool(null)}
          onSaved={() => { setEditingPool(null); onSuccess('Pool updated.'); onRefresh(); }}
          onError={onError} patchRef={patchRef} />
      ) : pools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No pools created for this playoff year.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-5 py-3">Pool #</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Participants</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {pools.map((pool) => {
                const locked = pool.pool_status === 'locked';
                return (
                  <tr key={pool.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-4 font-mono text-gray-900 dark:text-white">{pool.pool_number}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{pool.pool_name}</div>
                      {pool.pool_description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{pool.pool_description}</div>}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{pool.participants_count || 0}</td>
                    <td className="px-5 py-4"><StatusBadge status={pool.pool_status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <ActionBtn onClick={() => act(pool, 'lock', `Lock pool "${pool.pool_name}"? This stops bracket edits.`)}
                          variant="warn" disabled={locked || busyPool === `${pool.pool_number}-lock`}>
                          {locked ? 'Locked' : busyPool === `${pool.pool_number}-lock` ? 'Locking...' : 'Lock Pool'}
                        </ActionBtn>
                        <ActionBtn onClick={() => act(pool, 'recalc')}
                          variant="brand" disabled={busyPool === `${pool.pool_number}-recalc`}>
                          {busyPool === `${pool.pool_number}-recalc` ? 'Scoring...' : 'Recalculate'}
                        </ActionBtn>
                        <ActionBtn onClick={() => setViewingBracketsOf(pool)} variant="default">View Brackets</ActionBtn>
                        <ActionBtn onClick={() => setEditingPool(pool)} variant="default">Edit</ActionBtn>
                        <ActionBtn onClick={() => act(pool, 'delete', `Delete pool "${pool.pool_name}"? This cannot be undone from this UI.`)}
                          variant="danger" disabled={busyPool === `${pool.pool_number}-delete`}>
                          {busyPool === `${pool.pool_number}-delete` ? 'Deleting...' : 'Delete'}
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

const EditPoolForm = ({ pool, onCancel, onSaved, onError, patchRef }) => {
  const [form, setForm] = useState({
    pool_name: pool.pool_name || '',
    pool_description: pool.pool_description || '',
    initial_credits: pool.initial_credits ?? 0,
    credit_cost_per_bracket: pool.credit_cost_per_bracket ?? 0,
    max_brackets_per_user: pool.max_brackets_per_user ?? 8,
    close_datetime: pool.close_datetime ? pool.close_datetime.substring(0, 16) : '',
    password: pool.password || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await patchRef.current(`/api/admin/playoffs/pools/${pool.pool_number}`, {
        ...form,
        close_datetime: form.close_datetime || null,
        password: form.password || null,
      });
      if (res?.data?.status) onSaved();
      else onError(res?.data?.message || 'Failed to update pool');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to update pool');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button onClick={onCancel} className="hover:text-brand-500">← Back to pools</button>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">Edit Pool #{pool.pool_number}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Pool Name"><input type="text" value={form.pool_name}
          onChange={(e) => setForm((f) => ({ ...f, pool_name: e.target.value }))} className={inputCls} /></Field>
        <Field label="Password (optional)"><input type="text" value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank for open" className={inputCls} /></Field>
      </div>
      <Field label="Description"><textarea rows={2} value={form.pool_description}
        onChange={(e) => setForm((f) => ({ ...f, pool_description: e.target.value }))}
        className={`${inputCls} h-auto py-2`} /></Field>
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Initial Credits"><input type="number" value={form.initial_credits}
          onChange={(e) => setForm((f) => ({ ...f, initial_credits: e.target.value }))} className={inputCls} /></Field>
        <Field label="Cost per Bracket"><input type="number" value={form.credit_cost_per_bracket}
          onChange={(e) => setForm((f) => ({ ...f, credit_cost_per_bracket: e.target.value }))} className={inputCls} /></Field>
        <Field label="Max Brackets / User"><input type="number" value={form.max_brackets_per_user}
          onChange={(e) => setForm((f) => ({ ...f, max_brackets_per_user: e.target.value }))} className={inputCls} /></Field>
      </div>
      <Field label="Close Date/Time"><input type="datetime-local" value={form.close_datetime}
        onChange={(e) => setForm((f) => ({ ...f, close_datetime: e.target.value }))} className={inputCls} /></Field>
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
        <ActionBtn onClick={onCancel} variant="default" size="md">Cancel</ActionBtn>
        <ActionBtn onClick={save} variant="brand" size="md" disabled={saving}>
          {saving ? 'Saving...' : 'Save Pool'}
        </ActionBtn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Brackets Panel — list all brackets in a pool w/ PAID toggle
// ═══════════════════════════════════════════════════════════════════
const BracketsPanel = ({ pool, onBack, onError, onSuccess, getRef, patchRef }) => {
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRef.current(`/api/admin/playoffs/pools/${pool.pool_number}/brackets`);
      if (res?.data?.status) setBrackets(res.data.data || []);
      else onError(res?.data?.message || 'Failed to load brackets');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to load brackets');
    } finally { setLoading(false); }
  }, [pool.pool_number, getRef, onError]);

  useEffect(() => { load(); }, [load]);

  const togglePaid = async (bracket, nextPaid) => {
    setBusyId(bracket.id);
    try {
      const res = await patchRef.current(`/api/admin/playoffs/brackets/${bracket.id}/paid`, { is_paid: nextPaid });
      if (res?.data?.status) {
        onSuccess(res.data.message);
        setBrackets((prev) => prev.map((b) => b.id === bracket.id ? { ...b, ...res.data.data } : b));
      } else onError(res?.data?.message || 'Failed to update paid status');
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to update paid status');
    } finally { setBusyId(null); }
  };

  const filtered = brackets.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (b.bracket_name || '').toLowerCase().includes(q)
      || (b.participant?.user?.name || '').toLowerCase().includes(q)
      || (b.participant?.user?.username || '').toLowerCase().includes(q);
  });

  const paidCount = brackets.filter((b) => b.is_paid).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button onClick={onBack} className="hover:text-brand-500">← Back to pools</button>
          <span>/</span>
          <span className="font-medium text-gray-900 dark:text-white">Brackets — #{pool.pool_number}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-success-600 dark:text-success-400">{paidCount}</span>
          {' '}of {brackets.length} paid
        </div>
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by bracket name or player..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />

      {loading ? <div className="py-10"><PageLoader inline /></div> : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {brackets.length === 0 ? 'No brackets in this pool yet.' : 'No brackets match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-5 py-3">Bracket</th>
                <th className="px-5 py-3">Player</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Points</th>
                <th className="px-5 py-3 text-center">Paid</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((b) => {
                const user = b.participant?.user;
                return (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{b.bracket_name}</td>
                    <td className="px-5 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{user?.name || '—'}</div>
                      {user?.username && <div className="text-xs text-gray-400">@{user.username}</div>}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3 text-center font-semibold text-gray-900 dark:text-white">{b.total_points || 0}</td>
                    <td className="px-5 py-3 text-center">
                      {b.is_paid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600 dark:text-success-400">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          PAID
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Unpaid</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionBtn
                        onClick={() => togglePaid(b, !b.is_paid)}
                        variant={b.is_paid ? 'default' : 'brand'}
                        disabled={busyId === b.id}>
                        {busyId === b.id ? '...' : b.is_paid ? 'Mark Unpaid' : 'Mark PAID'}
                      </ActionBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   Matchup Result Card + Team Badge (reused from previous impl)
// ═══════════════════════════════════════════════════════════════════
const MatchupResultCard = ({ matchup, round, playoffTeams, onSubmit, saving }) => {
  const { teamA, teamB, seedA, seedB } = matchup;
  const isFinals = round === 4;

  const teamAId = teamA?.team_id || teamA?.team?.id;
  const teamBId = teamB?.team_id || teamB?.team?.id;
  const ptA = teamAId ? playoffTeams.find((t) => (t.team_id || t.team?.id) === teamAId) : null;
  const ptB = teamBId ? playoffTeams.find((t) => (t.team_id || t.team?.id) === teamBId) : null;

  const beatSeedCol = isFinals ? 'finals_beat_seed' : `r${round}_beat_seed`;
  const gamesCol = isFinals ? 'finals_games' : `r${round}_games`;
  const aWon = ptA && ptA[beatSeedCol] != null;
  const bWon = ptB && ptB[beatSeedCol] != null;
  const isCompleted = aWon || bWon;
  const winnerTeam = aWon ? ptA : bWon ? ptB : null;
  const actualGames = winnerTeam ? winnerTeam[gamesCol] : null;

  const teamAName = teamA?.team?.nickname || teamA?.nickname || teamA?.team?.name || teamA?.name || 'TBD';
  const teamBName = teamB?.team?.nickname || teamB?.nickname || teamB?.team?.name || teamB?.name || 'TBD';
  const teamAImg = teamA?.team?.image_url || teamA?.image_url;
  const teamBImg = teamB?.team?.image_url || teamB?.image_url;
  const seedADisplay = seedA || teamA?.seed;
  const seedBDisplay = seedB || teamB?.seed;

  const [winnerId, setWinnerId] = useState('');
  const [games, setGames] = useState('');

  useEffect(() => {
    if (aWon && teamAId) { setWinnerId(String(teamAId)); setGames(String(actualGames || '')); }
    else if (bWon && teamBId) { setWinnerId(String(teamBId)); setGames(String(actualGames || '')); }
  }, [aWon, bWon, teamAId, teamBId, actualGames]);

  if (!teamA && !teamB) {
    return <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 opacity-60">
      <span className="text-sm text-gray-400 italic">Waiting for earlier results...</span></div>;
  }

  const handleSubmit = () => {
    if (!winnerId || !games) return;
    const winnerIsA = String(winnerId) === String(teamAId);
    const beatSeed = winnerIsA ? seedBDisplay : seedADisplay;
    onSubmit(winnerId, round, beatSeed, games);
  };

  const isSaving = saving === `${winnerId}-${round}`;

  return (
    <div className={`rounded-lg border p-4 ${
      isCompleted ? 'border-success-200 dark:border-success-500/30 bg-success-50/50 dark:bg-success-500/5'
      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <TeamBadge name={teamAName} seed={seedADisplay} img={teamAImg} isWinner={aWon} conf={isFinals ? matchup.confA : null} />
        </div>
        <div className="flex flex-col items-center shrink-0 px-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">VS</span>
          {isCompleted && actualGames && <span className="text-xs font-semibold text-success-600 dark:text-success-400 mt-0.5">4-{actualGames - 4}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <TeamBadge name={teamBName} seed={seedBDisplay} img={teamBImg} isWinner={bWon} conf={isFinals ? matchup.confB : null} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Winner</label>
          <select value={winnerId} onChange={(e) => setWinnerId(e.target.value)} disabled={isSaving}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50">
            <option value="">Select winner...</option>
            {teamAId && <option value={teamAId}>({seedADisplay}) {teamAName}</option>}
            {teamBId && <option value={teamBId}>({seedBDisplay}) {teamBName}</option>}
          </select>
        </div>
        <div className="w-24">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Games</label>
          <select value={games} onChange={(e) => setGames(e.target.value)} disabled={isSaving}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50">
            <option value="">--</option>
            <option value="4">4 (sweep)</option><option value="5">5</option>
            <option value="6">6</option><option value="7">7</option>
          </select>
        </div>
        <button onClick={handleSubmit} disabled={!winnerId || !games || isSaving}
          className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
          {isSaving ? <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving</span>
            : isCompleted ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
};

const TeamBadge = ({ name, seed, img, isWinner, conf }) => {
  if (!name || name === 'TBD') {
    return <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-600">
      <span className="text-sm text-gray-400 dark:text-gray-500 italic">TBD</span></div>;
  }
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
      isWinner ? 'border-success-300 dark:border-success-500/40 bg-success-50 dark:bg-success-500/10'
      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60'
    }`}>
      <div className="flex items-center gap-2">
        {img && <img src={img} alt="" className="w-7 h-7 rounded-full object-cover" />}
        <span className={`text-sm ${isWinner ? 'text-success-600 dark:text-success-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{name}</span>
        {conf && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{conf}</span>}
      </div>
      {seed && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        isWinner ? 'bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}>{seed}</span>}
    </div>
  );
};

export default ManagePlayoffs;
