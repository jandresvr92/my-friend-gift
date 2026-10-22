import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { sound } from './game/audio';
import {
  drawMonsterCharacter,
  drawMonsterNPC,
  drawDoor,
  drawChest,
  createConfettiParticle,
  ConfettiParticle,
} from './game/sprites';
import {
  drawNightSky,
  drawMountainRanges,
  drawPineForest,
  drawPixelGround,
} from './game/scenery';

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
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
  const [currentLevel, setCurrentLevel] = useState<number>(1); // Starts at Level 1
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Virtual Canvas Dimensions
  const V_WIDTH = 580;
  const V_HEIGHT = 520;

  // Active Keys State Ref
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
  });

  // Player state ref (Scale 44x48)
  const playerRef = useRef({
    x: 50,
    y: 382,
    w: 44,
    h: 48,
    vx: 0,
    vy: 0,
    speed: 4.6,
    jumpForce: -12.4,
    gravity: 0.62,
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

  // Level definitions with rich pixel art scenery
  const levels: Record<number, LevelConfig> = {
    1: {
      id: 1,
      title: 'NIVEL 1: TUTORIAL',
      subtitle: 'Aprende los controles básicos',
      instruction: 'Usa ◀ ▶ para moverte y ▲ para saltar',
      platforms: [
        { x: 20, y: 430, w: 540, h: 90, type: 'ground' },
        { x: 180, y: 320, w: 180, h: 26, type: 'floating' },
      ],
      door: { x: 490, y: 335, w: 52, h: 95 },
      spawn: { x: 50, y: 382 },
      pitY: 540,
    },
    2: {
      id: 2,
      title: 'NIVEL 2: DESAFÍO',
      subtitle: '¡Cuidado con el foso!',
      instruction: 'Salta con precisión entre las plataformas',
      platforms: [
        { x: 20, y: 410, w: 120, h: 100, type: 'floating' },
        { x: 180, y: 320, w: 140, h: 30, type: 'floating' },
        { x: 360, y: 230, w: 130, h: 30, type: 'floating' },
        { x: 480, y: 160, w: 85, h: 30, type: 'goal' },
      ],
      door: { x: 495, y: 70, w: 52, h: 90 },
      spawn: { x: 45, y: 350 },
      pitY: 480, // Lava pit
    },
    3: {
      id: 3,
      title: 'NIVEL 3: GRAN FINAL',
      subtitle: '¡La fiesta de cumpleaños!',
      instruction: '¡Abre el cofre de cumpleaños!',
      platforms: [
        { x: 20, y: 430, w: 540, h: 90, type: 'ground' },
      ],
      // Bottom of chest rests on ground (376 + 54 = 430)
      chest: { x: 264, y: 376, w: 52, h: 54 },
      spawn: { x: 60, y: 382 },
      pitY: 540,
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

  // Full Restart back to Level 1
  const handleFullRestart = () => {
    loadLevel(1);
  };

  // Toggle audio
  const toggleSound = () => {
    const nextState = !soundEnabled;
    sound.setEnabled(nextState);
    setSoundEnabled(nextState);
  };

  // Confetti explosion
  const triggerConfettiExplosion = (count: number = 240) => {
    const newConfetti: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      newConfetti.push(createConfettiParticle(V_WIDTH));
    }
    gameStateRef.current.confetti = newConfetti;
  };

  // Standalone index.html download


  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        inputRef.current.jump = true;
      } else if (e.code === 'KeyR') {
        handleFullRestart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = false;
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        inputRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game physics & rendering loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const p = playerRef.current;
      const g = gameStateRef.current;
      const input = inputRef.current;
      const lvl = levels[g.level];

      g.frameCounter++;
      p.animFrame++;

      // 1. HORIZONTAL VELOCITY
      if (input.left) {
        p.vx = -p.speed;
        p.facing = 'left';
      } else if (input.right) {
        p.vx = p.speed;
        p.facing = 'right';
      } else {
        p.vx = 0;
      }

      // 2. JUMP ACTION
      if (input.jump && p.onGround) {
        p.vy = p.jumpForce;
        p.onGround = false;
        sound.playJump();
      }

      // 3. GRAVITY & MOVEMENT
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      // 4. SCREEN BOUNDS
      if (p.x < 15) p.x = 15;
      if (p.x + p.w > V_WIDTH - 15) p.x = V_WIDTH - 15 - p.w;

      // 5. PLATFORM COLLISIONS
      p.onGround = false;
      for (const plat of lvl.platforms) {
        if (
          p.x + p.w > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.h >= plat.y &&
          p.y + p.h <= plat.y + 16 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }

      // 6. ANIMATION STATE DETERMINATION
      if (!p.onGround) {
        p.animState = 'jump';
      } else if (Math.abs(p.vx) > 0.1) {
        p.animState = 'walk';
      } else {
        p.animState = 'idle';
      }

      // 7. PITFALL HAZARD CHECK
      if (p.y > lvl.pitY) {
        sound.playFall();
        loadLevel(g.level);
        animId = requestAnimationFrame(gameLoop); // mantener vivo el bucle
        return;
      }

      // 8. DOOR COLLISION (Levels 1 & 2)
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
          animId = requestAnimationFrame(gameLoop); // mantener vivo el bucle
          return;
        }
      }

      // 9. CHEST COLLISION (Level 3 - Opens only when touched!)
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
          sound.playCongratulatoryVoices();
          setTimeout(() => {
            sound.playBirthdayMelody();
          }, 900);
          triggerConfettiExplosion(260);
        }
      }

      // 10. UPDATE CONFETTI PARTICLES
      for (let i = g.confetti.length - 1; i >= 0; i--) {
        const cp = g.confetti[i];
        cp.vy += 0.1;
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.rotation += cp.vRot;
        cp.life++;

        if (cp.life > cp.maxLife || cp.y > V_HEIGHT + 30) {
          if (g.chestOpened && Math.random() < 0.28) {
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

      // A. Starry Night Sky with Purple Sunset Gradient Horizon
      drawNightSky(ctx, V_WIDTH, V_HEIGHT, g.frameCounter, g.level === 2);

      // B. Distant and Midground Pixel Mountains
      drawMountainRanges(ctx, V_WIDTH, 430);

      // C. Pine Forest Silhouettes
      drawPineForest(ctx, V_WIDTH, 430);

      // Level 2 Abyss Lava Glow
      if (g.level === 2) {
        const pitGlow = ctx.createLinearGradient(0, 440, 0, V_HEIGHT);
        pitGlow.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        pitGlow.addColorStop(0.5, 'rgba(220, 38, 38, 0.85)');
        pitGlow.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = pitGlow;
        ctx.fillRect(0, 440, V_WIDTH, V_HEIGHT - 440);

        ctx.fillStyle = '#ef4444';
        for (let x = 10; x < V_WIDTH; x += 26) {
          ctx.beginPath();
          ctx.moveTo(x, V_HEIGHT);
          ctx.lineTo(x + 13, V_HEIGHT - 28);
          ctx.lineTo(x + 26, V_HEIGHT);
          ctx.fill();
        }
      }

      // D. Ground and Platforms with lush green pixel grass & cobblestone blocks
      for (const plat of lvl.platforms) {
        drawPixelGround(
          ctx,
          plat.x,
          plat.y,
          plat.w,
          plat.h,
          plat.type === 'ground',
          g.frameCounter
        );
      }

      // E. Door (Levels 1 & 2)
      if (lvl.door) {
        drawDoor(ctx, lvl.door.x, lvl.door.y, lvl.door.w, lvl.door.h, g.frameCounter);
      }

      // F. Level 3: Animated Chest & Companions Dude and Owlet
      if (g.level === 3) {
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

        // Two Monster NPCs appear celebrating ONLY when the chest is opened!
        // Both placed at y: 382 so their feet are on the ground at y: 430, perfectly aligned with player!
        if (g.chestOpened) {
          // NPC 1: Dude Monster (Blue) on left with striped cone hat, yellow balloon, bubble "¡Sorpresa!"
          drawMonsterNPC(
            ctx,
            130,
            382,
            44,
            48,
            npc1,
            g.frameCounter,
            '¡Sorpresa!',
            true,
            true,
            'right'
          );

          // NPC 2: Owlet Monster (White/Grey) on right with purple cone hat, purple balloon, bubble "¡Feliz Cumple!"
          drawMonsterNPC(
            ctx,
            406,
            382,
            44,
            48,
            npc2,
            g.frameCounter,
            '¡Feliz Cumple!',
            true,
            true,
            'left'
          );
        }
      }

      // G. Render Player Monster (Leslie - Pink Monster)
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

      // H. Render Confetti
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
          ctx.fillRect(-cp.size / 2, -2, cp.size, 4);
          ctx.fillRect(-2, -cp.size / 2, 4, cp.size);
        } else {
          ctx.fillRect(-cp.size / 2, -cp.size / 3, cp.size, (cp.size * 2) / 3);
        }

        ctx.restore();
      }

      // I. Header & Level Overlay
      if (g.level === 3) {
        ctx.save();
        if (!g.chestOpened) {
          // Guidance before chest is opened
          ctx.textAlign = 'center';

          // LVL 3 Badge in rounded purple box
          const badgeX = 35;
          const badgeY = 25;
          const badgeW = 75;
          const badgeH = 28;
          ctx.fillStyle = '#1e0838';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
          ctx.fill();
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 10px "Press Start 2P", monospace';
          ctx.fillText('LVL 3', badgeX + badgeW / 2, badgeY + 18);

          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 13px "Press Start 2P", monospace';
          ctx.textAlign = 'left';
          ctx.fillText('¡ABRE EL COFRE DORADO! 🎁', badgeX + badgeW + 12, badgeY + 20);

          ctx.textAlign = 'center';
          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Camina hacia el cofre para descubrir la sorpresa', V_WIDTH / 2, badgeY + 54);

          // Animated arrow pointing directly down to the chest
          const bounce = Math.sin(g.frameCounter * 0.12) * 6;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(V_WIDTH / 2, 335 + bounce);
          ctx.lineTo(V_WIDTH / 2 - 12, 318 + bounce);
          ctx.lineTo(V_WIDTH / 2 + 12, 318 + bounce);
          ctx.closePath();
          ctx.fill();
        } else {
          // CELEBRATION CARD FOR LESLIE (Fades in ONLY after chest is opened!)
          ctx.globalAlpha = g.messageAlpha;
          ctx.textAlign = 'center';

          // 1. LVL 3 Badge in rounded purple box
          const badgeX = 35;
          const badgeY = 25;
          const badgeW = 75;
          const badgeH = 28;
          ctx.fillStyle = '#1e0838';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
          ctx.fill();
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 10px "Press Start 2P", monospace';
          ctx.fillText('LVL 3', badgeX + badgeW / 2, badgeY + 18);

          // 2. Title: ¡FELIZ CUMPLEAÑOS LESLIE! 🎊
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 15px "Press Start 2P", monospace';
          ctx.textAlign = 'left';
          ctx.fillText('¡FELIZ CUMPLEAÑOS LESLIE! 🎉', badgeX + badgeW + 12, badgeY + 20);

          // 3. Subtitles
          ctx.textAlign = 'center';
          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Leslie, otro nivel desbloqueado en esta aventura que es tu vida.', V_WIDTH / 2, badgeY + 54);
          ctx.fillText('Te deseo lo mejor, gracias por ser tan buena amiga, nunca cambies tu forma de ser.', V_WIDTH / 2, badgeY + 72);

          // 4. Pink Coupon Capsule
          const coupW = V_WIDTH - 70;
          const coupH = 30;
          const coupX = 35;
          const coupY = badgeY + 86;

          ctx.fillStyle = 'rgba(112, 26, 117, 0.35)';
          ctx.beginPath();
          ctx.roundRect(coupX, coupY, coupW, coupH, 8);
          ctx.fill();
          ctx.strokeStyle = 'rgba(216, 70, 239, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#f472b6';
          ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('♥  Nota: cupón válido para hacerle una garra del tigre al goldo <3', V_WIDTH / 2, coupY + 19);
        }
        ctx.restore();
      } else if (g.level === 1) {
        ctx.save();
        ctx.textAlign = 'center';
        // LVL 1 Badge
        ctx.fillStyle = '#1e0838';
        ctx.beginPath();
        ctx.roundRect(35, 25, 75, 28, 8);
        ctx.fill();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText('LVL 1', 72, 43);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px "Press Start 2P", monospace';
        ctx.fillText('NIVEL 1: TUTORIAL 🌲', 122, 44);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Usa ◀ ▶ para moverte y ▲ para saltar', V_WIDTH / 2, 78);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('▶ Entra por la puerta para avanzar de nivel ▶', V_WIDTH / 2, 98);
        ctx.restore();
      } else if (g.level === 2) {
        ctx.save();
        ctx.textAlign = 'center';
        // LVL 2 Badge
        ctx.fillStyle = '#1e0838';
        ctx.beginPath();
        ctx.roundRect(35, 25, 75, 28, 8);
        ctx.fill();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText('LVL 2', 72, 43);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 13px "Press Start 2P", monospace';
        ctx.fillText('NIVEL 2: DESAFÍO 🔥', 122, 44);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('¡Cuidado con el foso de lava! Salta con precisión', V_WIDTH / 2, 78);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Llega a la puerta superior para desbloquear el gran final', V_WIDTH / 2, 98);
        ctx.restore();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Touch handlers
  const handleTouchStart = (key: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    inputRef.current[key] = true;
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleTouchEnd = (key: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    inputRef.current[key] = false;
  };

  return (
    <div className="h-[100dvh] w-full bg-[#080b14] text-slate-100 flex flex-col items-center justify-between p-1 sm:p-2 select-none touch-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Handheld Vertical Console Chassis */}
      <div className="w-full max-w-lg h-[95dvh] sm:h-[97dvh] bg-[#0c1020] border-2 border-slate-800/80 rounded-3xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Top Console Bezel Header */}
        <div className="flex items-center justify-between px-2 py-1 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
            <span className="font-['Press_Start_2P'] text-[10px] sm:text-[11px] text-white tracking-wider">
              RETRO BOY 2D
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Level Selector Capsule */}
            <div className="flex items-center bg-[#070a14] border border-slate-800 rounded-xl p-0.5">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => loadLevel(lvl)}
                  aria-label={`Ir al Nivel ${lvl}`}
                  className={`px-3 py-1 rounded-lg font-['Press_Start_2P'] text-[9px] transition-all cursor-pointer ${
                    currentLevel === lvl
                      ? 'bg-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.7)] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              className="p-2 rounded-xl bg-[#070a14] border border-slate-800 text-[#34d399] hover:bg-slate-800 transition cursor-pointer"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#34d399]" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            {/* Restart Entire Game directly to Level 1 */}
            <button
              onClick={handleFullRestart}
              className="p-2 rounded-xl bg-[#070a14] border border-slate-800 text-[#38bdf8] hover:bg-slate-800 transition cursor-pointer"
              title="Reiniciar juego completo desde el Nivel 1 (Tecla R)"
            >
              <RotateCcw className="w-4 h-4 text-[#38bdf8]" />
            </button>
          </div>
        </div>

        {/* Dedicated Game Screen with Sleek Dark Border */}
        <div className="relative flex-1 min-h-0 w-full bg-[#070a14] border-2 border-purple-950/70 rounded-2xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center my-1.5">
          <canvas
            ref={canvasRef}
            width={V_WIDTH}
            height={V_HEIGHT}
            className="w-full h-full object-contain block"
          />
        </div>

        {/* Clean, Ergonomic Gamepad Dock (Fixed firmly at the very bottom, without center Leslie box or footer pills) */}
        <div className="w-full mt-auto shrink-0 flex items-stretch justify-between gap-3 pb-safe pt-2">
          
          {/* Left: Purple D-Pad with ◀ MOVER ▶ */}
          <div className="flex-1 max-w-[210px] bg-[#0c1020] border-2 border-[#3b0764] rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-lg">
            <div className="flex items-center gap-2.5">
              <button
                onTouchStart={handleTouchStart('left')}
                onTouchEnd={handleTouchEnd('left')}
                onMouseDown={handleTouchStart('left')}
                onMouseUp={handleTouchEnd('left')}
                onMouseLeave={handleTouchEnd('left')}
                aria-label="Mover a la izquierda"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-b from-[#6b21a8] to-[#4c1d95] border border-[#a855f7]/70 active:scale-95 active:border-cyan-400 text-white font-bold text-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(107,33,168,0.5)] transition-transform touch-manipulation select-none cursor-pointer"
              >
                ⬅
              </button>

              <button
                onTouchStart={handleTouchStart('right')}
                onTouchEnd={handleTouchEnd('right')}
                onMouseDown={handleTouchStart('right')}
                onMouseUp={handleTouchEnd('right')}
                onMouseLeave={handleTouchEnd('right')}
                aria-label="Mover a la derecha"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-b from-[#6b21a8] to-[#4c1d95] border border-[#a855f7]/70 active:scale-95 active:border-cyan-400 text-white font-bold text-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(107,33,168,0.5)] transition-transform touch-manipulation select-none cursor-pointer"
              >
                ➡
              </button>
            </div>

            <span className="font-['Press_Start_2P'] text-[8px] text-[#c084fc] tracking-wider">
              ◀ MOVER ▶
            </span>
          </div>

          {/* Right: Glowing Green SALTO [SPACE] Button */}
          <div className="flex-1 max-w-[210px] bg-[#0c1020] border-2 border-[#064e3b] rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-lg">
            <button
              onTouchStart={handleTouchStart('jump')}
              onTouchEnd={handleTouchEnd('jump')}
              onMouseDown={handleTouchStart('jump')}
              onMouseUp={handleTouchEnd('jump')}
              onMouseLeave={handleTouchEnd('jump')}
              aria-label="Saltar"
              className="w-full h-16 sm:h-18 rounded-xl bg-gradient-to-b from-[#10b981] to-[#059669] border border-[#34d399] active:scale-95 text-white flex flex-col items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-transform touch-manipulation select-none cursor-pointer"
            >
              <span className="text-sm leading-none">▲</span>
              <span className="font-['Press_Start_2P'] text-sm tracking-wider font-extrabold">
                SALTO
              </span>
            </button>

            <span className="font-['Press_Start_2P'] text-[8px] text-[#34d399] tracking-wider">
              — SPACE —
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
