#!/usr/bin/env node
'use strict';
/* Kobold Quest: the balance model. One parameter block (P), the equations, and an abstract fight simulator.
   It does NOT touch the game's code: it is the design's own mathematics, so the documents (balance.md, items.md,
   ui-design.md) can be checked against it and regenerated from it.
   Every constant is tagged: D derived, J judgment, B borrowed from the engine, U unverified (needs a playtest).
   Usage:  node tools/balance-model.js [levels|classes|fights|bosses|parity|all]            */

/* ---------------------------------------------------------------- parameters */
const P={
  xpA:12, xpExp:1.6,                               // B  XP to next level = xpA * L^xpExp
  base:{atk:[5,2.2], def:[3,1.8], hp:[44,11]},     // B  base stat = a + b*(L-1)
  tiers:[1,5,10,16,22,28],                         // J  gear tiers arrive at these levels (gaps 4,5,6,6,6)
  gear:{atk:.80, def:.68, hp:.22},                 // J  full-kit share of base stat (items.md)
  talents:{atk:.45, def:.375, hp:2.1},             // J  per level from talent picks (30% stat picks)
  foeDefSlope:.95,                                 // J  foe defence 1 + slope*(L-1)
  foeHpMult:4,                                     // J  standard foe HP = foeHpMult * (fighter basic hit)
  foeHitShare:l=>l<=5?.16:l<=20?.14:.12,           // J  share of fighter HP one foe hit takes
  foesPerFight:l=>l<=5?2.5:l<=12?3:3.2,            // J
  hit:{melee:.90, ranged:.66, spell:1.0},          // J  ranged includes average cover and range (balance.md 4a)
  foeHit:.80,                                      // J  foes' average chance to hit a pack member
  crit:.08, critMul:1.5,                           // B/J
  dmgSpread:.15,                                   // B  +-15%
  frontWeight:2,                                   // J  foes pick the front-line kobold twice as often
  potion:.35, potionsPerFight:3,                   // J  potions in the bag at a boss
  mercy:.15,                                       // J  after two misses
  etaUtility:1.0,                                  // J  1 point of utility share = 1 point of power
  manaK:2.2,                                       // J  mana at L30 = manaK x (1.2 casts/round x 3.5 rounds) x cost: how many fights of full casting a pool lasts
  roundsRef:3.5,                                   // D  from the sim below (kept in sync by hand)
};

/* ---------------------------------------------------------------- small helpers */
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const need=l=>Math.round(P.xpA*Math.pow(l,P.xpExp));
const tierAt=l=>{let t=0;P.tiers.forEach((x,i)=>{if(x<=l+1)t=i});return t};
const bAtk=l=>P.base.atk[0]+P.base.atk[1]*(l-1), bDef=l=>P.base.def[0]+P.base.def[1]*(l-1), bHp=l=>P.base.hp[0]+P.base.hp[1]*(l-1);
const foeDef=l=>1+P.foeDefSlope*(l-1);
/* the reference fighter (every other class is a multiple of this) */
function ref(l){const t=P.tiers[tierAt(l)];
  return{atk:bAtk(l)+P.gear.atk*bAtk(t)+P.talents.atk*(l-1), def:bDef(l)+P.gear.def*bDef(t)+P.talents.def*(l-1), hp:bHp(l)+P.gear.hp*bHp(t)+P.talents.hp*(l-1)}}
function foe(l){const r=ref(l),D=r.atk-foeDef(l)/2;                     // D = the fighter's basic hit on an on-level foe
  return{D,hp:P.foeHpMult*D,def:foeDef(l),atk:P.foeHitShare(l)*r.hp+r.def/2}}

/* ---------------------------------------------------------------- classes: derived, not guessed
   Each class has a power budget split into damage d, durability h, utility u (d+h+u=1).
   Combat power = sqrt(DPR * EHP) (the geometric mean, the usual "combat power") times (1 + eta*u).
   Equal power for every class means  sqrt(x*y) = (1+eta*u_fighter)/(1+eta*u_class),
   and the archetype ratio is x/y = sqrt((d/h)/(d0/h0)).  Solve for x (relative damage per round) and y (relative
   effective HP). The stat multipliers then follow from x and y (see deriveClasses).              */
