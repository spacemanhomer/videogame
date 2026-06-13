import { PLAYER_MAX_HEALTH, PLAYER_START } from "./constants.js";
import { getWorldSeed } from "./worldSeed.js";

export function createInitialState() {
  return {
    worldSeed: getWorldSeed(),
    terrain: new Map(),
    obstacleChunks: new Map(),
    obstacles: [],
    ruins: [],
    spawnedRuinIds: new Set(),
    collectedRuinGemIds: new Set(),
    camera: { x: 0, y: 0 },
    currentEcosystem: "scrub",
    score: 0,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    level: 1,
    player: { x: PLAYER_START.x, y: PLAYER_START.y, size: 20 },
    relics: [],
    enemies: [],
    projectiles: [],
    aim: { x: PLAYER_START.x + 80, y: PLAYER_START.y },
    lastShotAt: 0,
    lastBuckshotAt: 0,
    lastEnemyDamageAt: 0,
    lastObstacleDamageAt: 0
  };
}

export function copyState(target, source) {
  target.worldSeed = source.worldSeed;
  target.terrain = source.terrain;
  target.obstacleChunks = source.obstacleChunks;
  target.obstacles = source.obstacles;
  target.ruins = source.ruins;
  target.spawnedRuinIds = source.spawnedRuinIds;
  target.collectedRuinGemIds = source.collectedRuinGemIds;
  target.camera = source.camera;
  target.currentEcosystem = source.currentEcosystem;
  target.score = source.score;
  target.health = source.health;
  target.maxHealth = source.maxHealth;
  target.level = source.level;
  target.player = source.player;
  target.relics = source.relics;
  target.enemies = source.enemies;
  target.projectiles = source.projectiles;
  target.aim = source.aim;
  target.lastShotAt = source.lastShotAt;
  target.lastBuckshotAt = source.lastBuckshotAt;
  target.lastEnemyDamageAt = source.lastEnemyDamageAt;
  target.lastObstacleDamageAt = source.lastObstacleDamageAt;

  return target;
}
