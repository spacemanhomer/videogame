import {
  BUCKSHOT_COOLDOWN,
  BUCKSHOT_PELLETS,
  BUCKSHOT_RANGE,
  BUCKSHOT_SIZE,
  BUCKSHOT_SPEED,
  BUCKSHOT_SPREAD,
  DESPAWN_RADIUS,
  ENEMIES_PER_LEVEL,
  ENEMY_CONTACT_COOLDOWN,
  ENEMY_CONTACT_KNOCKBACK,
  ENEMY_HEALTH_DAMAGE_RATIO,
  ENEMY_HEALTH_SCALING_LEVEL,
  HORDE_ENEMIES_PER_LEVEL,
  HORDE_LEVEL,
  INITIAL_ENEMY_COUNT,
  INITIAL_RELIC_COUNT,
  MAX_RELIC_COUNT,
  OBSTACLE_DAMAGE_COOLDOWN,
  PLAYER_BASE_SPEED,
  PLAYER_LEVEL_HEAL_RATIO,
  SHALLOW_WATER_DAMAGE_CHANCE,
  SHOT_COOLDOWN,
  SHOT_RANGE,
  SHOT_SIZE,
  SHOT_SPEED
} from "./constants.js";
import { ecosystemAt } from "./ecosystems.js";
import { createRelic, createRuinGem, placeRelic, spawnEnemy, spawnRuinZombie, touches } from "./entities.js";
import { activeObstacles, activeRuins, collidesWithPainfulObstacle, collidesWithSolidObstacle, createObstacleChunks, updateObstacleChunks } from "./obstacles.js";
import { damageForLevel, levelForRunes, maxHealthForLevel, speedMultiplierForLevel } from "./progression.js";
import { copyState, createInitialState } from "./state.js";
import { createTerrainChunks, isImpassableWater, isPainfulWater, terrainSpeedAt, updateTerrainChunks } from "./terrain.js";
import { resetWorldSeed, seededNoise } from "./worldSeed.js";

const RUIN_GEMS_PER_RUIN = 2;
const RUIN_ZOMBIE_MIN = 8;
const RUIN_ZOMBIE_EXTRA = 7;

export function resetGame(canvas, existingState = createInitialState()) {
  resetWorldSeed();
  const nextState = createInitialState();

  nextState.terrain = createTerrainChunks();
  nextState.obstacleChunks = createObstacleChunks();
  loadWorldAroundPlayer(nextState);
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
  state.ruins = activeRuins(state.obstacleChunks);
  seedActiveRuins(state);
}

function seedActiveRuins(state) {
  for (const ruin of state.ruins) {
    seedRuinGems(state, ruin);
    seedRuinZombies(state, ruin);
  }
}

function seedRuinGems(state, ruin) {
  for (let index = 0; index < RUIN_GEMS_PER_RUIN; index++) {
    const gem = createRuinGem(ruin, index, state.level);

    if (
      state.collectedRuinGemIds.has(gem.id) ||
      state.relics.some(relic => relic.id === gem.id)
    ) continue;

    state.relics.push(gem);
  }
}

function seedRuinZombies(state, ruin) {
  if (state.spawnedRuinIds.has(ruin.id)) return;

  const count = RUIN_ZOMBIE_MIN + Math.floor(seededNoise(ruin.chunkX, ruin.chunkY, 430) * RUIN_ZOMBIE_EXTRA);

  for (let index = 0; index < count; index++) {
    const x = ruin.innerX + seededNoise(ruin.chunkX + index, ruin.chunkY, 431) * Math.max(1, ruin.innerWidth - 20);
    const y = ruin.innerY + seededNoise(ruin.chunkX, ruin.chunkY + index, 432) * Math.max(1, ruin.innerHeight - 20);
    state.enemies.push(spawnRuinZombie({ x, y }, index * 0.6));
  }

  state.spawnedRuinIds.add(ruin.id);
}

function updateCurrentEcosystem(state) {
  state.currentEcosystem = ecosystemAt(state.player.x, state.player.y).name;
}

