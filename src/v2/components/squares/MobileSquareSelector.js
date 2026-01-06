import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiGrid, FiDollarSign } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Mobile-Optimized Square Selection Modal
 * Bottom sheet style interface for mobile square claiming
 */
const MobileSquareSelector = ({
  isOpen,
  onClose,
  selectedSquares = [],
  onConfirm,
  costPerSquare = 0,
  userCredits = null,
  maxSquaresPerPlayer = null,
  currentUserOwnedCount = 0,
  poolType = 'OPEN',
}) => {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
      // Prevent body scroll on mobile
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCost = selectedSquares.length * costPerSquare;
  const canAfford = userCredits === null || userCredits >= totalCost;
  const remainingSlots = maxSquaresPerPlayer ? maxSquaresPerPlayer - currentUserOwnedCount : Infinity;
  const withinLimit = remainingSlots >= selectedSquares.length;

  const handleConfirm = () => {
    if (canAfford && withinLimit) {
      onConfirm();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black z-50 transition-opacity duration-300"
        style={{ opacity: isVisible ? 0.7 : 0 }}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '85vh',
        }}
      >
        <div
          className="rounded-t-3xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: colors.card,
            borderTop: `4px solid ${colors.brand.primary}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{ backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }}
            />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.brand.primary}20` }}
                >
                  <FiGrid size={24} style={{ color: colors.brand.primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                    Confirm Selection
                  </h3>
                  <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  color: colors.text,
                }}
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(85vh-180px)] overflow-y-auto">
            {/* Selected Squares List */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                Selected Squares
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {selectedSquares.map((square, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg text-center"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="text-xs font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Row {square.y_coordinate}
                    </div>
                    <div className="text-lg font-bold" style={{ color: colors.brand.primary }}>
                      {square.x_coordinate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Summary (for CREDIT and CREDIT_OPEN pools) */}
            {(poolType === 'CREDIT' || poolType === 'CREDIT_OPEN') && costPerSquare > 0 && (
              <div
                className="p-4 rounded-xl mb-4"
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    Cost per square:
                  </span>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>
                    {costPerSquare} credits
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    Total squares:
                  </span>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>
                    {selectedSquares.length}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between pt-2 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <span className="text-base font-bold" style={{ color: colors.text }}>
                    Total cost:
                  </span>
                  <span className="text-xl font-bold" style={{ color: colors.brand.primary }}>
                    {totalCost} credits
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    Available credits:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: canAfford ? colors.success : colors.error }}
                  >
                    {userCredits} credits
                  </span>
                </div>
              </div>
            )}

            {/* Limit Warning */}
            {maxSquaresPerPlayer && (
              <div
                className="p-3 rounded-lg mb-4"
                style={{
                  backgroundColor: withinLimit
                    ? isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)'
                    : isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${withinLimit ? colors.success : colors.error}`,
                }}
              >
                <div className="text-sm font-medium" style={{ color: withinLimit ? colors.success : colors.error }}>
                  {withinLimit ? (
                    <>
                      <FiCheck className="inline mr-2" />
                      {remainingSlots - selectedSquares.length} slot{(remainingSlots - selectedSquares.length) !== 1 ? 's' : ''} remaining
                    </>
                  ) : (
                    <>Limit exceeded! Max {maxSquaresPerPlayer} squares per player</>
                  )}
                </div>
                <div className="text-xs mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  You own: {currentUserOwnedCount} | Selecting: {selectedSquares.length} | Max: {maxSquaresPerPlayer}
                </div>
              </div>
            )}

            {/* Insufficient Credits Warning */}
            {!canAfford && (
              <div
                className="p-3 rounded-lg mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${colors.error}`,
                }}
              >
                <div className="text-sm font-medium" style={{ color: colors.error }}>
                  Insufficient Credits
                </div>
                <div className="text-xs mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  You need {totalCost - userCredits} more credits to complete this selection
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className="px-6 py-4 border-t"
            style={{
              borderColor: colors.border,
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.95)',
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-4 rounded-xl font-bold text-base transition-all active:scale-95"
                style={{
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  color: colors.text,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canAfford || !withinLimit}
                className="py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: colors.brand.primary,
                  color: '#FFFFFF',
                  boxShadow: canAfford && withinLimit ? '0 4px 12px rgba(212, 122, 62, 0.4)' : 'none',
                }}
              >
                <FiCheck className="inline mr-2" size={20} />
                Claim Squares
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSquareSelector;
