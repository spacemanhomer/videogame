import { glyph } from "./glyph.js";
export function drawOne(ctx,o,c,g,n,f,s){
  glyph(ctx,g,o.x-c.x+o.size/2,o.y-c.y+o.size/2,n,f,s);
}
