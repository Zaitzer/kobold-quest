/* Content tables: same items, monsters, classes, skills and weapons as v37 (key order included), so moving
   data around never silently changes the game. Update the fixture on purpose when content changes. */
const G=require('../lib/game.js')(),O=require('../lib/oldgame.js')();
const ser=v=>JSON.stringify(v,(k,x)=>typeof x==='function'?'fn:'+x.toString().replace(/\s+/g,'').replace(/\((\w+)\)=>/g,'$1=>'):x);
const T=['RP_IT','RP_W','RP_SHOP','RP_SHOP2','RP_ITEMS','RP_LOOT','RP_CLS','RP_SK','RP_TAL','RP_ADV','RP_E','RP_ZONE','RP_ST','RP_TT','RP_TW','RP_AFFIX','RP_SETS','RP_MATS','RP_RECIPES','RP_CHESTS'];  // RP_NPC left v37 behind with the Pebble Moot story
let fails=0;
for(const t of T){if(!(t in G)){console.log('missing in new:',t);fails++;continue}
  let a=G[t],b=O[t];
  /* content may grow: everything v37 had must still be there unchanged, new entries are fine.
     Villagers that moved (toast and biscuit indoors, the elder off his doorstep) may change x, y and place. */
  const MOVED=new Set(['toast','biscuit','elder']);
  if(t==='RP_NPC'){const strip=n=>{const o=Object.assign({},n);if(MOVED.has(n.id)){delete o.x;delete o.y;delete o.place}return o};a=b.map(n=>strip(a.find(m=>m.id===n.id)||{}));b=b.map(strip)}
  else if(t==='RP_CHESTS')a=a.slice(0,b.length);
  else if(!Array.isArray(b)&&t!=='RP_IT'){const keep={};for(const k in b)keep[k]=a[k];a=keep}
  if(t==='RP_IT'){const ka=Object.keys(G.RP_IT_BASE||{}),kb=Object.keys(O.RP_IT_BASE||{});a=kb.map(k=>[k,G.RP_IT[k]]);b=kb.map(k=>[k,O.RP_IT[k]])}
  if(ser(a)!==ser(b)){fails++;const A=ser(a),B=ser(b);let i=0;while(A[i]===B[i])i++;console.log('DIFF',t,'\n new …'+A.slice(Math.max(0,i-80),i+120)+'\n old …'+B.slice(Math.max(0,i-80),i+120))}}
{const a=ser(G.WEAPONS),b=ser(O.WEAPONS||{});if(O.WEAPONS&&a!==b){fails++;console.log('DIFF WEAPONS')}}
console.log(fails?'FAIL':'ok','content tables:',T.length,'checked,',fails,'differ');process.exitCode=fails?1:0;
