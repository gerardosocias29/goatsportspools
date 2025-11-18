import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { FiGrid, FiLock } from 'react-icons/fi';

/**
 * Squares Pool Join Page
 * Handles QR code scans and direct join links
 */
const SquaresJoin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const { user, isSignedIn, isLoaded } = useUserContext();

  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [joining, setJoining] = useState(false);

  const poolNumber = searchParams.get('pool');

  // Authentication guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/v2/sign-in', { state: { returnTo: `/v2/squares/join?pool=${poolNumber}` } });
    }
  }, [isSignedIn, isLoaded, poolNumber, navigate]);

  useEffect(() => {
    if (!poolNumber) {
      setError('No pool code provided');
      setLoading(false);
      return;
    }

    loadPool();
  }, [poolNumber]);

  const loadPool = async () => {
    setLoading(true);
    try {
      const response = await axiosService.get(`/api/squares-pools/by-number/${poolNumber}`);
      setPool(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Pool not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    setError('');

    try {
      await axiosService.post('/api/squares-pools/join', {
        pool_number: poolNumber,
        password: password || undefined,
      });

      // Redirect to pool detail
      navigate(`/v2/squares/pool/${pool.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join pool');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading pool...</p>
        </div>
      </div>
    );
  }

  if (error && !pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-red-500">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Pool Not Found</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/v2/squares')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Browse All Pools
            </button>
          </div>
        </div>
      </div>
    );
  }

  const requiresPassword = pool?.player_pool_type === 'CREDIT' || pool?.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-blue-500 shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiGrid className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Pool</h1>
          <p className="text-gray-300">{pool?.pool_name}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Pool Number</span>
            <span className="text-white font-bold text-xl">{poolNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Entry Type</span>
            <span className="text-white">{pool?.player_pool_type || 'FREE'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Available Squares</span>
            <span className="text-white">{pool?.available_squares || 0}/100</span>
          </div>
        </div>

        {requiresPassword && (
          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
              <FiLock />
              Pool Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/v2/squares')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={joining || (requiresPassword && !password)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all"
          >
            {joining ? 'Joining...' : 'Join Pool'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SquaresJoin;
