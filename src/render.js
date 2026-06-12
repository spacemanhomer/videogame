import { ENEMY_GLYPH, PLAYER_GLYPH, SHOT_RANGE, SHOT_SIZE, TERRAIN_SPEEDS } from "./constants.js";
import { collidesWithSolidObstacle, drawObstacles } from "./obstacles.js";
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
  const direction = { x: dx / distance, y: dy / distance };
  const end = slingshotEndPoint(origin, direction, state.obstacles);

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
  drawGlyph(ctx, PLAYER_GLYPH, player, "#f9ffff", "#06151a", 19);
}

function drawEnemies(ctx, enemies) {
  for (const enemy of enemies) {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    drawGlyph(ctx, ENEMY_GLYPH, enemy, "#fff1c7", "#260000", 19);
  }
}

function drawTerrainReadout(ctx, state) {
  const kind = terrainAt(state.terrain, state.player.x + 10, state.player.y + 10);

  ctx.fillStyle = "white";
  ctx.fillText("terrain speed x" + TERRAIN_SPEEDS[kind], 10, 20);
}

function drawGlyph(ctx, glyph, entity, fill, stroke, size) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${size}px Georgia, 'Times New Roman', serif`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  ctx.strokeText(glyph, entity.x + entity.size / 2, entity.y + entity.size / 2 + 1);
  ctx.fillText(glyph, entity.x + entity.size / 2, entity.y + entity.size / 2 + 1);
  ctx.restore();
}

function slingshotEndPoint(origin, direction, obstacles) {
  const step = Math.max(2, SHOT_SIZE / 2);
  let end = origin;

  for (let traveled = step; traveled <= SHOT_RANGE; traveled += step) {
    const candidate = {
      x: origin.x + direction.x * traveled,
      y: origin.y + direction.y * traveled,
      size: SHOT_SIZE
    };

    if (collidesWithSolidObstacle(centeredRect(candidate), obstacles)) break;
    end = { x: candidate.x, y: candidate.y };
  }

  return end;
}

function centeredRect(point) {
  return {
    x: point.x - point.size / 2,
    y: point.y - point.size / 2,
    size: point.size
  };
}
