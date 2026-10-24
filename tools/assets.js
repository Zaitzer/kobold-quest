#!/usr/bin/env node
'use strict';
/* Kobold Quest v6: every art asset the new game needs, as sprite sheets.
   Writes art/templates/*.png (guides: frame borders, feet line, safe box), one empty (fully transparent) placeholder PNG per
   asset in sorted folders under art/, and art/ASSETS.md (the checklist). Never overwrites a drawn file.
   The game draws every sheet, the stand-ins too, until Joakim draws over them (engine/sheets.js).
   Usage: node tools/assets.js            (safe to re-run)                                                              */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ROOT=path.join(__dirname,'..','art');

/* ------------------------------------------------------------------ a tiny PNG writer (RGBA, no dependencies) */
const CRC=(()=>{const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c}return t})();
function crc(buf){let c=-1;for(const b of buf)c=CRC[(c^b)&255]^(c>>>8);return(c^-1)>>>0}
function chunk(type,data){const l=Buffer.alloc(4);l.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])}
function png(w,h,px){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;px.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4)}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;ih[10]=0;ih[11]=0;ih[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))])}
function canvas(w,h){const px=Buffer.alloc(w*h*4);return{w,h,px,set(x,y,[r,g,b,a]){if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4;px[i]=r;px[i+1]=g;px[i+2]=b;px[i+3]=a},
  hline(x0,x1,y,c){for(let x=x0;x<=x1;x++)this.set(x,y,c)},vline(x,y0,y1,c){for(let y=y0;y<=y1;y++)this.set(x,y,c)},
  rect(x,y,ww,hh,c){this.hline(x,x+ww-1,y,c);this.hline(x,x+ww-1,y+hh-1,c);this.vline(x,y,y+hh-1,c);this.vline(x+ww-1,y,y+hh-1,c)},save(f){fs.writeFileSync(f,png(w,h,px))}}}

/* ------------------------------------------------------------------ sheet types: frame size and rows (animation, frames) */
const SHEET={
 hero:{fw:32,fh:32,feet:30,rows:[['walk down',3,'DN'],['walk up',3,'UP'],['walk side (facing right)',3,'SD'],['battle idle',2,'ID'],['attack',3,'AT'],['cast or skill',2,'CA'],['hurt, down, cheer, cheer',4,['HURT','DOWN','CHR1','CHR2']]],note:'Pip and the seven companions'},
 villager:{fw:32,fh:32,feet:30,rows:[['walk down',3,'DN'],['walk up',3,'UP'],['walk side (facing right)',3,'SD'],['talk (facing down)',2,'TK']],note:'anyone who walks around'},
 foe:{fw:32,fh:32,feet:30,rows:[['battle idle',2,'ID'],['walk side (on the map, as a patrol)',3,'WK'],['attack',3,'AT'],['hurt, storms off',2,['HURT','OFF']]],note:'every opponent that is not a boss'},
 boss:{fw:64,fh:64,feet:60,rows:[['battle idle',2,'ID'],['attack',3,'AT'],['telegraph (the big attack winding up)',2,'TELE'],['hurt, defeated',2,['HURT','DOWN']]],note:'2 × 2-tile foes'},
 tile:{fw:32,fh:32,rows:[['the tile',1]],note:'static map tiles'},
 tileanim:{fw:32,fh:32,rows:[['loop',4]],note:'animated map tiles (water, fire, grass)'},
 building:{fw:128,fh:96,rows:[['the building',1]],note:'4 × 3 tiles, door bottom middle'},
 buildanim:{fw:128,fh:96,rows:[['loop',4]],note:'buildings with a moving part'},
 fx:{fw:32,fh:32,rows:[['effect',6]],note:'single-target effects'},
 fxbig:{fw:64,fh:64,rows:[['effect',6]],note:'area effects'},
 portrait:{fw:64,fh:64,rows:[['calm, happy, upset',3]],note:'dialogue faces'},
 icon:{fw:32,fh:32,rows:[['icon',1]],note:'items'},
 icon16:{fw:16,fh:16,rows:[['icon',1]],note:'statuses and small marks'},
 object:{fw:32,fh:32,rows:[['still, wobble',2]],note:'story objects'},
};
const sheetSize=t=>{const S=SHEET[t];return{w:S.fw*Math.max(...S.rows.map(r=>r[1])),h:S.fh*S.rows.length}};

