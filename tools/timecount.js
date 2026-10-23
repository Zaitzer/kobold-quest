#!/usr/bin/env node
'use strict';
/* Kobold Quest: the slice's time and taps, COUNTED from the design and set as goals (P7, P8; Joakim 22 Oct: "design is not
   measurement: count, set goals"). Nothing here is measured. The script (docs/slice-dialogue.md), the maps (world/)
   and the fight budget (balance.md §5) give the counts; the unit goals below give the seconds and taps; the product is the goal the
   build must meet. Playtests check the build against these goals; they do not supply them.
   Usage: node tools/timecount.js            (prints the tables for balance.md §2 and ui-design.md §4)                         */
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const M=require('./balance-model.js');

/* ---------------------------------------------------------------- the unit goals (each one a design goal, not a measurement) */
const G={
  box:3.0,          // s to read and tap one dialogue box (a box is at most 90 characters: about 30 a second, the speed of a short sign)
  beat:2.0,         // s for one stage direction that plays as a short animation (a door, a shadow, a crack)
  step:1.4/4.6,     // s per tile walked: 4.6 tiles a second (B, the engine) times 1.4 for turns and stops (balance.md §5)
  tilesPerTap:12,   // tiles walked per tap: tap-to-walk to a point on screen (the screen is about 15 tiles wide)
  kobTurn:4.5,      // s for one kobold's turn: look, tap a tile, tap a foe, watch it (2.5 taps)
  kobTaps:2.5,      // taps in one kobold turn (ui-design.md §3: move 1, attack 1, sometimes a skill pick)
  foeTurn:1.2,      // s for one foe's turn, played without input
  fightIO:10,       // s to enter and leave a fight (the swirl, the reward card)
  bossIO:30,        // s for a boss's intro line, the reward and the piece of loot
  rounds:3.5,       // rounds in a normal fight (balance.md §4)
  puzzle:90,        // s for one small puzzle (the rail switch on mine floor 1)
  shop:60, inn:30, pick:20, equip:30,  // s for a shop visit, an inn stop, a talent pick, equipping a found piece
  shopTaps:6, innTaps:2, pickTaps:2, equipTaps:3,
  chest:4, chestTaps:1, sign:3,        // s and taps to open a chest; a sign is one box
};

/* ---------------------------------------------------------------- counts from the script: boxes and beats per part */
const src=fs.readFileSync(path.join(ROOT,'docs','slice-dialogue.md'),'utf8');
function scriptCount(filter){let part=null,sub=null,boxes=0,beats=0;
  for(const line of src.split('\n')){const h=line.match(/^## (\d+)\./);if(h){part=h[1];sub=null;continue}const h3=line.match(/^### (\d+\.\d+) /);if(h3){sub=h3[1];continue}
    if(!part||part==='0'||part==='4'||part==='5'||part==='7'||part==='8'||!filter(part,sub))continue;
    if(/^\*\*[^*]+:\*\*/.test(line))boxes++;else if(/^\*[^*(].*\*$/.test(line.trim()))beats++}
  return{boxes,beats}}
const peb=(p,s)=>p==='2'||p==='3'||['6.3','6.4','6.5'].includes(s);
const hea=(p,s)=>p==='1'||['6.1','6.2'].includes(s);
/* optional content inside the script: §2.1 the goat, §3.14 side quests and bounties (counted apart from the main path) */
const pebOpt=(p,s)=>s==='2.1'||s==='3.14';

/* ---------------------------------------------------------------- counts from the maps: walking by BFS between marks */
const WORLD=require('./world/world.js'),WD=WORLD.load(ROOT),data={maps:{}};for(const P of Object.values(WD.places))if(P.kind==='map')data.maps[P.id]=P;
const SOLID=new Set('#KBTt~FborOWXxPc|'.split(''));
function dist(mapKey,a,b){const m=data.maps[mapKey],W=m.w,H=m.h,R=m.rows,key=(x,y)=>y*W+x,D=new Map([[key(...a),0]]),q=[a];
  const ok=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(!SOLID.has(R[y][x])||(x===b[0]&&y===b[1]));
  while(q.length){const [x,y]=q.shift(),d=D.get(key(x,y));if(x===b[0]&&y===b[1])return d;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!ok(nx,ny)||D.has(key(nx,ny)))continue;
      if(R[ny][nx]==='D'&&!(nx===b[0]&&ny===b[1])){D.set(key(nx,ny),d+1);continue}D.set(key(nx,ny),d+1);q.push([nx,ny])}}
  // a solid mark: stand next to it
  let best=Infinity;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=D.get(key(b[0]+dx,b[1]+dy));if(v!=null)best=Math.min(best,v+1)}return best}
