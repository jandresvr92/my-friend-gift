/**
 * Pixel Art Scenery & Environmental Rendering Engine
 * Renders rich retro mountain landscapes, night skies, pine forests,
 * textured grass/rock terrain blocks, and the magical Golden Light Portal.
 */

// Deterministic star positions for clean, shimmering night sky
const STARS = [
  { x: 35, y: 35, size: 2, type: 'cross', speed: 0.05 },
  { x: 75, y: 70, size: 1, type: 'dot', speed: 0.07 },
  { x: 120, y: 25, size: 3, type: 'cross', speed: 0.04 },
  { x: 165, y: 85, size: 1, type: 'dot', speed: 0.06 },
  { x: 215, y: 40, size: 2, type: 'cross', speed: 0.08 },
  { x: 260, y: 95, size: 1, type: 'dot', speed: 0.05 },
  { x: 310, y: 30, size: 2, type: 'cross', speed: 0.04 },
  { x: 355, y: 75, size: 1, type: 'dot', speed: 0.09 },
  { x: 400, y: 45, size: 3, type: 'cross', speed: 0.06 },
  { x: 445, y: 85, size: 1, type: 'dot', speed: 0.07 },
  { x: 490, y: 30, size: 2, type: 'cross', speed: 0.05 },
  { x: 535, y: 65, size: 1, type: 'dot', speed: 0.08 },
  { x: 560, y: 110, size: 2, type: 'cross', speed: 0.06 },
  { x: 90, y: 130, size: 1, type: 'dot', speed: 0.05 },
  { x: 230, y: 140, size: 1, type: 'dot', speed: 0.07 },
  { x: 380, y: 135, size: 2, type: 'cross', speed: 0.04 },
  { x: 505, y: 140, size: 1, type: 'dot', speed: 0.06 },
];

/**
 * Draw Night Sky with vibrant violet/purple sunset horizon, stars, and animated shooting star
 */
export function drawNightSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  hazardGlow = false
) {
  // 1. Atmosphere Gradient matching reference image
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.85);
  skyGrad.addColorStop(0.0, '#0a0218'); // Deep midnight black/navy
  skyGrad.addColorStop(0.35, '#1e0838'); // Deep purple
  skyGrad.addColorStop(0.65, '#3b0764'); // Rich royal violet
  skyGrad.addColorStop(0.88, '#6b21a8'); // Twilight purple
  skyGrad.addColorStop(1.0, hazardGlow ? '#991b1b' : '#9d174d'); // Sunset magenta/rose horizon glow
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Stars
  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i];
    const shimmer = Math.sin(frame * s.speed + i) * 0.35 + 0.65;
    ctx.fillStyle = `rgba(255, 255, 255, ${shimmer.toFixed(2)})`;

    if (s.type === 'cross' && s.size >= 2) {
      // 4-pixel star cross
      ctx.fillRect(s.x, s.y - 1, 1, 3);
      ctx.fillRect(s.x - 1, s.y, 3, 1);
    } else {
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
  }

  // 3. Periodic Animated Shooting Star / Comet
  const cometPeriod = 240; // Every ~4 seconds
  const cometFrame = frame % cometPeriod;
  if (cometFrame < 45) {
    const progress = cometFrame / 45;
    const startX = width * 0.82;
    const startY = height * 0.15;
    const travel = progress * 160;
    const curX = startX - travel * 0.85;
    const curY = startY + travel * 0.52;

    const tailLen = Math.min(progress * 48, 48);
    const tailGrad = ctx.createLinearGradient(
      curX,
      curY,
      curX + tailLen * 0.85,
      curY - tailLen * 0.52
    );
    tailGrad.addColorStop(0, '#ffffff');
    tailGrad.addColorStop(0.2, '#c084fc');
    tailGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');

    ctx.strokeStyle = tailGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(curX, curY);
    ctx.lineTo(curX + tailLen * 0.85, curY - tailLen * 0.52);
    ctx.stroke();

    // Comet head cross
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(curX - 1, curY - 1, 3, 3);
    ctx.fillStyle = '#f0abfc';
    ctx.fillRect(curX, curY - 2, 1, 5);
    ctx.fillRect(curX - 2, curY, 5, 1);
  }
}

/**
 * Draw Layered Pixel Art Mountain Ranges
 */
