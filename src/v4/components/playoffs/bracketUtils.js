/**
 * Bracket utility functions for matchup-based NBA Playoff picks.
 * No React — pure logic.
 */

// Fixed R1 matchup seed pairs (standard NBA bracket)
export const R1_MATCHUP_PAIRS = [
  [1, 8],
  [4, 5],
  [3, 6],
  [2, 7],
];

/**
 * Find a seed object by team_id from the seeds array.
 */
export function findSeedByTeamId(teamId, seeds) {
  return seeds.find((s) => s.team_id === teamId) || null;
}

/**
 * Given a matchup { teamA, teamB } and the round's picks, return the winner's seed object (or null).
 */
export function getMatchupWinner(matchup, roundPicks) {
  if (!matchup.teamA || !matchup.teamB) return null;
  const teamAId = matchup.teamA.team_id;
  const teamBId = matchup.teamB.team_id;
  const pick = roundPicks.find(
    (p) => p.picked_team_id === teamAId || p.picked_team_id === teamBId
  );
  if (!pick) return null;
  return pick.picked_team_id === teamAId ? matchup.teamA : matchup.teamB;
}

/**
 * Get matchups for a given round and conference.
 *
 * Returns an array of { matchupIndex, teamA, teamB } objects.
 * teamA/teamB are seed objects ({ team_id, team, seed, conference }) or null if TBD.
 *
 * @param {number} round - 1, 2, 3, or 4 (finals)
 * @param {string|null} conference - 'East' or 'West' (null for round 4)
 * @param {Array} picks - current picks array
 * @param {Array} seeds - all 16 seed objects from pool.playoff.teams
 * @returns {Array} matchups
 */
export function getMatchups(round, conference, picks, seeds) {
  const confSeeds = seeds
    .filter((s) => s.conference === conference)
    .sort((a, b) => a.seed - b.seed);

  if (round === 1) {
    return R1_MATCHUP_PAIRS.map(([seedA, seedB], idx) => ({
      matchupIndex: idx,
      teamA: confSeeds.find((s) => s.seed === seedA) || null,
      teamB: confSeeds.find((s) => s.seed === seedB) || null,
    }));
  }

  if (round === 2) {
    const r1Matchups = getMatchups(1, conference, picks, seeds);
    const r1Picks = picks.filter(
      (p) => p.round === 1 && p.conference === conference
    );
    // R2 matchup 0: winner(R1-M0) vs winner(R1-M1)
    // R2 matchup 1: winner(R1-M2) vs winner(R1-M3)
    return [
      {
        matchupIndex: 0,
        teamA: getMatchupWinner(r1Matchups[0], r1Picks),
        teamB: getMatchupWinner(r1Matchups[1], r1Picks),
      },
      {
        matchupIndex: 1,
        teamA: getMatchupWinner(r1Matchups[2], r1Picks),
        teamB: getMatchupWinner(r1Matchups[3], r1Picks),
      },
    ];
  }

  if (round === 3) {
    const r2Matchups = getMatchups(2, conference, picks, seeds);
    const r2Picks = picks.filter(
      (p) => p.round === 2 && p.conference === conference
    );
    return [
      {
        matchupIndex: 0,
        teamA: getMatchupWinner(r2Matchups[0], r2Picks),
        teamB: getMatchupWinner(r2Matchups[1], r2Picks),
      },
    ];
  }

  // Round 4 — Finals
  if (round === 4) {
    const eastR3 = getMatchups(3, 'East', picks, seeds);
    const westR3 = getMatchups(3, 'West', picks, seeds);
    const r3Picks = picks.filter((p) => p.round === 3);
    return [
      {
        matchupIndex: 0,
        teamA: getMatchupWinner(eastR3[0], r3Picks),
        teamB: getMatchupWinner(westR3[0], r3Picks),
      },
    ];
  }

  return [];
}