function centerCamera(state, canvas) {
  state.camera.x = state.player.x + state.player.size / 2 - canvas.width / 2;
  state.camera.y = state.player.y + state.player.size / 2 - canvas.height / 2;
}

function movePlayer(state, input) {
  const speed = PLAYER_BASE_SPEED * speedMultiplierForLevel(state.level) * terrainSpeedAt(state.terrain, state.player);
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
    damage: damageForLevel(state.level),
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
      damage: damageForLevel(state.level),
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

  for (let index = state.relics.length - 1; index >= 0; index--) {
    const relic = state.relics[index];
    if (!touches(state.player, relic)) continue;

    const value = relic.value || 1;
    const previousLevel = state.level;
    state.score += value;
    state.level = levelForRunes(state.score);
    collected = true;

    if (relic.kind === "ruin-gem") {
      state.collectedRuinGemIds.add(relic.id);
      state.relics.splice(index, 1);
    } else {
      placeRelic(relic, state.player, state.obstacles, state.level);
    }

    if (state.level > previousLevel) {
      applyLevelUps(state, previousLevel);
    }
  }

  if (collected) hud.update(state);
}

function applyLevelUps(state, previousLevel) {
  for (let level = previousLevel + 1; level <= state.level; level++) {
    const previousMaxHealth = state.maxHealth;
    state.maxHealth = maxHealthForLevel(level);
    state.health = Math.min(
      state.maxHealth,
      state.health + Math.max(1, Math.ceil((state.maxHealth - previousMaxHealth) * PLAYER_LEVEL_HEAL_RATIO))
    );
    addEnemies(state, enemiesForLevel(level));

    if (state.relics.filter(item => item.kind !== "ruin-gem").length < MAX_RELIC_COUNT) {
      state.relics.push(createRelic(state.player, state.obstacles, level));
    }
  }
}

function enemiesForLevel(level) {
  return level >= HORDE_LEVEL ? HORDE_ENEMIES_PER_LEVEL : ENEMIES_PER_LEVEL;
}

function updateEnemies(state, canvas, hud) {
  for (const enemy of state.enemies) {
    steerEnemy(enemy, state.player);
    moveEnemy(enemy, state.obstacles);
  }

  const contactEnemy = state.enemies.find(enemy => touches(state.player, enemy));
  if (contactEnemy) applyEnemyContactDamage(state, contactEnemy, canvas, hud);
}

function applyEnemyContactDamage(state, enemy, canvas, hud) {
  const now = Date.now();
  if (now - state.lastEnemyDamageAt < ENEMY_CONTACT_COOLDOWN) return;

  state.health -= enemyContactDamage(state, enemy);
  state.lastEnemyDamageAt = now;
  knockPlayerAwayFrom(state, enemy);
  loadWorldAroundPlayer(state);
  updateCurrentEcosystem(state);
  centerCamera(state, canvas);

  if (state.health <= 0) resetGame(canvas, state);
  hud.update(state);
}

function enemyContactDamage(state, enemy) {
  const baseDamage = enemy.damage || 2;
  if (state.level < ENEMY_HEALTH_SCALING_LEVEL) return baseDamage;

  return Math.max(baseDamage, Math.ceil((state.maxHealth || state.health) * ENEMY_HEALTH_DAMAGE_RATIO));
}

function knockPlayerAwayFrom(state, enemy) {
  const playerCenter = centerOf(state.player);
  const enemyCenter = centerOf(enemy);
  const direction = normalize({
    x: playerCenter.x - enemyCenter.x,
    y: playerCenter.y - enemyCenter.y
  });
  const knocked = {
    ...state.player,
    x: state.player.x + direction.x * ENEMY_CONTACT_KNOCKBACK,
    y: state.player.y + direction.y * ENEMY_CONTACT_KNOCKBACK
  };

  if (!isBlockedByWorld(state, knocked)) {
    state.player.x = knocked.x;
    state.player.y = knocked.y;
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
    relic.kind !== "ruin-gem" && distanceBetween(relic, state.player) > DESPAWN_RADIUS
      ? createRelic(state.player, state.obstacles, state.level)
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
