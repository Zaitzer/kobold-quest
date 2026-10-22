/* ---------- Kobold Quest v6: the battle layer (build steps 5, 6, 8) ----------
   v6 kobolds (m.v6) and v6 foes (E.v6) fight by the v6 rules (battle/v6rules.js); the old units keep the old rules until the world
   is rebuilt, so the v37 parity test still guards them. The engine's own functions (rules.js, flow.js, input.js) call in here at a
   few marked hooks: tcStat, tcHit, tcDmg, tcCrit, tcActCost, tcMov, the turn queue, the start of a turn, tcStrike, tcDo. */
import {rpBattle,tcFloatU,tcFx,tcKo,tcQ,tcWake} from './flow.js';
import {tcCheb,tcCover,tcEuc,tcFits,tcGrass,tcHome,tcLive,tcLos,tcNear,tcSees,tcStat,tcUnitAt} from './rules.js';
import {MAP,QUICK_MUL,STREAK_MAX,critChance,damage,darkMul,dotAmount,hitChance,moraleP,packMorale,spellLand,statusLand,tick} from './v6rules.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {RP_ST} from '../data/battle.js';
import {RP_SK} from '../data/classes.js';
import {RP_E} from '../data/monsters.js';
import {CLASSES6} from '../data/v6/classes.js';
import {FOES6,PLACES6} from '../data/v6/foes.js';
import {SKILLS6} from '../data/v6/skills.js';
import {sfx} from '../engine/audio.js';
import {set_shake,shake} from '../engine/fx.js';
import {v6Kobold} from '../game/v6sheet.js';
import {netFx} from '../net/battle.js';

const v6u=u=>!!u&&((u.m&&u.m.v6)||(u.E&&u.E.v6));
const V6_WEAK=new Set(['cleric','druid','bard']);           // their basic attack is a melee bonk with the focus (−10 accuracy)
const V6_ROLE_LOOK={normal:'stick',brute:'club',quick:'spoon',ranged:'popgun',caster:'firewand',elite:'sword',swarm:'fish'};

/* ---------------------------------------------------------------- foes (bestiary.md: role × level foe; no runtime scaling) */
function v6FoeKey(id,L){const F=FOES6[id];if(!F)return null;L=Math.max(F.lv[0],Math.min(F.lv[1],L));const key='v6:'+id+':'+L;
  if(!RP_E[key]){const s=F.by[L];RP_E[key]={v6:1,id,n:F.n,role:F.role,L,w:V6_ROLE_LOOK[F.role]||'stick',team:1,hp:s.hp,atk:s.atk,def:s.def,sd:s.sd,
    spd:5+.5*(L-1),dodge:s.dodge,init:s.init,move:s.move,res:s.res,xp:s.xp,gold:s.gold,w6:s.w,ranged:F.role==='ranged',caster:F.role==='caster'}}
  return key}
/* a random fight from a place's pool: foes whose weights add up to the place's target (bestiary.md §1), 3 to 6 of them */
function v6Mix(place,rnd){rnd=rnd||Math.random;const P=typeof place==='number'?PLACES6[place]:place,keys=[];let sum=0;
  for(let tries=0;tries<40&&sum<P.target*0.95&&keys.length<6;tries++){const id=P.pool[(rnd()*P.pool.length)|0],k=v6FoeKey(id,P.L),w=RP_E[k].w6;
    if(sum+w>P.target*1.10&&keys.length>=3)continue;keys.push(k);sum+=w}return keys}
function v6FoeStat(u){const E=u.E;return{atk:u.atk,spa:u.atk,def:u.def,sd:E.sd,spd:u.spd,hp:u.max,mp:0,crit:.08,critD:1.5,beta:1,dodge:E.dodge,res:E.res,init:E.init,
  move:E.move,steady:E.ranged?6:4,magic:!!E.caster,acc:0,luck:E.luck||0,threat:1,sight:0,stealth:0,v6:1}}

/* ---------------------------------------------------------------- what kind of attack this is */
function v6Kind(a,o){if(o&&o.spell)return'spell';const s=tcStat(a);
  if(a.m){if(s.magic&&!V6_WEAK.has(a.m.cls))return'spell';return s.fam==='guns'?'ranged':'melee'}
  return a.E.caster?'spell':a.E.ranged?'ranged':'melee'}
