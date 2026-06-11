import { SHOT_RANGE, TERRAIN_SPEEDS } from "./constants.js";
import { drawObstacles } from "./obstacles.js";
import { drawTerrain, terrainAt } from "./terrain.js";

export function renderGame(ctx, state) {
  drawTerrain(ctx, state.terrain);
  drawObstacles(ctx, state.obstacles);
  drawRelics(ctx, state.relics);
  drawProjectiles(ctx, state.projectiles);
  drawAimLine(ctx, state);
  drawPlayer(ctx, state.player);
  drawEnemies(ctx, state.enemies);
  drawTerrainReadout(ctx, state);
}

function drawRelics(ctx, relics) {
  ctx.fillStyle = "gold";

  for (const relic of relics) {
    ctx.fillRect(relic.x, relic.y, relic.size, relic.size);
  }
}

function drawProjectiles(ctx, projectiles) {
  ctx.fillStyle = "#f5ead2";

  for (const projectile of projectiles) {
    ctx.beginPath();
    ctx.arc(
      projectile.x + projectile.size / 2,
      projectile.y + projectile.size / 2,
      projectile.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawAimLine(ctx, state) {
  const origin = {
    x: state.player.x + state.player.size / 2,
    y: state.player.y + state.player.size / 2
  };
  const dx = state.aim.x - origin.x;
  const dy = state.aim.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;
  const length = Math.min(distance, SHOT_RANGE);
  const end = {
    x: origin.x + (dx / distance) * length,
    y: origin.y + (dy / distance) * length
  };

  ctx.strokeStyle = "rgba(245, 234, 210, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function drawPlayer(ctx, player) {
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawEnemies(ctx, enemies) {
  ctx.fillStyle = "red";

  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  }
}

function drawTerrainReadout(ctx, state) {
  const kind = terrainAt(state.terrain, state.player.x + 10, state.player.y + 10);

  ctx.fillStyle = "white";
  ctx.fillText("terrain speed x" + TERRAIN_SPEEDS[kind], 10, 20);
}
