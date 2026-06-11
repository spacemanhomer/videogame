import { GRID_COLUMNS, GRID_ROWS, TERRAIN_COLORS, TERRAIN_SPEEDS, TILE_SIZE } from "./constants.js";

export function createTerrain() {
  const terrain = [];

  for (let y = 0; y < GRID_ROWS; y++) {
    terrain[y] = [];

    for (let x = 0; x < GRID_COLUMNS; x++) {
      const value = Math.sin(x * 0.5) + Math.cos(y * 0.4) + Math.random() * 2;
      terrain[y][x] = terrainKindFor(value);
    }
  }

  return terrain;
}

export function terrainAt(terrain, x, y) {
  let tileX = Math.floor(x / TILE_SIZE);
  let tileY = Math.floor(y / TILE_SIZE);

  tileX = Math.max(0, Math.min(GRID_COLUMNS - 1, tileX));
  tileY = Math.max(0, Math.min(GRID_ROWS - 1, tileY));

  return terrain[tileY][tileX];
}

export function terrainSpeedAt(terrain, entity) {
  const kind = terrainAt(terrain, entity.x + entity.size / 2, entity.y + entity.size / 2);
  return TERRAIN_SPEEDS[kind];
}

export function drawTerrain(ctx, terrain) {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      ctx.fillStyle = TERRAIN_COLORS[terrain[y][x]];
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

function terrainKindFor(value) {
  if (value > 3) return 1;
  if (value > 2) return 2;
  if (value > 1) return 0;
  if (value > 0) return 3;
  return 4;
}
