function landAt(px,py){
 let x=Math.floor(px/20);
 let y=Math.floor(py/20);
 x=Math.max(0,Math.min(39,x));
 y=Math.max(0,Math.min(24,y));
 return land[y][x];
}
function speedAt(px,py){
 return landSpeeds[landAt(px,py)];
}
function drawTerrain(){
 for(let y=0;y<25;y++){
  for(let x=0;x<40;x++){
   let kind=land[y][x];
   Game.ctx.fillStyle=landColors[kind];
   Game.ctx.fillRect(x*20,y*20,20,20);
  }
 }
}
