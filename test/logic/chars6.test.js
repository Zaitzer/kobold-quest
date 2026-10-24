/* accounts and characters (build step 14, systems.md §16): six slots, a new hero named by the player, saving into its slot and
   loading it back, the class and the bought scores (balance.md §3) kept, deleting with the name typed and restoring within 7 days, gone after, a guest's hero kept */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;
const C=X.C6;X.chars6Create=X.c6Create;X.chars6Play=X.c6Play;
X.rp.s=X.rpNewState();X.openSelect&&0;
const form=(name,colour,slot,cls='fighter',scores)=>({name,colour,slot,cls,scores:scores||X.v6StartScores(cls),page:2});
// six empty slots for a guest
ok([0,1,2,3,4,5].every(i=>!X.slotInfo(i)),'six empty slots');
// a new hero in slot 2, named by the player; the story starts; saving writes the slot
// points left that could still be spent: not yet
C.form=form('Tansy','green',2,'rogue',{STR:8,DEX:15,CON:14,INT:13,WIS:8,CHA:8});X.chars6Create();ok(!X.slotInfo(2),'a hero with points still to spend is not made yet');
const buy={STR:8,DEX:15,CON:14,INT:13,WIS:10,CHA:12};C.form=form('Tansy','green',2,'rogue',buy);X.chars6Create();ok(X.rp.s.w6&&X.rp.s.hero.name==='Tansy'&&C.slot===2,'a new hero in slot 3, called Tansy');
ok(X.rp.s.party[0].cls==='rogue'&&JSON.stringify(X.rp.s.party[0].scores)===JSON.stringify(buy)&&X.rp.s.party[0].skills.length>0,'she is a rogue from the start, with the scores bought and her skills');
while(X.rp.mode==='dialog')X.rpDlgNext();X.rp.s.gold=77;X.chars6Save(X.rp.s);const info=X.slotInfo(2);ok(info&&info.name==='Tansy'&&info.lvl===1,'the slot shows the hero: '+JSON.stringify(info));
// another hero cannot take the same name; a bad name is refused
C.form=form('tansy','blue',3);X.chars6Create();ok(!X.slotInfo(3),'two heroes of one account cannot share a name');C.form=form('x','blue',3);X.chars6Create();ok(!X.slotInfo(3),'names are 2 to 12 letters');
// loading it back: the same gold, the same place
X.rp.s=X.rpNewState();C.slot=null;X.chars6Play(2,true);setTimeout(()=>{
  ok(X.rp.s.w6&&X.rp.s.gold===77&&C.slot===2,'playing slot 3 loads Tansy with her 77 gold');
  // deleting: the name must be typed; restore within 7 days; gone after
  C.del={i:2,typed:'Pip'};X.doDelete();ok(!X.slotInfo(2).deleted,'the wrong name does not delete');
  C.del={i:2,typed:'Tansy'};X.doDelete();ok(X.slotInfo(2).deleted,'typing the name deletes');X.restore(2);ok(!X.slotInfo(2).deleted,'restored within 7 days');
  C.del={i:2,typed:'Tansy'};X.doDelete();const raw=JSON.parse(JSON.stringify(X.store.get('kq6:guest:2')));raw.deletedAt=Date.now()-8*864e5;X.store.set('kq6:guest:2',raw);X.purge(2);ok(!X.slotInfo(2),'after 7 days the hero is gone');
  C.form=form('Moss','green',2);X.chars6Create();C.del={i:2,typed:'Moss'};X.doDelete(true);ok(!X.slotInfo(2)&&!X.store.get('kq6:guest:2'),'Delete now: gone at once, the slot free');
  /* every save is stamped, and the newest copy wins (a phone's progress is not lost to an older copy on the PC) */
  C.form=form('Wick','blue',4);X.chars6Create();while(X.rp.mode==='dialog')X.rpDlgNext();X.chars6Save(X.rp.s);
  const mine=X.store.get('kq6:guest:4');ok(mine&&mine.savedAt>0,'a save carries the time it was made');
  C.cloud[4]=Object.assign({},mine,{savedAt:mine.savedAt+60000,gold:999});ok(X.slotInfo(4)&&X.raw(4).gold===999,'a newer copy from another device wins');
  C.cloud[4]=Object.assign({},mine,{savedAt:mine.savedAt-60000,gold:1});ok(X.raw(4).gold!==1,'an older copy does not');C.cloud[4]=null;
  /* the server's copy waits a moment, and belongs to the slot it was made for, even when another hero is picked in between */
  const sets=[];X.net.me='u_test';X.net.db={doc:p=>({set:d=>{sets.push([p,d]);return Promise.resolve()},get:async()=>({exists:false})})};
  X.chars6Save(X.rp.s);C.slot=5;X.cloudFlush();
  ok(sets.length===1&&/\/char4$/.test(sets[0][0])&&sets[0][1].hero.name==='Wick','the waiting write goes to its own slot (char4): '+(sets[0]&&sets[0][0]));
  ok(C.cloud[4]&&C.cloud[4].hero.name==='Wick'&&!C.cloud[5],'and the screen\'s copy of slot 6 is untouched');
  X.net.db=null;X.net.me=null;
  console.log(fails?fails+' failures':'v6 heroes: '+checks+' checks');process.exitCode=fails?1:0},0);