const KIT={ // main skill: mul per target, targets hit, mana, type; support skills where they matter
  fighter:{atk:{mul:1.8,mp:3},style:'melee'},
  barbarian:{atk:{mul:2.4,mp:4},style:'melee',hitMod:-.05},
  paladin:{atk:{mul:1.7,mp:4,spell:1},heal:{f:.6,mp:5,under:.4},style:'melee'},
  ranger:{atk:{mul:2.2,mp:4,hit:.20},style:'ranged',hitMod:.10},
  rogue:{atk:{mul:1.62,mp:4},style:'melee',hitMod:.05},
  monk:{atk:{mul:1.5,mp:3,rolls:3,hit:-.10},style:'melee',hitMod:.05},
  cleric:{atk:null,heal:{f:.45,mp:3,under:.55},style:'spell',weak:1},
  druid:{atk:null,heal:{f:.45,mp:6,under:.55,all:1},style:'spell',weak:1},
  bard:{atk:{mul:.8,mp:2,spell:1},buff:{mp:4},style:'spell',weak:1},
  wizard:{atk:{mul:1.0,mp:5,spell:1,area:2.2},style:'spell'},
  sorcerer:{atk:{mul:1.0,mp:5,spell:1,area:2.2},style:'spell'},
  warlock:{atk:{mul:1.3,mp:2,spell:1},hex:{mp:3},style:'spell'}};
const SPLIT={fighter:[.30,.50,.20],barbarian:[.50,.35,.15],paladin:[.30,.40,.30],ranger:[.45,.20,.35],rogue:[.45,.20,.35],monk:[.40,.30,.30],
  cleric:[.15,.30,.55],druid:[.25,.25,.50],bard:[.20,.20,.60],wizard:[.55,.10,.35],sorcerer:[.60,.12,.28],warlock:[.50,.22,.28]};
const SPD={fighter:1,barbarian:1,paladin:.9,ranger:1.3,rogue:1.4,monk:1.4,cleric:.9,druid:1,bard:1.1,wizard:.95,sorcerer:1,warlock:1};  // J
const NAMES=Object.keys(SPLIT);
/* expected damage per round of a class kit against one on-level foe, over R rounds, with mana M (greedy casting) */
function dprOf(cls,L,atkMult,M,R){const k=KIT[cls],r=ref(L),f=foe(L),atk=r.atk*atkMult,n=P.foesPerFight(L);
  const hitBase=k.style==='melee'?P.hit.melee:k.style==='ranged'?P.hit.ranged:P.hit.spell;
  const cf=1+P.crit*(P.critMul-1);
  const one=(mul,spell,hitAdj,tg)=>{const h=spell?1:clamp(hitBase+(k.hitMod||0)+(hitAdj||0),.15,.95);return h*cf*Math.max(1,atk*mul-f.def/2)*Math.min(tg||1,n)*(k.atk&&k.atk.rolls?1:1)};
  const basicMul=k.weak?.6:1;                                              // healers/bards' weapon attacks are weak (items.md: holy, instruments x0.6)
  const basic=one(basicMul,k.style==='spell'&&!k.weak?1:0,k.weak?-.10:0,1);
  if(!k.atk)return basic;                                                  // pure support: attacks with the weapon
  const mp=k.atk.mp,casts=Math.min(R,Math.floor(M/mp)),skill=k.atk.rolls?k.atk.rolls*one(k.atk.mul/k.atk.rolls,k.atk.spell,k.atk.hit,1):one(k.atk.mul,k.atk.spell,k.atk.hit,k.atk.area||1);
  return(casts*skill+(R-casts)*basic)/R}
/* mana pool: enough for 'sustain' fights of greedy casting at ~1.2 casts a round; shrinks to the skill's cost early on */
function manaPool(cls,L){const k=KIT[cls];const c=k.atk?k.atk.mp:k.heal?k.heal.mp:3;const casts=1.2*P.roundsRef;
  const m30=P.manaK*casts*c, m1=Math.max(3*c,6);return Math.round(m1+(m30-m1)*(L-1)/29)}