/* ------------------------------------------------------------------ the assets */
const A=[];   // [folder, file, type, what, slice?]
const add=(folder,file,type,what,slice)=>A.push({folder,file,type,what,slice:!!slice});
// characters
[['pip','Pip (the hero; any class)',1],['wizzle','Wizzle (sorcerer)',1],['glint','Glint (bard)',1],['bork','Bork (monk)',1],['nugget','Nugget (rogue)',1],['saffi','Saffi (wizard)'],['cinder','Cinder (barbarian)'],['crumb','Crumb (cleric)']]
  .forEach(([f,w,s])=>add(f==='pip'?'characters/heroes':'characters/companions',f,'hero',w,s));
['fighter','ranger','wizard','cleric','monk','sorcerer','bard','rogue','barbarian','paladin','druid','warlock'].forEach(c=>add('characters/heroes/pip-classes','pip-'+c,'hero',`Pip as a ${c} (same sheet, the class's outfit)`,['fighter','ranger','wizard','cleric','monk','sorcerer','bard','rogue'].includes(c)));
const VILL={hearthspire:[['mallow','Mallow, the baker',1],['bib','Bib on his bench',1],['bramble','Bramble (backs the sprouty egg)',1],['smudge','Smudge, the friendly cousin',1],['snatchclaw','Snatchclaw (on the map)'],['guard','one of Snatchclaw\'s guards',1],['innkeeper-hs','the innkeeper',1],['shopkeeper-hs','the shopkeeper',1],['smith-hs','the smith',1],['shrine-keeper','the moon shrine\'s keeper'],['villager-hs-1','a Hearthspire kobold',1],['villager-hs-2','another Hearthspire kobold',1],['kid-hs','a kobold kid',1]],
 pebblebrook:[['ruddle','Miller Ruddle (keeper)',1],['ore','Ore, the foreman',1],['tansy','Tansy',1],['flint','Flint',1],['grit','Grit',1],['marl','Old Marl',1],['stablekeeper','the raptor stable\'s keeper',1],['mossback','a Mossback farmer',1],['innkeeper-pb','the innkeeper',1],['shopkeeper-pb','the shopkeeper',1]],
 sunhaven:[['head-scribe','the head scribe (keeper)'],['beekeeper','a beekeeper'],['innkeeper-sh','the innkeeper'],['shopkeeper-sh','the shopkeeper'],['villager-sh','a Sunhaven kobold']],
 emberreach:[['forge-master','the forge master (keeper)'],['baker-er','a baker'],['innkeeper-er','the innkeeper'],['shopkeeper-er','the shopkeeper'],['villager-er','an Emberreach kobold']],
 frostwick:[['fort-captain','the fort captain (keeper)'],['builder','the builder with the simple plan'],['innkeeper-fw','the innkeeper'],['shopkeeper-fw','the shopkeeper'],['villager-fw','a Frostwick kobold']],
 saltspray:[['master-leaky','the leaky harbour master (keeper)'],['master-dear','the overcharging harbour master (keeper)'],['fisher','a fisher'],['innkeeper-ss','the innkeeper'],['shopkeeper-ss','the shopkeeper'],['islander','an islander']],
 everywhere:[['quill','Quill the scribe (letters)',1],['rider','a raptor rider',1],['boatman','a boatman']]};
