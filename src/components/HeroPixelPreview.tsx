import { useEffect, useRef } from 'react';

interface HeroPixelPreviewProps {
  jobId: string;
  size?: number;
  className?: string;
}

export default function HeroPixelPreview({ jobId, size = 64, className = "" }: HeroPixelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, 48, 48);

    // Default values matching DungeonScene.ts
    let bodyColor = '#3b82f6'; // Blue warrior plate
    let hairColor = '#eab308'; // Golden blond
    let hairHighlightColor = '#fef08a';
    let skinColor = '#fed7aa'; // Peach skin
    let rightWeaponColor = '#cbd5e1';
    let rightWeaponHandleColor = '#ea580c';
    let hasShield = false;
    let hasConicalHat = false;
    let conicalHatColor = '#581c87';
    let conicalHatTrimColor = '#c084fc';
    let hasHalo = false;
    let isStout = false; // Dwarf has wider, shorter body
    let hasBeard = false;
    let beardColor = '#ea580c';
    let eyesColor = '#0f172a';

    // Customize values based on jobId
    if (jobId === 'warrior') {
      bodyColor = '#3b82f6'; // blue armor
      hairColor = '#fbbf24'; // blonde
      hairHighlightColor = '#fef08a';
      hasShield = true;
    } else if (jobId === 'samurai') {
      bodyColor = '#b91c1c'; // deep red
      hairColor = '#111827'; // black
      hairHighlightColor = '#374151';
      rightWeaponColor = '#f8fafc'; // gleaming steel katana
      rightWeaponHandleColor = '#111827';
    } else if (jobId === 'dwarf') {
      bodyColor = '#b45309'; // copper/bronze mail
      hairColor = '#d97706'; // ginger hair
      hairHighlightColor = '#f59e0b';
      isStout = true;
      hasBeard = true;
      beardColor = '#ea580c';
      rightWeaponColor = '#94a3b8'; // big twin iron axe
      rightWeaponHandleColor = '#78350f';
    } else if (jobId === 'mage') {
      bodyColor = '#6b21a8'; // purple robes
      hairColor = '#e2e8f0'; // silver white hair
      hairHighlightColor = '#ffffff';
      hasConicalHat = true;
      conicalHatColor = '#581c87';
      conicalHatTrimColor = '#c084fc';
      rightWeaponColor = '#38bdf8'; // azure glowing wand orb
      rightWeaponHandleColor = '#78350f'; // wooden staff
    } else if (jobId === 'warlock') {
      bodyColor = '#1e1b4b'; // dark void purple robe
      hairColor = '#a855f7'; // violet spiky hair
      hairHighlightColor = '#e9d5ff';
      hasConicalHat = true;
      conicalHatColor = '#0f172a'; // void black hat
      conicalHatTrimColor = '#22c55e'; // lime green trim
      rightWeaponColor = '#a3e635'; // acidic green spellbook glow
      rightWeaponHandleColor = '#1e1b4b';
    } else if (jobId === 'cleric') {
      bodyColor = '#f8fafc'; // pure white robes
      hairColor = '#78350f'; // soft brown hair
      hairHighlightColor = '#b45309';
      hasHalo = true;
      rightWeaponColor = '#facc15'; // golden cross staff
      rightWeaponHandleColor = '#eab308';
    } else if (jobId === 'thief') {
      bodyColor = '#064e3b'; // dark forest green leather
      hairColor = '#7c2d12'; // auburn hair
      hairHighlightColor = '#ba5911';
      rightWeaponColor = '#94a3b8'; // dual silver daggers
      rightWeaponHandleColor = '#111827';
    } else if (jobId === 'dancer') {
      bodyColor = '#db2777'; // ruby pink dance dress
      hairColor = '#f472b6'; // pink flowing hair
      hairHighlightColor = '#fbcfe8';
      rightWeaponColor = '#ec4899'; // pink silk fan
      rightWeaponHandleColor = '#fbbf24'; // gold fan handle
    } else if (jobId === 'archer') {
      bodyColor = '#16a34a'; // emerald green outfit
      hairColor = '#84cc16'; // lime hair
      hairHighlightColor = '#bef264';
      rightWeaponColor = '#a16207'; // wooden longbow
      rightWeaponHandleColor = '#eab308';
    } else if (jobId === 'sage') {
      bodyColor = '#1d4ed8'; // deep sapphire robe
      hairColor = '#cbd5e1'; // long white sage beard & hair
      hairHighlightColor = '#f1f5f9';
      hasBeard = true;
      beardColor = '#cbd5e1';
      rightWeaponColor = '#ffffff'; // glowing ancient tome
      rightWeaponHandleColor = '#b45309'; // leather book binding
    }

    // 1. Draw Body/Robes/Armor
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    if (isStout) {
      ctx.arc(24, 29, 14, 0, Math.PI * 2);
    } else {
      ctx.arc(24, 26, 12, 0, Math.PI * 2);
    }
    ctx.fill();

    // 2. Draw Hair (back & crown)
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(24, 18, 11, Math.PI, 0);
    ctx.fill();

    // Hair highlights
    ctx.fillStyle = hairHighlightColor;
    ctx.fillRect(14, 17, 20, 3);

    // 3. Draw Face (skin)
    ctx.fillStyle = skinColor;
    if (isStout) {
      ctx.fillRect(15, 22, 18, 6);
    } else {
      ctx.fillRect(16, 21, 16, 6);
    }

    // 4. Draw Beard
    if (hasBeard) {
      ctx.fillStyle = beardColor;
      ctx.fillRect(15, 26, 18, 8);
      ctx.fillRect(13, 22, 2, 6);
      ctx.fillRect(33, 22, 2, 6);
    }

    // 5. Draw Eyes
    ctx.fillStyle = eyesColor;
    ctx.fillRect(18, 22, 3, 3);
    ctx.fillRect(27, 22, 3, 3);

    // Pupil glints
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 22, 1, 1);
    ctx.fillRect(27, 22, 1, 1);

    // Pink Cheeks
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(15, 25, 2, 2);
    ctx.fillRect(31, 25, 2, 2);

    // 6. Conical wizard/warlock hat
    if (hasConicalHat) {
      ctx.fillStyle = conicalHatColor;
      ctx.fillRect(10, 12, 28, 4);
      
      ctx.beginPath();
      ctx.moveTo(12, 12);
      ctx.lineTo(24, 0);
      ctx.lineTo(36, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = conicalHatTrimColor;
      ctx.fillRect(14, 11, 20, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(23, 8, 3, 3);
    }

    // 7. Halo
    if (hasHalo) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(24, 6, 8, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8. Shield
    if (hasShield) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 18, 5, 12);
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, 20, 1, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(5, 18, 1, 12);
      ctx.fillRect(11, 18, 1, 12);
      ctx.fillRect(5, 17, 7, 1);
      ctx.fillRect(5, 30, 7, 1);
    }

    // 9. Weapons
    if (jobId === 'warrior') {
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(36, 12, 3, 16);
      ctx.fillStyle = '#475569';
      ctx.fillRect(34, 25, 7, 2);
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(37, 27, 1, 5);
    } else if (jobId === 'samurai') {
      ctx.strokeStyle = rightWeaponColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(35, 30);
      ctx.lineTo(44, 10);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(34, 28, 4, 2);
    } else if (jobId === 'dwarf') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(36, 12, 2, 20);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(32, 14, 4, 6);
      ctx.fillRect(38, 14, 4, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(31, 15, 1, 4);
      ctx.fillRect(42, 15, 1, 4);
    } else if (jobId === 'mage') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 12, 2, 20);
      ctx.fillStyle = rightWeaponColor;
      ctx.beginPath();
      ctx.arc(38, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (jobId === 'warlock') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 14, 2, 18);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(34, 8, 7, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(35, 9, 5, 4);
    } else if (jobId === 'cleric') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 12, 2, 20);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(34, 14, 8, 2);
      ctx.fillRect(37, 11, 2, 8);
    } else if (jobId === 'thief') {
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(37, 18, 2, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(36, 26, 4, 1);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(9, 18, 2, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(8, 26, 4, 1);
    } else if (jobId === 'dancer') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 24, 2, 6);
      ctx.fillStyle = rightWeaponColor;
      ctx.beginPath();
      ctx.arc(38, 21, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(35, 20, 6, 2);
    } else if (jobId === 'archer') {
      ctx.strokeStyle = rightWeaponColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(38, 22, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(38, 14);
      ctx.lineTo(38, 30);
      ctx.stroke();
    } else if (jobId === 'sage') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(33, 16, 10, 11);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(34, 17, 8, 9);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(38, 21, 2, 2);
    }
  }, [jobId]);

  return (
    <canvas 
      ref={canvasRef}
      width={48}
      height={48}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated'
      }}
      className={`rounded-lg bg-indigo-950/20 border border-indigo-900/40 shadow-inner ${className}`}
    />
  );
}
