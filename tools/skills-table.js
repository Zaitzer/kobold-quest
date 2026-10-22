#!/usr/bin/env node
'use strict';
/* Kobold Quest: every class's skills, subclasses and talents, with mana priced by the cost rule (balance.md §3, "Skills").
   Arithmetic only. Prints the markdown used in docs/skills.md.   Usage: node tools/skills-table.js                         */

/* ---------------------------------------------------------------- the pricing rules */
const STATUS={slow:1,fall:1.5,root:2,weaken:2,hex:2,stun:3,confuse:4,burn:4,poison:4};
const BASE_H={melee:0.90,ranged:0.66,spell:0.95};
const cv=h=>Math.sqrt((1-h)/h);
function riskValue(mul,kind,hitMod){if(kind==='spell'||!hitMod)return mul;           // the risk premium (balance.md §3)
  const hb=BASE_H[kind],h=Math.min(0.99,Math.max(0.5,hb+hitMod/100));return mul*(h/hb)*(1+0.25*(cv(h)-cv(hb)))}
function price(s){
  if(s.fixed!==undefined)return{mana:s.fixed,how:'set'};
  let m=0,how='';
  if(s.dmg){const [mul,t]=s.dmg;const v=riskValue(mul,s.kind||'melee',s.hit||0);m+=1+3*(v*t-1);how=`1 + 3(${v.toFixed(2)}×${t} − 1)`}
  if(s.heal){const [f,t]=s.heal;const add=1+2*(f/0.45)*t;m+=s.dmg?add-1:add;how+=(how?' + ':'')+`heal ${Math.round(f*100)}%×${t}`}
  if(s.buff){const [bonus,allies,turns]=s.buff;const ae=bonus*allies*turns;m+=Math.max(2,2*ae*0.5-2)+(s.dmg||s.heal?-1:0);how+=(how?' + ':'')+`buff ${ae.toFixed(1)} AE`}
  if(s.ae){m+=2*s.ae+(s.dmg?0:0);how+=(how?' + ':'')+`${s.ae} AE`}
  if(s.status){for(const st of [].concat(s.status)){m+=STATUS[st];how+=` + ${st} ${STATUS[st]}`}}
  return{mana:Math.max(2,Math.round(m)),how:how.replace(/^ \+ /,'')}}
const ap=s=>s.apv||(s.dmg&&s.dmg[1]>=2||((s.dmg&&s.dmg[0]>=2)&&s.kind==='melee')?(s.kind==='melee'&&s.dmg[1]===1?'end':2):1);

/* ---------------------------------------------------------------- the classes
   learn: 'start' | 'talent Ln' (offered from level n) | 'L8' | 'L16' (subclass) ; dmg [multiplier, average targets]
   targets: single 1, line 2, area 2.2, chain 2.5 ; kind melee | ranged | spell ; hit = accuracy modifier            */
