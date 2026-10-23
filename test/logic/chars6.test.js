/* accounts and characters (build step 14, systems.md §16): six slots, a new hero named by the player, saving into its slot and
   loading it back, deleting with the name typed and restoring within 7 days, gone after, a guest's hero kept */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;
const C=X.C6;X.chars6Create=X.c6Create;X.chars6Play=X.c6Play;
X.rp.s=X.rpNewState();X.openSelect&&0;
// six empty slots for a guest
ok([0,1,2,3,4,5].every(i=>!X.slotInfo(i)),'six empty slots');
// a new hero in slot 2, named by the player; the story starts; saving writes the slot
C.form={name:'Tansy',colour:'green',slot:2};X.chars6Create();ok(X.rp.s.w6&&X.rp.s.hero.name==='Tansy'&&C.slot===2,'a new hero in slot 3, called Tansy');
while(X.rp.mode==='dialog')X.rpDlgNext();X.rp.s.gold=77;X.chars6Save(X.rp.s);const info=X.slotInfo(2);ok(info&&info.name==='Tansy'&&info.lvl===1,'the slot shows the hero: '+JSON.stringify(info));
// another hero cannot take the same name; a bad name is refused
C.form={name:'tansy',colour:'blue',slot:3};X.chars6Create();ok(!X.slotInfo(3),'two heroes of one account cannot share a name');C.form={name:'x',colour:'blue',slot:3};X.chars6Create();ok(!X.slotInfo(3),'names are 2 to 12 letters');
// loading it back: the same gold, the same place
X.rp.s=X.rpNewState();C.slot=null;X.chars6Play(2,true);setTimeout(()=>{
  ok(X.rp.s.w6&&X.rp.s.gold===77&&C.slot===2,'playing slot 3 loads Tansy with her 77 gold');
  // deleting: the name must be typed; restore within 7 days; gone after
  C.del={i:2,typed:'Pip'};X.doDelete();ok(!X.slotInfo(2).deleted,'the wrong name does not delete');
  C.del={i:2,typed:'Tansy'};X.doDelete();ok(X.slotInfo(2).deleted,'typing the name deletes');X.restore(2);ok(!X.slotInfo(2).deleted,'restored within 7 days');
  C.del={i:2,typed:'Tansy'};X.doDelete();const raw=JSON.parse(JSON.stringify(X.store.get('kq6:guest:2')));raw.deletedAt=Date.now()-8*864e5;X.store.set('kq6:guest:2',raw);X.purge(2);ok(!X.slotInfo(2),'after 7 days the hero is gone');
  console.log(fails?fails+' failures':'v6 heroes: '+checks+' checks');process.exitCode=fails?1:0},0);
