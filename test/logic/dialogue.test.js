/* Parity: villagers, quests and the quest log (now rules in data/dialogue.js) behave exactly like v37's hand-written code,
   over hundreds of random quest states and every choice. */
const G=require('../lib/game.js')(),O=require('../lib/oldgame.js')();
const NPCS=['elder','toast','biscuit','bork','flint','yarrow','wizzle','scout','gorb','vexx','clink','pebble'];
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
const pick=a=>a[Math.floor(rnd()*a.length)];
function setup(X,st){const real=Math.random;let r=11;Math.random=()=>{r=(r*48271)%2147483647;return r/2147483647};
  X.rp.s=X.rpNewState();X.rpApplyWorld();const s=X.rp.s;
  Object.assign(s.q,st.q);s.gold=st.gold;s.bag=Object.assign({},s.bag,st.bag);
  s.party=st.party.map(([n,c,l])=>X.rpMember(n,c,l));if(!s.mats)s.mats={};Object.assign(X.rpMats(),st.mats);
  X.rp.mode='map';X.rp.dlg=null;X.rp.toast=null;X.rp.bt=null;X.rp.lastFight=null;Math.random=real}
function snap(X){const s=JSON.parse(JSON.stringify(X.rp.s));delete s.savedAt;delete s.place;
  return JSON.stringify({s,mode:X.rp.mode,toast:X.rp.toast&&X.rp.toast.t,fight:X.rp.lastFight||null})}
function play(X,id,choice){
  const real=Math.random;let r=7;Math.random=()=>{r=(r*48271)%2147483647;return r/2147483647};
  const log=[];X.rpTalk(id);
  for(let guard=0;guard<20&&X.rp.mode==='dialog';guard++){const d=X.rp.dlg;log.push(d.lines[d.i].who+': '+d.lines[d.i].text);
    if(d.i<d.lines.length-1||!d.choices)X.rpDlgNext();
    else{log.push('choices: '+d.choices.map(c=>c.t+(c.ok&&!c.ok()?'(x)':'')).join(' / '));const c=d.choices[choice];
      if(!c||(c.ok&&!c.ok())){log.push('(no pick)');break}X.rpChoose(choice)}}
  Math.random=real;return log.join('\n')+'\n=> '+snap(X)}
// fights started by a choice: record instead of starting a battle
for(const X of [G,O]){}
let n=0,fails=0;
const origFight={G:G.rpFight,O:O.rpFight};
for(let t=0;t<400;t++){
  const st={q:{q1:pick([0,1,1,2]),kills:pick([0,3,5,6]),q2:pick([0,1,1,2,2]),glow:pick([0,2,3,4]),wizzle:pick([0,0,1]),gorb:pick([0,0,1]),vexx:pick([0,0,1]),gate:pick([0,1]),key:pick([0,1]),
      bork:pick([0,1]),hat:pick([0,1,2,3]),smith:pick([0,1,2]),forge:pick([0,0,1])},gold:pick([0,9,10,39,40,120]),bag:{ether:pick([0,1])},
    party:[['Pip','warrior',pick([1,4,9])]].concat(pick([[],[['Bork','warrior',3]],[['Bork','warrior',3],['Wizzle','mage',5]]])),mats:{spore:pick([0,2,3,5])}};
  for(const X of [G,O]){setup(X,st)}
  const ql=[G.rpQuestLine(),O.rpQuestLine()],qq=[G.rpQuestList(),O.rpQuestList()];
  if(ql[0]!==ql[1]||qq[0]!==qq[1]){fails++;if(fails<4)console.log('QUEST LOG differs',JSON.stringify(st.q),'\nnew:',ql[0],qq[0],'\nold:',ql[1],qq[1])}
  for(const id of NPCS)for(const ch of [0,1]){
    setup(G,st);const a=play(G,id,ch);setup(O,st);const b=play(O,id,ch);n++;
    if(a!==b){fails++;if(fails<6)console.log('DIFF',id,'choice',ch,JSON.stringify(st),'\n--- new\n'+a.slice(0,900)+'\n--- old\n'+b.slice(0,900))}}}
console.log(fails?'FAIL':'ok','dialogue parity:',n,'talks,',fails,'differences');process.exitCode=fails?1:0;