function deriveClasses(L0){L0=L0||10;const [d0,h0,u0]=SPLIT.fighter,out={};
  const f0=ref(L0),fo=foe(L0);
  const dprF=dprOf('fighter',L0,1,manaPool('fighter',L0),P.roundsRef);
  NAMES.forEach(c=>{const [d,h,u]=SPLIT[c];
    const g=(1+P.etaUtility*u0)/(1+P.etaUtility*u);                      // sqrt(x*y)
    const rho=Math.sqrt((d/h)/(d0/h0));                                  // x/y
    const x=g*Math.sqrt(rho), y=g/Math.sqrt(rho);                        // relative DPR and relative EHP
    // attack multiplier: bisection so that dprOf(...)/dprF = x
    let lo=.1,hi=4;for(let i=0;i<60;i++){const mid=(lo+hi)/2;(dprOf(c,L0,mid,manaPool(c,L0),P.roundsRef)/dprF<x)?lo=mid:hi=mid}
    const atkM=KIT[c].weak?1:(lo+hi)/2;                                  // J: supports keep a plain weapon; their budget is the heal/buff
    const hpM=Math.pow(y,.6);                                            // J: durability is mostly HP, the rest defence
    // y = hpM * (foeAtk - fighterDef/2) / (foeAtk - classDef/2)  =>  classDef
    const dmgF=fo.atk-f0.def/2, dmgC=dmgF*hpM/y, defM=clamp((fo.atk-dmgC)*2/f0.def,.2,1.6);
    out[c]={d,h,u,x,y,atk:atkM,hp:hpM,def:defM,spd:SPD[c]}});
  return out}
let CLS=null;const classes=()=>CLS||(CLS=deriveClasses(10));

/* ---------------------------------------------------------------- the fight simulator (abstract, one main action a round) */
function makePack(names,L){const C=classes(),r=ref(L);
  return names.map((c,i)=>{const k=KIT[c],m=C[c];return{cls:c,side:0,hp:r.hp*m.hp,max:r.hp*m.hp,def:r.def*m.def,atk:r.atk*m.atk,spd:r.hp*0+ (5+.5*(L-1))*m.spd,
    mana:manaPool(c,L),k,misses:0,front:false}})}
function makeFoes(Lf,rand,opt){opt=opt||{};const f=foe(Lf),n=opt.n!=null?opt.n:Math.floor(P.foesPerFight(Lf))+(rand()<P.foesPerFight(Lf)%1?1:0);
  const out=[];for(let i=0;i<n;i++)out.push({cls:'foe',side:1,hp:f.hp,max:f.hp,def:f.def,atk:f.atk,spd:5+.5*(Lf-1),weak:0,hex:0});
  return out}