const S=(n,learn,eff,o)=>Object.assign({n,learn,eff},o);
const CLASSES={
 Fighter:{weapon:'blades',kit:[
   S('Power bonk','start','a big hit on one foe',{dmg:[1.8,1]}),
   S('Cleave','talent L2','swing through every foe in front (−10 per target)',{dmg:[0.85,2.2],hit:-10}),
   S('Shield bash','talent L5','hit and stun one foe',{dmg:[1.1,1],status:'stun'}),
   S('Battle cry','talent L11','the pack hits 25% harder for 3 turns',{buff:[0.25,4,3]}),
   S('Second wind','talent L14','heal yourself 30%',{heal:[0.30,1]})],
  sub:{'Knight':[S('Shield wall','L8','you and friends beside you take 30% less for 3 turns',{buff:[0.30,3,3]}),S('Challenge','L16','every foe within 4 tiles must attack you for 2 turns (threat ×4)',{ae:2}),'Bulwark: guarding also guards the friends beside you'],
       'Battle master':[S('Whirlwind','L8','spin and hit everything in reach (−10 per target)',{dmg:[1.25,2.2],hit:-10}),S('Riposte','L16','the next melee attack on you this round is answered with ×1.0',{dmg:[1.0,1],apv:1}),'Momentum: each foe you fell gives +1 AP (once a turn)']}},
 Ranger:{weapon:'guns',kit:[
   S('Volley','start','shoot every foe in an area (−10 per target)',{dmg:[0.7,2.2],kind:'ranged',hit:-10}),
   S('Aimed shot','talent L2','a careful, deadly shot (+20 to hit)',{dmg:[2.2,1],kind:'ranged',hit:20}),
   S('Mark','talent L5','the foe takes +30% from the whole pack for 3 hits',{ae:1}),
   S('Arrow rain','talent L11','shots on every foe in a wide area',{dmg:[1.05,2.2],kind:'ranged'}),
   S('Hunter\'s snare','talent L14','a hidden tile: whoever steps on it is rooted 2 turns',{dmg:[0.6,1],kind:'ranged',status:'root'})],
  sub:{'Sniper':[S('Headshot','L8','a perfect shot (+15 to hit)',{dmg:[2.6,1],kind:'ranged',hit:15}),S('Long shot','L16','one shot with steadiness halved (about twice the reach)',{dmg:[1.6,1],kind:'ranged',ae:0.5}),'Deadeye: crit damage +1 (×2.5 instead of ×1.5)'],
       'Scout':[S('Hit and run','L8','shoot, then move again',{dmg:[1.2,1],kind:'ranged',ae:0.5}),S('Flare','L16','reveals every unseen foe; the pack gets +10 accuracy for 2 turns',{buff:[0.10,4,2]}),'Pathfinder: +1 move; difficult tiles cost nothing']}},
 Wizard:{weapon:'wands',kit:[
   S('Ice bolt','start','frost; hit and slow one foe',{dmg:[1.3,1],kind:'spell',status:'slow'}),
   S('Fireball','talent L2','fire on every foe in an area',{dmg:[1.0,2.2],kind:'spell'}),
   S('Stone spike','talent L5','earth, a line of spikes',{dmg:[1.1,2],kind:'spell'}),
   S('Chain lightning','talent L11','storm; jumps between foes, may stun (25%)',{dmg:[0.9,2.5],kind:'spell',ae:0.4}),
   S('Arcane shield','talent L14','yourself: special defence +50% and defence +30% for 3 turns',{buff:[0.4,1,3]})],
  sub:{'Archmage':[S('Meteor','L8','fire from the sky on a wide area',{dmg:[1.5,2.2],kind:'spell'}),S('Spell surge','L16','your next spell this turn is ×1.5 and costs no AP',{ae:1.5}),'Mastery: every spell costs 1 less mana (never under 2)'],
       'Battlemage':[S('Frost nova','L8','frost around you; slows all it hits',{dmg:[1.1,2.2],kind:'spell',status:'slow'}),S('Blink','L16','teleport up to 4 tiles in sight',{ae:1}),'Warded: +30% defence and special defence']}},
 Cleric:{weapon:'holy',kit:[
   S('Heal','start','heal one friend 45%',{heal:[0.45,1]}),
   S('Group heal','talent L2','heal every friend 25% (about 3 hurt on average)',{heal:[0.25,3]}),
   S('Blessing','talent L5','the pack takes 30% less damage for 3 turns',{buff:[0.30,4,3]}),
   S('Smite','talent L11','a holy whack on one foe',{dmg:[1.4,1]}),
   S('Revive','talent L14','raise a fallen friend at 40%',{heal:[0.40,1],ae:2})],
  sub:{'Saint':[S('Sanctuary','L8','friends within 2 tiles heal 30%',{heal:[0.30,2.5]}),S('Purify','L16','every friend loses its statuses',{ae:2}),'Grace: heals +30%'],
       'War cleric':[S('Holy strike','L8','smite and heal yourself 30% of the damage',{dmg:[1.6,1],heal:[0.10,1]}),S('Judgement','L16','holy light on a small area',{dmg:[1.2,2],kind:'spell'}),'Zeal: after you heal, your next hit is +25%']}},
 Monk:{weapon:'fists (or any)',kit:[
   S('Ki strike','start','a hit in the element you choose (×0.8 × (0.5 + Balance))',{dmg:[1.2,1]}),
   S('Ki mend','talent L2','heal a friend 15% × (0.5 + Balance)',{heal:[0.22,1]}),
   S('Flurry','talent L5','three hits of ×0.5 (multiple-attack penalty 0 / −4 / −8)',{dmg:[1.5,1],apv:2}),
   S('Ki ward','talent L11','a friend gains resistance +10 × (0.5 + Balance) for 2 turns',{ae:0.5}),
   S('Ki step','talent L14','move twice this turn',{ae:0.5}),
   S('Adapt','start','swap one of the four equipped skills mid-fight (once a fight; twice at Balance 90%)',{fixed:0})],
  sub:{'Way of the Hand':[S('Palm strike','L8','hit and stun',{dmg:[1.0,1],status:'stun',apv:'end'}),S('Counterflow','L16','dodge +25 this round; each foe that misses you is hit ×0.8',{ae:1}),'Many hands: Flurry has four hits'],
       'Way of the Hearth':[S('Raise cover','L8','half cover on an empty tile beside you for 3 turns',{ae:1}),S('Mend gear','L16','a friend\'s defence +20% for 3 turns',{buff:[0.20,1,3]}),'Master builder: your cover lasts until moved; crafting gives +1 affix']}},
 Sorcerer:{weapon:'orbs',kit:[
   S('Spark','start','cheap fire on one foe',{dmg:[1.2,1],kind:'spell'}),
   S('Ember burst','talent L2','fire in an area',{dmg:[1.0,2.2],kind:'spell'}),
   S('Dragon\'s breath','talent L5','a line of fire that burns (15%)',{dmg:[1.1,2],kind:'spell',ae:0.3}),
   S('Wild surge','talent L11','×1.5 with a random extra effect (neutral on average)',{dmg:[1.5,1],kind:'spell'}),
   S('Heat haze','talent L14','you are unseen for 1 turn',{ae:1})],
  sub:{'Dragonblood':[S('Scales','L8','defence and special defence +40% for 3 turns',{buff:[0.40,1,3]}),S('Dragon roar','L16','weakens every foe within 3 tiles',{status:'weaken',ae:1}),'Fire in the blood: every fire spell burns 15% of the time'],
       'Wild':[S('Surge storm','L8','two Wild surges on one foe',{dmg:[1.5,2],kind:'spell'}),S('Chaos bolt','L16','×2.0 in a random element: a weakness doubles it, a resistance halves it (a gamble with the same average)',{dmg:[2.0,1],kind:'spell'}),'Wild magic: every spell has a 10% chance of a free surge']}},
 Bard:{weapon:'instruments',kit:[
   S('Vicious mockery','start','hit and weaken (−25% attack, 2 turns)',{dmg:[0.8,1],status:'weaken'}),
   S('Rousing song','talent L2','the pack hits 25% harder and takes 25% less for 3 turns',{buff:[0.50,4,3]}),
   S('Lullaby','talent L5','slows every foe in an area',{status:'slow',ae:1}),
   S('Rumour','talent L11','one foe attacks its friends for a turn',{status:'confuse'}),
   S('Ballad of rest','talent L14','friends regain 8% a turn for 3 turns',{heal:[0.24,2]})],
  sub:{'Lore':[S('Cutting words','L8','the foe\'s next attack does 50% less',{ae:1}),S('Countersong','L16','the pack gains resistance +20 for 3 turns',{buff:[0.15,4,3]}),'Encore: songs last one turn longer'],
       'Valor':[S('Valiant strike','L8','a sword hit; your song\'s bonus doubles on it',{dmg:[1.4,1]}),S('Battle hymn','L16','sing while you fight: Rousing song costs no action this turn',{ae:1}),'Duelist: +20% defence while singing']}},
 Rogue:{weapon:'daggers',kit:[
   S('Sneak attack','start','×2.4 on a stunned, flanked, unseen or unaware foe, else ×1.2',{dmg:[1.8,1],apv:'end'}),
   S('Trap','talent L2','a hidden tile: ×1.2 and stun to whoever steps on it',{dmg:[1.2,1],status:'stun'}),
   S('Slip past','talent L5','move through foes with no free hits',{ae:1}),
   S('Hide','talent L11','you are unseen until you attack (not next to a foe)',{ae:1}),
   S('Pickpocket','talent L14','×0.6 and steal a material',{dmg:[0.6,1],ae:0.5,apv:'end'})],
  sub:{'Thief':[S('Smoke bomb','L8','the whole pack is unseen for 1 turn',{ae:2}),S('Lift','L16','steal the foe\'s next turn\'s buff or a potion it carries',{ae:1}),'Fortune: +2 luck'],
       'Trapper':[S('Spike trap','L8','×1.5 and root to whoever steps on it',{dmg:[1.5,1],status:'root'}),S('Trap field','L16','three traps at once in an area',{dmg:[1.2,2],status:'stun'}),'Hair trigger: traps stun for 2 turns']}},
 Barbarian:{weapon:'axes',kit:[
   S('Reckless swing','start','×2.4, you take +25% next turn',{dmg:[2.4,1],ae:-0.5}),
   S('Rage','talent L2','+30% attack and −20% damage taken for 3 turns',{buff:[0.5,1,3]}),
   S('Stomp','talent L5','hit everything next to you',{dmg:[0.9,2.2]}),
   S('Shrug it off','talent L11','heal yourself 30%',{heal:[0.30,1]}),
   S('Leap','talent L14','jump up to 3 tiles and hit ×1.0 where you land',{dmg:[1.0,1],ae:0.5})],
  sub:{'Berserker':[S('Frenzy','L8','two hits of ×1.0 (only below half HP)',{dmg:[2.0,1],ae:-0.5,apv:'end'}),S('Unstoppable','L16','immune to stun, fall and root for 3 turns',{ae:1}),'Fury: +35% damage below half HP'],
       'Totem':[S('Bear totem','L8','the pack takes 15% less for 3 turns',{buff:[0.15,4,3]}),S('Wolf totem','L16','the pack gets +1 move for 3 turns',{ae:1.5}),'Spirit guard: once a fight, you get up at 20% when you fall']}},
 Paladin:{weapon:'blades',kit:[
   S('Smite','start','a holy whack on one foe',{dmg:[1.7,1]}),
   S('Lay on hands','talent L2','heal a friend 60%',{heal:[0.60,1]}),
   S('Guard','talent L5','take the next hit for a friend beside you',{ae:1}),
   S('Oath','talent L11','friends within 1 tile take 20% less for 3 turns',{buff:[0.20,3,3]}),
   S('Divine shield','talent L14','you ignore the next hit',{ae:1.5})],
  sub:{'Devotion':[S('Aura of warding','L8','the pack gains resistance +15 for 3 turns',{buff:[0.12,4,3]}),S('Sacred ground','L16','a 3 × 3 area heals 10% a turn for 3 turns',{heal:[0.30,2]}),'Steadfast: you cannot fall while a friend stands beside you (once a fight)'],
       'Vengeance':[S('Vow','L8','one foe takes +30% from you until it falls',{ae:1}),S('Avenging strike','L16','×2.0 and heal yourself 20%',{dmg:[2.0,1],heal:[0.20,1],apv:'end'}),'Relentless: +1 move toward your vowed foe']}},
 Druid:{weapon:'nature',kit:[
   S('Vine snare','start','root a foe for 2 turns (it can still attack)',{dmg:[0.5,1],status:'root'}),
   S('Plant cover','talent L2','a bush gives half cover for 3 turns',{ae:1}),
   S('Thorns','talent L5','friends reflect 20% of melee damage for 3 turns',{buff:[0.20,4,3]}),
   S('Rain','talent L11','friends in the area regain 15% a turn for 3 turns',{heal:[0.45,2]}),
   S('Poison spores','talent L14','nature; a cloud that poisons',{dmg:[0.6,2.2],kind:'spell',status:'poison'})],
  sub:{'Land':[S('Bloom','L8','heal three friends 25%',{heal:[0.25,3]}),S('Grove','L16','trees grow in a 3 × 3 area: half cover and 8% healing a turn for 3 turns',{heal:[0.24,2],ae:1}),'Green thumb: plant skills last one turn longer'],
       'Moon':[S('Bear shape','L8','become a bear for 3 turns: HP ×1.5, melee ×1.3',{buff:[0.4,1,3]}),S('Maul','L16','a bear\'s swipe: ×1.6 and knock down (fall)',{dmg:[1.6,1],status:'fall'}),'Moonlit hide: +30% defence in bear shape']}},
 Warlock:{weapon:'teapots',kit:[
   S('Teapot blast','start','steady ranged fire',{dmg:[1.3,1],kind:'spell'}),
   S('Hex','talent L2','the foe takes +25% from everything for 3 turns',{status:'hex'}),
   S('Whisper','talent L5','a friend gets +20% attack and +10 dodge for 3 turns',{buff:[0.30,1,3]}),
   S('Brew','talent L11','×1.2 drain: heal yourself half the damage',{dmg:[1.2,1],kind:'spell',heal:[0.10,1]}),
   S('Pact boon','talent L14','×2.5 once a fight; you lose 10% of your HP',{dmg:[2.5,1],kind:'spell',ae:-0.5,apv:'end'})],
  sub:{'The Teapot':[S('Boiling spout','L8','a line of fire that burns (15%)',{dmg:[1.0,2],kind:'spell',ae:0.3}),S('Steam cloud','L16','the pack is unseen for 1 turn',{ae:2}),'Kettle\'s patience: +1 mana each turn'],
       'The Sourdough Starter':[S('Gooey slow','L8','an area of goo: slows',{dmg:[0.7,2.2],kind:'spell',status:'slow'}),S('Rise','L16','drain in an area: heal yourself a third of the damage',{dmg:[1.0,2.2],kind:'spell',heal:[0.10,1]}),'Starter culture: poisons last one turn longer']}},
};

