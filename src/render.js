import { ENEMY_GLYPH, PLAYER_GLYPH, SHOT_RANGE, SHOT_SIZE, TERRAIN_SPEEDS } from "./constants.js";
import { collidesWithSolidObstacle, drawObstacles } from "./obstacles.js";
import { drawTerrain, terrainAt } from "./terrain.js";

export function renderGame(ctx, state, canvas) {
  drawTerrain(ctx, state, canvas);
  drawObstacles(ctx, state.obstacles, state.camera);
  drawRelics(ctx, state.relics, state.camera);
  drawProjectiles(ctx, state.projectiles, state.camera);
  drawAimLine(ctx, state);
  drawPlayer(ctx, state.player, state.camera);
  drawEnemies(ctx, state.enemies, state.camera);
  drawTerrainReadout(ctx, state);
}

function drawRelics(ctx, relics, camera) {
  ctx.fillStyle = "gold";

  for (const relic of relics) {
    ctx.fillRect(relic.x - camera.x, relic.y - camera.y, relic.size, relic.size);
  }
}

function drawProjectiles(ctx, projectiles, camera) {
  ctx.fillStyle = "#f5ead2";

  for (const projectile of projectiles) {
    ctx.beginPath();
    ctx.arc(
      projectile.x - camera.x + projectile.size / 2,
      projectile.y - camera.y + projectile.size / 2,
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
  ctx.moveTo(origin.x - state.camera.x, origin.y - state.camera.y);
  ctx.lineTo(end.x - state.camera.x, end.y - state.camera.y);
  ctx.stroke();
}

function drawPlayer(ctx, player, camera) {
  const screenPlayer = toScreenRect(player, camera);

  ctx.fillStyle = "cyan";
  ctx.fillRect(screenPlayer.x, screenPlayer.y, screenPlayer.size, screenPlayer.size);
  drawGlyph(ctx, PLAYER_GLYPH, screenPlayer, "#f9ffff", "#06151a", 19);
}

function drawEnemies(ctx, enemies, camera) {
  for (const enemy of enemies) {
    const screenEnemy = toScreenRect(enemy, camera);

    ctx.fillStyle = "red";
    ctx.fillRect(screenEnemy.x, screenEnemy.y, screenEnemy.size, screenEnemy.size);
    drawGlyph(ctx, ENEMY_GLYPH, screenEnemy, "#fff1c7", "#260000", 19);
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

function toScreenRect(entity, camera) {
  return {
    ...entity,
    x: entity.x - camera.x,
    y: entity.y - camera.y
  };
}
