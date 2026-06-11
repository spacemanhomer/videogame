import {
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
import { collidesWithPainfulObstacle, collidesWithSolidObstacle, createObstacles } from "./obstacles.js";
import { copyState, createInitialState } from "./state.js";
import { createTerrain, terrainSpeedAt } from "./terrain.js";

export function resetGame(canvas, existingState = createInitialState()) {
  const nextState = createInitialState();

  nextState.terrain = createTerrain();
  nextState.obstacles = createObstacles(canvas);
  nextState.relics = Array.from(
    { length: INITIAL_RELIC_COUNT },
    () => createRelic(canvas, nextState.obstacles)
  );
  nextState.enemies = Array.from(
    { length: INITIAL_ENEMY_COUNT },
    () => spawnEnemy(canvas, nextState.obstacles)
  );

  return copyState(existingState, nextState);
}

export function updateGame(state, { canvas, input, hud }) {
  state.aim = input.getAimPoint();

  movePlayer(state, canvas, input);
  fireSlingshot(state, input);
  updateProjectiles(state, canvas);
  collectRelics(state, canvas, hud);
  updateEnemies(state, canvas, hud);
  updateObstacleDamage(state, canvas, hud);
}

function movePlayer(state, canvas, input) {
  const speed = PLAYER_BASE_SPEED * terrainSpeedAt(state.terrain, state.player);
  const next = { ...state.player };

  if (input.isPressed("w", "arrowup")) next.y -= speed;
  if (input.isPressed("s", "arrowdown")) next.y += speed;
  if (input.isPressed("a", "arrowleft")) next.x -= speed;
  if (input.isPressed("d", "arrowright")) next.x += speed;

  next.x = Math.max(0, Math.min(canvas.width - state.player.size, next.x));
  next.y = Math.max(0, Math.min(canvas.height - state.player.size, next.y));

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

function updateProjectiles(state, canvas) {
  const remainingProjectiles = [];

  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.traveled += Math.hypot(projectile.vx, projectile.vy);

    if (
      projectile.traveled > SHOT_RANGE ||
      projectile.x < 0 ||
      projectile.y < 0 ||
      projectile.x > canvas.width ||
      projectile.y > canvas.height ||
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

function collectRelics(state, canvas, hud) {
  let collected = false;

  for (const relic of state.relics) {
    if (!touches(state.player, relic)) continue;

    state.score++;
    collected = true;
    placeRelic(relic, canvas, state.obstacles);

    if (state.score % LEVEL_UP_INTERVAL === 0) {
      state.level++;
      addEnemies(state, canvas, ENEMIES_PER_LEVEL);

      if (state.relics.length < MAX_RELIC_COUNT) {
        state.relics.push(createRelic(canvas, state.obstacles));
      }
    }
  }

  if (collected) hud.update(state);
}

function updateEnemies(state, canvas, hud) {
  for (const enemy of state.enemies) {
    seekPlayer(enemy, state.player);
    moveEnemy(enemy, state.obstacles, canvas);

    if (touches(state.player, enemy)) {
      state.health--;
      resetPlayer(state.player);

      if (state.health <= 0) resetGame(canvas, state);
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

function seekPlayer(enemy, player) {
  const enemyCenter = centerOf(enemy);
  const playerCenter = centerOf(player);
  const dx = playerCenter.x - enemyCenter.x;
  const dy = playerCenter.y - enemyCenter.y;
  const distance = Math.hypot(dx, dy) || 1;

  enemy.vx = (dx / distance) * ENEMY_SEEK_SPEED;
  enemy.vy = (dy / distance) * ENEMY_SEEK_SPEED;
}

function moveEnemy(enemy, obstacles, canvas) {
  const nextX = Math.max(0, Math.min(canvas.width - enemy.size, enemy.x + enemy.vx));
  const xMove = { ...enemy, x: nextX };

  if (!collidesWithSolidObstacle(xMove, obstacles)) {
    enemy.x = nextX;
  }

  const nextY = Math.max(0, Math.min(canvas.height - enemy.size, enemy.y + enemy.vy));
  const yMove = { ...enemy, y: nextY };

  if (!collidesWithSolidObstacle(yMove, obstacles)) {
    enemy.y = nextY;
  }
}

function addEnemies(state, canvas, count) {
  for (let index = 0; index < count; index++) {
    state.enemies.push(spawnEnemy(canvas, state.obstacles));
  }
}

function centerOf(entity) {
  return {
    x: entity.x + entity.size / 2,
    y: entity.y + entity.size / 2
  };
}
