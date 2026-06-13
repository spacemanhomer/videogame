export const TILE_SIZE = 20;
export const GRID_COLUMNS = 60;
export const GRID_ROWS = 38;
export const CHUNK_SIZE_TILES = 16;
export const ACTIVE_CHUNK_RADIUS = 3;
export const SPAWN_RADIUS = 780;
export const DESPAWN_RADIUS = 1800;

export const PLAYER_START = Object.freeze({ x: 80, y: 80 });
export const PLAYER_BASE_SPEED = 4;
export const PLAYER_MAX_HEALTH = 8;
export const PLAYER_LEVEL_HEAL_RATIO = 0.35;
export const PLAYER_HEALTH_FIBONACCI_OFFSET = 5;
export const PLAYER_SPEED_PER_LEVEL = 0.08;
export const PLAYER_DAMAGE_LEVEL_STEP = 2;
export const PLAYER_GLYPH = "𓀠";
export const ENEMY_GLYPH = "𓋹";
export const LEVEL_UP_INTERVAL = 3;
export const RELIC_LOW_VALUE_MULTIPLIER = 1.5;
export const RELIC_HIGH_VALUE_MULTIPLIER = 4;
export const INITIAL_ENEMY_COUNT = 4;
export const INITIAL_RELIC_COUNT = 4;
export const MAX_RELIC_COUNT = 8;
export const ENEMIES_PER_LEVEL = 2;
export const HORDE_LEVEL = 5;
export const HORDE_ENEMIES_PER_LEVEL = 4;

export const ENEMY_SEEK_SPEED = 1.65;
export const ENEMY_CONTACT_COOLDOWN = 850;
export const ENEMY_CONTACT_KNOCKBACK = 34;

export const SHOT_COOLDOWN = 280;
export const SHOT_RANGE = 220;
export const SHOT_SIZE = 6;
export const SHOT_SPEED = 8;

export const BUCKSHOT_COOLDOWN = 900;
export const BUCKSHOT_PELLETS = 9;
export const BUCKSHOT_SPREAD = 0.58;
export const BUCKSHOT_RANGE = 170;
export const BUCKSHOT_SIZE = 5;
export const BUCKSHOT_SPEED = 10;

export const OBSTACLE_DAMAGE_COOLDOWN = 900;
export const SHALLOW_WATER_DAMAGE_CHANCE = 0.01;

export const TERRAIN_COLORS = ["#24452b", "#3f6636", "#8b7440", "#4b3024", "#626262"];
export const TERRAIN_SPEEDS = [1, 1.12, 0.85, 0.55, 1.3];
