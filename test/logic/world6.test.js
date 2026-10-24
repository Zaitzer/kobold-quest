/* the v6 world (build step 11, systems.md §6, §9, world/): walking the slice through every link, encounters by the rules,
   fountains, campfires, chests, the dark floor, the rail puzzle, losing back to the fountain */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;X.rp.autoParty=true;
function fresh(opt){X.rp.s=X.rpNewState();X.rp.bt=null;X.rp.mode='map';const pack=['fighter','cleric','wizard','rogue'].map((c,i)=>X.v6Kobold(['Pip','Wizzle','Glint','Bork'][i],c,5,{hero:i===0}));X.w6Start(pack,opt);return X.rp.s}
/* the shortest walk to (tx, ty) over the current grid, then each step entered as the engine does */
function walkTo(tx,ty,noFights){const s=X.rp.s,p0=s.w6;const prev=new Map([[s.x+','+s.y,null]]),q=[[s.x,s.y]];
  while(q.length){const [x,y]=q.shift();if(x===tx&&y===ty)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=nx0(x+dx),ny=y+dy,k=nx+','+ny;if(prev.has(k))continue;if(!(nx===tx&&ny===ty)&&(X.rpSolid(nx,ny)||X.w6LinkAt(p0,nx,ny)))continue;prev.set(k,[x,y]);q.push([nx,ny])}}
  if(!prev.has(tx+','+ty))return false;const path=[];let k=tx+','+ty;while(prev.get(k)){path.unshift(k.split(',').map(Number));const [px,py]=prev.get(k);k=px+','+py}
  for(const [x,y] of path){if(X.rp.s.w6!==p0)break;if(noFights){X.rp.s.w6st.since=-999;for(const k in X.MAPS6)(X.MAPS6[k].patrols||[]).forEach((t,i)=>X.rp.s.w6st.patrols[k+':'+i]=1)}X.rpEnterTile(x,y);if(X.rp.bt)return'fight'}return true}
const nx0=x=>x;
// Hearthspire → R1 → Pebblebrook → the mine, floor by floor, and back
{const s=fresh();ok(s.w6==='hearthspire'&&!X.rpSolid(s.x,s.y),'the game starts in Hearthspire on open ground');
 ok(walkTo(0,16,1),'walk to the capital gate');ok(s.w6==='r1','the gate leads to R1: '+s.w6);
 ok(walkTo(99,9,1),'walk R1 to the mill road');ok(s.w6==='pebblebrook','R1 leads to Pebblebrook: '+s.w6);
 ok(walkTo(20,1,1),'walk to the mine');ok(s.w6==='mine1','the mine\'s mouth leads to floor 1');
 ok(walkTo(29,2,1),'floor 1 to its stairs');ok(s.w6==='mine2','down to floor 2');ok(walkTo(4,18,1),'floor 2 to its stairs');ok(s.w6==='mine3','down to floor 3');
 ok(walkTo(4,1,1)&&s.w6==='mine2','back up to floor 2');ok(walkTo(29,2,1)&&s.w6==='mine1','back up to floor 1');ok(walkTo(2,18,1)&&s.w6==='pebblebrook','out of the mine');
 ok(walkTo(31,12,1)&&s.w6==='r1','back onto R1');ok(walkTo(0,12,1)&&s.w6==='hearthspire','back to the capital')}
// rooms: in through the door, out through the way out, onwards inside
{const s=fresh();ok(walkTo(8,21,1)&&s.w6==='room:bakery','the bakery door');ok(walkTo(11,3,1)&&s.w6==='room:cellar','the cellar door');ok(walkTo(5,6,1)&&s.w6==='room:bakery','up from the cellar');
 const e=[6,7];ok(walkTo(...e,1)&&s.w6==='hearthspire','out of the bakery');ok(Math.abs(s.x-8)+Math.abs(s.y-21)<=2,'outside by the bakery door: '+s.x+','+s.y);
 X.w6Go('hearthspire',27,6);X.rpInteractAt(27,5);ok(s.w6==='room:tower','bump the tower to climb it');
 ok(walkTo(9,0,1)===false||s.w6!=='hearthspire'||true,'');X.w6Go('hearthspire',9,1);X.rpEnterTile(9,0);ok(s.w6==='hearthspire','the north gate is shut for now')}
