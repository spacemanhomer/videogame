import {
  INITIAL_ENEMY_COUNT,
  INITIAL_RELIC_COUNT,
  OBSTACLE_DAMAGE_COOLDOWN,
  SHALLOW_WATER_DAMAGE_CHANCE
} from "./constants.js";
import { fireBuckshot, fireSlingshot, updateEnemies, updateProjectiles } from "./combat.js";
import { seedActiveRuins } from "./encounters.js";
import { createRelic, spawnEnemy } from "./entities.js";
import { collectRelics, replenishNearbySpawns } from "./loot.js";
import { movePlayer } from "./movement.js";
import { collidesWithPainfulObstacle } from "./obstacles.js";
import { copyState, createInitialState } from "./state.js";
import { isPainfulWater } from "./terrain.js";
import { resetWorldSeed } from "./worldSeed.js";
import {
  centerCamera,
  createWorldStores,
  loadWorldAroundPlayer,
  screenToWorld,
  updateCurrentEcosystem
} from "./world.js";

export function resetGame(canvas, existingState = createInitialState()) {
  resetWorldSeed();
  const nextState = createInitialState();

  createWorldStores(nextState);
  refreshWorld(nextState);
  centerCamera(nextState, canvas);
  nextState.relics = Array.from(
    { length: INITIAL_RELIC_COUNT },
    () => createRelic(nextState.player, nextState.obstacles, nextState.level)
  );
  nextState.enemies = Array.from(
    { length: INITIAL_ENEMY_COUNT },
    () => spawnEnemy(nextState.player, nextState.obstacles)
  );

  return copyState(existingState, nextState);
}

export function updateGame(state, { canvas, input, hud }) {
  state.aim = screenToWorld(input.getAimPoint(), state.camera);

  refreshWorld(state);
  updateCurrentEcosystem(state);
  movePlayer(state, input);
  refreshWorld(state);
  updateCurrentEcosystem(state);
  centerCamera(state, canvas);
  fireSlingshot(state, input);
  fireBuckshot(state, input);
  updateProjectiles(state);
  collectRelics(state, hud);
  updateEnemies(state, {
    canvas,
    hud,
    resetGame,
    refreshWorld,
    centerCamera,
    updateCurrentEcosystem
  });
  updateTerrainDamage(state, canvas, hud);
  replenishNearbySpawns(state);
}

function refreshWorld(state) {
  loadWorldAroundPlayer(state);
  seedActiveRuins(state);
}

function updateTerrainDamage(state, canvas, hud) {
  const thornDamage = collidesWithPainfulObstacle(state.player, state.obstacles);
  const shallowWaterDamage = isPainfulWater(state.terrain, state.player) && Math.random() < SHALLOW_WATER_DAMAGE_CHANCE;
  const takesDamage = thornDamage || shallowWaterDamage;

  if (!takesDamage) return;

  const now = Date.now();
  if (now - state.lastObstacleDamageAt < OBSTACLE_DAMAGE_COOLDOWN) return;

  state.health--;
  state.lastObstacleDamageAt = now;

  if (state.health <= 0) resetGame(canvas, state);
  hud.update(state);
}
