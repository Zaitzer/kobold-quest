/* Campfire chats: won fights bond the party, the inn offers a chat once a pair has travelled together, each plays once,
   and chats need both kobolds in the party. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const fresh=()=>{G.rp.s=G.rpNewState();Object.assign(G.rp.s.q,{intro:1,cls:1,moot:5});G.rpApplyWorld();G.rp.mode='map';G.rp.dlg=null};
const choices=()=>{const d=G.rp.dlg;return d&&d.choices?d.choices.map(c=>c.t):[]};
const atInn=()=>{G.rp.dlg=null;G.rp.mode='map';G.rpTalk('toast');while(G.rp.dlg&&G.rp.dlg.i<G.rp.dlg.lines.length-1)G.rpDlgNext();return choices()};
const win=()=>G.emit('battle:won',{});
// data: every chat names two real party members, and no chat is too long for a phone
const known=new Set(['Pip','Wizzle','Bork','Fennel','Nugget','Brass','Saffi','Cinder','Pell','Mist','Gull','Tikka']);
for(const B of G.BANTER){if(!known.has(B.a)||!known.has(B.b))bad(B.id+' names someone unknown');
  for(const l of B.lines){if(l.who!==B.a&&l.who!==B.b)bad(B.id+' has a line from '+l.who);if(l.text.length>140)bad(B.id+' line too long')}}
// bonding and the inn
fresh();const s=G.rp.s;s.party=[G.rpMember('Pip','warrior',3),G.rpMember('Wizzle','mage',3),G.rpMember('Bork','warrior',3)];
if(atInn().includes('Sit by the fire'))bad('fire offered before any travelling together');
win();win();if(atInn().includes('Sit by the fire'))bad('fire offered after two fights');
win();if(!atInn().includes('Sit by the fire'))bad('no fire after three fights together');
if(s.bond[G.bondKey('Bork','Wizzle')]!==3)bad('bond count '+JSON.stringify(s.bond));
G.rp.dlg=null;G.rpFireside();const d=G.rp.dlg;
if(!d||!d.lines.some(l=>l.who==='Bork')||!d.lines.some(l=>l.who==='Wizzle'))bad('the chat did not play');
if(!(s.banter||[]).includes('bork_wizzle'))bad('the chat was not remembered');
// pip_wizzle waits for Pebblebrook's spark
if(G.rpBanterNext()&&G.rpBanterNext().id==='pip_wizzle')bad('pip_wizzle before the Pebblebrook spark');
s.q.pb=3;if(!G.rpBanterNext()||G.rpBanterNext().id!=='pip_wizzle')bad('pip_wizzle not offered after the spark');
// nobody chats with someone waiting at the inn
fresh();const t=G.rp.s;t.party=[G.rpMember('Pip','warrior',3),G.rpMember('Fennel','cleric',3)];t.roster=[G.rpMember('Nugget','warrior',3)];
t.bond={[G.bondKey('Fennel','Nugget')]:9};if(G.rpBanterNext())bad('a chat with someone at the inn');
console.log((fails?'FAIL':'ok')+' banter: '+G.BANTER.length+' chats, bonding, the inn, one play each');process.exitCode=fails?1:0;