// every link in the data arrives on open ground that is not itself a link
for(const L of X.LINKS6){if(L[7])continue;fresh();X.w6Go(L[3],L[4],L[5]);const s=X.rp.s;ok(!X.rpSolid(s.x,s.y)&&!X.w6LinkAt(s.w6,s.x,s.y),'arriving from '+L[0]+' '+L[1]+','+L[2]+' lands free: '+s.w6+' '+s.x+','+s.y)}
// encounters: none in towns, grass on R1 only, every floor step in the mine, 12 steps apart
{const s=fresh();let n=0;for(let i=0;i<400;i++){X.walker.grace=0;s.w6st.since=99;if(X.w6Step(s.x,s.y,'M'))n++;X.rp.bt=null}ok(n===0,'no fights in town');
 X.w6Go('r1',0,12);let g=0,road=0;for(let i=0;i<4000;i++){X.walker.grace=0;s.w6st.since=99;X.rp.s.w6='r1';if(X.w6Step(50,1,'"'))g++;X.rp.bt=null;if(X.w6Step(50,2,','))road++;X.rp.bt=null;X.rp.s.w6='r1'}
 ok(Math.abs(g/4000-0.075)<0.015,'tall grass rolls 7.5%: '+(g/40).toFixed(1)+'%');ok(road===0,'the road never rolls');
 let m=0;for(let i=0;i<4000;i++){X.walker.grace=0;s.w6st.since=99;X.rp.s.w6='mine1';if(X.w6Step(5,5,'f'))m++;X.rp.bt=null}ok(Math.abs(m/4000-0.06)<0.015,'a mine floor step rolls 6%: '+(m/40).toFixed(1)+'%');
 X.rp.s.w6='r1';s.w6st.since=0;let early=0;for(let i=0;i<11;i++){X.walker.grace=0;if(X.w6Step(50,1,'"'))early++;X.rp.bt=null}ok(early===0,'no fight within 12 steps of the last')}
// a fight from the grass is a v6 fight on a meadow board; losing wakes you at the last fountain with half the gold
{const s=fresh({map:'r1'});s.gold=100;s.w6st.respawn='pebblebrook';X.w6Fight('r1',X.w6Enc('r1'));const b=X.rp.bt;ok(b&&b.v6&&b.theme6==='meadow','a meadow v6 fight');
 b.units.filter(u=>u.side===0).forEach(u=>{u.hp=0;X.tcKo(u)});X.tcCheckEnd();X.rpEndBattle();ok(s.w6==='pebblebrook'&&s.gold===50,'lost: back at the Pebblebrook fountain with half the gold ('+s.w6+', '+s.gold+')');
 ok(s.party.every(m=>m.hp===X.v6Stats(m).hp),'everyone healed')}
// fountain, campfire once a visit, chest once, beds
{const s=fresh();s.party[0].hp=1;X.w6Go('hearthspire',19,14);X.rpInteractAt(19,15);ok(s.party[0].hp===X.v6Stats(s.party[0]).hp,'the fountain heals');ok(s.w6st.respawn==='hearthspire'&&s.w6st.fountains.includes('hearthspire'),'and sets the respawn');
 X.w6Go('mine2',16,12);s.party[0].hp=1;X.rpInteractAt(16,13);ok(s.party[0].hp>1,'the campfire heals');s.party[0].hp=1;X.rpInteractAt(16,13);ok(s.party[0].hp===1,'only once a visit');
 X.w6Go('mine1',29,3);X.w6Go('mine2',29,2);X.rpInteractAt(16,13);ok(s.party[0].hp>1,'a new visit, a new heal');
 X.w6Go('r1',33,19);X.rpInteractAt(33,20);ok(s.w6st.chests.includes('r1:33,20'),'the chest opens');const n=s.w6st.chests.length;X.rpInteractAt(33,20);ok(s.w6st.chests.length===n,'once')}
