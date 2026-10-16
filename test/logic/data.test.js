/* Content tables: same items, monsters, classes, skills and weapons as v37 (key order included), so moving
   data around never silently changes the game. Update the fixture on purpose when content changes. */
const G=require('../lib/game.js')(),O=require('../lib/oldgame.js')();
const ser=v=>JSON.stringify(v,(k,x)=>typeof x==='function'?'fn:'+x.toString().replace(/\s+/g,'').replace(/\((\w+)\)=>/g,'$1=>'):x);
const T=['RP_IT','RP_W','RP_SHOP','RP_SHOP2','RP_ITEMS','RP_LOOT','RP_CLS','RP_SK','RP_TAL','RP_ADV','RP_E','RP_ZONE','RP_ST','RP_TT','RP_TW','RP_AFFIX','RP_SETS','RP_MATS','RP_RECIPES','RP_NPC','RP_CHESTS'];
let fails=0;
for(const t of T){if(!(t in G)){console.log('missing in new:',t);fails++;continue}
  let a=G[t],b=O[t];if(t==='RP_IT'){const ka=Object.keys(G.RP_IT_BASE||{}),kb=Object.keys(O.RP_IT_BASE||{});a=ka.map(k=>[k,G.RP_IT[k]]);b=kb.map(k=>[k,O.RP_IT[k]])}
  if(ser(a)!==ser(b)){fails++;const A=ser(a),B=ser(b);let i=0;while(A[i]===B[i])i++;console.log('DIFF',t,'\n new …'+A.slice(Math.max(0,i-80),i+120)+'\n old …'+B.slice(Math.max(0,i-80),i+120))}}
{const a=ser(G.WEAPONS),b=ser(O.WEAPONS||{});if(O.WEAPONS&&a!==b){fails++;console.log('DIFF WEAPONS')}}
console.log(fails?'FAIL':'ok','content tables:',T.length,'checked,',fails,'differ');process.exitCode=fails?1:0;