const v6Light=a=>a.m&&['daggers','fists'].includes(tcStat(a).fam);
const v6Lvl=u=>u.m?u.m.lvl:u.E.L||1;
function v6Buff(u,k){return(u.vb||[]).filter(x=>x.k===k).reduce((a,x)=>a+x.v,0)}
function v6Has(u,k){return!!(u.vs&&u.vs[k]>0)}

/* ---------------------------------------------------------------- hit, spells, damage, crits (balance.md §4a) */
function v6Hit(b,a,t,o){o=o||{};const as=tcStat(a),ts=tcStat(t),kind=v6Kind(a,o),parts=[];
  const [ax,ay]=tcNear(a,t),cv=kind==='ranged'?tcCover(b,t,ax,ay):{c:0,fl:tcCover(b,t,ax,ay).fl};
  const tiles=Math.max(1,Math.round(tcEuc(a,t))),unseen=!tcSees(b,t,a),noDodge=v6Has(t,'stun')||v6Has(t,'root')||!!t.stun||(t.side===1&&!t.aware);
  let acc=as.acc||0;if(a.m&&V6_WEAK.has(a.m.cls)&&!o.spell)acc+=0;   // the class table's −10 is already in acc
  if(o.aim){acc+=o.aim;parts.push((o.aim>0?'skill +':'skill ')+o.aim)}if(o.aoo){acc-=10;parts.push('free hit −10')}if(o.watch){acc-=15;parts.push('watch −15')}
  if(v6Has(a,'weaken')){acc-=10;parts.push('weakened −10')}
  let dodge=(ts.dodge||0)+(t.guard?25:0)+(tcGrass(b,t)&&tcCheb(a,t)>1?10:0)-(v6Has(t,'fall')?15:0);
  if(noDodge)parts.push('cannot dodge');else{if(dodge)parts.push('dodge −'+Math.round(dodge*(unseen?0.5:1)));if(unseen)parts.push('unseen: dodge halved')}
  if(cv.c)parts.push(cv.c===2?'full cover −40':'half cover −20');
  const steady=kind==='ranged'?(as.steady||6):0;if(kind==='ranged'&&tiles>1)parts.push(tiles+' tiles −'+Math.round(steady*(tiles-1)));
  const i=a.atkN||0;if(i)parts.push('attack '+(i+1)+' −'+MAP(i,v6Light(a)));
  const mercy=a.side===0&&(a.misses||0)>=2;if(mercy)parts.push('mercy +15');
  const p=hitChance({kind,acc,dodge:Math.max(0,dodge),cover:cv.c===2?40:cv.c===1?20:0,tiles,steady,i,light:v6Light(a),unseen,noDodge,mercy,luck:(as.luck||0)-(ts.luck||0)});
  return{h:Math.round(p*100),p,parts,fl:cv.fl,cv:cv.c,unseen}}
function v6Land(b,a,t,o){const as=tcStat(a),ts=tcStat(t),tiles=Math.max(1,Math.round(tcEuc(a,t)));
  return spellLand({res:ts.res||0,lvlGap:v6Lvl(t)-v6Lvl(a),tiles,steady:as.steady||4,unseen:!tcSees(b,t,a),luck:(as.luck||0)-(ts.luck||0)})}
function v6DmgRange(b,a,t,mul,o){o=o||{};const as=tcStat(a),ts=tcStat(t),spell=v6Kind(a,o)==='spell';
  const A=(spell?as.spa:as.atk)*(1+v6Buff(a,'atk')+v6Buff(a,'atkguard')+v6Buff(a,'rage')+v6Buff(a,'atkdodge'))*(v6Has(a,'weaken')||v6Has(a,'burn')?0.75:1);
  const D=spell?ts.sd:ts.def*(1+v6Buff(t,'def')+v6Buff(t,'defsd'));
  let M=(mul||1)*(o.quick?QUICK_MUL:1)*(o.dark?darkMul(a.m?a.m.corr:0):1);
  M*=(1+v6Buff(t,'dmgtaken')-v6Buff(t,'atkguard'))*(v6Has(t,'hex')?1.25:1)*(t.mark&&a.side===0?1.3:1)*(t.guard?0.75:1);
  if(t.sz>1&&o.area)M*=1;   // a big foe is hit once per overlapped tile: the area code strikes it per tile
  return[Math.max(1,Math.round(damage(A,M,D,as.ap||0,0))),Math.max(1,Math.round(damage(A,M,D,as.ap||0,1)))]}