for(const [town,list] of Object.entries(VILL))for(const [f,w,s] of list)add('characters/villagers/'+town,f,'villager',w,s);
add('characters/mounts','raptor','villager','a raptor (ridden; same sheet as a villager)',1);
// foes (the bestiary) and bosses
const FOES={'hearthspire':[['cellar-rat','Cellar rat',1],['guard-recruit','Guard recruit',1]],'roads':[['nettlenose-scout','Nettlenose scout',1],['nettlenose-slinger','Nettlenose slinger',1],['guard-foe','Snatchclaw\'s guard (in battle)',1],['guard-sergeant','Guard sergeant']],
 'pebblebrook':[['copper-beetle','Copper beetle',1],['glow-grub','Glow grub',1]],'sunhaven':[['sand-skink','Sand skink'],['cellar-bee','Cellar bee'],['wax-golem','Wax golem']],
 'emberreach':[['rock-goat','Rock goat'],['stoker','Stoker'],['magma-slug','Magma slug']],'frostwick':[['snow-beast','Snow beast'],['frost-guard','Frost guard'],['ice-mite','Ice mite']],
 'saltspray':[['shore-crab','Shore crab'],['smuggler','Smuggler'],['sea-guard','Sea guard'],['cave-eel','Cave eel']],'castle':[['royal-guard','Royal guard'],['castle-crossbow','Castle crossbow']]};
for(const [z,list] of Object.entries(FOES))for(const [f,w,s] of list)add('foes/'+z,f,'foe',w,s);
[['grubb','Grubb the toll boss',1],['snipe','Snipe the copper snatcher (on his cart)',1],['captain-sunhaven','Sunhaven guard captain'],['captain-emberreach','Emberreach guard captain'],['snatchclaw-boss','Snatchclaw (both fights)'],['captain-bunroad','Bun-road toll captain'],['draft-sergeant','Draft sergeant'],['pier-captain','Pier captain (in his boat)'],['castle-commander','Castle commander'],['glitterbeak','Glitterbeak',1],['old-shellback','Old Shellback (Pebblebrook\'s hidden trial)',1],['queen-bee','the queen bee (Sunhaven\'s trial)'],['magma-mother','the magma slug\'s mother (Emberreach\'s trial)'],['ice-wyrm','the ice wyrm statue (Frostwick\'s trial)'],['ghost-captain','the ghost ship\'s captain (Saltspray\'s trial)']]
  .forEach(([f,w,s])=>add('bosses',f,'boss',w,s));
// tiles
const TILES={hearthspire:[['marble','marble street',1],['cobble','cobbles',1],['castle-wall','castle wall',1],['castle-floor','castle floor',1],['carpet','the throne room carpet'],['nest-straw','the Great Nest\'s straw',1],['garden','a garden bed',1],['stairs','stairs',1]],
 grass:[['grass','grass',1],['path','path',1],['tree','tree',1],['flowers','flowers',1],['fence','fence',1],['bridge','bridge',1],['pond-edge','pond edge',1],['cliff','cliff',1]],
 mine:[['mine-floor','mine floor',1],['mine-wall','mine wall',1],['rails','cart rails',1],['dark','unlit floor (glow grubs light it)',1],['flooded','flooded floor',1]],
 desert:[['sand','sand'],['dune','dune'],['cactus','cactus'],['oasis-edge','oasis edge'],['dry-tile','a drained oasis tile']],
 'honey-cellars':[['wax-floor','wax floor'],['comb-wall','honeycomb wall'],['wax-slow','wax on the floor (slow)']],
 mountain:[['rock','rock'],['pass','mountain path'],['ledge','ledge'],['ash','ash floor (the crater)']],
 snow:[['snow','snow'],['snow-tree','snowy tree'],['fort-wall','fort wall'],['ice-floor','ice floor (the ice cellars)'],['ice-wall','ice wall']],
 shore:[['beach','beach'],['rocks','shore rocks'],['pier','pier planks'],['hull','shipwreck hull'],['planks','deck planks'],['cave-stone','wet cave stone']]};
for(const [b,list] of Object.entries(TILES))for(const [f,w,s] of list)add('tiles/'+b,f,'tile',w,s);
[['hearthspire','fountain','the fountain',1],['hearthspire','tower-fire','the tower fire',1],['hearthspire','lamp','a lamp',1],['grass','tall-grass','tall grass (rustles)',1],['grass','water','water',1],['desert','oasis-water','oasis water'],['honey-cellars','honey-pool','a honey pool'],['mountain','lava','lava'],['mountain','hot-tile','a hot tile (burns)'],['snow','ice-slick','slick ice (fall)'],['shore','sea','sea'],['shore','cave-water','cave water']]
  .forEach(([b,f,w,s])=>add('tiles/'+b,f,'tileanim',w,s));
