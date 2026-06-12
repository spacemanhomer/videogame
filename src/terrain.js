import {
  ACTIVE_CHUNK_RADIUS,
  CHUNK_SIZE_TILES,
  TERRAIN_COLORS,
  TERRAIN_SPEEDS,
  TILE_SIZE
} from "./constants.js";

const CHUNK_SIZE_PIXELS = CHUNK_SIZE_TILES * TILE_SIZE;

export function createTerrainChunks() {
  return new Map();
}

export function updateTerrainChunks(chunks, player) {
  const centerChunk = chunkForWorld(player.x, player.y);
  const keep = new Set();

  for (let y = centerChunk.y - ACTIVE_CHUNK_RADIUS; y <= centerChunk.y + ACTIVE_CHUNK_RADIUS; y++) {
    for (let x = centerChunk.x - ACTIVE_CHUNK_RADIUS; x <= centerChunk.x + ACTIVE_CHUNK_RADIUS; x++) {
      const key = chunkKey(x, y);
      keep.add(key);

      if (!chunks.has(key)) {
        chunks.set(key, createChunk(x, y));
      }
    }
  }

  for (const key of chunks.keys()) {
    if (!keep.has(key)) chunks.delete(key);
  }
}

export function terrainAt(_chunks, x, y) {
  return terrainKindAtWorld(x, y);
}

export function terrainSpeedAt(chunks, entity) {
  const kind = terrainAt(chunks, entity.x + entity.size / 2, entity.y + entity.size / 2);
  return TERRAIN_SPEEDS[kind];
}

export function drawTerrain(ctx, state, canvas) {
  const startTileX = Math.floor(state.camera.x / TILE_SIZE) - 1;
  const startTileY = Math.floor(state.camera.y / TILE_SIZE) - 1;
  const endTileX = Math.ceil((state.camera.x + canvas.width) / TILE_SIZE) + 1;
  const endTileY = Math.ceil((state.camera.y + canvas.height) / TILE_SIZE) + 1;

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      const worldX = tileX * TILE_SIZE;
      const worldY = tileY * TILE_SIZE;
      const kind = terrainKindAtTile(tileX, tileY);

      ctx.fillStyle = TERRAIN_COLORS[kind];
      ctx.fillRect(
        Math.floor(worldX - state.camera.x),
        Math.floor(worldY - state.camera.y),
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

function createChunk(chunkX, chunkY) {
  const tiles = [];

  for (let y = 0; y < CHUNK_SIZE_TILES; y++) {
    tiles[y] = [];

    for (let x = 0; x < CHUNK_SIZE_TILES; x++) {
      const worldTileX = chunkX * CHUNK_SIZE_TILES + x;
      const worldTileY = chunkY * CHUNK_SIZE_TILES + y;
      tiles[y][x] = terrainKindAtTile(worldTileX, worldTileY);
    }
  }

  return { x: chunkX, y: chunkY, tiles };
}

function terrainKindAtWorld(x, y) {
  return terrainKindAtTile(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

function terrainKindAtTile(tileX, tileY) {
  const value =
    Math.sin(tileX * 0.23) +
    Math.cos(tileY * 0.19) +
    seededNoise(tileX, tileY) * 2;

  if (value > 3) return 1;
  if (value > 2) return 2;
  if (value > 1) return 0;
  if (value > 0) return 3;
  return 4;
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

function seededNoise(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
