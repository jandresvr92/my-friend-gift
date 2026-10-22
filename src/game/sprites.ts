/**
 * Procedural Pixel Art and Sprite Rendering Engine
 * Renders charming 2D pixel characters, NPCs, decorations, and confetti on HTML5 Canvas.
 * Supports Dude Monster, Pink Monster, Owlet Monster, configurable skins, and custom spritesheet loading.
 */

import { MONSTERS, MonsterCharacter } from './characterAssets';

export type CharacterType = 'dude' | 'pink' | 'owlet' | 'custom';

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'ribbon' | 'star';
  life: number;
  maxLife: number;
}

// Pre-loaded Image Cache
const imageCache: Record<string, HTMLImageElement> = {};

function getMonsterImage(id: 'dude' | 'pink' | 'owlet'): HTMLImageElement {
  if (!imageCache[id]) {
    const img = new Image();
    img.src = MONSTERS[id].dataUri;
    imageCache[id] = img;
  }
  return imageCache[id];
}

// Pre-initialize images immediately
if (typeof window !== 'undefined') {
  getMonsterImage('dude');
  getMonsterImage('pink');
  getMonsterImage('owlet');
}

/**
 * Draw Monster character (Dude, Pink, or Owlet) with dynamic bounce, tilt, jump stretch, and shadow.
 */
export function drawMonsterCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  characterId: 'dude' | 'pink' | 'owlet',
  facing: 'left' | 'right',
  animState: 'idle' | 'walk' | 'jump',
  animFrame: number,
  customImage?: HTMLImageElement | null
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const centerX = x + width / 2;
  const bottomY = y + height;

  // Shadow at the base
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, bottomY - 1, width * 0.45, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(centerX, bottomY);

  // Flip horizontally if facing left
  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Animation dynamics
  let bobY = 0;
  let tilt = 0;
  let scaleX = 1;
  let scaleY = 1;

  if (animState === 'walk') {
    bobY = -Math.abs(Math.sin(animFrame * 0.35)) * 4;
    tilt = Math.sin(animFrame * 0.35) * 0.09;
  } else if (animState === 'jump') {
    scaleX = 0.88;
    scaleY = 1.14;
    bobY = -2;
  } else {
    // Idle breathing
    bobY = Math.sin(animFrame * 0.08) * 1.5;
    scaleY = 1 + Math.sin(animFrame * 0.08) * 0.03;
    scaleX = 1 - Math.sin(animFrame * 0.08) * 0.02;
  }

  ctx.translate(0, bobY);
  ctx.rotate(tilt);
  ctx.scale(scaleX, scaleY);

  const imgToDraw = customImage || getMonsterImage(characterId);

  if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth > 0) {
    ctx.drawImage(imgToDraw, -width / 2, -height, width, height);
  } else {
    // Fallback procedural cute rectangle
    const fallbackColor = characterId === 'pink' ? '#ec4899' : characterId === 'owlet' ? '#cbd5e1' : '#0284c7';
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(-width / 2, -height, width, height);
  }

  ctx.restore();
}

/**
 * Draw NPC Monster (One of the other two monsters) in Level 3 with party hat, balloons, and dialogue!
 */
export function drawMonsterNPC(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  characterId: 'dude' | 'pink' | 'owlet',
  animFrame: number,
  dialogueText?: string,
  holdsBalloons: boolean = false,
  isCheering: boolean = false
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const centerX = x + width / 2;
  const bottomY = y + height;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, bottomY - 1, width * 0.45, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // NPC Bounce
  const bounce = isCheering
    ? -Math.abs(Math.sin(animFrame * 0.25)) * 10
    : Math.sin(animFrame * 0.09 + (characterId === 'pink' ? 1 : 2)) * 2;

  ctx.translate(centerX, bottomY + bounce);

  const img = getMonsterImage(characterId);
  if (img && img.complete) {
    ctx.drawImage(img, -width / 2, -height, width, height);
  }

  // --- FESTIVE BIRTHDAY CONE HAT ---
  const hatColors = characterId === 'pink'
    ? { base: '#f43f5e', stripe: '#facc15', pompom: '#38bdf8' }
    : characterId === 'owlet'
    ? { base: '#8b5cf6', stripe: '#ec4899', pompom: '#facc15' }
    : { base: '#0ea5e9', stripe: '#ef4444', pompom: '#eab308' };

  ctx.fillStyle = hatColors.base;
  ctx.beginPath();
  ctx.moveTo(-6, -height + 4);
  ctx.lineTo(6, -height + 4);
  ctx.lineTo(0, -height - 14);
  ctx.closePath();
  ctx.fill();

  // Hat stripe
  ctx.strokeStyle = hatColors.stripe;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, -height - 2);
  ctx.lineTo(4, -height - 6);
  ctx.stroke();

  // Pom-pom on tip
  ctx.fillStyle = hatColors.pompom;
  ctx.beginPath();
  ctx.arc(0, -height - 15, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // --- FLOATING BALLOONS ---
  if (holdsBalloons) {
    const stringWiggle = Math.sin(animFrame * 0.06) * 4;
    const balloonX = -18 + stringWiggle;
    const balloonY = -height - 38 + Math.cos(animFrame * 0.05) * 3;

    // String
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -height + 14);
    ctx.lineTo(balloonX, balloonY + 8);
    ctx.stroke();

    // Balloon 1 (Red/Pink)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(balloonX - 6, balloonY - 6, 8, 11, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(balloonX - 8, balloonY - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Balloon 2 (Yellow/Gold)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(balloonX + 6, balloonY - 12, 8, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(balloonX + 4, balloonY - 16, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- DIALOGUE BUBBLE ---
  if (dialogueText) {
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(dialogueText).width;
    const bw = textWidth + 14;
    const bh = 22;
    const bx = -bw / 2;
    const by = -height - (holdsBalloons ? 32 : 28);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();

    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(-4, by + bh);
    ctx.lineTo(4, by + bh);
    ctx.lineTo(0, by + bh + 4);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(dialogueText, bx + 7, by + 15);
  }

  ctx.restore();
}

