import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import PageLoader from '../components/common/PageLoader';

const POOL_TYPE_CONFIG = {
  squares: {
    label: 'Squares Pools',
    heroDesc: 'Commissioners can create and manage their own squares pools. Apply now to get started.',
    benefits: [
      { icon: '\uD83C\uDFC8', title: 'Create Pools', desc: 'Set up custom squares pools for any sport or event' },
      { icon: '\uD83D\uDC65', title: 'Invite Players', desc: 'Share pool codes and grow your community' },
      { icon: '\uD83C\uDFC6', title: 'Manage Games', desc: 'Track scores, assign winners, and manage payouts' },
      { icon: '\uD83D\uDCCA', title: 'Commissioner Dashboard', desc: 'Access tools to oversee all your pools and players' },
    ],
    endpoint: '/api/squares-admin-applications',
    reasonPlaceholder: 'Tell us why you\'d like to create and manage squares pools...',
    approvedLinks: { create: '/pools/create', list: '/pools', createLabel: 'Create Your First Pool', listLabel: 'View All Pools' },
  },
  playoffs: {
    label: 'NBA Playoff Pools',
    heroDesc: 'Run NBA Playoff Pools with bracket predictions. Apply to become a Playoff Commissioner.',
    benefits: [
      { icon: '\uD83C\uDFC0', title: 'Create Playoff Pools', desc: 'Set up bracket prediction pools for the NBA Playoffs' },
      { icon: '\uD83D\uDC65', title: 'Invite Players', desc: 'Share pool codes and invite players to make bracket picks' },
      { icon: '\uD83C\uDFC6', title: 'Enter Round Results', desc: 'Update scores after each round and track standings' },
      { icon: '\uD83D\uDCCA', title: 'Commissioner Dashboard', desc: 'Access tools to manage your playoff pools' },
    ],
    endpoint: '/api/playoff-admin-applications',
    reasonPlaceholder: 'Tell us why you\'d like to create and manage NBA playoff pools...',
    approvedLinks: { create: '/playoffs', list: '/playoffs', createLabel: 'Go to Playoff Pools', listLabel: 'View Playoff Pools' },
  },
};

