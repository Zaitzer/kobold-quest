import {TT} from './view.js';
import {RP_ST,RP_TT,RP_TW,TC_DIR8} from '../data/battle.js';
import {WEAPONS} from '../engine/art.js';
import {clamp,seeded} from '../engine/util.js';
import {rpStats} from '../game/stats.js';
const rpTW=w=>RP_TW[w]||{r:1};
const tcT=c=>RP_TT[c]||{};
/* ---------- board generation ---------- */
function tcTheme(zone,boss){if(boss==='vexx'||zone==='K')return'castle';if(boss==='gorb'||zone==='C'||zone==='g')return'cave';if(zone===';')return'woods';return'meadow'}
function tcBase(th){return th==='cave'?'C':th==='castle'?'K':th==='woods'?';':'.'}
function tcGen(th,W,H,boss,seed){
  const r=seeded(seed),base=tcBase(th),g=[];
  for(let y=0;y<H;y++){g.push([]);for(let x=0;x<W;x++)g[y].push(base)}
  const ok=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const blob=(c,n,rad)=>{for(let i=0;i<n;i++){const cx=r()*W|0,cy=r()*(H-3)|0,R0=1+r()*rad;for(let y=cy-3;y<=cy+3;y++)for(let x=cx-3;x<=cx+3;x++)if(ok(x,y)&&Math.hypot(x-cx,y-cy)<=R0&&r()<.85)g[y][x]=c}};
  const dots=(c,p)=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)if((g[y][x]===base||g[y][x]===',')&&r()<p)g[y][x]=c};
  if(th==='meadow'){blob(',',3+(r()*2|0),2.3);dots('h',.05);dots('R',.035);dots('T',.025)}
  else if(th==='woods'){blob(',',4,2);dots('T',.13);dots('h',.04)}
  else if(th==='cave'){blob('~',2,1.4);dots('R',.11);dots('m',.06)}
  else{for(let y=0;y<H;y++){g[y][W>>1]='o';g[y][(W>>1)-1]='o'}
    for(let y=2;y<H-3;y+=3)[1,W-2,(W>>1)-3,(W>>1)+2].forEach(x=>{if(ok(x,y))g[y][x]='P'});dots('G',.05)}
  /* keep the starting rows mostly open (low cover is fine) */
  for(let y=H-3;y<H;y++)for(let x=0;x<W;x++){const t=tcT(g[y][x]);if(t.solid&&(t.cov===2||r()<.6))g[y][x]=base;if(g[y][x]==='~')g[y][x]=base}
  /* the boss needs room */
  if(boss){const bx=(W>>1)-1;for(let y=0;y<=3;y++)for(let x=bx-1;x<=bx+2;x++)if(ok(x,y)&&tcT(g[y][x]).solid)g[y][x]=base}
  /* every open tile must be reachable from the start */
  for(let it=0;it<30;it++){const seen=new Set(),q=[[W>>1,H-1]];seen.add((H-1)*W+(W>>1));
    while(q.length){const [x,y]=q.pop();for(const [dx,dy] of TC_DIR8.slice(0,4)){const nx=x+dx,ny=y+dy,k=ny*W+nx;if(!ok(nx,ny)||seen.has(k)||tcT(g[ny][nx]).solid)continue;seen.add(k);q.push([nx,ny])}}
    let lost=null;for(let y=0;y<H&&!lost;y++)for(let x=0;x<W;x++)if(!tcT(g[y][x]).solid&&!seen.has(y*W+x)){lost=[x,y];break}
    if(!lost)break;
    let [x,y]=lost;while(y<H-1){y++;if(tcT(g[y][x]).solid)g[y][x]=base;else if(seen.has(y*W+x))break}}
  return g;
}
/* ---------- geometry ---------- */
function tcAt(b,x,y){return x>=0&&y>=0&&x<b.W&&y<b.H?b.g[y][x]:'R'}
function tcLive(u){return u.hp>0&&!u.fled}
function tcUnitAt(b,x,y,skip){return b.units.find(u=>u!==skip&&tcLive(u)&&x>=u.x&&x<u.x+u.sz&&y>=u.y&&y<u.y+u.sz)}
function tcGap(a,c){const dx=Math.max(0,c.x-(a.x+a.sz-1),a.x-(c.x+c.sz-1)),dy=Math.max(0,c.y-(a.y+a.sz-1),a.y-(c.y+c.sz-1));return[dx,dy]}
function tcCheb(a,c){const [dx,dy]=tcGap(a,c);return Math.max(dx,dy)}
function tcEuc(a,c){const [dx,dy]=tcGap(a,c);return Math.hypot(dx,dy)}
function tcTiles(u){const o=[];for(let j=0;j<u.sz;j++)for(let i=0;i<u.sz;i++)o.push([u.x+i,u.y+j]);return o}
function tcLosT(b,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy))*3;
  for(let i=1;i<n;i++){const t=i/n,x=Math.round(x0+dx*t),y=Math.round(y0+dy*t);if((x===x0&&y===y0)||(x===x1&&y===y1))continue;if(tcT(tcAt(b,x,y)).los)return false}return true}
