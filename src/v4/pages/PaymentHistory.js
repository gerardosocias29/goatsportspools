import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import usePaymentMethod from '../hooks/usePaymentMethod';
import Modal from '../components/admin/common/Modal';

const QUARTER_LABELS = { 1: 'Q1', 2: 'Halftime', 3: 'Q3', 4: 'Final' };

const PaymentHistory = () => {
  const navigate = useNavigate();
  const axios = useAxios();
  const { isSignedIn, isLoaded } = useUserContext();
  const { paymentMethod, hasPaymentMethod, loading: pmLoading } = usePaymentMethod();

  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState({ open: false, image: null });

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  const loadWinnings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/winnings');
      setWinnings(response.data.data || []);
    } catch (err) {
      console.error('Error loading winnings:', err);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadWinnings();
    }
  }, [isLoaded, isSignedIn, loadWinnings]);

  const totalWon = winnings.reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);
  const totalPaid = winnings.filter(w => w.is_paid).reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);
  const totalPending = totalWon - totalPaid;

  if (!isLoaded || loading || pmLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">My Winnings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View your prize history and payout status
        </p>
      </div>

      {/* Payment Method Summary */}
      {!hasPaymentMethod ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/20 dark:bg-warning-500/10">
          <svg className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <span className="text-sm font-medium text-warning-700 dark:text-warning-300">
              No payment method set up yet.
            </span>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-0.5">
              Set up your payment method so we can send your prize winnings.
            </p>
          </div>
          <Link
            to="/settings/payment"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium !text-white bg-warning-500 hover:bg-warning-600 transition"
          >
            Set Up Now
          </Link>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
              {paymentMethod.payment_type === 'bank' ? `Bank Transfer - ${paymentMethod.payment_bank_name}` : paymentMethod.payment_type}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {paymentMethod.payment_account_name} &bull; ****{paymentMethod.payment_account_number?.slice(-4)}
            </p>
          </div>
          <Link
            to="/settings/payment"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Won</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white/90">{totalWon.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid</p>
          <p className="text-xl font-bold text-success-600 dark:text-success-400">{totalPaid.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-xl font-bold text-warning-600 dark:text-warning-400">{totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Winnings List */}
      {winnings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">No Winnings Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Join pools and match those winning numbers! Your prize history will appear here.
            </p>
            <Link
              to="/pools"
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
            >
              Browse Pools
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Pool</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Quarter</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Winning #</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Prize</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {winnings.map((w) => (
                  <tr key={w.id}>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/pools/${w.pool?.pool_number}`}
                        className="font-medium text-gray-800 dark:text-white/90 hover:text-brand-500 transition-colors"
                      >
                        {w.pool?.pool_name || 'Pool'}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">#{w.pool?.pool_number}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {QUARTER_LABELS[w.quarter] || `Q${w.quarter}`}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs">
                        {w.square?.x_number ?? w.home_score % 10} - {w.square?.y_number ?? w.visitor_score % 10}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                      {parseFloat(w.prize_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {w.is_paid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {w.is_paid && w.proof_image ? (
                        <button
                          onClick={() => setProofModal({ open: true, image: w.proof_image })}
                          className="text-brand-500 hover:text-brand-600 text-xs font-medium transition-colors"
                        >
                          View Proof
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
            {winnings.map((w) => (
              <div key={w.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      to={`/pools/${w.pool?.pool_number}`}
                      className="font-medium text-sm text-gray-800 dark:text-white/90 hover:text-brand-500"
                    >
                      {w.pool?.pool_name || 'Pool'}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      #{w.pool?.pool_number} &bull; {QUARTER_LABELS[w.quarter] || `Q${w.quarter}`}
                    </p>
                  </div>
                  {w.is_paid ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                      Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Winning #: <span className="font-mono text-gray-700 dark:text-gray-300">{w.square?.x_number ?? w.home_score % 10} - {w.square?.y_number ?? w.visitor_score % 10}</span>
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white/90">
                    {parseFloat(w.prize_amount).toFixed(2)}
                  </span>
                </div>
                {w.is_paid && w.proof_image && (
                  <button
                    onClick={() => setProofModal({ open: true, image: w.proof_image })}
                    className="mt-2 text-brand-500 hover:text-brand-600 text-xs font-medium transition-colors"
                  >
                    View Proof of Transfer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Image Modal */}
      <Modal
        isOpen={proofModal.open}
        onClose={() => setProofModal({ open: false, image: null })}
        title="Proof of Transfer"
        maxWidth="max-w-lg"
      >
        {proofModal.image && (
          <img
            src={proofModal.image}
            alt="Proof of transfer"
            className="w-full rounded-xl"
          />
        )}
      </Modal>
    </div>
  );
};

export default PaymentHistory;
