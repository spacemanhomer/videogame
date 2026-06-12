import {
  DESPAWN_RADIUS,
  ENEMIES_PER_LEVEL,
  ENEMY_SEEK_SPEED,
  INITIAL_ENEMY_COUNT,
  INITIAL_RELIC_COUNT,
  LEVEL_UP_INTERVAL,
  MAX_RELIC_COUNT,
  OBSTACLE_DAMAGE_COOLDOWN,
  PLAYER_BASE_SPEED,
  SHOT_COOLDOWN,
  SHOT_RANGE,
  SHOT_SIZE,
  SHOT_SPEED
} from "./constants.js";
import { createRelic, placeRelic, resetPlayer, spawnEnemy, touches } from "./entities.js";
import { activeObstacles, collidesWithPainfulObstacle, collidesWithSolidObstacle, createObstacleChunks, updateObstacleChunks } from "./obstacles.js";
import { copyState, createInitialState } from "./state.js";
import { createTerrainChunks, terrainSpeedAt, updateTerrainChunks } from "./terrain.js";

export function resetGame(canvas, existingState = createInitialState()) {
  const nextState = createInitialState();

  nextState.terrain = createTerrainChunks();
  nextState.obstacleChunks = createObstacleChunks();
  loadWorldAroundPlayer(nextState);
  centerCamera(nextState, canvas);
  nextState.relics = Array.from(
    { length: INITIAL_RELIC_COUNT },
    () => createRelic(nextState.player, nextState.obstacles)
  );
  nextState.enemies = Array.from(
    { length: INITIAL_ENEMY_COUNT },
    () => spawnEnemy(nextState.player, nextState.obstacles)
  );

  return copyState(existingState, nextState);
}

export function updateGame(state, { canvas, input, hud }) {
  state.aim = screenToWorld(input.getAimPoint(), state.camera);

  loadWorldAroundPlayer(state);
  movePlayer(state, input);
  loadWorldAroundPlayer(state);
  centerCamera(state, canvas);
  fireSlingshot(state, input);
  updateProjectiles(state);
  collectRelics(state, hud);
  updateEnemies(state, hud);
  updateObstacleDamage(state, canvas, hud);
  replenishNearbySpawns(state);
}

function loadWorldAroundPlayer(state) {
  updateTerrainChunks(state.terrain, state.player);
  updateObstacleChunks(state.obstacleChunks, state.player);
  state.obstacles = activeObstacles(state.obstacleChunks);
}

function centerCamera(state, canvas) {
  state.camera.x = state.player.x + state.player.size / 2 - canvas.width / 2;
  state.camera.y = state.player.y + state.player.size / 2 - canvas.height / 2;
}

function movePlayer(state, input) {
  const speed = PLAYER_BASE_SPEED * terrainSpeedAt(state.terrain, state.player);
  const next = { ...state.player };

  if (input.isPressed("w", "arrowup")) next.y -= speed;
  if (input.isPressed("s", "arrowdown")) next.y += speed;
  if (input.isPressed("a", "arrowleft")) next.x -= speed;
  if (input.isPressed("d", "arrowright")) next.x += speed;

  const xMove = { ...state.player, x: next.x };
  if (!collidesWithSolidObstacle(xMove, state.obstacles)) state.player.x = next.x;

  const yMove = { ...state.player, y: next.y };
  if (!collidesWithSolidObstacle(yMove, state.obstacles)) state.player.y = next.y;
}

function fireSlingshot(state, input) {
  if (!input.consumePressed("space")) return;

  const now = Date.now();
  if (now - state.lastShotAt < SHOT_COOLDOWN) return;

  const origin = centerOf(state.player);
  const dx = state.aim.x - origin.x;
  const dy = state.aim.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;

  state.projectiles.push({
    x: origin.x - SHOT_SIZE / 2,
    y: origin.y - SHOT_SIZE / 2,
    size: SHOT_SIZE,
    vx: (dx / distance) * SHOT_SPEED,
    vy: (dy / distance) * SHOT_SPEED,
    traveled: 0
  });

  state.lastShotAt = now;
}

