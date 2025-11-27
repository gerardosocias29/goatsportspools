import React, { useState, useRef } from 'react';
import { FiX, FiUpload, FiCamera, FiKey, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import Button from '../ui/Button';

/**
 * Join Pool Modal Component
 * Allows users to join a pool by:
 * 1. Uploading a QR code image
 * 2. Scanning QR code with camera (if supported)
 * 3. Typing pool number and password manually
 */
const JoinPoolModal = ({ isOpen, onClose, onSuccess }) => {
  const { colors, isDark } = useTheme();
  const axiosService = useAxios();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [mode, setMode] = useState('manual'); // 'manual', 'upload', 'scan'
  const [poolNumber, setPoolNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanning, setScanning] = useState(false);
  const [poolInfo, setPoolInfo] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setPoolNumber('');
    setPassword('');
    setError('');
    setSuccess('');
    setPoolInfo(null);
    setMode('manual');
    stopCamera();
    onClose();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const lookupPool = async (number) => {
    if (!number || number.length < 4) return;

    try {
      const response = await axiosService.get(`/api/squares-pools/by-number/${number}`);
      if (response.data?.status && response.data?.data) {
        setPoolInfo(response.data.data);
        setError('');
      }
    } catch (err) {
      setPoolInfo(null);
      // Don't show error for lookup - just means pool not found yet
    }
  };

  const handlePoolNumberChange = (value) => {
    const upperValue = value.toUpperCase();
    setPoolNumber(upperValue);
    setError('');

    // Auto-lookup when 6 characters entered
    if (upperValue.length >= 6) {
      lookupPool(upperValue);
    } else {
      setPoolInfo(null);
    }
  };

  const handleJoin = async () => {
    if (!poolNumber.trim()) {
      setError('Please enter the pool number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosService.post('/api/squares-pools/join', {
        pool_number: poolNumber.trim(),
        password: password || null,
      });

      if (response.data?.status) {
        setSuccess('Successfully joined the pool!');
        setTimeout(() => {
          onSuccess?.(response.data.data);
          handleClose();
        }, 1500);
      } else {
        setError(response.data?.message || 'Failed to join pool');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to join pool. Please check the pool number and password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Use browser's QR code detection if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const imageBitmap = await createImageBitmap(file);
        const barcodes = await barcodeDetector.detect(imageBitmap);

        if (barcodes.length > 0) {
          const qrData = barcodes[0].rawValue;
          parseQRData(qrData);
        } else {
          setError('No QR code found in the image. Please try again or enter the pool number manually.');
        }
      } else {
        // Fallback: Try to extract pool number from filename or show manual entry
        setError('QR scanning not supported in this browser. Please enter the pool number manually.');
        setMode('manual');
      }
    } catch (err) {
      setError('Failed to read QR code. Please try again or enter the pool number manually.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseQRData = (data) => {
    // QR code might contain: pool number, URL with pool number, or JSON with pool info
    try {
      // Try JSON first
      const json = JSON.parse(data);
      if (json.pool_number) {
        setPoolNumber(json.pool_number);
        lookupPool(json.pool_number);
        setMode('manual');
        return;
      }
    } catch {
      // Not JSON, continue
    }

    // Try URL parsing
    try {
      const url = new URL(data);

      // First check query parameters (e.g., /v2/squares/join?pool=ABC123)
      const poolParam = url.searchParams.get('pool');
      if (poolParam) {
        setPoolNumber(poolParam.toUpperCase());
        lookupPool(poolParam);
        setMode('manual');
        return;
      }

      // Then check path segments (e.g., /v2/squares/pool/ABC123)
      const pathParts = url.pathname.split('/');
      const poolIdx = pathParts.findIndex(p => p === 'pool' || p === 'join');
      if (poolIdx >= 0 && pathParts[poolIdx + 1]) {
        setPoolNumber(pathParts[poolIdx + 1].toUpperCase());
        lookupPool(pathParts[poolIdx + 1]);
        setMode('manual');
        return;
      }
    } catch {
      // Not a URL, continue
    }

    // Assume it's just the pool number
    if (data && data.length >= 4 && data.length <= 10) {
      setPoolNumber(data.toUpperCase());
      lookupPool(data);
      setMode('manual');
    } else {
      setError('Could not parse QR code data. Please enter the pool number manually.');
    }
  };

  const startCamera = async () => {
    setMode('scan');
    setScanning(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start scanning for QR codes
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });

          const scanFrame = async () => {
            if (!scanning || !videoRef.current) return;

            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const qrData = barcodes[0].rawValue;
                parseQRData(qrData);
                stopCamera();
                return;
              }
            } catch {
              // Continue scanning
            }

            if (scanning) {
              requestAnimationFrame(scanFrame);
            }
          };

          scanFrame();
        } else {
          setError('QR scanning not supported in this browser.');
          stopCamera();
        }
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access or upload a QR code image.');
      setScanning(false);
      setMode('manual');
    }
  };

  const overlayStyles = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  };

  const modalStyles = {
    backgroundColor: colors.card,
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  };

  const headerStyles = {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const bodyStyles = {
    padding: '1.5rem',
  };

  const inputStyles = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
    color: colors.text,
    fontSize: '1rem',
    outline: 'none',
  };

  const tabStyles = (active) => ({
    flex: 1,
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: active ? colors.brand.primary : 'transparent',
    color: active ? '#fff' : colors.text,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 150ms ease',
  });

  return (
    <div style={overlayStyles} onClick={handleClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: colors.text }}>
            Join a Pool
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: colors.text,
              opacity: 0.7,
            }}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyles}>
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: isDark ? '#1F2937' : '#E5E7EB', padding: '0.25rem', borderRadius: '0.625rem' }}>
            <button style={tabStyles(mode === 'manual')} onClick={() => { setMode('manual'); stopCamera(); }}>
              <FiKey size={18} />
              <span>Enter Code</span>
            </button>
            <button style={tabStyles(mode === 'upload')} onClick={() => { setMode('upload'); stopCamera(); }}>
              <FiUpload size={18} />
              <span>Upload QR</span>
            </button>
            <button style={tabStyles(mode === 'scan')} onClick={startCamera}>
              <FiCamera size={18} />
              <span>Scan QR</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.875rem',
              borderRadius: '0.5rem',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <FiAlertCircle />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: '0.875rem',
              borderRadius: '0.5rem',
              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22C55E',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <FiCheck />
              {success}
            </div>
          )}

          {/* Manual Entry Mode */}
          {mode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: colors.text }}>
                  Pool Number *
                </label>
                <input
                  type="text"
                  value={poolNumber}
                  onChange={(e) => handlePoolNumberChange(e.target.value)}
                  placeholder="Enter 6-character pool code (e.g., ABC123)"
                  style={inputStyles}
                  maxLength={10}
                />
              </div>

              {/* Pool Info Preview */}
              {poolInfo && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  border: `1px solid ${colors.border}`,
                }}>
                  <div style={{ fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>
                    {poolInfo.pool_name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.text, opacity: 0.7 }}>
                    {poolInfo.home_team?.name || 'TBD'} vs {poolInfo.visitor_team?.name || 'TBD'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.text, opacity: 0.7, marginTop: '0.25rem' }}>
                    {poolInfo.claimed_squares || 0}/100 squares filled • ${poolInfo.entry_fee || 0}/square
                  </div>
                  {poolInfo.password && (
                    <div style={{ fontSize: '0.75rem', color: colors.brand.primary, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiKey size={12} />
                      Password required
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: colors.text }}>
                  Password {poolInfo?.password ? '*' : '(if required)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter pool password"
                  style={inputStyles}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleJoin}
                disabled={loading || !poolNumber.trim()}
              >
                {loading ? 'Joining...' : 'Join Pool'}
              </Button>
            </div>
          )}

          {/* Upload QR Mode */}
          {mode === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${colors.border}`,
                  borderRadius: '1rem',
                  padding: '3rem 2rem',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = colors.brand.primary}
                onMouseOut={(e) => e.currentTarget.style.borderColor = colors.border}
              >
                <FiUpload size={48} style={{ color: colors.brand.primary, marginBottom: '1rem' }} />
                <p style={{ color: colors.text, fontWeight: 600, marginBottom: '0.5rem' }}>
                  Click to upload QR code image
                </p>
                <p style={{ color: colors.text, opacity: 0.6, fontSize: '0.875rem' }}>
                  PNG, JPG or GIF
                </p>
              </div>

              {loading && (
                <p style={{ marginTop: '1rem', color: colors.text }}>
                  Processing QR code...
                </p>
              )}
            </div>
          )}

          {/* Scan QR Mode */}
          {mode === 'scan' && (
            <div style={{ textAlign: 'center' }}>
              {scanning ? (
                <>
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      borderRadius: '0.5rem',
                      backgroundColor: '#000',
                    }}
                    playsInline
                    muted
                  />
                  <p style={{ marginTop: '1rem', color: colors.text }}>
                    Point camera at QR code...
                  </p>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={stopCamera}
                    style={{ marginTop: '1rem' }}
                  >
                    Cancel Scan
                  </Button>
                </>
              ) : (
                <>
                  <FiCamera size={48} style={{ color: colors.brand.primary, marginBottom: '1rem' }} />
                  <p style={{ color: colors.text, fontWeight: 600, marginBottom: '1rem' }}>
                    Camera not active
                  </p>
                  <Button variant="primary" size="lg" onClick={startCamera}>
                    Start Camera
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Help Text */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          }}>
            <p style={{ color: colors.text, fontSize: '0.875rem', margin: 0 }}>
              <strong>Need a pool code?</strong> Ask the pool admin for the pool number or QR code to join their pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPoolModal;
