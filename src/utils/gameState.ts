/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, DailyLogItem, LeaderboardEntry } from '../types';
import { syncLeaderboard } from '../firebase-config';

const LOCAL_STORAGE_KEY = 'jovan_infinite_spire_state_v1';

export const INITIAL_STATE: GameState = {
  heroName: 'Jovan',
  currentFloor: 1,
  hp: 5,
  maxHp: 5,
  goldCoins: 0,
  dailyLog: [],
  totalXP: 0,
  dFactorSlope: 0.2,
  maxFloorReached: 1,
  limitBreakBar: 0,
  equippedPetId: null,
  capturedPetIds: [],
  selectedJobId: 'warrior'
};

/**
 * Loads game state from LocalStorage, initializing if missing.
 */
export function loadGameState(): GameState {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure all fields are filled
      return {
        ...INITIAL_STATE,
        ...parsed,
        hp: parsed.hp !== undefined ? parsed.hp : 5, // Avoid spawning dead
        dFactorSlope: parsed.dFactorSlope !== undefined ? parsed.dFactorSlope : 0.2,
        maxFloorReached: parsed.maxFloorReached !== undefined ? parsed.maxFloorReached : Math.max(parsed.currentFloor || 1, 1),
        limitBreakBar: parsed.limitBreakBar !== undefined ? parsed.limitBreakBar : 0,
        equippedPetId: parsed.equippedPetId !== undefined ? parsed.equippedPetId : null,
        capturedPetIds: parsed.capturedPetIds !== undefined ? parsed.capturedPetIds : [],
        selectedJobId: parsed.selectedJobId !== undefined ? parsed.selectedJobId : 'warrior'
      };
    }
  } catch (err) {
    console.error("Failed to read game state from LocalStorage:", err);
  }
  return { ...INITIAL_STATE };
}

/**
 * Saves state locally and triggers Firestore leaderboard synchronizations.
 */
export async function saveAndSyncGameState(state: GameState): Promise<GameState> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to write game state to LocalStorage:", err);
  }

  // Calculate rolling weekly XP (last 7 days)
  const weeklyXP = calculateWeeklyXP(state.dailyLog);

  // Sync to database
  const entry: LeaderboardEntry = {
    name: state.heroName || 'Jovan',
    xp: state.totalXP,
    weeklyXP,
    maxFloorReached: state.maxFloorReached || 1,
    goldCoins: state.goldCoins,
    updatedAt: new Date().toISOString()
  };

  // Run async sync (errors caught inside helper)
  await syncLeaderboard(entry);

  return state;
}

/**
 * Appends learning XP to the rolling calendar log and recalculates current sums.
 * This is a pure function that also updates maxFloorReached based on the new floor state.
 */
export function awardXP(state: GameState, xpAmount: number): GameState {
  const isDolphin = state.equippedPetId === 'pet_10';
  const finalXp = isDolphin ? xpAmount * 2 : xpAmount;

  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logMap = new Map<string, number>();

  for (const item of state.dailyLog) {
    logMap.set(item.date, item.xp);
  }

  const existingXP = logMap.get(todayStr) || 0;
  logMap.set(todayStr, existingXP + finalXp);

  const updatedLog: DailyLogItem[] = Array.from(logMap.entries()).map(([date, xp]) => ({
    date,
    xp
  }));

  const maxFloor = Math.max(state.maxFloorReached || 1, state.currentFloor);

  return {
    ...state,
    totalXP: state.totalXP + finalXp,
    dailyLog: updatedLog,
    maxFloorReached: maxFloor
  };
}

/**
 * Calculates rolling 7 days sum of XP starting from today (today + 6 past days).
 */
export function calculateWeeklyXP(dailyLog: DailyLogItem[]): number {
  const todayStr = new Date().toISOString().split('T')[0];
  const logMap = new Map<string, number>();

  for (const item of dailyLog) {
    logMap.set(item.date, item.xp);
  }

  const today = new Date(todayStr);
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    total += logMap.get(dateKey) || 0;
  }

  return total;
}
