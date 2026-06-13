export function createHud(elements) {
  return {
    update(state) {
      elements.score.textContent = state.score;
      elements.health.textContent = `${state.health}/${state.maxHealth || state.health}`;
      elements.level.textContent = state.level;
    }
  };
}
