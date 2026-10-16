/* ---------- AI (enemies, and the party when a test bot plays) ---------- */
import {tcDo,tcQ} from './flow.js';
import {rpTW,tcActCost,tcAt,tcCheb,tcCover,tcCrit,tcDmg,tcEuc,tcHit,tcInReach,tcLive,tcMelee,tcMov,tcPath,tcReach,tcSideSees,tcT,tcW} from './rules.js';
import {rp} from '../core/state.js';
import {RP_ST} from '../data/battle.js';
import {RP_SK} from '../data/classes.js';
import {WEAPONS} from '../engine/art.js';
import {pick} from '../engine/util.js';
import {rpMemSkills,rpStats} from '../game/stats.js';

function tcFoes(b,u){return b.units.filter(t=>t.side!==u.side&&tcLive(t)&&(u.side===1?tcSideSees(b,1,t):tcSideSees(b,0,t)))}
function tcAvg(r){return(r[0]+r[1])/2}
/* how good is it for u to stand on (x,y): less danger, better cover, the right distance for its weapon */
function tcPosScore(b,u,x,y){
  const ox=u.x,oy=u.y;u.x=x;u.y=y;
  const foes=tcFoes(b,u).length?tcFoes(b,u):b.lastSeen.filter(o=>u.side===1&&tcLive(o.u)).map(o=>({x:o.x,y:o.y,sz:1,side:0,u:o.u,ghost:1}));
  let threat=0,dn=99;const melee=tcMelee(u),TW=rpTW(tcW(u));
  foes.forEach(f=>{const F=f.ghost?f.u:f,fx=F.x,fy=F.y;F.x=f.x;F.y=f.y;
    const d=tcEuc(F,u);dn=Math.min(dn,d);const fm=tcMelee(F),reach=fm?tcMov(F)*2+rpTW(tcW(F)).r:tcMov(F)+rpTW(tcW(F)).r;
    if(d<=reach+.5){const cv=fm?0:tcCover(b,u,F.x,F.y).c,h=(fm?.9:.75)-cv*.2-(u.sz===1&&tcT(tcAt(b,x,y)).grass?.1:0);threat+=Math.max(.05,h)*tcAvg(tcDmg(b,F,u,1))}
    F.x=fx;F.y=fy});
  let s=-threat/Math.max(8,u.hp)*30;
  if(foes.length){if(melee&&!(u.E&&u.E.healer))s-=dn*2.2;
    else if(u.E&&u.E.healer)s-=Math.max(0,3-dn)*6;
    else{if(dn<2)s-=10;if(dn<=(TW.o||TW.r)+.5)s+=5;else s-=(dn-(TW.o||TW.r))*1.5}}
  if(u.sz===1&&tcT(tcAt(b,x,y)).grass)s+=1.5;
  b.chans.forEach(c=>{if(c.side!==u.side&&Math.hypot(x-c.cx,y-c.cy)<=c.area+1.01)s-=60});
  if(u.side===0&&b.exits)s+=0;
  u.x=ox;u.y=oy;return s;
}
/* every action u could take from where it stands, with a value */
function tcOptions(b,u,apLeft){
  const out=[],foes=tcFoes(b,u),w=tcW(u);
  const pay=c=>c==='end'?apLeft>=1:apLeft>=c;
  const val=(t,mul,o)=>{const H=o&&o.spell?{h:100,fl:false}:tcHit(b,u,t,o),dm=tcAvg(tcDmg(b,u,t,mul,o))*(1+tcCrit(b,u,t,H.fl)*.5),ev=H.h/100*dm;return ev/Math.max(10,t.max)*55+(dm>=t.hp?22*H.h/100:0)};
  if(pay(tcActCost(u,{k:'atk'})))foes.forEach(t=>{if(tcInReach(b,u,t))out.push({act:{k:'atk',t},v:val(t,1,{})+(rpTW(w).splash?4:0)})});
  if(u.m){const m=u.m,st=rpStats(m);
    rpMemSkills(m).forEach(sk=>{const S=RP_SK[sk],T=RP_ST[sk]||{ap:'end'};if(m.mp<S.mp||!pay(T.ap))return;const mpc=S.mp*.6;
      if(T.area){foes.forEach(t=>{if(!tcInReach(b,u,{x:t.x,y:t.y,sz:1},T.rng==='w'?rpTW(w).r:T.rng))return;let v=0;b.units.forEach(x=>{if(!tcLive(x)||Math.hypot(x.x-t.x,x.y-t.y)>T.area+.01)return;if(x.side!==u.side)v+=val(x,S.mul,{spell:T.spell})*(T.chan?.7:1);else if(T.ff)v-=25});out.push({act:{k:'sk',sk,cx:t.x,cy:t.y},v:v-mpc-(T.chan?6:0)})})}
      else if(T.around){let v=0;foes.forEach(t=>{if(tcCheb(u,t)<=rpTW(w).r)v+=val(t,S.mul,{})});if(v)out.push({act:{k:'sk',sk},v:v-mpc})}
      else if(T.self){const al=b.units.filter(t=>t.side===u.side&&tcLive(t)&&tcCheb(u,t)<=T.self);
        if(S.heal){let v=0;al.forEach(t=>{v+=Math.min(t.max*S.heal,t.max-t.hp)/t.max*30});if(v>14)out.push({act:{k:'sk',sk},v:v-mpc})}
        else if(S.buff&&foes.length&&!al.some(t=>t.buff[S.buff]>0))out.push({act:{k:'sk',sk},v:al.length*4-mpc})}
      else if(S.heal){b.units.forEach(t=>{if(t.side===u.side&&tcLive(t)&&t.hp<t.max*.6&&tcInReach(b,u,t,T.rng))out.push({act:{k:'sk',sk,t},v:Math.min(t.max*S.heal,t.max-t.hp)/t.max*40-mpc})})}
      else if(S.revive){b.units.forEach(t=>{if(t.side===u.side&&!t.fled&&t.hp<=0&&tcCheb(u,t)<=1)out.push({act:{k:'sk',sk,t},v:40})})}
      else foes.forEach(t=>{if(!tcInReach(b,u,t,T.rng))return;const o={spell:T.spell,aim:T.aim};let v=val(t,S.mul,o)-mpc;if(S.stun&&!(t.E&&t.E.boss))v+=6;if(T.chain)v*=1.8;out.push({act:{k:'sk',sk,t},v})})});
    ['potion','feather'].forEach(k=>{if(!(rp.s.bag[k]>0)||!pay(1))return;b.units.forEach(t=>{if(t.side!==u.side||t.fled||tcCheb(u,t)>1)return;
      if(k==='potion'&&tcLive(t)&&t.hp<t.max*.35)out.push({act:{k:'it',it:k,t},v:18});if(k==='feather'&&t.hp<=0)out.push({act:{k:'it',it:k,t},v:30})})})}
  else{const E=u.E;
    if(E.healer&&pay(1))b.units.forEach(t=>{if(t.side===1&&tcLive(t)&&t.hp<t.max*.6&&tcInReach(b,u,t,5))out.push({act:{k:'eheal',t},v:(t.max-t.hp)/t.max*35})});
    if(E.smash&&pay(2)){const adj=foes.filter(t=>tcCheb(u,t)<=1);if(adj.length&&(u.turns%E.smash===0||adj.length>1))out.push({act:{k:'esmash'},v:adj.reduce((a,t)=>a+val(t,.75,{}),0)+8})}
    if(E.all&&pay(2))foes.forEach(t=>{if(!tcInReach(b,u,t))return;let v=0;foes.forEach(x=>{if(Math.hypot(x.x-t.x,x.y-t.y)<=1.01)v+=val(x,.7,{spell:WEAPONS[E.w].magic})});if(foes.filter(x=>Math.hypot(x.x-t.x,x.y-t.y)<=1.01).length>1)out.push({act:{k:'eall',cx:t.x,cy:t.y},v:v+2})})}
  return out;
}
function tcEnemyDo(u,act){const b=rp.bt,E=u.E;
  if(act.k==='eheal'){u.ap=0;tcQ({k:'heal',a:u,tg:act.t,o:{amt:.35}});b.msg=u.name+' heals '+act.t.name+'.';return}
  if(act.k==='esmash'){u.ap=0;const nm=u.key==='vexx'?'Royal cleave':'Ground smash';b.msg=u.name+' uses '+nm+'!';b.units.filter(t=>t.side===0&&tcLive(t)&&tcCheb(u,t)<=1).forEach(t=>tcQ({k:'atk',a:u,tg:t,o:{mul:.75,name:nm}}));return}
  if(act.k==='eall'){u.ap=0;const magic=WEAPONS[E.w].magic,nm=magic?'Fireball':'Scattershot';b.msg=u.name+' uses '+nm+'!';
    b.units.filter(t=>t.side===0&&tcLive(t)&&Math.hypot(t.x-act.cx,t.y-act.cy)<=1.01).forEach(t=>tcQ({k:'atk',a:u,tg:t,o:{mul:.7,spell:magic,name:nm}}));return}
  tcDo(u,act);
}
function rpAiTurn(u){
  const b=rp.bt;
  if(u.side===1&&!u.aware){/* idle groups shuffle about a little */
    if(Math.random()<.45){const R=tcReach(b,u,2),opts=[];R.dist.forEach((d,k)=>{if(d>0)opts.push(k)});if(opts.length){const k=pick(opts);const p=tcPath(R,k%b.W,(k/b.W)|0);if(p)tcQ({k:'move',u,path:p,i:0,id:++b.moveId})}}
    u.ap=0;b.phase='ai';return}
  const mov=tcMov(u),R1=tcReach(b,u,mov),R2=u.ap>=2?tcReach(b,u,mov*2):null;
  let best={v:-1e9,plan:null};
  const here=tcPosScore(b,u,u.x,u.y);
  const consider=(x,y,cost,path)=>{const ap2=u.ap-cost;if(ap2<0)return;
    const ox=u.x,oy=u.y;u.x=x;u.y=y;const ps=(x===ox&&y===oy)?here:tcPosScore(b,u,x,y);
    const aoo=path?tcAooRisk(b,u,ox,oy,path):0;
    tcOptions(b,u,ap2).forEach(o=>{const v=o.v+ps*.45-aoo;if(v>best.v)best={v,plan:{x,y,cost,path,act:o.act}}});
    const rest=ps-aoo+(ap2>=1?(tcMelee(u)?0:1.5):0);if(rest>best.v)best={v:rest,plan:{x,y,cost,path,act:ap2>=1?{k:(tcMelee(u)||!tcFoes(b,u).length)?'guard':'watch'}:null}};
    u.x=ox;u.y=oy};
  consider(u.x,u.y,0,null);
  R1.dist.forEach((d,k)=>{const x=k%b.W,y=(k/b.W)|0;if(x===u.x&&y===u.y)return;consider(x,y,1,tcPath(R1,x,y))});
  /* nobody in sight: head for where the enemy was last seen (or toward their side) */
  if(!tcFoes(b,u).length){let goal=null;
    if(u.side===1){const ls=b.lastSeen.filter(o=>tcLive(o.u));goal=ls.length?ls.reduce((a,o)=>Math.hypot(o.x-u.x,o.y-u.y)<Math.hypot(a.x-u.x,a.y-u.y)?o:a):{x:b.W>>1,y:b.H-2}}
    else if(b.pings&&b.pings.length){goal=b.pings.reduce((a,o)=>Math.hypot(o.x-u.x,o.y-u.y)<Math.hypot(a.x-u.x,a.y-u.y)?o:a)}
    else{let bd=1e9;for(let y=0;y<b.H;y++)for(let x=0;x<b.W;x++){if(b.vis[y*b.W+x]===2||tcT(b.g[y][x]).solid)continue;const d=Math.hypot(x-u.x,y-u.y)+(b.vis[y*b.W+x]===1?6:0);if(d<bd){bd=d;goal={x,y}}}if(!goal)goal={x:b.W>>1,y:1}}
    const R=R2||R1;let gb=null,gv=1e9;R.dist.forEach((d,k)=>{const x=k%b.W,y=(k/b.W)|0,v=Math.hypot(x-goal.x,y-goal.y)*3-tcPosScore(b,u,x,y)*.3;if(v<gv){gv=v;gb=[x,y]}});
    if(gb){const p=tcPath(R,gb[0],gb[1]);if(p&&p.length){const cost=R.dist.get(gb[1]*b.W+gb[0])<=mov?1:2;if(u.ap>=cost){best={v:1e9,plan:{x:gb[0],y:gb[1],cost,path:p,act:cost===1?{k:'watch'}:null}}}}}}
  else if(R2){R2.dist.forEach((d,k)=>{if(d<=mov)return;const x=k%b.W,y=(k/b.W)|0,v=tcPosScore(b,u,x,y)*.6-tcAooRisk(b,u,u.x,u.y,tcPath(R2,x,y));if(v>best.v)best={v,plan:{x,y,cost:2,path:tcPath(R2,x,y),act:null}}})}
  const P=best.plan;
  if(P&&P.path&&P.path.length)tcDo(u,{k:'move',path:P.path,cost:P.cost});
  if(P&&P.act){const act=P.act;tcQ({k:'fn',fn:()=>{if(!tcLive(u)||rp.bt!==b)return;
      if(act.t&&!tcLive(act.t)&&act.k!=='sk'&&act.k!=='it')return;
      if(act.k==='atk'&&!tcInReach(b,u,act.t))return;
      if(u.side===1&&(act.k==='eheal'||act.k==='esmash'||act.k==='eall'))tcEnemyDo(u,act);else tcDo(u,act)}})}
  if(!P||(!P.path&&!P.act))b.msg=u.name+' waits.';
  b.phase='ai';
}
function tcAooRisk(b,u,ox,oy,path){if(!path)return 0;let r=0,px=ox,py=oy;
  for(const [x,y] of path){b.units.forEach(o=>{if(o.side===u.side||!tcLive(o)||!tcMelee(o)||(o.side===1&&!o.aware))return;const rr=rpTW(tcW(o)).r;
      if(tcCheb(o,{x:px,y:py,sz:u.sz})<=rr&&tcCheb(o,{x,y,sz:u.sz})>rr)r+=.8*tcAvg(tcDmg(b,o,u,1))/Math.max(8,u.hp)*30});px=x;py=y}
  return r}
export {rpAiTurn,tcAooRisk,tcAvg,tcEnemyDo,tcFoes,tcOptions,tcPosScore};
