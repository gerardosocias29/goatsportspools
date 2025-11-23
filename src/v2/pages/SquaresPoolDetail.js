import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiCalendar, FiDollarSign, FiGrid, FiLock, FiUnlock, FiTrendingUp, FiAward, FiShare2, FiDownload, FiX, FiCreditCard } from 'react-icons/fi';
import SquaresGrid from '../components/squares/SquaresGrid';
import WinnersDisplay from '../components/squares/WinnersDisplay';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { TeamTemplate } from '../../app/pages/screens/games/NFLTemplates';
import { useTheme } from '../contexts/ThemeContext';
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

  const handleCalculateWinner = async (quarter) => {
    if (!window.confirm(`Calculate winner for Quarter ${quarter}?`)) return;

    setCalculatingWinners(true);
    try {
      await axiosService.post(`/api/squares-pools/${poolId}/calculate-winners`, {
        quarter: quarter,
      });
      alert(`Winner calculated for Quarter ${quarter}!`);
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

  const renderProgressCircle = (percentString) => {
    const pct = Math.min(Math.max(parseInt(percentString, 10) || 0, 0), 100);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (pct / 100) * circumference;

    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="20" cy="20" r={radius} fill="none" stroke={colors.border} strokeWidth="3" opacity={0.4} />
          <circle
            cx="20"
            cy="20"
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
            fontSize: '0.7rem',
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
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/v2/squares')}
            className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-all"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, color: colors.text }}
          >
            <FiArrowLeft />
          </button>
          <div className="flex-1">
            <h3 className="text-3xl font-bold" style={{ color: colors.text, marginBottom: '0.15rem' }}>
              {pool.pool_name || pool.gridName}
            </h3>
            <p style={{ color: colors.text, opacity: 0.65 }}>Pool #{pool.pool_number || pool.poolNumber}</p>
          </div>
          {/* {pool && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: colors.highlight, color: colors.brand.secondary, border: `1px solid ${colors.border}` }}>
                {pool.player_pool_type === 'CREDIT' ? 'Credit' : 'Open'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: colors.brand.primary + '20', color: colors.brand.primary, border: `1px solid ${colors.brand.primary}` }}>
                {pool.pool_status || pool.gridStatus || 'Status'}
              </span>
            </div>
          )} */}
        </div>

        {/* Pool Info Card */}
        <div
          className="mb-5"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '18px', padding: '18px' }}
        >
          <div className='flex justify-between w-full'>
            <div className="flex items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: colors.highlight, color: colors.brand.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                🏈
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: colors.brand.primary, opacity: 0.8 }}>
                  {pool.game?.league || 'NFL'}
                </div>
                <div className="text-lg font-bold" style={{ color: colors.text }}>
                  {getTeamName(pool.game?.home_team_id || pool.game?.homeTeamId)} vs {getTeamName(pool.game?.visitor_team_id || pool.game?.visitorTeamId)}
                </div>
                <div className="text-sm" style={{ color: colors.text, opacity: 0.65 }}>
                  <FiCalendar className="inline-block mr-1" /> {formatDate(pool.game?.game_time || pool.game?.game_datetime || pool.game?.gameTime)}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                {renderProgressCircle(getProgressPercentage(pool))}
                <div className="text-xs" style={{ color: colors.text, opacity: 0.7, marginLeft: '10px' }}>
                  Squares filled
                </div>
              </div>

              {pool.player_pool_type === 'CREDIT' && (
                <div className='h-full min-w-[120px]' style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="text-xl font-bold" style={{ color: colors.text }}>
                    {pool.players.find(p => extractPlayerId(p) === currentUserIdValue) !== undefined && (
                      `$${parseFloat(pool.players.find(p => extractPlayerId(p) === currentUserIdValue).credits_available).toFixed(2)}`
                    )}

                  </div>
                  <div className="text-xs" style={{ color: colors.text, opacity: 0.7, marginLeft: '10px' }}>
                    Credit Balance
                  </div>
                </div>
              )}

              <div className='h-full min-w-[120px]' style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="text-xl font-bold" style={{ color: colors.text }}>
                  {pool.player_pool_type || 'N/A'}
                </div>
                <div className="text-xs" style={{ color: colors.text, opacity: 0.7, marginLeft: '10px' }}>
                  Pool Type
                </div>
              </div>

              <div className='h-full min-w-[120px]' style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="text-xl font-bold" style={{ color: colors.text }}>
                  <span className='capitalize' style={{ color: pool.pool_status === 'open' ? '#34D399' : '#F87171' }}>
                    {pool.pool_status || 'N/A'}
                  </span>
                </div>
                <div className="text-xs" style={{ color: colors.text, opacity: 0.7, marginLeft: '10px' }}>
                  Pool Status
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-6 gap-3 mb-5">
          <div style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '10px 12px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Entry / square</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              ${parseFloat(pool.entry_fee || pool.credit_cost || pool.costPerSquare || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '10px 12px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Total pot</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              ${parseFloat(pool.total_pot || pool.totalPot || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '10px 12px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Total Players</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              {pool.players?.length || pool.playerCount || 0}
            </div>
          </div>

          {/* <div className='col-span-2' style={{ backgroundColor: colors.cardHover, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '10px 12px' }}>
            <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Numbers Type</div>
            <div className="text-xl font-bold" style={{ color: colors.text }}>
              {numbersTypeLabel}
            </div>
          </div> */}
          
          
        </div>

        {/* Admin Controls */}
        {canManagePool && (
          <div
            className="mb-5"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px' }}
          >
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: colors.text }}>
              <FiAward />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: colors.text }}>Calculate Winners</h4>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((quarter) => (
                    <button
                      key={quarter}
                      onClick={() => handleCalculateWinner(quarter)}
                      disabled={calculatingWinners}
                      className="px-3 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}`, opacity: calculatingWinners ? 0.6 : 1 }}
                    >
                      Q{quarter}
                    </button>
                  ))}
                  <button
                    onClick={handleCalculateAllWinners}
                    disabled={calculatingWinners}
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: colors.brand.primary, color: '#fff', opacity: calculatingWinners ? 0.6 : 1 }}
                  >
                    All Quarters
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: colors.text }}>Pool Tools</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="px-3 py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <span className="inline-flex items-center gap-2"><FiShare2 /> Share QR</span>
                  </button>
                  <button
                    onClick={() => setShowWinners(!showWinners)}
                    className="px-3 py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <span className="inline-flex items-center gap-2"><FiAward /> {showWinners ? 'Hide' : 'Show'} Winners</span>
                  </button>
                  {pool.pool_status === 'open' ? (
                    <button
                      onClick={handleClosePool}
                      className="px-3 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <FiLock /> Close Pool
                    </button>
                  ) : (
                    <button
                      onClick={handleReopenPool}
                      className="px-3 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <FiUnlock /> Reopen Pool
                    </button>
                  )}
                  {requiresManualAssignment && (
                    <button
                      onClick={handleAssignNumbers}
                      disabled={assigningNumbers}
                      className="px-3 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}`, opacity: assigningNumbers ? 0.6 : 1 }}
                    >
                      <FiGrid /> {assigningNumbers ? 'Assigning...' : 'Assign Numbers'}
                    </button>
                  )}
                  {pool.player_pool_type === 'CREDIT' && (
                    <>
                      <button
                        onClick={handleMakePoolFree}
                        className="px-3 py-2 rounded-lg font-semibold"
                        style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        <FiDollarSign /> Make Pool Free
                      </button>
                      <button
                        onClick={handleAddCredits}
                        className="px-3 py-2 rounded-lg font-semibold"
                        style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        <FiTrendingUp /> Grant Credits
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
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
            <div className="space-y-2">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: colors.cardHover,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: colors.text }}>
                        Quarter {winner.quarter}
                      </div>
                      <div className="text-sm" style={{ color: colors.text, opacity: 0.75 }}>
                        Winner: <span className="font-semibold" style={{ color: colors.text }}>{winner.player?.name || 'Unknown'}</span>
                      </div>
                      <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                        Square: ({winner.square?.x_coordinate}, {winner.square?.y_coordinate})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: colors.brand.primary }}>
                        ${parseFloat(winner.prize_amount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>Prize</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join/Selection Controls */}
        {!hasJoined ? (
          <div
            className="mb-5"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '16px' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FiLock style={{ color: colors.brand.secondary }} className="text-2xl" />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>Join this pool to select squares</h3>
                  <p style={{ color: colors.text, opacity: 0.7 }}>You need to join before you can pick squares.</p>
                </div>
              </div>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-5 py-3 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: colors.brand.primary, color: '#fff' }}
              >
                Join Pool
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mb-5"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '14px' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div style={{ color: colors.brand.primary }} className="text-2xl">✓</div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>You've joined this pool!</h3>
                  <p style={{ color: colors.text, opacity: 0.7 }}>
                    {selectionMode ? 'Click squares to select them' : 'Click "Select Squares" to start choosing'}
                  </p>
                </div>
              </div>

              {!selectionMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectionMode(true)}
                    disabled={pool.pool_status !== 'open'}
                    className="px-5 py-3 rounded-lg font-semibold transition-all"
                    style={{ backgroundColor: colors.brand.primary, color: '#fff', opacity: pool.pool_status !== 'open' ? 0.5 : 1 }}
                  >
                    Select Squares
                  </button>
                  {pool.player_pool_type === 'CREDIT' && (
                    <button
                      onClick={() => setShowRequestCreditsModal(true)}
                      className="px-5 py-3 rounded-lg font-semibold transition-all"
                      style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      <span className="inline-flex items-center gap-2"><FiCreditCard /> Request Credits</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedSquares([]);
                    }}
                    className="px-5 py-3 rounded-lg font-semibold transition-all"
                    style={{ backgroundColor: colors.cardHover, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedSquares.length === 0}
                    className="px-6 py-3 rounded-lg font-semibold transition-all"
                    style={{ backgroundColor: colors.brand.primary, color: '#fff', opacity: selectedSquares.length === 0 ? 0.5 : 1 }}
                  >
                    Confirm {selectedSquares.length > 0 && `(${selectedSquares.length})`}
                  </button>
                </div>
              )}
            </div>

            {selectionMode && selectedSquares.length > 0 && (
              <div style={{ marginTop: '12px', backgroundColor: colors.cardHover, borderRadius: '10px', padding: '12px', border: `1px solid ${colors.border}` }}>
                <div className="flex justify-between items-center" style={{ color: colors.text }}>
                  <span className="font-semibold">
                    {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="font-bold" style={{ color: colors.brand.primary }}>
                    Total: ${getTotalCost()}
                  </span>
                </div>
              </div>
            )}
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
                  xAxisNumbers: pool.x_numbers || [],
                  yAxisNumbers: pool.y_numbers || [],
                }}
                squares={pool.squares || []}
                onSquareSelect={handleSquareSelection}
                currentPlayerID={currentPlayerId}
                selectionMode={selectionMode}
                disabled={!hasJoined || pool.pool_status !== 'open'}
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

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Join Pool</h2>
            <p className="text-gray-300 mb-6">
              {pool.player_pool_type === 'CREDIT'
                ? 'Enter the pool password to join'
                : 'Click join to enter this pool'}
            </p>

            {pool.player_pool_type === 'CREDIT' && (
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Pool Password
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinPool()}
                />
              </div>
            )}

            {joinError && (
              <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
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
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinPool}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-all"
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
            className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-3xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeCreditsModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close credits modal"
            >
              <FiX className="text-2xl" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <FiCreditCard className="text-indigo-400 text-3xl" />
              <div>
                <h3 className="text-2xl font-bold text-white">Grant Credits</h3>
                <p className="text-gray-400 text-sm">View joined players and manage their credits for this pool.</p>
              </div>
            </div>
            {!canGrantCredits && (
              <div className="mb-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg text-sm">
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
                <div className="text-center text-gray-300 py-12">Loading players...</div>
              ) : poolPlayers.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No players have joined this pool yet.</div>
              ) : (
                poolPlayers.map((player) => {
                  const playerId = extractPlayerId(player);
                  if (!playerId) return null;
                  const name = getPlayerDisplayName(player);
                  const email = getPlayerEmail(player);
                  const availableCredits = getPlayerAvailableCredits(player);
                  return (
                    <div key={playerId} className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-white font-semibold">{name}</p>
                          {email && <p className="text-gray-400 text-sm">{email}</p>}
                        </div>
                        <div className="text-sm text-gray-300">
                          <p className="text-gray-400 text-xs uppercase tracking-wide">Available Credits</p>
                          <p className="text-green-400 font-bold text-xl">{formatCurrency(availableCredits)}</p>
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
                          className="flex-1 bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                        />
                        <button
                          onClick={() => handleGrantCreditsToPlayer(playerId)}
                          disabled={!canGrantCredits || creditsLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
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
            className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeQRCodeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close QR modal"
            >
              <FiX className="text-2xl" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-2xl font-bold text-white text-center">Share Pool</h3>
              <p className="text-gray-400 text-center text-sm">Scan or download the QR code to invite players to this pool.</p>
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
                  <div className="text-red-500 text-sm">QR code not available.</div>
                )}
              </div>
              {effectiveJoinUrl && (
                <div className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <p className="text-gray-400 text-xs uppercase">Join Link</p>
                  <p className="text-white text-sm font-mono break-all">{effectiveJoinUrl}</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-gray-300 text-sm">Pool Number</p>
                <p className="text-white text-xl font-bold">{poolNumberDisplay || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={handleDownloadQRCode}
                  disabled={downloadingQR || (!effectiveJoinUrl && !fallbackQrImage)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <FiDownload />
                  {downloadingQR ? 'Downloading...' : 'Download QR Code'}
                </button>
                <button
                  onClick={closeQRCodeModal}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
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
            className="bg-gray-900 rounded-2xl border border-purple-700 shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeRequestCreditsModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close request credits modal"
            >
              <FiX className="text-2xl" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <FiCreditCard className="text-purple-400 text-3xl" />
              <div>
                <h3 className="text-2xl font-bold text-white">Request Credits</h3>
                <p className="text-gray-400 text-sm">Request credits from the pool commissioner</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Why do you need these credits?"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeRequestCreditsModal}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCredits}
                  disabled={requestingCredits || !requestAmount}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {requestingCredits ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
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