/* line of sight from any tile of a to any tile of c (lets kobolds peek round corners a little) */
function tcLos(b,a,c){for(const [x0,y0] of tcTiles(a))for(const [x1,y1] of tcTiles(c))if(tcLosT(b,x0,y0,x1,y1))return true;return false}
function tcNear(a,c){let best=null,bd=1e9;for(const [x,y] of tcTiles(a)){const d=Math.hypot(x-c.x,y-c.y);if(d<bd){bd=d;best=[x,y]}}return best}
/* ---------- units ---------- */
function tcW(u){return u.m?u.m.w:u.E.w}
function tcStat(u){if(u.m)return rpStats(u.m);return{atk:u.atk,def:u.def,spd:u.spd,hp:u.max,mp:0,crit:.08,dodge:0,sight:u.E.sight||0,stealth:0}}
function rpMoveOf(m){const st=rpStats(m);return clamp(Math.round(2+st.spd*.35),3,6)+(st.mov||0)}
function tcMov(u){const st=tcStat(u);return clamp(Math.round(2+st.spd*.35),3,6)+(st.mov||0)-(u.sz>1?1:0)}
function tcSight(b,u){return(b.theme==='cave'?5:7)+(tcStat(u).sight||0)}
function tcGrass(b,u){return u.sz===1&&!!tcT(tcAt(b,u.x,u.y)).grass}
function tcSees(b,a,c){
  if(!tcLive(a)||!tcLive(c)||a.side===c.side)return false;
  const d=tcEuc(a,c);if(d>tcSight(b,a)+.01)return false;
  const hide=(tcGrass(b,c)?1:0)+(tcStat(c).stealth?1:0);if(hide&&d>(hide>1?2:3))return false;
  return tcLos(b,a,c);
}
function tcSideSees(b,side,c){return b.units.some(a=>a.side===side&&(side===0||a.aware)&&tcSees(b,a,c))}
function tcShown(b,u){return u.side===0||(tcLive(u)&&tcSideSees(b,0,u))}
function tcHome(u){return{x:(u.x+u.sz/2)*TT,y:(u.y+u.sz-.16)*TT}}
/* fog of war: 0 never seen, 1 seen before, 2 in sight now */
function tcVis(b){
  const v=b.vis;for(let i=0;i<v.length;i++)if(v[i]===2)v[i]=1;
  b.units.forEach(a=>{if(a.side!==0||!tcLive(a))return;const s=tcSight(b,a);
    for(let y=Math.max(0,a.y-s);y<=Math.min(b.H-1,a.y+s);y++)for(let x=Math.max(0,a.x-s);x<=Math.min(b.W-1,a.x+s);x++){
      if(v[y*b.W+x]===2||Math.hypot(x-a.x,y-a.y)>s+.01)continue;if(tcLosT(b,a.x,a.y,x,y))v[y*b.W+x]=2}});
}
/* ---------- movement ---------- */
function tcFits(b,u,x,y){for(let j=0;j<u.sz;j++)for(let i=0;i<u.sz;i++){const X=x+i,Y=y+j;if(X<0||Y<0||X>=b.W||Y>=b.H||tcT(b.g[Y][X]).solid||tcUnitAt(b,X,Y,u))return false}return true}
function tcCost(b,u,x,y){let c=1;for(let j=0;j<u.sz;j++)for(let i=0;i<u.sz;i++)c=Math.max(c,tcT(tcAt(b,x+i,y+j)).mv||1);return c}
function tcReach(b,u,max){
  const W=b.W,dist=new Map(),prev=new Map(),open=[[0,u.x,u.y]];dist.set(u.y*W+u.x,0);
  while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;const [d,x,y]=open.splice(bi,1)[0];if(d>dist.get(y*W+x))continue;
    for(const [dx,dy] of TC_DIR8){const nx=x+dx,ny=y+dy;if(!tcFits(b,u,nx,ny))continue;if(dx&&dy&&(!tcFits(b,u,x+dx,y)||!tcFits(b,u,x,y+dy)))continue;
      const nd=d+tcCost(b,u,nx,ny);if(nd>max)continue;const k=ny*W+nx;if(!dist.has(k)||nd<dist.get(k)){dist.set(k,nd);prev.set(k,y*W+x);open.push([nd,nx,ny])}}}
  return{dist,prev,W};
}
function tcPath(R,x,y){const W=R.W,out=[];let k=y*W+x;if(!R.dist.has(k))return null;while(R.prev.has(k)){out.unshift([k%W,(k/W)|0]);k=R.prev.get(k)}return out}
/* ---------- cover, hit chance, damage ---------- */
function tcCover(b,t,ax,ay){
  if(t.sz>1)return{c:0,fl:false};
  const sx=Math.sign(ax-t.x),sy=Math.sign(ay-t.y);let c=0,any=0;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=tcT(tcAt(b,t.x+dx,t.y+dy)).cov||0;if(!v)continue;any=1;if((dx&&dx===sx)||(dy&&dy===sy))c=Math.max(c,v)}
  return{c,fl:!!any&&!c};
}
function tcMelee(u){return!WEAPONS[tcW(u)].ranged}
function tcInReach(b,a,t,rng){const w=tcW(a),TW=rpTW(w);
  if(rng==null||rng==='w'){if(tcMelee(a))return tcCheb(a,t)<=TW.r&&(TW.r<2||tcLos(b,a,t));return tcEuc(a,t)<=TW.r+(tcStat(a).rng||0)+.5&&tcLos(b,a,t)}
  return tcEuc(a,t)<=rng+.5&&tcLos(b,a,t)}
