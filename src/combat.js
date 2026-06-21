import {
  BUCKSHOT_COOLDOWN,
  BUCKSHOT_PELLETS,
  BUCKSHOT_RANGE,
  BUCKSHOT_SIZE,
  BUCKSHOT_SPEED,
  BUCKSHOT_SPREAD,
  ENEMY_CONTACT_COOLDOWN,
  ENEMY_CONTACT_KNOCKBACK,
  ENEMY_HEALTH_DAMAGE_RATIO,
  ENEMY_HEALTH_SCALING_LEVEL,
  SHOT_COOLDOWN,
  SHOT_RANGE,
  SHOT_SIZE,
  SHOT_SPEED
} from "./constants.js";
import { touches } from "./entities.js";
import { collidesWithSolidObstacle } from "./obstacles.js";
import { damageForLevel } from "./progression.js";
import { isBlockedByWorld } from "./movement.js";

export function fireSlingshot(state, input) {
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

export function fireBuckshot(state, input) {
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

export function updateProjectiles(state) {
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

export function updateEnemies(state, { canvas, hud, resetGame, refreshWorld, centerCamera, updateCurrentEcosystem }) {
  for (const enemy of state.enemies) {
    steerEnemy(enemy, state.player);
    moveEnemy(enemy, state.obstacles);
  }

  const contactEnemy = state.enemies.find(enemy => touches(state.player, enemy));
  if (contactEnemy) {
    applyEnemyContactDamage(state, contactEnemy, {
      canvas,
      hud,
      resetGame,
      refreshWorld,
      centerCamera,
      updateCurrentEcosystem
    });
  }
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

function applyEnemyContactDamage(state, enemy, { canvas, hud, resetGame, refreshWorld, centerCamera, updateCurrentEcosystem }) {
  const now = Date.now();
  if (now - state.lastEnemyDamageAt < ENEMY_CONTACT_COOLDOWN) return;

  state.health -= enemyContactDamage(state, enemy);
  state.lastEnemyDamageAt = now;
  knockPlayerAwayFrom(state, enemy);
  refreshWorld(state);
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

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}
