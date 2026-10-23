/* ---------- Kobold Quest v6: the battle layer (build steps 5, 6, 8) ----------
   Kobolds and foes fight by the rules in battle/v6rules.js. The engine's own functions (rules.js, flow.js, input.js) call in here at a
   few marked hooks: tcStat, tcHit, tcDmg, tcCrit, tcActCost, tcMov, the turn queue, the start of a turn, tcStrike, tcDo. */
import {rpBattle,tcDo,tcFloatU,tcFx,tcKo,tcQ,tcWake} from './flow.js';
import {tcCheb,tcCover,tcEuc,tcFits,tcGrass,tcHome,tcLive,tcLos,tcLosT,tcMov,tcNear,tcPath,tcReach,tcSees,tcShown,tcSideSees,tcStat,tcT,tcUnitAt} from './rules.js';
import {MAP,QUICK_MUL,STREAK_MAX,critChance,damage,darkMul,dotAmount,hitChance,moraleP,packMorale,pickByThreat,spellLand,statusLand,tick} from './v6rules.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {RP_ST} from '../data/battle.js';
import {RP_SK} from '../data/classes.js';
import {RP_E} from '../data/monsters.js';
import {CLASSES6} from '../data/v6/classes.js';
import {BOSSES6,FOES6,PLACES6,ROLES6,TRIALS6} from '../data/v6/foes.js';
import {SKILLS6} from '../data/v6/skills.js';
import {makeK} from '../engine/art.js';
import {sfx} from '../engine/audio.js';
import {set_shake,shake} from '../engine/fx.js';
import {v6Kobold,v6Stats} from '../game/v6sheet.js';
import {w6Start} from '../game/world6.js';
import {netFx} from '../net/battle.js';

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
function v6FoeStat(u){const F=u._fs;if(F&&F.atk===u.atk&&F.def===u.def&&F.spd===u.spd&&F.hp===u.max)return F;return u._fs=v6FoeStat0(u)}   /* kept on the unit: read many times a turn */
function v6FoeStat0(u){const E=u.E;return{atk:u.atk,spa:u.atk,def:u.def,sd:E.sd,spd:u.spd,hp:u.max,mp:0,crit:.08,critD:1.5,beta:1,dodge:E.dodge,res:E.res,init:E.init,
  move:E.move,steady:E.ranged?6:4,magic:!!E.caster,acc:0,luck:E.luck||0,threat:1,sight:0,stealth:0,v6:1}}

/* ---------------------------------------------------------------- what kind of attack this is */
function v6Kind(a,o){if(o&&o.spell)return'spell';const s=tcStat(a);
  if(a.m){if(s.magic&&!V6_WEAK.has(a.m.cls))return'spell';return s.fam==='guns'?'ranged':'melee'}
  return a.E.caster?'spell':a.E.ranged?'ranged':'melee'}
const v6Light=a=>a.m&&['daggers','fists'].includes(tcStat(a).fam);
const v6Lvl=u=>u.m?u.m.lvl:u.E.L||1;
/* buffs (systems.md §12): one player's buffs add up; two players' buffs on the same stat do not stack, the strongest counts */
function v6Buff(u,k){const by={};(u.vb||[]).forEach(x=>{if(x.k===k)by[x.own||'']=(by[x.own||'']||0)+x.v});const v=Object.values(by);if(!v.length)return 0;
  return Math.max(0,...v)+Math.min(0,...v)}
function v6Has(u,k){return!!(u.vs&&u.vs[k]>0)}

/* ---------------------------------------------------------------- hit, spells, damage, crits (balance.md §4a) */
function v6Hit(b,a,t,o){o=o||{};const as=tcStat(a),ts=tcStat(t),kind=v6Kind(a,o),parts=[];
  const [ax,ay]=tcNear(a,t);let cv=kind==='ranged'?tcCover(b,t,ax,ay):{c:0,fl:tcCover(b,t,ax,ay).fl};
  if(kind==='ranged'&&t.E&&t.E.trick==='snipe')cv={c:2,fl:false};
  if(o.flank)cv={c:0,fl:true};                                     // Together: flanked, cover ignored   // Snipe rides his copper cart: full cover against shots
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
  const A=(spell?as.spa:as.atk)*(1+v6Buff(a,'atk')+v6Buff(a,'atkguard')+v6Buff(a,'rage')+v6Buff(a,'atkdodge'))*(v6Has(a,'weaken')||v6Has(a,'burn')?0.75:1)*v6LeadMul(b,a,spell);
  const D=(spell?ts.sd*(1+v6Buff(t,'defsd')):ts.def*(1+v6Buff(t,'def')+v6Buff(t,'defsd')))*v6LeadMul(b,t,spell);
  let M=(mul||1)*(o.quick?QUICK_MUL:1)*(o.dark?darkMul(a.m?a.m.corr:0):1)*(o.v6&&o.v6.id&&a.m?v6RankMul(a.m,o.v6.id):1);
  if(t.m&&v6Kind(a,o)==='ranged')M*=1+(tcStat(t).rangedTaken||0);   // the copper-cart wheel (items.md §5)
  M*=(1+v6Buff(t,'dmgtaken')-v6Buff(t,'atkguard'))*(v6Has(t,'hex')?1.25:1)*(t.mark&&a.side===0?1.3:1)*(t.guard?0.75:1)*(t.curled?0.5:1);
  if(t.sz>1&&o.area)M*=1;   // a big foe is hit once per overlapped tile: the area code strikes it per tile
  return[Math.max(1,Math.round(damage(A,M,D,as.ap||0,0))),Math.max(1,Math.round(damage(A,M,D,as.ap||0,1)))]}