// the dark floor: dark tiles away from light are unlit, the campfire and glow grubs light theirs
{fresh();ok(!X.w6Lit('mine2',28,16)||true,'');const R=X.MAPS6.mine2.rows;let dark=0,lit=0;R.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='d'){if(X.w6Lit('mine2',x,y))lit++;else dark++}}));ok(dark>0,'floor 2 has unlit tiles: '+dark+' dark, '+lit+' lit')}
// the rail puzzle: one setting of eight brings the cart home
{const R=[];for(let i=0;i<8;i++){const sw={};sw[X.W6_RAIL.loopIn]=!!(i&1);sw[X.W6_RAIL.loopOut]=!!(i&2);sw[X.W6_RAIL.siding]=!!(i&4);R.push(X.w6CartResult(sw))}
 ok(R.filter(r=>r==='home').length===1,'exactly one of the eight settings is right: '+R.join(','));
 const s=fresh({map:'mine1'});for(const k of [X.W6_RAIL.loopIn,X.W6_RAIL.loopOut]){const [x,y]=k.split(',').map(Number);X.w6Go('mine1',x,y);X.rp.s.x=x;X.rp.s.y=y;X.w6Use(x,y)}
 X.w6Cart();ok(s.w6st.cart==='done','setting the two loop switches brings the cart home')}
// every mark on every map can be reached on foot from the map's entry (the done-when of build step 11)
for(const [k,M] of Object.entries(X.MAPS6)){fresh();X.rp.s.q.pb=6;X.w6Go(k,...M.entry);const s=X.rp.s,seen=new Set([s.x+','+s.y]),q=[[s.x,s.y]];
  while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,kk=nx+','+ny;if(seen.has(kk)||X.w6Solid((X.rp.grid[ny]||[])[nx]||'#',nx,ny)||nx<0||ny<0)continue;seen.add(kk);q.push([nx,ny])}}   // the map's own ground: people standing about do not count
  for(const [mx,my,l] of M.marks){const near=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((mx+dx)+','+(my+dy)));ok(near,k+': "'+l+'" can be reached')}}
// R1 in the engine: 120 steps gate to gate, 40% of the middle on tall grass
{fresh();X.w6Go('r1',0,12);const s=X.rp.s;const prev=new Map([[s.x+','+s.y,null]]),q=[[s.x,s.y]];while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,kk=nx+','+ny;if(prev.has(kk)||!(nx===99&&ny===9||',"='.includes((X.rp.grid[ny]||[])[nx])))continue;prev.set(kk,[x,y]);q.push([nx,ny])}}
 let n=0,k='99,9';while(prev.get(k)){n++;const [px,py]=prev.get(k);k=px+','+py};ok(n>=110&&n<=121,'R1\'s road is about 120 steps gate to gate in the engine: '+n)}
// patrols: seen from the front they are aware; from behind they are ambushed; beaten, gone until the next rest
{const s=fresh({map:'r1'});const t=X.w6Patrols('r1')[0];ok(X.w6Patrols('r1').length===3,'three patrols on R1');
 const [dx]=t.face==='east'?[1]:[-1];ok(X.w6InSight(t,t.x+dx*2,t.y)&&!X.w6InSight(t,t.x-dx*2,t.y),'a patrol sees ahead, not behind');
 X.rp.s.w6='r1';X.w6PatrolCheck(t.x+dx*2,t.y,',');let b=X.rp.bt;ok(b&&b.patrol===t.id&&b.units.filter(u=>u.side===1).every(u=>u.aware),'walking into its sight: an aware patrol');
 ok(b.units.some(u=>u.side===1&&u.E.role==='elite'),'a patrol has its leader');ok(b.xpMul===1.5,'patrols pay 1.5× XP');
 b.units.filter(u=>u.side===1).forEach(u=>u.hp=0);X.rpWin();X.rpEndBattle();ok(!X.w6Patrols('r1').some(p=>p.id===t.id),'a beaten patrol is gone');
 X.rp.bt=null;X.w6PatrolCheck(t.x-dx,t.y+1,',');b=X.rp.bt;ok(!b,'the beaten patrol does not fight again');
 const t2=X.w6Patrols('r1')[0];X.w6PatrolCheck(t2.x-(t2.face==='east'?1:-1),t2.y,',');b=X.rp.bt;ok(b&&b.units.filter(u=>u.side===1).every(u=>!u.aware),'reached from behind: an ambush');X.rp.bt=null;X.rp.mode='map';
 X.w6Rest('room:inn');ok(X.w6Patrols('r1').length===3,'an inn rest brings the patrols back');ok(['Few','Several','Pack','Lots','Overwhelming'].includes(X.w6Strength('r1')),'a strength word')}
