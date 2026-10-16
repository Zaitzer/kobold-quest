/* What every villager says, as rules (see core/rules.js). For each NPC the first rule whose `if` holds is used.
   now: happens as they start talking · then: after the last line · ask: choices, each with its own `do`.

   The story is the Pebble Moot (docs/story-pebble-moot.md). Its quest flags:
     moot   0 start · 1 has a pebble · 2 chose at the urn · 3 saw Yarrow · 5 petition (seals from every town)
     vote   'gristle' | 'mumble' | 'snatch' | 'blank' | 'skip'
     seals  how many towns have sealed the petition
     pb     Pebblebrook: 1 deal with Grubb · 2 Grubb beaten · 3 sealed
     ch     Copperhollow: 1 bring miners (miners = 0..4) · 2 Snipe beaten · 3 sealed (lantern)
   It never names real parties or sides; it is about choosing versus not choosing. */
import {value} from '../core/rules.js';

const PIP='Pip';
/* the count, for each way Pip voted: the margin is what the Elder talks about */
const COUNT={
  skip:{say:'Snatchclaw 19, Gristle 16, Mumbletoes 4. Thirty-nine pebbles out of a hundred kobolds. Sixty-one stayed home. Including you, I noticed.',after:'He won by three pebbles. Three.'},
  blank:{say:'Snatchclaw 19, Gristle 16, Mumbletoes 4, and one blank pebble. Forty kobolds came to the urn. Sixty stayed home.',after:'The blank one was yours, I guess. It was counted: everyone saw one kobold come and say "none of you". The sixty at home said nothing at all.'},
  gristle:{say:'Snatchclaw 19, Gristle 17, Mumbletoes 4. Forty kobolds came to the urn. Sixty stayed home.',after:'Your pebble counted. He still won by two. If two of the sixty had bothered...'},
  mumble:{say:'Snatchclaw 19, Gristle 16, Mumbletoes 5. Forty kobolds came to the urn. Sixty stayed home.',after:'Your pebble counted. He still won by three. Three of the sixty at home could have changed everything.'},
  snatch:{say:'Snatchclaw 20, Gristle 16, Mumbletoes 4. Forty kobolds came to the urn. Sixty stayed home.',after:'He won by four. Yours was one of them. Well. The cart rolls where it is shoved.'}};
const RESULT_TAIL=['So Snatchclaw is our Warden. His first order: toll gates on the roads to Thistledown, the coast and the south. 999 gold a kobold. His "accountants" collect it.',
  'There is one old law, older than me, which is saying something. If every town in the land sets its seal on a petition, a new Moot must be held.',
  'Start with Pebblebrook, east along Route 1. The road south from there is tolled now, so you will have to take the long way. Good luck, Pip.'];
const resultRule=v=>({if:{moot:3,vote:v},say:['The pebbles are counted.',COUNT[v].say,COUNT[v].after].concat(RESULT_TAIL),then:{set:{moot:5},toast:'New quest: a seal from every town'}});
/* Yarrow, the mentor: what she says depends on what Pip did at the urn */
const YARROW_OPEN='Ah, Pip. Mumble says it is pebble day. Did you choose?';
const YARROW_SHOVE=['A pebble isn\'t a love letter, Pip. You are not saying "I adore you, Gristle."','It\'s a shove. The cart rolls either way. A pebble only says which ditch you would rather it missed.'];
const YARROW_END=['Now. I have a feeling about tonight\'s count, and my feelings are rarely wrong. Take Wizzle with you. He has never seen the world, and the world should see him. He\'s just outside.'];
const yarrowRule=(v,pip,extra)=>({if:{moot:2,vote:v},now:{set:{moot:3}},say:[YARROW_OPEN,{who:PIP,text:pip}].concat(extra,YARROW_END),then:{toast:'Back to Elder Mumble for the count'}});
/* a miner who needs one good reason to come to the meeting */
const miner=(id,excuse,answer,yes,idle,after)=>({who:null,rules:[
  {if:{ch:1,['m_'+id]:0},say:[excuse,{who:PIP,text:answer},yes],then:{set:{['m_'+id]:1},add:{miners:1},toast:'{miners} of 4 miners will come to the meeting'}},
  {if:{ch:{gte:1}},say:[after]},
  {say:[idle]}]});