function v6Crit(b,a,t,fl,unseen){const as=tcStat(a),ts=tcStat(t);return critChance({base:as.crit,D:as.critD,beta:as.beta,flank:fl,unseen,unaware:t.side===1&&!t.aware,luck:(as.luck||0)-(ts.luck||0)})}

/* Pip's leader points (balance.md §3): Might × the pack's attack and defence, Wits × special attack and defence, Leadership to morale */
function v6Lead(b){const h=b&&b.units.find(u=>u.side===0&&u.m&&u.m.hero);return(h&&h.m.lead)||{might:0,wits:0,lead:0}}
function v6LeadMul(b,u,spell){if(!b||!b.v6||u.side!==0||!u.m)return 1;const L=v6Lead(b);return 1+0.01*(spell?L.wits:L.might)}
/* a skill's rank 2 and 3: +15% to its effect each (skills.md §2) */
function v6RankMul(m,id){return 1+0.15*Math.max(0,((m.ranks||{})[id]||1)-1)}
/* a v6 heal: its rank, and ×1.25 (×1.4 from corruption 50) when it is the dark version (corruption.md) */
function v6HealMul(a,o){if(!a||!a.m||!a.m.v6)return 1;return(o.sk?v6RankMul(a.m,o.sk):1)*(o.dark?darkMul(a.m.corr||0):1)}
/* ---------------------------------------------------------------- one strike: v6 rules, statuses, skill hooks */
function v6Strike(a,t,o){const b=rp.bt;if(!t||!tcLive(t))return;o=o||{};const sh=o.v6||{},kind=v6Kind(a,o);
  let fl=false,unseen=false,landed=true;
  const pure=!o.mul&&sh.st&&!sh.mul;                       // a pure status skill: rolls the status check, no damage
  if(pure){const p=statusLand({lvlGap:v6Lvl(t)-v6Lvl(a),res:tcStat(t).res,cha:tcStat(a).cha||0,kind:t.E&&t.E.boss?'boss':t.E&&t.E.role==='elite'?'elite':'normal',luck:(tcStat(a).luck||0)-(tcStat(t).luck||0)});
    if(Math.random()<p)v6Status(t,sh.st);else tcFloatU(t,'resisted','#d7c9e3');tcWake(b,t);return}
  if(kind==='spell'){landed=Math.random()<v6Land(b,a,t,o);if(rp.count)rp.count.push({side:a.side,kind,tg:t,tiles:Math.max(1,Math.round(tcEuc(a,t))),cover:0,p:1})}
  else if(sh.sure){}                                        // a telegraphed boss attack does not roll (balance.md §4a)
  else{const H=v6Hit(b,a,t,o);fl=H.fl;if(rp.count)rp.count.push({side:a.side,kind,tg:t,tiles:Math.max(1,Math.round(tcEuc(a,t))),cover:H.cv||0,p:H.p});   // the counting sims (build steps 9, 20)unseen=H.unseen;a.atkN=(a.atkN||0)+1;
    if(Math.random()>=H.p){a.misses=(a.misses||0)+1;tcFloatU(t,'miss','#d7c9e3');if(!rp.headless)sfx('pop');tcWake(b,t);return}a.misses=0}
  const [lo,hi]=v6DmgRange(b,a,t,o.mul||1,o);let d=lo+Math.random()*(hi-lo);
  if(!landed){d*=0.5;tcFloatU(t,'resisted','#d7c9e3')}
  const as=tcStat(a);if(Math.random()<v6Crit(b,a,t,fl,unseen)){d*=as.critD||1.5;tcFx(t,'CRIT!','#ffb347',14,62)}else d*=as.beta==null?1:as.beta;
  d=Math.max(1,Math.round(d));t.hp=Math.max(0,t.hp-d);t.k.hurt=.3;t.k.squash=1;tcFx(t,String(d),'#ffffff',16,48);netFx({u:b.units.indexOf(t),h:1});
  if(sh.fx==='drain'||sh.fx==='self_heal'){const h=Math.round(d*(sh.v||0.3));if(a.m){a.m.hp=Math.min(tcStat(a).hp,a.m.hp+h)}else a.hp=Math.min(a.max,a.hp+h);tcFloatU(a,'+'+h,'#9af0a0')}
  if(sh.fx==='mark')t.mark=sh.hitsLeft||3;
  if(t.mark&&a.side===0&&sh.fx!=='mark'){t.mark--;if(t.mark<=0)t.mark=0}
  if(t.hp>0&&sh.st&&landed&&Math.random()<(sh.st.p==null?1:sh.st.p))v6Status(t,sh.st);
  if(t.hp>0&&a.m&&!sh.st){const as2=tcStat(a);if(as2.burnP&&Math.random()<as2.burnP)v6Status(t,{k:'burn',turns:2});else if(as2.poisonP&&Math.random()<as2.poisonP)v6Status(t,{k:'poison',turns:2})}   // of Embers, of Venom
  if(t.hp>0&&!sh.st&&a.side===1&&t.side===0){const fs=v6FoeHitStatus(a);if(fs&&Math.random()<v6FoeStatusP(a,t))v6Status(t,fs)}
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
  if(u.m&&u.side===0&&tcLive(u)){const st=tcStat(u);if(st.regen>0&&u.hp<u.max){const h=Math.max(1,Math.round(u.max*st.regen));u.hp=Math.min(u.max,u.hp+h);tcFloatU(u,'+'+h,'#9af0a0')}}   /* sets, Mending (items.md) */
  if(u.dot&&tcLive(u)){const d=Math.max(1,Math.round(u.dot.amt));u.hp=Math.max(0,u.hp-d);tcFx(u,String(d),u.dot.k==='burn'?'#ff8a3a':'#9be36b',13,48);if(u.hp<=0){tcKo(u);return true}}
  if(v6Has(u,'fall')){u.ap=Math.min(u.ap,1);tcFloatU(u,'gets up','#e0c3ff')}
  if(u.vs)for(const k of Object.keys(u.vs)){u.vs[k]--;if(u.vs[k]<=0){delete u.vs[k];if(k==='burn'||k==='poison')u.dot=null}}
  if(u.vb)u.vb=u.vb.filter(x=>--x.turns>0);
  return false}