function fight(pack,foes,rand,policy,opt){opt=opt||{};const careless=policy==='careless';
  let potions=careless?0:(opt.potions!=null?opt.potions:0),rounds=0,falls=0,dealt=0,buff=0,boss=opt.boss||null;
  const all=()=>pack.concat(foes);
  pack.forEach(u=>u.front=false);const fr=pack.reduce((a,b)=>b.def*b.max>a.def*a.max?b:a);fr.front=true;
  const roll=(p)=>rand()<p;
  const hurt=(t,d)=>{if(t.hp<=0)return;t.hp-=d;if(t.hp<=0){t.hp=0;if(t.side===0)falls++}};
  const dmg=(atk,mul,def)=>Math.max(1,atk*mul-def/2)*(1+P.dmgSpread*(2*rand()-1));
  let bigPhase=0;const stats=opt.stats||{oneshot:0,minhp:1};
  const pickT=()=>{const live=pack.filter(x=>x.hp>0),w=live.map(x=>x.front?P.frontWeight:1),tw=w.reduce((a,b)=>a+b,0);let rr=rand()*tw;for(let i=0;i<live.length;i++){rr-=w[i];if(rr<=0)return live[i]}return live[0]};
  while(pack.some(u=>u.hp>0)&&foes.some(u=>u.hp>0)&&rounds<80){
    rounds++;
    if(boss&&rounds===4&&boss.adds){boss.adds.forEach(a=>foes.push(a))}
    const order=all().filter(u=>u.hp>0).sort((a,b)=>b.spd*(.8+.4*rand())-a.spd*(.8+.4*rand()));
    if(buff>0)buff--;
    foes.forEach(f=>{if(f.weak>0)f.weak--;if(f.hex>0)f.hex--});
    for(const u of order){
      if(u.hp<=0)continue;
      if(!pack.some(x=>x.hp>0)||!foes.some(x=>x.hp>0))break;
      if(u.side===1){                                                    // a foe attacks
        const live=pack.filter(x=>x.hp>0),w=live.map(x=>x.front?P.frontWeight:1),tw=w.reduce((a,b)=>a+b,0);let rr=rand()*tw,t=live[0];for(let i=0;i<live.length;i++){rr-=w[i];if(rr<=0){t=live[i];break}}
        let atk=u.atk*(u.weak>0?.75:1);
        if(u.boss&&rounds%3===0){                                        // telegraphed big attack on everyone; a competent pack steps out of half of it
          live.forEach(x=>{if(careless||rand()<.5){hurt(x,dmg(atk,.6,x.def))}});continue}
        for(let a=0;a<(u.acts||1);a++){const tt=a?pack.filter(x=>x.hp>0)[0]&&pickT():t;if(!tt)break;if(roll(P.foeHit)){let d=dmg(atk,1,tt.def);if(roll(P.crit))d*=P.critMul;if(d>=tt.max*.999&&tt.hp===tt.max)stats.oneshot++;hurt(tt,d)}}
        continue}
      /* a pack kobold acts */
      const live=pack.filter(x=>x.hp>0),k=u.k;
      // 1 potion
      if(!careless&&potions>0){const low=live.reduce((a,b)=>b.hp/b.max<a.hp/a.max?b:a);if(low.hp/low.max<.30&&!(k.heal&&u.mana>=k.heal.mp)){low.hp=Math.min(low.max,low.hp+P.potion*low.max);potions--;continue}}
      // 2 heal
      if(k.heal){const thr=careless?.25:k.heal.under,low=live.reduce((a,b)=>b.hp/b.max<a.hp/a.max?b:a);
        if(low.hp/low.max<thr&&u.mana>=k.heal.mp){u.mana-=k.heal.mp;if(k.heal.all)live.forEach(x=>{x.hp=Math.min(x.max,x.hp+k.heal.f*.6*x.max)});else low.hp=Math.min(low.max,low.hp+k.heal.f*low.max);continue}}
      // 3 buff / hex
      if(k.buff&&buff===0&&u.mana>=k.buff.mp&&!careless){u.mana-=k.buff.mp;buff=3;continue}
      const lf=foes.filter(x=>x.hp>0);if(!lf.length)break;
      let t=careless?lf[(rand()*lf.length)|0]:lf.reduce((a,b)=>b.hp<a.hp?b:a);
      if(k.hex&&!careless&&t.hex===0&&u.mana>=k.hex.mp){u.mana-=k.hex.mp;t.hex=3;continue}
      // 4 attack
      const kind=k.style;let skill=k.atk,useSkill=skill&&u.mana>=skill.mp;
      let mul=useSkill?skill.mul:(k.weak?.6:1),spell=useSkill?skill.spell:(kind==='spell'&&!k.weak),hitMod=(k.hitMod||0)+(useSkill?(skill.hit||0):0)+(k.weak?-.10:0);
      if(useSkill)u.mana-=skill.mp;
      const base=kind==='melee'?P.hit.melee:kind==='ranged'?P.hit.ranged:P.hit.spell;
      const targets=useSkill&&skill.area?lf.slice().sort((a,b)=>a.hp-b.hp).slice(0,Math.round(skill.area)):[t];
      if(useSkill&&skill.area&&!careless){targets.length=Math.min(targets.length,lf.length)}
      const rolls=useSkill&&skill.rolls?skill.rolls:1;
      for(const tg of targets){for(let i=0;i<rolls;i++){
        let p=spell?1:clamp(base+hitMod,.15,.95);if(!spell&&u.misses>=2&&!careless){p=clamp(p+P.mercy,.15,.95)}
        if(roll(p)){u.misses=0;let m=useSkill&&skill.rolls?mul/skill.rolls:mul;let d=dmg(u.atk*(buff>0?1.25:1),m*(tg.hex>0?1.25:1),tg.def);if(roll(P.crit))d*=P.critMul;const dd=Math.min(d,tg.hp);dealt+=dd;hurt(tg,d)}else if(!spell)u.misses++}}
    }
  }
  const endhp=pack.reduce((a,u)=>a+u.hp,0)/pack.reduce((a,u)=>a+u.max,0);
  const win=foes.every(x=>x.hp<=0)&&pack.some(x=>x.hp>0);
  const lost=pack.reduce((a,u)=>a+(u.max-u.hp),0)/pack.reduce((a,u)=>a+u.max,0);
  return{win,rounds,lost,falls,dealt,endhp,oneshot:stats.oneshot}}

