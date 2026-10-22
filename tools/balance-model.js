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
  /* the talent picks the reference fighter makes, like a player (skills.md §2; P27, 22 Oct): one pick a level from level 2;
     about 9 of 29 are score cards (STR and CON in turn), the class's talent skills come at 2, 5, 11 and 14, every other pick is a
     passive worth 3 pp (Tough +3% HP, Weapon focus +3% attack, Iron skin +7.5% defence, in turn). It replaces the old talent line. */
  picks:{scoreShare:9/29, skillLevels:[2,5,11,14], passives:[{hp:.03},{atk:.03},{def:.075}]},
  foeDefSlope:.95,                                 // J  foe defence 1 + slope*(L-1)
  foeHpMult:4,                                     // J  standard foe HP = foeHpMult * (fighter basic hit)
  foeHitShare:l=>l<=5?.16:l<=20?.14:.12,           // J  share of fighter HP one foe hit takes
  packSize:4,                                      // J  a pack of four (decided 22 Oct); all fights tuned for four kobolds
  foesPerFight:l=>(l<=5?2.5:l<=12?3:3.2)*4/3,      // D  the pack-of-three figures x 4/3: foes scale with the pack
  dmgC:.39,                                        // D  fitted so the level table's basic hit holds under the HoMM3 factor
  /* the one hit formula (balance.md 4a): chance = 100% + accuracy - dodge - cover - distance - multiple-attack penalty */
  board:{foeDodge:.10, halfCover:.20, coverShare:.30, rangedTiles:[2,3,4,5,6,7], spellTiles:[1,2,3,4,5,6], flankShare:.20},  // J  the average board (4a "the check")
  spellResist0:.10,                                // D  base resist before distance; a resisted spell deals half
  koboldDodge:l=>.10+.10*Math.min(1,(l-1)/14),     // J  10% base, about 20% by mid-game from gear (4a)
  crit:.08, critMul:1.5,                           // B/J  flanked +15, unseen +10 (4a)
  critRule:'value',                                // J  decided 22 Oct (P22): crit bonuses paid by value; 'add' is the old rule
  bond:l=>5*(l-1)/29,                             // D  the expected bond a pack has at level l (P24, decided 22 Oct)
  luck:0, morale:null, leadership:0,                // morale null = the expected bond at the pack's level                  // J  defaults: an ordinary pack (balance.md 3, the new stats)
  dmgSpread:.15,                                   // B  +-15%
  potion:.35, potionsPerFight:3,                   // J  potions in the bag at a boss
  mercy:.15,                                       // J  after two misses
  etaUtility:1.0,                                  // J  1 point of utility share = 1 point of power
  bossTiles:4, bossOverlap:3,                      // J  a boss covers 2x2 tiles; an area attack overlaps on average 3 of the 4, and every overlapped tile is one hit
  bossT:[5.73,.053], bossK:[4.67,.04],                            // D/J boss rules (balance.md s4): damage budget in fighter-HPs and HP multiple per round
  phaseBreak:0,                                    // J  rounds a boss loses when first brought to half HP (0 = off)
  buffGuard:.25,                                    // J  Rousing song also cuts damage taken by this share
  buffFree:false,                                  // J  true: singing costs mana but not the action
  buffMul:1.25,                                    // J  Rousing song: the pack hits this much harder for 3 rounds
  spread:.5,                                       // J  how far archetypes diverge: 0 = all classes identical in damage and durability, .5 = full sqrt trade-off
  bossWeight:.30,                                  // D  share of combat time spent against a single boss (55 of 184 min, balance.md s2)
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
function picksAt(l){const n=Math.max(0,l-1),sc=Math.floor(n*P.picks.scoreShare),sk=P.picks.skillLevels.filter(x=>x<=l).length;
  const STR=15+Math.ceil(sc/2),CON=14+Math.floor(sc/2),mod=v=>Math.floor((v-10)/2);const pas={hp:0,atk:0,def:0};
  for(let i=0;i<Math.max(0,n-sc-sk);i++){const p=P.picks.passives[i%3];for(const k in p)pas[k]+=p[k]}
  return{scores:sc,skills:sk,passives:Math.max(0,n-sc-sk),fA:(1+.05*mod(STR))/1.10,fC:(1+.05*mod(CON))/1.10,pas}}
function ref(l){const t=P.tiers[tierAt(l)],k=picksAt(l);
  return{atk:(bAtk(l)+P.gear.atk*bAtk(t))*k.fA*(1+k.pas.atk), def:(bDef(l)+P.gear.def*bDef(t))*k.fC*(1+k.pas.def), hp:(bHp(l)+P.gear.hp*bHp(t))*k.fC*(1+k.pas.hp)}}
