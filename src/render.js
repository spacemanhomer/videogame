import { PLAYER_GLYPH, SHOT_RANGE } from "./constants.js";
import { drawObstacles } from "./obstacles.js";
import { drawTerrain, terrainMaterialAt } from "./terrain.js";

export function renderGame(ctx, state, canvas) {
  drawTerrain(ctx, state, canvas);
  drawObstacles(ctx, state.obstacles, state.camera);
  drawRelics(ctx, state.relics, state.camera);
  drawShots(ctx, state.projectiles, state.camera);
  drawAim(ctx, state);
  drawOne(ctx, state.player, state.camera,