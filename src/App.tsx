import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Gamepad2,
} from 'lucide-react';
import { sound } from './game/audio';
import {
  drawMonsterCharacter,
  drawMonsterNPC,
  drawChest,
  drawDoor,
  createConfettiParticle,
  ConfettiParticle,
} from './game/sprites';

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  type?: 'ground' | 'floating' | 'goal';
}

interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  instruction: string;
  platforms: Platform[];
  door?: { x: number; y: number; w: number; h: number };
  chest?: { x: number; y: number; w: number; h: number };
  spawn: { x: number; y: number };
  pitY: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playable Character & Level State
  const selectedCharacter = 'dude';
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Virtual Canvas Dimensions
  const V_WIDTH = 800;
  const V_HEIGHT = 450;

  // Active Keys State Ref
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
  });

  // Player state ref
  const playerRef = useRef({
    x: 70,
    y: 330,
    w: 32,
    h: 34,
    vx: 0,
    vy: 0,
    speed: 4.2,
    jumpForce: -11.6,
    gravity: 0.55,
    onGround: false,
    facing: 'right' as 'left' | 'right',
    animState: 'idle' as 'idle' | 'walk' | 'jump',
    animFrame: 0,
  });

  // Game state ref
  const gameStateRef = useRef({
    level: 1,
    characterId: 'dude' as 'dude' | 'pink' | 'owlet',
    chestOpened: false,
    confetti: [] as ConfettiParticle[],
    messageAlpha: 0,
    frameCounter: 0,
  });

  // Sync selected character to game state ref
  useEffect(() => {
    gameStateRef.current.characterId = selectedCharacter;
  }, [selectedCharacter]);

  // Level definitions
  const levels: Record<number, LevelConfig> = {
    1: {
      id: 1,
      title: 'NIVEL 1: TUTORIAL',
      subtitle: 'Aprende los controles básicos',
      instruction: 'Usa Flechas para moverte y ESPACIO para saltar',
      platforms: [
        { x: 40, y: 380, w: 720, h: 50, color: '#166534', type: 'ground' },
        { x: 300, y: 290, w: 150, h: 22, color: '#854d0e', type: 'floating' },
      ],
      door: { x: 700, y: 310, w: 44, h: 70 },
      spawn: { x: 70, y: 330 },
      pitY: 460,
    },
    2: {
      id: 2,
      title: 'NIVEL 2: DESAFÍO',
      subtitle: '¡Cuidado con el foso!',
      instruction: 'Salta con precisión entre las 3 plataformas elevadas. ¡Si caes, reiniciarás el nivel!',
      platforms: [
        { x: 40, y: 360, w: 140, h: 24, color: '#15803d', type: 'floating' },
        { x: 260, y: 280, w: 150, h: 24, color: '#15803d', type: 'floating' },
        { x: 490, y: 220, w: 150, h: 24, color: '#15803d', type: 'floating' },
        { x: 690, y: 190, w: 85, h: 24, color: '#334155', type: 'goal' },
      ],
      door: { x: 710, y: 120, w: 44, h: 70 },
      spawn: { x: 60, y: 310 },
      pitY: 425, // Foso abisal
    },
    3: {
      id: 3,
      title: 'NIVEL 3: GRAN FINAL',
      subtitle: '¡La fiesta de cumpleaños!',
      instruction: 'Tus dos amigos te están esperando... ¡Acércate y toca el cofre sorpresa!',
      platforms: [
        { x: 40, y: 380, w: 720, h: 50, color: '#78350f', type: 'ground' },
      ],
      chest: { x: 376, y: 334, w: 48, h: 46 },
      spawn: { x: 80, y: 330 },
      pitY: 460,
    },
  };

  // Determine the 2 NPC characters for Level 3 (the other two monsters!)
  const allMonsters: ('dude' | 'pink' | 'owlet')[] = ['dude', 'pink', 'owlet'];
  const npcCharacters = allMonsters.filter((m) => m !== selectedCharacter);
  const npc1 = npcCharacters[0] || 'pink';
  const npc2 = npcCharacters[1] || 'owlet';

  // Load level
  const loadLevel = (lvlId: number) => {
    const lvl = levels[lvlId] || levels[1];
    gameStateRef.current.level = lvl.id;
    gameStateRef.current.chestOpened = false;
    gameStateRef.current.messageAlpha = 0;
    gameStateRef.current.confetti = [];

    playerRef.current.x = lvl.spawn.x;
    playerRef.current.y = lvl.spawn.y;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.onGround = false;

    setCurrentLevel(lvl.id);
  };

  // Sound toggle
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sound.setEnabled(nextVal);
  };

  // Spawn confetti explosion
  const triggerConfettiExplosion = (count = 180) => {
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      const p = createConfettiParticle(V_WIDTH);
      p.x = V_WIDTH / 2 + (Math.random() - 0.5) * 100;
      p.y = 310;
      p.vx = (Math.random() - 0.5) * 14;
      p.vy = -6 - Math.random() * 10;
      newParticles.push(p);
    }
    gameStateRef.current.confetti.push(...newParticles);
  };

  // Download Standalone Single-file index.html
  const handleDownloadStandalone = () => {
    fetch('/minijuego.html')
      .then((res) => res.text())
      .then((content) => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        window.open('/minijuego.html', '_blank');
      });
  };

  // KEYBOARD LISTENERS
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (soundEnabled) sound.setEnabled(true);

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        inputRef.current.jump = true;
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        loadLevel(gameStateRef.current.level);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = false;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        inputRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [soundEnabled]);

  // MAIN GAME ENGINE LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      // Schedule next frame unconditionally at the start so the loop never dies
      animId = requestAnimationFrame(gameLoop);

      const p = playerRef.current;
      const g = gameStateRef.current;
      const input = inputRef.current;
      const lvl = levels[g.level] || levels[1];

      g.frameCounter++;
      p.animFrame++;

      // 1. UPDATE HORIZONTAL MOVEMENT
      if (input.left && !input.right) {
        p.vx = -p.speed;
        p.facing = 'left';
      } else if (input.right && !input.left) {
        p.vx = p.speed;
        p.facing = 'right';
      } else {
        p.vx = 0;
      }

      // 2. UPDATE JUMPING
      if (input.jump && p.onGround) {
        p.vy = p.jumpForce;
        p.onGround = false;
        sound.playJump();
      }

      // 3. APPLY GRAVITY & UPDATE POSITION
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      // 4. BOUNDS CHECK
      if (p.x < 10) p.x = 10;
      if (p.x + p.w > V_WIDTH - 10) p.x = V_WIDTH - 10 - p.w;

      // 5. PLATFORM COLLISIONS (AABB One-way top collisions)
      p.onGround = false;
      for (const plat of lvl.platforms) {
        if (
          p.x + p.w > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.h >= plat.y &&
          p.y + p.h <= plat.y + 15 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }

      // 6. ANIMATION STATE
      if (!p.onGround) {
        p.animState = 'jump';
      } else if (Math.abs(p.vx) > 0.1) {
        p.animState = 'walk';
      } else {
        p.animState = 'idle';
      }

      // 7. LEVEL 2 PITFALL CHECK (Abyss / Fall detection)
      if (p.y > lvl.pitY) {
        sound.playFall();
        loadLevel(g.level);
        return;
      }

      // 8. DOOR COLLISION (Levels 1 & 2 -> Advance to next level seamlessly)
      if (lvl.door) {
        const d = lvl.door;
        if (
          p.x + p.w > d.x &&
          p.x < d.x + d.w &&
          p.y + p.h > d.y &&
          p.y < d.y + d.h
        ) {
          sound.playDoor();
          const nextLvl = g.level + 1;
          loadLevel(nextLvl);
          return;
        }
      }

      // 9. CHEST COLLISION (Level 3 - Treasure reached!)
      if (g.level === 3 && lvl.chest && !g.chestOpened) {
        const c = lvl.chest;
        if (
          p.x + p.w > c.x &&
          p.x < c.x + c.w &&
          p.y + p.h > c.y &&
          p.y < c.y + c.h
        ) {
          g.chestOpened = true;
          sound.playChestOpen();
          setTimeout(() => {
            sound.playBirthdayMelody();
          }, 350);
          triggerConfettiExplosion(220);
        }
      }

      // 10. UPDATE CONFETTI PARTICLES
      for (let i = g.confetti.length - 1; i >= 0; i--) {
        const cp = g.confetti[i];
        cp.vy += 0.08;
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.rotation += cp.vRot;
        cp.life++;

        if (cp.life > cp.maxLife || cp.y > V_HEIGHT + 30) {
          if (g.chestOpened && Math.random() < 0.25) {
            cp.y = -20;
            cp.x = Math.random() * V_WIDTH;
            cp.vy = 2 + Math.random() * 3.5;
            cp.life = 0;
          } else {
            g.confetti.splice(i, 1);
          }
        }
      }

      if (g.chestOpened && g.messageAlpha < 1) {
        g.messageAlpha = Math.min(1, g.messageAlpha + 0.025);
      }

      // -------------------------------------------------------------
      // RENDERING SECTION
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

      // A. Atmosphere by Level
      if (g.level === 1) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.7, '#1e293b');
        bgGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.arc(140, 110, 50, 0, Math.PI * 2);
        ctx.arc(180, 95, 60, 0, Math.PI * 2);
        ctx.arc(230, 110, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(580, 80, 40, 0, Math.PI * 2);
        ctx.arc(620, 70, 50, 0, Math.PI * 2);
        ctx.arc(660, 80, 40, 0, Math.PI * 2);
        ctx.fill();
      } else if (g.level === 2) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
        bgGrad.addColorStop(0, '#180d24');
        bgGrad.addColorStop(0.7, '#2e1065');
        bgGrad.addColorStop(1, '#450a0a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        const pitGlow = ctx.createLinearGradient(0, 385, 0, V_HEIGHT);
        pitGlow.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
        pitGlow.addColorStop(0.4, 'rgba(220, 38, 38, 0.7)');
        pitGlow.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = pitGlow;
        ctx.fillRect(0, 385, V_WIDTH, V_HEIGHT - 385);

        ctx.fillStyle = '#ef4444';
        for (let x = 10; x < V_WIDTH; x += 28) {
          ctx.beginPath();
          ctx.moveTo(x, V_HEIGHT);
          ctx.lineTo(x + 14, V_HEIGHT - 26);
          ctx.lineTo(x + 28, V_HEIGHT);
          ctx.fill();
        }
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.6, '#312e81');
        bgGrad.addColorStop(1, '#1e1136');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        const garlandColors = ['#f43f5e', '#3b82f6', '#facc15', '#10b981', '#a855f7', '#fb923c'];
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(30, 32);
        ctx.quadraticCurveTo(V_WIDTH / 2, 50, V_WIDTH - 30, 32);
        ctx.stroke();

        for (let i = 0; i < 17; i++) {
          const gx = 45 + i * 42;
          const gy = 34 + Math.sin((i / 16) * Math.PI) * 12;
          ctx.fillStyle = garlandColors[i % garlandColors.length];
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + 32, gy);
          ctx.lineTo(gx + 16, gy + 28);
          ctx.closePath();
          ctx.fill();
        }
      }

      // B. Platforms
      for (const plat of lvl.platforms) {
        ctx.fillStyle = plat.color;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(plat.x, plat.y, plat.w, 4);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(plat.x, plat.y + plat.h - 4, plat.w, 4);

        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      }

      // C. Door (Levels 1 & 2)
      if (lvl.door) {
        drawDoor(ctx, lvl.door.x, lvl.door.y, lvl.door.w, lvl.door.h, g.frameCounter);
      }

      // D. Level 3 Party Hall: Two Monster NPCs appear ONLY when treasure is reached!
      if (g.level === 3) {
        // The last two characters are hidden until the player opens the treasure chest!
        if (g.chestOpened) {
          // NPC 1: Left monster with balloons cheering and facing right towards chest!
          drawMonsterNPC(
            ctx,
            230,
            346,
            32,
            34,
            npc1,
            g.frameCounter,
            '¡Sorpresa!',
            true,
            true,
            'right'
          );

          // NPC 2: Right monster with balloons cheering and facing left towards chest!
          drawMonsterNPC(
            ctx,
            530,
            346,
            32,
            34,
            npc2,
            g.frameCounter,
            '¡Feliz Cumple!',
            true,
            true,
            'left'
          );
        }

        // Birthday Chest
        if (lvl.chest) {
          drawChest(
            ctx,
            lvl.chest.x,
            lvl.chest.y,
            lvl.chest.w,
            lvl.chest.h,
            g.chestOpened,
            g.frameCounter
          );
        }
      }

      // E. Render Player Monster
      drawMonsterCharacter(
        ctx,
        p.x,
        p.y,
        p.w,
        p.h,
        g.characterId,
        p.facing,
        p.animState,
        p.animFrame
      );

      // F. Render Confetti
      for (const cp of g.confetti) {
        ctx.save();
        ctx.translate(cp.x, cp.y);
        ctx.rotate(cp.rotation);
        ctx.fillStyle = cp.color;

        if (cp.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, cp.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (cp.shape === 'star') {
          ctx.fillRect(-cp.size / 2, -1.5, cp.size, 3);
          ctx.fillRect(-1.5, -cp.size / 2, 3, cp.size);
        } else {
          ctx.fillRect(-cp.size / 2, -cp.size / 3, cp.size, (cp.size * 2) / 3);
        }

        ctx.restore();
      }

      // G. Dynamic Level HUD & In-game Instructions
      ctx.textAlign = 'center';
      if (g.level === 1) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(lvl.instruction, V_WIDTH / 2, 65);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('👉 Llega a la puerta de la derecha para avanzar al siguiente nivel', V_WIDTH / 2, 92);
      } else if (g.level === 2) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(lvl.instruction, V_WIDTH / 2, 65);
      } else if (g.level === 3) {
        if (!g.chestOpened) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('¡Toca el cofre dorado en el centro de la sala!', V_WIDTH / 2, 85);

          const bounce = Math.sin(g.frameCounter * 0.1) * 6;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(V_WIDTH / 2, 285 + bounce);
          ctx.lineTo(V_WIDTH / 2 - 12, 270 + bounce);
          ctx.lineTo(V_WIDTH / 2 + 12, 270 + bounce);
          ctx.closePath();
          ctx.fill();
        } else {
          // CELEBRATION OVERLAY BANNER
          ctx.save();
          ctx.globalAlpha = g.messageAlpha;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(V_WIDTH / 2 - 270, 40, 540, 115, 14);
          ctx.fill();

          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 26px "Press Start 2P", monospace';
          ctx.fillText('¡FELIZ CUMPLEAÑOS!', V_WIDTH / 2, 90);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('🎉 ¡Que todos tus sueños y deseos se hagan realidad! 🎂', V_WIDTH / 2, 126);

          ctx.restore();
        }
      }
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [npc1, npc2]);

  // Touch control handlers
  const handleTouchStart = (key: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (soundEnabled) sound.setEnabled(true);
    inputRef.current[key] = true;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  };

  const handleTouchEnd = (key: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    inputRef.current[key] = false;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Top Discreet Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-3 mb-2 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            Plataformas Cumpleaños 2D
          </span>
        </div>

        {/* Discreet Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-rose-950/40 border-rose-900/50 text-rose-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Sonido' : 'Silencio'}</span>
          </button>

          {/* Reset Current Level */}
          <button
            onClick={() => loadLevel(currentLevel)}
            title="Reiniciar Nivel actual"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>Reiniciar</span>
          </button>

          {/* Download index.html */}
          <button
            onClick={handleDownloadStandalone}
            title="Descargar minijuego en un solo archivo index.html"
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white text-xs font-semibold transition-all shadow flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar index.html</span>
          </button>
        </div>
      </header>

      {/* Main Game Arcade Screen */}
      <main className="w-full max-w-4xl flex flex-col items-center">
        {/* Game Canvas Container */}
        <div className="relative w-full aspect-[16/9] bg-slate-900 border-2 border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={V_WIDTH}
            height={V_HEIGHT}
            className="game-canvas w-full h-full block"
          />

          {/* Overlay Top Level Badge & Selector */}
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1 bg-slate-950/80 border border-slate-700/60 rounded-lg text-xs font-bold text-slate-200 backdrop-blur-sm shadow flex items-center gap-2">
              <span className="text-amber-400">●</span>
              <span>{levels[currentLevel]?.title || `NIVEL ${currentLevel}`}</span>
            </div>

            <div className="flex items-center gap-1 pointer-events-auto bg-slate-950/80 border border-slate-800/80 p-1 rounded-lg backdrop-blur-sm">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => loadLevel(lvl)}
                  className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                    currentLevel === lvl
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Nivel {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile On-Screen Virtual Touch Buttons */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between pointer-events-none z-10">
            {/* D-Pad Horizontal Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onTouchStart={handleTouchStart('left')}
                onTouchEnd={handleTouchEnd('left')}
                onMouseDown={handleTouchStart('left')}
                onMouseUp={handleTouchEnd('left')}
                onMouseLeave={handleTouchEnd('left')}
                className="touch-btn w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/85 hover:bg-slate-700 border-2 border-slate-600 active:bg-sky-500 active:border-sky-400 active:scale-95 text-white font-bold text-xl flex items-center justify-center backdrop-blur-md shadow-lg"
                aria-label="Mover a la izquierda"
              >
                ◀
              </button>
              <button
                onTouchStart={handleTouchStart('right')}
                onTouchEnd={handleTouchEnd('right')}
                onMouseDown={handleTouchStart('right')}
                onMouseUp={handleTouchEnd('right')}
                onMouseLeave={handleTouchEnd('right')}
                className="touch-btn w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/85 hover:bg-slate-700 border-2 border-slate-600 active:bg-sky-500 active:border-sky-400 active:scale-95 text-white font-bold text-xl flex items-center justify-center backdrop-blur-md shadow-lg"
                aria-label="Mover a la derecha"
              >
                ▶
              </button>
            </div>

            {/* Jump Action Button */}
            <div className="pointer-events-auto flex flex-col items-center gap-1">
              <button
                onTouchStart={handleTouchStart('jump')}
                onTouchEnd={handleTouchEnd('jump')}
                onMouseDown={handleTouchStart('jump')}
                onMouseUp={handleTouchEnd('jump')}
                onMouseLeave={handleTouchEnd('jump')}
                className="touch-btn px-5 h-14 sm:h-16 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 border-2 border-emerald-400 active:bg-emerald-400 active:scale-95 text-white font-extrabold text-sm sm:text-base flex items-center justify-center backdrop-blur-md shadow-lg tracking-wide uppercase"
                aria-label="Saltar"
              >
                ⬆ SALTO
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
