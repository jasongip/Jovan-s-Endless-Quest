/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Job {
  id: string;
  name: string;
  englishName: string;
  emoji: string;
  skillName: string;
  skillDesc: string;
  unlockXP: number;
}

export const JOBS: Job[] = [
  {
    id: 'warrior',
    name: '劍士',
    englishName: 'Warrior',
    emoji: '⚔️',
    skillName: '盾牌防護',
    skillDesc: '每次進入塔，自動獲得一個一次性的「護盾」，可抵消一次答錯扣減 HP 的傷害。',
    unlockXP: 0,
  },
  {
    id: 'samurai',
    name: '武士',
    englishName: 'Samurai',
    emoji: '👤',
    skillName: '心眼',
    skillDesc: '當 HP 降到 1 點時，自動進入「看破」狀態，答題選項會永久剔除一個錯誤答案（變三選一），直到回復 HP。',
    unlockXP: 500,
  },
  {
    id: 'dwarf',
    name: '矮人',
    englishName: 'Dwarf',
    emoji: '⚒️',
    skillName: '重裝體魄',
    skillDesc: '角色最大生命值上限（Max HP）永久 +2，商店生命上限突破極限至 10。',
    unlockXP: 1000,
  },
  {
    id: 'mage',
    name: '法師',
    englishName: 'Mage',
    emoji: '🧙‍♂️',
    skillName: '時空傳送',
    skillDesc: '每次進塔有一次機會。答題時若完全不會，可點擊「時空傳送」直接傳送走怪獸（避戰），但不獲得金幣與 XP。',
    unlockXP: 1500,
  },
  {
    id: 'warlock',
    name: '黑魔導士',
    englishName: 'Warlock',
    emoji: '🔮',
    skillName: '靈魂抽取',
    skillDesc: '每次連續答對 3 題（Combo 3），自動吸取怪物魂魄，回復 1 點 HP。',
    unlockXP: 2000,
  },
  {
    id: 'cleric',
    name: '修士',
    englishName: 'Cleric',
    emoji: '🙏',
    skillName: '光輝治癒',
    skillDesc: '關卡內「流浪商店」的所有治療道具、回復 HP 服務，一律享有半價折扣。',
    unlockXP: 2500,
  },
  {
    id: 'thief',
    name: '盜賊',
    englishName: 'Thief',
    emoji: '🦊',
    skillName: '黃金瞳',
    skillDesc: '戰鬥勝利與拾起錢袋時，獲得的金幣 Gold Coins 🟡 額外增加 20%。',
    unlockXP: 2500,
  },
  {
    id: 'dancer',
    name: '舞者',
    englishName: 'Dancer',
    emoji: '💃',
    skillName: '輕盈步法',
    skillDesc: '關卡中寶箱與錢袋的出現機率提高，且每次生成時有 100% 機率多出一個古老寶箱！',
    unlockXP: 3000,
  },
  {
    id: 'archer',
    name: '弓箭手',
    englishName: 'Archer',
    emoji: '🏹',
    skillName: '精準偵察',
    skillDesc: '每次進塔有一次自動解答問題的機會（精準指出並自動提交正確答案）。',
    unlockXP: 3000,
  },
  {
    id: 'sage',
    name: '賢者',
    englishName: 'Sage',
    emoji: '📜',
    skillName: '真理之鑰',
    skillDesc: '每次擊敗 BOSS 關卡後，有 50% 機率使獲得的金幣與 XP 翻倍！',
    unlockXP: 3500,
  },
];

export function getJobById(id: string): Job | undefined {
  return JOBS.find(j => j.id === id);
}
