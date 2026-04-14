import { useState, useEffect, useCallback, useRef } from 'react';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import * as bracketUtils from '../components/playoffs/bracketUtils';

const ROUND_CAPS = { 1: 4, 2: 2, 3: 1 };

const usePlayoffPool = (poolNumber) => {
  const axios = useAxios();
  const { user, isSignedIn, isLoaded } = useUserContext();

  const [pool, setPool] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [brackets, setBrackets] = useState([]);
  const [activeBracketId, setActiveBracketId] = useState(null);
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const autoSaveTimer = useRef(null);

  // Derived
  const activeBracket = brackets.find((b) => b.id === activeBracketId) || null;
  const isLocked = pool?.is_locked || false;
  const isFinalized = activeBracket?.status === 'finalized';
  const readOnly = isLocked || isFinalized;
  const seeds = pool?.playoff?.teams || [];

  const eastSeeds = seeds
    .filter((s) => s.conference === 'East')
    .sort((a, b) => a.seed - b.seed);
  const westSeeds = seeds
    .filter((s) => s.conference === 'West')
    .sort((a, b) => a.seed - b.seed);

  // Seed lookup: teamId → { conference, seed }
  const seedMap = {};
  seeds.forEach((s) => {
    seedMap[s.team_id] = { conference: s.conference, seed: s.seed };
  });

  // ─── Load pool ────────────────────────────────────────────
  const loadPool = useCallback(async () => {
    if (!poolNumber) return;
    try {
      setError(null);
      const res = await axios.get(`/api/playoff-pools/${poolNumber}`);
      const data = res.data.data || res.data;
      setPool(data);
      setParticipant(data.participant || null);
    } catch (err) {
      console.error('usePlayoffPool: loadPool error', err);
      setError(err.response?.data?.message || 'Failed to load pool');
    }
  }, [poolNumber, axios]);

  // ─── Load brackets ────────────────────────────────────────
  const loadBrackets = useCallback(async () => {
    if (!poolNumber) return;
    try {
      const res = await axios.get(`/api/playoff-pools/${poolNumber}/brackets`);
      const data = res.data.data || [];
      setBrackets(data);
      return data;
    } catch (err) {
      console.error('usePlayoffPool: loadBrackets error', err);
      return [];
    }
  }, [poolNumber, axios]);

  // ─── Select bracket ───────────────────────────────────────
  const selectBracket = useCallback(
    (bracketId) => {
      const bracket = brackets.find((b) => b.id === bracketId);
      if (!bracket) return;
      setActiveBracketId(bracketId);
      // Load picks from bracket's stored picks
      const stored = (bracket.picks || []).map((p) => ({
        pick_type: p.pick_type,
        round: p.round,
        conference: p.conference,
        picked_team_id: p.picked_team_id,
        picked_games: p.picked_games,
        auto: false,
      }));
      setPicks(stored);
      setDirty(false);
    },
    [brackets]
  );

  // ─── Create bracket ───────────────────────────────────────
  const createBracket = useCallback(async () => {
    if (!poolNumber) return { success: false, error: 'No pool' };
    try {
      const res = await axios.post(`/api/playoff-pools/${poolNumber}/brackets`);
      const newBracket = res.data.data;
      await loadPool();
      const updated = await loadBrackets();
      setActiveBracketId(newBracket.id);
      setPicks([]);
      setDirty(false);
      return { success: true, data: newBracket };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create bracket',
      };
    }
  }, [poolNumber, axios, loadPool, loadBrackets]);

  // ─── Rename bracket ───────────────────────────────────────
  const renameBracket = useCallback(
    async (name) => {
      if (!poolNumber || !activeBracketId) return { success: false };
      try {
        await axios.put(
          `/api/playoff-pools/${poolNumber}/brackets/${activeBracketId}`,
          { bracket_name: name }
        );
        await loadBrackets();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.message || 'Failed to rename',
        };
      }
    },
    [poolNumber, activeBracketId, axios, loadBrackets]
  );

  // ─── Save picks to server ─────────────────────────────────
  const savePicks = useCallback(
    async (picksToSave) => {
      if (!poolNumber || !activeBracketId) return { success: false };
      const payload = (picksToSave || picks).map((p) => ({
        pick_type: p.round === 4 ? 'champion' : 'round',
        round: p.round,
        conference: p.round === 4 ? null : p.conference,
        picked_team_id: p.picked_team_id,
        picked_games: p.picked_games,
      }));
      setSaving(true);
      try {
        const res = await axios.post(
          `/api/playoff-pools/${poolNumber}/brackets/${activeBracketId}/picks`,
          { picks: payload }
        );
        const updated = res.data.data;
        // Refresh brackets list to reflect new picks
        await loadBrackets();
        setDirty(false);
        setSaving(false);
        return { success: true, data: updated };
      } catch (err) {
        setSaving(false);
        return {
          success: false,
          error: err.response?.data?.message || 'Failed to save picks',
        };
      }
    },
    [poolNumber, activeBracketId, picks, axios, loadBrackets]
  );

  // ─── Finalize bracket ─────────────────────────────────────
  // Optional `bracketName` renames the bracket at finalize time (backend validates uniqueness)
  const finalizeBracket = useCallback(async (bracketName) => {
    if (!poolNumber || !activeBracketId) return { success: false };
    // Save first
    const saveResult = await savePicks();
    if (!saveResult.success) return saveResult;
    try {
      const body = bracketName ? { bracket_name: bracketName } : {};
      const res = await axios.post(
        `/api/playoff-pools/${poolNumber}/brackets/${activeBracketId}/finalize`,
        body
      );
      await loadBrackets();
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to finalize',
      };
    }
  }, [poolNumber, activeBracketId, axios, savePicks, loadBrackets]);

  // ─── Toggle pick ──────────────────────────────────────────
  const togglePick = useCallback(
    (round, conference, teamId) => {
      if (readOnly) return;
      setPicks((prev) => {
        const existing = prev.find(
          (p) =>
            p.round === round &&
            p.conference === conference &&
            p.picked_team_id === teamId
        );
        if (existing) {
          // Unselecting — forward cascade: remove from this round AND all downstream
          const result = prev.filter(
            (p) =>
              !(
                p.picked_team_id === teamId &&
                ((p.round === round && p.conference === conference) ||
                  (p.round > round &&
                    (p.conference === conference || p.round === 4)))
              )
          );
          setDirty(true);
          return result;
        } else {
          // Selecting — enforce cap
          const cap = ROUND_CAPS[round];
          const currentCount = prev.filter(
            (p) => p.round === round && p.conference === conference
          ).length;
          if (currentCount >= cap) {
            return prev; // Cap reached, caller should show toast
          }
          // For R2+, validate team is in previous round
          if (round >= 2) {
            const inPrev = prev.some(
              (p) =>
                p.round === round - 1 &&
                p.conference === conference &&
                p.picked_team_id === teamId
            );
            if (!inPrev) return prev;
          }
          setDirty(true);
          return [
            ...prev,
            {
              pick_type: 'round',
              round,
              conference,
              picked_team_id: teamId,
              picked_games: null,
              auto: false,
            },
          ];
        }
      });
    },
    [readOnly]
  );

  // ─── Check if cap is reached for a round/conference ────────
  const isCapReached = useCallback(
    (round, conference) => {
      const cap = ROUND_CAPS[round];
      return picks.filter((p) => p.round === round && p.conference === conference).length >= cap;
    },
    [picks]
  );

  // ─── Set games for a pick ─────────────────────────────────
  const setGames = useCallback(
    (round, conference, teamId, games) => {
      if (readOnly) return;
      setPicks((prev) =>
        prev.map((p) =>
          p.round === round &&
          (p.round === 4 || p.conference === conference) &&
          p.picked_team_id === teamId
            ? { ...p, picked_games: games }
            : p
        )
      );
      setDirty(true);
    },
    [readOnly]
  );

  // ─── Select matchup winner (matchup-based picking) ────────
  const selectMatchupWinner = useCallback(
    (round, conference, teamId, opponentTeamId) => {
      if (readOnly) return;
      setPicks((prev) => {
        // If this team already picked → deselect (forward cascade)
        const alreadyPicked = prev.find(
          (p) =>
            p.round === round &&
            (round === 4 || p.conference === conference) &&
            p.picked_team_id === teamId
        );
        if (alreadyPicked) {
          const result = prev.filter(
            (p) =>
              !(
                p.picked_team_id === teamId &&
                ((p.round === round &&
                  (p.conference === conference || round === 4)) ||
                  (p.round > round &&
                    (p.conference === conference || p.round === 4)))
              )
          );
          setDirty(true);
          return result;
        }

        // Remove opponent from this round + all downstream (forward cascade)
        let newPicks = prev.filter(
          (p) =>
            !(
              p.picked_team_id === opponentTeamId &&
              ((p.round === round &&
                (p.conference === conference || round === 4)) ||
                (p.round > round &&
                  (p.conference === conference || p.round === 4)))
            )
        );

        // Add the new winner
        newPicks.push({
          pick_type: round === 4 ? 'champion' : 'round',
          round,
          conference: round === 4 ? null : conference,
          picked_team_id: teamId,
          picked_games: null,
          auto: false,
        });

        setDirty(true);
        return newPicks;
      });
    },
    [readOnly]
  );

  // ─── Get matchups for a round/conference ─────────────────
  const getMatchups = useCallback(
    (round, conference) => {
      return bracketUtils.getMatchups(round, conference, picks, seeds);
    },
    [picks, seeds]
  );

  // ─── Pick champion (with reverse cascade logic) ───────────
  const pickChampion = useCallback(
    (teamId) => {
      if (readOnly) return { needsConfirm: false, picks: [] };
      const teamSeed = seedMap[teamId];
      if (!teamSeed) return { needsConfirm: false, picks: [] };
      const teamConference = teamSeed.conference;

      // Check what upstream rounds need filling
      const conflicts = [];
      for (const round of [1, 2, 3]) {
        const cap = ROUND_CAPS[round];
        const roundPicks = picks.filter(
          (p) => p.round === round && p.conference === teamConference
        );
        const alreadyIn = roundPicks.some(
          (p) => p.picked_team_id === teamId
        );
        if (!alreadyIn && roundPicks.length >= cap) {
          conflicts.push({
            round,
            conference: teamConference,
            toRemove: roundPicks[roundPicks.length - 1],
          });
        }
      }

      if (conflicts.length > 0) {
        return { needsConfirm: true, conflicts, teamId, teamConference };
      }

      // Apply: remove existing champion, add team to missing rounds, add champion
      const newPicks = picks.filter((p) => p.round !== 4);
      for (const round of [1, 2, 3]) {
        const alreadyIn = newPicks.some(
          (p) =>
            p.round === round &&
            p.conference === teamConference &&
            p.picked_team_id === teamId
        );
        if (!alreadyIn) {
          newPicks.push({
            pick_type: 'round',
            round,
            conference: teamConference,
            picked_team_id: teamId,
            picked_games: null,
            auto: true,
          });
        }
      }
      newPicks.push({
        pick_type: 'champion',
        round: 4,
        conference: null,
        picked_team_id: teamId,
        picked_games: null,
        auto: false,
      });

      setPicks(newPicks);
      setDirty(true);
      return { needsConfirm: false, picks: newPicks };
    },
    [readOnly, picks, seedMap]
  );

  // ─── Confirm champion replace (after modal) ───────────────
  const confirmChampionReplace = useCallback(
    (teamId, teamConference, conflicts) => {
      // Remove conflicting picks
      let filtered = picks.filter(
        (p) =>
          !conflicts.some(
            (c) =>
              c.toRemove.round === p.round &&
              c.toRemove.conference === p.conference &&
              c.toRemove.picked_team_id === p.picked_team_id
          )
      );
      // Also remove existing champion
      filtered = filtered.filter((p) => p.round !== 4);
      // Add team to missing rounds
      for (const round of [1, 2, 3]) {
        const alreadyIn = filtered.some(
          (p) =>
            p.round === round &&
            p.conference === teamConference &&
            p.picked_team_id === teamId
        );
        if (!alreadyIn) {
          filtered.push({
            pick_type: 'round',
            round,
            conference: teamConference,
            picked_team_id: teamId,
            picked_games: null,
            auto: true,
          });
        }
      }
      filtered.push({
        pick_type: 'champion',
        round: 4,
        conference: null,
        picked_team_id: teamId,
        picked_games: null,
        auto: false,
      });

      setPicks(filtered);
      setDirty(true);
    },
    [picks]
  );

  // ─── Get picks for a round/conference ─────────────────────
  const getPicksForRound = useCallback(
    (round, conference) => {
      if (round === 4)
        return picks.filter((p) => p.round === 4);
      return picks.filter(
        (p) => p.round === round && p.conference === conference
      );
    },
    [picks]
  );

  // ─── Get candidates for a round/conference ────────────────
  const getCandidates = useCallback(
    (round, conference) => {
      if (round === 1) {
        return conference === 'East' ? eastSeeds : westSeeds;
      }
      // R2 candidates = R1 picks for this conference
      // R3 candidates = R2 picks for this conference
      const prevPicks = picks.filter(
        (p) => p.round === round - 1 && p.conference === conference
      );
      return prevPicks
        .map((p) => {
          const seed = seeds.find((s) => s.team_id === p.picked_team_id);
          return seed || null;
        })
        .filter(Boolean);
    },
    [picks, eastSeeds, westSeeds, seeds]
  );

  // ─── Champion candidates (R3 East pick + R3 West pick) ────
  const getChampionCandidates = useCallback(() => {
    const r3Picks = picks.filter((p) => p.round === 3);
    return r3Picks
      .map((p) => {
        const seed = seeds.find((s) => s.team_id === p.picked_team_id);
        return seed || null;
      })
      .filter(Boolean);
  }, [picks, seeds]);

  // ─── Progress ─────────────────────────────────────────────
  const totalPicks = picks.length;
  const picksWithGames = picks.filter((p) => p.picked_games !== null).length;
  const isComplete = totalPicks === 15 && picksWithGames === 15;

  // ─── Validation for finalize ──────────────────────────────
  const getValidationErrors = useCallback(() => {
    const errors = [];
    if (totalPicks < 15) errors.push(`${15 - totalPicks} picks remaining`);
    const missingGames = picks.filter((p) => p.picked_games === null);
    if (missingGames.length > 0)
      errors.push(`${missingGames.length} picks need games prediction`);
    return errors;
  }, [picks, totalPicks]);

  // ─── Auto-save (debounced 30s) ────────────────────────────
  useEffect(() => {
    if (!dirty || readOnly || !activeBracketId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      savePicks();
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [dirty, picks, readOnly, activeBracketId]);

  // ─── Initial load ─────────────────────────────────────────
  useEffect(() => {
    if (!poolNumber || !isLoaded || !user) return;
    const init = async () => {
      setLoading(true);
      await loadPool();
      const data = await loadBrackets();
      // Select first bracket if available
      if (data.length > 0) {
        setActiveBracketId(data[0].id);
        const stored = (data[0].picks || []).map((p) => ({
          pick_type: p.pick_type,
          round: p.round,
          conference: p.conference,
          picked_team_id: p.picked_team_id,
          picked_games: p.picked_games,
          auto: false,
        }));
        setPicks(stored);
      }
      setLoading(false);
    };
    init();
  }, [poolNumber, isLoaded, user]);

  // ─── Join pool ────────────────────────────────────────────
  const joinPool = useCallback(
    async (password = '') => {
      try {
        const res = await axios.post('/api/playoff-pools/join', {
          pool_number: poolNumber,
          password,
        });
        await loadPool();
        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.message || 'Failed to join pool',
        };
      }
    },
    [poolNumber, axios, loadPool]
  );

  return {
    pool,
    participant,
    brackets,
    activeBracket,
    activeBracketId,
    picks,
    loading,
    error,
    saving,
    dirty,
    isLocked,
    isFinalized,
    readOnly,
    seeds,
    eastSeeds,
    westSeeds,
    seedMap,
    totalPicks,
    picksWithGames,
    isComplete,
    selectBracket,
    createBracket,
    renameBracket,
    savePicks,
    finalizeBracket,
    togglePick,
    isCapReached,
    setGames,
    selectMatchupWinner,
    getMatchups,
    pickChampion,
    confirmChampionReplace,
    getPicksForRound,
    getCandidates,
    getChampionCandidates,
    getValidationErrors,
    joinPool,
    loadPool,
  };
};

export default usePlayoffPool;
