const c=document.getElementById('game'),x=c.getContext('2d'),S=document.getElementById('score'),H=document.getElementById('health'),L=document.getElementById('level');
const T=20,C=c.width/T,R=c.height/T,types=[['grass','#24452b',1],['moss','#3f6636',1.15],['sand','#8b7440',.85],['mud','#4b3024',.55],['stone','#626262',1.35],['water','#1f4056',.45]];
let map=[],p,r,es,score,health,level,keys={};
function pick(v){return v<.18?1:v<.34?2:v<.49?3:v<.64?4:v<.78?5