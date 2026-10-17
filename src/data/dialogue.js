/* What every villager says, as rules (see core/rules.js). For each NPC the first rule whose `if` holds is used.
   now: happens as they start talking · then: after the last line · ask: choices, each with its own `do`.

   The story is the Hatching (docs/story-hatching.md). Once a generation Burrowhome hatches a guardian: three eggs sit in
   the Great Nest and every kobold warms the one they want with an ember. Pip thinks they're all ugly and keeps his,
   like most of the village; Snatchclaw's bandits warm the shiny one all night, and out comes greedy Glitterbeak.
   To hatch again, Pip needs a spark from every town's hearth. Its quest flags (internal names kept from the first draft):
     moot   0 start · 1 has an ember · 2 chose at the nest · 3 saw Yarrow · 5 gathering sparks
     vote   'spiky' | 'sleepy' | 'shiny' | 'skip'
     seals  sparks gathered (one per town)
     pb     Pebblebrook: 1 deal with Grubb · 2 Grubb beaten · 3 spark given
     ch     Copperhollow: 1 bring miners (miners = 0..4) · 2 Snipe beaten · 3 spark given (lantern)
   The lesson stays inside the fairy tale: not choosing still lets someone choose for you. */
import {value} from '../core/rules.js';

const PIP='Pip';
/* what the Elder says about the hatching, for each thing Pip did at the nest */
const HATCHED={
  skip:'Most of the village kept their embers, like you. "They\'re all ugly," they said. Only a handful of eggs got warmed at all.',
  spiky:'Your ember went to the spiky egg. A few others did the same. Not many. Most of the village kept their embers at home.',
  sleepy:'Your ember went to the sleepy egg. A few others did the same. Not many. Most of the village kept their embers at home.',
  shiny:'Your ember went to the shiny egg. So did a few others. Not many. Most of the village kept their embers at home.'};
const RESULT_TAIL=['But somebody sat by the shiny egg all night with a whole sack of embers. Snatchclaw\'s bandits.','At dawn it hatched. Meet our guardian: Glitterbeak. He is small, greedy and loves anything shiny, and the bandits feed him.',
  'They\'ve put toll gates on the roads to Thistledown, the coast and the south. One shiny thing per kobold, for Glitterbeak\'s hoard.',
  'There is an old rhyme: if a guardian hatches wrong, bring a spark from every town\'s hearth, light the Great Nest, and hatch again.',
  'Start with Pebblebrook, east along Route 1. The road south from there is gated now, so you\'ll have to take the long way. Good luck, Pip.'];
const resultRule=v=>({if:{moot:3,vote:v},say:['The hatching is over, Pip. Sit down.',HATCHED[v]].concat(RESULT_TAIL),then:{set:{moot:5},toast:'New quest: a spark from every town'}});
/* Yarrow, the mentor: what she says depends on what Pip did at the nest */
const YARROW_OPEN='Ah, Pip. Hatching day! Did you warm an egg?';
const YARROW_NUDGE=['An ember isn\'t a promise to love the egg forever, Pip. You aren\'t saying "this egg is perfect".','It\'s a nudge. One of those eggs will hatch whatever you do. An ember only says which one you\'d rather it was.'];
const YARROW_END=['Now. I have a feeling about that nest, and my feelings are rarely wrong. Take Wizzle with you. He has never seen the world, and the world should see him. He\'s just outside.'];
const yarrowRule=(v,pip,extra)=>({if:{moot:2,vote:v},now:{set:{moot:3}},say:[YARROW_OPEN,{who:PIP,text:pip}].concat(extra,YARROW_END),then:{toast:'Back to Elder Mumble'}});
/* a miner who needs one good reason to come to the shift circle */
const miner=(id,excuse,answer,yes,idle,after)=>({who:null,rules:[
  {if:{ch:1,['m_'+id]:0},say:[excuse,{who:PIP,text:answer},yes],then:{set:{['m_'+id]:1},add:{miners:1},toast:'{miners} of 4 miners will come to the circle'}},
  {if:{ch:{gte:1}},say:[after]},
  {say:[idle]}]});

/* every innkeeper: a bed, and the roster (who travels with Pip, who waits at the inn) */
const hasBench=s=>(s.roster||[]).length>0||s.party.length>1;
const inn=hello=>({say:[hello],ask:[{t:'Rest (10 gold)',if:{gold:{gte:10}},do:{gold:-10,heal:true,save:true,toast:'Everyone is rested. Game saved.'}},
  {t:'Change who comes along',if:hasBench,do:{open:'roster'}},{t:'No thanks'}]});