/* HoMM3 attack-versus-defence factor (balance.md 4a, decided 22 Oct) */
function HF(A,D){const d=40*(A-D)/Math.max(1e-9,A+D);return d>=0?1+0.05*d:Math.max(0.3,1+0.025*d)}
function hitDmg(A,M,D){return Math.max(1,P.dmgC*A*M*HF(A,D))}
function atkFor(target,D){let lo=0,hi=1e6;for(let i=0;i<100;i++){const m=(lo+hi)/2;hitDmg(m,1,D)<target?lo=m:hi=m}return hi}   // the attack that lands `target` on defence D
/* the curve expects the bond (P24): foes' HP and damage carry g(L) = 1 + p(b)/2 */
const foeScale=l=>{const b=P.bond(l);return 1+.5*b/(b+6)};
function foe(l){const r=ref(l),D=hitDmg(r.atk,1,foeDef(l)),g=foeScale(l);                // D = the fighter's basic hit on an on-level foe
  return{D,g,hp:P.foeHpMult*D*g,def:foeDef(l),atk:atkFor(g*P.foeHitShare(l)*r.hp,r.def)}}

/* ---------------------------------------------------------------- the 21-22 Oct rules (P17): scores, Balance, hit, crit, luck,
   initiative, threat, morale, burn and poison. Every number here is the documents' (balance.md 3 and 4a, skills.md). */
const SC=['STR','DEX','CON','INT','WIS','CHA'],ARRAY=[15,14,13,12,10,8];
const PRIORITY={fighter:'STR CON DEX WIS CHA INT',barbarian:'STR CON DEX WIS CHA INT',paladin:'STR CHA CON WIS DEX INT',ranger:'DEX WIS CON STR INT CHA',
  rogue:'DEX INT CON CHA WIS STR',monk:null,cleric:'WIS CON STR CHA DEX INT',druid:'WIS CON DEX INT STR CHA',bard:'CHA DEX CON WIS INT STR',
  wizard:'INT CON DEX WIS CHA STR',sorcerer:'CHA CON DEX INT WIS STR',warlock:'CHA CON DEX WIS INT STR'};
const ATK_SCORE={fighter:'STR',barbarian:'STR',paladin:'STR',ranger:'DEX',rogue:'DEX',monk:'mbar',cleric:'WIS',druid:'WIS',bard:'CHA',wizard:'INT',sorcerer:'CHA',warlock:'CHA'};
const scoresOf=c=>{const o={};if(!PRIORITY[c]){SC.forEach(k=>o[k]=12);return o}PRIORITY[c].split(' ').forEach((k,i)=>o[k]=ARRAY[i]);return o};
const modOf=v=>Math.floor((v-10)/2);
function balanceOf(sc){const v=SC.map(k=>sc[k]),mu=v.reduce((a,b)=>a+b,0)/6,sg=Math.sqrt(v.reduce((a,b)=>a+(b-mu)**2,0)/6);return Math.max(0,1-sg/mu)}
const mbar=sc=>SC.reduce((a,k)=>a+modOf(sc[k]),0)/6;
function govMod(c,score){const sc=scoresOf(c);return score==='mbar'?mbar(sc):modOf(sc[score])}
/* the score layer on top of the class table: the level table is the fighter WITH its scores (STR 15, CON 14: x1.10), so each class
   is scaled by its own governing modifiers relative to the fighter's (balance.md 3, "Reconciled 22 Oct") */
function scoreFactor(c){const a=1+.05*govMod(c,ATK_SCORE[c]),h=1+.05*govMod(c,c==='monk'?'mbar':'CON');return{atk:a/1.10,hp:h/1.10,def:h/1.10}}
/* accuracy, steadiness, how often a class attacks unseen, initiative bonus, base threat (balance.md 4a and 3) */
const CX={fighter:{acc:.05,init:0,threat:1.00},barbarian:{acc:-.05,init:0,threat:.84},paladin:{acc:0,steady:5,init:0,threat:.87},
  ranger:{acc:.10,steady:5,unseen:.15,init:2,threat:.64},rogue:{acc:.05,unseen:.30,light:1,init:2,threat:.64},monk:{acc:.05,light:1,init:1,threat:.79},
  cleric:{acc:-.10,steady:5,init:0,threat:.81},druid:{acc:-.10,steady:4,init:0,threat:.70},bard:{acc:-.10,steady:5,init:0,threat:.66},
  wizard:{acc:0,steady:3,init:0,threat:.51},sorcerer:{acc:0,steady:4,init:0,threat:.55},warlock:{acc:0,steady:2.5,init:0,threat:.67}};
