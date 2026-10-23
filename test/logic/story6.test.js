/* the slice's story played through (build step 12's done-when): a new hero walks from the bakery to the tube, through every scene on
   the main path, the class pick, the five set pieces, Grubb and Snipe, the miners and the circle, with random fights on the way,
   once for each of the eight classes. `node test/logic/story6.test.js quick` plays one class. */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};let ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;X.rp.autoParty=true;
const quick=process.argv.includes('quick'),only=process.argv.find(a=>X.WAVE16.includes(a)),CLASSES=only?[only]:quick?['fighter']:X.WAVE16;
let fights=0,losses=0,retries=0,tries=0,rests=0,stalls=0;
/* play whatever is open: dialogue (choices take `pick`), the class pick, fights (to the end; a lost one is retried when it can be) */
function drain(cls,pick){for(let guard=0;guard<2000;guard++){const rp=X.rp;
  if(rp.bt){const b=rp.bt;let s=0;while(!b.over&&s<60000){X.rpBattleStep(1/30);s++}if(!b.over){if(b.story)throw new Error('a story fight did not end');stalls++;b.over='run';b.phase='end'}   // a rare hide-and-seek stall of the test bot in a random fight: counted, then leftfights++;
    if(b.over==='lose'){losses++;if(X.v6CanRetry(b)&&tries<3){retries++;tries++;X.v6Retry();continue}}tries=0;X.rpEndBattle();
    /* a player walks back to a fountain or a campfire when the pack is low; the test rests them instead (it checks the story, not the pace) */
    const P=X.rp.s.party,f=P.reduce((a,m)=>a+Math.max(0,m.hp),0)/P.reduce((a,m)=>a+X.rpStats(m).hp,0);if(f<0.5){rests++;X.w6HealAll()}continue}
  if(rp.mode==='dialog'){const d=rp.dlg;if(d.i<d.lines.length-1||!d.choices)X.rpDlgNext();else X.rpChoose(pick&&d.choices.findIndex(c=>c.t===pick)>=0?d.choices.findIndex(c=>c.t===pick):0);continue}
  if(rp.mode==='w6class'){X.pickClass(cls);continue}
  if(rp.mode!=='map')rp.mode='map';return}throw new Error('drain did not settle')}
/* walk on foot to (tx, ty) in the current place, one tile at a time as the engine enters them; fights on the way are played */
function walkTo(tx,ty,cls,adj){for(let tries=0;tries<40;tries++){const s=X.rp.s,p0=s.w6;if(adj?Math.abs(s.x-tx)+Math.abs(s.y-ty)===1:s.x===tx&&s.y===ty)return true;
    const goal=(x,y)=>adj?Math.abs(x-tx)+Math.abs(y-ty)===1:x===tx&&y===ty;const prev=new Map([[s.x+','+s.y,null]]),q=[[s.x,s.y]];let end=null;
    while(q.length){const [x,y]=q.shift();if(goal(x,y)){end=x+','+y;break}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(prev.has(k))continue;
      const target=!adj&&nx===tx&&ny===ty;if(!target&&(X.rpSolid(nx,ny)||X.w6LinkAt(p0,nx,ny)))continue;prev.set(k,[x,y]);q.push([nx,ny])}}
    if(!end)return false;const path=[];let k=end;while(prev.get(k)){path.unshift(k.split(',').map(Number));const [px,py]=prev.get(k);k=px+','+py}
    let broke=false;for(const [x,y] of path){X.rpEnterTile(x,y);if(X.rp.bt||X.rp.mode!=='map'){drain(cls);broke=true;break}if(X.rp.s.w6!==p0)return true}if(!broke)return true}return false}
/* travel between places through the links (gates, doors, stairs), walking each map */
function goTo(place,cls){for(let n=0;n<12&&X.rp.s.w6!==place;n++){const from=X.rp.s.w6,prev=new Map([[from,null]]),q=[from];
    while(q.length){const p=q.shift();if(p===place)break;for(const L of X.LINKS6){if(L[0]!==p||L[7]||prev.has(L[3]))continue;prev.set(L[3],L);q.push(L[3])}}
    let L=prev.get(place),first=null;while(L){first=L;L=prev.get(L[0])}if(!first)return false;
    if(first[6]==='bump'){walkTo(first[1],first[2],cls,true);X.rpInteractAt(first[1],first[2])}else walkTo(first[1],first[2],cls);drain(cls)}return X.rp.s.w6===place}
function talk(id,cls,pick){const n=X.NPCS6.find(n=>n.id===id);if(!goTo(n.place,cls))return false;if(!walkTo(n.x,n.y,cls,true))return false;X.rpInteractAt(n.x,n.y);drain(cls,pick);return true}
function stepNear(place,x,y,cls){goTo(place,cls);const s=X.rp.s;const R=X.rp.grid;let best=null,bd=1e9;for(let j=0;j<R.length;j++)for(let i=0;i<R[0].length;i++){if(X.rpSolid(i,j)||X.w6LinkAt(place,i,j))continue;const d=Math.hypot(i-x,j-y);if(d<bd){bd=d;best=[i,j]}}
  walkTo(best[0],best[1],cls);drain(cls)}
