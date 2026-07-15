/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PetData {
  id: string;
  name: string;
  emoji: string;
  element: 'Fire' | 'Water' | 'Ice' | 'Lightning' | 'Earth' | 'Poison' | 'Dark' | 'Light' | 'Gold' | 'Wind';
  skillName: string;
  skillDescription: string;
  effectType: 'defend_attack' | 'heal_hp' | 'extra_time' | 'provide_answer' | 'skip_question' | 'double_gold' | 'limit_boost' | 'reveal_map' | 'damage_doubler' | 'double_xp';
  isActive: boolean; // True if it is a manual/clickable skill, false if passive
}

export const PETS_DATABASE: PetData[] = [
  {
    id: 'pet_1',
    name: '金冠雷鳥 (Thunderbird)',
    emoji: '🦅⚡',
    element: 'Lightning',
    skillName: '避雷電網',
    skillDescription: '【手動點擊】百分之百抵擋下一次答錯造成的扣血傷害。（每趟登塔限用 1 次）',
    effectType: 'defend_attack',
    isActive: true
  },
  {
    id: 'pet_2',
    name: '翡翠樹蛙 (Treefrog)',
    emoji: '🐸🍃',
    element: 'Earth',
    skillName: '生命泉源',
    skillDescription: '【手動點擊】立刻恢復 1 點生命值（HP）。（每趟登塔限用 1 次）',
    effectType: 'heal_hp',
    isActive: true
  },
  {
    id: 'pet_3',
    name: '時之沙漏怪 (Hourglass Imp)',
    emoji: '⏳👾',
    element: 'Dark',
    skillName: '時間凝結',
    skillDescription: '【手動點擊】使目前答題倒數計時增加 15 秒（若為魔寵挑戰則重設 8 秒限時）。（每趟登塔限用 1 次）',
    effectType: 'extra_time',
    isActive: true
  },
  {
    id: 'pet_4',
    name: '智慧精靈 (Wisdom Fairy)',
    emoji: '🧚✨',
    element: 'Light',
    skillName: '預知眼眸',
    skillDescription: '【手動點擊】直接提供當前問題的正確答案，不用怕答錯！（每趟登塔限用 1 次）',
    effectType: 'provide_answer',
    isActive: true
  },
  {
    id: 'pet_5',
    name: '神祕飛毯 (Magic Carpet)',
    emoji: '🧹🧹',
    element: 'Wind',
    skillName: '空間躍遷',
    skillDescription: '【手動點擊】直接跳過當前問題並擊敗該怪物，安全通過！（每趟登塔限用 1 次）',
    effectType: 'skip_question',
    isActive: true
  },
  {
    id: 'pet_6',
    name: '招財福貓 (Lucky Cat)',
    emoji: '🐱🪙',
    element: 'Gold',
    skillName: '招財進寶',
    skillDescription: '【被動技能】每當通關或擊敗怪物時，額外獲得 +50% 金幣。',
    effectType: 'double_gold',
    isActive: false
  },
  {
    id: 'pet_7',
    name: '神聖小馬 (Holy Unicorn)',
    emoji: '🦄🌟',
    element: 'Light',
    skillName: '極限共鳴',
    skillDescription: '【被動技能】答對問題時，有 50% 機率使 Limit Break 極限爆發 Bar 額外增加 1 點！',
    effectType: 'limit_boost',
    isActive: false
  },
  {
    id: 'pet_8',
    name: '探險倉鼠 (Scout Hamster)',
    emoji: '🐹🗺️',
    element: 'Earth',
    skillName: '地圖透視',
    skillDescription: '【被動技能】進入新塔層時，永久顯露全地圖的傳送門、商人和寶箱（無視迷霧）。',
    effectType: 'reveal_map',
    isActive: false
  },
  {
    id: 'pet_9',
    name: '烈焰獅王 (Lava Lion)',
    emoji: '🦁🔥',
    element: 'Fire',
    skillName: '爆炎重擊',
    skillDescription: '【手動點擊】下一次回答正確時，對怪物或 Boss 造成的傷害翻倍！（每趟登塔限用 1 次）',
    effectType: 'damage_doubler',
    isActive: true
  },
  {
    id: 'pet_10',
    name: '小智商海豚 (Smart Dolphin)',
    emoji: '🐬🌊',
    element: 'Water',
    skillName: '聰明過人',
    skillDescription: '【被動技能】戰鬥與過關獲得的所有經驗值（XP）加倍 (+100% XP)！',
    effectType: 'double_xp',
    isActive: false
  }
];

export function getPetById(id: string): PetData | undefined {
  return PETS_DATABASE.find(p => p.id === id);
}
