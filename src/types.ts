/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailyLogItem {
  date: string; // YYYY-MM-DD
  xp: number;   // XP earned on this day
}

export interface GameState {
  heroName: string;
  currentFloor: number;
  hp: number;
  maxHp: number;
  goldCoins: number;
  dailyLog: DailyLogItem[];
  totalXP: number; // Current total XP
  dFactorSlope?: number; // Dynamic difficulty scaling factor slope
  maxFloorReached?: number; // Highest floor reached
  limitBreakBar?: number; // 0 to 10
  equippedPetId?: string | null;
  capturedPetIds?: string[];
  selectedJobId?: string; // Selected Job/Class ID
}

export interface QuizQuestion {
  id: string;
  type: 'math' | 'chinese' | 'english' | 'logic';
  subtype?: string; // e.g. 'spelling', 'match', 'sentence_reorder', 'cloze', 'pronunciation', etc.
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  speechText?: string; // Optional text to read aloud using SpeechSynthesis
  speechLang?: string; // e.g., 'en-US', 'zh-HK'
  scrambledWords?: string[]; // For sentence reordering
  matchPairs?: { left: string; right: string }[]; // For English-Chinese vocabulary matching
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  weeklyXP: number;
  maxFloorReached: number;
  goldCoins: number;
  updatedAt: string;
}
