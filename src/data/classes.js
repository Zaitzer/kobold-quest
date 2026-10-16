const RP_SK={
  bonk:{n:'Power bonk',mp:3,t:'foe',mul:1.8,d:'A big hit on one foe'},
  clang:{n:'Clang',mp:4,t:'foe',mul:1,stun:1,d:'Hit and stun one foe'},
  smash:{n:'Ground smash',mp:6,t:'foes',mul:.9,d:'Hit every foe'},
  volley:{n:'Volley',mp:4,t:'foes',mul:.7,d:'Shoot every foe'},
  bigshot:{n:'Big shot',mp:5,t:'foe',mul:2.3,d:'A huge shot on one foe'},
  ice:{n:'Ice bolt',mp:3,t:'foe',mul:1.3,slow:1,d:'Hit and maybe freeze one foe'},
  fireball:{n:'Fireball',mp:5,t:'foes',mul:1,d:'Burn every foe'},
  meteor:{n:'Meteor',mp:8,t:'foes',mul:1.5,d:'Rain fire on every foe'},
  heal:{n:'Heal',mp:3,t:'ally',heal:.45,d:'Heal one friend'},
  mend:{n:'Group heal',mp:7,t:'allies',heal:.25,d:'Heal the whole party'},
  warcry:{n:'Battle cry',mp:4,t:'allies',buff:'atk',d:'Party hits 25% harder for 3 turns'},
  bless:{n:'Blessing',mp:5,t:'allies',buff:'def',d:'Party takes 30% less damage for 3 turns'},
  revive:{n:'Revive',mp:8,t:'down',revive:.4,d:'Raise a fallen friend at 40% health'},
  cleave:{n:'Cleave',mp:5,t:'foes',mul:.85,d:'Swing through every foe'},
  aimed:{n:'Aimed shot',mp:4,t:'foe',mul:2.2,d:'A careful, deadly shot'},
  bash:{n:'Shield bash',mp:4,t:'foe',mul:1.1,stun:1,d:'Hit and stun one foe'},
  chain:{n:'Chain lightning',mp:6,t:'foes',mul:.9,stunP:.25,d:'Zap every foe, may stun'},
  smite:{n:'Smite',mp:4,t:'foe',mul:1.7,d:'A holy whack on one foe'},
  drain:{n:'Life drain',mp:5,t:'foe',mul:1.3,drain:.5,d:'Hurt a foe and heal yourself'},
  rain:{n:'Arrow rain',mp:6,t:'foes',mul:1.05,d:'Shots on every foe'},
  shieldwall:{n:'Shield wall',mp:4,t:'allies',buff:'def',d:'You and friends next to you take 30% less damage'},
  whirl:{n:'Whirlwind',mp:5,t:'foes',mul:1.25,d:'Spin and hit everything in reach'},
  headshot:{n:'Headshot',mp:5,t:'foe',mul:2.6,d:'A perfect shot (+15 to hit)'},
  nova:{n:'Frost nova',mp:7,t:'foes',mul:1.1,slow:1,d:'Freeze everything around you'},
  sanct:{n:'Sanctuary',mp:8,t:'allies',heal:.3,d:'Heal friends near you'},
  holy:{n:'Holy strike',mp:4,t:'foe',mul:1.6,drain:.3,d:'Smite a foe and heal yourself'}
};
/* ---------- Kobold Quest: classes, talents and equipment ---------- */
const RP_CLS={
  warrior:{n:'Warrior',d:'Tough melee fighter. Most health and defence.',wk:['stick','bone','pan','sword','club','spear'],base:{hp:44,mp:8,atk:5,def:3,spd:5},gr:{hp:11,mp:2,atk:2.2,def:1.8,spd:.5},sk:['bonk'],hat:'pot',start:'stick'},
  ranger:{n:'Ranger',d:'Fast shooter who often strikes first.',wk:['popgun','blunder','cannon'],base:{hp:36,mp:10,atk:5,def:2,spd:6.5},gr:{hp:8,mp:2.5,atk:2.4,def:1.1,spd:.9},sk:['volley'],hat:'leaf',start:'popgun'},
  mage:{n:'Mage',d:'Spells that hit every foe at once. Fragile.',wk:['frostrod','firewand','archstaff'],base:{hp:32,mp:16,atk:5,def:1,spd:5},gr:{hp:7,mp:4.5,atk:2.3,def:1,spd:.6},sk:[],hat:'wizard',start:'frostrod'},
  cleric:{n:'Cleric',d:'Heals and shields the party.',wk:['healwand','pan','bone'],base:{hp:38,mp:14,atk:4,def:2.5,spd:5},gr:{hp:9,mp:4,atk:1.7,def:1.5,spd:.6},sk:['heal'],hat:'flower',start:'healwand'}
};
const RP_TAL={
  warrior:{toughness:{n:'Toughness',d:'+14 max health',st:{hp:14},rep:1},might:{n:'Might',d:'+3 attack',st:{atk:3},rep:1},ironskin:{n:'Iron skin',d:'+2.5 defence',st:{def:2.5},rep:1},
    cleave:{n:'Cleave',d:'Skill: hit every foe',sk:'cleave'},bash:{n:'Shield bash',d:'Skill: hit and stun',sk:'bash'},warcry:{n:'Battle cry',d:'Skill: party +25% attack',sk:'warcry',lvl:3},
    troll:{n:'Troll blood',d:'Regain 6% health each turn',pas:{regen:.06}},rage:{n:'Berserker',d:'+35% damage below half health',pas:{rage:.35},lvl:4}},
  ranger:{sharp:{n:'Sharp eye',d:'+3 attack',st:{atk:3},rep:1},swift:{n:'Swift feet',d:'+1.5 speed',st:{spd:1.5},rep:1},hardy:{n:'Hardy',d:'+12 max health',st:{hp:12},rep:1},
    aimed:{n:'Aimed shot',d:'Skill: a deadly single shot',sk:'aimed'},rain:{n:'Arrow rain',d:'Skill: strong shots on every foe',sk:'rain',lvl:4},
    eagle:{n:'Eagle eye',d:'+12% critical hit chance',pas:{crit:.12}},evade:{n:'Evasion',d:'15% chance to dodge attacks',pas:{dodge:.15}}},
  mage:{arcane:{n:'Arcane mind',d:'+8 max mana',st:{mp:8},rep:1},power:{n:'Spell power',d:'+3 attack',st:{atk:3},rep:1},ward:{n:'Warding',d:'+2 defence, +8 health',st:{def:2,hp:8},rep:1},
    fireball:{n:'Fireball',d:'Skill: burn every foe',sk:'fireball'},chain:{n:'Chain lightning',d:'Skill: zap all, may stun',sk:'chain',lvl:3},meteor:{n:'Meteor',d:'Skill: huge fire on every foe',sk:'meteor',lvl:6},
    drain:{n:'Life drain',d:'Skill: steal health',sk:'drain'},spring:{n:'Mana spring',d:'Regain 2 mana each turn',pas:{mpregen:2}}},
  cleric:{devotion:{n:'Devotion',d:'+8 max mana',st:{mp:8},rep:1},sanct:{n:'Sanctuary',d:'+2.5 defence',st:{def:2.5},rep:1},vigor:{n:'Vigour',d:'+12 max health',st:{hp:12},rep:1},
    mend:{n:'Group heal',d:'Skill: heal the whole party',sk:'mend'},bless:{n:'Blessing',d:'Skill: party takes less damage',sk:'bless',lvl:3},revive:{n:'Revive',d:'Skill: raise a fallen friend',sk:'revive',lvl:4},
    smite:{n:'Smite',d:'Skill: a holy whack',sk:'smite'},grace:{n:'Grace',d:'Regain 5% health and 1 mana each turn',pas:{regen:.05,mpregen:1}}}
};
/* ---------- promotions at level 8 ---------- */
const RP_ADV={
  knight:{n:'Knight',base:'warrior',d:'+3 defence, +20 health. Shield wall: you and friends next to you take less damage.',st:{def:3,hp:20},gr:{def:.6,hp:4},sk:'shieldwall'},
  berserker:{n:'Berserker',base:'warrior',d:'+3 attack, fury below half health. Whirlwind: hit everything in reach.',st:{atk:3},pas:{rage:.2},gr:{atk:.8},sk:'whirl'},
  sniper:{n:'Sniper',base:'ranger',d:'+2 range, +10% crits. Headshot: a perfect, crushing shot.',st:{rng:2},pas:{crit:.1},gr:{atk:.6},sk:'headshot'},
  scout:{n:'Scout',base:'ranger',d:'+1 move, +2 sight. Every attack is quick: hit and run.',st:{mov:1,sight:2,spd:1},pas:{quick:1},gr:{spd:.3},sk:'aimed'},
  archmage:{n:'Archmage',base:'mage',d:'+10 mana, spells hit 25% harder. Learns Meteor.',st:{mp:10},pas:{spellp:.25},gr:{mp:2},sk:'meteor'},
  battlemage:{n:'Battlemage',base:'mage',d:'+25 health, +3 defence. Frost nova: freeze everything around you.',st:{hp:25,def:3},gr:{hp:5,def:.5},sk:'nova'},
  saint:{n:'Saint',base:'cleric',d:'Heals are 30% stronger, +10 mana. Sanctuary: heal friends near you.',st:{mp:10},pas:{healp:.3},gr:{mp:2},sk:'sanct'},
  paladin:{n:'Paladin',base:'cleric',d:'+4 attack, +2 defence. Holy strike: hit a foe and heal yourself.',st:{atk:4,def:2},gr:{atk:.6,def:.4},sk:'holy'}
};
export {RP_ADV,RP_CLS,RP_SK,RP_TAL};
