import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiCalendar, FiDollarSign, FiGrid, FiLock, FiUnlock, FiTrendingUp, FiAward, FiShare2, FiDownload, FiX, FiCreditCard } from 'react-icons/fi';
import SquaresGrid from '../components/squares/SquaresGrid';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { TeamTemplate } from '../../app/pages/screens/games/NFLTemplates';
import { useTheme } from '../contexts/ThemeContext';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * Reusable Loading Modal Component
 */
const LoadingModal = ({ message, count }) => (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-blue-500 shadow-2xl">
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
              stroke="#3B82F6"
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
        <h3 className="text-2xl font-bold text-white mb-2">{message}</h3>
        {count && (
          <p className="text-gray-300 text-center mb-4">
            Processing {count} square{count !== 1 ? 's' : ''}...
          </p>
        )}

        {/* Progress indicator */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Pool Detail Page
 * Shows grid details and allows square selection
 */
const SquaresPoolDetail = () => {
  const { colors } = useTheme();
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
    const selectedSquares = pool.squares_claimed || pool.selectedSquares || 0;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
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
                stroke="#fff"
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
            color: "#fff",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">Pool not found</p>
          <button
            onClick={() => navigate('/v2/squares')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/v2/squares')}
            className="text-white p-3 rounded-lg transition-all"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.cardHover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.card}
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: colors.text }}>
              {pool.pool_name || pool.gridName}
            </h1>
            <p className="text-gray-300 mt-1">Pool #{pool.pool_number || pool.poolNumber}</p>
          </div>
        </div>

        {/* Pool Info Card */}
        <div className="mb-6 bg-gray-800 rounded-xl shadow-xl p-6 border-2 border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Game Info */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiCalendar />
                <span className="text-sm font-medium">Game</span>
              </div>
              <div className="text-white font-bold text-lg grid gap-1 items-center">
                <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
                  backgroundImage: `url(${getTeamBackground(pool.game?.home_team_id || pool.game?.homeTeamId)})`,
                  backgroundSize: 'cover', // Ensures the image covers the entire div
                  backgroundPosition: 'center', // Centers the image within the div
                }}>
                  <img src={getTeamLogo(pool.game?.home_team_id || pool.game?.homeTeamId)} alt={getTeamName(pool.game?.home_team_id || pool.game?.homeTeamId)} className="w-[50px]"/>
                  <p className="font-bold text-white select-none">{getTeamName(pool.game?.home_team_id || pool.game?.homeTeamId)}</p>
                </div>
                <div className='text-center'>vs</div>
                <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
                  backgroundImage: `url(${getTeamBackground(pool.game?.visitor_team_id || pool.game?.visitorTeamId)})`,
                  backgroundSize: 'cover', // Ensures the image covers the entire div
                  backgroundPosition: 'center', // Centers the image within the div
                }}>
                  <img src={getTeamLogo(pool.game?.visitor_team_id || pool.game?.visitorTeamId)} alt={getTeamName(pool.game?.visitor_team_id || pool.game?.visitorTeamId)} className="w-[50px]"/>
                  <p className="font-bold text-white select-none">{getTeamName(pool.game?.visitor_team_id || pool.game?.visitorTeamId)}</p>
                </div>
              </div>
              <div className="text-gray-400 text-sm mt-2">
                {pool.game?.league || 'NFL'} • {formatDate(pool.game?.game_time || pool.game?.game_datetime || pool.game?.gameTime)}
              </div>
            </div>

            {/* Cost & Pot */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiDollarSign />
                <span className="text-sm font-medium">Cost & Type</span>
              </div>
              {/* Pool Type Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                pool.player_pool_type === 'CREDIT'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {pool.player_pool_type === 'CREDIT' ? <FiLock /> : <FiUnlock />}
                {pool.player_pool_type === 'CREDIT' ? 'CREDIT' : 'FREE'}
              </div>
              <div className="text-green-400 font-bold text-2xl">
                ${parseFloat(pool.entry_fee || pool.credit_cost || pool.costPerSquare || 0).toFixed(2)}
                <span className="text-sm text-gray-400 ml-1">per square</span>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                Total Pot: <span className="text-yellow-400 font-semibold">${parseFloat(pool.total_pot || pool.totalPot || 0).toFixed(2)}</span>
              </div>
              {/* Show user balance if CREDIT type */}
              {pool.player_pool_type === 'CREDIT' && currentUser && (
                <div className="text-blue-400 text-sm mt-2 flex items-center gap-1">
                  <FiCreditCard />
                  Your Balance: <span className="font-bold">{currentUser.credits || currentUser.available_credits || 0} credits</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiGrid />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="text-white font-bold text-2xl">
                {getProgressPercentage()}%
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {pool.squares_claimed || pool.selectedSquares || 0}/{pool.total_squares || pool.totalSquares || 100} squares filled
              </div>
            </div>

            {/* Rewards */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiTrendingUp />
                <span className="text-sm font-medium">Rewards</span>
              </div>
              <div className="text-purple-400 font-bold text-lg">
                {pool.rewardType?.name || 'Standard'}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {pool.rewardType?.description}
              </div>
            </div>
          </div>

          {/* Pool Commissioner Info */}
          {pool.admin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <FiUsers className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Pool Commissioner</div>
                  <div className="text-white font-semibold text-lg">{pool.admin.name || 'Unknown'}</div>
                  {pool.admin.email && (
                    <div className="text-gray-400 text-xs">{pool.admin.email}</div>
                  )}
                </div>
                <div className="ml-auto">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {canManagePool && (
          <div className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 border-2 border-purple-700 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiAward className="text-2xl" />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-3">Calculate Winners</h4>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((quarter) => (
                    <button
                      key={quarter}
                      onClick={() => handleCalculateWinner(quarter)}
                      disabled={calculatingWinners}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      Q{quarter}
                    </button>
                  ))}
                  <button
                    onClick={handleCalculateAllWinners}
                    disabled={calculatingWinners}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold transition-all"
                  >
                    All Quarters
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Pool Tools</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    <FiShare2 />
                    Show QR Code
                  </button>
                  <button
                    onClick={() => setShowWinners(!showWinners)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    <FiAward />
                    {showWinners ? 'Hide' : 'Show'} Winners
                  </button>
                  {pool.pool_status === 'open' ? (
                    <button
                      onClick={handleClosePool}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <FiLock />
                      Close Pool
                    </button>
                  ) : (
                    <button
                      onClick={handleReopenPool}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <FiUnlock />
                      Reopen Pool
                    </button>
                  )}
                  {requiresManualAssignment && (
                    <button
                      onClick={handleAssignNumbers}
                      disabled={assigningNumbers}
                      className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <FiGrid />
                      {assigningNumbers ? 'Assigning...' : 'Assign Numbers'}
                    </button>
                  )}
                  {pool.player_pool_type === 'CREDIT' && (
                    <>
                      <button
                        onClick={handleMakePoolFree}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <FiDollarSign />
                        Make Pool FREE
                      </button>
                      <button
                        onClick={handleAddCredits}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <FiTrendingUp />
                        Grant Credits
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
          <div className="mb-6 bg-gray-800 rounded-xl p-6 border-2 border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiAward className="text-2xl" />
              Winners
            </h3>
            <div className="space-y-3">
              {winners.map((winner, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-900 to-yellow-800 rounded-lg p-4 border border-yellow-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-yellow-300 font-bold text-lg">
                        Quarter {winner.quarter}
                      </div>
                      <div className="text-white mt-1">
                        Winner: <span className="font-semibold">{winner.player?.name || 'Unknown'}</span>
                      </div>
                      <div className="text-gray-300 text-sm mt-1">
                        Square: ({winner.square?.x_coordinate}, {winner.square?.y_coordinate})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-2xl">
                        ${parseFloat(winner.prize_amount || 0).toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">Prize</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join/Selection Controls */}
        {!hasJoined ? (
          <div className="mb-6 bg-yellow-500 border-2 border-yellow-600 rounded-xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FiLock className="text-4xl text-gray-900" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Join this pool to select squares</h3>
                  <p className="text-gray-800">You need to join before you can pick squares</p>
                </div>
              </div>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg"
              >
                Join Pool
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-gray-800 rounded-xl p-4 shadow-xl border-2 border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-green-400 text-3xl">✓</div>
                <div>
                  <h3 className="text-lg font-bold text-white">You've joined this pool!</h3>
                  <p className="text-gray-400 text-sm">
                    {selectionMode ? 'Click squares to select them' : 'Click "Select Squares" to start choosing'}
                  </p>
                </div>
              </div>

              {!selectionMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectionMode(true)}
                    disabled={pool.pool_status !== 'open'}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
                  >
                    Select Squares
                  </button>
                  {pool.player_pool_type === 'CREDIT' && (
                    <button
                      onClick={() => setShowRequestCreditsModal(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
                    >
                      <FiCreditCard />
                      Request Credits
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
                    className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedSquares.length === 0}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
                  >
                    Confirm {selectedSquares.length > 0 && `(${selectedSquares.length})`}
                  </button>
                </div>
              )}
            </div>

            {selectionMode && selectedSquares.length > 0 && (
              <div className="mt-4 p-4 bg-blue-900 rounded-lg border border-blue-700">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">
                    {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-green-400 font-bold text-xl">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pool Rules */}
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Pool Rules</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">•</span>
                <p>Max {pool.max_squares_per_player || pool.maxSquaresPerPlayer || 'Unlimited'} squares per player</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">•</span>
                <p>Numbers assignment: {numbersTypeLabel}</p>
              </div>
              {!numbersAssigned && numbersType === 'AdminTrigger' && (
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 font-bold">!</span>
                  <p>Numbers will remain hidden until an admin manually assigns them.</p>
                </div>
              )}
              {(pool.number_assign_datetime || pool.numbersAssignDate) && (
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <p>Numbers assigned on: {formatDate(pool.number_assign_datetime || pool.numbersAssignDate)}</p>
                </div>
              )}
              {(pool.close_datetime || pool.closeDate) && (
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <p>Pool closes: {formatDate(pool.close_datetime || pool.closeDate)}</p>
                </div>
              )}
              {pool.pool_description && (
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <p>{pool.pool_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <p>Select your squares on the 10x10 grid</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <p>Numbers (0-9) are assigned to each axis</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <p>Winners determined by last digit of each team's score</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <p>Prizes distributed based on reward structure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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