export function drawMountainRanges(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number
) {
  // --- LAYER 1: Distant Mountains (Dark purple silhouette) ---
  ctx.fillStyle = '#1e0838';
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(0, baseY - 90);
  ctx.lineTo(45, baseY - 125);
  ctx.lineTo(105, baseY - 85);
  ctx.lineTo(175, baseY - 145);
  ctx.lineTo(250, baseY - 95);
  ctx.lineTo(320, baseY - 140);
  ctx.lineTo(395, baseY - 90);
  ctx.lineTo(470, baseY - 155);
  ctx.lineTo(540, baseY - 110);
  ctx.lineTo(width, baseY - 130);
  ctx.lineTo(width, baseY);
  ctx.closePath();
  ctx.fill();

  // --- LAYER 2: Midground Mountain Peaks with highlighted pixel ridges ---
  ctx.fillStyle = '#2c0c4d';
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(0, baseY - 70);
  ctx.lineTo(35, baseY - 95);
  ctx.lineTo(75, baseY - 65);
  ctx.lineTo(140, baseY - 110);
  ctx.lineTo(205, baseY - 60);
  ctx.lineTo(285, baseY - 105);
  ctx.lineTo(360, baseY - 65);
  ctx.lineTo(430, baseY - 115);
  ctx.lineTo(500, baseY - 75);
  ctx.lineTo(width, baseY - 85);
  ctx.lineTo(width, baseY);
  ctx.closePath();
  ctx.fill();

  // Light highlights on left slopes of midground peaks
  ctx.fillStyle = '#4c1d95';
  const peaks = [
    { x1: 0, y1: baseY - 70, x2: 35, y2: baseY - 95 },
    { x1: 75, y1: baseY - 65, x2: 140, y2: baseY - 110 },
    { x1: 205, y1: baseY - 60, x2: 285, y2: baseY - 105 },
    { x1: 360, y1: baseY - 65, x2: 430, y2: baseY - 115 },
  ];
  for (const p of peaks) {
    ctx.beginPath();
    ctx.moveTo(p.x1, p.y1);
    ctx.lineTo(p.x2, p.y2);
    ctx.lineTo(p.x2, baseY);
    ctx.lineTo(p.x1, baseY);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Draw Pine Forest / Conifer Silhouette along the Horizon
 */
export function drawPineForest(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number
) {
  ctx.fillStyle = '#120524';
  const treeSpacing = 16;
  const numTrees = Math.ceil(width / treeSpacing) + 2;

  for (let i = 0; i < numTrees; i++) {
    const tx = i * treeSpacing - 6;
    const treeHeight = 28 + (i % 3) * 6 + (i % 5) * 4;
    const topY = baseY - treeHeight;

    // Conifer triangles
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.lineTo(tx + 8, topY);
    ctx.lineTo(tx + 16, baseY);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Draw Pixel-Art Grass and Earth/Stone Terrain Blocks
 * Faithfully mirrors the lush green fringe with dirt/cobblestone texture from reference image.
 */
export function drawPixelGround(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hasFlowers = true,
  frame = 0
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // 1. Earth / Dark Stone Underlayer Block
  ctx.fillStyle = '#261208'; // Deep dark rock base
  ctx.fillRect(x, y + 14, w, h - 14);

  // 2. Cobblestone / Dirt Pattern Underneath
  ctx.fillStyle = '#3f1f0d'; // Warm brown dirt blocks
  const tileSize = 16;
  for (let px = x; px < x + w; px += tileSize) {
    for (let py = y + 16; py < y + h; py += tileSize) {
      const isOdd = Math.floor((px - x) / tileSize + (py - y) / tileSize) % 2 === 0;
      if (isOdd) {
        ctx.fillStyle = '#4a2510';
        ctx.fillRect(px + 1, py + 1, Math.min(tileSize - 2, x + w - px - 1), Math.min(tileSize - 2, y + h - py - 1));
        ctx.fillStyle = '#261208';
        ctx.fillRect(px + 4, py + 4, 3, 3);
      } else {
        ctx.fillStyle = '#381c0c';
        ctx.fillRect(px + 1, py + 1, Math.min(tileSize - 2, x + w - px - 1), Math.min(tileSize - 2, y + h - py - 1));
      }
    }
  }

  // 3. Dark Earth-Grass Transition Border
  ctx.fillStyle = '#155e2d';
  ctx.fillRect(x, y + 10, w, 5);

  // 4. Lush Green Pixel Grass Top Fringe
  ctx.fillStyle = '#16a34a'; // Main grass green
  ctx.fillRect(x, y + 2, w, 10);

  // Highlight bright green pixel grass blades
  ctx.fillStyle = '#22c55e'; // Bright blade green
  ctx.fillRect(x, y, w, 4);

  // Pixel grass tufts & overhang fringe along the edge
  ctx.fillStyle = '#4ade80'; // Neon grass tip highlight
  for (let gx = x; gx < x + w; gx += 6) {
    const bladeH = (gx % 12 === 0) ? 5 : 3;
    ctx.fillRect(gx, y - bladeH + 2, 3, bladeH);
  }

  // Grass hanging down into the dirt
  ctx.fillStyle = '#16a34a';
  for (let gx = x + 3; gx < x + w - 4; gx += 8) {
    ctx.fillRect(gx, y + 12, 3, 4);
    ctx.fillRect(gx + 1, y + 16, 2, 2);
  }

  // 5. Scattered Purple/Yellow Pixel Flowers and Pebbles on the grass
  if (hasFlowers) {
    const flowerOffsets = [24, 78, 140, 210, 360, 440, 510];
    for (let i = 0; i < flowerOffsets.length; i++) {
      const fx = x + flowerOffsets[i];
      if (fx < x + w - 10) {
        const isPurple = i % 2 === 0;
        // Flower Petals
        ctx.fillStyle = isPurple ? '#c084fc' : '#facc15';
        ctx.fillRect(fx, y - 5, 4, 4);
        // Flower Center
        ctx.fillStyle = isPurple ? '#ffffff' : '#f97316';
        ctx.fillRect(fx + 1, y - 4, 2, 2);
        // Stem
        ctx.fillStyle = '#15803d';
        ctx.fillRect(fx + 1, y - 1, 2, 3);
      }
    }

    // Small decorative gray rocks/pebbles
    const rockOffsets = [110, 305, 480];
    for (const rx of rockOffsets) {
      if (x + rx < x + w - 12) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + rx, y - 3, 8, 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + rx + 1, y - 4, 5, 2);
      }
    }
  }

  // Dark border for platforms
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  ctx.restore();
}

/**
 * Draw the Magical Golden Portal of Light in Level 3
 * Mirrors the glorious golden light beam and columns from the user's reference image!
 */
export function drawGoldenPortal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frame: number,
  isActive = true
) {
  ctx.save();

  const centerX = x + width / 2;
  const bottomY = y + height;

  // 1. Radiant Golden Light Beam (Shooting straight up into the starry sky!)
  const pulse = Math.sin(frame * 0.08) * 0.12 + 0.88;
  const beamGrad = ctx.createLinearGradient(0, bottomY, 0, y - 90);
  beamGrad.addColorStop(0.0, `rgba(254, 240, 138, ${(0.92 * pulse).toFixed(2)})`);
  beamGrad.addColorStop(0.2, `rgba(250, 204, 21, ${(0.82 * pulse).toFixed(2)})`);
  beamGrad.addColorStop(0.65, `rgba(234, 179, 8, ${(0.45 * pulse).toFixed(2)})`);
  beamGrad.addColorStop(1.0, 'rgba(234, 179, 8, 0)');

  // Outer ambient glow
  const glowGrad = ctx.createRadialGradient(
    centerX,
    bottomY - height / 2,
    10,
    centerX,
    bottomY - height / 2,
    width * 1.4
  );
  glowGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
  glowGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.18)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(x - width * 0.8, y - 100, width * 2.6, height + 110);

  // Vertical light column
  ctx.fillStyle = beamGrad;
  ctx.fillRect(x + 10, y - 75, width - 20, height + 75);

  // Core bright beam
  ctx.fillStyle = `rgba(255, 255, 255, ${(0.6 * pulse).toFixed(2)})`;
  ctx.fillRect(x + 18, y - 60, width - 36, height + 60);

  // 2. Floating Golden Sparkle Crosses (✦)
  const numSparkles = 6;
  for (let i = 0; i < numSparkles; i++) {
    const spSpeed = 0.04 + (i % 3) * 0.02;
    const spOffset = (frame * spSpeed + i * 2) % 1;
    const spY = bottomY - spOffset * (height + 70);
    const spX = centerX + Math.sin(frame * 0.05 + i * 1.5) * (width * 0.28);
    const spAlpha = Math.sin(spOffset * Math.PI) * 0.9;
    const spSize = 3 + (i % 2) * 2;

    ctx.fillStyle = `rgba(255, 255, 255, ${spAlpha.toFixed(2)})`;
    ctx.fillRect(spX - 1, spY - spSize, 2, spSize * 2);
    ctx.fillRect(spX - spSize, spY - 1, spSize * 2, 2);

    ctx.fillStyle = `rgba(254, 240, 138, ${spAlpha.toFixed(2)})`;
    ctx.fillRect(spX, spY, 1, 1);
  }

  // 3. Golden Architectural Archway Columns (Left & Right)
  const colWidth = 10;

  // Base platform step
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x - 4, bottomY - 6, width + 8, 6);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x - 2, bottomY - 6, width + 4, 2);

  // Left Column
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x, y + 6, colWidth, height - 12);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x + 2, y + 6, 3, height - 12);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(x + colWidth - 2, y + 6, 2, height - 12);

  // Left Column Cap & Base
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x - 2, y, colWidth + 4, 8);
  ctx.fillRect(x - 2, bottomY - 10, colWidth + 4, 6);

  // Right Column
  const rx = x + width - colWidth;
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx, y + 6, colWidth, height - 12);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(rx + 2, y + 6, 3, height - 12);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(rx + colWidth - 2, y + 6, 2, height - 12);

  // Right Column Cap & Base
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(rx - 2, y, colWidth + 4, 8);
  ctx.fillRect(rx - 2, bottomY - 10, colWidth + 4, 6);

  // Top Golden Lintel / Arch
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x - 4, y - 6, width + 8, 8);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 2, y - 6, width + 4, 2);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 4, y + 2, width + 8, 2);

  ctx.restore();
}
