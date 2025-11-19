import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiDollarSign, FiUsers, FiTrendingUp, FiPlus, FiEye, FiAlertCircle, FiCreditCard, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useUserContext } from '../contexts/UserContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useTheme } from '../contexts/ThemeContext';
import SquaresApiService from '../services/squaresApiService';
import StatusBadge from '../components/ui/StatusBadge';

/**
 * Commissioner Dashboard
 * Manage pools and approve credit requests
 */
const SquaresAdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, isSignedIn, isLoaded } = useUserContext();
  const axiosService = useAxios();
  const squaresApiService = useMemo(() => new SquaresApiService(axiosService), [axiosService]);
  const { colors, isDark } = useTheme();

  const [pools, setPools] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [adminCreditRequests, setAdminCreditRequests] = useState([]);
  const [stats, setStats] = useState({
    totalPools: 0,
    activePools: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pools'); // 'pools', 'credit-requests', 'admin-requests'
  const [processingRequest, setProcessingRequest] = useState(null);

  const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id;
  const isSuperadmin = userRoleId === 1;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/v2/sign-in', { state: { returnTo: '/v2/squares/admin' } });
    }
  }, [isSignedIn, isLoaded, navigate]);

  useEffect(() => {
    if (isSignedIn) {
      loadDashboard();
    }
  }, [isSignedIn]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Load pools
      const poolsResponse = await squaresApiService.getPools();
      if (poolsResponse.success) {
        const allPools = poolsResponse.data;
        const currentUserId = currentUser?.user?.id || currentUser?.id;

        // Filter pools created by current user
        const myPools = allPools.filter(p =>
          p.admin_id === currentUserId || p.created_by === currentUserId
        );
        setPools(myPools);

        // Calculate stats
        const activePools = myPools.filter(p => p.pool_status === 'open').length;
        const totalRevenue = 0; // Would need to calculate from squares

        setStats(prev => ({
          ...prev,
          totalPools: myPools.length,
          activePools,
          totalRevenue,
        }));
      }

      // Load credit requests where I'm commissioner
      const requestsResponse = await squaresApiService.getCommissionerCreditRequests();
      if (requestsResponse.success) {
        const requests = requestsResponse.data;
        const pendingCount = requests.filter(r => r.status === 'pending').length;
        setCreditRequests(requests);
        setStats(prev => ({ ...prev, pendingRequests: pendingCount }));
      }

      // Load admin credit requests (Superadmin only)
      if (isSuperadmin) {
        const adminRequestsResponse = await squaresApiService.getSuperadminCreditRequests();
        if (adminRequestsResponse.success) {
          setAdminCreditRequests(adminRequestsResponse.data);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId, isAdminRequest = false) => {
    if (!window.confirm('Approve this credit request?')) return;

    setProcessingRequest(requestId);
    try {
      const response = isAdminRequest
        ? await squaresApiService.updateAdminCreditRequest(requestId, 'approved')
        : await squaresApiService.updateCreditRequest(requestId, 'approved');

      if (response.success) {
        alert('Credit request approved successfully!');
        await loadDashboard();
      } else {
        alert(response.error || 'Failed to approve request');
      }
    } catch (error) {
      alert('Failed to approve request: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDenyRequest = async (requestId, isAdminRequest = false) => {
    const reason = prompt('Reason for denial (optional):');
    if (reason === null) return; // User cancelled

    setProcessingRequest(requestId);
    try {
      const response = isAdminRequest
        ? await squaresApiService.updateAdminCreditRequest(requestId, 'denied', reason)
        : await squaresApiService.updateCreditRequest(requestId, 'denied', reason);

      if (response.success) {
        alert('Credit request denied.');
        await loadDashboard();
      } else {
        alert(response.error || 'Failed to deny request');
      }
    } catch (error) {
      alert('Failed to deny request: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCalculateWinners = async (poolId) => {
    if (!window.confirm('Calculate winners for all quarters? This will use the current game scores.')) return;

    try {
      const response = await squaresApiService.calculateAllWinners(poolId);
      if (response.success) {
        alert(`Winners calculated! ${response.data.winners_count || 0} winner(s) found.`);
        await loadDashboard();
      } else {
        alert(response.error || 'Failed to calculate winners');
      }
    } catch (error) {
      alert('Failed to calculate winners: ' + (error.message || 'Unknown error'));
    }
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

  // Using StatusBadge component for credit requests
  // Pool status badges (open/closed) keep inline for now
  const getPoolStatusBadge = (status) => {
    const isOpen = status === 'open';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isOpen ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
      }`}>
        {isOpen ? 'Open' : 'Closed'}
      </span>
    );
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div style={{ color: colors.text }} className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                Commissioner Dashboard
              </h1>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Manage your pools and credit requests
              </p>
            </div>
            <button
              onClick={() => navigate('/v2/squares/create')}
              className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 text-white"
              style={{ backgroundColor: colors.brand.primary }}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.brand.primaryHover}
              onMouseOut={(e) => e.target.style.backgroundColor = colors.brand.primary}
            >
              <FiPlus />
              Create New Pool
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Pools</p>
                <p className="text-white text-4xl font-bold mt-2">{stats.totalPools}</p>
              </div>
              <div className="bg-blue-500/30 p-4 rounded-lg">
                <FiGrid className="text-white text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Active Pools</p>
                <p className="text-white text-4xl font-bold mt-2">{stats.activePools}</p>
              </div>
              <div className="bg-green-500/30 p-4 rounded-lg">
                <FiTrendingUp className="text-white text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Pending Requests</p>
                <p className="text-white text-4xl font-bold mt-2">{stats.pendingRequests}</p>
              </div>
              <div className="bg-purple-500/30 p-4 rounded-lg">
                <FiCreditCard className="text-white text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Total Revenue</p>
                <p className="text-white text-4xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="bg-orange-500/30 p-4 rounded-lg">
                <FiDollarSign className="text-white text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <button
            onClick={() => setActiveTab('pools')}
            className="px-6 py-3 font-semibold transition-all"
            style={{
              color: activeTab === 'pools' ? colors.brand.primary : (isDark ? '#9CA3AF' : '#6B7280'),
              borderBottom: activeTab === 'pools' ? `2px solid ${colors.brand.primary}` : 'none'
            }}
          >
            My Pools ({pools.length})
          </button>
          <button
            onClick={() => setActiveTab('credit-requests')}
            className="px-6 py-3 font-semibold transition-all"
            style={{
              color: activeTab === 'credit-requests' ? colors.brand.primary : (isDark ? '#9CA3AF' : '#6B7280'),
              borderBottom: activeTab === 'credit-requests' ? `2px solid ${colors.brand.primary}` : 'none'
            }}
          >
            Credit Requests ({creditRequests.filter(r => r.status === 'pending').length})
          </button>
          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('admin-requests')}
              className="px-6 py-3 font-semibold transition-all"
              style={{
                color: activeTab === 'admin-requests' ? colors.brand.primary : (isDark ? '#9CA3AF' : '#6B7280'),
                borderBottom: activeTab === 'admin-requests' ? `2px solid ${colors.brand.primary}` : 'none'
              }}
            >
              Admin Requests ({adminCreditRequests.filter(r => r.status === 'pending').length})
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'pools' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text, marginBottom: '1.5rem' }}>Your Pools</h2>

            {pools.length === 0 ? (
              <div className="text-center py-12">
                <FiGrid className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-xl mb-6">No pools created yet</p>
                <button
                  onClick={() => navigate('/v2/squares/create')}
                  className="text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: colors.brand.primary }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
                >
                  Create Your First Pool
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pools.map((pool) => (
                  <div key={pool.id} className="rounded-lg p-4" style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}` }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" style={{ color: colors.text }}>
                          {pool.pool_name}
                        </h3>
                        <p className="text-gray-400 text-sm">Pool #{pool.pool_number}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPoolStatusBadge(pool.pool_status)}
                        <button
                          onClick={() => handleCalculateWinners(pool.id)}
                          className="text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                          style={{
                            backgroundColor: isDark ? '#1F2937' : '#374151',
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: colors.brand.primary
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = colors.brand.primary;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1F2937' : '#374151';
                          }}
                          title="Calculate winners for all quarters"
                        >
                          <FiTrendingUp />
                          Calculate Winners
                        </button>
                        <button
                          onClick={() => navigate(`/v2/squares/pool/${pool.id}`)}
                          className="text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                          style={{ backgroundColor: colors.brand.primary }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
                        >
                          <FiEye />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'credit-requests' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text, marginBottom: '1.5rem' }}>Player Credit Requests</h2>

            {creditRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiAlertCircle className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-xl" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>No credit requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {creditRequests.map((request) => (
                  <div key={request.id} className="rounded-lg p-6" style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}` }}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" style={{ color: colors.text }}>
                          {request.pool?.pool_name || `Pool #${request.pool?.pool_number}`}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">
                          From: {request.requester?.name || request.requester?.email}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Requested on {formatDate(request.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amount</p>
                        <p className="text-white font-bold text-2xl">{formatCurrency(request.amount)}</p>
                      </div>

                      {request.reason && (
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reason</p>
                          <p className="text-gray-300">{request.reason}</p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FiXCircle />
                          Deny
                        </button>
                      </div>
                    )}

                    {request.status !== 'pending' && request.admin_note && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Admin Note</p>
                        <p className="text-gray-300">{request.admin_note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin-requests' && isSuperadmin && (
          <div className="rounded-xl p-6" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text, marginBottom: '1.5rem' }}>Square Admin Credit Requests</h2>

            {adminCreditRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiAlertCircle className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-xl" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>No admin credit requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminCreditRequests.map((request) => (
                  <div key={request.id} className="bg-gray-800 rounded-lg border border-purple-700 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" style={{ color: colors.text }}>
                          Credit Request from Square Admin
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">
                          From: {request.requester?.name || request.requester?.email}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Requested on {formatDate(request.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amount</p>
                      <p className="text-white font-bold text-2xl">{formatCurrency(request.amount)}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reason</p>
                      <p className="text-gray-300">{request.reason}</p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                          onClick={() => handleApproveRequest(request.id, true)}
                          disabled={processingRequest === request.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request.id, true)}
                          disabled={processingRequest === request.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FiXCircle />
                          Deny
                        </button>
                      </div>
                    )}

                    {request.status !== 'pending' && request.admin_note && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Admin Note</p>
                        <p className="text-gray-300">{request.admin_note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SquaresAdminDashboard;
