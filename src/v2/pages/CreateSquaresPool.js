import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiInfo } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Create Squares Pool Page
 * Admin interface for creating new squares pools
 * Only accessible to role_id <= 2 (Superadmin and Square Admin)
 */
const CreateSquaresPool = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const { user: currentUser, isSignedIn, isLoaded } = useUserContext();
  const { colors, isDark } = useTheme();

  const [games, setGames] = useState([]);
  const [rewardTypes, setRewardTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    gridName: '',
    poolDescription: '',
    gameID: '',
    gameNickname: '',

    // Number Assignment
    numbersType: 'TimeSet',
    numbersAssignDate: '',

    // Access & Cost
    costType: 'PasswordOpen',
    poolPassword: '',
    costPerSquare: 10.00,

    // Rewards
    rewardsType: 'CreditsRewards',
    gameRewardTypeID: 1,
    reward1_percent: 25, // Q1
    reward2_percent: 25, // Q2
    reward3_percent: 25, // Q3
    reward4_percent: 25, // Q4 (Final)

    // Player Limits
    maxSquaresPerPlayer: 10,

    // Teams
    homeTeamId: '',
    visitorTeamId: '',
    xAxisTeam: '',
    yAxisTeam: '',
    axisType: 'HomeAway',

    // Closing
    closeDate: '',

    // External
    externalPoolId: '',
  });

  const [errors, setErrors] = useState({});

  // Authentication and role-based access control
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Not signed in - redirect to sign-in
      navigate('/v2/sign-in', { state: { returnTo: '/v2/squares/create' } });
      return;
    }

    if (isLoaded && isSignedIn && currentUser) {
      const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id;
      // Only role_id 1 (Superadmin) and role_id 2 (Square Admin) can create pools
      if (userRoleId > 2) {
        alert('You do not have permission to create pools. Only admins can create pools.');
        navigate('/v2/squares');
      }
    }
  }, [isSignedIn, isLoaded, currentUser, navigate]);

  useEffect(() => {
    loadGames();
    loadRewardTypes();
  }, []);

  const loadGames = async () => {
    try {
      const response = await axiosService.get('/api/games/manage');
      setGames(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const loadRewardTypes = async () => {
    try {
      const response = await axiosService.get('/api/game-reward-types');
      setRewardTypes(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading reward types:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleGameSelect = (gameID) => {
    const game = games.find(g => g.id === parseInt(gameID) || g.gameID === parseInt(gameID));
    if (game) {
      // Extract team names (handle both object and string formats)
      const homeTeamName = game.home_team?.name || game.home_team || game.homeTeam;
      const visitorTeamName = game.visitor_team?.name || game.visitor_team || game.visitorTeam;

      setFormData(prev => ({
        ...prev,
        gameID: gameID,
        homeTeamId: game.home_team_id || game.home_team?.id || game.homeTeamId,
        visitorTeamId: game.visitor_team_id || game.visitor_team?.id || game.visitorTeamId,
        xAxisTeam: homeTeamName,
        yAxisTeam: visitorTeamName,
        gridName: `${homeTeamName} vs ${visitorTeamName} Squares`,
        gameNickname: game.game_nickname || game.gameNickname || `${homeTeamName} vs ${visitorTeamName}`,
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.gridName.trim()) {
      newErrors.gridName = 'Pool name is required';
    }
    if (!formData.gameID) {
      newErrors.gameID = 'Please select a game';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.numbersType === 'TimeSet' && !formData.numbersAssignDate) {
      newErrors.numbersAssignDate = 'Please set a date for number assignment';
    }
    if (formData.costType === 'PasswordOpen' && !formData.poolPassword.trim()) {
      newErrors.poolPassword = 'Password is required for password-protected pools';
    }
    if (formData.costPerSquare < 0) {
      newErrors.costPerSquare = 'Cost cannot be negative';
    }

    // Validate reward percentages add up to 100%
    const totalReward = formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent;
    if (totalReward !== 100) {
      newErrors.rewardPercentages = `Quarter payouts must total 100% (currently ${totalReward}%)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.xAxisTeam.trim()) {
      newErrors.xAxisTeam = 'X-axis team is required';
    }
    if (!formData.yAxisTeam.trim()) {
      newErrors.yAxisTeam = 'Y-axis team is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid && step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      // Map UI field names to backend field names (matching squaresApiService structure)
      const requestData = {
        pool_name: formData.gridName,
        pool_description: formData.poolDescription,
        game_id: formData.gameID,
        pool_type: formData.numbersType === 'Ascending' ? 'A' : 'B',
        player_pool_type: formData.costType === 'Free' ? 'FREE' : 'CREDIT',
        reward_type: formData.rewardsType || 'CreditsRewards',
        password: formData.poolPassword,
        entry_fee: formData.costPerSquare,
        credit_cost: formData.costPerSquare,
        max_squares_per_player: formData.maxSquaresPerPlayer,
        close_datetime: formData.closeDate,
        number_assign_datetime: formData.numbersAssignDate,
        game_reward_type_id: formData.gameRewardTypeID,
        home_team_id: formData.homeTeamId,
        visitor_team_id: formData.visitorTeamId,
        game_nickname: formData.gameNickname,
        external_pool_id: formData.externalPoolId,
        // Quarter reward percentages (must add up to 100%)
        reward1_percent: formData.reward1_percent,
        reward2_percent: formData.reward2_percent,
        reward3_percent: formData.reward3_percent,
        reward4_percent: formData.reward4_percent,
      };

      const response = await axiosService.post('/api/squares-pools', requestData);
      if (response.data) {
        alert('Pool created successfully!');
        navigate(`/v2/squares/pool/${response.data.id || response.data.data?.id}`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || error.message;
      const errorText = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg;
      alert('Failed to create pool: ' + errorText);
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = games.find(g => g.id === parseInt(formData.gameID) || g.gameID === parseInt(formData.gameID));
  const selectedRewardType = rewardTypes.find(r => r.id === formData.gameRewardTypeID);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/v2/squares')}
            className="text-white p-3 rounded-lg transition-all"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.cardHover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.card}
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: colors.text }}>
              Create Squares Pool
            </h1>
            <p className="mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Step {step} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-lg p-4" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="flex justify-between mb-2">
            {['Game Selection', 'Settings', 'Teams & Rules', 'Review'].map((label, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2"
                style={{ color: idx + 1 <= step ? colors.brand.primary : (isDark ? '#6B7280' : '#9CA3AF') }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: idx + 1 <= step ? colors.brand.primary : (isDark ? '#374151' : '#E5E7EB'),
                    color: idx + 1 <= step ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')
                  }}
                >
                  {idx + 1 < step ? <FiCheck /> : idx + 1}
                </div>
                <span className="hidden md:inline text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%`, backgroundColor: colors.brand.primary }}
            ></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="rounded-xl shadow-2xl p-6 md:p-8" style={{ backgroundColor: colors.card, border: `2px solid ${colors.border}` }}>

          {/* Step 1: Game Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Select Game</h2>

              {/* Pool Name */}
              <div>
                <label className="block font-medium mb-2" style={{ color: colors.text }}>
                  Pool Name *
                </label>
                <input
                  type="text"
                  value={formData.gridName}
                  onChange={(e) => handleChange('gridName', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    outlineColor: colors.brand.primary
                  }}
                  placeholder="Enter pool name"
                />
                {errors.gridName && (
                  <p className="mt-1 text-red-400 text-sm">{errors.gridName}</p>
                )}
              </div>

              {/* Pool Description */}
              <div>
                <label className="block font-medium mb-2" style={{ color: colors.text }}>
                  Pool Description (Optional)
                </label>
                <textarea
                  value={formData.poolDescription}
                  onChange={(e) => handleChange('poolDescription', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    outlineColor: colors.brand.primary
                  }}
                  placeholder="Describe your pool rules, prize structure, or any special instructions"
                  rows="3"
                />
                <p className="mt-1 text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Detailed description of pool rules and details
                </p>
              </div>

              {/* Game Selection */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Select Game *
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {games.map((game) => {
                    const gameId = game.id || game.gameID;
                    // Handle both object and string formats for teams
                    const homeTeam = game.home_team?.name || game.home_team || game.homeTeam;
                    const visitorTeam = game.visitor_team?.name || game.visitor_team || game.visitorTeam;
                    const league = game.league;
                    const gameTime = game.game_datetime || game.game_time || game.gameTime;

                    return (
                      <div
                        key={gameId}
                        onClick={() => handleGameSelect(gameId)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.gameID == gameId
                            ? 'bg-blue-600 border-blue-400'
                            : 'bg-gray-700 border-gray-600 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-bold text-lg">
                              {homeTeam} vs {visitorTeam}
                            </div>
                            <div className="text-gray-300 text-sm mt-1">
                              {league} • {new Date(gameTime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          {formData.gameID == gameId && (
                            <FiCheck className="text-white text-2xl" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.gameID && (
                  <p className="mt-2 text-red-400 text-sm">{errors.gameID}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Pool Settings</h2>

              {/* Numbers Assignment Type */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Number Assignment Method
                </label>
                <select
                  value={formData.numbersType}
                  onChange={(e) => handleChange('numbersType', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ascending">Ascending (0-9 in order)</option>
                  <option value="TimeSet">Random at specific time</option>
                  <option value="AdminTrigger">Manual trigger by admin</option>
                </select>
                <p className="mt-1 text-gray-400 text-sm">
                  How numbers 0-9 are assigned to grid axes
                </p>
              </div>

              {/* Numbers Assign Date (if TimeSet) */}
              {formData.numbersType === 'TimeSet' && (
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Numbers Assignment Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.numbersAssignDate}
                    onChange={(e) => handleChange('numbersAssignDate', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.numbersAssignDate && (
                    <p className="mt-1 text-red-400 text-sm">{errors.numbersAssignDate}</p>
                  )}
                </div>
              )}

              {/* Cost Type */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Access Type
                </label>
                <select
                  value={formData.costType}
                  onChange={(e) => handleChange('costType', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Free">Free (No cost)</option>
                  <option value="LinkOpen">Open (Anyone with link)</option>
                  <option value="PasswordOpen">Password Protected</option>
                  <option value="CreditsRequired">Credits Required</option>
                </select>
              </div>

              {/* Pool Password (if PasswordOpen) */}
              {formData.costType === 'PasswordOpen' && (
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Pool Password *
                  </label>
                  <input
                    type="text"
                    value={formData.poolPassword}
                    onChange={(e) => handleChange('poolPassword', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter pool password"
                  />
                  {errors.poolPassword && (
                    <p className="mt-1 text-red-400 text-sm">{errors.poolPassword}</p>
                  )}
                </div>
              )}

              {/* Cost Per Square */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Cost Per Square ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerSquare}
                  onChange={(e) => handleChange('costPerSquare', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.costPerSquare && (
                  <p className="mt-1 text-red-400 text-sm">{errors.costPerSquare}</p>
                )}
                <p className="mt-1 text-gray-400 text-sm">
                  Total pot: ${((formData.costPerSquare || 0) * 100).toFixed(2)}
                </p>
              </div>

              {/* Reward Type */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Reward Distribution
                </label>
                <select
                  value={formData.gameRewardTypeID}
                  onChange={(e) => handleChange('gameRewardTypeID', parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {rewardTypes.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.name} - {reward.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-gray-400 text-sm">
                  How the total pot will be distributed to winners
                </p>
              </div>

              {/* Quarter Payout Percentages */}
              <div className="border-t border-gray-600 pt-4">
                <label className="block text-gray-300 font-medium mb-4">
                  Quarter Payout Percentages (must total 100%)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Q1 Payout %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.reward1_percent}
                      onChange={(e) => handleChange('reward1_percent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Q2 Payout %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.reward2_percent}
                      onChange={(e) => handleChange('reward2_percent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Q3 Payout %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.reward3_percent}
                      onChange={(e) => handleChange('reward3_percent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Q4 (Final) Payout %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.reward4_percent}
                      onChange={(e) => handleChange('reward4_percent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  (formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent) === 100
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  Total: {formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent}%
                  {(formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent) === 100
                    ? ' ✓'
                    : ' (must equal 100%)'}
                </p>
                {errors.rewardPercentages && (
                  <p className="mt-1 text-red-400 text-sm">{errors.rewardPercentages}</p>
                )}
              </div>

              {/* Close Date */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Pool Close Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.closeDate}
                  onChange={(e) => handleChange('closeDate', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-gray-400 text-sm">
                  When to stop accepting square selections
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Teams & Rules */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Teams & Rules</h2>

              {/* Axis Type */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Axis Configuration
                </label>
                <select
                  value={formData.axisType}
                  onChange={(e) => handleChange('axisType', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HomeAway">Home (X) vs Away (Y)</option>
                  <option value="WinnerLoser">Winner (X) vs Loser (Y)</option>
                </select>
              </div>

              {/* X Axis Team */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  X-Axis Team (Horizontal) *
                </label>
                <input
                  type="text"
                  value={formData.xAxisTeam}
                  onChange={(e) => handleChange('xAxisTeam', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team name"
                />
                {errors.xAxisTeam && (
                  <p className="mt-1 text-red-400 text-sm">{errors.xAxisTeam}</p>
                )}
              </div>

              {/* Y Axis Team */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Y-Axis Team (Vertical) *
                </label>
                <input
                  type="text"
                  value={formData.yAxisTeam}
                  onChange={(e) => handleChange('yAxisTeam', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team name"
                />
                {errors.yAxisTeam && (
                  <p className="mt-1 text-red-400 text-sm">{errors.yAxisTeam}</p>
                )}
              </div>

              {/* Max Squares Per Player */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Max Squares Per Player
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxSquaresPerPlayer || ''}
                  onChange={(e) => handleChange('maxSquaresPerPlayer', parseInt(e.target.value) || null)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for no limit"
                />
                <p className="mt-1 text-gray-400 text-sm">
                  Maximum squares each player can select (empty = unlimited)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Review & Create</h2>

              <div className="bg-gray-700 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pool Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-medium">Name:</span> {formData.gridName}</p>
                    {formData.poolDescription && (
                      <p><span className="font-medium">Description:</span> {formData.poolDescription}</p>
                    )}
                    {selectedGame && (
                      <p><span className="font-medium">Game:</span> {selectedGame.home_team?.name || selectedGame.home_team || selectedGame.homeTeam} vs {selectedGame.visitor_team?.name || selectedGame.visitor_team || selectedGame.visitorTeam}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-medium">Numbers:</span> {formData.numbersType}</p>
                    <p><span className="font-medium">Access:</span> {formData.costType}</p>
                    <p><span className="font-medium">Cost per square:</span> ${(formData.costPerSquare || 0).toFixed(2)}</p>
                    <p><span className="font-medium">Total pot:</span> ${((formData.costPerSquare || 0) * 100).toFixed(2)}</p>
                    {selectedRewardType && (
                      <p><span className="font-medium">Rewards:</span> {selectedRewardType.name}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Teams</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-medium">X-Axis:</span> {formData.xAxisTeam}</p>
                    <p><span className="font-medium">Y-Axis:</span> {formData.yAxisTeam}</p>
                    <p><span className="font-medium">Max squares/player:</span> {formData.maxSquaresPerPlayer || 'Unlimited'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 flex gap-3">
                <FiInfo className="text-blue-400 text-xl flex-shrink-0 mt-1" />
                <p className="text-blue-100 text-sm">
                  Once created, your pool will be visible to players. You can manage it from the admin dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 text-white py-3 rounded-lg font-bold transition-all"
                style={{ backgroundColor: colors.brand.primary }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: loading ? undefined : colors.brand.primary }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = colors.brand.primaryHover)}
                onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = colors.brand.primary)}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Create Pool
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSquaresPool;
