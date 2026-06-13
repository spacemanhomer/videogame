import {
  LEVEL_UP_INTERVAL,
  PLAYER_DAMAGE_LEVEL_STEP,
  PLAYER_HEALTH_FIBONACCI_OFFSET,
  PLAYER_SPEED_PER_LEVEL,
  RELIC_HIGH_VALUE_MULTIPLIER,
  RELIC_LOW_VALUE_MULTIPLIER
} from "./constants.js";
import { seededNoise } from "./worldSeed.js";

export function fibonacci(index) {
  let previous = 0;
  let current = 1;

  for (let step = 0; step < index; step++) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  return previous;
}

export function maxHealthForLevel(level) {
  return fibonacci(level + PLAYER_HEALTH_FIBONACCI_OFFSET);
}

export function runeCostForLevel(level) {
  return LEVEL_UP_INTERVAL * fibonacci(level + PLAYER_HEALTH_FIBONACCI_OFFSET - 1);
}

export function totalRunesForLevel(level) {
  let total = 0;

  for (let nextLevel = 2; nextLevel <= level; nextLevel++) {
    total += runeCostForLevel(nextLevel);
  }

  return total;
}

export function nextLevelProgress(score, level) {
  const currentFloor = totalRunesForLevel(level);
  const nextCost = runeCostForLevel(level + 1);

  return {
    current: Math.max(0, score - currentFloor),
    cost: nextCost
  };
}

export function levelForRunes(score) {
  let level = 1;

  while (score >= totalRunesForLevel(level + 1)) {
    level++;
  }

  return level;
}

export function speedMultiplierForLevel(level) {
  return 1 + (level - 1) * PLAYER_SPEED_PER_LEVEL;
}

export function damageForLevel(level) {
  return 1 + Math.floor((level - 1) / PLAYER_DAMAGE_LEVEL_STEP);
}

export function relicValueForLevel(level, saltX = 0, saltY = 0) {
  const base = fibonacci(level + PLAYER_HEALTH_FIBONACCI_OFFSET - 2);
  const multiplier = seededNoise(saltX, saltY, 610) < 0.5
    ? RELIC_LOW_VALUE_MULTIPLIER
    : RELIC_HIGH_VALUE_MULTIPLIER;

  return Math.max(1, Math.round(base * multiplier));
}
