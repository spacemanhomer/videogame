import { PLAYER_BASE_SPEED } from "./constants.js";
import { collidesWithSolidObstacle } from "./obstacles.js";
import { speedMultiplierForLevel } from "./progression.js";
import { isImpassableWater, terrainSpeedAt } from "./terrain.js";

export function movePlayer(state, input) {
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

export function isBlockedByWorld(state, rect) {
  return collidesWithSolidObstacle(rect, state.obstacles) || isImpassableWater(state.terrain, rect);
}
