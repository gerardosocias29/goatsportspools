import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { useUserContext } from '../contexts/UserContext';
import squaresApiService from '../services/squaresApiService';

/**
 * Credit Requests Page
 * Shows user's credit requests and allows Square Admins to request from Superadmin
 */
const CreditRequests = () => {
  const navigate = useNavigate();
  const { user: currentUser, isSignedIn, isLoaded } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [poolRequests, setPoolRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id;
  const isSquareAdmin = userRoleId === 2;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/v2/sign-in', { state: { returnTo: '/v2/credit-requests' } });
    }
  }, [isSignedIn, isLoaded, navigate]);

  useEffect(() => {
    if (isSignedIn) {
      loadCreditRequests();
    }
  }, [isSignedIn]);

  const loadCreditRequests = async () => {
    setLoading(true);
    try {
      const response = await squaresApiService.getMyCreditRequests();
      if (response.success) {
        setPoolRequests(response.data.pool_requests || []);
        setAdminRequests(response.data.admin_requests || []);
      }
    } catch (error) {
      console.error('Error loading credit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCredits = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    if (!requestReason.trim()) {
      alert('Please provide a reason for the request.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await squaresApiService.requestCreditsFromSuperadmin(amount, requestReason);
      if (response.success) {
        alert('Credit request submitted successfully!');
        setShowRequestModal(false);
        setRequestAmount('');
        setRequestReason('');
        await loadCreditRequests();
      } else {
        alert(response.error || 'Failed to submit request');
      }
    } catch (error) {
      alert('Failed to submit request: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: FiClock, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Pending' },
      approved: { icon: FiCheckCircle, color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Approved' },
      denied: { icon: FiXCircle, color: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'Denied' },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${badge.color}`}>
        <Icon className="text-sm" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Credit Requests</h1>
              <p className="text-gray-400">View and manage your credit requests</p>
            </div>

            {isSquareAdmin && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <FiCreditCard />
                Request Credits from Superadmin
              </button>
            )}
          </div>
        </div>

        {/* Pool Credit Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Pool Credit Requests</h2>
          {poolRequests.length === 0 ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <FiAlertCircle className="text-gray-600 text-4xl mx-auto mb-3" />
              <p className="text-gray-400">No pool credit requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {poolRequests.map((request) => (
                <div key={request.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {request.pool?.pool_name || `Pool #${request.pool?.pool_number}`}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Requested on {formatDate(request.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amount</p>
                      <p className="text-white font-bold text-xl">{formatCurrency(request.amount)}</p>
                    </div>

                    {request.commissioner && (
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Commissioner</p>
                        <p className="text-white">{request.commissioner.name || request.commissioner.email}</p>
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reason</p>
                      <p className="text-gray-300">{request.reason}</p>
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="border-t border-gray-800 pt-4 mt-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                        {request.status === 'approved' ? 'Approved' : 'Denied'} on
                      </p>
                      <p className="text-gray-300">{formatDate(request.approved_at)}</p>
                      {request.admin_note && (
                        <div className="mt-2">
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Admin Note</p>
                          <p className="text-gray-300">{request.admin_note}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Credit Requests (Square Admins only) */}
        {isSquareAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Requests to Superadmin</h2>
            {adminRequests.length === 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <FiAlertCircle className="text-gray-600 text-4xl mx-auto mb-3" />
                <p className="text-gray-400">No admin credit requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminRequests.map((request) => (
                  <div key={request.id} className="bg-gray-900 rounded-xl border border-purple-800 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">
                          Credit Request to Superadmin
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Requested on {formatDate(request.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amount</p>
                      <p className="text-white font-bold text-2xl">{formatCurrency(request.amount)}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reason</p>
                      <p className="text-gray-300">{request.reason}</p>
                    </div>

                    {request.status !== 'pending' && (
                      <div className="border-t border-gray-800 pt-4 mt-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                          {request.status === 'approved' ? 'Approved' : 'Denied'} on
                        </p>
                        <p className="text-gray-300">{formatDate(request.approved_at)}</p>
                        {request.admin_note && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Admin Note</p>
                            <p className="text-gray-300">{request.admin_note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Credits Modal (for Square Admins) */}
      {showRequestModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl border border-purple-700 shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <FiCreditCard className="text-purple-400 text-3xl" />
              <div>
                <h3 className="text-2xl font-bold text-white">Request Credits</h3>
                <p className="text-gray-400 text-sm">Request credits from Superadmin</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Amount *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Reason *</label>
                <textarea
                  rows="4"
                  placeholder="Explain why you need these credits..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCredits}
                  disabled={submitting || !requestAmount || !requestReason.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditRequests;
