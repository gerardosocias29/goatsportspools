import React, { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';

const roundLabels = { 1: 'Round 1', 2: 'Round 2', 3: 'Conf Finals', 4: 'NBA Finals' };

// Fixed R1 matchup seed pairs
const R1_PAIRS = [[1, 8], [4, 5], [3, 6], [2, 7]];

/**
 * Build displayable matchup pairs from playoff teams for a given round + conference.
 */
function buildMatchups(round, conference, playoffTeams) {
  if (!playoffTeams || playoffTeams.length === 0) return [];

  const confTeams = playoffTeams.filter((t) => t.conference === conference);
  const bySeed = {};
  confTeams.forEach((t) => { bySeed[t.seed] = t; });

  if (round === 1) {
    return R1_PAIRS.map(([sA, sB]) => ({
      seedA: sA,
      seedB: sB,
      teamA: bySeed[sA] || null,
      teamB: bySeed[sB] || null,
    }));
  }

  if (round === 2) {
    const r1Winners = confTeams.filter((t) => t.r1_beat_seed != null);
    const findW = (seedPair) => r1Winners.find((w) => seedPair.includes(w.seed)) || null;
    return [
      { teamA: findW([1, 8]), teamB: findW([4, 5]) },
      { teamA: findW([3, 6]), teamB: findW([2, 7]) },
    ].map((m) => ({
      ...m,
      seedA: m.teamA?.seed || null,
      seedB: m.teamB?.seed || null,
    }));
  }

  if (round === 3) {
    const r2Winners = confTeams.filter((t) => t.r2_beat_seed != null);
    return [{
      seedA: r2Winners[0]?.seed || null,
      seedB: r2Winners[1]?.seed || null,
      teamA: r2Winners[0] || null,
      teamB: r2Winners[1] || null,
    }];
  }

  return [];
}

/** Build Finals matchup from East R3 winner + West R3 winner */
function buildFinalsMatchup(playoffTeams) {
  if (!playoffTeams || playoffTeams.length === 0) return null;
  const eastR3Winner = playoffTeams.find((t) => t.conference === 'East' && t.r3_beat_seed != null);
  const westR3Winner = playoffTeams.find((t) => t.conference === 'West' && t.r3_beat_seed != null);
  return {
    seedA: eastR3Winner?.seed || null,
    seedB: westR3Winner?.seed || null,
    teamA: eastR3Winner || null,
    teamB: westR3Winner || null,
    confA: 'East',
    confB: 'West',
  };
}

const ManagePlayoffs = () => {
  const { get, post } = useAxios();

  // Data
  const [playoffs, setPlayoffs] = useState([]);
  const [pools, setPools] = useState([]);
  const [nbaTeams, setNbaTeams] = useState([]);

  // Selection
  const [selectedPlayoff, setSelectedPlayoff] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [activeTab, setActiveTab] = useState('results');

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Setup form
  const [showCreatePlayoff, setShowCreatePlayoff] = useState(false);
  const [createForm, setCreateForm] = useState({ year: new Date().getFullYear(), name: '' });
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [savingTeams, setSavingTeams] = useState(false);

  const clearAlerts = () => { setError(null); setSuccess(null); };

  // ─── Fetch data ────────────────────────────────────────
  const fetchPlayoffs = useCallback(async () => {
    try {
      const res = await get('/api/admin/playoffs');
      if (res?.data?.status) {
        return res.data.data || [];
      }
    } catch (err) {
      console.error('Failed to load playoffs', err);
    }
    return [];
  }, [get]);

  const fetchPools = useCallback(async () => {
    try {
      const res = await get('/api/playoff-pools/list');
      if (res?.data?.status) {
        setPools(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load pools', err);
    }
  }, [get]);

  const fetchNbaTeams = useCallback(async () => {
    try {
      const res = await get('/api/admin/playoffs/nba-teams');
      if (res?.data?.status) {
        setNbaTeams(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load NBA teams', err);
    }
  }, [get]);

  useEffect(() => {
    const init = async () => {
      const [playoffList] = await Promise.all([fetchPlayoffs(), fetchPools(), fetchNbaTeams()]);
      setPlayoffs(playoffList);
      if (playoffList.length > 0) {
        setSelectedPlayoff(playoffList[0]);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Refresh playoff detail when selection changes
  const refreshPlayoff = useCallback(async (playoffId) => {
    if (!playoffId) return;
    try {
      const res = await get(`/api/admin/playoffs/${playoffId}`);
      if (res?.data?.status) {
        const data = res.data.data;
        const allTeams = [...(data.east || []), ...(data.west || [])];
        setSelectedPlayoff((prev) => prev ? ({
          ...prev,
          ...data.playoff,
          teams: allTeams,
        }) : prev);
      }
    } catch (err) {
      console.error('Failed to refresh playoff', err);
    }
  }, [get]);

  useEffect(() => {
    if (selectedPlayoff?.id) {
      refreshPlayoff(selectedPlayoff.id);
    }
  }, [selectedPlayoff?.id]);

  // ─── Submit series result ──────────────────────────────
  const submitResult = async (teamId, round, beatSeed, games) => {
    if (!selectedPlayoff || !teamId || !games) return;
    const key = `${teamId}-${round}`;
    setSaving(key);
    clearAlerts();
    try {
      const res = await post(`/api/admin/playoffs/${selectedPlayoff.id}/results`, {
        team_id: parseInt(teamId),
        round: parseInt(round),
        beat_seed: parseInt(beatSeed),
        games: parseInt(games),
      });
      if (res?.data?.status) {
        setSuccess(res.data.message);
        refreshPlayoff(selectedPlayoff.id);
      } else {
        setError(res?.data?.message || 'Failed to save result');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save result');
    } finally {
      setSaving(null);
    }
  };

  // ─── Lock pool ─────────────────────────────────────────
  const lockPool = async () => {
    if (!selectedPool) return;
    clearAlerts();
    try {
      const res = await post(`/api/admin/playoffs/pools/${selectedPool.pool_number}/lock`);
      if (res?.data?.status) {
        setSuccess('Pool locked!');
        fetchPools();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to lock pool');
    }
  };

  // ─── Recalculate scores ────────────────────────────────
  const recalculate = async () => {
    if (!selectedPool) return;
    clearAlerts();
    try {
      const res = await post(`/api/admin/playoffs/pools/${selectedPool.pool_number}/recalculate`);
      if (res?.data?.status) {
        setSuccess(res.data.message || 'Scores recalculated!');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to recalculate');
    }
  };

  // ─── Create Playoff Year ──────────────────────────────
  const handleCreatePlayoff = async () => {
    if (!createForm.year || !createForm.name.trim()) {
      setError('Year and name are required.');
      return;
    }
    clearAlerts();
    try {
      const res = await post('/api/admin/playoffs/create', createForm);
      if (res?.data?.status) {
        setSuccess('Playoff year created!');
        setShowCreatePlayoff(false);
        setCreateForm({ year: new Date().getFullYear(), name: '' });
        const list = await fetchPlayoffs();
        setPlayoffs(list);
        if (res.data.data) {
          setSelectedPlayoff(res.data.data);
          setActiveTab('setup');
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create playoff year');
    }
  };

  // ─── Save Team Assignments ─────────────────────────────
  const handleSaveTeams = async () => {
    if (!selectedPlayoff) return;
    const east = teamAssignments.filter((t) => t.conference === 'East' && t.team_id);
    const west = teamAssignments.filter((t) => t.conference === 'West' && t.team_id);
    if (east.length !== 8 || west.length !== 8) {
      setError('You need exactly 8 East and 8 West teams (16 total).');
      return;
    }
    clearAlerts();
    setSavingTeams(true);
    try {
      const res = await post(`/api/admin/playoffs/${selectedPlayoff.id}/teams`, {
        teams: teamAssignments.filter((t) => t.team_id).map((t) => ({
          team_id: parseInt(t.team_id),
          conference: t.conference,
          seed: parseInt(t.seed),
        })),
      });
      if (res?.data?.status) {
        setSuccess(res.data.message || 'Teams saved!');
        refreshPlayoff(selectedPlayoff.id);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save teams');
    } finally {
      setSavingTeams(false);
    }
  };

  // Initialize team assignments when playoff is selected and we go to setup tab
  useEffect(() => {
    if (activeTab === 'setup' && selectedPlayoff) {
      const existing = selectedPlayoff.teams || [];
      if (existing.length > 0) {
        setTeamAssignments(
          existing.map((t) => ({
            team_id: t.team_id || t.team?.id || '',
            conference: t.conference,
            seed: t.seed,
          }))
        );
      } else {
        const slots = [];
        ['East', 'West'].forEach((conf) => {
          for (let s = 1; s <= 8; s++) {
            slots.push({ team_id: '', conference: conf, seed: s });
          }
        });
        setTeamAssignments(slots);
      }
    }
  }, [activeTab, selectedPlayoff?.id]);

  // ─── Derived data ──────────────────────────────────────
  const playoffTeams = selectedPlayoff?.teams || [];
  const currentPools = pools.filter((p) => p.playoff?.id === selectedPlayoff?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Playoffs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Setup playoff years, enter series results, and manage bracket pools
          </p>
        </div>
        <button
          onClick={() => setShowCreatePlayoff(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
        >
          + New Playoff Year
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 p-4">
          <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 p-4">
          <p className="text-sm text-success-600 dark:text-success-400">{success}</p>
        </div>
      )}

      {/* Create Playoff Year Inline Form */}
      {showCreatePlayoff && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Create Playoff Year</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Year</label>
              <input
                type="number"
                value={createForm.year}
                onChange={(e) => setCreateForm((f) => ({ ...f, year: e.target.value }))}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. 2026 NBA Playoffs"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreatePlayoff(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePlayoff}
              className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Playoff Year Selector */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Select Playoff Year
        </label>
        <div className="flex flex-wrap gap-3">
          {playoffs.length === 0 && (
            <p className="text-sm text-gray-400">No playoff years found. Create one first.</p>
          )}
          {playoffs.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPlayoff(p); clearAlerts(); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                selectedPlayoff?.id === p.id
                  ? 'bg-brand-500 !text-white border-brand-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300'
              }`}
            >
              {p.year} — {p.name}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                p.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                p.status === 'upcoming' ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400' :
                p.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {p.status || 'setup'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {selectedPlayoff && (
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'results', label: 'Series Results' },
            { key: 'pools', label: `Pools (${currentPools.length})` },
            { key: 'setup', label: 'Team Setup' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); clearAlerts(); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ═══════ TAB: Series Results ═══════ */}
      {selectedPlayoff && activeTab === 'results' && (
        <div className="space-y-6">
          {playoffTeams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-3">No teams assigned yet.</p>
              <button
                onClick={() => setActiveTab('setup')}
                className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
              >
                Go to Team Setup
              </button>
            </div>
          ) : (
            [1, 2, 3, 4].map((round) => {
              if (round === 4) {
                const finals = buildFinalsMatchup(playoffTeams);
                return (
                  <div key={round} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{roundLabels[round]}</h3>
                    </div>
                    <div className="p-5">
                      {finals && (finals.teamA || finals.teamB) ? (
                        <MatchupResultCard
                          matchup={finals}
                          round={round}
                          playoffTeams={playoffTeams}
                          onSubmit={submitResult}
                          saving={saving}
                        />
                      ) : (
                        <p className="text-sm text-gray-400 italic">Waiting for Conference Finals results...</p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={round} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{roundLabels[round]}</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {['East', 'West'].map((conf) => {
                      const matchups = buildMatchups(round, conf, playoffTeams);
                      if (matchups.length === 0) return null;
                      return (
                        <div key={conf}>
                          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                            {conf} Conference
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {matchups.map((m, i) => (
                              <MatchupResultCard
                                key={`${conf}-${round}-${i}`}
                                matchup={m}
                                round={round}
                                playoffTeams={playoffTeams}
                                onSubmit={submitResult}
                                saving={saving}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════ TAB: Pools ═══════ */}
      {selectedPlayoff && activeTab === 'pools' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Pool
            </label>
            <div className="flex flex-wrap gap-3">
              {currentPools.length === 0 && (
                <p className="text-sm text-gray-400">No pools for this playoff year.</p>
              )}
              {currentPools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => setSelectedPool(pool)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    selectedPool?.id === pool.id
                      ? 'bg-brand-500 !text-white border-brand-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300'
                  }`}
                >
                  {pool.pool_name}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                    pool.pool_status === 'open' ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400' :
                    pool.pool_status === 'locked' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {pool.pool_status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedPool && (
            <div className="flex gap-3">
              {selectedPool.pool_status === 'open' && (
                <button
                  onClick={lockPool}
                  className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                >
                  Lock Pool (Stop Bracket Edits)
                </button>
              )}
              <button
                onClick={recalculate}
                className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
              >
                Recalculate All Scores
              </button>
            </div>
          )}

          {selectedPool && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pool Number</p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white">{selectedPool.pool_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                  <p className="font-semibold capitalize text-gray-900 dark:text-white">{selectedPool.pool_status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Participants</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedPool.participants_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max Brackets</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedPool.max_brackets_per_user || 8}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: Team Setup ═══════ */}
      {selectedPlayoff && activeTab === 'setup' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Assign Teams — {selectedPlayoff.year} {selectedPlayoff.name}
              </h3>
              <button
                onClick={handleSaveTeams}
                disabled={savingTeams}
                className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition"
              >
                {savingTeams ? 'Saving...' : 'Save Teams'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {['East', 'West'].map((conf) => (
                <div key={conf}>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                    {conf} Conference
                  </h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((seed) => {
                      const idx = teamAssignments.findIndex((t) => t.conference === conf && t.seed === seed);
                      const currentTeamId = idx >= 0 ? teamAssignments[idx].team_id : '';
                      const confTeams = nbaTeams.filter((t) => t.conference === conf);
                      const otherTeams = nbaTeams.filter((t) => t.conference !== conf);
                      return (
                        <div key={seed} className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                            {seed}
                          </span>
                          <select
                            value={currentTeamId}
                            onChange={(e) => {
                              setTeamAssignments((prev) => {
                                const next = [...prev];
                                if (idx >= 0) {
                                  next[idx] = { ...next[idx], team_id: e.target.value };
                                }
                                return next;
                              });
                            }}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white"
                          >
                            <option value="">Select team...</option>
                            {confTeams.length > 0 && (
                              <optgroup label={`${conf} Conference`}>
                                {confTeams.map((t) => (
                                  <option key={t.id} value={t.id}>{t.nickname || t.name}</option>
                                ))}
                              </optgroup>
                            )}
                            {otherTeams.length > 0 && (
                              <optgroup label="Other">
                                {otherTeams.map((t) => (
                                  <option key={t.id} value={t.id}>{t.nickname || t.name} ({t.conference})</option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Matchup Result Card ─────────────────────────────────
const MatchupResultCard = ({ matchup, round, playoffTeams, onSubmit, saving }) => {
  const { teamA, teamB, seedA, seedB } = matchup;
  const isFinals = round === 4;

  // Find the NbaPlayoffTeam row for each team to check existing results
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
    if (aWon && teamAId) {
      setWinnerId(String(teamAId));
      setGames(String(actualGames || ''));
    } else if (bWon && teamBId) {
      setWinnerId(String(teamBId));
      setGames(String(actualGames || ''));
    }
  }, [aWon, bWon, teamAId, teamBId, actualGames]);

  if (!teamA && !teamB) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 opacity-60">
        <span className="text-sm text-gray-400 italic">Waiting for earlier results...</span>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!winnerId || !games) return;
    const winnerIsA = String(winnerId) === String(teamAId);
    const beatSeed = winnerIsA ? seedBDisplay : seedADisplay;
    onSubmit(winnerId, round, beatSeed, games);
  };

  const savingKey = `${winnerId}-${round}`;
  const isSaving = saving === savingKey;

  return (
    <div className={`rounded-lg border p-4 ${
      isCompleted
        ? 'border-success-200 dark:border-success-500/30 bg-success-50/50 dark:bg-success-500/5'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <TeamBadge name={teamAName} seed={seedADisplay} img={teamAImg} isWinner={aWon} conf={isFinals ? matchup.confA : null} />
          <span className="text-xs font-bold text-gray-400">vs</span>
          <TeamBadge name={teamBName} seed={seedBDisplay} img={teamBImg} isWinner={bWon} conf={isFinals ? matchup.confB : null} />
        </div>
        {isCompleted && actualGames && (
          <span className="text-xs font-semibold text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-500/20 px-2 py-0.5 rounded">
            4-{actualGames - 4}
          </span>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Winner</label>
          <select
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
            disabled={isSaving}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
          >
            <option value="">Select winner...</option>
            {teamAId && <option value={teamAId}>({seedADisplay}) {teamAName}</option>}
            {teamBId && <option value={teamBId}>({seedBDisplay}) {teamBName}</option>}
          </select>
        </div>
        <div className="w-24">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Games</label>
          <select
            value={games}
            onChange={(e) => setGames(e.target.value)}
            disabled={isSaving}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
          >
            <option value="">--</option>
            <option value="4">4 (sweep)</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!winnerId || !games || isSaving}
          className="px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving
            </span>
          ) : isCompleted ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
};

// ─── Team Badge ──────────────────────────────────────────
const TeamBadge = ({ name, seed, img, isWinner, conf }) => {
  if (!name || name === 'TBD') {
    return <span className="text-sm text-gray-400 dark:text-gray-500 italic">TBD</span>;
  }
  return (
    <div className={`flex items-center gap-2 ${isWinner ? 'font-bold' : ''}`}>
      {img && <img src={img} alt="" className="w-6 h-6 rounded-full object-cover" />}
      {seed && <span className="text-xs text-gray-400 dark:text-gray-500">({seed})</span>}
      <span className={`text-sm ${
        isWinner
          ? 'text-success-600 dark:text-success-400 font-semibold'
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {name}
      </span>
      {conf && <span className="text-xs text-gray-400 ml-1">{conf}</span>}
    </div>
  );
};

export default ManagePlayoffs;
