import {
  LEVEL_UP_INTERVAL,
  PLAYER_DAMAGE_LEVEL_STEP,
  PLAYER_SPEED_PER_LEVEL
} from "./constants.js";

export function createHud(elements) {
  return {
    update(state) {
      const runesToNext = state.score % LEVEL_UP_INTERVAL;
      const speed = 1 + (state.level - 1) * PLAYER_SPEED_PER_LEVEL;
      const damage = 1 + Math.floor((state.level - 1) / PLAYER_DAMAGE_LEVEL_STEP);

      elements.score.textContent = state.score;
      elements.health.textContent = `${state.health}/${state.maxHealth || state.health}`;
      elements.level.textContent = state.level;
      setOptionalText(elements.nextLevel, `${runesToNext}/${LEVEL_UP_INTERVAL}`);
      setOptionalText(elements.speed, `${speed.toFixed(2)}x`);
      setOptionalText(elements.damage, damage);
    }
  };
}

function setOptionalText(element, value) {
  if (element) element.textContent = value;
}
