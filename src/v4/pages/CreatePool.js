import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import PageLoader from '../components/common/PageLoader';

// Format date for datetime-local input (local timezone)
const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert local datetime to UTC ISO string for backend
const toUTCString = (localDateString) => {
  if (!localDateString) return null;
  const date = new Date(localDateString);
  return date.toISOString();
};

const STEP_LABELS = [
  'Season & League',
  'Game Date',
  'Select Game',
  'Number Assignment',
  'Player Settings',
  'Fees & Rewards',
];

const LEAGUES = [
  { value: 'NFL', emoji: '\uD83C\uDFC8' },
  { value: 'NBA', emoji: '\uD83C\uDFC0' },
  { value: 'PBA', emoji: '\uD83C\uDFB3' },
  { value: 'NCAAF', emoji: '\uD83C\uDFC8' },
];

const CreatePool = () => {
  const navigate = useNavigate();
  const axios = useAxios();
  const { user, isSignedIn, isLoaded, isSuperadmin, isSquareAdmin } = useUserContext();

  const [games, setGames] = useState([]);
  const [rewardTypes, setRewardTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Step 1
    season: '2026',
    league: 'NFL',
    // Step 2
    gameDate: new Date().toISOString().split('T')[0],
    // Step 3
    gridName: '',
    poolDescription: '',
    gameID: '',
    gameNickname: '',
    homeTeamId: '',
    visitorTeamId: '',
    // Step 4
    numbersType: 'AdminTrigger',
    numbersAssignDate: '',
    // Step 5
    maxSquaresPerPlayer: null,
    poolType: 'OPEN',
    poolPassword: '',
    initialCredits: 0,
    closeDate: '',
    // Step 6
    costPerSquare: 10.0,
    customPayout: null,
    rewardsType: 'CreditsRewards',
    gameRewardTypeID: 1,
    reward1_percent: 25,
    reward2_percent: 25,
    reward3_percent: 25,
    reward4_percent: 25,
  });

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/v4/sign-in', { state: { returnTo: '/v4/pools/create' } });
    }
    if (isLoaded && isSignedIn && !isSuperadmin && !isSquareAdmin) {
      navigate('/v4/pools');
    }
  }, [isLoaded, isSignedIn, isSuperadmin, isSquareAdmin, navigate]);

  useEffect(() => {
    loadGames();
    loadRewardTypes();
  }, []);

  // Default numbersType by league
  useEffect(() => {
    if (formData.league === 'NBA') {
      setFormData(prev => ({ ...prev, numbersType: 'Ascending' }));
    } else {
      setFormData(prev => ({ ...prev, numbersType: 'AdminTrigger' }));
    }
  }, [formData.league]);

  // Auto-fill reward percentages when reward types load
  useEffect(() => {
    if (rewardTypes.length > 0 && formData.gameRewardTypeID && formData.gameRewardTypeID !== 'custom') {
      const selected = rewardTypes.find(r => r.id === formData.gameRewardTypeID);
      if (selected) {
        const toPercent = (val) => {
          const num = parseFloat(val) || 0;
          return num <= 1 ? num * 100 : num;
        };
        setFormData(prev => ({
          ...prev,
          reward1_percent: toPercent(selected.reward1_percent),
          reward2_percent: toPercent(selected.reward2_percent),
          reward3_percent: toPercent(selected.reward3_percent),
          reward4_percent: toPercent(selected.reward4_percent),
        }));
      }
    }
  }, [rewardTypes]);

  const loadGames = async () => {
    try {
      const res = await axios.get('/api/games/manage');
      setGames(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error loading games:', err);
    }
  };

  const loadRewardTypes = async () => {
    try {
      const res = await axios.get('/api/game-reward-types');
      setRewardTypes(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error loading reward types:', err);
    }
  };

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  const handleGameSelect = useCallback((gameID) => {
    const game = games.find(g => g.id === parseInt(gameID) || g.gameID === parseInt(gameID));
    if (!game) return;

    const homeTeamName = game.home_team?.name || game.home_team || game.homeTeam;
    const visitorTeamName = game.visitor_team?.name || game.visitor_team || game.visitorTeam;
    const gameTime = new Date(game.game_datetime || game.game_time || game.gameTime);
    const fourHoursBefore = new Date(gameTime.getTime() - 4 * 60 * 60 * 1000);
    const now = new Date();
    const defaultClose = fourHoursBefore > now ? fourHoursBefore : now;

    setFormData(prev => ({
      ...prev,
      gameID,
      homeTeamId: game.home_team_id || game.home_team?.id || game.homeTeamId,
      visitorTeamId: game.visitor_team_id || game.visitor_team?.id || game.visitorTeamId,
      gridName: prev.gridName.trim() ? prev.gridName : `${visitorTeamName} vs ${homeTeamName} Squares`,
      gameNickname: game.game_nickname || game.gameNickname || `${visitorTeamName} vs ${homeTeamName}`,
      closeDate: prev.closeDate || formatDateTime(defaultClose),
    }));
  }, [games]);

  // Filter games by date + league
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const gameTime = game.game_datetime || game.game_time || game.gameTime;
      if (!gameTime) return false;
      const gameDate = new Date(gameTime);
      const selectedDate = new Date(formData.gameDate + 'T00:00:00');
      const gameDateLocal = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
      const selectedDateLocal = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const sameDate = gameDateLocal.getTime() === selectedDateLocal.getTime();
      const isFuture = gameDate > new Date();
      const leagueMatch = !formData.league || !game.league || game.league.toUpperCase() === formData.league.toUpperCase();
      return sameDate && isFuture && leagueMatch;
    });
  }, [games, formData.gameDate, formData.league]);

  // Dates with games for quick select
  const datesWithGames = useMemo(() => {
    const dates = new Set();
    const now = new Date();
    games.forEach(game => {
      const gameTime = game.game_datetime || game.game_time || game.gameTime;
      if (!gameTime) return;
      const gd = new Date(gameTime);
      const isFuture = gd > now;
      const leagueMatch = !formData.league || !game.league || game.league.toUpperCase() === formData.league.toUpperCase();
      if (isFuture && leagueMatch) {
        const y = gd.getFullYear();
        const m = String(gd.getMonth() + 1).padStart(2, '0');
        const d = String(gd.getDate()).padStart(2, '0');
        dates.add(`${y}-${m}-${d}`);
      }
    });
    return dates;
  }, [games, formData.league]);

  const selectedGame = games.find(g => g.id === parseInt(formData.gameID) || g.gameID === parseInt(formData.gameID));

  // Validation
  const validateStep = (stepNum) => {
    const newErrors = {};
    switch (stepNum) {
      case 1:
        if (!formData.season) newErrors.season = 'Season is required';
        if (!formData.league) newErrors.league = 'League is required';
        break;
      case 2:
        if (!formData.gameDate) newErrors.gameDate = 'Game date is required';
        else if (filteredGames.length === 0) newErrors.gameDate = 'No games available for this date';
        break;
      case 3:
        if (!formData.gameID) newErrors.gameID = 'Please select a game';
        if (!formData.gridName.trim()) newErrors.gridName = 'Pool name is required';
        break;
      case 4:
        if (formData.numbersType === 'TimeSet') {
          if (!formData.numbersAssignDate) {
            newErrors.numbersAssignDate = 'Please set a date for number assignment';
          } else {
            const assignDate = new Date(formData.numbersAssignDate);
            if (formData.closeDate && assignDate <= new Date(formData.closeDate)) {
              newErrors.numbersAssignDate = 'Assignment time must be after selection closes';
            }
            if (selectedGame) {
              const gt = new Date(selectedGame.game_datetime || selectedGame.game_time || selectedGame.gameTime);
              if (assignDate > new Date(gt.getTime() + 15 * 60 * 1000)) {
                newErrors.numbersAssignDate = 'Cannot be more than 15 minutes after game start';
              }
            }
          }
        }
        break;
      case 5:
        if (!formData.closeDate) {
          newErrors.closeDate = 'Close date/time is required';
        } else {
          const cd = new Date(formData.closeDate);
          if (cd <= new Date()) newErrors.closeDate = 'Close date cannot be in the past';
          else if (selectedGame) {
            const gt = new Date(selectedGame.game_datetime || selectedGame.game_time || selectedGame.gameTime);
            if (cd >= gt) newErrors.closeDate = 'Must close before game starts';
          }
          if (formData.numbersType === 'TimeSet' && formData.numbersAssignDate) {
            if (cd >= new Date(formData.numbersAssignDate)) {
              newErrors.closeDate = 'Must close before number assignment';
            }
          }
        }
        if (formData.poolType === 'CREDIT' && !formData.poolPassword.trim()) {
          newErrors.poolPassword = 'Password is required for credit pools';
        }
        break;
      case 6: {
        if (formData.costPerSquare < 0) newErrors.costPerSquare = 'Cost cannot be negative';
        const total = formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent;
        if (total !== 100) newErrors.rewardPercentages = `Must total 100% (currently ${total}%)`;
        break;
      }
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step) && step < 6) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    setLoading(true);
    try {
      const mapPlayerPoolType = () => {
        if (formData.poolType === 'OPEN') return { costType: 'Free', playerPoolType: 'FREE' };
        if (formData.poolType === 'CREDIT_OPEN') return { costType: 'CreditOpen', playerPoolType: 'CREDIT_OPEN' };
        return { costType: 'PasswordOpen', playerPoolType: 'CREDIT' };
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
        entry_fee: formData.poolType === 'OPEN' ? 0 : formData.costPerSquare,
        credit_cost: formData.poolType === 'OPEN' ? 0 : formData.costPerSquare,
        initial_credits: (formData.poolType === 'CREDIT' || formData.poolType === 'CREDIT_OPEN') ? (formData.initialCredits || 0) : 0,
        custom_payout: formData.customPayout || null,
        max_squares_per_player: formData.maxSquaresPerPlayer,
        close_datetime: toUTCString(formData.closeDate),
        number_assign_datetime: toUTCString(formData.numbersAssignDate),
        numbers_type: formData.numbersType,
        game_reward_type_id: formData.gameRewardTypeID === 'custom' ? null : formData.gameRewardTypeID,
        home_team_id: formData.homeTeamId,
        visitor_team_id: formData.visitorTeamId,
        game_nickname: formData.gameNickname,
        reward1_percent: formData.reward1_percent,
        reward2_percent: formData.reward2_percent,
        reward3_percent: formData.reward3_percent,
        reward4_percent: formData.reward4_percent,
      };

      const response = await axios.post('/api/squares-pools', requestData);
      if (response.data?.status) {
        const poolNumber = response.data.data?.pool_number || response.data.pool_number;
        navigate(poolNumber ? `/v4/pools/${poolNumber}` : '/v4/pools');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || error.message;
      const errorText = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg;
      setErrors({ submit: errorText });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <PageLoader />;

  const rewardTotal = formData.reward1_percent + formData.reward2_percent + formData.reward3_percent + formData.reward4_percent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Squares Pool</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Step {step} of 6 — {STEP_LABELS[step - 1]}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex justify-between mb-3 overflow-x-auto gap-2">
          {STEP_LABELS.map((label, idx) => (
            <div key={idx} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  idx + 1 < step
                    ? 'bg-success-500 text-white'
                    : idx + 1 === step
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                {idx + 1 < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`hidden lg:inline text-xs font-medium ${
                idx + 1 <= step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full rounded-full h-2 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="rounded-xl border border-error-300 bg-error-50 p-4 mb-6 dark:border-error-500/30 dark:bg-error-500/10">
          <p className="text-sm font-medium text-error-600 dark:text-error-400">{errors.submit}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-white/[0.03]">

        {/* Step 1: Season & League */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Season & League</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Season *</label>
              <div className="relative">
                <select
                  value={formData.season}
                  onChange={(e) => handleChange('season', e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.season && <p className="mt-1 text-sm text-error-500">{errors.season}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">League *</label>
              <div className="flex flex-wrap gap-3">
                {LEAGUES.map(lg => (
                  <button
                    key={lg.value}
                    type="button"
                    onClick={() => handleChange('league', lg.value)}
                    className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                      formData.league === lg.value
                        ? 'bg-brand-500 !text-white border-brand-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-brand-500'
                    }`}
                  >
                    {lg.emoji} {lg.value}
                  </button>
                ))}
              </div>
              {errors.league && <p className="mt-1 text-sm text-error-500">{errors.league}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Game Date */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Game Date</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Game Date *</label>
              <input
                type="date"
                value={formData.gameDate}
                onChange={(e) => handleChange('gameDate', e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.gameDate && <p className="mt-1 text-sm text-error-500">{errors.gameDate}</p>}
            </div>

            {/* Quick date buttons */}
            {datesWithGames.size > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Dates with {formData.league} games:
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(datesWithGames).sort().slice(0, 14).map(dateStr => {
                    const date = new Date(dateStr + 'T00:00:00');
                    const isSelected = formData.gameDate === dateStr;
                    const gamesOnDate = games.filter(g => {
                      const gt = g.game_datetime || g.game_time || g.gameTime;
                      if (!gt) return false;
                      const gd = new Date(gt);
                      const gdStr = `${gd.getFullYear()}-${String(gd.getMonth() + 1).padStart(2, '0')}-${String(gd.getDate()).padStart(2, '0')}`;
                      return gdStr === dateStr && (!formData.league || !g.league || g.league.toUpperCase() === formData.league.toUpperCase());
                    }).length;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleChange('gameDate', dateStr)}
                        className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          isSelected
                            ? 'bg-brand-500 !text-white border-brand-500'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                        }`}
                      >
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-success-500 text-white">
                          {gamesOnDate}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={`rounded-lg p-3 text-sm font-medium ${
              filteredGames.length > 0
                ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400'
            }`}>
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {filteredGames.length} game(s) found for {formData.league} on{' '}
              {formData.gameDate
                ? new Date(formData.gameDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                : 'selected date'}
            </div>
          </div>
        )}

        {/* Step 3: Select Game */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Game</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Pool Name *</label>
              <input
                type="text"
                value={formData.gridName}
                onChange={(e) => handleChange('gridName', e.target.value)}
                placeholder="Enter pool name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.gridName && <p className="mt-1 text-sm text-error-500">{errors.gridName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Pool Description</label>
              <textarea
                value={formData.poolDescription}
                onChange={(e) => handleChange('poolDescription', e.target.value)}
                placeholder="Describe your pool rules, prize structure, or any special instructions"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Select Game *</label>
              {filteredGames.length === 0 ? (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No games found for the selected date and league.</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-3 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    Change Date
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredGames.map(game => {
                    const gid = game.id || game.gameID;
                    const home = game.home_team?.name || game.home_team || game.homeTeam;
                    const visitor = game.visitor_team?.name || game.visitor_team || game.visitorTeam;
                    const gt = game.game_datetime || game.game_time || game.gameTime;
                    const isSelected = formData.gameID == gid;

                    return (
                      <div
                        key={gid}
                        onClick={() => handleGameSelect(gid)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                            : 'border-gray-200 bg-gray-50 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {visitor} vs {home}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(gt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              {game.league && (
                                <span className="px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700">
                                  {game.league}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.gameID && <p className="mt-1 text-sm text-error-500">{errors.gameID}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Number Assignment */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Number Assignment Method</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'AdminTrigger', title: 'Random - Manual', desc: 'Admin manually triggers assignment' },
                { value: 'TimeSet', title: 'Random - Timed', desc: 'Numbers assigned at a specific time' },
                { value: 'Ascending', title: 'Set in Order', desc: 'Numbers 0-9 assigned in order' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('numbersType', opt.value)}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${
                    formData.numbersType === opt.value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-gray-200 bg-gray-50 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500'
                  }`}
                >
                  <div className={`font-semibold text-sm ${formData.numbersType === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                    {opt.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            {formData.numbersType === 'TimeSet' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Assignment Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.numbersAssignDate}
                  onChange={(e) => handleChange('numbersAssignDate', e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                {selectedGame && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Max: {new Date(new Date(selectedGame.game_datetime || selectedGame.game_time).getTime() + 15 * 60 * 1000).toLocaleString()}
                  </p>
                )}
                {errors.numbersAssignDate && <p className="mt-1 text-sm text-error-500">{errors.numbersAssignDate}</p>}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Player Settings */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Player Settings</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Max Squares Per Player</label>
              <div className="flex flex-wrap gap-2">
                {[null, 1, 2, 3, 4, 5, 10].map(num => (
                  <button
                    key={num === null ? 'none' : num}
                    type="button"
                    onClick={() => handleChange('maxSquaresPerPlayer', num)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
                      formData.maxSquaresPerPlayer === num
                        ? 'bg-brand-500 !text-white border-brand-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {num === null ? 'No Max' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Squares Selection Close *</label>
              <input
                type="datetime-local"
                value={formData.closeDate}
                onChange={(e) => handleChange('closeDate', e.target.value)}
                max={selectedGame ? formatDateTime(new Date(selectedGame.game_datetime || selectedGame.game_time)) : undefined}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {selectedGame && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be before game start: {new Date(selectedGame.game_datetime || selectedGame.game_time).toLocaleString()}
                </p>
              )}
              {errors.closeDate && <p className="mt-1 text-sm text-error-500">{errors.closeDate}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Pool Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'OPEN', title: 'OPEN', desc: 'Free to join, no credits' },
                  { value: 'CREDIT_OPEN', title: 'CREDIT OPEN', desc: 'Uses credits, no password' },
                  { value: 'CREDIT', title: 'CREDIT', desc: 'Uses credits + password' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('poolType', opt.value)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      formData.poolType === opt.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-gray-200 bg-gray-50 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500'
                    }`}
                  >
                    <div className={`font-semibold text-sm ${formData.poolType === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                      {opt.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {formData.poolType === 'CREDIT' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Pool Password *</label>
                <input
                  type="text"
                  value={formData.poolPassword}
                  onChange={(e) => handleChange('poolPassword', e.target.value)}
                  placeholder="Enter pool password (min 4 chars)"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                {errors.poolPassword && <p className="mt-1 text-sm text-error-500">{errors.poolPassword}</p>}
              </div>
            )}

            {(formData.poolType === 'CREDIT' || formData.poolType === 'CREDIT_OPEN') && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Initial Credits on Join</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.initialCredits}
                  onChange={(e) => handleChange('initialCredits', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Credits automatically given to users when they join (0-100)</p>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Fees & Rewards */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fees & Rewards</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Cost Per Square</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.poolType === 'OPEN' ? 0 : formData.costPerSquare}
                  onChange={(e) => handleChange('costPerSquare', parseFloat(e.target.value) || 0)}
                  disabled={formData.poolType === 'OPEN'}
                  className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
                    formData.poolType === 'OPEN' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {formData.poolType === 'OPEN' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-500 text-white pointer-events-none">
                    FREE
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.poolType === 'OPEN'
                  ? 'Free pools have no cost per square'
                  : `Calculated pot: ${((formData.costPerSquare || 0) * 100).toFixed(2)}`}
              </p>
              {errors.costPerSquare && <p className="mt-1 text-sm text-error-500">{errors.costPerSquare}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Custom Payout (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.customPayout || ''}
                onChange={(e) => handleChange('customPayout', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Leave empty for auto-calculation"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.customPayout ? 'Custom payout will be used' : 'Leave empty to auto-calculate from entry fees'}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Reward Distribution</label>
              <div className="relative">
                <select
                  value={formData.gameRewardTypeID}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      handleChange('gameRewardTypeID', 'custom');
                      return;
                    }
                    const selectedID = parseInt(val);
                    handleChange('gameRewardTypeID', selectedID);
                    const selected = rewardTypes.find(r => r.id === selectedID);
                    if (selected) {
                      const toPercent = (v) => { const n = parseFloat(v) || 0; return n <= 1 ? n * 100 : n; };
                      setFormData(prev => ({
                        ...prev,
                        gameRewardTypeID: selectedID,
                        reward1_percent: toPercent(selected.reward1_percent),
                        reward2_percent: toPercent(selected.reward2_percent),
                        reward3_percent: toPercent(selected.reward3_percent),
                        reward4_percent: toPercent(selected.reward4_percent),
                      }));
                    }
                  }}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {rewardTypes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                  <option value="custom">Custom - Enter your own percentages</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quarter Payouts */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Quarter Payout Percentages (must total 100%)
              </label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {[
                  { field: 'reward1_percent', label: 'Q1 Payout %' },
                  { field: 'reward2_percent', label: 'Half (Q2) %' },
                  { field: 'reward3_percent', label: 'Q3 Payout %' },
                  { field: 'reward4_percent', label: 'Final (Q4) %' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData[field]}
                      onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                  </div>
                ))}
              </div>
              <p className={`mt-2 text-sm font-medium ${rewardTotal === 100 ? 'text-success-500' : 'text-error-500'}`}>
                Total: {rewardTotal}% {rewardTotal === 100 ? '\u2713' : '(must equal 100%)'}
              </p>
              {errors.rewardPercentages && <p className="mt-1 text-sm text-error-500">{errors.rewardPercentages}</p>}
            </div>

            {/* Review Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Review Summary</h3>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Pool:</span> {formData.gridName}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">League:</span> {formData.league} {formData.season}</p>
                {selectedGame && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Game:</span>{' '}
                    {selectedGame.visitor_team?.name || selectedGame.visitor_team} vs {selectedGame.home_team?.name || selectedGame.home_team}
                  </p>
                )}
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Numbers:</span> {formData.numbersType}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Pool Type:</span> {formData.poolType}</p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Cost:</span>{' '}
                  {formData.poolType === 'OPEN' ? 'FREE' : `${formData.costPerSquare?.toFixed(2)} per square`}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Payout:</span>{' '}
                  {formData.customPayout
                    ? `${formData.customPayout.toFixed(2)} (custom)`
                    : formData.poolType === 'OPEN'
                    ? 'N/A (FREE pool)'
                    : `${((formData.costPerSquare || 0) * 100).toFixed(2)} (auto-calculated)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700 transition"
            >
              Back
            </button>
          )}
          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Pool
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePool;
