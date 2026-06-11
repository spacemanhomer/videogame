import { PLAYER_START } from "./constants.js";

export function createInitialState() {
  return {
    terrain: [],
    obstacles: [],
    score: 0,
    health: 3,
    level: 1,
    player: { x: PLAYER_START.x, y: PLAYER_START.y, size: 20 },
    relics: [],
    enemies: [],
    projectiles: [],
    aim: { x: PLAYER_START.x + 80, y: PLAYER_START.y },
    lastShotAt: 0,
    lastObstacleDamageAt: 0
  };
}

export function copyState(target, source) {
  target.terrain = source.terrain;
  target.obstacles = source.obstacles;
  target.score = source.score;
  target.health = source.health;
  target.level = source.level;
  target.player = source.player;
  target.relics = source.relics;
  target.enemies = source.enemies;
  target.projectiles = source.projectiles;
  target.aim = source.aim;
  target.lastShotAt = source.lastShotAt;
  target.lastObstacleDamageAt = source.lastObstacleDamageAt;

  return target;
}
