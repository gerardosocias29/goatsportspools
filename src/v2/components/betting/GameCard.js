import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../ui/Card';
import moment from 'moment';
import { decimalToMixedFraction } from '../../../app/utils/numberFormat';

const GameCard = ({ game, selectedBets, onBetClick, disabled = false }) => {
  const { colors } = useTheme();

  if (!game || !game.odd) {
    return null;
  }

  const { home_team, visitor_team, game_datetime, odd } = game;

  // Check if game starts in less than 9 minutes
  const isGameLocked = () => {
    const currentUtcTime = moment.utc();
    const gameTime = moment.utc(game_datetime);
    return currentUtcTime.isSameOrAfter(gameTime.subtract(9, 'minutes'));
  };

  const locked = isGameLocked() || disabled;

  // Check if a specific bet is selected
  const isBetSelected = (type, team, value) => {
    return selectedBets.some((bet) => {
      if (type === 'spread') {
        return bet.type === type && bet.team?.id === team?.id && bet.points === value && bet.game_id === game.id;
      } else if (type === 'total') {
        return bet.type === type && bet.team === team && bet.points === value && bet.game_id === game.id;
      } else if (type === 'moneyline') {
        return bet.type === type && bet.team?.id === team?.id && bet.ml === value && bet.game_id === game.id;
      }
      return false;
    });
  };

  // Determine favored and underdog teams
  let favoredTeam, underdogTeam, favoredPoints, underdogPoints, favoredMl, underdogMl;

  if (odd.favored_team.id === home_team.id) {
    favoredTeam = visitor_team;
    underdogTeam = home_team;
    favoredPoints = odd.underdog_points;
    underdogPoints = odd.favored_points;
    favoredMl = odd.underdog_ml;
    underdogMl = odd.favored_ml;
  } else {
    favoredTeam = home_team;
    underdogTeam = visitor_team;
    favoredPoints = odd.favored_points;
    underdogPoints = odd.underdog_points;
    favoredMl = odd.favored_ml;
    underdogMl = odd.underdog_ml;
  }

  // Styles
  const cardStyles = {
    opacity: locked ? 0.6 : 1,
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${colors.border}`,
  };

  const gameTimeStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
    fontWeight: 600,
  };

  const lockedBadgeStyles = {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: colors.error + '20',
    color: colors.error,
    fontWeight: 600,
  };

  const teamsContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const teamRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const teamNameStyles = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
    fontFamily: '"Hubot Sans", sans-serif',
  };

  const bettingOptionsStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  };

  const optionColumnStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const optionLabelStyles = {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
  };

  const betButtonStyles = (isSelected) => ({
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `2px solid ${isSelected ? colors.brand.primary : colors.border}`,
    backgroundColor: isSelected ? colors.brand.primary : 'transparent',
    color: isSelected ? '#FFFFFF' : colors.text,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: locked ? 'not-allowed' : 'pointer',
    transition: 'all 150ms ease',
    textAlign: 'center',
  });

  const betButtonHoverStyles = {
    backgroundColor: colors.brand.primary,
    color: '#FFFFFF',
    borderColor: colors.brand.primary,
  };

  return (
    <Card style={cardStyles} hover={!locked}>
      {/* Header with game time */}
      <div style={headerStyles}>
        <span style={gameTimeStyles}>
          {moment(game_datetime).format('ddd, MMM D • h:mm A')}
        </span>
        {locked && <span style={lockedBadgeStyles}>Locked</span>}
      </div>

      {/* Teams */}
      <div style={teamsContainerStyles}>
        <div style={teamRowStyles}>
          <span style={teamNameStyles}>{visitor_team.name}</span>
        </div>
        <div style={teamRowStyles}>
          <span style={teamNameStyles}>{home_team.name}</span>
        </div>
      </div>

      {/* Betting Options */}
      <div style={bettingOptionsStyles}>
        {/* Spread */}
        <div style={optionColumnStyles}>
          <div style={optionLabelStyles}>Spread</div>
          <BetButton
            label={decimalToMixedFraction(favoredPoints, true)}
            selected={isBetSelected('spread', favoredTeam, favoredPoints)}
            disabled={locked}
            onClick={() => !locked && onBetClick({
              game_id: game.id,
              type: 'spread',
              team: favoredTeam,
              points: favoredPoints,
              bet_amount: 0,
              data: game,
            })}
            colors={colors}
          />
          <BetButton
            label={decimalToMixedFraction(underdogPoints, true)}
            selected={isBetSelected('spread', underdogTeam, underdogPoints)}
            disabled={locked}
            onClick={() => !locked && onBetClick({
              game_id: game.id,
              type: 'spread',
              team: underdogTeam,
              points: underdogPoints,
              bet_amount: 0,
              data: game,
            })}
            colors={colors}
          />
        </div>

        {/* Total */}
        <div style={optionColumnStyles}>
          <div style={optionLabelStyles}>Total</div>
          <BetButton
            label={`o${decimalToMixedFraction(odd.over_total)}`}
            selected={isBetSelected('total', 'over', odd.over_total)}
            disabled={locked}
            onClick={() => !locked && onBetClick({
              game_id: game.id,
              type: 'total',
              team: 'over',
              points: odd.over_total,
              bet_amount: 0,
              data: game,
            })}
            colors={colors}
          />
          <BetButton
            label={`u${decimalToMixedFraction(odd.under_total)}`}
            selected={isBetSelected('total', 'under', odd.under_total)}
            disabled={locked}
            onClick={() => !locked && onBetClick({
              game_id: game.id,
              type: 'total',
              team: 'under',
              points: odd.under_total,
              bet_amount: 0,
              data: game,
            })}
            colors={colors}
          />
        </div>

        {/* Money Line */}
        <div style={optionColumnStyles}>
          <div style={optionLabelStyles}>Money Line</div>
          {favoredMl !== null && favoredMl !== undefined && favoredMl !== 0 ? (
            <>
              <BetButton
                label={favoredMl > 0 ? `+${favoredMl}` : favoredMl}
                selected={isBetSelected('moneyline', favoredTeam, favoredMl)}
                disabled={locked}
                onClick={() => !locked && onBetClick({
                  game_id: game.id,
                  type: 'moneyline',
                  team: favoredTeam,
                  ml: favoredMl,
                  bet_amount: 0,
                  data: game,
                })}
                colors={colors}
              />
              <BetButton
                label={underdogMl > 0 ? `+${underdogMl}` : underdogMl}
                selected={isBetSelected('moneyline', underdogTeam, underdogMl)}
                disabled={locked}
                onClick={() => !locked && onBetClick({
                  game_id: game.id,
                  type: 'moneyline',
                  team: underdogTeam,
                  ml: underdogMl,
                  bet_amount: 0,
                  data: game,
                })}
                colors={colors}
              />
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.875rem', color: colors.text, opacity: 0.5, textAlign: 'center', padding: '0.75rem' }}>
                N/A
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.text, opacity: 0.5, textAlign: 'center', padding: '0.75rem' }}>
                N/A
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

// Reusable Bet Button Component
const BetButton = ({ label, selected, disabled, onClick, colors }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyles = {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `2px solid ${selected ? colors.brand.primary : colors.border}`,
    backgroundColor: selected ? colors.brand.primary : (isHovered && !disabled ? colors.brand.primary + '10' : 'transparent'),
    color: selected ? '#FFFFFF' : colors.text,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms ease',
    textAlign: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button
      style={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  );
};

export default GameCard;
