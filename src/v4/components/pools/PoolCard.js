import React from 'react';
import { useNavigate } from 'react-router-dom';

const PoolCard = ({ pool, teams }) => {
  const navigate = useNavigate();

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      open: { label: 'Open', cls: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500' },
      SelectOpen: { label: 'Open', cls: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500' },
      closed: { label: 'Closed', cls: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500' },
      SelectClosed: { label: 'Closed', cls: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500' },
      in_progress: { label: 'In Progress', cls: 'bg-info-50 text-info-500 dark:bg-info-500/15 dark:text-info-400' },
      GameStarted: { label: 'In Progress', cls: 'bg-info-50 text-info-500 dark:bg-info-500/15 dark:text-info-400' },
      completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
    };
    const badge = map[status] || { label: status || 'Unknown', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
        {badge.label}
      </span>
    );
  };

  const claimed = pool.claimed_squares || 0;
  const visitorTeamId = pool.game?.visitor_team_id || pool.game?.visitorTeamId;
  const homeTeamId = pool.game?.home_team_id || pool.game?.homeTeamId;
  const visitorName = getTeamName(visitorTeamId);
  const homeName = getTeamName(homeTeamId);
  const visitorLogo = getTeamLogo(visitorTeamId);
  const homeLogo = getTeamLogo(homeTeamId);
  const league = pool.game?.league || 'NFL';
  const gameDate = pool.game?.game_datetime || pool.game?.game_time;
  const entryType = pool.player_pool_type === 'FREE' ? 'Free' : `${pool.credit_cost || pool.entry_fee || 0}`;
  const poolNumber = pool.pool_number;

  return (
    <div
      onClick={() => navigate(`/pools/${poolNumber}`)}
      className="rounded-2xl border border-gray-200 bg-white cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/50 overflow-hidden"
    >
      {/* Status color bar */}
      <div className={`h-1 ${pool.pool_status === 'open' || pool.pool_status === 'SelectOpen' ? 'bg-success-500' : pool.pool_status === 'closed' || pool.pool_status === 'SelectClosed' ? 'bg-error-500' : pool.pool_status === 'in_progress' || pool.pool_status === 'GameStarted' ? 'bg-info-500' : 'bg-gray-300'}`} />

      <div className="p-4">
        {/* Header: Name + Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {pool.pool_name || pool.gridName || 'Untitled Pool'}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {league}
            </span>
            {getStatusBadge(pool.pool_status)}
          </div>
        </div>

        {/* Teams matchup */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 flex-1 min-w-0">
            {visitorLogo && (
              <img src={visitorLogo} alt={visitorName} className="w-6 h-6 object-contain flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{visitorName}</span>
          </div>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">VS</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 flex-1 min-w-0">
            {homeLogo && (
              <img src={homeLogo} alt={homeName} className="w-6 h-6 object-contain flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{homeName}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{claimed}/100 squares</span>
            <span>{claimed}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${claimed}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{pool.players_count || 0} players</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(gameDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{entryType}</span>
          </div>
        </div>

        {/* Joined indicator */}
        {pool.user_joined && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success-600 dark:text-success-400">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Joined
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolCard;
