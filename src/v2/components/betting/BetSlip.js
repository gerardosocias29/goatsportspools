import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { decimalToMixedFraction } from '../../../app/utils/numberFormat';

const BetSlip = ({
  bets,
  wagerType,
  onRemoveBet,
  onClearAll,
  onBetAmountChange,
  onPlaceBets,
  balance = 0,
  loading = false,
  parlayAmount = 0,
  teaserAmount = 0,
  onParlayAmountChange,
  onTeaserAmountChange,
  calculateParlayPayout,
  calculateTeaserPayout,
}) => {
  const { colors } = useTheme();

  const isParlay = wagerType.value === 'parlay';
  const isTeaser = wagerType.value.includes('teaser');
  const isStraight = wagerType.value === 'straight';

  // Calculate total wager and potential winnings
  const calculateTotals = () => {
    if (isParlay) {
      const amount = parseFloat(parlayAmount) || 0;
      const payout = calculateParlayPayout ? calculateParlayPayout(amount) : { return: '0.00' };
      return {
        totalWager: amount.toFixed(2),
        totalPotentialWin: payout.return,
      };
    } else if (isTeaser) {
      const amount = parseFloat(teaserAmount) || 0;
      const payout = calculateTeaserPayout ? calculateTeaserPayout(amount) : { return: '0.00' };
      return {
        totalWager: amount.toFixed(2),
        totalPotentialWin: payout.return,
      };
    } else {
      // Straight bets
      let totalWager = 0;
      let totalPotentialWin = 0;

      bets.forEach((bet) => {
        const amount = parseFloat(bet.bet_amount) || 0;
        totalWager += amount;

        // Standard -110 odds
        const winAmount = amount * (100 / 110);
        totalPotentialWin += amount + winAmount;
      });

      return {
        totalWager: totalWager.toFixed(2),
        totalPotentialWin: totalPotentialWin.toFixed(2),
      };
    }
  };

  const { totalWager, totalPotentialWin } = calculateTotals();

  const hasInsufficientBalance = parseFloat(totalWager) > balance;

  // Validation for each type
  let canPlaceBets = false;
  if (isStraight) {
    canPlaceBets = bets.length > 0 && parseFloat(totalWager) > 0 && !hasInsufficientBalance;
  } else if (isParlay || isTeaser) {
    const minGames = 2;
    const hasMinGames = bets.length >= minGames;
    const amount = isParlay ? parseFloat(parlayAmount) : parseFloat(teaserAmount);
    canPlaceBets = hasMinGames && amount > 0 && !hasInsufficientBalance;
  }

  // Styles
  const containerStyles = {
    position: 'sticky',
    top: '80px',
  };

  const headerStyles = {
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${colors.border}`,
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    marginBottom: '0.5rem',
  };

  const balanceStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
  };

  const balanceValueStyles = {
    fontWeight: 600,
    color: hasInsufficientBalance ? colors.error : colors.brand.primary,
  };

  const betsListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const betItemStyles = {
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: colors.highlight,
  };

  const betHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '0.5rem',
  };

  const betTeamsStyles = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };

  const removeButtonStyles = {
    background: 'none',
    border: 'none',
    color: colors.error,
    cursor: 'pointer',
    fontSize: '1.25rem',
    padding: 0,
    lineHeight: 1,
  };

  const betDetailsStyles = {
    fontSize: '0.75rem',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '0.75rem',
  };

  const inputStyles = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: '0.875rem',
    fontWeight: 600,
  };

  const summaryStyles = {
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: colors.highlight,
    marginBottom: '1rem',
  };

  const summaryRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  };

  const summaryLabelStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
  };

  const summaryValueStyles = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };

  const potentialWinStyles = {
    ...summaryValueStyles,
    fontSize: '1.125rem',
    color: colors.brand.primary,
  };

  const actionsStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '2rem 1rem',
  };

  const emptyIconStyles = {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  };

  const emptyTextStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.6,
  };

  const errorTextStyles = {
    fontSize: '0.75rem',
    color: colors.error,
    marginTop: '0.5rem',
    fontWeight: 600,
  };

  // Get bet display text
  const getBetDisplay = (bet) => {
    const { type, team, points, ml, data } = bet;

    let teamName = '';
    if (type === 'total') {
      teamName = team === 'over' ? 'Over' : 'Under';
    } else {
      teamName = team.abbreviation || team.name;
    }

    let pickText = '';
    if (type === 'spread') {
      pickText = decimalToMixedFraction(points, true);
    } else if (type === 'total') {
      pickText = decimalToMixedFraction(points);
    } else if (type === 'moneyline') {
      pickText = ml > 0 ? `+${ml}` : ml;
    }

    const gameText = `${data.visitor_team.abbreviation} @ ${data.home_team.abbreviation}`;

    return { teamName, pickText, gameText, typeText: type.toUpperCase() };
  };

  if (bets.length === 0) {
    return (
      <div style={containerStyles}>
        <Card>
          <div style={emptyStateStyles}>
            <div style={emptyIconStyles}>🎫</div>
            <div style={emptyTextStyles}>
              Select bets from the games below to get started
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <Card>
        {/* Header */}
        <div style={headerStyles}>
          <h3 style={titleStyles}>Bet Slip ({bets.length})</h3>
          <div style={balanceStyles}>
            Balance: <span style={balanceValueStyles}>${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Bets List */}
        <div style={betsListStyles}>
          {bets.map((bet, index) => {
            const { teamName, pickText, gameText, typeText } = getBetDisplay(bet);

            return (
              <div key={index} style={betItemStyles}>
                <div style={betHeaderStyles}>
                  <div style={betTeamsStyles}>
                    {teamName} {pickText}
                  </div>
                  <button
                    style={removeButtonStyles}
                    onClick={() => onRemoveBet(bet)}
                    title="Remove bet"
                  >
                    ×
                  </button>
                </div>
                <div style={betDetailsStyles}>
                  {gameText} • {typeText}
                </div>
                {/* Only show individual amount input for straight bets */}
                {isStraight && (
                  <input
                    type="number"
                    placeholder="Bet amount"
                    value={bet.bet_amount || ''}
                    onChange={(e) => onBetAmountChange(index, e.target.value)}
                    style={inputStyles}
                    min="0"
                    step="0.01"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Parlay/Teaser Amount Input */}
        {(isParlay || isTeaser) && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: colors.text }}>
              {isParlay ? 'Parlay' : 'Teaser'} Amount
            </label>
            <input
              type="number"
              placeholder={`Enter ${isParlay ? 'parlay' : 'teaser'} amount`}
              value={isParlay ? parlayAmount : teaserAmount}
              onChange={(e) => isParlay ? onParlayAmountChange(e.target.value) : onTeaserAmountChange(e.target.value)}
              style={inputStyles}
              min="0"
              step="0.01"
            />
            {(isParlay || isTeaser) && bets.length < 2 && (
              <div style={{ fontSize: '0.75rem', color: colors.error, marginTop: '0.25rem' }}>
                Minimum 2 games required
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div style={summaryStyles}>
          <div style={summaryRowStyles}>
            <span style={summaryLabelStyles}>Total Wager:</span>
            <span style={summaryValueStyles}>${totalWager}</span>
          </div>
          <div style={summaryRowStyles}>
            <span style={summaryLabelStyles}>Potential Win:</span>
            <span style={potentialWinStyles}>${totalPotentialWin}</span>
          </div>
        </div>

        {/* Error Message */}
        {hasInsufficientBalance && parseFloat(totalWager) > 0 && (
          <div style={errorTextStyles}>
            Insufficient balance. You need ${(parseFloat(totalWager) - balance).toFixed(2)} more.
          </div>
        )}

        {/* Actions */}
        <div style={actionsStyles}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onPlaceBets}
            disabled={!canPlaceBets || loading}
            loading={loading}
          >
            {loading ? 'Placing Bets...' : `Place Bets ($${totalWager})`}
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={onClearAll}
            disabled={loading}
          >
            Clear All
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BetSlip;
