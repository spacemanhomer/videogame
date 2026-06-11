import { PLAYER_START } from "./constants.js";

export function spawnEnemy(canvas) {
  return {
    x: Math.random() * (canvas.width - 40),
    y: Math.random() * (canvas.height - 40),
    size: 20,
    vx: (Math.random() * 2 + 1) * randomDirection(),
    vy: (Math.random() * 2 + 1) * randomDirection()
  };
}

export function placeRelic(relic, canvas) {
  relic.x = Math.random() * (canvas.width - 40);
  relic.y = Math.random() * (canvas.height - 40);
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

function randomDirection() {
  return Math.random() < 0.5 ? -1 : 1;
}
