import { PLAYER_START } from "./constants.js";
import { collidesWithSolidObstacle } from "./obstacles.js";

export function spawnEnemy(canvas, obstacles = []) {
  const position = randomOpenPosition(canvas, 20, obstacles);

  return {
    x: position.x,
    y: position.y,
    size: 20,
    vx: 0,
    vy: 0
  };
}

export function createRelic(canvas, obstacles = []) {
  const relic = { x: 400, y: 240, size: 14 };
  placeRelic(relic, canvas, obstacles);
  return relic;
}

export function placeRelic(relic, canvas, obstacles = []) {
  const position = randomOpenPosition(canvas, relic.size, obstacles);
  relic.x = position.x;
  relic.y = position.y;
}

export function resetPlayer(player) {
  player.x = PLAYER_START.x;
  player.y = PLAYER_START.y;
}

export function touches(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

function randomOpenPosition(canvas, size, obstacles) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const position = {
      x: Math.random() * (canvas.width - size),
      y: Math.random() * (canvas.height - size)
    };

    const rect = { ...position, size };
    const tooCloseToStart = distance(position, PLAYER_START) < 90;

    if (!tooCloseToStart && !collidesWithSolidObstacle(rect, obstacles)) {
      return position;
    }
  }

  return { x: canvas.width - 60, y: canvas.height - 60 };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