const P={gate:[31,12],circle:[18,16],mill:[10,9],mine:[20,1],marl:[27,5],inn:[26,11],shop:[26,17],fountain:[23,14],tansy:[6,14],brothers:[10,17],farms:[6,20]};
const T=(a,b)=>dist('pebblebrook',P[a],P[b]);
const floor=k=>{const m=data.maps[k];const st={mine1:[[2,18],[29,2]],mine2:[[29,2],[4,18]],mine3:[[4,1],[24,15]]}[k];return dist(k,st[0],st[1])};
const mineDown=floor('mine1')+floor('mine2')+floor('mine3');
/* the main path's walk through Pebblebrook, leg by leg (town-kit.md §3, slice-dialogue.md §3), plus R1 and the mine */
const LEGS=[
  ['R1, the capital gate to Pebblebrook',120],
  ['town: the gate to the circle, the circle to the mill (Ruddle)',T('gate','circle')+T('circle','mill')],
  ['town: the mill to the mill road (Grubb) and back to the mill (Glitterbeak)',2*T('mill','gate')],
  ['town: the mill to the mine and the mine to the stairs (Ore, Nugget, floor 1), and back',T('mill','mine')+2*floor('mine1')],
  ['R1 to the pond and back (Tansy\'s lunch), from the gate',2*70],
  ['town: the square to the brothers, to the loft, back to the brothers',T('gate','brothers')+2*T('brothers','mill')],
  ['town: Old Marl\'s house to the mill and back',2*T('marl','mill')],
  ['town: to the circle at dusk',T('marl','circle')],
  ['the mine, all three floors down and back up (Snipe)',T('circle','mine')+2*mineDown],
  ['town: the mine to the toll box (with Nugget and Marl), to the circle, to the mill',T('mine','gate')+T('gate','circle')+T('circle','mill')],
  ['town: the inn, the shop and the fountain, twice',2*(T('mill','inn')+T('inn','shop')+T('shop','fountain'))],
  ['R1, back to Hearthspire (the stretch ends at home)',120]];
const walkSteps=LEGS.reduce((a,l)=>a+l[1],0);

/* ---------------------------------------------------------------- counts from the fight budget (balance.md §5, stretch 2) */
const fightsMain=19.3, foesPer=M.P.foesPerFight(5), bosses=[['Grubb',7],['Snipe',7]];
const fightSec=G.rounds*(4*G.kobTurn+foesPer*G.foeTurn)+G.fightIO;
const bossSec=R=>R*(4*G.kobTurn+4*G.foeTurn)+G.bossIO;
const levelsGained=5, gearPieces=10, shopVisits=4, innStops=4, chestsMain=3;

/* ---------------------------------------------------------------- the main path's minutes */
const sMain=(()=>{const a=scriptCount(peb),o=scriptCount(pebOpt);return{boxes:a.boxes-o.boxes,beats:a.beats-o.beats,opt:o}})();
const rows=[
  ['dialogue boxes (the script, main path)',sMain.boxes,G.box],
  ['story beats played as animation',sMain.beats,G.beat],
  ['normal fights',fightsMain,fightSec],
  ['boss fights (Grubb R 7, Snipe R 7)',2,(bossSec(7)+bossSec(7))/2],
  ['walking (steps, by the maps)',walkSteps,G.step],
  ['the rail puzzle',1,G.puzzle],
  ['talent picks',levelsGained,G.pick],
  ['equipping found or bought pieces',gearPieces,G.equip],
  ['shop visits',shopVisits,G.shop],
  ['inn stops (rest, roster, chats start)',innStops,G.inn],
  ['chests on the main path',chestsMain,G.chest]];
let total=0;const out=[];
out.push('| what | count | seconds each (goal) | minutes |','|---|---|---|---|');
for(const [w,n,s] of rows){const min=n*s/60;total+=min;out.push(`| ${w} | ${+n.toFixed(1)} | ${s.toFixed(1)} | ${min.toFixed(1)} |`)}
out.push(`| **counted main path** | | | **${total.toFixed(0)}** |`);
const budget=total;   // Joakim, 22 Oct: the length is what the content gives; no free-time padding