// battle boards (systems.md §2): the cover pieces each theme scatters, and what skills put on a tile (added 22 Oct with build steps 4 and 9)
[['bush','a bush: half cover, hides a kobold beyond 3 tiles (meadow, woods)',1],['rock','a boulder: full cover, blocks sight (meadow, cave)',1],['mushroom','a giant mushroom: half cover (cave, the mine)',1],
 ['pillar','a stone pillar: full cover (town, castle)',1],['crate','a crate: half cover (town)',1],['stone-cover','the monk\'s Raise cover: half cover for 3 turns',1],['plant-cover','the druid\'s Plant cover']]
  .forEach(([f,w,s])=>add('tiles/battle',f,'tile',w,s));
// buildings
[['hearthspire','bakery','Mallow\'s bakery (the cellar door shows)',1],['hearthspire','castle-gate','the capital gate',1],['hearthspire','castle','the castle',1],['hearthspire','inn-hs','the inn',1],['hearthspire','shop-hs','the shop',1],['hearthspire','smithy-hs','the smithy',1],['hearthspire','moon-shrine','the moon shrine'],['hearthspire','tower','the tower',1],['hearthspire','house-hs','a house',1],
 ['pebblebrook','inn-pb','the inn',1],['pebblebrook','shop-pb','the shop',1],['pebblebrook','house-pb','a house',1],['pebblebrook','stable','the raptor stable',1],['pebblebrook','mine-entrance','the mine\'s mouth',1],
 ['sunhaven','inn-sh','the inn'],['sunhaven','shop-sh','the shop'],['sunhaven','house-sh','a house'],['sunhaven','scriptorium','the scriptorium'],
 ['emberreach','inn-er','the inn'],['emberreach','shop-er','the shop'],['emberreach','house-er','a house'],['emberreach','forge','the forge'],
 ['frostwick','inn-fw','the inn'],['frostwick','shop-fw','the shop'],['frostwick','house-fw','a house'],['frostwick','fort','the fort'],
 ['saltspray','inn-ss','the inn'],['saltspray','shop-ss','the shop'],['saltspray','house-ss','a house'],['saltspray','harbour','the harbour office']]
  .forEach(([p,f,w,s])=>add('buildings/'+p,f,'building',w,s));
[['pebblebrook','mill','the mill and its turning wheel',1],['sunhaven','honey-dome','the honey-glass dome (glints)'],['emberreach','ovens','the volcano ovens (glow)'],['saltspray','lighthouse','the lighthouse (its light turns)'],['hearthspire','throne','the throne going up in the yard']]
  .forEach(([p,f,w,s])=>add('buildings/'+p,f,'buildanim',w,s));
// effects
[['hit','a hit',1],['crit','a crit',1],['miss','a miss (a puff)',1],['heal','a heal',1],['fire','fire',1],['frost','frost',1],['storm','storm'],['earth','earth',1],['nature','nature',1],['holy','holy',1],['burn','burning'],['poison','poison'],['stun','stun (stars)',1],['slow','slow',1],['root','root (vines)',1],['fall','fall (dust)'],['buff','a buff (up)',1],['debuff','a weaken or hex (down)',1],['ward','a ward (shield)'],['unseen','unseen (shimmer)'],['level-up','level up',1],['ember','an ember glowing',1]]
  .forEach(([f,w,s])=>add('fx',f,'fx',w,s));
[['explosion','an area spell landing',1],['telegraph','a boss\'s telegraphed area',1],['smiler-blast','the Smiler firing (the finale)'],['hatching','an egg hatching',1]].forEach(([f,w,s])=>add('fx/big',f,'fxbig',w,s));
[['together','Together: two kobolds strike one foe at once (a pair\'s first time)',1]].forEach(([f,w,s])=>add('fx/big',f,'fxbig',w,s));
// portraits
['pip','wizzle','glint','bork','nugget','saffi','cinder','crumb','mallow','bib','smudge','snatchclaw','ruddle','head-scribe','forge-master','fort-captain','master-leaky','master-dear']
  .forEach(n=>add('portraits',n,'portrait','portrait of '+n,['pip','wizzle','glint','bork','nugget','mallow','bib','smudge','ruddle'].includes(n)));