const TALK={
  elder:{who:'Elder Mumble',rules:[
    {if:{moot:0},say:['Pip! Big day. It\'s hatching day: once in a lifetime Burrowhome hatches a new guardian.','Three eggs sit in the Great Nest on the green, east of here. Everyone warms the one they like best with an ember, and the warmest one hatches.','Here is your ember. Warm whichever egg you like. Or don\'t. It\'s your ember.'],then:{set:{moot:1},toast:'Got an ember'}},
    {if:{moot:1},say:['The Great Nest is on the green, east of here. Three eggs. Pick one, or at least have a look.']},
    {if:{moot:2},say:['The eggs need until dawn. Nobody sleeps much on hatching night.','Witch Yarrow sent word that she wants to see you. Over the bridge north, then west into Whisper Woods.']},
    resultRule('skip'),resultRule('spiky'),resultRule('sleepy'),resultRule('shiny'),
    {if:{moot:3},say:['The hatching is over, Pip. Sit down.'].concat(RESULT_TAIL),then:{set:{moot:5},toast:'New quest: a spark from every town'}},
    {if:{moot:5},say:['Sparks for the Great Nest: {seals} of 8. Every town has its own trouble. Help with it, and they\'ll give you a spark from their hearth.']},
    {say:['Burrowhome is waiting, little one.']}]},
  urn:{who:'The Great Nest',rules:[
    {if:{moot:0},say:['The Great Nest, with three big eggs in it. You need an ember from Elder Mumble first. He is by his house, south-west of here.']},
    {if:{moot:1},say:['Three eggs sit in the straw. A spiky one that hisses at you. A sleepy one that snores. And a shiny one, very shiny, a bit too shiny.',{who:PIP,text:'A biter, a sleeper and a show-off.'},{who:PIP,text:'They\'re all ugly. Why bother picking one?'}],
      ask:[{t:'Warm the spiky egg',do:{set:{vote:'spiky',moot:2},toast:'You warmed the spiky egg'}},{t:'Warm the sleepy egg',do:{set:{vote:'sleepy',moot:2},toast:'You warmed the sleepy egg'}},
        {t:'Warm the shiny egg',do:{set:{vote:'shiny',moot:2},toast:'You warmed the shiny egg'}},{t:'Keep the ember. Why bother?',do:{set:{vote:'skip',moot:2},toast:'You kept your ember'}}]},
    {if:{moot:{lt:5}},say:['The eggs are hatching. Shells crack. Somebody is giggling behind the nest.']},
    {say:['An empty nest, full of eggshell. It needs a spark from every town\'s hearth to light it again.']}]},
  toast:{who:'Toast',rules:[inn('Welcome to the Snoring Snail! A warm bed is 10 gold. It heals everyone and saves your journey.')]},
  keeperA:{who:'Lodge keeper Moss',rules:[inn('Welcome to the Pebblebrook lodge! Beds are 10 gold, and the hay is nearly fresh.')]},
  keeperE:{who:'Lodge keeper Flint',rules:[inn('The Copperhollow lodge. 10 gold a bed. Please knock the rocks out of your boots first.')]},
  biscuit:{who:'Biscuit the trader',rules:[{then:{open:'shop'}}]},
  yarrow:{who:'Witch Yarrow',rules:[
    {if:{moot:{lt:2}},say:['Hatching day, is it? Go and have a look at those eggs, little Pip. Then come and tell me what you did.']},
    yarrowRule('skip','I kept my ember. They\'re all ugly. Why pick between ugly and uglier?',YARROW_NUDGE.concat(['Keeping your ember doesn\'t stop the hatching, Pip. It only means somebody else does the warming.'])),
    yarrowRule('spiky','I warmed the spiky one. Not because I like biting. The others just seemed worse.',['That is exactly what an ember is for.'].concat(YARROW_NUDGE)),
    yarrowRule('sleepy','I warmed the sleepy one. Slow, but at least it won\'t bite anyone.',['That is exactly what an ember is for.'].concat(YARROW_NUDGE)),
    yarrowRule('shiny','I warmed the shiny one. It was so shiny!',YARROW_NUDGE.concat(['The shiny one, though? Hmm. Did you notice who was giggling behind the nest?'])),
    {if:{moot:2},now:{set:{moot:3}},say:[YARROW_OPEN].concat(YARROW_NUDGE,YARROW_END)},
    {say:['An ember is a nudge, Pip, not a promise.']}]},
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
    {say:['When I\'m big I\'m going to warm an egg EVERY hatching. With two embers!','...Mum says only one.']}]},
  quill:{who:'Quill the scribe',rules:[{then:{open:'letter'}}]},
  tikka:{who:'Tikka',rules:[
    {if:{moot:{gte:5}},say:['Toll gates! Toast says the inn is losing all its travellers.','I didn\'t warm an egg, you know. I was busy. Now I\'m busy being annoyed. That\'s worse.']},
    {say:['Hatching day! I\'m not bringing my ember. They\'re all just eggs.','Psst, and don\'t tell Biscuit I said so, but his potions taste like pond.']}]},
  nettle:{who:'Granny Nettle',rules:[
    {if:{needles:0},say:['Oh! A visitor. Mumble is out pestering people about the eggs again.','Dearie, could you help an old kobold? I lent my knitting needles to Witch Yarrow, and she never gives anything back.','Her hut is up the forest path, north-west of the bridge.'],
      ask:[{t:'I\'ll fetch them',do:{set:{needles:1},toast:'New quest: Granny Nettle\'s knitting needles'}},{t:'Maybe later'}]},
    {if:{needles:1},say:['They\'ll be somewhere in Yarrow\'s hut, dear. Probably under a pile of toad bits.']},
    {if:{needles:2},now:{set:{needles:3},item:'cl_scarf',xp:60},say:['My needles! And not a single toad bit on them.','Here, I knitted this while I waited. Well, I knitted it with my claws. It\'s a bit lumpy.'],then:{toast:'Quest done! +60 XP, Cozy scarf{up}'}},
    {say:['I have warmed an egg at every hatching for ninety years. My egg hardly ever wins. I still go. It annoys the others.']}]},

  /* Pebblebrook: one pebble */
  turnip:{who:'Farmer Turnip',rules:[
    {if:{moot:{lt:5}},say:['Hatching in Burrowhome? Never been. My whole family never goes to anything, all five of us.']},
    {if:{pb:0},say:['A spark from our hearth? Ha. Let me tell you about stones.','Last spring the stream split, and we all built a dam with stones to send it east or west. Every kobold brings one stone. East won by ONE stone.','My fields are west. My family is five kobolds. We stayed home, because what difference does one stone make?','And now a bandit called Grubb has padlocked our fountain. One shiny thing a sip, for Glitterbeak.'],
      ask:[{t:'I\'ll deal with Grubb',do:{set:{pb:1},toast:'New quest: get rid of Grubb'}},{t:'Not yet'}]},
    {if:{pb:1},say:['Grubb is by the fountain. He\'s big, but he\'s mostly belly.']},
    {if:{pb:2},now:{set:{pb:3},add:{seals:1},xp:80,gold:50},say:['The fountain\'s free! Grubb ran off holding his belly.','Here: a spark from Pebblebrook\'s hearth, in a jar. And Pip? Next time there\'s a dam, all five of us bring a stone. Six, if the goat counts.'],then:{toast:'Spark {seals} of 8: Pebblebrook! +80 XP, +50 gold{up}'}},
    {say:['Water tastes better when nobody charges for it. Copperhollow is up the mountain road, Route 3, if you\'re after more sparks.']}]},
  grubb:{who:'Grubb',rules:[
    {if:{pb:0},say:['One shiny thing a sip! For Glitterbeak\'s hoard. Don\'t like it? Shoulda warmed a different egg. HAW HAW.']},
    {say:['You again? One shiny thing a sip, or I sit on you.'],ask:[{t:'Fight!',do:{fight:[['tollboss','scout','slinger'],{boss:'tollboss'}]}},{t:'Back off'}]}]},
  bork:{who:'Bork',rules:[
    {if:{pb:{lt:2}},say:['Bork is visiting cousin Turnip. Bork did not warm an egg either. Bork was napping.','Bork wants to hit the toll man. Bork is waiting for someone else to go first.']},
    {now:{set:{bork:1},join:{name:'Bork',cls:'warrior',min:2}},say:['You hit the toll man! Bork saw. Bork is coming with you.','Also, next hatching, Bork will not nap.'],then:{toast:'Bork joins the party!'}}]},

  /* Copperhollow: nobody comes to the meeting */
  ruddle:{who:'Foreman Ruddle',rules:[
    {if:{moot:{lt:5}},say:['Back to work! The mine doesn\'t dig itself. Well, sometimes it does. That\'s called a cave-in.']},
    {if:{ch:0},say:['A spark from our hearth? Copperhollow decides things in the shift circle. But a bandit called Snipe sits by the hearth now and takes half our copper for Glitterbeak.','The miners could tell him to clear off, if any of them came to the circle. Nine years I\'ve held that circle. Nine years, just me and the snacks.','So I decide everything. Everyone complains. Nobody comes.'],
      ask:[{t:'I\'ll bring the miners',do:{set:{ch:1},toast:'New quest: get 4 miners to the shift circle'}},{t:'Not now'}]},
    {if:{ch:1,miners:{lt:4}},say:['Miners coming to the circle: {miners} of 4. Two hang about the square, and two are indoors pretending to work.']},
    {if:{ch:1},say:['Four miners in the circle! I need to sit down.','...Oh no. Snipe heard about it, and he brought friends.'],ask:[{t:'Fight!',do:{fight:[['collector','thief','gunner'],{boss:'collector',zone:'C'}]}},{t:'Not yet'}]},
    {if:{ch:2},now:{set:{ch:3,lantern:1},add:{seals:1},xp:150,gold:80},say:['The circle agreed, all six of us: a spark from our hearth for the Great Nest. First thing we\'ve agreed on in nine years! It was very loud.','And take this lantern. The old tunnel south to Thistledown is pitch black, and Thistledown has a hearth too.'],then:{toast:'Spark {seals} of 8: Copperhollow! Got a lantern. +150 XP{up}'}},
    {say:['We\'re having another circle next week. People are bringing snacks. Plural!']}]},
  snipe:{who:'Snipe',rules:[{say:['Half your copper, for Glitterbeak\'s hoard! Shiny, shiny.','The shift circle? Nobody goes to the circle. Heh. That\'s the best part.']}]},
  pickett:Object.assign(miner('pickett','The circle is boring. And Ruddle does whatever he wants anyway.','He does what he wants because nobody comes. If you come, he has to listen to you.','...Huh. Never thought of it like that. Fine, I\'m coming.','Dig, dig, dig. Snipe takes half, I dig twice as much. That\'s maths.','See you at the circle. I\'ll bring a snack.'),{who:'Pickett'}),
  nugget:Object.assign(miner('nugget','Sparks, nests, hatchings... I don\'t understand any of it.','Your copper got cut in half. You understand that. That\'s enough to start.','Oh! Yes. I do understand that. I\'m coming.','I\'m Nugget. I find nuggets. It\'s a family name and a job.','The circle! I\'m going to the circle! What do you wear to a circle?'),{who:'Nugget'}),
  dusty:Object.assign(miner('dusty','I\'m just one miner. One pickaxe never dug a tunnel.','Every tunnel in this mountain was dug one pickaxe at a time.','Hmph. Clever. All right, I\'ll come.','Shh. I\'m on my break. I\'ve been on it since lunch.','One pickaxe at a time. I keep saying that to myself now.'),{who:'Dusty'}),
  shale:Object.assign(miner('shale','Back in my day we went to the circle, and nothing ever changed.','Snipe takes half your copper now. Something changed. Just not the way you wanted.','...Hrrm. I\'ll bring my cane. For shaking at people.','Back in my day, the rocks were harder.','I\'ll be there. Front row. Cane ready.'),{who:'Old Shale'}),

  /* recruits */
  fennel:{who:'Fennel',rules:[
    {if:{fennel:0,moot:{lt:5}},say:['Shh! I\'m listening to the carrots. They say it\'s going to rain.']},
    {if:{fennel:0},say:['Oh, a traveller! Have you seen a goat? Grey, grumpy, eats hats? Her name is Parsnip.','She ran off down Route 1 when Grubb padlocked the fountain. She hates padlocks. And hats.'],
      ask:[{t:'I\'ll find Parsnip',do:{set:{fennel:1},toast:'New quest: find Fennel\'s goat on Route 1'}},{t:'Not now'}]},
    {if:{fennel:1},say:['Parsnip is somewhere along Route 1. Look behind the trees; she sulks where nobody looks.']},
    {if:{fennel:2},now:{set:{fennel:3},join:{name:'Fennel',cls:'cleric',min:2}},say:['Parsnip! You found her! She ate your hat? She does that.','Let me come with you. I heal kobolds the way I heal carrots: patience, and a little shouting.'],
      then:{toast:'Fennel joins! (If the party is full she waits at the inn.)'}},
    {say:['The carrots say hello. Well, they say "rain". But warmly.']}]},
  parsnip:{who:'Parsnip',rules:[{say:['BAAAH.',{who:PIP,text:'You must be Parsnip. Fennel misses you.'},'Parsnip eats a flower, glares at you, and trots off towards Pebblebrook.'],then:{set:{fennel:2},toast:'Parsnip is on her way home. Tell Fennel!'}}]},

  /* Thistledown: next part of the story */
  herald:{who:'Thistledown herald',rules:[
    {if:{lantern:1},say:['Hear ye! A spark from the Thistledown hearth? The council is quarrelling about who holds the jar. Come back another day.','(The story continues here in the next update.)']},
    {say:['Hear ye! Welcome to Thistledown, the biggest town in the land. Mind the council; they are quarrelling.']}]}
};
/* Nugget joins once the shift circle has met */
TALK.nugget.rules.unshift({if:{ch:{gte:3},nugget:0},now:{set:{nugget:1},join:{name:'Nugget',cls:'warrior',min:2}},
  say:['The circle worked! I\'m a circle person now.','Can I come with you? I\'m good at finding things. Mostly nuggets. But other things too, probably.'],then:{toast:'Nugget joins! (If the party is full he waits at the inn.)'}});