function v6PackMorale(b){const ks=b.units.filter(u=>u.side===0&&u.m&&u.m.v6);if(!ks.length)return 0;
  const bond=ks.reduce((a,u)=>a+(u.m.bond||0)+Math.min(STREAK_MAX,u.m.streak||0),0)/ks.length,corr=ks.reduce((a,u)=>a+(u.m.corr||0),0)/ks.length;
  const lead=v6Lead(b).lead;return packMorale(bond,lead,corr)}
/* movement: the sheet's move, rooted 0, slowed half */
function v6Move(u){const s=tcStat(u);let mv=u.m?s.move:(u.E.move||4);if(u.sz>1)mv--;if(v6Has(u,'root'))return 0;if(v6Has(u,'slow'))mv=Math.ceil(mv/2);return mv+v6Buff(u,'move')}
/* the timeline: tick until someone acts (systems.md §1) */
function v6Seat(b){b.units.forEach((u,i)=>{if(u.seat==null)u.seat=i;if(u.init==null)u.init=tcStat(u).init||10})}
function v6Queue(b){v6Seat(b);const live=b.units.filter(tcLive);
  for(let t=0;t<200;t++){const q=tick(live);if(q.length)return q}return live}
/* Together (systems.md §15.1): two kobolds beside the same foe; 1 AP, once a fight per pair; both attack now, flanking (no cover,
   crit +15 by value), and the friend's charge drops by 100 (it spends its next turn now) */
const v6PairKey=(a,c)=>[a.name,c.name].sort().join('+');
function v6TogetherOpts(b,u){if(!b||!b.v6||!u||u.side!==0||!u.m||u.ap<1)return[];const out=[];b.together=b.together||{};
  b.units.forEach(f=>{if(f===u||f.side!==0||!tcLive(f)||!f.m||b.together[v6PairKey(u,f)])return;
    b.units.forEach(t=>{if(t.side===1&&tcLive(t)&&tcShown(b,t)&&tcCheb(u,t)<=1&&tcCheb(f,t)<=1)out.push({f,t})})});return out}
function v6Together(b,u,f,t){u.ap+=1;if(!v6TogetherOpts(b,u).some(o=>o.f===f&&o.t===t))return false;u.ap-=1;b.together[v6PairKey(u,f)]=1;   // tcDo has paid the 1 AP
  f.ct=(f.ct||0)-100;b.queue=b.queue.filter(x=>x!==f);b.msg=u.name+' and '+f.name+' strike together!';tcFloatU(u,'together!','#ffd54a');
  [u,f].forEach(a=>tcQ({k:'atk',a,tg:t,o:{mul:1,flank:1,quick:!!tcStat(a).quick,name:'Together'}}));return true}
/* revive (systems.md §12): in a shared fight, standing beside another player's downed kobold, 1 AP, it gets up with 25% HP */
function v6ReviveOK(b,u,t){return!!(b&&b.v6&&u&&t&&u.side===0&&t.side===0&&t!==u&&t.m&&t.hp<=0&&!t.fled&&(t.own||'h')!==(u.own||'h')&&tcCheb(u,t)<=1)}
function v6Revive(b,u,t){if(!v6ReviveOK(b,u,t)){u.ap+=1;return false}t.hp=Math.max(1,Math.round(t.max*0.25));t.k.state='idle';t.k.rot=0;t.k.rotT=0;
  b.msg=u.name+' helps '+t.name+' up!';tcFloatU(t,'+'+t.hp,'#9af0a0');return true}
/* the turn-order bar: the unit acting now, the rest of this tick, then the clock run forward on copies (systems.md §1: it never lies) */
function v6Upcoming(b,n){v6Seat(b);const out=[];if(b.cur&&tcLive(b.cur))out.push(b.cur);b.queue.forEach(u=>{if(tcLive(u)&&out.length<n)out.push(u)});
  const c=b.units.filter(tcLive).map(u=>({ref:u,hp:1,ct:u.ct||0,init:u.init,side:u.side,seat:u.seat}));
  for(let t=0;t<400&&out.length<n;t++)tick(c).forEach(x=>{if(out.length<n)out.push(x.ref)});return out}
