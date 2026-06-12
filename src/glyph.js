export function glyph(ctx,g,x,y,size,fill,stroke){
  ctx.save();
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="700 "+size+"px Georgia,serif";
  ctx.lineWidth=3;
  ctx.strokeStyle=stroke;
  ctx.fillStyle=fill;
  ctx.strokeText(g,x,y);
  ctx.fillText(g,x,y);
  ctx.restore();
}
