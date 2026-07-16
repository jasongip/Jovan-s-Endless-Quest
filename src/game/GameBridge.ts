/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GameBridge = {
  currentScene: null as any,
  
  // Callbacks registered by React to update general state
  onMonsterCollide: null as ((
    monsterId: string, 
    questionType: 'math' | 'chinese' | 'english' | 'logic' | 'boss' | 'pet',
    monsterName?: string,
    isElite?: boolean,
    eliteMaxHp?: number,
    petDbId?: string
  ) => void) | null,
  
  onMerchantCollide: null as ((type: 'merchant' | 'elf' | 'campfire') => void) | null,
  onGoldGained: null as ((amount: number) => void) | null,
  onXPGained: null as ((amount: number) => void) | null,
  onPortalReached: null as (() => void) | null,
  onHpLost: null as ((amount: number) => void) | null,
  onHpHealed: null as ((amount: number) => void) | null,
  onLogUpdated: null as ((logMsg: string) => void) | null,

  // React calls this to pass quiz results back into Phaser
  resolveCombat: (correct: boolean, isDefeated?: boolean) => {
    if (GameBridge.currentScene && typeof GameBridge.currentScene.resolveCombat === 'function') {
      GameBridge.currentScene.resolveCombat(correct, isDefeated !== false);
    }
  },

  destroyMerchant: () => {
    if (GameBridge.currentScene && typeof GameBridge.currentScene.destroyMerchant === 'function') {
      GameBridge.currentScene.destroyMerchant();
    }
  },

  wipeAllMonsters: (noRewards?: boolean) => {
    if (GameBridge.currentScene && typeof GameBridge.currentScene.wipeAllMonsters === 'function') {
      GameBridge.currentScene.wipeAllMonsters(noRewards);
    }
  }
};