const tilt=(p,luck)=>{if(!luck)return p;const q=Math.pow(1.1,luck);return p*q/(p*q+1-p)};          // luck bends every yes/no roll
const tiltU=(u,luck)=>luck?Math.pow(u,1/Math.pow(1.1,luck)):u;                                     // and every range roll
const mapPen=(c,i)=>i===0?0:CX[c]&&CX[c].light?(i===1?.04:.08):(i===1?.05:.10);                   // the multiple-attack penalty
/* one attack's odds on one sampled situation. kind: melee | ranged | spell. Returns {p, crit, resisted (spells: p is the chance to land)} */
function odds(c,kind,sit,opt){opt=opt||{};const x=CX[c]||{acc:0},B=P.board,i=opt.i||0;
  const accScore=kind==='spell'?0:.025*(opt.modGrowth||0);   // the class accuracy table already includes the starting scores (reconciled like the level table): only modifier points gained above the start add
  let dodge=(opt.dodge!=null?opt.dodge:B.foeDodge)*(sit.unseen?.5:1);
  /* positional crit bonuses (flanked +15, unseen +10). critRule 'add': added to the chance (as written today). 'value' (proposed 22 Oct):
     a bonus to crit chance is a bonus to expected damage, paid in the build's own currency, so it is worth the same to every build:
     +15 at x1.5 (= +7.5% damage) becomes +15 x 0.5 / (D - beta) for a build with crit D and normal hits beta */
  const b_=opt.build||{beta:1,D:P.critMul},pos=(sit.flank?.15:0)+(sit.unseen?.10:0);
  let p,crit=P.crit+(opt.critAdd||0)+(P.critRule==='value'?pos*(P.critMul-1)/Math.max(P.critMul-1,b_.D-b_.beta):pos);
  if(kind==='melee')p=1+x.acc+accScore+(opt.hitAdj||0)-dodge-mapPen(c,i);
  else if(kind==='ranged')p=1+x.acc+accScore+(opt.hitAdj||0)-dodge-(sit.cover?B.halfCover:0)-(x.steady||5)/100*(sit.tiles-1)-mapPen(c,i);
  else{const r0=clamp(P.spellResist0+.01*(opt.res||0),.05,.40)*(sit.unseen?.5:1);p=1+(opt.hitAdj||0)-r0-(x.steady||4)/100*(sit.tiles-1)}
  /* luck tilts the crit chance too; under 'value' its gain is the gain it gives an ordinary kobold, paid in the build's currency */
  let critL=tilt(clamp(crit,0,1),opt.luck||0);
  if(P.critRule==='value'&&opt.luck){const g=tilt(P.crit,opt.luck)-P.crit;critL=clamp(crit+g*(P.critMul-1)/Math.max(P.critMul-1,b_.D-b_.beta),0,1)}
  return{p:tilt(clamp(p,0,1),opt.luck||0),crit:critL}}
/* the average board, enumerated (no dice): the expected damage factor of one attack, crit build {beta, D, c} optional */
function expectFactor(c,kind,opt){opt=opt||{};const B=P.board,x=CX[c]||{},un=x.unseen||0,cb=opt.build||{beta:1,D:P.critMul,c:0};let sum=0,w=0;
  const tiles=opt.near?[1]:kind==='ranged'?B.rangedTiles:kind==='spell'?B.spellTiles:[1];
  for(const t of tiles)for(const cov of (kind==='ranged'?[1,0]:[0]))for(const fl of (kind==='melee'?[1,0]:[0]))for(const u of [1,0]){
    const wt=(kind==='ranged'?(cov?B.coverShare:1-B.coverShare):1)*(kind==='melee'?(fl?B.flankShare:1-B.flankShare):1)*(u?un:1-un);if(!wt)continue;
    const o=odds(c,kind,{tiles:t,cover:cov,flank:fl,unseen:u},Object.assign({},opt,{critAdd:(opt.critAdd||0)+cb.c,build:cb}));
    const crit=o.crit,hit=(1-crit)*cb.beta+crit*cb.D;
    const land=kind==='spell'?o.p+(1-o.p)*.5:o.p;sum+=wt*land*hit;w+=wt}
  return sum/w}
/* initiative: I = 10 + DEX modifier + class bonus; each round I + d6, luck tilting the d6 */
const initOf=c=>c==='foe'?10:10+govMod(c,'DEX')+((CX[c]&&CX[c].init)||0);   // the timeline's rate is 90 + this (systems.md §1)
/* threat: the class's base (its effective HP relative to the fighter) x (1 + 0.1 CHA modifier) */
const threatOf=c=>((CX[c]&&CX[c].threat)||1)*(1+.1*govMod(c,'CHA'));
/* morale: pack mean + Leadership/5; each turn +1 AP (half an action on a base of 2) with chance |M|/(|M|+6), or -1 if negative */
const moraleP=M=>Math.abs(M)/(Math.abs(M)+6);
/* burn and poison: a share of max HP a turn for 3 turns, never more than that share of a standard foe at the target's level */
const DOT={burn:{share:1/16,weak:.25},poison:{share:1/8,weak:0}};

/* ---------------------------------------------------------------- classes: derived, not guessed
   Each class has a power budget split into damage d, durability h, utility u (d+h+u=1).
   Combat power = sqrt(DPR * EHP) (the geometric mean, the usual "combat power") times (1 + eta*u).
   Equal power for every class means  sqrt(x*y) = (1+eta*u_fighter)/(1+eta*u_class),
   and the archetype ratio is x/y = sqrt((d/h)/(d0/h0)).  Solve for x (relative damage per round) and y (relative
   effective HP). The stat multipliers then follow from x and y (see deriveClasses).              */
