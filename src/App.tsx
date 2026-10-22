import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles,
  Gamepad2,
  ExternalLink,
  Users,
} from 'lucide-react';
import { sound } from './game/audio';
import { MONSTERS } from './game/characterAssets';
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

  // Character selection: dude | pink | owlet
  const [selectedCharacter, setSelectedCharacter] = useState<'dude' | 'pink' | 'owlet'>('dude');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isVictoryCelebration, setIsVictoryCelebration] = useState<boolean>(false);

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
    setIsVictoryCelebration(false);
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

  // Copy code to clipboard
  const handleCopyCode = () => {
    fetch('/minijuego.html')
      .then((res) => res.text())
      .then((content) => {
        navigator.clipboard.writeText(content).then(() => {
          setCopiedCode(true);
          setTimeout(() => setCopiedCode(false), 2500);
        });
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
          loadLevel(g.level + 1);
          return;
        }
      }

      // 9. CHEST COLLISION (Level 3)
      if (g.level === 3 && lvl.chest && !g.chestOpened) {
        const c = lvl.chest;
        if (
          p.x + p.w > c.x &&
          p.x < c.x + c.w &&
          p.y + p.h > c.y &&
          p.y < c.y + c.h
        ) {
          g.chestOpened = true;
          setIsVictoryCelebration(true);
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

      // D. Level 3 Party Hall: Two Static Monster NPCs & Birthday Chest
      if (g.level === 3) {
        // NPC 1: Left monster with balloons
        const dialogue1 = g.chestOpened ? '¡Hurra!' : '¡Sorpresa!';
        drawMonsterNPC(
          ctx,
          230,
          346,
          32,
          34,
          npc1,
          g.frameCounter,
          dialogue1,
          true,
          g.chestOpened
        );

        // NPC 2: Right monster cheering
        const dialogue2 = g.chestOpened ? '¡Feliz Cumple!' : '¡Abre el cofre!';
        drawMonsterNPC(
          ctx,
          530,
          346,
          32,
          34,
          npc2,
          g.frameCounter,
          dialogue2,
          false,
          g.chestOpened
        );

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

      animId = requestAnimationFrame(gameLoop);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      {/* Top Header & Toolbar */}
      <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Plataformas Cumpleaños 2D
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">Dude, Pink & Owlet</span>
              <span>·</span>
              <span>Canvas 60 FPS</span>
              <span>·</span>
              <span>3 Niveles</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Character Switcher Button */}
          <button
            onClick={() => setShowCharModal(true)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow"
          >
            <img
              src={MONSTERS[selectedCharacter].dataUri}
              alt={MONSTERS[selectedCharacter].name}
              className="w-5 h-5 object-contain"
            />
            <span className="hidden sm:inline">{MONSTERS[selectedCharacter].name}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-rose-950/40 border-rose-900/50 text-rose-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sonido' : 'Mute'}</span>
          </button>

          {/* Reset Current Level */}
          <button
            onClick={() => loadLevel(currentLevel)}
            title="Reiniciar Nivel actual"
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          {/* Download index.html */}
          <button
            onClick={handleDownloadStandalone}
            title="Descargar minijuego en un solo archivo index.html"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Descargar index.html</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen Card */}
      <main className="w-full max-w-4xl my-2 flex flex-col items-center">
        {/* Game Canvas Container */}
        <div className="relative w-full aspect-[16/9] bg-slate-900 border-2 border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={V_WIDTH}
            height={V_HEIGHT}
            className="game-canvas w-full h-full block"
          />

          {/* Overlay Top Badge */}
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1 bg-slate-950/80 border border-slate-700/60 rounded-lg text-xs font-bold text-slate-200 backdrop-blur-sm shadow flex items-center gap-2">
              <span className="text-amber-400">●</span>
              <span>{levels[currentLevel]?.title || `NIVEL ${currentLevel}`}</span>
            </div>

            {/* Quick Level Switcher */}
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

        {/* Celebration Action Bar when Level 3 is completed */}
        {isVictoryCelebration && (
          <div className="w-full mt-3 p-3 bg-indigo-950/70 border border-indigo-700/60 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span className="text-sm font-bold text-amber-200">
                ¡Sorpresa descubierta! ¡Tus amigos te celebran en grande!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerConfettiExplosion(150)}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 rounded-lg text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Más Confeti</span>
              </button>
              <button
                onClick={() => loadLevel(1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-xs font-semibold transition-colors"
              >
                Volver a Jugar
              </button>
            </div>
          </div>
        )}

        {/* Character Roster Overview */}
        <div className="w-full mt-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-slate-300">Personajes del juego:</span>
          </div>
          <div className="flex items-center gap-3">
            {(['dude', 'pink', 'owlet'] as const).map((mId) => {
              const m = MONSTERS[mId];
              const isSelected = selectedCharacter === mId;
              return (
                <button
                  key={mId}
                  onClick={() => setSelectedCharacter(mId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img src={m.dataUri} alt={m.name} className="w-4 h-4 object-contain" />
                  <span>{m.name}</span>
                  {isSelected && <span className="text-[10px] text-rose-300">(Tú)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Guide */}
        <div className="w-full mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="font-semibold text-slate-200 block mb-1">🎮 Teclado:</span>
            <span>Usa <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">◀</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">▶</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">A</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">D</kbd> para correr.</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="font-semibold text-slate-200 block mb-1">🦘 Salto:</span>
            <span>Presiona <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">ESPACIO</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">⬆</kbd> para saltar plataformas.</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="font-semibold text-slate-200 block mb-1">📱 Celular & Móvil:</span>
            <span>Usa los botones táctiles en pantalla (multitáctil activo).</span>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <span>Minijuego en un solo archivo index.html (Vanilla JS + HTML5 Canvas)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCodeModal(true)}
            className="hover:text-slate-300 transition-colors flex items-center gap-1 underline underline-offset-4"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver código autónomo</span>
          </button>
          <span>·</span>
          <button
            onClick={handleCopyCode}
            className="hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? '¡Copiado!' : 'Copiar código HTML'}</span>
          </button>
        </div>
      </footer>

      {/* MODAL: CHOOSE CHARACTER */}
      {showCharModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Elige tu Personaje</h2>
              </div>
              <button
                onClick={() => setShowCharModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Selecciona con cuál de los 3 monstruos jugar. Los otros dos te estarán esperando en el Nivel 3 con gorros de fiesta y globos para celebrar tu cumpleaños:
            </p>

            {/* Character Cards */}
            <div className="space-y-2">
              {(['dude', 'pink', 'owlet'] as const).map((mId) => {
                const m = MONSTERS[mId];
                const isSelected = selectedCharacter === mId;
                return (
                  <button
                    key={mId}
                    onClick={() => {
                      setSelectedCharacter(mId);
                      setShowCharModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-950/60 rounded-lg flex items-center justify-center p-1 border border-slate-800">
                        <img src={m.dataUri} alt={m.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.roleDescription}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-rose-500 text-white rounded-md">
                        Seleccionado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCharModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VIEW STANDALONE HTML SOURCE CODE */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">
                  Archivo Único index.html Autónomo
                </h2>
                <p className="text-xs text-slate-400">
                  Todo el juego en un solo archivo HTML autónomo (con Dude Monster, Pink Monster y Owlet Monster integrados).
                </p>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-3 flex-1 overflow-auto bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed select-text">
              <pre>
{`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Plataformas 2D - ¡Feliz Cumpleaños!</title>
  <!-- Contiene los 3 personajes incrustados en Base64, física Canvas 60 FPS,
       sonidos 8-bits sintetizados, 3 niveles, foso, NPCs y confeti -->
</head>
...`}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar todo el código'}</span>
              </button>
              <button
                onClick={handleDownloadStandalone}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar archivo index.html</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
