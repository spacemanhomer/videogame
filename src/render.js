import { drawObstacles } from "./obstacles.js";
import { drawTerrain } from "./terrain.js";
import { drawActors } from "./drawActors.js";
export function renderGame(ctx,state,canvas){
 drawTerrain(ctx,state,canvas);
 drawObstacles(ctx,state.obstacles,state.camera);
 drawActors(ctx,state);
}