const KIT={ // main skill: mul per target, targets hit, mana, type; support skills where they matter
  fighter:{atk:{mul:1.8,mp:3},style:'melee'},
  barbarian:{atk:{mul:2.4,mp:4},style:'melee'},
  paladin:{atk:{mul:1.7,mp:4,spell:1},heal:{f:.6,mp:5,under:.4},style:'melee'},
  ranger:{atk:{mul:2.2,mp:4,hit:.20},style:'ranged'},
  rogue:{atk:{mul:1.62,mp:4},style:'melee'},
  monk:{atk:{mul:1.5,mp:3,rolls:3},alt:{mul:.8,mp:2,ki:1},style:'melee'},   // Flurry; Ki strike x0.8 x (0.5 + Balance) (skills.md)
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
/* expected damage per round of a class kit against one on-level foe, over R rounds, with mana M (greedy casting).
   Hit, resist, crit, flanking, cover, distance, unseen and luck all come from the one formula on the average board (expectFactor). */
const kindOf=(k,spell)=>spell?'spell':k.style==='ranged'?'ranged':'melee';
function dprOf(cls,L,atkMult,M,R,single,opt){opt=opt||{};const k=KIT[cls],r=ref(L),f=foe(L),atk=r.atk*atkMult,n=P.foesPerFight(L);
  const tgts=tg=>single?((tg||1)>1?P.bossOverlap:1):Math.min(tg||1,n);
  const one=(mul,spell,hitAdj,tg,i)=>expectFactor(cls,kindOf(k,spell),{hitAdj,i,luck:opt.luck||0,build:opt.build,near:spell&&k.style==='melee'})*hitDmg(atk,mul,f.def)*tgts(tg);
  const basicMul=k.weak?.6:1;                                              // healers/bards' weapon attacks are weak (items.md: holy, instruments x0.6)
  const basic=one(basicMul,k.style==='spell'&&!k.weak,0,1,0);
  if(!k.atk)return basic;                                                  // pure support: attacks with the weapon
  const sk=k.atk,skill=sk.rolls?Array.from({length:sk.rolls},(_,i)=>one(sk.mul/sk.rolls,sk.spell,sk.hit||0,1,i)).reduce((a,b)=>a+b,0):one(sk.mul,sk.spell,sk.hit||0,sk.area||1,0);
  const casts=Math.min(R,Math.floor(M/sk.mp));let alts=0,alt=0;
  if(k.alt){alt=one(k.alt.mul*(k.alt.ki?.5+balanceOf(scoresOf(cls)):1),k.alt.spell,0,1,0);alts=Math.min(R-casts,Math.floor((M-casts*sk.mp)/k.alt.mp))}
  return(casts*skill+alts*alt+(R-casts-alts)*basic)/R}
/* mana pool: enough for 'sustain' fights of greedy casting at ~1.2 casts a round; shrinks to the skill's cost early on */
function manaPool(cls,L){const k=KIT[cls];const c=k.atk?k.atk.mp:k.heal?k.heal.mp:3;const casts=1.2*P.roundsRef;
  const m30=P.manaK*casts*c, m1=Math.max(3*c,6);return Math.round(m1+(m30-m1)*(L-1)/29)}
function deriveClasses(L0){L0=L0||10;const [d0,h0,u0]=SPLIT.fighter,out={};
  const f0=ref(L0),fo=foe(L0);
  const BW=P.bossWeight;const blend=(c,a)=>(1-BW)*dprOf(c,L0,a,manaPool(c,L0),P.roundsRef,false)+BW*dprOf(c,L0,a,manaPool(c,L0),P.roundsRef,true);
  const dprF=blend('fighter',1);
  NAMES.forEach(c=>{const [d,h,u]=SPLIT[c];
    const g=(1+P.etaUtility*u0)/(1+P.etaUtility*u);                      // sqrt(x*y)
    const rho=Math.sqrt((d/h)/(d0/h0));                                  // x/y
    const x=g*Math.pow(rho,P.spread), y=g*Math.pow(rho,-P.spread);                        // relative DPR and relative EHP
    // attack multiplier: bisection so that dprOf(...)/dprF = x
    let lo=.1,hi=4;for(let i=0;i<60;i++){const mid=(lo+hi)/2;(blend(c,mid)/dprF<x)?lo=mid:hi=mid}
    const atkM=KIT[c].weak?1:(lo+hi)/2;                                  // J: supports keep a plain weapon; their budget is the heal/buff
    const hpM=Math.pow(y,.6);                                            // J: durability is mostly HP, the rest defence
    // y = hpM * (foeAtk - fighterDef/2) / (foeAtk - classDef/2)  =>  classDef
    const dmgF=fo.atk-f0.def/2, dmgC=dmgF*hpM/y, defM=clamp((fo.atk-dmgC)*2/f0.def,.2,1.6);
    out[c]={d,h,u,x,y,atk:atkM,hp:hpM,def:defM,spd:SPD[c]}});
  return out}
let CLS=null;const classes=()=>CLS||(CLS=deriveClasses(10));

/* ---------------------------------------------------------------- the fight simulator (abstract, one main action a round) */
function makePack(names,L){const C=classes(),r=ref(L);
  return names.map((c,i)=>{const k=KIT[c],m=C[c],sf=scoreFactor(c);return{cls:c,side:0,hp:r.hp*m.hp*sf.hp,max:r.hp*m.hp*sf.hp,def:r.def*m.def*sf.def,atk:r.atk*m.atk*sf.atk,
    spd:(5+.5*(L-1))*m.spd,mana:manaPool(c,L),k,misses:0,bank:0,L,luck:P.luck,init:initOf(c),threat:threatOf(c),
    dodge:Math.min(.30,P.koboldDodge(L)+.025*govMod(c,'DEX'))}})}
function makeFoes(Lf,rand,opt){opt=opt||{};const f=foe(Lf),n=opt.n!=null?opt.n:Math.floor(P.foesPerFight(Lf))+(rand()<P.foesPerFight(Lf)%1?1:0);
  const out=[];for(let i=0;i<n;i++)out.push({cls:'foe',side:1,hp:f.hp,max:f.hp,def:f.def,atk:f.atk,spd:5+.5*(Lf-1),weak:0,hex:0,dodge:P.board.foeDodge,init:10,std:f.hp});
  return out}
function fight(pack,foes,rand,policy,opt){opt=opt||{};const careless=policy==='careless';
  let potions=careless?0:(opt.potions!=null?opt.potions:0),rounds=0,falls=0,dealt=0,buff=0,boss=opt.boss||null;
  const all=()=>pack.concat(foes);
  const M=(opt.morale!=null?opt.morale:P.morale!=null?P.morale:P.bond(pack[0].L||1))+(opt.leadership!=null?opt.leadership:P.leadership)/5,pM=moraleP(M);
  const roll=(p)=>rand()<p;
  const hurt=(t,d)=>{if(t.hp<=0)return;if(t.side===0&&buff>0)d*=(1-P.buffGuard);t.hp-=d;if(t.hp<=0){t.hp=0;if(t.side===0)falls++}};
  const dmg=(atk,mul,def,luck)=>hitDmg(atk,mul,def)*(1+P.dmgSpread*(2*tiltU(rand(),luck||0)-1));
  const stats=opt.stats||{oneshot:0,minhp:1};
  const pickT=()=>{const live=pack.filter(x=>x.hp>0),w=live.map(x=>x.threat||1),tw=w.reduce((a,b)=>a+b,0);let rr=rand()*tw;for(let i=0;i<live.length;i++){rr-=w[i];if(rr<=0)return live[i]}return live[0]};
  const sample=(c,kind)=>{const B=P.board,x=CX[c]||{};return{tiles:kind==='ranged'?B.rangedTiles[(rand()*B.rangedTiles.length)|0]:kind==='spell'?B.spellTiles[(rand()*B.spellTiles.length)|0]:1,
    cover:kind==='ranged'&&roll(B.coverShare),flank:kind==='melee'&&roll(B.flankShare),unseen:roll(x.unseen||0)}};
  const foeTurn=u=>{                                                        // a foe attacks
    if(u.boss&&!u.phased&&u.hp<=u.max/2&&P.phaseBreak>0){u.phased=true;u.stagger=P.phaseBreak}
    if(u.stagger>0){u.stagger--;return}
    const live=pack.filter(x=>x.hp>0);let atk=u.atk*(u.weak>0?.75:1);
    u.turns=(u.turns||0)+1;
    if(u.boss&&!u.noBig&&u.turns%3===0){live.forEach(x=>{if(careless||rand()<.5){hurt(x,dmg(atk,.6,x.def))}});return}   // telegraphed: a competent pack steps out of half of it
    for(let a=0;a<(u.acts||1);a++){const tt=pickT();if(!tt)break;
      if(roll(tilt(1-tt.dodge,-(tt.luck||0)))){let d=dmg(atk,1,tt.def,-(tt.luck||0));if(roll(tilt(P.crit,-(tt.luck||0))))d*=P.critMul;if(d>=tt.max*.999&&tt.hp===tt.max)stats.oneshot++;hurt(tt,d)}}};
  const koboldAct=u=>{                                                      // one action of a pack kobold
    const live=pack.filter(x=>x.hp>0),k=u.k;
    if(!careless&&potions>0){const low=live.reduce((a,b)=>b.hp/b.max<a.hp/a.max?b:a);if(low.hp/low.max<.30&&!(k.heal&&u.mana>=k.heal.mp)){low.hp=Math.min(low.max,low.hp+P.potion*low.max);potions--;return}}
    if(k.heal){const thr=careless?.25:k.heal.under,low=live.reduce((a,b)=>b.hp/b.max<a.hp/a.max?b:a);
      if(low.hp/low.max<thr&&u.mana>=k.heal.mp){u.mana-=k.heal.mp;if(k.heal.all)live.forEach(x=>{x.hp=Math.min(x.max,x.hp+k.heal.f*.6*x.max)});else low.hp=Math.min(low.max,low.hp+k.heal.f*low.max);return}}
    if(k.buff&&buff===0&&u.mana>=k.buff.mp&&!careless){u.mana-=k.buff.mp;buff=3;if(!P.buffFree)return}
    const lf=foes.filter(x=>x.hp>0);if(!lf.length)return;
    let t=careless?lf[(rand()*lf.length)|0]:lf.reduce((a,b)=>b.hp<a.hp?b:a);
    if(k.hex&&!careless&&t.hex===0&&u.mana>=k.hex.mp){u.mana-=k.hex.mp;t.hex=3;return}
    let skill=k.atk&&u.mana>=k.atk.mp?k.atk:k.alt&&u.mana>=k.alt.mp?k.alt:null;
    let mul=skill?skill.mul*(skill.ki?.5+balanceOf(scoresOf(u.cls)):1):(k.weak?.6:1),spell=skill?!!skill.spell:(k.style==='spell'&&!k.weak);
    if(skill)u.mana-=skill.mp;
    const kind=kindOf(k,spell),build=u.build||{beta:1,D:P.critMul,c:0};
    const targets=skill&&skill.area?lf.slice().sort((a,b)=>a.hp-b.hp).slice(0,Math.min(lf.length,Math.round(skill.area))):[t];
    const rolls=skill&&skill.rolls?skill.rolls:1;
    for(const tg of targets){const reps=(skill&&skill.area&&tg.tiles>1)?tg.overlap:1;for(let rp=0;rp<reps;rp++)for(let i=0;i<rolls;i++){
      const sit=spell&&k.style==='melee'?{tiles:1,unseen:roll((CX[u.cls]||{}).unseen||0)}:sample(u.cls,kind);
      const o=odds(u.cls,kind,sit,{i,hitAdj:skill?(skill.hit||0):0,dodge:tg.dodge,luck:u.luck,critAdd:build.c,build});
      let p=o.p;if(!spell&&u.misses>=2&&!careless)p=clamp(p+P.mercy,0,1);
      const landed=roll(p);if(!spell&&!landed){u.misses++;continue}u.misses=0;
      let d=dmg(u.atk*(buff>0?P.buffMul:1),(rolls>1?mul/rolls:mul)*(tg.hex>0?1.25:1),tg.def,u.luck);
      if(spell&&!landed)d*=.5;                                              // resisted: half
      d*=roll(o.crit)?build.D:build.beta;
      dealt+=Math.min(d,tg.hp);hurt(tg,d);
      if(skill&&skill.dot&&tg.hp>0&&roll(skill.dot.chance||1)){const D_=DOT[skill.dot.kind];tg.dot={kind:skill.dot.kind,turns:3,amt:D_.share*Math.min(tg.max,tg.std||tg.max)*(spell&&!landed?.5:1)};if(D_.weak)tg.weak=Math.max(tg.weak,3)}}}};
  while(pack.some(u=>u.hp>0)&&foes.some(u=>u.hp>0)&&rounds<80){
    rounds++;
    if(boss&&rounds===4&&boss.adds){boss.adds.forEach(a=>foes.push(a))}
    /* the timeline (systems.md §1): each tick a unit's charge grows by its rate 90 + initiative; at 100 it acts and keeps the remainder */
    all().filter(u=>u.hp>0).forEach(u=>{u.ct=(u.ct||0)+90+(u.init||10)});
    const order=[];let more=true;while(more){more=false;const ready=all().filter(u=>u.hp>0&&(u.ct||0)>=100).sort((a,b)=>b.ct-a.ct||a.side-b.side);
      if(ready.length){more=true;ready.forEach(u=>{u.ct-=100;order.push(u)})}}
    if(buff>0)buff--;
    foes.forEach(f=>{if(f.weak>0)f.weak--;if(f.hex>0)f.hex--;if(f.dot&&f.dot.turns>0&&f.hp>0){const d=Math.min(f.dot.amt,f.hp);dealt+=d;hurt(f,f.dot.amt);if(--f.dot.turns===0)f.dot=null}});
    for(const u of order){
      if(u.hp<=0)continue;
      if(!pack.some(x=>x.hp>0)||!foes.some(x=>x.hp>0))break;
      if(u.side===1){foeTurn(u);continue}
      u.bank=Math.min(3,u.bank+2+(M>0&&roll(pM)?1:M<0&&roll(pM)?-1:0));     // morale: +1 or -1 AP; an action costs 2
      while(u.bank>=2&&u.hp>0&&foes.some(x=>x.hp>0)){u.bank-=2;koboldAct(u)}
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
module.exports={picksAt,foeScale,odds,expectFactor,scoresOf,scoreFactor,balanceOf,govMod,initOf,threatOf,moraleP,tilt,tiltU,CX,DOT,P,HF,hitDmg,atkFor,need,ref,foe,classes,KIT,SPLIT,NAMES,makePack,makeFoes,fight,runFights,rng,tierAt,manaPool,dprOf,bAtk,bDef,bHp,foeDef};

if(require.main===module&&(process.argv[2]==='levels'||process.argv[2]==='all')){
  console.log('THE LEVEL TABLE (the reference fighter with its expected picks, on-level standard foes; balance.md §3)');
  console.log('| L | gear tier | picks (scores, skills, passives) | HP | attack | defence | basic hit | foe HP (×g) | foe attack | foe defence |');console.log('|---|---|---|---|---|---|---|---|---|---|');
  [1,2,3,5,8,10,13,15,18,20,23,25,27,30].forEach(L=>{const r=ref(L),f=foe(L),k=picksAt(L);console.log(`| ${L} | T${tierAt(L)+1} | ${k.scores}, ${k.skills}, ${k.passives} | ${Math.round(r.hp)} | ${Math.round(r.atk)} | ${r.def.toFixed(1)} | ${Math.round(f.D)} | ${Math.round(f.hp)} | ${Math.round(f.atk)} | ${Math.round(f.def)} |`)})}
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
  const b={cls:'boss',side:1,boss:true,hp:k*D*f.g,max:k*D*f.g,def:f.def,noBig:!!opt.noBig,acts:opt.acts||P.packSize,tiles:P.bossTiles,overlap:P.bossOverlap,atk:atkFor(f.g*(opt.hit||.20)*r.hp,r.def),spd:5+.5*(L-1),weak:0,hex:0,dodge:.05,init:10,std:f.hp};
  const Lp=L+delta;const pack=makePack(names,Lp);
  return fight(pack,[b],rand,opt.policy||'competent',{potions:P.potionsPerFight})}
function bossRun(names,L,k,delta,N,opt){const rand=rng(11),s={win:0,rounds:0,falls:0,oneshot:0,close:0};
  for(let i=0;i<N;i++){const r=bossFight(names,L,k,rand,delta||0,opt);s.win+=r.win;s.rounds+=r.rounds;s.falls+=r.falls;s.oneshot+=r.oneshot;s.close+=(r.win&&r.endhp<.4)}
  Object.keys(s).forEach(x=>s[x]/=N);return s}
module.exports.bossRun=bossRun;
module.exports.bossRule=(L,R)=>({k:Math.round(R*(P.bossK[0]+P.bossK[1]*L)),hit:(P.bossT[0]+P.bossT[1]*L)/(P.packSize*R)});   // one boss attack per kobold slot
module.exports.resetClasses=()=>{CLS=null};
if(require.main===module&&(process.argv[2]==='bosses'||process.argv[2]==='all')){
  const pk=['fighter','cleric','wizard'];
  console.log('\nBOSS: rounds and win rate on level, pack fighter+cleric+wizard, 3 potions, boss hit = 20% of fighter HP');
  console.log('| level | k | rounds | win | falls |');
  [5,10,18,30].forEach(L=>[8,12,18,24,30,42].forEach(k=>{const s=bossRun(pk,L,k,0,2000);console.log(`| ${L} | ${k} | ${f2(s.rounds)} | ${pc(s.win)} | ${f2(s.falls)} |`)}));
  console.log('\nWin rate vs level gap (L=18, k=24):');
  [-4,-2,0,2,4].forEach(d=>{const s=bossRun(pk,18,24,d,3000);console.log(`gap ${d}: win ${pc(s.win)} rounds ${f2(s.rounds)}`)});
}

/* ---------------------------------------------------------------- rules: the 21-22 Oct rules checked by arithmetic (no dice; P17).
   Each line prints the model's number next to the one balance.md states.                                                      */
if(require.main===module&&(process.argv[2]==='rules'||process.argv[2]==='all')){
  const M=module.exports,pc1=x=>(x*100).toFixed(1)+'%';
  console.log('RULES CHECK (arithmetic on the average board, no simulation)\n');
  console.log('1. The level table: the fighter\'s basic hit on an on-level foe (balance.md: 9, 45, 146)');
  console.log('   '+[1,10,30].map(L=>`L${L} ${foe(L).D.toFixed(1)}`).join(', '));
  console.log('\n2. Average chance to hit, by class (one formula with class accuracy, starting scores included, MAP 0; spells: chance to land)');
  console.log('| class | kind | landed | expected damage factor (hit, resist, crit) |');
  let mel=[],rng_=[],spl=[];
  NAMES.forEach(c=>{const k=KIT[c];const kinds=k.style==='spell'&&!k.weak?['spell']:[kindOf(k,false)].concat(k.atk&&k.atk.spell?['spell']:[]);
    kinds.forEach(kind=>{const B=P.board,x=CX[c]||{},un=x.unseen||0;let s=0,w=0;const tiles=kind==='ranged'?B.rangedTiles:kind==='spell'&&k.style!=='melee'?B.spellTiles:[1];
      for(const t of tiles)for(const cov of (kind==='ranged'?[1,0]:[0]))for(const u of [1,0]){const wt=(kind==='ranged'?(cov?B.coverShare:1-B.coverShare):1)*(u?un:1-un);if(!wt)continue;s+=wt*odds(c,kind,{tiles:t,cover:cov,unseen:u},{}).p;w+=wt}
      const land=s/w;(kind==='melee'?mel:kind==='ranged'?rng_:spl).push(land);
      console.log(`| ${c} | ${kind} | ${pc1(land)} | ${expectFactor(c,kind,{near:kind==='spell'&&k.style==='melee'}).toFixed(3)} |`)})});
  const av=a=>a.reduce((x,y)=>x+y,0)/a.length,dmgSpell=av(spl.map(l=>l+(1-l)*.5));
  console.log(`   melee ${pc1(av(mel))} (4a: 90), ranged ${pc1(av(rng_))} (4a: about 66), spells' damage ${pc1(dmgSpell)} (4a: about 89)`);
  console.log(`   overall 40/40/20: ${pc1(.4*av(mel)+.4*av(rng_)+.2*dmgSpell)} (4a: 80; target 80-85)`);
  console.log('\n3. Ability scores: each class against the fighter (attack, HP and defence factors; Balance; initiative; threat)');
  console.log('| class | scores | attack x | HP and defence x | Balance | initiative | threat |');
  NAMES.forEach(c=>{const sc=scoresOf(c),f=scoreFactor(c);console.log(`| ${c} | ${SC.map(k=>sc[k]).join(' ')} | ${f.atk.toFixed(3)} | ${f.hp.toFixed(3)} | ${pc(balanceOf(sc))} | ${initOf(c)} | ${threatOf(c).toFixed(2)} |`)});
  console.log('   Balance check (balance.md: 12x6 100%, standard array 80%, 20 20 10 8 8 6 52%): '+[[12,12,12,12,12,12],[15,14,13,12,10,8],[20,20,10,8,8,6],[13,13,12,12,11,11]].map(v=>pc(balanceOf(Object.fromEntries(SC.map((k,i)=>[k,v[i]]))))).join(', '));
  const ki=.5+balanceOf(scoresOf('monk'));console.log(`   Monk Ki strike: x0.8 x ${ki.toFixed(2)} = x${(.8*ki).toFixed(2)} (skills.md prices it as 1.20)`);
  console.log('\n4. Luck, one point (balance.md: own output +2.7%, damage taken -2%, an 82% hit 83.4%, a crit 8.7%)');
  const base=expectFactor('fighter','melee',{}),l1=expectFactor('fighter','melee',{luck:1});
  console.log(`   hit 82% -> ${pc1(tilt(.82,1))}, crit 8% -> ${pc1(tilt(.08,1))}, damage roll ${pc1(((1+P.dmgSpread*(2*(1/(1/1.1+1))-1)))-1)} on average, fighter hit-and-crit factor ${pc1(l1/base-1)}; foes' 80% -> ${pc1(tilt(.8,-1))}`);
  console.log('\n5. Morale: extra actions a turn (balance.md: +7% at 1, +12.5% at 2, +17% at 3, +25% at 6, +33% at 12)');
  console.log('   '+[1,2,3,6,12].map(m=>`${m}: +${(moraleP(m)/2*100).toFixed(1)}%`).join(', '));
  console.log('   the curve expects the bond (P24): foes x g(L) = '+[1,5,10,15,20,25,30].map(L=>`L${L} x${foeScale(L).toFixed(2)}`).join(', '));
  console.log('\n6. The timeline (charge time): turns in 100 ticks at rate 90 + initiative (balance.md: +1 initiative = +1% of turns)');
  console.log('   '+[10,11,12,14].map(I=>{let ct=0,n=0;for(let t=0;t<100;t++){ct+=90+I;while(ct>=100){ct-=100;n++}}return`I ${I}: ${n} turns`}).join(', '));
  console.log('\n7. Crit builds on the board, against a plain fighter on the same board (balance.md 4a table)');
  console.log('| crit chance, normal hit, crit | table (no position) | on the board, bonuses added (the old rule) | on the board, bonuses by value (decided 22 Oct) |\n|---|---|---|---|');
  const was=P.critRule;[[.08,1,1.5],[.08,.5,9.2],[.03,.1,42],[.01,.25,116]].forEach(([c,b,D])=>{const bl=()=>expectFactor('fighter','melee',{build:{beta:1,D:1.5,c:0}});
    P.critRule='add';const ea=expectFactor('fighter','melee',{build:{beta:b,D,c:c-P.crit}})/bl();P.critRule='value';const ev=expectFactor('fighter','melee',{build:{beta:b,D,c:c-P.crit}})/bl();
    console.log(`| ${pc(c)}, x${b}, x${D} | x${((1-c)*b+c*D).toFixed(2)} | x${ea.toFixed(2)} | x${ev.toFixed(2)} |`)});P.critRule=was;
  console.log('\n8. Burn and poison on a standard foe (balance.md: burn 0.75 basic hits over 3 turns, poison 1.5)');
  console.log(`   burn ${(DOT.burn.share*P.foeHpMult*3).toFixed(2)}, poison ${(DOT.poison.share*P.foeHpMult*3).toFixed(2)} basic hits`);
}
