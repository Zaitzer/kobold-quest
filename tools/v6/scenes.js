'use strict';
/* The slice's scenes wired to the world (build step 12): where each scene of docs/slice-dialogue.md plays, when (its flags), and
   what it does between its lines (fights, the class pick, joins, items, deeds, flags). The lines themselves are read from the
   document (tools/v6/script.js) and placed here only by **anchors**: a few words of the line or stage direction, checked by
   tools/gen-data.js, so a changed line is caught rather than silently lost. Places and tiles are the maps' (docs/maps).

   A scene: {id, at, when, steps}
     at:    {place, npc} talk to an NPC · {place, area:[x,y,r]} step near · {place, enter:1} come in · {place, tile:[x,y]} bump · {start:1}
     when:  a flag condition (src/core/rules.js test); every scene also needs its own done-flag unset unless `repeat`
     steps: ['say',from,to] the lines from one anchor to another (inclusive; omitted = the scene's start or end)
            ['fight',id] a set piece (SETPIECES) · ['class'] the class pick · ['join',id] a companion joins · ['give',item,n]
            ['set',{flag:v}] · ['deed',n] / ['kind',n] corruption.md's deeds · ['choice',[[label,steps],...]] · ['tint',t]
            ['piece',id] a Smiler piece · ['goto',place,x,y] · ['scene',id] play another scene next · ['chat',id] a campfire chat
   Stage directions are shown as narration unless they are notes for the engine (NOTE). */

