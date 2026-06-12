import { ACTIVE_CHUNK_RADIUS, CHUNK_SIZE_TILES, PLAYER_START, TILE_SIZE } from "./constants.js";

const CHUNK_SIZE_PIXELS = CHUNK_SIZE_TILES * TILE_SIZE;
const OBSTACLE_TYPES = Object.freeze({
  cactus: { kind: "solid", symbol: "▥", color: "#5fbf6a", label: "cactus wall" },
  thorns: { kind: "painful", symbol: "♣", color: "#d85f72", label: "thorny bush" },
  stone: { kind: "solid", symbol: "▣", color: "#8a8f98", label: "stone block" }
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
  ctx.font = "18px monospace";

  for (const obstacle of obstacles) {
    const screenX = obstacle.x - camera.x;
    const screenY = obstacle.y - camera.y;

    ctx.fillStyle = obstacle.kind === "solid" ? "rgba(0, 0, 0, 0.35)" : "rgba(90, 0, 25, 0.3)";
    ctx.fillRect(screenX, screenY, obstacle.size, obstacle.size);

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

function seededNoise(x, y, salt) {
  const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
  return value - Math.floor(value);
}