function v6Crit(b,a,t,fl,unseen){const as=tcStat(a),ts=tcStat(t);return critChance({base:as.crit,D:as.critD,beta:as.beta,flank:fl,unseen,unaware:t.side===1&&!t.aware,luck:(as.luck||0)-(ts.luck||0)})}

/* ---------------------------------------------------------------- one strike: v6 rules, statuses, skill hooks */
function v6Strike(a,t,o){const b=rp.bt;if(!t||!tcLive(t))return;o=o||{};const sh=o.v6||{},kind=v6Kind(a,o);
  let fl=false,unseen=false,landed=true;
  const pure=!o.mul&&sh.st&&!sh.mul;                       // a pure status skill: rolls the status check, no damage
  if(pure){const p=statusLand({lvlGap:v6Lvl(t)-v6Lvl(a),res:tcStat(t).res,cha:tcStat(a).cha||0,kind:t.E&&t.E.boss?'boss':t.E&&t.E.role==='elite'?'elite':'normal',luck:(tcStat(a).luck||0)-(tcStat(t).luck||0)});
    if(Math.random()<p)v6Status(t,sh.st);else tcFloatU(t,'resisted','#d7c9e3');tcWake(b,t);return}
  if(kind==='spell'){landed=Math.random()<v6Land(b,a,t,o)}
  else{const H=v6Hit(b,a,t,o);fl=H.fl;unseen=H.unseen;a.atkN=(a.atkN||0)+1;
    if(Math.random()>=H.p){a.misses=(a.misses||0)+1;tcFloatU(t,'miss','#d7c9e3');if(!rp.headless)sfx('pop');tcWake(b,t);return}a.misses=0}
  const [lo,hi]=v6DmgRange(b,a,t,o.mul||1,o);let d=lo+Math.random()*(hi-lo);
  if(!landed){d*=0.5;tcFloatU(t,'resisted','#d7c9e3')}
  const as=tcStat(a);if(Math.random()<v6Crit(b,a,t,fl,unseen)){d*=as.critD||1.5;tcFx(t,'CRIT!','#ffb347',14,62)}else d*=as.beta==null?1:as.beta;
  d=Math.max(1,Math.round(d));t.hp=Math.max(0,t.hp-d);t.k.hurt=.3;t.k.squash=1;tcFx(t,String(d),'#ffffff',16,48);netFx({u:b.units.indexOf(t),h:1});
  if(sh.fx==='drain'||sh.fx==='self_heal'){const h=Math.round(d*(sh.v||0.3));if(a.m){a.m.hp=Math.min(tcStat(a).hp,a.m.hp+h)}else a.hp=Math.min(a.max,a.hp+h);tcFloatU(a,'+'+h,'#9af0a0')}
  if(sh.fx==='mark')t.mark=sh.hitsLeft||3;
  if(t.mark&&a.side===0&&sh.fx!=='mark'){t.mark--;if(t.mark<=0)t.mark=0}
  if(t.hp>0&&sh.st&&landed&&Math.random()<(sh.st.p==null?1:sh.st.p))v6Status(t,sh.st);
  if(o.stun&&t.hp>0&&!(t.E&&t.E.boss)){t.stun=1;tcFloatU(t,'stunned','#ffe27a')}
  if(t.hp<=0){tcKo(t);v6OnFell(a,t)}else if(!rp.headless)sfx('hit');
  if(!rp.headless)set_shake(Math.max(shake,2));
  tcWake(b,t)}
