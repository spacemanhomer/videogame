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
