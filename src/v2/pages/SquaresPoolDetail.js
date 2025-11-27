import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiGrid, FiLock, FiUnlock, FiTrendingUp, FiAward, FiShare2, FiDownload, FiX, FiCreditCard, FiCheck, FiChevronDown, FiSettings } from 'react-icons/fi';
import SquaresGrid from '../components/squares/SquaresGrid';
import WinnersDisplay from '../components/squares/WinnersDisplay';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { TeamTemplate } from '../../app/pages/screens/games/NFLTemplates';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../../app/contexts/ToastContext';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * Reusable Loading Modal Component
 */
const LoadingModal = ({ message, count }) => {
  const { colors, isDark } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
        style={{
          backgroundColor: colors.card,
          border: `2px solid ${colors.brand.primary}`
        }}
      >
        <div className="flex flex-col items-center">
          {/* Spinning Logo */}
          <div className="relative w-24 h-24 mb-6">
            <svg
              className="absolute inset-0 w-24 h-24 animate-spin"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={colors.brand.primary}
                strokeWidth="4"
                strokeDasharray="300 360"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/assets/images/favicon.png"
                alt="Loading"
                className="w-12 h-12 animate-bounce"
              />
            </div>
          </div>

          {/* Message */}
          <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>{message}</h3>
          {count && (
            <p className="text-center mb-4" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Processing {count} square{count !== 1 ? 's' : ''}...
            </p>
          )}

          {/* Progress indicator */}
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}>
            <div
              className="h-full rounded-full animate-pulse w-3/4"
              style={{ backgroundColor: colors.brand.primary }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Pool Detail Page
 * Shows grid details and allows square selection
 */
const SquaresPoolDetail = () => {
  const { colors, isDark } = useTheme();
  const { poolId } = useParams();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const showToast = useToast();
  const { user: currentUser, isSignedIn, isLoaded } = useUserContext(); // Get user from context

  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [winners, setWinners] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showWinners, setShowWinners] = useState(false);
  const [calculatingWinners, setCalculatingWinners] = useState(false);
  const [confirmingSquares, setConfirmingSquares] = useState(false);
  const [updatingPool, setUpdatingPool] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditAmounts, setCreditAmounts] = useState({});
  const [teams, setTeams] = useState([]);
  const [poolPlayers, setPoolPlayers] = useState([]);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [downloadingQR, setDownloadingQR] = useState(false);
  const [assigningNumbers, setAssigningNumbers] = useState(false);
  const [poolPlayersNotice, setPoolPlayersNotice] = useState({ type: '', message: '' });
  const [showRequestCreditsModal, setShowRequestCreditsModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestingCredits, setRequestingCredits] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [visitorScore, setVisitorScore] = useState('');
  const QRCodeCanvasComponent = QRCodeCanvas;
  const qrCanvasRef = useRef(null);
  const getCurrentUserId = (userObj = currentUser) => userObj?.user?.id || userObj?.id;
  const getCurrentUserRole = (userObj = currentUser) => userObj?.user?.role_id ?? userObj?.role_id;
  const getPoolNumber = (poolObj = pool) => poolObj?.pool_number || poolObj?.poolNumber || '';
  const getPoolJoinUrl = () => {
    const poolNumber = getPoolNumber();
    if (!poolNumber) return '';

    const isGoogleQrUrl = (url) => url && /chart\.googleapis\.com/i.test(url);

    // Prefer backend-provided join URL if available and not a Google QR endpoint
    const backendUrl = pool?.qr_join_url || pool?.join_url;
    if (backendUrl && !isGoogleQrUrl(backendUrl)) {
      return backendUrl;
    }

    // Fallback: build join link from app origin
    const baseUrl =
      process.env.REACT_APP_PUBLIC_URL ||
      process.env.REACT_APP_APP_URL ||
      process.env.REACT_APP_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    if (!baseUrl) return '';

    const normalizedBase = baseUrl.replace(/\/$/, '');
    return `${normalizedBase}/v2/squares/join?pool=${poolNumber}`;
  };

  // Authentication guard - redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/v2/sign-in', { state: { returnTo: `/v2/squares/pool/${poolId}` } });
    }
  }, [isSignedIn, isLoaded, poolId, navigate]);

  useEffect(() => {
    const initPage = async () => {
      loadTeams();
      loadPool(); // currentUser is available from context
      loadWinners();
    };
    initPage();
  }, [poolId, currentUser]);

  const loadTeams = async () => {
    try {
      const response = await axiosService.get('/api/teams');
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadPool = async (userData = null, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await axiosService.get(`/api/squares-pools/${poolId}`);
      const poolData = response.data.data || response.data;

      // Debug: Log pool data
      console.log('=== POOL DATA ===');
      console.log('Pool:', poolData);
      console.log('Squares count:', poolData.squares?.length);
      console.log('Sample squares:', poolData.squares?.slice(0, 3));
      console.log('x_numbers:', poolData.x_numbers);
      console.log('y_numbers:', poolData.y_numbers);

      // Debug: Check current user ID
      const debugUserId = userData?.user?.id || userData?.id || currentUser?.user?.id || currentUser?.id;
      console.log('Current User ID:', debugUserId);
      console.log('Current User Object:', userData || currentUser);

      // Debug: Check owned squares
      const ownedSquares = poolData.squares?.filter(s => s.player_id === debugUserId);
      console.log('Owned squares by current user:', ownedSquares);

      setPool(poolData);

      // Use passed userData or fallback to state
      const user = userData || currentUser;
      const currentUserId = getCurrentUserId(user);
      const roleId = getCurrentUserRole(user);
      const isOwner = poolData.admin_id === currentUserId || poolData.created_by === currentUserId;
      const isAdminRole = roleId === 1 || roleId === 2;

      // Use backend-provided user_joined flag (most reliable)
      const joined = poolData.user_joined === true;

      // Pool owner and admins are automatically considered joined
      setHasJoined(isOwner || joined || isAdminRole);
    } catch (error) {
      console.error('Error loading pool:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadWinners = async () => {
    try {
      const response = await axiosService.get(`/api/squares-pools/${poolId}/winners`);
      setWinners(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading winners:', error);
    }
  };

  const handleJoinPool = async () => {
    setJoinError('');
    try {
      const response = await axiosService.post('/api/squares-pools/join', {
        pool_number: pool.pool_number || pool.poolNumber,
        password: joinPassword,
      });
      setHasJoined(true);
      setShowJoinModal(false);
      setJoinPassword('');
      await loadPool(null, true); // Reload pool data silently
    } catch (error) {
      setJoinError(error.response?.data?.message || 'Failed to join pool');
    }
  };

  const handleSquareSelection = (squares) => {
    setSelectedSquares(squares);
  };

  const handleConfirmSelection = async () => {
    if (selectedSquares.length === 0) return;

    setConfirmingSquares(true);
    try {
      // Backend expects individual square claims, but we can batch them
      for (const square of selectedSquares) {
        await axiosService.post(`/api/squares-pools/${poolId}/claim-square`, {
          x_coordinate: square.x_coordinate,
          y_coordinate: square.y_coordinate,
        });
      }
      // Reload pool to get updated data (silent = no full-page loader)
      await loadPool(null, true);
      setSelectedSquares([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Error selecting squares:', error);
      alert('Failed to select squares: ' + (error.response?.data?.message || error.message));
    } finally {
      setConfirmingSquares(false);
    }
  };

  // Open score modal for a specific quarter
  const handleOpenScoreModal = (quarter) => {
    setSelectedQuarter(quarter);
    // Pre-fill with existing scores if available
    const existingWinner = winners.find(w => w.quarter === quarter);
    if (existingWinner) {
      setHomeScore(existingWinner.home_score?.toString() || '');
      setVisitorScore(existingWinner.visitor_score?.toString() || '');
    } else {
      setHomeScore('');
      setVisitorScore('');
    }
    setShowScoreModal(true);
  };

  // Close score modal
  const handleCloseScoreModal = () => {
    setShowScoreModal(false);
    setSelectedQuarter(null);
    setHomeScore('');
    setVisitorScore('');
  };

  // Submit scores and calculate winner
  const handleCalculateWinner = async () => {
    if (homeScore === '' || visitorScore === '') {
      alert('Please enter both scores');
      return;
    }

    setCalculatingWinners(true);
    try {
      await axiosService.post(`/api/squares-pools/${poolId}/calculate-winners`, {
        quarter: selectedQuarter,
        home_score: parseInt(homeScore),
        visitor_score: parseInt(visitorScore),
      });
      handleCloseScoreModal();
      await loadWinners();
      await loadPool(null, true);
    } catch (error) {
      alert('Failed to calculate winner: ' + (error.response?.data?.message || error.message));
    } finally {
      setCalculatingWinners(false);
    }
  };

  const handleCalculateAllWinners = async () => {
    if (!window.confirm('Calculate winners for all 4 quarters?')) return;

    setCalculatingWinners(true);
    try {
      await axiosService.post(`/api/squares-pools/${poolId}/calculate-all-winners`);
      alert('Winners calculated for all quarters!');
      await loadWinners();
      await loadPool(null, true);
    } catch (error) {
      alert('Failed to calculate winners: ' + (error.response?.data?.message || error.message));
    } finally {
      setCalculatingWinners(false);
    }
  };

  const handleClosePool = async () => {
    if (!window.confirm('Are you sure you want to close this pool? No new squares can be selected after closing.')) return;

    setUpdatingPool(true);
    try {
      await axiosService.post(`/api/squares-pools/${poolId}/close`);
      await loadPool(null, true);
    } catch (error) {
      alert('Failed to close pool: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingPool(false);
    }
  };

  const handleReopenPool = async () => {
    if (!window.confirm('Are you sure you want to reopen this pool for square selection?')) return;

    setUpdatingPool(true);
    try {
      await axiosService.post(`/api/squares-pools/${poolId}/reopen`);
      await loadPool(null, true);
    } catch (error) {
      alert('Failed to reopen pool: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingPool(false);
    }
  };

  const handleMakePoolFree = async () => {
    if (!window.confirm('Change this pool to FREE? All players will be able to select squares without credits.')) return;

    setUpdatingPool(true);
    try {
      await axiosService.patch(`/api/squares-pools/${poolId}/settings`, {
        player_pool_type: 'OPEN'
      });
      await loadPool(null, true);
    } catch (error) {
      alert('Failed to update pool: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingPool(false);
    }
  };

  const extractPlayerId = (player) => {
    return (
      player?.player_id ||
      player?.playerId ||
      player?.user_id ||
      player?.id ||
      player?.player?.id ||
      null
    );
  };

  const getPlayerDisplayName = (player) => {
    const fallbackId = extractPlayerId(player);
    return (
      player?.player?.name ||
      player?.player_name ||
      player?.name ||
      player?.user?.name ||
      (fallbackId ? `Player #${fallbackId}` : 'Player')
    );
  };

  const getPlayerEmail = (player) => {
    return (
      player?.player?.email ||
      player?.player_email ||
      player?.email ||
      player?.user?.email ||
      null
    );
  };

  const getPlayerAvailableCredits = (player) => {
    const credits =
      player?.available_credits ??
      player?.credits ??
      player?.player?.available_credits ??
      player?.player?.credits ??
      player?.player_available_credits ??
      0;
    return credits;
  };

  const buildFallbackPoolPlayers = () => {
    if (!pool) return [];
    const playersMap = new Map();

    const addCandidate = (candidate = {}, extras = {}) => {
      const normalized = { ...candidate, ...extras };
      const candidateId = extractPlayerId(normalized);
      if (!candidateId) return;
      const existing = playersMap.get(candidateId) || {};
      playersMap.set(candidateId, {
        ...existing,
        ...normalized,
        player_id: candidateId,
      });
    };

    const potentialCollections = [
      pool.pool_players,
      pool.players,
      pool.joined_players,
      pool.player_stats,
    ];

    potentialCollections.forEach((collection) => {
      if (Array.isArray(collection)) {
        collection.forEach((player) => addCandidate(player));
      }
    });

    if (Array.isArray(pool.squares)) {
      pool.squares.forEach((square) => {
        const extras = {
          player_id: square.player_id ?? square.playerId,
          player_name: square.player?.name || square.player_name,
          player_email: square.player?.email || square.player_email,
          available_credits:
            square.player?.available_credits ??
            square.available_credits ??
            square.player?.credits ??
            square.player_credits,
          player: square.player || {
            name: square.player_name,
            email: square.player_email,
            credits: square.player?.credits,
          },
        };
        addCandidate(square.player || {}, extras);
      });
    }

    return Array.from(playersMap.values());
  };

  const syncCreditInputsWithPlayers = (playersList = []) => {
    setCreditAmounts((prev) => {
      const updated = {};
      playersList.forEach((player) => {
        const playerId = extractPlayerId(player);
        if (playerId) {
          updated[playerId] = prev[playerId] || '';
        }
      });
      return updated;
    });
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-900 bg-opacity-30 border border-yellow-600 text-yellow-200';
      case 'error':
        return 'bg-red-900 bg-opacity-30 border border-red-600 text-red-200';
      case 'info':
        return 'bg-blue-900 bg-opacity-30 border border-blue-600 text-blue-200';
      default:
        return 'bg-gray-800 bg-opacity-40 border border-gray-600 text-gray-200';
    }
  };

  const fetchAndStorePoolPlayers = async () => {
    if (!pool) {
      setPoolPlayers([]);
      setCreditAmounts({});
      setPoolPlayersNotice({
        type: 'error',
        message: 'Pool data is still loading. Please try again in a moment.',
      });
      return;
    }

    setPoolPlayersNotice({ type: '', message: '' });
    try {
      const response = await axiosService.get(`/api/squares-pools/${poolId}/players`);
      let players = response.data.data || response.data || [];
      if (!Array.isArray(players)) {
        players = [];
      }

      if (players.length === 0) {
        const derivedPlayers = buildFallbackPoolPlayers();
        if (derivedPlayers.length > 0) {
          setPoolPlayersNotice({
            type: 'info',
            message: 'No players returned from the server. Showing players derived from current pool data.',
          });
          players = derivedPlayers;
        }
      }

      setPoolPlayers(players);
      syncCreditInputsWithPlayers(players);
    } catch (error) {
      console.warn('Failed to load joined players, falling back to derived data.', error);
      const derivedPlayers = buildFallbackPoolPlayers();
      if (derivedPlayers.length > 0) {
        setPoolPlayersNotice({
          type: 'warning',
          message: 'Unable to load player list from the server. Showing players derived from current pool data.',
        });
        setPoolPlayers(derivedPlayers);
        syncCreditInputsWithPlayers(derivedPlayers);
      } else {
        setPoolPlayers([]);
        setCreditAmounts({});
        setPoolPlayersNotice({
          type: 'error',
          message: error.response?.data?.message || error.message || 'Failed to load pool players.',
        });
      }
    }
  };

  const handleAddCredits = async () => {
    setShowCreditsModal(true);
    setCreditsLoading(true);
    try {
      await fetchAndStorePoolPlayers();
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleCreditsInputChange = (playerId, value) => {
    setCreditAmounts(prev => ({ ...prev, [playerId]: value }));
  };

  const handleGrantCreditsToPlayer = async (playerId) => {
    const amount = parseFloat(creditAmounts[playerId]);
    const numericPlayerId = parseInt(playerId, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid credit amount greater than zero.');
      return;
    }
    if (isNaN(numericPlayerId)) {
      alert('Invalid player selected.');
      return;
    }

    try {
      setCreditsLoading(true);
      await axiosService.post(`/api/squares-pools/${poolId}/add-credits`, {
        player_id: numericPlayerId,
        credits: amount,
      });
      setCreditAmounts(prev => ({ ...prev, [playerId]: '' }));
      await fetchAndStorePoolPlayers();
      await loadPool(null, true);
    } catch (error) {
      alert('Failed to add credits: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreditsLoading(false);
    }
  };

  const closeCreditsModal = () => {
    setShowCreditsModal(false);
    setPoolPlayers([]);
    setCreditAmounts({});
    setPoolPlayersNotice({ type: '', message: '' });
  };

  const handleRequestCredits = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    setRequestingCredits(true);
    try {
      const response = await axiosService.post(
        `/api/credit-requests/pools/${poolId}/request`,
        {
          amount,
          reason: requestReason,
        }
      );

      if (response.data) {
        alert('Credit request submitted successfully! The pool commissioner will review your request.');
        setShowRequestCreditsModal(false);
        setRequestAmount('');
        setRequestReason('');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to request credits';
      alert(errorMessage);
    } finally {
      setRequestingCredits(false);
    }
  };

  const closeRequestCreditsModal = () => {
    setShowRequestCreditsModal(false);
    setRequestAmount('');
    setRequestReason('');
  };

  const handleAssignNumbers = async () => {
    if (!window.confirm('Assign random numbers to this pool now? This cannot be undone.')) return;

    setAssigningNumbers(true);
    try {
      await axiosService.post(`/api/squares-pools/${poolId}/assign-numbers`);
      await loadPool(null, true);
      alert('Numbers assigned successfully!');
    } catch (error) {
      alert('Failed to assign numbers: ' + (error.response?.data?.message || error.message));
    } finally {
      setAssigningNumbers(false);
    }
  };

  const handleDownloadQRCode = () => {
    if (!effectiveJoinUrl && !fallbackQrImage) {
      alert('QR code is not available yet.');
      return;
    }

    setDownloadingQR(true);
    try {
      if (effectiveJoinUrl && qrCanvasRef.current) {
        const dataUrl = qrCanvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${getPoolNumber() || 'pool'}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (fallbackQrImage) {
        const link = document.createElement('a');
        link.href = fallbackQrImage;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${getPoolNumber() || 'pool'}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    } finally {
      setDownloadingQR(false);
    }
  };

  const closeQRCodeModal = () => {
    setShowQRCode(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `$${amount.toFixed(2)}`;
  };

  const renderProgressCircle = (percentString, size = 40) => {
    const pct = Math.min(Math.max(parseInt(percentString, 10) || 0, 0), 100);
    const radius = (size / 2) - 4;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (pct / 100) * circumference;

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={colors.border} strokeWidth="3" opacity={0.4} />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={`url(#poolDetailProgressGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
          <defs>
            <linearGradient id="poolDetailProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.brand.primary} />
              <stop offset="100%" stopColor={colors.brand.primaryHover} />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: 'absolute',
            fontWeight: 600,
            color: colors.text,
            fontSize: size > 40 ? '0.8rem' : '0.65rem',
          }}
        >
          {pct}%
        </div>
      </div>
    );
  };

  const currentUserIdValue = getCurrentUserId();
  const roleId = getCurrentUserRole();
  const isSuperAdmin = roleId === 1; // Only role_id 1 is superadmin
  const isSquareAdmin = roleId === 2; // role_id 2 is Square Admin
  const isPoolOwner = pool && (pool.admin_id === currentUserIdValue || pool.created_by === currentUserIdValue);

  // Superadmin can manage ALL pools, Square Admin can only manage their own pools
  const canManagePool = currentUser && pool && (
    isSuperAdmin || (isSquareAdmin && isPoolOwner) || isPoolOwner
  );

  const canGrantCredits = isSuperAdmin; // Only superadmin can grant credits
  const poolNumberDisplay = getPoolNumber();
  const joinUrl = getPoolJoinUrl();
  const fallbackQrImage = pool?.qr_code_url || pool?.qrCodeUrl || '';
  const decodeJoinUrlFromFallback = (qrUrl = '') => {
    if (!qrUrl || !qrUrl.includes('?')) return '';
    try {
      const parsed = new URL(qrUrl);
      const chl = parsed.searchParams.get('chl');
      return chl ? decodeURIComponent(chl) : '';
    } catch (error) {
      return '';
    }
  };
  const fallbackJoinUrl = !joinUrl ? decodeJoinUrlFromFallback(fallbackQrImage) : '';
  const effectiveJoinUrl = joinUrl || fallbackJoinUrl;
  const numbersType =
    pool?.numbers_type ||
    pool?.numbersType ||
    (pool?.pool_type === 'A' ? 'Ascending' : pool?.pool_type === 'B' ? 'TimeSet' : undefined);
  const numbersAssigned = Boolean(
    (Array.isArray(pool?.x_numbers) ? pool?.x_numbers?.length : pool?.x_numbers) &&
    (Array.isArray(pool?.y_numbers) ? pool?.y_numbers?.length : pool?.y_numbers)
  );
  const requiresManualAssignment = numbersType === 'AdminTrigger' && !numbersAssigned;
  const numbersTypeLabel = (() => {
    switch (numbersType) {
      case 'Ascending':
        return 'Ascending (0-9 in order)';
      case 'TimeSet':
        return 'Random/Scheduled';
      case 'AdminTrigger':
        return 'Manual trigger by admin';
      default:
        return numbersType || 'Not set';
    }
  })();

  const getProgressPercentage = () => {
    if (!pool) return 0;
    const totalSquares = pool.total_squares || pool.totalSquares || 100;
    // Check multiple possible property names from the API
    const selectedSquares = pool.squares_claimed || pool.selectedSquares || pool.claimed_squares || pool.squares_selected || 0;

    // Debug logging (can be removed later)
    if (selectedSquares === 0 && pool.id) {
      console.log('Pool detail data:', pool);
    }

    return ((selectedSquares / totalSquares) * 100).toFixed(0);
  };

  const getTotalCost = () => {
    if (!pool) return '0.00';
    const cost = parseFloat(pool.entry_fee || pool.credit_cost || pool.costPerSquare || 0);
    return (selectedSquares.length * cost).toFixed(2);
  };

  const getTeamName = (teamId) => {
    if (!teamId) return 'TBD';
    const team = teams.find(t => t.id === teamId);
    return team?.name || team?.team_name || 'TBD';
  };

  const getTeamLogo = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.logo || team?.image_url || null;
  };

  const getTeamBackground = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.background_url || team?.backgroundUrl || null;
  };

  const getUserCreditBalance = () => {
    if (!pool?.players || !currentUserIdValue) return null;
    const player = pool.players.find(p => extractPlayerId(p) === currentUserIdValue);
    if (player) {
      // Check multiple possible property names for credits
      const credits = player.credits_available ?? player.available_credits ?? player.credits ?? player.player?.credits ?? 0;
      return parseFloat(credits).toFixed(2);
    }
    return null;
  };

  // Shared styles for v2 theme
  const adminButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease',
    border: `1px solid ${colors.border}`,
    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
    color: colors.text,
  };

  const adminButtonPrimaryStyle = {
    ...adminButtonStyle,
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
    color: '#fff',
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          gap: '2rem',
        }}>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg
              style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                animation: 'spin 1.5s linear infinite'
              }}
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={colors.brand.primary}
                strokeWidth="4"
                strokeDasharray="300 360"
                strokeLinecap="round"
              />
            </svg>
            <img
              src="/assets/images/favicon.png"
              alt="Loading"
              style={{
                width: '64px',
                height: '64px',
                position: 'relative',
                zIndex: 1,
                animation: 'bounce 1s ease-in-out infinite'
              }}
            />
          </div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            fontFamily: '"Hubot Sans", sans-serif',
          }}>
            Loading Pool Details...
          </div>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <p className="text-2xl mb-4" style={{ color: colors.text }}>Pool not found</p>
          <button
            onClick={() => navigate('/v2/squares')}
            className="px-6 py-3 rounded-lg transition-all text-white font-semibold"
            style={{ backgroundColor: colors.brand.primary }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
          >
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', paddingBottom: hasJoined ? '100px' : '2rem' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Header with back button and joined status */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/v2/squares')}
            className="flex items-center justify-center transition-all"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              width: '42px',
              height: '42px',
              borderRadius: '12px',
            }}
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text, marginBottom: '0.15rem' }}>
              {pool.pool_name || pool.gridName}
            </h3>
            <p className="text-sm" style={{ color: colors.text, opacity: 0.65 }}>Pool #{pool.pool_number || pool.poolNumber}</p>
          </div>

          {/* Compact Joined Status Badge */}
          {hasJoined ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full"
              style={{
                backgroundColor: `${colors.success}15`,
                border: `1px solid ${colors.success}40`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: colors.success,
                }}
              >
                <FiCheck size={14} color="#fff" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold" style={{ color: colors.success }}>Joined</span>
            </div>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all"
              style={{
                backgroundColor: colors.brand.primary,
                color: '#fff',
              }}
            >
              Join Pool
            </button>
          )}
        </div>

        {/* Pool Info Card */}
        <div
          className="mb-5"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '18px', padding: '18px' }}
        >
          <div className='flex flex-col lg:flex-row justify-between gap-4 w-full'>
            <div className="flex items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: colors.highlight, color: colors.brand.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
                🏈
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: colors.brand.primary, opacity: 0.8 }}>
                  {pool.game?.league || 'NFL'}
                </div>
                <div className="text-lg font-bold" style={{ color: colors.text }}>
                  {getTeamName(pool.game?.home_team_id || pool.game?.homeTeamId)} vs {getTeamName(pool.game?.visitor_team_id || pool.game?.visitorTeamId)}
                </div>
                <div className="text-sm flex items-center gap-1" style={{ color: colors.text, opacity: 0.65 }}>
                  <FiCalendar size={14} /> {formatDate(pool.game?.game_time || pool.game?.game_datetime || pool.game?.gameTime)}
                </div>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <div style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px' }}>
                {renderProgressCircle(getProgressPercentage(pool), 44)}
                <div className="text-xs mt-1" style={{ color: colors.text, opacity: 0.7 }}>
                  Filled
                </div>
              </div>

              {pool.player_pool_type === 'CREDIT' && getUserCreditBalance() !== null && (
                <div className='h-full' style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '100px' }}>
                  <div className="text-xl font-bold" style={{ color: colors.success }}>
                    ${getUserCreditBalance()}
                  </div>
                  <div className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                    Your Credits
                  </div>
                </div>
              )}

              <div className='h-full' style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px' }}>
                <div className="text-lg font-bold" style={{ color: colors.text }}>
                  {pool.player_pool_type || 'N/A'}
                </div>
                <div className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                  Type
                </div>
              </div>

              <div className='h-full' style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px' }}>
                <div className="text-lg font-bold capitalize" style={{ color: pool.pool_status === 'open' ? colors.success : colors.error }}>
                  {pool.pool_status || 'N/A'}
                </div>
                <div className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                  Status
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Entry / square</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              ${parseFloat(pool.entry_fee || pool.credit_cost || pool.costPerSquare || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Total pot</div>
            <div className="text-xl font-bold" style={{ color: colors.brand.primary }}>
              ${parseFloat(pool.total_pot || pool.totalPot || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Total Players</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              {pool.players?.length || pool.playerCount || 0}
            </div>
          </div>
          <div style={{ backgroundColor: isDark ? colors.cardHover : '#f7f4f2', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Max per player</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              {pool.max_squares_per_player || pool.maxSquaresPerPlayer || '∞'}
            </div>
          </div>
        </div>

        {/* Admin Controls - Collapsible Panel */}
        {canManagePool && (
          <div
            className="mb-5"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Collapsible Header */}
            <button
              onClick={() => setShowAdminControls(!showAdminControls)}
              className="w-full flex items-center justify-between px-5 py-4 transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(212, 122, 62, 0.1)' : 'rgba(212, 122, 62, 0.08)',
                borderBottom: showAdminControls ? `1px solid ${colors.border}` : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: colors.brand.primary,
                  }}
                >
                  <FiSettings size={18} color="#fff" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold" style={{ color: colors.text }}>Admin Controls</h3>
                  <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Manage pool settings, winners & credits</p>
                </div>
              </div>
              <div
                className="flex items-center justify-center rounded-full transition-transform"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                  transform: showAdminControls ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <FiChevronDown size={18} style={{ color: colors.text }} />
              </div>
            </button>

            {/* Collapsible Content */}
            {showAdminControls && (
              <div className="p-5 space-y-5">
                {/* Calculate Winners Section - Quarter Cards */}
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: isDark ? 'rgba(212, 122, 62, 0.2)' : 'rgba(212, 122, 62, 0.15)',
                      }}
                    >
                      <FiAward size={16} style={{ color: colors.brand.primary }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: colors.text }}>Calculate Winners</h4>
                      <p className="text-xs" style={{ color: colors.text, opacity: 0.5 }}>Select quarter to enter scores and calculate winner</p>
                    </div>
                  </div>

                  {/* Quarter Cards Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((quarter) => {
                      const quarterWinner = winners.find(w => w.quarter === quarter);
                      const quarterLabel = quarter === 4 ? 'Final' : `Quarter ${quarter}`;
                      const hasWinner = !!quarterWinner;

                      return (
                        <div
                          key={quarter}
                          onClick={() => !calculatingWinners && handleOpenScoreModal(quarter)}
                          className="cursor-pointer transition-all hover:scale-[1.02]"
                          style={{
                            backgroundColor: hasWinner
                              ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)')
                              : (isDark ? colors.cardHover : '#fff'),
                            border: `2px solid ${hasWinner ? colors.success : colors.border}`,
                            borderRadius: '14px',
                            padding: '14px',
                            opacity: calculatingWinners ? 0.6 : 1,
                          }}
                        >
                          {/* Quarter Label */}
                          <div
                            className="text-center text-xs font-bold uppercase tracking-wider mb-3"
                            style={{ color: hasWinner ? colors.success : colors.brand.primary }}
                          >
                            {quarterLabel}
                          </div>

                          {/* Scores Display */}
                          <div className="flex items-center justify-center gap-3">
                            {/* Home Team */}
                            <div className="flex flex-col items-center">
                              {pool.game?.home_team_id && getTeamLogo(pool.game.home_team_id) ? (
                                <img
                                  src={getTeamLogo(pool.game.home_team_id)}
                                  alt="Home"
                                  className="w-8 h-8 object-contain mb-1"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold"
                                  style={{ backgroundColor: colors.brand.primary, color: '#fff' }}
                                >
                                  H
                                </div>
                              )}
                              <div
                                className="text-2xl font-bold"
                                style={{ color: colors.text }}
                              >
                                {quarterWinner?.home_score ?? '-'}
                              </div>
                            </div>

                            {/* VS */}
                            <div
                              className="text-xs font-semibold px-2"
                              style={{ color: colors.text, opacity: 0.4 }}
                            >
                              vs
                            </div>

                            {/* Visitor Team */}
                            <div className="flex flex-col items-center">
                              {pool.game?.visitor_team_id && getTeamLogo(pool.game.visitor_team_id) ? (
                                <img
                                  src={getTeamLogo(pool.game.visitor_team_id)}
                                  alt="Away"
                                  className="w-8 h-8 object-contain mb-1"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold"
                                  style={{ backgroundColor: colors.border, color: colors.text }}
                                >
                                  A
                                </div>
                              )}
                              <div
                                className="text-2xl font-bold"
                                style={{ color: colors.text }}
                              >
                                {quarterWinner?.visitor_score ?? '-'}
                              </div>
                            </div>
                          </div>

                          {/* Winner Info or Calculate Button */}
                          <div className="mt-3 text-center">
                            {hasWinner ? (
                              <div
                                className="text-xs font-semibold px-2 py-1 rounded-full inline-block"
                                style={{
                                  backgroundColor: `${colors.success}20`,
                                  color: colors.success
                                }}
                              >
                                <FiCheck size={12} className="inline mr-1" />
                                Winner: {quarterWinner.player?.name?.split(' ')[0] || 'Calculated'}
                              </div>
                            ) : (
                              <div
                                className="text-xs font-semibold px-3 py-1.5 rounded-full inline-block"
                                style={{
                                  backgroundColor: colors.brand.primary,
                                  color: '#fff'
                                }}
                              >
                                Enter Scores
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculate All Button */}
                  <div className="mt-4">
                    <button
                      onClick={handleCalculateAllWinners}
                      disabled={calculatingWinners}
                      className="w-full"
                      style={{
                        ...adminButtonStyle,
                        opacity: calculatingWinners ? 0.6 : 1,
                        justifyContent: 'center',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      }}
                    >
                      <FiAward size={16} /> Recalculate All Winners
                    </button>
                  </div>
                </div>

                {/* Pool Tools Section */}
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: isDark ? 'rgba(212, 122, 62, 0.2)' : 'rgba(212, 122, 62, 0.15)',
                      }}
                    >
                      <FiGrid size={16} style={{ color: colors.brand.primary }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: colors.text }}>Pool Tools</h4>
                      <p className="text-xs" style={{ color: colors.text, opacity: 0.5 }}>Manage pool settings and sharing</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setShowQRCode(true)}
                      style={{ ...adminButtonStyle, justifyContent: 'center', width: '100%' }}
                    >
                      <FiShare2 size={16} /> Share QR
                    </button>
                    <button
                      onClick={() => setShowWinners(!showWinners)}
                      style={{ ...adminButtonStyle, justifyContent: 'center', width: '100%' }}
                    >
                      <FiAward size={16} /> {showWinners ? 'Hide' : 'View'} Winners
                    </button>
                    {pool.pool_status === 'open' ? (
                      <button
                        onClick={handleClosePool}
                        style={{ ...adminButtonStyle, justifyContent: 'center', width: '100%' }}
                      >
                        <FiLock size={16} /> Close Pool
                      </button>
                    ) : (
                      <button
                        onClick={handleReopenPool}
                        style={{ ...adminButtonStyle, justifyContent: 'center', width: '100%' }}
                      >
                        <FiUnlock size={16} /> Reopen Pool
                      </button>
                    )}
                    {requiresManualAssignment && (
                      <button
                        onClick={handleAssignNumbers}
                        disabled={assigningNumbers}
                        style={{
                          ...adminButtonStyle,
                          opacity: assigningNumbers ? 0.6 : 1,
                          justifyContent: 'center',
                          width: '100%',
                        }}
                      >
                        <FiGrid size={16} /> {assigningNumbers ? 'Assigning...' : 'Assign Numbers'}
                      </button>
                    )}
                    {pool.player_pool_type === 'CREDIT' && (
                      <button
                        onClick={handleMakePoolFree}
                        style={{ ...adminButtonStyle, justifyContent: 'center', width: '100%' }}
                      >
                        <FiDollarSign size={16} /> Make Free
                      </button>
                    )}
                  </div>
                </div>

                {/* Credits Management Section - Only for Credit Pools */}
                {pool.player_pool_type === 'CREDIT' && (
                  <div
                    style={{
                      backgroundColor: isDark ? 'rgba(212, 122, 62, 0.08)' : 'rgba(212, 122, 62, 0.06)',
                      borderRadius: '12px',
                      padding: '16px',
                      border: `1px solid ${colors.brand.primary}30`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: colors.brand.primary,
                        }}
                      >
                        <FiCreditCard size={16} color="#fff" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold" style={{ color: colors.text }}>Credits Management</h4>
                        <p className="text-xs" style={{ color: colors.text, opacity: 0.5 }}>Grant credits to pool players</p>
                      </div>
                    </div>
                    <button
                      onClick={handleAddCredits}
                      className="w-full"
                      style={{
                        ...adminButtonPrimaryStyle,
                        justifyContent: 'center',
                      }}
                    >
                      <FiTrendingUp size={16} /> Grant Credits to Players
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Winners Display */}
        {showWinners && winners.length > 0 && (
          <div
            className="mb-5"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px' }}
          >
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: colors.text }}>
              <FiAward />
              Winners
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: colors.brand.primary }}>
                        Quarter {winner.quarter}
                      </div>
                      <div className="text-sm" style={{ color: colors.text }}>
                        {winner.player?.name || 'Unknown'}
                      </div>
                      <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                        Square: ({winner.square?.x_coordinate}, {winner.square?.y_coordinate})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: colors.success }}>
                        ${parseFloat(winner.prize_amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="mb-8">
          {(() => {
            const currentPlayerId = currentUser?.user?.id || currentUser?.id;
            console.log('=== GRID RENDER ===');
            console.log('currentPlayerID passed to grid:', currentPlayerId);
            console.log('Pool squares:', pool.squares);

            return (
              <SquaresGrid
                grid={{
                  ...pool,
                  xAxisTeam: getTeamName(pool.game?.home_team_id || pool.game?.homeTeamId),
                  yAxisTeam: getTeamName(pool.game?.visitor_team_id || pool.game?.visitorTeamId),
                  homeTeamLogo: getTeamLogo(pool.game?.home_team_id || pool.game?.homeTeamId),
                  visitorTeamLogo: getTeamLogo(pool.game?.visitor_team_id || pool.game?.visitorTeamId),
                  homeTeamBackground: getTeamBackground(pool.game?.home_team_id || pool.game?.homeTeamId),
                  visitorTeamBackground: getTeamBackground(pool.game?.visitor_team_id || pool.game?.visitorTeamId),
                  homeTeamName: getTeamName(pool.game?.home_team_id || pool.game?.homeTeamId),
                  visitorTeamName: getTeamName(pool.game?.visitor_team_id || pool.game?.visitorTeamId),
                  xAxisNumbers: pool.x_numbers && pool.x_numbers.length > 0 ? pool.x_numbers : null,
                  yAxisNumbers: pool.y_numbers && pool.y_numbers.length > 0 ? pool.y_numbers : null,
                }}
                squares={pool.squares || []}
                onSquareSelect={handleSquareSelection}
                currentPlayerID={currentPlayerId}
                selectionMode={selectionMode}
                disabled={!hasJoined || pool.pool_status !== 'open'}
                onLimitReached={(maxSquares, owned, selected) => {
                  showToast({
                    severity: 'warn',
                    summary: 'Selection Limit Reached',
                    detail: `You can only have ${maxSquares} squares maximum. You already own ${owned} and have ${selected} selected.`,
                  });
                }}
              />
            );
          })()}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pool Rules */}
          <div
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px' }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>Pool Rules</h3>
            <div className="space-y-2" style={{ color: colors.text, opacity: 0.8 }}>
              <div className="flex items-start gap-3">
                <span style={{ color: colors.brand.primary, fontWeight: 800 }}>•</span>
                <p>Max {pool.max_squares_per_player || pool.maxSquaresPerPlayer || 'Unlimited'} squares per player</p>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: colors.brand.primary, fontWeight: 800 }}>•</span>
                <p>Numbers assignment: {numbersTypeLabel}</p>
              </div>
              {!numbersAssigned && numbersType === 'AdminTrigger' && (
                <div className="flex items-start gap-3">
                  <span style={{ color: colors.warning, fontWeight: 800 }}>!</span>
                  <p>Numbers will remain hidden until an admin manually assigns them.</p>
                </div>
              )}
              {(pool.number_assign_datetime || pool.numbersAssignDate) && (
                <div className="flex items-start gap-3">
                  <span style={{ color: colors.brand.primary, fontWeight: 800 }}>•</span>
                  <p>Numbers assigned on: {formatDate(pool.number_assign_datetime || pool.numbersAssignDate)}</p>
                </div>
              )}
              {(pool.close_datetime || pool.closeDate) && (
                <div className="flex items-start gap-3">
                  <span style={{ color: colors.brand.primary, fontWeight: 800 }}>•</span>
                  <p>Pool closes: {formatDate(pool.close_datetime || pool.closeDate)}</p>
                </div>
              )}
              {pool.pool_description && (
                <div className="flex items-start gap-3">
                  <span style={{ color: colors.brand.primary, fontWeight: 800 }}>•</span>
                  <p>{pool.pool_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px' }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>How It Works</h3>
            <div className="space-y-2" style={{ color: colors.text, opacity: 0.8 }}>
              <div className="flex items-start gap-3">
                <span style={{ color: colors.brand.primary, fontWeight: 800 }}>1.</span>
                <p>Select your squares on the 10x10 grid.</p>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: colors.brand.primary, fontWeight: 800 }}>2.</span>
                <p>Numbers (0-9) are assigned to each axis.</p>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: colors.brand.primary, fontWeight: 800 }}>3.</span>
                <p>Winners determined by last digit of each team's score.</p>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: colors.brand.primary, fontWeight: 800 }}>4.</span>
                <p>Prizes distributed based on reward structure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winners Section */}
      {winners && winners.length > 0 && (
        <div className="mt-12">
          <WinnersDisplay
            pool={pool}
            winners={winners}
            game={pool.game}
          />
        </div>
      )}

      {/* Floating Bottom Bar - Select Squares (Only when joined) */}
      {hasJoined && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            background: isDark
              ? 'linear-gradient(to top, rgba(22, 28, 41, 0.98) 0%, rgba(22, 28, 41, 0.95) 100%)'
              : 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            borderTop: `1px solid ${colors.border}`,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1rem 1.25rem' }}>
            {!selectionMode ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <FiGrid size={20} style={{ color: colors.brand.primary }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.text }}>
                      Ready to pick squares?
                    </p>
                    <p className="text-sm" style={{ color: colors.text, opacity: 0.6 }}>
                      {pool.pool_status === 'open' ? 'Pool is open for selection' : 'Pool is currently closed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pool.player_pool_type === 'CREDIT' && (
                    <button
                      onClick={() => setShowRequestCreditsModal(true)}
                      className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all"
                      style={{
                        backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    >
                      <FiCreditCard size={18} /> Request Credits
                    </button>
                  )}
                  <button
                    onClick={() => setSelectionMode(true)}
                    disabled={pool.pool_status !== 'open'}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                    style={{
                      backgroundColor: pool.pool_status === 'open' ? colors.brand.primary : colors.border,
                      color: pool.pool_status === 'open' ? '#fff' : colors.text,
                      opacity: pool.pool_status !== 'open' ? 0.6 : 1,
                    }}
                  >
                    <FiGrid size={18} /> Select Squares
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div
                    className="flex-1 sm:flex-none flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="text-center sm:text-left">
                      <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Selected</p>
                      <p className="text-lg font-bold" style={{ color: colors.brand.primary }}>
                        {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {parseFloat(pool.entry_fee || pool.credit_cost || 0) > 0 && (
                    <div
                      className="flex-1 sm:flex-none flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="text-center sm:text-left">
                        <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Total Cost</p>
                        <p className="text-lg font-bold" style={{ color: colors.success }}>
                          ${getTotalCost()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedSquares([]);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all"
                    style={{
                      backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  >
                    <FiX size={18} /> Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedSquares.length === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                    style={{
                      backgroundColor: selectedSquares.length > 0 ? colors.brand.primary : colors.border,
                      color: selectedSquares.length > 0 ? '#fff' : colors.text,
                      opacity: selectedSquares.length === 0 ? 0.6 : 1,
                    }}
                  >
                    <FiCheck size={18} /> Confirm Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Join Pool</h2>
            <p className="mb-6" style={{ color: colors.text, opacity: 0.7 }}>
              {pool.player_pool_type === 'CREDIT'
                ? 'Enter the pool password to join'
                : 'Click join to enter this pool'}
            </p>

            {pool.player_pool_type === 'CREDIT' && (
              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: colors.text }}>
                  Pool Password
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinPool()}
                />
              </div>
            )}

            {joinError && (
              <div className="mb-4 px-4 py-3 rounded-lg" style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}`, color: colors.error }}>
                {joinError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError('');
                  setJoinPassword('');
                }}
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinPool}
                className="flex-1 py-3 rounded-lg font-bold transition-all"
                style={{ backgroundColor: colors.brand.primary, color: '#fff' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Credits Modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeCreditsModal}>
          <div
            className="rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeCreditsModal}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: colors.text, opacity: 0.6 }}
              aria-label="Close credits modal"
            >
              <FiX className="text-2xl" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: '40px', height: '40px', backgroundColor: colors.brand.primary }}
              >
                <FiCreditCard size={20} color="#fff" />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: colors.text }}>Grant Credits</h3>
                <p className="text-sm" style={{ color: colors.text, opacity: 0.6 }}>View joined players and manage their credits for this pool.</p>
              </div>
            </div>
            {!canGrantCredits && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: `${colors.warning}20`, border: `1px solid ${colors.warning}`, color: colors.warning }}>
                Only Super Admins can add credits. You can still review each player's current balance.
              </div>
            )}
            {poolPlayersNotice.message && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${getAlertStyles(poolPlayersNotice.type)}`}>
                {poolPlayersNotice.message}
              </div>
            )}
            <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
              {creditsLoading ? (
                <div className="text-center py-12" style={{ color: colors.text, opacity: 0.6 }}>Loading players...</div>
              ) : poolPlayers.length === 0 ? (
                <div className="text-center py-12" style={{ color: colors.text, opacity: 0.6 }}>No players have joined this pool yet.</div>
              ) : (
                poolPlayers.map((player) => {
                  const playerId = extractPlayerId(player);
                  if (!playerId) return null;
                  const name = getPlayerDisplayName(player);
                  const email = getPlayerEmail(player);
                  const availableCredits = getPlayerAvailableCredits(player);
                  return (
                    <div
                      key={playerId}
                      className="rounded-xl p-4 space-y-4"
                      style={{
                        backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="font-semibold" style={{ color: colors.text }}>{name}</p>
                          {email && <p className="text-sm" style={{ color: colors.text, opacity: 0.6 }}>{email}</p>}
                        </div>
                        <div className="text-sm">
                          <p className="text-xs uppercase tracking-wide" style={{ color: colors.text, opacity: 0.6 }}>Available Credits</p>
                          <p className="font-bold text-xl" style={{ color: colors.success }}>{formatCurrency(availableCredits)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          placeholder="Credits to add"
                          value={creditAmounts[playerId] ?? ''}
                          onChange={(e) => handleCreditsInputChange(playerId, e.target.value)}
                          disabled={!canGrantCredits}
                          className="flex-1 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-60"
                          style={{
                            backgroundColor: colors.card,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                          }}
                        />
                        <button
                          onClick={() => handleGrantCreditsToPlayer(playerId)}
                          disabled={!canGrantCredits || creditsLoading}
                          className="px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: canGrantCredits ? colors.brand.primary : colors.border,
                            color: canGrantCredits ? '#fff' : colors.text,
                          }}
                        >
                          <FiTrendingUp />
                          Add Credits
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeQRCodeModal}>
          <div
            className="rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeQRCodeModal}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: colors.text, opacity: 0.6 }}
              aria-label="Close QR modal"
            >
              <FiX className="text-2xl" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-2xl font-bold text-center" style={{ color: colors.text }}>Share Pool</h3>
              <p className="text-center text-sm" style={{ color: colors.text, opacity: 0.6 }}>Scan or download the QR code to invite players to this pool.</p>
              <div className="relative bg-white p-4 rounded-2xl shadow-inner w-full flex items-center justify-center min-h-[18rem]">
                {effectiveJoinUrl && QRCodeCanvasComponent ? (
                  <>
                    <QRCodeCanvasComponent
                      value={effectiveJoinUrl}
                      size={280}
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      ref={qrCanvasRef}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                        <img
                          src="/assets/images/favicon.png"
                          alt="GOAT Sports Pools"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    </div>
                  </>
                ) : fallbackQrImage ? (
                  <img
                    src={fallbackQrImage}
                    alt="Pool QR Code"
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                  />
                ) : (
                  <div style={{ color: colors.error }} className="text-sm">QR code not available.</div>
                )}
              </div>
              {effectiveJoinUrl && (
                <div
                  className="w-full rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p className="text-xs uppercase" style={{ color: colors.text, opacity: 0.6 }}>Join Link</p>
                  <p className="text-sm font-mono break-all" style={{ color: colors.text }}>{effectiveJoinUrl}</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Pool Number</p>
                <p className="text-xl font-bold" style={{ color: colors.text }}>{poolNumberDisplay || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={handleDownloadQRCode}
                  disabled={downloadingQR || (!effectiveJoinUrl && !fallbackQrImage)}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.brand.primary,
                    color: '#fff',
                  }}
                >
                  <FiDownload />
                  {downloadingQR ? 'Downloading...' : 'Download QR Code'}
                </button>
                <button
                  onClick={closeQRCodeModal}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                >
                  <FiX />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Credits Modal */}
      {showRequestCreditsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeRequestCreditsModal}>
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.brand.primary}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeRequestCreditsModal}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: colors.text, opacity: 0.6 }}
              aria-label="Close request credits modal"
            >
              <FiX className="text-2xl" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: '40px', height: '40px', backgroundColor: colors.brand.primary }}
              >
                <FiCreditCard size={20} color="#fff" />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: colors.text }}>Request Credits</h3>
                <p className="text-sm" style={{ color: colors.text, opacity: 0.6 }}>Request credits from the pool commissioner</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Amount *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Reason (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Why do you need these credits?"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeRequestCreditsModal}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCredits}
                  disabled={requestingCredits || !requestAmount}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.brand.primary,
                    color: '#fff',
                  }}
                >
                  {requestingCredits ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Entry Modal for Calculate Winner */}
      {showScoreModal && selectedQuarter && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseScoreModal}>
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.brand.primary}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseScoreModal}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: colors.text, opacity: 0.6 }}
              aria-label="Close score modal"
            >
              <FiX className="text-2xl" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center rounded-full px-4 py-1 mb-3"
                style={{
                  backgroundColor: `${colors.brand.primary}20`,
                  color: colors.brand.primary,
                }}
              >
                <span className="text-sm font-bold">
                  {selectedQuarter === 4 ? 'FINAL' : `QUARTER ${selectedQuarter}`}
                </span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>Enter Scores</h3>
              <p className="text-sm mt-1" style={{ color: colors.text, opacity: 0.6 }}>
                Enter the cumulative score at the end of {selectedQuarter === 4 ? 'the game' : `Q${selectedQuarter}`}
              </p>
            </div>

            {/* Score Inputs */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                {pool?.game?.home_team_id && getTeamLogo(pool.game.home_team_id) ? (
                  <img
                    src={getTeamLogo(pool.game.home_team_id)}
                    alt="Home"
                    className="w-16 h-16 object-contain mb-2"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-2 text-lg font-bold"
                    style={{ backgroundColor: colors.brand.primary, color: '#fff' }}
                  >
                    H
                  </div>
                )}
                <p className="text-xs font-semibold mb-2 text-center" style={{ color: colors.text, opacity: 0.7 }}>
                  {getTeamName(pool?.game?.home_team_id) || 'Home'}
                </p>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                  className="w-20 h-16 text-center text-3xl font-bold rounded-xl focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `2px solid ${colors.border}`,
                    color: colors.text,
                  }}
                />
              </div>

              {/* VS Divider */}
              <div
                className="text-lg font-bold"
                style={{ color: colors.text, opacity: 0.3 }}
              >
                vs
              </div>

              {/* Visitor Team */}
              <div className="flex flex-col items-center flex-1">
                {pool?.game?.visitor_team_id && getTeamLogo(pool.game.visitor_team_id) ? (
                  <img
                    src={getTeamLogo(pool.game.visitor_team_id)}
                    alt="Away"
                    className="w-16 h-16 object-contain mb-2"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-2 text-lg font-bold"
                    style={{ backgroundColor: colors.border, color: colors.text }}
                  >
                    A
                  </div>
                )}
                <p className="text-xs font-semibold mb-2 text-center" style={{ color: colors.text, opacity: 0.7 }}>
                  {getTeamName(pool?.game?.visitor_team_id) || 'Away'}
                </p>
                <input
                  type="number"
                  min="0"
                  value={visitorScore}
                  onChange={(e) => setVisitorScore(e.target.value)}
                  placeholder="0"
                  className="w-20 h-16 text-center text-3xl font-bold rounded-xl focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                    border: `2px solid ${colors.border}`,
                    color: colors.text,
                  }}
                />
              </div>
            </div>

            {/* Winning Square Preview */}
            {homeScore !== '' && visitorScore !== '' && (
              <div
                className="text-center p-3 rounded-xl mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(212, 122, 62, 0.1)' : 'rgba(212, 122, 62, 0.08)',
                  border: `1px solid ${colors.brand.primary}30`,
                }}
              >
                <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Winning Square Coordinates</p>
                <p className="text-lg font-bold" style={{ color: colors.brand.primary }}>
                  ({parseInt(homeScore) % 10}, {parseInt(visitorScore) % 10})
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseScoreModal}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: isDark ? colors.cardHover : '#f7f4f2',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCalculateWinner}
                disabled={calculatingWinners || homeScore === '' || visitorScore === ''}
                className="flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.brand.primary,
                  color: '#fff',
                }}
              >
                <FiAward size={18} />
                {calculatingWinners ? 'Calculating...' : 'Calculate Winner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal for Confirming Squares */}
      {confirmingSquares && (
        <LoadingModal
          message="Confirming Squares"
          count={selectedSquares.length}
        />
      )}

      {/* Loading Modal for Calculating Winners */}
      {calculatingWinners && (
        <LoadingModal
          message="Calculating Winners"
        />
      )}

      {/* Loading Modal for Pool Updates */}
      {updatingPool && (
        <LoadingModal
          message="Updating Pool"
        />
      )}
    </div>
  );
};

export default SquaresPoolDetail;
