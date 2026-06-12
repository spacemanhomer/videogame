import { ACTIVE_CHUNK_RADIUS, CHUNK_SIZE_TILES, PLAYER_START, TILE_SIZE } from "./constants.js";
import { seededNoise } from "./worldSeed.js";

const CHUNK_SIZE_PIXELS = CHUNK_SIZE_TILES * TILE_SIZE;
const HIEROGLYPHS = ["𓂀", "𓊽", "𓉐", "𓃭", "𓆣", "𓋹", "𓎛", "𓇳"];
const PURPLE_RUNES = ["✧", "✦", "◇", "◆", "◈", "☌", "☉", "☽"];
const OBSTACLE_TYPES = Object.freeze({
  cactus: { kind: "solid", symbol: "▥", color: "#5fbf6a", label: "cactus wall" },
  thorns: { kind: "painful", symbol: "♣", color: "#d85f72", label: "thorny bush" },
  stone: { kind: "solid", symbol: "▣", color: "#8a8f98", label: "stone block" },
  hieroglyph: { kind: "solid", symbol: "𓋹", color: "#f1d28a", label: "glyph ruin" },
  rune: { kind: "decorative", symbol: "✧", color: "#c079ff", label: "purple rune" }
});

export function createObstacleChunks() {
  return new Map();
}

export function updateObstacleChunks(chunks, player) {
  const centerChunk = chunkForWorld(player.x, player.y);
  const keep = new Set();

  for (let y = centerChunk.y - ACTIVE_CHUNK_RADIUS; y <= centerChunk.y + ACTIVE_CHUNK_RADIUS; y++) {
    for (let x = centerChunk.x - ACTIVE_CHUNK_RADIUS; x <= centerChunk.x + ACTIVE_CHUNK_RADIUS; x++) {
      const key = chunkKey(x, y);
      keep.add(key);

      if (!chunks.has(key)) chunks.set(key, createObstacleChunk(x, y));
    }
  }

  for (const key of chunks.keys()) {
    if (!keep.has(key)) chunks.delete(key);
  }
}

export function activeObstacles(chunks) {
  return [...chunks.values()].flatMap(chunk => chunk.obstacles);
}

export function drawObstacles(ctx, obstacles, camera) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const obstacle of obstacles) {
    const screenX = obstacle.x - camera.x;
    const screenY = obstacle.y - camera.y;

    if (obstacle.structure === "glyph-ruin") {
      ctx.fillStyle = "rgba(18, 12, 5, 0.18)";
      ctx.fillRect(screenX + 2, screenY + 2, obstacle.size - 4, obstacle.size - 4);
      ctx.font = "20px 'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
    } else if (obstacle.structure === "purple-rune") {
      ctx.fillStyle = "rgba(92, 31, 128, 0.18)";
      ctx.beginPath();
      ctx.arc(screenX + obstacle.size / 2, screenY + obstacle.size / 2, obstacle.size * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "18px Georgia, 'Times New Roman', serif";
    } else {
      ctx.fillStyle = obstacle.kind === "solid" ? "rgba(0, 0, 0, 0.35)" : "rgba(90, 0, 25, 0.3)";
      ctx.fillRect(screenX, screenY, obstacle.size, obstacle.size);
      ctx.font = "18px monospace";
    }

    ctx.fillStyle = obstacle.color;
    ctx.fillText(obstacle.symbol, screenX + obstacle.size / 2, screenY + obstacle.size / 2 + 1);
  }

  ctx.restore();
}

export function collidesWithSolidObstacle(rect, obstacles) {
  return obstacles.some(obstacle => obstacle.kind === "solid" && rectsOverlap(rect, obstacle));
}

export function collidesWithPainfulObstacle(rect, obstacles) {
  return obstacles.some(obstacle => obstacle.kind === "painful" && rectsOverlap(rect, obstacle));
}

function createObstacleChunk(chunkX, chunkY) {
  const obstacles = [];

  addGeneratedRun(obstacles, chunkX, chunkY, "cactus", 0);
  addGeneratedRun(obstacles, chunkX, chunkY, "cactus", 1);
  addGeneratedCluster(obstacles, chunkX, chunkY, "thorns", 2);
  addGeneratedCluster(obstacles, chunkX, chunkY, "stone", 3);
  addGlyphRuin(obstacles, chunkX, chunkY);

  return { x: chunkX, y: chunkY, obstacles };
}

function addGeneratedRun(obstacles, chunkX, chunkY, type, salt) {
  if (seededNoise(chunkX, chunkY, salt) < 0.45) return;

  const startX = Math.floor(seededNoise(chunkX, chunkY, salt + 10) * (CHUNK_SIZE_TILES - 5));
  const startY = Math.floor(seededNoise(chunkX, chunkY, salt + 20) * (CHUNK_SIZE_TILES - 5));
  const horizontal = seededNoise(chunkX, chunkY, salt + 30) > 0.5;
  const length = 3 + Math.floor(seededNoise(chunkX, chunkY, salt + 40) * 4);

  for (let index = 0; index < length; index++) {
    addObstacle(obstacles, type, chunkX, chunkY, startX + (horizontal ? index : 0), startY + (horizontal ? 0 : index));
  }
}