/* how far a v6 attack reaches: melee 1 (the spear 2); ranged and spells as far as the chance stays above 0, in sight (balance.md §4a) */
function v6InReach(b,a,t,rng){const s=tcStat(a);if(rng!=null&&rng!=='w')return tcEuc(a,t)<=rng+.5&&tcLos(b,a,t);
  const kind=v6Kind(a,{});if(kind==='melee')return tcCheb(a,t)<=1;
  const max=kind==='ranged'?1+(90+(s.acc||0))/(s.steady||6):1+90/(s.steady||4);return tcEuc(a,t)<=max+.5&&tcLos(b,a,t)}
/* the cost of a basic attack (balance.md §3): quick 1, heavy 2, otherwise it ends the turn */
function v6AtkCost(u){const s=tcStat(u);return s.quick?1:s.heavy?2:'end'}

/* ---------------------------------------------------------------- v6 skills, translated into the engine's tables */
function v6RegisterSkills(){RP_SK.v6_bigswing={n:'Big swing',mp:0,t:'foes',mul:0.6,d:'the telegraphed attack'};RP_ST.v6_bigswing={ap:'end',area:1.5,chan:1,v6:{sure:1}};
  for(const [id,s] of Object.entries(SKILLS6)){
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
    tcQ({k:'fn',fn:()=>{al.forEach(t=>{(t.vb=t.vb||[]).push({k:s.buff.k,v:s.buff.v,turns:s.buff.turns,own:u.own||''});tcFloatU(t,S.n,'#ffe27a')});if(!rp.headless)sfx('win')}});return true}
  if(T.line){const dx=Math.sign(act.cx-u.x),dy=Math.sign(act.cy-u.y),hit=[];
    for(let i=1;i<=T.line;i++){const x=u.x+dx*i,y=u.y+dy*i,v=tcUnitAt(b,x,y,u);if(v&&v.side!==u.side&&!hit.includes(v))hit.push(v)}
    hit.forEach(v=>tcQ({k:'atk',a:u,tg:v,o:{mul:S.mul,spell:T.spell,name:S.n,v6:s,area:1}}));if(!hit.length)tcFloatU(u,'nothing there','#d7c9e3');return true}
  if(T.tile){tcQ({k:'fn',fn:()=>v6TileSkill(b,u,act,s)});return true}
  return false}
function v6TileSkill(b,u,act,s){const x=act.cx,y=act.cy;b.tiles6=b.tiles6||[];
  /* a hidden tile with a status (the ranger's snare) is a trap too */
  if(s.fx==='trap'||s.fx==='traps3'||(!s.fx&&s.st)){b.tiles6.push({x,y,k:'trap',side:u.side,by:u,s});tcFloatU(u,'trap set','#e0c3ff');return}
  if(s.fx==='cover'){b.tiles6.push({x,y,k:'cover',turns:s.turns||3,old:b.g[y][x]});if(!tcUnitAt(b,x,y))b.g[y][x]='h';tcFloatU(u,'cover','#9be36b');return}
  if(s.fx==='teleport'||s.fx==='leap'){if(tcFits(b,u,x,y)){u.x=x;u.y=y;const h=tcHome(u);u.k.x=h.x;u.k.y=h.y}
    if(s.fx==='leap')b.units.filter(v=>v.side!==u.side&&tcLive(v)&&tcCheb(u,v)<=1).forEach(v=>v6Strike(u,v,{mul:s.mul,v6:s}));return}
  tcFloatU(u,s.n+' (soon)','#d7c9e3')}
/* the tiles a tile or area skill may target (build step 4, the legal-tile glow; the tap is refused anywhere else) */
function v6LegalTiles(b,u,sk){const S=SKILLS6[sk],T=RP_ST[sk]||{};if(!T.area)return null;const rng=T.rng==='w'?1:(T.rng||S&&S.rng||1),out=[];
  for(let y=0;y<b.H;y++)for(let x=0;x<b.W;x++){if(b.vis[y*b.W+x]!==2)continue;const d=T.tile&&S&&S.fx==='cover'?Math.max(Math.abs(x-u.x),Math.abs(y-u.y)):Math.hypot(x-u.x,y-u.y);if(d>rng+.5)continue;
    if(T.tile){if(tcT(b.g[y][x]).solid||tcUnitAt(b,x,y)||(b.tiles6||[]).some(t=>t.x===x&&t.y===y))continue}else if(!tcLosT(b,u.x,u.y,x,y))continue;out.push([x,y])}
  return out}
/* a unit steps on a tile: traps spring (systems.md: the rogue's and the ranger's) */
function v6OnTile(b,u){if(!b.tiles6)return;const tr=b.tiles6.find(t=>t.k==='trap'&&t.side!==u.side&&t.x===u.x&&t.y===u.y);if(!tr)return;
  b.tiles6=b.tiles6.filter(t=>t!==tr);tcFloatU(u,'trap!','#ffb347');v6Strike(tr.by,u,{mul:tr.s.mul||1,v6:tr.s})}

