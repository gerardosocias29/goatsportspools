import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import AdminMetricCard from '../../components/admin/common/AdminMetricCard';
import Modal from '../../components/admin/common/Modal';
import ConfirmModal from '../../components/admin/common/ConfirmModal';
import AuctionStatusBadge from '../../components/auction/AuctionStatusBadge';
import PageLoader from '../../components/common/PageLoader';
import useAuction from '../../hooks/useAuction';
import TournamentBracket from '../../../app/pages/screens/Bidding/TournamentBracket';

const ManageAuctions = () => {
  const navigate = useNavigate();
  const {
    fetchAllAuctions,
    createAuction,
    startAuction,
    endAuction,
    cancelAuction,
    setStreamUrl,
    setAmounts,
    fetchAuctionUsers,
  } = useAuction();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('auctions');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', auction: null });
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Create form
  const [createForm, setCreateForm] = useState({ name: '', event_date: '' });
  const [creating, setCreating] = useState(false);

  // Stream form
  const [streamUrlInput, setStreamUrlInput] = useState('');
  const [startingAuction, setStartingAuction] = useState(false);

  // Budget modal
  const [budgetModal, setBudgetModal] = useState({ open: false, user_id: 0, escrow_amount: '', total_budget: '' });
  const [savingBudget, setSavingBudget] = useState(false);

  // Add User modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [addUserSearch, setAddUserSearch] = useState('');
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);

  // Team/User details
  const [teamDetails, setTeamDetails] = useState(null);
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [owners, setOwners] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('East');

  const regions = ['East', 'West', 'Midwest', 'South'];

  const loadAuctions = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllAuctions();
    setAuctions(data);
    setLoading(false);
  }, [fetchAllAuctions]);

  useEffect(() => { loadAuctions(); }, [loadAuctions]);

  useEffect(() => {
    if (auctionDetails) {
      fetchAuctionUsers(auctionDetails.id).then(setOwners);
    }
  }, [auctionDetails, fetchAuctionUsers]);

  // Stats
  const stats = {
    total: auctions.length,
    live: auctions.filter((a) => a.status === 'live').length,
    pending: auctions.filter((a) => a.status === 'pending').length,
    completed: auctions.filter((a) => a.status === 'completed').length,
  };

  // Handlers
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const result = await createAuction(createForm);
    if (result.status) {
      setShowCreateModal(false);
      setCreateForm({ name: '', event_date: '' });
      loadAuctions();
    }
    setCreating(false);
  };

  const handleStartAuction = (auction) => {
    if (auction.is_finalized !== 1) return;
    setSelectedAuction(auction);
    setStreamUrlInput(auction.stream_url || '');
    setShowStreamModal(true);
  };

  const handleSetStreamAndStart = async (e) => {
    e.preventDefault();
    setStartingAuction(true);
    await setStreamUrl(selectedAuction.id, streamUrlInput);
    await startAuction(selectedAuction.id);
    setShowStreamModal(false);
    navigate(`/admin/auctions/live?auction_id=${selectedAuction.id}`);
    setStartingAuction(false);
  };

  const handleConfirmAction = async () => {
    const { type, auction } = confirmModal;
    if (type === 'end') await endAuction(auction.id);
    if (type === 'cancel') await cancelAuction(auction.id);
    setConfirmModal({ open: false, type: '', auction: null });
    loadAuctions();
  };

  const handleOpenAddUser = async () => {
    setShowAddUserModal(true);
    setAddUserSearch('');
    setLoadingAllUsers(true);
    const users = await fetchAuctionUsers(auctionDetails.id, 'all');
    setAllUsers(users);
    setLoadingAllUsers(false);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSavingBudget(true);
    await setAmounts(auctionDetails.id, {
      user_id: budgetModal.user_id,
      escrow_amount: budgetModal.escrow_amount || null,
      total_budget: budgetModal.total_budget || null,
    });
    setBudgetModal({ open: false, user_id: 0, escrow_amount: '', total_budget: '' });
    setSavingBudget(false);
    fetchAuctionUsers(auctionDetails.id).then(setOwners);
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Auctions" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <AdminMetricCard title="Total" value={stats.total} icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        } />
        <AdminMetricCard title="Live" value={stats.live} icon={
          <svg className="w-6 h-6 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.828a4 4 0 010-5.656m5.656 0a4 4 0 010 5.656M12 12h.008v.008H12V12z" /></svg>
        } />
        <AdminMetricCard title="Pending" value={stats.pending} icon={
          <svg className="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        } />
        <AdminMetricCard title="Completed" value={stats.completed} icon={
          <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        } />
      </div>

      {/* Header + Create */}
      <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'auctions', label: 'Auctions' },
            { key: 'teams', label: 'Team Details', disabled: !teamDetails },
            { key: 'users', label: 'User Details', disabled: !auctionDetails },
          ].map((tab) => (
            <button
              key={tab.key}
              disabled={tab.disabled}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'auctions') { setTeamDetails(null); setAuctionDetails(null); } }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-brand-500 border-brand-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'auctions' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Auction
          </button>
        )}
      </div>

      {/* Auctions Tab */}
      {activeTab === 'auctions' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {auctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-1">No auctions found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Create your first auction to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bracket</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {auctions.map((auction) => (
                      <tr key={auction.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-800 dark:text-white/90">{auction.name}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                          {auction.event_date
                            ? new Date(auction.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                            : '-'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {auction.items?.length || 0} items
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {auction.is_finalized === 1 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 dark:text-success-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Finalized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600 dark:text-warning-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                              Not Finalized
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <AuctionStatusBadge status={auction.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {auction.status === 'pending' && auction.is_finalized !== 1 && (
                              <button onClick={() => { setSelectedAuction(auction); setShowBracketModal(true); }} className="p-2 rounded-lg bg-warning-50 text-warning-600 hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:hover:bg-warning-500/20 transition-colors" title="Finalize Bracket">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                              </button>
                            )}
                            <button onClick={() => { setTeamDetails(auction.items); setAuctionDetails(auction); setActiveTab('teams'); }} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors" title="Team Details">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            <button onClick={() => { setTeamDetails(auction.items); setAuctionDetails(auction); setActiveTab('users'); }} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors" title="User Details">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </button>
                            {auction.status === 'pending' && (
                              <button onClick={() => handleStartAuction(auction)} disabled={auction.is_finalized !== 1} className={`p-2 rounded-lg transition-colors ${auction.is_finalized === 1 ? 'bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`} title={auction.is_finalized === 1 ? 'Start Auction' : 'Finalize bracket first'}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </button>
                            )}
                            {auction.status === 'live' && (
                              <>
                                <button onClick={() => navigate(`/admin/auctions/live?auction_id=${auction.id}`)} className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors" title="Live Control">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </button>
                                <button onClick={() => setConfirmModal({ open: true, type: 'end', auction })} className="p-2 rounded-lg bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors" title="End Auction">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                                </button>
                              </>
                            )}
                            {auction.status === 'pending' && (
                              <button onClick={() => setConfirmModal({ open: true, type: 'cancel', auction })} className="p-2 rounded-lg bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors" title="Cancel Auction">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
                {auctions.map((auction) => (
                  <div key={auction.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white/90 mb-1">{auction.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {auction.event_date ? new Date(auction.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </div>
                      </div>
                      <AuctionStatusBadge status={auction.status} />
                    </div>
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{auction.items?.length || 0} items</span>
                      <span>{auction.is_finalized === 1 ? 'Bracket finalized' : 'Not finalized'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {auction.status === 'pending' && auction.is_finalized !== 1 && (
                        <button onClick={() => { setSelectedAuction(auction); setShowBracketModal(true); }} className="px-3 py-1.5 rounded-lg bg-warning-50 text-warning-600 text-xs font-medium dark:bg-warning-500/10 dark:text-warning-400">Finalize</button>
                      )}
                      {auction.status === 'pending' && auction.is_finalized === 1 && (
                        <button onClick={() => handleStartAuction(auction)} className="px-3 py-1.5 rounded-lg bg-success-50 text-success-600 text-xs font-medium dark:bg-success-500/10 dark:text-success-400">Start</button>
                      )}
                      {auction.status === 'live' && (
                        <button onClick={() => navigate(`/admin/auctions/live?auction_id=${auction.id}`)} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium dark:bg-brand-500/10 dark:text-brand-400">Live Control</button>
                      )}
                      <button onClick={() => { setTeamDetails(auction.items); setAuctionDetails(auction); setActiveTab('teams'); }} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium dark:bg-gray-700 dark:text-gray-300">Teams</button>
                      <button onClick={() => { setTeamDetails(auction.items); setAuctionDetails(auction); setActiveTab('users'); }} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium dark:bg-gray-700 dark:text-gray-300">Users</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Team Details Tab */}
      {activeTab === 'teams' && teamDetails && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.05] gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{auctionDetails?.name} — Teams</h3>
            <div className="flex gap-2">
              {regions.map((r) => (
                <button key={r} onClick={() => setSelectedRegion(r)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedRegion === r ? 'bg-brand-500 !text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}>{r}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Region</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Seed</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">School</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nickname</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Owner</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {teamDetails.filter((t) => t?.region === selectedRegion).map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{team.region}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90">#{team.seed}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{team.ncaa_team?.school || team.name}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{team.ncaa_team?.nickname || '-'}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{team.owner?.name || '-'}</td>
                    <td className={`px-5 py-3 font-semibold ${team.sold_amount ? 'text-success-600 dark:text-success-400' : 'text-gray-400'}`}>
                      {team.sold_amount ? `$${Number(team.sold_amount).toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Tab */}
      {activeTab === 'users' && auctionDetails && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{auctionDetails?.name} — Users</h3>
            <button
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Owner</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Escrowed</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Spent</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Last Team</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-800 dark:text-white/90">#{owner.id} {owner.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{owner.email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {owner.auctions?.[0]?.escrow_amount ? `$${Number(owner.auctions[0].escrow_amount).toFixed(2)}` : <span className="text-lg" title="Unlimited">&#8734;</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {owner.auctions?.[0]?.total_budget ? `$${Number(owner.auctions[0].total_budget).toFixed(2)}` : <span className="text-lg" title="Unlimited">&#8734;</span>}
                    </td>
                    <td className="px-5 py-3 font-semibold text-success-600 dark:text-success-400">
                      {owner.total_sold_amount ? `$${Number(owner.total_sold_amount).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-5 py-3">
                      {owner.auction_items?.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{owner.auction_items[0]?.name}</span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setBudgetModal({
                          open: true,
                          user_id: owner.id,
                          escrow_amount: owner.auctions?.[0]?.escrow_amount || '',
                          total_budget: owner.auctions?.[0]?.total_budget || '',
                        })}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Edit Budget"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Auction Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Auction Event" maxWidth="max-w-md">
        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Auction Name</label>
            <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required placeholder="e.g. March Madness 2026" className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30" />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Event Date</label>
            <input type="datetime-local" value={createForm.event_date} onChange={(e) => setCreateForm({ ...createForm, event_date: e.target.value })} required className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50">{creating ? 'Creating...' : 'Create Auction'}</button>
          </div>
        </form>
      </Modal>

      {/* Stream URL + Start Modal */}
      <Modal isOpen={showStreamModal} onClose={() => setShowStreamModal(false)} title="Start Auction" maxWidth="max-w-md">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Set the livestream URL before starting the auction.</p>
        <form onSubmit={handleSetStreamAndStart}>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Stream URL (YouTube or Twitch)</label>
            <input type="url" value={streamUrlInput} onChange={(e) => setStreamUrlInput(e.target.value)} required placeholder="https://youtube.com/watch?v=..." className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowStreamModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">Cancel</button>
            <button type="submit" disabled={startingAuction} className="px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-success-500 hover:bg-success-600 transition disabled:opacity-50">{startingAuction ? 'Starting...' : 'Start Auction'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: '', auction: null })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'end' ? 'End Auction' : 'Cancel Auction'}
        message={confirmModal.type === 'end' ? `Are you sure you want to end "${confirmModal.auction?.name}"? This action cannot be undone.` : `Are you sure you want to cancel "${confirmModal.auction?.name}"?`}
        confirmLabel={confirmModal.type === 'end' ? 'End Auction' : 'Cancel Auction'}
        variant="danger"
      />

      {/* Budget Edit Modal */}
      <Modal isOpen={budgetModal.open} onClose={() => setBudgetModal({ open: false, user_id: 0, escrow_amount: '', total_budget: '' })} title="Set Budget" maxWidth="max-w-sm">
        <form onSubmit={handleSaveBudget}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Escrowed Amount</label>
            <input
              type="number"
              value={budgetModal.escrow_amount}
              onChange={(e) => setBudgetModal((prev) => ({ ...prev, escrow_amount: e.target.value }))}
              placeholder="Leave empty for unlimited"
              step="any"
              min="0"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Total Budget</label>
            <input
              type="number"
              value={budgetModal.total_budget}
              onChange={(e) => setBudgetModal((prev) => ({ ...prev, total_budget: e.target.value }))}
              placeholder="Leave empty for unlimited"
              step="any"
              min="0"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setBudgetModal({ open: false, user_id: 0, escrow_amount: '', total_budget: '' })} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">Cancel</button>
            <button type="submit" disabled={savingBudget} className="px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50">{savingBudget ? 'Saving...' : 'Update'}</button>
          </div>
        </form>
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add User to Auction" maxWidth="max-w-lg">
        <div className="mb-4">
          <input
            type="text"
            value={addUserSearch}
            onChange={(e) => setAddUserSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loadingAllUsers ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            allUsers
              .filter((u) => !u.auctions || u.auctions.length === 0)
              .filter((u) => {
                if (!addUserSearch) return true;
                const q = addUserSearch.toLowerCase();
                return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
              })
              .map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white/90 text-sm">#{user.id} {user.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddUserModal(false);
                      setBudgetModal({ open: true, user_id: user.id, escrow_amount: '', total_budget: '' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-500 !text-white text-xs font-medium hover:bg-brand-600 transition-colors"
                  >
                    Set Escrow
                  </button>
                </div>
              ))
          )}
          {!loadingAllUsers && allUsers.filter((u) => !u.auctions || u.auctions.length === 0).length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">All users already have escrow assigned.</p>
          )}
        </div>
      </Modal>

      {/* Tournament Bracket Modal */}
      <TournamentBracket
        auctionId={selectedAuction?.id}
        data={selectedAuction}
        visible={showBracketModal}
        onHide={() => { setShowBracketModal(false); setSelectedAuction(null); }}
        onSuccess={() => { setShowBracketModal(false); setSelectedAuction(null); loadAuctions(); }}
      />
    </>
  );
};

export default ManageAuctions;