function addGeneratedCluster(obstacles, chunkX, chunkY, type, salt) {
  if (seededNoise(chunkX, chunkY, salt) < 0.35) return;

  const baseX = Math.floor(seededNoise(chunkX, chunkY, salt + 50) * (CHUNK_SIZE_TILES - 3));
  const baseY = Math.floor(seededNoise(chunkX, chunkY, salt + 60) * (CHUNK_SIZE_TILES - 3));
  const tiles = [[0, 0], [1, 0], [0, 1]];

  for (const [dx, dy] of tiles) {
    if (seededNoise(chunkX + dx, chunkY + dy, salt + 70) > 0.18) {
      addObstacle(obstacles, type, chunkX, chunkY, baseX + dx, baseY + dy);
    }
  }
}

function addGlyphRuin(obstacles, chunkX, chunkY) {
  if (seededNoise(chunkX, chunkY, 100) < 0.72) return;

  const width = 5 + Math.floor(seededNoise(chunkX, chunkY, 101) * 5);
  const height = 4 + Math.floor(seededNoise(chunkX, chunkY, 102) * 4);
  const baseX = Math.floor(seededNoise(chunkX, chunkY, 103) * (CHUNK_SIZE_TILES - width));
  const baseY = Math.floor(seededNoise(chunkX, chunkY, 104) * (CHUNK_SIZE_TILES - height));
  const gapSide = Math.floor(seededNoise(chunkX, chunkY, 105) * 4);
  const gapOffset = 1 + Math.floor(seededNoise(chunkX, chunkY, 106) * Math.max(1, (gapSide < 2 ? width : height) - 2));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const onTop = y === 0;
      const onBottom = y === height - 1;
      const onLeft = x === 0;
      const onRight = x === width - 1;
      const onWall = onTop || onBottom || onLeft || onRight;
      const isGap =
        (gapSide === 0 && onTop && x === gapOffset) ||
        (gapSide === 1 && onBottom && x === gapOffset) ||
        (gapSide === 2 && onLeft && y === gapOffset) ||
        (gapSide === 3 && onRight && y === gapOffset);

      if (onWall && !isGap) {
        addGlyphObstacle(obstacles, chunkX, chunkY, baseX + x, baseY + y, x, y);
      } else if (!onWall && seededNoise(chunkX + x, chunkY + y, 108) > 0.42) {
        addPurpleRune(obstacles, chunkX, chunkY, baseX + x, baseY + y, x, y);
      }
    }
  }
}

function addObstacle(obstacles, type, chunkX, chunkY, localTileX, localTileY) {
  const obstacle = {
    ...OBSTACLE_TYPES[type],
    x: (chunkX * CHUNK_SIZE_TILES + localTileX) * TILE_SIZE,
    y: (chunkY * CHUNK_SIZE_TILES + localTileY) * TILE_SIZE,
    size: TILE_SIZE
  };

  if (Math.hypot(obstacle.x - PLAYER_START.x, obstacle.y - PLAYER_START.y) > 160) {
    obstacles.push(obstacle);
  }
}

function addGlyphObstacle(obstacles, chunkX, chunkY, localTileX, localTileY, dx, dy) {
  const glyphIndex = Math.floor(seededNoise(chunkX + dx, chunkY + dy, 107) * HIEROGLYPHS.length);
  const obstacle = {
    ...OBSTACLE_TYPES.hieroglyph,
    symbol: HIEROGLYPHS[glyphIndex],
    x: (chunkX * CHUNK_SIZE_TILES + localTileX) * TILE_SIZE,
    y: (chunkY * CHUNK_SIZE_TILES + localTileY) * TILE_SIZE,
    size: TILE_SIZE,
    structure: "glyph-ruin"
  };

  if (Math.hypot(obstacle.x - PLAYER_START.x, obstacle.y - PLAYER_START.y) > 180) {
    obstacles.push(obstacle);
  }
}

function addPurpleRune(obstacles, chunkX, chunkY, localTileX, localTileY, dx, dy) {
  const runeIndex = Math.floor(seededNoise(chunkX + dx, chunkY + dy, 109) * PURPLE_RUNES.length);
  const obstacle = {
    ...OBSTACLE_TYPES.rune,
    symbol: PURPLE_RUNES[runeIndex],
    x: (chunkX * CHUNK_SIZE_TILES + localTileX) * TILE_SIZE,
    y: (chunkY * CHUNK_SIZE_TILES + localTileY) * TILE_SIZE,
    size: TILE_SIZE,
    structure: "purple-rune"
  };

  if (Math.hypot(obstacle.x - PLAYER_START.x, obstacle.y - PLAYER_START.y) > 180) {
    obstacles.push(obstacle);
  }
}

function chunkForWorld(x, y) {
  return {
    x: Math.floor(x / CHUNK_SIZE_PIXELS),
    y: Math.floor(y / CHUNK_SIZE_PIXELS)
  };
}

function chunkKey(x, y) {
  return `${x},${y}`;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}
