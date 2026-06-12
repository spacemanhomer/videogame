import { seededNoise } from "./worldSeed.js";

export const ECOSYSTEMS = Object.freeze({
  ice: {
    name: "ice",
    enemies: ["wraith", "mummy", "scarab"],
    materials: [
      { name: "packed snow", color: "#d9f0ff", speed: 0.92 },
      { name: "blue ice", color: "#9ed7ff", speed: 1.28 },
      { name: "frost crust", color: "#f4fbff", speed: 0.82 },
      { name: "slush", color: "#8eb6c6", speed: 0.58 },
      { name: "glacier stone", color: "#7f91a3", speed: 0.95 }
    ],
    water: { name: "freezing water", color: "#4d9fd6", speed: 0.55 }
  },
  savannah: {
    name: "savannah",
    enemies: ["jackal", "scarab", "mummy"],
    materials: [
      { name: "dry grass", color: "#9a9f3f", speed: 1.04 },
      { name: "tall grass", color: "#6f8b35", speed: 0.82 },
      { name: "dust", color: "#c2a55c", speed: 0.96 },
      { name: "red earth", color: "#8f5430", speed: 0.74 },
      { name: "sun stone", color: "#7c7462", speed: 1.05 }
    ],
    water: { name: "watering hole", color: "#2f8fa8", speed: 0.62 }
  },
  wetland: {
    name: "wetland",
    enemies: ["thornling", "scarab", "wraith"],
    materials: [
      { name: "reed mat", color: "#315f3b", speed: 0.9 },
      { name: "moss hummock", color: "#4b7f45", speed: 0.75 },
      { name: "silt", color: "#7d7148", speed: 0.62 },
      { name: "black mud", color: "#3b302b", speed: 0.48 },
      { name: "bog stone", color: "#596768", speed: 0.95 }
    ],
    water: { name: "marsh water", color: "#245f73", speed: 0.5 }
  },
  badlands: {
    name: "badlands",
    enemies: ["mummy", "jackal", "wraith"],
    materials: [
      { name: "scrub", color: "#5f6f34", speed: 1 },
      { name: "hardpan", color: "#8c7a45", speed: 1.12 },
      { name: "sand", color: "#ba9954", speed: 0.82 },
      { name: "clay", color: "#74402d", speed: 0.58 },
      { name: "basalt", color: "#5f5f62", speed: 1.05 }
    ],
    water: { name: "flash flood", color: "#416b8a", speed: 0.57 }
  }
});

export const ENEMY_TYPES = Object.freeze({
  mummy: {
    id: "mummy",
    glyph: "𓋹",
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
    glyph: "𓆣",
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
    glyph: "𓃥",
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
    glyph: "𓇗",
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
    glyph: "𓂀",
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
  const value =
    Math.sin(x * 0.0027 + seededNoise(0, 0, 51)) +
    Math.cos(y * 0.0021 + seededNoise(0, 0, 52)) +
    seededNoise(Math.floor(x / 320), Math.floor(y / 320), 53);

  if (value > 1.35) return ECOSYSTEMS.ice;
  if (value > 0.45) return ECOSYSTEMS.savannah;
  if (value > -0.45) return ECOSYSTEMS.wetland;
  return ECOSYSTEMS.badlands;
}

export function materialFor(ecosystem, kind) {
  if (kind === 5) return ecosystem.water;
  return ecosystem.materials[kind] || ecosystem.materials[0];
}

export function pickEnemyTypeFor(position) {
  const ecosystem = ecosystemAt(position.x, position.y);
  const choices = ecosystem.enemies;
  const index = Math.min(
    choices.length - 1,
    Math.floor(seededNoise(Math.floor(position.x), Math.floor(position.y), 54) * choices.length)
  );

  return ENEMY_TYPES[choices[index]] || DEFAULT_ENEMY_TYPE;
}
