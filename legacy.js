// Legacy pre-module code kept for reference only.
// The active game now runs through game.js and the modules in src/.

// Former state.js
const Game = {
  canvas: null,
  ctx: null,
  tile: 20,
  scoreValue: 0,
  healthValue: 3,
  levelValue: 1,
  keys: {},
  player: { x: 80, y: 80, size: 20 },
  relic: { x: 400, y: 240, size: 14 },
  enemies: []
};

// Former terrain.js
let land=[];
const landColors=['#24452b','#3f6636','#8b7440','#4b3024','#626262'];
const landSpeeds=[1,1.12,0.85,0.55,1.3];
function makeTerrain(){
 land=[];
 for(let y=0;y<25;y++){
  land[y]=[];
  for(let x=0;x<40;x++){
   let v=Math.sin(x*.5)+Math.cos(y*.4)+Math.random()*2;
   let k=4;
   if(v>0)k=3;
   if(v>1)k=0;
   if(v>2)k=2;
   if(v>3)k=1;
   land[y][x]=k;
  }
 }
}

// Former terrainDraw.js
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
