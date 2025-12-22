import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiInfo, FiCalendar } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../../app/contexts/ToastContext';

// Styled button component for selections - defined outside to prevent re-creation on render
const SelectButton = ({ selected, onClick, children, disabled, colors, isDark }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-3 rounded-lg font-semibold transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    style={{
      backgroundColor: selected ? colors.brand.primary : (isDark ? '#374151' : '#E5E7EB'),
      color: selected ? '#FFFFFF' : colors.text,
      border: `2px solid ${selected ? colors.brand.primary : colors.border}`,
    }}
  >
    {children}
  </button>
);

// Input field wrapper component - defined outside to prevent re-creation on render
const InputField = ({ label, required, error, children, hint, colors, isDark }) => (
  <div>
    <label className="block font-medium mb-2" style={{ color: colors.text }}>
      {label} {required && '*'}
    </label>
    {children}
    {hint && (
      <p className="mt-1 text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
        {hint}
      </p>
    )}
    {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}
  </div>
);

// Format date for datetime-local input (local timezone)
const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Create Squares Pool Page - 6-Step Wizard
 * Admin interface for creating new squares pools
 * Only accessible to role_id <= 2 (Superadmin and Square Admin)
 */
const CreateSquaresPool = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const { user: currentUser, isSignedIn, isLoaded } = useUserContext();
  const { colors, isDark } = useTheme();
  const showToast = useToast();

  const [games, setGames] = useState([]);
  const [rewardTypes, setRewardTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Season & League
    season: '2025',
    league: 'NFL',

    // Step 2: Game Date
    gameDate: new Date().toISOString().split('T')[0],

    // Step 3: Select Game
    gridName: '',
    poolDescription: '',
    gameID: '',
    gameNickname: '',
    homeTeamId: '',
    visitorTeamId: '',
    xAxisTeam: '',
    yAxisTeam: '',

    // Step 4: Number Assignment
    numbersType: 'AdminTrigger', // AdminTrigger, TimeSet, Ascending
    numbersAssignDate: '',

    // Step 5: Player Settings
    maxSquaresPerPlayer: null, // null = No Max
    poolType: 'OPEN', // OPEN or CREDIT
    poolPassword: '',
    initialCredits: 0,

    // Step 6: Fees & Rewards
    costPerSquare: 10.00,
    customPayout: null, // null = auto-calculate, otherwise use custom amount
    rewardsType: 'CreditsRewards',
    gameRewardTypeID: 1,
    reward1_percent: 25,
    reward2_percent: 25,
    reward3_percent: 25,
    reward4_percent: 25,

    // Other
    axisType: 'HomeAway',
    closeDate: '',
    externalPoolId: '',
  });

  const [errors, setErrors] = useState({});

  // Step labels for progress bar
  const stepLabels = [
    'Season & League',
    'Game Date',
    'Select Game',
    'Number Assignment',
    'Player Settings',
    'Fees & Rewards',
  ];

  // Authentication and role-based access control
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { state: { returnTo: '/squares/create' } });
      return;
    }

    if (isLoaded && isSignedIn && currentUser) {
      const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id;
      if (userRoleId > 2) {
        showToast({ severity: 'error', summary: 'Access Denied', detail: 'You do not have permission to create pools. Only admins can create pools.' });
        navigate('/squares');
      }
    }
  }, [isSignedIn, isLoaded, currentUser, navigate]);

  useEffect(() => {
    loadGames();
    loadRewardTypes();
  }, []);

  // Update default numbersType based on league
  useEffect(() => {
    if (formData.league === 'NBA') {
      setFormData(prev => ({ ...prev, numbersType: 'Ascending' }));
    } else {
      setFormData(prev => ({ ...prev, numbersType: 'AdminTrigger' }));
    }
  }, [formData.league]);

  // Auto-fill reward percentages when reward types are loaded
  useEffect(() => {
    if (rewardTypes.length > 0 && formData.gameRewardTypeID) {
      const selectedReward = rewardTypes.find(r => r.id === formData.gameRewardTypeID);
      if (selectedReward) {
        const toPercent = (val) => {
          const num = parseFloat(val) || 0;
          return num <= 1 ? num * 100 : num;
        };

        setFormData(prev => ({
          ...prev,
          reward1_percent: toPercent(selectedReward.reward1_percent),
          reward2_percent: toPercent(selectedReward.reward2_percent),
          reward3_percent: toPercent(selectedReward.reward3_percent),
          reward4_percent: toPercent(selectedReward.reward4_percent)
        }));
      }
    }
  }, [rewardTypes]);

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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleGameSelect = (gameID) => {
    const game = games.find(g => g.id === parseInt(gameID) || g.gameID === parseInt(gameID));
    if (game) {
      const homeTeamName = game.home_team?.name || game.home_team || game.homeTeam;
      const visitorTeamName = game.visitor_team?.name || game.visitor_team || game.visitorTeam;

      // Calculate default close date: max(current time, game start - 4 hours)
      const gameTime = new Date(game.game_datetime || game.game_time || game.gameTime);
      const fourHoursBeforeGame = new Date(gameTime.getTime() - 4 * 60 * 60 * 1000);
      const now = new Date();

      // Use whichever is later: now or 4 hours before game
      const defaultCloseDate = fourHoursBeforeGame > now ? fourHoursBeforeGame : now;

      setFormData(prev => ({
        ...prev,
        gameID: gameID,
        homeTeamId: game.home_team_id || game.home_team?.id || game.homeTeamId,
        visitorTeamId: game.visitor_team_id || game.visitor_team?.id || game.visitorTeamId,
        xAxisTeam: homeTeamName,
        yAxisTeam: visitorTeamName,
        gridName: prev.gridName.trim() ? prev.gridName : `${visitorTeamName} vs ${homeTeamName} Squares`,
        gameNickname: game.game_nickname || game.gameNickname || `${visitorTeamName} vs ${homeTeamName}`,
        // Auto-set closeDate to max(now, gameTime - 4 hours)
        closeDate: prev.closeDate || formatDateTime(defaultCloseDate),
      }));
    }
  };

  // Filter games by selected date and league
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const gameTime = game.game_datetime || game.game_time || game.gameTime;
      if (!gameTime) return false;

      const gameDate = new Date(gameTime);
      // Create selected date in local timezone at midnight
      const selectedDate = new Date(formData.gameDate + 'T00:00:00');

      // Check if game is on the selected date (compare local dates)
      const gameDateLocal = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
      const selectedDateLocal = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const sameDate = gameDateLocal.getTime() === selectedDateLocal.getTime();

      // Check if game is in the future
      const isFuture = gameDate > new Date();

      // Check league match
      const leagueMatch = !formData.league || !game.league || game.league.toUpperCase() === formData.league.toUpperCase();

      return sameDate && isFuture && leagueMatch;
    });
  }, [games, formData.gameDate, formData.league]);

  // Get dates that have games for the selected league (for calendar dots)
  const datesWithGames = useMemo(() => {
    const dates = new Set();
    const now = new Date();
    games.forEach(game => {
      const gameTime = game.game_datetime || game.game_time || game.gameTime;
      if (!gameTime) return;

      const gameDate = new Date(gameTime);
      // Only include future games that match the league
      const isFuture = gameDate > now;
      const leagueMatch = !formData.league || !game.league || game.league.toUpperCase() === formData.league.toUpperCase();

      if (isFuture && leagueMatch) {
        // Store as YYYY-MM-DD format in local timezone
        const year = gameDate.getFullYear();
        const month = String(gameDate.getMonth() + 1).padStart(2, '0');
        const day = String(gameDate.getDate()).padStart(2, '0');
        dates.add(`${year}-${month}-${day}`);
      }
    });
    return dates;
  }, [games, formData.league]);

  const selectedGame = games.find(g => g.id === parseInt(formData.gameID) || g.gameID === parseInt(formData.gameID));

  // Validation functions for each step
  const validateStep = (stepNum) => {
    const newErrors = {};

    switch (stepNum) {
      case 1: // Season & League
        if (!formData.season) newErrors.season = 'Season is required';
        if (!formData.league) newErrors.league = 'League is required';
        break;

      case 2: // Game Date
        if (!formData.gameDate) newErrors.gameDate = 'Game date is required';
        else if (filteredGames.length === 0) newErrors.gameDate = 'No games available for this date. Please select a different date.';
        break;

      case 3: // Select Game
        if (!formData.gameID) newErrors.gameID = 'Please select a game';
        if (!formData.gridName.trim()) newErrors.gridName = 'Pool name is required';
        break;

      case 4: // Number Assignment
        if (formData.numbersType === 'TimeSet') {
          if (!formData.numbersAssignDate) {
            newErrors.numbersAssignDate = 'Please set a date for number assignment';
          } else if (selectedGame) {
            const assignDate = new Date(formData.numbersAssignDate);
            const gameTime = new Date(selectedGame.game_datetime || selectedGame.game_time || selectedGame.gameTime);
            const maxTime = new Date(gameTime.getTime() + 15 * 60 * 1000); // game start + 15 mins
            if (assignDate > maxTime) {
              newErrors.numbersAssignDate = 'Assignment time cannot be more than 15 minutes after game start';
            }
          }
        }
        break;

      case 5: // Player Settings
        if (!formData.closeDate) {
          newErrors.closeDate = 'Pool closes date/time is required';
        } else {
          const closeDate = new Date(formData.closeDate);
          const now = new Date();

          // Past date validation - closeDate cannot be in the past
          if (closeDate <= now) {
            newErrors.closeDate = 'Pool close date/time cannot be in the past';
          } else if (selectedGame) {
            const gameTime = new Date(selectedGame.game_datetime || selectedGame.game_time || selectedGame.gameTime);
            if (closeDate >= gameTime) {
              newErrors.closeDate = 'Pool must close before the game starts';
            }
          }
        }
        if (formData.poolType === 'CREDIT' && !formData.poolPassword.trim()) {
          newErrors.poolPassword = 'Password is required for credit pools';
        }
        break;

      case 6: // Fees & Rewards
        if (formData.costPerSquare < 0) {
          newErrors.costPerSquare = 'Cost cannot be negative';
        }
        // Quarter payouts validation - must total 100%
        const totalReward = formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent;
        if (totalReward !== 100) {
          newErrors.rewardPercentages = `Quarter payouts must total 100% (currently ${totalReward}%)`;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step) && step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setLoading(true);
    try {
      // Map poolType to costType and player_pool_type
      const mapPlayerPoolType = () => {
        if (formData.poolType === 'OPEN') {
          return { costType: 'Free', playerPoolType: 'FREE' };
        } else {
          return { costType: 'PasswordOpen', playerPoolType: 'CREDIT' };
        }
      };

      const { costType, playerPoolType } = mapPlayerPoolType();

      const requestData = {
        pool_name: formData.gridName,
        pool_description: formData.poolDescription,
        game_id: formData.gameID,
        season: formData.season,
        league: formData.league,
        pool_type: formData.numbersType === 'Ascending' ? 'A' : 'B',
        player_pool_type: playerPoolType,
        access_type: costType,
        reward_type: formData.rewardsType || 'CreditsRewards',
        password: formData.poolType === 'CREDIT' ? formData.poolPassword : null,
        entry_fee: formData.costPerSquare,
        credit_cost: formData.costPerSquare,
        custom_payout: formData.customPayout,
        max_squares_per_player: formData.maxSquaresPerPlayer,
        close_datetime: formData.closeDate ? new Date(formData.closeDate).toISOString() : null,
        number_assign_datetime: formData.numbersAssignDate ? new Date(formData.numbersAssignDate).toISOString() : null,
        numbers_type: formData.numbersType,
        game_reward_type_id: formData.gameRewardTypeID === 'custom' ? null : formData.gameRewardTypeID,
        home_team_id: formData.homeTeamId,
        visitor_team_id: formData.visitorTeamId,
        game_nickname: formData.gameNickname,
        external_pool_id: formData.externalPoolId,
        initial_credits: formData.initialCredits || 0,
        reward1_percent: formData.reward1_percent,
        reward2_percent: formData.reward2_percent,
        reward3_percent: formData.reward3_percent,
        reward4_percent: formData.reward4_percent,
      };

      const response = await axiosService.post('/api/squares-pools', requestData);
      if (response.data?.status) {
        showToast({ severity: 'success', summary: 'Success', detail: 'Pool created successfully!' });
        // API returns: { status: true, data: { id: ... }, pool_number: ... }
        const poolId = response.data.data?.id || response.data.id;
        if (poolId) {
          navigate(`/squares/pool/${poolId}`);
        } else {
          // Fallback to squares list if no ID
          navigate('/squares');
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || error.message;
      const errorText = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg;
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to create pool: ' + errorText });
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
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
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: colors.text }}>
              Create Squares Pool
            </h1>
            <p className="mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Step {step} of 6 - {stepLabels[step - 1]}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-lg p-4" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="flex justify-between mb-2 overflow-x-auto gap-2">
            {stepLabels.map((label, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 flex-shrink-0"
                style={{ color: idx + 1 <= step ? colors.brand.primary : (isDark ? '#6B7280' : '#9CA3AF') }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: idx + 1 <= step ? colors.brand.primary : (isDark ? '#374151' : '#E5E7EB'),
                    color: idx + 1 <= step ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')
                  }}
                >
                  {idx + 1 < step ? <FiCheck /> : idx + 1}
                </div>
                <span className="hidden lg:inline text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%`, backgroundColor: colors.brand.primary }}
            ></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="rounded-xl shadow-2xl p-6 md:p-8" style={{ backgroundColor: colors.card, border: `2px solid ${colors.border}` }}>

          {/* Step 1: Season & League */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Season & League</h2>

              <InputField label="Season" required error={errors.season} colors={colors} isDark={isDark}>
                <select
                  value={formData.season}
                  onChange={(e) => handleChange('season', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                >
                   <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </InputField>

              <InputField label="League" required error={errors.league} colors={colors} isDark={isDark}>
                <div className="flex flex-wrap gap-3">
                  {['NFL', 'NBA', 'PBA'].map(league => (
                    <SelectButton
                      key={league}
                      selected={formData.league === league}
                      onClick={() => handleChange('league', league)}
                      colors={colors}
                      isDark={isDark}
                    >
                      {league === 'NFL' && '🏈'} {league === 'NBA' && '🏀'} {league === 'PBA' && '🎳'} {league}
                    </SelectButton>
                  ))}
                </div>
              </InputField>
            </div>
          )}

          {/* Step 2: Game Date */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Select Game Date</h2>

              <InputField label="Game Date" required error={errors.gameDate} hint="Select a date - dots indicate available games" colors={colors} isDark={isDark}>
                <input
                  type="date"
                  value={formData.gameDate}
                  onChange={(e) => handleChange('gameDate', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                />
              </InputField>

              {/* Quick date buttons for dates with games */}
              {datesWithGames.size > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    Dates with {formData.league} games (click to select):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(datesWithGames)
                      .sort()
                      .slice(0, 14) // Show max 14 upcoming dates
                      .map(dateStr => {
                        const date = new Date(dateStr + 'T00:00:00');
                        const isSelected = formData.gameDate === dateStr;
                        const gamesOnDate = games.filter(g => {
                          const gt = g.game_datetime || g.game_time || g.gameTime;
                          if (!gt) return false;
                          const gd = new Date(gt);
                          // Compare using local date
                          const year = gd.getFullYear();
                          const month = String(gd.getMonth() + 1).padStart(2, '0');
                          const day = String(gd.getDate()).padStart(2, '0');
                          const gdDateStr = `${year}-${month}-${day}`;
                          return gdDateStr === dateStr &&
                                 (!formData.league || !g.league || g.league.toUpperCase() === formData.league.toUpperCase());
                        }).length;

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => handleChange('gameDate', dateStr)}
                            className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                              backgroundColor: isSelected ? colors.brand.primary : (isDark ? '#374151' : '#F3F4F6'),
                              color: isSelected ? '#fff' : colors.text,
                              border: `2px solid ${isSelected ? colors.brand.primary : 'transparent'}`,
                            }}
                          >
                            <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            {/* Game count dot */}
                            <span
                              className="absolute -top-1 -right-1 flex items-center justify-center text-xs font-bold rounded-full"
                              style={{
                                width: '18px',
                                height: '18px',
                                backgroundColor: '#10B981',
                                color: '#fff',
                              }}
                            >
                              {gamesOnDate}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg" style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}>
                <p className={`text-sm font-medium ${filteredGames.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  <FiInfo className="inline mr-2" />
                  {filteredGames.length} game(s) found for {formData.league} on {formData.gameDate ? new Date(formData.gameDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'selected date'}
                  {filteredGames.length === 0 && formData.gameDate && (
                    <span className="block mt-1 text-red-400">Please select a date with available games to continue.</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Select Game */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Select Game</h2>

              <InputField label="Pool Name" required error={errors.gridName} colors={colors} isDark={isDark}>
                <input
                  type="text"
                  value={formData.gridName}
                  onChange={(e) => handleChange('gridName', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                  placeholder="Enter pool name"
                />
              </InputField>

              <InputField label="Pool Description" hint="Optional - describe your pool rules" colors={colors} isDark={isDark}>
                <textarea
                  value={formData.poolDescription}
                  onChange={(e) => handleChange('poolDescription', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                  placeholder="Describe your pool rules, prize structure, or any special instructions"
                  rows="3"
                />
              </InputField>

              <InputField label="Select Game" required error={errors.gameID} colors={colors} isDark={isDark}>
                {filteredGames.length === 0 ? (
                  <div className="p-6 text-center rounded-lg" style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}>
                    <p style={{ color: colors.text }}>No games found for the selected date and league.</p>
                    <button
                      onClick={() => setStep(2)}
                      className="mt-4 px-4 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: colors.brand.primary, color: '#FFFFFF' }}
                    >
                      Change Date
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredGames.map((game) => {
                      const gameId = game.id || game.gameID;
                      const homeTeam = game.home_team?.name || game.home_team || game.homeTeam;
                      const visitorTeam = game.visitor_team?.name || game.visitor_team || game.visitorTeam;
                      const gameTime = game.game_datetime || game.game_time || game.gameTime;
                      const isSelected = formData.gameID == gameId;

                      return (
                        <div
                          key={gameId}
                          onClick={() => handleGameSelect(gameId)}
                          className="p-4 rounded-lg cursor-pointer transition-all"
                          style={{
                            backgroundColor: isSelected ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : (isDark ? '#374151' : '#F3F4F6'),
                            border: `2px solid ${isSelected ? colors.brand.primary : colors.border}`,
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold" style={{ color: colors.text }}>
                                {visitorTeam} vs {homeTeam}
                              </div>
                              <div className="text-sm mt-1 flex items-center gap-2" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                                <FiCalendar className="text-xs" />
                                {new Date(gameTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                {game.league && <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: isDark ? '#4B5563' : '#E5E7EB' }}>{game.league}</span>}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.brand.primary }}>
                                <FiCheck className="text-white text-sm" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </InputField>
            </div>
          )}

          {/* Step 4: Number Assignment */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Number Assignment Method</h2>

              <InputField label="How should numbers be assigned?" required colors={colors} isDark={isDark}>
                <div className="space-x-3 space-y-3 md:space-y-0 flex flex-col md:flex-row">
                  <SelectButton
                    selected={formData.numbersType === 'AdminTrigger'}
                    onClick={() => handleChange('numbersType', 'AdminTrigger')}
                    colors={colors}
                    isDark={isDark}
                  >
                    <div className="text-left">
                      <div className="font-bold">Random - Manual</div>
                      <div className="text-sm opacity-75">Admin manually triggers number assignment</div>
                    </div>
                  </SelectButton>

                  <SelectButton
                    selected={formData.numbersType === 'TimeSet'}
                    onClick={() => handleChange('numbersType', 'TimeSet')}
                    colors={colors}
                    isDark={isDark}
                  >
                    <div className="text-left">
                      <div className="font-bold">Random - Timed</div>
                      <div className="text-sm opacity-75">Numbers assigned at a specific time</div>
                    </div>
                  </SelectButton>

                  <SelectButton
                    selected={formData.numbersType === 'Ascending'}
                    onClick={() => handleChange('numbersType', 'Ascending')}
                    colors={colors}
                    isDark={isDark}
                  >
                    <div className="text-left">
                      <div className="font-bold">Set in Order</div>
                      <div className="text-sm opacity-75">Numbers 0-9 assigned in ascending order</div>
                    </div>
                  </SelectButton>
                </div>
              </InputField>

              {formData.numbersType === 'TimeSet' && (
                <InputField
                  label="Assignment Date & Time"
                  required
                  error={errors.numbersAssignDate}
                  hint={selectedGame ? `Max: ${new Date(new Date(selectedGame.game_datetime || selectedGame.game_time).getTime() + 15 * 60 * 1000).toLocaleString()}` : null}
                  colors={colors}
                  isDark={isDark}
                >
                  <input
                    type="datetime-local"
                    value={formData.numbersAssignDate}
                    onChange={(e) => handleChange('numbersAssignDate', e.target.value)}
                    className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                    style={inputStyles}
                  />
                </InputField>
              )}
            </div>
          )}

          {/* Step 5: Player Settings */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Player Settings</h2>

              <InputField label="Max Squares Per Player" colors={colors} isDark={isDark}>
                <div className="flex flex-wrap gap-2">
                  {[null, 1, 2, 3, 4, 5, 10].map(num => (
                    <SelectButton
                      key={num === null ? 'none' : num}
                      selected={formData.maxSquaresPerPlayer === num}
                      onClick={() => handleChange('maxSquaresPerPlayer', num)}
                      colors={colors}
                      isDark={isDark}
                    >
                      {num === null ? 'No Max' : num}
                    </SelectButton>
                  ))}
                </div>
              </InputField>

              <InputField
                label="Squares Selection Close"
                required
                error={errors.closeDate}
                hint={selectedGame ? `Must be before game start: ${new Date(selectedGame.game_datetime || selectedGame.game_time).toLocaleString()}` : "When should square selection automatically close?"}
                colors={colors}
                isDark={isDark}
              >
                <input
                  type="datetime-local"
                  value={formData.closeDate}
                  onChange={(e) => handleChange('closeDate', e.target.value)}
                  max={selectedGame ? formatDateTime(new Date(selectedGame.game_datetime || selectedGame.game_time)) : undefined}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                />
              </InputField>

              <InputField label="Pool Type" required error={errors.poolType} colors={colors} isDark={isDark}>
                <div className="space-x-3 space-y-3 md:space-y-0 flex flex-col md:flex-row">
                  <SelectButton
                    selected={formData.poolType === 'OPEN'}
                    onClick={() => handleChange('poolType', 'OPEN')}
                    colors={colors}
                    isDark={isDark}
                  >
                    <div className="text-left">
                      <div className="font-bold">OPEN</div>
                      <div className="text-sm opacity-75">Anyone can join freely, no restrictions</div>
                    </div>
                  </SelectButton>

                  <SelectButton
                    selected={formData.poolType === 'CREDIT'}
                    onClick={() => handleChange('poolType', 'CREDIT')}
                    colors={colors}
                    isDark={isDark}
                  >
                    <div className="text-left">
                      <div className="font-bold">CREDIT</div>
                      <div className="text-sm opacity-75">Requires password to join + players use credits to select squares</div>
                    </div>
                  </SelectButton>
                </div>
              </InputField>

              {formData.poolType === 'CREDIT' && (
                <>
                  <InputField label="Pool Password" required error={errors.poolPassword} colors={colors} isDark={isDark}>
                    <input
                      type="text"
                      value={formData.poolPassword}
                      onChange={(e) => handleChange('poolPassword', e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                      style={inputStyles}
                      placeholder="Enter pool password"
                    />
                  </InputField>

                  <InputField label="Initial Credits on Join" hint="Credits automatically given to users when they join (0-100)" colors={colors} isDark={isDark}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.initialCredits}
                      onChange={(e) => handleChange('initialCredits', parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                      style={inputStyles}
                      placeholder="0"
                    />
                  </InputField>
                </>
              )}
            </div>
          )}

          {/* Step 6: Fees & Rewards */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Fees & Rewards</h2>

              <InputField
                label="Cost Per Square"
                error={errors.costPerSquare}
                hint={formData.poolType === 'OPEN'
                  ? 'Free pools have no cost per square'
                  : `Calculated pot (if all squares filled): ${((formData.costPerSquare || 0) * 100).toFixed(2)}`
                }
                colors={colors}
                isDark={isDark}
              >
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.poolType === 'OPEN' ? 0 : formData.costPerSquare}
                    onChange={(e) => handleChange('costPerSquare', parseFloat(e.target.value) || 0)}
                    disabled={formData.poolType === 'OPEN'}
                    title={formData.poolType === 'OPEN' ? 'This pool is FREE - no cost per square' : 'Enter the cost per square'}
                    className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                    style={{
                      ...inputStyles,
                      opacity: formData.poolType === 'OPEN' ? 0.5 : 1,
                      cursor: formData.poolType === 'OPEN' ? 'not-allowed' : 'text',
                      paddingRight: formData.poolType === 'OPEN' ? '60px' : '16px'
                    }}
                  />
                  {formData.poolType === 'OPEN' && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: colors.success,
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                      }}
                    >
                      FREE
                    </div>
                  )}
                </div>
              </InputField>
              <InputField 
                label="Custom Payout (Optional)" 
                hint={formData.customPayout ? `Custom payout will be used instead of calculated amount` : `Leave empty to auto-calculate payout from entry fees`}
                colors={colors} 
                isDark={isDark}
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.customPayout || ''}
                  onChange={(e) => handleChange('customPayout', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                  placeholder="Leave empty for auto-calculation"
                />
              </InputField>
              <InputField
                label="Reward Distribution"
                hint={formData.gameRewardTypeID === 'custom' ? "Enter your own custom percentages below" : "Select a reward template to auto-fill the quarter payout percentages below"}
                colors={colors}
                isDark={isDark}
              >
                <select
                  value={formData.gameRewardTypeID}
                  onChange={(e) => {
                    const selectedValue = e.target.value;

                    if (selectedValue === 'custom') {
                      handleChange('gameRewardTypeID', 'custom');
                      // Keep current percentages when switching to custom
                      return;
                    }

                    const selectedID = parseInt(selectedValue);
                    handleChange('gameRewardTypeID', selectedID);

                    // Auto-fill percentages from selected reward type
                    const selectedReward = rewardTypes.find(r => r.id === selectedID);
                    if (selectedReward) {
                      // Convert decimal to percentage (0.1 -> 10, 0.2 -> 20, etc.)
                      const toPercent = (val) => {
                        const num = parseFloat(val) || 0;
                        return num <= 1 ? num * 100 : num;
                      };

                      handleChange('reward1_percent', toPercent(selectedReward.reward1_percent));
                      handleChange('reward2_percent', toPercent(selectedReward.reward2_percent));
                      handleChange('reward3_percent', toPercent(selectedReward.reward3_percent));
                      handleChange('reward4_percent', toPercent(selectedReward.reward4_percent));
                    }
                  }}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                >
                  {rewardTypes.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.name} - {reward.description}
                    </option>
                  ))}
                  <option value="custom">Custom - Enter your own percentages</option>
                </select>
              </InputField>

              {/* Quarter Payout Percentages */}
              <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                <label className="block font-medium mb-2" style={{ color: colors.text }}>
                  Quarter Payout Percentages (must total 100%)
                </label>
                <p className="text-sm mb-4" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  {formData.gameRewardTypeID === 'custom'
                    ? "Enter your custom payout percentages for each quarter."
                    : "Auto-filled based on Reward Distribution above. You can customize these percentages if needed."}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['reward1_percent', 'reward2_percent', 'reward3_percent', 'reward4_percent'].map((field, idx) => (
                    <div key={field}>
                      <label className="block text-sm mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                        {idx === 0 ? 'Q1 Payout %' : idx === 1 ? 'Half (Q2) Payout %' : idx === 2 ? 'Q3 Payout %' : 'Final (Q4) Payout %'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData[field]}
                        onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                        style={inputStyles}
                      />
                    </div>
                  ))}
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  (formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent) === 100
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  Total: {formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent}%
                  {(formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent) === 100 ? ' ✓' : ' (must equal 100%)'}
                </p>
                {errors.rewardPercentages && <p className="mt-1 text-red-400 text-sm">{errors.rewardPercentages}</p>}
              </div>

              {/* Review Summary */}
              <div className="border-t pt-6 mt-6" style={{ borderColor: colors.border }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Review Summary</h3>
                <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}>
                  <p style={{ color: colors.text }}><strong>Pool:</strong> {formData.gridName}</p>
                  <p style={{ color: colors.text }}><strong>League:</strong> {formData.league} {formData.season}</p>
                  {selectedGame && <p style={{ color: colors.text }}><strong>Game:</strong> {selectedGame.visitor_team?.name || selectedGame.visitor_team} vs {selectedGame.home_team?.name || selectedGame.home_team}</p>}
                  <p style={{ color: colors.text }}><strong>Numbers:</strong> {formData.numbersType}</p>
                  <p style={{ color: colors.text }}><strong>Pool Type:</strong> {formData.poolType}</p>
                  <p style={{ color: colors.text }}><strong>Cost:</strong> {formData.costPerSquare?.toFixed(2)} per square</p>
                  <p style={{ color: colors.text }}><strong>Payout:</strong> {formData.customPayout ? `${formData.customPayout.toFixed(2)} (custom)` : `${((formData.costPerSquare || 0) * 100).toFixed(2)} (auto-calculated)`}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  color: colors.text
                }}
              >
                Back
              </button>
            )}
            {step < 6 ? (
              <button
                onClick={handleNext}
                className="flex-1 text-white py-3 rounded-lg font-bold transition-all"
                style={{ backgroundColor: colors.brand.primary }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: loading ? undefined : colors.brand.primary }}
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
