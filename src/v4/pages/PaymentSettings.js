import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import usePaymentMethod from '../hooks/usePaymentMethod';

const PAYMENT_TYPES = [
  {
    id: 'gcash',
    name: 'GCash',
    color: '#007DFE',
    letter: 'G',
    description: 'Send via GCash mobile wallet',
  },
  {
    id: 'maya',
    name: 'Maya',
    color: '#00B140',
    letter: 'M',
    description: 'Send via Maya (PayMaya) wallet',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    color: '#6B7280',
    letter: 'B',
    description: 'Direct bank deposit or transfer',
  },
];

const getTypeInfo = (typeId) => PAYMENT_TYPES.find(t => t.id === typeId) || null;

const TypeIcon = ({ typeId, size = 'lg' }) => {
  const info = getTypeInfo(typeId);
  if (!info) return null;
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sizeClasses} rounded-xl flex items-center justify-center font-bold !text-white flex-shrink-0`} style={{ backgroundColor: info.color }}>
      {info.letter}
    </div>
  );
};

const PaymentSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const { isSignedIn, isLoaded } = useUserContext();
  const { paymentMethod, loading, hasPaymentMethod, updatePaymentMethod, clearPaymentMethod } = usePaymentMethod();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    payment_type: '',
    payment_account_name: '',
    payment_account_number: '',
    payment_bank_name: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  const startEditing = () => {
    if (paymentMethod) {
      setFormData({
        payment_type: paymentMethod.payment_type || '',
        payment_account_name: paymentMethod.payment_account_name || '',
        payment_account_number: paymentMethod.payment_account_number || '',
        payment_bank_name: paymentMethod.payment_bank_name || '',
      });
    }
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const startAdding = () => {
    setFormData({ payment_type: '', payment_account_name: '', payment_account_number: '', payment_bank_name: '' });
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.payment_type) {
      setError('Please select a payment type');
      return;
    }
    if (!formData.payment_account_name.trim()) {
      setError('Please enter the account holder name');
      return;
    }
    if (!formData.payment_account_number.trim()) {
      setError('Please enter the account number');
      return;
    }
    if (formData.payment_type === 'bank' && !formData.payment_bank_name.trim()) {
      setError('Please enter the bank name');
      return;
    }

    setSaving(true);
    const result = await updatePaymentMethod(formData);
    setSaving(false);

    if (result.success) {
      if (redirectUrl) {
        navigate(redirectUrl);
        return;
      }
      setIsEditing(false);
      setSuccess('Payment method saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleRemove = async () => {
    clearPaymentMethod();
    setShowRemoveConfirm(false);
    setIsEditing(false);
    setSuccess('Payment method removed');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const typeInfo = hasPaymentMethod ? getTypeInfo(paymentMethod.payment_type) : null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Payment Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Set up your preferred payment method to receive prize payouts
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-500/20 dark:bg-success-500/10">
          <svg className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-success-700 dark:text-success-300">{success}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-500/20 dark:bg-error-500/10">
          <svg className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-error-700 dark:text-error-300">{error}</span>
        </div>
      )}

      {/* === SAVED PAYMENT METHOD CARD === */}
      {hasPaymentMethod && !isEditing && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          {/* Card header with color */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: typeInfo?.color + '12' }}>
            <div className="flex items-center gap-3">
              <TypeIcon typeId={paymentMethod.payment_type} />
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{typeInfo?.name || 'Payment Method'}</h2>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 dark:text-success-400">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Card details */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Account Holder</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{paymentMethod.payment_account_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {paymentMethod.payment_type === 'bank' ? 'Account Number' : 'Mobile Number'}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{paymentMethod.payment_account_number}</p>
              </div>
            </div>

            {paymentMethod.payment_type === 'bank' && paymentMethod.payment_bank_name && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{paymentMethod.payment_bank_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Card actions */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-error-600 bg-white ring-1 ring-inset ring-error-200 hover:bg-error-50 dark:bg-gray-800 dark:text-error-400 dark:ring-error-500/30 dark:hover:bg-error-500/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      )}

      {/* === EMPTY STATE === */}
      {!hasPaymentMethod && !isEditing && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-white/[0.03]">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No payment method set</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Add a payment method so we know where to send your winnings
          </p>
          <button
            onClick={startAdding}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Payment Method
          </button>
        </div>
      )}

      {/* === EDIT / ADD FORM === */}
      {isEditing && (
        <>
          {/* Payment Type Selection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYMENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, payment_type: type.id, payment_bank_name: type.id !== 'bank' ? '' : prev.payment_bank_name }))}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    formData.payment_type === type.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {formData.payment_type === type.id && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <TypeIcon typeId={type.id} size="sm" />
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">{type.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Details */}
          {formData.payment_type && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.payment_account_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_account_name: e.target.value }))}
                    placeholder="Full name on account"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    {formData.payment_type === 'bank' ? 'Account Number' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.payment_account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_account_number: e.target.value }))}
                    placeholder={formData.payment_type === 'bank' ? 'Bank account number' : '09XX XXX XXXX'}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
                  />
                </div>

                {formData.payment_type === 'bank' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.payment_bank_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_bank_name: e.target.value }))}
                      placeholder="e.g., BDO, BPI, UnionBank"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={cancelEditing}
              className="px-5 py-3 rounded-lg text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.payment_type}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Payment Method'
              )}
            </button>
          </div>
        </>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowRemoveConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Remove Payment Method?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">You can add a new one at any time</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm !text-white bg-error-500 hover:bg-error-600 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;
