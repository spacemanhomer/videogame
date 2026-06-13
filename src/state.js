import { PLAYER_MAX_HEALTH, PLAYER_START } from "./constants.js";
import { getWorldSeed } from "./worldSeed.js";

export function createInitialState() {
  return {
    worldSeed: getWorldSeed(),
    terrain: new Map(),
    obstacleChunks: new Map(),
    obstacles: [],
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
    lastObstacleDamageAt: 0
  };
}

export function copyState(target, source) {
  target.worldSeed = source.worldSeed;
  target.terrain = source.terrain;
  target.obstacleChunks = source.obstacleChunks;
  target.obstacles = source.obstacles;
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
  target.lastObstacleDamageAt = source.lastObstacleDamageAt;

  return target;
}
