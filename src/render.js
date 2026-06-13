import { drawActors } from "./drawActors.js";
import { drawMandelbrotRegions } from "./mandelbrotRegions.js";
import { drawObstacles } from "./obstacles.js";
import { drawTerrain } from "./terrain.js";

export function renderGame(ctx,state,canvas){
 drawTerrain(ctx,state,canvas);
 drawMandelbrotRegions(ctx,state,canvas);
 drawObstacles(ctx,state.obstacles,state.camera);
 drawActors(ctx,state);
}