const Q=()=>X.rp.s.q;
/* a player who loses on the way (a random fight on R1, say) wakes at a fountain and walks back: try an action again until it has happened */
/* like a player stuck on a boss: a few more fights on the route for a level, then back (the bot is a poor tactician, build-plan step 20) */
function grind(place,n,cls){goTo(place,cls);const E=X.w6Enc(place);for(let i=0;i<n;i++){X.rp.s.w6st.since=99;X.w6Fight(place,E);drain(cls)}X.w6HealAll()}
function until(check,fn,n){for(let i=0;i<(n||25)&&!check();i++)fn();return check()}const _ok=ok;ok=(c,m)=>{if(process.env.DBG)console.log(c?'ok ':'NO ',m,JSON.stringify(X.rp.s.q),X.rp.s.w6,X.rp.s.x+','+X.rp.s.y,'fights',fights,'lost',losses);_ok(c,m)};
for(const cls of CLASSES){fights=0;losses=0;retries=0;const t0=Date.now();
  try{X.rp.s=X.rpNewState();X.rp.mode='map';X.s6NewGame('Tansy','green');drain(cls);ok(Q().act===1,cls+': the story starts (act 1)');
    until(()=>Q().act>=2,()=>{goTo('room:cellar',cls);drain(cls)});ok(Q().act===2,cls+': the cellar rats are beaten (act 2): '+Q().act);
    until(()=>Q().bib1,()=>talk('bib',cls));ok(Q().bib1===1,cls+': Bib on his bench');
    until(()=>Q().drill,()=>stepNear('hearthspire',19.5,11,cls));ok(Q().drill===1&&!X.rp.s.party[0].noclass&&X.rp.s.party[0].cls===cls,cls+': the drill, and the class is '+X.rp.s.party[0].cls);
    until(()=>Q().mural,()=>goTo('room:castle',cls));ok(Q().mural===1,cls+': the mural');
    until(()=>Q().lamp===2,()=>goTo('room:tower',cls));ok(Q().lamp===2,cls+': the lamp lit at the tower fire');
    until(()=>Q().act>=3,()=>talk('mallow',cls));ok(Q().act===3,cls+': Mallow lights the oven (act 3)');until(()=>Q().ember,()=>talk('mallow',cls));ok(Q().ember===1,cls+': the ember');
    until(()=>Q().act>=4,()=>stepNear('hearthspire',19.5,10,cls));ok(Q().act===4,cls+': at the Nest (act 4)');
    until(()=>Q().act>=5,()=>{goTo('hearthspire',cls);walkTo(19,10,cls);X.rpInteractAt(19,9);drain(cls)});ok(Q().act===5,cls+': the refusal and the hatching (act 5)');
    until(()=>Q().act>=6,()=>talk('mallow',cls));ok(Q().act===6&&X.rp.s.party.length===3,cls+': Wizzle and Glint join (act 6)');
    until(()=>Q().act>=7,()=>stepNear('hearthspire',1,16,cls));ok(Q().act===7&&X.rp.s.party.length===4,cls+': Bork joins, the gate fight (act 7)');
    until(()=>Q().pb>=1,()=>stepNear('r1',93,9,cls));ok(Q().pb===1,cls+': Grubb\'s toll (pb 1)');
    until(()=>Q().arrived,()=>goTo('pebblebrook',cls));ok(Q().arrived===1,cls+': Pebblebrook');until(()=>Q().pb>=2,()=>talk('ruddle',cls));ok(Q().pb===2,cls+': Ruddle opens the challenge (pb 2)');
    until(()=>Q().grubb,()=>{X.w6HealAll();stepNear('r1',93,9,cls);if(!Q().grubb)grind('r1',4,cls)},20);ok(Q().grubb===1,cls+': Grubb beaten');
    until(()=>Q().nugget,()=>talk('nugget_mine',cls));ok(Q().nugget===1,cls+': Nugget joins');
    for(const k of [X.W6_RAIL.loopIn,X.W6_RAIL.loopOut])X.rp.s.w6st.switches[k]=true;   // the rail puzzle's answer (its rule is tested in world6.test.js)
    until(()=>Q().miner_ore,()=>{talk('ore',cls,'Push the cart');talk('ore',cls)});ok(Q().miner_ore===1,cls+': Ore comes');
    until(()=>Q().miner_tansy,()=>talk('tansy',cls,'Give it back'));ok(Q().miner_tansy===1,cls+': Tansy comes');
    until(()=>Q().miner_brothers,()=>{talk('flint',cls);goTo('room:loft',cls);walkTo(5,3,cls);X.rpInteractAt(5,2);drain(cls)});ok(Q().miner_brothers===1,cls+': Flint and Grit come');
    until(()=>Q().miner_marl,()=>{talk('marl',cls);talk('ruddle',cls);talk('marl',cls)});ok(Q().miner_marl===1,cls+': Old Marl comes');
    until(()=>Q().pb>=3,()=>stepNear('pebblebrook',18,16,cls));ok(Q().pb===3,cls+': the fifth miner (pb 3)');
    until(()=>Q().pb>=4,()=>{X.w6HealAll();stepNear('mine3',24,15,cls);if(Q().pb<4)grind('mine1',4,cls)},20);ok(Q().pb===4,cls+': Snipe beaten (pb 4)');
    until(()=>Q().pb>=5,()=>talk('grubb_road',cls));ok(Q().pb===5,cls+': Grubb comes (pb 5)');
    until(()=>Q().pb>=6,()=>stepNear('pebblebrook',18,16,cls));ok(Q().pb===6&&(X.rp.s.w6st.pieces||[]).includes('tube'),cls+': the circle meets and the tube is found (pb 6)');
    const h=X.rp.s.party[0];console.log(cls.padEnd(9),'level',h.lvl,'pack',X.rp.s.party.map(m=>m.name+' '+m.lvl).join(', '),'· fights',fights,'lost',losses,'rests',rests,'stalls',stalls,'·',((Date.now()-t0)/1000).toFixed(1)+'s')}
  catch(e){bad(cls+': '+e.stack.split('\n').slice(0,3).join(' | '))}}
console.log(fails?fails+' failures':'v6 story: '+checks+' checks, '+CLASSES.length+' classes from the bakery to the tube');process.exitCode=fails?1:0;