/* ---------------------------------------------------------------- taps an hour (P8), counted from the same main path */
const hours=total/60;   // taps an hour over the counted stretch (the length is what the content gives)
const kobTurns=fightsMain*G.rounds*4+14*4;
const taps=[
  ['advance dialogue',sMain.boxes],
  ['battle: move and attack (kobold turns × 2.5)',kobTurns*G.kobTaps*0.85],
  ['battle: skills (one turn in six picks a skill: one extra tap)',kobTurns/6],
  ['walk (one tap per 12 tiles)',walkSteps/G.tilesPerTap],
  ['interact (NPCs, doors, chests, signs)',58],
  ['equip, talents, pack',gearPieces*G.equipTaps+levelsGained*G.pickTaps],
  ['shop',shopVisits*G.shopTaps],
  ['inn',innStops*G.innTaps],
  ['potions in battle (one a 3 fights, 3 taps)',fightsMain/3*3],
  ['quest log, world map (about one look per scene change)',10]];
const tout=['| thing | taps in the stretch | **goal: taps an hour** |','|---|---|---|'];
taps.sort((a,b)=>b[1]-a[1]).forEach(([w,n])=>tout.push(`| ${w} | ${Math.round(n)} | **${Math.round(n/hours)}** |`));
const tt=taps.reduce((a,t)=>a+t[1],0);tout.push(`| **all** | ${Math.round(tt)} | **${Math.round(tt/hours)}** (one tap every ${(3600/(tt/hours)).toFixed(1)} s) |`);

const legs=['| leg | steps |','|---|---|'].concat(LEGS.map(l=>`| ${l[0]} | ${l[1]} |`),[`| **all** | **${walkSteps}** (${(walkSteps*G.step/60).toFixed(1)} minutes) |`]);
const opt=`Optional content in the script (the goat, the side quests, the bounties): ${sMain.opt.boxes} boxes and ${sMain.opt.beats} beats, about ${((sMain.opt.boxes*G.box+sMain.opt.beats*G.beat)/60).toFixed(1)} minutes of talk on top of their fights.`;
console.log('PEBBLEBROOK STRETCH, MAIN PATH, BY COUNT\n\n'+out.join('\n')+'\n\nWALKING, LEG BY LEG (BFS on the maps)\n\n'+legs.join('\n')+'\n\n'+opt+'\n\nTAPS\n\n'+tout.join('\n'));
console.log(`\nfight: ${fightSec.toFixed(0)} s; boss (R 7): ${bossSec(7).toFixed(0)} s; boss (R 12): ${bossSec(12).toFixed(0)} s`);

/* ---------------------------------------------------------------- act 1 (Hearthspire), by count */
const H={bakery:[8,21],hatch:[11,19],bench:[16,18],yard:[20,10],hall:[20,6],nest:[19,9],inn:[30,21],gate:[0,16],fountain:[19,15]};
const TH=(a,b)=>dist('hearthspire',H[a],H[b]);const ROOM=15;   // steps inside a room (the cellar, the hall and tower stairs)
const LEGS1=[['the bakery, the cellar and back',2*ROOM],['the bakery to Bib\'s bench, to the castle yard (the drill)',TH('bakery','bench')+TH('bench','yard')],
  ['the yard to the hall, the tower stairs and back, home to the bakery',2*ROOM+TH('yard','hall')+TH('hall','bakery')],
  ['hatching day: the bakery to the nest, back to the bakery',2*TH('bakery','nest')],['the bakery to the inn (the first chats), to the gate',TH('bakery','inn')+TH('inn','gate')]];
const walk1=LEGS1.reduce((a,l)=>a+l[1],0);
const fightK=(k,foes)=>G.rounds*(k*G.kobTurn+foes*G.foeTurn)+G.fightIO;
const a1=scriptCount(hea);
const act1=[['dialogue boxes',a1.boxes,G.box],['story beats',a1.beats,G.beat],
  ['set-piece fights: cellar ×2 and the drill ×2 (Pip alone, 3 and 2 foes)',4,(fightK(1,3)+fightK(1,3)+fightK(1,2)+fightK(1,2))/4],
  ['set-piece fight: outside the gate (four kobolds, 3 scouts)',1,fightK(4,3)],['the class pick',1,60],['talent picks',2,G.pick],
  ['equipping (the first chest, the starter kit)',3,G.equip],['the first shop visit',1,G.shop],['the first inn stop',1,G.inn],['walking',walk1,G.step]];
let t1=0;const o1=['| what | count | seconds each (goal) | minutes |','|---|---|---|---|'];
for(const [w,n,sec] of act1){const m=n*sec/60;t1+=m;o1.push(`| ${w} | ${+n.toFixed(1)} | ${sec.toFixed(1)} | ${m.toFixed(1)} |`)}
o1.push(`| **act 1, by count** | | | **${t1.toFixed(0)}** |`);
console.log('\nACT 1 (HEARTHSPIRE), BY COUNT\n\n'+o1.join('\n'));