const Commissioner = () => {
  const axiosService = useAxios();
  const { user, clerkUser, isSignedIn, isLoaded, loading: userLoading, isSuperadmin, isSquareAdmin, isPlayoffAdmin } = useUserContext();

  const [poolType, setPoolType] = useState('squares');
  const [squaresStatus, setSquaresStatus] = useState(null);
  const [squaresData, setSquaresData] = useState(null);
  const [playoffsStatus, setPlayoffsStatus] = useState(null);
  const [playoffsData, setPlayoffsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    reason: '',
    experience: '',
    agreeToTerms: false,
  });

  const config = POOL_TYPE_CONFIG[poolType];

  // Derived status for the currently-selected pool type
  const applicationStatus = poolType === 'squares' ? squaresStatus : playoffsStatus;
  const applicationData = poolType === 'squares' ? squaresData : playoffsData;

  // Already-approved detection for the selected pool type
  const isAlreadyApproved = useMemo(() => {
    if (isSuperadmin) return true;
    if (poolType === 'squares') return isSquareAdmin;
    if (poolType === 'playoffs') return isPlayoffAdmin;
    return false;
  }, [poolType, isSuperadmin, isSquareAdmin, isPlayoffAdmin]);

  // Pre-fill form from Clerk user data
  useEffect(() => {
    if (clerkUser) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        email: prev.email || clerkUser.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [clerkUser]);

  // Fetch application statuses for both pool types on mount
  useEffect(() => {
    if (!isLoaded || userLoading) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 2) setLoading(false);
    };

    // Check squares status
    if (isSuperadmin || isSquareAdmin) {
      setSquaresStatus('approved');
      checkDone();
    } else {
      axiosService.get('/api/squares-admin-applications/my-status')
        .then((response) => {
          const data = response.data?.data || response.data;
          if (data && data.status) {
            setSquaresStatus(data.status);
            setSquaresData(data);
          }
        })
        .catch((err) => {
          if (err.response?.status !== 404) {
            console.error('Error checking squares application status:', err);
          }
        })
        .finally(checkDone);
    }

    // Check playoffs status
    if (isSuperadmin || isPlayoffAdmin) {
      setPlayoffsStatus('approved');
      checkDone();
    } else {
      axiosService.get('/api/playoff-admin-applications/my-status')
        .then((response) => {
          const data = response.data?.data || response.data;
          if (data && data.status) {
            setPlayoffsStatus(data.status);
            setPlayoffsData(data);
          }
        })
        .catch((err) => {
          if (err.response?.status !== 404) {
            console.error('Error checking playoff application status:', err);
          }
        })
        .finally(checkDone);
    }
  }, [isLoaded, isSignedIn, userLoading, isSuperadmin, isSquareAdmin, isPlayoffAdmin]);

  // Clear form errors when switching pool type
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [poolType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.reason.trim() || form.reason.trim().length < 10) {
      setError('Please provide a reason with at least 10 characters.');
      return;
    }
    if (!form.agreeToTerms) {
      setError('You must agree to the terms to submit your application.');
      return;
    }

    setSubmitting(true);
    try {
      await axiosService.post(config.endpoint, {
        full_name: form.full_name,
        email: form.email,
        reason: form.reason,
        experience: form.experience || null,
      });
      if (poolType === 'squares') {
        setSquaresStatus('pending');
      } else {
        setPlayoffsStatus('pending');
      }
      setSuccess('Application submitted successfully! We\'ll review it shortly.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit application. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading || !isLoaded || userLoading) {
    return <PageLoader />;
  }

  // Not signed in — prompt to sign in
  if (!isSignedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Become a Commissioner</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Sign in to apply and start creating your own sports pools.
          </p>
          <Link
            to={`/sign-in?redirect_url=${encodeURIComponent('/commissioner')}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            Sign In to Apply
          </Link>
        </div>
      </div>
    );
  }

  // State: Already approved for the selected pool type — redirect to dashboard
  if (isAlreadyApproved || applicationStatus === 'approved') {
    if (poolType === 'squares' && (isSquareAdmin || isSuperadmin)) {
      return <Navigate to="/commissioner-dashboard" replace />;
    }
    if (poolType === 'playoffs' && (isPlayoffAdmin || isSuperadmin)) {
      return <Navigate to="/commissioner-dashboard" replace />;
    }

    // Edge case: application approved but role/flag not yet updated in user object
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Pool type switcher — let user check the other type */}
        <PoolTypeSwitcher poolType={poolType} setPoolType={setPoolType} />

        <div className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
            You're a {poolType === 'squares' ? 'Squares' : 'Playoff'} Commissioner!
          </h2>
          <p className="text-green-700 dark:text-green-400 mb-2">
            Your application has been approved. You can now create and manage {poolType === 'squares' ? 'squares pools' : 'NBA playoff pools'}.
          </p>
          {applicationData?.admin_note && (
            <p className="text-sm text-green-600 dark:text-green-500 mt-2 italic">
              Reviewer note: "{applicationData.admin_note}"
            </p>
          )}
          {applicationData?.reviewed_at && (
            <p className="text-xs text-green-500 dark:text-green-600 mt-1">
              Approved on {new Date(applicationData.reviewed_at).toLocaleDateString()}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={config.approvedLinks.create}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {config.approvedLinks.createLabel}
            </Link>
            <Link
              to={config.approvedLinks.list}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 transition"
            >
              {config.approvedLinks.listLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State: Pending
  if (applicationStatus === 'pending') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        {/* Pool type switcher — let user check the other type */}
        <div className="max-w-2xl w-full mb-6">
          <PoolTypeSwitcher poolType={poolType} setPoolType={setPoolType} />
        </div>

        <div className="max-w-2xl w-full rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
            {poolType === 'squares' ? 'Squares Pools' : 'NBA Playoff Pools'} Application Under Review
          </h2>
          <p className="text-amber-700 dark:text-amber-400 mb-2">
            Your application has been submitted and is being reviewed. We'll notify you by email once a decision is made.
          </p>
          {applicationData?.created_at && (
            <p className="text-xs text-amber-500 dark:text-amber-600 mt-1">
              Submitted on {new Date(applicationData.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // State: Denied
  if (applicationStatus === 'denied') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Pool type switcher — let user check the other type */}
        <PoolTypeSwitcher poolType={poolType} setPoolType={setPoolType} />

        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
            {poolType === 'squares' ? 'Squares Pools' : 'NBA Playoff Pools'} Application Not Approved
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-2">
            Your application was reviewed and was not approved at this time.
          </p>
          {applicationData?.admin_note && (
            <p className="text-sm text-red-600 dark:text-red-500 mt-2 italic">
              Reviewer feedback: "{applicationData.admin_note}"
            </p>
          )}
          {applicationData?.reviewed_at && (
            <p className="text-xs text-red-500 dark:text-red-600 mt-1">
              Reviewed on {new Date(applicationData.reviewed_at).toLocaleDateString()}
            </p>
          )}
          <p className="text-sm text-red-600 dark:text-red-500 mt-4">
            If you have questions, please contact us for more information.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // State: No application — show form
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero section */}
      <div className="text-center mb-10">
        <div className="mx-auto w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Become a Commissioner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          {config.heroDesc}
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {config.benefits.map((b) => (
          <div
            key={b.title}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <span className="text-2xl">{b.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{b.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Application Form */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Application Form</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pool Type Dropdown — first field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              What type of pools do you want to run? <span className="text-red-500">*</span>
            </label>
            <select
              value={poolType}
              onChange={(e) => setPoolType(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="squares">Squares Pools</option>
              <option value="playoffs">NBA Playoff Pools</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Why do you want to become a Commissioner? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder={config.reasonPlaceholder}
            />
            <p className="mt-1 text-xs text-gray-400">Minimum 10 characters</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Experience / Background <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Any relevant experience managing pools, leagues, or communities..."
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={form.agreeToTerms}
              onChange={(e) => setForm({ ...form, agreeToTerms: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the OKRNG Commissioner Terms and understand that my application will be reviewed by the admin team. I will uphold fair play and community standards.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * Small reusable switcher shown on status pages (pending/approved/denied)
 * so a user who is already approved for squares can switch to see the playoffs form.
 */
const PoolTypeSwitcher = ({ poolType, setPoolType }) => (
  <div className="flex items-center gap-2 mb-6">
    <span className="text-sm text-gray-500 dark:text-gray-400">Viewing:</span>
    <select
      value={poolType}
      onChange={(e) => setPoolType(e.target.value)}
      className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 pr-8 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
    >
      <option value="squares">Squares Pools</option>
      <option value="playoffs">NBA Playoff Pools</option>
    </select>
  </div>
);

export default Commissioner;
