/* The tap test (ui-design.md §11.1, build step 17): every row of the tap table (§3) that the slice has is done in the real v6 game
   by tapping the screen, and its taps are counted; a row fails if it is over its budget by more than one. Rows the slice doesn't have
   yet are listed as such. Taps are real clicks on the panel and the goal bar, or one tap on a map tile or a board tile. */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const errs=[];
 p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
 await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);await p.click('#go-rpg');await p.waitForTimeout(300);
 const rows=[],T={n:0};let bad=0;
 const E=(f,a)=>p.evaluate(f,a);
 const btn=async sel=>{T.n++;await p.click('#rp-panel '+sel,{timeout:4000});await p.waitForTimeout(120)};
 const tile=async(x,y)=>{T.n++;await E(([x,y])=>__v6.tile(x,y),[x,y]);await p.waitForTimeout(80)};
 const board=async(x,y)=>{T.n++;await E(([x,y])=>__rpB.tap(x,y),[x,y]);await p.waitForTimeout(80)};
 const until=async(f,a,ms=8000)=>{const t=Date.now();while(Date.now()-t<ms){if(await E(f,a).catch(()=>false))return true;await p.waitForTimeout(60)}return false};
 const row=async(name,budget,fn)=>{T.n=0;let ok=false,why='';try{ok=await fn()}catch(e){why=e.message.split('\n')[0].slice(0,90)}
   const over=T.n>budget+1;if(!ok||over)bad++;rows.push((ok&&!over?'ok  ':'FAIL')+' '+name.padEnd(34)+' '+T.n+' taps (budget '+budget+')'+(ok?'':' did not happen '+why))};
 const na=name=>rows.push('--   '+name.padEnd(34)+' not in the slice yet');
 const fresh=async()=>{await E(()=>{__v6.pack([['Pip','fighter',5],['Glint','cleric',5],['Wizzle','wizard',5],['Bork','bard',5]]);__rp.grace=1e9;__rp.s.q.tac=1;
   const P=__rp.s.party;P[1].skills=['cleric_heal','cleric_blessing'];P[2].skills=['wizard_ice_bolt','wizard_fireball'];P[3].skills=['bard_rousing_song','bard_vicious_mockery']});await p.waitForTimeout(200)};
 await fresh();
 /* ---------- the overworld ---------- */
 await row('walk anywhere',1,async()=>{const t=await E(()=>{const s=__rp.s,c=__rp.grid[s.y][s.x];for(let r=8;r>2;r--)for(const [dx,dy] of [[r,0],[-r,0],[0,r],[0,-r]]){const y=s.y+dy,x=s.x+dx;if(__rp.grid[y]&&__rp.grid[y][x]===c)return[x,y]}return null});
   if(!t)throw new Error('no tile');await tile(...t);return until(t=>__rp.s.x===t[0]&&__rp.s.y===t[1],t)});
 await row('drink at a fountain (heal)',1,async()=>{await E(()=>{__rp.s.party.forEach(m=>m.hp=1)});const F=await E(()=>__v6.find('F'));await tile(...F);return until(()=>__rp.s.party.every(m=>m.hp>1))});
 await E(()=>{__rp.mode='map';__rp.dlg=null});
 await row('talk to someone',1,async()=>{const n=await E(()=>{const n=__v6.npc();return n&&[n.x,n.y]});await tile(...n);return until(()=>__rp.mode==='dialog')});
 await E(()=>{__rp.dlg=null;__rp.mode='map'});
 await row('advance a line of dialogue',1,async()=>{await E(()=>__kq.say(['one','two','three','four']));await btn('[data-rp="next"]');return E(()=>__rp.dlg&&__rp.dlg.i===1)});
 await row('skip a whole conversation',1,async()=>{await btn('[data-rp="dlgskip"]');return E(()=>__rp.mode==='map')});
 await row('answer a choice',1,async()=>{await E(()=>__kq.say(['Well?'],[{t:'Yes',fn:()=>{window.__said=1}},{t:'No'}]));await btn('[data-rp="choose"][data-i="0"]');return E(()=>window.__said===1)});
 await row('read the quest log',1,async()=>{T.n++;await p.click('#rp-top');await p.waitForTimeout(150);return E(()=>__rp.mode==='w6log')});
 await E(()=>{__rp.mode='map'});
 await row('fast travel',3,async()=>{await E(()=>{const st=__rp.s.w6st;st.pieces=['tube','sight'];st.fountains=['hearthspire','pebblebrook']});await btn('[data-rp="menu"]');await btn('[data-rp="w6fast"]');await btn('[data-rp="w6go"][data-v="1"]');return until(()=>__rp.s.w6==='pebblebrook')});
 await E(()=>{__rp.mode='map';__rp.s.w6st.pieces=[]});
 await row('rest at an inn',2,async()=>{await E(()=>{__w6go('room:inn',6,6);__rp.s.party.forEach(m=>m.hp=1)});const B=await E(()=>__v6.find('p'));await tile(...B);await until(b=>__rp.s.x===b[0]&&__rp.s.y===b[1],B);if(await E(()=>__rp.s.party.every(m=>m.hp>1)))return true;await tile(...B);return until(()=>__rp.s.party.every(m=>m.hp>1))});
 await E(()=>{__rp.dlg=null;__rp.mode='map'});
 na('ride a raptor / sail a boat');na('open the world map');
 /* ---------- pack and gear ---------- */
 await row('open a kobold\'s sheet',1,async()=>{await btn('.rpparty [data-rp="v6sheet"][data-v="1"]');return E(()=>__rp.mode==='v6sheet')});
 await E(()=>{__rp.mode='map'});
 await row('pick a talent',2,async()=>{await E(()=>{__rp.s.party[0].pend=1;__rp.sig=''});await p.waitForTimeout(150);await btn('.rpparty [data-rp="v6sheet"][data-v="0"]');await btn('[data-rp="v6pick"]');await btn('[data-rp="v6pickok"]');return E(()=>!(__rp.s.party[0].pend>0))});
 await E(()=>{__rp.mode='map'});
 await row('use a potion outside battle',3,async()=>{await E(()=>{__rp.s.party[2].hp=5;__rp.s.bag.potion=3});await btn('[data-rp="menu"]');await btn('[data-rp="v6use"][data-v="potion"]');await btn('[data-rp="v6useon"][data-v="2"]');return E(()=>__rp.s.party[2].hp>5)});
 await E(()=>{__rp.mode='map'});
 await row('equip an item',3,async()=>{await E(()=>{const s=__rp.s;s.inv6=s.inv6||[];const it=__v6.piece('helm',0);it.id='t1';s.inv6.push(it);__rp.sig=''});
   await btn('.rpparty [data-rp="v6sheet"][data-v="0"]');const has=await p.locator('#rp-panel [data-rp="v6eqit"]').count();if(!has)throw new Error('no wearable item shown');await btn('[data-rp="v6eqit"]');return E(()=>!__rp.s.inv6.some(i=>i.id==='t1'))});
 await E(()=>{__rp.mode='map'});
 na('reorder / swap the pack (inn roster)');
 /* ---------- shops ---------- */
 await E(()=>{__rp.w6shop='hearthspire';__rp.w6tab='buy';__rp.mode='w6shop';__rp.s.gold=500});await p.waitForTimeout(150);
 await row('buy',2,async()=>{const g=await E(()=>__rp.s.gold);await btn('[data-rp="w6buy"]:not([disabled])');return E(g=>__rp.s.gold<g,g)});
 await E(()=>{const it=__v6.piece('boots',0);it.id='t2';__rp.s.inv6.push(it);__rp.sig=''});
 await row('sell',2,async()=>{const g=await E(()=>__rp.s.gold);await btn('[data-rp="w6tab"][data-v="sell"]');await btn('[data-rp="w6sell"]');return E(g=>__rp.s.gold>g,g)});
 await E(()=>{__rp.mode='map'});
 /* ---------- battle ---------- */
 const fight=async()=>{await E(()=>{__rp.mode='map';__rp.s.party.forEach(m=>{m.hp=999;m.mp=99});__v6.fight([['nettlenose_scout',4],['nettlenose_scout',4],['copper_beetle',4]])});await until(()=>__rp.mode==='battle')};
 /* make the given kobold's turn: it acts now with 2 AP; a foe stands beside it (or not) */
 const turn=async(i,near)=>{await until(()=>__rp.bt&&(__rp.bt.phase==='turn'||__rp.bt.over),null,20000);return E(([i,near])=>{const b=__rp.bt,u=b.units.filter(x=>x.side===0)[i];b.cur=u;if(u.hp<=0){u.hp=10;if(u.k)u.k.state="idle"}u.ap=2;   /* a unit knocked down earlier in the test is stood up again */ b.mode='move';b.pend=null;b.undo=null;
   const f=b.units.filter(x=>x.side===1&&x.hp>0);f.forEach((e,j)=>{e.aware=true;e.hp=Math.max(e.hp,30)});
   if(near){const e=f[0];for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1]]){const x=u.x+dx,y=u.y+dy;if(x>=0&&y>=0&&x<b.W&&y<b.H&&!b.units.some(o=>o!==e&&o.hp>0&&o.x===x&&o.y===y)){e.x=x;e.y=y;break}}
     f.slice(1).forEach((o,j)=>{o.x=Math.min(b.W-1,u.x+3+j);o.y=Math.max(0,u.y-4)})}
   else f.forEach((o,j)=>{o.x=Math.min(b.W-1,j*2);o.y=0});b.units.forEach(x=>{const h=x.k;});__rp.sig='';return true},[i,near])};
 await fight();
 await row('place the pack ("Auto")',1,async()=>{await btn('[data-tac="auto"]');return until(()=>__rp.bt.phase!=='place')});
 await row('move',1,async()=>{await turn(0,false);const t=await E(()=>{const u=__rp.bt.cur,c=__rpB.reach().sort((a,b)=>a[2]-b[2]);const x=c.find(q=>q[2]>=1);return x&&[x[0],x[1],u.x,u.y]});if(!t)throw new Error('nowhere to go');
   await board(t[0],t[1]);return until(t=>{const u=__rp.bt.cur;return u&&(u.x!==t[2]||u.y!==t[3])},t)});
 await row('undo a move',1,async()=>{await until(()=>__rp.bt.phase==='turn');const before=await E(()=>__rp.bt.undo&&[__rp.bt.undo.x,__rp.bt.undo.y]);if(!before)throw new Error('no undo');await btn('[data-tac="undo"]');return E(b=>{const u=__rp.bt.cur;return u.x===b[0]&&u.y===b[1]&&u.ap===2},before)});
 await row('basic attack on a foe in reach',1,async()=>{await turn(0,true);const f=await E(()=>{const b=__rp.bt,e=b.units.find(x=>x.side===1&&x.hp>0);return[e.x,e.y]});const ap=await E(()=>__rp.bt.cur.ap);await board(...f);return until(a=>__rp.bt.cur!==null&&(__rp.bt.cur.ap<a||__rp.bt.cur.atkd)||__rp.bt.phase==='busy',ap)});
 await row('move and attack',2,async()=>{await turn(0,false);
   /* a tile it can walk to, and the foe put on a walkable tile beside that one but out of reach from where it stands (the board's cover is random) */
   const ok=await E(()=>{const b=__rp.bt,u=b.cur,e=b.units.find(x=>x.side===1&&x.hp>0),R=__rpB.reach(),free=(x,y)=>!b.units.some(o=>o!==e&&o.hp>0&&o.x===x&&o.y===y);
     for(const r of R.filter(q=>q[2]>=1).sort((a,c)=>a[2]-c[2]))for(const n of R)if(Math.abs(n[0]-r[0])+Math.abs(n[1]-r[1])===1&&Math.abs(n[0]-u.x)+Math.abs(n[1]-u.y)>=2&&free(n[0],n[1])){e.x=n[0];e.y=n[1];return[r[0],r[1],n[0],n[1]]}
     return null});if(!ok)throw new Error('no room on the board');
   await board(ok[0],ok[1]);await until(()=>__rp.bt.phase==='turn',null,6000);await board(ok[2],ok[3]);return until(()=>__rp.bt.cur&&__rp.bt.cur.atkd||__rp.bt.phase!=='turn')});
 await row('a skill on one foe',2,async()=>{await turn(2,true);await btn('[data-tac="mode"][data-v="sk:wizard_ice_bolt"]');const f=await E(()=>{const e=__rp.bt.units.find(x=>x.side===1&&x.hp>0);return[e.x,e.y]});const mp=await E(()=>__rp.bt.cur.m.mp);await board(...f);return until(m=>__rp.bt.units.filter(x=>x.side===0)[2].m.mp<m,mp)});
 await row('a skill on an area',3,async()=>{await turn(2,true);await btn('[data-tac="mode"][data-v="sk:wizard_fireball"]');const f=await E(()=>{const e=__rp.bt.units.filter(x=>x.side===1&&x.hp>0)[0];return[e.x,e.y]});   /* the foe beside it: always in reach and in sight */const mp=await E(()=>__rp.bt.cur.m.mp);await board(...f);await board(...f);return until(m=>__rp.bt.units.filter(x=>x.side===0)[2].m.mp<m,mp)});
 await row('a heal on a friend',2,async()=>{await turn(1,false);const t=await E(()=>{const b=__rp.bt,u=b.cur,f=b.units.filter(x=>x.side===0)[0];f.m.hp=10;return[f.x,f.y]});await btn('[data-tac="mode"][data-v="sk:cleric_heal"]');await board(...t);return until(()=>__rp.bt.units.filter(x=>x.side===0)[0].m.hp>10)});
 await row('a buff on the pack',1,async()=>{await turn(3,false);const mp=await E(()=>__rp.bt.cur.m.mp);await btn('[data-tac="mode"][data-v="sk:bard_rousing_song"]');return until(m=>__rp.bt.units.filter(x=>x.side===0)[3].m.mp<m,mp)});
 await row('use a potion in battle',3,async()=>{await turn(0,false);await E(()=>{__rp.bt.cur.m.hp=10;__rp.s.bag.potion=2;__rp.sig=''});await p.waitForTimeout(150);await btn('[data-tac="mode"][data-v="it:potion"]');const me=await E(()=>[__rp.bt.cur.x,__rp.bt.cur.y]);await board(...me);return until(()=>__rp.bt.units.filter(x=>x.side===0)[0].m.hp>10)});
 await row('guard',1,async()=>{await turn(0,false);await btn('[data-tac="mode"][data-v="guard"]');return until(()=>__rp.bt.units.filter(x=>x.side===0)[0].guard===1)});
 await row('end the turn',1,async()=>{await turn(1,false);const u=await E(()=>__rp.bt.cur.name);await btn('[data-tac="mode"][data-v="end"]');return until(n=>!__rp.bt.cur||__rp.bt.cur.name!==n||__rp.bt.cur.ap===0,u)});
 await row('flee the fight',2,async()=>{await turn(3,false);await E(()=>{const b=__rp.bt,u=b.cur;u.y=b.H-1;if(b.units.some(o=>o!==u&&o.hp>0&&o.x===u.x&&o.y===u.y))u.x=(u.x+1)%b.W;__rp.sig=''});await p.waitForTimeout(150);
   await btn('[data-tac="mode"][data-v="leave"]');await btn('[data-tac="ok"]');return until(()=>__rp.bt.units.filter(x=>x.side===0)[3].fled)});
 na('watch (a gun kobold)');
 console.log(rows.join('\n'));console.log('errors',JSON.stringify(errs));
 await br.close();process.exitCode=bad||errs.length?1:0})();
