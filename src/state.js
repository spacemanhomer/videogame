import { PLAYER_START } from "./constants.js";

export function createInitialState() {
  return {
    terrain: [],
    score: 0,
    health: 3,
    level: 1,
    player: { x: PLAYER_START.x, y: PLAYER_START.y, size: 20 },
    relic: { x: 400, y: 240, size: 14 },
    enemies: []
  };
}

export function copyState(target, source) {
  target.terrain = source.terrain;
  target.score = source.score;
  target.health = source.health;
  target.level = source.level;
  target.player = source.player;
  target.relic = source.relic;
  target.enemies = source.enemies;

  return target;
}
