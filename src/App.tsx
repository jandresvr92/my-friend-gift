import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
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

  // Playable Character is Pink Monster (Leslie)
  const selectedCharacter: 'pink' = 'pink';
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Virtual Canvas Dimensions (16:9 internal resolution)
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
    characterId: 'pink' as 'dude' | 'pink' | 'owlet',
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
      instruction: 'Usa Flechas / D-Pad para moverte y ESPACIO / SALTO para saltar',
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

  // Determine the 2 NPC characters for Level 3 (Dude Monster & Owlet Monster)
  const npc1: 'dude' = 'dude';
  const npc2: 'owlet' = 'owlet';

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
  const triggerConfettiExplosion = (count = 240) => {
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      const p = createConfettiParticle(V_WIDTH);
      p.x = V_WIDTH / 2 + (Math.random() - 0.5) * 120;
      p.y = 310;
      p.vx = (Math.random() - 0.5) * 15;
      p.vy = -6 - Math.random() * 11;
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
      animId = requestAnimationFrame(gameLoop);

      const p = playerRef.current;
      const g = gameStateRef.current;
      const input = inputRef.current;
      const lvl = levels[g.level] || levels[1];

      g.frameCounter++;
      p.animFrame++;

      // 1. HORIZONTAL MOVEMENT
      if (input.left && !input.right) {
        p.vx = -p.speed;
        p.facing = 'left';
      } else if (input.right && !input.left) {
        p.vx = p.speed;
        p.facing = 'right';
      } else {
        p.vx = 0;
      }

      // 2. JUMPING
      if (input.jump && p.onGround) {
        p.vy = p.jumpForce;
        p.onGround = false;
        sound.playJump();
      }

      // 3. GRAVITY & POS
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
          // Trigger Celeste / Animal Crossing style procedural voice chatter!
          sound.playVoiceChatter(16);
          setTimeout(() => {
            sound.playBirthdayMelody();
          }, 350);
          triggerConfettiExplosion(240);
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
        if (g.chestOpened) {
          // NPC 1 (Dude - blue): Left monster with balloons facing right towards chest!
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

          // NPC 2 (Owlet - grey): Right monster with balloons facing left towards chest!
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

      // E. Render Player Monster (Leslie - Pink Monster)
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

      // G. Dynamic In-game HUD with Pixel Art Typography
      ctx.textAlign = 'center';
      if (g.level === 1) {
        // Pixel Art Tutorial Text
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#050811';
        ctx.fillText('Usa ◀ ▶ para moverte y ▲ / ESPACIO para saltar', V_WIDTH / 2 + 1, 61);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('Usa ◀ ▶ para moverte y ▲ / ESPACIO para saltar', V_WIDTH / 2, 60);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#050811';
        ctx.fillText('▶ Llega a la puerta dorada de la derecha ▶', V_WIDTH / 2 + 1, 89);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('▶ Llega a la puerta dorada de la derecha ▶', V_WIDTH / 2, 88);
      } else if (g.level === 2) {
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#050811';
        ctx.fillText('¡CUIDADO CON EL FOSO DE LAVA!', V_WIDTH / 2 + 1, 61);
        ctx.fillStyle = '#f87171';
        ctx.fillText('¡CUIDADO CON EL FOSO DE LAVA!', V_WIDTH / 2, 60);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#050811';
        ctx.fillText('Salta con precision entre las 3 plataformas', V_WIDTH / 2 + 1, 85);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Salta con precision entre las 3 plataformas', V_WIDTH / 2, 84);
      } else if (g.level === 3) {
        if (!g.chestOpened) {
          ctx.font = '11px "Press Start 2P", monospace';
          ctx.fillStyle = '#050811';
          ctx.fillText('¡TOCA EL COFRE DORADO EN EL CENTRO!', V_WIDTH / 2 + 1, 71);
          ctx.fillStyle = '#facc15';
          ctx.fillText('¡TOCA EL COFRE DORADO EN EL CENTRO!', V_WIDTH / 2, 70);

          const bounce = Math.sin(g.frameCounter * 0.1) * 6;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(V_WIDTH / 2, 285 + bounce);
          ctx.lineTo(V_WIDTH / 2 - 12, 270 + bounce);
          ctx.lineTo(V_WIDTH / 2 + 12, 270 + bounce);
          ctx.closePath();
          ctx.fill();
        } else {
          // CELEBRATION OVERLAY BANNER FOR LESLIE (Wider & Personalized Card)
          ctx.save();
          ctx.globalAlpha = g.messageAlpha;

          const cardW = 690;
          const cardH = 175;
          const cardX = V_WIDTH / 2 - cardW / 2;
          const cardY = 24;

          // Card Background & Glowing Border
          ctx.fillStyle = 'rgba(3, 7, 18, 0.95)';
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 14);
          ctx.fill();

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8);

          // Card Title
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 17px "Press Start 2P", monospace';
          ctx.fillText('¡FELIZ CUMPLEAÑOS LESLIE! 🎉', V_WIDTH / 2, cardY + 36);

          // Personalized message lines
          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(
            'Leslie, otro nivel desbloqueado en esta aventura que es tu vida.',
            V_WIDTH / 2,
            cardY + 68
          );
          ctx.fillText(
            'Te deseo lo mejor, gracias por ser tan buena amiga, nunca cambies tu forma de ser.',
            V_WIDTH / 2,
            cardY + 92
          );

          // Tiger Claw coupon badge
          ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
          ctx.beginPath();
          ctx.roundRect(cardX + 28, cardY + 114, cardW - 56, 38, 8);
          ctx.fill();
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#fda4af';
          ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(
            '🎟️ Nota: cupón válido para hacerle una garra del tigre al goldo <3',
            V_WIDTH / 2,
            cardY + 138
          );

          ctx.restore();
        }
      }
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Touch control handlers for gamepad
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
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 select-none touch-none">
      {/* Handheld Vertical Console Chassis */}
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 sm:border-4 border-slate-800 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3">
        
        {/* Minimal Console Bezel Top Header */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="font-['Press_Start_2P'] text-[9px] text-slate-400 tracking-wider">
              RETRO BOY 2D
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Level Quick Jump */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => loadLevel(lvl)}
                  aria-label={`Ir al Nivel ${lvl}`}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    currentLevel === lvl
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>

            {/* Restart Level */}
            <button
              onClick={() => loadLevel(currentLevel)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Reiniciar Nivel (Tecla R)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Dedicated Clean Screen (NO BUTTONS OVERLAYING THE CANVAS!) */}
        <div className="relative w-full aspect-[16/9] bg-slate-950 border-2 border-slate-800/90 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={V_WIDTH}
            height={V_HEIGHT}
            className="w-full h-full block"
          />

          {/* Level Badge in top-left of screen */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-700/60 rounded text-[9px] font-bold text-amber-400 font-['Press_Start_2P']">
              LVL {currentLevel}
            </span>
          </div>
        </div>

        {/* Dedicated Bottom Retro Gamepad Controller */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2 shadow-lg">
          {/* Left: Pixel Art D-Pad (◀ ▶) */}
          <div className="flex items-center gap-2">
            <button
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onMouseLeave={handleTouchEnd('left')}
              aria-label="Mover a la izquierda"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 active:border-cyan-400 active:from-cyan-900 active:to-slate-900 active:scale-95 text-slate-200 active:text-cyan-300 font-bold text-2xl flex items-center justify-center shadow-lg transition-transform touch-manipulation select-none"
            >
              ◀
            </button>

            <button
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onMouseLeave={handleTouchEnd('right')}
              aria-label="Mover a la derecha"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 active:border-cyan-400 active:from-cyan-900 active:to-slate-900 active:scale-95 text-slate-200 active:text-cyan-300 font-bold text-2xl flex items-center justify-center shadow-lg transition-transform touch-manipulation select-none"
            >
              ▶
            </button>
          </div>

          {/* Center: Retro Console Accents */}
          <div className="flex flex-col items-center justify-center gap-1.5 opacity-60">
            <div className="flex gap-1">
              <span className="w-1 h-5 bg-slate-700 rounded-full rotate-12" />
              <span className="w-1 h-5 bg-slate-700 rounded-full rotate-12" />
              <span className="w-1 h-5 bg-slate-700 rounded-full rotate-12" />
            </div>
            <span className="font-['Press_Start_2P'] text-[7px] text-slate-500 tracking-wider">
              LESLIE
            </span>
          </div>

          {/* Right: Retro Jump Action Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onTouchStart={handleTouchStart('jump')}
              onTouchEnd={handleTouchEnd('jump')}
              onMouseDown={handleTouchStart('jump')}
              onMouseUp={handleTouchEnd('jump')}
              onMouseLeave={handleTouchEnd('jump')}
              aria-label="Saltar"
              className="w-20 h-16 sm:w-24 sm:h-18 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-800 border-2 border-emerald-400 active:border-emerald-200 active:from-emerald-500 active:to-emerald-700 active:scale-95 text-white font-['Press_Start_2P'] text-[11px] flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-950 transition-transform touch-manipulation select-none"
            >
              <span className="text-base leading-none">▲</span>
              <span>SALTO</span>
            </button>
          </div>
        </div>

        {/* Footer info & Download single-file button */}
        <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-slate-500">
          <span>Controles: Flechas + Espacio</span>
          <button
            onClick={handleDownloadStandalone}
            className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition"
            title="Descargar versión autónoma index.html"
          >
            <Download className="w-3 h-3" />
            <span>Descargar index.html</span>
          </button>
        </div>

      </div>
    </div>
  );
}

