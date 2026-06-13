import { createHud } from "./src/hud.js";
import { createInputController } from "./src/input.js";
import { createGameLoop } from "./src/loop.js";
import { renderGame } from "./src/render.js";
import { resetGame, updateGame } from "./src/systems.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = createHud({
  score: document.getElementById("score"),
  nextLevel: document.getElementById("next-level"),
  health: document.getElementById("health"),
  level: document.getElementById("level"),
  speed: document.getElementById("speed"),
  damage: document.getElementById("damage")
});
const input = createInputController(document, canvas);
const state = resetGame(canvas);

hud.update(state);

document.getElementById("restart").addEventListener("click", () => {
  resetGame(canvas, state);
  hud.update(state);
});

createGameLoop({
  update: () => updateGame(state, { canvas, input, hud }),
  render: () => renderGame(ctx, state, canvas)
}).start();