/* statuses (balance.md §4a): stun loses the next turn; the rest last their turns, counted on the affected unit's own turns */
function v6Status(t,st){if(st.k==='stun'){if(t.E&&t.E.boss&&Math.random()>=0.5)return;t.stun=1;tcFloatU(t,'stunned','#ffe27a');return}
  t.vs=t.vs||{};t.vs[st.k]=Math.max(t.vs[st.k]||0,st.turns||2);
  if(st.k==='burn'||st.k==='poison')t.dot={k:st.k,amt:dotAmount(st.k,t.max,v6StdHp(t),false)};
  tcFloatU(t,{slow:'slowed',root:'rooted',weaken:'weakened',hex:'hexed',confuse:'confused',fall:'down!',burn:'burning',poison:'poisoned'}[st.k]||st.k,'#e0c3ff')}
/* a standard foe's HP at the target's level: burn and poison never take more than that share of it (balance.md §4a) */
function v6StdHp(t){const L=v6Lvl(t),f=Object.values(FOES6).find(F=>F.role==='normal'&&L>=F.lv[0]&&L<=F.lv[1]);return f?f.by[L].hp:t.max}
function v6OnFell(a,t){if(!a.m)return;const P=tcStat(a).pas||{};if(P.killHeal){const h=Math.round(tcStat(a).hp*P.killHeal);a.m.hp=Math.min(tcStat(a).hp,a.m.hp+h)}
  if(t.fleeing&&a.m)a.m.corr=(a.m.corr||0)+1}   // corruption.md, deed 2

/* ---------------------------------------------------------------- the start of a unit's turn: morale, statuses, dots, buffs */
function v6TurnStart(b,u){u.atkN=0;
  if(u.m&&u.side===0){const M=v6PackMorale(b),p=moraleP(M);if(M>0&&Math.random()<p){u.ap++;tcFloatU(u,'+1 AP','#ffe27a')}else if(M<0&&Math.random()<p){u.ap--;tcFloatU(u,'−1 AP','#d7c9e3')}}
  if(u.dot&&tcLive(u)){const d=Math.max(1,Math.round(u.dot.amt));u.hp=Math.max(0,u.hp-d);tcFx(u,String(d),u.dot.k==='burn'?'#ff8a3a':'#9be36b',13,48);if(u.hp<=0){tcKo(u);return true}}
  if(v6Has(u,'fall')){u.ap=Math.min(u.ap,1);tcFloatU(u,'gets up','#e0c3ff')}
  if(u.vs)for(const k of Object.keys(u.vs)){u.vs[k]--;if(u.vs[k]<=0){delete u.vs[k];if(k==='burn'||k==='poison')u.dot=null}}
  if(u.vb)u.vb=u.vb.filter(x=>--x.turns>0);
  return false}
function v6PackMorale(b){const ks=b.units.filter(u=>u.side===0&&u.m&&u.m.v6);if(!ks.length)return 0;
  const bond=ks.reduce((a,u)=>a+(u.m.bond||0)+Math.min(STREAK_MAX,u.m.streak||0),0)/ks.length,corr=ks.reduce((a,u)=>a+(u.m.corr||0),0)/ks.length;
  const lead=(ks.find(u=>u.m.hero)||{m:{}}).m.leadership||0;return packMorale(bond,lead,corr)}
/* movement: the sheet's move, rooted 0, slowed half */
function v6Move(u){const s=tcStat(u);let mv=u.m?s.move:(u.E.move||4);if(u.sz>1)mv--;if(v6Has(u,'root'))return 0;if(v6Has(u,'slow'))mv=Math.ceil(mv/2);return mv+v6Buff(u,'move')}
/* the timeline: tick until someone acts (systems.md §1) */
function v6Queue(b){const live=b.units.filter(tcLive);live.forEach(u=>{if(u.init==null)u.init=tcStat(u).init||10});
  for(let t=0;t<200;t++){const q=tick(live);if(q.length)return q}return live}
/* how far a v6 attack reaches: melee 1 (the spear 2); ranged and spells as far as the chance stays above 0, in sight (balance.md §4a) */
function v6InReach(b,a,t,rng){const s=tcStat(a);if(rng!=null&&rng!=='w')return tcEuc(a,t)<=rng+.5&&tcLos(b,a,t);
  const kind=v6Kind(a,{});if(kind==='melee')return tcCheb(a,t)<=1;
  const max=kind==='ranged'?1+(90+(s.acc||0))/(s.steady||6):1+90/(s.steady||4);return tcEuc(a,t)<=max+.5&&tcLos(b,a,t)}