/* ---------------------------------------------------------------- the whole game, projected from the design's own lists
   Stretches 1 and 2 are counted from their script and maps. The others have no script yet: they are projected from what the design
   lists for them (the fight budget's planned fights and bosses, balance.md §5 and §4) plus the town kit's non-fight content counted in
   Pebblebrook (every full town fills the same kit). Stretches 5 and 8 have no keeper, shop round or area: half the kit's non-fight
   content (their scenes are longer, their menus shorter). Replace each row with a count when its script is written. */
const fpf=L=>M.P.foesPerFight(L);const fs_=L=>G.rounds*(4*G.kobTurn+fpf(L)*G.foeTurn)+G.fightIO;
const nonFight2=total-(fightsMain*fightSec+bosses.reduce((a,b)=>a+bossSec(b[1]),0))/60;
const ST=[['1 Hearthspire, act 1','1→3',null,null,null,'counted'],['2 R1 and Pebblebrook','3→8',null,null,null,'counted'],
  ['3 R2 and Sunhaven','8→13',26.7,10,[8],1],['4 R3 and Emberreach','13→18',28.4,15,[8,10],1],['5 R4, home, the Ordeal','18→19',5.4,18,[8],.5],
  ['6 R5 and Frostwick','19→23',24.7,21,[8],1],['7 R6, R7 and Saltspray','23→27',28.3,25,[8],1],['8 The march and the finale','27→30',14.8,28,[10,11,12],.5]];
let gt=0,cum=0;const og=['| stretch | levels | minutes | minutes a level | cumulative (h) | how |','|---|---|---|---|---|---|'];
for(const [n,lv,f,L,bs,k] of ST){let m;if(k==='counted')m=n.startsWith('1')?t1:total;else m=(f*fs_(L)+bs.reduce((a,R)=>a+bossSec(R),0))/60+k*nonFight2;
  const [a,b]=lv.split('→').map(Number);gt+=m;cum+=m;og.push(`| ${n} | ${lv} | ${m.toFixed(0)} | ${(m/(b-a)).toFixed(0)} | ${(cum/60).toFixed(1)} | ${k==='counted'?'counted (script, maps)':'projected (fight budget + '+(k===1?'the kit':'half the kit')+')'} |`)}
og.push(`| **main story** | 1→30 | **${gt.toFixed(0)}** | **${(gt/29).toFixed(0)}** | **${(gt/60).toFixed(1)}** | |`);
console.log('\nTHE WHOLE GAME (main path)\n\n'+og.join('\n'));
/* ---------------------------------------------------------------- optional content in Pebblebrook's stretch, by count */
const optRows=[['side-quest and route-extra talk (script §2.1, §3.14)',sMain.opt.boxes*G.box+sMain.opt.beats*G.beat],
  ['bounty hunts: 2, one fight each (the named foe and its escort)',2*fightSec],['the hidden trial: Old Shellback (elite × 1.5 HP, one fight)',G.rounds*1.5*(4*G.kobTurn+1*G.foeTurn)+G.bossIO],
  ['the goat walked home (R1 to the farms, by the maps)',(60+T('gate','farms'))*G.step],['the ghost of the mill (the mill, a chick)',2*T('fountain','mill')*G.step],
  ['the seed swap (moss tufts drop in fights already fought; one visit)',T('fountain','farms')*2*G.step],['five chests (about 20 steps off the path each)',5*(G.chest+20*G.step)]];
const optT=optRows.reduce((a,r)=>a+r[1],0)/60;
const oo=['| what | minutes |','|---|---|'].concat(optRows.map(r=>`| ${r[0]} | ${(r[1]/60).toFixed(1)} |`),[`| **optional, by count** | **${optT.toFixed(0)}** |`]);
console.log('\nOPTIONAL CONTENT, PEBBLEBROOK, BY COUNT\n\n'+oo.join('\n'));
const cat={fights:fightsMain*fightSec/60,bosses:2*bossSec(7)/60,talk:(sMain.boxes*G.box+sMain.beats*G.beat)/60,walking:walkSteps*G.step/60};cat.menus=total-cat.fights-cat.bosses-cat.talk-cat.walking;
console.log('\nSHARES (stretch 2): '+Object.entries(cat).map(([k,v])=>`${k} ${v.toFixed(1)} min (${Math.round(v/total*100)}%)`).join(', '));
module.exports={G,fightSec,bossSec,walkSteps,total,t1,gt,optT};