/* ---------------------------------------------------------------- bosses and hidden trials (balance.md §4, bestiary.md §5, §5b) */
const v6Soft=id=>Math.max(0.7,1-0.1*(((rp.s&&rp.s.bossDefeats)||{})[id]||0));   // 10% softer after each defeat, never under 70%
function v6BossKey(id){const B=BOSSES6[id];if(!B)return null;const key='v6b:'+id;
  RP_E[key]={v6:1,v6boss:1,boss:1,id,n:B.n,L:B.L,w:id==='snipe'?'popgun':'club',team:3,hp:Math.round(B.hp*v6Soft(id)),atk:B.atk,def:B.def,sd:B.sd,
    spd:5+.5*(B.L-1),dodge:B.dodge,init:B.init,move:B.move,res:B.res,xp:B.xp,gold:B.gold,adds:B.adds,ranged:id==='snipe',trick:id,acts:4};return key}
/* a patrol leader (balance.md §4: a visible group has one tough foe): the elite version of a foe, by the role ratios */
function v6EliteKey(id,L){const F=FOES6[id];if(!F)return null;const base=v6FoeKey(id,L),B=RP_E[base],E=ROLES6.elite,R=ROLES6[F.role]||ROLES6.normal,key=base.replace('v6:','v6e:');
  if(!RP_E[key])RP_E[key]=Object.assign({},B,{n:F.n+' leader',role:'elite',hp:Math.round(B.hp*E.hp/R.hp),atk:+(B.atk*E.atk/R.atk).toFixed(1),def:+(B.def*E.def/R.def).toFixed(1),sd:+(B.sd*E.sd/R.sd).toFixed(1),
    dodge:E.dodge,init:E.init,xp:Math.round(B.xp*E.hp/R.hp),gold:Math.round(B.gold*1.5),size:1.2});return key}
function v6TrialKey(id){const T=TRIALS6[id];if(!T)return null;const key='v6t:'+id;
  RP_E[key]={v6:1,v6trial:1,id,n:T.n,L:T.L,role:'elite',w:'club',team:3,hp:T.hp,atk:T.atk,def:T.def,sd:T.sd,spd:5+.5*(T.L-1),dodge:T.dodge,init:T.init,move:T.move,res:T.res,xp:T.xp,gold:T.gold,trick:id,size:1.4};return key}
/* the foes' turn, where it differs from the engine's AI: fleeing, confusion, bosses, trials; otherwise it draws a focus by threat */
function v6AiTurn(b,u){const E=u.E;
  if(v6Has(u,'confuse')){const own=b.units.filter(v=>v!==u&&v.side===u.side&&tcLive(v)&&tcCheb(u,v)<=1);if(own.length)tcQ({k:'atk',a:u,tg:own[0],o:{mul:1,name:'Confused swing'}});else tcFloatU(u,'confused','#e0c3ff');u.ap=0;b.phase='ai';return true}
  if(E.v6trial&&E.trick==='old_shellback'){u.tt=(u.tt||0)+1;u.curled=u.tt%2===0;if(u.curled){tcFloatU(u,'curls up','#e0c3ff');u.ap=0;b.phase='ai';return true}}
  if(E.v6boss)return v6BossTurn(b,u);
  if(E.tele){u.tel=(u.tel||0)+1;if(u.tel%3===2){const ks=b.units.filter(v=>v.side===0&&tcLive(v));if(ks.length){const c=v6Focus(b,u,ks);const ch={u,sk:'v6_bigswing',cx:c.x,cy:c.y,area:1.5,side:1};u.chan=ch;b.chans.push(ch);b.msg=u.name+' winds up a big swing: step away!';tcFloatU(u,'winds up!','#ffb347');u.ap=0;b.phase='ai';return true}}}   // the drill sergeant teaches the telegraph (slice-dialogue.md §1.4)
  const pod=b.units.filter(v=>v.side===1&&v.pod===u.pod),lost=pod.filter(v=>!tcLive(v)).length/Math.max(1,pod.length);
  if(!E.boss&&u.hp<u.max*0.25&&lost>=0.5)u.fleeing=true;
  if(u.fleeing){if(u.y===0){u.fled=true;tcFloatU(u,'runs off','#d7c9e3');b.msg=u.name+' runs off!';u.ap=0;b.phase='ai';return true}
    const R=tcReach(b,u,tcMov(u));let best=null,by=1e9;R.dist.forEach((d,k)=>{const y=(k/b.W)|0;if(y<by){by=y;best=k}});
    if(best!=null){const p=tcPath(R,best%b.W,(best/b.W)|0);if(p&&p.length)tcDo(u,{k:'move',path:p,cost:1})}u.ap=0;b.phase='ai';return true}
  if(v6Habit(b,u))return true;
  const seen=b.units.filter(v=>v.side===0&&tcLive(v)&&tcSideSees(b,1,v));u.focus=v6HabitFocus(b,u,seen)||v6Focus(b,u,seen);return false}
/* role habits (systems.md §3, bestiary.md "how it fights"): each changes whom the foe picks or adds one move; the AI's choice is otherwise the one rule */
function v6HabitFocus(b,u,list){if(!list.length)return null;const E=u.E,F=FOES6[E.id]||{},how=F.how||'';
  const by=f=>list.reduce((a,v)=>f(v)<f(a)?v:a);
  if(/most hurt/.test(how))return by(v=>v.hp/v.max);
  if(/lowest defence/.test(how))return by(v=>tcStat(v).def);
  if(/healer/.test(how)){const h=list.find(v=>v.m&&['cleric','druid'].includes(v.m.cls));if(h)return h}
  if(E.role==='brute')return by(v=>tcEuc(u,v));
  return null}