/* the ! and ? over a villager's head */
const MARKERS={
  elder:q=>!q.moot||q.moot===3?'!':'',
  yarrow:q=>q.moot===2?'!':'',wizzle:q=>q.moot>=3?'!':'',
  turnip:q=>q.moot>=5&&!q.pb?'!':q.pb===2?'?':'',grubb:q=>q.pb===1?'!':'',bork:q=>q.pb>=2?'!':'',
  ruddle:q=>q.moot>=5&&!q.ch?'!':(q.ch===1&&q.miners>=4)||q.ch===2?'?':'',
  pickett:q=>q.ch===1&&!q.m_pickett?'!':'',dusty:q=>q.ch===1&&!q.m_dusty?'!':'',shale:q=>q.ch===1&&!q.m_shale?'!':'',
  fennel:q=>q.moot>=5&&!q.fennel?'!':q.fennel===2?'?':'',nugget:q=>(q.ch===1&&!q.m_nugget)||(q.ch>=3&&!q.nugget)?'!':'',
  pebble:q=>q.hat===2?'?':'',nettle:q=>q.needles===2?'?':''};
/* The quest log (☰ menu) and the line in the top bar. `show` decides if a line is listed, `done` ticks it. */
const QUEST_LOG=[
  {done:{moot:{gte:2}},text:'Hatching day: warm an egg in the Great Nest (or don\'t)'},
  {show:{moot:{gte:2}},done:{moot:{gte:3}},text:'Visit Witch Yarrow in Whisper Woods'},
  {show:{moot:{gte:3}},done:{moot:{gte:5}},text:'Back to Elder Mumble'},
  {show:{moot:{gte:5}},text:q=>'A spark from every town\'s hearth ('+(q.seals||0)+'/8)'},
  {show:{moot:{gte:5}},done:{pb:3},text:'Pebblebrook (Route 1): the fountain'},
  {show:{moot:{gte:5}},done:{ch:3},text:q=>'Copperhollow (Route 3): the shift circle'+(q.ch===1?' ('+Math.min(4,q.miners||0)+'/4 miners)':'')},
  {show:{ch:3},text:'Thistledown: through the old tunnel (Route 8)'},
  {show:{wizzle:0,moot:{gte:3}},hint:true,text:'Wizzle is waiting outside Yarrow\'s hut'},
  {show:{fennel:1},text:'Find Fennel\'s goat Parsnip on Route 1'},{show:{fennel:2},text:'Tell Fennel that Parsnip is home'},{show:{fennel:3},done:{fennel:3},text:'Fennel joined'},
  {show:{ch:{gte:3},nugget:0},hint:true,text:'Nugget in Copperhollow wants to come along'},
  {show:s=>(s.roster||[]).length>0,hint:true,text:'Innkeepers can change who comes along'},
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
  {if:{ch:3},text:'Sparks {seals}/8 · tunnel to Thistledown'},
  {if:{ch:2},text:'Back to Foreman Ruddle'},
  {if:{ch:1,miners:{gte:4}},text:'Back to Foreman Ruddle'},
  {if:{ch:1},text:'Miners for the circle {miners}/4'},
  {if:{pb:3},text:'Sparks {seals}/8 · Route 3 to Copperhollow'},
  {if:{pb:2},text:'Back to Farmer Turnip'},
  {if:{pb:1},text:'Deal with Grubb at the fountain'},
  {if:{moot:5},text:'Sparks {seals}/8 · Route 1 to Pebblebrook'},
  {if:{moot:3},text:'Back to Elder Mumble'},
  {if:{moot:2},text:'Visit Witch Yarrow in the woods'},
  {if:{moot:1},text:'Hatching day · the Great Nest'},
  {text:'Talk to Elder Mumble'}
];
export {HATCHED,MARKERS,PIP,QUEST_LINE,QUEST_LOG,RESULT_TAIL,TALK,YARROW_END,YARROW_NUDGE,YARROW_OPEN,hasBench,inn,miner,resultRule,yarrowRule};
