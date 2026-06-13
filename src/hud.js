import {
  damageForLevel,
  nextLevelProgress,
  speedMultiplierForLevel
} from "./progression.js";

export function createHud(elements) {
  return {
    update(state) {
      const progress = nextLevelProgress(state.score, state.level);
      const speed = speedMultiplierForLevel(state.level);
      const damage = damageForLevel(state.level);

      elements.score.textContent = state.score;
      elements.health.textContent = `${state.health}/${state.maxHealth || state.health}`;
      elements.level.textContent = state.level;
      setOptionalText(elements.nextLevel, `${progress.current}/${progress.cost}`);
      setOptionalText(elements.speed, `${speed.toFixed(2)}x`);
      setOptionalText(elements.damage, damage);
    }
  };
}

function setOptionalText(element, value) {
  if (element) element.textContent = value;
}