function v6Habit(b,u){const E=u.E,F=FOES6[E.id]||{},how=F.how||'';u.tt=(u.tt||0)+1;
  if(/curls up/.test(how)&&!u.curledOnce&&u.hp<u.max*0.5){u.curledOnce=1;u.vb=(u.vb||[]).concat([{k:'def',v:1,turns:1}]);tcFloatU(u,'curls up','#e0c3ff');b.msg=u.name+' curls up!';u.ap=0;b.phase='ai';return true}
  if(/guards \(dodge/.test(how)&&u.hp<u.max*0.5&&!u.guard&&!(u.guarded=!u.guarded)){u.guard=1;
    tcFloatU(u,'guards','#e0c3ff');b.msg=u.name+' raises its guard.';u.ap=0;b.phase='ai';return true}
  if(/calls a guard if alone/.test(how)&&!u.called&&!b.units.some(v=>v!==u&&v.side===1&&tcLive(v))){u.called=1;b.msg=u.name+' shouts for help!';v6Spawn(b,u,1,'guard recruit');u.ap=1;return false}
  if(/shouts weaken/.test(how)&&u.tt%3===1){const ks=b.units.filter(v=>v.side===0&&tcLive(v)&&tcEuc(u,v)<=4);if(ks.length){b.msg=u.name+' bellows at the pack!';
    ks.forEach(v=>{if(Math.random()<v6FoeStatusP(u,v))v6Status(v,{k:'weaken',turns:2});else tcFloatU(v,'resisted','#d7c9e3')});u.ap=1;return false}}
  if(E.role==='ranged'){const near=b.units.filter(v=>v.side===0&&tcLive(v)&&tcCheb(u,v)<=1);if(near.length){const R=tcReach(b,u,tcMov(u));let best=null,bv=-1e9;
    R.dist.forEach((d,k)=>{const x=k%b.W,y=(k/b.W)|0,dd=Math.min(...b.units.filter(v=>v.side===0&&tcLive(v)).map(v=>Math.hypot(v.x-x,v.y-y)));if(dd>bv){bv=dd;best=[x,y]}});
    if(best&&bv>1.5){const p=tcPath(R,best[0],best[1]);if(p&&p.length){tcDo(u,{k:'move',path:p,cost:1});b.msg=u.name+' backs away.'}}}}
  return false}
/* a foe's status rides on its hits and lands by the status rule (balance.md §4a), as a kobold's skill does */
const V6_FOE_ST={slow:'slow',poison:'poison',burn:'burn',fall:'fall',stun:'stun',weaken:'weaken',root:'root'};
function v6FoeStatusP(a,t){return statusLand({lvlGap:v6Lvl(t)-v6Lvl(a),res:tcStat(t).res||0,cha:0,kind:'normal',luck:-(tcStat(t).luck||0)})}
function v6FoeHitStatus(a){const F=a&&a.E&&a.E.v6&&FOES6[a.E.id];if(!F||!F.uses)return null;const m=/^(\w+) \(([^)]+)\)/.exec(F.uses);if(!m||!V6_FOE_ST[m[1]])return null;
  if(/shout|ice|slick|hot trail|wax/.test(m[2]))return null;   // these come from tiles or shouts, not from the hit
  return{k:V6_FOE_ST[m[1]],turns:2}}
function v6PosHabit(b,u,x,y,dn){const E=u.E;if(!E||!E.v6||E.v6boss)return 0;
  if(E.role==='ranged'&&dn<3)return -6;
  if(E.role==='caster'){const ks=b.units.filter(v=>v.side===0&&tcLive(v));if(!ks.length)return 0;const mine=Math.min(...ks.map(k=>Math.hypot(k.x-x,k.y-y)));
    const friend=b.units.some(v=>v!==u&&v.side===1&&tcLive(v)&&Math.min(...ks.map(k=>tcEuc(k,v)))<mine);return friend?3:-3}
  return 0}
function v6Focus(b,u,list){if(!list.length)return null;const w=list.map(v=>Object.assign({},v,{threat:(tcStat(v).threat||1)*(v.guard?2:1)*(tcSees(b,u,v)?1:0.5)}));
  const pickd=pickByThreat(w,Math.random());return list[w.indexOf(pickd)]}
function v6BossTurn(b,u){const E=u.E;u.bt=(u.bt||0)+1;
  const m=/(\d+) (.+?) on round (\d+)/.exec(E.adds||'');if(m&&u.bt===+m[3])v6Spawn(b,u,+m[1],m[2]);
  if(u.bt%3===0){b.msg=u.name+' brings down the big swing!';u.ap=0;b.phase='ai';return true}   // the telegraphed turn: the swing lands from the chan, nothing else
  const kob=()=>b.units.filter(v=>v.side===0&&tcLive(v));
  const reach=v=>E.ranged?tcEuc(u,v)<=9&&tcLos(b,u,v):tcCheb(u,v)<=1;
  if(!kob().some(reach)){const focus=v6Focus(b,u,kob());if(focus)v6BossWalk(b,u,focus,reach)}
  tcQ({k:'fn',fn:()=>{if(!tcLive(u))return;for(let i=0;i<(E.acts||4);i++){const tg=v6Focus(b,u,kob().filter(reach));if(tg)tcQ({k:'atk',a:u,tg,o:{mul:1,name:E.ranged?'Copper toss':'Swing'}})}
    if(u.bt%3===2){const ks=kob();if(ks.length){const c=v6Focus(b,u,ks);const ch={u,sk:'v6_bigswing',cx:c.x,cy:c.y,area:1.5,side:1};u.chan=ch;b.chans.push(ch);b.msg=u.name+' winds up a big swing: get out of the circle!';tcFloatU(u,'winds up!','#ffb347')}}}});
  u.ap=0;b.phase='ai';return true}