const TALK={
  elder:{who:'Elder Mumble',rules:[
    {if:{moot:0},say:['Pip! Big day. The Pebble Moot is today: every kobold in Burrowhome gets one pebble to choose our next Warden.','Here is yours. The three candidates are on the green east of here, and the urn is just below them. Drop your pebble in. Or don\'t. It\'s your pebble.'],then:{set:{moot:1},toast:'Got a voting pebble'}},
    {if:{moot:1},say:['Gristle, Mumbletoes and Snatchclaw are on the green, and the urn is right below them. Choose well, or at least choose.']},
    {if:{moot:2},say:['The counting takes until sundown. Kobolds count slowly; we keep eating the pebbles.','Witch Yarrow sent word that she wants to see you. Over the bridge north, then west into Whisper Woods.']},
    resultRule('skip'),resultRule('blank'),resultRule('gristle'),resultRule('mumble'),resultRule('snatch'),
    {if:{moot:3},say:['The pebbles are counted. Snatchclaw is our Warden, and he has put toll gates on the roads.'].concat(RESULT_TAIL.slice(1)),then:{set:{moot:5},toast:'New quest: a seal from every town'}},
    {if:{moot:5},say:['Seals on the petition: {seals} of 8. Every town has its own reason to sign. Find it, and you\'ll find the seal.']},
    {say:['Burrowhome is waiting, little one.']}]},
  urn:{who:'The Moot urn',rules:[
    {if:{moot:0},say:['The Moot urn. You need a voting pebble from Elder Mumble first. He is by his house, south-west of here.']},
    {if:{moot:1},say:['The Moot urn. Pebbles clink inside.',{who:PIP,text:'A wall-builder, a slowpoke and a smiling bandit-friend.'},{who:PIP,text:'Trash, garbage, or trash wearing a crown. Why bother choosing?'}],
      ask:[{t:'Pebble for Gristle',do:{set:{vote:'gristle',moot:2},toast:'You voted for Gristle'}},{t:'Pebble for Mumbletoes',do:{set:{vote:'mumble',moot:2},toast:'You voted for Mumbletoes'}},
        {t:'Pebble for Snatchclaw',do:{set:{vote:'snatch',moot:2},toast:'You voted for Snatchclaw'}},{t:'A blank pebble: none of you',do:{set:{vote:'blank',moot:2},toast:'You dropped a blank pebble'}},
        {t:'Keep the pebble. Why bother?',do:{set:{vote:'skip',moot:2},toast:'You kept your pebble'}}]},
    {say:['The urn is sealed with wax until the next Moot.']}]},
  gristle:{who:'Gristle',rules:[
    {if:{moot:{lt:2}},say:['GRISTLE FOR WARDEN! I will build a wall around Burrowhome. A big one. With a smaller wall inside it, for emergencies.','Who pays? The mushroom farmers. They have mushrooms. Mushrooms are basically money.']},
    {if:{moot:{lt:3}},say:['Whatever the urn says, the wall is a good idea. Walls are always a good idea. Ask any wall.']},
    {say:['I lost. But I\'m not going anywhere. Next Moot, the wall will be TWICE as big.']}]},
  mumbletoes:{who:'Mumbletoes',rules:[
    {if:{moot:{lt:2}},say:['Oh! Hello. I\'m Mumbletoes. I would like to fix the bridge, and the well, and the school roof...','I made a list. It is very long. I am on page two of reading it. Please be patient, I am very honest.']},
    {if:{moot:{lt:3}},say:['I hope people voted. I hope they voted for me. Mostly the first one. Also the second one.']},
    {if:{seals:{lt:2}},say:['I came last. I think I read my list too slowly.','If you find out what people actually want out there, Pip, could you tell me? I would write it on page one.']},
    {say:['Two seals already! I have been practising reading faster. I am on page three.']}]},
  snatchclaw:{who:'Snatchclaw',rules:[
    {if:{moot:{lt:2}},say:['Friends! Snatchclaw here. Lower taxes! Free mushrooms! A party every night!','How will I pay for it? Ha ha! Next question. Don\'t mind my friends at the back. They are... accountants.']},
    {say:['The pebbles are being counted, little friend. I have a very good feeling. My accountants counted them already.']}]},
  toast:{who:'Toast',rules:[
    {say:['Welcome to the Snoring Snail! A warm bed is 10 gold. It heals everyone and saves your journey.'],
      ask:[{t:'Rest (10 gold)',if:{gold:{gte:10}},do:{gold:-10,heal:true,save:true,toast:'Everyone is rested. Game saved.'}},{t:'No thanks'}]}]},
  biscuit:{who:'Biscuit the trader',rules:[{then:{open:'shop'}}]},
  yarrow:{who:'Witch Yarrow',rules:[
    {if:{moot:{lt:2}},say:['Pebble day, is it? Go and look at your candidates, little Pip. Then come and tell me what you did.']},
    yarrowRule('skip','I kept my pebble. They\'re all trash. Why pick between trash and garbage?',YARROW_SHOVE.concat(['Keeping your pebble doesn\'t stop the cart, Pip. It only means somebody else does the shoving.'])),
    yarrowRule('blank','I dropped a blank one. None of them deserved it.',['Good! A blank pebble is counted. Everyone sees that one kobold came, and said "not good enough".'].concat(YARROW_SHOVE,['Next time, ask yourself which of them would do the least damage. That is also a fine reason to shove.'])),
    yarrowRule('gristle','I picked Gristle. Not because I like walls. The others just seemed worse.',['That is exactly what a pebble is for.'].concat(YARROW_SHOVE)),
    yarrowRule('mumble','I picked Mumbletoes. He\'s slow, but at least he\'s honest.',['That is exactly what a pebble is for.'].concat(YARROW_SHOVE)),
    yarrowRule('snatch','I picked Snatchclaw. Free mushrooms!',YARROW_SHOVE.concat(['Snatchclaw, though? Hmm. Did you ask who his friends at the back were?'])),
    {if:{moot:2},now:{set:{moot:3}},say:[YARROW_OPEN].concat(YARROW_SHOVE,YARROW_END)},
    {say:['A pebble isn\'t a love letter, Pip. It\'s a shove.']}]},
  wizzle:{who:'Wizzle',rules:[
    {if:{moot:{gte:3}},now:{set:{wizzle:1},bag:{ether:2},join:{name:'Wizzle',cls:'mage',min:2,slot:2}},say:['Grandma says I\'m going with you! I packed my staff, two ethers and a sandwich. I ate the sandwich.'],then:{toast:'Wizzle joins the party! +2 ethers'}},
    {say:['Grandma says I can come on an adventure one day. She says that every day.']}]},
  clink:{who:'Clink the smith',rules:[
    {if:{forge:0,smith:1,'mat.spore':{gte:3}},say:['Glow spores! Watch this...','FWOOM. The big forge is lit! Now I can put new bonuses on your gear.'],then:{mat:{spore:-3},set:{forge:1,smith:2},xp:100,toast:'Quest done! +100 XP{up}'}},
    {if:{smith:0},say:['A new face! I forge gear from monster bits: moss from the tall grass, frost shards from the woods, spores from cave critters.','My big forge is cold though. Three glow spores would light it. The critters in the old tunnel south of Copperhollow have them.'],
      ask:[{t:'I\'ll bring spores',do:{set:{smith:1},toast:'New quest: 3 glow spores for Clink'}},{t:'Show me your wares',do:{set:{smith:1},open:'smith'}}]},
    {then:{open:'smith'}}]},
  pebble:{who:'Pebble',rules:[
    {if:{hat:0},say:['Waaah! The wind took my lucky hat into the meadow! It\'s somewhere in the tall grass, east of the bridge road.'],ask:[{t:'I\'ll find it',do:{set:{hat:1},toast:'New quest: find Pebble\'s hat'}},{t:'Sorry, busy'}]},
    {if:{hat:1},say:['Did you find it? It\'s orange and pointy!']},
    {if:{hat:2},now:{set:{hat:3},item:'cap_cone',xp:40},say:['MY HAT! Thank you thank you! Here, take my spare lucky cone. Grandpa says it brings crits.'],then:{toast:'Quest done! +40 XP, Lucky cone{up}'}},
    {say:['When I\'m big I\'m going to vote EVERY time. Twice!','...Mum says only once.']}]},
  quill:{who:'Quill the scribe',rules:[{then:{open:'letter'}}]},
  tikka:{who:'Tikka',rules:[
    {if:{moot:{gte:5}},say:['Snatchclaw\'s toll gates! Toast says the inn is losing all its travellers.','I didn\'t vote, you know. I was busy. Now I\'m busy being annoyed. That\'s worse.']},
    {say:['Pebble day! I\'m not voting. Why would I? They\'re all the same.','Psst, and don\'t tell Biscuit I said so, but his potions taste like pond.']}]},
  nettle:{who:'Granny Nettle',rules:[
    {if:{needles:0},say:['Oh! A visitor. Mumble is out pestering people about the Moot again.','Dearie, could you help an old kobold? I lent my knitting needles to Witch Yarrow, and she never gives anything back.','Her hut is up the forest path, north-west of the bridge.'],
      ask:[{t:'I\'ll fetch them',do:{set:{needles:1},toast:'New quest: Granny Nettle\'s knitting needles'}},{t:'Maybe later'}]},
    {if:{needles:1},say:['They\'ll be somewhere in Yarrow\'s hut, dear. Probably under a pile of toad bits.']},
    {if:{needles:2},now:{set:{needles:3},item:'cl_scarf',xp:60},say:['My needles! And not a single toad bit on them.','Here, I knitted this while I waited. Well, I knitted it with my claws. It\'s a bit lumpy.'],then:{toast:'Quest done! +60 XP, Cozy scarf{up}'}},
    {say:['I have voted at every Moot for ninety years. I have lost most of them. I still go. It annoys the winners.']}]},

  /* Pebblebrook: one pebble */
  turnip:{who:'Farmer Turnip',rules:[
    {if:{moot:{lt:5}},say:['The Pebble Moot? Never voted. My whole family never votes, all five of us. Same old pebbles every time.']},
    {if:{pb:0},say:['A seal for a petition? Ha. Let me tell you about pebbles.','Last spring Pebblebrook voted about the stream: water for the east fields or the west fields. East won by ONE pebble.','My fields are west. My family is five kobolds. We stayed home, because what difference does one pebble make?','And now Snatchclaw\'s toll boss Grubb has padlocked our fountain. Five gold a sip.'],
      ask:[{t:'I\'ll deal with Grubb',do:{set:{pb:1},toast:'New quest: get rid of Grubb'}},{t:'Not yet'}]},
    {if:{pb:1},say:['Grubb is by the fountain. He\'s big, but he\'s mostly belly.']},
    {if:{pb:2},now:{set:{pb:3},add:{seals:1},xp:80,gold:50},say:['The fountain\'s free! Grubb ran off holding his belly.','Here: Pebblebrook\'s seal, on your petition. And Pip? Next Moot, all five of us are coming. Six, if goats count.'],then:{toast:'Seal {seals} of 8: Pebblebrook! +80 XP, +50 gold{up}'}},
    {say:['Water tastes better when nobody charges for it. Copperhollow is up the mountain road, Route 3, if you\'re after more seals.']}]},
  grubb:{who:'Grubb',rules:[
    {if:{pb:0},say:['Five gold a sip! Warden\'s orders. Don\'t like it? Shoulda voted. HAW HAW.']},
    {say:['You again? Five gold a sip, or I sit on you.'],ask:[{t:'Fight!',do:{fight:[['tollboss','scout','slinger'],{boss:'tollboss'}]}},{t:'Back off'}]}]},
  bork:{who:'Bork',rules:[
    {if:{pb:{lt:2}},say:['Bork is visiting cousin Turnip. Bork did not vote either. Bork was napping.','Bork wants to hit the toll man. Bork is waiting for someone else to go first.']},
    {now:{set:{bork:1},join:{name:'Bork',cls:'warrior',min:2}},say:['You hit the toll man! Bork saw. Bork is coming with you.','Also, next Moot, Bork will not nap.'],then:{toast:'Bork joins the party!'}}]},

  /* Copperhollow: nobody comes to the meeting */
  ruddle:{who:'Foreman Ruddle',rules:[
    {if:{moot:{lt:5}},say:['Back to work! The mine doesn\'t dig itself. Well, sometimes it does. That\'s called a cave-in.']},
    {if:{ch:0},say:['A seal? Copperhollow decides things at the town meeting. I\'d say yes, but Snatchclaw\'s tax man Snipe says the seal is his now.','The miners could outvote us both, if any of them came. Nine years I\'ve held that meeting. Nine years, just me and the snacks.','So I decide everything. Everyone complains. Nobody comes.'],
      ask:[{t:'I\'ll bring the miners',do:{set:{ch:1},toast:'New quest: get 4 miners to the meeting'}},{t:'Not now'}]},
    {if:{ch:1,miners:{lt:4}},say:['Miners coming to the meeting: {miners} of 4. Two hang about the square, and two are indoors pretending to work.']},
    {if:{ch:1},say:['Four miners at a meeting! I need to sit down.','...Oh no. Snipe heard about it, and he brought friends.'],ask:[{t:'Fight!',do:{fight:[['collector','thief','gunner'],{boss:'collector',zone:'C'}]}},{t:'Not yet'}]},
    {if:{ch:2},now:{set:{ch:3,lantern:1},add:{seals:1},xp:150,gold:80},say:['The meeting voted, all six of us: Copperhollow\'s seal goes on your petition. First vote in nine years! It was very loud.','And take this lantern. The old tunnel south to Thistledown is pitch black, and Thistledown has a seal too.'],then:{toast:'Seal {seals} of 8: Copperhollow! Got a lantern. +150 XP{up}'}},
    {say:['We\'re having another meeting next week. People are bringing snacks. Plural!']}]},
  snipe:{who:'Snipe',rules:[{say:['Copper tax! Half of everything, for Warden Snatchclaw.','The town meeting? Nobody goes to the meeting. Heh. That\'s the best part.']}]},
  pickett:Object.assign(miner('pickett','Meetings are boring. And Ruddle does whatever he wants anyway.','He does what he wants because nobody comes. If you come, he has to listen to you.','...Huh. Never thought of it like that. Fine, I\'m coming.','Dig, dig, dig. Snipe takes half, I dig twice as much. That\'s maths.','See you at the meeting. I\'ll bring a snack.'),{who:'Pickett'}),
  nugget:Object.assign(miner('nugget','Taxes, seals, petitions... I don\'t understand any of it.','Your pay got cut in half. You understand that. That\'s enough to start.','Oh! Yes. I do understand that. I\'m coming.','I\'m Nugget. I find nuggets. It\'s a family name and a job.','Meeting! I\'m going to a meeting! What do you wear to a meeting?'),{who:'Nugget'}),
  dusty:Object.assign(miner('dusty','I\'m just one miner. One pickaxe never dug a tunnel.','Every tunnel in this mountain was dug one pickaxe at a time.','Hmph. Clever. All right, I\'ll come.','Shh. I\'m on my break. I\'ve been on it since lunch.','One pickaxe at a time. I keep saying that to myself now.'),{who:'Dusty'}),
  shale:Object.assign(miner('shale','Back in my day we went to meetings, and nothing ever changed.','Snipe takes half your copper now. Something changed. Just not the way you wanted.','...Hrrm. I\'ll bring my cane. For shaking at people.','Back in my day, the rocks were harder.','I\'ll be there. Front row. Cane ready.'),{who:'Old Shale'}),

  /* Thistledown: next part of the story */
  herald:{who:'Thistledown herald',rules:[
    {if:{lantern:1},say:['Hear ye! The Thistledown council is quarrelling, as usual. Come back for our seal another day.','(The story continues here in the next update.)']},
    {say:['Hear ye! Welcome to Thistledown, the biggest town in the land. Mind the council; they are quarrelling.']}]}
};
/* the ! and ? over a villager's head */
const MARKERS={
  elder:q=>!q.moot||q.moot===3?'!':'',
  yarrow:q=>q.moot===2?'!':'',wizzle:q=>q.moot>=3?'!':'',
  turnip:q=>q.moot>=5&&!q.pb?'!':q.pb===2?'?':'',grubb:q=>q.pb===1?'!':'',bork:q=>q.pb>=2?'!':'',
  ruddle:q=>q.moot>=5&&!q.ch?'!':(q.ch===1&&q.miners>=4)||q.ch===2?'?':'',
  pickett:q=>q.ch===1&&!q.m_pickett?'!':'',nugget:q=>q.ch===1&&!q.m_nugget?'!':'',dusty:q=>q.ch===1&&!q.m_dusty?'!':'',shale:q=>q.ch===1&&!q.m_shale?'!':'',
  pebble:q=>q.hat===2?'?':'',nettle:q=>q.needles===2?'?':''};
