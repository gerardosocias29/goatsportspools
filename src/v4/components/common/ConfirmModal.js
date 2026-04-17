import React from 'react';
import SharedModal from '../admin/common/Modal';

const VARIANTS = {
  brand: 'bg-brand-500 hover:bg-brand-600 !text-white',
  warn: 'bg-yellow-500 hover:bg-yellow-600 !text-white',
  danger: 'bg-red-600 hover:bg-red-700 !text-white',
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'brand',
  busy = false,
}) => {
  if (!isOpen) return null;

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[confirmVariant] || VARIANTS.brand}`}
        >
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </SharedModal>
  );
};

export default ConfirmModal;