/* ---------------------------------------------------------------- talents */
const PASSIVES={
 Fighter:['Tough: +3% HP','Weapon focus: +3% attack','Iron skin: +7.5% defence','Shield training: guarding gives +10 more dodge'],
 Ranger:['Sharp eye: +3 accuracy','Steady hands: −0.6 steadiness','Swift feet: +1 speed','Quick draw: +3 initiative'],
 Wizard:['Arcane mind: +3% mana','Spell power: +3% special attack','Focus: −0.6 steadiness for spells','Elemental study: your resisted spells deal 60% instead of 50%'],
 Cleric:['Devotion: +3% mana','Vigour: +3% HP','Gentle hands: heals +4%','Faith: +9 resistance'],
 Monk:['Centre: +1 to your lowest score (counts toward Balance)','Light step: +1 speed','Ki well: +3% ki','Open palm: +3% attack and special attack while Balance is 90% or more'],
 Sorcerer:['Spell power: +3% special attack','Ember blood: +3% HP','Kindling: fire spells burn 3% of the time','Volatile: crit damage +0.15'],
 Bard:['Showmanship: songs +4% stronger','Charm: +3 initiative','Encouragement: +0.4 morale for the pack','Quick tongue: +3% mana'],
 Rogue:['Precision: +1.5% crit chance','Shadow: +3 dodge','Sticky fingers: +5% materials from fights','Opportunist: +6% damage to flanked foes'],
 Barbarian:['Thick hide: +7.5% defence','Brawn: +3% attack','Bloodlust: heal 2% when you fell a foe','Hard head: +9 resistance'],
 Paladin:['Faith: +9 resistance','Sturdy: +3% HP','Holy might: +3% attack','Mercy: Lay on hands +6%'],
 Druid:['Bark skin: +7.5% defence','Wild growth: plant skills +4% stronger','Nature\'s gift: +3% mana','Deep roots: +9 resistance'],
 Warlock:['Spell power: +3% special attack','Dark pact: +3% mana','Bitter brew: hexes +4% stronger','Stubborn: +9 resistance'],
};

function md(){
  const out=[];
  for(const [c,C] of Object.entries(CLASSES)){
    out.push(`### ${c} (${C.weapon})\n`);
    out.push('| skill | learned | what it does | AP | mana | priced as |','|---|---|---|---|---|---|');
    for(const s of C.kit){const p=price(s);out.push(`| **${s.n}** | ${s.learn} | ${s.eff} | ${ap(s)} | ${p.mana} | ${p.how||'—'} |`)}
    for(const [sn,arr] of Object.entries(C.sub)){for(const s of arr.slice(0,2)){const p=price(s);out.push(`| **${s.n}** | ${sn}, ${s.learn} | ${s.eff} | ${ap(s)} | ${p.mana} | ${p.how||'—'} |`)}
      out.push(`| *${arr[2].split(':')[0]}* | ${sn}, L24 | ${arr[2].split(':').slice(1).join(':').trim()} (passive) | — | — | the capstone |`)}
    out.push(`\n**${c} talent passives** (each about 3 pp, can be taken more than once): ${PASSIVES[c].join('; ')}.\n`)}
  return out.join('\n')}
module.exports={CLASSES,PASSIVES,price,md};
if(require.main===module)console.log(md());