add('portraits','glitterbeak','portrait','portrait of Glitterbeak',1);
// story objects
[['egg-sprouty','the sprouty egg',1],['egg-sleepy','the sleepy egg',1],['egg-shiny','the shiny egg',1],['ember-bun','an ember-bun',1],['recipe-book','Mallow\'s recipe book',1],['smiler-tube','Smiler piece: the tube',1],['smiler-sight','Smiler piece: the sight'],['smiler-igniter','Smiler piece: the igniter'],['smiler-fins','Smiler piece: the cooling fins'],['smiler-chamber','Smiler piece: the ember chamber'],['smiler','the Smiler, assembled'],['toll-box','Grubb\'s toll box',1],['vote-bag','the vote bag with a hole',1],['duck-nugget','the duck-shaped nugget'],['honey-lens','the honey-glass lens']]
  .forEach(([f,w,s])=>add('objects',f,'object',w,s));
[['trap','a set trap (only its owner sees it)',1],['snare','the ranger\'s hidden snare']].forEach(([f,w,s])=>add('objects',f,'object',w,s));
// icons: items
const FAM={blades:['stick','bone','copper-sword','iron-sword','frost-forged-blade','ember-blade'],axes:['knobbly-club','spiked-club','stone-axe','basalt-axe','glacier-axe','magma-maul'],guns:['popgun','reed-bow','blunderbuss','longbow','frost-musket','ember-cannon'],daggers:['butter-knife','dagger','hook-knife','dart-pipe','frost-stiletto','shadow-blade'],fists:['wraps','knuckle-wraps','bell-gloves','iron-wraps','frost-gauntlets','ember-fists'],wands:['frost-rod','fire-wand','birch-staff','archstaff','frost-staff','ember-staff'],orbs:['spark-stone','ember-stone','cinder-orb','flame-heart','frost-heart','dragon-heart'],teapots:['chipped-teapot','brass-teapot','copper-kettle','silver-pot','frost-samovar','dragon-glaze-urn'],holy:['healing-wand','oak-crook','sun-bell','ember-censer','frost-chime','hearthspire-lantern'],nature:['twig','root-staff','moss-staff','bramble-crook','frost-bark-staff','ember-wood-staff'],instruments:['whistle','fiddle','lute','drum','frost-horn','golden-harp']};
for(const [f,list] of Object.entries(FAM))list.forEach((n,i)=>add('icons/items/weapons/'+f,n,'icon',`${n.replace(/-/g,' ')} (T${i+1})`,i<2));
const SLOTS={armour:['leather-vest','padded-jacket','scale-mail','basalt-plate','frostfur-coat','ember-plate'],shield:['pot-lid','pan-guard','spiked-shield','basalt-buckler','ice-slab','bakers-tray'],helm:['leaf-crown','iron-pot','bucket-helm','copper-kettle-helm','frostfur-hood','pearl-circlet'],boots:['frog-boots','quick-boots','iron-boots','ember-treads','snowshoes','sea-legs'],cloak:['moss-cape','cozy-scarf','shadow-cloak','honey-silk-cloak','frostfur-cloak','ember-mantle'],neck:['snail-shell-charm','glowcap-pendant','dragon-tooth','honey-glass-charm','frost-pearl','ember-locket'],ring:['copper-ring','honey-ring','gold-scrap-ring','ember-ring','ice-ring','pearl-ring'],
 robe:['apprentice-robe','scribes-robe','sand-silk-robe','ember-robe','frost-weave-robe','pearl-robe','cloth-cap','scholars-hat','honey-silk-hood','ember-hood','snow-cowl','pearl-cowl','linen-shawl','reading-shawl','sun-shawl','cinder-shawl','fog-shawl','tide-shawl'],
 scout:['twig-jerkin','runners-vest','sand-scale-jerkin','basalt-lite-vest','snow-scout-coat','shore-scout-coat','feather-band','scouts-cap','goggles','ember-visor','fur-ear-flaps','gull-feather-cap','grass-cape','dust-cape','dune-cape','ash-cape','white-cape','sea-spray-cape']};
