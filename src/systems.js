import { LEVEL_UP_INTERVAL, PLAYER_BASE_SPEED } from "./constants.js";
import { placeRelic, resetPlayer, spawnEnemy, touches } from "./entities.js";
import { copyState, createInitialState } from "./state.js";
import { createTerrain, terrainSpeedAt } from "./terrain.js";

export function resetGame(canvas, existingState = createInitialState()) {
  const nextState = createInitialState();

  nextState.terrain = createTerrain();
  placeRelic(nextState.relic, canvas);
  nextState.enemies = [spawnEnemy(canvas)];

  return copyState(existingState, nextState);
}

export function updateGame(state, { canvas, input, hud }) {
  movePlayer(state, canvas, input);
  collectRelic(state, canvas, hud);
  updateEnemies(state, canvas, hud);
}

function movePlayer(state, canvas, input) {
  const speed = PLAYER_BASE_SPEED * terrainSpeedAt(state.terrain, state.player);

  if (input.isPressed("w", "arrowup")) state.player.y -= speed;
  if (input.isPressed("s", "arrowdown")) state.player.y += speed;
  if (input.isPressed("a", "arrowleft")) state.player.x -= speed;
  if (input.isPressed("d", "arrowright")) state.player.x += speed;

  state.player.x = Math.max(0, Math.min(canvas.width - state.player.size, state.player.x));
  state.player.y = Math.max(0, Math.min(canvas.height - state.player.size, state.player.y));
}

function collectRelic(state, canvas, hud) {
  if (!touches(state.player, state.relic)) return;

  state.score++;
  placeRelic(state.relic, canvas);

  if (state.score % LEVEL_UP_INTERVAL === 0) {
    state.level++;
    state.enemies.push(spawnEnemy(canvas));
  }

  hud.update(state);
}

function updateEnemies(state, canvas, hud) {
  for (const enemy of state.enemies) {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    if (enemy.x < 0 || enemy.x > canvas.width - enemy.size) enemy.vx *= -1;
    if (enemy.y < 0 || enemy.y > canvas.height - enemy.size) enemy.vy *= -1;

    if (touches(state.player, enemy)) {
      state.health--;
      resetPlayer(state.player);

      if (state.health <= 0) resetGame(canvas, state);
      hud.update(state);
    }
  }
}