/* the boss walks the shortest way (over the whole board, as a 2 × 2) to where it can hit its focus, as far as one move goes; if even a
   dash would not get it there it dashes (the four attacks need a target, so a turn spent walking is the price) */
function v6BossWalk(b,u,focus,reach){const R=tcReach(b,u,99),mov=tcMov(u);let goal=null,gd=1e9;const ox=u.x,oy=u.y;
  R.dist.forEach((d,k)=>{if(d>=gd)return;u.x=k%b.W;u.y=(k/b.W)|0;if(reach(focus)){gd=d;goal=[u.x,u.y]}});u.x=ox;u.y=oy;
  if(!goal)return;const path=tcPath(R,goal[0],goal[1]);if(!path||!path.length)return;
  const budget=gd<=mov?mov:mov*2,cut=path.filter(([x,y])=>R.dist.get(y*b.W+x)<=budget);if(cut.length)tcDo(u,{k:'move',path:cut,cost:gd<=mov?1:2})}
function v6Spawn(b,u,n,what){const id=Object.keys(FOES6).find(k=>what.toLowerCase().includes(FOES6[k].n.toLowerCase().split(' ').slice(-1)[0].replace(/s$/,'')))||'nettlenose_scout';
  for(let i=0;i<n;i++){const key=v6FoeKey(id,u.E.L),E=RP_E[key];let spot=null;for(let r=1;r<4&&!spot;r++)for(let y=Math.max(0,u.y-r);y<=Math.min(b.H-1,u.y+r)&&!spot;y++)for(let x=Math.max(0,u.x-r);x<=Math.min(b.W-1,u.x+r)&&!spot;x++){const t={sz:1};if(tcFits(b,t,x,y)&&!b.units.some(o=>tcLive(o)&&x>=o.x&&x<o.x+(o.sz||1)&&y>=o.y&&y<o.y+(o.sz||1)))spot=[x,y]}
    if(!spot)return;const v={side:1,E,key,name:E.n,x:spot[0],y:spot[1],sz:1,hp:E.hp,max:E.hp,atk:E.atk,def:E.def,spd:E.spd,ap:0,stun:0,slow:0,buff:{atk:0,def:0},guard:0,watch:0,chan:null,aware:true,pod:u.pod,turns:0,fled:false,own:'e',ctl:'ai'};
    v.k=makeK({team:E.team,name:E.n,art:E.art||key,weapon:E.w,hp:E.hp,size:.62},0,0,!rp.headless);v.k.face=-1;const h=tcHome(v);v.k.x=h.x;v.k.y=h.y;b.units.push(v);tcFloatU(v,'joins!','#ffb347')}}

/* ---------------------------------------------------------------- the fight lab (checkpoint A): any classes and level against any place or foe */
const v6Lab={pack:['fighter','cleric','wizard','rogue'],lvl:5,place:0,theme:'',msg:''};
/* the board theme from where a fight happens (systems.md §2) */
function v6PlaceTheme(where){where=String(where||'').toLowerCase();if(/flooded/.test(where))return'flooded';if(/dark|deep/.test(where))return'dark';
  if(/mine|cellar|cave|crater|wreck|tunnel/.test(where))return'cave';if(/castle|yard|town|hall|throne|pier|roof|oasis|oven|square|harbour|barracks/.test(where))return'town';if(/wood|forest/.test(where))return'woods';return'meadow'}
/* the lab's kobolds stay between fights (so the sheet's picks count); a new pack or level makes new ones */
function v6LabKobolds(){const sig=v6Lab.pack.join(',')+'@'+v6Lab.lvl;if(!v6Lab.ks||v6Lab.sig!==sig){v6Lab.sig=sig;v6Lab.ks=v6Lab.pack.map((c,i)=>c?v6Kobold(['Pip','Wizzle','Glint','Bork'][i],c,v6Lab.lvl,{hero:i===0}):null)}return v6Lab.ks}
function v6LabStart(){const s=rp.s;if(!s)return;const L=v6Lab.lvl,members=v6LabKobolds().filter(Boolean).map(m=>{const st=v6Stats(m);m.hp=st.hp;m.mp=st.mp;return{m,ctl:'me',own:'h'}});
  const sel=String(v6Lab.place);rp.mode='map';const th=t=>v6Lab.theme||v6PlaceTheme(t);
  if(sel.startsWith('b:')){const key=v6BossKey(sel.slice(2));rpBattle([key],{members,boss:key,v6:1,theme:th(BOSSES6[sel.slice(2)].where)})}
  else if(sel.startsWith('t:')){const key=v6TrialKey(sel.slice(2));rpBattle([key],{members,zone:',',v6:1,theme:th(TRIALS6[sel.slice(2)].where)})}
  else{const P=PLACES6[+sel],keys=v6Mix(Object.assign({},P,{L:Math.max(1,L)}));rpBattle(keys,{members,zone:',',v6:1,theme:th(P.place)})}rp.bt.v6=1}
