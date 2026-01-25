import React from 'react';
import { FiX, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

/**
 * ConfirmModal Component
 * A reusable confirmation dialog that replaces window.confirm()
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Called when modal is closed without confirmation
 * @param {function} onConfirm - Called when user confirms the action
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - Modal variant: "warning" | "danger" | "info" (default: "warning")
 * @param {boolean} loading - Whether the confirm action is loading
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
}) => {
  const { colors, isDark } = useTheme();

  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <FiAlertCircle size={28} />,
          color: colors.error,
          bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        };
      case 'info':
        return {
          icon: <FiInfo size={28} />,
          color: colors.info,
          bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        };
      case 'warning':
      default:
        return {
          icon: <FiAlertTriangle size={28} />,
          color: colors.warning,
          bgColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
        };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl"
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: colors.text, opacity: 0.6 }}
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: bgColor, color }}
          >
            {icon}
          </div>

          {/* Title */}
          <h3
            className="text-xl font-bold text-center mb-2"
            style={{ color: colors.text }}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            className="text-center mb-6"
            style={{ color: colors.text, opacity: 0.7 }}
          >
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              fullWidth
              onClick={handleConfirm}
              loading={loading}
              disabled={loading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
