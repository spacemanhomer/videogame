import { TERRAIN_SPEEDS } from "./constants.js";
import { drawTerrain, terrainAt } from "./terrain.js";

export function renderGame(ctx, state) {
  drawTerrain(ctx, state.terrain);
  drawRelic(ctx, state.relic);
  drawPlayer(ctx, state.player);
  drawEnemies(ctx, state.enemies);
  drawTerrainReadout(ctx, state);
}

function drawRelic(ctx, relic) {
  ctx.fillStyle = "gold";
  ctx.fillRect(relic.x, relic.y, relic.size, relic.size);
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
