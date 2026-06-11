import { TILE_SIZE } from "./constants.js";

const OBSTACLE_TYPES = Object.freeze({
  cactus: { kind: "solid", symbol: "▥", color: "#5fbf6a", label: "cactus wall" },
  thorns: { kind: "painful", symbol: "♣", color: "#d85f72", label: "thorny bush" },
  stone: { kind: "solid", symbol: "▣", color: "#8a8f98", label: "stone block" }
});

export function createObstacles() {
  const obstacles = [];

  addRun(obstacles, "cactus", 15, 8, 6, 0);
  addRun(obstacles, "cactus", 29, 15, 0, 4);
  addCluster(obstacles, "thorns", [[8, 16], [9, 16], [8, 17]]);
  addCluster(obstacles, "thorns", [[24, 5], [25, 5], [25, 6]]);
  addCluster(obstacles, "thorns", [[33, 20], [34, 20]]);
  addCluster(obstacles, "stone", [[12, 4], [31, 10], [18, 19]]);

  return obstacles;
}

export function drawObstacles(ctx, obstacles) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "18px monospace";

  for (const obstacle of obstacles) {
    ctx.fillStyle = obstacle.kind === "solid" ? "rgba(0, 0, 0, 0.35)" : "rgba(90, 0, 25, 0.3)";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);

    ctx.fillStyle = obstacle.color;
    ctx.fillText(obstacle.symbol, obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2 + 1);
  }

  ctx.restore();
}

export function collidesWithSolidObstacle(rect, obstacles) {
  return obstacles.some(obstacle => obstacle.kind === "solid" && rectsOverlap(rect, obstacle));
}

export function collidesWithPainfulObstacle(rect, obstacles) {
  return obstacles.some(obstacle => obstacle.kind === "painful" && rectsOverlap(rect, obstacle));
}

function addRun(obstacles, type, tileX, tileY, dx, dy) {
  const length = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);

  for (let index = 0; index < length; index++) {
    addObstacle(obstacles, type, tileX + stepX * index, tileY + stepY * index);
  }
}

function addCluster(obstacles, type, tiles) {
  for (const [tileX, tileY] of tiles) {
    addObstacle(obstacles, type, tileX, tileY);
  }
}

function addObstacle(obstacles, type, tileX, tileY) {
  obstacles.push({
    ...OBSTACLE_TYPES[type],
    x: tileX * TILE_SIZE,
    y: tileY * TILE_SIZE,
    size: TILE_SIZE
  });
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}
