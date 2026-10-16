/* What every villager says, as rules (see core/rules.js). For each NPC the first rule whose `if` holds is used.
   now: happens as they start talking · then: after the last line · ask: choices, each with its own `do`. */
import {value} from '../core/rules.js';

const TALK={
  elder:{who:'Elder Mumble',rules:[
    {if:{q1:0},say:['Ah, young Pip. Bandits from the Mossback clan have taken over the meadow east of the village.','Knock out five of them and Guard Flint will let you cross the bridge north. The world is bigger than Burrowhome, you know.'],
      ask:[{t:'I will do it!',do:{set:{q1:1},toast:'New quest: clear the meadow bandits'}},{t:'Maybe later'}]},
    {if:{q1:1,kills:{lt:5}},say:['Bandits knocked out: {kills} of 5. The tall grass east of here is where they lurk.']},
    {if:{q1:1},now:{set:{q1:2},gold:60},say:['Five bandits! You are braver than your grandmother, and she bit a bear.','Here are 60 gold. Flint will let you over the bridge now. They say a witch in the woods knows the way to the old hoard.'],then:{toast:'Quest done! +60 gold'}},
    {if:{vexx:1},say:['The hoard is ours again! Burrowhome will sing about you for a hundred years.']},
    {say:['King Vexx sits on the stolen hoard in the north. Be careful, little one.']}]},
  toast:{who:'Toast',rules:[
    {say:['Welcome to the Snoring Snail! A warm bed is 10 gold. It heals everyone and saves your journey.'],
      ask:[{t:'Rest (10 gold)',if:{gold:{gte:10}},do:{gold:-10,heal:true,save:true,toast:'Everyone is rested. Game saved.'}},{t:'No thanks'}]}]},
  biscuit:{who:'Biscuit the trader',rules:[{then:{open:'shop'}}]},
  bork:{who:'Bork',rules:[
    {say:['Bork. Bork hits things with bone. Bork hits YOUR enemies with bone, for 40 gold.'],
      ask:[{t:'Hire Bork (40 gold)',if:{gold:{gte:40},party:{lt:3}},do:{gold:-40,set:{bork:1},join:{name:'Bork',cls:'warrior',min:1},toast:'Bork joins the party!'}},{t:'Not now'}]}]},
  flint:{who:'Guard Flint',rules:[
    {if:{q1:{gte:2}},say:['Off you go! Stay on the road if you want to keep your tail.']},
    {say:['Nobody crosses until the meadow bandits are dealt with. Elder\'s orders.']}]},
  yarrow:{who:'Witch Yarrow',rules:[
    {if:{q2:0},say:['A kobold from the village! How brave, how damp.','The way to the Dragon\'s Hoard is locked, and Chief Gorb of the Mushroom Cave carries the key.','I need three glowcaps from that cave for my brew. Bring them, and my apprentice Wizzle will go with you.'],
      ask:[{t:'I will find them',do:{set:{q2:1},toast:'New quest: find 3 glowcaps'}},{t:'Not yet'}]},
    {if:{q2:1,glow:{lt:3}},say:['Glowcaps: {glow} of 3. They grow on the cave floor, east past the bridge road.']},
    {if:{q2:1},now:{set:{q2:2,wizzle:1},bag:{ether:2},join:{name:'Wizzle',cls:'mage',min:2,slot:2}},say:['Lovely, they still wiggle! Wizzle, pack your staff. You are going on an adventure.'],then:{toast:'Wizzle joins the party! +2 ethers'}},
    {if:{q2:{gte:2},wizzle:0},now:{set:{wizzle:1},bag:{ether:2},join:{name:'Wizzle',cls:'mage',min:2,slot:2}},say:['Your friend already brought me the glowcaps. Wizzle, go with this one too!'],then:{toast:'Wizzle joins the party! +2 ethers'}},
    {say:['Gorb is big but slow. Keep your healers healthy and your stick sharp.']}]},
  wizzle:{who:'Wizzle',rules:[{say:['Grandmother Yarrow says I can only come along if you help her first.']}]},
  scout:{who:'Wounded scout',rules:[
    {if:{gorb:1},say:['You beat Gorb? Then the hoard gate in the north can finally open!']},
    {say:['Chief Gorb lives deep in that cave. He carries the key to the Dragon\'s Hoard. His club hits everyone at once, so bring potions.']}]},
  gorb:{who:'Chief Gorb',rules:[{say:['WHO STEPS ON GORB\'S MUSHROOMS?','Gorb will flatten you!'],ask:[{t:'Fight!',do:{fight:[['gorb','shaman'],{boss:'gorb'}]}},{t:'Run away'}]}]},
  vexx:{who:'King Vexx',rules:[{say:['So, a village kobold walks into my hoard. Every coin here is mine, and so is every kobold.','Guards! Show this pup the way out.'],ask:[{t:'For Burrowhome!',do:{fight:[['guard','vexx','guard'],{boss:'vexx'}]}},{t:'Step back'}]}]},
  clink:{who:'Clink the smith',rules:[
    {if:{forge:0,smith:1,'mat.spore':{gte:3}},say:['Glow spores! Watch this...','FWOOM. The big forge is lit! Now I can put new bonuses on your gear.'],then:{mat:{spore:-3},set:{forge:1,smith:2},xp:100,toast:'Quest done! +100 XP{up}'}},
    {if:{smith:0},say:['A new face! I forge gear from monster bits: moss from the meadow, frost shards from the woods, spores from the cave, gold scrap from the hoard.','My big forge is cold though. Three glow spores from cave monsters would light it.'],
      ask:[{t:'I\'ll bring spores',do:{set:{smith:1},toast:'New quest: 3 glow spores for Clink'}},{t:'Show me your wares',do:{set:{smith:1},open:'smith'}}]},
    {then:{open:'smith'}}]},
  pebble:{who:'Pebble',rules:[
    {if:{hat:0},say:['Waaah! The wind took my lucky hat into the meadow! It\'s somewhere in the tall grass, east of the bridge road.'],ask:[{t:'I\'ll find it',do:{set:{hat:1},toast:'New quest: find Pebble\'s hat'}},{t:'Sorry, busy'}]},
    {if:{hat:1},say:['Did you find it? It\'s orange and pointy!']},
    {if:{hat:2},now:{set:{hat:3},item:'cap_cone',xp:40},say:['MY HAT! Thank you thank you! Here, take my spare lucky cone. Grandpa says it brings crits.'],then:{toast:'Quest done! +40 XP, Lucky cone{up}'}},
    {say:['I\'m going to be an adventurer just like you!']}]},
  tikka:{who:'Tikka',rules:[
    {if:{vexx:1},say:['A toast! To the kobold who sent King Vexx running! ...Not you, Toast. Sit down.']},
    {if:{gorb:1},say:['You beat Chief Gorb? I heard he cried. Toast says the next round is on the house!','Toast did not say that.']},
    {say:['Psst. The board outside pays good gold for knocking out monsters.','And don\'t tell Biscuit I said so, but his potions taste like pond.']}]},
  nettle:{who:'Granny Nettle',rules:[
    {if:{needles:0},say:['Oh! A visitor. Mumble is out pestering people about bandits again.','Dearie, could you help an old kobold? I lent my knitting needles to Witch Yarrow, and she never gives anything back.','Her hut is up the forest path, north-west of the bridge.'],
      ask:[{t:'I\'ll fetch them',do:{set:{needles:1},toast:'New quest: Granny Nettle\'s knitting needles'}},{t:'Maybe later'}]},
    {if:{needles:1},say:['They\'ll be somewhere in Yarrow\'s hut, dear. Probably under a pile of toad bits.']},
    {if:{needles:2},now:{set:{needles:3},item:'cl_scarf',xp:60},say:['My needles! And not a single toad bit on them.','Here, I knitted this while I waited. Well, I knitted it with my claws. It\'s a bit lumpy.'],then:{toast:'Quest done! +60 XP, Cozy scarf{up}'}},
    {say:['Stay warm out there, and wear the scarf!']}]}
};
/* The quest log (☰ menu) and the line in the top bar. `show` decides if a line is listed, `done` ticks it. */
const QUEST_LOG=[
  {done:{q1:{gte:2}},text:q=>'Clear the meadow bandits ('+Math.min(q.kills,5)+'/5)'},
  {show:{q1:{gte:2}},done:{q2:{gte:2}},text:q=>'Bring Witch Yarrow 3 glowcaps ('+Math.min(q.glow,3)+'/3)'},
  {show:{any:[{q2:{gte:1}},{gorb:1}]},done:{gorb:1},text:'Defeat Chief Gorb and take the hoard key'},
  {show:{gorb:1},done:{vexx:1},text:'Defeat King Vexx in the Dragon\'s Hoard'},
  {show:{bork:0},hint:true,text:'Bork in the village fights for 40 gold'},
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
  {if:{vexx:1},text:'The hoard is yours!'},
  {if:{gate:1},text:'Defeat King Vexx in the hoard'},
  {if:{key:1},text:'Open the hoard gate (north road)'},
  {if:{q2:1},text:'Glowcaps {glow}/3 · Mushroom Cave'},
  {if:{q2:2},text:'Defeat Chief Gorb in the cave'},
  {if:{q1:1,kills:{gte:5}},text:'Report to Elder Mumble'},
  {if:{q1:1},text:'Meadow bandits {kills}/5'},
  {if:{q1:2},text:'Find the witch in Whisper Woods'},
  {text:'Talk to Elder Mumble'}
];
export {QUEST_LINE,QUEST_LOG,TALK};
