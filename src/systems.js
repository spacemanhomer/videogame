import {
  BUCKSHOT_COOLDOWN,
  BUCKSHOT_PELLETS,
  BUCKSHOT_RANGE,
  BUCKSHOT_SIZE,
  BUCKSHOT_SPEED,
  BUCKSHOT_SPREAD,
  DESPAWN_RADIUS,
  ENEMIES_PER_LEVEL,
  HORDE_ENEMIES_PER_LEVEL,
  HORDE_LEVEL,
  INITIAL_ENEMY_COUNT,
  INITIAL_RELIC_COUNT,
  LEVEL_UP_INTERVAL,
  MAX_RELIC_COUNT,
  OBSTACLE_DAMAGE_COOLDOWN,
  PLAYER_BASE_SPEED,
  SHALLOW_WATER_DAMAGE_CHANCE,
  SHOT_COOLDOWN,
  SHOT_RANGE,
  SHOT_SIZE,
  SHOT_SPEED
} from "./constants.js";
import { ecosystemAt } from "./ecosystems.js";
import { createRelic, placeRelic, resetPlayer, spawnEnemy, touches } from "./entities.js";
import { activeObstacles, collidesWithPainfulObstacle, collidesWithSolidObstacle, createObstacleChunks, updateObstacleChunks } from "./obstacles.js";
import { copyState, createInitialState } from "./state.js";
import { createTerrainChunks, isImpassableWater, isPainfulWater, terrainSpeedAt, updateTerrainChunks } from "./terrain.js";
import { resetWorldSeed } from "./worldSeed.js";

export function resetGame(canvas, existingState = createInitialState()) {
  resetWorldSeed();
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
  updateCurrentEcosystem(state);
  movePlayer(state, input);
  loadWorldAroundPlayer(state);
  updateCurrentEcosystem(state);
  centerCamera(state, canvas);
  fireSlingshot(state, input);
  fireBuckshot(state, input);
  updateProjectiles(state);
  collectRelics(state, hud);
  updateEnemies(state, canvas, hud);
  updateTerrainDamage(state, canvas, hud);
  replenishNearbySpawns(state);
}

function loadWorldAroundPlayer(state) {
  updateTerrainChunks(state.terrain, state.player);
  updateObstacleChunks(state.obstacleChunks, state.player);
  state.obstacles = activeObstacles(state.obstacleChunks);
}

function updateCurrentEcosystem(state) {
  state.currentEcosystem = ecosystemAt(state.player.x, state.player.y).name;
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
  if (!isBlockedByWorld(state, xMove)) state.player.x = next.x;

  const yMove = { ...state.player, y: next.y };
  if (!isBlockedByWorld(state, yMove)) state.player.y = next.y;
}

function isBlockedByWorld(state, rect) {
  return collidesWithSolidObstacle(rect, state.obstacles) || isImpassableWater(state.terrain, rect);
}

function fireSlingshot(state, input) {
  if (!input.consumePressed("space")) return;

  const now = Date.now();
  if (now - state.lastShotAt < SHOT_COOLDOWN) return;

  const origin = centerOf(state.player);
  const aim = aimVector(origin, state.aim);

  state.projectiles.push(createProjectile(origin, aim, {
    range: SHOT_RANGE,
    size: SHOT_SIZE,
    speed: SHOT_SPEED,
    damage: 1,
    kind: "stone"
  }));

  state.lastShotAt = now;
}

