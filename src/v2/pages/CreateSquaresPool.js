import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiInfo } from 'react-icons/fi';
import squaresApiService from '../services/squaresApiService';

/**
 * Create Squares Pool Page
 * Admin interface for creating new squares pools
 */
const CreateSquaresPool = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    loadGames();
    loadRewardTypes();
  }, []);

  const loadGames = async () => {
    try {
      const response = await squaresApiService.getGames({ status: 'NotStarted' });
      if (response.success) {
        setGames(response.data);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const loadRewardTypes = async () => {
    try {
      const response = await squaresApiService.getRewardTypes();
      if (response.success) {
        setRewardTypes(response.data);
      }
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
      setFormData(prev => ({
        ...prev,
        gameID: gameID,
        homeTeamId: game.home_team_id || game.homeTeamId,
        visitorTeamId: game.visitor_team_id || game.visitorTeamId,
        xAxisTeam: game.home_team || game.homeTeam,
        yAxisTeam: game.visitor_team || game.visitorTeam,
        gridName: `${game.home_team || game.homeTeam} vs ${game.visitor_team || game.visitorTeam} Squares`,
        gameNickname: game.game_nickname || game.gameNickname || `${game.home_team || game.homeTeam} vs ${game.visitor_team || game.visitorTeam}`,
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
      const response = await squaresApiService.createPool(formData);
      if (response.success) {
        alert('Pool created successfully!');
        navigate(`/v2/squares/pool/${response.data.id}`);
      } else {
        const errorMsg = typeof response.error === 'object'
          ? JSON.stringify(response.error)
          : response.error;
        alert('Failed to create pool: ' + errorMsg);
      }
    } catch (error) {
      alert('Error creating pool: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = games.find(g => g.id === parseInt(formData.gameID) || g.gameID === parseInt(formData.gameID));
  const selectedRewardType = rewardTypes.find(r => r.id === formData.gameRewardTypeID);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/v2/squares')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-all"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Create Squares Pool
            </h1>
            <p className="text-gray-300 mt-1">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            {['Game Selection', 'Settings', 'Teams & Rules', 'Review'].map((label, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 ${
                  idx + 1 <= step ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx + 1 <= step ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {idx + 1 < step ? <FiCheck /> : idx + 1}
                </div>
                <span className="hidden md:inline text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 border-2 border-gray-700">

          {/* Step 1: Game Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Select Game</h2>

              {/* Pool Name */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Pool Name *
                </label>
                <input
                  type="text"
                  value={formData.gridName}
                  onChange={(e) => handleChange('gridName', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter pool name"
                />
                {errors.gridName && (
                  <p className="mt-1 text-red-400 text-sm">{errors.gridName}</p>
                )}
              </div>

              {/* Pool Description */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Pool Description (Optional)
                </label>
                <textarea
                  value={formData.poolDescription}
                  onChange={(e) => handleChange('poolDescription', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your pool rules, prize structure, or any special instructions"
                  rows="3"
                />
                <p className="mt-1 text-gray-400 text-sm">
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
                    const homeTeam = game.home_team || game.homeTeam;
                    const visitorTeam = game.visitor_team || game.visitorTeam;
                    const league = game.league;
                    const gameTime = game.game_time || game.gameTime;

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
                      <p><span className="font-medium">Game:</span> {selectedGame.home_team || selectedGame.homeTeam} vs {selectedGame.visitor_team || selectedGame.visitorTeam}</p>
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
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
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