/* The quest log (☰ menu) and the line in the top bar. `show` decides if a line is listed, `done` ticks it. */
const QUEST_LOG=[
  {done:{moot:{gte:2}},text:'The Pebble Moot: hear the candidates, then choose (or don\'t)'},
  {show:{moot:{gte:2}},done:{moot:{gte:3}},text:'Visit Witch Yarrow in Whisper Woods'},
  {show:{moot:{gte:3}},done:{moot:{gte:5}},text:'Hear the count from Elder Mumble'},
  {show:{moot:{gte:5}},text:q=>'The petition: a seal from every town ('+(q.seals||0)+'/8)'},
  {show:{moot:{gte:5}},done:{pb:3},text:'Pebblebrook (Route 1): the fountain'},
  {show:{moot:{gte:5}},done:{ch:3},text:q=>'Copperhollow (Route 3): the town meeting'+(q.ch===1?' ('+Math.min(4,q.miners||0)+'/4 miners)':'')},
  {show:{ch:3},text:'Thistledown: through the old tunnel (Route 8)'},
  {show:{wizzle:0,moot:{gte:3}},hint:true,text:'Wizzle is waiting outside Yarrow\'s hut'},
  {show:{hat:1},text:'Find Pebble\'s lost hat in the meadow grass'},
  {show:{hat:2},text:'Bring the hat back to Pebble'},
  {show:{hat:3},done:{hat:3},text:'Found Pebble\'s hat'},
  {show:{smith:1},text:()=>'Bring Clink 3 glow spores ('+Math.min(3,value('mat.spore'))+'/3)'},
  {show:{smith:2},done:{smith:2},text:'Lit Clink\'s big forge'},
  {show:{needles:1},text:'Find Granny Nettle\'s needles in Witch Yarrow\'s hut'},
  {show:{needles:2},text:'Bring the needles back to Granny Nettle'},
  {show:{needles:3},done:{needles:3},text:'Found Granny Nettle\'s needles'}
];
const QUEST_LINE=[
  {if:{ch:3},text:'Seals {seals}/8 · tunnel to Thistledown'},
  {if:{ch:2},text:'Back to Foreman Ruddle'},
  {if:{ch:1,miners:{gte:4}},text:'Back to Foreman Ruddle'},
  {if:{ch:1},text:'Miners for the meeting {miners}/4'},
  {if:{pb:3},text:'Seals {seals}/8 · Route 3 to Copperhollow'},
  {if:{pb:2},text:'Back to Farmer Turnip'},
  {if:{pb:1},text:'Deal with Grubb at the fountain'},
  {if:{moot:5},text:'Seals {seals}/8 · Route 1 to Pebblebrook'},
  {if:{moot:3},text:'Back to Elder Mumble for the count'},
  {if:{moot:2},text:'Visit Witch Yarrow in the woods'},
  {if:{moot:1},text:'The Pebble Moot · the green'},
  {text:'Talk to Elder Mumble'}
];
export {COUNT,MARKERS,PIP,QUEST_LINE,QUEST_LOG,RESULT_TAIL,TALK,YARROW_END,YARROW_OPEN,YARROW_SHOVE,miner,resultRule,yarrowRule};
