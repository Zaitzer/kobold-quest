/* v6 character sheet (build step 7): a kobold built the way a player would build it matches the design's model, class by class. */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};
const G=require('../lib/game.js')(),M=require('../../tools/balance-model.js');
// the fighter is the reference fighter, at every level
let worst=0;for(let L=1;L<=30;L++){const s=G.v6Stats(G.v6Kobold('T','fighter',L)),r=M.ref(L);for(const [a,b,w] of [[s.hp,r.hp,'hp'],[s.atk,r.atk,'atk'],[s.def,r.def,'def']]){checks++;const g=Math.abs(a/b-1);worst=Math.max(worst,g);if(g>0.02)bad('fighter L'+L+' '+w+' '+a.toFixed(1)+' vs model '+b.toFixed(1))}}
// every class: its HP and defence are the class table's multipliers on the fighter (scores and passives aside), its sheet is complete
for(const c of Object.keys(G.CLASSES6)){const k=G.v6Kobold('T',c,10),s=G.v6Stats(k);checks++;
  for(const f of ['hp','mp','atk','spa','def','sd','move','acc','dodge','res','init','threat','crit','steady'])if(typeof s[f]!=='number'||!isFinite(s[f]))bad(c+': '+f+' is '+s[f]);
  if(!k.skills.length)bad(c+' has no skills');if(k.skills.length>4)bad(c+' has more than four equipped');
  const ratio=s.hp/G.v6Stats(G.v6Kobold('T','fighter',10)).hp,C=G.CLASSES6[c];if(Math.abs(ratio/C.hp-1)>0.12)bad(c+' HP ratio '+ratio.toFixed(2)+' vs table '+C.hp)}
// the monk: Balance 100% at the start, and its ki multiplier is 0.5 + Balance
{const s=G.v6Stats(G.v6Kobold('T','monk',1));checks++;if(Math.abs(s.balance-1)>1e-9||Math.abs(s.kiMul-1.5)>1e-9)bad('monk Balance '+s.balance+' ki '+s.kiMul)}
// point buy (balance.md §3): the standard array costs exactly 27; Begin only once no point can be spent; a fighter who buys STR 8 misses more
{const A=G.v6StartScores('fighter');checks+=6;if(G.v6BuyCost(A)!==27||!G.v6BuyDone(A))bad('the standard array is 27 points, all spent: '+G.v6BuyCost(A));
  const E={STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8};if(G.v6BuyLeft(E)!==27||G.v6BuyDone(E))bad('all 8s: 27 left, not done');
  if(G.v6BuyDone({STR:15,DEX:15,CON:15,INT:16,WIS:8,CHA:8}))bad('16 cannot be bought');if(!G.v6BuyDone({STR:15,DEX:15,CON:15,INT:8,WIS:8,CHA:8}))bad('15, 15, 15, 8, 8, 8 is 27');
  if(G.v6BuyDone(G.v6StartScores('monk')))bad('the monk\'s 12 ×6 leaves 3 points to spend');
  const low=G.v6Stats(G.v6Kobold('T','fighter',1,{scores:{STR:8,DEX:15,CON:14,INT:13,WIS:12,CHA:10}})),std=G.v6Stats(G.v6Kobold('T','fighter',1));if(!(std.acc-low.acc>=7))bad('STR 8 should cost the fighter 7.5 accuracy: '+std.acc+' vs '+low.acc)}
// quick and heavy weapons, steadiness by family
{const r=G.v6Stats(G.v6Kobold('T','ranger',5)),b=G.v6Stats(G.v6Kobold('T','barbarian',5)),w=G.v6Stats(G.v6Kobold('T','wizard',5));checks+=3;
  if(!r.quick||r.steady!==5)bad('ranger at T2: quick, steadiness 5 (reed bow), got '+r.quick+' '+r.steady);if(!b.heavy)bad('barbarian axes are heavy');if(!w.magic||w.steady!==3)bad('wizard wands: magic, steadiness 3')}
console.log(fails?fails+' failures':'v6 sheet: '+checks+' checks; the fighter matches the model within '+(worst*100).toFixed(1)+'% at every level');process.exitCode=fails?1:0;