/**
 * Draw the magical Birthday Chest
 */
export function drawChest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isOpen: boolean,
  animFrame: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(width / 2, height + 2, width * 0.55, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base box (Wood + Gold trim)
  ctx.fillStyle = '#78350f'; // Dark wood
  ctx.fillRect(2, height * 0.4, width - 4, height * 0.6);

  ctx.fillStyle = '#92400e'; // Medium wood grain
  ctx.fillRect(4, height * 0.45, width - 8, height * 0.5);

  // Gold trim corners
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(2, height * 0.4, 4, height * 0.6);
  ctx.fillRect(width - 6, height * 0.4, 4, height * 0.6);
  ctx.fillRect(2, height - 4, width - 4, 4);

  if (!isOpen) {
    // Closed Lid
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, height * 0.1, width, height * 0.35);

    // Lid arc
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.25, width * 0.48, Math.PI, 0);
    ctx.fill();

    // Golden lock
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(width / 2 - 4, height * 0.38, 8, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(width / 2 - 1.5, height * 0.42, 3, 4);

    // Subtle glow / bounce to invite player
    const pulse = (Math.sin(animFrame * 0.08) + 1) * 0.5;
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(-2, height * 0.08, width + 4, height * 0.94);
  } else {
    // Open Lid tilted backward
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.4);
    ctx.lineTo(width, height * 0.4);
    ctx.lineTo(width - 4, -height * 0.25);
    ctx.lineTo(4, -height * 0.25);
    ctx.closePath();
    ctx.fill();

    // Golden Treasure Glow shining out
    const glowGradient = ctx.createRadialGradient(
      width / 2,
      height * 0.3,
      2,
      width / 2,
      height * 0.3,
      40
    );
    glowGradient.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
    glowGradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)');
    glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.3, 45, 0, Math.PI * 2);
    ctx.fill();

    // Glittering stars and gems rising
    for (let i = 0; i < 4; i++) {
      const starOffset = (animFrame * 1.5 + i * 25) % 60;
      const starX = width / 2 + Math.sin(i * 1.5 + animFrame * 0.05) * 16;
      const starY = height * 0.3 - starOffset * 0.7;
      const starAlpha = Math.max(0, 1 - starOffset / 55);

      ctx.fillStyle = `rgba(254, 240, 138, ${starAlpha})`;
      ctx.fillRect(starX - 2, starY - 2, 4, 4);
      ctx.fillRect(starX - 4, starY - 1, 8, 2);
      ctx.fillRect(starX - 1, starY - 4, 2, 8);
    }
  }

  ctx.restore();
}

/**
 * Draw Door with stone arch, wooden planks, and portal light
 */
export function drawDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  animFrame: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Stone Arch frame
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4, 0, width + 8, height);

  // Arch rounded top
  ctx.beginPath();
  ctx.arc(width / 2, 8, (width + 8) / 2, Math.PI, 0);
  ctx.fill();

  // Wooden door panels
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 4, width, height - 4);

  // Door planks
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 3, 4);
  ctx.lineTo(width / 3, height);
  ctx.moveTo((width * 2) / 3, 4);
  ctx.lineTo((width * 2) / 3, height);
  ctx.stroke();

  // Golden handle
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(8, height * 0.55, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Magical portal light spilling from under / around door
  const pulse = Math.sin(animFrame * 0.1) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(56, 189, 248, ${0.3 * pulse})`;
  ctx.fillRect(2, height - 4, width - 4, 4);

  // Little EXIT label above door
  ctx.fillStyle = '#38bdf8';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PUERTA', width / 2, -10);

  ctx.restore();
}

/**
 * Generate new confetti particle
 */
export function createConfettiParticle(cw: number): ConfettiParticle {
  const colors = [
    '#f43f5e', // Rose
    '#ec4899', // Pink
    '#a855f7', // Purple
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#facc15', // Gold
    '#fb923c', // Orange
  ];
  const shapes: ConfettiParticle['shape'][] = ['rect', 'rect', 'ribbon', 'circle', 'star'];

  return {
    x: Math.random() * cw,
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    size: 6 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.18,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    life: 0,
    maxLife: 300 + Math.random() * 200,
  };
}
