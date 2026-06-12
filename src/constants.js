export const TILE_SIZE = 20;
export const GRID_COLUMNS = 40;
export const GRID_ROWS = 25;
export const CHUNK_SIZE_TILES = 16;
export const ACTIVE_CHUNK_RADIUS = 2;
export const SPAWN_RADIUS = 520;
export const DESPAWN_RADIUS = 1200;

export const PLAYER_START = Object.freeze({ x: 80, y: 80 });
export const PLAYER_BASE_SPEED = 4;
export const PLAYER_GLYPH = "♘";
export const ENEMY_GLYPH = "☥";
export const LEVEL_UP_INTERVAL = 3;
export const INITIAL_ENEMY_COUNT = 3;
export const INITIAL_RELIC_COUNT = 4;
export const MAX_RELIC_COUNT = 8;
export const ENEMIES_PER_LEVEL = 2;

export const ENEMY_SEEK_SPEED = 1.65;

export const SHOT_COOLDOWN = 280;
export const SHOT_RANGE = 220;
export const SHOT_SIZE = 6;
export const SHOT_SPEED = 8;

export const OBSTACLE_DAMAGE_COOLDOWN = 900;

export const TERRAIN_COLORS = ["#24452b", "#3f6636", "#8b7440", "#4b3024", "#626262"];
export const TERRAIN_SPEEDS = [1, 1.12, 0.85, 0.55, 1.3];
