import { PLAYER_START, SPAWN_RADIUS } from "./constants.js";
import { ENEMY_TYPES, ecosystemAt, pickEnemyTypeFor } from "./ecosystems.js";
import { collidesWithSolidObstacle } from "./obstacles.js";
import { relicValueForLevel } from "./progression.js";
import { seededNoise } from "./worldSeed.js";

const RELIC_STYLES = Object.freeze([
  { glyph: "✦", color: "#ffd45a", fill: "#fff4ba", stroke: "#5c3600", aura: "rgba(255, 212, 90, 0.34)" },
  { glyph: "☥", color: "#48d7c9", fill: "#d9fffb", stroke: "#003b40", aura: "rgba(72, 215, 201, 0.32)" },
  { glyph: "◆", color: "#ff7aa8", fill: "#ffe4ee", stroke: "#4f0020", aura: "rgba(255, 122, 168, 0.3)" },
  { glyph: "◈", color: "#b58cff", fill: "#efe5ff", stroke: "#23005a", aura: "rgba(181, 140, 255, 0.3)" },
  { glyph: "𓂀", color: "#f4c06a", fill: "#fff0c8", stroke: "#4a2600", aura: "rgba(244, 192, 106, 0.32)" }
]);

const RUIN_GEMS = Object.freeze([
  { glyph: "◆", color: "#a970ff", fill: "#f1dcff", stroke: "#210047", aura: "rgba(169, 112, 255, 0.5)" },
  { glyph: "◈", color: "#45e5ff", fill: "#e2fbff", stroke: "#003a4d", aura: "rgba(69, 229, 255, 0.45)" },
  { glyph: "✦", color: "#ffcf5b", fill: "#fff4c8", stroke: "#4f2b00", aura: "rgba(255, 207, 91, 0.48)" }
]);

export function spawnEnemy(anchor, obstacles = []) {
  const position = randomOpenPosition(anchor, 20, obstacles, 140);
  const type = pickEnemyTypeFor(position);
  const ecosystem = ecosystemAt(position.x, position.y);

  return createEnemyFromType(position, type, ecosystem.name);
}

export function spawnRuinZombie(position, phase = 0) {
  const type = ENEMY_TYPES.mummy;
  const zombie = createEnemyFromType(position, type, "ruin");

  zombie.type = "ruin-zombie";
  zombie.glyph = "𓀾";
  zombie.color = "#5d3a6f";
  zombie.fill = "#ead7ff";
  zombie.stroke = "#1c0029";
  zombie.speed = 1.15;
  zombie.hp = 2;
  zombie.damage = 2;
  zombie.wobble = 0.22;
  zombie.orbit = 0.08;
  zombie.phase = phase;

  return zombie;
}

export function createRelic(anchor, obstacles = [], level = 1) {
  const relic = { x: anchor.x, y: anchor.y, size: 18, value: 1, ...pickRelicStyle(anchor) };
  placeRelic(relic, anchor, obstacles, level);
  return relic;
}

export function createRuinGem(ruin, index, level = 1) {
  const style = RUIN_GEMS[index % RUIN_GEMS.length];
  const baseValue = relicValueForLevel(level, ruin.chunkX + index, ruin.chunkY + index);
  const bonus = seededNoise(ruin.chunkX + index, ruin.chunkY, 410) > 0.48 ? 3 : 2;
  const x = ruin.innerX + seededNoise(ruin.chunkX + index, ruin.chunkY, 411) * Math.max(1, ruin.innerWidth - 24);
  const y = ruin.innerY + seededNoise(ruin.chunkX, ruin.chunkY + index, 412) * Math.max(1, ruin.innerHeight - 24);

  return {
    id: `${ruin.id}:gem:${index}`,
    kind: "ruin-gem",
    x,
    y,
    size: 22,
    value: baseValue * bonus,
    ...style
  };
}

export function placeRelic(relic, anchor, obstacles = [], level = 1) {
  const position = randomOpenPosition(anchor, relic.size, obstacles, 90);
  relic.x = position.x;
  relic.y = position.y;
  relic.value = relicValueForLevel(level, Math.floor(position.x), Math.floor(position.y));
  Object.assign(relic, pickRelicStyle(position));
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

function createEnemyFromType(position, type, ecosystem) {
  return {
    x: position.x,
    y: position.y,
    size: 20,
    vx: 0,
    vy: 0,
    type: type.id,
    ecosystem,
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

function pickRelicStyle(position) {
  const index = Math.min(
    RELIC_STYLES.length - 1,
    Math.floor(seededNoise(Math.floor(position.x / 36), Math.floor(position.y / 36), 201) * RELIC_STYLES.length)
  );

  return RELIC_STYLES[index];
}
