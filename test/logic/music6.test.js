/* v6 music and sound (build step 18, audio-plan.md): each track plays where the plan says, the drums return when the wheel turns,
   the rhyme is the fixed tune, and the script's cues make their sounds. */
process.emitWarning=()=>{};
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m)}};
const X=require('../lib/game.js')();X.rp.headless=true;
X.rp.s=X.rpNewState();X.w6Start([X.v6Kobold('Pip','fighter',5,{hero:1})]);const s=X.rp.s;X.rp.mode='map';X.rp.bt=null;X.rp.dlg=null;
const at=(p,x,y,q)=>{X.w6Go(p,x,y);if(x!=null){s.x=x;s.y=y}Object.keys(s.q).forEach(k=>delete s.q[k]);Object.assign(s.q,q||{});X.rp.dlg=null;return X.v6Music()};
const key=(...a)=>at(...a).key;
ok(key('hearthspire',5,20,{act:1})==='hs_morning','Hearthspire in the morning');
ok(key('hearthspire',5,20,{act:5})==='hs_guards','after the hatching: under the guards');
ok(key('hearthspire',5,20,{act:5,empty:1})==='hs_empty'&&key('hearthspire',5,20,{act:8,march:1})==='hs_all','the empty square; everyone came');
ok(key('hearthspire',19,9,{act:3})==='castle','the castle yard');ok(key('room:castle',null,null,{act:2})==='castle_in','the castle hall, quieter drums');
{const t=at('room:tower',null,null,{act:2});ok(t.key==='quiet'&&t.amb==='fire','the tower: only the fire')}
{const t=at('room:bakery',null,null,{act:1});ok(t.key==='hum'&&t.amb==='fire','the bakery: Mallow hums the rhyme by the oven')}
ok(key('room:inn',null,null,{act:6})==='hs_guards','other Hearthspire rooms keep the town tune: '+key('room:inn',null,null,{act:6}));
ok(key('pebblebrook',5,5,{pb:2})==='pebble'&&X.RP_TRACKS.pebble.dr==='none','Pebblebrook: no drums while the wheel is still');
{const t=at('pebblebrook',X.MILL[0],X.MILL[1]+1,{pb:6});ok(t.key==='pebble_wheel'&&X.RP_TRACKS.pebble_wheel.dr!=='none'&&t.amb==='wheel','the wheel turns: the drums come back, and the wheel creaks near the mill')}
ok(at('pebblebrook',1,1,{pb:6}).amb==null,'the wheel is heard only near the mill');
ok(key('r1',10,10,{act:7})==='meadow'&&key('mine1',null,null,{})==='cave'&&key('mine2',null,null,{})==='cave_dark'&&X.RP_TRACKS.cave_dark.lead==='sine','R1, the mine, the dark floor thinner');
X.rp.dlg={lines:[{who:'Glitterbeak',text:'Mine.'}],i:0};ok(X.v6Music().key==='glitterbeak','Glitterbeak\'s own track while he speaks');X.rp.dlg=null;
X.rp.mode='battle';X.rp.bt={boss:null};ok(X.v6Music().key==='battle','a fight');X.rp.bt={boss:'v6b:grubb'};ok(X.v6Music().key==='boss','a boss');X.rp.bt={boss:'v6b:snatchclaw'};ok(X.v6Music().key==='castle_boss','Snatchclaw: the castle, fast');X.rp.mode='map';X.rp.bt=null;
/* every key the rule can give is a track */
for(const k of ['hs_morning','hs_guards','hs_empty','hs_all','castle','castle_in','castle_boss','glitterbeak','hum','hatching','pebble','pebble_wheel','cave_dark','meadow','cave','battle','boss'])ok(!!X.RP_TRACKS[k],'track '+k);
/* the rhyme: the fixed tune, 8 bars of 4 beats = 64 eighths, its notes the plan's degrees */
{const m=X.tuneMel('rhyme');ok(m.length===64,'the rhyme is 8 bars: '+m.length);ok(m.filter(Boolean).map(n=>n.d).join('')==='02445420244321445775432120','the rhyme\'s notes: '+m.filter(Boolean).map(n=>n.d).join(''));
 ok(X.rpSong(X.RP_TRACKS.hs_all).mel===undefined||X.rpSong(X.RP_TRACKS.hs_all).mel.slice(0,4).map(n=>n&&n.d).join()===m.slice(0,4).map(n=>n&&n.d).join(),'everyone came: the rhyme is the lead');
 ok(X.rpSong(X.RP_TRACKS.hs_morning).mel.slice(0,8).map(n=>n&&n.d).join()===m.slice(0,8).map(n=>n&&n.d).join(),'the morning opens with the rhyme\'s first bar')}
/* the script's cues */
const L=(who,text)=>({who,text});
ok(X.v6Cue(L('','Dawn. CRACK.'))==='crack','the egg cracks');ok(X.v6Cue(L('Glitterbeak','...Cold. COLD.'),true)==='roar','Glitterbeak roars when he first speaks');
ok(X.v6Cue(L('Glitterbeak','Warm. MINE.'),false)==='mine','a greedy blip on MINE');ok(X.v6Cue(L('Mallow','(singing, quietly) When a dragon hatches cold'))==='rhyme','Mallow sings the rhyme');
ok(X.v6Cue(L('Shaky kobold','It goes skree.'))==='skree','the raptor chick');ok(X.v6Cue(L('Pip','Hello.'))===null,'a plain line has only its blip');
console.log((fails?'FAIL':'ok')+' v6 music: '+checks+' checks');process.exitCode=fails?1:0;
