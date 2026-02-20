import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import Modal from '../../components/admin/common/Modal';

const QUARTER_LABELS = { 1: 'Q1', 2: 'Halftime', 3: 'Q3', 4: 'Final' };

const ManagePayouts = () => {
  const axios = useAxios();

  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Mark as Paid modal
  const [payModal, setPayModal] = useState({ open: false, winner: null });
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [paying, setPaying] = useState(false);
  const fileInputRef = useRef(null);

  // Proof view modal
  const [proofViewModal, setProofViewModal] = useState({ open: false, image: null });

  const loadWinners = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const response = await axios.get('/api/admin/payouts', { params });
      setWinners(response.data.data || []);
    } catch (err) {
      console.error('Error loading payouts:', err);
    } finally {
      setLoading(false);
    }
  }, [axios, statusFilter, search]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  // Stats
  const claimedWinners = winners.filter(w => w.player_id !== null);
  const totalPending = claimedWinners.filter(w => !w.is_paid).reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);
  const totalPaid = claimedWinners.filter(w => w.is_paid).reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);
  const pendingCount = claimedWinners.filter(w => !w.is_paid).length;
  const paidCount = claimedWinners.filter(w => w.is_paid).length;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!proofFile || !payModal.winner) return;
    setPaying(true);

    try {
      const formData = new FormData();
      formData.append('proof_image', proofFile);

      await axios.post(`/api/admin/payouts/${payModal.winner.id}/mark-paid`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPayModal({ open: false, winner: null });
      setProofFile(null);
      setProofPreview(null);
      await loadWinners();
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setPaying(false);
    }
  };

  const openPayModal = (winner) => {
    setPayModal({ open: true, winner });
    setProofFile(null);
    setProofPreview(null);
  };

  const getPlayerName = (winner) => {
    if (!winner.player) return 'Unclaimed';
    const p = winner.player;
    if (p.first_name || p.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    return p.username || p.email || 'Unknown';
  };

  const getPaymentInfo = (player) => {
    if (!player?.payment_type) return null;
    return {
      type: player.payment_type,
      name: player.payment_account_name,
      number: player.payment_account_number,
      bank: player.payment_bank_name,
    };
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Payouts" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending Payouts</p>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">{totalPending.toFixed(2)} total</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid</p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">{paidCount}</p>
          <p className="text-xs text-gray-400 mt-1">{totalPaid.toFixed(2)} total</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Winners</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{claimedWinners.length}</p>
          <p className="text-xs text-gray-400 mt-1">with claimed squares</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unclaimed Winners</p>
          <p className="text-2xl font-bold text-gray-400">{winners.filter(w => !w.player_id).length}</p>
          <p className="text-xs text-gray-400 mt-1">no player on square</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'paid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-brand-500 !text-white'
                  : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Winners Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : winners.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">No Payouts Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No winners matching your filters.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Pool</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Quarter</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Winner</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Winning #</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Prize</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Payment</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {winners.map((w) => {
                  const payment = getPaymentInfo(w.player);
                  return (
                    <tr key={w.id}>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-800 dark:text-white/90">{w.pool?.pool_name || '—'}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">#{w.pool?.pool_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {QUARTER_LABELS[w.quarter] || `Q${w.quarter}`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${w.player_id ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 italic'}`}>
                          {getPlayerName(w)}
                        </span>
                        {w.player?.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{w.player.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs">
                          {w.square?.x_number ?? w.home_score % 10} - {w.square?.y_number ?? w.visitor_score % 10}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                        {parseFloat(w.prize_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {payment ? (
                          <div>
                            <span className="text-xs capitalize text-gray-700 dark:text-gray-300">{payment.type}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">****{payment.number?.slice(-4)}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {w.is_paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                            Paid
                          </span>
                        ) : w.player_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Unclaimed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {w.is_paid ? (
                          <button
                            onClick={() => setProofViewModal({ open: true, image: w.proof_image })}
                            className="text-brand-500 hover:text-brand-600 text-xs font-medium transition-colors"
                          >
                            View Proof
                          </button>
                        ) : w.player_id ? (
                          <button
                            onClick={() => openPayModal(w)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
            {winners.map((w) => {
              const payment = getPaymentInfo(w.player);
              return (
                <div key={w.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm text-gray-800 dark:text-white/90">
                        {w.pool?.pool_name || '—'}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        #{w.pool?.pool_number} &bull; {QUARTER_LABELS[w.quarter] || `Q${w.quarter}`}
                      </p>
                    </div>
                    {w.is_paid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                        Paid
                      </span>
                    ) : w.player_id ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Unclaimed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${w.player_id ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}`}>
                      {getPlayerName(w)}
                    </span>
                    <span className="font-semibold text-sm text-gray-800 dark:text-white/90">
                      {parseFloat(w.prize_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs">
                        {w.square?.x_number ?? w.home_score % 10} - {w.square?.y_number ?? w.visitor_score % 10}
                      </span>
                      {payment && (
                        <span className="text-xs capitalize text-gray-500 dark:text-gray-400">{payment.type}</span>
                      )}
                    </div>
                    {w.is_paid ? (
                      <button
                        onClick={() => setProofViewModal({ open: true, image: w.proof_image })}
                        className="text-brand-500 text-xs font-medium"
                      >
                        View Proof
                      </button>
                    ) : w.player_id ? (
                      <button
                        onClick={() => openPayModal(w)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
                      >
                        Mark Paid
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      <Modal
        isOpen={payModal.open}
        onClose={() => { setPayModal({ open: false, winner: null }); setProofFile(null); setProofPreview(null); }}
        title="Mark as Paid"
        maxWidth="max-w-lg"
      >
        {payModal.winner && (
          <div className="space-y-5">
            {/* Winner Summary */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Winner</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{getPlayerName(payModal.winner)}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Prize</span>
                  <p className="font-semibold text-gray-800 dark:text-white/90">{parseFloat(payModal.winner.prize_amount).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Pool</span>
                  <p className="text-gray-700 dark:text-gray-300">{payModal.winner.pool?.pool_name}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Quarter</span>
                  <p className="text-gray-700 dark:text-gray-300">{QUARTER_LABELS[payModal.winner.quarter]}</p>
                </div>
              </div>

              {/* Payment method info */}
              {payModal.winner.player?.payment_type ? (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Send to</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                    {payModal.winner.player.payment_type === 'bank'
                      ? `Bank Transfer - ${payModal.winner.player.payment_bank_name}`
                      : payModal.winner.player.payment_type}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {payModal.winner.player.payment_account_name} &bull; {payModal.winner.player.payment_account_number}
                  </p>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-warning-600 dark:text-warning-400 font-medium">
                    Player has not set up a payment method
                  </span>
                </div>
              )}
            </div>

            {/* Proof Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Proof of Transfer
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  proofPreview
                    ? 'border-brand-300 dark:border-brand-500/30'
                    : 'border-gray-300 hover:border-brand-300 dark:border-gray-700 dark:hover:border-brand-500/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {proofPreview ? (
                  <div>
                    <img src={proofPreview} alt="Proof preview" className="max-h-48 mx-auto rounded-lg mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{proofFile?.name} &bull; Click to change</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Click to upload proof image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setPayModal({ open: false, winner: null }); setProofFile(null); setProofPreview(null); }}
                className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={!proofFile || paying}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-success-500 hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm & Mark as Paid'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Proof View Modal */}
      <Modal
        isOpen={proofViewModal.open}
        onClose={() => setProofViewModal({ open: false, image: null })}
        title="Proof of Transfer"
        maxWidth="max-w-lg"
      >
        {proofViewModal.image && (
          <img
            src={proofViewModal.image}
            alt="Proof of transfer"
            className="w-full rounded-xl"
          />
        )}
      </Modal>
    </>
  );
};

export default ManagePayouts;