function updateProjectiles(state) {
  const remainingProjectiles = [];

  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.traveled += Math.hypot(projectile.vx, projectile.vy);

    if (
      projectile.traveled > SHOT_RANGE ||
      collidesWithSolidObstacle(projectile, state.obstacles)
    ) {
      continue;
    }

    const hitIndex = state.enemies.findIndex(enemy => touches(projectile, enemy));
    if (hitIndex !== -1) {
      state.enemies.splice(hitIndex, 1);
      continue;
    }

    remainingProjectiles.push(projectile);
  }

  state.projectiles = remainingProjectiles;
}

function collectRelics(state, hud) {
  let collected = false;

  for (const relic of state.relics) {
    if (!touches(state.player, relic)) continue;

    state.score++;
    collected = true;
    placeRelic(relic, state.player, state.obstacles);

    if (state.score % LEVEL_UP_INTERVAL === 0) {
      state.level++;
      addEnemies(state, ENEMIES_PER_LEVEL);

      if (state.relics.length < MAX_RELIC_COUNT) {
        state.relics.push(createRelic(state.player, state.obstacles));
      }
    }
  }

  if (collected) hud.update(state);
}

function updateEnemies(state, hud) {
  for (const enemy of state.enemies) {
    seekPlayer(enemy, state.player);
    moveEnemy(enemy, state.obstacles);

    if (touches(state.player, enemy)) {
      state.health--;
      resetPlayer(state.player);
      loadWorldAroundPlayer(state);

      if (state.health <= 0) resetGame({ width: 800, height: 500 }, state);
      hud.update(state);
    }
  }
}

function updateObstacleDamage(state, canvas, hud) {
  if (!collidesWithPainfulObstacle(state.player, state.obstacles)) return;

  const now = Date.now();
  if (now - state.lastObstacleDamageAt < OBSTACLE_DAMAGE_COOLDOWN) return;

  state.health--;
  state.lastObstacleDamageAt = now;

  if (state.health <= 0) resetGame(canvas, state);
  hud.update(state);
}

function replenishNearbySpawns(state) {
  state.relics = state.relics.map(relic => (
    distanceBetween(relic, state.player) > DESPAWN_RADIUS
      ? createRelic(state.player, state.obstacles)
      : relic
  ));

  state.enemies = state.enemies.map(enemy => (
    distanceBetween(enemy, state.player) > DESPAWN_RADIUS
      ? spawnEnemy(state.player, state.obstacles)
      : enemy
  ));
}

function seekPlayer(enemy, player) {
  const enemyCenter = centerOf(enemy);
  const playerCenter = centerOf(player);
  const dx = playerCenter.x - enemyCenter.x;
  const dy = playerCenter.y - enemyCenter.y;
  const distance = Math.hypot(dx, dy) || 1;

  enemy.vx = (dx / distance) * ENEMY_SEEK_SPEED;
  enemy.vy = (dy / distance) * ENEMY_SEEK_SPEED;
}

function moveEnemy(enemy, obstacles) {
  const xMove = { ...enemy, x: enemy.x + enemy.vx };

  if (!collidesWithSolidObstacle(xMove, obstacles)) {
    enemy.x = xMove.x;
  }

  const yMove = { ...enemy, y: enemy.y + enemy.vy };

  if (!collidesWithSolidObstacle(yMove, obstacles)) {
    enemy.y = yMove.y;
  }
}

function addEnemies(state, count) {
  for (let index = 0; index < count; index++) {
    state.enemies.push(spawnEnemy(state.player, state.obstacles));
  }
}

function screenToWorld(point, camera) {
  return {
    x: point.x + camera.x,
    y: point.y + camera.y
  };
}

function centerOf(entity) {
  return {
    x: entity.x + entity.size / 2,
    y: entity.y + entity.size / 2
  };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