const NOTE=/^Sets |taught here|teaches|picker opens|Flavour only|quest log|chest can be opened|chats unlock|has no lines|is unlocked|joins\b|join\.|(Fight\.)|^After( the bout)?:|^Either way|^Back at Marl|^Pip goes to the mill|^\(|lines below|^It follows/i;

/* the companions (companions.md): their class in play and look */
const COMPANIONS={wizzle:{n:'Wizzle',cls:'sorcerer',colour:'blue'},glint:{n:'Glint',cls:'bard',colour:'pink'},bork:{n:'Bork',cls:'monk',colour:'green'},nugget:{n:'Nugget',cls:'rogue',colour:'gold'}};
/* the classes offered at the yard drill (wave 1, slice-dialogue.md §1.4) */
const WAVE1=['fighter','ranger','wizard','cleric','monk','sorcerer','bard','rogue'];

/* the five set-piece fights and the slice's other fixed fights: foes as [id, level, 'elite'?], the board's theme; solo = the hero alone */
const SETPIECES={
  rats1:{foes:[['cellar_rat',1],['cellar_rat',1],['cellar_rat',1]],theme:'cave',solo:1},
  rats2:{foes:[['cellar_rat',2,'big','Boss rat'],['cellar_rat',1],['cellar_rat',1]],theme:'cave',solo:1},
  drill1:{foes:[['guard_recruit',2],['guard_recruit',2]],theme:'town',solo:1},
  drill2:{foes:[['guard_recruit',3,'elite+tele','Sergeant'],['guard_recruit',2]],theme:'town',solo:1},   // the drill sergeant: a recruit's elite (guard sergeants proper are level 16+)
  gate:{foes:[['nettlenose_scout',3],['nettlenose_scout',3],['nettlenose_scout',3]],theme:'meadow'},
  lunch:{foes:[['copper_beetle',4],['copper_beetle',4],['nettlenose_scout',4]],theme:'meadow'},
  grubb:{boss:'grubb',theme:'meadow'},
  snipe:{boss:'snipe',theme:'cave'},
  pinch:{foes:[['copper_beetle',5,'elite','Big Pinch'],['copper_beetle',5]],theme:'meadow'},
  scoutboss:{foes:[['nettlenose_scout',7,'elite','Nettlenose scout leader'],['nettlenose_scout',7],['nettlenose_scout',7]],theme:'dark'}};

/* who stands where (each place's marks, docs/maps), shown while `show` holds; `lines` are what they say when no scene is due:
   anchors into the scene named by `from`, said one per talk in turn. A `door` NPC has no sprite: its line plays when you bump the door. */
const NPCS=[
  {id:'mallow',n:'Mallow',place:'room:bakery',x:5,y:4,colour:'#f0e6c8'},
  {id:'mallow_nest',n:'Mallow',place:'hearthspire',x:16,y:9,show:{act:3},colour:'#f0e6c8'},
  {id:'bib',n:'Bib',place:'hearthspire',x:17,y:18,from:'1.3',lines:['Buns are fine','I\'d help, but I\'m sitting','The fountain\'s nice today'],show:{act:{lte:6}},colour:'#c9a24a'},
  {id:'guard_castle',n:'Guard',place:'hearthspire',x:18,y:12,colour:'#8a2f4a'},
  {id:'sergeant',n:'Sergeant',place:'hearthspire',x:16,y:10,colour:'#8a2f4a'},
  {id:'snatchclaw',n:'Snatchclaw',place:'hearthspire',x:24,y:3,colour:'#4a35b0'},
  {id:'tower_guard',n:'Tower guard',place:'room:tower',x:6,y:1,colour:'#8a2f4a'},
  {id:'bramble',n:'Bramble',place:'hearthspire',x:16,y:8,show:{act:{gte:3,lte:4}},colour:'#5fb04a'},
  {id:'smudge',n:'Smudge',place:'hearthspire',x:23,y:8,show:{act:{gte:3}},colour:'#9a7a48'},
  {id:'glint_nest',n:'Glint',place:'hearthspire',x:23,y:9,show:{act:{gte:3,lte:4}},colour:'#e05aa8'},
  {id:'fountain_kobold',n:'Fountain kobold',place:'hearthspire',x:22,y:15,from:'1.10',lines:['Hatching day!'],show:{act:{lte:6}},colour:'#7bb6e6'},
  {id:'smith_hs',n:'Smith',place:'hearthspire',x:7,y:23,door:1,from:'1.10',lines:['Sticks, swords, pans']},
  {id:'shrine',n:'Moon shrine keeper',place:'hearthspire',x:14,y:23,door:1,from:'1.10',lines:['Forget what you learned']},
  {id:'shop_hs',n:'Shopkeeper',place:'hearthspire',x:30,y:23,door:1,shop:'hearthspire',from:'1.10',lines:['Potions on the left']},
  {id:'inn_hs',n:'Innkeeper',place:'room:inn',x:4,y:3,from:'1.10',lines:['A bed\'s ten gold'],colour:'#c4523a'},
  {id:'quill',n:'Quill the scribe',place:'room:inn',x:9,y:3,letter:1,colour:'#7b5ea8'},   // carries players' letters to the game's makers (net/mail.js)
  {id:'barracks',n:'Barracks guard',place:'hearthspire',x:33,y:7,door:1,from:'1.10',lines:['We\'re on the wall']},
  {id:'board_hs',n:'Market board',place:'hearthspire',x:24,y:14,door:1,from:'1.10',lines:['Lost: one sock','Raptor rides to Pebblebrook']},
  {id:'gate_guard',n:'Gate guard',place:'hearthspire',x:1,y:15,colour:'#8a2f4a'},
  {id:'bork_gate',n:'Bork',place:'hearthspire',x:2,y:17,show:{act:{lte:6},bork:0},colour:'#5fb04a'},
  {id:'goat',n:'Goat',place:'r1',x:60,y:18,show:{goat:0},colour:'#eee6d0'},
  {id:'tansy',n:'Tansy',place:'r1',x:38,y:15,show:{miner_tansy:0},colour:'#d98a3a'},
  {id:'grubb_road',n:'Grubb',place:'r1',x:93,y:10,show:{any:[{pb:{lte:2},grubb:0},{pb:4}]},colour:'#d8a868'},
  {id:'sign_r1a',n:'Sign',place:'r1',x:13,y:11,door:1,from:'2.0',lines:['PEBBLEBROOK 120 steps']},
  {id:'sign_r1b',n:'Grubb\'s sign',place:'r1',x:66,y:8,door:1,from:'2.0',lines:['TOLL: one bun']},
  {id:'sign_r1c',n:'Raptor stable sign',place:'r1',x:95,y:8,door:1,from:'2.0',lines:['RAPTOR STABLE']},
  {id:'ruddle',n:'Ruddle',place:'room:mill',x:10,y:4,from:'3.2',lines:['A smiler?','Old things?'],colour:'#a8743f'},
  {id:'apprentice',n:'Ruddle\'s apprentice',place:'room:mill',x:4,y:2,from:'3.13',lines:['I chalk a new mark'],colour:'#c9a36a'},
  {id:'chick',n:'Raptor chick',place:'room:mill',x:12,y:2,show:{ghost:1},colour:'#fff3c4'},
  {id:'shaky',n:'Shaky kobold',place:'pebblebrook',x:11,y:10,show:{ghost:{lte:1}},colour:'#b8aec9'},
  {id:'flint',n:'Flint',place:'pebblebrook',x:13,y:13,show:{miner_brothers:0},colour:'#7d6c8a'},
  {id:'grit',n:'Grit',place:'pebblebrook',x:28,y:13,show:{miner_brothers:0},colour:'#62526d'},
  {id:'marl',n:'Old Marl',place:'pebblebrook',x:27,y:6,show:{miner_marl:0},colour:'#9a8aa8'},
  {id:'clover',n:'Farmer Clover',place:'pebblebrook',x:11,y:20,colour:'#3f7f3a'},
  {id:'farmer_fountain',n:'Farmer at the fountain',place:'pebblebrook',x:22,y:16,from:'3.13',lines:['The guards say the toll','Can\'t see how'],colour:'#5fb04a'},
  {id:'inn_pb',n:'Innkeeper',place:'room:pebinn',x:5,y:3,from:'3.13',lines:['Beds upstairs'],colour:'#c4523a'},
  {id:'shop_pb',n:'Shopkeeper',place:'pebblebrook',x:26,y:17,door:1,shop:'pebblebrook',from:'3.13',lines:['Picks, lamps']},
  {id:'board_pb',n:'Note board',place:'pebblebrook',x:13,y:11,door:1},
  {id:'nugget_mine',n:'Nugget',place:'mine1',x:16,y:8,show:{nugget:0},colour:'#c9a24a'},
  {id:'ore',n:'Ore',place:'mine1',x:25,y:16,show:{miner_ore:0},colour:'#8a7360'},
  {id:'snipe_npc',n:'Snipe',place:'mine3',x:24,y:15,show:{pb:{lte:3}},colour:'#8a2f4a'},
  {id:'rider',n:'Rider',place:'r1',x:89,y:7,show:{pb:6},colour:'#ffb347'}];

/* the scenes, in story order */
const SCENES=[
  {id:'1.1',at:{start:1},steps:[['say'],['set',{act:1}]]},
  {id:'1.2',at:{place:'room:cellar',enter:1},when:{act:1},steps:[['say',null,'Out. This flour'],['fight','rats1'],['say','A bigger rat','You\'re the boss rat'],['fight','rats2'],['chest','Mallow\'s old box'],['say','After the second fight'],['give','lamp',1],['set',{act:2,lamp:1}]]},
  {id:'1.3',at:{place:'hearthspire',npc:'bib'},when:{act:2},steps:[['say',null,'Everything\'s fine.'],['set',{bib1:1}]]},
  {id:'1.4',at:{place:'hearthspire',area:[19.5,11,1]},when:{act:2,drill:0},steps:[['say',null,'show me what you are'],['class'],['fight','drill1'],['say','Not bad.','Now try ME'],['fight','drill2'],['say','Hm. You moved'],['set',{drill:1}]]},
  {id:'1.5a',from:'1.5',at:{place:'room:castle',enter:1},when:{act:{gte:2},mural:0},steps:[['say',null,'Looks like a pipe'],['set',{mural:1}]]},
  {id:'1.5b',from:'1.5',at:{place:'room:tower',enter:1},when:{act:2,lamp:1},steps:[['say','The tower fire at the top','I never drop things'],['set',{lamp:2}]]},
  {id:'1.5c',from:'1.5',at:{place:'room:bakery',npc:'mallow'},when:{act:2,lamp:2},steps:[['say','Back at the bakery'],['set',{act:3}]]},
  {id:'1.6',at:{place:'room:bakery',npc:'mallow'},when:{act:3,ember:0},steps:[['say'],['give','ember',1],['set',{ember:1}]]},
  {id:'1.7',at:{place:'hearthspire',area:[19.5,8.5,2.2]},when:{act:3,ember:1},steps:[['say',null,'The difference is who gets the buns'],['set',{act:4}]]},
  {id:'1.8',at:{place:'hearthspire',bump:[19.5,8.5,3]},when:{act:4},steps:[['say'],['set',{act:5}]]},
  {id:'1.9',at:{place:'room:bakery',npc:'mallow'},when:{act:5},steps:[['say',null,'Don\'t tell the dragon.'],['give','bun',1],['say','singing, quietly','Take the book.'],['give','book',1],['say','Wizzle bursts in','Nobody talk to me'],['join','wizzle'],['join','glint'],['set',{act:6}]]},
  {id:'1.11',at:{place:'hearthspire',area:[1,16,2]},when:{act:6,bork:0},steps:[['say',null,'(nods off'],['join','bork'],['set',{bork:1}],['scene','1.12']]},
  {id:'1.12',at:{none:1},steps:[['say',null,'toll you on the way back'],['fight','gate'],['say','After the fight they scamper'],['set',{act:7}]]},
  {id:'2.1a',from:'2.1',at:{place:'r1',npc:'goat'},when:{goat:0},steps:[['say',null,'Meh.'],['set',{goat:1}]]},
  {id:'2.1b',from:'2.1',at:{place:'pebblebrook',npc:'clover'},when:{goat:1},steps:[['say','BUTTERCUP!','never liked it.'],['give','clover-ring',1],['kind',2],['set',{goat:2}]]},
  {id:'2.2',at:{place:'r1',npc:'tansy'},when:{pb:{gte:2},miner_tansy:0},steps:[['say',null,'Into the reeds.'],['fight','lunch'],['say','Your lunch. Slightly chewed.','Your lunch. Slightly chewed.'],
    ['choice',[['Give it back',[['kind',3],['say','That\'s beetle chewing','eating it on the way']]],['Eat it',[['deed',9],['say','You ATE it?','You ATE it?']]]]],['set',{miner_tansy:1}]]},
  {id:'3.1',at:{place:'r1',area:[93,9,2.5]},when:{act:7,pb:0},steps:[['say',null,'Flour carts don\'t leave'],['set',{pb:1}]]},
  {id:'3.1b',from:'3.1',at:{place:'pebblebrook',enter:1},when:{pb:1,arrived:0},steps:[['say','PEBBLEBROOK. Home of'],['set',{arrived:1}]]},
  {id:'3.2',at:{place:'room:mill',npc:'ruddle'},when:{pb:1},steps:[['say',null,'And Old Marl.'],['set',{pb:2}]]},
  {id:'3.3',at:{place:'r1',area:[93,9,3]},when:{pb:{gte:2,lte:3},grubb:0},steps:[['say',null,'That\'s still a toll.'],['fight','grubb'],['say','Fine. FINE.'],['set',{grubb:1}]]},
  {id:'3.4',at:{place:'pebblebrook',area:[10,10,3]},when:{grubb:1,gbmill:0},steps:[['say'],['set',{gbmill:1}]]},
  {id:'3.5',at:{place:'mine1',npc:'nugget_mine'},when:{nugget:0},steps:[['say',null,'It\'s mine.'],['join','nugget'],['set',{nugget:1}]]},
  {id:'3.5b',from:'3.5',at:{place:'mine1',npc:'ore'},when:{pb:{gte:2},miner_ore:0,cart:0},repeat:1,steps:[['say','Don\'t touch that cart','That\'s mining.'],
    ['choice',[['Push the cart',[['cart']]],['Leave it',[]]]]]},
  {id:'3.5c',from:'3.5',at:{place:'mine1',npc:'ore'},when:{cart:1,miner_ore:0},steps:[['say','Huh. Rolled right back'],['set',{miner_ore:1}]]},
  {id:'3.6',at:{place:'pebblebrook',npc:'flint'},when:{pb:{gte:2},stone:0},steps:[['say',null,'Loft.'],['set',{stone:1}]]},
  {id:'3.6x',from:'3.6',at:{place:'pebblebrook',npc:'grit'},when:{pb:{gte:2},stone:0},steps:[['say',null,'Loft.'],['set',{stone:1}]]},
  {id:'3.6b',from:'3.6',at:{place:'room:loft',tile:[5,2]},when:{stone:1},steps:[['say','In the mill loft','I\'M holding it.'],['chest','the loft (needs the vote bag)'],['set',{stone:2,miner_brothers:1}]]},
  {id:'3.7',at:{place:'pebblebrook',npc:'marl'},when:{pb:{gte:2},marl:0},steps:[['say',null,'That\'s how you know.'],['set',{marl:1}]]},
  {id:'3.7b',from:'3.7',at:{place:'room:mill',npc:'ruddle'},when:{marl:1},steps:[['say','Old Marl will come','nine years ago.'],['set',{marl:2}]]},
  {id:'3.7c',from:'3.7',at:{place:'pebblebrook',npc:'marl'},when:{marl:2},steps:[['say','First? Hm.'],['set',{marl:3,miner_marl:1}]]},
  {id:'3.8',at:{place:'pebblebrook',area:[18,16,3]},when:{pb:2,miner_ore:1,miner_tansy:1,miner_brothers:1,miner_marl:1},steps:[['tint','dusk'],['say'],['tint',null],['set',{pb:3}]]},
  {id:'3.9',at:{place:'mine3',area:[24,15,2.5]},when:{pb:3},steps:[['say',null,'It\'s MY sums.'],['fight','snipe'],['say','Fine! Take it!'],['set',{pb:4}]]},
  {id:'3.10',at:{place:'r1',npc:'grubb_road'},when:{pb:4,nugget:1},steps:[['say'],['set',{pb:5}]]},
  {id:'3.11',at:{place:'pebblebrook',area:[18,16,3]},when:{pb:5},steps:[['say'],['scene','3.12']]},
  {id:'3.12',at:{none:1},steps:[['say',null,'Hop on.'],['piece','tube'],['kind',5],['set',{pb:6}]]},
  {id:'3.14a',from:'3.14',at:{place:'pebblebrook',npc:'shaky'},when:{ghost:0},steps:[['say','There\'s a GHOST','It goes skree.'],['set',{ghost:1}]]},
  {id:'3.14b',from:'3.14',at:{place:'room:mill',npc:'chick'},when:{ghost:1},steps:[['say','In the mill: a raptor chick','It\'s a chick. In flour.'],['set',{ghost:2}]]},
  {id:'3.14c',from:'3.14',at:{place:'pebblebrook',npc:'clover'},when:{seeds:0,goat:{ne:1}},steps:[['say','Moss tufts!','That\'s farming.'],['set',{seeds:1}]]},
  {id:'3.14d',from:'3.14',at:{place:'pebblebrook',npc:'board_pb'},when:{bounty_pinch:0},steps:[['say','BIG PINCH.','BIG PINCH.'],['say','A Nettlenose with a sergeant','A Nettlenose with a sergeant'],['set',{bounty_pinch:1,bounty_scout:1}]]},
  {id:'3.14e',from:'3.14',at:{place:'mine2',area:[20,5,2]},when:{bounty_scout:1},steps:[['say','I\'m the sergeant\'s cousin'],['fight','scoutboss'],['give','gold',60],['set',{bounty_scout:2}]]},
  {id:'3.14f',from:'3.14',at:{place:'r1',area:[60,12,2]},when:{bounty_pinch:1},steps:[['fight','pinch'],['give','gold',40],['set',{bounty_pinch:2}]]}];

/* the campfire chats (slice-dialogue.md §6): at an inn's hearth, when everyone in them is in the pack; +1 bond to each companion in it */
const CHATS=[{id:'6.1',inn:'room:inn',who:['wizzle'],when:{act:{gte:6}}},{id:'6.2',inn:'room:inn',who:['glint'],when:{act:{gte:6}}},
  {id:'6.3',inn:'room:pebinn',who:['bork','wizzle']},{id:'6.4',inn:'room:pebinn',who:['nugget'],when:{nugget:1}},{id:'6.5',inn:'room:pebinn',who:['wizzle','nugget'],when:{pb:{gte:4}}}];

module.exports={NOTE,COMPANIONS,WAVE1,SETPIECES,NPCS,SCENES,CHATS};
