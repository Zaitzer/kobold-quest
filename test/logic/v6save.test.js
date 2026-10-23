/* the v6 save (build step 3, systems.md §11, §16): a new character saves and loads every field */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;
const s=X.v6NewSave({name:'Tansy',colour:'green'});
for(const k of ['q','seals','party','roster','gold','bag','buns','fountains','stables','respawn','bossDefeats','chests','patrols','fame','hero','place'])ok(k in s,'a new save has '+k);
ok(s.hero.name==='Tansy'&&s.buns===3,'the name and three ember-buns');ok(X.v6NewSave({name:'x'}).hero.name==='Pip','a bad name falls back to Pip');
// a played character: every field survives a save and a load, and the kobolds' stats are the same afterwards
const pip=X.v6Kobold('Tansy','ranger',9,{hero:1});pip.corr=12;pip.dark={ranger_volley:1};pip.ranks={ranger_mark:2};pip.sub='Scout';pip.streak=2;pip.bond=1;pip.pend=1;pip.junk={runtime:1};
const bork=X.v6Kobold('Bork','monk',8);Object.assign(s,{party:[pip,bork],roster:[pip,bork],gold:123,bag:{potion:2},buns:2,fountains:['hearthspire'],stables:['pebblebrook'],respawn:'pebblebrook',bossDefeats:{grubb:1},chests:['r1:3'],patrols:2,fame:4,seals:['tube']});s.q.grubb=1;
const json=JSON.stringify(X.v6SaveOf(s)),back=X.v6Load(JSON.parse(json));ok(back,'the save loads');
for(const k of ['gold','buns','patrols','fame','respawn'])ok(back[k]===s[k],k+' kept');for(const k of ['bag','fountains','stables','bossDefeats','chests','seals','q'])ok(JSON.stringify(back[k])===JSON.stringify(s[k]),k+' kept');
const p2=back.party[0];for(const k of ['lvl','corr','dark','ranks','sub','streak','bond','pend','lead','skills','known','passives','scores','gear'])ok(JSON.stringify(p2[k])===JSON.stringify(pip[k]),'kobold '+k+' kept');
ok(!('junk' in p2),'runtime fields are not saved');ok(JSON.stringify(X.v6Stats(p2))===JSON.stringify(X.v6Stats(pip)),'the same stats after loading');
// a save missing fields takes the defaults; a broken one is refused; an old-epoch one is ignored
const thin=JSON.parse(json);delete thin.stables;delete thin.fame;const t2=X.v6Load(thin);ok(t2&&Array.isArray(t2.stables)&&t2.fame===0,'missing fields take their defaults');
ok(X.v6Load({party:'x'})===null||X.v6Load({party:'x'}).party.length===0,'a broken save gives nothing to play');ok(X.v6Load(Object.assign(JSON.parse(json),{epoch:1}))===null,'a save from before the reset is ignored');
console.log(fails?fails+' failures':'v6 save: '+checks+' checks');process.exitCode=fails?1:0;
