import {
  ACTIVE_CHUNK_RADIUS,
  CHUNK_SIZE_TILES,
  TILE_SIZE
} from "./constants.js";
import { ecosystemAt, materialFor } from "./ecosystems.js";
import { seededNoise } from "./worldSeed.js";

const CHUNK_SIZE_PIXELS = CHUNK_SIZE_TILES * TILE_SIZE;
const WATER_KIND = 5;

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

export function terrainMaterialAt(chunks, x, y) {
  const ecosystem = ecosystemAt(x, y);
  return materialFor(ecosystem, terrainAt(chunks, x, y));
}

export function terrainSpeedAt(chunks, entity) {
  return terrainMaterialAt(chunks, entity.x + entity.size / 2, entity.y + entity.size / 2).speed;
}

export function isImpassableWater(chunks, rect) {
  return waterMassAtRect(chunks, rect) >= 3;
}

export function isPainfulWater(chunks, rect) {
  return waterMassAtRect(chunks, rect) === 2;
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
      const material = materialFor(ecosystemAt(worldX, worldY), kind);

      ctx.fillStyle = material.color;
      ctx.fillRect(
        Math.floor(worldX - state.camera.x),
        Math.floor(worldY - state.camera.y),
        TILE_SIZE,
        TILE_SIZE
      );

      if (kind === WATER_KIND) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.fillRect(
          Math.floor(worldX - state.camera.x),
          Math.floor(worldY - state.camera.y + TILE_SIZE / 2),
          TILE_SIZE,
          2
        );
      }
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

function waterMassAtRect(chunks, rect) {
  const points = [
    { x: rect.x + rect.size / 2, y: rect.y + rect.size / 2 },
    { x: rect.x + 2, y: rect.y + rect.size / 2 },
    { x: rect.x + rect.size - 2, y: rect.y + rect.size / 2 },
    { x: rect.x + rect.size / 2, y: rect.y + 2 },
    { x: rect.x + rect.size / 2, y: rect.y + rect.size - 2 }
  ];

  return Math.max(...points.map(point => connectedWaterMassAtPoint(chunks, point.x, point.y)));
}

function connectedWaterMassAtPoint(chunks, x, y) {
  const start = {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE)
  };

  if (terrainKindAtTile(start.x, start.y) !== WATER_KIND) return 0;

  const seen = new Set();
  const queue = [start];

  while (queue.length > 0 && seen.size < 3) {
    const tile = queue.shift();
    const key = `${tile.x},${tile.y}`;

    if (seen.has(key) || terrainKindAtTile(tile.x, tile.y) !== WATER_KIND) continue;
    seen.add(key);

    queue.push(
      { x: tile.x + 1, y: tile.y },
      { x: tile.x - 1, y: tile.y },
      { x: tile.x, y: tile.y + 1 },
      { x: tile.x, y: tile.y - 1 }
    );
  }

  return seen.size;
}

function terrainKindAtWorld(x, y) {
  return terrainKindAtTile(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

function terrainKindAtTile(tileX, tileY) {
  if (isWaterTile(tileX, tileY)) return WATER_KIND;

  const value =
    Math.sin(tileX * 0.23 + seededNoise(0, 0, 21)) +
    Math.cos(tileY * 0.19 + seededNoise(0, 0, 22)) +
    seededNoise(tileX, tileY, 23) * 2;

  if (value > 3) return 1;
  if (value > 2) return 2;
  if (value > 1) return 0;
  if (value > 0) return 3;
  return 4;
}

function isWaterTile(tileX, tileY) {
  const riverA = Math.abs(tileY - Math.round(Math.sin(tileX * 0.075 + seededNoise(0, 0, 31)) * 12 + seededNoise(Math.floor(tileX / 16), 7, 32) * 16));
  const riverB = Math.abs(tileX - Math.round(Math.cos(tileY * 0.065 + seededNoise(0, 0, 33)) * 15 + seededNoise(11, Math.floor(tileY / 16), 34) * 18));
  const lake = seededNoise(Math.floor(tileX / 9), Math.floor(tileY / 9), 35) > 0.86 && seededNoise(tileX, tileY, 36) > 0.45;

  return riverA < waterBand(tileX, 37) || riverB < waterBand(tileY, 38) || lake;
}

function waterBand(tile, salt) {
  return 1 + Math.floor(seededNoise(Math.floor(tile / 24), salt, 39) * 3);
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
