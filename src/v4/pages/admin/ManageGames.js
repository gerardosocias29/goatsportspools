import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import Modal from '../../components/admin/common/Modal';
import ConfirmModal from '../../components/admin/common/ConfirmModal';
import { useAxios } from '../../../app/contexts/AxiosContext';

const LEAGUES = ['NFL', 'NBA', 'PBA', 'NCAAF', 'NCAAB'];

const STATUS_COLORS = {
  Scheduled: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  'In Progress': 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  Final: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
};

const formatLocalDatetime = (utcString) => {
  if (!utcString) return '';
  const d = new Date(utcString);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const toInputDatetime = (utcString) => {
  if (!utcString) return '';
  const d = new Date(utcString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const ManageGames = () => {
  const { get, post, put, delete: del } = useAxios();
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScoresOpen, setIsScoresOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [scoresGame, setScoresGame] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    game_datetime: '',
    league: 'NFL',
    home_team_id: '',
    visitor_team_id: '',
  });

  const [scores, setScores] = useState({
    q1_home: 0, q1_visitor: 0,
    half_home: 0, half_visitor: 0,
    q3_home: 0, q3_visitor: 0,
    final_home: 0, final_visitor: 0,
    game_status: 'Scheduled',
  });

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await get('/api/games/manage');
      let gamesList = res.data?.data || res.data || [];
      if (filter) {
        gamesList = gamesList.filter((g) => g.league === filter);
      }
      setGames(gamesList);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await get('/api/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchGames();
  }, [filter]);

  const filteredTeams = teams.filter((t) => t.league === form.league);

  const openCreate = () => {
    setEditing(null);
    setForm({ game_datetime: '', league: 'NFL', home_team_id: '', visitor_team_id: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (game) => {
    setEditing(game);
    setForm({
      game_datetime: toInputDatetime(game.game_datetime),
      league: game.league || 'NFL',
      home_team_id: game.home_team_id || '',
      visitor_team_id: game.visitor_team_id || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openScores = (game) => {
    setScoresGame(game);
    setScores({
      q1_home: game.q1_home || 0,
      q1_visitor: game.q1_visitor || 0,
      half_home: game.half_home || 0,
      half_visitor: game.half_visitor || 0,
      q3_home: game.q3_home || 0,
      q3_visitor: game.q3_visitor || 0,
      final_home: game.final_home || game.home_team_score || 0,
      final_visitor: game.final_visitor || game.visitor_team_score || 0,
      game_status: game.game_status || 'Scheduled',
    });
    setIsScoresOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.game_datetime || !form.home_team_id || !form.visitor_team_id) {
      setError('Date/time, home team, and visitor team are required.');
      return;
    }
    if (form.home_team_id === form.visitor_team_id) {
      setError('Home and visitor teams must be different.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const homeTeam = teams.find((t) => t.id === Number(form.home_team_id));
      const visitorTeam = teams.find((t) => t.id === Number(form.visitor_team_id));
      const payload = {
        game_datetime: new Date(form.game_datetime).toISOString(),
        league: form.league,
        home_team: { id: homeTeam.id },
        favored_team: { id: homeTeam.id },
        underdog_team: { id: visitorTeam.id },
      };
      if (editing) {
        await post(`/api/games/update/${editing.id}`, payload);
      } else {
        await post('/api/games/create', payload);
      }
      setIsModalOpen(false);
      fetchGames();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save game.');
    } finally {
      setSaving(false);
    }
  };

  const handleScoresSave = async () => {
    if (!scoresGame) return;
    setSaving(true);
    try {
      await put(`/api/games/${scoresGame.id}/scores`, scores);
      setIsScoresOpen(false);
      fetchGames();
    } catch (err) {
      console.error('Failed to update scores:', err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (game) => {
    setDeleteTarget(game);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/api/games/${deleteTarget.id}`);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchGames();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete game.';
      alert(msg);
      setIsDeleteOpen(false);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : `Team #${teamId}`;
  };

  const getGameStatus = (game) => {
    if (game.game_status) return game.game_status;
    if (game.home_team_score > 0 || game.visitor_team_score > 0) return 'Final';
    if (new Date(game.game_datetime) < new Date()) return 'In Progress';
    return 'Scheduled';
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Games" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              !filter ? 'bg-brand-500 !text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {LEAGUES.map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === l ? 'bg-brand-500 !text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Game
        </button>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="h-5 w-full rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-500 dark:text-gray-400">No games found{filter ? ` for ${filter}` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => {
            const status = getGameStatus(game);
            const statusColor = STATUS_COLORS[status] || STATUS_COLORS.Scheduled;
            return (
              <div key={game.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md transition-shadow">
                {/* Date + Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatLocalDatetime(game.game_datetime)}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    {status}
                  </span>
                </div>

                {/* Teams */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
                      {game.home_team?.name || getTeamName(game.home_team_id)}
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white/90 ml-2">
                      {game.home_team_score || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {game.visitor_team?.name || getTeamName(game.visitor_team_id)}
                    </span>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-2">
                      {game.visitor_team_score || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    {game.league || 'NFL'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openScores(game)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition" title="Update Scores">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button onClick={() => openEdit(game)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Edit Game">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => confirmDelete(game)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Delete Game">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Game Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Game' : 'Create Game'}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.game_datetime} onChange={(e) => setForm({ ...form, game_datetime: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">League <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value, home_team_id: '', visitor_team_id: '' })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  {LEAGUES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Home Team <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.home_team_id} onChange={(e) => setForm({ ...form, home_team_id: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="">Select team...</option>
                  {filteredTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Visitor Team <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.visitor_team_id} onChange={(e) => setForm({ ...form, visitor_team_id: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="">Select team...</option>
                  {filteredTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition">
              {saving ? 'Saving...' : editing ? 'Update Game' : 'Create Game'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Scores Modal */}
      <Modal isOpen={isScoresOpen} onClose={() => setIsScoresOpen(false)} title="Update Scores">
        {scoresGame && (
          <div>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-white/90">{scoresGame.home_team?.name || getTeamName(scoresGame.home_team_id)}</span>
              {' vs '}
              <span className="font-semibold text-gray-800 dark:text-white/90">{scoresGame.visitor_team?.name || getTeamName(scoresGame.visitor_team_id)}</span>
            </div>

            {/* Score Grid */}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Period</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Home</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Visitor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {[
                    { label: 'Q1', home: 'q1_home', visitor: 'q1_visitor' },
                    { label: 'Half', home: 'half_home', visitor: 'half_visitor' },
                    { label: 'Q3', home: 'q3_home', visitor: 'q3_visitor' },
                    { label: 'Final', home: 'final_home', visitor: 'final_visitor' },
                  ].map((period) => (
                    <tr key={period.label}>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-medium">{period.label}</td>
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={scores[period.home]}
                          onChange={(e) => setScores({ ...scores, [period.home]: parseInt(e.target.value) || 0 })}
                          className="w-16 h-9 rounded-lg border border-gray-300 bg-transparent px-2 text-center text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={scores[period.visitor]}
                          onChange={(e) => setScores({ ...scores, [period.visitor]: parseInt(e.target.value) || 0 })}
                          className="w-16 h-9 rounded-lg border border-gray-300 bg-transparent px-2 text-center text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Game Status */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Game Status</label>
              <div className="relative">
                <select value={scores.game_status} onChange={(e) => setScores({ ...scores, game_status: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Final">Final</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsScoresOpen(false)} className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">Cancel</button>
              <button onClick={handleScoresSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition">
                {saving ? 'Saving...' : 'Save Scores'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Game" message={`Are you sure you want to delete this game? This action cannot be undone.`} />
    </>
  );
};

export default ManageGames;