for(const [s,list] of Object.entries(SLOTS))list.forEach((n,i)=>add('icons/items/'+s,n,'icon',n.replace(/-/g,' '),(i%6)<2));
['clover-ring','quickstep-anklet','pick-charm','ward-bell','warding-robe','spellband','rally-drum','hunters-eyeglass','herd-bell','shadow-scarf','loaded-die','gamblers-glove','lucky-penny','wishing-coin','leaders-sash','thinking-cap','square-bell','balance-beads','ki-band']
  .forEach(n=>add('icons/items/special',n,'icon',n.replace(/-/g,' ')+' (one icon for all tiers; the tier tints it)'));
['toll-pot','copper-cart-wheel','drain-key','oven-mitts','captains-sash','bun-satchel','sergeants-whistle','net-cloak','marble-gauntlets','throne-splinter','warm-scale'].forEach((n,i)=>add('icons/items/uniques',n,'icon',n.replace(/-/g,' '),i<2));
['potion','hearty-potion','great-potion','ether','hearty-ether','great-ether','phoenix-feather','golden-feather','bun-crumbs'].forEach((n,i)=>add('icons/items/consumables',n,'icon',n.replace(/-/g,' '),[0,3,6].includes(i)));
['moss-tuft','gold-scrap','sand-glass','reed','frost-shard','pearl','boss-fang'].forEach((n,i)=>add('icons/items/materials',n,'icon',n.replace(/-/g,' '),i<2||n==='boss-fang'));
// icons: statuses, elements and marks
['stun','fall','slow','root','weaken','hex','confuse','burn','poison','unseen','guard','morale-up','morale-down','luck','fire','frost','storm','earth','nature','threat','resisted','mercy']
  .forEach(n=>add('icons/status',n,'icon16',n,true));
// marks on the sheet and the battle menu (build step 7): a skill's dark version, Pip's three leader stats, a talent pick waiting
[['dark','a dark version (on a skill button)'],['might','Might (leader point)'],['wits','Wits (leader point)'],['leadership','Leadership (leader point)'],['pick','a talent pick waiting']]
  .forEach(([f,w])=>add('icons/status',f,'icon16',w,true));

/* ------------------------------------------------------------------ a 3 × 5 pixel font for the templates' labels */
const FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',
 H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',
 O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',
 V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111',
 '2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010',
 '8':'111101111101111','9':'111101111001110',' ':'000000000000000','-':'000000111000000','(':'010100100100010',')':'010001001001010',',':'000000000010100','.':'000000000000010','→':'000010111010000'};
function text(cv,x,y,s,c,k){for(const ch of String(s).toUpperCase()){const g=FONT[ch]||FONT[' '];for(let i=0;i<15;i++)if(g[i]==='1')for(let a=0;a<k;a++)for(let b=0;b<k;b++)cv.set(x+(i%3)*k+a,y+((i/3)|0)*k+b,c);x+=4*k}}
const textW=(s,k)=>String(s).length*4*k;
/* the label of frame i in a row: the row's code and the frame's number ("DN1"), or the frame's own code ("HURT") */
const label=(row,i)=>Array.isArray(row[2])?row[2][i]:row[2]?row[2]+(i+1):'';
const frameName=(row,i)=>Array.isArray(row[2])?row[0].split(', ')[i]||row[0]:row[0]+(row[1]>1?' '+(i+1):'');