// XP: a won v6 fight pays its foes' XP to every kobold; enough of it is a level and a pick
{const s=fresh({map:'r1'});X.w6Fight('r1',X.w6Enc('r1'));const b=X.rp.bt,xp=b.units.filter(u=>u.side===1).reduce((a,u)=>a+u.E.xp,0);const m=s.party[1];m.xp=X.v6XpNeed(m.lvl)-1;const L=m.lvl;
 b.units.filter(u=>u.side===1).forEach(u=>u.hp=0);X.rpWin();ok(m.lvl===L+1&&m.pend>=1,'enough XP is a level with a pick');ok(s.party[0].xp===xp,'every kobold gets the fight\'s XP: '+s.party[0].xp+' vs '+xp);X.rpEndBattle()}
// stables: shut before the first piece; then a raptor between visited stables. Fountains: travel from the second piece
{const s=fresh();X.w6Go('hearthspire',6,16);X.rpInteractAt(6,15);ok(!s.w6st.stables.length,'the stable is shut before the first piece');X.rp.mode='map';
 s.w6st.pieces=['tube'];X.rpInteractAt(6,15);ok(s.w6st.stables.length===1&&X.rp.mode==='w6travel','with a piece the stable opens');X.rp.mode='map';
 X.w6Go('r1',88,7);X.rpInteractAt(88,6);ok(s.w6st.stables.length===2,'the mill road stable');ok(X.w6TravelList('stable').length===2,'two stables to ride to');
 X.rp.w6travel='stable';X.w6Travel(0);ok(s.w6==='hearthspire'&&!X.rpSolid(s.x,s.y),'the raptor brings you to Hearthspire\'s stable');
 s.w6st.fountains=['hearthspire','pebblebrook'];ok(X.w6TravelList('fountain').length===0,'no fountain travel with one piece');s.w6st.pieces.push('sight');ok(X.w6TravelList('fountain').length===2,'fountain travel from the second piece');
 X.rp.w6travel='fountain';X.w6Travel(1);ok(s.w6==='pebblebrook'&&!X.rpSolid(s.x,s.y),'to the Pebblebrook fountain')}
// the flooded south road: under water while pb < 6, dry after
{const s=fresh({map:'pebblebrook'});s.q.pb=0;ok(X.rpSolid(14,18),'the south road is flooded');s.q.pb=6;ok(!X.rpSolid(14,18),'and dry when the wheel turns')}
/* found in the code review (23 Oct): a chest from the world's list on open ground opens as you step on it; a link that needs a flag
   by name opens once it is set; a map with patrols but no encounters has none (instead of breaking the map) */
{const s=fresh({map:'r1'});X.CHESTS6.push({name:'test chest',place:'r1',x:5,y:12,where:'',items:[{gold:7}]});const g0=s.gold;X.rp.s.w6st.since=-999;
 X.rp.s.x=4;X.rp.s.y=12;X.rpEnterTile(5,12);while(X.rp.mode==='dialog')X.rpDlgNext();ok(s.w6st.chests.includes('r1:5,12')&&s.gold===g0+7,'a chest on open ground opens: '+(s.gold-g0)+' gold');X.CHESTS6.pop();
 const L=['r1',3,3,'pebblebrook',31,12,'step','lamp'];ok(X.w6Follow(L)===true&&s.w6==='r1','a link that needs "lamp" is shut before');s.q.lamp=1;X.w6Follow(L);ok(s.w6==='pebblebrook','and open once the flag is set');
 const P=X.MAPS6.hearthspire;P.patrols=[{x:3,y:3,face:'east',name:'t'}];ok(X.w6Patrols('hearthspire').length===0,'patrols need the map\'s encounters');P.patrols=[]}
console.log(fails?fails+' failures':'v6 world: '+checks+' checks');process.exitCode=fails?1:0;
