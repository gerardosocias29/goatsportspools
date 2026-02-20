import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'danger' }) => {
  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 !text-white'
    : 'bg-amber-500 hover:bg-amber-600 !text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition ${btnClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
