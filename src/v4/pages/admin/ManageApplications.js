import React, { useState, useEffect } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import Modal from '../../components/admin/common/Modal';

const statusFilters = ['all', 'pending', 'approved', 'denied'];

const statusBadge = (status) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    approved: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
    denied: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const ManageApplications = () => {
  const axiosService = useAxios();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);

  // Review modal
  const [reviewModal, setReviewModal] = useState({ open: false, app: null, action: null });
  const [adminNote, setAdminNote] = useState('');

  const loadApplications = () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    axiosService.get(`/api/squares-admin-applications${params}`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load applications:', err);
        setApplications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const openReview = (app, action) => {
    setReviewModal({ open: true, app, action });
    setAdminNote('');
  };

  const closeReview = () => {
    setReviewModal({ open: false, app: null, action: null });
    setAdminNote('');
  };

  const handleReview = async () => {
    const { app, action } = reviewModal;
    if (!app || !action) return;

    setProcessing(app.id);
    try {
      await axiosService.patch(`/api/squares-admin-applications/${app.id}`, {
        status: action,
        admin_note: adminNote || null,
      });
      closeReview();
      loadApplications();
    } catch (err) {
      console.error(`Failed to ${action} application:`, err);
    } finally {
      setProcessing(null);
    }
  };

  // Count stats
  const counts = {
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    denied: applications.filter((a) => a.status === 'denied').length,
  };

  // When filter is "all", show all; otherwise the API already filters
  const displayedApps = applications;

  return (
    <div>
      <PageBreadcrumb pageTitle="Applications" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending', count: filter === 'all' ? counts.pending : (filter === 'pending' ? applications.length : '--'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Approved', count: filter === 'all' ? counts.approved : (filter === 'approved' ? applications.length : '--'), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Denied', count: filter === 'all' ? counts.denied : (filter === 'denied' ? applications.length : '--'), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border border-gray-200 dark:border-gray-800 p-4 ${stat.bg}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-brand-500 !text-white'
                : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayedApps.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No {filter !== 'all' ? filter : ''} applications found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Applicant</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Reason</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Date</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {displayedApps.map((app) => (
                  <tr key={app.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold shrink-0">
                          {(app.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{app.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={app.reason}>
                        {app.reason}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">{statusBadge(app.status)}</td>
                    <td className="px-5 py-4">
                      {app.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openReview(app, 'approved')}
                            disabled={processing === app.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium !text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => openReview(app, 'denied')}
                            disabled={processing === app.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium !text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Deny
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {app.reviewer?.name && (
                            <span>by {app.reviewer.name}</span>
                          )}
                          {app.reviewed_at && (
                            <span className="ml-1">on {new Date(app.reviewed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {displayedApps.map((app) => (
              <div key={app.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold shrink-0">
                      {(app.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{app.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{app.email}</p>
                    </div>
                  </div>
                  {statusBadge(app.status)}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{app.reason}</p>
                </div>

                {app.experience && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{app.experience}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-3">
                  <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                  {app.reviewer?.name && <span>Reviewed by {app.reviewer.name}</span>}
                </div>

                {app.admin_note && (
                  <div className="mb-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Admin Note</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{app.admin_note}"</p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => openReview(app, 'approved')}
                      disabled={processing === app.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium !text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openReview(app, 'denied')}
                      disabled={processing === app.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium !text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Approve/Deny Modal */}
      <Modal
        isOpen={reviewModal.open}
        onClose={closeReview}
        title={reviewModal.action === 'approved' ? 'Approve Application' : 'Deny Application'}
        maxWidth="max-w-md"
      >
        {reviewModal.app && (
          <div>
            {/* Applicant Info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold">
                {(reviewModal.app.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{reviewModal.app.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{reviewModal.app.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Their Reason</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{reviewModal.app.reason}</p>
            </div>

            {reviewModal.app.experience && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{reviewModal.app.experience}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Admin Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder={reviewModal.action === 'approved' ? 'Welcome message or instructions...' : 'Reason for denial...'}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeReview}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={processing === reviewModal.app?.id}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium !text-white transition disabled:opacity-50 ${
                  reviewModal.action === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing === reviewModal.app?.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {reviewModal.action === 'approved' ? 'Approve' : 'Deny'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageApplications;
