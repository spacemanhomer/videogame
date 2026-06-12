export const ECOSYSTEMS = Object.freeze({
  dunes: {
    name: "dunes",
    enemies: ["mummy", "scarab", "jackal"]
  },
  marsh: {
    name: "marsh",
    enemies: ["thornling", "mummy", "scarab"]
  },
  ruins: {
    name: "ruins",
    enemies: ["wraith", "mummy", "jackal"]
  },
  scrub: {
    name: "scrub",
    enemies: ["jackal", "scarab", "thornling"]
  }
});

export const ENEMY_TYPES = Object.freeze({
  mummy: {
    id: "mummy",
    glyph: "☥",
    color: "#b9352b",
    fill: "#fff1c7",
    stroke: "#260000",
    speed: 1.45,
    hp: 2,
    damage: 1,
    wobble: 0,
    orbit: 0,
    ignoresWalls: false
  },
  scarab: {
    id: "scarab",
    glyph: "✹",
    color: "#8f2fd0",
    fill: "#f6ddff",
    stroke: "#240034",
    speed: 2.25,
    hp: 1,
    damage: 1,
    wobble: 0.58,
    orbit: 0,
    ignoresWalls: false
  },
  jackal: {
    id: "jackal",
    glyph: "♞",
    color: "#c46a20",
    fill: "#ffe4b5",
    stroke: "#331700",
    speed: 1.85,
    hp: 1,
    damage: 1,
    wobble: 0.15,
    orbit: 0.42,
    ignoresWalls: false
  },
  thornling: {
    id: "thornling",
    glyph: "♣",
    color: "#2f8f4e",
    fill: "#e4ffd8",
    stroke: "#06240d",
    speed: 1.35,
    hp: 2,
    damage: 1,
    wobble: 0.82,
    orbit: -0.18,
    ignoresWalls: false
  },
  wraith: {
    id: "wraith",
    glyph: "☽",
    color: "#5366c9",
    fill: "#eef2ff",
    stroke: "#070b2c",
    speed: 1.18,
    hp: 3,
    damage: 1,
    wobble: 0.08,
    orbit: 0,
    ignoresWalls: true
  }
});

export const DEFAULT_ENEMY_TYPE = ENEMY_TYPES.mummy;

export function ecosystemAt(x, y) {
  const value = Math.sin(x * 0.0027) + Math.cos(y * 0.0021) + seededNoise(Math.floor(x / 320), Math.floor(y / 320));

  if (value > 1.35) return ECOSYSTEMS.dunes;
  if (value > 0.45) return ECOSYSTEMS.scrub;
  if (value > -0.45) return ECOSYSTEMS.marsh;
  return ECOSYSTEMS.ruins;
}

export function pickEnemyTypeFor(position) {
  const ecosystem = ecosystemAt(position.x, position.y);
  const choices = ecosystem.enemies;
  const index = Math.min(choices.length - 1, Math.floor(seededNoise(Math.floor(position.x), Math.floor(position.y)) * choices.length));

  return ENEMY_TYPES[choices[index]] || DEFAULT_ENEMY_TYPE;
}

function seededNoise(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
