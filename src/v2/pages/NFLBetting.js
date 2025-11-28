import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useToast } from '../../app/contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GameCard from '../components/betting/GameCard';
import BetSlip from '../components/betting/BetSlip';

const NFLBetting = () => {
  const { colors } = useTheme();
  const axiosService = useAxios();
  const showToast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [placingBet, setPlacingBet] = useState(false);
  const [joinedLeagues, setJoinedLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [weeklyGames, setWeeklyGames] = useState([]);
  const [bets, setBets] = useState([]);
  const [parlayAmount, setParlayAmount] = useState(0);
  const [teaserAmount, setTeaserAmount] = useState(0);

  // All bet types
  const wagerTypes = [
    { name: 'Straight', value: 'straight', status: true },
    { name: 'Parlay', value: 'parlay', status: true },
    { name: '6pt Teaser', value: 'teaser_6', status: true, points: 6 },
    { name: '6.5pt Teaser', value: 'teaser_6_5', status: true, points: 6.5 },
    { name: '7pt Teaser', value: 'teaser_7', status: true, points: 7 },
  ];
  const [activeWagerType, setActiveWagerType] = useState(wagerTypes[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch joined leagues
      const leaguesResponse = await axiosService.get('/api/leagues/joined');
      if (leaguesResponse.data.status && leaguesResponse.data.leagues_joined) {
        const leagues = leaguesResponse.data.leagues_joined;
        setJoinedLeagues(leagues);

        // Set first league as selected
        if (leagues.length > 0) {
          const savedLeagueId = localStorage.getItem('nfl_selected_league_id');
          const savedLeague = leagues.find(l => l.id === parseInt(savedLeagueId));
          setSelectedLeague(savedLeague || leagues[0]);
        }
      }

      // Fetch weekly games
      const gamesResponse = await axiosService.get('/api/games/weekly');

      // Handle API response - it may be an object with weeks or a direct array
      let games = [];
      if (Array.isArray(gamesResponse.data)) {
        games = gamesResponse.data;
      } else if (gamesResponse.data && typeof gamesResponse.data === 'object') {
        // If it's an object with weeks, extract all games
        games = Object.values(gamesResponse.data).flat();
      }

      setWeeklyGames(games);

    } catch (error) {
      console.error('Error fetching data:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data',
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear bets when wager type changes
  useEffect(() => {
    setBets([]);
    setParlayAmount(0);
    setTeaserAmount(0);
  }, [activeWagerType]);

  const handleLeagueChange = (e) => {
    const leagueId = parseInt(e.target.value);
    const league = joinedLeagues.find(l => l.id === leagueId);
    setSelectedLeague(league);
    localStorage.setItem('nfl_selected_league_id', leagueId);

    // Clear bets when changing leagues
    setBets([]);
  };

  // Check if a bet can be added for parlay/teaser (only one bet per game)
  const canAddParlayBet = (gameId, type) => {
    if (activeWagerType.value === 'straight') {
      return true;
    }

    // For parlay/teaser: only allow one bet per game
    const hasExistingBet = bets.some((bet) => bet.game_id === gameId);
    return !hasExistingBet;
  };

  const handleBetClick = (bet) => {
    // For parlay/teaser, check if we can add this bet
    if (!canAddParlayBet(bet.game_id, bet.type)) {
      showToast({
        severity: 'info',
        summary: 'One Bet Per Game',
        detail: 'You can only select one bet per game for Parlay/Teaser',
      });
      return;
    }

    setBets((prevBets) => {
      // For straight bets, allow multiple bets per game but only one per type
      const existingBetIndex = activeWagerType.value === 'straight'
        ? prevBets.findIndex((b) => b.type === bet.type && b.game_id === bet.game_id)
        : prevBets.findIndex((b) => b.game_id === bet.game_id);

      if (existingBetIndex > -1) {
        // Check if it's the same exact bet - if so, remove it
        const existingBet = prevBets[existingBetIndex];
        const isSameBet =
          existingBet.type === bet.type &&
          existingBet.game_id === bet.game_id &&
          ((existingBet.type === 'spread' && existingBet.team?.id === bet.team?.id && existingBet.points === bet.points) ||
           (existingBet.type === 'total' && existingBet.team === bet.team && existingBet.points === bet.points) ||
           (existingBet.type === 'moneyline' && existingBet.team?.id === bet.team?.id && existingBet.ml === bet.ml));

        if (isSameBet) {
          // Remove the bet
          return prevBets.filter((_, index) => index !== existingBetIndex);
        } else {
          // Replace with new bet (different option for same game)
          const newBets = [...prevBets];
          newBets[existingBetIndex] = { ...bet, wagerType: activeWagerType };
          return newBets;
        }
      } else {
        // Add new bet
        return [...prevBets, { ...bet, wagerType: activeWagerType }];
      }
    });
  };

  const handleRemoveBet = (betToRemove) => {
    setBets((prevBets) => prevBets.filter((bet) => bet !== betToRemove));
  };

  const handleClearAll = () => {
    setBets([]);
  };

  const handleBetAmountChange = (index, amount) => {
    setBets((prevBets) => {
      const newBets = [...prevBets];
      newBets[index] = { ...newBets[index], bet_amount: amount };
      return newBets;
    });
  };

  const getWagerTypeId = (wager_type) => {
    switch (wager_type) {
      case 'spread':
        return 1;
      case 'total':
        return 2;
      case 'moneyline':
        return 3;
      default:
        return 1;
    }
  };

  // Calculate parlay payout
  const calculateParlayPayout = (wager) => {
    const numGames = bets.length;

    // Parlay odds based on number of games
    const parlayOdds = {
      2: 2.6,       // 13/5
      3: 6,         // 6/1
      4: 12.28,     // 12.28/1
      5: 24.35,     // 24.35/1
      6: 47.41,     // 47.41/1
      7: 91.42,     // 91.42/1
      8: 175.44,    // 175.44/1
      9: 335.85,    // 335.85/1
      10: 642.08,   // 642.08/1
    };

    const odds = parlayOdds[numGames] || 1;
    const payout = wager * odds;
    const returnAmount = payout + wager;

    return {
      payout: payout.toFixed(2),
      return: returnAmount.toFixed(2),
    };
  };

  // Calculate teaser payout
  const calculateTeaserPayout = (wager) => {
    const numGames = bets.length;

    // Teaser odds based on number of games
    const teaserOdds = {
      2: 0.83,   // 5/6
      3: 1.5,    // 3/2
      4: 2.5,    // 5/2
      5: 4,      // 4/1
      6: 6,      // 6/1
      7: 10,     // 10/1
      8: 15,     // 15/1
      9: 20,     // 20/1
      10: 25,    // 25/1
    };

    const odds = teaserOdds[numGames] || 1;
    const payout = wager * odds;
    const returnAmount = payout + wager;

    return {
      payout: payout.toFixed(2),
      return: returnAmount.toFixed(2),
    };
  };

  const handlePlaceBets = async () => {
    if (!selectedLeague) {
      showToast({
        severity: 'error',
        summary: 'No League Selected',
        detail: 'Please select a league first',
      });
      return;
    }

    // Validate based on wager type
    if (activeWagerType.value === 'straight') {
      // For straight bets, validate all bets have amounts
      const hasEmptyAmounts = bets.some(bet => !bet.bet_amount || parseFloat(bet.bet_amount) <= 0);
      if (hasEmptyAmounts) {
        showToast({
          severity: 'error',
          summary: 'Invalid Bet Amounts',
          detail: 'Please enter a valid amount for all bets',
        });
        return;
      }
    } else if (activeWagerType.value === 'parlay') {
      // Validate minimum 2 games for parlay
      if (bets.length < 2) {
        showToast({
          severity: 'error',
          summary: 'Minimum 2 Games Required',
          detail: 'Parlay requires at least 2 games',
        });
        return;
      }

      // Validate parlay amount
      if (!parlayAmount || parseFloat(parlayAmount) <= 0) {
        showToast({
          severity: 'error',
          summary: 'Invalid Amount',
          detail: 'Please enter a valid parlay amount',
        });
        return;
      }
    } else if (activeWagerType.value.includes('teaser')) {
      // Validate minimum 2 games for teaser
      if (bets.length < 2) {
        showToast({
          severity: 'error',
          summary: 'Minimum 2 Games Required',
          detail: 'Teaser requires at least 2 games',
        });
        return;
      }

      // Validate teaser amount
      if (!teaserAmount || parseFloat(teaserAmount) <= 0) {
        showToast({
          severity: 'error',
          summary: 'Invalid Amount',
          detail: 'Please enter a valid teaser amount',
        });
        return;
      }
    }

    setPlacingBet(true);

    try {
      // Format bets for API
      const updatedBets = bets.map((b) => ({
        league_id: selectedLeague.id,
        pool_id: 1, // NFL pool ID
        wager_type_id: getWagerTypeId(b.type),
        odd_id: b.data.odd.id,
        game_id: b.data.id,
        team_id: b.team === 'under' ? -1 : (b.team === 'over' ? 0 : b.team.id),
        team_name: b.team.name || b.team,
        pick_odd: b.type === 'moneyline' ? b.ml : b.points,
        wager_amount: activeWagerType.value === 'straight' ? parseFloat(b.bet_amount) : 0,
        bet_type: activeWagerType.value,
      }));

      const postData = {
        bets: updatedBets,
        wager_type: activeWagerType.value,
      };

      // Add parlay-specific data
      if (activeWagerType.value === 'parlay') {
        const parlayWinnings = calculateParlayPayout(parseFloat(parlayAmount));
        postData.wager_amount = parseFloat(parlayAmount);
        postData.wager_win_amount = parseFloat(parlayWinnings.payout);
        postData.league_id = selectedLeague.id;
      }

      // Add teaser-specific data
      if (activeWagerType.value.includes('teaser')) {
        const teaserWinnings = calculateTeaserPayout(parseFloat(teaserAmount));
        postData.wager_amount = parseFloat(teaserAmount);
        postData.wager_win_amount = parseFloat(teaserWinnings.payout);
        postData.league_id = selectedLeague.id;
      }

      const response = await axiosService.post('/api/bets/wager', postData);

      if (response.data.status) {
        showToast({
          severity: 'success',
          summary: 'Success!',
          detail: response.data.message || 'Bets placed successfully!',
        });

        // Clear bets and refresh data
        setBets([]);
        fetchData();
      } else {
        showToast({
          severity: 'error',
          summary: 'Unable to Complete!',
          detail: response.data.message || 'Failed to place bets',
        });
      }
    } catch (error) {
      console.error('Error placing bets:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while placing bets',
      });
    } finally {
      setPlacingBet(false);
    }
  };

  // Styles
  const containerStyles = {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '2rem',
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const titleContainerStyles = {
    flex: 1,
  };

  const titleStyles = {
    fontSize: '2.5rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    marginBottom: '0.5rem',
  };

  const subtitleStyles = {
    fontSize: '1rem',
    color: colors.text,
    opacity: 0.7,
  };

  const leagueSelectorStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  };

  const selectStyles = {
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '200px',
  };

  const balanceStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
  };

  const balanceValueStyles = {
    fontWeight: 700,
    color: colors.brand.primary,
    fontSize: '1.125rem',
  };

  const contentLayoutStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
    alignItems: 'start',
  };

  const gamesContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const tabsContainerStyles = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: `2px solid ${colors.border}`,
    paddingBottom: '0.5rem',
  };

  const tabButtonStyles = (isActive) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '1rem',
    border: 'none',
    backgroundColor: isActive ? colors.brand.primary : 'transparent',
    color: isActive ? '#FFFFFF' : colors.text,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  // Loading state
  if (loading) {
    return (
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
              stroke="#D47A3E"
              strokeWidth="4"
              strokeDasharray="300 360"
              strokeLinecap="round"
            />
          </svg>
          <img
            src="/img/v2_logo.png"
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
          color: colors.text,
          fontFamily: '"Hubot Sans", sans-serif',
        }}>
          Loading NFL betting...
        </div>
      </div>
    );
  }

  // No leagues joined - prompt to join
  if (joinedLeagues.length === 0) {
    return (
      <div style={containerStyles} className="v2-fade-in">
        <Card style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '5rem auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏈</div>
          <h2 style={{ ...titleStyles, fontSize: '2rem', marginBottom: '1rem' }}>
            Join a League to Start Betting
          </h2>
          <p style={{ ...subtitleStyles, marginBottom: '2rem', fontSize: '1.125rem' }}>
            You need to join a league before you can place bets on NFL games. Join a league to get started!
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/leagues')}>
            Browse Leagues
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyles} className="v2-fade-in">
      {/* Header */}
      <div style={headerStyles}>
        <div style={titleContainerStyles}>
          <h1 style={titleStyles}>NFL Betting</h1>
          <p style={subtitleStyles}>Place bets on NFL games with spreads, totals, and moneylines</p>
        </div>

        {/* League Selector */}
        <div style={leagueSelectorStyles}>
          <select
            value={selectedLeague?.id || ''}
            onChange={handleLeagueChange}
            style={selectStyles}
          >
            {joinedLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
          <div style={balanceStyles}>
            Balance: <span style={balanceValueStyles}>${selectedLeague?.balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Bet Type Tabs */}
      <div style={tabsContainerStyles}>
        {wagerTypes.map((type) => (
          <button
            key={type.value}
            style={tabButtonStyles(activeWagerType.value === type.value)}
            onClick={() => setActiveWagerType(type)}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Content: Games + Bet Slip */}
      <div style={contentLayoutStyles}>
        {/* Games List */}
        <div style={gamesContainerStyles}>
          {weeklyGames.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: colors.text }}>
                No games available
              </h3>
              <p style={{ color: colors.text, opacity: 0.7 }}>
                Check back later for upcoming NFL games
              </p>
            </Card>
          ) : (
            weeklyGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                selectedBets={bets}
                onBetClick={handleBetClick}
                disabled={selectedLeague?.balance === 0}
              />
            ))
          )}
        </div>

        {/* Bet Slip */}
        <BetSlip
          bets={bets}
          wagerType={activeWagerType}
          onRemoveBet={handleRemoveBet}
          onClearAll={handleClearAll}
          onBetAmountChange={handleBetAmountChange}
          onPlaceBets={handlePlaceBets}
          balance={selectedLeague?.balance || 0}
          loading={placingBet}
          parlayAmount={parlayAmount}
          teaserAmount={teaserAmount}
          onParlayAmountChange={setParlayAmount}
          onTeaserAmountChange={setTeaserAmount}
          calculateParlayPayout={calculateParlayPayout}
          calculateTeaserPayout={calculateTeaserPayout}
        />
      </div>
    </div>
  );
};

export default NFLBetting;
