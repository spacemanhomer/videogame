import { PLAYER_GLYPH, SHOT_RANGE, SHOT_SIZE } from "./constants.js";
import { collidesWithSolidObstacle, drawObstacles } from "./obstacles.js";
import { drawTerrain, terrainMaterialAt } from "./terrain.js";

export function renderGame(ctx, state, canvas) {
  drawTerrain(ctx, state, canvas);
  drawObstacles(ctx, state.obstacles, state.camera);
  drawRelics(ctx, state.relics, state.camera);
  drawProjectiles(ctx, state.projectiles, state.camera);
  drawAimLine(ctx, state);
  drawPlayer(ctx, state.player