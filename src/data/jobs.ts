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
    id: 'cleric',
    name: '修士',
    englishName: 'Cleric',
    emoji: '🙏',
    skillName: '神聖恩賜',
    skillDesc: '關卡內「流浪商店」的所有道具與回復生命值服務，一律費用全免（0金幣）。',
    unlockXP: 2500,
  },
  {
    id: 'thief',
    name: '盜賊',
    englishName: 'Thief',
    emoji: '🦊',
    skillName: '神偷秘藥',
    skillDesc: '打倒精英怪時，必定能從怪物身上順手牽羊，偷到一瓶「回復藥」自動回復 1 點生命值 ❤️。',
    unlockXP: 3000,
  },
  {
    id: 'dancer',
    name: '舞者',
    englishName: 'Dancer',
    emoji: '💃',
    skillName: '獻祭之舞',
    skillDesc: '答題時，可選擇扣除 1 點生命值跳過避開當前問題，可重複使用直至體力耗盡死亡 💃。',
    unlockXP: 3500,
  },
  {
    id: 'archer',
    name: '弓箭手',
    englishName: 'Archer',
    emoji: '🏹',
    skillName: '雙重鷹眼',
    skillDesc: '每場冒險有 10 次機會，可發動鷹眼專注將答題選項直接變成「二選一」（排除兩個錯誤解答）。',
    unlockXP: 4000,
  },
  {
    id: 'sage',
    name: '賢者',
    englishName: 'Sage',
    emoji: '📜',
    skillName: '破魔聖言',
    skillDesc: '進入 BOSS 關卡時，BOSS 的初始生命值直接減少 1 點 💥。',
    unlockXP: 4500,
  },
  {
    id: 'warlock',
    name: '黑魔導士',
    englishName: 'Warlock',
    emoji: '🔮',
    skillName: '靈魂抽取',
    skillDesc: '每次連續答對 3 題（Combo 3），自動吸取怪物魂魄，回復 1 點 HP。',
    unlockXP: 5000,
  },
];

export function getJobById(id: string): Job | undefined {
  return JOBS.find(j => j.id === id);
}