function fireBuckshot(state, input) {
  if (!input.consumePressed("shift")) return;

  const now = Date.now();
  if (now - state.lastBuckshotAt < BUCKSHOT_COOLDOWN) return;

  const origin = centerOf(state.player);
  const aim = aimVector(origin, state.aim);
  const baseAngle = Math.atan2(aim.y, aim.x);

  for (let index = 0; index < BUCKSHOT_PELLETS; index++) {
    const centered = index - (BUCKSHOT_PELLETS - 1) / 2;
    const angle = baseAngle + centered * (BUCKSHOT_SPREAD / Math.max(1, BUCKSHOT_PELLETS - 1));

    state.projectiles.push(createProjectile(origin, { x: Math.cos(angle), y: Math.sin(angle) }, {
      range: BUCKSHOT_RANGE,
      size: BUCKSHOT_SIZE,
      speed: BUCKSHOT_SPEED,
      damage: 1,
      kind: "buckshot"
    }));
  }

  state.lastBuckshotAt = now;
}

function createProjectile(origin, direction, options) {
  return {
    x: origin.x - options.size / 2,
    y: origin.y - options.size / 2,
    size: options.size,
    vx: direction.x * options.speed,
    vy: direction.y * options.speed,
    traveled: 0,
    range: options.range,
    damage: options.damage,
    kind: options.kind
  };
}

function updateProjectiles(state) {
  const remainingProjectiles = [];

  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.traveled += Math.hypot(projectile.vx, projectile.vy);

    if (
      projectile.traveled > (projectile.range || SHOT_RANGE) ||
      collidesWithSolidObstacle(projectile, state.obstacles)
    ) {
      continue;
    }

    const hitIndex = state.enemies.findIndex(enemy => touches(projectile, enemy));
    if (hitIndex !== -1) {
      state.enemies[hitIndex].hp = (state.enemies[hitIndex].hp || 1) - (projectile.damage || 1);
      if (state.enemies[hitIndex].hp <= 0) state.enemies.splice(hitIndex, 1);
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
      addEnemies(state, enemiesForLevel(state.level));

      if (state.relics.length < MAX_RELIC_COUNT) {
        state.relics.push(createRelic(state.player, state.obstacles));
      }
    }
  }

  if (collected) hud.update(state);
}

function enemiesForLevel(level) {
  return level >= HORDE_LEVEL ? HORDE_ENEMIES_PER_LEVEL : ENEMIES_PER_LEVEL;
}

function updateEnemies(state, canvas, hud) {
  for (const enemy of state.enemies) {
    steerEnemy(enemy, state.player);
    moveEnemy(enemy, state.obstacles);

    if (touches(state.player, enemy)) {
      state.health -= enemy.damage || 1;
      resetPlayer(state.player);
      loadWorldAroundPlayer(state);
      updateCurrentEcosystem(state);
      centerCamera(state, canvas);

      if (state.health <= 0) resetGame(canvas, state);
      hud.update(state);
    }
  }
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

function steerEnemy(enemy, player) {
  const enemyCenter = centerOf(enemy);
  const playerCenter = centerOf(player);
  const dx = playerCenter.x - enemyCenter.x;
  const dy = playerCenter.y - enemyCenter.y;
  const distance = Math.hypot(dx, dy) || 1;
  const direct = { x: dx / distance, y: dy / distance };
  const side = { x: -direct.y, y: direct.x };
  const pulse = Math.sin(Date.now() / 260 + (enemy.phase || 0));
  const sidePressure = (enemy.wobble || 0) * pulse + (enemy.orbit || 0);
  const move = normalize({
    x: direct.x + side.x * sidePressure,
    y: direct.y + side.y * sidePressure
  });

  enemy.vx = move.x * (enemy.speed || 1.45);
  enemy.vy = move.y * (enemy.speed || 1.45);
}

function moveEnemy(enemy, obstacles) {
  const xMove = { ...enemy, x: enemy.x + enemy.vx };

  if (enemy.ignoresWalls || !collidesWithSolidObstacle(xMove, obstacles)) {
    enemy.x = xMove.x;
  }

  const yMove = { ...enemy, y: enemy.y + enemy.vy };

  if (enemy.ignoresWalls || !collidesWithSolidObstacle(yMove, obstacles)) {
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

function aimVector(origin, target) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;

  return {
    x: dx / distance,
    y: dy / distance
  };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}
