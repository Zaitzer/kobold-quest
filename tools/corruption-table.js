#!/usr/bin/env node
'use strict';
/* Kobold Quest: corruption's dark versions, one for every skill and capstone of every class (docs/corruption.md).
   The rule (one rule, so nothing is guessed): a dark version keeps its skill's role, mana and AP; its main number (damage multiplier,
   heal, buff bonus, status chance and length) is ×1.25 (×1.40 from corruption 50); each cast adds +1 corruption to the caster.
   The power is paid through morale: every 10 of the pack's total corruption is −1 pack morale (balance.md §3).
   Usage: node tools/corruption-table.js   (prints the tables for docs/corruption.md)                                          */
const {CLASSES}=require('./skills-table.js');

/* the dark twin of every skill: [dark name, what it looks like and does differently in flavour] */
const DARK={
 'Power bonk':['Grudge bonk','the stick glows purple and remembers who it hit'],'Cleave':['Hate cleave','a black arc that leaves a smear in the air'],
 'Shield bash':['Spite bash','the shield face grows teeth for a moment'],'Battle cry':['War howl','a cry that makes friends hit harder and flowers wilt'],
 'Second wind':['Stolen breath','breath drawn from the cold air around the foes'],'Shield wall':['Iron grudge','a wall of shields with spikes turned inward'],
 'Challenge':['Taunt of ash','foes must come at you; their eyes burn red'],'Whirlwind':['Black whirl','a spin that drags smoke behind it'],'Riposte':['Spite riposte','the answer comes before the question'],
 'Volley':['Thorn volley','black-fletched shots that whistle'],'Aimed shot':['Cruel aim','a shot at the softest spot'],'Mark':['Doom mark','a mark only the pack can see, like a bruise'],
 'Arrow rain':['Ash rain','a rain of shots that leaves soot on the board'],'Hunter\'s snare':['Biting snare','the snare has teeth'],'Headshot':['Grim shot','one shot, no sound'],
 'Long shot':['Shadow shot','the shot vanishes and reappears at the target'],'Hit and run':['Cut and vanish','shoot, then melt into the nearest shadow'],'Flare':['Black flare','a flare of dark light that shows every heartbeat'],
 'Ice bolt':['Grave frost','frost that crackles like old bones'],'Fireball':['Hellfire','purple fire that burns cold'],'Stone spike':['Bone spike','spikes of grey stone shaped like ribs'],
 'Chain lightning':['Black lightning','a jumping bolt the colour of a bruise'],'Arcane shield':['Shadow mantle','a cloak of smoke that drinks the blows'],'Meteor':['Falling star of ash','a star that should not be there'],
 'Spell surge':['Overcharge','the next spell crackles purple'],'Frost nova':['Grave nova','a ring of grey frost'],'Blink':['Shadow step','you step out of your own shadow'],
 'Heal':['Borrowed life','the wound closes with warmth taken from somewhere else'],'Group heal':['Blood tithe','everyone heals; the grass around goes grey'],'Blessing':['Dark covenant','the pack is shielded by something that watches'],
 'Smite':['Wrath','the holy whack lands with a black flash'],'Revive':['Raise again','the fallen get up a little too quickly'],'Sanctuary':['Shadow sanctuary','a circle of dusk where wounds close'],
 'Purify':['Devour','statuses are eaten rather than cleansed'],'Holy strike':['Unholy strike','a smite that heals you from the foe\'s hurt'],'Judgement':['Condemnation','a small area of grey light'],
 'Ki strike':['Void strike','the element is always "nothing", and nothing hurts'],'Ki mend':['Ki theft','a mend paid for with a foe\'s breath'],'Flurry':['Hungry flurry','three hits that each want more'],
 'Ki ward':['Void ward','resistance from a hollow in the air'],'Ki step':['Void step','two moves through a gap in the world'],'Adapt':['Unmake','swap a skill, and the old one is forgotten for the fight'],
 'Palm strike':['Hollow palm','a strike that stops the breath'],'Counterflow':['Spite flow','every miss on you is punished'],'Raise cover':['Bone wall','cover built from old, grey stone'],'Mend gear':['Cursed fit','a friend\'s gear fits too well'],
 'Spark':['Black spark','a spark that burns purple'],'Ember burst':['Ash burst','a burst that leaves the tiles grey'],'Dragon\'s breath':['Wyrm breath','breath the colour of an old bruise'],
 'Wild surge':['Chaos surge','the surge table, but the good results are darker'],'Heat haze':['Shadow haze','a haze nobody sees through'],'Scales':['Black scales','scales like burnt glass'],
 'Dragon roar':['Dread roar','a roar that makes small foes forget their names'],'Surge storm':['Chaos storm','a storm of wild magic, all of it hungry'],'Chaos bolt':['Ruin bolt','chaos, but it always picks the worst'],
 'Vicious mockery':['Venom tongue','words that sting for days'],'Rousing song':['War dirge','a song that makes the pack fierce and a little mean'],'Lullaby':['Dread lullaby','a lullaby with the wrong ending'],
 'Rumour':['Poison whisper','a rumour that is half true and all cruel'],'Ballad of rest':['Ballad of debts','rest now, pay later (in morale, by the rule)'],'Cutting words':['Flaying words','every word leaves a mark'],
 'Countersong':['Silence','a song that stops other songs'],'Valiant strike':['Vainglorious strike','a strike for the crowd, not the cause'],'Battle hymn':['Battle dirge','a hymn sung backwards'],
 'Sneak attack':['Backstab','the same strike, with no warning and no mercy'],'Trap':['Cruel trap','a trap with a nasty surprise inside'],'Slip past':['Shadow slip','through foes like smoke'],
 'Hide':['Vanish','gone, and the foes feel watched'],'Pickpocket':['Rob','take the material and a little of their courage'],'Smoke bomb':['Black smoke','smoke that smells of old fires'],
 'Lift':['Plunder','steal twice as much, with nothing left behind'],'Spike trap':['Barbed trap','spikes that hook'],'Trap field':['Killing field','a field of traps that hum'],
 'Reckless swing':['Ruinous swing','a swing that does not care what it hits'],'Rage':['Black rage','rage that burns blue-black'],'Stomp':['Quake of spite','a stomp that cracks the board'],
 'Shrug it off':['Feed on it','a fallen foe\'s strength becomes yours'],'Leap':['Pounce','a leap that lands claws first'],'Frenzy':['Blood frenzy','a frenzy that smells the hurt'],
 'Unstoppable':['Relentless dark','nothing slows you, nothing at all'],'Bear totem':['Dread totem','a totem with too many eyes'],'Wolf totem':['Hunger totem','a totem that howls at nothing'],
 'Lay on hands':['Lay on claws','healing hands with a cold touch'],'Guard':['Hold hostage','you take the hit for a friend, and the foe pays for it'],'Oath':['Dark oath','an aura that promises pain to whoever hurts your friends'],
 'Divine shield':['Shadow shield','a shield of dusk'],'Aura of warding':['Aura of dread','foes near you shake'],'Sacred ground':['Cursed ground','ground that bites at foes'],
 'Vow':['Blood vow','a vow sealed with a scratch'],'Avenging strike':['Vengeful strike','a strike that remembers every hurt'],
 'Vine snare':['Strangling vines','vines that squeeze'],'Plant cover':['Thorn hedge','a bush of black thorns'],'Thorns':['Barbs','thorns that hook and stay'],
 'Rain':['Blood rain','a warm, red-tinted rain that heals the pack'],'Poison spores':['Rot spores','spores that smell of a cellar'],'Bloom':['Grave bloom','grey flowers that heal'],
 'Grove':['Dead grove','a grove of leafless trees'],'Bear shape':['Dire shape','a bear made of shadow'],'Maul':['Rend','a maul that tears'],
 'Teapot blast':['Kettle of woe','the teapot boils over with something black'],'Hex':['Doom hex','a hex that grins'],'Whisper':['Dark counsel','the teapot\'s advice is good, and unkind'],
 'Brew':['Foul brew','a brew that works, and tastes of regret'],'Pact boon':['Deeper pact','the teapot asks for a little more'],'Boiling spout':['Scalding spout','a line of black steam'],
 'Steam cloud':['Choking cloud','a cloud that coughs back'],'Gooey slow':['Tar slow','goo like tar'],'Rise':['Rise, starter','the sourdough starter lifts a friend, a little too eagerly'],
};
/* the dark capstones: the same passive, ×1.25 (×1.4 at 50), and a darker name */
const DARK_CAP={'Bulwark':'Bulwark of spite','Momentum':'Bloodlust','Deadeye':'Death\'s eye','Pathfinder':'Shadow path','Mastery':'Forbidden mastery','Warded':'Shrouded',
 'Grace':'Borrowed grace','Zeal':'Fervour','Many hands':'Many claws','Master builder':'Bone mason','Fire in the blood':'Ash in the blood','Wild magic':'Chaos magic',
 'Encore':'Dirge','Duelist':'Bully','Fortune':'Ill fortune (yours is good)','Hair trigger':'Cruel trigger','Fury':'Black fury','Spirit guard':'Spite guard',
 'Steadfast':'Unyielding','Relentless':'Hunter of grudges','Green thumb':'Black thumb','Moonlit hide':'Moonless hide','Starter culture':'Old culture','Kettle\'s patience':'Kettle\'s grudge'};

/* print one table per class */
const out=[],missing=[];let n=0;
for(const [cls,C] of Object.entries(CLASSES)){
  out.push(`### ${cls}\n\n| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |\n|---|---|---|---|`);
  const row=(s,when)=>{const d=DARK[s.n];if(!d){missing.push(s.n);return}n++;out.push(`| ${s.n} | **${d[0]}** | ${d[1]} | ${when} |`)};
  C.kit.forEach(s=>row(s,'corruption 10'));
  for(const [sub,list] of Object.entries(C.sub||{}))list.forEach(x=>{if(typeof x==='string'){const nm=x.split(':')[0];const d=DARK_CAP[nm];if(!d){missing.push(nm);return}n++;out.push(`| *${nm}* (${sub} capstone) | **${d}** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |`)}
    else row(x,`corruption 25 (${sub})`)});
  out.push('')}
if(require.main===module){console.log(out.join('\n'));
console.log(`\n${n} dark versions.`+(missing.length?` MISSING: ${missing.join(', ')}`:' Every skill and capstone has one.'))}
module.exports={DARK,DARK_CAP};
