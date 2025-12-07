import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiDollarSign, FiUsers, FiTrendingUp, FiPlus, FiEye, FiAlertCircle, FiCreditCard, FiCheckCircle, FiXCircle, FiSend, FiFileText } from 'react-icons/fi';
import { useUserContext } from '../contexts/UserContext';
import { useUser } from '@clerk/clerk-react';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../../app/contexts/ToastContext';
import SquaresApiService from '../services/squaresApiService';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmModal from '../components/ui/ConfirmModal';

/**
 * Commissioner Dashboard
 * Manage pools and approve credit requests
 */
const SquaresAdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, isSignedIn, isLoaded } = useUserContext();
  const { user: clerkUser } = useUser();
  const axiosService = useAxios();
  const squaresApiService = useMemo(() => new SquaresApiService(axiosService), [axiosService]);
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

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

  // Application form state for non-admins
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    reason: '',
    experience: '',
    agreeToTerms: false,
  });
  const [applicationStatus, setApplicationStatus] = useState(null); // null, 'pending', 'approved', 'denied'
  const [submittingApplication, setSubmittingApplication] = useState(false);

  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'warning',
    onConfirm: () => {},
  });

  const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id;
  const isSuperadmin = userRoleId == 1; // Use == for loose comparison (string/number)
  const isAdmin = userRoleId == 1 || userRoleId == 2; // Superadmin or Square Admin

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { state: { returnTo: '/squares/admin' } });
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Pre-fill application form with Clerk user data
  useEffect(() => {
    if (clerkUser && !isAdmin) {
      setApplicationForm(prev => ({
        ...prev,
        fullName: clerkUser.fullName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
      }));
      // Check if user already has a pending application
      checkApplicationStatus();
    }
  }, [clerkUser, isAdmin]);

  useEffect(() => {
    if (isSignedIn && isAdmin) {
      loadDashboard();
    } else if (isSignedIn && !isAdmin) {
      setLoading(false);
    }
  }, [isSignedIn, isAdmin]);

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

  // Check if non-admin user has a pending application
  const checkApplicationStatus = async () => {
    try {
      const response = await axiosService.get('/api/squares-admin-applications/my-status');
      if (response.data && response.data.status) {
        setApplicationStatus(response.data.status);
      }
    } catch (error) {
      // No application exists yet, that's fine
      console.log('No existing application found');
    }
  };

  // Handle application form submission
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();

    if (!applicationForm.agreeToTerms) {
      showToast({ severity: 'error', summary: 'Error', detail: 'You must agree to the terms to apply.' });
      return;
    }

    if (!applicationForm.reason.trim()) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Please provide a reason for your application.' });
      return;
    }

    setSubmittingApplication(true);
    try {
      const response = await axiosService.post('/api/squares-admin-applications', {
        full_name: applicationForm.fullName,
        email: applicationForm.email,
        reason: applicationForm.reason,
        experience: applicationForm.experience,
      });

      if (response.data) {
        setApplicationStatus('pending');
        showToast({ severity: 'success', summary: 'Application Submitted', detail: 'Your application has been submitted for review.' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit application';
      showToast({ severity: 'error', summary: 'Error', detail: errorMsg });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleApproveRequest = (requestId, isAdminRequest = false) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Credit Request',
      message: 'Are you sure you want to approve this credit request?',
      confirmText: 'Approve',
      variant: 'info',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setProcessingRequest(requestId);
        try {
          const response = isAdminRequest
            ? await squaresApiService.updateAdminCreditRequest(requestId, 'approved')
            : await squaresApiService.updateCreditRequest(requestId, 'approved');

          if (response.success) {
            showToast({ severity: 'success', summary: 'Approved', detail: 'Credit request approved successfully!' });
            await loadDashboard();
          } else {
            showToast({ severity: 'error', summary: 'Error', detail: response.error || 'Failed to approve request' });
          }
        } catch (error) {
          showToast({ severity: 'error', summary: 'Error', detail: 'Failed to approve request: ' + (error.message || 'Unknown error') });
        } finally {
          setProcessingRequest(null);
        }
      },
    });
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
        showToast({ severity: 'success', summary: 'Denied', detail: 'Credit request denied.' });
        await loadDashboard();
      } else {
        showToast({ severity: 'error', summary: 'Error', detail: response.error || 'Failed to deny request' });
      }
    } catch (error) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to deny request: ' + (error.message || 'Unknown error') });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCalculateWinners = (poolId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Calculate All Winners',
      message: 'Calculate winners for all quarters? This will use the current game scores.',
      confirmText: 'Calculate',
      variant: 'info',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await squaresApiService.calculateAllWinners(poolId);
          if (response.success) {
            showToast({ severity: 'success', summary: 'Success', detail: `Winners calculated! ${response.data.winners_count || 0} winner(s) found.` });
            await loadDashboard();
          } else {
            showToast({ severity: 'error', summary: 'Error', detail: response.error || 'Failed to calculate winners' });
          }
        } catch (error) {
          showToast({ severity: 'error', summary: 'Error', detail: 'Failed to calculate winners: ' + (error.message || 'Unknown error') });
        }
      },
    });
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

  // Non-admin view: Show application form
  if (!isAdmin) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
              Become a Commissioner
            </h1>
            <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Apply to become a Squares Pool commissioner and create your own pools
            </p>
          </div>

          {/* Application Status Message */}
          {applicationStatus === 'pending' && (
            <div
              className="rounded-xl p-6 mb-8 text-center"
              style={{
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.2)',
                border: `1px solid ${isDark ? '#F59E0B' : '#D97706'}`
              }}
            >
              <FiFileText className="text-5xl mx-auto mb-4" style={{ color: '#F59E0B' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                Application Pending
              </h2>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Your application is currently under review. We'll notify you once a decision has been made.
              </p>
            </div>
          )}

          {applicationStatus === 'approved' && (
            <div
              className="rounded-xl p-6 mb-8 text-center"
              style={{
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.2)',
                border: `1px solid ${isDark ? '#22C55E' : '#16A34A'}`
              }}
            >
              <FiCheckCircle className="text-5xl mx-auto mb-4" style={{ color: '#22C55E' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                Application Approved!
              </h2>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} className="mb-4">
                Congratulations! Your application has been approved. Please refresh the page to access the Commissioner Dashboard.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: colors.brand.primary }}
              >
                Refresh Page
              </button>
            </div>
          )}

          {applicationStatus === 'denied' && (
            <div
              className="rounded-xl p-6 mb-8 text-center"
              style={{
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${isDark ? '#EF4444' : '#DC2626'}`
              }}
            >
              <FiXCircle className="text-5xl mx-auto mb-4" style={{ color: '#EF4444' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                Application Denied
              </h2>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Unfortunately, your application was not approved at this time. Please contact support for more information.
              </p>
            </div>
          )}

          {/* Application Form - only show if no status */}
          {!applicationStatus && (
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                Commissioner Application
              </h2>

              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block font-medium mb-2" style={{ color: colors.text }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={applicationForm.fullName}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                    placeholder="Your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium mb-2" style={{ color: colors.text }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block font-medium mb-2" style={{ color: colors.text }}>
                    Why do you want to become a Commissioner? *
                  </label>
                  <textarea
                    value={applicationForm.reason}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                    placeholder="Tell us why you want to create and manage pools..."
                    rows="4"
                    required
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block font-medium mb-2" style={{ color: colors.text }}>
                    Experience / Background (Optional)
                  </label>
                  <textarea
                    value={applicationForm.experience}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                    placeholder="Any relevant experience running pools, sports knowledge, etc."
                    rows="3"
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={applicationForm.agreeToTerms}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    className="mt-1 w-5 h-5 rounded"
                    style={{ accentColor: colors.brand.primary }}
                  />
                  <label htmlFor="agreeToTerms" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    I agree to follow OKRNG's guidelines and terms for commissioners. I understand that I will be responsible for managing my pools fairly and honestly.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingApplication}
                  className="w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.brand.primary }}
                  onMouseOver={(e) => !submittingApplication && (e.currentTarget.style.backgroundColor = colors.brand.primaryHover)}
                  onMouseOut={(e) => !submittingApplication && (e.currentTarget.style.backgroundColor = colors.brand.primary)}
                >
                  {submittingApplication ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
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
              onClick={() => navigate('/squares/create')}
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
                  onClick={() => navigate('/squares/create')}
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
                          onClick={() => navigate(`/squares/pool/${pool.id}`)}
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
};

export default SquaresAdminDashboard;
