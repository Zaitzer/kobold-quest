/* ---------- Kobold Quest v6: sprite sheets (build step 19, art/ASSETS.md, style-guide.md) ----------
   Joakim's sheets from art/ (and the stand-ins until he draws over them): one PNG per character, animations in rows, frames left to right, 32 × 64 frames (bosses 64 × 96),
   facing right (flipped for left), drawn pixel for pixel with no smoothing. A sheet is used only when it is drawn (the stand-ins are
   left out by the build and the server); anything without one keeps its look drawn in code. The hero's sheet is drawn orange and
   recoloured to the hero's colour (style-guide.md, "The hero's colour"). */
import {SPR,sprite} from './sprites.js';

/* the sheet types (ASSETS.md "Sheet types"): frame size and the rows' names */
const SHEET6={
  hero:{fw:32,fh:64,rows:{down:0,up:1,side:2,idle:3,attack:4,cast:5,hurt:6},n:[3,3,3,2,3,2,4]},
  villager:{fw:32,fh:64,rows:{down:0,up:1,side:2,talk:3},n:[3,3,3,2]},
  foe:{fw:32,fh:64,rows:{idle:0,side:1,attack:2,hurt:3},n:[2,3,3,2]},
  boss:{fw:64,fh:96,rows:{idle:0,attack:1,tele:2,hurt:3},n:[2,3,2,2]}};
const FEET=60/64;   // the feet line (row 60 of 64)
/* every loaded v6 sheet by its last name ("wizzle", "cellar-rat"), so a character finds its sheet without knowing the folder */
let index=null,indexN=0;
function byBase(base){const keys=Object.keys(SPR);if(!index||keys.length!==indexN){index={};indexN=keys.length;for(const k of keys)index[k.split('/').pop()]=k}
  const k=index[base];return k&&sprite(k)?k:null}
const dash=s=>String(s||'').toLowerCase().replace(/^v6[eb]?:/,'').replace(/:.*$/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
/* the sheet for a v6 kobold: the hero's class outfit, else the plain hero; a companion's own sheet */
function sheetOfKobold(m){if(!m||!m.v6)return null;if(m.hero)return(m.cls&&!m.noclass&&byBase('pip-'+m.cls))||byBase('pip');return m.cid?byBase(dash(m.cid)):byBase(dash(m.name))}
/* a foe or a boss: its id in the bestiary */
function sheetOfFoe(E){if(!E)return null;return byBase(dash(E.v6boss?E.v6boss:E.id||E.n))}
/* a villager on the map: the sheet named in the world (world/: "sheet"), else its id, then the id's parts ("mallow_nest" → "mallow",
   "guard_castle" → "guard"); only a character's or a boss's sheet (never a tile that shares a word, like the fountain) */
const personSheet=b=>{const k=byBase(b);return k&&/^(characters|bosses)\//.test(k)?k:null};
function sheetOfNpc(id,sheet){if(sheet)return personSheet(sheet);const d=dash(id);return personSheet(d)||d.split('-').map(personSheet).find(Boolean)||null}
function typeOf(key){if(/^bosses\//.test(key))return'boss';if(/^foes\//.test(key))return'foe';if(/^characters\/(heroes|companions)\//.test(key))return'hero';return'villager'}

/* the hero's colour (style-guide.md): pixels of Pip's orange (hue 10°–45°, not grey) take the colour's hue; light and shade stay */
const HUE={orange:null,green:110,blue:210,pink:330,gold:50,purple:272};
const recol={};
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2;let h=0,s=0;if(M!==m){const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);
  h=M===r?(g-b)/d+(g<b?6:0):M===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function hsl2rgb(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0)*255,f(8)*255,f(4)*255].map(Math.round)}
function recolour(key,colour){const s=sprite(key),hue=HUE[colour];if(!s||hue==null)return s;const id=key+'|'+colour;if(recol[id])return recol[id];
  try{const c=document.createElement('canvas');c.width=s.w;c.height=s.h;const g=c.getContext('2d');g.drawImage(s.img,0,0);const D=g.getImageData(0,0,s.w,s.h),d=D.data;
    for(let i=0;i<d.length;i+=4){if(d[i+3]<40)continue;const [h,sat,l]=rgb2hsl(d[i],d[i+1],d[i+2]);if(h>=10&&h<=45&&sat>.35){const [r,gg,b]=hsl2rgb(hue,sat,l);d[i]=r;d[i+1]=gg;d[i+2]=b}}
    g.putImageData(D,0,0);recol[id]={img:c,w:s.w,h:s.h,ready:true};return recol[id]}catch(e){return s}}
/* which frame a character shows now: on the map a walk (side when moving, down when still), in a fight its idle, attack, cast, hurt,
   down or cheer; walk cycles step 0-1-0-2 (standing, a foot, standing, the other foot) */
function frameOf(type,k,map){const T=SHEET6[type],R=T.rows,t=k.t||0;let row,f=0;
  if(k.state==='ko'){row=R.hurt!=null?R.hurt:R.idle;f=type==='hero'?1:Math.min(1,T.n[row]-1)}
  else if(k.hurt>0&&R.hurt!=null){row=R.hurt;f=0}
  else if(k.state==='cheer'&&type==='hero'){row=R.hurt;f=2+((t*4|0)%2)}
  else if((k.state==='windup'||k.state==='strike')&&R.attack!=null){row=R.attack;f=k.state==='windup'?0:1+((t*8|0)%2)}
  else if(k.state==='cast'&&R.cast!=null){row=R.cast;f=(t*6|0)%2}
  else if(map||R.idle==null){const walk=k.moving,dir=k.dir6||'down';row=R.down==null?(walk&&R.side!=null?R.side:R.idle):dir==='up'?R.up:dir==='down'?R.down:R.side;f=walk?[0,1,0,2][(t*8|0)%4]:0}
  else{row=R.idle;f=(t*2|0)%T.n[row]}
  return[row,Math.min(f,T.n[row]-1)]}
/* draw one frame with its feet at (0,0), crisp: a 32 × 64 frame stands about as tall as a kobold drawn in code (76 units) */
const UNIT=76/60;
function drawSheet(g,key,k,opt){opt=opt||{};const type=typeOf(key),T=SHEET6[type],s=opt.colour?recolour(key,opt.colour):sprite(key);if(!s)return false;
  const [row,f]=frameOf(type,k,opt.map),u=UNIT*(type==='boss'?.8:1),fw=T.fw,fh=T.fh;
  const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
  g.drawImage(s.img,f*fw,row*fh,fw,fh,-fw/2*u,-fh*FEET*u,fw*u,fh*u);g.imageSmoothingEnabled=sm;sheetDraws.n++;return true}
const sheetDraws={n:0};   // counted for the test: a drawn sheet really shows
export {FEET,HUE,SHEET6,UNIT,byBase,dash,drawSheet,frameOf,hsl2rgb,index,indexN,personSheet,recol,recolour,rgb2hsl,sheetDraws,sheetOfFoe,sheetOfKobold,sheetOfNpc,typeOf};
