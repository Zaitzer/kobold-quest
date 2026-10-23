/* Saves: v1 and v2 saves load exactly as v37 loaded them; newest copy wins; junk and future saves are refused. */
const G=require('../lib/game.js')(),O=require('../lib/oldgame.js')();const fs=require('fs'),path=require('path');
const V2=Object.assign(JSON.parse(fs.readFileSync(path.join(__dirname,'../fixtures/save_v2.json'),'utf8')),{epoch:G.SAVE_EPOCH});
const V1={epoch:G.SAVE_EPOCH,v:1,x:9,y:20,face:'left',gold:77,party:[{name:'Pip',w:'sword',lvl:5,xp:3,hp:20,mp:4,hat:'leaf'},{name:'Bork',w:'bone',lvl:3,xp:0,hp:40,mp:2}],bag:{potion:2,ether:0,feather:1},q:{q1:2,kills:5,q2:1,glow:1,key:0,gate:0,gorb:0,vexx:0,bork:1,wizzle:0,intro:1},taken:[[3,4]],steps:120};
let fails=0;const eq=(a,b,msg)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A!==B){fails++;console.log('FAIL',msg,'\n new',A.slice(0,300),'\n old',B.slice(0,300))}};
const seeded=f=>{const r=Math.random;let x=5;Math.random=()=>{x=(x*48271)%2147483647;return x/2147483647};try{return f()}finally{Math.random=r}};
for(const [name,save] of [['v1',V1],['v2',V2]]){
  localStorage.setItem('kobold-pit-rpg',JSON.stringify(Object.assign({},save,{epoch:G.SAVE_EPOCH})));
  eq(seeded(()=>G.rpLoad()),seeded(()=>O.rpLoad()),name+' save loads the same')}
localStorage.setItem('kobold-pit-rpg','{"nonsense":1}');eq(G.rpLoad(),null,'junk save refused');
// the progress reset: a save from before the current epoch is ignored, so the player starts fresh
{const old=Object.assign({},V2,{epoch:G.SAVE_EPOCH-1});localStorage.setItem('kobold-pit-rpg',JSON.stringify(old));eq(G.rpLoad(),null,'save from before the reset ignored')}
// and the server clears cloud saves and the market once
{const {resetWorld}=require('../../server/reset.js');const data={'users/a':{id:'u_a'},'docs/data/users/u_a/save':{gold:5},'docs/data/users/u_a/char0':{v:1},'docs/data/users/u_a/lock0':{d:1},'docs/data/users/u_a/other':{x:1},'docs/market/l1':{seller:'u_a'},'sessions/x':{}};
 const st={get:async k=>k in data?data[k]:null,put:async(k,v)=>{data[k]=v},del:async k=>{delete data[k]},list:async p=>Object.keys(data).filter(k=>k.startsWith(p)).map(key=>({key,val:data[key]}))};
 (async()=>{const r=await resetWorld(st,1),again=await resetWorld(st,1);
  eq([r&&r.saves,r&&r.market,again],[3,1,null],'server reset counts and runs once');
  eq(Object.keys(data).sort(),['docs/data/users/u_a/other','meta/epoch','sessions/x','users/a'],'server reset keeps accounts, sessions and other data')})()}
localStorage.setItem('kobold-pit-rpg',JSON.stringify(Object.assign({},V2,{v:9})));eq(G.rpLoad(),null,'save from a newer version left alone');
// newest wins between this browser and the cloud
localStorage.setItem('kobold-pit-rpg',JSON.stringify(Object.assign({},V2,{gold:1,savedAt:1000})));
G.net.cloud=Object.assign({},V2,{gold:2,savedAt:2000});eq(G.rpLoad().gold,2,'newer cloud copy wins');
G.net.cloud=Object.assign({},V2,{gold:3,savedAt:500});eq(G.rpLoad().gold,1,'newer local copy wins');
G.net.cloud=null;
setTimeout(()=>{console.log(fails?'FAIL':'ok','saves:',fails,'failures');process.exitCode=fails?1:0},50);
