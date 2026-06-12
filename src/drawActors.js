import { PLAYER_GLYPH } from "./constants.js";
import { glyph } from "./glyph.js";

export function drawActors(ctx,s){
  drawList(ctx,s.relics,s.camera,"✦",18,"#fff8bf","#4a3000");
  drawList(ctx,s.projectiles,s.camera,"•",18,"#fffbd0","#3b2810");
  drawOne(ctx,s.player,s.camera,PLAYER_GLYPH,26,"#8ffcff","#06151a");
  for(const e of s.enemies){drawOne(ctx,e,s.camera,e.glyph||"𓋹",26,e.fill||"#fff1c7",e.stroke||"#260000");}
}
