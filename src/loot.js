import {
  DESPAWN_RADIUS,
  ENEMIES_PER_LEVEL,
  HORDE_ENEMIES_PER_LEVEL,
  HORDE_LEVEL,
  MAX_RELIC_COUNT,
  PLAYER_LEVEL_HEAL_RATIO
} from "./constants.js";
import { createRelic, placeRelic, spawnEnemy, touches } from "./entities.js";
import { levelForRunes, maxHealthForLevel } from "./progression.js";

export function collectRelics(state, hud) {
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

export function replenishNearbySpawns(state) {
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

function addEnemies(state, count) {
  for (let index = 0; index < count; index++) {
    state.enemies.push(spawnEnemy(state.player, state.obstacles));
  }
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