/* ---------------------------------------------------------------- experiments */
function runFights(names,Lp,Lf,N,policy,seed,opt){const rand=rng(seed||1),res={win:0,rounds:0,lost:0,falls:0,dealt:0,clean:0};
  for(let i=0;i<N;i++){const pack=makePack(names,Lp),foes=opt&&opt.foes?opt.foes(Lf,rand):makeFoes(Lf,rand);const r=fight(pack,foes,rand,policy,opt);
    res.win+=r.win;res.rounds+=r.rounds;res.lost+=r.lost;res.falls+=r.falls;res.dealt+=r.dealt;res.clean+=(r.win&&r.falls===0)}
  Object.keys(res).forEach(k=>res[k]/=N);return res}
const f2=x=>x.toFixed(2),pc=x=>(x*100).toFixed(0)+'%';
module.exports={P,need,ref,foe,classes,KIT,SPLIT,NAMES,makePack,makeFoes,fight,runFights,rng,tierAt,manaPool,dprOf,bAtk,bDef,bHp,foeDef};

if(require.main===module){
  const what=process.argv[2]||'all';
  if(what==='classes'||what==='all'){
    console.log('DERIVED CLASSES (L10): x = relative damage/round, y = relative effective HP');
    console.log('| class | d | h | u | x (DPR) | y (EHP) | HP x | attack x | defence x | speed x | mana L1 | mana L30 |');
    const C=classes();NAMES.forEach(c=>{const m=C[c];console.log(`| ${c} | ${m.d} | ${m.h} | ${m.u} | ${f2(m.x)} | ${f2(m.y)} | ${f2(m.hp)} | ${f2(m.atk)} | ${f2(m.def)} | ${m.spd} | ${manaPool(c,1)} | ${manaPool(c,30)} |`)})}
  if(what==='fights'||what==='all'){
    console.log('\nNORMAL FIGHTS, competent play, on level (reference packs)');
    const packs=[['fighter','cleric','wizard'],['fighter','cleric','ranger'],['paladin','bard','sorcerer'],['barbarian','rogue','druid'],['monk','warlock','cleric'],['fighter','fighter','fighter']];
    console.log('| pack | level | rounds | pack HP lost | falls | win | damage dealt per round (in basic hits) |');
    packs.forEach(p=>[3,10,20,30].forEach(L=>{const r=runFights(p,L,L,3000,'competent',7);const D=foe(L).D;console.log(`| ${p.join('+')} | ${L} | ${f2(r.rounds)} | ${pc(r.lost)} | ${f2(r.falls)} | ${pc(r.win)} | ${f2(r.dealt/r.rounds/D)} |`)}))}
}

/* ---------------------------------------------------------------- bosses: HP multiple k vs rounds and win rate */
function bossFight(names,L,k,rand,delta,opt){opt=opt||{};const f=foe(L),r=ref(L),D=f.D;
  const b={cls:'boss',side:1,boss:true,hp:k*D*(opt.players||1),max:k*D*(opt.players||1),def:f.def,acts:opt.acts||1,atk:(opt.hit||.20)*r.hp+r.def/2,spd:5+.5*(L-1),weak:0,hex:0};
  const Lp=L+delta;const pack=makePack(names,Lp);
  return fight(pack,[b],rand,opt.policy||'competent',{potions:P.potionsPerFight})}
function bossRun(names,L,k,delta,N,opt){const rand=rng(11),s={win:0,rounds:0,falls:0,oneshot:0,close:0};
  for(let i=0;i<N;i++){const r=bossFight(names,L,k,rand,delta||0,opt);s.win+=r.win;s.rounds+=r.rounds;s.falls+=r.falls;s.oneshot+=r.oneshot;s.close+=(r.win&&r.endhp<.4)}
  Object.keys(s).forEach(x=>s[x]/=N);return s}
module.exports.bossRun=bossRun;
if(require.main===module&&(process.argv[2]==='bosses'||process.argv[2]==='all')){
  const pk=['fighter','cleric','wizard'];
  console.log('\nBOSS: rounds and win rate on level, pack fighter+cleric+wizard, 3 potions, boss hit = 20% of fighter HP');
  console.log('| level | k | rounds | win | falls |');
  [5,10,18,30].forEach(L=>[8,12,18,24,30,42].forEach(k=>{const s=bossRun(pk,L,k,0,2000);console.log(`| ${L} | ${k} | ${f2(s.rounds)} | ${pc(s.win)} | ${f2(s.falls)} |`)}));
  console.log('\nWin rate vs level gap (L=18, k=24):');
  [-4,-2,0,2,4].forEach(d=>{const s=bossRun(pk,18,24,d,3000);console.log(`gap ${d}: win ${pc(s.win)} rounds ${f2(s.rounds)}`)});
}