function v6LabHtml(){const opt=(v,list)=>list.map(x=>'<option value="'+x[0]+'"'+(String(x[0])===String(v)?' selected':'')+'>'+x[1]+'</option>').join('');
  const cls=[['','—']].concat(Object.entries(CLASSES6).map(([k,c])=>[k,c.n]));
  return'<div class="rpdlg"><div class="who">Fight lab (test)</div><p>Pick a pack, a level and a place; the fight uses the v6 rules.</p>'+
    v6Lab.pack.map((c,i)=>'<label>Kobold '+(i+1)+' <select id="lab-p'+i+'">'+opt(c||'',cls)+'</select></label> ').join('')+
    '<label>Level <select id="lab-l">'+opt(v6Lab.lvl,Array.from({length:30},(_,i)=>[i+1,i+1]))+'</select></label> '+
    '<label>Fight <select id="lab-pl">'+opt(v6Lab.place,PLACES6.map((p,i)=>[i,p.place+' (L'+p.L+')']).concat(Object.values(BOSSES6).map(B=>['b:'+B.id,'Boss: '+B.n+' (L'+B.L+')']),Object.values(TRIALS6).map(T=>['t:'+T.id,'Trial: '+T.n+' (L'+T.L+')'])))+'</select></label> '+
    '<label>Board <select id="lab-th">'+opt(v6Lab.theme,[['','by place'],['meadow','meadow'],['woods','woods'],['cave','cave'],['town','town'],['dark','dark'],['flooded','flooded']])+'</select></label>'+
    '</div><div class="rpcmd">'+(v6Lab.ks&&v6Lab.sig===v6Lab.pack.join(',')+'@'+v6Lab.lvl?v6Lab.ks.map((m,i)=>m?'<button class="rpb" type="button" data-rp="v6sheet" data-v="'+i+'">'+m.name+'\'s sheet<small>level '+m.lvl+(m.pend>0?' · ✦ '+m.pend+' pick'+(m.pend>1?'s':''):'')+'</small></button>':'').join(''):'<button class="rpb" type="button" data-rp="labmake">Make the pack<small>then open their sheets</small></button>')+'</div>'+
    '<div class="tbar"><button class="rpb" type="button" data-rp="labwalk">Walk the slice<small>test: Hearthspire, R1, the mine</small></button><button class="rpb go" type="button" data-rp="labgo">Fight</button><button class="rpb x" type="button" data-rp="labclose">Back</button></div>'}
feature({id:'fightlab',init(){v6RegisterSkills()},
  panels:{lab:{sig:()=>JSON.stringify([v6Lab.pack,v6Lab.lvl,v6Lab.place,v6Lab.theme,v6Lab.sig,(v6Lab.ks||[]).map(m=>m&&[m.lvl,m.pend])]),html:v6LabHtml}},
  menu:[{order:90,html:()=>rp.s&&rp.s.test?'<button class="rpb" type="button" data-rp="lab">Fight lab<small>test fights (a test hero)</small></button>':''}],
  actions:{lab:()=>{rp.mode='lab'},labclose:()=>{rp.mode='menu'},labgo:()=>{v6LabRead();v6LabStart()},labmake:()=>{v6LabRead();v6LabKobolds()},labwalk:()=>{v6LabRead();const ks=v6LabKobolds().filter(Boolean);ks.forEach(m=>{const st=v6Stats(m);m.hp=st.hp;m.mp=st.mp});w6Start(ks)}}});
function v6LabRead(){const g=id=>{const e=typeof document!=='undefined'&&document.getElementById(id);return e?e.value:null};
  for(let i=0;i<4;i++){const v=g('lab-p'+i);if(v!=null)v6Lab.pack[i]=v||null}const l=g('lab-l'),p=g('lab-pl'),th=g('lab-th');if(th!=null)v6Lab.theme=th;if(l)v6Lab.lvl=+l;if(p!=null&&p!=='')v6Lab.place=/^[bt]:/.test(p)?p:+p}
export {V6_FOE_ST,V6_ROLE_LOOK,V6_WEAK,v6AiTurn,v6AtkCost,v6BossKey,v6BossTurn,v6BossWalk,v6Buff,v6Crit,v6DmgRange,v6DoSkill,v6EliteKey,v6Focus,v6FoeHitStatus,v6FoeKey,v6FoeStat,v6FoeStat0,v6FoeStatusP,v6Habit,v6HabitFocus,v6Has,v6HealMul,v6Hit,v6InReach,v6Kind,v6Lab,v6LabHtml,v6LabKobolds,v6LabRead,v6LabStart,v6Land,v6Lead,v6LeadMul,v6LegalTiles,v6Light,v6Lvl,v6Mix,v6Move,v6OnFell,v6OnTile,v6PackMorale,v6PairKey,v6PlaceTheme,v6PosHabit,v6Queue,v6RankMul,v6RegisterSkills,v6Revive,v6ReviveOK,v6Seat,v6Soft,v6Spawn,v6Status,v6StdHp,v6Strike,v6TileSkill,v6Together,v6TogetherOpts,v6TrialKey,v6TurnStart,v6Upcoming};
