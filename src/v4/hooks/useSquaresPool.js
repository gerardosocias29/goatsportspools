import { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';

const useSquaresPool = (poolNumber) => {
  const axios = useAxios();
  const { user, isSignedIn, isLoaded } = useUserContext();

  const [pool, setPool] = useState(null);
  const [squares, setSquares] = useState([]);
  const [winners, setWinners] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived state
  const poolId = pool?.id;
  const hasJoined = pool?.user_joined || false;
  const isPoolOpen = pool?.pool_status === 'open';
  const maxPerPlayer = pool?.max_squares_per_player || null;
  const costPerSquare = pool?.credit_cost || 0;
  const numbersAssigned = pool?.numbers_assigned || false;

  const claimedCount = squares.filter(s =>
    (s.player_id !== null && s.player_id !== undefined)
  ).length;

  const mySquaresCount = squares.filter(s => {
    const squarePlayerId = parseInt(s.player_id);
    const currentPlayerId = parseInt(user?.id);
    return !isNaN(squarePlayerId) && !isNaN(currentPlayerId) && squarePlayerId === currentPlayerId;
  }).length;

  // Team lookup helpers
  const getTeamById = useCallback((teamId) => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId) || null;
  }, [teams]);

  const getTeamName = useCallback((teamId) => {
    const team = getTeamById(teamId);
    return team?.name || team?.team_name || 'TBD';
  }, [getTeamById]);

  const getTeamLogo = useCallback((teamId) => {
    const team = getTeamById(teamId);
    return team?.logo || team?.image_url || null;
  }, [getTeamById]);

  // Load pool data
  const loadPool = useCallback(async () => {
    if (!poolNumber) return;
    try {
      setError(null);
      const response = await axios.get(`/api/squares-pools/${poolNumber}`);
      const data = response.data.data || response.data;
      setPool(data);
      setSquares(data.squares || []);
      if (data.winners) {
        setWinners(data.winners);
      }
    } catch (err) {
      console.error('Error loading pool:', err);
      setError(err.response?.data?.message || 'Failed to load pool');
    }
  }, [poolNumber, axios]);

  // Load teams
  const loadTeams = useCallback(async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  }, [axios]);

  // Load winners
  const loadWinners = useCallback(async () => {
    if (!poolId) return;
    try {
      const response = await axios.get(`/api/squares-pools/${poolId}/winners`);
      setWinners(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading winners:', err);
    }
  }, [poolId, axios]);

  // Join pool
  const joinPool = useCallback(async (password = '') => {
    try {
      const response = await axios.post('/api/squares-pools/join', {
        pool_number: poolNumber,
        password,
      });
      // Reload pool data after joining
      await loadPool();
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to join pool' };
    }
  }, [poolNumber, axios, loadPool]);

  // Claim squares sequentially
  const claimSquares = useCallback(async (squareArray, onProgress) => {
    if (!poolId) return { success: false, error: 'No pool loaded' };

    const results = [];
    for (let i = 0; i < squareArray.length; i++) {
      const sq = squareArray[i];
      try {
        const response = await axios.post(`/api/squares-pools/${poolId}/claim-square`, {
          x_coordinate: sq.x_coordinate,
          y_coordinate: sq.y_coordinate,
        });
        results.push({ success: true, data: response.data });
        if (onProgress) onProgress(i + 1, squareArray.length);
      } catch (err) {
        results.push({
          success: false,
          error: err.response?.data?.message || 'Failed to claim square',
          square: sq,
        });
        if (onProgress) onProgress(i + 1, squareArray.length);
      }
    }

    // Reload pool data after claiming
    await loadPool();

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      return {
        success: false,
        error: `${failed.length} of ${squareArray.length} squares failed to claim`,
        results,
      };
    }
    return { success: true, results };
  }, [poolId, axios, loadPool]);

  // Leave pool
  const leavePool = useCallback(async () => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      await axios.post(`/api/squares-pools/${poolId}/leave`);
      await loadPool();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to leave pool' };
    }
  }, [poolId, axios, loadPool]);

  // Admin: Update game scores (superadmin only)
  const updateGameScores = useCallback(async (scoreData) => {
    if (!pool?.game?.id) return { success: false, error: 'No game linked' };
    try {
      await axios.put(`/api/games/${pool.game.id}/scores`, scoreData);
      await loadPool();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update scores' };
    }
  }, [pool?.game?.id, axios, loadPool]);

  // Admin: Calculate winner for a quarter
  const calculateWinners = useCallback(async (quarter, homeScore, visitorScore) => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      const payload = { quarter };
      if (homeScore !== undefined) payload.home_score = homeScore;
      if (visitorScore !== undefined) payload.visitor_score = visitorScore;
      const response = await axios.post(`/api/squares-pools/${poolId}/calculate-winners`, payload);
      await loadWinners();
      await loadPool();
      return { success: true, unclaimed: response.data?.unclaimed };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to calculate winners' };
    }
  }, [poolId, axios, loadPool, loadWinners]);

  // Admin: Close pool
  const closePool = useCallback(async () => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      await axios.post(`/api/squares-pools/${poolId}/close`);
      await loadPool();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to close pool' };
    }
  }, [poolId, axios, loadPool]);

  // Admin: Reopen pool
  const reopenPool = useCallback(async () => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      await axios.post(`/api/squares-pools/${poolId}/reopen`);
      await loadPool();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to reopen pool' };
    }
  }, [poolId, axios, loadPool]);

  // Admin: Assign numbers (random)
  const assignNumbers = useCallback(async () => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      await axios.post(`/api/squares-pools/${poolId}/assign-numbers`);
      await loadPool();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to assign numbers' };
    }
  }, [poolId, axios, loadPool]);

  // Admin: Assign numbers ascending (0-9)
  const assignNumbersAscending = useCallback(async () => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      await axios.post(`/api/squares-pools/${poolId}/assign-numbers-ascending`);
      await loadPool();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to assign numbers' };
    }
  }, [poolId, axios, loadPool]);

  // Admin: Update pool password
  const updatePassword = useCallback(async (password) => {
    if (!poolId) return { success: false, error: 'No pool loaded' };
    try {
      const response = await axios.put(`/api/squares-pools/${poolId}/password`, { password });
      await loadPool();
      return { success: true, message: response.data?.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update password' };
    }
  }, [poolId, axios, loadPool]);

  // Initial load
  useEffect(() => {
    if (!poolNumber || !isLoaded) return;

    const init = async () => {
      setLoading(true);
      await Promise.all([loadPool(), loadTeams()]);
      setLoading(false);
    };
    init();
  }, [poolNumber, isLoaded]);

  // Load winners when pool is loaded
  useEffect(() => {
    if (poolId && (pool?.pool_status === 'in_progress' || pool?.pool_status === 'completed')) {
      loadWinners();
    }
  }, [poolId, pool?.pool_status]);

  return {
    pool,
    squares,
    winners,
    teams,
    loading,
    error,
    hasJoined,
    isPoolOpen,
    maxPerPlayer,
    costPerSquare,
    numbersAssigned,
    claimedCount,
    mySquaresCount,
    poolId,
    getTeamById,
    getTeamName,
    getTeamLogo,
    loadPool,
    loadTeams,
    loadWinners,
    joinPool,
    claimSquares,
    leavePool,
    updateGameScores,
    calculateWinners,
    closePool,
    reopenPool,
    assignNumbers,
    assignNumbersAscending,
    updatePassword,
  };
};

export default useSquaresPool;
