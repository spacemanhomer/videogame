import { PLAYER_START, SPAWN_RADIUS } from "./constants.js";
import { ecosystemAt, pickEnemyTypeFor } from "./ecosystems.js";
import { collidesWithSolidObstacle } from "./obstacles.js";

export function spawnEnemy(anchor, obstacles = []) {
  const position = randomOpenPosition(anchor, 20, obstacles, 140);
  const type = pickEnemyTypeFor(position);
  const ecosystem = ecosystemAt(position.x, position.y);

  return {
    x: position.x,
    y: position.y,
    size: 20,
    vx: 0,
    vy: 0,
    type: type.id,
    ecosystem: ecosystem.name,
    glyph: type.glyph,
    color: type.color,
    fill: type.fill,
    stroke: type.stroke,
    speed: type.speed,
    hp: type.hp,
    damage: type.damage,
    wobble: type.wobble,
    orbit: type.orbit,
    ignoresWalls: type.ignoresWalls,
    phase: Math.random() * Math.PI * 2
  };
}

export function createRelic(anchor, obstacles = []) {
  const relic = { x: anchor.x, y: anchor.y, size: 14 };
  placeRelic(relic, anchor, obstacles);
  return relic;
}

export function placeRelic(relic, anchor, obstacles = []) {
  const position = randomOpenPosition(anchor, relic.size, obstacles, 90);
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

function randomOpenPosition(anchor, size, obstacles, minDistance) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = minDistance + Math.random() * (SPAWN_RADIUS - minDistance);
    const position = {
      x: anchor.x + Math.cos(angle) * radius,
      y: anchor.y + Math.sin(angle) * radius
    };

    const rect = { ...position, size };

    if (!collidesWithSolidObstacle(rect, obstacles)) {
      return position;
    }
  }

  return { x: anchor.x + minDistance, y: anchor.y + minDistance };
}
