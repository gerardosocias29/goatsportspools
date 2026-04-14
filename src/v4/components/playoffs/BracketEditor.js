import React, { useState } from 'react';
import MatchupCard from './MatchupCard';

const ROUND_LABELS = {
  1: 'Round 1',
  2: 'Round 2',
  3: 'Conf. Finals',
  4: 'NBA Finals',
};

// NBA-0008 — Display picked champion between the trophy and the Finals matchup
const ChampionCard = ({ team }) => {
  if (!team) {
    return (
      <div className="mb-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 text-center min-w-[140px]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Champion</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5">Pick to set</div>
      </div>
    );
  }
  const name = team.nickname || team.name || 'Champion';
  return (
    <div className="mb-2 px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-500/40 bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/5 text-center min-w-[140px] shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">Champion</div>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {team.image_url && <img src={team.image_url} alt="" className="w-5 h-5 object-contain" />}
        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{name}</div>
      </div>
    </div>
  );
};

// ─── Recursive Bracket Pair ──────────────────────────────────
// Renders two children → connector bracket → result
// Handles both LTR (East) and RTL (West) via flex-row-reverse.

const BracketPair = ({ top, bottom, result, direction = 'ltr', gap = 'gap-1', showConnector = false }) => {
  const isLtr = direction === 'ltr';
  const borderSide = isLtr ? 'border-r-2' : 'border-l-2';

  if (!showConnector) {
    return (
      <div className={`flex items-center ${!isLtr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex flex-col justify-center ${gap}`}>
          {top}
          {bottom}
        </div>
        <div className="w-4" />
        {result}
      </div>
    );
  }

  const gapHeight = gap.replace('gap-', 'h-');
  const borderColor = 'border-gray-300 dark:border-gray-600';
  const topCorner = isLtr ? 'rounded-tr-lg' : 'rounded-tl-lg';
  const bottomCorner = isLtr ? 'rounded-br-lg' : 'rounded-bl-lg';

  return (
    <div className={`flex items-center ${!isLtr ? 'flex-row-reverse' : ''}`}>
      {/* Children with bracket arms from card centers */}
      <div className="flex flex-col">
        {/* Top child + arm */}
        <div className={`flex ${!isLtr ? 'flex-row-reverse' : ''}`}>
          {top}
          <div className="w-4 flex flex-col shrink-0">
            <div className="flex-1" />
            <div className={`flex-1 border-t-2 ${borderSide} ${borderColor} ${topCorner}`} />
          </div>
        </div>

        {/* Gap with vertical line */}
        <div className={`${gapHeight} flex ${!isLtr ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1" />
          <div className={`w-4 ${borderSide} ${borderColor} shrink-0`} />
        </div>

        {/* Bottom child + arm */}
        <div className={`flex ${!isLtr ? 'flex-row-reverse' : ''}`}>
          {bottom}
          <div className="w-4 flex flex-col shrink-0">
            <div className={`flex-1 border-b-2 ${borderSide} ${borderColor} ${bottomCorner}`} />
            <div className="flex-1" />
          </div>
        </div>
      </div>

      {/* Horizontal line from midpoint to result */}
      <div className="w-3 flex items-center self-stretch">
        <div className={`w-full border-t-2 ${borderColor}`} />
      </div>

      {result}
    </div>
  );
};

// ─── Main Editor ─────────────────────────────────────────────

const BracketEditor = ({ hook, onSelectMatchupWinner, onSetGames }) => {
  const { readOnly, getMatchups, getPicksForRound } = hook;

  // All matchups
  const eastR1 = getMatchups(1, 'East');
  const eastR2 = getMatchups(2, 'East');
  const eastR3 = getMatchups(3, 'East');
  const westR1 = getMatchups(1, 'West');
  const westR2 = getMatchups(2, 'West');
  const westR3 = getMatchups(3, 'West');
  const finals = getMatchups(4, null);

  // Pick helpers
  const getWinnerId = (round, conference, matchup) => {
    if (!matchup.teamA || !matchup.teamB) return null;
    const roundPicks = getPicksForRound(round, conference);
    const pick = roundPicks.find(
      (p) =>
        p.picked_team_id === matchup.teamA.team_id ||
        p.picked_team_id === matchup.teamB.team_id
    );
    return pick?.picked_team_id || null;
  };

  const getSelectedGames = (round, conference, matchup) => {
    const winnerId = getWinnerId(round, conference, matchup);
    if (!winnerId) return null;
    const roundPicks = getPicksForRound(round, conference);
    const pick = roundPicks.find((p) => p.picked_team_id === winnerId);
    return pick?.picked_games || null;
  };

  // Champion (NBA-0008) — resolve the winner of the Finals matchup to a team object
  const championTeam = (() => {
    const finalsMatchup = finals[0];
    if (!finalsMatchup) return null;
    const winnerId = getWinnerId(4, null, finalsMatchup);
    if (!winnerId) return null;
    const side = [finalsMatchup.teamA, finalsMatchup.teamB].find(
      (t) => t && (t.team_id === winnerId || t.team?.id === winnerId)
    );
    return side?.team || side || null;
  })();

  const renderMatchup = (matchup, round, conference) => {
    const winnerId = getWinnerId(round, conference, matchup);
    const selectedGames = getSelectedGames(round, conference, matchup);
    return (
      <MatchupCard
        key={`${conference}-R${round}-M${matchup.matchupIndex}`}
        teamA={matchup.teamA}
        teamB={matchup.teamB}
        winnerId={winnerId}
        selectedGames={selectedGames}
        readOnly={readOnly}
        onSelectWinner={(teamId, opponentId) =>
          onSelectMatchupWinner(round, conference, teamId, opponentId)
        }
        onSetGames={(games) => {
          if (winnerId) onSetGames(round, conference, winnerId, games);
        }}
        conference={conference}
        round={round}
      />
    );
  };

  // Build a conference bracket using recursive BracketPair
  const renderConferenceBracket = (conference, direction, r1, r2, r3) => (
    <BracketPair
      direction={direction}
      gap="gap-4"
      showConnector
      top={
        <BracketPair
          direction={direction}
          gap="gap-1"
          showConnector
          top={renderMatchup(r1[0], 1, conference)}
          bottom={renderMatchup(r1[1], 1, conference)}
          result={renderMatchup(r2[0], 2, conference)}
        />
      }
      bottom={
        <BracketPair
          direction={direction}
          gap="gap-1"
          showConnector
          top={renderMatchup(r1[2], 1, conference)}
          bottom={renderMatchup(r1[3], 1, conference)}
          result={renderMatchup(r2[1], 2, conference)}
        />
      }
      result={renderMatchup(r3[0], 3, conference)}
    />
  );

  return (
    <div>
      {/* Desktop: Full bracket */}
      <div className="hidden lg:block overflow-x-auto py-4">
        {/* Conference labels on top */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Eastern Conference
            </span>
          </div>
          <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">
            🏆 NBA Finals
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Western Conference
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Bracket */}
        <div className="flex items-center justify-center gap-0">
          {/* East (LTR) */}
          {renderConferenceBracket('East', 'ltr', eastR1, eastR2, eastR3)}

          {/* Finals */}
          <div className="flex flex-col items-center justify-center px-2">
            <div className="text-xl mb-1">🏆</div>
            <ChampionCard team={championTeam} />
            {finals[0] && (
              <MatchupCard
                teamA={finals[0].teamA}
                teamB={finals[0].teamB}
                winnerId={getWinnerId(4, null, finals[0])}
                selectedGames={getSelectedGames(4, null, finals[0])}
                readOnly={readOnly}
                onSelectWinner={(teamId, opponentId) =>
                  onSelectMatchupWinner(4, null, teamId, opponentId)
                }
                onSetGames={(games) => {
                  const wid = getWinnerId(4, null, finals[0]);
                  if (wid) onSetGames(4, null, wid, games);
                }}
                conference={null}
                round={4}
              />
            )}
          </div>

          {/* West (RTL) */}
          {renderConferenceBracket('West', 'rtl', westR1, westR2, westR3)}
        </div>
      </div>

      {/* Mobile: Tabbed view */}
      <div className="lg:hidden">
        <MobileBracketView
          eastR1={eastR1}
          eastR2={eastR2}
          eastR3={eastR3}
          westR1={westR1}
          westR2={westR2}
          westR3={westR3}
          finals={finals}
          championTeam={championTeam}
          readOnly={readOnly}
          onSelectMatchupWinner={onSelectMatchupWinner}
          onSetGames={onSetGames}
          getWinnerId={getWinnerId}
          getSelectedGames={getSelectedGames}
        />
      </div>
    </div>
  );
};

// ─── Mobile Bracket View ─────────────────────────────────────

const MobileBracketView = ({
  eastR1, eastR2, eastR3,
  westR1, westR2, westR3,
  finals,
  championTeam,
  readOnly,
  onSelectMatchupWinner,
  onSetGames,
  getWinnerId,
  getSelectedGames,
}) => {
  const [activeTab, setActiveTab] = useState('East');
  const tabs = ['East', 'West', 'Finals'];

  const renderMobileMatchup = (matchup, round, conference) => {
    const winnerId = getWinnerId(round, conference, matchup);
    const selectedGames = getSelectedGames(round, conference, matchup);
    return (
      <MatchupCard
        key={`m-${conference}-R${round}-M${matchup.matchupIndex}`}
        teamA={matchup.teamA}
        teamB={matchup.teamB}
        winnerId={winnerId}
        selectedGames={selectedGames}
        readOnly={readOnly}
        onSelectWinner={(teamId, opponentId) =>
          onSelectMatchupWinner(round, conference, teamId, opponentId)
        }
        onSetGames={(games) => {
          if (winnerId) onSetGames(round, conference, winnerId, games);
        }}
        conference={conference}
        round={round}
      />
    );
  };

  const renderRoundHeader = (label) => (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
    </div>
  );

  const renderConference = (conference, r1, r2, r3) => (
    <div className="space-y-2">
      {renderRoundHeader(ROUND_LABELS[1])}
      <div className="grid grid-cols-2 gap-2">
        {r1.map((m) => renderMobileMatchup(m, 1, conference))}
      </div>
      {renderRoundHeader(ROUND_LABELS[2])}
      <div className="grid grid-cols-2 gap-2">
        {r2.map((m) => renderMobileMatchup(m, 2, conference))}
      </div>
      {renderRoundHeader(ROUND_LABELS[3])}
      <div className="flex justify-center">
        {r3.map((m) => renderMobileMatchup(m, 3, conference))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'Finals' ? '🏆 Finals' : tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'East' && renderConference('East', eastR1, eastR2, eastR3)}
      {activeTab === 'West' && renderConference('West', westR1, westR2, westR3)}
      {activeTab === 'Finals' && (
        <div className="space-y-2">
          {renderRoundHeader(ROUND_LABELS[4])}
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-2">🏆</div>
            <ChampionCard team={championTeam} />
            {finals[0] && (
              <MatchupCard
                teamA={finals[0].teamA}
                teamB={finals[0].teamB}
                winnerId={getWinnerId(4, null, finals[0])}
                selectedGames={getSelectedGames(4, null, finals[0])}
                readOnly={readOnly}
                onSelectWinner={(teamId, opponentId) =>
                  onSelectMatchupWinner(4, null, teamId, opponentId)
                }
                onSetGames={(games) => {
                  const wid = getWinnerId(4, null, finals[0]);
                  if (wid) onSetGames(4, null, wid, games);
                }}
                conference={null}
                round={4}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketEditor;