/* ------------------------------------------------------------------ write templates, guides, placeholders and the list */
const C_FRAME=[255,0,255,255],C_FEET=[255,40,40,255],C_SAFE=[40,200,90,255],C_ROW=[60,140,255,255];
function template(t){const S=SHEET[t],{w,h}=sheetSize(t),cv=canvas(w,h);
  S.rows.forEach(([name,n],r)=>{for(let i=0;i<Math.max(...S.rows.map(x=>x[1]));i++){const x=i*S.fw,y=r*S.fh;
      if(i<n){cv.rect(x,y,S.fw,S.fh,C_FRAME);if(S.feet){cv.hline(x+1,x+S.fw-2,y+S.feet,C_FEET)}
        if(S.fh>=32&&!S.feet){const m=Math.max(2,Math.round(S.fw/8));cv.rect(x+m,y+m,S.fw-2*m,S.fh-2*m,C_SAFE)}
        const L=label([name,n,S.rows[r][2]],i);if(L)text(cv,x+2,y+2,L,C_ROW,1)}   // the frame's label in its top-left corner (DN1: walk down, frame 1)
      else{for(let k=0;k<Math.min(S.fw,S.fh);k+=2)cv.set(x+k*S.fw/Math.min(S.fw,S.fh)|0,y+k*S.fh/Math.min(S.fw,S.fh)|0,C_ROW)}}});   // a dotted diagonal marks an unused frame
  return cv}
fs.mkdirSync(path.join(ROOT,'templates'),{recursive:true});
for(const f of fs.readdirSync(path.join(ROOT,'templates')))if(/\.png$/.test(f))fs.unlinkSync(path.join(ROOT,'templates',f));   // sizes change: no old template stays
for(const t of Object.keys(SHEET)){const {w,h}=sheetSize(t);template(t).save(path.join(ROOT,'templates',`${t}-${w}x${h}.png`))}
/* the guides (characters only): the template blown up 8 ×, each frame named in words under it, to keep open beside the drawing */
function guide(t){const S=SHEET[t],Z=8,{w,h}=sheetSize(t),cols=Math.max(...S.rows.map(r=>r[1])),cw=Math.max(S.fw*Z,150),ch=S.fh*Z+24,G=canvas(cols*cw+8,S.rows.length*ch+40);
  const bg=[30,20,70,255],ink=[255,240,200,255];for(let y=0;y<G.h;y++)for(let x=0;x<G.w;x++)G.set(x,y,bg);
  text(G,8,8,t+' sheet: frame '+S.fw+' x '+S.fh+', feet on row '+S.feet,ink,2);
  const T=template(t);S.rows.forEach((row,r)=>{for(let i=0;i<row[1];i++){const ox=4+i*cw,oy=32+r*ch;
      for(let y=0;y<S.fh;y++)for(let x=0;x<S.fw;x++){const k=((r*S.fh+y)*w+i*S.fw+x)*4,a=T.px[k+3];const c=a?[T.px[k],T.px[k+1],T.px[k+2],255]:((x>>2)+(y>>2))%2?[58,46,110,255]:[48,36,96,255];
        for(let a2=0;a2<Z;a2++)for(let b2=0;b2<Z;b2++)G.set(ox+x*Z+a2,oy+y*Z+b2,c)}
      text(G,ox,oy+S.fh*Z+6,frameName(row,i),ink,2)}});
  return G}
fs.mkdirSync(path.join(ROOT,'templates','guides'),{recursive:true});
for(const t of ['hero','villager','foe','boss'])guide(t).save(path.join(ROOT,'templates','guides',t+'-guide.png'));
let made=0,kept=0;
for(const a of A){const dir=path.join(ROOT,a.folder);fs.mkdirSync(dir,{recursive:true});const f=path.join(dir,a.file+'.png');
  if(fs.existsSync(f)){kept++;continue}const {w,h}=sheetSize(a.type);canvas(w,h).save(f);made++}
/* ASSETS.md */
const types=Object.entries(SHEET).map(([t,S])=>{const {w,h}=sheetSize(t);return `| \`${t}\` | ${S.fw} × ${S.fh} | ${w} × ${h} | ${S.rows.map((r,i)=>`row ${i+1}: ${r[0]} (${r[1]})`).join('; ')} | ${S.note} | \`templates/${t}-${w}x${h}.png\` |`});
const groups={};for(const a of A){const g=a.folder.split('/').slice(0,2).join('/');(groups[g]=groups[g]||[]).push(a)}
const isDrawn=a=>{const f=path.join(ROOT,a.folder,a.file+'.png');const b=fs.readFileSync(f);return b.length>200&&!/^\x89PNG/.test('')&&!emptyPng(f)};
function emptyPng(f){try{const b=fs.readFileSync(f);let p=8,idat=[];let w=0,h=0;while(p<b.length){const l=b.readUInt32BE(p),t=b.toString('latin1',p+4,p+8);if(t==='IHDR'){w=b.readUInt32BE(p+8);h=b.readUInt32BE(p+12)}if(t==='IDAT')idat.push(b.slice(p+8,p+8+l));p+=12+l}
  const raw=zlib.inflateSync(Buffer.concat(idat));for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(raw[y*(w*4+1)+1+x*4+3]!==0)return false;return true}catch(e){return false}}