/* the cost of a basic attack (balance.md §3): quick 1, heavy 2, otherwise it ends the turn */
function v6AtkCost(u){const s=tcStat(u);return s.quick?1:s.heavy?2:'end'}

/* ---------------------------------------------------------------- v6 skills, translated into the engine's tables */
function v6RegisterSkills(){for(const [id,s] of Object.entries(SKILLS6)){
  const sk={n:s.n,mp:s.mp,d:s.d,mul:s.mul?s.mul*(s.hits||1):0},st={ap:s.ap,rng:s.rng==null?'w':s.rng,v6:s};
  if(s.kind==='spell')st.spell=1;if(s.hit)st.aim=s.hit;
  switch(s.t){
    case'foe':sk.t='foe';break;
    case'area':sk.t='foes';st.area=s.r||1;break;
    case'line':sk.t='foes';st.area=1;st.line=s.len||4;break;
    case'chain':sk.t='foe';st.chain=(s.n||3)-1;break;
    case'around':sk.t='foes';st.around=1;st.aroundR=s.r||null;break;
    case'tile':sk.t='foes';st.area=s.r||0.5;st.tile=1;break;
    case'ally':sk.t='ally';break;
    case'allies':sk.t='allies';st.self=s.r||1;break;
    case'pack':sk.t='allies';st.self=99;break;
    case'self':sk.t='allies';st.self=0.01;break;
    case'down':sk.t='down';sk.revive=s.heal||0.4;break}
  if(s.heal&&s.t!=='down')sk.heal=s.heal;if(s.buff)sk.buff='v6';
  RP_SK[id]=sk;RP_ST[id]=st}}
/* the parts of a v6 skill the old engine does not know: buffs, lines, tiles, statuses on pure-status skills */
function v6DoSkill(b,u,act,S,T){const s=T.v6;
  if(s.buff&&(T.self||s.t==='ally')){const al=s.t==='ally'?[act.t]:b.units.filter(t=>t.side===u.side&&tcLive(t)&&(T.self<1?t===u:tcCheb(u,t)<=T.self));
    tcQ({k:'fn',fn:()=>{al.forEach(t=>{(t.vb=t.vb||[]).push({k:s.buff.k,v:s.buff.v,turns:s.buff.turns});tcFloatU(t,S.n,'#ffe27a')});if(!rp.headless)sfx('win')}});return true}
  if(T.line){const dx=Math.sign(act.cx-u.x),dy=Math.sign(act.cy-u.y),hit=[];
    for(let i=1;i<=T.line;i++){const x=u.x+dx*i,y=u.y+dy*i,v=tcUnitAt(b,x,y,u);if(v&&v.side!==u.side&&!hit.includes(v))hit.push(v)}
    hit.forEach(v=>tcQ({k:'atk',a:u,tg:v,o:{mul:S.mul,spell:T.spell,name:S.n,v6:s,area:1}}));if(!hit.length)tcFloatU(u,'nothing there','#d7c9e3');return true}
  if(T.tile){tcQ({k:'fn',fn:()=>v6TileSkill(b,u,act,s)});return true}
  return false}
function v6TileSkill(b,u,act,s){const x=act.cx,y=act.cy;b.tiles6=b.tiles6||[];
  if(s.fx==='trap'||s.fx==='traps3'){b.tiles6.push({x,y,k:'trap',side:u.side,by:u,s});tcFloatU(u,'trap set','#e0c3ff');return}
  if(s.fx==='cover'){b.tiles6.push({x,y,k:'cover',turns:s.turns||3,old:b.g[y][x]});if(!tcUnitAt(b,x,y))b.g[y][x]='h';tcFloatU(u,'cover','#9be36b');return}
  if(s.fx==='teleport'||s.fx==='leap'){if(tcFits(b,u,x,y)){u.x=x;u.y=y;const h=tcHome(u);u.k.x=h.x;u.k.y=h.y}
    if(s.fx==='leap')b.units.filter(v=>v.side!==u.side&&tcLive(v)&&tcCheb(u,v)<=1).forEach(v=>v6Strike(u,v,{mul:s.mul,v6:s}));return}
  tcFloatU(u,s.n+' (soon)','#d7c9e3')}
