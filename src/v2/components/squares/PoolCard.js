import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiLock, FiUnlock, FiUsers, FiGrid, FiCalendar } from 'react-icons/fi';
import { Tooltip } from 'primereact/tooltip';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Minimalist Pool Card Component - V2 Design
 */
const PoolCard = ({
  pool,
  teams = [],
  onSelect,
}) => {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const [hovered, setHovered] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const claimedSquares = pool.squares_claimed || pool.selectedSquares || pool.claimed_squares || pool.squares_selected || 0;
  const totalSquares = pool.total_squares || pool.totalSquares || 100;
  const progressPct = Math.min(100, Math.max(0, ((claimedSquares / totalSquares) * 100)));
  const entryFee = parseFloat(pool.entry_fee || pool.credit_cost || 0);
  const payout = parseFloat(pool.custom_payout || pool.total_pot || 0);
  const isPrivate = pool.player_pool_type === 'CREDIT';
  const playersCount = pool.players_count || 0;
  const gameDateTime = pool.game?.game_datetime;

  const statusConfig = {
    open: { color: colors.success, label: 'Open' },
    SelectOpen: { color: colors.success, label: 'Open' },
    closed: { color: colors.error, label: 'Closed' },
    SelectClosed: { color: colors.error, label: 'Closed' },
    in_progress: { color: colors.info, label: 'In Progress' },
    GameStarted: { color: colors.info, label: 'In Progress' },
    completed: { color: isDark ? '#6B7280' : '#9CA3AF', label: 'Completed' },
  };

  const status = statusConfig[pool.pool_status] || { color: colors.success, label: 'Open' };
  const statusColor = status.color;

  const handleClick = () => {
    if (onSelect) {
      onSelect(pool);
    } else {
      navigate(`/squares/pool/${pool.pool_number}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.card,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? `0 8px 24px -8px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'}`
          : `0 2px 8px -4px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}`,
        border: `1px solid ${hovered ? colors.brand.primary : colors.border}`,
      }}
    >
      {/* Status Bar */}
      <div style={{ height: '3px', backgroundColor: statusColor }} />

      <div style={{ padding: '1rem' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: colors.text,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {pool.pool_name || pool.gridName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              {pool.game?.league && (
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: colors.brand.primary }}>
                  {pool.game.league}
                </span>
              )}
              <span style={{ fontSize: '0.7rem', color: isDark ? '#6B7280' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {isPrivate ? <FiLock size={10} /> : <FiUnlock size={10} />}
                {isPrivate ? 'Private' : 'Public'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: statusColor,
              backgroundColor: `${statusColor}15`,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
            }}>
              {status.label}
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: colors.text,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
            }}>
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>

        {/* Teams */}
        {pool.game && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.75rem',
            color: colors.text,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              flex: 1,
              minWidth: 0,
              padding: '0.4rem 0.5rem',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
            }}>
              {getTeamLogo(pool.game?.visitor_team_id) && (
                <img src={getTeamLogo(pool.game?.visitor_team_id)} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} />
              )}
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getTeamName(pool.game?.visitor_team_id)}
              </span>
            </div>
            <span style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: '0.65rem', flexShrink: 0, fontWeight: 600 }}>vs</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              flex: 1,
              minWidth: 0,
              padding: '0.4rem 0.5rem',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
            }}>
              {getTeamLogo(pool.game?.home_team_id) && (
                <img src={getTeamLogo(pool.game?.home_team_id)} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} />
              )}
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getTeamName(pool.game?.home_team_id)}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          marginBottom: '0.75rem',
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: colors.brand.primary,
            transition: 'width 300ms ease',
          }} />
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: isDark ? '#6B7280' : '#9CA3AF',
          marginBottom: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FiGrid size={11} />
            <span>{claimedSquares}/{totalSquares}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FiUsers size={11} />
            <span>{playersCount} players</span>
          </div>
          <div
            className={`game-date-${pool.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}
          >
            <span>Game: {formatDate(gameDateTime)}</span>
            <FiCalendar size={11} />
          </div>
          <Tooltip target={`.game-date-${pool.id}`} content="Game starts" position="top" />
        </div>

        {/* Info Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <span style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>Entry: </span>
              <span style={{ fontWeight: 700, color: colors.text }}>{entryFee === 0 ? 'Free' : `$${entryFee}`}</span>
            </div>
            <div>
              <span style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>Payout: </span>
              <span style={{ fontWeight: 700, color: colors.text }}>${payout}</span>
            </div>
          </div>
          <div
            className={`pool-closes-${pool.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isDark ? '#6B7280' : '#9CA3AF', cursor: 'help' }}
          >
            <span style={{ fontSize: '0.7rem' }}>Closes: {formatDate(pool.close_datetime)}</span>
            <FiClock size={11} />
          </div>
          <Tooltip target={`.pool-closes-${pool.id}`} content="Pool closes" position="top" />
        </div>
      </div>
    </div>
  );
};

export default PoolCard;