let md=`# Kobold Quest v6: every art asset

*Generated by \`node tools/assets.js\` (safe to re-run: it never overwrites a drawn file). Every asset is a **sprite sheet**: one
PNG, animations in rows, frames left to right, each frame the size below. Every file is already here as an **empty, fully
transparent placeholder**, in its folder, and \`tools/placeholder-art.py\` has drawn a simple stand-in in each (22 Oct; their hashes are in
\`placeholders.json\`, so a file you change counts as your drawing and is never touched). The game shows the stand-ins until you draw over them; your drawing is on the
website about 2 minutes after you push it to \`main\`. Characters,
foes, bosses and the main map tiles are wired (build step 19); the hero's sheet is drawn orange and recoloured to the hero's colour. Pixel art at twice Ruby's resolution, characters one tile in size (\`docs/style-guide.md\`).*

## How to draw one

1. Open the asset's file in Paint.NET (a stand-in at the right size: select all and delete it, or draw over it).
2. **Layers → Import from file** → the sheet's template from \`templates/\`. It shows each frame's border (pink), its label in
   the top-left corner (blue: **DN1** is walk down, frame 1; the list is below), the feet line (red, characters only), the safe box
   (green, everything but characters) and a dotted diagonal on frames the sheet doesn't use. \`templates/guides/\` has each
   character sheet blown up with every frame named in words, to keep open beside the drawing.
3. Draw on the bottom layer, frame by frame, one pixel per pixel, antialiasing off. **Delete the template layer**, save as PNG
   (flatten), commit and push. A file that still matches its hash in \`placeholders.json\` counts as not drawn.

## Sheet types

| type | frame | sheet | rows (frames) | for | template |
|---|---|---|---|---|---|
${types.join('\n')}

**The labels:** DN walk down, UP walk up, SD walk side, ID battle idle, AT attack, CA cast or skill, TK talk, WK walk (a foe on
the map), TELE telegraph; HURT, DOWN (knocked down or defeated), CHR1 and CHR2 (the victory cheer), OFF (storms off). A character
frame is one tile, 32 × 32 (24 Oct, Joakim: characters the size of a tile); a boss is 2 × 2 tiles, 64 × 64.

Characters face **right**; the game flips them for left. Walk cycles are three frames (standing, left foot, right foot), like
Ruby's. "Hurt, down, cheer, cheer" means: frame 1 hurt, frame 2 knocked down, frames 3–4 the victory cheer.

## The list (${A.length} assets; **${A.filter(a=>a.slice).length} are needed for the slice**, marked ★)

`;
for(const [g,list] of Object.entries(groups)){md+=`### ${g}\n\n| | file | what | sheet |\n|---|---|---|---|\n`;
  for(const a of list)md+=`| ${emptyPng(path.join(ROOT,a.folder,a.file+'.png'))?(a.slice?'★':'·'):'✅'} | \`${a.folder}/${a.file}.png\` | ${a.what} | ${a.type} |\n`;md+='\n'}
md+=`## Not drawn as assets

The interface (buttons, panels, bars), the world map, text and the weapon a kobold holds in battle are drawn in code. Item icons
for the special gear use one drawing for all six tiers; the game tints it by the tier's material.
`;
fs.writeFileSync(path.join(ROOT,'ASSETS.md'),md);
console.log(`assets ${A.length} (slice ${A.filter(a=>a.slice).length}); placeholders made ${made}, kept ${kept}; templates ${Object.keys(SHEET).length}`);
