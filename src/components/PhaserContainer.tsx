/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { DungeonScene } from '../game/DungeonScene';
import { GameBridge } from '../game/GameBridge';

interface PhaserContainerProps {
  currentFloor: number;
  equippedPetId: string | null;
  selectedJobId?: string;
  devOverrides?: {
    petMode: string;
    eliteMode: string;
    chestMode: string;
  };
}

export default function PhaserContainer({ currentFloor, equippedPetId, selectedJobId, devOverrides }: PhaserContainerProps) {
  const gameRef = useRef<any>(null);
  const containerId = 'phaser-game-viewport';
  const [phaserReady, setPhaserReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: any = null;
    let attempts = 0;

    const checkPhaser = () => {
      if ((window as any).Phaser) {
        if (active) {
          setPhaserReady(true);
        }
      } else if (attempts < 50) {
        attempts++;
        timer = setTimeout(checkPhaser, 100);
      } else {
        if (active) {
          setLoadError("無法載入 Phaser 遊戲引擎，請檢查網路連接或刷新頁面。");
        }
      }
    };

    checkPhaser();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!phaserReady) return;
    // Prevent double-initialization in React 18+ strict mode
    if (gameRef.current) return;

    // Phaser 3 configuration
    const config = {
      type: (window as any).Phaser.AUTO, // Retrieve from loaded script tag
      width: 768, // 16 columns * 48px = 768px
      height: 480, // 10 rows * 48px = 480px
      parent: containerId,
      pixelArt: true, // Forces sharp retro rendering
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      // Allow scale manager to fit standard layouts nicely
      scale: {
        mode: (window as any).Phaser.Scale.FIT,
        autoCenter: (window as any).Phaser.Scale.CENTER_BOTH
      }
    };

    try {
      const phaserGame = new (window as any).Phaser.Game(config);
      gameRef.current = phaserGame;
      
      // Register and start scene with data in a single clean non-blocking call
      phaserGame.scene.add('DungeonScene', DungeonScene, true, { floor: currentFloor, equippedPetId, selectedJobId, devOverrides });
    } catch (err) {
      console.error("Failed to initialize Phaser 3 Game instance:", err);
      setLoadError("初始化遊戲失敗，請重新整理網頁。");
    }

    return () => {
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (e) {
          console.warn("Error destroying Phaser game instance:", e);
        }
        gameRef.current = null;
        GameBridge.currentScene = null;
      }
    };
  }, [phaserReady]);

  // Smoothly trigger a Phaser scene restart instead of reloading the entire canvas wrapper
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene) {
      const activeScene = gameRef.current.scene.getScene('DungeonScene');
      if (activeScene && gameRef.current.scene.isActive('DungeonScene')) {
        activeScene.scene.restart({ floor: currentFloor, equippedPetId, selectedJobId, devOverrides });
      }
    }
  }, [currentFloor, equippedPetId, selectedJobId, devOverrides]);

  return (
    <div className="relative w-full flex items-center justify-center p-2 bg-slate-950/40 rounded-2xl border-4 border-slate-700/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Decorative scanner line simulation */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/2 to-transparent h-[10%] animate-pulse z-10" />
      
      {/* Loading state indicator */}
      {!phaserReady && !loadError && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white font-mono z-20">
          <span className="text-3xl animate-spin mb-4">🌀</span>
          <span className="text-sm text-slate-400">正在加載復古 8-bit 冒險世界...</span>
        </div>
      )}

      {/* Error state indicator */}
      {loadError && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-red-400 font-mono z-20 p-4 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <span className="text-sm font-bold mb-2">{loadError}</span>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition text-xs mt-2"
          >
            重新整理網頁
          </button>
        </div>
      )}

      {/* Phaser Canvas Holder */}
      <div 
        id={containerId} 
        className="w-full h-auto max-h-[280px] xs:max-h-[320px] sm:max-h-[340px] md:max-h-[360px] lg:max-h-[380px] xl:max-h-[440px] aspect-[16/10] bg-slate-950 rounded-lg overflow-hidden mx-auto"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
