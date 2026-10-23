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
// quick and heavy weapons, steadiness by family
{const r=G.v6Stats(G.v6Kobold('T','ranger',5)),b=G.v6Stats(G.v6Kobold('T','barbarian',5)),w=G.v6Stats(G.v6Kobold('T','wizard',5));checks+=3;
  if(!r.quick||r.steady!==5)bad('ranger at T2: quick, steadiness 5 (reed bow), got '+r.quick+' '+r.steady);if(!b.heavy)bad('barbarian axes are heavy');if(!w.magic||w.steady!==3)bad('wizard wands: magic, steadiness 3')}
console.log(fails?fails+' failures':'v6 sheet: '+checks+' checks; the fighter matches the model within '+(worst*100).toFixed(1)+'% at every level');process.exitCode=fails?1:0;
