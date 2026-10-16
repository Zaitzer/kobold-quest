const RP_E={
  scout:{n:'Mossback scout',w:'stick',team:1,hp:25,atk:8,def:1,spd:4,xp:6,gold:4,sight:1},
  slinger:{n:'Mossback slinger',w:'popgun',team:1,hp:21,atk:9,def:0,spd:5,xp:7,gold:4},
  thief:{n:'Fish thief',w:'fish',team:2,hp:17,atk:7,def:0,spd:8,xp:5,gold:6},
  apprentice:{n:'Grape apprentice',w:'firewand',team:3,hp:39,atk:11,def:2,spd:5,xp:15,gold:8,all:.3},
  bruiser:{n:'Grape bruiser',w:'bone',team:3,hp:57,atk:13,def:4,spd:4,xp:16,gold:8},
  frostbandit:{n:'Frost bandit',w:'frostrod',team:2,hp:44,atk:11,def:3,spd:6,xp:15,gold:8,slow:.3},
  sentry:{n:'Spore sentry',w:'pan',team:1,hp:76,atk:16,def:8,spd:4,xp:26,gold:11,stun:.2},
  gunner:{n:'Cave gunner',w:'blunder',team:1,hp:60,atk:15,def:4,spd:6,xp:26,gold:13,all:.35},
  shaman:{n:'Fungus shaman',w:'healwand',team:1,hp:53,atk:10,def:4,spd:7,xp:24,gold:10,healer:1},
  guard:{n:'Royal guard',w:'sword',team:3,hp:110,atk:24,def:11,spd:7,xp:48,gold:21},
  wizard:{n:'Court wizard',w:'archstaff',team:3,hp:87,atk:21,def:6,spd:8,xp:48,gold:21,all:.4},
  cannoneer:{n:'Hoard cannoneer',w:'cannon',team:3,hp:99,atk:31,def:8,spd:3,xp:48,gold:24},
  gorb:{n:'Chief Gorb',w:'club',team:1,hp:540,atk:27,def:8,spd:5,xp:140,gold:84,size:1.5,boss:1,smash:3,hat:'pot'},
  vexx:{n:'King Vexx',w:'sword',team:3,hp:1450,atk:47,def:12,spd:8,xp:0,gold:350,size:1.8,boss:1,smash:3,hat:'crown'},
  lancer:{n:'Hoard lancer',w:'spear',team:3,hp:95,atk:22,def:9,spd:6,xp:46,gold:20}
};
const RP_ZONE={',':{n:'Bandit Meadow',t:{scout:3,slinger:3,thief:2},max:2},';':{n:'Whisper Woods',t:{apprentice:2,bruiser:2,frostbandit:2,scout:1},max:3},
  C:{n:'Mushroom Cave',t:{sentry:2,gunner:2,shaman:1},max:3},g:{n:'Mushroom Cave',t:{sentry:2,gunner:2,shaman:1},max:3},K:{n:"Dragon's Hoard",t:{guard:2,wizard:2,cannoneer:1,lancer:2},max:2}};
export {RP_E,RP_ZONE};
