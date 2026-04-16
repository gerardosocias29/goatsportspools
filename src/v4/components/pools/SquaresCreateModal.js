import React from 'react';
import Modal from '../admin/common/Modal';
import CreatePoolForm from './CreatePoolForm';

/**
 * Modal wrapper around the Squares pool creation wizard.
 *
 * Props:
 *  - isOpen           : controls visibility
 *  - onClose()        : called when user closes the modal (cancel/X/backdrop)
 *  - onCreated(pool)  : called after a pool is successfully created — receives { poolNumber, pool }
 */
const SquaresCreateModal = ({ isOpen, onClose, onCreated }) => {
  if (!isOpen) return null;

  const handleSuccess = (poolNumber, pool) => {
    if (onCreated) onCreated({ poolNumber, pool });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Squares Pool"
      maxWidth="max-w-4xl"
    >
      <CreatePoolForm
        compact
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default SquaresCreateModal;
