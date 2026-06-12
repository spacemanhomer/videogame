import { drawOne } from "./drawOne.js";
export function drawList(ctx,list,c,g,n,f,s){
  for(const o of list){drawOne(ctx,o,c,o.glyph||g,n,o.fill||f,o.stroke||s);}
}