function tcHit(b,a,t,o){
  o=o||{};const w=tcW(a),TW=rpTW(w),melee=tcMelee(a)&&!o.spell,d=tcEuc(a,t),parts=[];
  let h=melee?90:75;
  if(!melee&&a.m&&a.m.cls==='ranger'){h+=10}
  const [ax,ay]=tcNear(a,t),cv=melee?{c:0,fl:false}:tcCover(b,t,ax,ay);
  if(cv.c===1){h-=20;parts.push('half cover −20')}else if(cv.c===2){h-=40;parts.push('full cover −40')}
  if(cv.fl)parts.push('flanked');
  const opt=(TW.o||0)+(tcStat(a).rng||0);if(!melee&&TW.o&&d>opt+.5){const p=Math.ceil(d-opt-.5)*10;h-=p;parts.push('far −'+p)}
  if(TW.close&&d<=2.5){h+=15;parts.push('close +15')}
  if(tcGrass(b,t)&&tcCheb(a,t)>1){h-=10;parts.push('tall grass −10')}
  const ts=tcStat(t);if(ts.dodge){const p=Math.round(ts.dodge*100);h-=p;parts.push('dodge −'+p)}
  if(t.guard){h-=25;parts.push('guarding −25')}
  if(t.side===1&&!t.aware){h+=20;parts.push('surprise +20')}
  if(o.aim){h+=o.aim;parts.push('aimed +'+o.aim)}if(o.aoo){h-=10;parts.push('free hit −10')}if(o.watch){h-=15;parts.push('watch −15')}
  return{h:clamp(Math.round(h),5,95),parts,fl:cv.fl,cv:cv.c};
}
function tcDmg(b,a,t,mul,o){o=o||{};const as=tcStat(a),ts=tcStat(t);let d=as.atk*mul;
  if(a.buff.atk>0)d*=1.25;if(as.rage&&a.m&&a.m.hp<as.hp*.5)d*=1+as.rage;
  if(rpTW(tcW(a)).close&&!o.spell&&tcEuc(a,t)<=2.5)d*=1.2;if(o.spell&&as.spellp)d*=1+as.spellp;
  d-=ts.def*.5;if(t.buff.def>0)d*=.7;if(t.guard)d*=.75;d=Math.max(1,d);
  return[Math.max(1,Math.round(d*.85)),Math.max(1,Math.round(d*1.15))]}
function tcCrit(b,a,t,fl){return tcStat(a).crit+(fl?.15:0)+(t.side===1&&!t.aware?.1:0)}
/* ---------- action costs ---------- */
function tcActCost(u,act){
  if(act.k==='atk'){const TW=rpTW(tcW(u));return TW.h?2:(TW.q||tcStat(u).quick)?1:'end'}
  if(act.k==='sk')return(RP_ST[act.sk]||{ap:'end'}).ap;
  if(act.k==='it'||act.k==='leave')return 1;
  return'end';
}
function tcCanPay(u,c){return c==='end'?u.ap>=1:u.ap>=c}
function tcPay(u,c){u.ap=c==='end'?0:u.ap-c}
/* ---------- building a battle ---------- */
const rpAlive=u=>u.hp>0;
export {rpAlive,rpMoveOf,rpTW,tcActCost,tcAt,tcBase,tcCanPay,tcCheb,tcCost,tcCover,tcCrit,tcDmg,tcEuc,tcFits,tcGap,tcGen,tcGrass,tcHit,tcHome,tcInReach,tcLive,tcLos,tcLosT,tcMelee,tcMov,tcNear,tcPath,tcPay,tcReach,tcSees,tcShown,tcSideSees,tcSight,tcStat,tcT,tcTheme,tcTiles,tcUnitAt,tcVis,tcW};