/* a unit steps on a tile: traps spring (systems.md: the rogue's and the ranger's) */
function v6OnTile(b,u){if(!b.tiles6)return;const tr=b.tiles6.find(t=>t.k==='trap'&&t.side!==u.side&&t.x===u.x&&t.y===u.y);if(!tr)return;
  b.tiles6=b.tiles6.filter(t=>t!==tr);tcFloatU(u,'trap!','#ffb347');v6Strike(tr.by,u,{mul:tr.s.mul||1,v6:tr.s})}

/* ---------------------------------------------------------------- the fight lab (checkpoint A): any classes and level against any place or foe */
const v6Lab={pack:['fighter','cleric','wizard','rogue'],lvl:5,place:0,msg:''};
function v6LabStart(){const s=rp.s;if(!s)return;const L=v6Lab.lvl,members=v6Lab.pack.filter(Boolean).map((c,i)=>({m:v6Kobold(['Pip','Wizzle','Glint','Bork'][i],c,L,{hero:i===0}),ctl:'me',own:'h'}));
  const P=PLACES6[v6Lab.place],keys=v6Mix(Object.assign({},P,{L:Math.max(1,L)}));rp.mode='map';rpBattle(keys,{members,zone:',',v6:1});rp.bt.v6=1}
function v6LabHtml(){const opt=(v,list)=>list.map(x=>'<option value="'+x[0]+'"'+(String(x[0])===String(v)?' selected':'')+'>'+x[1]+'</option>').join('');
  const cls=[['','—']].concat(Object.entries(CLASSES6).map(([k,c])=>[k,c.n]));
  return'<div class="rpdlg"><div class="who">Fight lab (test)</div><p>Pick a pack, a level and a place; the fight uses the v6 rules.</p>'+
    v6Lab.pack.map((c,i)=>'<label>Kobold '+(i+1)+' <select id="lab-p'+i+'">'+opt(c||'',cls)+'</select></label> ').join('')+
    '<label>Level <select id="lab-l">'+opt(v6Lab.lvl,Array.from({length:30},(_,i)=>[i+1,i+1]))+'</select></label> '+
    '<label>Place <select id="lab-pl">'+opt(v6Lab.place,PLACES6.map((p,i)=>[i,p.place+' (L'+p.L+')']))+'</select></label>'+
    '</div><div class="tbar"><button class="rpb go" type="button" data-rp="labgo">Fight</button><button class="rpb x" type="button" data-rp="labclose">Back</button></div>'}
feature({id:'fightlab',init(){v6RegisterSkills()},
  panels:{lab:{sig:()=>JSON.stringify(v6Lab),html:v6LabHtml}},
  menu:[{order:90,html:()=>'<button class="rpb" type="button" data-rp="lab">Fight lab<small>v6 rules, test fights</small></button>'}],
  actions:{lab:()=>{rp.mode='lab'},labclose:()=>{rp.mode='menu'},labgo:()=>{const g=id=>{const e=document.getElementById(id);return e?e.value:null};
    for(let i=0;i<4;i++){const v=g('lab-p'+i);if(v!=null)v6Lab.pack[i]=v||null}const l=g('lab-l'),p=g('lab-pl');if(l)v6Lab.lvl=+l;if(p!=null&&p!=='')v6Lab.place=+p;v6LabStart()}}});
export {V6_ROLE_LOOK,V6_WEAK,v6AtkCost,v6Buff,v6Crit,v6DmgRange,v6DoSkill,v6FoeKey,v6FoeStat,v6Has,v6Hit,v6InReach,v6Kind,v6Lab,v6LabHtml,v6LabStart,v6Land,v6Light,v6Lvl,v6Mix,v6Move,v6OnFell,v6OnTile,v6PackMorale,v6Queue,v6RegisterSkills,v6Status,v6StdHp,v6Strike,v6TileSkill,v6TurnStart,v6u};
