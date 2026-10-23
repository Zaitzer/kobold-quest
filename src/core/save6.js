/* ---------- Kobold Quest v6: the character save (build step 3; systems.md §11, §16) ----------
   One document per character (a hero and everything that belongs to it). The account's shared part and the slot list are a
   separate document (build step 14). This module builds, checks, upgrades and stores saves.
   Server paths (step 14): data/users/<account>/char<slot>, data/users/<account>/lock<slot>. */

const SAVE6_VERSION=1,SAVE6_EPOCH=3,SLOTS6=6;
/* the kobold fields a save keeps (systems.md §11: level, XP, scores, talents, skills equipped and known, dark or plain, gear, HP, mana,
   bond, streak, corruption); everything else on a kobold is rebuilt from these */
const KOBOLD_KEYS=['v6','name','cls','lvl','xp','scores','start','passives','gear','skills','known','ranks','sub','dark','bond','streak','corr','luck','pend','hero','lead','hp','mp','colour','cid','noclass','w'];
/* a new character: the hero alone, before the yard drill gives it a class (slice-dialogue.md) */
function v6NewSave(opt){opt=opt||{};const name=v6HeroName(opt.name)||'Pip';
  return{v:SAVE6_VERSION,epoch:SAVE6_EPOCH,created:opt.now||0,savedAt:0,played:0,
    hero:{name,colour:opt.colour||'orange',renamed:false},
    q:{act:0},seals:[],                          // the story's flags (act, pb, grubb, miner_*, side quests, bounties); seals: the Smiler pieces (the old key)
    party:[],roster:[],                          // the pack (the old key) and every companion who has joined; kobolds as KOBOLD_KEYS
    gold:0,bag:{},buns:3,inv:[],                 // gold, consumables, the backpack; ember-buns left (three in the whole game)
    fountains:[],stables:[],respawn:null,        // fountains drunk from, stables visited, where a loss sends you
    bossDefeats:{},chests:[],patrols:0,fame:0,   // softening, chests opened, patrols beaten since the last rest, fame
    place:{map:'hearthspire',x:0,y:0,face:'down'}}}
/* the hero's name (systems.md §16): 2 to 12 letters; the word filter is the server's (step 14) */
function v6HeroName(n){n=String(n||'').trim();return/^[A-Za-zÆØÅæøåÄÖÜäöüé' -]{2,12}$/.test(n)?n:null}
/* a kobold as saved: only its own fields, as plain data */
function v6PackKobold(m){const o={};for(const k of KOBOLD_KEYS)if(m[k]!==undefined)o[k]=JSON.parse(JSON.stringify(m[k]));return o}
function v6SaveOf(s){const o=JSON.parse(JSON.stringify(Object.assign({},s,{party:[],roster:[]})));o.party=(s.party||[]).map(v6PackKobold);o.roster=(s.roster||[]).map(v6PackKobold);o.v=SAVE6_VERSION;o.epoch=SAVE6_EPOCH;return o}
/* upgrade and check a v6 save as it loads: missing fields take their defaults (so adding a field never needs a migration),
   wrong shapes are refused (null) */
const MIGRATIONS6={};
function v6Load(o){if(!o||typeof o!=='object')return null;o=JSON.parse(JSON.stringify(o));o.v=o.v||1;
  while(o.v<SAVE6_VERSION){const f=MIGRATIONS6[o.v];if(!f)return null;f(o);o.v++}if(o.v!==SAVE6_VERSION||(o.epoch||0)<SAVE6_EPOCH)return null;
  const d=v6NewSave({name:o.hero&&o.hero.name});for(const k of Object.keys(d))if(o[k]===undefined||(d[k]!==null&&(typeof o[k]!==typeof d[k]||Array.isArray(o[k])!==Array.isArray(d[k]))))o[k]=d[k];
  if(!v6HeroName(o.hero.name))o.hero.name='Pip';
  o.party=o.party.filter(m=>m&&m.v6&&m.cls&&m.lvl>=1&&m.lvl<=30);o.roster=o.roster.filter(m=>m&&m.v6&&m.cls);return o}
/* this browser's copy of a character: one key per account and slot (ui/chars6.js keeps them, beside the server's) */
const key6=(acct,slot)=>'kq6:'+(acct||'guest')+':'+slot;
export {KOBOLD_KEYS,MIGRATIONS6,SAVE6_EPOCH,SAVE6_VERSION,SLOTS6,key6,v6HeroName,v6Load,v6NewSave,v6PackKobold,v6SaveOf};
